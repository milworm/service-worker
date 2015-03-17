var CACHE_NAME = "sw-1",
	CACHE_URLS = [
		"./cached.html"
	];

self.addEventListener("install", function(event) {
    event.waitUntill(caches.open(CACHE_NAME).then(function(cache) {
    	console.log("cache opened");
    	return cache.addAll(CACHE_URLS);
    }));
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