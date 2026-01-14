const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function verify() {
    console.log('🕵️ Verifying exact asset locations...');
    try {
        // Search specifically for assets in the pages/destinations/almaty/ak-bulak-ski-resort/ folder
        const folder = 'pages/destinations/almaty/ak-bulak-ski-resort';
        console.log(`Checking folder: ${folder}`);

        const resources = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder + '/',
            max_results: 50
        });

        console.log(`Found ${resources.resources.length} assets in ${folder}.`);
        resources.resources.slice(0, 5).forEach(r => {
            console.log(`   - PublicID: ${r.public_id}`);
        });

        // Search for Charyn Canyon too
        const charynFolder = 'pages/destinations/almaty/charyn-canyon';
        const charynResources = await cloudinary.api.resources({
            type: 'upload',
            prefix: charynFolder + '/',
            max_results: 10
        });
        console.log(`Found ${charynResources.resources.length} assets in ${charynFolder}.`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

verify();
