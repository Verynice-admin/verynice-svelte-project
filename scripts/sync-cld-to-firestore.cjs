const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const CLOUDINARY_BASE = 'content/pages/destinations';

function cleanCloudName(name) {
    return name.replace(/[&?=%\s#]/g, '_').replace(/_+/g, '_');
}

async function updateLinks() {
    console.log('🚀 Starting Cloudinary Link Update (Firestore -> Cloudinary)...');

    let serviceAccount;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;

    try {
        if (saVar) {
            if (saVar.startsWith('{')) serviceAccount = JSON.parse(saVar);
            else if (fs.existsSync(path.resolve(saVar))) serviceAccount = JSON.parse(fs.readFileSync(path.resolve(saVar), 'utf8'));
        }
        if (!serviceAccount) {
            const commonPaths = [path.resolve('.secrets/serviceAccountKey.json'), path.resolve('serviceAccountKey.json')];
            for (const p of commonPaths) if (fs.existsSync(p)) { serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8')); break; }
        }
        if (!serviceAccount) throw new Error('No service account found.');
        if (serviceAccount.private_key?.includes('\\n')) serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        const db = admin.firestore();

        // 1. Get regions (articles under destinationsPage)
        const regionsSnap = await db.collection('pages').doc('destinationsPage').collection('articles').get();
        console.log(`Found ${regionsSnap.docs.length} regions.`);

        for (const regionDoc of regionsSnap.docs) {
            const regionData = regionDoc.data();
            const regionId = regionDoc.id; // e.g. "almaty", "astana"
            const regionTitle = regionData.title || regionId;

            // Cleaned region name to match Cloudinary folder
            // Almaty & Nearby -> Almaty_nearby
            const cloudRegion = cleanCloudName(regionTitle);
            const folderPrefix = `${CLOUDINARY_BASE}/${cloudRegion}`;

            console.log(`\n🌎 Processing Region: ${regionTitle} (Cloud Folder: ${folderPrefix})`);

            const attractionsSnap = await regionDoc.ref.collection('attractions').get();
            console.log(`   Found ${attractionsSnap.docs.length} attractions.`);

            for (const attractionDoc of attractionsSnap.docs) {
                const attractionId = attractionDoc.id; // slug
                const cloudAttraction = cleanCloudName(attractionId);
                const attractionFolder = `${folderPrefix}/${cloudAttraction}`;

                console.log(`   🔎 Checking photos for: ${attractionId} in ${attractionFolder}...`);

                try {
                    // Fetch all resources in this attraction's folder
                    const result = await cloudinary.api.resources({
                        type: 'upload',
                        prefix: attractionFolder,
                        max_results: 50
                    });

                    if (result.resources.length > 0) {
                        const photos = result.resources.map(res => res.secure_url);

                        // Update the attraction doc with the new photos array
                        await attractionDoc.ref.update({
                            photos: photos,
                            // Optionally set the first image as the main image if it exists
                            mainImage: photos[0] || attractionDoc.data().mainImage || ''
                        });
                        console.log(`      ✅ Updated ${attractionId} with ${photos.length} photos.`);
                    } else {
                        console.log(`      ⚠️ No photos found in Cloudinary for ${attractionId}.`);
                    }
                } catch (cldErr) {
                    console.error(`      ❌ Cloudinary error for ${attractionId}:`, cldErr.message);
                }
            }
        }

        console.log('\n✅ ALL LINKS UPDATED SUCCESSFULLY!');
    } catch (err) {
        console.error('💥 Fatal error:', err.message);
    }
}

updateLinks();
