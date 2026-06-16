/* The Sandbox — hub service worker (offline support for the landing page only).
   Deliberately conservative: it precaches just the hub shell and serves
   cache-first with a network fallback. It does NOT cache anything at runtime,
   so it can never interfere with the sub-apps (Tiny Explorers, Falar, FORGE),
   which are served normally (and have their own workers where applicable). */
var CACHE = "sandbox-hub-v2";
var SHELL = ["./", "index.html", "404.html", "site.webmanifest", "icons/hub-icon.svg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
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
      return fetch(e.request).catch(function () {
        // offline navigation fallback → the hub
        if (e.request.mode === "navigate") return caches.match("index.html");
        throw new Error("offline");
      });
    })
  );
});
