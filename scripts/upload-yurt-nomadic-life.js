/**
 * Upload Yurt & Nomadic Life Images to Cloudinary with explicit folder
 * Target: content/pages/heritage/yurtNomadiclife
 */

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'verynice',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? '***set***' : 'MISSING',
  api_secret: cloudinary.config().api_secret ? '***set***' : 'MISSING'
});

// Image mappings - Yurt & Nomadic Life images
const imageMappings = [
  { file: 'Baqanaq.jpg', publicId: 'baqanaq' },
  { file: 'Baskur.jpg', publicId: 'baskur' },
  { file: 'Chii.jpg', publicId: 'chii' },
  { file: 'Esik.jpg', publicId: 'esik' },
  { file: 'esyk.jpeg', publicId: 'esyk' },
  { file: 'Jabu kiiz.jpg', publicId: 'jabu-kiiz' },
  { file: 'Kerege.jpg', publicId: 'kerege' },
  { file: 'Kuldireuish.jpg', publicId: 'kuldireuish' },
  { file: 'mainYurtNomadiclife.webp', publicId: 'yurt-nomadic-life-hero' },
  { file: 'Saganak.jpg', publicId: 'saganak' },
  { file: 'Shanyrak.jpg', publicId: 'shanyrak' },
  { file: 'Tastar Bau.jpg', publicId: 'tastar-bau' },
  { file: 'Tuirlyq.webp', publicId: 'tuirlyq' },
  { file: 'Tundik.jpg', publicId: 'tundik' },
  { file: 'Uyk.jpg', publicId: 'uyk' },
  { file: 'Uykbau.jpg', publicId: 'uykbau' },
  { file: 'Uzyk.jpg', publicId: 'uzyk' }
];

const sourceDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\Yurt&NomadicLife';
const folder = 'content/pages/heritage/yurtNomadiclife';

async function uploadImage(mapping) {
  const filePath = path.join(sourceDir, mapping.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP - File not found: ${mapping.file}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: mapping.publicId,
      overwrite: true,
      resource_type: 'image'
    });
    
    console.log(`  OK   ${mapping.file} -> ${folder}/${mapping.publicId}`);
    return result;
  } catch (error) {
    console.error(`  FAIL ${mapping.file}: ${error.message}`);
    return null;
  }
}

async function uploadAll() {
  console.log('\n=== Uploading Traditional Clothing images to Cloudinary ===\n');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target folder: ${folder}\n`);
  
  let success = 0;
  let fail = 0;
  
  for (const mapping of imageMappings) {
    const result = await uploadImage(mapping);
    if (result) success++;
    else fail++;
  }
  
  console.log(`\n=== Done: ${success} uploaded, ${fail} failed ===\n`);
}

uploadAll().catch(console.error);
