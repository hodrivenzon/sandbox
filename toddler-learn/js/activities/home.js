/* Home hub — big, colorful tiles. One tap opens an activity. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.home = {
  title: "Tiny Explorers",
  theme: "home",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);

    var hero = el("div", { class: "home-hero" }, [
      el("div", { class: "logo", text: "🧸" }),
      el("h2", { text: "Tiny Explorers" }),
      el("p", { text: "Tap a picture to play!" })
    ]);

    var grid = el("div", { class: "tile-grid" });
    TE.data.menu.forEach(function (m) {
      var tile = el("button", {
        class: "tile",
        style: { "--tile": m.tile },
        aria: { label: m.label }
      }, [
        el("span", { class: "emoji", text: m.emoji }),
        el("span", { class: "label", text: m.label })
      ]);
      tile.addEventListener("click", function () {
        TE.audio.pop();
        TE.audio.speak(m.label);
        TE.router.go(m.id);
      });
      grid.appendChild(tile);
    });

    // Back to the Sandbox hub + a discreet, gated grown-ups entrance.
    var footer = el("div", {
      style: { textAlign: "center", marginTop: "30px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }
    }, [
      el("a", { class: "mode-btn", href: "../", "aria-label": "Back to the Sandbox", style: { textDecoration: "none" } },
        [el("span", { text: "← Sandbox" })]),
      el("button", {
        class: "mode-btn",
        onclick: function () { TE.audio.pop(); TE.requireParentGate(function () { TE.router.go("parents"); }); }
      }, [el("span", { text: "👋 For Grown-Ups" })])
    ]);

    host.appendChild(hero);
    host.appendChild(grid);
    host.appendChild(footer);
  }
};
