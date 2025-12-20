const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
// Try to find service account key
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
    // Try env var
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            console.log('Found service account key in environment variable');
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
        }
    }
}

if (!serviceAccount) {
    console.error('Error: Could not find service-account-key.json. Please ensure it exists in the root or config directory, or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function updateAttractionsPageData() {
    const docRef = db.collection('pages').doc('attractionsPage'); // Standard ID convention

    const pageData = {
        mainTitle: 'Attractions',
        headerDescription: "An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity to help you plan your perfect trip.",
        headerBackgroundPublicId: 'content/pages/attractions/main_image', // USER REQUESTED ID
        headerBackgroundImageAriaLabel: 'Kazakhstan landscape',

        // SEO Defaults (matching typical structure)
        seo: {
            title: 'Attractions | VeryNice.kz',
            description: "An organized guide to Kazakhstan's highlights, grouped by region and ranked by traveler popularity."
        },

        // Breadcrumbs
        breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Attractions', href: '/attractions' }
        ],

        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    try {
        await docRef.set(pageData, { merge: true });
        console.log('Successfully updated pages/attractionsPage with new main image and metadata.');
    } catch (error) {
        console.error('Error updating document:', error);
    }
}

updateAttractionsPageData().then(() => {
    console.log("Done.");
    process.exit(0);
});
