const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    let sa;
    if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    if (!sa) throw new Error('No service account');
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function redistributeContent() {
    const db = await initFirebase();
    console.log('🚀 Starting Content Redistribution (Markdown -> Sub-Articles)...');

    // Logic: Look for attractions in "Astana & Nearby" (and others) that have our new contentMarkdown.
    // Clear their 'articles' subcollection.
    // Create new 'articles' from the chunks of contentMarkdown.

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        console.log(`\nScanning Region: ${regionTitle}`);

        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnap = await attractionsRef.get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const contentMarkdown = data.contentMarkdown || '';

            // Filter for attractions we likely updated (has significant markdown)
            // Or specifically target the Astana ones. 
            // The user complained about "Astana" generally, so let's target attractions with >500 chars of markdown
            if (!contentMarkdown || contentMarkdown.length < 500) {
                continue;
            }

            // We only want to touch attractions where we have valid markdown to distribute.
            // Also, only do this if it seems to be one of our "Gold Standard" updates.
            // A simple check is if it starts with '# ' (which our templates did).
            if (!contentMarkdown.trim().startsWith('#')) {
                // console.log(`   Skipping ${data.title} (Markdown format doesn't match expected structure)`);
                continue;
            }

            console.log(`   🔄 Redistributing content for: ${data.title}`);

            // 1. Clear existing bad articles
            const articlesRef = attractionDoc.ref.collection('articles');
            const existingArticles = await articlesRef.get();
            const batch = db.batch();

            existingArticles.forEach(doc => {
                batch.delete(doc.ref);
            });

            // 2. Parse Markdown
            // Split by lines starting with #
            const sections = contentMarkdown.split(/\n# /g).filter(s => s.trim().length > 0);

            let order = 0;
            sections.forEach(section => {
                // Handle the first case if it starts with #
                let cleanSection = section;
                if (cleanSection.startsWith('# ')) cleanSection = cleanSection.substring(2);

                const firstLineEnd = cleanSection.indexOf('\n');
                let title = firstLineEnd > -1 ? cleanSection.substring(0, firstLineEnd).trim() : 'Overview';
                let content = firstLineEnd > -1 ? cleanSection.substring(firstLineEnd).trim() : cleanSection;

                // Clean title if it has extra hash
                title = title.replace(/^#+\s*/, '');

                if (title && content) {
                    const newDocRef = articlesRef.doc();
                    batch.set(newDocRef, {
                        title: title,
                        content: content,
                        order: order++,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        label: title // Use title as label
                    });
                }
            });

            await batch.commit();
            console.log(`      ✅ Created ${sections.length} new sub-articles from markdown.`);
        }
    }
    console.log('\n✨ Redistribution complete.');
}

redistributeContent().catch(console.error);
