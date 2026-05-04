const cloudinary = require('cloudinary').v2;
const fs = require('node:fs');
const path = require('node:path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

// Directory containing images
const imagesDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\MusicDance';

// Cloudinary folder path
const cloudinaryFolder = 'content/pages/heritage/kazakhMelodies';

async function uploadImage(filePath, fileName) {
  try {
    // Remove extension for public_id
    const publicId = path.parse(fileName).name;
    
    console.log(`Uploading ${fileName}...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudinaryFolder,
      public_id: publicId,
      resource_type: 'image',
      overwrite: true
    });
    
    console.log(`✓ Uploaded: ${fileName}`);
    console.log(`  Public ID: ${result.public_id}`);
    console.log(`  URL: ${result.secure_url}`);
    
    return {
      fileName,
      publicId: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error(`✗ Failed to upload ${fileName}:`, error.message);
    return null;
  }
}

async function uploadAllImages() {
  try {
    // Read directory
    const files = fs.readdirSync(imagesDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    console.log(`Found ${imageFiles.length} images to upload\n`);
    
    const results = [];
    
    // Upload each image
    for (const file of imageFiles) {
      const filePath = path.join(imagesDir, file);
      const result = await uploadImage(filePath, file);
      if (result) {
        results.push(result);
      }
      console.log('');
    }
    
    console.log('\n========================================');
    console.log('UPLOAD SUMMARY');
    console.log('========================================');
    console.log(`Total images found: ${imageFiles.length}`);
    console.log(`Successfully uploaded: ${results.length}`);
    console.log(`Failed: ${imageFiles.length - results.length}`);
    console.log('\nCloudinary folder: ' + cloudinaryFolder);
    console.log('\nUploaded images:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.fileName}`);
      console.log(`   Public ID: ${result.publicId}`);
    });
    
    // Save results to file for reference
    const outputPath = path.join(__dirname, 'uploaded-images.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error reading directory:', error.message);
    process.exit(1);
  }
}

uploadAllImages();
