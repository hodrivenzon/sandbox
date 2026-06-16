/* Animals — tap an animal to hear its name and the sound it makes.
   Animal sounds are a top favorite at 2–3 and great for vocabulary. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.animals = {
  title: "Animals",
  titleKey: "title_animals",
  theme: "animals",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.animals,
      name: function (a) { return TE.tx(a); },
      say: function (a) {
        var says = TE.lang() === "he" ? a.saysHe : a.saysEn;
        return TE.tx(a) + "! " + says + ".";
      },
      intro: TE.t("introAnimals"),
      build: function (a) {
        return { node: TE.ui.el("span", { class: "glyph", text: a.emoji }), cap: TE.tx(a) };
      }
    });
  }
};
