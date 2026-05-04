/**
 * Script to check Firebase siteConfig/footerContent
 * Run with: node src/scripts/check-firebase-footer.cjs
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

async function checkFooterConfig() {
  console.log('\n📋 Checking Firebase siteConfig/layout document...\n');
  
  try {
    const doc = await db.collection('siteConfig').doc('layout').get();
    
    if (!doc.exists) {
      console.log('❌ No siteConfig/layout document found in Firebase');
      return;
    }
    
    const data = doc.data();
    console.log('✅ Found siteConfig/layout document\n');
    console.log('📊 Full document structure:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n\n📋 Footer Config Section:');
    console.log('=========================');
    
    if (data.footerConfig) {
      console.log('\n✅ footerConfig exists:');
      console.log(JSON.stringify(data.footerConfig, null, 2));
    } else {
      console.log('\n❌ footerConfig is MISSING from Firebase!');
    }
    
    // Check each section
    console.log('\n\n📋 Detailed Footer Sections:');
    console.log('=============================');
    
    const sections = ['brand', 'footerMenuLinks', 'techMenuLinks', 'social', 'columns', 'copyrightTemplate'];
    
    for (const section of sections) {
      if (data.footerConfig && data.footerConfig[section]) {
        console.log(`\n✅ ${section}:`);
        console.log(JSON.stringify(data.footerConfig[section], null, 2));
      } else {
        console.log(`\n❌ ${section}: MISSING`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching Firebase config:', error);
  }
}

checkFooterConfig();
