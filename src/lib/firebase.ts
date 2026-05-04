import { browser } from '$app/environment';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Debug logging - only in browser
if (browser) {
  console.log('[Firebase] Config check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId
  });
}

// Internal variables (with underscore to avoid naming conflict)
let _app: any = null;
let _auth: any = null;
let _db: any = null;
let _googleProvider: any = null;
let initialized = false;

function ensureInitialized() {
  if (initialized || !browser) return;
  
  console.log('[Firebase] Running initialization...');
  
  // Check if already initialized
  if (getApps().length > 0) {
    _app = getApps()[0];
    console.log('[Firebase] Using existing app:', _app.name);
  } else if (firebaseConfig.apiKey) {
    _app = initializeApp(firebaseConfig);
    console.log('[Firebase] Created new app:', _app.name);
  }
  
  if (_app) {
    // Use getAuth - it handles both new and existing auth instances
    _auth = getAuth(_app);
    console.log('[Firebase] Auth instance:', _auth);
    
    _db = getFirestore(_app);
    console.log('[Firebase] DB instance:', _db);
    
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.addScope('profile');
    _googleProvider.addScope('email');
    console.log('[Firebase] Provider created');
  } else {
    console.error('[Firebase] No app instance could be created!');
  }
  
  initialized = true;
  console.log('[Firebase] Lazy initialization complete:', { 
    app: !!_app, 
    auth: !!_auth, 
    authType: _auth?.constructor?.name,
    db: !!_db,
    dbType: _db?.constructor?.name,
    provider: !!_googleProvider,
    providerType: _googleProvider?.constructor?.name
  });
}

// Create lazy proxy objects that initialize on first access
const createLazyProxy = (getter: () => any) => {
  return new Proxy({}, {
    get(_, prop) {
      const value = getter();
      if (value && typeof value === 'object') {
        return value[prop as string];
      }
      return value;
    },
    apply(_, thisArg, args) {
      const value = getter();
      if (typeof value === 'function') {
        return value.apply(thisArg, args);
      }
      throw new Error('Not a function');
    }
  });
};

// Export getter functions
export const getFirebaseAuth = () => {
  ensureInitialized();
  return _auth;
};

export const getFirebaseDb = () => {
  ensureInitialized();
  return _db;
};

export const getFirebaseGoogleProvider = () => {
  ensureInitialized();
  return _googleProvider;
};

// Export lazy proxies for backward compatibility - these trigger init on first use
export const auth = createLazyProxy(() => { ensureInitialized(); return _auth; });
export const db = createLazyProxy(() => { ensureInitialized(); return _db; });
export const googleProvider = createLazyProxy(() => { ensureInitialized(); return _googleProvider; });
export default _app;
