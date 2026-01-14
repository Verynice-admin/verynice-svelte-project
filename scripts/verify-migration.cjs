const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

async function verify() {
    const paths = [
        'content/pages/destinations/Turkistan_Shymkent/azret-sultan-complex',
        'content/pages/destinations/Turkistan_Shymkent/shymkent'
    ];
    for (const p of paths) {
        try {
            const res = await cloudinary.api.resources({ type: 'upload', prefix: p, max_results: 5 });
            console.log(`Folder ${p} has ${res.resources.length} assets (first 5 shown).`);
        } catch (e) {
            console.log(`Error checking ${p}: ${e.message}`);
        }
    }
}

verify();
