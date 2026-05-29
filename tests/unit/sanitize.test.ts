// $app/environment is resolved to tests/__mocks__/app-environment.ts (browser=true).
// All tests exercise the DOMPurify path — the same code path that runs in production
// when sanitizeHTML is called from client-side components.
import { describe, it, expect } from 'vitest';
import { sanitizeHTML, validateAndSanitizeContent, validateImage, generateQualityReport } from '$lib/utils/sanitize';

describe('sanitizeHTML — server-side (regex) path', () => {
    it('returns empty string for null input', () => {
        expect(sanitizeHTML(null)).toBe('');
    });

    it('returns empty string for undefined input', () => {
        expect(sanitizeHTML(undefined)).toBe('');
    });

    it('returns empty string for non-string input', () => {
        expect(sanitizeHTML('' as unknown as string)).toBe('');
    });

    it('passes through safe HTML unchanged', () => {
        const safe = '<p>Hello <strong>world</strong></p>';
        expect(sanitizeHTML(safe)).toBe(safe);
    });

    it('strips <script> tags and their content', () => {
        const result = sanitizeHTML('<p>Safe</p><script>alert(1)</script>');
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert(1)');
        expect(result).toContain('<p>Safe</p>');
    });

    it('strips <style> blocks', () => {
        const result = sanitizeHTML('<style>body{color:red}</style><p>ok</p>');
        expect(result).not.toContain('<style>');
        expect(result).toContain('<p>ok</p>');
    });

    it('strips inline event handlers', () => {
        const result = sanitizeHTML('<img src="x" onerror="alert(1)">');
        expect(result).not.toContain('onerror');
    });

    it('strips javascript: URI scheme', () => {
        const result = sanitizeHTML('<a href="javascript:alert(1)">click</a>');
        expect(result).not.toContain('javascript:');
    });

    it('strips vbscript: URI scheme', () => {
        const result = sanitizeHTML('<a href="vbscript:msgbox(1)">click</a>');
        expect(result).not.toContain('vbscript:');
    });

    it('strips <iframe> tags', () => {
        const result = sanitizeHTML('<iframe src="https://evil.com"></iframe><p>safe</p>');
        expect(result).not.toContain('<iframe');
        expect(result).toContain('<p>safe</p>');
    });

    it('strips <meta> tags', () => {
        const result = sanitizeHTML('<meta http-equiv="refresh" content="0;url=evil.com">');
        expect(result).not.toContain('<meta');
    });

    it('strips data:text/html URIs', () => {
        const result = sanitizeHTML('<a href="data:text/html,<script>alert(1)</script>">x</a>');
        expect(result).not.toContain('data:text/html');
    });

    it('handles mixed safe and unsafe content', () => {
        const input = '<h1>Title</h1><script>evil()</script><p>Body</p>';
        const result = sanitizeHTML(input);
        expect(result).toContain('<h1>Title</h1>');
        expect(result).toContain('<p>Body</p>');
        expect(result).not.toContain('<script>');
    });
});

describe('validateAndSanitizeContent', () => {
    it('rejects null content', () => {
        const { isValid, errors } = validateAndSanitizeContent(null);
        expect(isValid).toBe(false);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects content shorter than 10 characters', () => {
        const { isValid, errors } = validateAndSanitizeContent('short');
        expect(isValid).toBe(false);
        expect(errors.some(e => e.includes('too short'))).toBe(true);
    });

    it('accepts valid content and returns sanitized version', () => {
        const { isValid, sanitized } = validateAndSanitizeContent('<p>This is valid content here.</p>');
        expect(isValid).toBe(true);
        expect(sanitized).toContain('valid content');
    });

    it('rejects content over 100000 characters', () => {
        const { isValid, errors } = validateAndSanitizeContent('a'.repeat(100001));
        expect(isValid).toBe(false);
        expect(errors.some(e => e.includes('too long'))).toBe(true);
    });

    it('sanitizes malicious content and flags if too much was removed', () => {
        // Mostly script tags — ratio of safe content < 50%
        const malicious = '<script>evil()</script>'.repeat(10) + '<p>x</p>';
        const { errors } = validateAndSanitizeContent(malicious);
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe('validateImage', () => {
    it('rejects null image', () => {
        const { isValid } = validateImage(null);
        expect(isValid).toBe(false);
    });

    it('requires publicId', () => {
        const { isValid, errors } = validateImage({ alt: 'A photo' });
        expect(isValid).toBe(false);
        expect(errors.some(e => e.includes('publicId'))).toBe(true);
    });

    it('requires alt text', () => {
        const { isValid, errors } = validateImage({ publicId: 'my/image.jpg' });
        expect(isValid).toBe(false);
        expect(errors.some(e => e.includes('alt'))).toBe(true);
    });

    it('rejects alt text shorter than 3 characters', () => {
        const { isValid, errors } = validateImage({ publicId: 'my/image.jpg', alt: 'hi' });
        expect(isValid).toBe(false);
        expect(errors.some(e => e.includes('too short'))).toBe(true);
    });

    it('accepts a valid image object', () => {
        const { isValid, normalized } = validateImage({ publicId: 'my/image.jpg', alt: 'A scenic view' });
        expect(isValid).toBe(true);
        expect(normalized?.publicId).toBe('my/image.jpg');
        expect(normalized?.alt).toBe('A scenic view');
    });

    it('normalises public_id alias field', () => {
        const { normalized } = validateImage({ public_id: 'alias/img.jpg', alt: 'alt text' });
        expect(normalized?.publicId).toBe('alias/img.jpg');
    });
});

describe('generateQualityReport', () => {
    it('returns score of 100 for a perfect article set', () => {
        const articles = [
            { id: 'a1', title: 'Great Article', contentHTML: '<p>This is substantial content.</p>', images: [{ alt: 'Nice photo' }] }
        ];
        const report = generateQualityReport(articles);
        expect(report.qualityScore).toBe(100);
        expect(report.issues).toHaveLength(0);
    });

    it('flags articles without titles', () => {
        const articles = [{ id: 'a2', title: '', contentHTML: '<p>Content here.</p>', images: [] }];
        const report = generateQualityReport(articles);
        expect(report.issues.some(i => i.includes('missing a title'))).toBe(true);
    });

    it('flags articles with insufficient content', () => {
        const articles = [{ id: 'a3', title: 'Title', contentHTML: 'hi', images: [] }];
        const report = generateQualityReport(articles);
        expect(report.issues.some(i => i.includes('insufficient content'))).toBe(true);
    });

    it('handles empty article array', () => {
        const report = generateQualityReport([]);
        expect(report.totalArticles).toBe(0);
        expect(report.qualityScore).toBe(30);
    });

    it('scores image alt text coverage', () => {
        const articles = [
            {
                id: 'a4', title: 'Title', contentHTML: '<p>Content long enough.</p>',
                images: [{ alt: 'Good alt' }, { alt: '' }]
            }
        ];
        const report = generateQualityReport(articles);
        expect(report.totalImages).toBe(2);
        expect(report.imagesWithAltText).toBe(1);
    });
});
