/* Falar — AI tutor client for the Claude Messages API.
   This is a buildless static site (no bundler), so we call the API over raw
   fetch rather than the SDK, streaming Server-Sent Events. The learner brings
   their own Anthropic API key (stored locally) — we never ship a key. Browser
   access needs the anthropic-dangerous-direct-browser-access header. */
window.PT = window.PT || {};

PT.tutor = (function () {
  var ENDPOINT = "https://api.anthropic.com/v1/messages";
  var VERSION = "2023-06-01";

  function dialectLabel(d) { return d === "pt-PT" ? "European Portuguese (Portugal, pt-PT)" : "Brazilian Portuguese (pt-BR)"; }

  /* Build the tutor system prompt from the learner's session choices. */
  function systemPrompt(opts) {
    var d = dialectLabel(opts.dialect);
    return [
      "You are an expert, patient, encouraging Portuguese language tutor for an English-speaking learner who is living abroad and wants practical, conversational fluency. Your teaching style is immersive and supportive — emphasize real conversation over grammar lectures.",
      "",
      "DIALECT: Teach and speak ONLY " + d + ". Use its vocabulary, spelling and grammar consistently.",
      "LEVEL: The learner is around CEFR " + (opts.level || "B1") + ". Calibrate vocabulary and complexity to that level — stretch them a little, but stay understandable.",
      "",
      "LANGUAGE RULES (important):",
      "- Conduct the actual conversation ONLY in Portuguese.",
      "- Use English EXCLUSIVELY for corrections, translations, and grammar explanations.",
      "- Keep each reply fairly short so it stays a real back-and-forth — a sentence or two of Portuguese conversation, plus any correction.",
      "",
      "CORRECTION PROTOCOL: After the learner writes, gently correct EVERY mistake (grammar, gender, conjugation, syntax, vocabulary, spelling). Put corrections in English, briefly, like: \"Small fix: ‘Eu falo inglês’ — the verb falar in the eu form is falo.\" If the message was perfect, say so briefly and move on. Then continue the conversation in Portuguese.",
      "",
      "HELP PROTOCOL: If the learner asks for a translation or for help, switch to English, break the sentence into small parts, translate each part, then give the full meaning.",
      "",
      "LESSON STRUCTURE — run this session as: " + opts.structureTitle + ". " + opts.structureDesc,
      "TOPIC: Center the conversation on “" + opts.topic + "”.",
      "",
      "GUARDRAILS: Only handle Portuguese and English. If the learner writes in another language (e.g. Hebrew, Spanish, French), gently remind them in English to use Portuguese (or English for questions) and continue — do not translate the other language.",
      "",
      "STRUGGLE LOG: Silently keep track of the new or difficult Portuguese words and the corrections from this session. When the learner asks to end or review the session, you will be prompted to summarize and to output a JSON list of those words.",
      "",
      "OUTPUT STYLE: Reply directly as the tutor. Do NOT include meta-commentary, planning, or your own reasoning — just your tutor response. Do not use headers or bullet lists; keep it conversational.",
      "",
      "Begin now: greet the learner warmly in " + d + " and immediately start the “" + opts.structureTitle + "” activity about “" + opts.topic + "”. Keep this first message short and end with a question that invites them to respond in Portuguese."
    ].join("\n");
  }

  /* The user turn that asks the tutor to wrap up + emit the struggle-log JSON. */
  function reviewRequest() {
    return "Let's end the session for now. Please respond in English with: (1) a short, encouraging summary of what we practiced and the main corrections; then (2) a JSON object mapping each new or difficult Portuguese word/phrase from this session to its English meaning, inside a ```json code block (e.g. {\"ansioso\": \"anxious/eager\", \"cozinhar\": \"to cook\"}). Include 5-15 of the most useful items.";
  }

  /* Extract the {word: meaning} struggle log from a review reply. Tolerant of a
     ```json fence, a bare object, a bare array of {pt,en}, and trailing prose. */
  function parseWordList(text) {
    if (!text) return null;
    var candidates = [];
    var fence = text.match(/```json\s*([\s\S]*?)```/i);
    if (fence) candidates.push(fence[1]);
    var obj = firstBalanced(text, "{", "}"); if (obj) candidates.push(obj);
    var arr = firstBalanced(text, "[", "]"); if (arr) candidates.push(arr);
    for (var i = 0; i < candidates.length; i++) {
      try { var map = toMap(JSON.parse(candidates[i])); if (map && Object.keys(map).length) return map; }
      catch (e) {}
    }
    return null;
  }
  function firstBalanced(text, open, close) {
    var start = text.indexOf(open);
    if (start === -1) return null;
    var depth = 0;
    for (var i = start; i < text.length; i++) {
      if (text[i] === open) depth++;
      else if (text[i] === close && --depth === 0) return text.slice(start, i + 1);
    }
    return null;
  }
  function toMap(v) {
    if (!v) return null;
    if (Array.isArray(v)) {
      var m = {};
      v.forEach(function (o) {
        if (o && typeof o === "object") {
          var pt = o.pt || o.word || o.portuguese || o.term, en = o.en || o.meaning || o.english || o.translation;
          if (pt && en) m[String(pt)] = String(en);
        }
      });
      return Object.keys(m).length ? m : null;
    }
    return (typeof v === "object") ? v : null;
  }

  /* Stream a tutor reply. messages = [{role, content}]. onText(delta) is called
     as text arrives. Resolves with the full reply text. Rejects on error. */
  /* Merge consecutive same-role turns and ensure the history starts with a user
     turn, so a retry after an error (which can leave two user turns in a row)
     always sends a clean, well-formed conversation. */
  function normalize(messages) {
    var out = [];
    messages.forEach(function (m) {
      var last = out[out.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + m.content;
      else out.push({ role: m.role, content: m.content });
    });
    while (out.length && out[0].role !== "user") out.shift();
    return out;
  }

  function stream(messages, system, onText, signal) {
    var s = PT.store.settings;
    if (!s.apiKey) return Promise.reject(new Error("no-key"));
    var body = {
      model: s.model || "claude-opus-4-8",
      max_tokens: 1200,
      system: system,
      messages: normalize(messages),
      stream: true
    };
    return fetch(ENDPOINT, {
      method: "POST",
      signal: signal,
      headers: {
        "x-api-key": s.apiKey,
        "anthropic-version": VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var msg = friendlyError(res.status, t);
          throw new Error(msg);
        });
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = "", full = "";
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return full;
          buf += decoder.decode(r.value, { stream: true });
          var parts = buf.split("\n");
          buf = parts.pop();
          for (var li = 0; li < parts.length; li++) {
            var line = parts[li].trim();
            if (line.indexOf("data:") !== 0) continue;
            var data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            var ev;
            try { ev = JSON.parse(data); } catch (e) { continue; } // genuine keepalive / partial line
            // error handling lives OUTSIDE the parse try, so a real mid-stream
            // error event rejects the stream instead of being swallowed.
            if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") {
              full += ev.delta.text; if (onText) onText(ev.delta.text);
            } else if (ev.type === "error" && ev.error) {
              throw new Error(ev.error.message || "The model stream errored.");
            }
          }
          return pump();
        });
      }
      return pump();
    });
  }

  function friendlyError(status, text) {
    if (status === 401) return "Your API key was rejected (401). Check it in Settings.";
    if (status === 403) return "That key doesn't have access (403). Check your Anthropic plan/model access.";
    if (status === 429) return "Rate limited (429). Wait a moment and try again.";
    if (status === 400) return "The request was rejected (400). " + shortDetail(text);
    if (status >= 500) return "Anthropic had a server error (" + status + "). Try again shortly.";
    return "Request failed (" + status + "). " + shortDetail(text);
  }
  function shortDetail(text) {
    var msg = "";
    try { var o = JSON.parse(text); msg = (o.error && o.error.message) ? o.error.message : ""; } catch (e) { msg = ""; }
    return msg.length > 200 ? msg.slice(0, 200) + "…" : msg;
  }

  return {
    systemPrompt: systemPrompt,
    reviewRequest: reviewRequest,
    parseWordList: parseWordList,
    stream: stream,
    dialectLabel: dialectLabel
  };
})();
