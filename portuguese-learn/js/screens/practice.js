/* Falar — flashcard practice driven by the spaced-repetition store.
   A session pulls the cards that are DUE (Leitner box timing), shows one side,
   lets you flip, then you self-grade Again / Good. Grades feed PT.store, which
   schedules each card's next appearance. With no lesson filter it reviews due
   cards across all lessons; with a lesson id it drills just that topic. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var timer = null; // tracks the auto-play setTimeout so onLeave can cancel it

  function buildQueue(lessonId) {
    var pool = lessonId ? (PT.content.lesson(lessonId) || { items: [] }).items : PT.content.allItems();
    var due = PT.store.dueFrom(pool);
    // If nothing is due (all caught up), drill the whole pool anyway so practice
    // is never a dead end — but cap the length so a session stays short.
    var queue = due.length ? due : PT.dom.shuffle(pool);
    var cap = Math.max(10, PT.store.daily.goal);
    return queue.slice(0, cap);
  }

  function render(host, lessonId) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad practice" });
    host.appendChild(wrap);

    var pool = lessonId ? (PT.content.lesson(lessonId) || { items: [] }).items : PT.content.allItems();
    if (!pool.length) { wrap.appendChild(el("p", { text: "No cards yet." })); return; }

    var queue = buildQueue(lessonId);
    var dir = PT.store.settings.dir || "pt-en"; // pt-en: see Portuguese first
    var idx = 0, right = 0, done = 0;

    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "flash-stage" });
    wrap.appendChild(bar);
    wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = queue.length ? done / queue.length : 0;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: (lessonId ? (PT.content.lesson(lessonId).title + " · ") : "Daily review · ") + Math.min(idx + 1, queue.length) + "/" + queue.length }),
        el("button", {
          class: "dir-toggle", title: "Swap card direction",
          text: dir === "pt-en" ? "PT → EN" : "EN → PT",
          onclick: function () {
            dir = dir === "pt-en" ? "en-pt" : "pt-en";
            PT.store.setSetting("dir", dir);
            PT.audio.pop(); show();
          }
        })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function show() {
      header();
      PT.dom.clear(stage);
      if (idx >= queue.length) return summary();
      var item = queue[idx];
      var ptFront = dir === "pt-en";
      var flipped = false;

      var front = ptFront
        ? el("div", { class: "flash-face" }, [
            el("div", { class: "flash-word", lang: "pt-BR", text: item.pt }),
            C.speakBtn(item.pt, { big: true }),
            el("div", { class: "flash-tap", text: "tap to reveal" })
          ])
        : el("div", { class: "flash-face" }, [
            item.emoji ? el("div", { class: "flash-emoji", text: item.emoji }) : null,
            el("div", { class: "flash-word en", text: item.en }),
            el("div", { class: "flash-tap", text: "tap to reveal" })
          ]);

      var back = el("div", { class: "flash-face back" }, [
        el("div", { class: "flash-word", lang: "pt-BR", text: item.pt }),
        C.speakBtn(item.pt, { big: true }),
        el("div", { class: "flash-en", text: item.en }),
        item.hint ? el("div", { class: "flash-hint", text: "/" + item.hint + "/" }) : null,
        item.ex_pt ? el("div", { class: "flash-ex" }, [
          el("span", { lang: "pt-BR", text: item.ex_pt }), C.speakBtn(item.ex_pt, { rate: 0.85 })
        ]) : null
      ]);

      // Flashcard is operable by mouse, touch AND keyboard (Enter/Space).
      var card = el("div", { class: "flash-card", role: "button", tabindex: "0", aria: { label: "Show the answer" } }, [front]);
      function flip() {
        if (flipped) return;
        flipped = true;
        PT.dom.clear(card); card.appendChild(back);
        card.classList.add("flipped");
        card.setAttribute("aria-label", "Answer shown");
        if (!ptFront) PT.audio.speak(item.pt, { rate: 0.9 });
        showRating();
      }
      card.addEventListener("click", flip);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); flip(); }
      });
      stage.appendChild(card);

      // auto-play the Portuguese when it's the prompt
      clearTimeout(timer);
      if (ptFront) timer = setTimeout(function () { PT.audio.speak(item.pt, { rate: 0.9 }); }, 250);

      var rating = el("div", { class: "rating", hidden: "" });
      stage.appendChild(rating);
      function showRating() {
        rating.removeAttribute("hidden");
        rating.appendChild(el("button", { class: "rate again", text: "Again", onclick: function () { grade(false); } }));
        var good = el("button", { class: "rate good", text: "Good", onclick: function () { grade(true); } });
        rating.appendChild(good);
        try { good.focus(); } catch (e) {} // hand keyboard focus to the rating control
      }

      function grade(correct) {
        PT.store.grade(item.key, correct);
        if (correct) { right++; PT.audio.correct(); } else { PT.audio.wrong(); }
        done++; idx++;
        show();
      }
    }

    function summary() {
      header();
      PT.dom.clear(stage);
      PT.dom.celebrate();
      var pct = done ? Math.round((right / done) * 100) : 0;
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 80 ? "🎉" : "💪" }),
        el("h2", {}, [el("span", { lang: "pt-BR", text: "Boa!" }), " Session complete"]),
        el("p", { class: "summary-line", text: right + " of " + done + " correct (" + pct + "%)" }),
        el("p", { class: "summary-sub", text: "+" + (right * 10 + (done - right) * 2) + " XP" }),
        el("div", { class: "action-row center" }, [
          el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); idx = 0; right = 0; done = 0; queue = buildQueue(lessonId); show(); } }, ["Practice more"]),
          el("a", { class: "btn btn-soft", href: lessonId ? "#/lesson/" + lessonId : "#/", onclick: function () { PT.audio.pop(); } }, ["Done"])
        ])
      ]));
    }

    show();
  }

  function onLeave() {
    clearTimeout(timer);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  PT.screens.practice = { title: "Practice", tab: "practice", render: render, onLeave: onLeave };
})();
