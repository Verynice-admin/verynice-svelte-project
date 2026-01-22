import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter({
      runtime: 'edge', // Use edge runtime for faster response times
      split: true // Enable route-based code splitting
    }),
    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components'
    },
    prerender: {
      // Prerender static pages for instant loading
      crawl: true,
      entries: ['*'],
      handleHttpError: 'warn'
    },
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'img-src': ['self', 'data:', 'https:', 'res.cloudinary.com'],
        'connect-src': ['self', 'https:']
      }
    }
  }
};

export default config;