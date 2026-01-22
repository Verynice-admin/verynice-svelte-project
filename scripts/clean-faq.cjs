const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../.secrets/serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function cleanFaq() {
    console.log('Cleaning History Page FAQ...');
    const faqRef = db.collection('pages').doc('historyPage').collection('faq').doc('main');
    const doc = await faqRef.get();

    if (!doc.exists) return;

    const items = doc.data().items || [];
    console.log(`Current item count: ${items.length}`);

    const junkPatterns = [
        /britney/i,
        /elvis/i,
        /beatles/i,
        /your version/i,
        /^borat$/i
    ];

    const cleanItems = items.filter(item => {
        const q = item.question || '';
        const isJunk = junkPatterns.some(pattern => pattern.test(q));
        if (isJunk) {
            console.log(`Removing junk: "${q}"`);
        }
        return !isJunk;
    });

    if (cleanItems.length !== items.length) {
        await faqRef.update({ items: cleanItems });
        console.log(`Cleaned FAQ. New count: ${cleanItems.length}`);
    } else {
        console.log('FAQ is already clean.');
    }
}

cleanFaq();
