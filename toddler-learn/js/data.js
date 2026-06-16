/* Tiny Explorers — content data (bilingual: English + Hebrew).
   All visuals are emoji / CSS so the site needs zero image assets and works
   fully offline. Each learnable item carries an English ("en") and a Hebrew
   ("he") label; Hebrew words use niqqud so the spelling teaches pronunciation
   (TE.audio strips the points before speaking). Read localized text via
   TE.tx(item).

   ⚠️ The Hebrew content (words, niqqud, gendered numbers, animal sounds) was
   authored for review by a native speaker — verify before shipping to children. */
window.TE = window.TE || {};

TE.data = {
  /* 10 core colors — primary colors first. Hebrew = masculine singular. */
  colors: [
    { en: "Red",    he: "אָדֹם",  hex: "#ff5d5d" },
    { en: "Blue",   he: "כָּחֹל",  hex: "#3db4ff" },
    { en: "Yellow", he: "צָהֹב",  hex: "#ffce3a" },
    { en: "Green",  he: "יָרֹק",  hex: "#4fc26a" },
    { en: "Orange", he: "כָּתֹם",  hex: "#ff9f43" },
    { en: "Purple", he: "סָגֹל",  hex: "#b06bff" },
    { en: "Pink",   he: "וָרֹד",  hex: "#ff7fb6" },
    { en: "Brown",  he: "חוּם",   hex: "#a9744f" },
    { en: "Black",  he: "שָׁחֹר",  hex: "#3a3a3a" },
    { en: "White",  he: "לָבָן",  hex: "#ffffff" }
  ],

  /* Basic shapes toddlers can name/sort by ~3 */
  shapes: [
    { en: "Circle",    he: "עִגּוּל",    type: "circle" },
    { en: "Square",    he: "רִבּוּעַ",   type: "square" },
    { en: "Triangle",  he: "מְשֻׁלָּשׁ",  type: "triangle" },
    { en: "Star",      he: "כּוֹכָב",    type: "star" },
    { en: "Heart",     he: "לֵב",       type: "heart" },
    { en: "Rectangle", he: "מַלְבֵּן",   type: "rectangle" }
  ],

  /* Familiar animals + the sound they make (in each language). */
  animals: [
    { en: "Dog",      he: "כֶּלֶב",       emoji: "🐶", saysEn: "Woof woof",   saysHe: "הַב הַב" },
    { en: "Cat",      he: "חָתוּל",       emoji: "🐱", saysEn: "Meow",        saysHe: "מְיָאוּ" },
    { en: "Cow",      he: "פָּרָה",        emoji: "🐮", saysEn: "Moo",         saysHe: "מוּ" },
    { en: "Duck",     he: "בַּרְוָז",      emoji: "🦆", saysEn: "Quack quack", saysHe: "גָּע גָּע" },
    { en: "Sheep",    he: "כִּבְשָׂה",     emoji: "🐑", saysEn: "Baa",         saysHe: "מֶה" },
    { en: "Pig",      he: "חֲזִיר",       emoji: "🐷", saysEn: "Oink oink",   saysHe: "אוֹינְק" },
    { en: "Horse",    he: "סוּס",         emoji: "🐴", saysEn: "Neigh",       saysHe: "אִיהָה" },
    { en: "Lion",     he: "אַרְיֵה",       emoji: "🦁", saysEn: "Roar",        saysHe: "רְאוֹר" },
    { en: "Frog",     he: "צְפַרְדֵּעַ",    emoji: "🐸", saysEn: "Ribbit",      saysHe: "קְוָוא קְוָוא" },
    { en: "Bee",      he: "דְּבוֹרָה",     emoji: "🐝", saysEn: "Buzz",        saysHe: "זְזזז" },
    { en: "Chicken",  he: "תַּרְנְגֹלֶת",   emoji: "🐔", saysEn: "Cluck cluck", saysHe: "קוֹ קוֹ" },
    { en: "Elephant", he: "פִּיל",         emoji: "🐘", saysEn: "Pawoo",       saysHe: "פְּרוּוּ" }
  ],

  /* English alphabet: A–Z, one simple concrete word + emoji each. */
  lettersEn: [
    { l: "A", word: "Apple",     emoji: "🍎" },
    { l: "B", word: "Ball",      emoji: "⚽" },
    { l: "C", word: "Cat",       emoji: "🐱" },
    { l: "D", word: "Dog",       emoji: "🐶" },
    { l: "E", word: "Egg",       emoji: "🥚" },
    { l: "F", word: "Fish",      emoji: "🐟" },
    { l: "G", word: "Grapes",    emoji: "🍇" },
    { l: "H", word: "Hat",       emoji: "🎩" },
    { l: "I", word: "Ice cream", emoji: "🍦" },
    { l: "J", word: "Juice",     emoji: "🧃" },
    { l: "K", word: "Kite",      emoji: "🪁" },
    { l: "L", word: "Lion",      emoji: "🦁" },
    { l: "M", word: "Moon",      emoji: "🌙" },
    { l: "N", word: "Nest",      emoji: "🪺" },
    { l: "O", word: "Orange",    emoji: "🍊" },
    { l: "P", word: "Pig",       emoji: "🐷" },
    { l: "Q", word: "Queen",     emoji: "👑" },
    { l: "R", word: "Rainbow",   emoji: "🌈" },
    { l: "S", word: "Sun",       emoji: "☀️" },
    { l: "T", word: "Tree",      emoji: "🌳" },
    { l: "U", word: "Umbrella",  emoji: "☂️" },
    { l: "V", word: "Van",       emoji: "🚐" },
    { l: "W", word: "Whale",     emoji: "🐳" },
    { l: "X", word: "Fox",       emoji: "🦊" },
    { l: "Y", word: "Yo-yo",     emoji: "🪀" },
    { l: "Z", word: "Zebra",     emoji: "🦓" }
  ],

  /* Hebrew aleph-bet: 22 base letters. Each has its letter name (with niqqud),
     a simple example word + emoji, and (for the 5 letters that have one) the
     final/sofit form shown as a gentle note. */
  lettersHe: [
    { l: "א", name: "אָלֶף",  word: "אַרְיֵה",   emoji: "🦁" },
    { l: "ב", name: "בֵּית",  word: "בַּיִת",    emoji: "🏠" },
    { l: "ג", name: "גִּימֶל", word: "גְּלִידָה", emoji: "🍦" },
    { l: "ד", name: "דָּלֶת",  word: "דָּג",     emoji: "🐟" },
    { l: "ה", name: "הֵא",   word: "הַר",      emoji: "⛰️" },
    { l: "ו", name: "וָו",   word: "וֶרֶד",     emoji: "🌹" },
    { l: "ז", name: "זַיִן",  word: "זֶבְּרָה",   emoji: "🦓" },
    { l: "ח", name: "חֵית",  word: "חָתוּל",    emoji: "🐱" },
    { l: "ט", name: "טֵית",  word: "טַוָּס",    emoji: "🦚" },
    { l: "י", name: "יוֹד",  word: "יָד",      emoji: "✋" },
    { l: "כ", name: "כַּף",   word: "כֶּלֶב",    emoji: "🐶", sofit: "ך" },
    { l: "ל", name: "לָמֶד",  word: "לֵב",      emoji: "❤️" },
    { l: "מ", name: "מֵם",   word: "מַיִם",     emoji: "💧", sofit: "ם" },
    { l: "נ", name: "נוּן",   word: "נֵר",      emoji: "🕯️", sofit: "ן" },
    { l: "ס", name: "סָמֶךְ",  word: "סוּס",     emoji: "🐴" },
    { l: "ע", name: "עַיִן",  word: "עֵץ",      emoji: "🌳" },
    { l: "פ", name: "פֵּא",   word: "פִּיל",     emoji: "🐘", sofit: "ף" },
    { l: "צ", name: "צָדִי",  word: "צִפּוֹר",   emoji: "🐦", sofit: "ץ" },
    { l: "ק", name: "קוֹף",  word: "קוֹף",     emoji: "🐒" },
    { l: "ר", name: "רֵישׁ",  word: "רַכֶּבֶת",  emoji: "🚂" },
    { l: "ש", name: "שִׁין",  word: "שֶׁמֶשׁ",   emoji: "☀️" },
    { l: "ת", name: "תָּו",   word: "תַּפּוּחַ",  emoji: "🍎" }
  ],

  /* The object shown for each count 1–10 (variety keeps it interesting) */
  numberObjects: ["🍎", "⭐", "🎈", "🍌", "🐠", "🌸", "🍓", "🧸", "🚗", "🍪"],
  /* Hebrew numbers use the feminine counting series (אַחַת, שְׁתַּיִם, …). */
  numberWords: {
    en: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    he: ["אַחַת", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ", "שֵׁשׁ", "שֶׁבַע", "שְׁמוֹנֶה", "תֵּשַׁע", "עֶשֶׂר"]
  },

  /* Body parts as recognizable cards (name them / find them) */
  body: [
    { en: "Eyes",  he: "עֵינַיִם", emoji: "👀" },
    { en: "Nose",  he: "אַף",     emoji: "👃" },
    { en: "Mouth", he: "פֶּה",     emoji: "👄" },
    { en: "Ears",  he: "אָזְנַיִם", emoji: "👂" },
    { en: "Hand",  he: "יָד",     emoji: "✋" },
    { en: "Foot",  he: "רֶגֶל",    emoji: "🦶" },
    { en: "Hair",  he: "שֵׂעָר",    emoji: "💇" },
    { en: "Tooth", he: "שֵׁן",     emoji: "🦷" }
  ],

  /* Everyday weather — recognizable and great for daily-routine talk */
  weather: [
    { en: "Sun",     he: "שֶׁמֶשׁ",  emoji: "☀️" },
    { en: "Cloud",   he: "עָנָן",   emoji: "☁️" },
    { en: "Rain",    he: "גֶּשֶׁם",  emoji: "🌧️" },
    { en: "Storm",   he: "סְעָרָה",  emoji: "⛈️" },
    { en: "Snow",    he: "שֶׁלֶג",   emoji: "❄️" },
    { en: "Rainbow", he: "קֶשֶׁת",   emoji: "🌈" },
    { en: "Wind",    he: "רוּחַ",    emoji: "💨" },
    { en: "Moon",    he: "יָרֵחַ",   emoji: "🌙" }
  ],

  /* Music pads — a C-major pentatonic scale, so every tap sounds nice
     (no "wrong" notes = no-fail, pure cause-and-effect joy) */
  music: [
    { note: "C", freq: 261.63, color: "#ff5d5d", emoji: "🥁" },
    { note: "D", freq: 293.66, color: "#ff9f43", emoji: "🎵" },
    { note: "E", freq: 329.63, color: "#ffce3a", emoji: "🎷" },
    { note: "G", freq: 392.00, color: "#4fc26a", emoji: "🎺" },
    { note: "A", freq: 440.00, color: "#3db4ff", emoji: "🎸" },
    { note: "C2", freq: 523.25, color: "#b06bff", emoji: "🔔" }
  ],

  /* Stamps for the open-ended drawing/sticker pad */
  stamps: ["⭐", "❤️", "🌈", "🌸", "🦋", "🐶", "🚗", "🍎", "😊", "🎈", "🐟", "☀️"],

  /* The activity menu shown on the home screen */
  menu: [
    { id: "colors",  en: "Colors",   he: "צְבָעִים",     emoji: "🎨", tile: "#3db4ff" },
    { id: "shapes",  en: "Shapes",   he: "צוּרוֹת",      emoji: "🔺", tile: "#b06bff" },
    { id: "numbers", en: "Numbers",  he: "מִסְפָּרִים",   emoji: "🔢", tile: "#4fc26a" },
    { id: "animals", en: "Animals",  he: "חַיּוֹת",      emoji: "🐮", tile: "#ff9f43" },
    { id: "letters", en: "Letters",  he: "אוֹתִיּוֹת",    emoji: "🔤", tile: "#6c7cff" },
    { id: "music",   en: "Music",    he: "מוּסִיקָה",     emoji: "🎵", tile: "#ff7fb6" },
    { id: "match",   en: "Matching", he: "הַתְאָמָה",     emoji: "🧩", tile: "#2bc4c0" },
    { id: "body",    en: "My Body",  he: "הַגּוּף שֶׁלִּי", emoji: "🧒", tile: "#ff5d5d" },
    { id: "weather", en: "Weather",  he: "מֶזֶג אֲוִיר",   emoji: "🌦️", tile: "#38bdf8" },
    { id: "bubbles", en: "Bubbles",  he: "בּוּעוֹת",       emoji: "🫧", tile: "#22d3ee" },
    { id: "peekaboo",en: "Peekaboo", he: "קוּקוּ",         emoji: "🙈", tile: "#f59e0b" },
    { id: "sound",   en: "Sounds",   he: "קוֹלוֹת",        emoji: "🔊", tile: "#a855f7" },
    { id: "draw",    en: "Draw",     he: "צִיּוּר",       emoji: "🖍️", tile: "#ffb03a" }
  ]
};
