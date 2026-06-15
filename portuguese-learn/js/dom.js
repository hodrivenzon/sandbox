/* Falar — tiny DOM helpers shared by every screen.
   No framework, no build step: each screen builds its UI with el() and the
   router swaps it into #screen. Mirrors the lightweight approach used across
   this sandbox (plain static assets that run from a double-clicked file). */
window.PT = window.PT || {};
PT.screens = PT.screens || {};

PT.dom = (function () {
  /* tiny DOM builder: el(tag, props, children) */
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null) return;
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k === "text") n.textContent = v;
        else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
        else if (k === "dataset" && typeof v === "object") Object.assign(n.dataset, v);
        else if (k === "aria" && typeof v === "object") Object.keys(v).forEach(function (a) { n.setAttribute("aria-" + a, v[a]); });
        else if (k.slice(0, 2) === "on" && typeof v === "function") n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
    return n;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }

  /* Falling-emoji celebration (asset-free). Skipped when the user prefers
     reduced motion (the CSS only neutralizes durations; this burst is opt-out). */
  function celebrate(emojis) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.getElementById("celebrate");
    if (!layer) return;
    var pool = emojis || ["🎉", "⭐", "🎈", "🌟", "✨", "💚", "💛"];
    for (var i = 0; i < 28; i++) {
      var c = el("div", { class: "confetti", text: pool[Math.floor(Math.random() * pool.length)] });
      c.style.left = Math.floor(Math.random() * 100) + "vw";
      c.style.setProperty("--d", (0.9 + Math.random() * 0.9).toFixed(2) + "s");
      c.style.setProperty("--r", (Math.floor(Math.random() * 720) - 360) + "deg");
      c.style.fontSize = (18 + Math.random() * 24) + "px";
      layer.appendChild(c);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(c);
    }
  }

  /* restart a CSS animation on an element */
  function bump(node, cls) {
    cls = cls || "is-pop";
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  /* SVG progress ring used on lesson cards + the dashboard. */
  function ring(pct, size, label) {
    size = size || 44;
    var r = (size / 2) - 4, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(1, pct)));
    var wrap = el("div", { class: "ring", style: { width: size + "px", height: size + "px" } });
    wrap.innerHTML =
      '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' +
        '<circle class="ring-bg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"/>' +
        '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"' +
          ' stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"' +
          ' transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
      '</svg>' +
      '<span class="ring-lbl">' + (label != null ? label : Math.round(pct * 100) + "%") + '</span>';
    return wrap;
  }

  return { el: el, clear: clear, shuffle: shuffle, sample: sample, celebrate: celebrate, bump: bump, ring: ring };
})();
