const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const LOCAL_ROOT = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos';
const CLOUDINARY_BASE = 'content/pages/destinations';

function cleanCloudName(name) {
    return name.replace(/[&?=%\s#]/g, '_').replace(/_+/g, '_');
}

async function uploadFile(localPath, cloudFolder) {
    try {
        await cloudinary.uploader.upload(localPath, {
            folder: cloudFolder,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            resource_type: 'auto'
        });
        return true;
    } catch (err) {
        console.error(`   ❌ Failed to upload ${localPath}: ${err.message}`);
        return false;
    }
}

async function processFolder(localPath, cloudPath) {
    const items = fs.readdirSync(localPath, { withFileTypes: true });

    for (const item of items) {
        const fullLocalPath = path.join(localPath, item.name);
        if (item.isDirectory()) {
            await processFolder(fullLocalPath, `${cloudPath}/${cleanCloudName(item.name)}`);
        } else {
            const ext = path.extname(item.name).toLowerCase();
            // Expanded list of image and video extensions
            const allowedExts = [
                '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif',
                '.mp4', '.mov', '.jfif', '.heic', '.tiff', '.bmp', '.svg'
            ];
            if (allowedExts.includes(ext)) {
                // To save time, we could check if it exists, but overwrite: true is fine for a second pass
                console.log(`⬆️ Uploading: ${item.name} to ${cloudPath}`);
                await uploadFile(fullLocalPath, cloudPath);
            }
        }
    }
}

async function startMigration() {
    console.log('🚀 Starting Final Pass Migration (including .jfif and more)...');

    const regions = fs.readdirSync(LOCAL_ROOT, { withFileTypes: true });

    for (const region of regions) {
        if (region.isDirectory()) {
            console.log(`\n🌎 Processing Region: ${region.name}`);
            const localRegionPath = path.join(LOCAL_ROOT, region.name);
            const cloudRegionPath = `${CLOUDINARY_BASE}/${cleanCloudName(region.name)}`;
            await processFolder(localRegionPath, cloudRegionPath);
        }
    }

    console.log('\n✅ FINAL MIGRATION PASS COMPLETE!');
}

startMigration();
