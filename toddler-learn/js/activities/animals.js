/* Animals — tap an animal to hear its name and the sound it makes.
   Animal sounds are a top favorite at 2–3 and great for vocabulary. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.animals = {
  title: "Animals",
  theme: "animals",
  render: function (host) {
    TE.ui.gridActivity({
      host: host,
      items: TE.data.animals,
      name: function (a) { return a.name; },
      say: function (a) { return a.name + "! " + a.says + "."; },
      intro: "Let's meet the animals! Tap an animal.",
      build: function (a) {
        return { node: TE.ui.el("span", { class: "glyph", text: a.emoji }), cap: a.name };
      }
    });
  }
};
