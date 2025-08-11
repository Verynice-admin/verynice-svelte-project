// generate_plan.js (UPGRADED to handle all URL types)
import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';

// --- SETUP ---
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json'));

// List of all top-level collections you want to scan.
const COLLECTIONS_TO_SCAN = ['pages', 'authors', 'pageSpecificContent'];

// ✅ DEFINE YOUR RENAMING RULES HERE ✅
// The script will use these rules to predict the new path.
const TRANSFORMATION_RULES = {
    // Old Cloudinary Folder Path                  // New Clean Path
    'assets/images/about/':                        'content/pages/about/',
    'assets/images/history_page_images/':          'content/pages/history/',
    'assets/images/history/':                      'content/pages/history/',
    'author/':                                     'content/authors/',
    'assets/images/authors/':                      'content/authors/',
};

// --- SCRIPT LOGIC (ADVANCED) ---

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// This will hold all unique old IDs we find.
const uniqueOldIds = new Set();

// Regular expression to find Cloudinary URLs inside HTML or strings.
const cloudinaryUrlRegex = /https:\/\/res\.cloudinary\.com\/[a-z0-9]+\/image\/upload\/v[0-9]+\/([^"'>\s]+)/g;

/**
 * Extracts the publicId from a full Cloudinary URL.
 * e.g., "https://.../upload/v123/path/to/image.webp" becomes "path/to/image.webp"
 */
function extractPublicIdFromUrl(url) {
    const match = url.match(/\/upload\/v\d+\/(.*)/);
    return match ? match[1] : null;
}

/**
 * Recursively search an object or array for image IDs and URLs.
 */
function findIdsInData(data) {
    if (!data) return;

    // If data is an array, iterate through its items
    if (Array.isArray(data)) {
        for (const item of data) {
            findIdsInData(item);
        }
        return;
    }

    // If data is an object, iterate through its keys
    if (typeof data === 'object') {
        for (const key in data) {
            const value = data[key];
            if (typeof value === 'string') {
                // Case 1: Field is a publicId
                if (key.endsWith('PublicId') && value) {
                    uniqueOldIds.add(value);
                }
                // Case 2: Field is a full URL
                else if (key.endsWith('Url') && value.includes('res.cloudinary.com')) {
                    const extractedId = extractPublicIdFromUrl(value);
                    if (extractedId) uniqueOldIds.add(extractedId);
                }
                // Case 3: Field is HTML content with embedded URLs
                else if (key.endsWith('HTML') || key.endsWith('answer')) {
                    let match;
                    while ((match = cloudinaryUrlRegex.exec(value)) !== null) {
                        uniqueOldIds.add(match[1]);
                    }
                }
            } else {
                // If the value is another object or array, search inside it
                findIdsInData(value);
            }
        }
    }
}

/**
 * Generates the new, clean ID based on the transformation rules.
 */
function generateNewId(oldId) {
    // First, remove any potential URL encoding like %C3%A9
    const decodedId = decodeURIComponent(oldId);
    
    for (const oldPrefix in TRANSFORMATION_RULES) {
        if (decodedId.startsWith(oldPrefix)) {
            const newPrefix = TRANSFORMATION_RULES[oldPrefix];
            const filenameWithExt = decodedId.substring(oldPrefix.length);
            const filenameWithoutExt = filenameWithExt.replace(/\.(webp|jpg|png|jpeg|gif|svg)$/, "");
            return newPrefix + filenameWithoutExt;
        }
    }
    // If no rule matched, it might already be in the new format or is an anomaly.
    return removeExtension(decodedId); // Return the cleaned-up original.
}

function removeExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

async function createMigrationPlan() {
    console.log('--- 🗺️  Generating COMPLETE Migration Plan... ---');

    for (const collectionName of COLLECTIONS_TO_SCAN) {
        console.log(`\n🔎 Scanning collection: "${collectionName}"...`);
        try {
            const snapshot = await db.collection(collectionName).get();
            if (snapshot.empty) {
                console.log(`- No documents found.`);
                continue;
            }

            for (const doc of snapshot.docs) {
                console.log(`  -> Processing doc: ${doc.id}`);
                const docData = doc.data();
                findIdsInData(docData); // Find IDs in the main document

                // Now, let's also scan subcollections like 'sections'
                const subcollections = await doc.ref.listCollections();
                for (const subcollectionRef of subcollections) {
                    console.log(`    -> Scanning subcollection: ${subcollectionRef.id}`);
                    const subSnapshot = await subcollectionRef.get();
                    for(const subDoc of subSnapshot.docs) {
                        findIdsInData(subDoc.data());
                    }
                }
            }
        } catch (error) {
            console.error(`\n❌ Error fetching from collection "${collectionName}":`, error);
        }
    }

    const migrationPlan = Array.from(uniqueOldIds).map(oldId => ({
        oldId: oldId,
        newId: generateNewId(oldId)
    }));

    const outputFile = 'migration-plan.json';
    writeFileSync(outputFile, JSON.stringify(migrationPlan, null, 2));

    console.log(`\n\n--- ✅ Success! ---`);
    console.log(`- Found ${migrationPlan.length} unique image IDs across all data structures.`);
    console.log(`- Your complete migration plan has been saved to: ${outputFile}`);
}

createMigrationPlan();