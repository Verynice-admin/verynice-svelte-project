const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function list() {
    try {
        const result = await cloudinary.api.sub_folders('content/pages');
        console.log('Pages subfolders:', result.folders.map(f => f.name));

        const dest = await cloudinary.api.sub_folders('content/pages/destinations');
        console.log('Destinations subfolders:', dest.folders.map(f => f.name));
    } catch (e) {
        console.log('Full Error:', e);
    }
}
list();
