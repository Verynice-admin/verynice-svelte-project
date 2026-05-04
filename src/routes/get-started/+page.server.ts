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
      out[k] = serializeDates(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Default page data as fallback
const defaultPageData = {
  mainTitle: 'Welcome to VERYNICE.kz',
  headerDescription: 'Choose how you\'d like to continue',
  headerBackgroundPublicId: 'general/background',
  isFeatured: false
};

export async function load() {
  if (!adminDB) {
    console.warn('[Get Started] Firebase Admin not initialized, using fallback data');
    return { pageData: defaultPageData };
  }

  try {
    const pageDocRef = adminDB.collection('pages').doc('getStartedPage');
    const pageSnap = await pageDocRef.get();

    if (!pageSnap.exists) {
      console.warn('[Get Started] getStartedPage not found in Firestore, using fallback data');
      return { pageData: defaultPageData };
    }

    const pageData = serializeDates(pageSnap.data());
    return { pageData };

  } catch (error) {
    console.error('[Get Started] Error loading page data:', error);
    return { pageData: defaultPageData };
  }
}
