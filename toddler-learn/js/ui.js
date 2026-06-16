/* Tiny Explorers — shared UI helpers + the reusable "grid activity" engine
   used by Colors, Shapes, Animals and My Body. Keeping these activities on one
   engine guarantees a consistent, predictable interface (the same tap → name →
   celebrate loop everywhere), which matters a lot for toddlers who rely on
   repetition and predictability.

   All spoken/visible phrases go through TE.t() so the engine speaks whichever
   language is selected; content labels come from the activity's name()/say(). */
window.TE = window.TE || {};

TE.ui = (function () {
  /* tiny DOM builder */
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "class") n.className = props[k];
        else if (k === "html") n.innerHTML = props[k];
        else if (k === "text") n.textContent = props[k];
        else if (k === "style" && typeof props[k] === "object") {
          var st = props[k];
          Object.keys(st).forEach(function (sk) {
            // CSS custom properties (--x) must go through setProperty;
            // Object.assign/style[...] silently ignores them.
            if (sk.indexOf("--") === 0) n.style.setProperty(sk, st[sk]);
            else n.style[sk] = st[sk];
          });
        }
        else if (k.slice(0, 2) === "on" && typeof props[k] === "function") n.addEventListener(k.slice(2), props[k]);
        else if (k === "aria") Object.keys(props[k]).forEach(function (a) { n.setAttribute("aria-" + a, props[k][a]); });
        else if (props[k] != null) n.setAttribute(k, props[k]);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, exclude) {
    var pool = exclude == null ? arr : arr.filter(function (x) { return x !== exclude; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* Inline SVG for the Shapes activity (kept asset-free). */
  function shapeSVG(type, fill) {
    var s = '<svg class="shape" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    var f = 'fill="' + fill + '" stroke="rgba(0,0,0,.10)" stroke-width="3"';
    var body = {
      circle: '<circle cx="50" cy="50" r="42" ' + f + '/>',
      square: '<rect x="10" y="10" width="80" height="80" rx="10" ' + f + '/>',
      rectangle: '<rect x="6" y="24" width="88" height="52" rx="10" ' + f + '/>',
      triangle: '<polygon points="50,8 92,90 8,90" ' + f + '/>',
      star: '<polygon points="50,6 61,38 95,38 67,59 78,92 50,71 22,92 33,59 5,38 39,38" ' + f + '/>',
      heart: '<path d="M50 88 L16 52 a20 20 0 0 1 34 -20 a20 20 0 0 1 34 20 Z" ' + f + '/>'
    }[type] || '';
    return s + body + '</svg>';
  }

  /* Falling-emoji celebration. */
  function celebrate(emojis) {
    // Honor the grown-up "celebrations" / "calm motion" settings.
    if (TE.config && (!TE.config.celebrateOn() || !TE.config.motionOn())) return;
    var layer = document.getElementById("celebrate");
    if (!layer) return;
    var pool = emojis || ["🎉", "⭐", "🎈", "🌟", "✨", "💛", "💙", "💚"];
    for (var i = 0; i < 26; i++) {
      var c = el("div", { class: "confetti", text: pool[Math.floor(Math.random() * pool.length)] });
      c.style.left = Math.floor(Math.random() * 100) + "vw";
      c.style.top = "-8vh";
      c.style.setProperty("--d", (0.9 + Math.random() * 0.9).toFixed(2) + "s");
      c.style.setProperty("--r", (Math.floor(Math.random() * 720) - 360) + "deg");
      c.style.fontSize = (22 + Math.random() * 26) + "px";
      layer.appendChild(c);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(c);
    }
  }

  /* Particle "firework" burst from a node's center — contingent, brief, ease-out
     (good "juice" per motion research; gated by the motion/celebrate settings). */
  function burst(node, emojis) {
    if (TE.config && (!TE.config.celebrateOn() || !TE.config.motionOn())) return;
    var layer = document.getElementById("celebrate");
    if (!layer || !node) return;
    var r = node.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var pool = emojis || ["⭐", "✨", "🎉", "💛", "🌟"];
    for (var i = 0; i < 12; i++) {
      var ang = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      var dist = 80 + Math.random() * 80;
      var p = el("div", { class: "spark", text: pool[Math.floor(Math.random() * pool.length)] });
      p.style.left = cx + "px"; p.style.top = cy + "px";
      p.style.setProperty("--x", (Math.cos(ang) * dist).toFixed(0) + "px");
      p.style.setProperty("--y", (Math.sin(ang) * dist).toFixed(0) + "px");
      layer.appendChild(p);
      (function (n) { setTimeout(function () { n.remove(); }, 1000); })(p);
    }
  }

  /* A short "parade" of characters walking across the screen — a milestone reward. */
  function parade(emojis) {
    if (TE.config && (!TE.config.celebrateOn() || !TE.config.motionOn())) return;
    var layer = document.getElementById("celebrate");
    if (!layer) return;
    var pool = emojis || ["🐶", "🐱", "🐮", "🐷", "🦁", "🐸", "🐤"];
    for (var i = 0; i < 4; i++) {
      var m = el("div", { class: "parade", text: pool[Math.floor(Math.random() * pool.length)] });
      m.style.top = (38 + Math.random() * 16) + "vh";
      m.style.setProperty("--delay", (i * 0.5).toFixed(2) + "s");
      layer.appendChild(m);
      (function (node) { setTimeout(function () { node.remove(); }, 4400); })(m);
    }
  }

  /* Brief pop animation helper that auto-cleans. */
  function bump(node, cls) {
    cls = cls || "is-pop";
    node.classList.remove(cls);
    void node.offsetWidth; // reflow to restart animation
    node.classList.add(cls);
    setTimeout(function () { node.classList.remove(cls); }, 600);
  }

  function cheer() {
    var list = TE.i18n.cheers();
    return list[Math.floor(Math.random() * list.length)];
  }

  /* ----------------------------------------------------------------------
     gridActivity — the shared tap-to-learn engine.
     opts: {
       host, theme, items,
       build(item) -> { node: <Element for the card inner>, cap?: string },
       say(item)   -> string spoken on tap in Explore mode,
       name(item)  -> short label used for Find prompts + matching,
       findable    -> show the optional "Find it" game toggle (default true),
       intro       -> sentence spoken when the screen opens
     }
  ---------------------------------------------------------------------- */
  function gridActivity(opts) {
    var host = clear(opts.host);
    var items = opts.items;
    var findable = opts.findable !== false;

    var stage = el("div", { class: "stage" });
    var banner = el("div", { class: "prompt-banner", text: TE.t("tapToPlay") });
    var grid = el("div", { class: "card-grid" + (items.length <= 6 ? " few" : "") });
    stage.appendChild(banner);
    stage.appendChild(grid);

    var mode = "explore";       // "explore" | "find"
    var target = null;

    var cells = items.map(function (item) {
      var built = opts.build(item);
      var card = el("button", {
        class: "play-card",
        aria: { label: opts.name(item) }
      }, [built.node]);
      if (built.cap) card.appendChild(el("span", { class: "cap", text: built.cap }));
      card.addEventListener("click", function () { onTap(item, card); });
      grid.appendChild(card);
      return { item: item, card: card };
    });

    function onTap(item, card) {
      TE.audio.pop();
      bump(card);
      if (mode === "explore") {
        TE.audio.speak(opts.say(item));
        return;
      }
      // find mode
      if (item === target) {
        card.classList.add("is-correct");
        TE.audio.chime();
        celebrate();
        banner.textContent = cheer() + " 🎉";
        banner.classList.add("cheer");
        TE.audio.speak(cheer());
        setTimeout(function () { card.classList.remove("is-correct"); newTarget(); }, 1500);
      } else {
        bump(card, "is-wobble");
        TE.audio.nudge();
        banner.classList.remove("cheer");
        var msg = TE.t("thatsX", opts.name(item), opts.name(target));
        banner.textContent = "🔎 " + msg;
        TE.audio.speak(msg);
      }
    }

    function newTarget() {
      target = sample(items, target);
      banner.classList.remove("cheer");
      var q = TE.t("findQ", opts.name(target));
      banner.textContent = "🔎 " + q;
      TE.audio.speak(q);
    }

    function setMode(m) {
      mode = m;
      banner.classList.remove("cheer");
      if (m === "find") { newTarget(); toggle.querySelector(".lbl").textContent = TE.t("freePlay"); toggle.querySelector(".ic").textContent = "👆"; }
      else { banner.textContent = TE.t("tapToPlay"); toggle.querySelector(".lbl").textContent = TE.t("findGame"); toggle.querySelector(".ic").textContent = "🔎"; }
    }

    var toggle = el("button", { class: "mode-btn" }, [
      el("span", { class: "ic", text: "🔎" }),
      el("span", { class: "lbl", text: TE.t("findGame") })
    ]);
    toggle.addEventListener("click", function () {
      TE.audio.pop();
      setMode(mode === "explore" ? "find" : "explore");
    });

    if (findable) {
      var bar = el("div", { class: "mode-bar" }, [toggle]);
      stage.appendChild(bar);
    }

    host.appendChild(stage);
    if (opts.intro) setTimeout(function () { TE.audio.speak(opts.intro); }, 350);
  }

  return {
    el: el, clear: clear, shuffle: shuffle, sample: sample,
    shapeSVG: shapeSVG, celebrate: celebrate, burst: burst, parade: parade,
    bump: bump, cheer: cheer, gridActivity: gridActivity
  };
})();
