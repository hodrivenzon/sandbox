/* Falar — content access layer.
   data.js sets PT.data.lessons + PT.data.verbs; data-advanced.js adds
   PT.data.songs + PT.data.dialogues. This module normalizes all of it once:
   every learnable item gets a stable `key` (for the spaced-repetition store), a
   `route` (for search links) and back-references to its source, and the screens
   query through the small helpers below. data files stay pure, regenerable. */
window.PT = window.PT || {};

PT.content = (function () {
  var data = PT.data || { lessons: [], verbs: { verbs: [], grammar: [] }, songs: [], dialogues: [] };

  // strip accents so "ação" -> "acao" (stable keys + accent-insensitive search)
  function deburr(s) {
    s = String(s).toLowerCase();
    return s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s;
  }
  function slug(s) {
    return deburr(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  /* ---- lessons (beginner→intermediate vocabulary) ---- */
  var lessons = (data.lessons || []).map(function (l) {
    var items = (l.words || []).map(function (w, i) {
      return Object.assign({}, w, {
        key: l.id + ":" + slug(w.pt) + ":" + i,
        lessonId: l.id, lessonTitle: l.title, route: "#/lesson/" + l.id, source: "lesson"
      });
    });
    return Object.assign({}, l, { items: items });
  });

  /* ---- songs (advanced: each song's vocab/idioms become learnable items) ---- */
  var songs = (data.songs || []).map(function (s) {
    var items = (s.vocab || []).map(function (w, i) {
      return {
        pt: w.pt, en: w.en, hint: "", pos: w.type, gender: null, note: w.note,
        ex_pt: w.ex_pt, ex_en: w.ex_en, emoji: s.emoji,
        key: "song:" + s.id + ":" + i, lessonId: s.id, lessonTitle: s.title,
        route: "#/songs/" + s.id, source: "song"
      };
    });
    return Object.assign({}, s, { items: items });
  });

  /* ---- dialogues (advanced: key expressions become learnable items) ---- */
  var dialogues = (data.dialogues || []).map(function (d) {
    var items = (d.expressions || []).map(function (w, i) {
      return {
        pt: w.pt, en: w.en, hint: "", pos: "expression", gender: null, note: w.note,
        ex_pt: "", ex_en: "", emoji: d.emoji,
        key: "dlg:" + d.id + ":" + i, lessonId: d.id, lessonTitle: d.title,
        route: "#/talk/" + d.id, source: "dialogue"
      };
    });
    return Object.assign({}, d, { items: items });
  });

  var byId = {}, songById = {}, dlgById = {};
  lessons.forEach(function (l) { byId[l.id] = l; });
  songs.forEach(function (s) { songById[s.id] = s; });
  dialogues.forEach(function (d) { dlgById[d.id] = d; });

  var lessonItems = [];
  lessons.forEach(function (l) { lessonItems = lessonItems.concat(l.items); });
  // full practice/search pool — everything learnable across the app
  var all = lessonItems.slice();
  songs.forEach(function (s) { all = all.concat(s.items); });
  dialogues.forEach(function (d) { all = all.concat(d.items); });

  function search(q) {
    q = (q || "").trim();
    if (!q) return [];
    var norm = deburr(q);
    return all.filter(function (it) {
      return deburr(it.pt).indexOf(norm) !== -1 || deburr(it.en).indexOf(norm) !== -1;
    }).slice(0, 60);
  }

  /* Normalize a typed answer: lowercase, trim, drop punctuation, collapse spaces
     (accents preserved). Used to grade typed recall + dictation. */
  function clean(s) {
    return String(s).toLowerCase().trim()
      .replace(/[.,!?;:¡¿"'()]/g, "").replace(/\s+/g, " ");
  }
  /* Compare a typed answer to the target. Returns {correct, exact, almost}:
     exact = right including accents; almost = right but for accents only. */
  function compareAnswer(user, target) {
    var cu = clean(user), ct = clean(target);
    if (!cu) return { correct: false, exact: false, almost: false };
    if (cu === ct) return { correct: true, exact: true, almost: false };
    if (deburr(cu) === deburr(ct)) return { correct: true, exact: false, almost: true };
    return { correct: false, exact: false, almost: false };
  }

  /* Conjugation-drill items derived from the verb data: one per verb × pronoun. */
  var PRON = [
    { k: "eu", label: "eu" },
    { k: "voce", label: "você" },
    { k: "nos", label: "nós" },
    { k: "eles", label: "eles" }
  ];
  function verbDrillItems() {
    var out = [];
    ((data.verbs && data.verbs.verbs) || []).forEach(function (v) {
      PRON.forEach(function (p) {
        if (!v.conj || !v.conj[p.k]) return;
        out.push({
          key: "conj:" + slug(v.infinitive) + ":" + p.k,
          infinitive: v.infinitive, en: v.en, irregular: v.irregular,
          pron: p.k, pronLabel: p.label, answer: v.conj[p.k],
          ex_pt: v.ex_pt, ex_en: v.ex_en, route: "#/drill", source: "verb"
        });
      });
    });
    return out;
  }

  return {
    lessons: function () { return lessons; },
    lesson: function (id) { return byId[id] || null; },
    songs: function () { return songs; },
    song: function (id) { return songById[id] || null; },
    dialogues: function () { return dialogues; },
    dialogue: function (id) { return dlgById[id] || null; },
    verbs: function () { return data.verbs || { verbs: [], grammar: [] }; },
    allItems: function () { return all; },
    lessonCount: function () { return lessonItems.length; },
    totalCount: function () { return all.length; },
    search: search,
    compareAnswer: compareAnswer,
    verbDrillItems: verbDrillItems
  };
})();
