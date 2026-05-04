/**
 * Script to update Firebase getStartedPage with card background images
 * Run with: node src/scripts/update-getstarted-cards.cjs
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
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

async function updateGetStartedPage() {
  console.log('\n📋 Updating Firebase getStartedPage with card background images...\n');
  
  try {
    const docRef = db.collection('pages').doc('getStartedPage');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('❌ No getStartedPage document found in Firebase');
      return;
    }
    
    const existingData = doc.data();
    console.log('✅ Found existing getStartedPage document');
    
    // Update with new card background image fields
    const updatedData = {
      ...existingData,
      travellerCardBackgroundPublicId: 'content/pages/getStarted/travellerSignIn',
      businessCardBackgroundPublicId: 'content/pages/getStarted/businessSignIn',
      updatedAt: new Date()
    };
    
    await docRef.set(updatedData, { merge: true });
    
    console.log('✅ Successfully updated getStartedPage with card backgrounds!\n');
    
    // Verify the write
    const verifyDoc = await docRef.get();
    console.log('📊 Verification - updated fields:');
    console.log('travellerCardBackgroundPublicId:', verifyDoc.data()?.travellerCardBackgroundPublicId);
    console.log('businessCardBackgroundPublicId:', verifyDoc.data()?.businessCardBackgroundPublicId);
    
    console.log('\n✅ Done! Now update the frontend to use these fields.');
    
  } catch (error) {
    console.error('❌ Error updating Firebase:', error);
  }
}

updateGetStartedPage();