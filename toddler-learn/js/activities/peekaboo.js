/* Peekaboo — tap a door to reveal a hidden animal and hear its name; tap again
   to hide a new one. Builds object permanence (a 2-yo strength) and naming, with
   a delightful reveal. How many doors is the configurable "doors" knob. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.peekaboo = {
  title: "Peekaboo",
  titleKey: "title_peekaboo",
  theme: "peekaboo",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var pool = TE.data.animals;

    var banner = el("div", { class: "prompt-banner", text: TE.t("peekabooBanner") });
    var grid = el("div", { class: "card-grid few" });
    var stage = el("div", { class: "stage" }, [banner, grid]);
    var n = (TE.config ? TE.config.doors() : 3);

    function makeDoor() {
      var item = TE.ui.sample(pool);
      var open = false;
      var face = el("span", { class: "peek-face glyph", text: item.emoji });
      var cover = el("span", { class: "peek-cover", text: "❓" });
      var card = el("button", { class: "peek-card", aria: { label: TE.t("title_peekaboo") } }, [face, cover]);

      card.addEventListener("click", function () {
        TE.audio.pop();
        if (!open) {
          open = true;
          card.classList.add("open");
          TE.ui.bump(card);
          TE.audio.speak(TE.t("peekabooReveal", TE.tx(item)));
          TE.ui.burst(card, ["✨", "🎉", "⭐"]);
        } else {
          open = false;
          card.classList.remove("open");
          item = TE.ui.sample(pool, item);
          face.textContent = item.emoji;                  // hide a fresh one
        }
      });
      grid.appendChild(card);
    }

    for (var i = 0; i < n; i++) makeDoor();
    host.appendChild(stage);
    setTimeout(function () { TE.audio.speak(TE.t("peekabooIntro")); }, 350);
  }
};
