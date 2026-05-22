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

    // CSP is managed exclusively in src/hooks.server.ts via response headers
    // to avoid duplicate/conflicting policies.
    prerender: {
      crawl: true,
      entries: ['*'],
      handleHttpError: 'warn'
    },

    experimental: {
      tracing: {
        server: true
      },

      instrumentation: {
        server: true
      }
    }
  }
};

export default config;