import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { translateSegments } from '$lib/server/aiService';
import { enforceRateLimit } from '$lib/server/rateLimit';
import { logger } from '$lib/server/logger';

type SegmentPayload = { id: string; text: string };

const MAX_SEGMENTS = 250;

// Closed allowlist of supported display-language names.
// Prevents prompt injection via targetLanguage string concatenation into the LLM system prompt.
// To support additional languages, add the display name used by the translation prompt here.
const ALLOWED_LANGUAGES = new Set([
	'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani',
	'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese',
	'Catalan', 'Cebuano', 'Chichewa', 'Chinese', 'Chinese Simplified',
	'Chinese Traditional', 'Corsican', 'Croatian', 'Czech',
	'Danish', 'Dutch',
	'English', 'Esperanto', 'Estonian',
	'Filipino', 'Finnish', 'French', 'Frisian',
	'Galician', 'Georgian', 'German', 'Greek', 'Gujarati',
	'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew', 'Hindi', 'Hmong', 'Hungarian',
	'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian',
	'Japanese', 'Javanese',
	'Kannada', 'Kazakh', 'Khmer', 'Kinyarwanda', 'Korean', 'Kurdish', 'Kyrgyz',
	'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish',
	'Macedonian', 'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi',
	'Mongolian', 'Nepali', 'Norwegian',
	'Odia', 'Pashto', 'Persian', 'Polish', 'Portuguese', 'Punjabi',
	'Romanian', 'Russian',
	'Samoan', 'Scots Gaelic', 'Serbian', 'Sesotho', 'Shona', 'Sindhi', 'Sinhala',
	'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese', 'Swahili', 'Swedish',
	'Tajik', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Turkish', 'Turkmen',
	'Ukrainian', 'Urdu', 'Uyghur', 'Uzbek',
	'Vietnamese',
	'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu',
]);

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

		// Reject any targetLanguage not in the closed allowlist to prevent prompt injection.
		// The value is string-concatenated directly into the LLM system prompt in aiService.ts.
		if (!ALLOWED_LANGUAGES.has(targetLanguage)) {
			return json({ error: 'Unsupported target language' }, { status: 400 });
		}

		const translations = await translateSegments(targetLanguage, segments);

		if (!translations) {
			return json({ error: 'Translation service unavailable' }, { status: 503 });
		}

		return json({ translations });
	} catch (error) {
		logger.error('[translate] Failed to process request', { err: String(error) });
		return json({ error: 'Failed to translate content' }, { status: 500 });
	}
};

