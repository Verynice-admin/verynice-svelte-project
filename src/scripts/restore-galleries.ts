
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// --- Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

// --- Firebase Init ---
function initFirebase() {
    if (getApps().length > 0) return getFirestore();

    const serviceAccountPath = path.join(PROJECT_ROOT, '.secrets', 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`Service account not found at ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    initializeApp({
        credential: cert(serviceAccount)
    });
    return getFirestore();
}

const db = initFirebase();

// --- Main Logic ---

const REGION_MAP: Record<string, string> = {
    'Turkistan_Shymkent': 'section-turkistan-and-shymkent',
    'Mangystau_Region': 'section-mangystau-region',
    'East_Kazakhstan': 'section-east-kazakhstan',
    'Astana_Nearby': 'section-astana-and-nearby',
    'Other_Attractions': 'section-other-attractions',
    'Almaty_nearby': 'section-almaty-and-nearby', // Verified Lowercase 'n'
    'Almaty_Nearby': 'section-almaty-and-nearby', // Safe Fallback
    'Almaty_&_Nearby': 'section-almaty-and-nearby' // Legacy/Local folder fallback
};

async function restoreGalleries() {
    console.log('Reading Cloudinary dump...');
    const dumpPath = path.join(PROJECT_ROOT, 'cloudinary_dump.json');

    if (!fs.existsSync(dumpPath)) {
        console.error('cloudinary_dump.json not found!');
        return;
    }

    const images = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    console.log(`Loaded ${images.length} images.`);

    // Group by asset folder
    const groups: Record<string, any[]> = {};
    images.forEach((img: any) => {
        if (img.asset_folder && img.asset_folder.includes('/destinations/')) {
            if (!groups[img.asset_folder]) groups[img.asset_folder] = [];
            groups[img.asset_folder].push(img);
        }
    });

    console.log(`Found ${Object.keys(groups).length} unique destination folders.`);

    const batchSize = 100;
    let batch = db.batch();
    let counter = 0;
    let totalUpdated = 0;

    for (const [folder, folderImages] of Object.entries(groups)) {
        // Parse folder path
        // Expected: content/pages/destinations/<Region>/<AttractionID>
        const parts = folder.split('/');
        // parts should be [content, pages, destinations, Region, AttractionID]

        let regionPart = '';
        let attractionId = '';

        const destIndex = parts.indexOf('destinations');
        if (destIndex !== -1 && parts.length > destIndex + 2) {
            regionPart = parts[destIndex + 1];
            attractionId = parts[destIndex + 2];
        } else {
            console.warn(`Skipping malformed folder: ${folder}`);
            continue;
        }

        // Resolve Region ID
        let regionId = REGION_MAP[regionPart];

        // Dynamic check for Almaty variants or other unmapped regions
        if (!regionId) {
            if (regionPart.includes('Almaty')) regionId = 'section-almaty-and-nearby';
            else {
                console.warn(`Unknown region '${regionPart}' in folder ${folder}. Skipping.`);
                continue;
            }
        }

        const firestorePath = `pages/destinationsPage/articles/${regionId}/attractions/${attractionId}`;
        const galleryDocRef = db.doc(`${firestorePath}/photoGallery/main`);
        const attractionDocRef = db.doc(firestorePath);

        // Find best hero image (largest file size usually implies high res)
        folderImages.sort((a, b) => b.bytes - a.bytes);
        const bestHero = folderImages[0];

        // Re-sort alphanumerically for the gallery display order
        folderImages.sort((a, b) => (a.public_id || '').localeCompare(b.public_id || ''));

        // Construct Gallery Photos
        const galleryPhotos = folderImages.slice(0, 30).map((img, index) => ({
            imageUrl: img.secure_url,
            thumbnailUrl: img.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/'),
            altText: img.display_name || `${attractionId} photo ${index + 1}`,
            caption: '', // No caption available in cloudinary dump usually
            id: `photo-${index}` // Add simple ID for uniqueness
        }));

        if (galleryPhotos.length === 0) continue;

        // Add to batch: Update Gallery
        batch.set(galleryDocRef, {
            id: 'main',
            title: 'Photo Gallery',
            photos: galleryPhotos
        });

        // Add to batch: Update Main Attraction Document with Hero Image
        if (bestHero) {
            // Note: We use update() so we don't overwrite other fields. 
            // If the document doesn't exist (unlikely given we are traversing existing folders), this might fail, 
            // but in this context (syncing properties), set({ ... }, { merge: true }) is safer if we weren't sure.
            // Given the previous steps ensured existence, update is fine. 
            // Actually, let's use set with merge to be 100% safe against "document not found".
            batch.set(attractionDocRef, {
                headerBackgroundPublicId: bestHero.public_id
            }, { merge: true });
        }

        counter++;
        totalUpdated++;

        if (counter >= batchSize) {
            await batch.commit();
            console.log(`Committed batch of ${counter} galleries.`);
            batch = db.batch();
            counter = 0;
        }
    }

    if (counter > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${counter} galleries.`);
    }

    console.log(`Completed restoration. specific totalUpdated: ${totalUpdated}`);
}

restoreGalleries().catch(console.error);
