/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks
 * 
 * NOTE: For new content, consider using Markdown instead of HTML.
 * See src/lib/utils/markdown.ts for Markdown processing utilities.
 */

import DOMPurify from 'dompurify';
import type { Config as DOMPurifyConfig } from 'dompurify';
import { browser } from '$app/environment';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string | null | undefined, options?: DOMPurifyConfig): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // In server-side rendering, use regex-based sanitization (DOMPurify requires a live DOM).
  // These patterns are ordered from most-dangerous to least so nothing slips through a
  // partial match of an earlier replacement.
  if (!browser) {
    let sanitized = html
      // 1. Strip <script> blocks and their entire content.
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // 2. Strip <style> blocks (can host CSS-based data exfiltration / expression() attacks).
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // 3. Strip <iframe>, <object>, <embed>, <applet>, <base> tags and their content.
      .replace(/<(iframe|object|embed|applet|base)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
      // 4. Strip self-closing dangerous tags that have no body (<base />, <meta>, <link>).
      .replace(/<(meta|link|base)\b[^>]*\/?>/gi, '')
      // 5. Strip ALL event handler attributes regardless of quoting style.
      //    Handles: onerror="x"  onerror='x'  onerror=x  onerror (bare)
      .replace(/\s+on[a-zA-Z]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>\/]*))?/gi, '')
      // 6. Strip javascript: and vbscript: URI schemes in attribute values.
      .replace(/(?:javascript|vbscript)\s*:/gi, '')
      // 7. Strip data:text/html and data:application/* URIs (HTML/JS payload delivery).
      .replace(/data\s*:\s*(?:text\/html|application\/[^;,\s"'>]*)/gi, '')
      // 8. Strip SVG <use> with external href (XSS via SVG sprite injection).
      .replace(/<use\b[^>]*\bhref\s*=\s*["']?\s*(?:https?:|\/\/)/gi, '<use');

    return sanitized;
  }

  // Enforce rel="noopener noreferrer" on every outbound link to prevent reverse tabnapping.
  // Registered once at module load; DOMPurify deduplicates hook registrations per hook name.
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Configure DOMPurify with safe defaults.
  // `data:` is intentionally excluded from ALLOWED_URI_REGEXP — data:text/javascript and
  // data:text/html can execute scripts in older browsers even via <img> or <a> attributes.
  // If you need inline data images, serve them through Cloudinary instead.
  const defaultOptions: DOMPurifyConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id',
      'target', 'rel', 'colspan', 'rowspan', 'align', 'start', 'language'
    ],
    // `data:` removed — permits only http(s), mailto, tel, sms, and protocol-relative URLs.
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    ...options
  };

  try {
    const sanitized = DOMPurify.sanitize(html, defaultOptions);
    return typeof sanitized === 'string' ? sanitized : String(sanitized);
  } catch (error) {
    console.error('[Sanitize] Error sanitizing HTML:', error);
    return '';
  }
}

/**
 * Validates and sanitizes article content
 * @param content - The content to validate
 * @returns Object with isValid flag and sanitized content
 */
export function validateAndSanitizeContent(content: string | null | undefined): {
  isValid: boolean;
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = '';

  if (!content || typeof content !== 'string') {
    errors.push('Content is empty or invalid');
    return { isValid: false, sanitized: '', errors };
  }

  const trimmed = content.trim();

  // Check minimum length (at least 10 characters)
  if (trimmed.length < 10) {
    errors.push('Content is too short (minimum 10 characters required)');
  }

  // Check maximum length (prevent extremely long content)
  if (trimmed.length > 100000) {
    errors.push('Content is too long (maximum 100,000 characters)');
  }

  // Sanitize the content
  sanitized = sanitizeHTML(trimmed);

  // Check if sanitization removed too much (might indicate malicious content)
  if (sanitized.length < trimmed.length * 0.5 && trimmed.length > 100) {
    errors.push('Content contains potentially unsafe HTML that was removed');
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Validates image data
 * @param image - Image object to validate
 * @returns Validation result
 */
export function validateImage(image: any): {
  isValid: boolean;
  errors: string[];
  normalized: {
    publicId: string;
    alt: string;
    captionName?: string;
    captionSource?: string;
  } | null;
} {
  const errors: string[] = [];

  if (!image) {
    return { isValid: false, errors: ['Image is missing'], normalized: null };
  }

  const publicId = image.publicId || image.public_id || image.url || '';
  if (!publicId || typeof publicId !== 'string' || publicId.trim().length === 0) {
    errors.push('Image publicId is required');
  }

  const alt = (image.alt || image.altText || '').trim();
  if (!alt || alt.length === 0) {
    errors.push('Image alt text is required for accessibility');
  } else if (alt.length < 3) {
    errors.push('Image alt text is too short (minimum 3 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized: {
      publicId: publicId.trim(),
      alt: alt || 'Image',
      captionName: image.captionName || image.caption || '',
      captionSource: image.captionSource || image.source || ''
    }
  };
}

/**
 * Generates a quality report for articles
 * @param articles - Array of articles
 * @returns Quality report object
 */
export function generateQualityReport(articles: any[]): {
  totalArticles: number;
  articlesWithTitle: number;
  articlesWithContent: number;
  totalImages: number;
  imagesWithAltText: number;
  qualityScore: number; // 0-100
  issues: string[];
} {
  const issues: string[] = [];
  let articlesWithTitle = 0;
  let articlesWithContent = 0;
  let totalImages = 0;
  let imagesWithAltText = 0;

  articles.forEach((article, index) => {
    if (article.title && article.title.trim().length > 0) {
      articlesWithTitle++;
    } else {
      issues.push(`Article ${index + 1} (${article.id}) is missing a title`);
    }

    const contentLength = typeof article.contentHTML === 'string'
      ? article.contentHTML.trim().length
      : 0;

    if (contentLength >= 10) {
      articlesWithContent++;
    } else {
      issues.push(`Article ${index + 1} (${article.id}) has insufficient content (${contentLength} characters)`);
    }

    if (article.images && Array.isArray(article.images)) {
      totalImages += article.images.length;
      imagesWithAltText += article.images.filter((img: any) =>
        img.alt && img.alt.trim().length >= 3
      ).length;
    }
  });

  // Calculate quality score (0-100)
  const titleScore = articles.length > 0 ? (articlesWithTitle / articles.length) * 30 : 0;
  const contentScore = articles.length > 0 ? (articlesWithContent / articles.length) * 40 : 0;
  const imageScore = totalImages > 0 ? (imagesWithAltText / totalImages) * 30 : 30; // Full score if no images
  const qualityScore = Math.round(titleScore + contentScore + imageScore);

  return {
    totalArticles: articles.length,
    articlesWithTitle,
    articlesWithContent,
    totalImages,
    imagesWithAltText,
    qualityScore,
    issues
  };
}
