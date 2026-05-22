import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://2efd4fb0bd1a9cd434b5533c9ea68ae5@o4511434392993792.ingest.de.sentry.io/4511434683646032',

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});