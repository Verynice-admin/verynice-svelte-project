/**
 * Script to update header menu order in Firebase
 * Run with: node src/scripts/update-header-menu.cjs
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

// New menu order - History after Travel Tips
const newMenuOrder = [
  { url: '/destinations', text: 'Destinations' },
  { url: '/culture', text: 'Heritage' },
  { url: '/food-drink', text: 'Food & Drinks' },
  { url: '/travel-tips', text: 'Travel Tips' },
  { url: '/history', text: 'History' },
  { url: '/get-started', text: 'Get Started' },
  { url: '/about-borat', text: 'i-Borat' }
];

async function updateHeaderMenu() {
  console.log('\n📋 Updating header menu order in Firebase...\n');
  
  try {
    const docRef = db.collection('siteConfig').doc('layout');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('❌ No siteConfig/layout document found in Firebase');
      return;
    }
    
    const existingData = doc.data();
    console.log('✅ Found existing siteConfig/layout document');
    
    // Update headerConfig with new menu order
    const updatedData = {
      ...existingData,
      headerConfig: {
        ...existingData.headerConfig,
        menu: newMenuOrder
      },
      updatedAt: new Date()
    };
    
    await docRef.set(updatedData, { merge: true });
    
    console.log('✅ Successfully updated header menu order!\n');
    
    // Verify the write
    const verifyDoc = await docRef.get();
    console.log('📊 Verification - new menu order:');
    console.log(JSON.stringify(verifyDoc.data()?.headerConfig?.menu, null, 2));
    
    console.log('\n✅ Done! New menu order:');
    newMenuOrder.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} -> ${item.url}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating Firebase:', error);
  }
}

updateHeaderMenu();