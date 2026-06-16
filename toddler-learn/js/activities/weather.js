/* Weather — tap a weather picture to name it, or play the "find it" game.
   Naming everyday weather feeds the 24–36-month vocabulary explosion and
   supports daily-routine talk ("It's sunny today!"). Bilingual via TE.tx. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.weather = {
  title: "Weather",
  titleKey: "title_weather",
  theme: "weather",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.weather,
      name: function (w) { return TE.tx(w); },
      say: function (w) { return TE.tx(w); },
      intro: TE.t("introWeather"),
      build: function (w) {
        return { node: TE.ui.el("span", { class: "glyph", text: w.emoji }), cap: TE.tx(w) };
      }
    });
  }
};
