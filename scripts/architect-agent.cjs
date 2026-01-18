const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai'); // Requires: npm install openai
require('dotenv').config();

// --- CONFIGURATION ---
const DRY_RUN = false; // Set to false to actually write to DB
const TARGET_REGION = null; // Set to "Astana & Nearby" to limit scope, or null for ALL
// ---------------------

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa;
    if (saVar) {
        try {
            sa = JSON.parse(saVar);
        } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var", e);
        }
    }
    if (!sa && fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    if (!sa) {
        console.error("No service account found. Please set FIREBASE_SERVICE_ACCOUNT or place .secrets/serviceAccountKey.json");
        process.exit(1);
    }
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

// Reuse Audit Logic
function auditArticle(text) {
    if (!text) return false;
    const words = text.trim().split(/\s+/).length;
    return words >= 130;
}

// The Prompt Generator
function buildPrompt(attractionTitle, regionTitle) {
    return `
Role: Expert Travel Journalist and Content Engineer.
Task: Generate a publish-ready travel guide package for: "${attractionTitle}" in "${regionTitle}".

Core Task:
1. Select a random integer N between 6 and 9.
2. Generate N unique articles for this attraction.

Article Requirements:
- Title: Compelling, specific (e.g., "Dawn at the Bamboo Forest").
- Body: Minimum 130 words. MUST include sensory details (sights, sounds, smells) and historical/cultural nuance. NO generic phrases ("breathtaking", "gem").
- Metadata: 
    - tags: [keyword1, keyword2, ...]
    - coordinates: { lat: Number, lng: Number } (Estimate best guess)
    - pro_tip: Actionable insider tip.

Output Format:
Single valid JSON object. Keys are arbitrary unique IDs (e.g., "article_01").
Example:
{
  "article_01": {
    "title": "...",
    "content": "...",
    "metadata": { "tags": [], "coordinates": {}, "pro_tip": "" }
  },
  ...
}
    `;
}

async function generateContent(openai, attractionTitle, regionTitle) {
    console.log(`🤖 Generating content for: ${attractionTitle}...`);
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: buildPrompt(attractionTitle, regionTitle) }],
            model: "gpt-4o", // Or gpt-4-turbo
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0].message.content;
        return JSON.parse(responseContent);
    } catch (error) {
        console.error(`❌ Content generation failed for ${attractionTitle}:`, error.message);
        return null;
    }
}

async function runArchitect() {
    // Check for API Key
    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ CRITICAL: No OPENAI_API_KEY found in .env. The Architect Agent requires an LLM to generate content.");
        console.log("Please add OPENAI_API_KEY=sk-... to your .env file and install the library (npm install openai).");
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const db = await initFirebase();

    console.log("🚀 Starting Travel Content Architect Agent...");
    if (DRY_RUN) console.log("⚠️ DRY RUN MODE: Database will NOT be updated.");

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnapshot = await regionsRef.get();

    for (const regionDoc of regionsSnapshot.docs) {
        const regionTitle = regionDoc.data().title;
        if (TARGET_REGION && regionTitle !== TARGET_REGION) continue;

        console.log(`\n📂 Region: ${regionTitle}`);
        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnapshot = await attractionsRef.get();

        for (const attractionDoc of attractionsSnapshot.docs) {
            const attTitle = attractionDoc.data().title || attractionDoc.id;

            // 1. Check if renovation is needed
            // We check the articles subcollection
            const articlesRef = attractionDoc.ref.collection('articles');
            const articlesSnap = await articlesRef.get();

            // Simple heuristic: If < 6 articles OR any article < 130 words, RENOVATE.
            let needsRenovation = false;
            if (articlesSnap.size < 6) {
                needsRenovation = true;
                console.log(`   - ${attTitle}: Needs renovation (Only ${articlesSnap.size} articles).`);
            } else {
                for (const art of articlesSnap.docs) {
                    const content = art.data().content || art.data().contentMarkdown || "";
                    if (!auditArticle(content)) {
                        needsRenovation = true;
                        console.log(`   - ${attTitle}: Needs renovation (Article content too short).`);
                        break;
                    }
                }
            }

            if (!needsRenovation) {
                console.log(`   - ${attTitle}: ✅ Already Gold Standard.`);
                continue;
            }

            // 2. Generate Content
            const generatedData = await generateContent(openai, attTitle, regionTitle);

            if (!generatedData) continue;

            // 3. Update Database
            if (!DRY_RUN) {
                // Delete existing articles (optional, but "Renovate" implies replacing bad content)
                const batch = db.batch();

                // Delete old articles
                const oldArticles = await articlesRef.get();
                oldArticles.forEach(doc => batch.delete(doc.ref));

                // Add new articles
                Object.entries(generatedData).forEach(([key, articleData]) => {
                    const newDocRef = articlesRef.doc(); // Auto-ID
                    batch.set(newDocRef, {
                        title: articleData.title,
                        content: articleData.content,
                        metadata: articleData.metadata,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });

                await batch.commit();
                console.log(`   ✅ Validated & Imported ${Object.keys(generatedData).length} new articles.`);
            } else {
                console.log(`   [DRY RUN] Would import ${Object.keys(generatedData).length} articles.`);
            }
        }
    }
}

runArchitect().then(() => process.exit(0)).catch(console.error);
