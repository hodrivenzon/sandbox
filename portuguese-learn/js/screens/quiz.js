/* Falar — multiple-choice quiz, generated on the fly from vocabulary.
   Three question types are mixed in: read PT -> pick English, read English ->
   pick PT, and LISTEN -> pick English (the speaker plays the word, no text).
   Distractors are drawn from the same lesson when possible so choices are
   plausible. Every answer is also graded into the spaced-repetition store. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var QN = 10;

  function pickDistractors(pool, answer, field, n) {
    var seen = {};
    seen[answer[field]] = true;
    var out = [];
    PT.dom.shuffle(pool).forEach(function (it) {
      if (out.length >= n) return;
      if (!seen[it[field]]) { seen[it[field]] = true; out.push(it); }
    });
    return out;
  }

  function makeQuestions(pool) {
    var picks = PT.dom.shuffle(pool).slice(0, Math.min(QN, pool.length));
    var types = ["pt-en", "en-pt", "listen"];
    return picks.map(function (item, i) {
      var type = types[i % types.length];
      // listening needs nothing special; choices are English meanings
      var field = (type === "en-pt") ? "pt" : "en";
      var distract = pickDistractors(pool, item, field, 3);
      var options = PT.dom.shuffle([item].concat(distract));
      return { item: item, type: type, field: field, options: options };
    });
  }

  function render(host, lessonId) {
    PT.dom.clear(host);
    var lesson = lessonId ? PT.content.lesson(lessonId) : null;
    var pool = lesson ? lesson.items : PT.content.allItems();
    var wrap = el("div", { class: "screen-pad quiz" });
    host.appendChild(wrap);
    if (pool.length < 4) { wrap.appendChild(el("p", { text: "Need at least 4 words to make a quiz." })); return; }

    var questions = makeQuestions(pool);
    var qi = 0, score = 0;

    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "quiz-stage" });
    wrap.appendChild(bar);
    wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = qi / questions.length;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: (lesson ? lesson.title + " · " : "Quiz · ") + Math.min(qi + 1, questions.length) + "/" + questions.length }),
        el("span", { class: "score-chip", text: "★ " + score })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function show() {
      header();
      PT.dom.clear(stage);
      if (qi >= questions.length) return summary();
      var q = questions[qi];
      var answered = false;

      var prompt;
      if (q.type === "listen") {
        prompt = el("div", { class: "q-prompt listen" }, [
          el("div", { class: "q-instr", text: "Listen and choose the meaning" }),
          C.speakBtn(q.item.pt, { big: true })
        ]);
        setTimeout(function () { PT.audio.speak(q.item.pt, { rate: 0.85 }); }, 250);
      } else if (q.type === "pt-en") {
        prompt = el("div", { class: "q-prompt" }, [
          el("div", { class: "q-instr", text: "What does this mean?" }),
          el("div", { class: "q-word-row" }, [el("span", { class: "q-word", lang: "pt-BR", text: q.item.pt }), C.speakBtn(q.item.pt)])
        ]);
      } else {
        prompt = el("div", { class: "q-prompt" }, [
          el("div", { class: "q-instr", text: "How do you say this in Portuguese?" }),
          el("div", { class: "q-word en", text: q.item.en })
        ]);
      }
      stage.appendChild(prompt);

      var opts = el("div", { class: "options" });
      q.options.forEach(function (opt) {
        var label = opt[q.field];
        var b = el("button", {
          class: "option" + (q.field === "pt" ? " pt" : ""),
          lang: q.field === "pt" ? "pt-BR" : null,
          text: label,
          onclick: function () {
            if (answered) return;
            answered = true;
            var correct = opt === q.item;
            PT.store.grade(q.item.key, correct);
            if (correct) { score++; b.classList.add("correct"); PT.audio.correct(); }
            else {
              b.classList.add("wrong"); PT.audio.wrong();
              // reveal the right one
              Array.prototype.forEach.call(opts.children, function (c, k) {
                if (q.options[k] === q.item) c.classList.add("correct");
              });
            }
            // speak the correct Portuguese as reinforcement
            PT.audio.speak(q.item.pt, { rate: 0.9 });
            opts.classList.add("locked");
            next.removeAttribute("hidden");
          }
        });
        opts.appendChild(b);
      });
      stage.appendChild(opts);

      var next = el("button", { class: "btn btn-primary btn-block", hidden: "", onclick: function () { PT.audio.pop(); qi++; show(); } },
        [qi === questions.length - 1 ? "See results" : "Next →"]);
      stage.appendChild(next);
    }

    function summary() {
      header();
      PT.dom.clear(stage);
      var pct = Math.round((score / questions.length) * 100);
      if (pct >= 70) PT.dom.celebrate();
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : "📚" }),
        el("h2", { text: pct >= 70 ? "Muito bem!" : "Keep going!" }),
        el("p", { class: "summary-line", text: "You scored " + score + " / " + questions.length + " (" + pct + "%)" }),
        el("div", { class: "action-row center" }, [
          el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); questions = makeQuestions(pool); qi = 0; score = 0; show(); } }, ["Try again"]),
          el("a", { class: "btn btn-soft", href: lesson ? "#/lesson/" + lesson.id : "#/", onclick: function () { PT.audio.pop(); } }, ["Done"])
        ])
      ]));
    }

    show();
  }

  PT.screens.quiz = { title: "Quiz", tab: "lessons", render: render };
})();
