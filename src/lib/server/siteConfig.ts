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
        { url: '/cities', text: 'Cities' },
        { url: '/attractions', text: 'Attractions' },
        { url: '/history', text: 'History' },
        { url: '/culture', text: 'Culture' },
        { url: '/food-drink', text: 'Food & Drinks' },
        { url: '/tips', text: 'Travel Tips' }
      ]
    },
    footerConfig: {}
  };
}

const DEFAULTS = {
  headerConfig: fallbackConfig?.headerConfig || {
    siteName: 'VERYNICE .kz',
    menuLinks: [
      { url: '/cities', text: 'Cities' },
      { url: '/attractions', text: 'Attractions' },
      { url: '/history', text: 'History' },
      { url: '/culture', text: 'Culture' },
      { url: '/food-drink', text: 'Food & Drinks' },
      { url: '/tips', text: 'Travel Tips' }
    ]
  },
  footerConfig: fallbackConfig?.footerConfig || {}
};

export async function loadSiteConfig() {
  if (!adminDB) {
    console.warn('[siteConfig] Firebase Admin not initialized, using fallback config');
    return DEFAULTS;
  }

  try {
    const headerDocRef = adminDB.collection('siteConfig').doc('headerConfig');
    const footerDocRef = adminDB.collection('siteConfig').doc('footerContent');

    const [headerSnap, footerSnap] = await Promise.all([
      headerDocRef.get(),
      footerDocRef.get()
    ]);

    const headerConfig = headerSnap.exists ? headerSnap.data() : DEFAULTS.headerConfig;
    const footerConfig = footerSnap.exists ? footerSnap.data() : DEFAULTS.footerConfig;

    // Merge with defaults to ensure required fields
    return {
      headerConfig: { ...DEFAULTS.headerConfig, ...headerConfig },
      footerConfig: { ...DEFAULTS.footerConfig, ...footerConfig }
    };
  } catch (error) {
    console.error('[siteConfig] Error loading config:', error);
    return DEFAULTS;
  }
}
