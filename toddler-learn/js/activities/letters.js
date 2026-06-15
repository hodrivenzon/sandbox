/* Letters — one letter at a time, "A is for Apple 🍎".
   At 2–3 this is letter *exposure*, not reading: a calm one-letter-per-screen
   view (not 26 tiny cards) keeps the focus gentle and clear. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.letters = {
  title: "Letters",
  theme: "letters",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var i = 0;
    var L = TE.data.letters;

    var letter = el("button", { class: "big-letter", "aria-label": "Letter", text: "A" });
    var word = el("div", { class: "letter-word" }, [
      el("span", { class: "emoji", text: "🍎" }),
      el("span", { class: "txt", text: "A is for Apple" })
    ]);

    var prev = el("button", { class: "step-btn", "aria-label": "Previous letter", text: "◀︎" });
    var next = el("button", { class: "step-btn", "aria-label": "Next letter", text: "▶︎" });
    var stepper = el("div", { class: "stepper" }, [prev, next]);

    function say() { TE.audio.speak(L[i].l + ". " + L[i].l + " is for " + L[i].word + "."); }

    function load(idx) {
      i = (idx + L.length) % L.length;
      var d = L[i];
      letter.textContent = d.l;
      word.querySelector(".emoji").textContent = d.emoji;
      word.querySelector(".txt").textContent = d.l + " is for " + d.word;
      prev.disabled = (i === 0);
      next.disabled = (i === L.length - 1);
      say();
    }

    letter.addEventListener("click", function () { TE.audio.pop(); TE.ui.bump(letter); say(); });
    prev.addEventListener("click", function () { TE.audio.pop(); if (i > 0) load(i - 1); });
    next.addEventListener("click", function () { TE.audio.pop(); if (i < L.length - 1) load(i + 1); });

    var stage = el("div", { class: "letter-stage" }, [letter, word, stepper]);
    host.appendChild(stage);
    load(0);
  }
};
