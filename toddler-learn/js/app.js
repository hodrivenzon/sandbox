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
  var langBtn = document.getElementById("lang-btn");
  var voiceNote = document.getElementById("voice-note");
  var startOverlay = document.getElementById("start-overlay");
  var startBtn = document.getElementById("start-btn");

  var parentUnlocked = false;
  var started = false;

  function currentId() {
    var id = (location.hash || "").replace(/^#\/?/, "").trim();
    return TE.screens[id] ? id : "home";
  }

  function screenTitle(screen) {
    return screen.titleKey ? TE.t(screen.titleKey) : (screen.title || TE.t("appName"));
  }

  function renderRoute() {
    var id = currentId();

    // Adult areas (research page + settings) sit behind a simple parent gate.
    if ((id === "parents" || id === "settings") && !parentUnlocked) {
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
    var title = screenTitle(screen);
    titleEl.textContent = title;
    document.title = (id === "home" ? TE.t("appName") : title + " — " + TE.t("appName"));
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
      else { err.textContent = TE.t("gateErr"); input.value = ""; input.focus(); }
    }

    var card = TE.ui.el("div", { class: "gate-card" }, [
      TE.ui.el("h2", { text: TE.t("gateTitle") }),
      TE.ui.el("p", { text: TE.t("gateBody") }),
      TE.ui.el("div", { class: "gate-q", text: a + " + " + b + " = ?" }),
      input,
      err,
      TE.ui.el("div", { class: "gate-actions" }, [
        TE.ui.el("button", { class: "gate-go", text: TE.t("gateContinue"), onclick: submit }),
        TE.ui.el("button", { class: "gate-cancel", text: TE.t("gateBack"), onclick: function () { overlay.remove(); onCancel(); } })
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
  function updateSoundBtn() {
    var m = TE.audio.muted;
    soundBtn.textContent = m ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-label", m ? TE.t("soundOn") : TE.t("soundOff"));
  }

  homeBtn.addEventListener("click", function () { TE.audio.pop(); go("home"); });

  soundBtn.addEventListener("click", function () {
    var muted = TE.audio.toggleMute();
    updateSoundBtn();
    if (!muted) TE.audio.pop();
  });

  window.addEventListener("hashchange", function () { if (started) renderRoute(); });

  /* ----------------------------- language -------------------------------- */
  function updateVoiceNote() {
    if (!voiceNote) return;
    if (TE.audio.hasVoice(TE.lang())) { voiceNote.hidden = true; voiceNote.textContent = ""; }
    else { voiceNote.textContent = TE.t("noVoice"); voiceNote.hidden = false; }
  }

  function refreshLangChoice() {
    var btns = document.querySelectorAll(".lang-choice");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("active", btns[i].getAttribute("data-lang") === TE.lang());
    }
    if (langBtn) langBtn.setAttribute("aria-label", TE.t("language"));
  }

  function onLangChange() {
    refreshLangChoice();
    updateSoundBtn();
    updateVoiceNote();
    if (started) renderRoute();
  }

  // re-check the voice note when voices finish loading (often async)
  TE.onVoices = updateVoiceNote;
  TE.i18n.onLangChange(onLangChange);

  Array.prototype.forEach.call(document.querySelectorAll(".lang-choice"), function (b) {
    b.addEventListener("click", function () { TE.audio.pop(); TE.setLang(b.getAttribute("data-lang")); });
  });
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      TE.audio.pop();
      TE.setLang(TE.lang() === "he" ? "en" : "he");
    });
  }
  refreshLangChoice();
  updateSoundBtn();
  updateVoiceNote();

  /* --------------------------- start sequence ---------------------------- */
  function start() {
    if (started) return;
    started = true;
    TE.audio.unlock();
    startOverlay.setAttribute("hidden", "");
    renderRoute();
    setTimeout(function () { TE.audio.speak(TE.t("welcome")); }, 500);
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
