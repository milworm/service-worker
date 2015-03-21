// firefox doesn't have Cache, but it completetly supports cach.addAll etc..
if(typeof Cache != "undefined") {
    // This polyfill provides Cache.add(), Cache.addAll(), and CacheStorage.match(),
    // which are not implemented in Chrome 40.
    Cache.prototype.add||(Cache.prototype.add=function(t){return this.addAll([t])}),Cache.prototype.addAll||(Cache.prototype.addAll=function(t){function e(t){this.name="NetworkError",this.code=19,this.message=t}var r=this;return e.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return t=t.map(function(t){return t instanceof Request?t:String(t)}),Promise.all(t.map(function(t){"string"==typeof t&&(t=new Request(t));var r=new URL(t.url).protocol;if("http:"!==r&&"https:"!==r)throw new e("Invalid scheme");return fetch(t.clone())}))}).then(function(e){return Promise.all(e.map(function(e,n){return r.put(t[n],e)}))}).then(function(){return void 0})}),CacheStorage.prototype.match||(CacheStorage.prototype.match=function(t,e){var r=this;return this.keys().then(function(n){var o;return n.reduce(function(n,u){return n.then(function(){return o||r.open(u).then(function(r){return r.match(t,e)}).then(function(t){return o=t})})},Promise.resolve())})});
}

var VERSION = 16,
    CACHE_NAME = "challengeu" + VERSION,
    CACHE_URLS = [
        "./css/main.css?v=" + VERSION,
        "./js/main.js?v=" + VERSION
    ];

/**
 * @param {Object} request
 * @return {Boolean}
 */
var isCacheable = function(request) {
    var url = request.url.split("?")[0];

    // do not cache service workers.
    if(url.indexOf("sw.js") > -1)
        return false;

    // cache any css/js file.
    return ["css", "js"].indexOf(url.split(".").pop()) > -1;
}
    
/**
 * @return {Promise}
 */
var openCache = function() {
    return caches.open(CACHE_NAME);
}

/**
 * @param {Request} request
 * @return {Promise}
 */
var checkInCache = function(request) {
    return openCache().then(function(cache) {
        return cache.match(request);
    });
}

/**
 * @param {Request} request
 * @param {Response} response
 * @return {Promise}
 */
var putInCache = function(request, response) {
    return openCache().then(function(cache) {
        return cache.put(request, response);
    });
}
    
/**
 * @param {Request} request
 * @return {Response|Promise}
 */
var onIndexRequested = function(request) {
    // we need to make a unique index-url, in order to avoid potential 
    // cache problems when user requests:
    // http://app.com/root_path/index.html
    // http://app.com/root_path/
    // http://app.com/root_path
    // http://app.com/index.html
    // http://app.com/
    // http://app.com

    var indexUrl = request.url;

    if(indexUrl.endsWith("/"))
        indexUrl = indexUrl.slice(0, -1);

    if(indexUrl.indexOf("index.html") == -1)
        indexUrl += "/index.html";

    request = new Request(indexUrl);

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
        // if(response)
        //     return response;

        return fetchAndCache(request);
    });
}
    
/**
 * @param {Request} request
 * @return {Response}
 */
var fetchAndCache = function(request) {
    return fetch(request).then(function(response) {
        console.log('Response for %s from network is: %O', request.url, response);

        // if (response.status == 200)
        //     putInCache(request, response.clone());

        return response;
    });
}

/**
 * checks if user requests an index-page or not.
 * @param {String} url
 * @return {Boolean}
 */
var isIndexPageRequested = function(url) {
    return false;
    if(url.indexOf("index.html") > -1)
        return true;

    if(url.endsWith("/"))
        url = url.slice(0, -1);

    if(location.origin == url)
        return true;

    url = url.replace(location.origin, "");

    // check if user requested:
    // /root_path
    if(url.split("/").pop().split(".").length == 1)
        return true;

    return false;
}

// self.addEventListener("install", function(event) {
//     event.waitUntil(Promise.all([
//         // add static files.
//         openCache().then(function(cache) {
//             cache.addAll(CACHE_URLS);
//         }),

//         // cleanup old caches.
//         caches.keys().then(function(names) {
//             var methods = names.map(function(name) {
//                 if (name == CACHE_NAME)
//                     return ;

//                 console.log("Deleting out of date cache:", name);
//                 return caches.delete(name);
//             });

//             return Promise.all(methods);
//         })
//     ]));
// });

self.addEventListener("fetch", function(event) {
    event.respondWith(Promise.resolve().then(function() {
        var request = event.request.clone();

        if(isIndexPageRequested(request.url))
            return onIndexRequested(request);
        else
            return onResourceRequested(request);
    }));
});