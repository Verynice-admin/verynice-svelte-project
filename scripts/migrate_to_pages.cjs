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

async function migrateCollection(rootName, pageId, subName) {
    console.log(`Migrating ${rootName} -> pages/${pageId}/${subName}...`);
    const rootRef = db.collection(rootName);
    const targetRef = db.collection('pages').doc(pageId).collection(subName);

    const snap = await rootRef.get();
    if (snap.empty) {
        console.log(` - Source collection '${rootName}' is empty or does not exist. Skipping.`);
        return;
    }

    const batchSize = 400;
    let batch = db.batch();
    let count = 0;
    let total = 0;

    for (const doc of snap.docs) {
        const newDocRef = targetRef.doc(doc.id);
        batch.set(newDocRef, doc.data());

        // Also create the page doc if it doesn't exist (just in case)
        // Actually we should separate this, but set merge true on page doc is fine.
        // However, batch limits apply.

        count++;
        total++;
        if (count >= batchSize) {
            await batch.commit();
            console.log(` - Committed ${count} docs...`);
            batch = db.batch();
            count = 0;
        }
    }

    if (count > 0) {
        await batch.commit();
    }

    // Create/Update the parent page doc to ensure it exists
    await db.collection('pages').doc(pageId).set({
        id: pageId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(` - Successfully migrated ${total} documents.`);
}

async function run() {
    await migrateCollection('attractions', 'attractionsPage', 'attractions');
    await migrateCollection('tips', 'travelTipsPage', 'tips');
    await migrateCollection('travelTips', 'travelTipsPage', 'tips'); // Check alt name
    await migrateCollection('restaurants', 'restaurantsPage', 'restaurants');
}

run().then(() => {
    console.log("Migration complete.");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
