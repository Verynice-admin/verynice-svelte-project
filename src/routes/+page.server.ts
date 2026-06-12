import { adminDB } from '$lib/server/firebaseAdmin';
import { getOrFetch } from '$lib/server/cache';

const FALLBACK_HOMEPAGE = {
  title: 'VeryNice - Discover Kazakhstan',
  metaDescription: 'Explore the beautiful cities, attractions, and culture of Kazakhstan',
  heroTitle: 'Discover Kazakhstan',
  heroSubtitle: 'Explore amazing places, rich history, and vibrant culture',
  heroImagePublicId: 'content/pages/destinations/Almaty_nearby/charyn-canyon/charyn-canyon-01',
  featuredVideoUrl: 'https://youtu.be/pssnBA7-f98?si=OBk1YVHKTHoDXOUd',
};

function serializeValue(value: any): any {
  if (!value) return value;
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = serializeValue(nested);
    }
    return out;
  }
  return value;
}

function serializeDocument(data: any) {
  return serializeValue(data);
}

const HOMEPAGE_TTL = 5 * 60 * 1000; // 5 minutes

export async function load() {
  if (!adminDB) {
    return { homepage: FALLBACK_HOMEPAGE, sliders: {} };
  }

  return getOrFetch(
    'homepage',
    async () => {
      const homepageSnap = await adminDB!.collection('pages').doc('homepage').get();
      const homepage = homepageSnap.exists ? serializeDocument(homepageSnap.data()) : FALLBACK_HOMEPAGE;

      // Dynamic Queries for Sliders
      const allAttractionsSnap = await adminDB!.collectionGroup('attractions').limit(300).get();
      const seenIds = new Set<string>();
      const attractions = allAttractionsSnap.docs
        .map(doc => {
          const data = doc.data();
          const rawSlug = data.slug || doc.id;
          const normalizedSlug = rawSlug.toLowerCase().replace(/_/g, '-');
          const slugTitle = normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
          return {
            id: normalizedSlug,
            title: data.title || data.mainTitle || data.name || data.heroTitle || data.heading || slugTitle,
            slug: normalizedSlug,
            headerBackgroundPublicId: data.headerBackgroundPublicId || null,
            mainImage: data.headerBackgroundPublicId || data.mainImage || (data.photos && data.photos[0]) || null,
            image: data.image || null,
            region: doc.ref.parent.parent?.id || 'other'
          };
        })
        .filter(a => {
          if (seenIds.has(a.id)) return false;
          seenIds.add(a.id);
          return true;
        });

      const filter = (search: string[]) => attractions.filter(a =>
        search.some(s => (a.title || '').toLowerCase().includes(s.toLowerCase())) ||
        search.some(s => (a.slug || '').toLowerCase().includes(s.toLowerCase()))
      ).slice(0, 8);

      const sliders = {
        cities: filter(['city', 'almaty', 'алматы', 'astana', 'астана', 'nur-sultan', 'aktau', 'актау', 'shymkent', 'shimkent', 'шымкент', 'turkistan', 'turkestan', 'түркістан', 'туркестан', 'atyrau', 'атырау', 'karaganda', 'қарағанды', 'semey', 'semei', 'oskemen', 'ust-kamenogorsk']),
        nationalParks: filter(['national park', 'reserve', 'nature park', 'заповедник', 'қорық', 'national']),
        lakes: filter(['lake', 'köl', 'көл', 'reservoir', 'river', 'озеро', 'өзен', 'sea', 'теңіз', 'море', 'balkhash', 'балқаш', 'alakol', 'алакөл', 'burabay', 'бурабай']),
        mountains: filter(['mountain', 'peak', 'canyon', 'plateau', 'tau', 'тау', 'гора', 'шың', 'pass', 'асу', 'altai', 'алтай', 'tian shan', 'тянь-шань', 'alatau', 'алатау']),
        culture: filter(['mausoleum', 'күмбез', 'мавзолей', 'mosque', 'мешіт', 'мечеть', 'museum', 'мұражай', 'музей', 'monument', 'ескерткіш', 'памятник', 'temple', 'shrine', 'ancient', 'ежелгі'])
      };

      return {
        homepage: { ...FALLBACK_HOMEPAGE, ...homepage },
        sliders
      };
    },
    HOMEPAGE_TTL
  ).catch((error) => {
    console.error('[+page.server] Error loading dynamic homepage:', error);
    return { homepage: FALLBACK_HOMEPAGE, sliders: {} };
  });
}
