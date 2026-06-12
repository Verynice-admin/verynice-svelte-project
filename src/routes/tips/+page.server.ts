import { adminDB } from '$lib/server/firebaseAdmin';

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
  breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Travel Tips' }],
  headerBackgroundPublicId: 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01',
  introMarkdown: 'Welcome to Kazakhstan! Here are essential travel tips to help you plan your perfect trip.'
};

const FALLBACK_HIGHLIGHTS = [
  {
    id: 'best-time',
    title: 'Best Time to Visit',
    description: 'Kazakhstan has extreme continental weather.',
    tier: 1,
    order: 1
  },
  {
    id: 'visa',
    title: 'Visa & Entry',
    description: 'Most travelers enjoy visa-free entry.',
    tier: 1,
    order: 2
  },
  {
    id: 'safety',
    title: 'Safety & Precautions',
    description: 'Kazakhstan is generally safe.',
    tier: 1,
    order: 3
  },
  {
    id: 'transport',
    title: 'Getting Around',
    description: 'Flights, trains, and taxis in Kazakhstan.',
    tier: 1,
    order: 4
  },
  {
    id: 'money',
    title: 'Money & Costs',
    description: 'Budget tips for Kazakhstan.',
    tier: 1,
    order: 5
  }
];

const HIGHLIGHT_IMAGE_FALLBACKS: Record<string, string> = {
  'best time to visit': 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01',
  'best time to visit kazakhstan': 'content/pages/destinations/Almaty_nearby/kolsai-lakes/kolsai-lakes-01',
  'visa & entry': 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
  'visa and entry': 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
  'safety & precautions': 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01',
  'safety and precautions': 'content/pages/destinations/Almaty_nearby/besshatyr-scythian-mounds/besshatyr-scythian-mounds-01',
  'getting around': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
  'getting there & around': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
  'getting there and around': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
  'airport taxis': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
  'airport taxi guide': 'content/pages/destinations/Astana_Nearby/baiterek-tower/baiterek-tower-01',
  'money & costs': 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01',
  'money and costs': 'content/pages/destinations/Almaty_nearby/central-state-museum/central-state-museum-01'
};

const withHighlightImage = (item: any) => {
  const titleKey = item?.title?.toLowerCase() || '';
  const fallbackPublicId = HIGHLIGHT_IMAGE_FALLBACKS[titleKey];
  if (!fallbackPublicId) return item;

  const existingPublicId = item?.image?.publicId || item?.imagePublicId || item?.publicId || '';
  const publicId = existingPublicId || fallbackPublicId;

  return {
    ...item,
    imagePublicId: publicId,
    image: {
      ...(item?.image || {}),
      publicId,
      alt: item?.image?.alt || item?.title || 'Travel tip'
    }
  };
};

export async function load() {
  if (!adminDB) {
    return {
      page: FALLBACK_PAGE,
      highlights: FALLBACK_HIGHLIGHTS.map(withHighlightImage),
      error: 'Server database connection failed.'
    };
  }

  try {
    const pageRef = adminDB.collection('pages').doc('travelTipsPage');
    const pageSnap = await pageRef.get();
    const page = pageSnap.exists ? serializeDates(pageSnap.data()) : {};
    
    // Load tips from tips subcollection - these have the images
    let tips: any[] = [];
    try {
      const tipsSnap = await pageRef.collection('tips').get();
      tips = tipsSnap.docs
        .map((doc) => serializeDates({ id: doc.id, ...doc.data() }))
        .map(withHighlightImage);
    } catch (tipsErr) {
      console.warn('[travel-tips] Could not load tips subcollection:', tipsErr);
    }

    return {
      page: { ...FALLBACK_PAGE, ...page },
      highlights: tips.length 
        ? tips.slice(0, 6) 
        : FALLBACK_HIGHLIGHTS.map(withHighlightImage)
    };
  } catch (error) {
    console.error('[travel-tips] load error', error);
    return {
      page: FALLBACK_PAGE,
      highlights: FALLBACK_HIGHLIGHTS.map(withHighlightImage),
      error: 'Failed to load travel tips data.'
    };
  }
}
