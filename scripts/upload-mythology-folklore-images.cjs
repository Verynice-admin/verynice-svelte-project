/**
 * Upload Mythology & Folklore Images to Cloudinary
 * Target: content/pages/heritage/mythologyFolklore
 */

const cloudinary = require('cloudinary').v2;
const fs = require('node:fs');
const path = require('node:path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

// Source directory
const sourceDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\mythologyFolklore';

// Target Cloudinary folder
const cloudinaryFolder = 'content/pages/heritage/mythologyFolklore';

// Image mappings with proper public IDs
const imageMappings = [
  { file: 'Albastı.jpg', publicId: 'albasti' },
  { file: 'Samruk.jpg', publicId: 'samruk' },
  { file: 'Shamanism.jpg', publicId: 'shamanism' },
  { file: 'Tengrism.webp', publicId: 'tengrism' },
  { file: 'TotemicBelief.png', publicId: 'totemic-belief' },
  { file: 'Umai.jpg', publicId: 'umai' },
  { file: 'ZhalmauyzKempir.jpg', publicId: 'zhalmauyz-kempir' },
  { file: 'ZherSu.jpeg', publicId: 'zher-su' }
];

async function uploadImage(file, publicId) {
  const filePath = path.join(sourceDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return null;
  }

  try {
    console.log(`⬆️  Uploading: ${file} -> ${publicId}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: cloudinaryFolder,
      resource_type: 'auto',
      asset_folder: cloudinaryFolder
    });

    console.log(`✅ Uploaded: ${result.public_id}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Size: ${result.bytes} bytes`);
    console.log('');
    
    return result;
  } catch (error) {
    console.log(`❌ Error uploading ${file}: ${error.message}`);
    return null;
  }
}

async function uploadAllImages() {
  console.log('='.repeat(60));
  console.log('Uploading Mythology & Folklore Images to Cloudinary');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target Folder: ${cloudinaryFolder}`);
  console.log('='.repeat(60));
  console.log('');

  const results = [];

  for (const mapping of imageMappings) {
    const result = await uploadImage(mapping.file, mapping.publicId);
    if (result) {
      results.push({
        file: mapping.file,
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        bytes: result.bytes
      });
    }
  }

  console.log('='.repeat(60));
  console.log('Upload Summary');
  console.log('='.repeat(60));
  console.log(`Total uploaded: ${results.length}/${imageMappings.length}`);
  console.log('');

  // Print all public IDs for reference
  console.log('Public IDs:');
  for (const r of results) {
    console.log(`  ${r.publicId}: ${r.url}`);
  }

  // Save results to JSON
  const outputPath = path.join(__dirname, 'mythology-folklore-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

uploadAllImages().catch(console.error);
