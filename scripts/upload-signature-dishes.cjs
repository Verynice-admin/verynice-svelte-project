const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: 'verynice',
    api_key: '795653376351388',
    api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_ROOT = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos\\SignatureDishes';
const CLOUDINARY_FOLDER = 'content/pages/foodDrinks/signatureDishes'; // Managed folder path

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif', '.tiff', '.bmp']);
const CONCURRENCY = 10;

// Map folder names to URL-friendly slugs
function toSlug(name) {
    return name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function uploadFile(item) {
    try {
        const result = await cloudinary.uploader.upload(item.filePath, {
            public_id: `${item.assetFolder}/${item.publicId}`,
            overwrite: true,
            resource_type: 'image'
        });
        console.log(`   ✓ ${item.fileName} -> ${result.public_id}`);
        return true;
    } catch (err) {
        console.log(`   ✗ ${item.fileName}: ${err.message}`);
        return false;
    }
}

async function uploadSignatureDishes() {
    console.log('🚀 Uploading Signature Dishes images to Cloudinary...\n');

    let queue = [];

    // Get all items in SignatureDishes folder
    const items = fs.readdirSync(SOURCE_ROOT);

    for (const item of items) {
        const itemPath = path.join(SOURCE_ROOT, item);
        const stat = fs.lstatSync(itemPath);

        if (stat.isDirectory()) {
            // It's a subfolder (category)
            const categorySlug = toSlug(item);
            const files = fs.readdirSync(itemPath);
            
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                if (!IMAGE_EXTENSIONS.has(ext)) continue;

                const filePath = path.join(itemPath, file);
                const fileName = path.parse(file).name;
                const publicId = toSlug(fileName);
                const assetFolder = `${CLOUDINARY_FOLDER}/${categorySlug}`;
                
                queue.push({ filePath, publicId, fileName: file, category: item, assetFolder });
            }
        } else {
            // It's a file in the root (general images)
            const ext = path.extname(item).toLowerCase();
            if (!IMAGE_EXTENSIONS.has(ext)) continue;

            const fileName = path.parse(item).name;
            const publicId = toSlug(fileName);
            const assetFolder = CLOUDINARY_FOLDER;
            
            queue.push({ filePath: itemPath, publicId, fileName: item, category: 'Root', assetFolder });
        }
    }

    console.log(`📦 Found ${queue.length} images to upload:\n`);
    
    // Group by category for display
    const byCategory = {};
    for (const item of queue) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }
    for (const [cat, count] of Object.entries(byCategory)) {
        console.log(`   ${cat}: ${count} images`);
    }
    console.log('');

    let totalUploaded = 0;
    let currentCategory = '';

    for (let i = 0; i < queue.length; i += CONCURRENCY) {
        const batch = queue.slice(i, i + CONCURRENCY);
        
        // Show category header
        for (const item of batch) {
            if (item.category !== currentCategory) {
                currentCategory = item.category;
                console.log(`\n📁 ${currentCategory}:`);
            }
        }
        
        const results = await Promise.all(batch.map(item => uploadFile(item)));
        totalUploaded += results.filter(Boolean).length;
    }

    console.log(`\n✅ UPLOAD COMPLETE!`);
    console.log(`   Total uploaded: ${totalUploaded}/${queue.length}`);
    console.log(`   Location: ${CLOUDINARY_FOLDER}/`);
}

uploadSignatureDishes().catch(err => {
    console.error('Upload failed:', err);
    process.exit(1);
});
