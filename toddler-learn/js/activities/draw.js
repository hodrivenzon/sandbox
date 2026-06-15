/* Draw / Stickers — open-ended creative play. Pick a sticker, then tap
   anywhere to stamp it. Open-ended, no goal, no fail — toddlers love the
   cause-and-effect and it builds fine-motor confidence. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.draw = {
  title: "Draw",
  theme: "draw",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);

    var current = TE.data.stamps[0];
    var canvas = el("div", { class: "stamp-canvas", "aria-label": "Drawing area. Tap to add stickers." });

    function placeAt(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var x = clientX - rect.left, y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      var s = el("span", { class: "stamp", text: current });
      s.style.left = x + "px";
      s.style.top = y + "px";
      canvas.appendChild(s);
      TE.audio.pop();
    }
    canvas.addEventListener("pointerdown", function (e) { e.preventDefault(); placeAt(e.clientX, e.clientY); });

    // sticker palette
    var tools = el("div", { class: "draw-tools" });
    function selectStamp(stamp, btn) {
      current = stamp;
      tools.querySelectorAll(".tool").forEach(function (t) { t.classList.remove("active"); });
      btn.classList.add("active");
      TE.audio.pop();
    }
    TE.data.stamps.forEach(function (stamp, idx) {
      var btn = el("button", { class: "tool" + (idx === 0 ? " active" : ""), text: stamp, "aria-label": "Sticker " + stamp });
      btn.addEventListener("click", function () { selectStamp(stamp, btn); });
      tools.appendChild(btn);
    });

    // clear button
    var clearBtn = el("button", { class: "tool", text: "🗑️", "aria-label": "Clear all stickers" });
    clearBtn.addEventListener("click", function () {
      TE.audio.pop();
      canvas.querySelectorAll(".stamp").forEach(function (s) { s.remove(); });
      TE.audio.speak("All clean!");
    });
    tools.appendChild(clearBtn);

    var stage = el("div", { class: "draw-wrap" }, [
      el("div", { class: "prompt-banner", text: "Pick a sticker, then tap! ✨" }),
      canvas,
      tools
    ]);
    host.appendChild(stage);
    setTimeout(function () { TE.audio.speak("Pick a sticker, then tap to draw!"); }, 350);
  }
};
