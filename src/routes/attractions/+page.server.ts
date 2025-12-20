import { adminDB } from '$lib/server/firebaseAdmin';

// Serialize Firestore Timestamps to ISO strings for client-side
function serializeDates(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && typeof v.toDate === 'function') {
      // Firestore Timestamp
      out[k] = v.toDate().toISOString();
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      // Check if it's a Firestore GeoPoint (has latitude and longitude)
      if (typeof v.latitude === 'number' && typeof v.longitude === 'number') {
        // Convert GeoPoint to standard format
        out[k] = { lat: v.latitude, lng: v.longitude };
      } else {
        // Recursively serialize nested objects
        out[k] = serializeDates(v);
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function load() {
  if (!adminDB) return { attractions: [], page: null };

  try {
    const pageRef = adminDB.collection('pages').doc('attractionsPage');

    const [attractionsSnap, articlesSnap, pageSnap] = await Promise.all([
      pageRef.collection('attractions').orderBy('order', 'asc').get(),
      pageRef.collection('articles').orderBy('order', 'asc').get(),
      pageRef.get()
    ]);

    const items = attractionsSnap.docs.map(d => {
      try {
        return { id: d.id, ...serializeDates(d.data()) };
      } catch (e) {
        console.error(`Error serializing attraction ${d.id}`, e);
        return null;
      }
    }).filter(x => x !== null);

    const articles = articlesSnap.docs.map(d => {
      const data = d.data();
      return serializeDates({
        id: d.id,
        articleId: data.articleId || d.id,
        title: data.title || '',
        order: data.order || 0,
        type: data.type || 'article',
        year: data.year || ''
      });
    });

    const page = pageSnap.exists ? serializeDates(pageSnap.data()) : null;

    let author = null;
    const authorId = page?.authorId || 'verynice-official';
    if (authorId) {
      const authorSnap = await adminDB.collection('authors').doc(authorId).get();
      if (authorSnap.exists) {
        author = serializeDates(authorSnap.data());
      }
    }

    // Debug: Log the fetched page data to verify the image public ID
    if (import.meta.env.DEV) {
      console.log('[Attractions Page] Fetched page data:', {
        exists: pageSnap.exists,
        headerBackgroundPublicId: page?.headerBackgroundPublicId,
        allKeys: page ? Object.keys(page) : [],
        authorFound: !!author,
        articleCount: articles.length
      });
    }

    return { attractions: items, articles, page, author };

  } catch (error) {
    console.error("Error loading attractions page:", error);
    return { attractions: [], page: null, error: "Failed to load data" };
  }
}


