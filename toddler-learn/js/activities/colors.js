/* Colors — tap a color to hear its name. Optional "Find it" game.
   Primary colors come first; 2–3 year-olds typically name colors by ~3. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.colors = {
  title: "Colors",
  titleKey: "title_colors",
  theme: "colors",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.colors,
      name: function (c) { return TE.tx(c); },
      say: function (c) { return TE.tx(c); },
      intro: TE.t("introColors"),
      build: function (c) {
        var sw = TE.ui.el("div", { class: "swatch", style: { background: c.hex } });
        if (c.en === "White") sw.style.borderColor = "#d8d8d8";
        return { node: sw, cap: TE.tx(c) };
      }
    });
  }
};
