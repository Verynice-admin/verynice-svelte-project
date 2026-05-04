require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'verynice',
    api_key: process.env.CLOUDINARY_API_KEY || '795653376351388',
    api_secret: process.env.CLOUDINARY_API_SECRET || '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_FOLDER = 'C:/Users/joyhub/Desktop/Verynice_stock_photos/Heritage/traditionalGames';
const CLOUDINARY_FOLDER = 'content/pages/heritage/traditionalGames';

// Image files found in the source folder
const images = [
    'altybakan.jpg',
    'arqanTartys.webp',
    'assykAtu.jpg',
    'audaryspak.webp',
    'baigeAlamanBaige.jpg',
    'besTas.webp',
    'bürkütSalu.jpg',
    'erEnish.webp',
    'kazakshaKures.jpg',
    'kokpar.jpg',
    'kyzKuu.jpg',
    'teńgeIluKumealu.jpg',
    'togyzkumalak.jpg'
];

async function uploadImages() {
    const output = [];
    output.push('=== Uploading Traditional Games images to Cloudinary ===');
    output.push(`Source folder: ${SOURCE_FOLDER}`);
    output.push(`Cloudinary folder: ${CLOUDINARY_FOLDER}`);
    output.push(`Total images to upload: ${images.length}`);
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const imageFile of images) {
        const filePath = path.join(SOURCE_FOLDER, imageFile);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            output.push(`\n❌ File not found: ${filePath}`);
            failedCount++;
            continue;
        }
        
        // Generate public_id (without extension) - just the filename
        const baseName = path.basename(imageFile, path.extname(imageFile));
        const publicId = baseName;
        
        try {
            output.push(`\n--- Uploading: ${imageFile} ---`);
            output.push(`Public ID: ${publicId}`);
            
            // Upload the image
            const result = await cloudinary.uploader.upload(filePath, {
                public_id: publicId,
                folder: CLOUDINARY_FOLDER,
                resource_type: 'image',
                overwrite: true
            });
            
            output.push(`✓ Uploaded successfully!`);
            output.push(`  Public ID: ${result.public_id}`);
            output.push(`  URL: ${result.secure_url}`);
            output.push(`  Format: ${result.format}`);
            output.push(`  Width: ${result.width}, Height: ${result.height}`);
            
            successCount++;
        } catch (error) {
            output.push(`✗ Failed to upload ${imageFile}: ${error.message}`);
            failedCount++;
        }
    }
    
    output.push('\n=== Summary ===');
    output.push(`Total images: ${images.length}`);
    output.push(`Successfully uploaded: ${successCount}`);
    output.push(`Failed: ${failedCount}`);
    
    // Write output to log file
    const logContent = output.join('\n');
    console.log(logContent);
    fs.writeFileSync('traditional-games-upload-log.txt', logContent);
    console.log('\nLog written to traditional-games-upload-log.txt');
}

uploadImages().catch(console.error);
