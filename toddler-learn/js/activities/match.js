/* Matching — "Which one is the same?" Show a target picture and three choices;
   tap the one that matches. Visual matching / sorting by one attribute is a
   real 2–3 skill. No score and no fail: a wrong tap gently re-prompts. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.match = {
  title: "Matching",
  titleKey: "title_match",
  theme: "match",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var pool = TE.data.animals; // recognizable + nameable

    var banner = el("div", { class: "prompt-banner", text: TE.t("whichSame") });
    var targetCard = el("div", { class: "play-card", style: { maxWidth: "180px", margin: "0 auto", aspectRatio: "1 / 1" } });
    var targetWrap = el("div", { style: { textAlign: "center", margin: "0 auto 18px", maxWidth: "200px" } }, [targetCard]);
    var options = el("div", { class: "card-grid few" });

    var target = null;

    function round() {
      banner.classList.remove("cheer");
      target = TE.ui.sample(pool);
      banner.textContent = TE.t("whichSame");
      TE.ui.clear(targetCard);
      targetCard.appendChild(el("span", { class: "glyph", text: target.emoji }));

      // distractors so the total choices match the configured number
      var nChoices = (TE.config ? TE.config.choices() : 3);
      var distractors = TE.ui.shuffle(pool.filter(function (p) { return p !== target; })).slice(0, Math.max(1, nChoices - 1));
      var choices = TE.ui.shuffle([target].concat(distractors));

      TE.ui.clear(options);
      choices.forEach(function (c) {
        var card = el("button", { class: "play-card", aria: { label: TE.tx(c) } }, [
          el("span", { class: "glyph", text: c.emoji })
        ]);
        card.addEventListener("click", function () { choose(c, card); });
        options.appendChild(card);
      });
      TE.audio.speak(TE.t("whichSameFind", TE.tx(target)));
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
        banner.textContent = "🔎 " + TE.t("findShort", TE.tx(target));
        TE.audio.speak(TE.t("tryAgainFind", TE.tx(target)));
      }
    }

    var stage = el("div", { class: "stage" }, [banner, targetWrap, options]);
    host.appendChild(stage);
    round();
  }
};
