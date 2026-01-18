
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { ServiceAccount as FirebaseServiceAccount } from 'firebase-admin/app';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// --- Firebase Init Logic (Copied and Adapted) ---
let app: App | undefined;
let db: Firestore | null = null;

interface ServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

function loadServiceAccount(): ServiceAccount | null {
    // Use PROJECT_ROOT to resolve paths correctly
    const secretsPaths = [
        path.resolve(PROJECT_ROOT, '.secrets/serviceAccountKey.json'),
        path.resolve(PROJECT_ROOT, '.secrets/service-account.json')
    ];

    for (const secretsPath of secretsPaths) {
        console.log(`Checking path: ${secretsPath}, exists: ${fs.existsSync(secretsPath)}`);
        try {
            if (fs.existsSync(secretsPath)) {
                const sa: ServiceAccount = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
                if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
                    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
                }
                return sa;
            }
        } catch (error) {
        }
    }

    const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (filePath) {
        try {
            const abs = path.resolve(PROJECT_ROOT, filePath);
            if (fs.existsSync(abs)) {
                const sa: ServiceAccount = JSON.parse(fs.readFileSync(abs, 'utf8'));
                if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
                    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
                }
                return sa;
            }
        } catch (error) {
        }
    }

    const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
    if (jsonStr) {
        try {
            const sa: ServiceAccount = JSON.parse(jsonStr);
            if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            return sa;
        } catch (error) {
        }
    }

    const rootPaths = [
        path.resolve(PROJECT_ROOT, 'serviceAccountKey.json'),
        path.resolve(PROJECT_ROOT, 'service-account.json')
    ];

    for (const rootPath of rootPaths) {
        try {
            if (fs.existsSync(rootPath)) {
                const sa: ServiceAccount = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
                if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
                    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
                }
                return sa;
            }
        } catch (error) {
        }
    }

    return null;
}

// Initialize Firebase
if (!getApps().length) {
    const sa = loadServiceAccount();
    if (sa) {
        app = initializeApp({
            credential: cert(sa as FirebaseServiceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || sa.project_id
        });
        db = getFirestore(app);
        console.log('[Firebase Admin] Initialized successfully');
    } else {
        console.error('[Firebase Admin] No service account found.');
    }
} else {
    app = getApps()[0];
    db = getFirestore(app);
}
// ------------------------------------------------

// Define the root backup directory
const BACKUP_ROOT = path.resolve(PROJECT_ROOT, 'backups/Verynice_stock_photos');

// Region Directory to ID Mapping
const REGION_MAPPING: Record<string, string> = {
    'Almaty_&_Nearby': 'section-almaty-and-nearby',
    'Astana_&_Nearby': 'section-astana-and-nearby',
    'East_Kazakhstan': 'section-east-kazakhstan',
    'Mangystau_Region': 'section-mangystau-region',
    'Turkistan_&_Shymkent': 'section-turkistan-and-shymkent',
    'Other_Attractions': 'section-other-attractions'
};

async function restoreBackup() {
    if (!db) {
        console.error('Firebase Admin not ready.');
        return;
    }
    const adminDB = db;

    console.log(`Starting restoration from: ${BACKUP_ROOT}`);

    if (!fs.existsSync(BACKUP_ROOT)) {
        console.error(`Backup directory not found: ${BACKUP_ROOT}`);
        return;
    }

    const regionDirs = fs.readdirSync(BACKUP_ROOT);

    for (const regionDir of regionDirs) {
        const regionPath = path.join(BACKUP_ROOT, regionDir);

        // Skip hidden files/non-directories
        if (!fs.statSync(regionPath).isDirectory() || regionDir.startsWith('.')) continue;

        const regionId = REGION_MAPPING[regionDir];
        if (!regionId) {
            console.warn(`No mapping found for region directory: ${regionDir}. Skipping.`);
            continue;
        }

        console.log(`Processing Region: ${regionDir} -> ${regionId}`);

        const attractionDirs = fs.readdirSync(regionPath);

        for (const attractionDir of attractionDirs) {
            const attractionPath = path.join(regionPath, attractionDir);
            const dataFile = path.join(attractionPath, 'data.json');

            if (!fs.existsSync(dataFile)) {
                continue;
            }

            try {
                const fileContent = fs.readFileSync(dataFile, 'utf8');
                const backupData = JSON.parse(fileContent);

                const attractionId = backupData.main?.id || attractionDir;

                // Construct Firestore Path
                const docPath = `pages/destinationsPage/articles/${regionId}/attractions/${attractionId}`;
                const docRef = adminDB.doc(docPath);

                console.log(`  Restoring: ${attractionId}`);

                const batch = adminDB.batch();

                // 1. Restore Main Document Data
                if (backupData.main) {
                    batch.set(docRef, backupData.main);
                }

                // 2. Handle Subcollections
                if (backupData.subcollections) {
                    const subcollections = ['articles', 'keyFacts', 'video', 'map', 'faq', 'photoGallery', 'relatedPosts'];

                    for (const subColName of subcollections) {
                        if (backupData.subcollections[subColName]) {
                            const subColRef = docRef.collection(subColName);

                            // A. Delete existing documents
                            const existingDocs = await subColRef.listDocuments();
                            for (const existingDoc of existingDocs) {
                                batch.delete(existingDoc);
                            }

                            // B. Add new documents
                            const items = backupData.subcollections[subColName];
                            if (Array.isArray(items) && items.length > 0) {
                                items.forEach((item: any, index: number) => {
                                    let itemId = item.id || item.articleId || `${subColName}-${index}`;

                                    if (subColName === 'map' || subColName === 'video' || subColName === 'faq' || subColName === 'photoGallery') {
                                        if (!item.id || item.id === undefined) itemId = 'main';
                                        else itemId = item.id;
                                    }

                                    const itemRef = subColRef.doc(itemId);
                                    batch.set(itemRef, item);
                                });
                            }
                        }
                    }
                }

                await batch.commit();
                console.log(`    Success: ${attractionId}`);

            } catch (err) {
                console.error(`    Error restoring ${attractionDir}:`, err);
            }
        }
    }
    console.log('Restoration Complete.');
}

restoreBackup().catch(console.error);
