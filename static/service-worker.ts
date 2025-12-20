/// <reference lib="webworker" />

const CACHE_NAME = 'verynice-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/apple-touch-icon.png'
];

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install event - cache static assets
sw.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    sw.skipWaiting();
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    sw.clients.claim();
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Cache successful responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});
