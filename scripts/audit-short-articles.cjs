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

async function auditShort() {
    const db = await initFirebase();
    console.log('📉 Auditing for SHORT Articles (< 300 words)...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionTitle = regionDoc.data().title;
        const attractionsSnap = await regionDoc.ref.collection('attractions').get();

        attractionsSnap.forEach(doc => {
            const data = doc.data();
            const content = data.contentMarkdown || data.content || '';
            const words = content.split(/\s+/).length;

            if (words < 300) {
                console.log(`[${regionTitle}] ${data.title}: ${words} words`);
            }
        });
    }
    console.log('Audit complete.');
}

auditShort().then(() => process.exit(0)).catch(console.error);
