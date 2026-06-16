/* Falar — AI Tutor. A live conversation tutor powered by Claude: the learner
   picks a dialect, level, lesson structure and topic, then chats in Portuguese
   with English corrections (immersion style). Ending a session produces a
   review + a list of difficult words that can be saved into the SRS deck.
   Requires the learner's own Anthropic API key (set in Settings). */
(function () {
  var el = PT.dom.el, C = PT.components;

  // session state persists while navigating within the app
  var session = null;          // { messages, system, opts, busy }
  var abort = null;            // AbortController for the in-flight stream
  var mounted = false;         // is the tutor screen currently on-screen?

  var STRUCTURES = [
    { key: "roleplay", title: "Role-Play", emoji: "🎭", desc: "Simulate a real-world scenario (restaurant, hotel, market). Play the other roles and keep it natural and practical." },
    { key: "deepdive", title: "Topic Deep Dive", emoji: "🧠", desc: "Discuss the topic in depth, challenge the learner's opinions, and introduce richer, more advanced vocabulary." },
    { key: "shadow", title: "Shadowing", emoji: "🗣️", desc: "Say a slightly complex Portuguese sentence; ask the learner to repeat it and explain what it means. Focus on comprehension." },
    { key: "grammar", title: "Grammar in Context", emoji: "📐", desc: "Focus on one grammar point (e.g. pretérito perfeito vs. imperfeito) and use it naturally throughout the conversation." },
    { key: "story", title: "Cultural Storyteller", emoji: "📖", desc: "Tell a short story or describe a cultural/historical event in simple Portuguese; invite the learner to ask questions or summarize." },
    { key: "flashcards", title: "Flashcard Chat", emoji: "🃏", desc: "Introduce five useful new words up front, then steer the conversation so the learner uses each of them naturally." },
    { key: "translate", title: "Translator Challenge", emoji: "🔁", desc: "Give the learner a short English sentence to translate into Portuguese, then correct their structure and word choice." },
    { key: "daily", title: "Daily Life Reporter", emoji: "📅", desc: "Ask everyday questions (what they did today, plans for tomorrow) and encourage unscripted speaking." },
    { key: "conditional", title: "What-If Questions", emoji: "🔮", desc: "Ask hypothetical ‘what if…’ questions to practice the conditional and subjunctive." },
    { key: "pronunciation", title: "Pronunciation Focus", emoji: "👂", desc: "Offer challenging words/phrases (nasal vowels, the ‘rr’ sound) and give feedback on pronunciation and rhythm." }
  ];
  var TOPICS = ["Daily routines", "Food & cooking", "Travel", "Family", "Work", "Technology", "Music", "Sports", "Film & TV", "News", "History", "Health", "Environment", "Education"];

  function render(host) {
    mounted = true;
    PT.dom.clear(host);
    if (!PT.store.settings.apiKey) return setup(host);
    if (!session) return kickoff(host);
    chat(host);
  }

  /* ---------- setup (no key yet) ---------- */
  function setup(host) {
    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "AI Tutor 🗣️" }));
    wrap.appendChild(el("div", { class: "card tutor-setup" }, [
      el("div", { class: "tutor-setup-emoji", text: "🔑" }),
      el("h2", { text: "Connect your Anthropic key" }),
      el("p", { text: "The tutor chats with you in Portuguese and corrects your mistakes in English, powered by Claude. It uses your own Anthropic API key, stored only in this browser — it never leaves your device except to call Anthropic directly." }),
      el("a", { class: "btn btn-primary", href: "#/settings", onclick: function () { PT.audio.pop(); } }, ["Add your key in Settings"]),
      el("p", { class: "tutor-setup-note" }, [
        "Don't have one? Create a key at ",
        el("a", { class: "link", href: "https://console.anthropic.com/settings/keys", target: "_blank", rel: "noopener noreferrer", text: "console.anthropic.com" }),
        ". Tip: set a low spend limit on the key."
      ])
    ]));
    host.appendChild(wrap);
  }

  /* ---------- kickoff (choose dialect / level / structure / topic) ---------- */
  function kickoff(host) {
    var s = PT.store.settings;
    var choice = { dialect: s.dialect || "pt-BR", level: s.level || "B1", structure: STRUCTURES[0].key, topic: TOPICS[0] };

    var wrap = el("div", { class: "screen-pad" });
    wrap.appendChild(el("h1", { class: "page-title", text: "AI Tutor 🗣️" }));
    wrap.appendChild(el("p", { class: "page-sub", text: "Set up a conversation session. The tutor speaks Portuguese and corrects you in English." }));

    function seg(label, options, current, onPick) {
      var box = el("div", { class: "segmented wrap", role: "radiogroup", aria: { label: label } });
      options.forEach(function (o) {
        var b = el("button", { class: "seg-btn" + (o.value === current() ? " active" : ""), role: "radio", aria: { checked: o.value === current() ? "true" : "false" },
          onclick: function () {
            PT.audio.pop();
            Array.prototype.forEach.call(box.children, function (c) { c.classList.remove("active"); c.setAttribute("aria-checked", "false"); });
            b.classList.add("active"); b.setAttribute("aria-checked", "true"); onPick(o.value);
          } }, [o.label]);
        box.appendChild(b);
      });
      return el("div", { class: "kick-block" }, [el("div", { class: "kick-label", text: label }), box]);
    }

    wrap.appendChild(seg("Dialect", [{ label: "🇧🇷 Brazil", value: "pt-BR" }, { label: "🇵🇹 Portugal", value: "pt-PT" }], function () { return choice.dialect; }, function (v) { choice.dialect = v; PT.store.setSetting("dialect", v); if (PT.audio.repickVoice) PT.audio.repickVoice(); }));
    wrap.appendChild(seg("Level", ["A2", "B1", "B2", "C1"].map(function (l) { return { label: l, value: l }; }), function () { return choice.level; }, function (v) { choice.level = v; PT.store.setSetting("level", v); }));

    // structure grid
    var sg = el("div", { class: "tutor-structures" });
    STRUCTURES.forEach(function (st) {
      var b = el("button", { class: "struct-card" + (st.key === choice.structure ? " active" : ""), onclick: function () {
        PT.audio.pop(); choice.structure = st.key;
        Array.prototype.forEach.call(sg.children, function (c) { c.classList.remove("active"); });
        b.classList.add("active");
      } }, [el("span", { class: "struct-emoji", text: st.emoji }), el("span", { class: "struct-title", text: st.title })]);
      sg.appendChild(b);
    });
    wrap.appendChild(el("div", { class: "kick-block" }, [el("div", { class: "kick-label", text: "Lesson type" }), sg]));

    // topic chips
    var tg = el("div", { class: "topic-chips" });
    TOPICS.forEach(function (t) {
      var b = el("button", { class: "topic-chip" + (t === choice.topic ? " active" : ""), onclick: function () {
        PT.audio.pop(); choice.topic = t;
        Array.prototype.forEach.call(tg.children, function (c) { c.classList.remove("active"); });
        b.classList.add("active");
      } }, [t]);
      tg.appendChild(b);
    });
    wrap.appendChild(el("div", { class: "kick-block" }, [el("div", { class: "kick-label", text: "Topic" }), tg]));

    wrap.appendChild(el("button", { class: "btn btn-primary btn-block", onclick: function () { start(host, choice); } }, [
      el("span", { class: "btn-ic", text: "▶︎" }), el("span", { text: "Começar — start the session" })
    ]));

    host.appendChild(wrap);
  }

  function start(host, choice) {
    PT.audio.pop();
    var st = STRUCTURES.filter(function (x) { return x.key === choice.structure; })[0] || STRUCTURES[0];
    var opts = { dialect: choice.dialect, level: choice.level, topic: choice.topic, structureTitle: st.title, structureDesc: st.desc };
    session = {
      opts: opts,
      system: PT.tutor.systemPrompt(opts),
      // seed with a natural learner greeting so the tutor opens the conversation
      messages: [{ role: "user", content: "Olá! Vamos começar." }],
      busy: false,
      review: null
    };
    render(host);
    sendToTutor(host, true);
  }

  /* ---------- chat ---------- */
  function chat(host) {
    var wrap = el("div", { class: "screen-pad tutor-chat" });
    host.appendChild(wrap);

    // header / toolbar
    wrap.appendChild(el("div", { class: "tutor-bar" }, [
      el("div", { class: "tutor-bar-info" }, [
        el("span", { class: "tutor-flag", text: session.opts.dialect === "pt-PT" ? "🇵🇹" : "🇧🇷" }),
        el("span", { class: "tutor-bar-title", text: session.opts.structureTitle + " · " + session.opts.topic })
      ]),
      el("div", { class: "tutor-bar-actions" }, [
        el("button", { class: "mini-btn", onclick: function () { endSession(host); } }, ["End & review"]),
        el("button", { class: "mini-btn", onclick: function () { if (confirmNew()) { abortStream(); session = null; render(host); } } }, ["New"])
      ])
    ]));

    var thread = el("div", { class: "tutor-thread", id: "tutor-thread" });
    session.messages.forEach(function (m) { thread.appendChild(bubble(m.role, m.content)); });
    if (session.review) thread.appendChild(reviewPanel(host, session.review));
    wrap.appendChild(thread);

    // input bar
    var input = el("textarea", { class: "tutor-input", rows: "1", placeholder: "Escreva em português…", "aria-label": "Type your message in Portuguese", autocapitalize: "sentences" });
    var send = el("button", { class: "tutor-send", aria: { label: "Send" }, onclick: function () { submit(host, input); } }, ["➤"]);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(host, input); } });
    var bar = el("div", { class: "tutor-input-bar" }, [input, send]);
    if (session.busy) { input.setAttribute("disabled", ""); send.setAttribute("disabled", ""); }
    wrap.appendChild(bar);

    scrollThread();
    if (!session.busy) setTimeout(function () { try { input.focus(); } catch (e) {} }, 80);
  }

  function bubble(role, text, opts) {
    opts = opts || {};
    var side = role === "user" ? "me" : "tutor";
    var kids = [el("div", { class: "tutor-bubble-text", text: text })];
    if (role === "assistant" && !opts.noSpeak) {
      kids.push(el("button", { class: "speak-btn small", aria: { label: "Hear this" }, onclick: function (e) {
        e.stopPropagation(); PT.audio.pop(); PT.audio.speak(stripEnglishNotes(text), { rate: 0.92 });
      } }, ["🔊"]));
    }
    return el("div", { class: "tutor-msg " + side }, [el("div", { class: "tutor-bubble" }, kids)]);
  }

  // best-effort: drop trailing English correction notes when speaking the tutor's PT
  function stripEnglishNotes(t) {
    return String(t).split(/\n/).filter(function (line) { return !/^\s*(small fix|fix:|correction|note:|in english|tip:)/i.test(line); }).join(" ");
  }

  function submit(host, input) {
    if (session.busy) return;
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    session.messages.push({ role: "user", content: text });
    render(host);
    sendToTutor(host, false);
  }

  /* Send the current history to the tutor and stream the reply into a bubble. */
  function sendToTutor(host, isFirst) {
    session.busy = true;
    abort = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var thread = document.getElementById("tutor-thread");
    var typing = el("div", { class: "tutor-msg tutor" }, [el("div", { class: "tutor-bubble typing" }, [el("span", { class: "dot" }), el("span", { class: "dot" }), el("span", { class: "dot" })])]);
    if (thread) { thread.appendChild(typing); scrollThread(); }

    var acc = "";
    var liveBubble = null;
    PT.tutor.stream(session.messages, session.system, function (delta) {
      acc += delta;
      if (!liveBubble && thread) {
        if (typing.parentNode) typing.remove();
        liveBubble = bubble("assistant", "", { noSpeak: true });
        thread.appendChild(liveBubble);
      }
      if (liveBubble) { liveBubble.querySelector(".tutor-bubble-text").textContent = acc; scrollThread(); }
    }, abort ? abort.signal : undefined).then(function (full) {
      session.messages.push({ role: "assistant", content: full });
      session.busy = false; abort = null;
      if (mounted) render(host);
    }).catch(function (err) {
      session.busy = false; abort = null;
      if (err && err.name === "AbortError") return; // user navigated/reset
      if (!mounted) return;
      if (typing.parentNode) typing.remove();
      // roll back the unanswered user turn so they can retry
      if (!isFirst && session.messages.length && session.messages[session.messages.length - 1].role === "user") {
        // keep it; just show the error
      }
      if (thread) thread.appendChild(errorBubble(err && err.message));
      scrollThread();
    });
  }

  function errorBubble(msg) {
    return el("div", { class: "tutor-msg tutor" }, [el("div", { class: "tutor-bubble error" }, [
      el("div", { text: "⚠️ " + (msg || "Something went wrong.") }),
      el("div", { class: "tutor-err-hint", text: "If this is an API key issue, fix it in Settings (gear, top right)." })
    ])]);
  }

  /* ---------- end & review ---------- */
  function endSession(host) {
    if (session.busy) return;
    session.messages.push({ role: "user", content: PT.tutor.reviewRequest() });
    session.busy = true;
    render(host); // shows the review request as a (brief) user bubble
    var thread = document.getElementById("tutor-thread");
    var typing = el("div", { class: "tutor-msg tutor" }, [el("div", { class: "tutor-bubble typing" }, [el("span", { class: "dot" }), el("span", { class: "dot" }), el("span", { class: "dot" })])]);
    if (thread) { thread.appendChild(typing); scrollThread(); }
    abort = (typeof AbortController !== "undefined") ? new AbortController() : null;

    PT.tutor.stream(session.messages, session.system, null, abort ? abort.signal : undefined).then(function (full) {
      session.messages.push({ role: "assistant", content: full });
      var words = PT.tutor.parseWordList(full);
      var summary = full.replace(/```json[\s\S]*?```/i, "").trim();
      session.review = { summary: summary, words: words, saved: 0 };
      session.busy = false; abort = null;
      if (mounted) render(host);
    }).catch(function (err) {
      session.busy = false; abort = null;
      if (err && err.name === "AbortError") return;
      if (!mounted) return;
      if (thread) thread.appendChild(errorBubble(err && err.message));
      scrollThread();
    });
  }

  function reviewPanel(host, review) {
    var kids = [el("div", { class: "review-title", text: "📋 Session review" })];
    if (review.summary) kids.push(el("div", { class: "review-summary", text: review.summary }));
    var keys = review.words ? Object.keys(review.words) : [];
    if (keys.length) {
      var list = el("div", { class: "review-words" });
      keys.forEach(function (w) {
        list.appendChild(el("div", { class: "review-word" }, [
          el("span", { class: "rw-pt", lang: session.opts.dialect, text: w }),
          el("span", { class: "rw-en", text: review.words[w] })
        ]));
      });
      kids.push(list);
      if (review.saved) {
        kids.push(el("div", { class: "review-saved", text: "✓ Saved " + review.saved + " word" + (review.saved === 1 ? "" : "s") + " to your flashcards." }));
      } else {
        kids.push(el("button", { class: "btn btn-primary", onclick: function () {
          var n = PT.store.addCustomWords(review.words);
          review.saved = n || keys.length; PT.audio.correct(); render(host);
        } }, ["💾 Save " + keys.length + " words to flashcards"]));
      }
    }
    return el("div", { class: "card review-card" }, kids);
  }

  /* ---------- helpers ---------- */
  function scrollThread() {
    setTimeout(function () { var t = document.getElementById("tutor-thread"); if (t) window.scrollTo(0, document.body.scrollHeight); }, 30);
  }
  function abortStream() { if (abort) { try { abort.abort(); } catch (e) {} abort = null; } }
  function confirmNew() { return !session.messages || session.messages.length <= 1 || window.confirm("Start a new session? This conversation will be cleared."); }

  PT.screens.tutor = {
    title: "AI Tutor", tab: "tutor", render: render,
    // keep the conversation, but stop streaming into a screen that's gone
    onLeave: function () { mounted = false; abortStream(); }
  };
})();
