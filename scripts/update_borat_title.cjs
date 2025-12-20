
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
                console.log(`Found service account at: ${secretsPath}`);
                return require(secretsPath);
            }
        } catch (error) {
            console.error('Error reading service account:', error);
        }
    }
    return null;
}

async function updateBoratTitle() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    const NEW_TITLE = "Glorious Nation of Kazakhstan! Very nice!";
    console.log(`--- Updating Borat Page Title to: "${NEW_TITLE}" ---`);

    try {
        const pageRef = db.collection('pages').doc('boratPage');

        await pageRef.set({
            mainTitle: NEW_TITLE
        }, { merge: true });

        console.log(`SUCCESS: Updated mainTitle to "${NEW_TITLE}" in Firestore.`);

    } catch (error) {
        console.error('Error updating Firestore:', error);
    }
}

updateBoratTitle();
