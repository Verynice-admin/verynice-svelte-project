import type { PageServerLoad, Actions } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { fail } from '@sveltejs/kit';

const DEFAULT_FEATURES = {
  commentsEnabled:      true,
  reviewsEnabled:       true,
  translationsEnabled:  true,
  aiChatEnabled:        true,
  likesEnabled:         true,
  maintenanceMode:      false,
  maintenanceMessage:   'The site is temporarily down for maintenance. Back shortly.',
};

export const load: PageServerLoad = async () => {
  if (!adminDB) {
    return { features: DEFAULT_FEATURES, navMenu: [], seeds: getSeedList() };
  }

  const [featSnap, navSnap] = await Promise.all([
    adminDB.collection('siteConfig').doc('features').get().catch(() => null),
    adminDB.collection('siteConfig').doc('layout').get().catch(() => null),
  ]);

  const features = featSnap?.exists
    ? { ...DEFAULT_FEATURES, ...(featSnap.data() ?? {}) }
    : { ...DEFAULT_FEATURES };

  const navMenu: { text: string; url: string }[] =
    navSnap?.data()?.headerConfig?.menu ?? [];

  return { features, navMenu, seeds: getSeedList() };
};

function getSeedList() {
  return [
    { id: 'altyn-emel',     label: 'Altyn-Emel National Park',  endpoint: '/api/seed-altyn-emel' },
    { id: 'charyn-canyon',  label: 'Charyn Canyon',             endpoint: '/api/seed-charyn-canyon' },
    { id: 'big-almaty-lake',label: 'Big Almaty Lake',           endpoint: '/api/seed-big-almaty-lake' },
    { id: 'migrate-toc',    label: 'Migrate TOC structure',     endpoint: '/api/admin/migrate-toc' },
  ];
}

export const actions: Actions = {
  saveFeatures: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });

    const fd = await request.formData();
    const patch: Record<string, unknown> = {
      commentsEnabled:     fd.get('commentsEnabled')     === 'true',
      reviewsEnabled:      fd.get('reviewsEnabled')      === 'true',
      translationsEnabled: fd.get('translationsEnabled') === 'true',
      aiChatEnabled:       fd.get('aiChatEnabled')       === 'true',
      likesEnabled:        fd.get('likesEnabled')        === 'true',
      maintenanceMode:     fd.get('maintenanceMode')     === 'true',
      updatedAt: new Date().toISOString(),
    };

    const msg = fd.get('maintenanceMessage');
    if (typeof msg === 'string') patch.maintenanceMessage = msg.slice(0, 300);

    await adminDB.collection('siteConfig').doc('features').set(patch, { merge: true });
    return { success: true };
  },

  clearCache: async () => {
    // The in-memory cache (cache.ts) lives in the server process.
    // Calling invalidate() on known keys is the correct approach.
    // We expose a lightweight endpoint to do this from the admin UI.
    // For now, just acknowledge — actual cache invalidation happens via the API endpoint.
    return { cacheCleared: true };
  },
};
