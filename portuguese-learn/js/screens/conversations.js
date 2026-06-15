/* Falar — Conversations ("Talk").
   Real, colloquial daily-interaction dialogues for advanced learners: slang,
   idioms and natural rhythm. Each line is tappable to hear; the whole exchange
   can be played back; and the key expressions become practiceable cards. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var timer = null, playing = false;

  function render(host, id) {
    if (id) return detail(host, id);
    list(host);
  }

  var REG = { informal: "casual", neutral: "everyday", formal: "polite" };

  function list(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Conversations 💬" }));
    wrap.appendChild(el("p", { class: "page-sub", text: "How Brazilians really talk: everyday situations with natural slang and idioms." }));

    var ds = PT.content.dialogues();
    if (!ds.length) { wrap.appendChild(el("p", { class: "page-sub", text: "Loading conversations…" })); host.appendChild(wrap); return; }

    var grid = el("div", { class: "lesson-grid" });
    ds.forEach(function (d) {
      grid.appendChild(el("a", {
        class: "card lesson-card", href: "#/talk/" + d.id, onclick: function () { PT.audio.pop(); }
      }, [
        el("div", { class: "lc-emoji", text: d.emoji }),
        el("div", { class: "lc-body" }, [
          el("div", { class: "lc-title", lang: "pt-BR", text: d.title }),
          el("div", { class: "lc-sub", text: d.setting })
        ]),
        el("span", { class: "pill reg reg-" + d.register, text: REG[d.register] || d.register })
      ]));
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
  }

  function detail(host, id) {
    PT.dom.clear(host);
    var d = PT.content.dialogue(id);
    if (!d) { host.appendChild(el("p", { class: "screen-pad", text: "Conversation not found." })); return; }
    var wrap = el("div", { class: "screen-pad" });

    wrap.appendChild(el("div", { class: "lesson-hero" }, [
      el("div", { class: "lesson-hero-emoji", text: d.emoji }),
      el("div", {}, [
        el("h1", { class: "page-title", lang: "pt-BR", text: d.title }),
        el("p", { class: "page-sub", text: d.setting })
      ])
    ]));

    // map each speaker to a side so it reads like a chat
    var sides = {}, order = 0;
    d.lines.forEach(function (ln) { if (!(ln.speaker in sides)) { sides[ln.speaker] = order++ === 0 ? "left" : "right"; } });

    var playBtn = el("button", { class: "btn btn-soft", aria: { pressed: "false" }, onclick: function () { playAll(d, playBtn); } }, [
      el("span", { class: "btn-ic", text: "▶︎" }), el("span", { class: "lbl", text: "Play conversation" })
    ]);
    wrap.appendChild(el("div", { class: "action-row" }, [playBtn]));

    var thread = el("div", { class: "dlg-thread" });
    d.lines.forEach(function (ln) { thread.appendChild(C.dialogueLine(ln, sides[ln.speaker] || "left")); });
    wrap.appendChild(thread);

    if (d.expressions && d.expressions.length) {
      wrap.appendChild(C.sectionTitle("Key expressions"));
      var list = el("div", { class: "card-list" });
      d.items.forEach(function (item) { list.appendChild(C.wordCard(item, { onKnow: function () {} })); });
      wrap.appendChild(list);
    }

    host.appendChild(wrap);
  }

  /* Speak each Portuguese line in turn; tap again to stop. */
  function playAll(d, btn) {
    if (playing) { stopAll(btn); return; }
    if (PT.audio.muted && PT.setMute) { PT.setMute(false); }
    playing = true;
    btn.classList.add("is-active");
    btn.setAttribute("aria-pressed", "true");
    btn.querySelector(".lbl").textContent = "Stop";
    var i = 0;
    (function next() {
      if (!playing || i >= d.lines.length) { stopAll(btn); return; }
      var ln = d.lines[i++];
      PT.audio.speak(ln.pt, { rate: 0.95, onend: function () { timer = setTimeout(next, 500); } });
    })();
  }
  function stopAll(btn) {
    playing = false;
    clearTimeout(timer);
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    if (btn) { btn.classList.remove("is-active"); btn.setAttribute("aria-pressed", "false"); var l = btn.querySelector(".lbl"); if (l) l.textContent = "Play conversation"; }
  }

  PT.screens.talk = { title: "Conversations", tab: "talk", render: render, onLeave: function () { stopAll(); } };
})();
