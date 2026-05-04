/**
 * Script to seed Firebase siteConfig/footerContent
 * Run with: node src/scripts/seed-firebase-footer.cjs
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

// Complete footer content to be stored in Firebase
const footerContent = {
  brand: {
    siteName: 'VeryNice.kz',
    homeUrl: '/',
    logoUrl: '',
    logoAlt: 'VeryNice.kz',
    tagline: 'Discover the heart of Central Asia.',
    description: 'Your ultimate guide to the history, culture, and hidden gems of Kazakhstan. From the steppes to the cities, we cover it all.'
  },
  title: 'Explore',
  footerMenuLinks: [
    { text: 'Cities', url: '/destinations' },
    { text: 'History', url: '/history' },
    { text: 'Destinations', url: '/destinations' },
    { text: 'Food & Drink', url: '/food-drink' },
    { text: 'Tips', url: '/travel-tips' }
  ],
  techMenuLinks: [
    { text: 'Privacy Policy', url: '/privacy' },
    { text: 'Terms of Use', url: '/terms' },
    { text: 'Contact', url: '/contact' }
  ],
  social: [
    { text: 'Instagram', url: 'https://www.instagram.com', icon: 'IG' },
    { text: 'YouTube', url: 'https://www.youtube.com', icon: 'YT' },
    { text: 'TikTok', url: 'https://www.tiktok.com', icon: 'TT' }
  ],
  columns: [
    {
      title: 'Destinations',
      links: [
        { text: 'Astana', url: '/destinations/astana' },
        { text: 'Almaty', url: '/destinations/almaty' }
      ]
    },
    {
      title: 'Useful Info',
      links: [
        { text: 'Itineraries', url: '/travel-tips/itineraries' },
        { text: 'Weather', url: '/travel-tips/weather' },
        { text: 'Transport', url: '/travel-tips/transport' },
        { text: 'Visas', url: '/travel-tips/visas' }
      ]
    }
  ],
  copyrightTemplate: '© {year} VeryNice.kz. All rights reserved.'
};

async function seedFooterConfig() {
  console.log('\n📋 Seeding Firebase siteConfig/footerContent...\n');
  
  try {
    // First, get existing document to preserve other fields
    const docRef = db.collection('siteConfig').doc('layout');
    const doc = await docRef.get();
    
    let existingData = {};
    if (doc.exists) {
      existingData = doc.data();
      console.log('✅ Found existing siteConfig/layout document');
    } else {
      console.log('📝 Creating new siteConfig/layout document');
    }
    
    // Merge existing data with footerConfig
    const updatedData = {
      ...existingData,
      footerConfig: footerContent,
      updatedAt: new Date()
    };
    
    // Write to Firebase
    await docRef.set(updatedData, { merge: true });
    
    console.log('✅ Successfully seeded footerConfig to Firebase!\n');
    
    // Verify the write
    const verifyDoc = await docRef.get();
    console.log('📊 Verification - footerConfig in Firebase:');
    console.log(JSON.stringify(verifyDoc.data()?.footerConfig, null, 2));
    
    console.log('\n✅ Done! The footer should now display all content from Firebase.');
    
  } catch (error) {
    console.error('❌ Error seeding Firebase config:', error);
  }
}

seedFooterConfig();
