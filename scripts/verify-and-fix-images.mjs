import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config();

const cwd = process.cwd();

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadServiceAccount() {
  const candidates = [
    path.resolve(cwd, '.secrets/serviceAccountKey.json'),
    path.resolve(cwd, '.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(cwd, process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    path.resolve(cwd, 'serviceAccountKey.json'),
    path.resolve(cwd, 'service-account.json')
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const data = readJson(candidate);
        if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
          data.private_key = data.private_key.replace(/\\n/g, '\n');
        }
        return data;
      }
    } catch (error) {}
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
        data.private_key = data.private_key.replace(/\\n/g, '\n');
      }
      return data;
    } catch (error) {}
  }

  return null;
}

function checkImage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => {
      resolve(0);
    });
  });
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[verify] No service account found.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = getFirestore();

async function verifyAndFix() {
  const images = readJson(path.join(cwd, 'scripts/uploaded-art-crafts-home.json'));
  
  console.log('[verify] Checking', images.length, 'images...');
  
  const validImages = [];
  const brokenImages = [];
  
  for (const img of images) {
    const status = await checkImage(img.url);
    if (status === 200) {
      validImages.push(img);
    } else {
      brokenImages.push({ ...img, status });
      console.log('[verify] BROKEN:', img.category, img.publicId, 'HTTP', status);
    }
  }
  
  console.log('[verify] Valid:', validImages.length, 'Broken:', brokenImages.length);
  
  if (brokenImages.length > 0) {
    fs.writeFileSync(
      path.join(cwd, 'scripts/uploaded-art-crafts-home.json'),
      JSON.stringify(validImages, null, 2)
    );
    console.log('[verify] Updated JSON file with valid images only');
  }
  
  function getImagesByCategory(cat) {
    return validImages.filter(i => i.category === cat).map(i => i.publicId);
  }
  
  const sections = [
    { id: 'felt-making', galleryImages: getImagesByCategory('felt-making') },
    { id: 'embroidery', galleryImages: getImagesByCategory('keste') },
    { id: 'leather-woodwork', galleryImages: getImagesByCategory('crafts') },
    { id: 'metalwork-jewelry', galleryImages: getImagesByCategory('jewelry') },
    { id: 'eagle-hunting', galleryImages: getImagesByCategory('eagle-hunting') }
  ];
  
  const pageRef = db.collection('pages').doc('heritage').collection('articles').doc('arts-crafts');
  const sectionsRef = pageRef.collection('sections');
  
  for (const section of sections) {
    await sectionsRef.doc(section.id).update({
      galleryImages: section.galleryImages,
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log('[verify] Updated', section.id, 'with', section.galleryImages.length, 'valid images');
  }
  
  console.log('[verify] Done!');
  process.exit(0);
}

verifyAndFix();
