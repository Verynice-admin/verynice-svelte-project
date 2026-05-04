import { adminDB } from './firebaseAdmin';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load fallback config from local file
let fallbackConfig: any = null;
try {
  const configPath = resolve('src/lib/config/local-site-config.json');
  fallbackConfig = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (e) {
  // Fallback if file doesn't exist
  fallbackConfig = {
    headerConfig: {
      siteName: 'VERYNICE .kz',
      logoUrlWhite: '/logo.svg',
      logoAltText: 'VeryNice',
      menu: [
        { url: '/history', text: 'History' },
        { url: '/destinations', text: 'Destinations' },
        { url: '/culture', text: 'Heritage' },
        { url: '/food-drink', text: 'Food & Drinks' },
        { url: '/travel-tips', text: 'Travel Tips' },
        { url: '/get-started', text: 'Get Started' },
        { url: '/about-borat', text: 'Me Borat' }
      ]
    },
    footerConfig: {}
  };
}

// Fetch config from Firebase Firestore
async function fetchFirebaseConfig(): Promise<any> {
  try {
    if (!adminDB) {
      console.log('Firebase admin not initialized, using local config');
      return null;
    }
    
    const doc = await adminDB.collection('siteConfig').doc('layout').get();
    
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
    return null;
  }
}

// Helper to only use firebase value if it's not empty/null/undefined
function useFirebaseOrFallback(firebaseValue: any, fallbackValue: any): any {
  if (firebaseValue !== null && firebaseValue !== undefined) {
    // For arrays, only use if not empty
    if (Array.isArray(firebaseValue)) {
      return firebaseValue.length > 0 ? firebaseValue : fallbackValue;
    }
    // For objects, only use if not empty
    if (typeof firebaseValue === 'object') {
      return Object.keys(firebaseValue).length > 0 ? firebaseValue : fallbackValue;
    }
    // For other values, use firebase value
    return firebaseValue;
  }
  return fallbackValue;
}

export async function loadSiteConfig() {
  // Try to get Firebase config first
  const firebaseConfig = await fetchFirebaseConfig();
  
  // Merge Firebase config with local fallback
  // Firebase takes priority ONLY if it has actual values, otherwise use local
  const mergedConfig = {
    headerConfig: {
      ...fallbackConfig?.headerConfig,
      ...(firebaseConfig?.headerConfig || {})
    },
    footerConfig: {
      ...fallbackConfig?.footerConfig,
      ...(firebaseConfig?.footerConfig || {}),
      // For nested objects in footerConfig, use smarter merging
      brand: useFirebaseOrFallback(firebaseConfig?.footerConfig?.brand, fallbackConfig?.footerConfig?.brand),
      footerMenuLinks: useFirebaseOrFallback(firebaseConfig?.footerConfig?.footerMenuLinks, fallbackConfig?.footerConfig?.footerMenuLinks),
      techMenuLinks: useFirebaseOrFallback(firebaseConfig?.footerConfig?.techMenuLinks, fallbackConfig?.footerConfig?.techMenuLinks),
      social: useFirebaseOrFallback(firebaseConfig?.footerConfig?.social, fallbackConfig?.footerConfig?.social),
      columns: useFirebaseOrFallback(firebaseConfig?.footerConfig?.columns, fallbackConfig?.footerConfig?.columns)
    }
  };
  
  return mergedConfig;
}
