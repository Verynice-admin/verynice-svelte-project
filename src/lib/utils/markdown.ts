/**
 * Markdown Processing Utility
 * Converts Markdown to HTML and sanitizes it for safe rendering
 */

import { marked } from 'marked';
import { sanitizeHTML } from './sanitize';

/**
 * Configuration for marked parser
 * The CSS already handles all styling via .prose class, so we just need clean HTML output
 */
const markedOptions = {
  breaks: true, // Convert line breaks to <br>
  gfm: true, // GitHub Flavored Markdown
  headerIds: true, // Add IDs to headers for navigation
  mangle: false, // Don't mangle email addresses
  pedantic: false, // Don't use original markdown.pl behavior
  sanitize: false, // We'll sanitize ourselves with DOMPurify
  silent: false, // Throw on errors
  smartLists: true, // Use smarter list behavior
  smartypants: false, // Don't use smart typographic punctuation
  xhtml: false // Don't use XHTML-style self-closing tags
};

/**
 * Detects if content is Markdown or HTML
 * Simple heuristic: if content contains HTML tags, it's likely HTML
 * Otherwise, if it contains Markdown syntax, it's Markdown
 * @param content - Content to check
 * @returns 'markdown' | 'html' | 'plain'
 */
export function detectContentFormat(content: string | null | undefined): 'markdown' | 'html' | 'plain' {
  if (!content || typeof content !== 'string') {
    return 'plain';
  }

  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return 'plain';
  }

  // Check for HTML tags (more reliable indicator)
  const htmlTagPattern = /<[a-z][\s\S]*>/i;
  if (htmlTagPattern.test(trimmed)) {
    return 'html';
  }

  // Check for Markdown syntax patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m, // Headers
    /^\*\s+/m, // Unordered lists
    /^\d+\.\s+/m, // Ordered lists
    /\[.*?\]\(.*?\)/, // Links
    /!\[.*?\]\(.*?\)/, // Images
    /^\s*>/m, // Blockquotes
    /`[^`]+`/, // Inline code
    /```[\s\S]*?```/, // Code blocks
    /^\s*[-*+]\s+/m, // List items
    /\*\*.*?\*\*/, // Bold
    /\*.*?\*/, // Italic
    /__.*?__/, // Bold (alternative)
    /_.*?_/, // Italic (alternative)
  ];

  const hasMarkdownSyntax = markdownPatterns.some(pattern => pattern.test(trimmed));
  
  if (hasMarkdownSyntax) {
    return 'markdown';
  }

  // Default to plain text (will be treated as HTML for backward compatibility)
  return 'html';
}

/**
 * Converts Markdown to HTML and sanitizes it
 * @param markdown - Markdown string to convert
 * @returns Sanitized HTML string
 */
export function markdownToHTML(markdown: string | null | undefined): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  const trimmed = markdown.trim();
  if (trimmed.length === 0) {
    return '';
  }

  try {
    // Convert Markdown to HTML
    // marked.parse can return a Promise in some versions, handle both cases
    const htmlResult = marked.parse(trimmed, markedOptions);
    let html = typeof htmlResult === 'string' ? htmlResult : String(htmlResult);
    
    // Post-process HTML to ensure proper structure for styling
    // The .prose class CSS will handle all styling automatically
    // But we ensure proper HTML structure
    
    // Ensure paragraphs are properly wrapped (marked should do this, but double-check)
    html = html.trim();
    
    // Sanitize the HTML output (preserves structure, removes dangerous content)
    const sanitized = sanitizeHTML(html);
    
    return sanitized;
  } catch (error) {
    console.error('[Markdown] Error converting Markdown to HTML:', error);
    // Fallback: return sanitized plain text wrapped in paragraph
    return sanitizeHTML(`<p>${trimmed.replace(/\n/g, '<br>')}</p>`);
  }
}

/**
 * Processes content that can be either Markdown or HTML
 * Prefers Markdown over HTML when both are available (best practice)
 * Automatically detects format and converts appropriately
 * @param content - Content in Markdown or HTML format
 * @param format - Optional format hint ('markdown' | 'html' | 'auto')
 * @param fallbackContent - Optional fallback content (e.g., contentHTML when contentMarkdown is primary)
 * @returns Sanitized HTML string ready for rendering
 */
export function processContent(
  content: string | null | undefined,
  format: 'markdown' | 'html' | 'auto' = 'auto',
  fallbackContent?: string | null | undefined
): string {
  // Prefer Markdown content if both are provided (best practice)
  const primaryContent = content || fallbackContent;
  const isMarkdown = content && format !== 'html';
  
  if (!primaryContent || typeof primaryContent !== 'string') {
    return '';
  }

  const trimmed = primaryContent.trim();
  if (trimmed.length === 0) {
    return '';
  }

  // Determine format
  let detectedFormat: 'markdown' | 'html' | 'plain';
  if (format === 'auto') {
    detectedFormat = detectContentFormat(trimmed);
  } else {
    detectedFormat = format;
  }

  // Process based on format
  if (detectedFormat === 'markdown' || isMarkdown) {
    return markdownToHTML(trimmed);
  } else {
    // HTML or plain text - sanitize and return
    return sanitizeHTML(trimmed);
  }
}

/**
 * Validates Markdown content
 * @param markdown - Markdown string to validate
 * @returns Validation result
 */
export function validateMarkdown(markdown: string | null | undefined): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!markdown || typeof markdown !== 'string') {
    errors.push('Markdown content is empty or invalid');
    return { isValid: false, errors };
  }

  const trimmed = markdown.trim();
  
  if (trimmed.length < 10) {
    errors.push('Markdown content is too short (minimum 10 characters)');
  }

  if (trimmed.length > 100000) {
    errors.push('Markdown content is too long (maximum 100,000 characters)');
  }

  // Try to parse to check for syntax errors
  try {
    const result = marked.parse(trimmed, markedOptions);
    // Ensure we handle both sync and async results
    if (result instanceof Promise) {
      // In async case, we can't validate synchronously, so skip
    }
  } catch (error) {
    errors.push(`Markdown syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

