self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('physics-web-cache').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        'image512.png',
        'image192.png'
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
