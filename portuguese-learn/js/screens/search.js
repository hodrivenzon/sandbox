/* Falar — search across every word and phrase (accent-insensitive, EN or PT). */
(function () {
  var el = PT.dom.el, C = PT.components;

  function render(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Search" }));

    var input = el("input", {
      class: "search-input", type: "search",
      placeholder: "Search in English or Portuguese…",
      autocomplete: "off", autocapitalize: "none", spellcheck: "false",
      "aria-label": "Search vocabulary"
    });
    wrap.appendChild(el("div", { class: "search-bar" }, [el("span", { class: "search-ic", text: "🔎" }), input]));

    var results = el("div", { class: "card-list" });
    var hint = el("p", { class: "page-sub", text: "Type to search " + PT.content.count() + " words and phrases." });
    wrap.appendChild(hint);
    wrap.appendChild(results);
    host.appendChild(wrap);

    function run() {
      var q = input.value;
      PT.dom.clear(results);
      if (!q.trim()) { hint.hidden = false; return; }
      hint.hidden = true;
      var found = PT.content.search(q);
      if (!found.length) { results.appendChild(el("p", { class: "page-sub", text: "No matches for “" + q + "”." })); return; }
      found.forEach(function (item) {
        var card = C.wordCard(item, {});
        card.appendChild(el("a", { class: "wc-lesson-link", href: "#/lesson/" + item.lessonId, onclick: function () { PT.audio.pop(); }, text: "from " + item.lessonTitle + " →" }));
        results.appendChild(card);
      });
    }
    input.addEventListener("input", run);
    setTimeout(function () { input.focus(); }, 60);
  }

  PT.screens.search = { title: "Search", tab: "search", render: render };
})();
