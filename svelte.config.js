import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x'
    }),

    alias: {
      $lib: 'src/lib',
      $components: 'src/lib/components'
    },

    // CSP: mode 'auto' generates per-request nonces for SSR and build-time hashes for prerendered pages.
    // 'strict-dynamic' in script-src causes CSP3 browsers to ignore 'unsafe-inline' and only trust
    // nonce-bearing scripts and scripts they load. 'unsafe-inline' remains for CSP2 fallback.
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'strict-dynamic'",
          'https://fonts.googleapis.com',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'https://apis.google.com'
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://*.googleapis.com',
          'https://*.gstatic.com'
        ],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://*.cloudinary.com',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'https://upload.wikimedia.org',
          'https://images.unsplash.com',
          'https://plus.unsplash.com',
          'https://images.pexels.com',
          'https://pixabay.com',
          'https://cdn.pixabay.com',
          'https://*.pixabay.com',
          'https://maps.gstatic.com',
          'https://*.maps.googleapis.com',
          'https://*.tile.openstreetmap.org',
          'https://tile.openstreetmap.org'
        ],
        'font-src': [
          "'self'",
          'data:',
          'https://fonts.gstatic.com',
          'https://*.googleapis.com'
        ],
        'connect-src': [
          "'self'",
          'https://*.cloudinary.com',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'https://*.firebaseio.com',
          'https://*.firebaseapp.com',
          'wss://*.firebaseio.com',
          'https://apis.google.com',
          'https://nominatim.openstreetmap.org',
          'https://*.openstreetmap.org',
          'https://api.groq.com',
          'https://generativelanguage.googleapis.com',
          'https://openrouter.ai',
          'https://geocoding-api.open-meteo.com',
          'https://api.open-meteo.com',
          'https://*.ingest.sentry.io'
        ],
        'frame-src': [
          "'self'",
          'https://www.youtube.com',
          'https://player.vimeo.com',
          'https://www.google.com',
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://verynice-kz.firebaseapp.com',
          'https://*.gstatic.com'
        ],
        'media-src': ["'self'", 'https://res.cloudinary.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'upgrade-insecure-requests': true
      }
    },

    prerender: {
      crawl: true,
      entries: ['*'],
      handleHttpError: 'warn'
    },

    experimental: {
      instrumentation: {
        server: true
      }
    }
  }
};

export default config;