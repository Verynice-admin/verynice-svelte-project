const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function findThem() {
    console.log('🕵️ Searching for all folders at root...');
    try {
        const root = await cloudinary.api.root_folders();
        console.log('API Root Folders:', root.folders.map(f => f.path));

        for (const f of root.folders) {
            const sub = await cloudinary.api.sub_folders(f.path);
            console.log(`Subfolders of ${f.path}:`, sub.folders.map(sf => sf.path));
        }

        // Let's try to search by and expression for ANY assets in 'almaty'
        console.log('\n🔎 Searching for any assets with "almaty" in path...');
        const search = await cloudinary.search
            .expression('almaty')
            .execute();

        console.log(`Found ${search.total_count} assets total for "almaty".`);
        search.resources.slice(0, 5).forEach(r => {
            console.log(`   - ${r.public_id}`);
        });

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

findThem();
