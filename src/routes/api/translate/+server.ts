import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { translateSegments } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';

type SegmentPayload = { id: string; text: string };

const MAX_SEGMENTS = 125;

const sanitizeSegments = (segments: unknown): SegmentPayload[] => {
	if (!Array.isArray(segments)) return [];

	return segments
		.map((segment) => {
			if (typeof segment !== 'object' || segment === null) {
				return { id: '', text: '' };
			}

			const record = segment as Record<string, unknown>;
			const id = typeof record.id === 'string' ? record.id : '';
			const text = typeof record.text === 'string' ? record.text.trim() : '';

			return { id, text };
		})
		.filter((segment) => segment.id && segment.text);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const rate = await enforceRateLimit({
			request,
			scope: 'api-translate',
			maxRequests: 30,
			windowMs: 60_000
		});
		if (!rate.allowed) {
			return json(
				{ error: 'Too many translation requests. Please retry shortly.' },
				{ status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
			);
		}

		const body = await request.json();
		const targetLanguage = typeof body?.targetLanguage === 'string' ? body.targetLanguage.trim() : '';
		const segments = sanitizeSegments(body?.segments).slice(0, MAX_SEGMENTS);

		if (!targetLanguage || !segments.length) {
			return json({ error: 'targetLanguage and segments are required' }, { status: 400 });
		}

		const translations = await translateSegments(targetLanguage, segments);

		if (!translations) {
			return json({ error: 'Translation service unavailable' }, { status: 503 });
		}

		return json({ translations });
	} catch (error) {
		console.error('[Translate API] Failed to process request', error);
		return json({ error: 'Failed to translate content' }, { status: 500 });
	}
};

