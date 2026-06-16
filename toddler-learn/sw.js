/* Tiny Explorers — service worker for offline play.
   Cache-first for the (tiny, fully-static) app shell. Bumping CACHE
   invalidates the old cache on the next visit. */
var CACHE = "tiny-explorers-v5";

var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "css/styles.css",
  "js/i18n.js",
  "js/auth.js",
  "js/config.js",
  "js/data.js",
  "js/audio.js",
  "js/ui.js",
  "js/app.js",
  "js/activities/home.js",
  "js/activities/colors.js",
  "js/activities/shapes.js",
  "js/activities/numbers.js",
  "js/activities/animals.js",
  "js/activities/letters.js",
  "js/activities/music.js",
  "js/activities/match.js",
  "js/activities/body.js",
  "js/activities/draw.js",
  "js/activities/weather.js",
  "js/activities/bubblepop.js",
  "js/activities/peekaboo.js",
  "js/activities/soundmatch.js",
  "js/activities/settings.js",
  "js/activities/parents.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        // cache successful same-origin responses for next time
        if (res && res.ok && e.request.url.indexOf(self.location.origin) === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return caches.match("index.html"); });
    })
  );
});
