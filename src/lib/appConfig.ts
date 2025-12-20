import { browser } from '$app/environment';

const DEFAULTS = { site: { title: 'Verynice', locale: 'en', theme: 'light' } };
let warnedOnce = false;

export async function loadSiteConfig() {
  if (!browser) {
    if (import.meta.env.DEV && !warnedOnce) {
      console.warn('[appConfig] settings/site missing, using defaults (SSR).');
      warnedOnce = true;
    }
    return DEFAULTS;
  }

  const db = await (await import('$lib/firebaseApp')).getFirestore();
  if (!db) return DEFAULTS;

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, 'settings', 'site');
    const snap = await getDoc(ref);
    return snap.exists() ? { site: snap.data() } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}