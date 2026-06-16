/* Numbers — count 1 to 10 by tapping objects one-by-one.
   Tapping each object in turn teaches one-to-one correspondence; the final
   number names the total (cardinality). 2–3 year-olds count meaningfully to
   ~3–5, so 1–5 is the heart of it, with 6–10 there to grow into.
   Hebrew uses the feminine counting series (אַחַת, שְׁתַּיִם, …). */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.numbers = {
  title: "Numbers",
  titleKey: "title_numbers",
  theme: "numbers",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);
    var n = 1;
    var max = (TE.config ? TE.config.countMax() : 10);   // "Count up to" setting
    var words = TE.data.numberWords[TE.lang()] || TE.data.numberWords.en;

    var bigNum = el("div", { class: "big-number", text: "1" });
    var objects = el("div", { class: "count-objects" });
    var word = el("div", { class: "count-word", text: TE.t("tapToCount") });

    var prev = el("button", { class: "step-btn", "aria-label": "Previous number", text: "◀︎" });
    var next = el("button", { class: "step-btn", "aria-label": "Next number", text: "▶︎" });
    var stepper = el("div", { class: "stepper" }, [prev, next]);

    var counted = 0;

    function label(w) {
      // English capitalizes the first letter; Hebrew has no letter case.
      return TE.lang() === "en" ? w.replace(/^./, function (c) { return c.toUpperCase(); }) : w;
    }

    function load(num) {
      n = num;
      counted = 0;
      bigNum.textContent = String(n);
      word.textContent = TE.t("tapToCount");
      TE.ui.clear(objects);
      var glyph = TE.data.numberObjects[(n - 1) % TE.data.numberObjects.length];
      for (var i = 0; i < n; i++) {
        var o = el("span", { class: "obj", text: glyph, "data-on": "0" });
        o.addEventListener("click", onTapObject);
        objects.appendChild(o);
      }
      prev.disabled = (n <= 1);
      next.disabled = (n >= max);
      TE.audio.speak(TE.t("countPrompt", n));
    }

    function onTapObject(e) {
      var o = e.currentTarget;
      if (o.getAttribute("data-on") === "1") return; // already counted
      o.setAttribute("data-on", "1");
      o.classList.add("counted");
      counted++;
      TE.audio.pop();
      TE.audio.speak(words[counted - 1]);
      word.textContent = label(words[counted - 1]);
      if (counted === n) {
        setTimeout(function () {
          var done = TE.t("countThings", n, words[n - 1]);
          word.textContent = done;
          TE.audio.chime();
          TE.ui.celebrate();
          TE.audio.speak(done);
        }, 450);
      }
    }

    prev.addEventListener("click", function () { TE.audio.pop(); if (n > 1) load(n - 1); });
    next.addEventListener("click", function () { TE.audio.pop(); if (n < max) load(n + 1); });

    var stage = el("div", { class: "count-stage" }, [bigNum, objects, word, stepper]);
    host.appendChild(stage);
    load(1);
  }
};
