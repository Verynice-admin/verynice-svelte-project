const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function testUpload() {
    console.log('🧪 Running Test Upload to exact path user is looking at...');

    // Use an existing small image
    const testFile = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos\\Almaty_&_nearby\\ak-bulak-ski-resort\\ak-bulak-ski-resort-01.jpeg';

    // Path 1: destinations/... (What I did)
    // Path 2: pages/destinations/... (What the sidebar suggests)
    // Path 3: content/destinations/... (What the other sidebar part suggests)

    const targets = [
        'destinations/almaty/ak-bulak-ski-resort/debug-test-root',
        'pages/destinations/almaty/ak-bulak-ski-resort/debug-test-pages',
        'content/destinations/almaty/ak-bulak-ski-resort/debug-test-content'
    ];

    for (const target of targets) {
        try {
            const res = await cloudinary.uploader.upload(testFile, {
                public_id: target,
                overwrite: true
            });
            console.log(`✅ Uploaded to ${target}: ${res.secure_url}`);
        } catch (e) {
            console.log(`❌ Failed to upload to ${target}: ${e.message}`);
        }
    }
}

testUpload();
