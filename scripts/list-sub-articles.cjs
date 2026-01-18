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

async function listSubArticles() {
    const db = await initFirebase();
    console.log('🔍 Listing Remaining Sub-Articles for Astana City...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const snapshot = await regionsRef.where('title', '==', 'Astana & Nearby').get();

    if (snapshot.empty) {
        console.log('Region not found');
        return;
    }

    const regionDoc = snapshot.docs[0];
    const attractionsRef = regionDoc.ref.collection('attractions');
    const snap = await attractionsRef.where('title', '==', 'Astana City').get();

    if (snap.empty) {
        console.log('Astana City not found');
        return;
    }

    const doc = snap.docs[0];
    const subArticlesRef = doc.ref.collection('articles');
    const subSnap = await subArticlesRef.get();

    if (subSnap.empty) {
        console.log('No sub-articles found.');
    } else {
        subSnap.forEach(d => {
            const data = d.data();
            console.log(`- [${d.id}] "${data.title}" (Content length: ${data.content ? data.content.split(' ').length : 0} words)`);
            console.log(`   Preview: ${data.content ? data.content.substring(0, 50) : 'N/A'}...`);
        });
    }
}

listSubArticles().catch(console.error);
