/* Falar — Lessons list. All topics with progress rings + a word count. */
(function () {
  var el = PT.dom.el;

  function render(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Lessons" }));
    wrap.appendChild(el("p", { class: "page-sub", text: PT.content.lessons().length + " topics · " + PT.content.lessonCount() + " words & phrases" }));

    // Verb conjugations live here too (no longer a bottom tab).
    wrap.appendChild(el("a", {
      class: "card lesson-card feature", href: "#/verbs", onclick: function () { PT.audio.pop(); }
    }, [
      el("div", { class: "lc-emoji", text: "🔤" }),
      el("div", { class: "lc-body" }, [
        el("div", { class: "lc-title", text: "Verb conjugations" }),
        el("div", { class: "lc-sub", text: "Present tense of the 12 most useful verbs" })
      ]),
      el("span", { class: "lc-chev", text: "›" })
    ]));

    var grid = el("div", { class: "lesson-grid" });
    PT.content.lessons().forEach(function (l) {
      var pct = PT.store.lessonProgress(l.items);
      var learned = l.items.reduce(function (a, it) { return a + (PT.store.isLearned(it.key) ? 1 : 0); }, 0);
      grid.appendChild(el("a", {
        class: "card lesson-card",
        href: "#/lesson/" + l.id,
        onclick: function () { PT.audio.pop(); }
      }, [
        el("div", { class: "lc-emoji", text: l.emoji }),
        el("div", { class: "lc-body" }, [
          el("div", { class: "lc-title", text: l.title }),
          el("div", { class: "lc-sub", text: learned + " / " + l.items.length + " learned" })
        ]),
        PT.dom.ring(pct, 40)
      ]));
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
  }

  PT.screens.lessons = { title: "Lessons", tab: "lessons", render: render };
})();
