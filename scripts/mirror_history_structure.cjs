const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const possibleKeys = [
    'service-account-key.json',
    'config/service-account-key.json',
    '../service-account-key.json',
    '../config/service-account-key.json'
];

let serviceAccount = null;
for (const keyPath of possibleKeys) {
    const fullPath = path.resolve(__dirname, '..', keyPath);
    if (fs.existsSync(fullPath)) {
        serviceAccount = require(fullPath);
        console.log(`Found service account key at: ${fullPath}`);
        break;
    }
}

if (!serviceAccount) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) { }
    }
}

if (!serviceAccount) {
    console.error('Error: Could not find service-account-key.json');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function mirrorHistoryToAttractions() {
    console.log("Reading pages/historyPage to get structure...");
    const historyDoc = await db.collection('pages').doc('historyPage').get();

    if (!historyDoc.exists) {
        console.error("History page source not found!");
        return;
    }

    const historyData = historyDoc.data();
    console.log("History Data Keys:", Object.keys(historyData));

    // Construct Attractions Data mirroring the structure
    const attractionsData = {
        // Identity
        id: 'attractionsPage',
        category: 'attractions',

        // Metadata
        mainTitle: 'Attractions',
        headerDescription: "An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity to help you plan your perfect trip.",
        headerBackgroundPublicId: 'content/pages/attractions/main_image', // REQUESTED IMAGE
        headerBackgroundImageAriaLabel: 'Kazakhstan landscape with mountains',

        // Metrics (Initialized)
        articleLikes: 150,
        articleViews: 1200,
        articleComments: 5,
        estimatedReadTime: 'Varied duration',

        // SEO & Nav
        seo: {
            title: 'Attractions | VeryNice.kz',
            description: "Discover the best tourist attractions in Kazakhstan, from Almaty mountains to the Caspian Sea."
        },
        breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Attractions', href: '/attractions' }
        ],

        // Author (Defaulting to same as history or generic official)
        authorId: historyData.authorId || 'verynice-official',

        // Timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        publishDate: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log("Writing to pages/attractionsPage...");
    await db.collection('pages').doc('attractionsPage').set(attractionsData, { merge: true });
    console.log("Successfully mirrored structure and updated main image.");
}

mirrorHistoryToAttractions().catch(console.error).then(() => process.exit());
