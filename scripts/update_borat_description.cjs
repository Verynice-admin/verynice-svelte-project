
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

async function updateBoratDescription() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    const NEW_DESCRIPTION = "Jagshemash!\nVisit Kazakhstan!\nWa wa wee wa!\nI Hope You Like!";
    console.log(`--- Updating Borat Page Description ---`);

    try {
        const pageRef = db.collection('pages').doc('boratPage');

        await pageRef.set({
            headerDescription: NEW_DESCRIPTION
        }, { merge: true });

        console.log(`SUCCESS: Updated headerDescription in Firestore.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

updateBoratDescription();
