
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cloudinary Config (Hardcoded for script simplicity based on .env reading)
cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

function loadServiceAccount() {
    const secretsPaths = [
        path.resolve('.secrets/serviceAccountKey.json'),
        path.resolve('.secrets/service-account.json')
    ];

    for (const secretsPath of secretsPaths) {
        try {
            if (fs.existsSync(secretsPath)) {
                console.log(`Found service account at: ${secretsPath}`);
                return require(secretsPath);
            }
        } catch (error) {
            console.error('Error reading service account:', error);
        }
    }
    return null;
}

const IMAGE_PATH = "C:/Users/conta/.gemini/antigravity/brain/99bc6dac-445d-41b0-9ff1-bea85fc7d9d6/uploaded_image_1765808570135.png";
const PUBLIC_ID = 'content/pages/borat/mainimage';

async function updateBoratHeaderImage() {
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) {
        console.error('CRITICAL: No service account found.');
        return;
    }

    const app = initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore(app);

    console.log('--- Uploading Borat Header Image ---');

    // 1. Upload to Cloudinary
    try {
        console.log(`Uploading ${IMAGE_PATH} to Cloudinary as ${PUBLIC_ID}...`);

        const uploadResult = await cloudinary.uploader.upload(IMAGE_PATH, {
            public_id: PUBLIC_ID,
            overwrite: true,
            resource_type: 'image'
        });

        console.log('Cloudinary Upload Success:', uploadResult.public_id);
        console.log('Secure URL:', uploadResult.secure_url);

        // 2. Update Firestore
        console.log('Updating Firestore headers...');
        const pageRef = db.collection('pages').doc('boratPage');

        await pageRef.set({
            headerBackgroundPublicId: uploadResult.public_id
        }, { merge: true });

        console.log('SUCCESS: Updated headerBackgroundPublicId in Firestore.');

    } catch (error) {
        console.error('Error in upload/update process:', error);
    }
}

updateBoratHeaderImage();
