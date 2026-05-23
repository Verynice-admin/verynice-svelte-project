import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';

// Sentry.init() is called in src/instrumentation.server.ts (loaded first via experimental.instrumentation.server).
// Do NOT call Sentry.init() here — a second init with undefined DSN re-registers the OTel TracerProvider and throws.

export const handleError = Sentry.handleErrorWithSentry();

const securityHandle: Handle = async ({ event, resolve }) => {
	// Redirect old /traveller-portal URL to new /get-started URL
	if (event.url.pathname === '/traveller-portal' || event.url.pathname === '/traveller-portal/') {
		return new Response(null, {
			status: 301,
			headers: { Location: '/get-started' }
		});
	}

	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
	response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	}

	// Content Security Policy — single source of truth (svelte.config.js csp block removed)
	// unsafe-inline required for SvelteKit inline styles; unsafe-eval removed.
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com https://apis.google.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com",
		"img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://upload.wikimedia.org https://images.unsplash.com https://plus.unsplash.com https://images.pexels.com https://pixabay.com https://cdn.pixabay.com https://*.pixabay.com https://maps.gstatic.com https://*.maps.googleapis.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
		"font-src 'self' data: https://fonts.gstatic.com https://*.googleapis.com",
		"connect-src 'self' https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://apis.google.com https://nominatim.openstreetmap.org https://*.openstreetmap.org https://api.groq.com https://generativelanguage.googleapis.com https://openrouter.ai https://geocoding-api.open-meteo.com https://api.open-meteo.com https://*.ingest.sentry.io",
		"frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com https://accounts.google.com https://apis.google.com https://verynice-kz.firebaseapp.com https://*.gstatic.com",
		"media-src 'self' https://res.cloudinary.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);
	response.headers.set('X-DNS-Prefetch-Control', 'on');

	// Cache control
	if (event.url.pathname.startsWith('/_app/') || event.url.pathname.startsWith('/vendor/')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (!event.url.pathname.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, must-revalidate');
	}

	return response;
};

export const handle = sequence(Sentry.sentryHandle(), securityHandle);
