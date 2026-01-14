const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function traceFolderPaths() {
    console.log('🕵️ Tracing exact folder paths via API...');
    try {
        // 1. List all folders in the account
        // Cloudinary only allows listing subfolders of a specific parent. 
        // We'll recurse manually for a few levels.

        async function getTree(parent, indent = 0) {
            try {
                const result = await cloudinary.api.sub_folders(parent);
                for (const folder of result.folders) {
                    console.log(`${' '.repeat(indent)}📁 ${folder.name} (Path: ${folder.path})`);
                    await getTree(folder.path, indent + 2);
                }
            } catch (e) {
                // Leaf or error
            }
        }

        console.log('Root Folders tree:');
        const roots = await cloudinary.api.root_folders();
        for (const root of roots.folders) {
            console.log(`📁 ${root.name} (Path: ${root.path})`);
            await getTree(root.path, 2);
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

traceFolderPaths();
