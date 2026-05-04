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
    } catch (error) {
      // Try next candidate
    }
  }

  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data.private_key === 'string' && data.private_key.includes('\\n')) {
        data.private_key = data.private_key.replace(/\\n/g, '\n');
      }
      return data;
    } catch (error) {
      // ignore
    }
  }

  return null;
}

const docId = process.argv.find((arg) => arg.startsWith('--docId='))?.split('=')[1] || 'foodDrinksPage';
const shouldDeleteOld = process.argv.includes('--deleteOld');
const sourceDocId = 'restaurantsPage';

const serviceAccount = loadServiceAccount();
if (!serviceAccount) {
  console.error('[seed] No service account found.');
  console.error('[seed] Place serviceAccountKey.json in .secrets/ or set GOOGLE_APPLICATION_CREDENTIALS.');
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
  id: docId,
  mainTitle: 'Food & Drinks of Kazakhstan',
  headerDescription:
    'Signature dishes, tea rituals, regional specialties, and modern dining — a complete guide to the country’s table.',
  heroKicker: 'Taste the Tradition',
  headerBackgroundPublicId: 'content/pages/foodDrinks/main_dastarkhan',
  headerBackgroundImageAriaLabel: 'Kazakh food and drinks table spread',
  articleViews: 1200,
  articleLikes: 150,
  articleComments: 5,
  readTimeMinutes: 10,
  estimatedReadTime: 'Approx. 10 min read',
  location: 'Kazakhstan',
  category: 'Culture',
  breadcrumbs: [
    { href: '/', label: 'Home' },
    { href: '/food-drink', label: 'Food & Drinks' }
  ],
  seo: {
    canonicalUrl: 'https://verynice.kz/food-drink',
    title: 'Food & Drinks | VeryNice.kz',
    description:
      'Discover Kazakhstan’s signature dishes, tea rituals, markets, and modern dining scenes across the country.',
    keywords:
      'Kazakhstan food, Kazakh cuisine, beshbarmak, kazy, tea ritual, markets, Almaty, Astana',
    ogImage: 'content/pages/foodDrinks/main_dastarkhan',
    shareTitle: 'Taste Kazakhstan'
  },
  tags: ['Food', 'Culture', 'Guide'],
  introMarkdown:
    'Kazakh cuisine is built for the open steppe: **hearty, seasonal, and communal**. Meals are designed to be shared around the *dastarkhan* (the family table), balancing tradition with a fast-growing modern dining scene in Almaty, Astana, and Shymkent.',
  updatedAt: now,
  createdAt: now
};

const highlights = [
  {
    id: 'signature-dishes',
    order: 1,
    title: 'Signature Dishes',
    description: 'Beshbarmak, kazy, manty, lagman, and the street-time classic, samsa.'
  },
  {
    id: 'tea-rituals',
    order: 2,
    title: 'Traditional Drinks',
    description: 'Black tea with milk, dried fruits, and warm baursak defines hospitality.'
  },
  {
    id: 'regional-tastes',
    order: 3,
    title: 'International Tastes',
    description: 'Global flavors from sushi and ramen to shawarma and pizza.'
  },
  {
    id: 'markets-food-halls',
    order: 4,
    title: 'Markets & Food Halls',
    description: 'Green Bazaar, Shymkent Central, and Astana’s modern food courts.'
  },
  {
    id: 'modern-dining',
    order: 5,
    title: 'Modern Dining',
    description: 'New Kazakh cuisine and Central Asian fusion shape the urban scene.'
  },
  {
    id: 'desserts',
    order: 6,
    title: 'Desserts & Treats',
    description: 'Chak-chak, zhent, kurt, and the famous Almaty apples.'
  }
];

const signatureDishes = [
  {
    id: 'beshbarmak',
    order: 1,
    title: 'Beshbarmak',
    description: 'The national dish: hand-cut noodles, tender meat, and rich broth served family-style.'
  },
  {
    id: 'kazy',
    order: 2,
    title: 'Kazy & Shuzhuk',
    description: 'Horsemeat sausages prized for depth of flavor and ceremonial occasions.'
  },
  {
    id: 'manty',
    order: 3,
    title: 'Manty',
    description: 'Large steamed dumplings filled with lamb or beef, often with pumpkin.'
  },
  {
    id: 'lagman',
    order: 4,
    title: 'Lagman',
    description: 'Pulled noodles with a spiced meat and vegetable sauce, a Silk Road staple.'
  },
  {
    id: 'samsa',
    order: 5,
    title: 'Samsa',
    description: 'Tandoor-baked pastries with lamb, onion, and cumin.'
  },
  {
    id: 'baursak',
    order: 6,
    title: 'Baursak',
    description: 'Golden, airy fried dough — the constant on every table.'
  }
];

const drinks = [
  { id: 'shubat', order: 1, title: 'Shubat', description: 'Fermented camel milk, creamy and slightly tangy.' },
  { id: 'kymyz', order: 2, title: 'Kymyz', description: 'Fermented mare’s milk, lightly sparkling and traditional.' },
  { id: 'ayran', order: 3, title: 'Ayran', description: 'Cold yogurt drink, perfect in summer.' },
  { id: 'tea', order: 4, title: 'Black Tea', description: 'Served in bowls with milk, sweets, and dried fruit.' },
  { id: 'coffee', order: 5, title: 'Local Coffee', description: 'Third-wave cafes thrive in Almaty and Astana.' }
];

const markets = [
  {
    id: 'green-bazaar',
    order: 1,
    title: 'Green Bazaar (Almaty)',
    description: 'The city’s iconic market for spices, fruits, dairy, and snacks.'
  },
  {
    id: 'shymkent-market',
    order: 2,
    title: 'Shymkent Central Market',
    description: 'A southern spice hub with the best street snacks and hot breads.'
  },
  {
    id: 'astana-halls',
    order: 3,
    title: 'Astana Food Halls',
    description: 'Modern food courts with Central Asian and global cuisine.'
  }
];

const restaurants = [
  {
    id: 'traditional-dastarkhan',
    order: 1,
    title: 'Traditional Dastarkhan',
    city: 'Almaty',
    description: 'Classic Kazakh menu, live music, and generous platters.',
    href: '/food-drink/traditional-dastarkhan'
  },
  {
    id: 'new-kazakh',
    order: 2,
    title: 'New Kazakh Cuisine',
    city: 'Astana',
    description: 'Modern tasting menus with steppe ingredients and clean plating.'
  },
  {
    id: 'silk-road-noodles',
    order: 3,
    title: 'Silk Road Noodles',
    city: 'Shymkent',
    description: 'Hand-pulled lagman and bold southern spices.'
  },
  {
    id: 'tea-house',
    order: 4,
    title: 'Tea House Courtyard',
    city: 'Turkistan',
    description: 'Slow tea rituals with dried fruits and sweets.'
  }
];

const articles = [
  {
    id: 'signature-dishes-article',
    order: 1,
    title: 'Signature Dishes You Must Try',
    contentMarkdown:
      'Kazakh cuisine centers on **hearty, nourishing dishes** made to feed large gatherings. Start with **beshbarmak**, then move to **kazy** and **shuzhuk** for deeper flavors. For quick meals, **samsa** and **manty** are staples you will find in most cities.\n\nIf you eat one dessert, choose **chak-chak** or **zhent**, and do not miss the **Almaty apple** in season.'
  },
  {
    id: 'regional-table-article',
    order: 2,
    title: 'Regional Table: How Tastes Change Across Kazakhstan',
    contentMarkdown:
      '**South (Shymkent & Turkistan)** leans spicy and aromatic, with tandoor breads and dense stews. **West (Mangystau)** favors seafood and coastal flavors. **East (Altai)** highlights dairy and berries, while **North & Central** focus on meat-heavy winter comfort dishes.\n\nUse your region as a guide for what to order — each area takes pride in its local specialties.'
  },
  {
    id: 'tea-rituals-article',
    order: 3,
    title: 'Tea Culture & Traditional Drinks',
    contentMarkdown:
      'Tea is a ritual of hospitality. It is served in bowls, poured in small portions, and paired with **baursak**, sweets, and dried fruit. Traditional drinks include **shubat** (camel milk), **kymyz** (mare’s milk), and **ayran** (yogurt drink).\n\nIf you are new to fermented milk drinks, try them chilled and in small servings.'
  },
  {
    id: 'markets-halls-article',
    order: 4,
    title: 'Markets, Food Halls & Street Snacks',
    contentMarkdown:
      'Markets are the best places to taste the country in one visit. **Green Bazaar** in Almaty is the icon, while **Shymkent Central** offers the richest spice selection. In Astana, modern **food halls** provide a clean, curated way to explore Central Asian dishes.\n\nStreet snacks to try: **samsa**, **kurt**, and fresh **baursak**.'
  },
  {
    id: 'modern-dining-article',
    order: 5,
    title: 'Modern Dining: New Kazakh Cuisine',
    contentMarkdown:
      'A new generation of chefs is modernizing classic recipes with lighter techniques and local sourcing. Expect **tasting menus**, refined plating, and seasonal ingredients.\n\nLook for restaurants that label themselves as **New Kazakh** or **Contemporary Central Asian** for the latest culinary wave.'
  },
  {
    id: 'practical-tips-article',
    order: 6,
    title: 'Practical Tips & Etiquette',
    contentMarkdown:
      'Meals are shared. Accepting food is polite, and **refilling tea** is a sign of care. If you do not want more, leave a little tea in your bowl. Tipping is appreciated in cities (5–10%), but not always expected.\n\nFor dietary needs, modern cafes in Almaty and Astana offer vegetarian and gluten-free options.'
  }
];

const faq = {
  title: 'Food & Drinks FAQs',
  items: [
    {
      question: 'What is the national dish of Kazakhstan?',
      answer:
        '**Beshbarmak** is the national dish — hand-cut noodles with tender meat, traditionally shared.',
      answerFormat: 'markdown'
    },
    {
      question: 'Is Kazakh cuisine spicy?',
      answer:
        'Most dishes are **savory rather than spicy**, but southern regions add more heat and aromatics.',
      answerFormat: 'markdown'
    },
    {
      question: 'Are vegetarian options available?',
      answer:
        'Yes — especially in Almaty and Astana. Look for modern cafes and international restaurants.',
      answerFormat: 'markdown'
    }
  ]
};

const photoGallery = {
  title: 'A Taste of Kazakhstan',
  photos: [
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes',
      alt: 'Kazakh table spread'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/beshbarmak',
      alt: 'Beshbarmak'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kuyrdak',
      alt: 'Kuyrdak'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kazan-zhappa',
      alt: 'Kazan zhappa'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/zhyzhmyzh',
      alt: 'Zhyzhmyzh'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/karynburme',
      alt: 'Karynburme'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/steamedmeat',
      alt: 'Steamed meat'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/driedcuredmeat',
      alt: 'Dried cured meat'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/kazy',
      alt: 'Kazy'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/karta',
      alt: 'Karta'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/shuzhuk',
      alt: 'Shuzhuk'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhaya',
      alt: 'Zhaya'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhal',
      alt: 'Zhal'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/sorpa',
      alt: 'Sorpa'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/kespe',
      alt: 'Kespe'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/sheepheadritual',
      alt: 'Sheep head ritual'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/tongue',
      alt: 'Tongue'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/liver',
      alt: 'Liver'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/heart',
      alt: 'Heart'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/lungsandliver',
      alt: 'Lungs and liver'
    },
    {
      publicId: 'content/pages/foodDrinks/TeaHouseCourtyard/teaQuickGuide',
      alt: 'Tea ritual'
    }
  ]
};

const collections = [
  { name: 'highlights', items: highlights },
  { name: 'signatureDishes', items: signatureDishes },
  { name: 'drinks', items: drinks },
  { name: 'markets', items: markets },
  { name: 'restaurants', items: restaurants },
  { name: 'articles', items: articles }
];

async function writeCollection(docRef, collectionName, items) {
  const batch = db.batch();
  items.forEach((item) => {
    const doc = docRef.collection(collectionName).doc(item.id);
    batch.set(doc, { ...item, updatedAt: now }, { merge: true });
  });
  await batch.commit();
}

async function seed() {
  const docRef = db.collection('pages').doc(docId);
  await docRef.set(pageData, { merge: true });

  for (const collection of collections) {
    await writeCollection(docRef, collection.name, collection.items);
  }

  await docRef.collection('faq').doc('main').set({ ...faq, updatedAt: now }, { merge: true });
  await docRef
    .collection('photoGallery')
    .doc('main')
    .set({ ...photoGallery, updatedAt: now }, { merge: true });

  if (shouldDeleteOld && sourceDocId && sourceDocId !== docId) {
    await db.collection('pages').doc(sourceDocId).delete();
    console.log(`[seed] Deleted old document pages/${sourceDocId}`);
  }

  console.log(`[seed] Food & Drinks seeded at pages/${docId}`);
}

seed().catch((error) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
