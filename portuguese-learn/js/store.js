/* Falar — progress + spaced repetition, persisted in localStorage.
   The learning model is a 5-box Leitner system: every item lives in a box (0..5).
   A correct answer promotes it (longer wait before it is due again); "Easy" skips
   a box; a wrong answer sends it back to box 1. Needs no server. We also track a
   daily streak, a daily review goal, and per-item attempt stats. */
window.PT = window.PT || {};

PT.store = (function () {
  var KEY = "falar.v1";
  var DAY = 86400000;
  // How long (in days) an item rests in each box before it is due again.
  var INTERVALS = [0, 1, 2, 4, 9, 21];
  // A word counts as "learned" only once it survives into a multi-day box, so
  // the stat reflects real retention rather than a single in-session correct tap.
  var LEARNED_BOX = 4;

  function defaults() {
    return {
      srs: {},
      stats: { xp: 0, streak: 0, lastDay: null, learned: 0 },
      daily: { day: null, reviewed: 0, goal: 20 },
      settings: { dir: "pt-en", ttsRate: 0.9, theme: "auto" }
    };
  }

  var state = load();

  function load() {
    var base = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        base.srs = saved.srs || {};
        Object.assign(base.stats, saved.stats || {});
        Object.assign(base.daily, saved.daily || {});
        Object.assign(base.settings, saved.settings || {});
      }
    } catch (e) {}
    return base;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function todayStr() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function midnightOf(dayStr) {
    var p = dayStr.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]).getTime();
  }

  /* Roll the daily counter over at the start of each calendar day. */
  function rollDay() {
    var t = todayStr();
    if (state.daily.day !== t) { state.daily.day = t; state.daily.reviewed = 0; }
    return t;
  }

  function recordStudyDay() {
    var t = rollDay();
    var last = state.stats.lastDay;
    if (last === t) return;
    // Compare CALENDAR days (midnight to midnight) — never mix a midnight
    // timestamp with Date.now(), or the streak breaks for half of every day.
    if (last) {
      var diff = Math.round((midnightOf(t) - midnightOf(last)) / DAY);
      state.stats.streak = (diff === 1) ? state.stats.streak + 1 : 1;
    } else {
      state.stats.streak = 1;
    }
    state.stats.lastDay = t;
  }

  function get(key) { return state.srs[key] || null; }
  function box(key) { var r = state.srs[key]; return r ? r.box : 0; }
  function isLearned(key) { return box(key) >= LEARNED_BOX; }

  /* Core grading. mode: "good" promotes one box, "easy" jumps two, "again" -> box
     1, "known" jumps straight to the learned box. We capture the PRIOR learned
     state BEFORE mutating, or the learned counter can never increment. */
  function applyGrade(key, mode) {
    rollDay();
    var prev = state.srs[key];
    var wasLearned = !!(prev && prev.box >= LEARNED_BOX);
    var rec = prev || { box: 0, seen: 0, right: 0, lapses: 0, due: 0 };
    if (rec.lapses == null) rec.lapses = 0;
    rec.seen++;
    if (mode === "again") { if (rec.box >= LEARNED_BOX) rec.lapses++; rec.box = 1; state.stats.xp += 2; }
    else if (mode === "easy") { rec.right++; rec.box = Math.min(5, rec.box + 2); state.stats.xp += 15; }
    else if (mode === "known") { rec.right++; rec.box = Math.max(rec.box, LEARNED_BOX); state.stats.xp += 10; }
    else { rec.right++; rec.box = Math.min(5, rec.box + 1); state.stats.xp += 10; }
    rec.due = Date.now() + INTERVALS[Math.min(rec.box, INTERVALS.length - 1)] * DAY;
    state.srs[key] = rec;
    var nowLearned = rec.box >= LEARNED_BOX;
    if (!wasLearned && nowLearned) state.stats.learned++;
    else if (wasLearned && !nowLearned) state.stats.learned = Math.max(0, state.stats.learned - 1);
    state.daily.reviewed++;
    recordStudyDay();
    save();
    return rec;
  }

  /* Grade an item. correct=true promotes one box; false sends it back to box 1. */
  function grade(key, correct) { return applyGrade(key, correct ? "good" : "again"); }
  /* Three-way flashcard grading: "again" | "good" | "easy". */
  function gradeMode(key, mode) { return applyGrade(key, mode); }
  /* "I know this" — assert mastery, jumping the item straight to the learned box. */
  function markKnown(key) { return applyGrade(key, "known"); }

  /* From a list of {key,...} items, the ones due now (or never seen), due first. */
  function dueFrom(items) {
    var now = Date.now();
    return items
      .filter(function (it) { var r = state.srs[it.key]; return !r || r.due <= now; })
      .sort(function (a, b) {
        var ra = state.srs[a.key], rb = state.srs[b.key];
        return (ra ? ra.due : 0) - (rb ? rb.due : 0);
      });
  }

  /* Items the learner keeps struggling with: seen a few times but still in a low
     box and below ~60% accuracy, or that have lapsed out of the learned box.
     Hardest (lowest accuracy) first. */
  function strugglingFrom(items) {
    return items
      .map(function (it) { return { it: it, r: state.srs[it.key] }; })
      .filter(function (x) {
        var r = x.r; if (!r || r.seen < 2) return false;
        var acc = r.right / r.seen;
        return (r.box <= 1 && acc < 0.6) || r.lapses > 0;
      })
      .sort(function (a, b) { return (a.r.right / a.r.seen) - (b.r.right / b.r.seen); })
      .map(function (x) { return x.it; });
  }

  function lessonProgress(items) {
    if (!items.length) return 0;
    var learned = items.reduce(function (a, it) { return a + (isLearned(it.key) ? 1 : 0); }, 0);
    return learned / items.length;
  }

  /* Distribution of a pool across the 6 boxes (index 0 = unseen / box 0). */
  function boxDistribution(items) {
    var d = [0, 0, 0, 0, 0, 0];
    items.forEach(function (it) { d[box(it.key)]++; });
    return d;
  }

  /* Lifetime answer accuracy across everything attempted. */
  function accuracy() {
    var seen = 0, right = 0;
    Object.keys(state.srs).forEach(function (k) { var r = state.srs[k]; seen += r.seen || 0; right += r.right || 0; });
    return seen ? right / seen : 0;
  }
  function seenCount() { return Object.keys(state.srs).length; }

  function setSetting(k, v) { state.settings[k] = v; save(); }
  function setGoal(n) { rollDay(); state.daily.goal = Math.max(5, Math.min(200, n | 0)); save(); }
  function reset() { state = defaults(); state.daily.day = todayStr(); save(); }

  /* Back up / restore the whole profile as JSON text. */
  function exportJSON() { return JSON.stringify(state); }
  function importJSON(text) {
    try {
      var obj = JSON.parse(text);
      if (!obj || typeof obj !== "object" || !obj.srs) return false;
      var fresh = defaults();
      fresh.srs = obj.srs || {};
      Object.assign(fresh.stats, obj.stats || {});
      Object.assign(fresh.daily, obj.daily || {});
      Object.assign(fresh.settings, obj.settings || {});
      state = fresh; save(); return true;
    } catch (e) { return false; }
  }

  rollDay();

  return {
    get stats() { return state.stats; },
    get daily() { rollDay(); return state.daily; },
    get settings() { return state.settings; },
    get learnedBox() { return LEARNED_BOX; },
    get: get, box: box, isLearned: isLearned,
    grade: grade, gradeMode: gradeMode, markKnown: markKnown,
    dueFrom: dueFrom, strugglingFrom: strugglingFrom, lessonProgress: lessonProgress,
    boxDistribution: boxDistribution, accuracy: accuracy, seenCount: seenCount,
    setSetting: setSetting, setGoal: setGoal, reset: reset,
    exportJSON: exportJSON, importJSON: importJSON
  };
})();
