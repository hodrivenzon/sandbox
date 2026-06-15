/* Tiny Explorers — content data.
   All visuals are emoji / CSS so the site needs zero image assets and works
   fully offline. Word + sound choices are simple, concrete and recognizable —
   the kind of vocabulary 2–3 year-olds are building (CDC/ASHA milestones). */
window.TE = window.TE || {};

TE.data = {
  /* 10 core colors — primary colors first, which 2–3s learn earliest */
  colors: [
    { name: "Red",    hex: "#ff5d5d" },
    { name: "Blue",   hex: "#3db4ff" },
    { name: "Yellow", hex: "#ffce3a" },
    { name: "Green",  hex: "#4fc26a" },
    { name: "Orange", hex: "#ff9f43" },
    { name: "Purple", hex: "#b06bff" },
    { name: "Pink",   hex: "#ff7fb6" },
    { name: "Brown",  hex: "#a9744f" },
    { name: "Black",  hex: "#3a3a3a" },
    { name: "White",  hex: "#ffffff" }
  ],

  /* Basic shapes toddlers can name/sort by ~3 */
  shapes: [
    { name: "Circle",    type: "circle" },
    { name: "Square",    type: "square" },
    { name: "Triangle",  type: "triangle" },
    { name: "Star",      type: "star" },
    { name: "Heart",     type: "heart" },
    { name: "Rectangle", type: "rectangle" }
  ],

  /* Familiar animals + the sound they make (animal sounds are a 2–3 favorite) */
  animals: [
    { name: "Dog",      emoji: "🐶", says: "Woof woof" },
    { name: "Cat",      emoji: "🐱", says: "Meow" },
    { name: "Cow",      emoji: "🐮", says: "Moo" },
    { name: "Duck",     emoji: "🦆", says: "Quack quack" },
    { name: "Sheep",    emoji: "🐑", says: "Baa" },
    { name: "Pig",      emoji: "🐷", says: "Oink oink" },
    { name: "Horse",    emoji: "🐴", says: "Neigh" },
    { name: "Lion",     emoji: "🦁", says: "Roar" },
    { name: "Frog",     emoji: "🐸", says: "Ribbit" },
    { name: "Bee",      emoji: "🐝", says: "Buzz" },
    { name: "Chicken",  emoji: "🐔", says: "Cluck cluck" },
    { name: "Elephant", emoji: "🐘", says: "Pawoo" }
  ],

  /* A–Z, one simple concrete word + emoji each */
  letters: [
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

  /* The object shown for each count 1–10 (variety keeps it interesting) */
  numberObjects: ["🍎", "⭐", "🎈", "🍌", "🐠", "🌸", "🍓", "🧸", "🚗", "🍪"],
  numberWords: ["one","two","three","four","five","six","seven","eight","nine","ten"],

  /* Body parts as recognizable cards (name them / find them) */
  body: [
    { name: "Eyes",  emoji: "👀" },
    { name: "Nose",  emoji: "👃" },
    { name: "Mouth", emoji: "👄" },
    { name: "Ears",  emoji: "👂" },
    { name: "Hand",  emoji: "✋" },
    { name: "Foot",  emoji: "🦶" },
    { name: "Hair",  emoji: "💇" },
    { name: "Tooth", emoji: "🦷" }
  ],

  /* Everyday weather — recognizable and great for daily-routine talk */
  weather: [
    { name: "Sun",     emoji: "☀️" },
    { name: "Cloud",   emoji: "☁️" },
    { name: "Rain",    emoji: "🌧️" },
    { name: "Storm",   emoji: "⛈️" },
    { name: "Snow",    emoji: "❄️" },
    { name: "Rainbow", emoji: "🌈" },
    { name: "Wind",    emoji: "💨" },
    { name: "Moon",    emoji: "🌙" }
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
    { id: "colors",  label: "Colors",  emoji: "🎨", tile: "#3db4ff" },
    { id: "shapes",  label: "Shapes",  emoji: "🔺", tile: "#b06bff" },
    { id: "numbers", label: "Numbers", emoji: "🔢", tile: "#4fc26a" },
    { id: "animals", label: "Animals", emoji: "🐮", tile: "#ff9f43" },
    { id: "letters", label: "Letters", emoji: "🔤", tile: "#6c7cff" },
    { id: "music",   label: "Music",   emoji: "🎵", tile: "#ff7fb6" },
    { id: "match",   label: "Matching",emoji: "🧩", tile: "#2bc4c0" },
    { id: "body",    label: "My Body", emoji: "🧒", tile: "#ff5d5d" },
    { id: "weather", label: "Weather", emoji: "🌦️", tile: "#38bdf8" },
    { id: "draw",    label: "Draw",    emoji: "🖍️", tile: "#ffb03a" }
  ]
};
