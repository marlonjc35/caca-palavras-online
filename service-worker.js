/**
 * service-worker.js — Caça-Palavras Online PWA
 * Cache-first strategy para assets, network-first para HTML.
 * Permite funcionamento totalmente offline após o primeiro carregamento.
 */

const CACHE_NAME = 'caca-palavras-v1.1.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/js/dictionary.js',
    '/assets/js/levels.js',
    '/assets/js/generator.js',
    '/assets/js/storage.js',
    '/assets/js/audio.js',
    '/assets/js/ui.js',
    '/assets/js/game.js',
    '/assets/images/icons/favicon.svg'
];

// Install: pré-cacheia assets essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('SW: cache error', err))
    );
});

// Activate: limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: estratégia de cache
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignora requisições não-GET
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Apenas mesma origem
    if (url.origin !== self.location.origin) return;

    // HTML: network-first (para atualizações)
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
        );
        return;
    }

    // Outros assets: cache-first
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                }).catch(() => cached);
            })
    );
});
