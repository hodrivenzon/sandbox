/* Tiny Explorers — app shell + hash router.
   A tiny single-page app: each activity registers itself on TE.screens and the
   router swaps the visible screen on hash change. No build step, no framework,
   no fetch — every file is a plain static asset, so it runs directly from
   GitHub Pages (or even a double-clicked index.html). */
(function () {
  var screenHost = document.getElementById("screen");
  var titleEl = document.getElementById("screen-title");
  var homeBtn = document.getElementById("home-btn");
  var soundBtn = document.getElementById("sound-btn");
  var startOverlay = document.getElementById("start-overlay");
  var startBtn = document.getElementById("start-btn");

  var parentUnlocked = false;
  var started = false;

  function currentId() {
    var id = (location.hash || "").replace(/^#\/?/, "").trim();
    return TE.screens[id] ? id : "home";
  }

  function renderRoute() {
    var id = currentId();

    // Adult area sits behind a simple parent gate (COPPA-style best practice).
    if (id === "parents" && !parentUnlocked) {
      showParentGate(function () {
        parentUnlocked = true;
        renderRoute();
      }, function () {
        location.hash = ""; // cancelled → back home
      });
      return;
    }

    var screen = TE.screens[id];
    document.body.setAttribute("data-screen", id);
    document.body.setAttribute("data-theme", screen.theme || "home");
    titleEl.textContent = screen.title || "Tiny Explorers";
    document.title = (id === "home" ? "Tiny Explorers" : screen.title + " — Tiny Explorers");
    homeBtn.hidden = (id === "home");
    window.scrollTo(0, 0);

    try { screen.render(screenHost); }
    catch (e) {
      screenHost.innerHTML = '<p style="text-align:center;padding:40px">Oops! Something went wrong. Tap 🏠 to go home.</p>';
      if (window.console) console.error(e);
    }
  }

  function go(id) { location.hash = (id && id !== "home") ? "#" + id : ""; }
  TE.router = { go: go, renderRoute: renderRoute };

  /* ---- simple parent gate (a small math problem adults can solve) -------- */
  function showParentGate(onPass, onCancel) {
    var a = 2 + Math.floor(Math.random() * 7);   // 2..8
    var b = 3 + Math.floor(Math.random() * 6);   // 3..8
    var overlay = TE.ui.el("div", { class: "parent-gate" });
    var input = TE.ui.el("input", { class: "gate-input", type: "number", inputmode: "numeric", "aria-label": "Answer" });
    var err = TE.ui.el("div", { class: "gate-err" });

    function submit() {
      if (parseInt(input.value, 10) === a + b) { overlay.remove(); onPass(); }
      else { err.textContent = "Not quite — try again."; input.value = ""; input.focus(); }
    }

    var card = TE.ui.el("div", { class: "gate-card" }, [
      TE.ui.el("h2", { text: "👋 For Grown-Ups" }),
      TE.ui.el("p", { text: "This area is for parents and caregivers. Please solve to continue:" }),
      TE.ui.el("div", { class: "gate-q", text: a + " + " + b + " = ?" }),
      input,
      err,
      TE.ui.el("div", { class: "gate-actions" }, [
        TE.ui.el("button", { class: "gate-go", text: "Continue", onclick: submit }),
        TE.ui.el("button", { class: "gate-cancel", text: "Back", onclick: function () { overlay.remove(); onCancel(); } })
      ])
    ]);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    setTimeout(function () { input.focus(); }, 50);
  }
  TE.requireParentGate = function (cb) {
    if (parentUnlocked) return cb();
    showParentGate(function () { parentUnlocked = true; cb(); }, function () {});
  };

  /* ----------------------------- controls -------------------------------- */
  homeBtn.addEventListener("click", function () { TE.audio.pop(); go("home"); });

  function syncSound() {
    soundBtn.textContent = TE.audio.muted ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-label", TE.audio.muted ? "Turn sound on" : "Turn sound off");
  }
  syncSound(); // reflect the persisted mute preference on load
  soundBtn.addEventListener("click", function () {
    var muted = TE.audio.toggleMute();
    syncSound();
    if (!muted) TE.audio.pop();
  });

  window.addEventListener("hashchange", function () { if (started) renderRoute(); });

  /* --------------------------- start sequence ---------------------------- */
  function start() {
    if (started) return;
    started = true;
    TE.audio.unlock();
    startOverlay.setAttribute("hidden", "");
    renderRoute();
    setTimeout(function () { TE.audio.speak("Welcome to Tiny Explorers! Tap a picture to play."); }, 500);
  }
  startBtn.addEventListener("click", start);

  /* Register a service worker for offline use when served over http(s).
     Silently skipped under file:// — the app still works, just not offline. */
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
