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
    } catch (error) {}
  }
  return null;
}

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[seed] No service account found.');
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

const pageData = {
  id: 'internationalTastesPage',
  title: 'International Tastes of Kazakhstan',
  description: 'From Italian pizza to Korean fried chicken, discover the global flavors that define the modern Kazakh dining scene.',
  heroKicker: 'World of Flavors',
  headerBackgroundPublicId: 'content/pages/foodDrinks/internationalTastes/tom_yam',
  updatedAt: now,
  createdAt: now
};

const categories = [
	{
		id: 'asian',
		title: 'Asian Cuisine',
		description: 'The vibrant flavors of East and Southeast Asia, from sushi to spicy noodles.',
		order: 1
	},
	{
		id: 'european',
		title: 'European & Western',
		description: 'Classics from Italy, France, and beyond, prepared with local flair.',
		order: 2
	},
	{
		id: 'regional',
		title: 'Regional & Post-Soviet',
		description: 'Beloved dishes from neighboring regions and shared culinary history.',
		order: 3
	},
    {
        id: 'fast-food',
        title: 'Fast Food & Street Eats',
        description: 'Quick, satisfying bites from around the world.',
        order: 4
    },
    {
        id: 'desserts',
        title: 'Desserts & Sweets',
        description: 'Indulgent treats to finish your meal.',
        order: 5
    }
];

const categoryMap = {
    'Baklava': 'regional', 'Bibimbap': 'asian', 'Blini': 'regional', 'Borsch': 'regional',
    'Bubble_tea': 'asian', 'Burger': 'fast-food', 'Burritos': 'fast-food', 'Caesar_salad': 'european',
    'Cheesecake': 'desserts', 'chinese_Fried_rice': 'asian', 'chinese_Sweet_and_ sour_chicken': 'asian',
    'Coffee_espresso-based': 'european', 'Crème_brûlée': 'desserts', 'Croissant': 'european',
    'Cutlet': 'regional', 'dolma': 'regional', 'Doner': 'fast-food', 'Draniki': 'regional',
    'Dumplings': 'regional', 'Falafel': 'regional', 'Fried chicken': 'fast-food', 'Greek_salad': 'european',
    'Hot_dog': 'fast-food', 'Hummus': 'regional', 'Ice_cream': 'desserts', 'Kebab': 'regional',
    'khachapuri': 'regional', 'khinkali': 'regional', 'Kimchi': 'asian', 'Korean_fried_chicken': 'asian',
    'lagman': 'regional', 'Lahmacun': 'regional', 'manty': 'regional', 'Medovik': 'desserts',
    'Milkshakes': 'european', 'Napoleón_cake': 'desserts', 'Olivier_salad': 'regional', 'Pad_thai': 'asian',
    'Pasta': 'european', 'pelmeni': 'regional', 'Pide': 'regional', 'Pizza': 'european',
    'plov': 'regional', 'Quiche': 'european', 'Ramen': 'asian', 'Ratatouille': 'european',
    'Risotto': 'european', 'samsa': 'regional', 'shashlyk': 'regional', 'Shawarma': 'fast-food',
    'Solyanka': 'regional', 'Steak': 'european', 'Sushi': 'asian', 'Syrniki': 'desserts',
    'Tacos': 'fast-food', 'Teriyaki_dishes': 'asian', 'Tiramisu': 'desserts', 'Vareniki': 'regional',
    'Wok_noodles': 'asian'
};

const dishFiles = Object.keys(categoryMap);

const dishes = dishFiles.map((filename, index) => {
    // Clean filename for title: replace _ with space, capitalize
    let title = filename.replace(/_/g, ' ');
    // Handle specific cases
    if (title.includes('chinese Sweet and sour')) title = 'Chinese Sweet & Sour Chicken';
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);

    const id = filename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = categoryMap[filename] || 'regional';
    
    return {
        id,
        title,
        category,
        description: `Delicious ${title}, a popular choice in Kazakhstan's dining scene.`,
        publicId: `content/pages/foodDrinks/internationalTastes/${id}`,
        order: index + 1
    };
});

async function seed() {
  console.log('[seed] Seeding International Tastes...');
  const pageRef = db.collection('pages').doc('internationalTastesPage');
  
  await pageRef.set(pageData, { merge: true });

  // Categories
  console.log('[seed] Writing categories...');
  const catBatch = db.batch();
  for (const cat of categories) {
    const doc = pageRef.collection('categories').doc(cat.id);
    catBatch.set(doc, { ...cat, updatedAt: now }, { merge: true });
  }
  await catBatch.commit();

  // Dishes
  console.log(`[seed] Writing ${dishes.length} dishes...`);
  const dishBatch = db.batch(); // Batch limit 500, we have ~60, so one batch is fine.
  for (const dish of dishes) {
    const doc = pageRef.collection('dishes').doc(dish.id);
    dishBatch.set(doc, { ...dish, updatedAt: now }, { merge: true });
  }
  await dishBatch.commit();

  console.log('[seed] ✅ International Tastes seeded successfully!');
}

seed().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
