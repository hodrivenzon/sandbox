/* Falar — Songs.
   Learn through famous Brazilian songs WITHOUT reproducing any lyrics: each
   entry teaches the advanced vocabulary, idioms and cultural context around the
   song, with original example sentences, plus links to go listen. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function render(host, id) {
    if (id) return detail(host, id);
    list(host);
  }

  function list(host) {
    PT.dom.clear(host);
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Songs 🎵" }));
    wrap.appendChild(el("p", { class: "page-sub", text: "Advanced vocabulary, idioms and culture from famous Brazilian songs." }));
    wrap.appendChild(el("div", { class: "info-note", text: "ℹ️ We teach the words, expressions and stories behind each song — not the lyrics. Tap “Listen” to hear the real thing on your music app." }));

    var songs = PT.content.songs();
    if (!songs.length) { wrap.appendChild(el("p", { class: "page-sub", text: "Loading songs…" })); host.appendChild(wrap); return; }

    var grid = el("div", { class: "lesson-grid" });
    songs.forEach(function (s) {
      var learned = s.items.reduce(function (a, it) { return a + (PT.store.isLearned(it.key) ? 1 : 0); }, 0);
      grid.appendChild(el("a", {
        class: "card song-card", href: "#/songs/" + s.id, onclick: function () { PT.audio.pop(); }
      }, [
        el("div", { class: "song-emoji", text: s.emoji }),
        el("div", { class: "lc-body" }, [
          el("div", { class: "lc-title", lang: "pt-BR", text: s.title }),
          el("div", { class: "lc-sub", text: s.artist }),
          el("div", { class: "song-meta", text: s.year + " · " + s.genre })
        ]),
        PT.dom.ring(s.items.length ? learned / s.items.length : 0, 40)
      ]));
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
  }

  function detail(host, id) {
    PT.dom.clear(host);
    var s = PT.content.song(id);
    if (!s) { host.appendChild(el("p", { class: "screen-pad", text: "Song not found." })); return; }
    var wrap = el("div", { class: "screen-pad" });

    wrap.appendChild(el("div", { class: "lesson-hero" }, [
      el("div", { class: "lesson-hero-emoji", text: s.emoji }),
      el("div", {}, [
        el("h1", { class: "page-title", lang: "pt-BR", text: s.title }),
        el("p", { class: "page-sub", text: s.artist + " · " + s.year + " · " + s.genre })
      ])
    ]));

    // listen links (external search — opens the user's music app/site)
    var q = encodeURIComponent(s.listen || (s.title + " " + s.artist));
    wrap.appendChild(el("div", { class: "action-row" }, [
      el("a", { class: "btn btn-primary", href: "https://www.youtube.com/results?search_query=" + q, target: "_blank", rel: "noopener noreferrer" }, [
        el("span", { class: "btn-ic", text: "▶︎" }), el("span", { text: "Listen on YouTube" })
      ]),
      el("a", { class: "btn btn-soft", href: "https://open.spotify.com/search/" + q, target: "_blank", rel: "noopener noreferrer" }, [
        el("span", { class: "btn-ic", text: "🎧" }), el("span", { text: "Spotify" })
      ])
    ]));

    if (s.culture) {
      wrap.appendChild(el("div", { class: "card culture-card" }, [
        el("div", { class: "tips-title", text: "🎶 Why it matters" }),
        el("p", { class: "culture-text", text: s.culture })
      ]));
    }

    wrap.appendChild(C.sectionTitle("Words & expressions", el("a", { class: "link", href: "#/practice/due", onclick: function () { PT.audio.pop(); }, text: "Practice →" })));
    var list = el("div", { class: "card-list" });
    s.items.forEach(function (item) { list.appendChild(C.wordCard(item, { onKnow: function () {} })); });
    wrap.appendChild(list);

    host.appendChild(wrap);
  }

  PT.screens.songs = { title: "Songs", tab: "songs", render: render };
})();
