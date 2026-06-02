import * as Sentry from '@sentry/sveltekit';

// DSN is read from the environment — never hardcode credentials in source.
// PUBLIC_SENTRY_DSN is set in Vercel environment variables and is already used
// by hooks.client.ts. process.env is available before the SvelteKit $env system
// initialises, making it the correct accessor for instrumentation bootstrap code.
Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV ?? 'production',
});