import { browser } from '$app/environment';
import { getFirestore } from '$lib/firebaseApp';
import type { Firestore } from 'firebase/firestore';

interface SiteLayout {
  layout: Record<string, unknown>;
}

const DEFAULT: SiteLayout = { layout: {} };

export async function getSiteLayout(): Promise<SiteLayout> {
  if (!browser) return DEFAULT;
  const db = await getFirestore();
  if (!db) return DEFAULT;

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db as Firestore, 'siteConfig', 'layout');
    const snap = await getDoc(ref);
    return snap.exists() ? { layout: snap.data() ?? {} } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}




























































