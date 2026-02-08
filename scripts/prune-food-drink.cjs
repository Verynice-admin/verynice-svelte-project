const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  const candidates = [
    path.resolve('.secrets/serviceAccountKey.json'),
    path.resolve('.secrets/service-account.json'),
    process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
      : null,
    path.resolve('serviceAccountKey.json'),
    path.resolve('service-account.json')
  ].filter(Boolean);

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (typeof raw.private_key === 'string' && raw.private_key.includes('\\n')) {
          raw.private_key = raw.private_key.replace(/\\n/g, '\n');
        }
        return raw;
      }
    } catch (_) {
      // try next
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const raw = JSON.parse(jsonStr);
      if (typeof raw.private_key === 'string' && raw.private_key.includes('\\n')) {
        raw.private_key = raw.private_key.replace(/\\n/g, '\n');
      }
      return raw;
    } catch (_) {
      return null;
    }
  }

  return null;
}

const BLOCKED_HIGHLIGHTS = new Set([
  'traditional drinks',
  'markets & food halls',
  'modern dining',
  'desserts & treats'
]);

const BLOCKED_ARTICLE_IDS = new Set([
  'tea-rituals',
  'markets-halls',
  'modern-dining',
  'signature-dishes',
  'regional-table',
  'practical-tips'
]);
const BLOCKED_ARTICLE_TITLES = new Set([
  'tea culture & traditional drinks',
  'markets, food halls & street snacks',
  'modern dining: new kazakh cuisine',
  'signature dishes you must try',
  'regional table: how tastes change across kazakhstan',
  'practical tips & etiquette'
]);

const BLOCKED_RESTAURANTS = new Set(['new kazakh cuisine']);

const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

async function deleteDocs(docs, label) {
  if (!docs.length) return 0;
  const db = admin.firestore();
  let deleted = 0;
  for (let i = 0; i < docs.length; i += 450) {
    const batch = db.batch();
    docs.slice(i, i + 450).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += Math.min(450, docs.length - i);
  }
  console.log(`Deleted ${deleted} documents from ${label}.`);
  return deleted;
}

async function run() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('No Firebase service account found. Add one to .secrets/ or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
  }

  const db = admin.firestore();
  const pageRef = db.collection('pages').doc('restaurantsPage');

  const [highlightsSnap, articlesSnap, restaurantsSnap, marketsSnap, drinksSnap] = await Promise.all([
    pageRef.collection('highlights').get(),
    pageRef.collection('articles').get(),
    pageRef.collection('restaurants').get(),
    pageRef.collection('markets').get(),
    pageRef.collection('drinks').get()
  ]);

  const highlightsToDelete = highlightsSnap.docs.filter((doc) =>
    BLOCKED_HIGHLIGHTS.has(normalize(doc.data().title || doc.id))
  );

  const articlesToDelete = articlesSnap.docs.filter((doc) => {
    const data = doc.data();
    const id = normalize(data.articleId || data.sectionId || doc.id);
    const title = normalize(data.title || data.name || '');
    return BLOCKED_ARTICLE_IDS.has(id) || BLOCKED_ARTICLE_TITLES.has(title);
  });

  const restaurantsToDelete = restaurantsSnap.docs.filter((doc) =>
    BLOCKED_RESTAURANTS.has(normalize(doc.data().title || doc.id))
  );

  const marketsToDelete = marketsSnap.docs;
  const drinksToDelete = drinksSnap.docs;

  await deleteDocs(highlightsToDelete, 'highlights');
  await deleteDocs(articlesToDelete, 'articles');
  await deleteDocs(restaurantsToDelete, 'restaurants');
  await deleteDocs(marketsToDelete, 'markets');
  await deleteDocs(drinksToDelete, 'drinks');

  console.log('Food & Drinks cleanup complete.');
}

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
