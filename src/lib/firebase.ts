import { browser } from '$app/environment';
import { initializeApp, getApps } from 'firebase/app';
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

let _app: any = null;
let _auth: any = null;
let _db: any = null;
let _googleProvider: any = null;
let initialized = false;

function ensureInitialized() {
  if (initialized || !browser) return;

  if (getApps().length > 0) {
    _app = getApps()[0];
  } else if (firebaseConfig.apiKey) {
    _app = initializeApp(firebaseConfig);
  }

  if (_app) {
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.addScope('profile');
    _googleProvider.addScope('email');
  }

  initialized = true;
}

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

export const auth = createLazyProxy(() => { ensureInitialized(); return _auth; });
export const db = createLazyProxy(() => { ensureInitialized(); return _db; });
export const googleProvider = createLazyProxy(() => { ensureInitialized(); return _googleProvider; });
export default _app;
