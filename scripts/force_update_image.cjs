const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin (TRYING .secrets DIRECT PATH)
// Previously failed because we were looking in root or config/
// The TypeScript file showed it's actually in .secrets/

const secretsPath = path.resolve(__dirname, '..', '.secrets', 'serviceAccountKey.json');
console.log('Trying secrets path:', secretsPath);

let serviceAccount = null;

if (fs.existsSync(secretsPath)) {
    serviceAccount = require(secretsPath);
    console.log('Found service account in .secrets');
} else {
    // Fallback to strict path
    const altPath = path.resolve(__dirname, '..', '.secrets', 'service-account.json');
    if (fs.existsSync(altPath)) {
        serviceAccount = require(altPath);
        console.log('Found alt service account in .secrets');
    }
}

if (!serviceAccount) {
    console.error('CRITICAL: Could not find service account!');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function setAttractionImage() {
    const docRef = db.collection('pages').doc('attractionsPage');

    // Force update the field
    await docRef.set({
        headerBackgroundPublicId: 'content/pages/attractions/main_image',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("SUCCESS: Updated headerBackgroundPublicId to 'content/pages/attractions/main_image'");

    // Verify
    const snap = await docRef.get();
    console.log("Current Value in DB:", snap.data().headerBackgroundPublicId);
}

setAttractionImage().catch(console.error).then(() => process.exit());
