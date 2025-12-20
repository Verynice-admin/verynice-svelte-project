import { browser } from '$app/environment';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let warned = false;

// Check if Firebase is disabled via environment variable
const FIREBASE_DISABLED = String(import.meta.env.VITE_FIREBASE_DISABLED ?? '').trim() === '1';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function readConfig(): FirebaseConfig {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
}

function hasAll(cfg: FirebaseConfig): boolean {
  return Object.values(cfg).every((v) => v && String(v).trim() !== '');
}

// Legacy placeholders (some code may import these)
export { app, db };

/**
 * Initialize and return Firebase app instance
 * @returns Firebase app or null if initialization fails
 */
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!browser || FIREBASE_DISABLED) return null;
  if (app) return app;

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const cfg = readConfig();

    if (!hasAll(cfg)) {
      if (!warned) {
        console.warn('[Firebase] Missing env keys; skipping init.');
        warned = true;
      }
      return null;
    }

    // Use existing app if available, otherwise initialize
    app = getApps().length > 0 ? getApps()[0] : initializeApp(cfg);
    return app;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    return null;
  }
}

/**
 * Initialize and return Firestore instance
 * @returns Firestore instance or null if initialization fails
 */
export async function getFirestore(): Promise<Firestore | null> {
  if (!browser || FIREBASE_DISABLED) return null;
  if (db) return db;

  try {
    const appInstance = await getFirebaseApp();
    if (!appInstance) return null;

    const { getFirestore: getFirestoreFb } = await import('firebase/firestore');
    db = getFirestoreFb(appInstance);
    return db;
  } catch (error) {
    console.error('[Firebase] Firestore initialization error:', error);
    return null;
  }
}
