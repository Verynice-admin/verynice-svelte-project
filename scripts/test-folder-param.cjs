const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function testFolderUpload() {
    console.log('🧪 Testing upload using "folder" parameter instead of Public ID path...');

    const testFile = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos\\Almaty_&_nearby\\charyn-canyon\\charyn-canyon-01.jpg';

    try {
        const res = await cloudinary.uploader.upload(testFile, {
            folder: 'pages/destinations/almaty/charyn-canyon',
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });
        console.log(`✅ Uploaded to folder param: ${res.secure_url}`);
        console.log(`   Public ID created: ${res.public_id}`);
    } catch (e) {
        console.log(`❌ Failed: ${e.message}`);
    }
}

testFolderUpload();
