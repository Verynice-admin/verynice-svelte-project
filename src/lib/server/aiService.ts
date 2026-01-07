import { GROQ_API_KEY, GEMINI_API_KEY } from '$env/static/private';

const SITE_CONTENT = `
Available Website Content:
- Home Page: / (General introduction)
- History: /history (History of Kazakhstan, from ancient times to independence)
- Destinations: /destinations (Top sights, nature, cities like Almaty and Astana)
- Culture: /culture (Traditions, food/cuisine, music, lifestyle)
- Travel Tips: /tips (Visa info, safety, logistics, money)
- About Borat: /about-borat (The movie vs reality)
`;

const SYSTEM_PROMPT = `You are an expert historian and friendly guide for Kazakhstan. 
Your task is to process user questions about Kazakhstan.

${SITE_CONTENT}

1. Correct the grammar and spelling of the user's question.
2. Provide a concise, accurate, and friendly answer (max 3-4 sentences).
3. Suggest 1-3 relevant links from the "Available Website Content" list if they closely match the topic. If no specific page is relevant, suggest the Home page or Destinations.
4. If the question is offensive, irrelevant to Kazakhstan, or nonsense, set the answer to "I can only answer questions about Kazakhstan." and provide empty links.

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

const TRANSLATION_SYSTEM_PROMPT = `You are a precise and culturally-aware translator for a Kazakhstan travel website.
You will receive JSON input with a "targetLanguage" field and a "segments" array. Each segment has an "id" and the English "text" that must be translated.

Return JSON only in this structure:
{
  "translations": [
    { "id": "segment-id", "translated": "translated text" }
  ]
}

Rules:
1. Produce exactly one output entry for every input segment using the same "id".
2. Translate the human-language portion into the requested target language while preserving numbers, punctuation, emojis, markdown, and HTML tags exactly as they appear.
Rule 3 is ONLY for the target language "Kazakh". If translating to any other language (e.g., Russian, French), ignore Rule 3 entirely and do not use the Kazakh words listed there.

3. KAZAKH-SPECIFIC RULES (Apply ONLY if targetLanguage = "Kazakh"):
   - Always translate into correct, modern Kazakh (Қазақ тілі) using the CYRILLIC script. 
   - CRITICAL: The user has reported that the system accidentally outputs Russian instead of Kazakh. This is a MAJOR FAILURE. Never use Russian or Ukrainian words in Kazakh translation. 
   - ALWAYS use unique Kazakh letters: ә, ғ, қ, ң, ө, ұ, ү, һ, і. If you output Cyrillic text without these letters, it is likely wrong.
   - LINGUISTIC RULE: In Kazakh, the letter "Э" is rarely used, especially at the beginning of words. Always use "Е" instead (e.g., "Есентай" instead of "Эсентай").
   - KAZAKH TERMINOLOGY:
     - "Singing Dune" -> "Әнші құм"
     - "Main" -> "Басты"
     - "Destinations" -> "Межелі жерлер" (or "Көрікті жерлер")
     - "Culture" -> "Мәдениет"
     - "History" -> "Тарих"
     - "Food & Drinks" -> "Ас-су"
     - "About" -> "Туралы"
     - "Travel Tips" -> "Саяхат кеңестері"
     - "National Park" -> "Ұлттық парк"
     - "Esentai Tower" -> "Есентай мұнарасы"

4. RUSSIAN-SPECIFIC RULES (Apply ONLY if targetLanguage = "Russian"):
   - Use standard, professional Russian as spoken in Kazakhstan.
   - Do NOT use Kazakh words if a Russian equivalent exists (e.g., use "Культура" instead of "Мәдениет", "Направления" instead of "Межелі жерлер").
   - Ensure grammatical gender and cases are correct for the context.

5. If a phrase is already in the desired language or cannot be translated, repeat the original text in "translated".
6. Do not translate brand names, domain names, or logos like "VeryNice.kz", "VeryNice", or ".kz".
7. Never use escaped unicode sequences like "\\u043d". Always output real characters in the "translated" field.
8. Do not add commentary, notes, phonetics, or explanations. Output ONLY the JSON object. Do not wrap the response in any preface or suffix.
9. ALWAYS verify that Kazakh translation is NOT Russian. Russian lacks letters like ә, ғ, қ, ң, ө, ұ, ү, һ, і. Kazakh MUST use them.
10. Avoid using the letter "Э" in Kazakh. Prefer "Е" (e.g., "Есентай").`;

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
        console.error('Failed to parse JSON:', e, text);
        return null;
    }
}

// Decode sequences like "\\u043d" into real characters, even if they were
// double-escaped inside a JSON string. This prevents artifacts such as
// "\u043d\u0435\u0431\u043e" from appearing in the UI.
function decodeUnicodeEscapes(value: string): string {
    if (!value || !value.includes('\\u')) return value;
    return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

export async function generateAnswer(rawQuestion: string): Promise<{ correctedQuestion: string, answer: string, relatedLinks: { title: string, url: string }[] } | null> {
    console.log('[AI Service] Generating answer for:', rawQuestion);

    if (!GROQ_API_KEY) {
        console.error('[AI Service] GROQ_API_KEY is missing');
        return null;
    }

    try {
        console.log('[AI Service] Sending request to Groq...');
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: rawQuestion }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Service] Groq API error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);

    } catch (e) {
        console.error('Error calling Groq API:', e);
        return null; // Fail gracefully
    }
}

const GEMINI_TRANSLATE_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

const GROQ_TRANSLATE_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function callGeminiTranslation(
    targetLanguage: string,
    segments: { id: string; text: string }[]
) {
    if (!GEMINI_API_KEY) return null;

    try {
        const response = await fetch(`${GEMINI_TRANSLATE_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `${TRANSLATION_SYSTEM_PROMPT}\n\nInput:\n${JSON.stringify({
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
            console.error('[AI Service] Gemini translation error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            console.error('[AI Service] Gemini translation returned empty content', data);
            return null;
        }

        const parsed = cleanAndParseJSON(content);
        if (parsed && Array.isArray(parsed.translations)) {
            return parsed.translations.map((t: any) => ({
                id: String(t.id),
                translated: decodeUnicodeEscapes(String(t.translated ?? ''))
            }));
        }
        console.error('[AI Service] Gemini translation payload missing translations', parsed);
        return null;
    } catch (error) {
        console.error('[AI Service] Error translating content with Gemini:', error);
        return null;
    }
}

async function callGroqTranslation(
    targetLanguage: string,
    segments: { id: string; text: string }[],
    retryCount = 0
): Promise<{ id: string, translated: string }[] | null> {
    if (!GROQ_API_KEY) return null;

    try {
        const response = await fetch(GROQ_TRANSLATE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
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

        if (response.status === 429 && retryCount < 1) {
            console.warn('[AI Service] Groq rate limit hit, retrying in 1s...');
            await new Promise(r => setTimeout(r, 1000));
            return callGroqTranslation(targetLanguage, segments, retryCount + 1);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Service] Groq translation error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        const parsed = cleanAndParseJSON(content);
        if (parsed && Array.isArray(parsed.translations)) {
            return parsed.translations.map((t: any) => ({
                id: String(t.id),
                translated: decodeUnicodeEscapes(String(t.translated ?? ''))
            }));
        }
        return null;
    } catch (error) {
        console.error('[AI Service] Error translating content with Groq:', error);
        return null;
    }
}

export async function translateSegments(
    targetLanguage: string,
    segments: { id: string; text: string }[]
): Promise<{ id: string; translated: string }[] | null> {
    if (!segments.length) return [];

    let translations: { id: string; translated: string }[] | null = null;

    if (GEMINI_API_KEY) {
        translations = await callGeminiTranslation(targetLanguage, segments);
        if (translations?.length) {
            return translations;
        }
        console.warn('[AI Service] Gemini translation unavailable, attempting Groq fallback.');
    } else {
        console.warn('[AI Service] GEMINI_API_KEY not set, using Groq translation fallback.');
    }

    if (GROQ_API_KEY) {
        translations = await callGroqTranslation(targetLanguage, segments);
        if (translations?.length) {
            return translations;
        }
    } else {
        console.error('[AI Service] GROQ_API_KEY is missing; cannot perform fallback translation.');
    }

    return null;
}

export async function getCoordinates(query: string): Promise<{ lat: number, lng: number, title: string, description: string } | null> {
    if (!GROQ_API_KEY) {
        console.error('[AI Service] GROQ_API_KEY is missing');
        return null;
    }

    try {
        console.log('[AI Service] Getting coordinates for:', query);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: MAP_SYSTEM_PROMPT },
                    { role: 'user', content: query }
                ],
                temperature: 0.1, // Lower temperature for more deterministic coordinates
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            console.error('[AI Service] Groq API error:', response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);
    } catch (e) {
        console.error('[AI Service] Error getting coordinates:', e);
        return null;
    }
}

export async function processComment(rawText: string): Promise<{ correctedText: string, isOffensive: boolean } | null> {
    if (!GROQ_API_KEY) {
        console.error('[AI Service] GROQ_API_KEY is missing');
        return null;
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: COMMENT_SYSTEM_PROMPT },
                    { role: 'user', content: rawText }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            console.error('[AI Service] Groq API error:', response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        return cleanAndParseJSON(content);
    } catch (e) {
        console.error('[AI Service] Error processing comment:', e);
        return null; // Fail gracefully
    }
}
