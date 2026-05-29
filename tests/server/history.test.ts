import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/rateLimit', () => ({
    enforceRateLimit: vi.fn().mockResolvedValue({ allowed: true })
}));
vi.mock('$lib/server/aiService', () => ({
    generateAnswer: vi.fn().mockResolvedValue({
        answer: 'Kazakhstan declared independence on December 16, 1991.',
        correctedQuestion: 'When did Kazakhstan become independent?',
        relatedLinks: [{ title: 'History', url: '/history' }]
    })
}));

import { POST } from '../../src/routes/api/history/ask-question/+server';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { generateAnswer } from '$lib/server/aiService';

function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/history/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}

async function callPost(body: unknown): Promise<Response> {
    return POST({ request: makeRequest(body) } as any);
}

describe('POST /api/history/ask-question', () => {
    beforeEach(() => {
        vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: true });
        vi.mocked(generateAnswer).mockResolvedValue({
            answer: 'A great answer.',
            correctedQuestion: 'Good question?',
            relatedLinks: [{ title: 'History', url: '/history' }]
        });
    });

    it('returns 200 with an answer for a valid question', async () => {
        const res = await callPost({ question: 'When did Kazakhstan become independent?' });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.aiAnswer).toBeDefined();
    });

    it('returns 400 when question is missing', async () => {
        const res = await callPost({});
        expect(res.status).toBe(400);
    });

    it('returns 400 when question is empty string', async () => {
        const res = await callPost({ question: '   ' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when question exceeds 500 characters', async () => {
        const res = await callPost({ question: 'q'.repeat(501) });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/500 characters/i);
    });

    it('returns 400 when question is not a string', async () => {
        const res = await callPost({ question: 42 });
        expect(res.status).toBe(400);
    });

    it('returns 503 when AI service returns null', async () => {
        vi.mocked(generateAnswer).mockResolvedValue(null as any);
        const res = await callPost({ question: 'Valid question here?' });
        expect(res.status).toBe(503);
    });

    it('strips external URLs from relatedLinks', async () => {
        vi.mocked(generateAnswer).mockResolvedValue({
            answer: 'An answer.',
            correctedQuestion: 'Question?',
            relatedLinks: [
                { title: 'Safe', url: '/history' },
                { title: 'External', url: 'https://evil.com' },
                { title: 'Protocol-relative', url: '//evil.com' },
                { title: 'JS', url: 'javascript:alert(1)' }
            ]
        });
        const res = await callPost({ question: 'Tell me about Kazakhstan history?' });
        expect(res.status).toBe(200);
        const data = await res.json();
        // Only the root-relative /history link should survive
        expect(data.relatedLinks).toHaveLength(1);
        expect(data.relatedLinks[0].url).toBe('/history');
    });

    it('returns 429 when rate-limited', async () => {
        vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: false, retryAfterSeconds: 10 });
        const res = await callPost({ question: 'A valid question here?' });
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('10');
    });
});
