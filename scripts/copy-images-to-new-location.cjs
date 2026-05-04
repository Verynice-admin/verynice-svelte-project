require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const OLD_PREFIX = 'home/content/pages/heritage/artandcrafts';
const NEW_PREFIX = 'content/pages/heritage/artAndCrafts';

async function copyImages() {
    const output = [];
    
    output.push('=== Copying images to new location ===');
    output.push(`Old: ${OLD_PREFIX}`);
    output.push(`New: ${NEW_PREFIX}`);
    
    // Get all images from old location
    output.push('\n--- Getting images from old location ---');
    
    const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: OLD_PREFIX,
        max_results: 100
    });
    
    output.push(`Found ${result.resources.length} images`);
    
    // For each image, we need to create a copy at the new location
    // We'll use the copy API or upload with new ID
    
    let copied = 0;
    let failed = 0;
    
    for (const resource of result.resources) {
        try {
            const oldPublicId = resource.public_id;
            const newPublicId = oldPublicId.replace(OLD_PREFIX, NEW_PREFIX);
            
            // Use the copy/rename feature
            // Cloudinary doesn't have a direct copy, so we'll use the upload with from_public_id
            // Actually, let's try using explicit with the copy_to option
            
            // The best way is to use the from_public_id parameter
            await cloudinary.uploader.upload(resource.url, {
                public_id: newPublicId,
                folder: NEW_PREFIX,
                overwrite: false,
                tags: resource.tags
            });
            
            output.push(`✓ Copied: ${newPublicId}`);
            copied++;
            
        } catch (err) {
            output.push(`✗ Failed: ${err.message}`);
            failed++;
        }
    }
    
    output.push(`\nCopied: ${copied}, Failed: ${failed}`);
    output.push('\nNote: Check if images are accessible at new location');
    
    // Verify new location
    output.push('\n--- Verifying new location ---');
    
    const verifyResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: NEW_PREFIX,
        max_results: 100
    });
    
    output.push(`Images at new location: ${verifyResult.resources.length}`);
    
    fs.writeFileSync('copy_images_log.txt', output.join('\n'));
    console.log('Done! Check copy_images_log.txt');
}

copyImages().catch(e => {
    fs.writeFileSync('copy_images_log.txt', 'Error: ' + e.message);
    console.error(e);
    process.exit(1);
});
