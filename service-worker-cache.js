// This polyfill provides Cache.add(), Cache.addAll(), and CacheStorage.match(),
// which are not implemented in Chrome 40.
Cache.prototype.add||(Cache.prototype.add=function(t){return this.addAll([t])}),Cache.prototype.addAll||(Cache.prototype.addAll=function(t){function e(t){this.name="NetworkError",this.code=19,this.message=t}var r=this;return e.prototype=Object.create(Error.prototype),Promise.resolve().then(function(){if(arguments.length<1)throw new TypeError;return t=t.map(function(t){return t instanceof Request?t:String(t)}),Promise.all(t.map(function(t){"string"==typeof t&&(t=new Request(t));var r=new URL(t.url).protocol;if("http:"!==r&&"https:"!==r)throw new e("Invalid scheme");return fetch(t.clone())}))}).then(function(e){return Promise.all(e.map(function(e,n){return r.put(t[n],e)}))}).then(function(){return void 0})}),CacheStorage.prototype.match||(CacheStorage.prototype.match=function(t,e){var r=this;return this.keys().then(function(n){var o;return n.reduce(function(n,u){return n.then(function(){return o||r.open(u).then(function(r){return r.match(t,e)}).then(function(t){return o=t})})},Promise.resolve())})});

var CACHE_NAME = "challengeu";

self.addEventListener("install", function(event) {
    console.log("service worked has been successfully installed");
});

self.addEventListener("fetch", function(event) {
    event.respondWith(Promise.resolve().then(function() {
        var request = event.request;

        if(! isCacheable(request))
            return fetch(request);

        return caches.match(request).then(function(response) {
            if(response)
                return response;

            return fetch(request).then(function(response) {
                console.log('Response for %s from network is: %O', request.url, response);

                if (response.status == 200)
                    cache.put(request.clone(), response.clone());

                return response;
            });
        });
    }));
});

var isCacheable = function(request) {
    var url = request.url,
        extension = url.split(".").reverse()[0];

    return ["css", "js"].indexOf(extension) > -1;
}