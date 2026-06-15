/* Falar — content access layer.
   data.js sets PT.data (raw lessons + verbs, generated content). This module
   normalizes it once: it gives every vocabulary item a stable `key` (used by
   the spaced-repetition store) and back-references to its lesson, and exposes
   small query helpers the screens use. Keeping this separate from data.js means
   the data file stays pure, regenerable content. */
window.PT = window.PT || {};

PT.content = (function () {
  var data = PT.data || { lessons: [], verbs: { verbs: [], grammar: [] } };

  // strip accents so "ação" -> "acao" (for stable keys + accent-insensitive search)
  function deburr(s) {
    s = String(s).toLowerCase();
    return s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s;
  }
  function slug(s) {
    return deburr(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  var lessons = (data.lessons || []).map(function (l) {
    var items = (l.words || []).map(function (w, i) {
      return Object.assign({}, w, {
        key: l.id + ":" + slug(w.pt) + ":" + i,
        lessonId: l.id,
        lessonTitle: l.title
      });
    });
    return Object.assign({}, l, { items: items });
  });

  var byId = {};
  lessons.forEach(function (l) { byId[l.id] = l; });

  var all = [];
  lessons.forEach(function (l) { all = all.concat(l.items); });

  function lesson(id) { return byId[id] || null; }
  function allItems() { return all; }
  function verbs() { return data.verbs || { verbs: [], grammar: [] }; }
  function count() { return all.length; }

  function search(q) {
    q = (q || "").trim();
    if (!q) return [];
    var norm = deburr(q);
    return all.filter(function (it) {
      return deburr(it.pt).indexOf(norm) !== -1 || deburr(it.en).indexOf(norm) !== -1;
    }).slice(0, 60);
  }

  return {
    lessons: function () { return lessons; },
    lesson: lesson,
    allItems: allItems,
    verbs: verbs,
    count: count,
    search: search
  };
})();
