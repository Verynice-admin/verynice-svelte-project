
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

const PUBLIC_ID = 'content/pages/AboutBorat/borat_portfolio';

async function addToGallery() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Adding Borat Portfolio to Photo Gallery ---');

    try {
        const galleryRef = db.collection('pages').doc('boratPage').collection('photoGallery').doc('main');
        const doc = await galleryRef.get();
        if (!doc.exists) {
            console.log('Gallery doc not found, creating...');
            await galleryRef.set({ title: 'Photo Gallery', photos: [] });
        }

        const data = doc.data() || { photos: [] };
        const photos = data.photos || [];

        // Check if already exists to avoid dupes
        const exists = photos.some(p => p.publicId === PUBLIC_ID);
        if (!exists) {
            photos.push({
                publicId: PUBLIC_ID,
                caption: 'Very Nice!',
                altText: 'Borat Portfolio'
            });

            await galleryRef.update({ photos });
            console.log('SUCCESS: Added photo to gallery.');
        } else {
            console.log('Photo already in gallery.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

addToGallery();
