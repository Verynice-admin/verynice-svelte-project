import { GROQ_API_KEY } from '$env/static/private';

const SYSTEM_PROMPT = `You are an expert historian and friendly guide for Kazakhstan. 
Your task is to process user questions about Kazakhstan.
1. Correct the grammar and spelling of the user's question.
2. Provide a concise, accurate, and friendly answer (max 3-4 sentences).
3. If the question is offensive, irrelevant to Kazakhstan, or nonsense, set the answer to "I can only answer questions about Kazakhstan."

Output JSON only in this format:
{
  "correctedQuestion": "string",
  "answer": "string"
}`;

export async function generateAnswer(rawQuestion: string): Promise<{ correctedQuestion: string, answer: string } | null> {
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

        if (!content) return null;

        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('[AI Service] Failed to parse AI response:', content);
            return null;
        }

    } catch (e) {
        console.error('Error calling Groq API:', e);
        return null; // Fail gracefully
    }
}

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

        if (!content) return null;

        return JSON.parse(content);
    } catch (e) {
        console.error('[AI Service] Error getting coordinates:', e);
        return null;
    }
}
