/* Falar — Conjugation drill. Active recall of present-tense verb forms: given an
   infinitive and a pronoun, you TYPE the conjugated form. Far more demanding than
   reading the tables. Items feed the spaced-repetition store under "conj:" keys.
   Keyboard: Enter checks / advances. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var timer = null, keyHandler = null;
  var N = 12;

  function buildQueue() {
    var pool = PT.content.verbDrillItems();
    var due = PT.store.dueFrom(pool);
    return (due.length ? due : PT.dom.shuffle(pool)).slice(0, N);
  }

  function render(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    host.appendChild(wrap);
    var queue = buildQueue();
    if (!queue.length) { wrap.appendChild(el("p", { class: "page-sub", text: "No verbs available to drill." })); return; }

    var idx = 0, right = 0;
    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "quiz-stage" });
    wrap.appendChild(bar); wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = idx / queue.length;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: "Conjugation · " + Math.min(idx + 1, queue.length) + "/" + queue.length }),
        el("span", { class: "score-chip", text: "★ " + right })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function show() {
      header(); PT.dom.clear(stage);
      if (idx >= queue.length) return summary();
      var item = queue[idx];
      var answered = false;

      stage.appendChild(el("div", { class: "q-prompt" }, [
        el("div", { class: "q-instr", text: "Conjugate in the present tense" }),
        el("div", { class: "drill-verb" }, [
          el("span", { class: "drill-inf", lang: "pt-BR", text: item.infinitive }),
          el("span", { class: "drill-en", text: "(" + item.en + ")" }),
          item.irregular ? el("span", { class: "pill irr", text: "irregular" }) : null
        ]),
        el("div", { class: "drill-cue" }, [el("span", { class: "drill-pron", lang: "pt-BR", text: item.pronLabel }), el("span", { class: "drill-blank", text: "______" })])
      ]));

      var input = el("input", { class: "drill-input", type: "text", lang: "pt-BR", autocomplete: "off", autocapitalize: "none", spellcheck: "false", "aria-label": "Type the conjugated form" });
      stage.appendChild(input);
      var feedback = el("div", { class: "dictation-feedback", role: "status", aria: { live: "polite" } });
      stage.appendChild(feedback);
      var checkBtn = el("button", { class: "btn btn-primary btn-block", onclick: check }, ["Check"]);
      stage.appendChild(checkBtn);
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 100);

      function check() {
        if (answered) { idx++; show(); return; }
        answered = true;
        var verdict = PT.content.compareAnswer(input.value, item.answer);
        PT.store.grade(item.key, verdict.correct);
        if (verdict.correct) { right++; PT.audio.correct(); } else PT.audio.wrong();
        input.setAttribute("disabled", "");
        PT.dom.clear(feedback);
        feedback.appendChild(el("div", { class: "dictation-result " + (verdict.correct ? "good" : "bad") }, [
          el("div", { class: "dr-label", text: verdict.exact ? "✓ Perfect!" : verdict.almost ? "✓ Right — watch the accents" : "✗ Not quite" }),
          el("div", { class: "dr-answer" }, [
            el("span", { lang: "pt-BR", text: item.pronLabel + " " + item.answer }),
            C.speakBtn(item.pronLabel + " " + item.answer)
          ]),
          item.ex_pt ? el("div", { class: "dr-en", text: item.ex_pt + " — " + (item.ex_en || "") }) : null
        ]));
        PT.audio.speak(item.pronLabel + " " + item.answer);
        checkBtn.textContent = idx === queue.length - 1 ? "See results" : "Next →";
        if (PT.announce) PT.announce(verdict.correct ? "Correct" : ("The answer is " + item.answer));
      }
      cur = { check: check };
    }

    function summary() {
      header(); PT.dom.clear(stage);
      var pct = Math.round((right / queue.length) * 100);
      if (pct >= 70) PT.dom.celebrate();
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 90 ? "🏆" : pct >= 60 ? "🎉" : "📚" }),
        pct >= 70 ? el("h2", { lang: "pt-BR", text: "Muito bem!" }) : el("h2", { text: "Keep drilling!" }),
        el("p", { class: "summary-line", text: right + " of " + queue.length + " correct (" + pct + "%)" }),
        el("div", { class: "action-row center" }, [
          el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); queue = buildQueue(); idx = 0; right = 0; show(); } }, ["Again"]),
          el("a", { class: "btn btn-soft", href: "#/verbs", onclick: function () { PT.audio.pop(); }, text: "See tables" })
        ])
      ]));
    }

    var cur = {};
    keyHandler = function (e) {
      if (e.key === "Enter" && e.target && e.target.tagName === "INPUT") { e.preventDefault(); if (cur.check) cur.check(); }
    };
    document.addEventListener("keydown", keyHandler);
    show();
  }

  function onLeave() {
    clearTimeout(timer);
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  PT.screens.drill = { title: "Conjugation drill", tab: "practice", render: render, onLeave: onLeave };
})();
