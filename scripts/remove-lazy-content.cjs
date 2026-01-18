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

const BAD_TITLES = [
    "Essential Profile",
    "Local Flavors & Amenities",
    "The ‘Wow-Factor’",
    "The 'Wow-Factor'", // check for smart quotes variations
    "Essential Insider Tips"
];

async function removeLazyContent() {
    const db = await initFirebase();
    console.log('🧹 Starting cleanup of lazy/redundant sub-articles...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        console.log(`\nChecking Region: ${regionTitle}`);

        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnap = await attractionsRef.get();

        for (const attractionDoc of attractionsSnap.docs) {
            const attractionTitle = attractionDoc.data().title;
            const subArticlesRef = attractionDoc.ref.collection('articles');
            const subArticlesSnap = await subArticlesRef.get();

            if (subArticlesSnap.empty) continue;

            let deletedCount = 0;
            const deletePromises = [];

            subArticlesSnap.forEach(doc => {
                const title = doc.data().title;
                if (BAD_TITLES.includes(title)) {
                    // console.log(`   - Marking for deletion: "${title}" in ${attractionTitle}`);
                    deletePromises.push(doc.ref.delete());
                    deletedCount++;
                }
            });

            if (deletedCount > 0) {
                await Promise.all(deletePromises);
                console.log(`   🗑️  Deleted ${deletedCount} lazy articles from: ${attractionTitle}`);
            }
        }
    }
    console.log('\n✨ Cleanup complete.');
}

removeLazyContent().catch(console.error);
