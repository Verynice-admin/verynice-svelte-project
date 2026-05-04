import { browser } from '$app/environment';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

// Legacy placeholders (some code may import these)
export let app: FirebaseApp | null = null;
export let db: Firestore | null = null;
export let auth: Auth | null = null;

// Check if Firebase is disabled via environment variable
const FIREBASE_DISABLED = String(import.meta.env.VITE_FIREBASE_DISABLED ?? '').trim() === '1';

// Direct client-side config (no server-side reading)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

function hasAllConfig(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.authDomain && 
            firebaseConfig.projectId && firebaseConfig.appId);
}

// Debug: log which values are missing
console.log('[Firebase] Config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId
});

/**
 * Initialize and return Firebase app instance
 */
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!browser || FIREBASE_DISABLED) {
    console.log('[Firebase] Skipping init - not in browser or disabled');
    return null;
  }
  
  if (app) return app;

  if (!hasAllConfig()) {
    console.warn('[Firebase] Missing config values, cannot initialize');
    return null;
  }

  try {
    // ✅ Import firebase/auth to register the Auth component with the app
    await import('firebase/auth');
    
    const { initializeApp, getApps } = await import('firebase/app');
    
    // Safe initialization — prevents double-init in SvelteKit
    app = getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApps()[0];
      
    console.log('[Firebase] App initialized:', app.name);
    return app;
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    return null;
  }
}

/**
 * Initialize and return Firestore instance
 */
export async function getFirestore(): Promise<Firestore | null> {
  if (!browser || FIREBASE_DISABLED) return null;
  if (db) return db;

  try {
    const appInstance = await getFirebaseApp();
    if (!appInstance) {
      console.error('[Firebase] Cannot get Firestore - no app instance');
      return null;
    }

    const { getFirestore: getFirestoreFb } = await import('firebase/firestore');
    db = getFirestoreFb(appInstance);
    console.log('[Firebase] Firestore initialized');
    return db;
  } catch (error) {
    console.error('[Firebase] Firestore initialization error:', error);
    return null;
  }
}

/**
 * Initialize and return Firebase Auth instance
 */
export async function getAuth(): Promise<Auth | null> {
  if (!browser || FIREBASE_DISABLED) return null;
  if (auth) return auth;

  try {
    const appInstance = await getFirebaseApp();
    if (!appInstance) {
      console.error('[Firebase] Cannot get Auth - no app instance');
      return null;
    }

    // ✅ Import firebase/auth to register the Auth component
    // This is required in Firebase v9+ to register the service
    await import('firebase/auth');
    
    const { getAuth: getAuthFb } = await import('firebase/auth');
    auth = getAuthFb(appInstance);
    console.log('[Firebase] Auth initialized');
    return auth;
  } catch (error) {
    console.error('[Firebase] Auth initialization error:', error);
    return null;
  }
}
