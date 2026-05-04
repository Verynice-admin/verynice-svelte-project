import 'dotenv/config';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.v2.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SOURCE_DIR = 'C:/Users/joyhub/Desktop/Verynice_stock_photos/Heritage/traditionsCustoms';
const CLOUD_PREFIX = 'home/content/pages/heritage/traditionsCustoms';

const imageFiles = [
  'BesikkeSalu.jpeg',
  'Betashar.jpg',
  'GreetingEtiquette.webp',
  'mainTraditionsCustomsSocialLife.webp',
  'NationalGames.jpg',
  'NauryzSpringNewYear.jpg',
  'RespectforElders.jpeg',
  'shashu.jpg',
  'TüsauKeser.jpeg',
  'tusauKesu.jpg',
  'WeddingCustoms.webp',
  'ZhetiAta.jpg'
];

async function deleteImage(publicId) {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
    console.log(`  🗑️ Deleted: ${publicId}`);
  } catch (error) {
    console.error(`  ❌ Error deleting ${publicId}:`, error.message);
  }
}

async function uploadImage(filename) {
  const filePath = path.join(SOURCE_DIR, filename);
  const baseName = path.basename(filename, path.extname(filename));
  // Use only the filename, not the full path, and folder will add the prefix
  const publicId = baseName;
  
  console.log(`Uploading ${filename}...`);
  console.log(`  Public ID: ${CLOUD_PREFIX}/${baseName}`);
  
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      public_id: publicId,
      folder: CLOUD_PREFIX,
      resource_type: 'auto',
      overwrite: true
    });
    console.log(`  ✅ Success! URL: ${result.secure_url}`);
    console.log(`  Public ID: ${result.public_id}`);
    return { filename, publicId: result.public_id, url: result.secure_url };
  } catch (error) {
    console.error(`  ❌ Error uploading ${filename}:`, error.message);
    return { filename, error: error.message };
  }
}

async function main() {
  console.log('=== CLEANING UP OLD DUPLICATE IMAGES ===');
  const oldIds = imageFiles.map(f => {
    const baseName = path.basename(f, path.extname(f));
    return `${CLOUD_PREFIX}/${CLOUD_PREFIX}/${baseName}`;
  });
  
  for (const id of oldIds) {
    await deleteImage(id);
  }
  
  console.log('\n=== UPLOADING TRADITIONS & CUSTOMS IMAGES TO CLOUDINARY ===');
  console.log(`Destination: ${CLOUD_PREFIX}`);
  console.log(`Total files: ${imageFiles.length}`);
  console.log('---');
  
  const results = [];
  for (const file of imageFiles) {
    const result = await uploadImage(file);
    results.push(result);
    console.log('---');
  }
  
  console.log('\n=== UPLOAD SUMMARY ===');
  results.forEach(r => {
    if (r.error) {
      console.log(`❌ ${r.filename}: ${r.error}`);
    } else {
      console.log(`✅ ${r.filename} -> ${r.publicId}`);
    }
  });
  
  const successful = results.filter(r => !r.error).length;
  console.log(`\nTotal: ${successful}/${imageFiles.length} uploaded successfully`);
  
  // Save public IDs for later use
  const publicIds = results
    .filter(r => !r.error)
    .map(r => ({ filename: r.filename, publicId: r.publicId }));
  
  fs.writeFileSync(
    path.join(__dirname, 'traditions-customs-public-ids.json'),
    JSON.stringify(publicIds, null, 2)
  );
  console.log('\nPublic IDs saved to traditions-customs-public-ids.json');
}

main().catch(console.error);
