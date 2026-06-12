import { GROQ_API_KEY, GEMINI_API_KEY } from '$env/static/private';
import { env as dynamicEnv } from '$env/dynamic/private';
const OPENROUTER_API_KEY = dynamicEnv.OPENROUTER_API_KEY ?? '';
import { dev } from '$app/environment';
import { logger } from '$lib/server/logger';

const SITE_CONTENT = `
Available Website Content:
- Home Page: / (General introduction to Kazakhstan)
- History: /history (History of Kazakhstan, from ancient times to independence)
- Destinations: /destinations (Overview of Kazakhstan destinations)
- Culture: /culture (Kazakh traditions, food, music, lifestyle)
- Travel Tips: /tips (Visa info, safety, logistics, money)

Specific Destinations Covered:
- Cities: Almaty (cultural capital), Astana (modern capital), Shymkent (southern city)
- Nature & Attractions: Charyn Canyon, Kolsai Lakes, Big Almaty Lake, Burabay National Park, Kaindy Lake, Shymbulak Ski Resort
- Historical Sites: Turkistan & Khoja Ahmed Yasawi Mausoleum

For destinations not listed above, I can provide general travel information from my knowledge base.
`;

const SYSTEM_PROMPT = `You are an expert travel guide and historian specializing in Kazakhstan and Central Asia.
Your task is to help users with comprehensive travel planning, historical information, and cultural insights for their trips to Kazakhstan.

${SITE_CONTENT}

Guidelines:
1. Correct the grammar and spelling of the user's question.

2. Check if the query is about a location/attraction covered in the "Specific Destinations Covered" list above.

3. If the location IS covered on the site, provide comprehensive information and suggest the relevant link.

4. If the location is NOT covered on the site OR for any travel query, write in a NATURAL, CONVERSATIONAL STYLE like a friendly local guide sharing their knowledge. Avoid ALL technical formatting:

   INSTEAD OF: **Headers**, - bullet points, # numbers, etc.
   WRITE LIKE: "Let me tell you about Almaty. It's this amazing city..."

   Cover ALL essential travel information in flowing paragraphs:
   - Start with what makes the place special and welcoming
   - Explain how to get there with practical options and tips
   - Share when to visit and what the weather/season is like (current year is 2026)
   - Describe what you'll see and do, like you're recommending to a friend
   - Talk about where to stay, from budget options to nice hotels
   - Share food recommendations and local specialties
   - Explain how to get around the area
   - Give practical tips about visas, money, safety, health, and local customs
   - Mention costs and budgeting in conversational terms
   - Suggest how long to stay and what to do each day
   - Recommend nearby places to visit
   - Mention any special considerations or tips

5. For questions not related to Kazakhstan/Central Asia travel, politely suggest focusing on travel topics.

6. Always be friendly, culturally sensitive, and provide accurate information based on current knowledge (year 2026).

7. Make answers COMPREHENSIVE and DETAILED - write naturally and conversationally, like you're chatting with someone planning their trip. Don't be concise - share the full story they need to feel confident about visiting.

8. Write in first person or conversational tone, use contractions, and make it feel like personal recommendations.

9. Include practical, actionable advice that helps travelers feel confident about visiting.

Output JSON only in this format:
{
  "correctedQuestion": "string",
  "answer": "string",
  "relatedLinks": [
    { "title": "string", "url": "string" }
  ]
}`;

const MAP_SYSTEM_PROMPT = `You are a geographical expert for Kazakhstan.
Your task is to interpret user queries about locations in Kazakhstan and provide coordinates.
1. Return the latitude and longitude of the location mentioned or implied.
2. If the query implies a historical location (e.g., "old capital"), provide the coordinates for that specific historical context properly (e.g. Almaty for "capital before Astana").
3. If the location is not in Kazakhstan or cannot be found, return null for coordinates but provide a message.
4. Provide a short, friendly title and description for the location.

Output JSON only:
{
  "lat": number,
  "lng": number,
  "title": "string",
  "description": "string"
}`;

const COMMENT_SYSTEM_PROMPT = `You are a helpful and polite moderator assistant for a Kazakhstan travel website.
Your task is to process user comments.
1. Correct any grammatical, spelling, or punctuation errors in the text. Ensure it sounds natural and polite.
2. Filter out any profanity or offensive language by replacing the offensive words with asterisks (e.g., ****).
3. Only flag the comment as 'isOffensive' if it contains severe hate speech, threat of violence, or explicit illegal content. Do NOT flag gibberish, random letters, spam, or mild profanity.

Output JSON only:
{
  "correctedText": "string",
  "isOffensive": boolean
}`;

// Ultra-simple translation prompt to avoid JSON validation errors
const SIMPLE_TRANSLATION_PROMPT = (targetLanguage: string) =>
    'You are a translator. Translate to ' + targetLanguage + '. Output ONLY valid JSON: {"translations":[{"id":"ID","translated":"TEXT"}]}';

function cleanAndParseJSON(text: string | undefined | null) {
    if (!text) return null;
    let cleaned = text.trim();

    // Remove markdown code blocks if present
    if (cleaned.startsWith('```')) {
        const matches = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (matches && matches[1]) {
            cleaned = matches[1].trim();
        }
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // Basic attempt to fix truncated JSON
        try {
            if (cleaned.startsWith('{') && !cleaned.endsWith('}')) {
                return JSON.parse(cleaned + '}');
            }
        } catch (innerE) { }
        logger.error('[ai] Failed to parse JSON response', { err: String(e), preview: text.slice(0, 200) });
        return null;
    }
}

// Decode sequences like "\\u043d" into real characters, even if they were
// double-escaped inside a JSON string. This prevents artifacts such as
// "небо" from appearing in the UI.
function decodeUnicodeEscapes(value: string): string {
    if (!value || !value.includes('\\u')) return value;
    return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

// Estimate token count (rough approximation: characters / 4)
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Split segments into chunks that won't exceed token limit
function splitSegmentsByTokenBudget(
    segments: { id: string; text: string }[],
    maxTokensPerChunk: number = 800
): { id: string; text: string }[][] {
    if (!segments.length) return [];

    const chunks: { id: string; text: string }[][] = [];
    let currentChunk: { id: string; text: string }[] = [];
    let currentTokens = 0;

    for (const segment of segments) {
        const segmentTokens = estimateTokens(segment.text);

        // If single segment exceeds max, we must include it (will rely on API to handle)
        if (currentTokens + segmentTokens > maxTokensPerChunk && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentTokens = 0;
        }

        currentChunk.push(segment);
        currentTokens += segmentTokens;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

type RawTranslation = Record<string, unknown>;

const GROQ_MODEL = 'llama-4-scout-17b-16e-instruct';

// Hard cap on how long any single AI API call may block a serverless function.
// Prevents slow-loris abuse where an attacker holds connections open to exhaust concurrency.
const AI_FETCH_TIMEOUT_MS = 25_000;

export async function generateAnswer(rawQuestion: string): Promise<{ correctedQuestion: string, answer: string, relatedLinks: { title: string, url: string }[] } | null> {
    if (dev) logger.debug('[ai] Generating answer', { question: rawQuestion });

    if (!GROQ_API_KEY) {
        logger.error('[ai] GROQ_API_KEY is missing');
        return null;
    }

    try {
        if (dev) logger.debug('[ai] Sending request to Groq', { model: GROQ_MODEL });
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: rawQuestion }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('[ai] Groq API error', { status: response.status, body: errorText.slice(0, 500) });
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);

    } catch (e) {
        logger.error('[ai] Error calling Groq API', { err: String(e) });
        return null;
    }
}

const GEMINI_TRANSLATE_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent';

const GROQ_TRANSLATE_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const OPENROUTER_TRANSLATE_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

async function callGeminiTranslation(
    targetLanguage: string,
    segments: { id: string; text: string }[]
) {
    if (!GEMINI_API_KEY) {
        logger.warn('[ai] GEMINI_API_KEY not set, skipping Gemini translation');
        return null;
    }

    try {
        const response = await fetch(`${GEMINI_TRANSLATE_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `${SIMPLE_TRANSLATION_PROMPT(targetLanguage)}\n\nInput:\n${JSON.stringify({
                                    targetLanguage,
                                    segments
                                })}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('[ai] Gemini translation error', { status: response.status, body: errorText.slice(0, 500) });
            return null;
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            logger.error('[ai] Gemini translation returned empty content');
            return null;
        }

        const parsed = cleanAndParseJSON(content);
        if (parsed && Array.isArray(parsed.translations)) {
            return parsed.translations.map((t: RawTranslation) => ({
                id: String(t.id),
                translated: decodeUnicodeEscapes(String(t.translated ?? ''))
            }));
        }
        logger.error('[ai] Gemini translation payload missing translations');
        return null;
    } catch (error) {
        logger.error('[ai] Error translating content with Gemini', { err: String(error) });
        return null;
    }
}

async function callGroqTranslation(
    targetLanguage: string,
    segments: { id: string; text: string }[],
    retryCount = 0
): Promise<{ id: string, translated: string }[] | null> {
    if (!GROQ_API_KEY) {
        logger.warn('[ai] GROQ_API_KEY not set, skipping Groq translation');
        return null;
    }

    try {
        const response = await fetch(GROQ_TRANSLATE_ENDPOINT, {
            method: 'POST',
            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: SIMPLE_TRANSLATION_PROMPT(targetLanguage) },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            targetLanguage,
                            segments
                        })
                    }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (response.status === 429 && retryCount < 2) {
            // Honour the Retry-After header if present; fall back to linear back-off.
            const retryAfterHeader = response.headers.get('retry-after');
            const retryAfterSec = retryAfterHeader ? parseFloat(retryAfterHeader) : NaN;
            const waitMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0
                ? Math.min(retryAfterSec * 1000, 30_000)
                : 1000 * (retryCount + 1);
            logger.warn('[ai] Groq rate limit hit, retrying', { attempt: retryCount + 1, waitMs });
            await new Promise(r => setTimeout(r, waitMs));
            return callGroqTranslation(targetLanguage, segments, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('[ai] Groq translation error', { status: response.status, body: errorText.slice(0, 500) });
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            logger.error('[ai] Groq translation returned empty content');
            return null;
        }

        const parsed = cleanAndParseJSON(content);
        if (parsed && Array.isArray(parsed.translations)) {
            return parsed.translations.map((t: RawTranslation) => ({
                id: String(t.id),
                translated: decodeUnicodeEscapes(String(t.translated ?? ''))
            }));
        }
        logger.error('[ai] Groq translation parsing failed', { preview: content.substring(0, 200) });
        return null;
    } catch (error) {
        logger.error('[ai] Error translating content with Groq', { err: String(error) });
        return null;
    }
}

async function translateWithOpenRouter(
    targetLanguage: string,
    segments: { id: string; text: string }[]
): Promise<{ id: string, translated: string }[] | null> {
    if (!OPENROUTER_API_KEY) {
        logger.warn('[ai] OPENROUTER_API_KEY not set, skipping OpenRouter translation');
        return null;
    }

    // OpenRouter uses different model IDs - verified free models for 2025
    // Using auto-router as final fallback
    const models = [
        'meta-llama/llama-4-maverick:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'deepseek/deepseek-r1-0528:free',
        'openrouter/free'
    ];

    for (const model of models) {
        try {
            if (dev) logger.debug('[ai] Trying OpenRouter model', { model });
            const response = await fetch(OPENROUTER_TRANSLATE_ENDPOINT, {
                method: 'POST',
                signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://verynice.kz',
                    'X-Title': 'Verynice'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: SIMPLE_TRANSLATION_PROMPT(targetLanguage) },
                        {
                            role: 'user',
                            content: JSON.stringify({
                                targetLanguage,
                                segments
                            })
                        }
                    ],
                    temperature: 0.1
                })
            });

            if (response.status === 404) {
                logger.warn('[ai] OpenRouter model not found, trying next', { model });
                continue;
            }

            // Handle 429 with exponential backoff - retry up to 2 times on same model
            if (response.status === 429) {
                const errorText = await response.text();
                if (errorText.includes('rate-limit') || errorText.includes('rate_limit')) {
                    for (let retryAttempt = 1; retryAttempt <= 2; retryAttempt++) {
                        const waitMs = 1000 * retryAttempt;
                        logger.warn('[ai] OpenRouter 429, retrying', { model, attempt: retryAttempt, waitMs });
                        await new Promise(r => setTimeout(r, waitMs));

                        const retryResponse = await fetch(OPENROUTER_TRANSLATE_ENDPOINT, {
                            method: 'POST',
                            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                                'HTTP-Referer': 'https://verynice.kz',
                                'X-Title': 'Verynice'
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [
                                    { role: 'system', content: SIMPLE_TRANSLATION_PROMPT(targetLanguage) },
                                    {
                                        role: 'user',
                                        content: JSON.stringify({
                                            targetLanguage,
                                            segments
                                        })
                                    }
                                ],
                                temperature: 0.1
                            })
                        });

                        if (retryResponse.ok) {
                            const data = await retryResponse.json();
                            const content = data.choices[0]?.message?.content;
                            if (content) {
                                const parsed = cleanAndParseJSON(content);
                                if (parsed && Array.isArray(parsed.translations)) {
                                    return parsed.translations.map((t: RawTranslation) => ({
                                        id: String(t.id),
                                        translated: decodeUnicodeEscapes(String(t.translated ?? ''))
                                    }));
                                }
                            }
                        }
                        if (retryResponse.status !== 429) break;
                    }
                }
                logger.warn('[ai] OpenRouter 429 exhausted retries, skipping model', { model });
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                logger.error('[ai] OpenRouter translation error', { model, status: response.status, body: errorText.slice(0, 500) });
                continue;
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                logger.error('[ai] OpenRouter translation returned empty content', { model });
                continue;
            }

            const parsed = cleanAndParseJSON(content);
            if (parsed && Array.isArray(parsed.translations)) {
                return parsed.translations.map((t: RawTranslation) => ({
                    id: String(t.id),
                    translated: decodeUnicodeEscapes(String(t.translated ?? ''))
                }));
            }
            logger.error('[ai] OpenRouter translation payload missing translations', { model });
            continue;
        } catch (error) {
            logger.error('[ai] Error with OpenRouter model', { model, err: String(error) });
        }
    }

    logger.error('[ai] All OpenRouter models failed');
    return null;
}

export async function translateSegments(
    targetLanguage: string,
    segments: { id: string; text: string }[]
): Promise<{ id: string; translated: string }[] | null> {
    if (!segments.length) return [];

    // Split segments by token budget. Matches the client MAX_TOKENS_PER_CHUNK (3000)
    // so each client request maps to exactly one AI call with no re-splitting.
    const chunks = splitSegmentsByTokenBudget(segments, 3000);
    if (dev) logger.debug('[ai] Translation chunks', { segmentCount: segments.length, chunkCount: chunks.length });

    // Process all sub-chunks in parallel (usually just 1 chunk with the 3000-token budget)
    const results = await Promise.all(chunks.map(async (chunk) => {
        // Primary: Groq
        if (GROQ_API_KEY) {
            const t = await callGroqTranslation(targetLanguage, chunk);
            if (t?.length) return t;
            logger.warn('[ai] Groq translation failed for chunk, attempting Gemini fallback');
        }
        // Fallback 1: Gemini
        if (GEMINI_API_KEY) {
            const t = await callGeminiTranslation(targetLanguage, chunk);
            if (t?.length) return t;
            logger.warn('[ai] Gemini translation failed for chunk, attempting OpenRouter fallback');
        }
        // Fallback 2: OpenRouter
        if (OPENROUTER_API_KEY) {
            const t = await translateWithOpenRouter(targetLanguage, chunk);
            if (t?.length) return t;
            logger.error('[ai] All providers failed for chunk');
        }
        return [] as { id: string; translated: string }[];
    }));

    const allTranslations = results.flat();

    if (allTranslations.length === 0) {
        if (!GROQ_API_KEY && !GEMINI_API_KEY && !OPENROUTER_API_KEY) {
            throw new Error('All translation providers failed or no API keys configured');
        }
        return null;
    }

    return allTranslations;
}

export async function getCoordinates(query: string): Promise<{ lat: number, lng: number, title: string, description: string } | null> {
    if (!GROQ_API_KEY) {
        logger.error('[ai] GROQ_API_KEY is missing');
        return null;
    }

    try {
        if (dev) logger.debug('[ai] Getting coordinates', { query });
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: MAP_SYSTEM_PROMPT },
                    { role: 'user', content: query }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            logger.error('[ai] Groq API error for coordinates', { status: response.status });
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);
    } catch (e) {
        logger.error('[ai] Error getting coordinates', { err: String(e) });
        return null;
    }
}

export async function processComment(rawText: string): Promise<{ correctedText: string | null, isOffensive: boolean } | null> {
    if (!GROQ_API_KEY) {
        logger.error('[ai] GROQ_API_KEY is missing');
        return null;
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: COMMENT_SYSTEM_PROMPT },
                    { role: 'user', content: rawText }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            logger.error('[ai] Groq API error processing comment', { status: response.status });
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);
    } catch (e) {
        logger.error('[ai] Error processing comment', { err: String(e) });
        return null;
    }
}
