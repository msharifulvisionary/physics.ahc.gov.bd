// ========================
// ✅ CACHE SETUP
// ========================
const CACHE_NAME = "physics-web-cache-v6"; // ← প্রতিবার update দিলে version নাম পরিবর্তন করো
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./image192.png",
  "./image512.png",
  "./images.png",
  "./fishing.mp4",
  "./robots.txt",
  "./sitemap.xml",
  "./styles.css", // যদি CSS ফাইল থাকে
  "./app.js" // যদি আলাদা JS ফাইল থাকে
];

// Dynamic Cache Name for API calls or external resources
const DYNAMIC_CACHE = "physics-dynamic-cache-v1";

// ========================
// ✅ INSTALL EVENT
// ========================
self.addEventListener("install", (event) => {
  console.log("✅ Service Worker Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("✅ Caching essential files...");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("✅ Skip waiting on install");
        return self.skipWaiting();
      })
  );
});

// ========================
// ✅ ACTIVATE EVENT
// ========================
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE) {
            console.log("🗑️ Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log("✅ Claiming clients");
      return self.clients.claim();
    })
  );
});

// ========================
// ✅ FETCH EVENT
// ========================
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Handle different types of requests
  if (event.request.url.includes("/api/")) {
    // API requests: Network first, then cache
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Static assets: Cache first, then network
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// ========================
// ✅ CACHE FIRST STRATEGY
// ========================
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log("📦 Serving from cache:", request.url);
    return cachedResponse;
  }

  try {
    console.log("🌐 Fetching from network:", request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("❌ Network failed, serving offline page:", error);
    
    // If request is for HTML and offline, serve offline page
    if (request.headers.get("accept").includes("text/html")) {
      return caches.match("./index.html");
    }
    
    // For other file types, fallback text
    return new Response("Offline content not available", {
      status: 408,
      headers: { "Content-Type": "text/plain" }
    });
  }
}

// ========================
// ✅ NETWORK FIRST STRATEGY (for APIs)
// ========================
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache the successful response
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log("🌐 Network failed, trying cache for:", request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(JSON.stringify({ 
      error: "You are offline", 
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ========================
// ✅ BACKGROUND SYNC EVENT
// ========================
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("🔄 Background sync triggered");
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement your background sync logic here
  console.log("🔄 Performing background sync");
}

// ========================
// ✅ UPDATE SYSTEM SUPPORT
// ========================

// 👉 এই অংশটা নতুনভাবে যুক্ত করা হয়েছে

// Service worker থেকে মেসেজ শোনা (update trigger)
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    console.log("⚡ Force activating new service worker...");
    self.skipWaiting();
  }
});

// যখন নতুন SW সক্রিয় হবে তখন ইউজারদের জানানো
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: "NEW_VERSION_READY" });
      }
    })
  );
});
