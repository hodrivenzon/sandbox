/* Falar — Progress. A real view of where the learner stands: mastery
   distribution across the spaced-repetition boxes, lifetime accuracy, streak,
   and per-lesson mastery rings. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function render(host) {
    PT.dom.clear(host);
    var all = PT.content.allItems();
    var dist = PT.store.boxDistribution(all); // [box0..box5]
    var total = all.length;
    var stats = PT.store.stats;

    // three buckets: New (0), Learning (1-3), Learned (4-5)
    var fresh = dist[0];
    var learning = dist[1] + dist[2] + dist[3];
    var learned = dist[4] + dist[5];

    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Your progress" }));

    wrap.appendChild(el("div", { class: "stat-row" }, [
      C.stat(stats.streak, "day streak", "🔥"),
      C.stat(Math.round(PT.store.accuracy() * 100) + "%", "accuracy", "🎯"),
      C.stat(stats.xp, "XP", "⚡")
    ]));

    // mastery bar
    function seg(count, cls, label) {
      var pct = total ? (count / total * 100) : 0;
      return { pct: pct, cls: cls, label: label, count: count };
    }
    var segs = [seg(learned, "s-learned", "Learned"), seg(learning, "s-learning", "Learning"), seg(fresh, "s-new", "Not started")];
    var bar = el("div", { class: "mastery-bar", role: "img", aria: { label: "Mastery: " + learned + " learned, " + learning + " learning, " + fresh + " not started, of " + total } });
    segs.forEach(function (s) { if (s.pct > 0) bar.appendChild(el("div", { class: "mastery-seg " + s.cls, style: { width: s.pct + "%" }, title: s.label + ": " + s.count })); });

    wrap.appendChild(el("div", { class: "card mastery-card" }, [
      el("div", { class: "mastery-head" }, [
        el("div", { class: "mastery-title", text: "Mastery" }),
        el("div", { class: "mastery-sub", text: learned + " of " + total + " mastered" })
      ]),
      bar,
      el("div", { class: "mastery-legend" }, segs.map(function (s) {
        return el("span", { class: "legend-item" }, [el("span", { class: "dot " + s.cls }), el("span", { text: s.label + " · " + s.count })]);
      }))
    ]));

    // per-lesson mastery
    wrap.appendChild(C.sectionTitle("Lessons"));
    var grid = el("div", { class: "lesson-grid" });
    PT.content.lessons().forEach(function (l) {
      var lr = l.items.reduce(function (a, it) { return a + (PT.store.isLearned(it.key) ? 1 : 0); }, 0);
      grid.appendChild(el("a", { class: "card lesson-card", href: "#/lesson/" + l.id, onclick: function () { PT.audio.pop(); } }, [
        el("div", { class: "lc-emoji", text: l.emoji }),
        el("div", { class: "lc-body" }, [el("div", { class: "lc-title", text: l.title }), el("div", { class: "lc-sub", text: lr + " / " + l.items.length + " learned" })]),
        PT.dom.ring(l.items.length ? lr / l.items.length : 0, 40)
      ]));
    });
    wrap.appendChild(grid);

    // advanced content summary
    var songLearned = sumLearned(PT.content.songs());
    var talkLearned = sumLearned(PT.content.dialogues());
    wrap.appendChild(C.sectionTitle("Advanced"));
    wrap.appendChild(el("div", { class: "lesson-grid" }, [
      el("a", { class: "card lesson-card", href: "#/songs", onclick: function () { PT.audio.pop(); } }, [
        el("div", { class: "lc-emoji", text: "🎵" }),
        el("div", { class: "lc-body" }, [el("div", { class: "lc-title", text: "Songs" }), el("div", { class: "lc-sub", text: songLearned.learned + " / " + songLearned.total + " learned" })]),
        PT.dom.ring(songLearned.total ? songLearned.learned / songLearned.total : 0, 40)
      ]),
      el("a", { class: "card lesson-card", href: "#/talk", onclick: function () { PT.audio.pop(); } }, [
        el("div", { class: "lc-emoji", text: "💬" }),
        el("div", { class: "lc-body" }, [el("div", { class: "lc-title", text: "Conversations" }), el("div", { class: "lc-sub", text: talkLearned.learned + " / " + talkLearned.total + " learned" })]),
        PT.dom.ring(talkLearned.total ? talkLearned.learned / talkLearned.total : 0, 40)
      ])
    ]));

    host.appendChild(wrap);
  }

  function sumLearned(groups) {
    var total = 0, learned = 0;
    groups.forEach(function (g) { (g.items || []).forEach(function (it) { total++; if (PT.store.isLearned(it.key)) learned++; }); });
    return { total: total, learned: learned };
  }

  PT.screens.progress = { title: "Your progress", tab: "home", render: render };
})();
