/* Settings — a grown-up screen (behind the parent gate) to make every game
   adaptable: a global difficulty Level plus per-game knobs (number of choices,
   count range, bubbles, peekaboo doors), narration speed, motion/effects, and
   celebrations. Writes to TE.config (persisted); each game reads it on open. */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.settings = {
  title: "Settings",
  titleKey: "title_settings",
  theme: "settings",
  render: function (host) {
    var el = TE.ui.el, C = TE.config;
    TE.ui.clear(host);

    /* A segmented control: options = [{val,label}]. */
    function seg(options, getCur, onPick) {
      var row = el("div", { class: "seg-row", role: "group" });
      function refresh() {
        Array.prototype.forEach.call(row.children, function (ch, i) {
          ch.classList.toggle("on", options[i].val === getCur());
        });
      }
      options.forEach(function (o) {
        var b = el("button", { class: "seg-btn", text: o.label });
        b.addEventListener("click", function () { TE.audio.pop(); onPick(o.val); refresh(); });
        row.appendChild(b);
      });
      refresh();
      return row;
    }

    function field(labelKey, control) {
      return el("div", { class: "set-field" }, [
        el("div", { class: "set-label", text: TE.t(labelKey) }),
        control
      ]);
    }

    /* A knob row: "Auto" (follow the level) plus explicit numeric choices. */
    function knobSeg(name, values) {
      var opts = [{ val: null, label: TE.t("optAuto") }].concat(
        values.map(function (v) { return { val: v, label: String(v) }; })
      );
      return seg(opts,
        function () { return C.isOverridden(name) ? C.knob(name) : null; },
        function (v) { C.setKnob(name, v); });
    }

    var doc = el("div", { class: "doc settings-doc" }, [
      el("h2", { text: TE.t("settingsTitle") }),
      el("p", { text: TE.t("settingsIntro") }),

      field("setLevel", seg(
        [{ val: "easy", label: TE.t("levelEasy") }, { val: "medium", label: TE.t("levelMedium") }, { val: "hard", label: TE.t("levelHard") }],
        function () { return C.level(); }, function (v) { C.setLevel(v); })),

      field("setChoices", knobSeg("choices", [2, 3, 4, 5])),
      field("setCountMax", knobSeg("countMax", [3, 5, 10])),
      field("setBubbles", knobSeg("bubbles", [4, 6, 9])),
      field("setDoors", knobSeg("doors", [2, 3, 4])),

      field("setSpeed", seg(
        [{ val: "normal", label: TE.t("speedNormal") }, { val: "slow", label: TE.t("speedSlow") }],
        function () { return C.get("speed"); }, function (v) { C.set("speed", v); })),

      field("setMotion", seg(
        [{ val: "full", label: TE.t("motionFull") }, { val: "calm", label: TE.t("motionCalm") }],
        function () { return C.get("motion"); }, function (v) { C.set("motion", v); })),

      field("setCelebrate", seg(
        [{ val: true, label: TE.t("onWord") }, { val: false, label: TE.t("offWord") }],
        function () { return C.get("celebrate"); }, function (v) { C.set("celebrate", v); })),

      el("div", { style: { textAlign: "center", marginTop: "22px" } }, [
        el("button", {
          class: "mode-btn",
          onclick: function () { TE.audio.pop(); C.reset(); TE.router.renderRoute(); }
        }, [el("span", { text: TE.t("resetDefaults") })])
      ]),
      el("p", { class: "src", style: { marginTop: "16px", color: "#8a86a0" }, text: TE.t("settingsNote") })
    ]);

    host.appendChild(doc);
  }
};
