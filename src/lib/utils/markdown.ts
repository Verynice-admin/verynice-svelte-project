/**
 * Markdown Processing Utility
 * Converts Markdown to HTML and sanitizes it for safe rendering
 */

import { marked } from 'marked';
import { sanitizeHTML } from './sanitize';
import { getCloudinaryUrl } from './cloudinary';

// Custom renderer: convert markdown lists to normal paragraphs (no bullet points)
const humanRenderer = new marked.Renderer();
// marked v17 passes a token object; render each item's inline tokens as a <p>
humanRenderer.list = function(token: any) {
  let html = '';
  for (const item of token.items) {
    html += `<p>${this.parser.parse(item.tokens)}</p>\n`;
  }
  return html;
};

/**
 * Configuration for marked parser
 * The CSS already handles all styling via .prose class, so we just need clean HTML output
 */
const markedOptions = {
  breaks: true,
  gfm: true,
  pedantic: false,
  silent: false,
  renderer: humanRenderer
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
 * Cloudinary image renderer extension for marked
 * Supports syntax: ![Alt text](cloudinary:public_id) or ![Alt](publicId:some_id)
 */
function cloudinaryImageExtension() {
  return {
    name: 'cloudinaryImage',
    level: 'inline',
    start(src: string) {
      return src.indexOf('cloudinary:');
    },
    tokenizer(src: string) {
      const rule = /^\.\[([^\]]*)\]\(cloudinary:([^\)]+)\)/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'cloudinaryImage',
          raw: match[0],
          alt: match[1],
          publicId: match[2]
        };
      }
      return undefined;
    },
    renderer(token: any) {
      const url = getCloudinaryUrl(token.publicId, {
        width: 1200,
        height: 800,
        crop: 'fill',
        quality: 'auto:good',
        fetch_format: 'auto'
      });
      return `<figure class="content-image">
        <img src="${url}" alt="${token.alt}" loading="lazy" />
        ${token.alt ? `<figcaption>${token.alt}</figcaption>` : ''}
      </figure>`;
    }
  };
}

/**
 * Post-process HTML to replace image src with Cloudinary URLs
 * Handles patterns like:
 * - ![alt](publicId:some_path_or_id)
 * - data-public-id="some_public_id"
 */
function processEmbeddedImages(html: string): string {
  if (!html || typeof html !== 'string') return html;
  
  // Pattern 1: Replace ![alt](publicId:xxx) with proper img tags
  const cloudinaryPattern = /!\[([^\]]*)\]\(publicId:([^)]+)\)/g;
  html = html.replace(cloudinaryPattern, (match, alt, publicId) => {
    const url = getCloudinaryUrl(publicId.trim(), {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    });
    return `<figure class="content-image">
      <img src="${url}" alt="${alt || ''}" loading="lazy" />
      ${alt ? `<figcaption>${alt}</figcaption>` : ''}
    </figure>`;
  });

  // Pattern 2: Handle data-public-id attributes
  const dataIdPattern = /<img([^>]*?)data-public-id="([^"]+)"([^>]*?)>/g;
  html = html.replace(dataIdPattern, (match, before, publicId, after) => {
    const url = getCloudinaryUrl(publicId.trim(), {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    });
    // Build full img tag with proper src
    const existingSrcMatch = match.match(/src="[^"]*"/);
    const existingAltMatch = match.match(/alt="([^"]*)"/);
    const existingClassMatch = match.match(/class="([^"]*)"/);

    const classAttr = existingClassMatch ? `class="${existingClassMatch[1]}"` : 'class="content-image"';
    const altAttr = existingAltMatch ? existingAltMatch[0] : 'alt=""';
    const otherAttrs = before + after;

    return `<img ${altAttr} src="${url}" ${classAttr} loading="lazy" ${otherAttrs}>`;
  });

  return html;
}

/**
 * Converts Markdown to HTML and sanitizes it
 * Now includes Cloudinary image processing
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
    // getCloudinaryUrl is already imported at module level
    
    // Check for embedded image public IDs and convert them
    // Pattern: publicId:some_path_or_id in image URLs
    let processedMarkdown = trimmed;
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    processedMarkdown = processedMarkdown.replace(imagePattern, (match, alt, src) => {
      // If it looks like a public ID (contains slashes or starts with content/)
      if (src && !src.startsWith('http') && !src.startsWith('/') && 
          (src.includes('/') || src.startsWith('content/') || src.includes('pages/'))) {
        const url = getCloudinaryUrl(src.trim(), {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto'
        });
        return `![${alt}](${url})`;
      }
      // Otherwise return unchanged
      return match;
    });

    // Configure marked with extensions
    const markedWithExtensions = { ...marked };
    
    // Convert Markdown to HTML
    const htmlResult = markedWithExtensions.parse(processedMarkdown, markedOptions);
    let html = typeof htmlResult === 'string' ? htmlResult : String(htmlResult);
    
    // Post-process HTML to ensure proper structure for styling
    // The .prose class CSS will handle all styling automatically
    // But we ensure proper HTML structure
    
    // Ensure paragraphs are properly wrapped (marked should do this, but double-check)
    html = html.trim();
    
    // Process any embedded Cloudinary images that might have been missed
    html = processEmbeddedImages(html);
    
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

