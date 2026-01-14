const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function listSub(path) {
    try {
        const result = await cloudinary.api.sub_folders(path);
        console.log(`Subfolders in ${path}:`, result.folders.map(f => f.name));
    } catch (e) {
        console.log(`No subfolders in ${path} or error: ${e.message}`);
    }
}

async function checkAll() {
    const paths = [
        'content/pages/destinations/almaty',
        'content/pages/destinations/astana',
        'content/pages/destinations/east-kazakhstan',
        'content/pages/destinations/mangystau',
        'content/pages/destinations/other-attractions',
        'content/pages/destinations/turkistan'
    ];
    for (const p of paths) {
        await listSub(p);
    }
}

checkAll();
