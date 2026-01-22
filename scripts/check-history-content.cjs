const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../.secrets/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function checkHistoryContent() {
    console.log('Checking History Page Content in Firestore...');

    const historyRef = db.collection('pages').doc('historyPage');

    // 1. Check Articles
    console.log('\n--- Articles ---');
    const articlesSnap = await historyRef.collection('articles').orderBy('order').get();
    if (articlesSnap.empty) {
        console.log('WARNING: No articles found!');
    } else {
        articlesSnap.forEach(doc => {
            const d = doc.data();
            console.log(`[${d.order}] ${d.title || d.heading} (ID: ${doc.id})`);
        });
    }

    // 2. Check FAQ
    console.log('\n--- FAQ ---');
    const faqSnap = await historyRef.collection('faq').get();
    if (faqSnap.empty) {
        console.log('WARNING: No FAQ subcollection found!');
    } else {
        faqSnap.forEach(doc => {
            const d = doc.data();
            console.log(`Doc ID: ${doc.id}, Title: ${d.title}`);
            if (d.items) {
                d.items.forEach((item, i) => {
                    console.log(`  Q${i + 1}: ${item.question}`);
                });
            }
        });
    }

    // 3. Check Map
    console.log('\n--- Map ---');
    const mapSnap = await historyRef.collection('map').get();
    mapSnap.forEach(doc => {
        console.log(doc.data());
    });

}

checkHistoryContent();
