const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function listDestinations() {
    console.log('📂 Listing Cloudinary destinations...');
    try {
        const path = 'content/pages/destinations';
        const result = await cloudinary.api.sub_folders(path);
        console.log(`Subfolders in ${path}:`);
        result.folders.forEach(f => {
            console.log(` - ${f.name} (path: ${f.path})`);
        });
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

listDestinations();
