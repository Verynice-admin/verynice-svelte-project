const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../.secrets/serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account key not found at:', serviceAccountPath);
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function inspectHistoryPage() {
    console.log('Inspecting pages/historyPage...');

    try {
        const docRef = db.collection('pages').doc('historyPage');
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log('No such document!');
            return;
        }

        const data = docSnap.data();
        console.log('--- Document Data ---');
        console.log(JSON.stringify(data, null, 2));

        // Check subcollections
        const collections = await docRef.listCollections();
        for (const col of collections) {
            console.log(`\n--- Subcollection: ${col.id} ---`);
            const snapshot = await col.get();
            snapshot.forEach(doc => {
                console.log(`ID: ${doc.id}`);
                console.log(JSON.stringify(doc.data(), null, 2));
            });
        }

    } catch (error) {
        console.error('Error getting document:', error);
    }
}

inspectHistoryPage();
