/* My Body — tap a body part to name it, or play the "find it" game.
   Naming body parts is a classic 24–36 month language milestone. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.body = {
  title: "My Body",
  theme: "body",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.body,
      name: function (p) { return p.name; },
      say: function (p) { return p.name; },
      intro: "Let's learn body parts! Tap a picture.",
      build: function (p) {
        return { node: TE.ui.el("span", { class: "glyph", text: p.emoji }), cap: p.name };
      }
    });
  }
};
