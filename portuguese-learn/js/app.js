/* Falar — app shell + hash router.
   A tiny single-page app: each screen registers itself on PT.screens and the
   router swaps the visible screen on hashchange. Routes look like:
     #/                 -> home
     #/lessons          -> lessons list
     #/lesson/<id>      -> one lesson
     #/practice[/<id>]  -> flashcards (optionally for one lesson)
     #/quiz[/<id>]      -> quiz
     #/verbs · #/search
   No build step, no framework, no fetch — runs from a double-clicked index.html
   or any static host (e.g. GitHub Pages). */
(function () {
  var screenHost = document.getElementById("screen");
  var backBtn = document.getElementById("back-btn");
  var soundBtn = document.getElementById("sound-btn");
  var tabbar = document.getElementById("tabbar");
  var prev = null;

  function parse() {
    var raw = (location.hash || "").replace(/^#\/?/, "").trim();
    var parts = raw.split("/").filter(Boolean);
    var id = parts[0] || "home";
    if (!PT.screens[id]) { id = "home"; parts = []; }
    return { id: id, arg: parts[1] || null };
  }

  function render() {
    var route = parse();
    var screen = PT.screens[route.id];

    if (prev && prev.onLeave) { try { prev.onLeave(); } catch (e) {} }
    prev = screen;

    document.body.setAttribute("data-screen", route.id);
    document.title = (route.id === "home" ? "Falar — Learn Brazilian Portuguese" : screen.title + " · Falar");

    // back button shows on detail screens (anything reached from a tab)
    var isTab = !!tabbar.querySelector('[data-tab="' + route.id + '"]');
    backBtn.hidden = (route.id === "home");

    // highlight the owning tab
    var ownTab = screen.tab || route.id;
    Array.prototype.forEach.call(tabbar.querySelectorAll(".tab"), function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === ownTab);
    });

    window.scrollTo(0, 0);
    try { screen.render(screenHost, route.arg); }
    catch (e) {
      screenHost.innerHTML = '<p class="screen-pad">Something went wrong on this screen.</p>';
      if (window.console) console.error(e);
    }
  }

  PT.go = function (hash) { location.hash = hash || "#/"; };

  /* ---- controls ---------------------------------------------------------- */
  backBtn.addEventListener("click", function () {
    PT.audio.pop();
    if (history.length > 1) history.back(); else location.hash = "#/";
  });

  soundBtn.addEventListener("click", function () {
    var muted = PT.audio.toggleMute();
    soundBtn.textContent = muted ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-label", muted ? "Unmute audio" : "Mute audio");
    if (!muted) PT.audio.pop();
  });

  window.addEventListener("hashchange", render);

  /* Warm up the speech engine on the first user gesture (autoplay policy). */
  function firstGesture() {
    PT.audio.unlock();
    window.removeEventListener("pointerdown", firstGesture);
    window.removeEventListener("keydown", firstGesture);
  }
  window.addEventListener("pointerdown", firstGesture);
  window.addEventListener("keydown", firstGesture);

  /* Offline support when served over http(s). Skipped under file:// — the app
     still works there, just without the offline cache. */
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  render();
})();
