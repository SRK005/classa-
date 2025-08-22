import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// Force Node.js runtime for this route to ensure compatibility with the OpenAI SDK
export const runtime = 'nodejs';

// OpenAI Configuration - use environment variables (server-side only)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Provide a safe getter to instantiate the client only when config is valid
function getOpenAI() {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

function getConfig() {
  if (!ASSISTANT_ID) {
    throw new Error('OpenAI Assistant ID not configured');
  }
  return { assistantId: ASSISTANT_ID } as { assistantId: string };
}

// Types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  threadId?: string;
}

interface ChatResponse {
  response: string;
  threadId: string;
  success: boolean;
  error?: string;
}

// Helper function to create a new thread
async function createThread(): Promise<string> {
  try {
    const thread = await getOpenAI().beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

// Helper function to add message to thread
async function addMessageToThread(threadId: string, message: string): Promise<void> {
  try {
    await getOpenAI().beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw new Error('Failed to add message to conversation');
  }
}

// Helper function to run assistant and get response
async function runAssistantAndGetResponse(threadId: string): Promise<string> {
  try {
    // Create and run the assistant
    const { assistantId } = getConfig();
    const run = await getOpenAI().beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll for completion with timeout
    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      if (attempts >= maxAttempts) {
        throw new Error('Assistant response timeout');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      // Retrieve run status: pass run id then params with thread_id (matches SDK runtime)
      runStatus = await (getOpenAI().beta.threads.runs.retrieve as any)(run.id, {
        thread_id: threadId,
      });
      attempts++;
    }

    if (runStatus.status === 'failed') {
      throw new Error(`Assistant run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Unexpected run status: ${runStatus.status}`);
    }

    // Get the assistant's response
    const messages = await getOpenAI().beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find(
      (msg) => msg.role === 'assistant' && msg.run_id === run.id
    );

    if (!assistantMessage || !assistantMessage.content[0]) {
      throw new Error('No response from assistant');
    }

    // Extract text content
    const content = assistantMessage.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected content type from assistant');
    }

    return content.text.value;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
}

// Streaming response helper
function createStreamingResponse(
  threadId: string,
  responsePromise: Promise<string>
): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      responsePromise
        .then((response) => {
          // Send the response in chunks to simulate streaming
          const words = response.split(' ');
          let index = 0;
          
          const sendChunk = () => {
            if (index < words.length) {
              const chunk = words[index] + ' ';
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'chunk',
                    content: chunk,
                    threadId,
                  }) + '\n'
                )
              );
              index++;
              setTimeout(sendChunk, 50); // 50ms delay between words
            } else {
              // Send completion signal
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'complete',
                    threadId,
                    success: true,
                  }) + '\n'
                )
              );
              controller.close();
            }
          };
          
          sendChunk();
        })
        .catch((error) => {
          // Send error
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                error: error.message,
                threadId,
                success: false,
              }) + '\n'
            )
          );
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', success: false },
        { status: 500 }
      );
    }

    if (!ASSISTANT_ID) {
      return NextResponse.json(
        { error: 'Assistant ID not configured', success: false },
        { status: 500 }
      );
    }

    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body', success: false },
        { status: 400 }
      );
    }

    const { message, threadId } = body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string', success: false },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: 'Message too long (max 10000 characters)', success: false },
        { status: 400 }
      );
    }

    // Get or create thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = await createThread();
    }

    // Add user message to thread
    await addMessageToThread(currentThreadId, message.trim());

    // Check if streaming is requested
    const isStreaming = request.headers.get('accept')?.includes('text/plain');
    
    if (isStreaming) {
      // Return streaming response
      const responsePromise = runAssistantAndGetResponse(currentThreadId);
      return createStreamingResponse(currentThreadId, responsePromise);
    } else {
      // Return regular JSON response
      const response = await runAssistantAndGetResponse(currentThreadId);
      
      const result: ChatResponse = {
        response,
        threadId: currentThreadId,
        success: true,
      };

      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        success: false,
        threadId: null 
      },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  try {
    // Simple health check
    const hasApiKey = !!OPENAI_API_KEY;
    const hasAssistantId = !!ASSISTANT_ID;
    
    return NextResponse.json({
      status: 'healthy',
      hasApiKey,
      hasAssistantId,
      assistantId: ASSISTANT_ID,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Health check failed' },
      { status: 500 }
    );
  }
} 