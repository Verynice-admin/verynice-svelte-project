import { adminDB } from './src/lib/server/firebaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    if (!adminDB) {
        console.log('No Admin DB');
        return;
    }
    try {
        const snap = await adminDB.collection('pages').doc('destinationsPage').get();
        console.log('Success - Document exists:', snap.exists);
    } catch (e) {
        console.error('FIREBASE_ERROR:', e.message);
    }
}
test();
