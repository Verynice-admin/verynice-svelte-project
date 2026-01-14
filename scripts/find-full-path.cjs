const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function findFullPath() {
    console.log('🕵️ Finding full path of charyn-canyon folder...');
    try {
        // Search for assets with charyn-canyon in the filename and check their public_id
        const search = await cloudinary.search
            .expression('charyn-canyon')
            .execute();

        console.log(`Found ${search.total_count} assets.`);
        search.resources.forEach(r => {
            console.log(`   - PublicID: ${r.public_id}`);
        });

        // Check if there are ANY assets in 'pages/destinations/almaty/charyn-canyon'
        const res = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'pages/destinations/almaty/charyn-canyon',
            max_results: 10
        });
        console.log(`\nPrefix "pages/destinations/almaty/charyn-canyon" has ${res.resources.length} assets.`);

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

findFullPath();
