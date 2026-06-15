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
  var srStatus = document.getElementById("sr-status");
  var prev = null;

  /* Announce a short message to assistive tech via the polite live region. */
  function announce(msg) { if (srStatus) srStatus.textContent = msg; }
  PT.announce = announce;

  /* Keep the topbar sound button in sync with the actual mute state. Screens
     that need audio (e.g. "Play all") call PT.setMute(false) instead of poking
     the audio module directly, so the button never lies about the state. */
  function syncSoundBtn() {
    var muted = PT.audio.muted;
    soundBtn.textContent = muted ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-label", muted ? "Unmute audio" : "Mute audio");
  }
  PT.setMute = function (m) { PT.audio.setMuted(m); syncSoundBtn(); };

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

    // Back shows only on detail screens — not on the top-level tab destinations.
    var isTab = !!tabbar.querySelector('[data-tab="' + route.id + '"]');
    backBtn.hidden = (route.id === "home") || (isTab && !route.arg);

    // highlight the owning tab + expose it to assistive tech
    var ownTab = screen.tab || route.id;
    Array.prototype.forEach.call(tabbar.querySelectorAll(".tab"), function (a) {
      var on = a.getAttribute("data-tab") === ownTab;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    window.scrollTo(0, 0);
    try { screen.render(screenHost, route.arg); }
    catch (e) {
      screenHost.innerHTML = '<p class="screen-pad">Something went wrong on this screen.</p>';
      if (window.console) console.error(e);
    }

    // Move focus to the new screen's heading so screen-reader users land in the
    // right place, and announce the screen name politely.
    var heading = screenHost.querySelector("h1, .page-title, .hero-greet");
    if (heading) { heading.setAttribute("tabindex", "-1"); try { heading.focus({ preventScroll: true }); } catch (e2) { heading.focus(); } }
    announce((route.id === "home" ? "Home" : screen.title) + " screen");
  }

  PT.go = function (hash) { location.hash = hash || "#/"; };

  /* ---- controls ---------------------------------------------------------- */
  backBtn.addEventListener("click", function () {
    PT.audio.pop();
    if (history.length > 1) history.back(); else location.hash = "#/";
  });

  soundBtn.addEventListener("click", function () {
    var muted = PT.audio.toggleMute();
    syncSoundBtn();
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
