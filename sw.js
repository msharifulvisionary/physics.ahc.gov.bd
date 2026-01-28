// service-worker.js

const CACHE_NAME = "physics-ahc-cache-v6";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./image192.png",
  "./image512.png",
  "./images.png",
  "./fishing.mp4",
  "./assets/physics-banner.jpg",
  "./assets/favicon.png"
];

// Install event - pre-cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  console.log("✅ Service Worker installed");
});

// Fetch event - serve from cache, then network fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return cached response if available
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Dynamically cache new files
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match("./index.html")); // Fallback if totally offline
    })
  );
});

// Activate event - clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  console.log("🧹 Old caches cleared");
});
