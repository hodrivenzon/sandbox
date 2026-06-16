/* Music — colorful pads tuned to a pentatonic scale, so every combination
   sounds pleasant. There are no "wrong" notes: it's pure cause-and-effect
   play, which is exactly right for this age. A "Song" button plays a familiar
   tune (Mary Had a Little Lamb). */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.music = {
  title: "Music",
  titleKey: "title_music",
  theme: "music",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);

    var grid = el("div", { class: "pad-grid" });
    var byNote = {};
    TE.data.music.forEach(function (p) {
      byNote[p.note] = p.freq;
      var pad = el("button", {
        class: "pad",
        style: { background: p.color },
        "aria-label": "Play note " + p.note,
        text: p.emoji
      });
      function hit() {
        TE.audio.tone(p.freq, 0.5, "triangle", 0.22);
        pad.classList.add("hit");
        setTimeout(function () { pad.classList.remove("hit"); }, 130);
      }
      // pointerdown = instant response to a tap
      pad.addEventListener("pointerdown", function (e) { e.preventDefault(); hit(); });
      pad.addEventListener("click", function (e) { /* keyboard/AT activation */ if (e.detail === 0) hit(); });
      grid.appendChild(pad);
    });

    // Mary Had a Little Lamb — uses notes C, D, E, G (all in our scale)
    var SONG = [
      ["E",1],["D",1],["C",1],["D",1],["E",1],["E",1],["E",2],
      ["D",1],["D",1],["D",2],["E",1],["G",1],["G",2],
      ["E",1],["D",1],["C",1],["D",1],["E",1],["E",1],["E",1],["E",1],
      ["D",1],["D",1],["E",1],["D",1],["C",2]
    ];
    var songBtn = el("button", { class: "mode-btn" }, [el("span", { text: TE.t("playSong") })]);
    songBtn.addEventListener("click", function () {
      TE.audio.pop();
      var t = 0, beat = 0.42;
      SONG.forEach(function (step) {
        var f = byNote[step[0]] || byNote.C;
        var dur = beat * step[1] * 0.95;
        TE.audio.tone(f, dur, "triangle", 0.2, t);
        t += beat * step[1];
      });
      TE.audio.speak(TE.t("songName"));
    });

    var stage = el("div", { class: "stage" }, [
      el("div", { class: "prompt-banner", text: TE.t("musicBanner") }),
      grid,
      el("div", { class: "mode-bar" }, [songBtn])
    ]);
    host.appendChild(stage);
    setTimeout(function () { TE.audio.speak(TE.t("musicIntro")); }, 350);
  }
};
