import type { Handle } from '@sveltejs/kit';

/**
 * Server-side hooks for security headers and optimizations
 */
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Add security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Content Security Policy
	// Allow Cloudinary, Google Fonts, Firebase, and other trusted sources
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com",
		"img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://upload.wikimedia.org https://images.unsplash.com https://plus.unsplash.com https://images.pexels.com https://pixabay.com https://cdn.pixabay.com https://*.pixabay.com",
		"font-src 'self' data: https://fonts.gstatic.com https://*.googleapis.com",
		"connect-src 'self' https://*.cloudinary.com https://*.googleapis.com https://*.gstatic.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
		"frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.google.com",
		"media-src 'self' https://res.cloudinary.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests"
	].join('; ');

	response.headers.set('Content-Security-Policy', csp);

	// Performance headers
	response.headers.set('X-DNS-Prefetch-Control', 'on');

	// Cache control for static assets (can be overridden per route)
	if (event.url.pathname.startsWith('/_app/') || event.url.pathname.startsWith('/vendor/')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	}

	return response;
};





















































