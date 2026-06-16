/* Falar — Dictation. Hear a Portuguese sentence and type what you heard, then
   get word-level feedback. Trains listening + spelling, which recognition
   exercises never do. Sentences are drawn from the example sentences across all
   content. Keyboard: Enter checks / advances · R replays · S slow replay. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var timer = null, keyHandler = null;
  var N = 10;

  function buildQueue() {
    // keep sentences short enough to dictate well (skip 12+ word literary lines)
    var pool = PT.content.allItems().filter(function (it) {
      if (!it.ex_pt) return false;
      var n = it.ex_pt.split(" ").length;
      return n >= 3 && n <= 9;
    });
    return PT.dom.shuffle(pool).slice(0, N);
  }

  function tokens(s) { return clean(s).split(" ").filter(Boolean); }
  function clean(s) { return String(s).toLowerCase().replace(/[.,!?;:¡¿"'()]/g, "").replace(/\s+/g, " ").trim(); }
  function deburr(s) { s = String(s).toLowerCase(); return s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s; }

  function render(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    host.appendChild(wrap);
    var queue = buildQueue();
    if (!queue.length) { wrap.appendChild(el("p", { class: "page-sub", text: "No dictation sentences available." })); return; }

    var idx = 0, right = 0;
    var bar = el("div", { class: "session-bar" });
    var stage = el("div", { class: "quiz-stage" });
    wrap.appendChild(bar); wrap.appendChild(stage);

    function header() {
      PT.dom.clear(bar);
      var pct = idx / queue.length;
      bar.appendChild(el("div", { class: "session-meta" }, [
        el("span", { text: "Dictation · " + Math.min(idx + 1, queue.length) + "/" + queue.length }),
        el("span", { class: "score-chip", text: "★ " + right })
      ]));
      bar.appendChild(el("div", { class: "progress thin" }, [el("div", { class: "progress-fill", style: { width: Math.round(pct * 100) + "%" } })]));
    }

    function show() {
      header(); PT.dom.clear(stage);
      if (idx >= queue.length) return summary();
      var item = queue[idx];
      var target = item.ex_pt;
      var answered = false;

      stage.appendChild(el("div", { class: "q-prompt listen" }, [
        el("div", { class: "q-instr", text: "Type what you hear" }),
        el("div", { class: "dictation-audio" }, [
          C.speakBtn(target, { big: true }),
          el("button", { class: "mini-btn", title: "Slow replay", aria: { label: "Slow replay" }, onclick: function () { PT.audio.speakSlow(target); } }, ["🐢 slow"])
        ])
      ]));

      var input = el("textarea", { class: "dictation-input", rows: "2", autocomplete: "off", autocapitalize: "none", spellcheck: "false", "aria-label": "Type the sentence you hear" });
      stage.appendChild(input);

      var feedback = el("div", { class: "dictation-feedback", role: "status", aria: { live: "polite" } });
      stage.appendChild(feedback);

      var checkBtn = el("button", { class: "btn btn-primary btn-block", onclick: check }, ["Check"]);
      stage.appendChild(checkBtn);

      clearTimeout(timer);
      timer = setTimeout(function () { PT.audio.speak(target, { rate: 0.82 }); }, 300);
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 120);

      function check() {
        if (answered) { idx++; show(); return; }
        answered = true;
        var verdict = PT.content.compareAnswer(input.value, target);
        // Grade the SRS on a word-match ratio so one slip in a long sentence
        // doesn't demote the whole item; keep a strict label for feedback.
        var tgt = tokens(target), usr = tokens(input.value), matched = 0;
        tgt.forEach(function (w, i) { if (usr[i] != null && (clean(usr[i]) === clean(w) || deburr(usr[i]) === deburr(w))) matched++; });
        var ratio = tgt.length ? matched / tgt.length : 0;
        var pass = verdict.correct || ratio >= 0.8;
        PT.store.grade(item.key, pass);
        if (pass) { right++; PT.audio.correct(); } else PT.audio.wrong();
        input.setAttribute("disabled", "");
        renderDiff(feedback, target, input.value, verdict, item, pass);
        checkBtn.textContent = idx === queue.length - 1 ? "See results" : "Next →";
        if (PT.announce) PT.announce(pass ? "Correct" : "Not quite");
      }

      cur = { check: check, replay: function () { PT.audio.speak(target); }, slow: function () { PT.audio.speakSlow(target); }, answered: function () { return answered; } };
    }

    function renderDiff(host, target, typed, verdict, item, pass) {
      PT.dom.clear(host);
      var tgt = tokens(target), usr = tokens(typed);
      var row = el("div", { class: "diff" });
      tgt.forEach(function (w, i) {
        var ok = usr[i] != null && (clean(usr[i]) === clean(w) || deburr(usr[i]) === deburr(w));
        row.appendChild(el("span", { class: "diff-w " + (ok ? "ok" : "bad"), text: w }));
        row.appendChild(document.createTextNode(" "));
      });
      var label = verdict.exact ? "✓ Perfect!" : verdict.almost ? "✓ Right — watch the accents" : pass ? "✓ Close enough" : "✗ Not quite";
      host.appendChild(el("div", { class: "dictation-result " + (pass ? "good" : "bad") }, [
        el("div", { class: "dr-label", text: label }),
        el("div", { class: "dr-pt", lang: "pt-BR" }, [row]),
        item.ex_en ? el("div", { class: "dr-en", text: item.ex_en }) : null
      ]));
    }

    function summary() {
      header(); PT.dom.clear(stage);
      var pct = Math.round((right / queue.length) * 100);
      if (pct >= 70) PT.dom.celebrate();
      stage.appendChild(el("div", { class: "summary card" }, [
        el("div", { class: "summary-emoji", text: pct >= 90 ? "🏆" : pct >= 60 ? "🎧" : "📚" }),
        el("h2", { text: "Dictation done" }),
        el("p", { class: "summary-line", text: right + " of " + queue.length + " correct (" + pct + "%)" }),
        el("div", { class: "action-row center" }, [
          el("button", { class: "btn btn-primary", onclick: function () { PT.audio.pop(); queue = buildQueue(); idx = 0; right = 0; show(); } }, ["Again"]),
          el("a", { class: "btn btn-soft", href: "#/practice", onclick: function () { PT.audio.pop(); }, text: "Done" })
        ])
      ]));
    }

    var cur = {};
    keyHandler = function (e) {
      if (e.key === "Enter" && e.target && e.target.tagName === "TEXTAREA" && !e.shiftKey) { e.preventDefault(); if (cur.check) cur.check(); }
      else if ((e.key === "r" || e.key === "R") && (!e.target || e.target.tagName !== "TEXTAREA")) { if (cur.replay) cur.replay(); }
      else if ((e.key === "s" || e.key === "S") && (!e.target || e.target.tagName !== "TEXTAREA")) { if (cur.slow) cur.slow(); }
    };
    document.addEventListener("keydown", keyHandler);
    show();
  }

  function onLeave() {
    clearTimeout(timer);
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  PT.screens.dictation = { title: "Dictation", tab: "practice", render: render, onLeave: onLeave };
})();
