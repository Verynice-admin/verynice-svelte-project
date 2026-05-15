import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x'
    }),
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components'
    },
    prerender: {
      crawl: true,
      entries: ['*'],
      handleHttpError: 'warn'
    }
    // CSP is managed exclusively in src/hooks.server.ts via response headers
    // to avoid duplicate/conflicting policies.
  }
};

export default config;