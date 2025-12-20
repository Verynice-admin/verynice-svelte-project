
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

const NEW_PUBLIC_ID = 'content/pages/AboutBorat/main-background-image_borat';

async function updateBoratHeaderId() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log(`--- Updating Borat Page Header ID to: ${NEW_PUBLIC_ID} ---`);

    try {
        const pageRef = db.collection('pages').doc('boratPage');

        await pageRef.set({
            headerBackgroundPublicId: NEW_PUBLIC_ID
        }, { merge: true });

        console.log('SUCCESS: Updated headerBackgroundPublicId in Firestore.');

    } catch (error) {
        console.error('Error updating Firestore:', error);
    }
}

updateBoratHeaderId();
