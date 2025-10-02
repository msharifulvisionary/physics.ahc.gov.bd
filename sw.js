const CACHE_NAME = "physics-web-cache-v4"; 
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./image192.png",
  "./image512.png",
  "./images.png",
  "./fishing.mp4",
  "./robots.txt",
  "./sitemap.xml"
];

// Install Event (cache files)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Caching files...");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event (delete old cache if version changed)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("🗑️ Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event (cache first, then network)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // যদি cache এ থাকে → ওটাই রিটার্ন করবে
      if (cachedResponse) {
        return cachedResponse;
      }

      // নাহলে নেটওয়ার্ক থেকে নিয়ে cache এ রাখবে
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});
