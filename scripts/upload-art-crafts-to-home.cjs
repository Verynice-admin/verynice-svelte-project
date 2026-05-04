/**
 * Upload Art & Crafts Images to Cloudinary - CORRECT HOME PATH
 * Target: home/content/pages/heritage/artandcrafts
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
const sourceDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\ArtCrafts';

// CORRECTED Target Cloudinary folder - home/content/pages/heritage/artandcrafts
const cloudinaryFolder = 'home/content/pages/heritage/artandcrafts';

// Image mappings with proper public IDs organized by category
const imageMappings = [
  // ===== KESTE (Traditional Embroidery) =====
  { file: 'beldesheKeste.jpg', publicId: 'keste/beldeshe', category: 'keste' },
  { file: 'cotumeKeste.jpg', publicId: 'keste/costume', category: 'keste' },
  { file: 'decorativeKeste.jpg', publicId: 'keste/decorative', category: 'keste' },
  { file: 'garmentsKeste.jpg', publicId: 'keste/garments', category: 'keste' },
  { file: 'kimeshekKeste.jpg', publicId: 'keste/kimeshek', category: 'keste' },
  { file: 'QzlshapanKeste.jpg', publicId: 'keste/qzl-shapan', category: 'keste' },
  { file: 'shalbarKeste.jpg', publicId: 'keste/shalbar', category: 'keste' },
  { file: 'shapanKeste.jpg', publicId: 'keste/shapan', category: 'keste' },

  // ===== JEWELRY =====
  { file: 'GoldenJewelery.jpg', publicId: 'jewelry/golden', category: 'jewelry' },
  { file: 'JewelryArt.jpg', publicId: 'jewelry/art', category: 'jewelry' },
  { file: 'jewelryArtCraft.jpg', publicId: 'jewelry/art-craft', category: 'jewelry' },
  { file: 'JewelryCraft.jpg', publicId: 'jewelry/craft', category: 'jewelry' },
  { file: 'JewelryCrafting.jpg', publicId: 'jewelry/crafting', category: 'jewelry' },
  { file: 'kazakkhJewelry.jpg', publicId: 'jewelry/kazakh', category: 'jewelry' },
  { file: 'QazaqJewelry.jpg', publicId: 'jewelry/qazaq', category: 'jewelry' },
  { file: 'SakasTimeJewelry.webp', publicId: 'jewelry/sakas-time', category: 'jewelry' },

  // ===== FELT MAKING =====
  { file: 'FeltMakingSyrmak.jpg', publicId: 'felt-making/syrmak', category: 'felt-making' },
  { file: 'kazakhtekemetFeltMaking.jpeg', publicId: 'felt-making/tekemet', category: 'felt-making' },
  { file: 'syrmakFeltMaking.jpeg', publicId: 'felt-making/syrmak-process', category: 'felt-making' },
  { file: 'yurtinsideFeltMaking.jpeg', publicId: 'felt-making/yurt-inside', category: 'felt-making' },

  // ===== CRAFTS =====
  { file: 'BESIKCraft.jpg', publicId: 'crafts/besik', category: 'crafts' },
  { file: 'DishesCraft.webp', publicId: 'crafts/dishes', category: 'crafts' },
  { file: 'handCraft.jpg', publicId: 'crafts/hand', category: 'crafts' },
  { file: 'leatherCraft.avif', publicId: 'crafts/leather', category: 'crafts' },
  { file: 'woodCraft.avif', publicId: 'crafts/wood', category: 'crafts' },

  // ===== EAGLE HUNTING =====
  { file: 'EagleHunting.jpg', publicId: 'eagle-hunting/hunter', category: 'eagle-hunting' },
  { file: 'EagleHuntingBurkitshi.jpg', publicId: 'eagle-hunting/burkitshi', category: 'eagle-hunting' },
  { file: 'wolfEagleHunting.jpg', publicId: 'eagle-hunting/wolf', category: 'eagle-hunting' },

  // ===== OTHER =====
  { file: 'mainImageArtCraft.jpg', publicId: 'hero/main', category: 'hero' },
  { file: 'MurakmensheaddressKezde.jpg', publicId: 'keste/murak-mens-headdress', category: 'keste' }
];

async function uploadImage(mapping) {
  const filePath = path.join(sourceDir, mapping.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP - File not found: ${mapping.file}`);
    return null;
  }

  try {
    const fullPublicId = `${cloudinaryFolder}/${mapping.publicId}`;

    const result = await cloudinary.uploader.upload(filePath, {
      public_id: fullPublicId,
      overwrite: true,
      resource_type: 'image'
    });

    console.log(`  ✓ OK   ${mapping.file} -> ${fullPublicId}`);
    return {
      file: mapping.file,
      publicId: fullPublicId,
      url: result.secure_url,
      category: mapping.category
    };
  } catch (error) {
    console.error(`  ✗ FAIL ${mapping.file}: ${error.message}`);
    return null;
  }
}

async function uploadAll() {
  console.log('\n========================================');
  console.log('UPLOADING ART & CRAFTS TO HOME PATH');
  console.log('========================================');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${cloudinaryFolder}`);
  console.log('');

  let success = 0;
  let fail = 0;
  const results = [];

  for (const mapping of imageMappings) {
    const result = await uploadImage(mapping);
    if (result) {
      success++;
      results.push(result);
    } else {
      fail++;
    }
  }

  console.log('\n========================================');
  console.log('UPLOAD SUMMARY');
  console.log('========================================');
  console.log(`Total: ${imageMappings.length}`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${fail}`);

  // Save results
  const outputPath = path.join(__dirname, 'uploaded-art-crafts-home.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

uploadAll().catch(console.error);
