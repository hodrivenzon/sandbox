/* Letters — one letter at a time. In English: "A is for Apple 🍎". In Hebrew:
   the aleph-bet, one letter per screen with its name, an example word, and (for
   the five letters that have one) the final/sofit form. At 2–3 this is letter
   *exposure*, not reading: a calm one-letter-per-screen view keeps it gentle. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.letters = {
  title: "Letters",
  titleKey: "title_letters",
  theme: "letters",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var he = TE.lang() === "he";
    var L = he ? TE.data.lettersHe : TE.data.lettersEn;
    var i = 0;

    var letter = el("button", { class: "big-letter", "aria-label": "Letter", text: L[0].l });
    var nameLine = el("div", { class: "letter-name" });      // Hebrew letter name
    var word = el("div", { class: "letter-word" }, [
      el("span", { class: "emoji", text: L[0].emoji }),
      el("span", { class: "txt" })
    ]);
    var sofitLine = el("div", { class: "letter-sofit" });    // Hebrew final form

    var prev = el("button", { class: "step-btn", "aria-label": "Previous letter", text: "◀︎" });
    var next = el("button", { class: "step-btn", "aria-label": "Next letter", text: "▶︎" });
    var stepper = el("div", { class: "stepper" }, [prev, next]);

    function say() {
      var d = L[i];
      TE.audio.speak(TE.t("letterSpeak", he ? d.name : d.l, d.word));
    }

    function load(idx) {
      i = (idx + L.length) % L.length;
      var d = L[i];
      letter.textContent = d.l;
      if (he) {
        nameLine.textContent = d.name;
        sofitLine.textContent = d.sofit ? (TE.t("endingForm") + ": " + d.sofit) : "";
      }
      word.querySelector(".emoji").textContent = d.emoji;
      word.querySelector(".txt").textContent = TE.t("letterWord", d.l, d.word);
      prev.disabled = (i === 0);
      next.disabled = (i === L.length - 1);
      say();
    }

    letter.addEventListener("click", function () { TE.audio.pop(); TE.ui.bump(letter); say(); });
    prev.addEventListener("click", function () { TE.audio.pop(); if (i > 0) load(i - 1); });
    next.addEventListener("click", function () { TE.audio.pop(); if (i < L.length - 1) load(i + 1); });

    var kids = he ? [letter, nameLine, word, sofitLine, stepper] : [letter, word, stepper];
    var stage = el("div", { class: "letter-stage" }, kids);
    host.appendChild(stage);
    load(0);
  }
};
