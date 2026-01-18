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

async function auditAll() {
    const db = await initFirebase();
    console.log('📊 Auditing ALL Attractions Content Length...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        console.log(`\n\n--- Region: ${regionTitle} ---`);

        const attractionsSnap = await regionDoc.ref.collection('attractions').get();

        let count = 0;
        attractionsSnap.forEach(doc => {
            const data = doc.data();
            const content = data.contentMarkdown || data.content || '';
            const words = content.split(/\s+/).length;

            // Flag short ones
            const status = words < 150 ? '⚠️ SHORT' : '✅ OK';

            console.log(`[${status}] ${data.title} (${words} words)`);
            count++;
        });

        if (count === 0) console.log('(No attractions found)');
    }
}

auditAll().then(() => process.exit(0)).catch(console.error);
