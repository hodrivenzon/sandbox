/* Falar — Home / dashboard.
   The learner's daily landing pad: streak + XP + words learned, today's review
   goal, a "continue where you left off" lesson, and quick links into practice. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function render(host) {
    PT.dom.clear(host);
    var items = PT.content.allItems();
    var due = PT.store.dueFrom(items).length;
    var stats = PT.store.stats;
    var daily = PT.store.daily;
    var goalPct = daily.goal ? Math.min(1, daily.reviewed / daily.goal) : 0;

    var wrap = el("div", { class: "screen-pad" });

    /* hero */
    wrap.appendChild(el("section", { class: "hero" }, [
      el("h1", { class: "hero-greet", lang: "pt-BR", text: "Olá! 👋" }),
      el("p", { class: "hero-sub" }, [
        el("span", { lang: "pt-BR", text: "Bem-vindo de volta" }),
        " — let's learn some Brazilian Portuguese."
      ])
    ]));

    /* stat row (tap to open the full progress page) */
    wrap.appendChild(el("a", { class: "stat-row link-row", href: "#/progress", "aria-label": "View your progress", onclick: function () { PT.audio.pop(); } }, [
      C.stat(stats.streak, "day streak", "🔥"),
      C.stat(stats.learned, "words learned", "✅"),
      C.stat(stats.xp, "XP", "⚡")
    ]));

    /* daily goal */
    var goalCard = el("div", { class: "card goal-card" }, [
      el("div", { class: "goal-top" }, [
        el("div", {}, [
          el("div", { class: "goal-title", text: "Today's goal" }),
          el("div", { class: "goal-sub", text: daily.reviewed + " / " + daily.goal + " reviews" })
        ]),
        PT.dom.ring(goalPct, 52)
      ]),
      el("div", { class: "progress" }, [el("div", { class: "progress-fill", style: { width: Math.round(goalPct * 100) + "%" } })])
    ]);
    wrap.appendChild(goalCard);

    /* primary CTA: daily review */
    var cta = el("button", {
      class: "btn btn-primary btn-block",
      onclick: function () { PT.audio.pop(); location.hash = due > 0 ? "#/practice/due" : "#/practice"; }
    }, [
      el("span", { class: "btn-ic", text: "🎴" }),
      el("span", { text: due > 0 ? ("Review " + due + " due " + (due === 1 ? "card" : "cards")) : "Open practice" })
    ]);
    wrap.appendChild(cta);

    /* advanced pillars: learn through famous songs + real conversations */
    if (PT.content.songs().length || PT.content.dialogues().length) {
      wrap.appendChild(C.sectionTitle("Learn with…"));
      wrap.appendChild(el("div", { class: "feature-grid" }, [
        featureCard("🎵", "Famous songs", "Vocabulary & culture from Brazilian classics", "#/songs"),
        featureCard("💬", "Real conversations", "Everyday dialogues with slang & idioms", "#/talk")
      ]));
    }

    /* continue learning: first lesson not yet finished */
    var lessons = PT.content.lessons();
    var next = null;
    for (var i = 0; i < lessons.length; i++) {
      if (PT.store.lessonProgress(lessons[i].items) < 1) { next = lessons[i]; break; }
    }
    if (next) {
      wrap.appendChild(C.sectionTitle("Continue learning"));
      wrap.appendChild(lessonCard(next));
    }

    /* browse a few lessons */
    wrap.appendChild(C.sectionTitle("Lessons", el("a", { class: "link", href: "#/lessons", text: "See all →" })));
    var grid = el("div", { class: "lesson-grid" });
    lessons.slice(0, 6).forEach(function (l) { grid.appendChild(lessonCard(l, true)); });
    wrap.appendChild(grid);

    /* gentle audio note if the device has no Portuguese voice installed */
    if (PT.audio.hasSpeech && PT.audio.voiceQuality === "none") {
      wrap.appendChild(el("p", { class: "voice-note", text: "ℹ️ No Brazilian Portuguese voice was found on this device, so audio may use a default voice. On iOS/macOS add one in Settings → Accessibility → Spoken Content → Voices → Portuguese (Brazil)." }));
    }

    host.appendChild(wrap);
  }

  function featureCard(emoji, title, sub, href) {
    return el("a", { class: "card feature-card", href: href, onclick: function () { PT.audio.pop(); } }, [
      el("div", { class: "feature-emoji", text: emoji }),
      el("div", { class: "feature-title", text: title }),
      el("div", { class: "feature-sub", text: sub })
    ]);
  }

  function lessonCard(l, compact) {
    var pct = PT.store.lessonProgress(l.items);
    return el("a", {
      class: "card lesson-card" + (compact ? " compact" : ""),
      href: "#/lesson/" + l.id,
      onclick: function () { PT.audio.pop(); }
    }, [
      el("div", { class: "lc-emoji", text: l.emoji }),
      el("div", { class: "lc-body" }, [
        el("div", { class: "lc-title", text: l.title }),
        el("div", { class: "lc-sub", text: l.items.length + " words" })
      ]),
      PT.dom.ring(pct, 40)
    ]);
  }

  PT.screens.home = { title: "Falar", tab: "home", render: render };
})();
