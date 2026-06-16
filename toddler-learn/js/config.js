/* Tiny Explorers — per-game configuration (adaptable difficulty).
   A small settings store, persisted in localStorage, that lets a grown-up tune
   each game without touching code: a global Level (Easy / Medium / Hard) preset,
   plus per-knob overrides (number of choices, count range, how many bubbles…),
   narration speed, and motion/effects. The Settings screen writes these; every
   activity reads them via TE.config.*.

   Grounded in early-childhood research: 2–3 year-olds handle only a few choices
   (≈2 at age 2, 3–4 by age 3), subitize ≤3 and count meaningfully to ~5, and
   learn best no-fail with a calm, adjustable pace. So "harder" here means a few
   more choices / a slightly bigger set — never academic difficulty. */
window.TE = window.TE || {};

TE.config = (function () {
  var KEY = "te-config-v1";

  /* Level presets → the numeric value each game's knob takes by default. */
  var LEVELS = {
    easy:   { choices: 2, countMax: 3,  bubbles: 4, doors: 2 },
    medium: { choices: 3, countMax: 5,  bubbles: 6, doors: 3 },
    hard:   { choices: 4, countMax: 10, bubbles: 9, doors: 4 }
  };
  /* Allowed range for each knob when a grown-up overrides the level. */
  var KNOB_RANGE = {
    choices:  { min: 2, max: 6 },
    countMax: { min: 3, max: 10 },
    bubbles:  { min: 3, max: 12 },
    doors:    { min: 2, max: 6 }
  };

  var DEFAULT = {
    level: "medium",
    speed: "normal",   // slow | normal   → narration rate
    motion: "full",    // full | calm     → animation / confetti
    celebrate: true,   // big celebrations on success
    autoAdvance: true, // move to the next round automatically
    overrides: {}      // knobName -> number (overrides the level preset)
  };

  var state = load();
  var listeners = [];

  function merge(over) {
    var o = {};
    Object.keys(DEFAULT).forEach(function (k) { o[k] = DEFAULT[k]; });
    Object.keys(over || {}).forEach(function (k) { if (k in DEFAULT && k !== "overrides") o[k] = over[k]; });
    if (!LEVELS[o.level]) o.level = DEFAULT.level;
    o.overrides = {};
    var ov = (over && over.overrides) || {};
    Object.keys(ov).forEach(function (k) { if (KNOB_RANGE[k] && typeof ov[k] === "number") o.overrides[k] = ov[k]; });
    return o;
  }
  function load() {
    try { return merge(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return merge({}); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    listeners.forEach(function (cb) { try { cb(); } catch (e) {} });
  }
  function clamp(v, r) { return Math.max(r.min, Math.min(r.max, v)); }

  /* Effective numeric value for a knob: an explicit override, else the level preset. */
  function knob(name) {
    var r = KNOB_RANGE[name];
    if (!r) return null;
    var v = (name in state.overrides) ? state.overrides[name] : LEVELS[state.level][name];
    return clamp(v, r);
  }
  function isOverridden(name) { return name in state.overrides; }

  function setLevel(l) { if (LEVELS[l]) { state.level = l; save(); } }
  function setKnob(name, v) {
    if (!KNOB_RANGE[name]) return;
    if (v == null) delete state.overrides[name];                 // null → follow the level
    else state.overrides[name] = clamp(+v, KNOB_RANGE[name]);
    save();
  }
  function get(k) { return state[k]; }
  function set(k, v) { if ((k in DEFAULT) && k !== "overrides") { state[k] = v; save(); } }

  function rate() { return state.speed === "slow" ? 0.78 : 0.92; }
  function motionOn() {
    if (state.motion === "calm") return false;
    try { return !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return true; }
  }

  function onChange(cb) { if (typeof cb === "function") listeners.push(cb); }

  return {
    LEVELS: LEVELS, KNOB_RANGE: KNOB_RANGE,
    level: function () { return state.level; }, setLevel: setLevel,
    knob: knob, isOverridden: isOverridden, setKnob: setKnob,
    choices:  function () { return knob("choices"); },
    countMax: function () { return knob("countMax"); },
    bubbles:  function () { return knob("bubbles"); },
    doors:    function () { return knob("doors"); },
    get: get, set: set,
    rate: rate, motionOn: motionOn,
    celebrateOn: function () { return !!state.celebrate; },
    autoAdvance: function () { return !!state.autoAdvance; },
    onChange: onChange,
    reset: function () { state = merge({}); save(); }
  };
})();
