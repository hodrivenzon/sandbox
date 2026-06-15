/* Falar — Practice hub + the reusable spaced-repetition flashcard runner.
   #/practice          -> a hub of practice modes
   #/practice/due      -> flashcards for everything DUE across all content
   #/practice/<lesson> -> flashcards for one lesson
   The flashcard runner (PT.runFlashcards) is also reused by the Mistakes deck.
   Self-grade Again / Good / Easy; grades feed PT.store which schedules each card.
   Keyboard: Space/Enter reveal · 1 Again · 2 Good · 3 Easy · R replay audio. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var timer = null, keyHandler = null;

  /* ---- shared flashcard session ---- */
  function runFlashcards(host, opts) {
    PT.dom.clear(host);
    var queue = opts.items || [];
    var wrap = el("div", { class: "screen-pad practice" });
    host.appendChild(wrap);
    if (!queue.length) {
      wrap.appendChild(el("h1", { class: "page-title", text: opts.title || "Practice" }));
      wrap.appendChild(el("p", { class: "page-sub", text: opts.emptyMsg || "Nothing to review right now — great job!" }));
      wrap.appendChild(el("a", { class: "btn btn-soft", href: opts.backHref || "#/practice", onclick: function () { PT.audio.pop(); }, text: "Back" }));
      return;
    }

    var dir = PT.store.settings.dir || "pt-en";
    var idx = 0, right = 0, done = 0;
    var cur = {}; // current card's handlers, read by the key handler

    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "flash-stage" });
    wrap.appendChild(bar); wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = queue.length ? done / queue.length : 0;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: (opts.title || "Review") + " · " + Math.min(idx + 1, queue.length) + "/" + queue.length }),
        el("button", {
          class: "dir-toggle", title: "Swap card direction", aria: { pressed: dir === "en-pt" ? "true" : "false" },
          text: dir === "pt-en" ? "PT → EN" : "EN → PT",
          onclick: function () { dir = dir === "pt-en" ? "en-pt" : "pt-en"; PT.store.setSetting("dir", dir); PT.audio.pop(); show(); }
        })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function show() {
      header();
      PT.dom.clear(stage);
      cur = {};
      if (idx >= queue.length) return summary();
      var item = queue[idx];
      var ptFront = dir === "pt-en";
      var flipped = false;

      var front = ptFront
        ? el("div", { class: "flash-face" }, [
            el("div", { class: "flash-word", lang: "pt-BR", text: item.pt }), C.speakBtn(item.pt, { big: true }),
            el("div", { class: "flash-tap", text: "tap or press Space to reveal" })
          ])
        : el("div", { class: "flash-face" }, [
            item.emoji ? el("div", { class: "flash-emoji", text: item.emoji }) : null,
            el("div", { class: "flash-word en", text: item.en }),
            el("div", { class: "flash-tap", text: "tap or press Space to reveal" })
          ]);

      var back = el("div", { class: "flash-face back" }, [
        el("div", { class: "flash-word", lang: "pt-BR", text: item.pt }), C.speakBtn(item.pt, { big: true }),
        el("div", { class: "flash-en", text: item.en }),
        item.hint ? el("div", { class: "flash-hint", text: "/" + item.hint + "/" }) : null,
        item.note ? el("div", { class: "flash-note", text: item.note }) : null,
        item.ex_pt ? el("div", { class: "flash-ex" }, [el("span", { lang: "pt-BR", text: item.ex_pt }), C.speakBtn(item.ex_pt, { rate: 0.8 })]) : null
      ]);

      var card = el("div", { class: "flash-card", role: "button", tabindex: "0", aria: { label: "Show the answer" } }, [front]);
      function flip() {
        if (flipped) return; flipped = true;
        PT.dom.clear(card); card.appendChild(back); card.classList.add("flipped");
        card.setAttribute("aria-label", "Answer shown");
        if (!ptFront) PT.audio.speak(item.pt);
        showRating();
      }
      card.addEventListener("click", flip);
      stage.appendChild(card);

      clearTimeout(timer);
      if (ptFront) timer = setTimeout(function () { PT.audio.speak(item.pt); }, 250);

      var rating = el("div", { class: "rating three", hidden: "" });
      stage.appendChild(rating);
      function rate(mode) { PT.store.gradeMode(item.key, mode); if (mode === "again") PT.audio.wrong(); else { right++; PT.audio.correct(); } done++; idx++; show(); }
      function showRating() {
        rating.removeAttribute("hidden");
        var again = el("button", { class: "rate again", onclick: function () { rate("again"); } }, [el("span", { text: "Again" }), el("span", { class: "k", text: "1" })]);
        var good = el("button", { class: "rate good", onclick: function () { rate("good"); } }, [el("span", { text: "Good" }), el("span", { class: "k", text: "2" })]);
        var easy = el("button", { class: "rate easy", onclick: function () { rate("easy"); } }, [el("span", { text: "Easy" }), el("span", { class: "k", text: "3" })]);
        rating.appendChild(again); rating.appendChild(good); rating.appendChild(easy);
        try { good.focus(); } catch (e) {}
      }

      // expose handlers for the keyboard listener
      cur.flip = flip;
      cur.replay = function () { PT.audio.speak(item.pt); };
      cur.rate = function (m) { if (flipped) rate(m); else if (m === "good") flip(); };
      cur.isFlipped = function () { return flipped; };
    }

    function summary() {
      header(); PT.dom.clear(stage); PT.dom.celebrate();
      var pct = done ? Math.round((right / done) * 100) : 0;
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 80 ? "🎉" : "💪" }),
        el("h2", {}, [el("span", { lang: "pt-BR", text: "Boa!" }), " Session complete"]),
        el("p", { class: "summary-line", text: right + " of " + done + " correct (" + pct + "%)" }),
        el("div", { class: "action-row center" }, [
          opts.again ? el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); var fresh = opts.again(); idx = 0; right = 0; done = 0; queue = fresh; show(); } }, ["Practice more"]) : null,
          el("a", { class: "btn btn-soft", href: opts.backHref || "#/practice", onclick: function () { PT.audio.pop(); }, text: "Done" })
        ])
      ]));
    }

    // one keyboard handler for the whole session
    keyHandler = function (e) {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      var k = e.key;
      if (k === " " || k === "Enter") { if (cur.flip && !cur.isFlipped()) { e.preventDefault(); cur.flip(); } }
      else if (k === "1") { if (cur.rate) cur.rate("again"); }
      else if (k === "2") { if (cur.rate) cur.rate("good"); }
      else if (k === "3") { if (cur.rate && cur.isFlipped()) cur.rate("easy"); }
      else if (k === "r" || k === "R") { if (cur.replay) cur.replay(); }
    };
    document.addEventListener("keydown", keyHandler);

    show();
  }
  PT.runFlashcards = runFlashcards;
  PT.stopFlashcards = function () {
    clearTimeout(timer);
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  };

  /* ---- queue builders ---- */
  function dueQueue() {
    var due = PT.store.dueFrom(PT.content.allItems());
    var queue = due.length ? due : PT.dom.shuffle(PT.content.allItems());
    return queue.slice(0, Math.max(10, PT.store.daily.goal));
  }
  function lessonQueue(lessonId) {
    var pool = (PT.content.lesson(lessonId) || { items: [] }).items;
    var due = PT.store.dueFrom(pool);
    return (due.length ? due : PT.dom.shuffle(pool)).slice(0, Math.max(10, PT.store.daily.goal));
  }

  /* ---- the practice hub ---- */
  function hub(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Practice" }));
    wrap.appendChild(el("p", { class: "page-sub", text: "Pick a way to practice." }));

    var due = PT.store.dueFrom(PT.content.allItems()).length;
    var hard = PT.store.strugglingFrom(PT.content.allItems()).length;

    var modes = [
      { emoji: "🎴", title: "Flashcards", sub: due > 0 ? (due + " cards due now") : "Review any time", href: "#/practice/due" },
      { emoji: "👂", title: "Dictation", sub: "Hear it, type what you hear", href: "#/dictation" },
      { emoji: "🔤", title: "Conjugation drill", sub: "Produce verb forms", href: "#/drill" },
      { emoji: "🩹", title: "Review mistakes", sub: hard > 0 ? (hard + " words to shore up") : "No weak spots — nice!", href: "#/mistakes", disabled: hard === 0 }
    ];
    var grid = el("div", { class: "lesson-grid" });
    modes.forEach(function (m) {
      grid.appendChild(el(m.disabled ? "div" : "a", {
        class: "card lesson-card" + (m.disabled ? " disabled" : ""),
        href: m.disabled ? null : m.href,
        onclick: m.disabled ? null : function () { PT.audio.pop(); }
      }, [
        el("div", { class: "lc-emoji", text: m.emoji }),
        el("div", { class: "lc-body" }, [el("div", { class: "lc-title", text: m.title }), el("div", { class: "lc-sub", text: m.sub })]),
        m.disabled ? null : el("span", { class: "lc-chev", text: "›" })
      ]));
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
  }

  function render(host, arg) {
    if (!arg) return hub(host);
    if (arg === "due") return runFlashcards(host, { items: dueQueue(), title: "Daily review", again: dueQueue, backHref: "#/" });
    var lesson = PT.content.lesson(arg);
    if (!lesson) { PT.dom.clear(host); host.appendChild(el("p", { class: "screen-pad", text: "Lesson not found." })); return; }
    runFlashcards(host, { items: lessonQueue(arg), title: lesson.title, again: function () { return lessonQueue(arg); }, backHref: "#/lesson/" + arg });
  }

  PT.screens.practice = { title: "Practice", tab: "practice", render: render, onLeave: function () { PT.stopFlashcards(); } };
})();
