const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function listRoot() {
    try {
        const result = await cloudinary.api.sub_folders('content/pages/destinations');
        console.log('Remaining folders:', result.folders.map(f => f.name));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
listRoot();
