/* Tiny Explorers — audio engine.
   Two sound sources, both built into the browser (no audio files needed):
     1. Web Speech API  → spoken narration (pre-readers need audio).
     2. Web Audio API    → friendly synthesized tones / chimes / note pads.
   Everything degrades gracefully if a browser lacks support, and respects
   a global mute. The first user tap calls unlock() to satisfy autoplay
   policies on iOS/Safari/Chrome. */
window.TE = window.TE || {};

TE.audio = (function () {
  var ctx = null;
  var muted = false;
  try { muted = localStorage.getItem("te-muted") === "1"; } catch (e) {}
  var voice = null;
  var hasSpeech = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) { ctx = null; } }
    }
    if (ctx && ctx.state === "suspended") { ctx.resume(); }
    return ctx;
  }

  /* Prefer a clear English voice; lightly favor ones that sound friendly. */
  function pickVoice() {
    if (!hasSpeech) return;
    var vs = window.speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    var en = vs.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var pool = en.length ? en : vs;
    var prefer = ["samantha", "google us english", "karen", "moira", "tessa",
                  "victoria", "fiona", "female", "zira", "child"];
    var best = null, bestRank = 99;
    pool.forEach(function (v) {
      var n = (v.name || "").toLowerCase();
      for (var i = 0; i < prefer.length; i++) {
        if (n.indexOf(prefer[i]) !== -1 && i < bestRank) { best = v; bestRank = i; }
      }
    });
    voice = best || pool[0];
  }
  if (hasSpeech) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  /* Called from the first user gesture (the Start overlay). */
  function unlock() {
    ensureCtx();
    if (hasSpeech) {
      // Warm up the speech engine within the gesture (needed on iOS).
      try {
        var u = new SpeechSynthesisUtterance("");
        u.volume = 0;
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
      } catch (e) {}
      pickVoice();
    }
  }

  function speak(text, opts) {
    if (muted || !hasSpeech || !text) return;
    opts = opts || {};
    try {
      window.speechSynthesis.cancel(); // never let phrases pile up
      var u = new SpeechSynthesisUtterance(String(text));
      u.rate = opts.rate || 0.92;   // a touch slower for little ears
      u.pitch = opts.pitch || 1.15; // friendly, bright
      u.volume = 1;
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* One soft tone. */
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    dur = dur || 0.25; type = type || "sine"; vol = (vol == null ? 0.18 : vol); when = when || 0;
    var t = c.currentTime + when;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }

  /* A short, satisfying "pop" for any tap. */
  function pop() {
    tone(520, 0.12, "triangle", 0.16);
    tone(780, 0.10, "sine", 0.10, 0.04);
  }

  /* A happy ascending arpeggio for correct answers / celebrations. */
  function chime() {
    var notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    notes.forEach(function (f, i) { tone(f, 0.28, "sine", 0.16, i * 0.10); });
  }

  /* A gentle, non-scary "try again" — never harsh, no buzzer. */
  function nudge() {
    tone(330, 0.18, "sine", 0.12);
    tone(294, 0.20, "sine", 0.12, 0.12);
  }

  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem("te-muted", muted ? "1" : "0"); } catch (e) {}
    if (muted && hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }
  function toggleMute() { setMuted(!muted); return muted; }

  return {
    unlock: unlock,
    speak: speak,
    tone: tone,
    pop: pop,
    chime: chime,
    nudge: nudge,
    setMuted: setMuted,
    toggleMute: toggleMute,
    get muted() { return muted; },
    get hasSpeech() { return hasSpeech; }
  };
})();
