/* Falar — progress + spaced repetition, persisted in localStorage.
   The learning model is a 5-box Leitner system: every vocabulary item lives in
   a box (0..5). A correct answer promotes it (longer wait before it is due
   again); a wrong answer sends it back to box 1. This is simple, well-proven,
   and needs no server. We also track a daily streak and a daily review goal. */
window.PT = window.PT || {};

PT.store = (function () {
  var KEY = "falar.v1";
  var DAY = 86400000;
  // How long (in days) an item rests in each box before it is due again.
  var INTERVALS = [0, 1, 2, 4, 9, 21];
  // A word counts as "learned" only once it survives into a multi-day box, so
  // the stat reflects real retention rather than a single in-session correct tap.
  var LEARNED_BOX = 4;

  var state = load();

  function load() {
    var base = { srs: {}, stats: { xp: 0, streak: 0, lastDay: null, learned: 0 }, daily: { day: null, reviewed: 0, goal: 20 }, settings: { dir: "pt-en" } };
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

  /* Roll the daily counter + streak over at the start of each calendar day. */
  function rollDay() {
    var t = todayStr();
    if (state.daily.day !== t) {
      state.daily.day = t;
      state.daily.reviewed = 0;
    }
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

  /* Core grading. mode: "good" promotes one box, "again" -> box 1, "known" jumps
     straight to the learned box. We capture the PRIOR learned-state BEFORE
     mutating, or the learned counter can never increment (the record is aliased). */
  function applyGrade(key, mode) {
    rollDay();
    var prev = state.srs[key];
    var wasLearned = !!(prev && prev.box >= LEARNED_BOX);
    var rec = prev || { box: 0, seen: 0, right: 0, due: 0 };
    rec.seen++;
    if (mode === "again") { rec.box = 1; state.stats.xp += 2; }
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

  function lessonProgress(items) {
    if (!items.length) return 0;
    var learned = items.reduce(function (a, it) { return a + (isLearned(it.key) ? 1 : 0); }, 0);
    return learned / items.length;
  }

  function setSetting(k, v) { state.settings[k] = v; save(); }
  function reset() { state = { srs: {}, stats: { xp: 0, streak: 0, lastDay: null, learned: 0 }, daily: { day: todayStr(), reviewed: 0, goal: 20 }, settings: { dir: "pt-en" } }; save(); }

  rollDay();

  return {
    get stats() { return state.stats; },
    get daily() { rollDay(); return state.daily; },
    get settings() { return state.settings; },
    get: get, box: box, isLearned: isLearned,
    grade: grade, markKnown: markKnown,
    dueFrom: dueFrom, lessonProgress: lessonProgress,
    setSetting: setSetting, reset: reset
  };
})();
