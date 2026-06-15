/* Shapes — tap a shape to hear its name. Optional "Find it" game. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.shapes = {
  title: "Shapes",
  theme: "shapes",
  render: function (host) {
    var fills = {
      circle: "#ff5d5d", square: "#3db4ff", triangle: "#4fc26a",
      star: "#ffce3a", heart: "#ff7fb6", rectangle: "#b06bff"
    };
    TE.ui.gridActivity({
      host: host,
      items: TE.data.shapes,
      name: function (s) { return s.name; },
      say: function (s) { return s.name; },
      intro: "Let's learn shapes! Tap a shape.",
      build: function (s) {
        var node = TE.ui.el("span", { html: TE.ui.shapeSVG(s.type, fills[s.type] || "#3db4ff") });
        return { node: node, cap: s.name };
      }
    });
  }
};
