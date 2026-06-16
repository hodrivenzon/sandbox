/* Tiny Explorers — language (i18n) layer.
   A tiny two-language switch: English ("en") and Hebrew ("he"). The choice is
   a *parent* setting (picked on the start screen or via the 🌐 button),
   persisted in localStorage and applied to <html lang/dir> so Hebrew renders
   right-to-left.

   Two kinds of strings:
     1. Learning CONTENT (colors, animals, the aleph-bet…) lives in data.js with
        per-language fields and is read via TE.tx(item).
     2. UI / spoken PHRASES live here in STR and are read via TE.t(key, ...args).

   Content words carry niqqud (vowel points) so the spelling teaches correct
   pronunciation; TE.audio strips niqqud before speaking because TTS engines
   handle vowel points inconsistently. */
window.TE = window.TE || {};

TE.i18n = (function () {
  var KEY = "te-lang";
  var SUPPORTED = ["en", "he"];

  /* BCP-47 codes handed to the speech engine. */
  var LOCALE = { en: "en-US", he: "he-IL" };

  function detectDefault() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.indexOf("he") === 0 ? "he" : "en";
  }

  var lang = detectDefault();
  var onChange = null;

  /* UI + spoken phrases. A value may be a string or a function (interpolation).
     Content words use niqqud; full UI sentences are plain (TTS-friendly). */
  var STR = {
    en: {
      appName: "Tiny Explorers",
      tagline: "Learning fun for ages 2–3",
      start: "▶︎ Tap to Start",
      chooseLang: "Choose a language",
      forGrownups: "👋 For Grown-Ups",
      welcome: "Welcome to Tiny Explorers! Tap a picture to play.",
      homeTap: "Tap a picture to play!",
      tapToPlay: "Tap to play! 👆",
      findGame: "Find It Game",
      freePlay: "Free Play",
      findQ: function (n) { return "Can you find the " + n + "?"; },
      thatsX: function (a, b) { return "That's " + a + ". Find the " + b + "!"; },
      tryAgainFind: function (n) { return "Try again! Find the " + n + "."; },
      findShort: function (n) { return "Find the " + n + "!"; },
      soundOn: "Turn sound on",
      soundOff: "Turn sound off",
      language: "Language",

      introColors: "Let's learn colors! Tap a color.",
      introShapes: "Let's learn shapes! Tap a shape.",
      introAnimals: "Let's meet the animals! Tap an animal.",
      introBody: "Let's learn body parts! Tap a picture.",

      tapToCount: "Tap to count!",
      countPrompt: function (n) { return n + "! Tap to count " + n + "."; },
      countThings: function (n) { return n + (n === 1 ? " thing!" : " things!"); },

      letterWord: function (glyph, word) { return glyph + " is for " + word; },
      letterSpeak: function (label, word) { return label + ". " + label + " is for " + word + "."; },
      endingForm: "Ending form",

      whichSame: "Which one is the same?",
      whichSameFind: function (n) { return "Which one is the same? Find the " + n + "!"; },

      musicBanner: "Tap to make music! 🎵",
      musicIntro: "Tap the colors to make music!",
      playSong: "🎶 Play a Song",
      songName: "Mary had a little lamb!",

      drawBanner: "Pick a sticker, then tap! ✨",
      drawIntro: "Pick a sticker, then tap to draw!",
      allClean: "All clean!",

      noVoice: "No English voice is installed, so narration is off. You can add one in your device's speech settings.",

      gateTitle: "👋 For Grown-Ups",
      gateBody: "This area is for parents and caregivers. Please solve to continue:",
      gateContinue: "Continue",
      gateBack: "Back",
      gateErr: "Not quite — try again.",

      title_colors: "Colors",
      title_shapes: "Shapes",
      title_numbers: "Numbers",
      title_animals: "Animals",
      title_letters: "Letters",
      title_music: "Music",
      title_match: "Matching",
      title_body: "My Body",
      title_draw: "Draw",
      title_parents: "For Grown-Ups",
      title_settings: "Settings",
      title_weather: "Weather",
      title_bubbles: "Bubbles",
      title_peekaboo: "Peekaboo",
      title_sound: "Animal Sounds",

      /* settings screen */
      settingsBtn: "⚙️ Settings",
      settingsTitle: "Settings",
      settingsIntro: "Tune each game to your child. Changes are saved and take effect the next time you open a game.",
      setLevel: "Difficulty level",
      levelEasy: "Easy", levelMedium: "Medium", levelHard: "Hard",
      optAuto: "Auto",
      setChoices: "Number of choices",
      setCountMax: "Count up to",
      setBubbles: "Bubbles",
      setDoors: "Peekaboo doors",
      setSpeed: "Narration speed", speedSlow: "Slow", speedNormal: "Normal",
      setMotion: "Motion & effects", motionFull: "Full", motionCalm: "Calm",
      setCelebrate: "Celebrations", onWord: "On", offWord: "Off",
      resetDefaults: "Reset to defaults",
      settingsNote: "“Auto” follows the difficulty level. Each game also adapts to this level.",

      /* dynamic activities */
      introWeather: "Let's learn the weather! Tap a picture.",
      bubblesBanner: "Pop the bubbles! 🫧",
      bubblesIntro: "Pop the bubbles!",
      peekabooBanner: "Who is hiding? Tap to peek! 🙈",
      peekabooIntro: "Tap a door to see who is hiding!",
      peekabooReveal: function (n) { return "Peekaboo! " + n + "!"; },
      soundBanner: "Who said that? 🔊",
      soundIntro: "Listen! Who made that sound?",
      soundReplay: "🔊 Hear it again",

      cheers: ["Yay!", "Great job!", "You did it!", "Wonderful!", "Hooray!", "Well done!", "Awesome!"]
    },

    he: {
      appName: "מְגַלִּים קְטַנִּים",
      tagline: "כיף ללמוד בגיל 2–3",
      start: "▶︎ התחלה",
      chooseLang: "בחרו שפה",
      forGrownups: "👋 להורים",
      welcome: "ברוכים הבאים! געו בתמונה כדי לשחק.",
      homeTap: "געו בתמונה כדי לשחק!",
      tapToPlay: "געו כדי לשחק! 👆",
      findGame: "משחק מציאה",
      freePlay: "משחק חופשי",
      findQ: function (n) { return "איפה ה" + n + "?"; },
      thatsX: function (a, b) { return "זה ה" + a + ". מצאו את ה" + b + "!"; },
      tryAgainFind: function (n) { return "נסו שוב! מצאו את ה" + n + "."; },
      findShort: function (n) { return "מצאו את ה" + n + "!"; },
      soundOn: "הפעלת קול",
      soundOff: "כיבוי קול",
      language: "שפה",

      introColors: "בואו נלמד צבעים! געו בצבע.",
      introShapes: "בואו נלמד צורות! געו בצורה.",
      introAnimals: "בואו נכיר חיות! געו בחיה.",
      introBody: "בואו נלמד חלקי גוף! געו בתמונה.",

      tapToCount: "געו כדי לספור!",
      countPrompt: function (n) { return n + "! געו כדי לספור עד " + n + "."; },
      countThings: function (n, w) { return (w || n) + "!"; },

      letterWord: function (glyph, word) { return glyph + " כמו " + word; },
      letterSpeak: function (label, word) { return label + ". " + label + " כמו " + word + "."; },
      endingForm: "אות סופית",

      whichSame: "מי אותו הדבר?",
      whichSameFind: function (n) { return "מי אותו הדבר? מצאו את ה" + n + "!"; },

      musicBanner: "געו כדי ליצור מוזיקה! 🎵",
      musicIntro: "געו בצבעים כדי ליצור מוזיקה!",
      playSong: "🎶 נגנו שיר",
      songName: "איזה שיר יפה!",

      drawBanner: "בחרו מדבקה ואז געו! ✨",
      drawIntro: "בחרו מדבקה ואז געו כדי לצייר!",
      allClean: "הכול נקי!",

      noVoice: "לא מותקן קול בעברית, ולכן ההקראה כבויה. אפשר להוסיף קול עברי בהגדרות הדיבור של המכשיר.",

      gateTitle: "👋 להורים",
      gateBody: "האזור הזה מיועד להורים ולמטפלים. פתרו כדי להמשיך:",
      gateContinue: "המשך",
      gateBack: "חזרה",
      gateErr: "לא מדויק — נסו שוב.",

      title_colors: "צבעים",
      title_shapes: "צורות",
      title_numbers: "מספרים",
      title_animals: "חיות",
      title_letters: "אותיות",
      title_music: "מוזיקה",
      title_match: "התאמה",
      title_body: "הגוף שלי",
      title_draw: "ציור",
      title_parents: "להורים",
      title_settings: "הגדרות",
      title_weather: "מזג אוויר",
      title_bubbles: "בועות",
      title_peekaboo: "קוקו",
      title_sound: "קולות של חיות",

      /* settings screen */
      settingsBtn: "⚙️ הגדרות",
      settingsTitle: "הגדרות",
      settingsIntro: "התאימו כל משחק לילד/ה. השינויים נשמרים וייכנסו לתוקף בפעם הבאה שתפתחו משחק.",
      setLevel: "רמת קושי",
      levelEasy: "קל", levelMedium: "בינוני", levelHard: "מאתגר",
      optAuto: "אוטומטי",
      setChoices: "מספר אפשרויות",
      setCountMax: "לספור עד",
      setBubbles: "בועות",
      setDoors: "דלתות קוקו",
      setSpeed: "מהירות הקראה", speedSlow: "איטית", speedNormal: "רגילה",
      setMotion: "תנועה ואפקטים", motionFull: "מלא", motionCalm: "רגוע",
      setCelebrate: "חגיגות", onWord: "פעיל", offWord: "כבוי",
      resetDefaults: "איפוס לברירת מחדל",
      settingsNote: "“אוטומטי” עוקב אחרי רמת הקושי. כל משחק מותאם גם הוא לרמה הזו.",

      /* dynamic activities */
      introWeather: "בואו נלמד על מזג האוויר! געו בתמונה.",
      bubblesBanner: "פוצצו את הבועות! 🫧",
      bubblesIntro: "פוצצו את הבועות!",
      peekabooBanner: "מי מתחבא? געו כדי להציץ! 🙈",
      peekabooIntro: "געו בדלת כדי לראות מי מתחבא!",
      peekabooReveal: function (n) { return "קוקו! " + n + "!"; },
      soundBanner: "מי אמר את זה? 🔊",
      soundIntro: "הקשיבו! מי השמיע את הקול?",
      soundReplay: "🔊 לשמוע שוב",

      cheers: ["יפה מאוד!", "כל הכבוד!", "הצלחתם!", "מצוין!", "איזה יופי!", "וואו!", "נהדר!"]
    }
  };

  /* Remove Hebrew niqqud / cantillation so TTS reads the bare word.
     (Harmless for non-Hebrew text — there are no such marks there.) */
  function strip(s) {
    return String(s).replace(/[ְ-ׇֽֿׁׂׅׄ]/g, "");
  }

  function t(key) {
    var tbl = STR[lang] || STR.en;
    var v = tbl[key];
    if (v == null) v = STR.en[key];
    if (typeof v === "function") return v.apply(null, [].slice.call(arguments, 1));
    return v == null ? key : v;
  }

  /* Localized display text for a content item: item[lang] → item.en → item.name. */
  function tx(item) {
    if (!item) return "";
    if (item[lang] != null) return item[lang];
    if (item.en != null) return item.en;
    return item.name != null ? item.name : "";
  }

  function locale(code) { return LOCALE[code || lang] || "en-US"; }
  function cheers() { return (STR[lang] && STR[lang].cheers) || STR.en.cheers; }
  function get() { return lang; }
  function supported() { return SUPPORTED.slice(); }
  function onLangChange(cb) { onChange = cb; }

  /* Push the current language into the document: <html lang/dir>, body[data-lang]
     and every element tagged with data-i18n="key". */
  function apply() {
    var doc = document.documentElement;
    doc.setAttribute("lang", lang);
    doc.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
    if (document.body) document.body.setAttribute("data-lang", lang);
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
  }

  function set(l) {
    if (SUPPORTED.indexOf(l) === -1) return;
    if (l === lang) { apply(); return; }
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    apply();
    if (onChange) onChange(l);
  }

  apply();

  /* convenience shortcuts on TE */
  TE.t = t;
  TE.tx = tx;
  TE.lang = get;
  TE.setLang = set;

  return {
    t: t, tx: tx, get: get, set: set, setLang: set,
    locale: locale, strip: strip, cheers: cheers,
    supported: supported, onLangChange: onLangChange, apply: apply
  };
})();
