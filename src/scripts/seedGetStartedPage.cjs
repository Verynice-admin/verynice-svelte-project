/**
 * Seed script to create getStartedPage document in Firestore
 * Run with: node src/scripts/seedGetStartedPage.js
 * 
 * Uses the same service account loading logic as firebaseAdmin.ts
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  // Priority 1: Try .secrets directory first
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

  // Priority 2: Environment variable with JSON string
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

  // Priority 3: Root directory (legacy support)
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
  console.error('❌ No Firebase service account found. Please provide either:');
  console.error('   1. A serviceAccountKey.json file in the .secrets/ directory, or');
  console.error('   2. A FIREBASE_SERVICE_ACCOUNT environment variable');
  process.exit(1);
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore();

async function seedGetStartedPage() {
  const docRef = db.collection('pages').doc('getStartedPage');
  
  try {
    // Check if document already exists
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log('⚠️  getStartedPage already exists. Skipping to avoid overwrite.');
      console.log('   Current data:', JSON.stringify(docSnap.data(), null, 2));
      return;
    }
    
    // Create the document
    const now = Timestamp.now();
    await docRef.set({
      mainTitle: 'Get Started',
      headerDescription: 'Choose how you\'d like to continue — sign in as a Traveller or a Business partner.',
      headerBackgroundPublicId: 'content/pages/get-started/get-started-background-image',
      isFeatured: false,
      createdAt: now,
      updatedAt: now
    });
    
    console.log('✅ Successfully created getStartedPage document');
    console.log('   Collection: pages');
    console.log('   Document: getStartedPage');
    console.log('   Fields:');
    console.log('     - mainTitle: "Get Started"');
    console.log('     - headerDescription: "Choose how you\'d like to continue..."');
    console.log('     - headerBackgroundPublicId: "content/pages/get-started/get-started-background-image"');
    console.log('     - isFeatured: false');
    console.log('     - createdAt: <timestamp>');
    console.log('     - updatedAt: <timestamp>');
    
  } catch (error) {
    console.error('❌ Error creating getStartedPage:', error);
    process.exit(1);
  }
}

seedGetStartedPage();
