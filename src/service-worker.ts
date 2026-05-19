/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in static/
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE_NAME) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// Ignore non-GET requests and non-http(s) requests (like chrome-extension://)
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

	// Never intercept cross-origin requests (Firebase, Cloudinary, Google APIs, etc.)
	// cache.put() on cross-origin responses causes network errors in the browser
	if (url.origin !== self.location.origin) return;

	async function respond() {
		const cache = await caches.open(CACHE_NAME);

		// Serve build assets directly from cache (always fresh after install)
		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse;
		}

		// For same-origin navigation and API: network first, cache as fallback
		try {
			const response = await fetch(event.request);
			// Only cache successful same-origin responses (not opaque/cross-origin)
			if (response.status === 200 && response.type === 'basic') {
				cache.put(event.request, response.clone());
			}
			return response;
		} catch {
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) return cachedResponse;
			return new Response('Offline', { status: 503 });
		}
	}

	event.respondWith(respond());
});
