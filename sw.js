self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('physics-web-cache').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        'https://i.imgur.com/bLsJS9s.png',
        'https://i.imgur.com/oSvcwIl.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
