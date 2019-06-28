const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic'

const STATIC_FILES = [
  './',
  './index.html',
  './js/app.js',
  './css/style.css'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...');
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_STATIC_NAME);
      return cache.addAll(STATIC_FILES);
    } catch(error) {
      console.log(error);
    }
  })());
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker ....');
  event.waitUntil((async () => {
    try {
      const keyList = await caches.keys();
      keyList.forEach(async key => {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log('[Service Worker] Removing old caches');
          await caches.delete(key);
        }
      });
    } catch(error) {
      console.log(error);
    }
  })());
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    try {
      let data = await caches.match(event.request);
      if (data) {
        return data;
      } else {
        try {
          data = await fetch(event.request);
          const cache = await caches.open(CACHE_DYNAMIC_NAME);
          cache.put(event.request.url , data.clone());
          return data;
        } catch(error) {
          const cache = await caches.open(CACHE_STATIC_NAME);
          data = await cache.match('./offline.html');
          return data;
        }
      }
    } catch(error) {
      console.log(error);
    }
  })());
});
