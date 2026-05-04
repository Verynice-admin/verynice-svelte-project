/**
 * Seed script to create dashboard page documents in Firestore
 * Run with: node src/scripts/seedDashboardPages.cjs
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  const secretsPaths = [
    path.join(process.cwd(), '.secrets/serviceAccountKey.json'),
    path.join(process.cwd(), '.secrets/service-account.json')
  ];

  for (const secretsPath of secretsPaths) {
    try {
      if (fs.existsSync(secretsPath)) {
        const sa = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const sa = JSON.parse(jsonStr);
      if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      return sa;
    } catch (error) {
      // Continue
    }
  }

  const rootPaths = [
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'service-account.json')
  ];

  for (const rootPath of rootPaths) {
    try {
      if (fs.existsSync(rootPath)) {
        const sa = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue
    }
  }

  return null;
}

const serviceAccount = loadServiceAccount();

if (!serviceAccount) {
  console.error('❌ No Firebase service account found.');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore();

async function seedDashboardPages() {
  const now = Timestamp.now();

  const pages = [
    {
      docId: 'travelerDashboardPage',
      data: {
        mainTitle: 'Traveller Dashboard',
        headerDescription: 'Manage your trips and saved destinations',
        isFeatured: false,
        createdAt: now,
        updatedAt: now
      }
    },
    {
      docId: 'businessDashboardPage',
      data: {
        mainTitle: 'Business Dashboard',
        headerDescription: 'Manage your listings and business profile',
        isFeatured: false,
        createdAt: now,
        updatedAt: now
      }
    }
  ];

  for (const page of pages) {
    const docRef = db.collection('pages').doc(page.docId);
    
    try {
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        console.log(`⚠️  ${page.docId} already exists. Skipping.`);
        continue;
      }
      
      await docRef.set(page.data);
      console.log(`✅ Created ${page.docId}`);
      
    } catch (error) {
      console.error(`❌ Error creating ${page.docId}:`, error);
    }
  }

  console.log('✅ Dashboard pages seeded successfully!');
}

seedDashboardPages();
