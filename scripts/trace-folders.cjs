const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function findFolder() {
    console.log('🕵️ Searching for folder hierarchy...');
    try {
        // Try to list folders globally
        const folders = await cloudinary.api.root_folders();
        console.log('Root Folders:', folders.folders.map(f => f.name));

        // Let's try to get folder info for 'pages' specifically
        try {
            const info = await cloudinary.api.sub_folders('pages');
            console.log('✅ Found pages as root sub_folder? (Wait, if it was not in root_folders, this might fail)');
        } catch (e) {
            console.log('❌ "pages" is not a direct sub_folder identifiable by name at root.');
        }

        // Let's search for ANY folder named 'pages'
        console.log('\n🔎 Listing subfolders of ALL roots...');
        for (const root of folders.folders) {
            const sub = await cloudinary.api.sub_folders(root.path);
            console.log(`Subfolders of ${root.name}:`, sub.folders.map(sf => sf.name));
            if (sub.folders.some(sf => sf.name === 'pages')) {
                console.log(`🎯 FOUND IT: "pages" is inside "${root.name}"`);
            }
        }

        // Let's try to check the "Media Library" folders using the Search API for paths
        const search = await cloudinary.search
            .expression('resource_type:image')
            .max_results(500)
            .execute();

        const paths = new Set();
        search.resources.forEach(r => {
            const dir = r.public_id.split('/').slice(0, -1).join('/');
            if (dir) paths.add(dir);
        });

        console.log('\n🗺️  Existing Public ID Paths:');
        Array.from(paths).sort().forEach(p => console.log(`   - ${p}`));

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

findFolder();
