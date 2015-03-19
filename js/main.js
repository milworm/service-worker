window.onload = function() {
    document.querySelector("h1").innerHTML = "index.html (js)";
}

navigator.serviceWorker.register("service-worker-cache.js?nocache=1", {
    scope: "./"
}).then(function(registration) {
    console.log("success", registration);
}).catch(function(error) {
    console.log("failure:", error);
});