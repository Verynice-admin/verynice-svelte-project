const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_DIR = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos\\Regional_Tastes';
const TARGET_FOLDER = 'content/pages/foodDrinks/internationalTastes';

function toSlug(name) {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function upload() {
    console.log(`Uploading from ${SOURCE_DIR} to ${TARGET_FOLDER}...`);
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        return;
    }

    const files = fs.readdirSync(SOURCE_DIR);
    console.log(`Found ${files.length} files.`);
    
    let uploadedCount = 0;
    let failedCount = 0;

    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png|webp|jfif|avif)$/i)) continue;
        
        const name = path.parse(file).name;
        // Clean filename for ID exactly like seed script does (but seed script does it from object keys, here we do from filename)
        // Seed script: const id = filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        // toSlug does exactly that.
        const publicId = toSlug(name);
        const filePath = path.join(SOURCE_DIR, file);
        
        console.log(`Uploading ${file} as ${publicId}...`);
        
        try {
            await cloudinary.uploader.upload(filePath, {
                folder: TARGET_FOLDER,
                public_id: publicId,
                overwrite: true,
                resource_type: 'image'
            });
            console.log(`✅ Uploaded: ${publicId}`);
            uploadedCount++;
        } catch (e) {
            console.error(`❌ Failed ${file}:`, e.message);
            failedCount++;
        }
    }
    console.log(`\nUpload complete. Success: ${uploadedCount}, Failed: ${failedCount}`);
}

upload();
