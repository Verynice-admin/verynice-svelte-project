const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function listAll() {
    console.log('📂 Listing all folders and some assets...');
    try {
        const folders = await cloudinary.api.root_folders();
        console.log('Root Folders:', folders.folders.map(f => f.name));

        for (const root of folders.folders) {
            try {
                const sub = await cloudinary.api.sub_folders(root.path);
                console.log(`   Folder "${root.name}" has subfolders:`, sub.folders.map(f => f.name));
                for (const s of sub.folders) {
                    try {
                        const ss = await cloudinary.api.sub_folders(s.path);
                        console.log(`      Subfolder "${s.name}" has sub-subfolders:`, ss.folders.map(f => f.name));
                    } catch (e) { }
                }
            } catch (e) { }
        }

        console.log('\n🔎 Searching for "baiterek" to find its location...');
        const search = await cloudinary.api.resources({
            type: 'upload',
            prefix: '',
            max_results: 500
        });

        const paths = new Set();
        search.resources.forEach(r => {
            const parts = r.public_id.split('/');
            if (parts.length > 1) {
                paths.add(parts.slice(0, -1).join('/'));
            }
        });

        console.log('Detected Asset Paths:', Array.from(paths));

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

listAll();
