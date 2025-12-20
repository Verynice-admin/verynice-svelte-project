import { adminDB } from '$lib/server/firebaseAdmin';

// Fallback homepage data
const FALLBACK_HOMEPAGE = {
  title: 'VeryNice - Discover Kazakhstan',
  metaDescription: 'Explore the beautiful cities, attractions, and culture of Kazakhstan',
  heroTitle: 'Discover Kazakhstan',
  heroSubtitle: 'Explore amazing places, rich history, and vibrant culture',
  heroImagePublicId: null,
  featuredVideoUrl: null
};

const EMPTY_SLIDERS = {
        cities: [],
        attractions: [],
        landmarks: [],
        nationalParks: [],
        lakes: [],
        mountains: [],
        cuisine: [],
        restaurants: [],
        cafes: []
};

function serializeValue(value: any): any {
  if (value == null) return value;

  if (typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch {
      return value;
    }
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, inner] of Object.entries(value)) {
      out[key] = serializeValue(inner);
    }
    return out;
  }

  return value;
}

function serializeDocument(data: any) {
  if (!data || typeof data !== 'object') return data;
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = serializeValue(value);
  }
  return out;
}

export async function load() {
  if (!adminDB) {
    return {
      homepage: FALLBACK_HOMEPAGE,
      sliders: EMPTY_SLIDERS
    };
  }

  try {
    const homepageSnap = await adminDB.collection('pages').doc('homepage').get();
    const homepage = homepageSnap.exists ? serializeDocument(homepageSnap.data()) : FALLBACK_HOMEPAGE;

    return {
      homepage: { ...FALLBACK_HOMEPAGE, ...homepage },
      sliders: EMPTY_SLIDERS
    };
  } catch (error) {
    console.error('[+page.server] Error loading homepage:', error);
    return {
      homepage: FALLBACK_HOMEPAGE,
      sliders: EMPTY_SLIDERS
    };
  }
}
