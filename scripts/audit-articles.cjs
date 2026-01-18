const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    let sa;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saVar) sa = JSON.parse(saVar);
    else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    if (!sa) throw new Error('No Firebase service account found');
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function analyze() {
    const db = await initFirebase();
    console.log('🔍 Analyzing all attraction articles for repetition and quality...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    const phrasesCount = new Map();
    const attractionsData = [];

    for (const regionDoc of regionsSnap.docs) {
        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnap = await attractionsRef.get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const content = data.contentMarkdown || data.content || '';
            const sections = [];

            // Try to find subcollection articles
            const subArticlesSnap = await attractionDoc.ref.collection('articles').get();
            subArticlesSnap.docs.forEach(d => sections.push(d.data().contentMarkdown || d.data().content || ''));

            const allText = content + ' ' + sections.join(' ');

            // Look for common phrases (5+ words)
            const words = allText.split(/\s+/);
            for (let i = 0; i < words.length - 10; i++) {
                const phrase = words.slice(i, i + 10).join(' ').toLowerCase().replace(/[.,!?;:]/g, '');
                if (phrase.length > 30) {
                    phrasesCount.set(phrase, (phrasesCount.get(phrase) || 0) + 1);
                }
            }

            attractionsData.push({
                id: attractionDoc.id,
                title: data.title,
                region: regionDoc.data().title,
                contentLength: allText.length,
                hasArticlesSub: subArticlesSnap.size
            });
        }
    }

    console.log('\n--- TOP REPETITIVE PHRASES ---');
    const sortedPhrases = [...phrasesCount.entries()]
        .filter(([p, count]) => count > 5)
        .sort((a, b) => b[1] - a[1]);

    sortedPhrases.slice(0, 20).forEach(([phrase, count]) => {
        console.log(`[${count} times]: "${phrase}"`);
    });

    console.log('\n--- ATTRACTION COVERAGE ---');
    console.log(`Total Attractions: ${attractionsData.length}`);
    const shortContent = attractionsData.filter(a => a.contentLength < 500);
    console.log(`Short Content (<500 chars): ${shortContent.length}`);

    fs.writeFileSync('attraction_audit.json', JSON.stringify({
        repetition: sortedPhrases,
        attractions: attractionsData
    }, null, 2));

    console.log('\nAudit saved to attraction_audit.json');
}

analyze().catch(err => {
    console.error(err);
    process.exit(1);
});
