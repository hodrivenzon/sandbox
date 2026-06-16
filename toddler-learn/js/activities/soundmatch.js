/* Animal Sounds — "Who said that?" Play an animal sound, then tap the animal
   that made it. A quiz-style game (question → options grid) with a configurable
   NUMBER OF CHOICES (2–6) and a gentle star reward — no score is ever lost, a
   wrong tap just replays the sound and invites another try. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.sound = {
  title: "Animal Sounds",
  titleKey: "title_sound",
  theme: "sound",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var pool = TE.data.animals;

    var banner = el("div", { class: "prompt-banner", text: TE.t("soundBanner") });
    var stars = el("div", { class: "star-row", "aria-hidden": "true" });
    var options = el("div", { class: "card-grid few" });
    var replay = el("button", { class: "mode-btn" }, [el("span", { text: TE.t("soundReplay") })]);
    var stage = el("div", { class: "stage" }, [banner, stars, options, el("div", { class: "mode-bar" }, [replay])]);

    var target = null;
    var won = 0;

    function says(a) { return TE.lang() === "he" ? a.saysHe : a.saysEn; }
    function playSound() { if (target) TE.audio.speak(TE.tx(target) + ". " + says(target)); }
    replay.addEventListener("click", function () { TE.audio.pop(); playSound(); });

    function addStar() {
      won++;
      stars.appendChild(el("span", { class: "star", text: "⭐" }));
      if (won % 3 === 0) TE.ui.parade();           // milestone parade
    }

    function round() {
      banner.classList.remove("cheer");
      banner.textContent = TE.t("soundBanner");
      target = TE.ui.sample(pool, target);
      var n = (TE.config ? TE.config.choices() : 3);
      var distract = TE.ui.shuffle(pool.filter(function (p) { return p !== target; })).slice(0, Math.max(1, n - 1));
      var choices = TE.ui.shuffle([target].concat(distract));

      TE.ui.clear(options);
      choices.forEach(function (c) {
        var card = el("button", { class: "play-card", aria: { label: TE.tx(c) } }, [
          el("span", { class: "glyph", text: c.emoji })
        ]);
        card.addEventListener("click", function () { choose(c, card); });
        options.appendChild(card);
      });
      setTimeout(playSound, 450);
    }

    function choose(c, card) {
      TE.audio.pop();
      if (c === target) {
        card.classList.add("is-correct");
        TE.ui.bump(card);
        TE.audio.chime();
        TE.ui.burst(card);
        TE.ui.celebrate();
        addStar();
        banner.textContent = TE.ui.cheer() + " 🎉";
        banner.classList.add("cheer");
        TE.audio.speak(TE.ui.cheer());
        setTimeout(round, 1600);
      } else {
        TE.ui.bump(card, "is-wobble");
        TE.audio.nudge();
        setTimeout(playSound, 300);
      }
    }

    host.appendChild(stage);
    setTimeout(function () { TE.audio.speak(TE.t("soundIntro")); round(); }, 400);
  }
};
