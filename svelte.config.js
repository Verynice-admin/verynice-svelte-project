// svelte.config.js (UPDATED FOR VERCEL)

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-vercel'; // <-- 1. Import the adapter

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // --- 2. THE FIX IS HERE ---
    // This tells SvelteKit to output the project in the exact format Vercel needs.
    adapter: adapter()
  }
};

export default config;