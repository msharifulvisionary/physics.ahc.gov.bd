const CACHE_NAME = "physics-ahc-cache-v10";
const urlsToCache = [
  "/physics.ahc.gov.bd/index.html",
  "/physics.ahc.gov.bd/style.css",
  "/physics.ahc.gov.bd/script.js",
  "/physics.ahc.gov.bd/icons/icon-192x192.png",
  "/physics.ahc.gov.bd/icons/icon-512x512.png"
];

// Install event
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
