/**
 * Upload Traditional Clothing Images to Cloudinary with explicit folder
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

// Image mappings - just filename, folder is specified separately
const imageMappings = [
  { file: 'basKiim.jpg', publicId: 'baskiim' },
  { file: 'Beldemshe.jpg', publicId: 'beldemshe' },
  { file: 'Borik.jpg', publicId: 'borik' },
  { file: 'GalleryTraditionalclosing.jpg', publicId: 'gallery-hero' },
  { file: 'gallery_traditionalwomanwear.jpg', publicId: 'traditional-woman-wear' },
  { file: 'Ichigi.jpeg', publicId: 'ichigi' },
  { file: 'kalpak.webp', publicId: 'kalpak' },
  { file: 'kamzol&koilek.jpg', publicId: 'kamzol-koilek' },
  { file: 'Kamzol.jpg', publicId: 'kamzol' },
  { file: 'Kasaba.jpg', publicId: 'kasaba' },
  { file: 'kimeshek.jpg', publicId: 'kimeshek' },
  { file: 'koilek.jpg', publicId: 'koilek' },
  { file: 'kope.jpg', publicId: 'kope' },
  { file: 'KunikeyKoilek.jpg', publicId: 'kunikey-koilek' },
  { file: 'kupe.jpg', publicId: 'kupe' },
  { file: 'Qapta.jpg', publicId: 'qapta' },
  { file: 'saukele.jpeg', publicId: 'saukele' },
  { file: 'saukeleon.jpg', publicId: 'saukele-detail' },
  { file: 'Shalbar.jpg', publicId: 'shalbar' },
  { file: 'Shapan.jpg', publicId: 'shapan' },
  { file: 'Takiya.webp', publicId: 'takiya' },
  { file: 'ton.jpg', publicId: 'ton' },
  { file: 'TraditionalClosing.jpg', publicId: 'traditional-clothing-hero' },
  { file: 'Tymak.jpg', publicId: 'tymak' },
  { file: 'zhelek.jpg', publicId: 'zhelek' }
];

const sourceDir = 'C:\\Users\\joyhub\\Desktop\\Verynice_stock_photos\\Heritage\\TraditionalClothing';
const folder = 'content/pages/heritage/traditionalClothing';

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
