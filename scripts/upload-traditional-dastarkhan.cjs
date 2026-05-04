const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'verynice',
  api_key: '795653376351388',
  api_secret: '1UXQ6lfDsPeXfMMY20KDKBu16G8'
});

const SOURCE_DIR = 'C:\\Users\\conta\\Desktop\\Verynice_stock_photos\\Traditional_Kazakh_Dastarkhan';
const BASE_ID = 'content/pages/foodDrinks/traditionalDastarkhan';

const FILE_TO_PUBLIC_ID = {
  'main_traditional_dastarkhan.jpg': `${BASE_ID}/hero`,
  'main_traditional_dastarkhan.png': `${BASE_ID}/hero-alt`,
  'dastarkhan.jpg': `${BASE_ID}/table-overview`,

  'EthosOfHosting.jpg': `${BASE_ID}/sections/ethos-of-hosting`,
  'SeatingHierarchy.webp': `${BASE_ID}/sections/seating-hierarchy`,
  'ServingOrder.jpg': `${BASE_ID}/sections/serving-order`,
  'TeaRitual.jpg': `${BASE_ID}/sections/tea-ritual`,
  'bata.jpg': `${BASE_ID}/sections/speech-and-etiquette`,
  'CeremonialContexts.jpg': `${BASE_ID}/sections/ceremonial-contexts`,
  'ModernUrbanDastarkhan.jpg': `${BASE_ID}/sections/modern-practice`,
  'ModernUrbanDastarkhan.jpeg': `${BASE_ID}/sections/modern-practice-alt`
};

async function uploadOne(fileName, publicId) {
  const filePath = path.join(SOURCE_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Missing local file: ${fileName}`);
    return false;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image'
    });
    console.log(`✓ ${fileName} -> ${result.public_id}`);
    return true;
  } catch (err) {
    console.log(`✗ ${fileName}: ${err.message}`);
    return false;
  }
}

async function run() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const mappedFiles = Object.keys(FILE_TO_PUBLIC_ID);
  const localFiles = fs.readdirSync(SOURCE_DIR).filter((f) => /\.(jpg|jpeg|png|webp|avif|jfif)$/i.test(f));
  const unmapped = localFiles.filter((f) => !FILE_TO_PUBLIC_ID[f]);

  console.log(`Uploading ${mappedFiles.length} mapped images to ${BASE_ID}...`);
  let ok = 0;

  for (const fileName of mappedFiles) {
    const publicId = FILE_TO_PUBLIC_ID[fileName];
    // eslint-disable-next-line no-await-in-loop
    if (await uploadOne(fileName, publicId)) ok++;
  }

  if (unmapped.length > 0) {
    console.log('\nUnmapped local files (not uploaded):');
    unmapped.forEach((f) => console.log(`- ${f}`));
  }

  console.log(`\nDone: ${ok}/${mappedFiles.length} uploaded.`);
}

run().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
