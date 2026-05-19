import { browser } from '$app/environment';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

async function initialize(): Promise<void> {
  if (!browser || !firebaseConfig.apiKey) return;

  const [
    { initializeApp, getApps },
    { getFirestore },
    { getAuth: getAuthFn, GoogleAuthProvider: GP }
  ] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
    import('firebase/auth')
  ]);

  _app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

  if (_app) {
    _auth = getAuthFn(_app);
    _db = getFirestore(_app);
    _googleProvider = new GP();
    _googleProvider.addScope('profile');
    _googleProvider.addScope('email');
  }
}

// Kick off initialization immediately in the browser. Dynamic imports are
// Vite-bundled and resolve in <1ms on a warm cache — _auth/_db will be set
// well before any onMount callback fires.
if (browser) {
  initialize().catch(err => console.error('[Firebase] Init error:', err));
}

export const getFirebaseAuth = (): Auth | null => _auth;
export const getFirebaseDb = (): Firestore | null => _db;
export const getFirebaseGoogleProvider = (): GoogleAuthProvider | null => _googleProvider;

// Synchronous proxy accessors — safe to use in onMount or reactive statements.
// Property accesses delegate to the underlying instance once init completes.
function lazyProxy<T>(getter: () => T | null): T {
  return new Proxy({} as object, {
    get(_, prop) {
      const target = getter();
      return target ? (target as Record<string | symbol, unknown>)[prop] : undefined;
    }
  }) as unknown as T;
}

export const auth = lazyProxy<Auth>(() => _auth);
export const db = lazyProxy<Firestore>(() => _db);
export const googleProvider = lazyProxy<GoogleAuthProvider>(() => _googleProvider);
