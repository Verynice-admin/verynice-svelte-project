
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

function initFirebase() {
    if (getApps().length > 0) return getFirestore();
    const serviceAccountPath = path.join(PROJECT_ROOT, '.secrets', 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`Service account not found at ${serviceAccountPath}`);
        process.exit(1);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    initializeApp({ credential: cert(serviceAccount) });
    return getFirestore();
}

const db = initFirebase();

async function updateVideo() {
    console.log('Updating homepage video...');
    await db.collection('pages').doc('homepage').set({
        featuredVideoUrl: 'https://youtu.be/pssnBA7-f98?si=OBk1YVHKTHoDXOUd'
    }, { merge: true });
    console.log('Homepage video updated successfully.');
}

updateVideo().catch(console.error);
