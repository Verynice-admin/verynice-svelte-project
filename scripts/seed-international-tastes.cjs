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
    } catch (err) {
      // Try next path
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
    } catch (err) {
      return null;
    }
  }

  return null;
}

const PUBLIC_ID_BASE = 'content/pages/foodDrinks/internationalTastes';

const PAGE_FIELDS = {
  internationalTastesTitle: 'International Tastes of Kazakhstan',
  internationalTastesDescription:
    'From East Asian noodles to Mediterranean mezze, discover the global flavors that define the modern Kazakh dining scene.',
  internationalTastesHeroKicker: 'World of Flavors',
  internationalTastesHeroPublicId: `${PUBLIC_ID_BASE}/hero`
};

const CATEGORIES = [
  {
    id: 'japan',
    title: 'Japan',
    description: 'Sushi, ramen, and teriyaki define Japanese comfort: clean flavors and careful technique.',
    order: 1
  },
  {
    id: 'korea',
    title: 'Korea',
    description: 'Fermented, spicy, and crispy favorites like kimchi and Korean fried chicken.',
    order: 2
  },
  {
    id: 'china',
    title: 'China',
    description: 'Wok-fried noodles, fried rice, and sweet-sour classics served for sharing.',
    order: 3
  },
  {
    id: 'thailand',
    title: 'Thailand',
    description: 'Bright balance of sweet, sour, salty, and heat with dishes like pad thai and tom yam.',
    order: 4
  },
  {
    id: 'taiwan',
    title: 'Taiwan',
    description: 'Bubble tea and street-snack culture with sweet teas and quick bites.',
    order: 5
  },
  {
    id: 'italy',
    title: 'Italy',
    description: 'Pasta, pizza, risotto, and espresso culture built on simple, rich ingredients.',
    order: 6
  },
  {
    id: 'france',
    title: 'France',
    description: 'Bistro classics and pastries with buttery doughs and creamy sauces.',
    order: 7
  },
  {
    id: 'usa',
    title: 'USA',
    description: 'Comfort food and diner staples: burgers, fried chicken, milkshakes, and steaks.',
    order: 8
  },
  {
    id: 'mexico',
    title: 'Mexico',
    description: 'Tacos and burritos with chiles, lime, and salsa: bold and fresh.',
    order: 9
  },
  {
    id: 'middle-east',
    title: 'Turkey & Middle East',
    description: 'Grilled meats, flatbreads, mezze, and spiced dips like hummus.',
    order: 10
  },
  {
    id: 'central-asia',
    title: 'Central Asia',
    description: 'Silk Road staples such as plov, lagman, manty, and samsa.',
    order: 11
  },
  {
    id: 'eastern-europe',
    title: 'Eastern Europe',
    description: 'Hearty soups, dumplings, and salads like borsch, pelmeni, and Olivier.',
    order: 12
  },
  {
    id: 'caucasus',
    title: 'Caucasus',
    description: 'Georgian breads and dumplings with rich doughs and spices.',
    order: 13
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean',
    description: 'Fresh vegetables, olives, feta, and olive oil-driven flavors.',
    order: 14
  }
];

const CATEGORY_DESCRIPTIONS = {
  japan: 'A Japanese favorite that is easy to find in Kazakh cities.',
  korea: 'A Korean specialty loved for bold flavors.',
  china: 'A Chinese classic popular across local menus.',
  thailand: 'A Thai dish known for sweet, sour, and spicy balance.',
  taiwan: 'A Taiwanese street classic that has become a cafe staple.',
  italy: 'An Italian staple served in restaurants and cafes.',
  france: 'A French classic with timeless appeal.',
  usa: 'An American comfort favorite found everywhere.',
  mexico: 'A Mexican street-food icon.',
  'middle-east': 'A Middle Eastern or Turkish staple found in city eateries.',
  'central-asia': 'A Central Asian dish with Silk Road roots.',
  'eastern-europe': 'An Eastern European comfort classic.',
  caucasus: 'A Caucasus specialty with rich doughs and spices.',
  mediterranean: 'A Mediterranean dish centered on fresh ingredients.'
};

const DISH_DESCRIPTIONS = {
  sushi:
    'Japanese dish of vinegared rice with raw or cooked fish and vegetables, served with soy, wasabi, and pickled ginger.',
  ramen:
    'Japanese noodle soup with a long-simmered broth, wheat noodles, and toppings like pork, egg, scallions, and nori.',
  'teriyaki-dishes':
    'Japanese grilling style where meat or fish is glazed with soy, mirin, and sugar; usually served with rice and vegetables.',
  bibimbap:
    'Korean rice bowl topped with seasoned vegetables, meat, chili paste, and a fried egg, mixed before eating.',
  kimchi:
    'Korean fermented cabbage or radish with chili, garlic, and ginger; tangy, spicy, and rich in umami.',
  'korean-fried-chicken':
    'Korean double-fried chicken with a crisp crust, often coated in sweet-spicy gochujang sauce.',
  'chinese-fried-rice':
    'Chinese stir-fried rice with egg, scallions, soy sauce, and vegetables, often with chicken or shrimp.',
  'chinese-sweet-and-sour-chicken':
    'Chinese style crispy chicken in a glossy sweet-tart sauce with peppers and pineapple.',
  'wok-noodles':
    'Chinese-inspired noodles quickly stir-fried in a wok with vegetables, soy sauce, and your choice of protein.',
  dumplings:
    'Dough parcels filled with minced meat or vegetables, steamed, boiled, or pan-fried; common across East Asia.',
  'pad-thai':
    'Thai stir-fried rice noodles with tamarind, fish sauce, egg, peanuts, and lime; sweet, sour, and savory.',
  tom_yam:
    'Thai hot and sour soup with shrimp, lemongrass, galangal, chili, and lime leaf; bright and aromatic.',
  'bubble-tea':
    'Taiwanese tea drink mixed with milk or fruit and chewy tapioca pearls, served over ice.',
  pizza:
    'Italian baked flatbread with tomato sauce and mozzarella, topped with meats, vegetables, or herbs.',
  pasta:
    'Italian pasta tossed with sauces like tomato, pesto, or cream and finished with herbs or cheese.',
  risotto:
    'Italian rice cooked slowly in broth until creamy, often finished with butter, cheese, or mushrooms.',
  tiramisu:
    'Italian dessert of coffee-soaked ladyfingers layered with mascarpone and cocoa.',
  'coffee-espresso-based':
    'Italian-style espresso drinks such as cappuccino and latte made with rich coffee and steamed milk.',
  croissant:
    'French flaky pastry made from layered butter dough, crisp outside and soft inside.',
  'creme-brulee':
    'French vanilla custard topped with a caramelized sugar crust.',
  quiche:
    'French savory tart with eggs, cream, and fillings like cheese, ham, or vegetables.',
  ratatouille:
    'French stew of eggplant, zucchini, peppers, and tomatoes cooked with herbs and olive oil.',
  burger:
    'American grilled beef patty in a soft bun with cheese, lettuce, tomato, and sauces.',
  'hot-dog':
    'American sausage in a bun with toppings like mustard, ketchup, onions, or pickles.',
  'fried-chicken':
    'American-style seasoned chicken fried until golden and crisp.',
  steak:
    'Grilled or seared beef cut served with salt, pepper, herbs, or sauce.',
  milkshakes:
    'American dessert drink blended from ice cream and milk with chocolate or fruit flavors.',
  cheesecake:
    'Creamy baked dessert with a tangy cheese filling on a cookie crumb crust.',
  'ice-cream':
    'Frozen dessert made from cream, sugar, and flavorings like vanilla or berries.',
  'caesar-salad':
    'American salad with romaine, parmesan, croutons, and creamy dressing, often with chicken.',
  tacos:
    'Mexican tortillas filled with seasoned meat, salsa, onion, cilantro, and lime.',
  burritos:
    'Mexican flour tortilla wrapped around rice, beans, meat, cheese, and salsa.',
  kebab:
    'Turkish and Middle Eastern grilled meat, skewered or sliced, served with flatbread and salad.',
  doner:
    'Turkish spiced meat roasted on a vertical spit and shaved into bread with sauces.',
  shawarma:
    'Levantine marinated meat roasted on a spit, wrapped with garlic sauce and vegetables.',
  lahmacun:
    'Turkish thin flatbread topped with minced meat, herbs, and spices, baked until crisp.',
  pide:
    'Turkish boat-shaped flatbread filled with cheese, meat, or vegetables.',
  falafel:
    'Middle Eastern chickpea fritters fried until crisp, served in pita with tahini.',
  hummus:
    'Middle Eastern chickpea dip blended with tahini, lemon, garlic, and olive oil.',
  dolma:
    'Stuffed grape leaves or vegetables filled with rice, herbs, and sometimes minced meat.',
  baklava:
    'Layered pastry with nuts and honey or syrup; sweet and rich.',
  plov:
    'Central Asian rice pilaf cooked with meat, carrots, onions, and spices.',
  lagman:
    'Central Asian hand-pulled noodles topped with a savory meat and vegetable sauce.',
  manty:
    'Central Asian steamed dumplings filled with seasoned meat and onion, served with sauce.',
  samsa:
    'Central Asian baked pastry pockets filled with meat, onion, and spices.',
  shashlyk:
    'Skewered meat grilled over charcoal, popular across Central Asia and the Caucasus.',
  borsch:
    'Eastern European beet soup with cabbage and meat, served with sour cream.',
  blini:
    'Eastern European thin pancakes served with butter, sour cream, or savory fillings.',
  draniki:
    'Belarusian-style potato pancakes made from grated potatoes and onion.',
  pelmeni:
    'Russian-style small dumplings filled with minced meat, boiled and served with butter.',
  vareniki:
    'Ukrainian dumplings filled with potato, cheese, or fruit, topped with butter.',
  syrniki:
    'Eastern European cottage cheese pancakes, lightly sweet, often served with jam.',
  'olivier-salad':
    'Classic salad of diced potatoes, eggs, pickles, peas, and mayonnaise.',
  solyanka:
    'Hearty soup with mixed meats, pickles, and olives; tangy and rich.',
  cutlet:
    'Breaded meat patties pan-fried and served with potatoes or grains.',
  medovik:
    'Russian honey cake with thin layers and creamy filling.',
  'napoleon-cake':
    'Layered puff pastry dessert with pastry cream, flaky and buttery.',
  khachapuri:
    'Georgian cheese-filled bread, sometimes topped with an egg, baked until gooey.',
  khinkali:
    'Georgian dumplings filled with spiced meat and broth, eaten by hand.',
  'greek-salad':
    'Greek salad with tomatoes, cucumbers, olives, feta, and olive oil.'
};

const DISHES = [
  { id: 'sushi', title: 'Sushi', category: 'japan', order: 1 },
  { id: 'ramen', title: 'Ramen', category: 'japan', order: 2 },
  { id: 'teriyaki-dishes', title: 'Teriyaki Dishes', category: 'japan', order: 3 },

  { id: 'bibimbap', title: 'Bibimbap', category: 'korea', order: 4 },
  { id: 'kimchi', title: 'Kimchi', category: 'korea', order: 5 },
  { id: 'korean-fried-chicken', title: 'Korean Fried Chicken', category: 'korea', order: 6 },

  { id: 'chinese-fried-rice', title: 'Chinese Fried Rice', category: 'china', order: 7 },
  {
    id: 'chinese-sweet-and-sour-chicken',
    title: 'Chinese Sweet and Sour Chicken',
    category: 'china',
    order: 8
  },
  { id: 'wok-noodles', title: 'Wok Noodles', category: 'china', order: 9 },
  { id: 'dumplings', title: 'Dumplings', category: 'china', order: 10 },

  { id: 'pad-thai', title: 'Pad Thai', category: 'thailand', order: 11 },
  { id: 'tom_yam', title: 'Tom Yam', category: 'thailand', order: 12 },

  { id: 'bubble-tea', title: 'Bubble Tea', category: 'taiwan', order: 13 },

  { id: 'pizza', title: 'Pizza', category: 'italy', order: 14 },
  { id: 'pasta', title: 'Pasta', category: 'italy', order: 15 },
  { id: 'risotto', title: 'Risotto', category: 'italy', order: 16 },
  { id: 'tiramisu', title: 'Tiramisu', category: 'italy', order: 17 },
  { id: 'coffee-espresso-based', title: 'Coffee (Espresso-Based)', category: 'italy', order: 18 },

  { id: 'croissant', title: 'Croissant', category: 'france', order: 19 },
  { id: 'creme-brulee', title: 'Creme Brulee', category: 'france', order: 20 },
  { id: 'quiche', title: 'Quiche', category: 'france', order: 21 },
  { id: 'ratatouille', title: 'Ratatouille', category: 'france', order: 22 },

  { id: 'burger', title: 'Burger', category: 'usa', order: 23 },
  { id: 'hot-dog', title: 'Hot Dog', category: 'usa', order: 24 },
  { id: 'fried-chicken', title: 'Fried Chicken', category: 'usa', order: 25 },
  { id: 'steak', title: 'Steak', category: 'usa', order: 26 },
  { id: 'milkshakes', title: 'Milkshakes', category: 'usa', order: 27 },
  { id: 'cheesecake', title: 'Cheesecake', category: 'usa', order: 28 },
  { id: 'ice-cream', title: 'Ice Cream', category: 'usa', order: 29 },
  { id: 'caesar-salad', title: 'Caesar Salad', category: 'usa', order: 30 },

  { id: 'tacos', title: 'Tacos', category: 'mexico', order: 31 },
  { id: 'burritos', title: 'Burritos', category: 'mexico', order: 32 },

  { id: 'kebab', title: 'Kebab', category: 'middle-east', order: 33 },
  { id: 'doner', title: 'Doner', category: 'middle-east', order: 34 },
  { id: 'shawarma', title: 'Shawarma', category: 'middle-east', order: 35 },
  { id: 'lahmacun', title: 'Lahmacun', category: 'middle-east', order: 36 },
  { id: 'pide', title: 'Pide', category: 'middle-east', order: 37 },
  { id: 'falafel', title: 'Falafel', category: 'middle-east', order: 38 },
  { id: 'hummus', title: 'Hummus', category: 'middle-east', order: 39 },
  { id: 'dolma', title: 'Dolma', category: 'middle-east', order: 40 },
  { id: 'baklava', title: 'Baklava', category: 'middle-east', order: 41 },

  { id: 'plov', title: 'Plov', category: 'central-asia', order: 42 },
  { id: 'lagman', title: 'Lagman', category: 'central-asia', order: 43 },
  { id: 'manty', title: 'Manty', category: 'central-asia', order: 44 },
  { id: 'samsa', title: 'Samsa', category: 'central-asia', order: 45 },
  { id: 'shashlyk', title: 'Shashlyk', category: 'central-asia', order: 46 },

  { id: 'borsch', title: 'Borsch', category: 'eastern-europe', order: 47 },
  { id: 'blini', title: 'Blini', category: 'eastern-europe', order: 48 },
  { id: 'draniki', title: 'Draniki', category: 'eastern-europe', order: 49 },
  { id: 'pelmeni', title: 'Pelmeni', category: 'eastern-europe', order: 50 },
  { id: 'vareniki', title: 'Vareniki', category: 'eastern-europe', order: 51 },
  { id: 'syrniki', title: 'Syrniki', category: 'eastern-europe', order: 52 },
  { id: 'olivier-salad', title: 'Olivier Salad', category: 'eastern-europe', order: 53 },
  { id: 'solyanka', title: 'Solyanka', category: 'eastern-europe', order: 54 },
  { id: 'cutlet', title: 'Cutlet', category: 'eastern-europe', order: 55 },
  { id: 'medovik', title: 'Medovik', category: 'eastern-europe', order: 56 },
  { id: 'napoleon-cake', title: 'Napoleon Cake', category: 'eastern-europe', order: 57 },

  { id: 'khachapuri', title: 'Khachapuri', category: 'caucasus', order: 58 },
  { id: 'khinkali', title: 'Khinkali', category: 'caucasus', order: 59 },

  { id: 'greek-salad', title: 'Greek Salad', category: 'mediterranean', order: 60 }
].map((dish) => ({
  ...dish,
  description:
    DISH_DESCRIPTIONS[dish.id] ||
    dish.description ||
    CATEGORY_DESCRIPTIONS[dish.category] ||
    'A popular international favorite.',
  publicId: `${PUBLIC_ID_BASE}/${dish.id}`
}));

async function seed() {
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

  console.log('Seeding international tastes into pages/restaurantsPage...');

  await pageRef.set(PAGE_FIELDS, { merge: true });

  const batch = db.batch();

  for (const category of CATEGORIES) {
    const docRef = pageRef.collection('internationalTastesCategories').doc(category.id);
    batch.set(docRef, category, { merge: true });
  }

  for (const dish of DISHES) {
    const docRef = pageRef.collection('internationalTastes').doc(dish.id);
    batch.set(docRef, dish, { merge: true });
  }

  await batch.commit();

  console.log(
    `Done. Seeded ${CATEGORIES.length} categories and ${DISHES.length} dishes into restaurantsPage.`
  );
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
