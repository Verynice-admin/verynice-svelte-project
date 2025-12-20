
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
    const secretsPaths = [
        path.resolve('.secrets/serviceAccountKey.json'),
        path.resolve('.secrets/service-account.json')
    ];

    for (const secretsPath of secretsPaths) {
        try {
            if (fs.existsSync(secretsPath)) {
                return require(secretsPath);
            }
        } catch (error) { }
    }
    return null;
}

const NEW_TITLE = 'Did you know in Borat...';

async function updateVideoTitle() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log(`--- Updating Video Title to: "${NEW_TITLE}" ---`);

    try {
        const videoRef = db.collection('pages').doc('boratPage').collection('video').doc('main');

        await videoRef.set({
            title: NEW_TITLE
        }, { merge: true });

        console.log(`SUCCESS: Updated video title in Firestore.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

updateVideoTitle();
