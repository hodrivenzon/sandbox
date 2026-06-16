/* Falar — service worker for offline use.
   Cache-first for our own static assets so the app works fully offline after the
   first visit. Bump CACHE when shipping new files. Speech synthesis still needs
   the OS voice, but all app code/content is cached. */
var CACHE = "falar-v4";
var ASSETS = [
  "./",
  "index.html",
  "css/styles.css",
  "js/dom.js",
  "js/speech.js",
  "js/store.js",
  "js/data.js",
  "js/data-advanced.js",
  "js/content.js",
  "js/components.js",
  "js/tutor-api.js",
  "js/app.js",
  "js/screens/home.js",
  "js/screens/lessons.js",
  "js/screens/lesson.js",
  "js/screens/practice.js",
  "js/screens/quiz.js",
  "js/screens/verbs.js",
  "js/screens/songs.js",
  "js/screens/conversations.js",
  "js/screens/tutor.js",
  "js/screens/dictation.js",
  "js/screens/drill.js",
  "js/screens/mistakes.js",
  "js/screens/progress.js",
  "js/screens/settings.js",
  "js/screens/search.js",
  "manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        return res;
      }).catch(function () { return caches.match("index.html"); });
    })
  );
});
