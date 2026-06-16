/* Home hub — big, colorful tiles. One tap opens an activity. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.home = {
  title: "Tiny Explorers",
  titleKey: "appName",
  theme: "home",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);

    var hero = el("div", { class: "home-hero" }, [
      el("div", { class: "logo", text: "🧸" }),
      el("h2", { text: TE.t("appName") }),
      el("p", { text: TE.t("homeTap") })
    ]);

    var grid = el("div", { class: "tile-grid" });
    TE.data.menu.forEach(function (m) {
      var tile = el("button", {
        class: "tile",
        style: { "--tile": m.tile },
        aria: { label: TE.tx(m) }
      }, [
        el("span", { class: "emoji", text: m.emoji }),
        el("span", { class: "label", text: TE.tx(m) })
      ]);
      tile.addEventListener("click", function () {
        TE.audio.pop();
        TE.audio.speak(TE.tx(m));
        TE.router.go(m.id);
      });
      grid.appendChild(tile);
    });

    // Discreet, gated grown-ups entrance.
    var parents = el("div", { style: { textAlign: "center", marginTop: "30px" } }, [
      el("button", {
        class: "mode-btn",
        onclick: function () { TE.audio.pop(); TE.requireParentGate(function () { TE.router.go("parents"); }); }
      }, [el("span", { text: TE.t("forGrownups") })])
    ]);

    host.appendChild(hero);
    host.appendChild(grid);
    host.appendChild(parents);
  }
};
