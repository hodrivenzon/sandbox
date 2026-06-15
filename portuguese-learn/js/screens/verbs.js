/* Falar — present-tense verb conjugations.
   Each verb is an expandable card showing the four practical Brazilian forms
   (eu / você / nós / eles), all tappable to hear. Irregular verbs are flagged. */
(function () {
  var el = PT.dom.el, C = PT.components;
  var PRON = [
    { key: "eu", lbl: "eu" },
    { key: "voce", lbl: "você / ele / ela" },
    { key: "nos", lbl: "nós" },
    { key: "eles", lbl: "eles / elas / vocês" }
  ];

  function render(host) {
    PT.dom.clear(host);
    var data = PT.content.verbs();
    var wrap = el("div", { class: "screen-pad" });

    wrap.appendChild(el("h1", { class: "page-title", text: "Verbs" }));
    wrap.appendChild(el("p", { class: "page-sub", text: "Present tense of the " + data.verbs.length + " most useful verbs. Tap any form to hear it." }));

    if (data.grammar && data.grammar.length) {
      wrap.appendChild(el("div", { class: "card tips-card" }, [
        el("div", { class: "tips-title", text: "💡 Good to know" }),
        el("ul", { class: "tips-list" }, data.grammar.map(function (g) { return el("li", { text: g }); }))
      ]));
    }

    var list = el("div", { class: "card-list" });
    data.verbs.forEach(function (v) { list.appendChild(verbCard(v)); });
    wrap.appendChild(list);
    host.appendChild(wrap);
  }

  function verbCard(v) {
    var open = false;
    var table = el("div", { class: "conj-table", hidden: "" });
    PRON.forEach(function (p) {
      var form = v.conj[p.key];
      var phrase = p.lbl.split(" ")[0] + " " + form; // speak "eu sou"
      table.appendChild(el("div", { class: "conj-row" }, [
        el("span", { class: "conj-pron", text: p.lbl }),
        el("span", { class: "conj-form", lang: "pt-BR", text: form }),
        C.speakBtn(phrase, { rate: 0.9 })
      ]));
    });
    if (v.ex_pt) {
      table.appendChild(el("div", { class: "conj-ex" }, [
        el("span", { lang: "pt-BR", text: v.ex_pt }),
        C.speakBtn(v.ex_pt, { rate: 0.85 }),
        v.ex_en ? el("div", { class: "conj-ex-en", text: v.ex_en }) : null
      ]));
    }

    var head = el("button", {
      class: "verb-head",
      onclick: function () {
        open = !open;
        if (open) { table.removeAttribute("hidden"); head.classList.add("open"); }
        else { table.setAttribute("hidden", ""); head.classList.remove("open"); }
        PT.audio.pop();
      }
    }, [
      el("div", { class: "verb-inf-row" }, [
        el("span", { class: "verb-inf", lang: "pt-BR", text: v.infinitive }),
        v.irregular ? el("span", { class: "pill irr", text: "irregular" }) : null
      ]),
      el("span", { class: "verb-en", text: v.en }),
      el("span", { class: "verb-chev", text: "▾" })
    ]);

    return el("div", { class: "card verb-card" }, [head, table]);
  }

  PT.screens.verbs = { title: "Verbs", tab: "verbs", render: render };
})();
