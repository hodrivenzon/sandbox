/* Falar — single lesson view.
   Browse a topic's vocabulary as tap-to-hear cards, read grammar tips, play the
   whole list as audio, then jump straight into a quiz or flashcards for it. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function render(host, id) {
    PT.dom.clear(host);
    var lesson = PT.content.lesson(id);
    if (!lesson) { host.appendChild(el("p", { class: "screen-pad", text: "Lesson not found." })); return; }

    var wrap = el("div", { class: "screen-pad" });

    wrap.appendChild(el("div", { class: "lesson-hero" }, [
      el("div", { class: "lesson-hero-emoji", text: lesson.emoji }),
      el("div", {}, [
        el("h1", { class: "page-title", text: lesson.title }),
        lesson.blurb ? el("p", { class: "page-sub", text: lesson.blurb }) : null
      ])
    ]));

    /* action row */
    var playBtn = el("button", { class: "btn btn-soft", aria: { pressed: "false" }, onclick: function () { playAll(lesson, playBtn); } }, [
      el("span", { class: "btn-ic", text: "▶︎" }), el("span", { class: "lbl", text: "Play all" })
    ]);
    wrap.appendChild(el("div", { class: "action-row" }, [
      playBtn,
      el("a", { class: "btn btn-soft", href: "#/quiz/" + lesson.id, onclick: function () { PT.audio.pop(); } }, [
        el("span", { class: "btn-ic", text: "📝" }), el("span", { text: "Quiz" })
      ]),
      el("a", { class: "btn btn-soft", href: "#/practice/" + lesson.id, onclick: function () { PT.audio.pop(); } }, [
        el("span", { class: "btn-ic", text: "🎴" }), el("span", { text: "Flashcards" })
      ])
    ]));

    /* grammar tips */
    if (lesson.grammar && lesson.grammar.length) {
      wrap.appendChild(el("div", { class: "card tips-card" }, [
        el("div", { class: "tips-title", text: "💡 Good to know" }),
        el("ul", { class: "tips-list" }, lesson.grammar.map(function (g) { return el("li", { text: g }); }))
      ]));
    }

    /* word cards */
    var list = el("div", { class: "card-list" });
    lesson.items.forEach(function (item) {
      list.appendChild(C.wordCard(item, { onKnow: function () { refreshHeader(); } }));
    });
    wrap.appendChild(list);

    var footer = el("div", { class: "lesson-footer" });
    wrap.appendChild(footer);
    refreshHeader();

    function refreshHeader() {
      var learned = lesson.items.reduce(function (a, it) { return a + (PT.store.isLearned(it.key) ? 1 : 0); }, 0);
      PT.dom.clear(footer);
      footer.appendChild(el("p", { class: "page-sub center", text: learned + " of " + lesson.items.length + " marked as known" }));
    }

    host.appendChild(wrap);
  }

  /* Speak each word in turn; chain via onend. Click again to stop. */
  var playing = false;
  function playAll(lesson, btn) {
    if (playing) { stopAll(btn); return; }
    if (PT.audio.muted && PT.setMute) { PT.setMute(false); } // unmute *and* sync the topbar button
    playing = true;
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    btn.querySelector(".lbl").textContent = "Stop";
    var i = 0;
    (function next() {
      if (!playing || i >= lesson.items.length) { stopAll(btn); return; }
      var w = lesson.items[i++];
      PT.audio.speak(w.pt, { rate: 0.85, onend: function () { setTimeout(next, 450); } });
    })();
  }
  function stopAll(btn) {
    playing = false;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    if (btn) { btn.classList.remove("is-active"); btn.setAttribute("aria-pressed", "false"); var l = btn.querySelector(".lbl"); if (l) l.textContent = "Play all"; }
  }

  PT.screens.lesson = { title: "Lesson", tab: "lessons", render: render, onLeave: function () { stopAll(); } };
})();
