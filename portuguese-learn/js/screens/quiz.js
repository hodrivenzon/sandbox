/* Falar — quiz, generated on the fly from vocabulary. Five question types mix in:
     pt-en   read Portuguese  -> choose the English
     en-pt   read English     -> choose the Portuguese
     listen  hear it          -> choose the English
     cloze   fill the gap in an example sentence (multiple choice)
     type    TYPED recall     -> produce the Portuguese (accent-aware)
   Distractors come from the same pool so choices are plausible. Every answer is
   graded into the spaced-repetition store.
   Keyboard: 1-4 pick · Enter check/next · R replay audio. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var QN = 10;
  var timer = null, keyHandler = null;

  function pickDistractors(pool, answer, field, n) {
    var seen = {}; seen[answer[field]] = true;
    var out = [];
    PT.dom.shuffle(pool).forEach(function (it) {
      if (out.length >= n) return;
      if (it[field] && !seen[it[field]]) { seen[it[field]] = true; out.push(it); }
    });
    return out;
  }

  function clozeBlank(item) {
    if (!item.ex_pt || !item.pt) return null;
    var re = new RegExp(item.pt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (!re.test(item.ex_pt)) return null;
    return item.ex_pt.replace(re, "______");
  }

  function makeQuestions(pool) {
    var picks = PT.dom.shuffle(pool).slice(0, Math.min(QN, pool.length));
    var TYPES = ["pt-en", "type", "listen", "cloze", "en-pt"];
    return picks.map(function (item, i) {
      var type = TYPES[i % TYPES.length];
      var cloze = null;
      if (type === "cloze") { cloze = clozeBlank(item); if (!cloze) type = "en-pt"; }
      var q = { item: item, type: type };
      if (type === "type") return q; // typed: no options
      q.field = (type === "en-pt" || type === "cloze") ? "pt" : "en";
      q.cloze = cloze;
      q.options = PT.dom.shuffle([item].concat(pickDistractors(pool, item, q.field, 3)));
      return q;
    });
  }

  function render(host, lessonId) {
    PT.dom.clear(host);
    var lesson = lessonId ? PT.content.lesson(lessonId) : null;
    var wrap = el("div", { class: "screen-pad quiz" });
    host.appendChild(wrap);
    if (lessonId && !lesson) { wrap.appendChild(el("p", { class: "page-sub", text: "Lesson not found." })); return; }
    var pool = lesson ? lesson.items : PT.content.allItems();
    if (pool.length < 4) { wrap.appendChild(el("p", { text: "Need at least 4 words to make a quiz." })); return; }

    var questions = makeQuestions(pool);
    var qi = 0, score = 0;
    var cur = {};

    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "quiz-stage" });
    wrap.appendChild(bar); wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = qi / questions.length;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: (lesson ? lesson.title + " · " : "Quiz · ") + Math.min(qi + 1, questions.length) + "/" + questions.length }),
        el("span", { class: "score-chip", text: "★ " + score })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function nextBtn() {
      var b = el("button", { class: "btn btn-primary btn-block", hidden: "", onclick: function () { PT.audio.pop(); qi++; show(); } },
        [qi === questions.length - 1 ? "See results" : "Next →"]);
      return b;
    }

    function show() {
      header(); PT.dom.clear(stage); cur = {};
      if (qi >= questions.length) return summary();
      var q = questions[qi];
      if (q.type === "type") return showTyped(q);
      showMC(q);
    }

    function showMC(q) {
      var prompt;
      if (q.type === "listen") {
        prompt = el("div", { class: "q-prompt listen" }, [el("div", { class: "q-instr", text: "Listen and choose the meaning" }), C.speakBtn(q.item.pt, { big: true })]);
        clearTimeout(timer); timer = setTimeout(function () { PT.audio.speak(q.item.pt, { rate: 0.85 }); }, 250);
        cur.replay = function () { PT.audio.speak(q.item.pt, { rate: 0.85 }); };
      } else if (q.type === "pt-en") {
        prompt = el("div", { class: "q-prompt" }, [el("div", { class: "q-instr", text: "What does this mean?" }), el("div", { class: "q-word-row" }, [el("span", { class: "q-word", lang: "pt-BR", text: q.item.pt }), C.speakBtn(q.item.pt)])]);
        cur.replay = function () { PT.audio.speak(q.item.pt); };
      } else if (q.type === "cloze") {
        prompt = el("div", { class: "q-prompt" }, [el("div", { class: "q-instr", text: "Fill the gap" }), el("div", { class: "q-cloze", lang: "pt-BR", text: q.cloze })]);
      } else { // en-pt
        prompt = el("div", { class: "q-prompt" }, [el("div", { class: "q-instr", text: "How do you say this in Portuguese?" }), el("div", { class: "q-word en", text: q.item.en })]);
      }
      stage.appendChild(prompt);

      var answered = false;
      var next = nextBtn();
      var opts = el("div", { class: "options" });
      var buttons = [];
      q.options.forEach(function (opt) {
        var mark = el("span", { class: "opt-mark", aria: { hidden: "true" } });
        var b = el("button", { class: "option" + (q.field === "pt" ? " pt" : ""), lang: q.field === "pt" ? "pt-BR" : null, onclick: function () { choose(opt, b); } },
          [el("span", { class: "opt-label", text: opt[q.field] }), mark]);
        b._mark = mark; buttons.push(b); opts.appendChild(b);
      });
      stage.appendChild(opts); stage.appendChild(next);

      function choose(opt, b) {
        if (answered) return; answered = true;
        var correct = opt === q.item;
        PT.store.grade(q.item.key, correct);
        if (correct) { score++; b.classList.add("correct"); b._mark.textContent = "✓"; PT.audio.correct(); if (PT.announce) PT.announce("Correct"); }
        else {
          b.classList.add("wrong"); b._mark.textContent = "✗"; PT.audio.wrong();
          buttons.forEach(function (c, k) { if (q.options[k] === q.item) { c.classList.add("correct"); c._mark.textContent = "✓"; } });
          if (PT.announce) PT.announce("Incorrect. The answer is " + q.item[q.field]);
        }
        PT.audio.speak(q.item.pt);
        opts.classList.add("locked"); next.removeAttribute("hidden");
      }
      cur.select = function (n) { if (!answered && buttons[n]) choose(q.options[n], buttons[n]); };
      cur.next = function () { if (answered) { qi++; show(); } };
    }

    function showTyped(q) {
      stage.appendChild(el("div", { class: "q-prompt" }, [
        el("div", { class: "q-instr", text: "Type this in Portuguese" }),
        el("div", { class: "q-word en", text: q.item.en }),
        q.item.gender ? el("div", { class: "q-gender", text: q.item.gender === "m" ? "(masculine)" : "(feminine)" }) : null
      ]));
      var input = el("input", { class: "drill-input", type: "text", lang: "pt-BR", autocomplete: "off", autocapitalize: "none", spellcheck: "false", placeholder: "type here…", "aria-label": "Type the Portuguese" });
      var feedback = el("div", { class: "dictation-feedback" });
      var next = nextBtn();
      var checkBtn = el("button", { class: "btn btn-primary btn-block", onclick: submit }, ["Check"]);
      stage.appendChild(input); stage.appendChild(feedback); stage.appendChild(checkBtn);
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 100);
      var answered = false;

      function submit() {
        if (answered) return; answered = true;
        var v = PT.content.compareAnswer(input.value, q.item.pt);
        PT.store.grade(q.item.key, v.correct);
        if (v.correct) { score++; PT.audio.correct(); } else PT.audio.wrong();
        input.setAttribute("disabled", "");
        PT.dom.clear(feedback);
        feedback.appendChild(el("div", { class: "dictation-result " + (v.correct ? "good" : "bad") }, [
          el("div", { class: "dr-label", text: v.exact ? "✓ Perfect!" : v.almost ? "✓ Right — watch the accents" : "✗ Not quite" }),
          el("div", { class: "dr-answer" }, [el("span", { lang: "pt-BR", text: q.item.pt }), C.speakBtn(q.item.pt)]),
          q.item.ex_pt ? el("div", { class: "dr-en", text: q.item.ex_pt }) : null
        ]));
        PT.audio.speak(q.item.pt);
        checkBtn.setAttribute("hidden", ""); next.removeAttribute("hidden");
        if (PT.announce) PT.announce(v.correct ? "Correct" : ("The answer is " + q.item.pt));
      }
      cur.submit = submit;
      cur.next = function () { if (answered) { qi++; show(); } };
      cur.replay = function () { PT.audio.speak(q.item.pt); };
    }

    function summary() {
      header(); PT.dom.clear(stage);
      var pct = Math.round((score / questions.length) * 100);
      if (pct >= 70) PT.dom.celebrate();
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : "📚" }),
        pct >= 70 ? el("h2", { lang: "pt-BR", text: "Muito bem!" }) : el("h2", { text: "Keep going!" }),
        el("p", { class: "summary-line", text: "You scored " + score + " / " + questions.length + " (" + pct + "%)" }),
        el("div", { class: "action-row center" }, [
          el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); questions = makeQuestions(pool); qi = 0; score = 0; show(); } }, ["Try again"]),
          el("a", { class: "btn btn-soft", href: lesson ? "#/lesson/" + lesson.id : "#/", onclick: function () { PT.audio.pop(); } }, ["Done"])
        ])
      ]));
    }

    keyHandler = function (e) {
      var inField = e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if (e.key === "Enter") {
        if (inField && cur.submit) { e.preventDefault(); cur.submit(); }
        else if (cur.next) cur.next();
        return;
      }
      if (inField) return;
      if (/^[1-4]$/.test(e.key) && cur.select) cur.select(parseInt(e.key, 10) - 1);
      else if ((e.key === "r" || e.key === "R") && cur.replay) cur.replay();
    };
    document.addEventListener("keydown", keyHandler);
    show();
  }

  function onLeave() {
    clearTimeout(timer);
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  PT.screens.quiz = { title: "Quiz", tab: "lessons", render: render, onLeave: onLeave };
})();
