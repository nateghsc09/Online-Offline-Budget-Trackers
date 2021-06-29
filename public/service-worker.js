const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// install
self.addEventListener("install", function (event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
        console.log("Cache opened");
        return cache.addAll(FILES_TO_CACHE);
    })
  );
  // activeate immediatly 
  self.skipWaiting();
});

self.addEventListener("fetch", function(event){

    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }
});