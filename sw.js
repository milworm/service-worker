// This polyfill provides Cache.add(), Cache.addAll(), and CacheStorage.match(),
// which are not implemented in Chrome 40.
Cache.prototype.add||(Cache.prototype.add=function(t){return this.addAll([t])}),Cache.prototype.addAll||(Cache.prototype.addAll=function(t){function e(t){this.name="NetworkError",this.code=19,this.message=t}var r=this;return e.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return t=t.map(function(t){return t instanceof Request?t:String(t)}),Promise.all(t.map(function(t){"string"==typeof t&&(t=new Request(t));var r=new URL(t.url).protocol;if("http:"!==r&&"https:"!==r)throw new e("Invalid scheme");return fetch(t.clone())}))}).then(function(e){return Promise.all(e.map(function(e,n){return r.put(t[n],e)}))}).then(function(){return void 0})}),CacheStorage.prototype.match||(CacheStorage.prototype.match=function(t,e){var r=this;return this.keys().then(function(n){var o;return n.reduce(function(n,u){return n.then(function(){return o||r.open(u).then(function(r){return r.match(t,e)}).then(function(t){return o=t})})},Promise.resolve())})});

var CACHE_NAME = "challengeu";

/**
 * @param {Object} request
 * @return {Boolean}
 */
var isCacheable = function(request) {
    var url = request.url.split("?")[0];

    // do not cache service workers.
    if(url.indexOf("service-worker") > -1)
        return false;

    // cache any css/js file.
    return ["css", "js"].indexOf(url.split(".").pop()) > -1;
}

/**
 * @param {Request} request
 * @return {Promise}
 */
var checkInCache = function(request) {
    return caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(request);
    });
}
    
/**
 * @param {Request} request
 * @return {Response|Promise}
 */
var onIndexRequested = function(request) {
    if(navigator.onLine)
        return fetchAndCache(request);

    return checkInCache(request).then(function(response) {
        if(response)
            return response;
        
        return fetch(request);
    });
}

/**
 * @param {Request} request
 * @return {Response|Promise}
 */
var onResourceRequested = function(request) {
    if(! isCacheable(request))
        return fetch(request);

    return checkInCache(request).then(function(response) {
        if(response)
            return response;

        return fetchAndCache(request);
    });
}
    
/**
 * @param {Request} request
 * @return {Response}
 */
var fetchAndCache = function(request) {
    fetch(request).then(function(response) {
        console.log('Response for %s from network is: %O', request.url, response);

        if (response.status == 200)
            cache.put(request, response.clone());

        return response;
    });
}

/**
 * checks if user requests an index-page or not.
 * @param {Object} request
 * @return {Boolean}
 */
var isIndexPageRequested = function(request) {
    var url = request.url;

    if(url.indexOf("index.html") > -1)
        return true;

    if(url.endsWith("/"))
        url = url.slice(0, -1);

    if(location.origin == url)
        return true;

    return false;
}

self.addEventListener("fetch", function(event) {
    event.respondWith(Promise.resolve().then(function() {
        var request = event.request.clone();

        if(isIndexPageRequested(request.url))
            return onIndexRequested(request);
        else
            return onResourceRequested(request);
    }));
});