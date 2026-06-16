/* Falar — audio engine.
   Two browser-native sound sources (no audio files needed):
     1. Web Speech API  -> spoken Brazilian Portuguese (the whole point of a
        language app: learners must HEAR the words).
     2. Web Audio API   -> short synthesized cues (pop / correct / wrong).
   Everything degrades gracefully and respects a global mute. The very first
   user gesture warms up the speech engine to satisfy iOS/Safari autoplay. */
window.PT = window.PT || {};

PT.audio = (function () {
  var ctx = null;
  var muted = false;
  var ptVoice = null;
  var voiceQuality = "none"; // "br" | "pt" | "any-pt" | "none"
  var hasSpeech = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { ctx = new AC(); } catch (e) { ctx = null; } }
    }
    if (ctx && ctx.state === "suspended") { ctx.resume(); }
    return ctx;
  }

  /* Choose the best available Portuguese voice: Brazilian first, then European,
     then anything tagged pt-*. We still set lang="pt-BR" on every utterance so
     engines that synthesize purely from a language code sound right too. */
  function dialect() {
    return (PT.store && PT.store.settings && PT.store.settings.dialect) || "pt-BR";
  }
  function pickVoice() {
    if (!hasSpeech) return;
    var vs = window.speechSynthesis.getVoices() || [];
    if (!vs.length) return;
    var br = vs.filter(function (v) { return /pt[-_]br/i.test(v.lang) || /pt[-_]br/i.test(v.name); });
    var pt = vs.filter(function (v) { return /pt[-_]pt/i.test(v.lang) || /portugal/i.test(v.name); });
    var anyPt = vs.filter(function (v) { return /^pt(\b|[-_])/i.test(v.lang); });
    // prefer the learner's chosen dialect, then the other, then any Portuguese
    var order = (dialect() === "pt-PT") ? [["pt", pt], ["br", br], ["any-pt", anyPt]] : [["br", br], ["pt", pt], ["any-pt", anyPt]];
    for (var i = 0; i < order.length; i++) {
      if (order[i][1].length) { ptVoice = preferNamed(order[i][1]); voiceQuality = order[i][0]; return; }
    }
    ptVoice = null; voiceQuality = "none";
  }
  /* Among same-locale voices, gently prefer known good/natural ones. */
  function preferNamed(pool) {
    var prefer = ["luciana", "google português do brasil", "google", "francisca", "antônio", "felipe", "fernanda", "natural", "premium", "enhanced"];
    var best = null, rank = 99;
    pool.forEach(function (v) {
      var n = (v.name || "").toLowerCase();
      for (var i = 0; i < prefer.length; i++) { if (n.indexOf(prefer[i]) !== -1 && i < rank) { best = v; rank = i; } }
    });
    return best || pool[0];
  }
  if (hasSpeech) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  /* Call once from the first real user gesture. */
  function unlock() {
    ensureCtx();
    if (hasSpeech) {
      try {
        var u = new SpeechSynthesisUtterance(" ");
        u.volume = 0; window.speechSynthesis.speak(u); window.speechSynthesis.cancel();
      } catch (e) {}
      pickVoice();
    }
  }

  /* Speak Brazilian Portuguese text. opts.rate (default a touch slow for
     learners), opts.onend callback. Always cancels anything in flight. */
  /* The learner's preferred default speed (0.75 slow / 0.9 normal / 1 native). */
  function defaultRate() {
    var r = PT.store && PT.store.settings && PT.store.settings.ttsRate;
    return r ? r : 0.9;
  }

  function speak(text, opts) {
    if (muted || !hasSpeech || !text) { if (opts && opts.onend) opts.onend(); return; }
    opts = opts || {};
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = dialect();
      u.rate = opts.rate || defaultRate();
      u.pitch = opts.pitch || 1;
      u.volume = 1;
      if (ptVoice) u.voice = ptVoice;
      if (opts.onend) u.onend = opts.onend;
      window.speechSynthesis.speak(u);
    } catch (e) { if (opts.onend) opts.onend(); }
  }

  /* Deliberately slow replay (for dictation / hard listening). */
  function speakSlow(text, opts) { speak(text, Object.assign({}, opts, { rate: 0.62 })); }

  /* one soft tone */
  function tone(freq, dur, type, vol, when) {
    if (muted) return;
    var c = ensureCtx(); if (!c) return;
    dur = dur || 0.22; type = type || "sine"; vol = (vol == null ? 0.16 : vol); when = when || 0;
    var t = c.currentTime + when;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  function pop() { tone(520, 0.10, "triangle", 0.12); tone(780, 0.08, "sine", 0.08, 0.03); }
  function correct() { [523.25, 659.25, 783.99].forEach(function (f, i) { tone(f, 0.22, "sine", 0.14, i * 0.08); }); }
  function wrong() { tone(311, 0.18, "sine", 0.12); tone(247, 0.22, "sine", 0.12, 0.1); }

  function setMuted(m) { muted = !!m; if (muted && hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) {} } }
  function toggleMute() { setMuted(!muted); return muted; }

  return {
    unlock: unlock, speak: speak, speakSlow: speakSlow, repickVoice: pickVoice, tone: tone, pop: pop, correct: correct, wrong: wrong,
    setMuted: setMuted, toggleMute: toggleMute,
    get muted() { return muted; },
    get hasSpeech() { return hasSpeech; },
    get voiceQuality() { return voiceQuality; }
  };
})();
