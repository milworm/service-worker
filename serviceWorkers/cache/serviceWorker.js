// This polyfill provides Cache.add(), Cache.addAll(), and CacheStorage.match(),
// which are not implemented in Chrome 40.

importScripts("./cache-polyfill.js");

var CACHE_NAME = "challengeu",
    CACHE_URLS = [
        "./css/main.css",
        "./js/main.js"
    ];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("cache opened");
            return cache.addAll(CACHE_URLS);
        }).catch(function(error) {
            console.log("can't add to cache");
        });
    );
});

self.addEventListener("fetch", function(event) {
    event.respondWith(caches.match(event.request).then(function(response) {
        if(response) {
            console.log("fetched from cache");
            return response;
        }

        return fetch(event.request);
    }));
});