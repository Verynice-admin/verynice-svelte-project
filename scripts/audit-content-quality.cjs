const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// Heuristic check for "sensory details" and "history" (simple keyword/structure proxy)
function checkContentQuality(text) {
    const genericPhrases = ["breathtaking", "must-see", "rich history", "a lot to see", "hidden gem"];
    const issues = [];

    // Check word count
    const words = text.trim().split(/\s+/).length;
    if (words < 130) {
        issues.push(`CRITICAL FAILURE: Word count ${words} (< 130)`);
    }

    // Check generic language
    const foundGenerics = genericPhrases.filter(phrase => text.toLowerCase().includes(phrase));
    if (foundGenerics.length > 0) {
        issues.push(`Found generic language: "${foundGenerics.join('", "')}"`);
    }

    return {
        wordCount: words,
        passedWordCount: words >= 130,
        issues
    };
}

async function runAudit() {
    const db = await initFirebase();
    console.log("Starting Quality Assurance Audit (Protocol: 6-9 articles, >130 words, Specificity)...\n");

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles'); // Regions are here based on previous structure
    const regions = await regionsRef.get();

    let totalDestinations = 0;
    let passedDestinations = 0;
    let failedDestinations = 0;

    const report = {};

    for (const regionDoc of regions.docs) {
        const regionName = regionDoc.data().title;
        console.log(`Scanning Region: ${regionName}...`);

        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractions = await attractionsRef.get();

        for (const attractionDoc of attractions.docs) {
            totalDestinations++;
            const attData = attractionDoc.data();
            const attName = attData.title || attractionDoc.id;

            // Fetch articles (assuming valid structure is subcollection 'articles')
            const articlesRef = attractionDoc.ref.collection('articles');
            const articlesSnap = await articlesRef.get();
            const articleCount = articlesSnap.size;

            const attReport = {
                region: regionName,
                articleCount: articleCount,
                articleStatus: (articleCount >= 6 && articleCount <= 9) ? "PASS" : "FAIL",
                articles: []
            };

            let attractionFailed = attReport.articleStatus === "FAIL";

            for (const articleDoc of articlesSnap.docs) {
                const artData = articleDoc.data();
                const content = artData.content || artData.contentMarkdown || "";
                const quality = checkContentQuality(content);

                const artAudit = {
                    id: articleDoc.id,
                    title: artData.title,
                    wordCount: quality.wordCount,
                    passWordCount: quality.passedWordCount,
                    issues: quality.issues
                };

                if (!quality.passedWordCount || quality.issues.length > 0) {
                    attractionFailed = true;
                }
                attReport.articles.push(artAudit);
            }

            if (attractionFailed) {
                failedDestinations++;
                console.log(`[FAIL] ${attName} (Articles: ${articleCount})`);
                attReport.articles.forEach(a => {
                    if (!a.passWordCount) console.log(`   - Article "${a.title}": ${a.wordCount} words (Expected >= 130)`);
                    if (a.issues.length) console.log(`   - Issues: ${a.issues.join(', ')}`);
                });
            } else {
                passedDestinations++;
                console.log(`[PASS] ${attName}`);
            }
        }
    }

    console.log("\n================ AUDIT SUMMARY ================");
    console.log(`Total Destinations Scanned: ${totalDestinations}`);
    console.log(`PASSED: ${passedDestinations}`);
    console.log(`FAILED: ${failedDestinations}`);
    console.log("===============================================");
}

runAudit().then(() => process.exit(0)).catch(console.error);
