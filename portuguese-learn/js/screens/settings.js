/* Falar — Settings. Daily goal, default flashcard direction, speech speed, theme
   override, and progress backup (export / import / reset). All persisted via
   PT.store; theme changes apply immediately. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function segmented(options, current, onSelect) {
    var seg = el("div", { class: "segmented", role: "group" });
    options.forEach(function (o) {
      var b = el("button", {
        class: "seg-btn" + (o.value === current ? " active" : ""),
        aria: { pressed: o.value === current ? "true" : "false" },
        onclick: function () {
          PT.audio.pop();
          Array.prototype.forEach.call(seg.children, function (c) { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
          b.classList.add("active"); b.setAttribute("aria-pressed", "true");
          onSelect(o.value);
        }
      }, [o.label]);
      seg.appendChild(b);
    });
    return seg;
  }

  function row(label, control, sub) {
    return el("div", { class: "set-row" }, [
      el("div", { class: "set-label" }, [el("div", { text: label }), sub ? el("div", { class: "set-sub", text: sub }) : null]),
      control
    ]);
  }

  function render(host) {
    PT.dom.clear(host);
    var s = PT.store.settings;
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "Settings" }));

    /* --- Practice --- */
    wrap.appendChild(C.sectionTitle("Practice"));
    var goalVal = el("span", { class: "stepper-val", text: String(PT.store.daily.goal) });
    var stepper = el("div", { class: "stepper" }, [
      el("button", { class: "step-btn", aria: { label: "Decrease goal" }, onclick: function () { bumpGoal(-5); } }, ["−"]),
      goalVal,
      el("button", { class: "step-btn", aria: { label: "Increase goal" }, onclick: function () { bumpGoal(5); } }, ["+"])
    ]);
    function bumpGoal(d) { PT.audio.pop(); PT.store.setGoal(PT.store.daily.goal + d); goalVal.textContent = String(PT.store.daily.goal); }

    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Daily review goal", stepper, "cards per day"),
      row("Default card side", segmented([{ label: "PT → EN", value: "pt-en" }, { label: "EN → PT", value: "en-pt" }], s.dir || "pt-en", function (v) { PT.store.setSetting("dir", v); }), "which side shows first")
    ]));

    /* --- Audio --- */
    wrap.appendChild(C.sectionTitle("Audio"));
    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Speech speed",
        segmented([{ label: "Slow", value: 0.75 }, { label: "Normal", value: 0.9 }, { label: "Native", value: 1 }], s.ttsRate || 0.9, function (v) { PT.store.setSetting("ttsRate", v); PT.audio.speak("Bom dia! Tudo bem?"); }),
        "used for all spoken Portuguese"),
      row("Test voice", el("button", { class: "btn btn-soft small", onclick: function () { PT.audio.speak("Olá! Eu falo português."); } }, ["🔊 Play sample"]))
    ]));

    /* --- Appearance --- */
    wrap.appendChild(C.sectionTitle("Appearance"));
    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Theme", segmented([{ label: "Auto", value: "auto" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }], s.theme || "auto", function (v) { PT.store.setSetting("theme", v); PT.applyTheme(); }), "auto follows your device")
    ]));

    /* --- Data --- */
    wrap.appendChild(C.sectionTitle("Your data"));
    var importStatus = el("div", { class: "set-status" });
    var fileInput = el("input", { type: "file", accept: "application/json,.json", style: { display: "none" }, onchange: function (e) { importFile(e.target.files && e.target.files[0]); } });

    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Back up progress", el("button", { class: "btn btn-soft small", onclick: exportProgress }, ["⬇︎ Export"]), "download a .json backup"),
      row("Restore progress", el("button", { class: "btn btn-soft small", onclick: function () { fileInput.click(); } }, ["⬆︎ Import"]), "load a backup file"),
      fileInput, importStatus,
      row("Reset everything", el("button", { class: "btn btn-danger small", onclick: resetAll }, ["Reset"]), "clears all progress on this device")
    ]));

    function exportProgress() {
      PT.audio.pop();
      try {
        var blob = new Blob([PT.store.exportJSON()], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = el("a", { href: url, download: "falar-progress.json" });
        document.body.appendChild(a); a.click();
        setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 100);
      } catch (e) { importStatus.textContent = "Export failed."; }
    }
    function importFile(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var ok = PT.store.importJSON(String(reader.result));
        importStatus.className = "set-status " + (ok ? "ok" : "err");
        importStatus.textContent = ok ? "✓ Progress restored." : "✗ Couldn't read that file.";
        if (ok) { PT.applyTheme(); PT.audio.correct(); }
      };
      reader.onerror = function () { importStatus.className = "set-status err"; importStatus.textContent = "✗ Couldn't read that file."; };
      reader.readAsText(file);
    }
    function resetAll() {
      if (!window.confirm("Reset all progress, streak and XP on this device? This can't be undone.")) return;
      PT.store.reset(); PT.applyTheme(); PT.audio.pop();
      render(host);
    }

    host.appendChild(wrap);
  }

  PT.screens.settings = { title: "Settings", tab: "home", render: render };
})();
