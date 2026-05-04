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
    } catch (error) {
      // Try next candidate
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
        data.private_key = data.private_key.replace(/\\n/g, '\n');
      }
      return data;
    } catch (error) {
      // ignore
    }
  }

  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[restructure] No service account found.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = getFirestore();
const now = FieldValue.serverTimestamp();

async function restructure() {
  console.log('[restructure] Restructuring heritage...\n');
  
  // 1. Check if heritage exists (it should)
  const heritageRef = db.collection('pages').doc('heritage');
  const heritageSnap = await heritageRef.get();
  
  if (!heritageSnap.exists) {
    console.log('[restructure] Creating heritage parent...');
    await heritageRef.set({
      id: 'heritage',
      mainTitle: 'Heritage',
      headerDescription: 'Discover the rich cultural heritage of Kazakhstan.',
      heroKicker: 'Living Traditions',
      location: 'Kazakhstan',
      isFeatured: false,
      headerBackgroundPublicId: 'content/pages/heritage/traditionalClothing/traditional-clothing-hero',
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Heritage' }
      ],
      seo: {
        title: 'Heritage | VeryNice',
        description: 'Explore the cultural heritage of Kazakhstan.'
      },
      updatedAt: now,
      createdAt: now
    });
  }
  
  // 2. Create articles subcollection
  console.log('[restructure] Creating articles subcollection...');
  
  // Traditional Clothing article
  const traditionalClothingRef = heritageRef.collection('articles').doc('traditional-clothing');
  await traditionalClothingRef.set({
    id: 'traditional-clothing',
    order: 1,
    mainTitle: 'Traditional Clothing & Adornments',
    headerDescription: 'From the majestic Saukele bridal headdress to the flowing Chapan robes and intricate silver jewelry.',
    heroKicker: 'Woven Heritage',
    location: 'Kazakhstan',
    headerBackgroundPublicId: 'content/pages/heritage/traditionalClothing/traditional-clothing-hero',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Heritage', href: '/heritage' },
      { label: 'Traditional Clothing' }
    ],
    seo: {
      title: 'Traditional Clothing & Adornments | Heritage | VeryNice',
      description: 'Discover the Saukele, Chapan, Shapan, and ornate jewelry that define Kazakh traditional dress.'
    },
    updatedAt: now,
    createdAt: now
  });
  console.log('[restructure] Created: heritage/articles/traditional-clothing');
  
  // 3. Copy sections from heritageTraditionalClothing
  const oldDocRef = db.collection('pages').doc('heritageTraditionalClothing');
  const oldSectionsSnap = await oldDocRef.collection('sections').orderBy('order').get();
  
  for (const doc of oldSectionsSnap.docs) {
    const data = doc.data();
    await traditionalClothingRef.collection('sections').doc(doc.id).set({
      ...data,
      updatedAt: now,
      createdAt: now
    });
    console.log(`[restructure] Copied section: ${doc.id}`);
  }
  
  // 4. Delete heritageTraditionalClothing and its sections
  const oldSections = await oldDocRef.collection('sections').listDocuments();
  for (const sectionDoc of oldSections) {
    await sectionDoc.delete();
  }
  await oldDocRef.delete();
  console.log('[restructure] Deleted: pages/heritageTraditionalClothing');
  
  // 5. Also clean up old sections subcollection under heritage if exists
  const oldHeritageSections = await heritageRef.collection('sections').listDocuments();
  for (const sectionDoc of oldHeritageSections) {
    await sectionDoc.delete();
  }
  console.log('[restructure] Cleaned up old sections under heritage');
  
  console.log('\n[restructure] Done! New structure:');
  console.log('  - pages/heritage (parent)');
  console.log('  - pages/heritage/articles/traditional-clothing (article)');
  console.log('  - pages/heritage/articles/traditional-clothing/sections/* (sections)');
}

restructure().catch(err => {
  console.error('[restructure] Error:', err);
  process.exit(1);
});
