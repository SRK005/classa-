import { useState, useCallback, useRef } from 'react';

// Types
export interface ChatMessage {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  threadId: string | null;
}

export interface StreamChunk {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  threadId?: string;
  success?: boolean;
  error?: string;
}

// Custom hook for OpenAI Assistant chat
export function useOpenAIChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 1,
        content: "Hello! I'm SenseAI, your academic doubt-solving companion. Ask me any question and I'll provide step-by-step explanations to transform your doubts into crystal-clear understanding.",
        isUser: false,
        timestamp: new Date()
      }
    ],
    isLoading: false,
    error: null,
    threadId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to send a message to the assistant
  const sendMessage = useCallback(async (message: string, enableStreaming: boolean = true) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now(),
      content: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const requestBody = {
        message: message.trim(),
        threadId: chatState.threadId,
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (enableStreaming) {
        headers['Accept'] = 'text/plain';
      }

      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (enableStreaming && response.headers.get('content-type')?.includes('text/plain')) {
        // Handle streaming response
        await handleStreamingResponse(response);
      } else {
        // Handle regular JSON response
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to get response from assistant');
        }

        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          threadId: data.threadId,
        }));
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled
        return;
      }

      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [chatState.threadId]);

  // Function to handle streaming response
  const handleStreamingResponse = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response stream available');
    }

    // Create initial assistant message for streaming
    const initialAssistantMessage: ChatMessage = {
      id: Date.now() + 1,
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, initialAssistantMessage],
    }));

    let accumulatedContent = '';
    let currentThreadId = chatState.threadId;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data: StreamChunk = JSON.parse(line);
            
            if (data.type === 'chunk' && data.content) {
              accumulatedContent += data.content;
              
              // Update the streaming message
              setChatState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === initialAssistantMessage.id 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ),
              }));
              
            } else if (data.type === 'complete') {
              // Streaming complete
              setChatState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === initialAssistantMessage.id 
                    ? { ...msg, isStreaming: false }
                    : msg
                ),
                isLoading: false,
                threadId: data.threadId || currentThreadId,
              }));
              break;
              
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Streaming error occurred');
            }
            
            if (data.threadId) {
              currentThreadId = data.threadId;
            }
            
          } catch (parseError) {
            console.warn('Failed to parse stream chunk:', line, parseError);
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      
      // Remove the streaming message and add error
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== initialAssistantMessage.id),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Streaming failed',
      }));
    } finally {
      reader.releaseLock();
    }
  }, [chatState.threadId]);

  // Function to cancel current request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setChatState(prev => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  // Function to clear chat history
  const clearChat = useCallback(() => {
    setChatState({
      messages: [
        {
          id: 1,
          content: "Hello! I'm SenseAI, your academic doubt-solving companion. Ask me any question and I'll provide step-by-step explanations to transform your doubts into crystal-clear understanding.",
          isUser: false,
          timestamp: new Date()
        }
      ],
      isLoading: false,
      error: null,
      threadId: null,
    });
  }, []);

  // Function to retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...chatState.messages].reverse().find(msg => msg.isUser);
    if (lastUserMessage && !chatState.isLoading) {
      // Remove any assistant messages after the last user message
      const userMessageIndex = chatState.messages.findIndex(msg => msg.id === lastUserMessage.id);
      const messagesUntilUser = chatState.messages.slice(0, userMessageIndex + 1);
      
      setChatState(prev => ({
        ...prev,
        messages: messagesUntilUser,
        error: null,
      }));
      
      sendMessage(lastUserMessage.content);
    }
  }, [chatState.messages, chatState.isLoading, sendMessage]);

  return {
    ...chatState,
    sendMessage,
    cancelRequest,
    clearChat,
    retryLastMessage,
  };
} 