import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();
const cwd = process.cwd();

function readJson(filePath) { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }

function loadServiceAccount() {
  const candidates = [
    path.resolve(cwd, '.secrets/serviceAccountKey.json'),
    path.resolve(cwd, '.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS ? path.resolve(cwd, process.env.GOOGLE_APPLICATION_CREDENTIALS) : null,
    path.resolve(cwd, 'serviceAccountKey.json'),
    path.resolve(cwd, 'service-account.json')
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { 
      if (fs.existsSync(candidate)) { 
        const data = readJson(candidate); 
        if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) data.private_key = data.private_key.replace(/\\n/g, '\n'); 
        return data; 
      } 
    } catch (e) { }
  }
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    let data;
    try { data = JSON.parse(jsonStr); } catch (e) { }
    if (data && typeof data.private_key === 'string' && data.private_key.includes('\\n')) data.private_key = data.private_key.replace(/\\n/g, '\n');
    return data || null;
  }
  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) { console.error('No service account'); process.exit(1); }
if (!getApps().length) initializeApp({ credential: cert(serviceAccount), projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id });

const db = getFirestore();
const now = new Date();

const comments = [
  { author: 'Sarah M.', text: 'The felt-making demonstration in Almaty was incredible! Watching the women work together to create those beautiful patterns was a highlight of my trip.', postId: 'cultureArtsCrafts' },
  { author: 'Michael K.', text: 'I bought a traditional Kazakh bracelet in Astana. The craftsmanship is amazing - been wearing it every day since!', postId: 'cultureArtsCrafts' },
  { author: 'Elena T.', text: 'The eagle hunting show in the Altai mountains was unforgettable. Such a unique cultural experience!', postId: 'cultureArtsCrafts' },
  { author: 'David L.', text: 'Anyone know where I can find authentic keste embroidery in Almaty?', postId: 'cultureArtsCrafts' }
];

async function seedComments() {
  console.log('Seeding comments...\n');
  for (const c of comments) {
    const docRef = db.collection('pages/' + c.postId + '/comments').doc();
    await docRef.set({
      author: c.author,
      text: c.text,
      createdAt: now,
      likes: 0
    });
    console.log('Added comment: ' + c.author);
  }
  console.log('\nDone!');
}

seedComments().catch(console.error);
