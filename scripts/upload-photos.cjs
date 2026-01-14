const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_ROOT = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos';
const BACKUP_ROOT = path.join(__dirname, '..', 'backups', 'Verynice_stock_photos');

const REGION_MAP = {
    'Almaty_&_Nearby': 'almaty',
    'Astana_&_Nearby': 'astana',
    'East_Kazakhstan': 'east-kazakhstan',
    'Mangystau_Region': 'mangystau',
    'Other_Attractions': 'other',
    'Turkistan_&_Shymkent': 'turkistan'
};

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif', '.tiff', '.bmp']);
const CONCURRENCY = 50;

async function uploadFile(item) {
    try {
        await cloudinary.uploader.upload(item.filePath, {
            public_id: item.publicId,
            overwrite: true,
            resource_type: 'image'
        });
        return true;
    } catch (err) {
        return false;
    }
}

async function uploadPhotos() {
    console.log('🚀 FINAL FIX: Exporting to content/pages/destinations/... (Turbo Mode)');

    const sourceRegions = fs.readdirSync(SOURCE_ROOT);
    const backupRegions = fs.readdirSync(BACKUP_ROOT);

    let queue = [];

    for (const backupRegion of backupRegions) {
        const regionSlug = REGION_MAP[backupRegion] || backupRegion.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sourceRegionNames = [backupRegion, backupRegion.replace('Nearby', 'nearby'), backupRegion.replace('nearby', 'Nearby')];
        const sourceRegion = sourceRegions.find(r => sourceRegionNames.includes(r) || r.toLowerCase() === backupRegion.toLowerCase());

        if (!sourceRegion) continue;

        const backupRegionPath = path.join(BACKUP_ROOT, backupRegion);
        const sourceRegionPath = path.join(SOURCE_ROOT, sourceRegion);
        if (!fs.lstatSync(backupRegionPath).isDirectory()) continue;

        const backupAttractions = fs.readdirSync(backupRegionPath);
        for (const attraction of backupAttractions) {
            const sourceAttrPath = path.join(sourceRegionPath, attraction);
            if (!fs.existsSync(sourceAttrPath)) continue;

            const files = fs.readdirSync(sourceAttrPath);
            const imageFiles = files.filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));

            for (const file of imageFiles) {
                const filePath = path.join(sourceAttrPath, file);
                const fileName = path.parse(file).name;
                // THE CORRECT PATH: content/pages/destinations/...
                const publicId = `content/pages/destinations/${regionSlug}/${attraction}/${fileName}`;
                queue.push({ filePath, publicId });
            }
        }
    }

    console.log(`📦 Queued ${queue.length} images for the correct managed folders.`);

    let totalUploaded = 0;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
        const batch = queue.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map(item => uploadFile(item)));
        totalUploaded += results.filter(Boolean).length;
        if (totalUploaded % 150 === 0 || totalUploaded === queue.length) {
            console.log(`   🚀 Progress: ${totalUploaded}/${queue.length} processed...`);
        }
    }

    console.log(`\n✅ UPLOAD COMPLETE! Total in pages/destinations: ${totalUploaded}`);
}

uploadPhotos();
