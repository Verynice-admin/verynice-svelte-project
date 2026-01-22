/// <reference lib="webworker" />

// Enhanced Service Worker with optimized caching strategies
const VERSION = '1.0.0';
const STATIC_CACHE = `verynice-static-${VERSION}`;
const DYNAMIC_CACHE = `verynice-dynamic-${VERSION}`;
const IMAGE_CACHE = `verynice-images-${VERSION}`;
const API_CACHE = `verynice-api-${VERSION}`;

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/apple-touch-icon.png'
];

const MAX_CACHE_SIZE = {
    images: 50,
    dynamic: 30,
    api: 20
};

const CACHE_DURATION = {
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
    api: 5 * 60 * 1000, // 5 minutes
    static: 30 * 24 * 60 * 60 * 1000 // 30 days
};

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install event - cache static assets immediately
sw.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => sw.skipWaiting())
    );
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('verynice-') && 
                                   !name.includes(VERSION))
                    .map(name => caches.delete(name))
            );
        }).then(() => sw.clients.claim())
    );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName: string, maxItems: number) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        await limitCacheSize(cacheName, maxItems);
    }
}

// Helper: Check if cache is fresh
function isCacheFresh(cachedResponse: Response, maxAge: number): boolean {
    const cached = cachedResponse.headers.get('sw-fetched-on');
    if (!cached) return false;
    return (Date.now() - parseInt(cached)) < maxAge;
}

// Fetch strategy: Cache First (for static assets)
async function cacheFirst(request: Request): Promise<Response> {
    const cached = await caches.match(request);
    if (cached && isCacheFresh(cached, CACHE_DURATION.static)) {
        return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        const cloned = response.clone();
        const headers = new Headers(cloned.headers);
        headers.set('sw-fetched-on', Date.now().toString());
        const modifiedResponse = new Response(cloned.body, {
            status: cloned.status,
            statusText: cloned.statusText,
            headers
        });
        await cache.put(request, modifiedResponse);
    }
    return response;
}

// Fetch strategy: Stale While Revalidate (for images)
async function staleWhileRevalidate(request: Request): Promise<Response> {
    const cached = await caches.match(request);
    
    const fetchPromise = fetch(request).then(async (response) => {
        if (response.ok) {
            const cache = await caches.open(IMAGE_CACHE);
            const cloned = response.clone();
            await cache.put(request, cloned);
            await limitCacheSize(IMAGE_CACHE, MAX_CACHE_SIZE.images);
        }
        return response;
    });

    return cached || fetchPromise;
}

// Fetch strategy: Network First (for API calls)
async function networkFirst(request: Request): Promise<Response> {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(API_CACHE);
            const cloned = response.clone();
            const headers = new Headers(cloned.headers);
            headers.set('sw-fetched-on', Date.now().toString());
            const modifiedResponse = new Response(cloned.body, {
                status: cloned.status,
                statusText: cloned.statusText,
                headers
            });
            await cache.put(request, modifiedResponse);
            await limitCacheSize(API_CACHE, MAX_CACHE_SIZE.api);
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
    }
}

// Main fetch handler with strategy routing
sw.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome extension requests
    if (url.protocol === 'chrome-extension:') return;

    // Route to appropriate caching strategy
    if (url.pathname.startsWith('/api/')) {
        // API calls: Network First
        event.respondWith(networkFirst(request));
    } else if (request.destination === 'image' || 
               url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        // Images: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else if (url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i)) {
        // Static assets: Cache First
        event.respondWith(cacheFirst(request));
    } else {
        // HTML pages: Network First with cache fallback
        event.respondWith(networkFirst(request));
    }
});
