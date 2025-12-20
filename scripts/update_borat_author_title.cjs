
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

const AUTHOR_ID = 'verynice-official';
const NEW_TITLE = 'Lead Country promoter';

async function updateAuthorTitle() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log(`--- Updating Author Title for '${AUTHOR_ID}' ---`);

    try {
        const authorRef = db.collection('authors').doc(AUTHOR_ID);

        await authorRef.set({
            title: NEW_TITLE
        }, { merge: true });

        console.log(`SUCCESS: Updated title to '${NEW_TITLE}'.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

updateAuthorTitle();
