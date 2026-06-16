/* Falar — Settings. Daily goal, default flashcard direction, speech speed, theme
   override, and progress backup (export / import / reset). All persisted via
   PT.store; theme changes apply immediately. */
(function () {
  var el = PT.dom.el, C = PT.components;

  function segmented(options, current, onSelect, label) {
    // single-choice control -> a radiogroup so AT announces it as one of N
    var seg = el("div", { class: "segmented", role: "radiogroup", aria: label ? { label: label } : null });
    options.forEach(function (o) {
      var b = el("button", {
        class: "seg-btn" + (o.value === current ? " active" : ""),
        role: "radio",
        aria: { checked: o.value === current ? "true" : "false" },
        onclick: function () {
          PT.audio.pop();
          Array.prototype.forEach.call(seg.children, function (c) { c.classList.remove("active"); c.setAttribute("aria-checked", "false"); });
          b.classList.add("active"); b.setAttribute("aria-checked", "true");
          onSelect(o.value);
        }
      }, [o.label]);
      seg.appendChild(b);
    });
    return seg;
  }

  function opt(value, label, current) {
    return el("option", { value: value, selected: value === current ? "selected" : null }, [label]);
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
    var goalVal = el("span", { class: "stepper-val", role: "status", aria: { live: "polite" }, text: String(PT.store.daily.goal) });
    var minusBtn = el("button", { class: "step-btn", aria: { label: "Decrease daily goal" }, onclick: function () { bumpGoal(-5); } }, ["−"]);
    var plusBtn = el("button", { class: "step-btn", aria: { label: "Increase daily goal" }, onclick: function () { bumpGoal(5); } }, ["+"]);
    var stepper = el("div", { class: "stepper", role: "group", aria: { label: "Daily review goal, cards per day" } }, [minusBtn, goalVal, plusBtn]);
    function clampUi() { var g = PT.store.daily.goal; minusBtn.disabled = g <= 5; plusBtn.disabled = g >= 200; }
    function bumpGoal(d) {
      PT.audio.pop(); PT.store.setGoal(PT.store.daily.goal + d);
      goalVal.textContent = String(PT.store.daily.goal);
      if (PT.announce) PT.announce(PT.store.daily.goal + " cards per day");
      clampUi();
    }
    clampUi();

    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Daily review goal", stepper, "cards per day"),
      row("Default card side", segmented([{ label: "PT → EN", value: "pt-en" }, { label: "EN → PT", value: "en-pt" }], s.dir || "pt-en", function (v) { PT.store.setSetting("dir", v); }, "Default card side"), "which side shows first")
    ]));

    /* --- Audio --- */
    wrap.appendChild(C.sectionTitle("Audio"));
    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Speech speed",
        segmented([{ label: "Slow", value: 0.75 }, { label: "Normal", value: 0.9 }, { label: "Native", value: 1 }], s.ttsRate || 0.9, function (v) { PT.store.setSetting("ttsRate", v); PT.audio.speak("Bom dia! Tudo bem?"); }, "Speech speed"),
        "used for all spoken Portuguese"),
      row("Test voice", el("button", { class: "btn btn-soft small", onclick: function () { PT.audio.speak("Olá! Eu falo português."); } }, ["🔊 Play sample"]))
    ]));

    /* --- Appearance --- */
    wrap.appendChild(C.sectionTitle("Appearance"));
    wrap.appendChild(el("div", { class: "card set-card" }, [
      row("Theme", segmented([{ label: "Auto", value: "auto" }, { label: "Light", value: "light" }, { label: "Dark", value: "dark" }], s.theme || "auto", function (v) { PT.store.setSetting("theme", v); PT.applyTheme(); }, "Theme"), "auto follows your device")
    ]));

    /* --- AI Tutor --- */
    wrap.appendChild(C.sectionTitle("AI Tutor"));
    var keyInput = el("input", {
      class: "set-input", type: "password", value: s.apiKey || "",
      placeholder: "sk-ant-…", autocomplete: "off", autocapitalize: "none", spellcheck: "false",
      "aria-label": "Anthropic API key",
      oninput: function () { PT.store.setSetting("apiKey", keyInput.value.trim()); }
    });
    var showKey = el("button", { class: "mini-btn", type: "button", aria: { pressed: "false", label: "Show API key" }, onclick: function () {
      var reveal = keyInput.type === "password";
      keyInput.type = reveal ? "text" : "password";
      showKey.textContent = reveal ? "Hide" : "Show";
      showKey.setAttribute("aria-pressed", reveal ? "true" : "false");
      showKey.setAttribute("aria-label", reveal ? "Hide API key" : "Show API key");
    } }, ["Show"]);

    var modelSel = el("select", { class: "set-select", aria: { label: "Tutor model" },
      onchange: function () { PT.store.setSetting("model", modelSel.value); } },
      [
        opt("claude-opus-4-8", "Claude Opus 4.8 (best)", s.model),
        opt("claude-sonnet-4-6", "Claude Sonnet 4.6 (faster, cheaper)", s.model),
        opt("claude-haiku-4-5", "Claude Haiku 4.5 (cheapest)", s.model)
      ]);

    wrap.appendChild(el("div", { class: "card set-card" }, [
      el("div", { class: "set-row col" }, [
        el("div", { class: "set-label" }, [el("div", { text: "Anthropic API key" }), el("div", { class: "set-sub", text: "Stored only in this browser; sent only to Anthropic. Use a key with a low spend limit." })]),
        el("div", { class: "key-row" }, [keyInput, showKey])
      ]),
      row("Tutor model", modelSel, "Opus is best; switch down to save cost"),
      row("Your level", segmented([{ label: "A2", value: "A2" }, { label: "B1", value: "B1" }, { label: "B2", value: "B2" }, { label: "C1", value: "C1" }], s.level || "B1", function (v) { PT.store.setSetting("level", v); }, "Your level")),
      row("Dialect", segmented([{ label: "🇧🇷 Brazil", value: "pt-BR" }, { label: "🇵🇹 Portugal", value: "pt-PT" }], s.dialect || "pt-BR", function (v) { PT.store.setSetting("dialect", v); if (PT.audio.repickVoice) PT.audio.repickVoice(); }, "Dialect"), "used by the tutor and audio")
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
