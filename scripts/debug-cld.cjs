const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function debug() {
    console.log('🛠️ Debugging Cloudinary...');

    try {
        // 1. Check Account Info
        const ping = await cloudinary.api.ping();
        console.log('✅ Ping:', ping);

        // 2. List the last 5 uploaded assets globally
        console.log('\n📅 Recent Uploads (Global):');
        const recent = await cloudinary.api.resources({
            type: 'upload',
            max_results: 5,
            direction: 'desc'
        });

        recent.resources.forEach(res => {
            console.log(`   - PublicID: ${res.public_id}`);
            console.log(`     URL: ${res.secure_url}`);
        });

        // 3. Specifically check the ak-bulak folder
        console.log('\n📂 Specific Folder Check: destinations/almaty/ak-bulak-ski-resort/');
        const folderCheck = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'destinations/almaty/ak-bulak-ski-resort/',
            max_results: 10
        });

        if (folderCheck.resources.length > 0) {
            console.log(`✅ Found ${folderCheck.resources.length} assets in this folder.`);
        } else {
            console.log('❌ No assets found in this folder via API.');
        }

    } catch (err) {
        console.error('❌ Error during debug:', err.message);
    }
}

debug();
