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

  // In server-side rendering, use basic sanitization (DOMPurify needs DOM)
  if (!browser) {
    // Basic server-side sanitization - remove dangerous tags and attributes
    let sanitized = html
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers (onclick, onerror, etc.)
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove data: URLs that could be dangerous
      .replace(/data:text\/html/gi, '')
      // Remove iframe tags (can be used for XSS)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove object and embed tags
      .replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

    return sanitized;
  }

  // Configure DOMPurify with safe defaults
  // Preserve classes and IDs for styling compatibility
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
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true, // Preserve classes for styling (but sanitize dangerous ones)
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    ...options
  };

  try {
    const sanitized = DOMPurify.sanitize(html, defaultOptions);
    // DOMPurify can return TrustedHTML in some contexts, convert to string
    return typeof sanitized === 'string' ? sanitized : String(sanitized);
  } catch (error) {
    console.error('[Sanitize] Error sanitizing HTML:', error);
    return ''; // Return empty string on error for safety
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
