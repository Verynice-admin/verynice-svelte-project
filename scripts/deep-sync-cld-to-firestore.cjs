const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Firebase Admin config
async function initFirebase() {
    if (admin.apps.length) return admin.firestore();

    let sa;
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saVar) {
        sa = JSON.parse(saVar);
    } else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }

    if (!sa) throw new Error('No Firebase service account found');

    admin.initializeApp({
        credential: admin.credential.cert(sa)
    });
    return admin.firestore();
}

function cleanCloudName(name) {
    return name.replace(/\s*&\s*/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[?%&#=]/g, '');
}

async function sync() {
    const db = await initFirebase();
    console.log('🚀 Starting Intelligent Sync of Cloudinary to Firestore...');

    const regionsRef = db.collection('pages').doc('destinationsPage').collection('articles');
    const regionsSnap = await regionsRef.get();

    for (const regionDoc of regionsSnap.docs) {
        const regionName = regionDoc.data().title;
        if (!regionName) continue;

        const cleanRegion = cleanCloudName(regionName);
        console.log(`\n📂 Region: ${regionName} -> Cloudinary path: content/pages/destinations/${cleanRegion}`);

        // Fetch all subfolders for this region once
        let subfolders = [];
        try {
            const folderRes = await cloudinary.api.sub_folders(`content/pages/destinations/${cleanRegion}`, { max_results: 100 });
            subfolders = folderRes.folders.map(f => f.name);
        } catch (e) {
            console.warn(`⚠️ Could not list subfolders for ${cleanRegion}: ${e.message}`);
            continue;
        }

        const attractionsRef = regionDoc.ref.collection('attractions');
        const attractionsSnap = await attractionsRef.get();

        for (const attractionDoc of attractionsSnap.docs) {
            const data = attractionDoc.data();
            const attractionSlug = attractionDoc.id;

            // Try to find the best matching folder
            // Matches: slug, slug with underscores, case-insensitive
            let bestMatch = subfolders.find(f => f.toLowerCase() === attractionSlug.toLowerCase());
            if (!bestMatch) {
                bestMatch = subfolders.find(f => f.toLowerCase().replace(/_/g, '-') === attractionSlug.toLowerCase().replace(/_/g, '-'));
            }
            if (!bestMatch) {
                bestMatch = subfolders.find(f => attractionSlug.toLowerCase().includes(f.toLowerCase()));
            }

            if (!bestMatch) {
                console.warn(`⚠️ No matching Cloudinary folder found for slug: ${attractionSlug}`);
                continue;
            }

            const cloudPath = `content/pages/destinations/${cleanRegion}/${bestMatch}`;

            try {
                // Fetch resources from Cloudinary for this folder
                const result = await cloudinary.api.resources({
                    type: 'upload',
                    prefix: cloudPath,
                    max_results: 100
                });

                if (result.resources && result.resources.length > 0) {
                    const sortedResources = result.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));
                    const photos = sortedResources.map(r => r.secure_url);
                    const mainImage = photos[0];

                    console.log(`✅ ${attractionSlug} -> ${bestMatch}: Found ${photos.length} photos.`);

                    const updates = {
                        photos: photos,
                        mainImage: mainImage,
                        headerBackgroundPublicId: mainImage,
                        heroImagePublicId: mainImage,
                    };

                    // Update 'image' as well
                    if (data.image && typeof data.image === 'object') {
                        updates.image = { ...data.image, publicId: mainImage, url: mainImage };
                    } else {
                        updates.image = mainImage;
                    }

                    await attractionDoc.ref.update(updates);
                } else {
                    console.warn(`⚠️ Folder exists but no resources found in: ${cloudPath}`);
                }
            } catch (err) {
                console.error(`❌ Error syncing ${attractionSlug}:`, err.message);
            }
        }
    }

    console.log('\n✨ Intelligent Sync Complete!');
}

sync().catch(console.error);
