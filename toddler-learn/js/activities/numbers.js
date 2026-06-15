/* Numbers — count 1 to 10 by tapping objects one-by-one.
   Tapping each object in turn teaches one-to-one correspondence; the final
   number names the total (cardinality). 2–3 year-olds count meaningfully to
   ~3–5, so 1–5 is the heart of it, with 6–10 there to grow into. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.numbers = {
  title: "Numbers",
  theme: "numbers",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var n = 1;

    var bigNum = el("div", { class: "big-number", text: "1" });
    var objects = el("div", { class: "count-objects" });
    var word = el("div", { class: "count-word", text: "Tap to count!" });

    var prev = el("button", { class: "step-btn", "aria-label": "Previous number", text: "◀︎" });
    var next = el("button", { class: "step-btn", "aria-label": "Next number", text: "▶︎" });
    var stepper = el("div", { class: "stepper" }, [prev, next]);

    var counted = 0;

    function load(num) {
      n = num;
      counted = 0;
      bigNum.textContent = String(n);
      word.textContent = "Tap to count!";
      TE.ui.clear(objects);
      var glyph = TE.data.numberObjects[(n - 1) % TE.data.numberObjects.length];
      for (var i = 0; i < n; i++) {
        var o = el("span", { class: "obj", text: glyph, "data-on": "0" });
        o.addEventListener("click", onTapObject);
        objects.appendChild(o);
      }
      prev.disabled = (n <= 1);
      next.disabled = (n >= 10);
      TE.audio.speak(String(n) + "! Tap to count " + n + ".");
    }

    function onTapObject(e) {
      var o = e.currentTarget;
      if (o.getAttribute("data-on") === "1") return; // already counted
      o.setAttribute("data-on", "1");
      o.classList.add("counted");
      counted++;
      TE.audio.pop();
      TE.audio.speak(TE.data.numberWords[counted - 1]);
      word.textContent = TE.data.numberWords[counted - 1].replace(/^./, function (c) { return c.toUpperCase(); });
      if (counted === n) {
        setTimeout(function () {
          word.textContent = n + (n === 1 ? " " + singular() + "!" : " " + plural() + "!");
          TE.audio.chime();
          TE.ui.celebrate();
          TE.audio.speak(n + " " + (n === 1 ? singular() : plural()) + "!");
        }, 450);
      }
    }
    function singular() { return "thing"; }
    function plural() { return "things"; }

    prev.addEventListener("click", function () { TE.audio.pop(); if (n > 1) load(n - 1); });
    next.addEventListener("click", function () { TE.audio.pop(); if (n < 10) load(n + 1); });

    var stage = el("div", { class: "count-stage" }, [bigNum, objects, word, stepper]);
    host.appendChild(stage);
    load(1);
  }
};
