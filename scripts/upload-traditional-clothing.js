/**
 * Upload Traditional Clothing Images to Cloudinary
 * Reads credentials from .env file
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

// Image mappings with proper public IDs
const imageMappings = [
  { file: 'basKiim.jpg', publicId: 'content/pages/heritage/traditionalClothing/baskiim' },
  { file: 'Beldemshe.jpg', publicId: 'content/pages/heritage/traditionalClothing/beldemshe' },
  { file: 'Borik.jpg', publicId: 'content/pages/heritage/traditionalClothing/borik' },
  { file: 'GalleryTraditionalclosing.jpg', publicId: 'content/pages/heritage/traditionalClothing/gallery-hero' },
  { file: 'gallery_traditionalwomanwear.jpg', publicId: 'content/pages/heritage/traditionalClothing/traditional-woman-wear' },
  { file: 'Ichigi.jpeg', publicId: 'content/pages/heritage/traditionalClothing/ichigi' },
  { file: 'kalpak.webp', publicId: 'content/pages/heritage/traditionalClothing/kalpak' },
  { file: 'kamzol&koilek.jpg', publicId: 'content/pages/heritage/traditionalClothing/kamzol-koilek' },
  { file: 'Kamzol.jpg', publicId: 'content/pages/heritage/traditionalClothing/kamzol' },
  { file: 'Kasaba.jpg', publicId: 'content/pages/heritage/traditionalClothing/kasaba' },
  { file: 'kimeshek.jpg', publicId: 'content/pages/heritage/traditionalClothing/kimeshek' },
  { file: 'koilek.jpg', publicId: 'content/pages/heritage/traditionalClothing/koilek' },
  { file: 'kope.jpg', publicId: 'content/pages/heritage/traditionalClothing/kope' },
  { file: 'KunikeyKoilek.jpg', publicId: 'content/pages/heritage/traditionalClothing/kunikey-koilek' },
  { file: 'kupe.jpg', publicId: 'content/pages/heritage/traditionalClothing/kupe' },
  { file: 'Qapta.jpg', publicId: 'content/pages/heritage/traditionalClothing/qapta' },
  { file: 'saukele.jpeg', publicId: 'content/pages/heritage/traditionalClothing/saukele' },
  { file: 'saukeleon.jpg', publicId: 'content/pages/heritage/traditionalClothing/saukele-detail' },
  { file: 'Shalbar.jpg', publicId: 'content/pages/heritage/traditionalClothing/shalbar' },
  { file: 'Shapan.jpg', publicId: 'content/pages/heritage/traditionalClothing/shapan' },
  { file: 'Takiya.webp', publicId: 'content/pages/heritage/traditionalClothing/takiya' },
  { file: 'ton.jpg', publicId: 'content/pages/heritage/traditionalClothing/ton' },
  { file: 'TraditionalClosing.jpg', publicId: 'content/pages/heritage/traditionalClothing/traditional-clothing-hero' },
  { file: 'Tymak.jpg', publicId: 'content/pages/heritage/traditionalClothing/tymak' },
  { file: 'zhelek.jpg', publicId: 'content/pages/heritage/traditionalClothing/zhelek' }
];

const sourceDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\TraditionalClothing';

async function uploadImage(mapping) {
  const filePath = path.join(sourceDir, mapping.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP - File not found: ${mapping.file}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: mapping.publicId,
      overwrite: true,
      resource_type: 'image'
    });
    
    console.log(`  OK   ${mapping.file} -> ${mapping.publicId}`);
    return result;
  } catch (error) {
    console.error(`  FAIL ${mapping.file}: ${error.message}`);
    return null;
  }
}

async function uploadAll() {
  console.log('\n=== Uploading Traditional Clothing images to Cloudinary ===\n');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target folder: content/pages/heritage/traditionalClothing/\n`);
  
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
