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
  headerBackgroundPublicId: 'content/site/backgrounds/attractions-hero',
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
    description: 'Classic Kazakh menu, live music, and generous platters.'
  },
  {
    title: 'New Kazakh Cuisine',
    city: 'Astana',
    description: 'Modern tasting menus with steppe ingredients and clean plating.'
  },
  {
    title: 'Silk Road Noodles',
    city: 'Shymkent',
    description: 'Hand-pulled lagman and bold southern spices.'
  },
  {
    title: 'Tea House Courtyard',
    city: 'Turkistan',
    description: 'Slow tea rituals with dried fruits and sweets.'
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

const FALLBACK_GALLERY = {
  title: 'A Taste of Kazakhstan',
  photos: [
    { publicId: 'content/pages/food-drink/hero', alt: 'Kazakh table spread' },
    { publicId: 'content/pages/food-drink/beshbarmak', alt: 'Beshbarmak' },
    { publicId: 'content/pages/food-drink/tea', alt: 'Tea ritual' },
    { publicId: 'content/pages/food-drink/market', alt: 'Market produce' }
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

const filterHighlights = (items: any[]) =>
  (items || []).filter((item) => !BLOCKED_HIGHLIGHT_TITLES.has(normalizeTitle(item?.title)));

const filterArticles = (items: any[]) =>
  (items || []).filter((item) => {
    const title = normalizeTitle(item?.title);
    const id = normalizeTitle(item?.articleId || item?.id);
    return !BLOCKED_ARTICLE_IDS.has(id) && !BLOCKED_ARTICLE_TITLES.has(title);
  });

const filterRestaurants = (items: any[]) =>
  (items || []).filter((item) => !BLOCKED_RESTAURANT_TITLES.has(normalizeTitle(item?.title)));

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
          alt: img.alt || img.altText || fallbackAlt
        }
      );
    })
    .filter((img) => img && img.publicId);
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
      relatedPosts: [],
      author: null,
      error: 'Server database connection failed.'
    };
  }

  try {
    const pageRef = adminDB.collection('pages').doc('restaurantsPage');
    const [
      pageSnap,
      articlesSnap,
      restaurantsSnap,
      marketsSnap,
      drinksSnap,
      highlightsSnap,
      signatureSnap,
      faqSnap,
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

    let photoGallery = null;
    if (photoGallerySnap.size > 0) {
      const galleryDoc = photoGallerySnap.docs[0].data();
      const photos = normalizeImageList(galleryDoc.photos || [], 'Food & drinks image');
      if (photos.length > 0) {
        photoGallery = {
          title: galleryDoc.title || 'Food & Drinks Gallery',
          photos
        };
      }
    }

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
      photoGallery: photoGallery || FALLBACK_GALLERY,
      faq: faq || FALLBACK_FAQ,
      relatedPosts,
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
      relatedPosts: [],
      author: null,
      error: 'Failed to load food & drink data.'
    };
  }
}
