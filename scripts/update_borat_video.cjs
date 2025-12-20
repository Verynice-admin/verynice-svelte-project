
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

async function updateBoratVideo() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Updating Borat Page Video ---');

    try {
        const videoRef = db.collection('pages').doc('boratPage').collection('video').doc('main');

        await videoRef.set({
            title: 'Borat | Official Trailer',
            url: 'https://youtu.be/aOqcLp1NznQ'
        }, { merge: true });

        console.log('Successfully updated video URL to: https://youtu.be/aOqcLp1NznQ');

    } catch (error) {
        console.error('Error updating video:', error);
    }
}

updateBoratVideo();
