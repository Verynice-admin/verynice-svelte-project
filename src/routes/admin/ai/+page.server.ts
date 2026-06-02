import type { PageServerLoad, Actions } from './$types';
import { adminDB } from '$lib/server/firebaseAdmin';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';

const VALID_PROVIDERS = new Set(['groq', 'gemini', 'openrouter', 'openai']);

export const load: PageServerLoad = async () => {
  // Which providers have API keys configured (server only — never sent as key values)
  const configured = {
    groq:       !!env.GROQ_API_KEY,
    gemini:     !!env.GEMINI_API_KEY,
    openrouter: !!env.OPENROUTER_API_KEY,
    openai:     !!env.OPENAI_API_KEY,
  };

  // Runtime AI config stored in Firestore (controls which provider is active, feature toggles)
  let aiConfig: Record<string, unknown> = {};
  if (adminDB) {
    const snap = await adminDB.collection('siteConfig').doc('aiConfig').get().catch(() => null);
    if (snap?.exists) aiConfig = snap.data() ?? {};
  }

  return {
    configured,
    aiConfig: {
      activeProvider:            (aiConfig.activeProvider as string)  ?? 'groq',
      commentModerationEnabled:  (aiConfig.commentModerationEnabled as boolean) ?? true,
      editorialRewriteEnabled:   (aiConfig.editorialRewriteEnabled as boolean)  ?? true,
      translationEnabled:        (aiConfig.translationEnabled as boolean)        ?? true,
      aiChatEnabled:             (aiConfig.aiChatEnabled as boolean)             ?? true,
    },
  };
};

export const actions: Actions = {
  saveConfig: async ({ request }) => {
    if (!adminDB) return fail(503, { error: 'Service unavailable' });

    const fd = await request.formData();
    const activeProvider = String(fd.get('activeProvider') ?? 'groq');

    if (!VALID_PROVIDERS.has(activeProvider)) {
      return fail(400, { error: 'Invalid provider' });
    }

    const patch = {
      activeProvider,
      commentModerationEnabled: fd.get('commentModerationEnabled') === 'true',
      editorialRewriteEnabled:  fd.get('editorialRewriteEnabled')  === 'true',
      translationEnabled:       fd.get('translationEnabled')       === 'true',
      aiChatEnabled:            fd.get('aiChatEnabled')            === 'true',
      updatedAt:                new Date().toISOString(),
    };

    await adminDB.collection('siteConfig').doc('aiConfig').set(patch, { merge: true });
    return { success: true };
  },
};
