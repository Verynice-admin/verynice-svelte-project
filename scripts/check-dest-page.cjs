const admin = require('firebase-admin');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function checkDestPage() {
    let serviceAccount;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
    try {
        if (saVar) {
            if (saVar.startsWith('{')) serviceAccount = JSON.parse(saVar);
            else if (fs.existsSync(path.resolve(saVar))) serviceAccount = JSON.parse(fs.readFileSync(path.resolve(saVar), 'utf8'));
        }
        if (!serviceAccount) throw new Error('No service account found.');
        if (serviceAccount.private_key?.includes('\\n')) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        const db = admin.firestore();

        const doc = await db.collection('pages').doc('destinationsPage').get();
        if (doc.exists) {
            console.log('--- destinationsPage Document ---');
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log('destinationsPage NOT FOUND');
        }

    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

checkDestPage();
