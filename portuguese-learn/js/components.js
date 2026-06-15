/* Falar — reusable UI components shared by lesson / search / practice screens.
   Built on PT.dom.el. The vocabulary card is the core teaching unit: it shows
   the Portuguese word, a tap-to-hear speaker, an English meaning, a pronunciation
   hint, gender, and an example sentence (also tappable to hear). */
window.PT = window.PT || {};

PT.components = (function () {
  var el = PT.dom.el;

  var GENDER_LBL = { m: "masculine", f: "feminine" };

  /* A round speaker button that speaks `text` (Brazilian Portuguese). */
  function speakBtn(text, opts) {
    opts = opts || {};
    var b = el("button", {
      class: "speak-btn" + (opts.big ? " big" : ""),
      type: "button",
      aria: { label: "Hear pronunciation: " + text },
      onclick: function (e) {
        e.stopPropagation();
        PT.audio.pop();
        PT.dom.bump(b, "is-ring");
        PT.audio.speak(text, { rate: opts.rate || 0.9 });
      }
    }, ["🔊"]);
    return b;
  }

  function genderPill(g) {
    if (!g) return null;
    return el("span", { class: "pill gender-" + g, title: GENDER_LBL[g], text: g === "m" ? "o · m" : "a · f" });
  }

  /* Full vocabulary card. opts.showMeaning(false) hides the English side for a
     quick self-test feel; opts.onKnow adds an "I know this" affordance. */
  function wordCard(item, opts) {
    opts = opts || {};
    var head = el("div", { class: "wc-head" }, [
      el("div", { class: "wc-pt-row" }, [
        el("span", { class: "wc-pt", lang: "pt-BR", text: item.pt }),
        speakBtn(item.pt)
      ]),
      item.emoji ? el("span", { class: "wc-emoji", text: item.emoji }) : null
    ]);

    var meta = el("div", { class: "wc-meta" }, [
      item.hint ? el("span", { class: "wc-hint", text: "/" + item.hint + "/" }) : null,
      genderPill(item.gender),
      item.pos ? el("span", { class: "pill pos", text: item.pos }) : null
    ]);

    var meaning = el("div", { class: "wc-en", text: item.en });

    // advanced usage/nuance note (songs + dialogue expressions)
    var noteEl = item.note ? el("div", { class: "wc-note", text: "💬 " + item.note }) : null;

    var example = (item.ex_pt) ? el("div", { class: "wc-ex" }, [
      el("div", { class: "wc-ex-row" }, [
        el("span", { class: "wc-ex-pt", lang: "pt-BR", text: item.ex_pt }),
        speakBtn(item.ex_pt, { rate: 0.88 })
      ]),
      item.ex_en ? el("div", { class: "wc-ex-en", text: item.ex_en }) : null
    ]) : null;

    var learned = PT.store.isLearned(item.key);
    var kids = [head, meta, meaning, noteEl, example];

    if (opts.onKnow) {
      var done = learned;
      var btn = el("button", {
        class: "know-btn" + (learned ? " is-known" : ""),
        type: "button",
        text: learned ? "✓ Known" : "I know this",
        onclick: function () {
          if (done) return;            // guard against repeat taps re-grading
          done = true;
          PT.store.markKnown(item.key);
          btn.classList.add("is-known");
          btn.textContent = "✓ Known";
          card.classList.add("learned");
          PT.audio.correct();
          opts.onKnow(item);
        }
      });
      kids.push(btn);
    }

    var card = el("div", { class: "word-card" + (learned ? " learned" : "") }, kids);
    return card;
  }

  /* Small stat tile used on the dashboard. */
  function stat(value, label, emoji) {
    return el("div", { class: "stat" }, [
      el("div", { class: "stat-ic", text: emoji }),
      el("div", { class: "stat-val", text: String(value) }),
      el("div", { class: "stat-lbl", text: label })
    ]);
  }

  /* Section heading with optional right-side action. */
  function sectionTitle(text, action) {
    return el("div", { class: "section-title" }, [el("h2", { text: text }), action || null]);
  }

  /* One line of a conversation as a chat bubble; `side` is "left" or "right". */
  function dialogueLine(line, side) {
    return el("div", { class: "dlg-line " + side }, [
      el("div", { class: "dlg-speaker", text: line.speaker }),
      el("div", { class: "dlg-bubble" }, [
        el("div", { class: "dlg-row" }, [
          el("span", { class: "dlg-pt", lang: "pt-BR", text: line.pt }),
          speakBtn(line.pt, { rate: 0.92 })
        ]),
        el("div", { class: "dlg-en", text: line.en }),
        line.note ? el("div", { class: "dlg-note", text: "💡 " + line.note }) : null
      ])
    ]);
  }

  return { speakBtn: speakBtn, genderPill: genderPill, wordCard: wordCard, stat: stat, sectionTitle: sectionTitle, dialogueLine: dialogueLine };
})();
