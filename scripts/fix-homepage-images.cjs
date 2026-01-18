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

async function fixHomepageImages() {
    const db = await initFirebase();
    console.log('🚀 Fixing homepage images with valid Cloudinary assets...');

    // 1. Find a valid Caravanserai Image
    const karavanPrefix = 'content/pages/destinations/Turkistan_Shymkent/karavan-saray-center';
    const karavanRes = await cloudinary.api.resources({ type: 'upload', prefix: karavanPrefix, max_results: 5 });

    let karavanImage = 'content/pages/destinations/Turkistan_Shymkent/karavan-saray-center/main'; // Default fallback
    if (karavanRes.resources.length > 0) {
        karavanImage = karavanRes.resources[0].public_id;
        console.log(`✅ Found real Caravanserai image: ${karavanImage}`);
    } else {
        console.warn('⚠️ No Caravanserai images found! Using placeholder.');
    }

    // 2. Define Valid Hero Image (from previous scan)
    const heroImage = 'content/pages/destinations/Turkistan_Shymkent/sairam-ugam-national-park/sairam-ugam-national-park-01';

    // 3. Update Firestore
    const updates = {
        heroImagePublicId: heroImage,
        'featuredDestination.imagePublicId': karavanImage
    };

    await db.collection('pages').doc('homepage').update(updates);
    console.log('✨ Homepage Firestore document updated with valid image paths.');
}

fixHomepageImages().catch(console.error);
