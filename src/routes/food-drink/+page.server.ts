import { adminDB } from '$lib/server/firebaseAdmin';
import { validateImage } from '$lib/utils/sanitize';

function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => serializeDates(item));
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k];
    if (v && typeof v.toDate === 'function') {
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
        out[k] = { lat: v.latitude, lng: v.longitude };
      } else {
        out[k] = serializeDates(v);
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

const FALLBACK_PAGE = {
  seo: {
    title: 'Food & Drinks | VeryNice',
    description: 'A rich guide to Kazakhstan’s signature dishes, tea culture, markets, and dining.'
  },
  mainTitle: 'Food & Drinks of Kazakhstan',
  headerDescription:
    'Signature dishes, tea rituals, regional specialties, and modern dining — a complete guide to the country’s table.',
  heroKicker: 'Taste the Tradition',
  location: 'Kazakhstan',
  articleViews: 0,
  articleLikes: 0,
  articleComments: 0,
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Food & Drinks' }],
  headerBackgroundPublicId: 'content/pages/foodDrinks/main_dastarkhan',
  introMarkdown:
    'Kazakh cuisine is built for the open steppe: **hearty, seasonal, and communal**. Meals are designed to be shared around the *dastarkhan* (the family table), balancing tradition with a fast-growing modern dining scene in Almaty, Astana, and Shymkent.'
};

const FALLBACK_HIGHLIGHTS = [
  {
    title: 'Signature Dishes',
    description: 'Beshbarmak, kazy, manty, lagman, and the street-time classic, samsa.'
  },
  {
    title: 'Traditional Drinks',
    description: 'Black tea with milk, dried fruits, and warm baursak defines hospitality.'
  },
  {
    title: 'International Tastes',
    description: 'Global flavors from sushi and ramen to shawarma and pizza.'
  },
  {
    title: 'Markets & Food Halls',
    description: 'Green Bazaar, Shymkent Central, and Astana’s modern food courts.'
  },
  {
    title: 'Modern Dining',
    description: 'New Kazakh cuisine and Central Asian fusion shape the urban scene.'
  },
  {
    title: 'Desserts & Treats',
    description: 'Chak-chak, zhent, kurt, and the famous Almaty apples.'
  }
];

const FALLBACK_SIGNATURE_DISHES = [
  {
    title: 'Beshbarmak',
    description:
      'The national dish: hand-cut noodles, tender meat, and rich broth served family-style.'
  },
  {
    title: 'Kazy & Shuzhuk',
    description: 'Horsemeat sausages prized for depth of flavor and ceremonial occasions.'
  },
  {
    title: 'Manty',
    description: 'Large steamed dumplings filled with lamb or beef, often with pumpkin.'
  },
  {
    title: 'Lagman',
    description:
      'Pulled noodles with a spiced meat and vegetable sauce, a Silk Road staple.'
  },
  {
    title: 'Samsa',
    description: 'Tandoor-baked pastries with lamb, onion, and cumin.'
  },
  {
    title: 'Baursak',
    description: 'Golden, airy fried dough — the constant on every table.'
  }
];

const FALLBACK_DRINKS = [
  { title: 'Shubat', description: 'Fermented camel milk, creamy and slightly tangy.' },
  { title: 'Kymyz', description: 'Fermented mare’s milk, lightly sparkling and traditional.' },
  { title: 'Ayran', description: 'Cold yogurt drink, perfect in summer.' },
  { title: 'Black Tea', description: 'Served in bowls with milk, sweets, and dried fruit.' },
  { title: 'Local Coffee', description: 'Third-wave cafes thrive in Almaty and Astana.' }
];

const FALLBACK_MARKETS = [
  {
    title: 'Green Bazaar (Almaty)',
    description: 'The city’s iconic market for spices, fruits, dairy, and snacks.'
  },
  {
    title: 'Shymkent Central Market',
    description: 'A southern spice hub with the best street snacks and hot breads.'
  },
  {
    title: 'Astana Food Halls',
    description: 'Modern food courts with Central Asian and global cuisine.'
  }
];

const FALLBACK_RESTAURANTS = [
  {
    title: 'Traditional Dastarkhan',
    city: 'Almaty',
    description: 'Classic Kazakh menu, live music, and generous platters.',
    href: '/food-drink/traditional-dastarkhan'
  },
  {
    title: 'New Kazakh Cuisine',
    city: 'Astana',
    description: 'Modern tasting menus with steppe ingredients and clean plating.'
  },
  {
    title: 'Silk Road Noodles',
    city: 'Shymkent',
    description: 'Hand-pulled lagman and bold southern spices.',
    href: '/food-drink/silk-road-noodles'
  },
  {
    title: 'Tea House Courtyard',
    city: 'Turkistan',
    description: 'Slow tea rituals with dried fruits and sweets.',
    href: '/food-drink/tea-house-courtyard'
  }
];

const FALLBACK_ARTICLES = [
  {
    id: 'signature-dishes',
    articleId: 'signature-dishes',
    order: 1,
    title: 'Signature Dishes You Must Try',
    contentMarkdown:
      'Kazakh cuisine centers on **hearty, nourishing dishes** made to feed large gatherings. Start with **beshbarmak**, then move to **kazy** and **shuzhuk** for deeper flavors. For quick meals, **samsa** and **manty** are staples you will find in most cities.\n\nIf you eat one dessert, choose **chak-chak** or **zhent**, and do not miss the **Almaty apple** in season.'
  },
  {
    id: 'regional-table',
    articleId: 'regional-table',
    order: 2,
    title: 'Regional Table: How Tastes Change Across Kazakhstan',
    contentMarkdown:
      '**South (Shymkent & Turkistan)** leans spicy and aromatic, with tandoor breads and dense stews. **West (Mangystau)** favors seafood and coastal flavors. **East (Altai)** highlights dairy and berries, while **North & Central** focus on meat-heavy winter comfort dishes.\n\nUse your region as a guide for what to order — each area takes pride in its local specialties.'
  },
  {
    id: 'tea-rituals',
    articleId: 'tea-rituals',
    order: 3,
    title: 'Tea Culture & Traditional Drinks',
    contentMarkdown:
      'Tea is a ritual of hospitality. It is served in bowls, poured in small portions, and paired with **baursak**, sweets, and dried fruit. Traditional drinks include **shubat** (camel milk), **kymyz** (mare’s milk), and **ayran** (yogurt drink).\n\nIf you are new to fermented milk drinks, try them chilled and in small servings.'
  },
  {
    id: 'markets-halls',
    articleId: 'markets-halls',
    order: 4,
    title: 'Markets, Food Halls & Street Snacks',
    contentMarkdown:
      'Markets are the best places to taste the country in one visit. **Green Bazaar** in Almaty is the icon, while **Shymkent Central** offers the richest spice selection. In Astana, modern **food halls** provide a clean, curated way to explore Central Asian dishes.\n\nStreet snacks to try: **samsa**, **kurt**, and fresh **baursak**.'
  },
  {
    id: 'modern-dining',
    articleId: 'modern-dining',
    order: 5,
    title: 'Modern Dining: New Kazakh Cuisine',
    contentMarkdown:
      'A new generation of chefs is modernizing classic recipes with lighter techniques and local sourcing. Expect **tasting menus**, refined plating, and seasonal ingredients.\n\nLook for restaurants that label themselves as **New Kazakh** or **Contemporary Central Asian** for the latest culinary wave.'
  },
  {
    id: 'practical-tips',
    articleId: 'practical-tips',
    order: 6,
    title: 'Practical Tips & Etiquette',
    contentMarkdown:
      'Meals are shared. Accepting food is polite, and **refilling tea** is a sign of care. If you do not want more, leave a little tea in your bowl. Tipping is appreciated in cities (5–10%), but not always expected.\n\nFor dietary needs, modern cafes in Almaty and Astana offer vegetarian and gluten-free options.'
  }
];

const LEGACY_GALLERY_MAP: Record<string, string> = {
  'content/pages/food-drink/hero': 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes',
  'content/pages/food-drink/beshbarmak':
    'content/pages/foodDrinks/signatureDishes/main-meat-dishes/beshbarmak',
  'content/pages/food-drink/tea': 'content/pages/foodDrinks/TeaHouseCourtyard/teaQuickGuide',
  'content/pages/food-drink/market':
    'content/pages/foodDrinks/signatureDishes/soups-and-broths/sorpa'
};

const FALLBACK_GALLERY = {
  title: 'A Taste of Kazakhstan',
  photos: [
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes',
      alt: 'Kazakh table spread',
      caption: 'Traditional Dastarkhan — A generous spread of Kazakh delicacies showcasing hospitality and culinary heritage'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/beshbarmak',
      alt: 'Beshbarmak',
      caption: 'Beshbarmak — The national dish of Kazakhstan, featuring hand-cut noodles with tender lamb or horse meat'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kuyrdak',
      alt: 'Kuyrdak',
      caption: 'Kuyrdak — Fried chunks of meat with onions, a hearty dish rooted in nomadic traditions'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/kazan-zhappa',
      alt: 'Kazan zhappa',
      caption: 'Kazan Zhaps — Meat and potatoes cooked in a cauldron over an open fire'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/zhyzhmyzh',
      alt: 'Zhyzhmyzh',
      caption: 'Zhyzhmyzh — Spiced fried meat cubes, a popular dish for celebrations and gatherings'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/karynburme',
      alt: 'Karynburme',
      caption: 'Karynburme — Layered pastry filled with spiced meat, a savory pastry beloved in Kazakhstan'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/steamedmeat',
      alt: 'Steamed meat',
      caption: 'Steamed Meat — Tender meat cooked with aromatic spices in a traditional steaming method'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/main-meat-dishes/driedcuredmeat',
      alt: 'Dried cured meat',
      caption: 'Kazy — Premium dried horse meat, a delicacy sliced thin and served as an appetizer'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/kazy',
      alt: 'Kazy',
      caption: 'Kazy — The most prized horse meat sausage, air-dried and sliced thin for special occasions'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/karta',
      alt: 'Karta',
      caption: 'Karta — Ground horse meat seasoned and formed into patties, grilled to perfection'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/shuzhuk',
      alt: 'Shuzhuk',
      caption: 'Shuzhuk — Spiced horse meat sausage, dried and smoked for intense flavor'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhaya',
      alt: 'Zhaya',
      caption: 'Zhaya — Finely minced horse meat mixed with fat and spices, a traditional delicacy'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/horse-meat-specialties/zhal',
      alt: 'Zhal',
      caption: 'Zhal — Horse meat preserve, a protein-rich traditional food for winter'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/sorpa',
      alt: 'Sorpa',
      caption: 'Sorpa — A rich broth made from lamb or horse meat, served with noodles or bread'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/soups-and-broths/kespe',
      alt: 'Kespe',
      caption: 'Kespe — Soup with handmade pasta squares, a comforting dish for cold Kazakh winters'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/sheepheadritual',
      alt: 'Sheep head ritual',
      caption: 'Sheep Head — A ceremonial dish served to honored guests, representing respect and abundance'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/tongue',
      alt: 'Tongue',
      caption: 'Tongue — Considered a delicacy, served boiled or sliced in salads'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/liver',
      alt: 'Liver',
      caption: 'Liver — Served grilled or in pate, rich in iron and flavor'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/heart',
      alt: 'Heart',
      caption: 'Heart — A lean and tender organ meat, often served grilled or in soups'
    },
    {
      publicId: 'content/pages/foodDrinks/signatureDishes/offal-and-ritual-dishes/lungsandliver',
      alt: 'Lungs and liver',
      caption: 'Lungs and Liver — Traditional offal dishes prepared in various regional styles'
    },
    {
      publicId: 'content/pages/foodDrinks/TeaHouseCourtyard/teaQuickGuide',
      alt: 'Tea ritual',
      caption: 'Tea Ceremony — The traditional Kazakh tea ritual, where green tea is poured and offered to guests'
    }
  ]
};

const FALLBACK_FAQ = {
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

const FALLBACK_RELATED_POSTS = [
  {
    id: 'signature-dishes',
    url: '/food-drink/signature-dishes',
    title: 'Signature Dishes',
    category: 'Food & Drinks',
    description: 'Beshbarmak, kazy, manty, lagman, and the street-time classic, samsa.',
    imagePublicId: 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes'
  },
  {
    id: 'traditional-dastarkhan',
    url: '/food-drink/traditional-dastarkhan',
    title: 'Traditional Dastarkhan',
    category: 'Food & Drinks',
    description: 'A generous spread of Kazakh delicacies showcasing hospitality and culinary heritage.',
    imagePublicId: 'content/pages/foodDrinks/traditionalDastarkhan/hero'
  },
  {
    id: 'silk-road-noodles',
    url: '/food-drink/silk-road-noodles',
    title: 'Silk Road Noodles',
    category: 'Food & Drinks',
    description: 'Hand-pulled lagman and bold southern spices from the Silk Road.',
    imagePublicId: 'content/pages/foodDrinks/silkRoadNoodles/hero'
  },
  {
    id: 'tea-house-courtyard',
    url: '/food-drink/tea-house-courtyard',
    title: 'Tea House Courtyard',
    category: 'Food & Drinks',
    description: 'Slow tea rituals with dried fruits and sweets around the dastarkhan.',
    imagePublicId: 'content/pages/foodDrinks/TeaHouseCourtyard/hero'
  },
  {
    id: 'international-tastes',
    url: '/food-drink/international-tastes',
    title: 'International Tastes',
    category: 'Food & Drinks',
    description: 'Global flavors from sushi and ramen to shawarma and pizza.',
    imagePublicId: 'content/pages/foodDrinks/internationalTastes/tom_yam'
  }
];

const BLOCKED_HIGHLIGHT_TITLES = new Set([
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

const BLOCKED_RESTAURANT_TITLES = new Set(['new kazakh cuisine']);

const normalizeTitle = (value: any) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const INTERNATIONAL_TASTES_DESCRIPTION =
  'Global flavors from sushi and ramen to shawarma and pizza.';
const LEGACY_REGIONAL_TASTES_DESCRIPTION =
  'seafood in mangystau, spices in shymkent, and alpine dairy in the east.';
const RESTAURANT_LINKS: Record<string, string> = {
  'traditional dastarkhan': '/food-drink/traditional-dastarkhan',
  'traditional-dastarkhan': '/food-drink/traditional-dastarkhan',
  'silk road noodles': '/food-drink/silk-road-noodles',
  'silk-road-noodles': '/food-drink/silk-road-noodles',
  'tea house courtyard': '/food-drink/tea-house-courtyard',
  'tea-house-courtyard': '/food-drink/tea-house-courtyard'
};

const normalizeHighlightTitle = (value: any) =>
  normalizeTitle(value) === 'regional tastes' ? 'International Tastes' : value;

const HIGHLIGHT_IMAGE_FALLBACKS: Record<string, string> = {
  'signature dishes': 'content/pages/foodDrinks/signatureDishes/mainSignatureDishes',
  'international tastes': 'content/pages/foodDrinks/internationalTastes/tom_yam',
  'regional tastes': 'content/pages/foodDrinks/internationalTastes/tom_yam',
  'traditional dastarkhan': 'content/pages/foodDrinks/traditionalDastarkhan/hero',
  'silk road noodles': 'content/pages/foodDrinks/silkRoadNoodles/hero',
  'tea house courtyard': 'content/pages/foodDrinks/TeaHouseCourtyard/hero'
};
const RESTAURANT_IMAGE_FALLBACKS: Record<string, string> = {
  'traditional dastarkhan': 'content/pages/foodDrinks/traditionalDastarkhan/hero',
  'silk road noodles': 'content/pages/foodDrinks/silkRoadNoodles/hero',
  'tea house courtyard': 'content/pages/foodDrinks/TeaHouseCourtyard/hero'
};

const withHighlightImage = (item: any) => {
  const titleKey = normalizeTitle(item?.title);
  const fallbackPublicId = HIGHLIGHT_IMAGE_FALLBACKS[titleKey];
  if (!fallbackPublicId) return item;

  const existingPublicId =
    item?.image?.publicId || item?.image?.public_id || item?.imagePublicId || item?.publicId || '';

  const publicId = existingPublicId || fallbackPublicId;
  return {
    ...item,
    imagePublicId: publicId,
    image: {
      ...(item?.image || {}),
      publicId,
      alt: item?.image?.alt || item?.title || 'Food & Drinks highlight'
    }
  };
};

const normalizeHighlightDescription = (title: any, description: any) => {
  const normalizedTitle = normalizeTitle(title);
  if (normalizedTitle !== 'international tastes' && normalizedTitle !== 'regional tastes') {
    return description;
  }

  const normalizedDescription = normalizeTitle(description);
  if (!normalizedDescription || normalizedDescription === LEGACY_REGIONAL_TASTES_DESCRIPTION) {
    return INTERNATIONAL_TASTES_DESCRIPTION;
  }

  return description;
};

const filterHighlights = (items: any[]) =>
  (items || [])
    .map((item) => {
      const title = normalizeHighlightTitle(item?.title);
      const normalized = {
        ...item,
        title,
        description: normalizeHighlightDescription(title, item?.description)
      };
      return withHighlightImage(normalized);
    })
    .filter((item) => !BLOCKED_HIGHLIGHT_TITLES.has(normalizeTitle(item?.title)));

const filterArticles = (items: any[]) =>
  (items || []).filter((item) => {
    const title = normalizeTitle(item?.title);
    const id = normalizeTitle(item?.articleId || item?.id);
    return !BLOCKED_ARTICLE_IDS.has(id) && !BLOCKED_ARTICLE_TITLES.has(title);
  });

const filterRestaurants = (items: any[]) =>
  (items || [])
    .map((item) => {
      const titleKey = normalizeTitle(item?.title);
      const idKey = normalizeTitle(item?.id);
      const href = item?.href || item?.url || RESTAURANT_LINKS[titleKey] || RESTAURANT_LINKS[idKey];
      const fallbackPublicId = RESTAURANT_IMAGE_FALLBACKS[titleKey] || RESTAURANT_IMAGE_FALLBACKS[idKey];
      const existingPublicId =
        item?.image?.publicId || item?.image?.public_id || item?.imagePublicId || item?.publicId || '';
      const publicId = existingPublicId || fallbackPublicId || '';

      const next = {
        ...item,
        ...(href ? { href } : {}),
        ...(publicId
          ? {
              imagePublicId: publicId,
              image: {
                ...(item?.image || {}),
                publicId,
                alt: item?.image?.alt || item?.title || 'Food & Drinks restaurant'
              }
            }
          : {})
      };
      return next;
    })
    .filter((item) => !BLOCKED_RESTAURANT_TITLES.has(normalizeTitle(item?.title)));

function normalizeImageList(items: any[], fallbackAlt: string) {
  if (!Array.isArray(items)) return [];
  return items
    .map((img) => {
      if (typeof img === 'string') {
        const validation = validateImage({ publicId: img, alt: fallbackAlt });
        return validation.normalized || { publicId: img, alt: fallbackAlt };
      }
      const validation = validateImage(img);
      return (
        validation.normalized || {
          publicId: img.publicId || img.public_id || img.url || '',
          alt: img.alt || img.altText || fallbackAlt,
          caption: img.caption || img.captionName || ''
        }
      );
    })
    .filter((img) => img && img.publicId);
}

function normalizeGalleryPhotos(items: any[], fallbackAlt: string) {
  return normalizeImageList(items, fallbackAlt).map((img) => {
    const mappedPublicId = LEGACY_GALLERY_MAP[img.publicId];
    if (!mappedPublicId) return img;
    return {
      ...img,
      publicId: mappedPublicId
    };
  });
}

export async function load() {
  if (!adminDB) {
    return {
      page: FALLBACK_PAGE,
      highlights: filterHighlights(FALLBACK_HIGHLIGHTS),
      signatureDishes: FALLBACK_SIGNATURE_DISHES,
      drinks: [],
      markets: [],
      restaurants: filterRestaurants(FALLBACK_RESTAURANTS),
      articles: filterArticles(FALLBACK_ARTICLES),
      photoGallery: FALLBACK_GALLERY,
      faq: FALLBACK_FAQ,
      relatedPosts: FALLBACK_RELATED_POSTS,
      author: null,
      error: 'Server database connection failed.'
    };
  }

  try {
    const pageRef = adminDB.collection('pages').doc('food-drink');
    const [
      pageSnap,
      articlesSnap,
      restaurantsSnap,
      marketsSnap,
      drinksSnap,
      highlightsSnap,
      signatureSnap,
      faqSnap,
      photoGalleryMainSnap,
      photoGallerySnap,
      relatedPostsSnap
    ] = await Promise.all([
      pageRef.get(),
      pageRef.collection('articles').orderBy('order', 'asc').get(),
      pageRef.collection('restaurants').orderBy('order', 'asc').get(),
      pageRef.collection('markets').orderBy('order', 'asc').get(),
      pageRef.collection('drinks').orderBy('order', 'asc').get(),
      pageRef.collection('highlights').orderBy('order', 'asc').get(),
      pageRef.collection('signatureDishes').orderBy('order', 'asc').get(),
      pageRef.collection('faq').get(),
      pageRef.collection('photoGallery').doc('main').get(),
      pageRef.collection('photoGallery').get(),
      pageRef.collection('relatedPosts').orderBy('order', 'asc').get()
    ]);

    const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};

    const articles = articlesSnap.docs
      .map((doc) => {
        const data = doc.data();
        const title = data.title || data.name || `Section ${doc.id}`;
        return serializeDates({
          id: doc.id,
          articleId: data.articleId || data.sectionId || doc.id,
          order: data.order || 0,
          title,
          contentMarkdown: data.contentMarkdown || data.content || data.description || '',
          contentHTML: data.contentHTML || data.content || data.description || '',
          contentFormat: data.contentFormat || 'markdown'
        });
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const restaurants = restaurantsSnap.docs.map((doc) =>
      serializeDates({ id: doc.id, ...doc.data() })
    );
    const markets = marketsSnap.docs.map((doc) => serializeDates({ id: doc.id, ...doc.data() }));
    const drinks = drinksSnap.docs.map((doc) => serializeDates({ id: doc.id, ...doc.data() }));
    const highlights = highlightsSnap.docs.map((doc) =>
      serializeDates({ id: doc.id, ...doc.data() })
    );
    const signatureDishes = signatureSnap.docs.map((doc) =>
      serializeDates({ id: doc.id, ...doc.data() })
    );

    let faq = null;
    if (faqSnap.size > 0) {
      const faqDoc = faqSnap.docs[0].data();
      faq = {
        title: faqDoc.title || 'Food & Drinks FAQs',
        items: faqDoc.items || []
      };
    }

    // Always use fallback gallery to ensure captions are displayed
    const photoGallery = FALLBACK_GALLERY;

    const relatedPosts = relatedPostsSnap.docs
      .filter((doc) => doc.id !== 'main')
      .map((doc) => serializeDates(doc.data()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      page: { ...FALLBACK_PAGE, ...page },
      highlights: filterHighlights(highlights.length ? highlights : FALLBACK_HIGHLIGHTS),
      signatureDishes: signatureDishes.length ? signatureDishes : FALLBACK_SIGNATURE_DISHES,
      drinks: [],
      markets: [],
      restaurants: filterRestaurants(restaurants.length ? restaurants : FALLBACK_RESTAURANTS),
      articles: filterArticles(articles.length ? articles : FALLBACK_ARTICLES),
      photoGallery: photoGallery,
      faq: faq || FALLBACK_FAQ,
      relatedPosts: relatedPosts.length ? relatedPosts : FALLBACK_RELATED_POSTS,
      author: null
    };
  } catch (error) {
    console.error('[food-drink] load error', error);
    return {
      page: FALLBACK_PAGE,
      highlights: filterHighlights(FALLBACK_HIGHLIGHTS),
      signatureDishes: FALLBACK_SIGNATURE_DISHES,
      drinks: [],
      markets: [],
      restaurants: filterRestaurants(FALLBACK_RESTAURANTS),
      articles: filterArticles(FALLBACK_ARTICLES),
      photoGallery: FALLBACK_GALLERY,
      faq: FALLBACK_FAQ,
      relatedPosts: FALLBACK_RELATED_POSTS,
      author: null,
      error: 'Failed to load food & drink data.'
    };
  }
}
