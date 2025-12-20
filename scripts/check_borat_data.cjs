
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

async function checkBoratData() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return;

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Checking Borat Page Data ---');

    // Check Page
    const pageSnap = await db.collection('pages').doc('boratPage').get();
    const pageData = pageSnap.data();
    console.log('Page Header ID:', pageData.headerBackgroundPublicId);
    console.log('Page Location:', pageData.location);
    console.log('Page Title:', pageData.mainTitle);

    // Check Author
    const authorSnap = await db.collection('authors').doc('verynice-official').get();
    console.log('Author Profile ID:', authorSnap.data().profilePicturePublicId);

    // Check Photo Gallery Subcollection
    const gallerySnap = await db.collection('pages').doc('boratPage').collection('photoGallery').get();
    console.log('Photo Gallery Docs:', gallerySnap.size);
    gallerySnap.forEach(doc => {
        console.log(' - Doc ID:', doc.id, 'Data:', doc.data());
    });
}

checkBoratData();
