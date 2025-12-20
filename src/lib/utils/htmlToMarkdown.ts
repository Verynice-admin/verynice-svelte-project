/**
 * HTML to Markdown Conversion Utility
 * Converts HTML content to Markdown format for better storage efficiency
 */

import TurndownService from 'turndown';

/**
 * Configured Turndown service for HTML to Markdown conversion
 */
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  bulletListMarker: '-', // Use - for unordered lists
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**', // Use ** for strong
  linkStyle: 'inlined', // Use [text](url) format
  linkReferenceStyle: 'full', // Use full reference style
  preformattedCode: false, // Don't preserve preformatted code blocks
});

// Add custom rules for better conversion
turndownService.addRule('preserveImages', {
  filter: 'img',
  replacement: function (_content: string, node: HTMLElement) {
    const img = node as HTMLImageElement;
    const alt = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || '';
    const title = img.getAttribute('title');
    return `![${alt}](${src}${title ? ` "${title}"` : ''})`;
  }
});

turndownService.addRule('preserveLineBreaks', {
  filter: 'br',
  replacement: function () {
    return '\n';
  }
});

/**
 * Converts HTML to Markdown
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const trimmed = html.trim();
  if (trimmed.length === 0) {
    return '';
  }

  try {
    // Convert HTML to Markdown
    const markdown = turndownService.turndown(trimmed);
    
    // Clean up common issues
    return markdown
      // Remove excessive blank lines (more than 2 consecutive)
      .replace(/\n{3,}/g, '\n\n')
      // Clean up trailing whitespace
      .replace(/[ \t]+$/gm, '')
      // Ensure proper spacing around headings
      .replace(/\n(#{1,6}\s+)/g, '\n\n$1')
      .replace(/(#{1,6}\s+[^\n]+)\n([^\n#])/g, '$1\n\n$2')
      // Trim final result
      .trim();
  } catch (error) {
    console.error('[HTML to Markdown] Conversion error:', error);
    // Fallback: return empty string or basic text extraction
    return '';
  }
}

/**
 * Validates that HTML was successfully converted to Markdown
 * @param originalHTML - Original HTML string
 * @param markdown - Converted Markdown string
 * @returns Validation result
 */
export function validateConversion(originalHTML: string, markdown: string): {
  isValid: boolean;
  warnings: string[];
  similarity: number; // 0-1, how much content was preserved
} {
  const warnings: string[] = [];
  
  // Extract text content from HTML (rough estimate)
  const htmlText = originalHTML
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const markdownText = markdown
    .replace(/[#*`\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Calculate similarity (simple word count comparison)
  const htmlWords = htmlText.split(/\s+/).filter(w => w.length > 0);
  const markdownWords = markdownText.split(/\s+/).filter(w => w.length > 0);
  
  const similarity = htmlWords.length > 0 
    ? Math.min(markdownWords.length / htmlWords.length, 1)
    : 0;
  
  if (similarity < 0.7) {
    warnings.push(`Low content preservation (${Math.round(similarity * 100)}%). Some content may be lost.`);
  }
  
  if (markdown.length === 0 && originalHTML.length > 0) {
    warnings.push('Conversion resulted in empty Markdown');
  }
  
  return {
    isValid: warnings.length === 0 && similarity > 0.5,
    warnings,
    similarity
  };
}

