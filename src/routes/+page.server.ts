import { adminDB } from '$lib/server/firebaseAdmin';

const FALLBACK_HOMEPAGE = {
  title: 'VeryNice - Discover Kazakhstan',
  metaDescription: 'Explore the beautiful cities, attractions, and culture of Kazakhstan',
  heroTitle: 'Discover Kazakhstan',
  heroSubtitle: 'Explore amazing places, rich history, and vibrant culture',
  heroImagePublicId: 'home/content/pages/homepage/Kazakhstan-bckgrnd',
  featuredVideoUrl: 'https://www.youtube.com/watch?v=v_O_E_iSAc4',
  stats: [
    { value: '14', label: 'Destinations' },
    { value: '25+', label: 'Natural Parks' },
    { value: '50+', label: 'Silk Road Sites' },
    { value: '1500+', label: 'Photos' }
  ]
};

function serializeDocument(data: any) {
  if (!data || typeof data !== 'object') return data;
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value.toDate === 'function') {
      out[key] = value.toDate().toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map(i => typeof i === 'object' && i !== null && i.toDate ? i.toDate().toISOString() : i);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function load() {
  if (!adminDB) {
    return { homepage: FALLBACK_HOMEPAGE, sliders: {} };
  }

  try {
    const homepageSnap = await adminDB.collection('pages').doc('homepage').get();
    const homepage = homepageSnap.exists ? serializeDocument(homepageSnap.data()) : FALLBACK_HOMEPAGE;

    // Dynamic Queries for Sliders
    const allAttractionsSnap = await adminDB.collectionGroup('attractions').limit(300).get();
    const attractions = allAttractionsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug || doc.id,
        // Start Fix: Prioritize headerBackgroundPublicId
        headerBackgroundPublicId: data.headerBackgroundPublicId || null,
        mainImage: data.headerBackgroundPublicId || data.mainImage || (data.photos && data.photos[0]) || null,
        // End Fix
        image: data.image || null,
        region: doc.ref.parent.parent?.id || 'other'
      };
    });

    const filter = (search: string[]) => attractions.filter(a =>
      search.some(s => (a.title || '').toLowerCase().includes(s.toLowerCase())) ||
      search.some(s => (a.slug || '').toLowerCase().includes(s.toLowerCase()))
    ).slice(0, 8);

    const sliders = {
      cities: filter(['city', 'almaty', 'astana', 'aktau', 'shymkent', 'turkistan']),
      nationalParks: filter(['national park', 'reserve', 'nature park']),
      lakes: filter(['lake', 'reservoir', 'river']),
      mountains: filter(['mountain', 'peak', 'canyon', 'plateau']),
      culture: filter(['mausoleum', 'mosque', 'museum', 'monument'])
    };

    return {
      homepage: { ...FALLBACK_HOMEPAGE, ...homepage },
      sliders
    };
  } catch (error) {
    console.error('[+page.server] Error loading dynamic homepage:', error);
    return {
      homepage: FALLBACK_HOMEPAGE,
      sliders: {}
    };
  }
}
