import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/rateLimit', () => ({
    enforceRateLimit: vi.fn().mockResolvedValue({ allowed: true })
}));
vi.mock('$lib/server/aiService', () => ({
    processComment: vi.fn().mockResolvedValue({ isOffensive: false, correctedText: null })
}));
vi.mock('$lib/server/firebaseAdmin', () => {
    const mockSet = vi.fn().mockResolvedValue(undefined);
    const mockDoc = vi.fn().mockReturnValue({ set: mockSet });
    const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc });
    const mockGet = vi.fn().mockResolvedValue({ exists: true });
    const mockPageDoc = vi.fn().mockReturnValue({ get: mockGet, collection: mockCollection });
    const mockPagesCollection = vi.fn().mockReturnValue({ doc: mockPageDoc });
    return {
        adminDB: {
            collection: mockPagesCollection
        }
    };
});
vi.mock('firebase-admin/firestore', () => ({
    Timestamp: { now: () => new Date() }
}));

import { POST } from '../../src/routes/api/comments/submit/+server';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { processComment } from '$lib/server/aiService';

function makeRequest(body: unknown): Request {
    return new Request('http://localhost/api/comments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}

async function callPost(body: unknown): Promise<Response> {
    return POST({ request: makeRequest(body) } as any);
}

describe('POST /api/comments/submit', () => {
    beforeEach(() => {
        vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: true });
        vi.mocked(processComment).mockResolvedValue({ isOffensive: false, correctedText: null });
    });

    it('returns 200 for a valid comment', async () => {
        const res = await callPost({ postId: 'valid-page', text: 'Great article!', author: 'Alice' });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
    });

    it('returns 400 when postId is missing', async () => {
        const res = await callPost({ text: 'Hello', author: 'Bob' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when text is missing', async () => {
        const res = await callPost({ postId: 'some-page', author: 'Bob' });
        expect(res.status).toBe(400);
    });

    it('returns 400 for an invalid postId (path traversal attempt)', async () => {
        const res = await callPost({ postId: '../../../etc/passwd', text: 'hi', author: 'Eve' });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/invalid post id/i);
    });

    it('returns 400 for a postId with special characters', async () => {
        const res = await callPost({ postId: 'page<script>', text: 'hi', author: 'Eve' });
        expect(res.status).toBe(400);
    });

    it('returns 400 when text exceeds 1000 characters', async () => {
        const res = await callPost({ postId: 'valid-page', text: 'x'.repeat(1001), author: 'Bob' });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toMatch(/1000 characters/i);
    });

    it('returns 400 when AI flags comment as offensive', async () => {
        vi.mocked(processComment).mockResolvedValue({ isOffensive: true, correctedText: null });
        const res = await callPost({ postId: 'valid-page', text: 'Offensive content here', author: 'Troll' });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.isOffensive).toBe(true);
    });

    it('uses AI-corrected text when provided', async () => {
        vi.mocked(processComment).mockResolvedValue({ isOffensive: false, correctedText: 'Corrected comment' });
        const res = await callPost({ postId: 'valid-page', text: 'Originall comment', author: 'User' });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.comment.text).toBe('Corrected comment');
        expect(data.comment.isAiCorrected).toBe(true);
    });

    it('caps AI-corrected text at 1000 characters', async () => {
        vi.mocked(processComment).mockResolvedValue({
            isOffensive: false,
            correctedText: 'A'.repeat(2000)
        });
        const res = await callPost({ postId: 'valid-page', text: 'Short original', author: 'User' });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.comment.text.length).toBeLessThanOrEqual(1000);
    });

    it('returns 429 when rate-limited', async () => {
        vi.mocked(enforceRateLimit).mockResolvedValue({ allowed: false, retryAfterSeconds: 45 });
        const res = await callPost({ postId: 'valid-page', text: 'Good comment', author: 'User' });
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('45');
    });

    it('proceeds gracefully when AI moderation throws', async () => {
        vi.mocked(processComment).mockRejectedValue(new Error('AI timeout'));
        const res = await callPost({ postId: 'valid-page', text: 'Good comment indeed', author: 'User' });
        // Should fall back to original text, not fail
        expect(res.status).toBe(200);
    });
});
