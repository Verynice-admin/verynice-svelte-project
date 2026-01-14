const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const foldersToDelete = [
    'content/pages/destinations/almaty',
    'content/pages/destinations/astana',
    'content/pages/destinations/east-kazakhstan',
    'content/pages/destinations/mangystau',
    'content/pages/destinations/other-attractions',
    'content/pages/destinations/turkistan'
];

async function deleteFolderRecursive(folderPath) {
    console.log(`🧹 Processing: ${folderPath}`);
    try {
        // 1. Delete all resources in this folder and subfolders
        console.log(`   - Deleting resources in ${folderPath}...`);
        await cloudinary.api.delete_resources_by_prefix(folderPath + '/');

        // 2. List subfolders to delete them first
        const result = await cloudinary.api.sub_folders(folderPath);
        for (const sub of result.folders) {
            await deleteFolderRecursive(sub.path);
        }

        // 3. Delete the folder itself
        console.log(`   - Deleting empty folder: ${folderPath}`);
        await cloudinary.api.delete_folder(folderPath);
        return true;
    } catch (err) {
        console.error(`   ❌ Failed to delete ${folderPath}: ${err.message}`);
        return false;
    }
}

async function startCleanup() {
    console.log('🧨 STARTING REMOVAL OF OLD FOLDERS...');
    for (const folder of foldersToDelete) {
        await deleteFolderRecursive(folder);
    }
    console.log('\n✅ CLEANUP COMPLETE!');
}

startCleanup();
