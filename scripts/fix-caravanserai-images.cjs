const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function initFirebase() {
    if (admin.apps.length) return admin.firestore();
    const saVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    let sa;
    if (saVar) sa = JSON.parse(saVar);
    else if (fs.existsSync(path.resolve('.secrets/serviceAccountKey.json'))) {
        sa = JSON.parse(fs.readFileSync(path.resolve('.secrets/serviceAccountKey.json'), 'utf8'));
    }
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
}

async function fixCaravanserai() {
    const db = await initFirebase();
    const attractionId = 'caravanserai-turkistan';
    const regionId = 'section-turkistan-and-shymkent';
    const cloudPath = 'content/pages/destinations/Turkistan_Shymkent/karavan-saray-center';

    console.log(`🚀 Fixing images for ${attractionId}...`);

    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: cloudPath,
            max_results: 100
        });

        if (result.resources && result.resources.length > 0) {
            const sortedResources = result.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));
            const photos = sortedResources.map(r => r.secure_url);
            const mainImage = photos[0];

            console.log(`✅ Found ${photos.length} photos in ${cloudPath}`);

            const docRef = db.collection('pages').doc('destinationsPage').collection('articles').doc(regionId).collection('attractions').doc(attractionId);
            const doc = await docRef.get();

            if (!doc.exists) {
                console.error(`❌ Firestore document ${attractionId} not found in region ${regionId}`);
                return;
            }

            const data = doc.data();
            const updates = {
                photos: photos,
                mainImage: mainImage,
                headerBackgroundPublicId: mainImage,
                heroImagePublicId: mainImage,
            };

            if (data.image && typeof data.image === 'object') {
                updates.image = { ...data.image, publicId: mainImage, url: mainImage };
            } else {
                updates.image = mainImage;
            }

            await docRef.update(updates);
            console.log(`✨ Successfully updated Firestore for ${attractionId}`);
        } else {
            console.warn(`⚠️ No resources found in Cloudinary path: ${cloudPath}`);
        }
    } catch (err) {
        console.error(`❌ Error:`, err.message);
    }
}

fixCaravanserai().catch(console.error);
