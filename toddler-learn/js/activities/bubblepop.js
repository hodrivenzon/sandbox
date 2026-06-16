/* Bubble Pop — colorful bubbles drift up; tap to pop them.
   Pure cause-and-effect with gentle motion: every tap is rewarded, nothing can
   be "wrong". How many bubbles float at once is the configurable "bubbles" knob
   (Easy 4 / Medium 6 / Hard 9, or a custom value). Motion is local and tied to
   the child's tap; the canvas itself stays calm (per motion research). */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.bubbles = {
  title: "Bubbles",
  titleKey: "title_bubbles",
  theme: "bubbles",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var colors = ["#ff5d5d", "#ff9f43", "#ffce3a", "#4fc26a", "#3db4ff", "#b06bff", "#ff7fb6", "#2bc4c0"];

    var banner = el("div", { class: "prompt-banner", text: TE.t("bubblesBanner") });
    var area = el("div", { class: "bubble-area", "aria-label": TE.t("bubblesBanner") });
    var stage = el("div", { class: "stage" }, [banner, area]);
    host.appendChild(stage);

    var popped = 0;
    var count = (TE.config ? TE.config.bubbles() : 6);

    function spawn() {
      if (!document.body.contains(area)) return;          // screen left → stop
      var b = el("button", { class: "bubble", "aria-label": "bubble" });
      var size = 64 + Math.floor(Math.random() * 56);     // 64–120px
      b.style.width = b.style.height = size + "px";
      b.style.left = Math.floor(Math.random() * 82) + "%";
      b.style.setProperty("--dur", (5.5 + Math.random() * 4).toFixed(2) + "s");
      b.style.setProperty("--sway", (Math.random() * 44 - 22).toFixed(0) + "px");
      b.style.background = "radial-gradient(circle at 32% 28%, rgba(255,255,255,.85), " +
        colors[Math.floor(Math.random() * colors.length)] + "cc 72%)";

      var done = false;
      function finish() {
        if (done) return; done = true;
        b.remove();
        if (document.body.contains(area)) spawn();        // keep the count steady
      }
      b.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        if (done) return;
        pop(b);
        setTimeout(finish, 170);
      });
      b.addEventListener("animationend", finish);          // floated off the top
      area.appendChild(b);
    }

    function pop(b) {
      TE.audio.tone(420 + Math.random() * 240, 0.12, "sine", 0.18);  // soft pop
      b.classList.add("burst-bubble");
      popped++;
      if (popped % 6 === 0) {                              // gentle milestone reward
        TE.audio.chime();
        TE.audio.speak(TE.ui.cheer());
        TE.ui.celebrate(["🫧", "✨", "💧", "🌈"]);
      }
    }

    for (var i = 0; i < count; i++) {
      (function (d) { setTimeout(spawn, d); })(i * 320);
    }
    setTimeout(function () { TE.audio.speak(TE.t("bubblesIntro")); }, 350);
  }
};
