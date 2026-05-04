require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(require('fs').readFileSync('./.secrets/serviceAccountKey.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function addTravelTipsPageData() {
  const pageRef = db.collection('pages').doc('travelTipsPage');
  
  console.log('Adding travel tips page data...');
  
  // Add main page data
  await pageRef.set({
    id: 'travelTipsPage',
    seo: {
      title: 'Travel Tips for Kazakhstan | VeryNice',
      description: 'Essential travel tips for visiting Kazakhstan: visa requirements, best time to visit, safety, getting around, and more.'
    },
    mainTitle: 'Travel Tips for Kazakhstan',
    headerDescription: 'Essential guides for your Kazakhstan adventure: visa info, best seasons, safety tips, transportation, and practical advice.',
    heroKicker: 'Plan Your Trip',
    location: 'Kazakhstan',
    articleViews: 0,
    articleLikes: 0,
    articleComments: 0,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Travel Tips' }
    ],
    headerBackgroundPublicId: 'site/backgrounds/attractions-hero',
    introMarkdown: `Welcome to Kazakhstan! Here are essential travel tips to help you plan your perfect trip. From visa requirements to getting around, we've got you covered.`
  }, { merge: true });
  
  console.log('Added page data!');
  
  // Add highlights subcollection
  const highlightsRef = pageRef.collection('highlights');
  
  const highlights = [
    {
      id: 'best-time',
      title: 'Best Time to Visit',
      description: 'Kazakhstan has extreme continental weather: scorching summers and freezing winters.',
      order: 1,
      tier: 1,
      region: 'General'
    },
    {
      id: 'visa-requirements',
      title: 'Visa & Entry',
      description: 'Most travelers enjoy visa-free entry. Check requirements for your country.',
      order: 2,
      tier: 1,
      region: 'General'
    },
    {
      id: 'safety',
      title: 'Safety & Precautions',
      description: 'Kazakhstan is generally safe with Level 1 travel advisory.',
      order: 3,
      tier: 1,
      region: 'General'
    },
    {
      id: 'getting-around',
      title: 'Getting There & Around',
      description: 'Fly into Almaty or Astana. Use Yandex Go for taxis.',
      order: 4,
      tier: 1,
      region: 'General'
    },
    {
      id: 'airport-taxis',
      title: 'Airport Taxis',
      description: 'Use Yandex Go or inDriver for safe airport transfers.',
      order: 5,
      tier: 1,
      region: 'General'
    },
    {
      id: 'money-costs',
      title: 'Money & Costs',
      description: 'Kazakhstan is affordable. Budget 2,000-5,000 KZT for meals.',
      order: 6,
      tier: 1,
      region: 'General'
    }
  ];
  
  // Clear existing highlights
  const existingHighlights = await highlightsRef.get();
  const batch = db.batch();
  for (const doc of existingHighlights.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
  
  // Add new highlights
  for (const highlight of highlights) {
    await highlightsRef.doc(highlight.id).set(highlight);
    console.log(`Added highlight: ${highlight.title}`);
  }
  
  console.log('Done!');
}

addTravelTipsPageData()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
