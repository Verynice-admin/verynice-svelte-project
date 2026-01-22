const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (assuming it's already initialized in the environment or we use default creds)
// We need to point to the service account if not automatic.
// For this environment, we usually check how other scripts do it.
// Looking at previous context, user has "scripts/find-almaty.cjs". Let's assume standard init.

var serviceAccount = require("c:\\Users\\conta\\Desktop\\projects\\verynice\\verynice-admin-firebase-adminsdk-45c1a-7b3af2138e.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function inspectRelatedPosts() {
    console.log('Inspecting pages/historyPage/relatedPosts...');
    const snapshot = await db.collection('pages').doc('historyPage').collection('relatedPosts').get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    snapshot.forEach(doc => {
        console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));
    });

    console.log('\n--- Checking for Attractions (to see if they are better) ---');
    const attractionsSnap = await db.collectionGroup('attractions').limit(5).get();
    attractionsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Attraction [${doc.id}]:`, {
            title: data.title,
            image: data.image,
            images: data.images,
            mainImage: data.mainImage
        });
    });
}

inspectRelatedPosts().catch(console.error);
