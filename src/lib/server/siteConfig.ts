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
      { url: '/history', text: 'History' },
      { url: '/destinations', text: 'Destinations' },
      { url: '/culture', text: 'Culture' },
      { url: '/food-drink', text: 'Food & Drinks' },
      { url: '/tips', text: 'Travel Tips' }
    ]
  },
  footerConfig: fallbackConfig?.footerConfig || {}
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedConfig: any = null;
let lastFetchTime = 0;

export async function loadSiteConfig() {
  const now = Date.now();
  if (cachedConfig && (now - lastFetchTime < CACHE_TTL)) {
    return cachedConfig;
  }

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
    cachedConfig = {
      headerConfig: { ...DEFAULTS.headerConfig, ...headerConfig },
      footerConfig: { ...DEFAULTS.footerConfig, ...footerConfig }
    };
    // Override 'History 2' from database if present, without touching DB
    const replaceHistory2 = (items: any[]) => {
      if (!Array.isArray(items)) return items;
      return items.map(item => {
        if (item.url === '/history2') {
          return { ...item, url: '/destinations', text: 'Destinations' };
        }
        return item;
      });
    };

    if (cachedConfig.headerConfig?.menuLinks) {
      cachedConfig.headerConfig.menuLinks = replaceHistory2(cachedConfig.headerConfig.menuLinks);
    }
    if (cachedConfig.headerConfig?.menu) {
      cachedConfig.headerConfig.menu = replaceHistory2(cachedConfig.headerConfig.menu);
    }

    lastFetchTime = now;
    return cachedConfig;
  } catch (error) {
    console.error('[siteConfig] Error loading config:', error);
    return DEFAULTS;
  }
}
