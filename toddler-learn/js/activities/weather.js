/* Weather — tap a weather picture to name it, or play the "find it" game.
   Naming everyday weather feeds the 24–36-month vocabulary explosion and
   supports daily-routine talk ("It's sunny today!"). */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.weather = {
  title: "Weather",
  theme: "weather",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.weather,
      name: function (w) { return w.name; },
      say: function (w) { return w.name; },
      intro: "Let's learn the weather! Tap a picture.",
      build: function (w) {
        return { node: TE.ui.el("span", { class: "glyph", text: w.emoji }), cap: w.name };
      }
    });
  }
};
