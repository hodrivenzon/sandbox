/* Matching — "Which one is the same?" Show a target picture and three choices;
   tap the one that matches. Visual matching / sorting by one attribute is a
   real 2–3 skill. No score and no fail: a wrong tap gently re-prompts. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.match = {
  title: "Matching",
  theme: "match",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var pool = TE.data.animals; // recognizable + nameable

    var banner = el("div", { class: "prompt-banner", text: "Which one is the same?" });
    var targetCard = el("div", { class: "play-card", style: { maxWidth: "180px", margin: "0 auto", aspectRatio: "1 / 1" } });
    var targetWrap = el("div", { style: { textAlign: "center", margin: "0 auto 18px", maxWidth: "200px" } }, [targetCard]);
    var options = el("div", { class: "card-grid few" });

    var target = null;

    function round() {
      banner.classList.remove("cheer");
      target = TE.ui.sample(pool);
      banner.textContent = "Which one is the same?";
      TE.ui.clear(targetCard);
      targetCard.appendChild(el("span", { class: "glyph", text: target.emoji }));

      // two distinct distractors
      var distractors = TE.ui.shuffle(pool.filter(function (p) { return p !== target; })).slice(0, 2);
      var choices = TE.ui.shuffle([target].concat(distractors));

      TE.ui.clear(options);
      choices.forEach(function (c) {
        var card = el("button", { class: "play-card", aria: { label: c.name } }, [
          el("span", { class: "glyph", text: c.emoji })
        ]);
        card.addEventListener("click", function () { choose(c, card); });
        options.appendChild(card);
      });
      TE.audio.speak("Which one is the same? Find the " + target.name + "!");
    }

    function choose(c, card) {
      TE.audio.pop();
      if (c === target) {
        card.classList.add("is-correct");
        TE.ui.bump(card);
        TE.audio.chime();
        TE.ui.celebrate();
        banner.textContent = TE.ui.cheer() + " 🎉";
        banner.classList.add("cheer");
        TE.audio.speak(TE.ui.cheer());
        setTimeout(round, 1500);
      } else {
        TE.ui.bump(card, "is-wobble");
        TE.audio.nudge();
        banner.textContent = "🔎 Find the " + target.name + "!";
        TE.audio.speak("Try again! Find the " + target.name + ".");
      }
    }

    var stage = el("div", { class: "stage" }, [banner, targetWrap, options]);
    host.appendChild(stage);
    round();
  }
};
