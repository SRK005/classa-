'use client';

import { useMemo, useEffect, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MessageRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

// Simple HTML sanitizer as fallback
function basicSanitize(html: string): string {
  // Remove script tags and event handlers while preserving other HTML
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  
  // Remove potentially dangerous attributes but keep safe HTML structure
  sanitized = sanitized.replace(/(<[^>]+)\s+(onclick|onload|onerror|onmouseover|onfocus|onblur|onchange|onsubmit)=[^>\s]*/gi, '$1');
  
  return sanitized;
}

export default function MessageRenderer({ content, isStreaming, className }: MessageRendererProps) {
  const [DOMPurify, setDOMPurify] = useState<any>(null);

  useEffect(() => {
    // Load DOMPurify only on client side
    if (typeof window !== 'undefined') {
      import('dompurify').then((module) => {
        setDOMPurify(module.default || module);
      }).catch((error) => {
        console.warn('Failed to load DOMPurify:', error);
      });
    }
  }, []);

  const processedHTML = useMemo(() => {
    if (!content) return '';

    // Process the content for LaTeX and HTML rendering
    let processedContent = processMessageContent(content);

    // Remove background/shadow/ring classes and inline background styles from model HTML
    processedContent = stripBackgroundAndShadow(processedContent);
    
    // Temporary debug log
    if (content.includes('<!DOCTYPE') || content.includes('<html>')) {
      console.log('Processing HTML document:', {
        originalLength: content.length,
        processedLength: processedContent.length,
        originalStart: content.substring(0, 100),
        processedStart: processedContent.substring(0, 100)
      });
    }
    
    // Sanitize the HTML to prevent XSS attacks
    let sanitizedHTML = processedContent;
    
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      try {
        sanitizedHTML = DOMPurify.sanitize(processedContent, {
          ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'div', 'span', 'br', 'hr',
            'strong', 'b', 'em', 'i', 'u', 's',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'a', 'img',
            'sup', 'sub',
            'math', 'mrow', 'mi', 'mo', 'mn', 'mfrac', 'msup', 'msub', 'mroot', 'msqrt'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'id',
            'style', 'target', 'rel',
            'colspan', 'rowspan',
            'data-*'
          ],
          ALLOW_DATA_ATTR: true,
          ADD_ATTR: ['target']
        });
      } catch (error) {
        console.warn('DOMPurify sanitization failed, using basic sanitization:', error);
        sanitizedHTML = basicSanitize(processedContent);
      }
    } else {
      // Use basic sanitization as fallback - but still process HTML
      sanitizedHTML = basicSanitize(processedContent);
    }

    return sanitizedHTML;
  }, [content, DOMPurify]);



  return (
    <div 
      className={`message-content text-sm leading-relaxed bg-transparent ${className ? className : ''}`}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        
      }}
    >
      {processedHTML ? (
        <div 
          dangerouslySetInnerHTML={{ __html: processedHTML }}
        />
      ) : (
        <div>{content}</div>
      )}
      {isStreaming && (
        <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse"></span>
      )}
      {/* Fallback CSS: enforce transparent backgrounds and white text; preserve code block styling */}
      <style jsx>{`
        .message-content { color: #ffffff; }
        .message-content :global(.bg-white),
        .message-content :global(.bg-white\/95),
        .message-content :global(.bg-white\/90),
        .message-content :global(.bg-gray-50),
        .message-content :global(.bg-slate-50),
        .message-content :global(.bg-blue-50),
        .message-content :global([class*="shadow"]),
        .message-content :global([class*="ring"]) {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        /* Keep our code block backgrounds */
        .message-content :global(pre.code-block) { background-color: #1f2937 !important; }
        .message-content :global(code.inline-code) { background-color: rgba(229,231,235,1) !important; }
      `}</style>
    </div>
  );
}

// Process message content to handle LaTeX and improve HTML structure
function processMessageContent(content: string): string {
  if (!content) return '';

  // Check if content is already HTML or if it's plain text that needs to be converted
  let processedContent = content;

  // First, clean up any leading/trailing whitespace and line breaks
  processedContent = content.replace(/^(\s|<br\s*\/?>)*|(\s|<br\s*\/?>)*$/gi, '');

  // Handle content that starts with HTML DOCTYPE or tags
  if (processedContent.includes('<!DOCTYPE html>') || processedContent.includes('<html>')) {
    // Extract content from full HTML document
    const bodyMatch = processedContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      processedContent = bodyMatch[1];
    } else {
      // If no body tag, try to extract content after head tag
      const headEndMatch = processedContent.match(/<\/head>\s*([\s\S]*?)(?:<\/html>|$)/i);
      if (headEndMatch) {
        processedContent = headEndMatch[1].replace(/<\/?body[^>]*>/gi, '');
      } else {
        // Fallback: remove DOCTYPE and html/head tags
        processedContent = processedContent
          .replace(/<!DOCTYPE[^>]*>/gi, '')
          .replace(/<\/?html[^>]*>/gi, '')
          .replace(/<head[\s\S]*?<\/head>/gi, '')
          .replace(/<\/?body[^>]*>/gi, '');
      }
    }
    // Clean up the extracted content
    processedContent = processedContent.replace(/^(\s|<br\s*\/?>)*|(\s|<br\s*\/?>)*$/gi, '');
  } else if (processedContent.trim().startsWith('<')) {
    // Regular HTML content - remove common wrapper tags
    processedContent = processedContent
      .replace(/^<html><body>|<\/body><\/html>$/g, '')
      .replace(/^<body>|<\/body>$/g, '')
      .replace(/^<html>|<\/html>$/g, '');
  } else {
    // Plain text content - convert to HTML
    processedContent = processedContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  }
  
  // Convert LaTeX delimiters to KaTeX-friendly format
  // Inline math: $...$ or \(...\)
  processedContent = processedContent.replace(/\$([^$]+)\$/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          "\\vec": "\\mathbf{#1}",
          "\\unit": "\\mathrm{#1}",
        }
      });
      return rendered;
    } catch (error) {
      console.warn('LaTeX rendering error:', error);
      return `<code class="latex-error">${latex}</code>`;
    }
  });

  // Display math: $$...$$ or \[...\]
  processedContent = processedContent.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: {
          "\\vec": "\\mathbf{#1}",
          "\\unit": "\\mathrm{#1}",
        }
      });
      return `<div class="math-display">${rendered}</div>`;
    } catch (error) {
      console.warn('LaTeX rendering error:', error);
      return `<div class="latex-error"><code>${latex}</code></div>`;
    }
  });

  // Handle \[...\] display math
  processedContent = processedContent.replace(/\\\[([^\]]+)\\\]/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true
      });
      return `<div class="math-display">${rendered}</div>`;
    } catch (error) {
      console.warn('LaTeX rendering error:', error);
      return `<div class="latex-error"><code>${latex}</code></div>`;
    }
  });

  // Handle \(...\) inline math
  processedContent = processedContent.replace(/\\\(([^)]+)\\\)/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true
      });
      return rendered;
    } catch (error) {
      console.warn('LaTeX rendering error:', error);
      return `<code class="latex-error">${latex}</code>`;
    }
  });

  // Improve code formatting
  processedContent = processedContent.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
    const lang = language ? ` data-language="${language}"` : '';
    return `<pre class="code-block bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-3"${lang}><code>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Improve inline code
  processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="inline-code bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>');

  // Add proper styling classes to elements
  // Typography enhancements for card-like rendering
  processedContent = processedContent.replace(/<h1>/g, '<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 mt-2">');
  processedContent = processedContent.replace(/<h2>/g, '<h2 class="text-xl md:text-2xl font-bold tracking-tight mb-2 mt-3">');
  processedContent = processedContent.replace(/<h3>/g, '<h3 class="text-lg md:text-xl font-semibold mb-2 mt-3">');
  processedContent = processedContent.replace(/<h4>/g, '<h4 class="text-base md:text-lg font-semibold mb-2 mt-3">');
  processedContent = processedContent.replace(/<h5>/g, '<h5 class="text-base font-semibold mb-2 mt-3">');
  processedContent = processedContent.replace(/<h6>/g, '<h6 class="text-sm font-semibold mb-2 mt-3">');
  processedContent = processedContent.replace(/<p>/g, '<p class="mb-3 leading-7">');
  processedContent = processedContent.replace(/<ul>/g, '<ul class="list-disc list-inside mb-3 space-y-1.5">');
  processedContent = processedContent.replace(/<ol>/g, '<ol class="list-decimal list-inside mb-3 space-y-1.5">');
  processedContent = processedContent.replace(/<li>/g, '<li class="mb-0.5">');
  processedContent = processedContent.replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-400/70 pl-4 italic my-3">');
  processedContent = processedContent.replace(/<strong>/g, '<strong class="font-bold">');
  processedContent = processedContent.replace(/<em>/g, '<em class="italic">');

  return processedContent;
}



// Utility function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Remove background/shadow/ring related classes and inline background styles injected by model HTML
function stripBackgroundAndShadow(html: string): string {
  if (!html) return html;

  // Remove inline background and color styles
  let out = html.replace(/\sstyle=\"([^\"]*)\"/gi, (match, styles) => {
    const filtered = styles
      .split(/;\s*/)
      .filter((decl: string) => decl && !/^background(-color)?\s*:/i.test(decl) && !/^color\s*:/i.test(decl))
      .join('; ');
    return filtered ? ` style=\"${filtered}\"` : '';
  });

  // Remove common Tailwind background/shadow/ring classes but keep code block backgrounds
  out = out.replace(/class=\"([^\"]*)\"/gi, (match: string, cls: string) => {
    const tokens: string[] = cls.split(/\s+/).filter(Boolean);
    const keep = tokens.filter((token: string) => {
      // Preserve our renderer's code-block backgrounds
      if (token === 'code-block' || token === 'inline-code') return true;
      if (token.startsWith('bg-gray-') && token !== 'bg-gray-800') return false;
      if (token.startsWith('bg-slate-')) return false;
      if (token.startsWith('bg-white')) return false;
      if (token.startsWith('bg-blue-')) return false;
      if (token.startsWith('bg-[')) return false; // arbitrary bg
      if (token === 'shadow' || token.startsWith('shadow-')) return false;
      if (token === 'ring' || token.startsWith('ring-')) return false;
      // Remove text color classes but keep text size classes
      if (/^text-(black|white)$/.test(token)) return false;
      if (/^text-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}$/.test(token)) return false;
      // Keep font size/weight tracking classes
      if (/^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(token)) return true;
      return true;
    });
    return `class=\"${keep.join(' ')}\"`;
  });

  return out;
}