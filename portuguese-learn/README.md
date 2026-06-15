# Falar 🇧🇷 — Learn Brazilian Portuguese

A free, offline-friendly web app for learning **Brazilian Portuguese**: vocabulary
lessons with tap-to-hear native-style audio, spaced-repetition flashcards,
auto-generated quizzes (including a listening mode), and present-tense verb
conjugations. No account, no ads, no tracking, no build step.

Open `index.html` in a browser and it runs.

![tech: vanilla JS](https://img.shields.io/badge/stack-vanilla_JS-0f766e) ![no build](https://img.shields.io/badge/build-none-16a34a) ![offline](https://img.shields.io/badge/offline-PWA-f59e0b)

---

## Run it

It's a static site — any of these work:

```bash
# 1. Just open the file
open index.html

# 2. Or serve it (recommended; enables offline service worker)
node server.js 8011          # then visit http://localhost:8011
# or
python3 -m http.server 8011  # if your environment allows it
```

There is **no install step and no dependencies.**

---

## What's inside

| Feature | How it works |
|---|---|
| **13 topic lessons, 191 words/phrases** | Greetings, survival phrases, numbers, time, family, food, restaurant, colors, travel, shopping, body/health, weather, home. |
| **Native-style audio** | The browser's built-in **Web Speech API** speaks every word/phrase in `pt-BR`. No audio files shipped. |
| **Spaced repetition** | A 5-box **Leitner system** schedules each word; correct answers wait longer, mistakes come back soon. Stored in `localStorage`. |
| **Flashcards** | Flip cards in either direction (PT→EN or EN→PT), self-grade *Again / Good*. |
| **Quizzes** | Generated on the fly from the vocabulary: read-PT, produce-PT, and **listen-and-choose** question types with plausible distractors. |
| **Verb conjugations** | Present tense of the 12 most useful verbs (`eu / você / nós / eles`), irregulars flagged, every form tappable to hear. |
| **Progress** | Streak, XP, words-learned, and a daily review goal on the dashboard. |
| **Search** | Accent-insensitive search across everything, in English or Portuguese. |
| **Dark mode** | Automatic via `prefers-color-scheme`. |

---

## How it was built — the investigation

**Goal:** a language-teaching site that is *accurate*, *genuinely useful for a
beginner*, and *trivial to host*. Three design decisions followed from that:

### 1. Tech stack: zero-dependency static SPA
A language app's hard parts are **content correctness** and **audio**, not the
framework. So there is no framework and no build:

- **Plain ES5-style JavaScript** split into small modules (`js/*.js`), each
  attaching to a single global `PT` namespace.
- A tiny **hash router** (`js/app.js`) swaps screens registered on `PT.screens`.
- A **DOM builder** (`PT.dom.el`) instead of a templating library.
- This means it hosts anywhere static (GitHub Pages, Netlify, an S3 bucket, or a
  double-clicked file) and has no supply-chain or upgrade burden.

### 2. Audio without audio files
Recording or licensing native audio for ~200 phrases is the usual blocker.
Instead the app uses the **Web Speech API** (`speechSynthesis`) and asks the OS
for a Brazilian Portuguese voice (`js/speech.js`). Every utterance is tagged
`lang="pt-BR"`, with graceful fallback and an on-screen note if no PT voice is
installed. A short **Web Audio API** synth provides the correct/wrong cues.

### 3. Content correctness via a verification pipeline
Wrong accents or genders would make a language app actively harmful, so the
lesson content was **authored and then independently double-checked**:

```
author (per topic)  →  native-teacher review (corrects accents/gender/translation)
                    →  second independent native audit (final correctness pass)
```

13 topics were generated in parallel, each passing through all three stages, plus
a dedicated author+review pass for the verb conjugations. The validated JSON is
baked into `js/data.js` (pure data — regenerate rather than hand-edit en masse).
`js/content.js` normalizes it at load (stable keys for the SRS, lesson back-refs,
search index).

### Pedagogy
The learning loop is **see/hear → self-test → spaced review**. The Leitner boxes
(`js/store.js`) mean the app surfaces *due* cards first and treats a word as
"learned" only once it has survived a few correct reviews — closer to real
retention than a one-time "I saw it" flag.

---

## Project structure

```
portuguese-learn/
├── index.html              # shell: top bar, screen host, bottom tab bar, script order
├── server.js               # tiny dependency-free static server for local preview
├── manifest.webmanifest    # PWA metadata
├── sw.js                   # service worker (offline cache)
├── css/
│   └── styles.css          # all styling; CSS variables + automatic dark mode
└── js/
    ├── dom.js              # el()/clear()/shuffle()/ring()/celebrate() helpers
    ├── speech.js           # Web Speech (pt-BR TTS) + Web Audio cues
    ├── store.js            # localStorage: Leitner SRS, streak, XP, daily goal
    ├── data.js             # GENERATED verified lesson + verb content
    ├── content.js          # normalizes PT.data: keys, search, queries
    ├── components.js        # wordCard / speakBtn / stat / pills
    ├── app.js              # hash router + app shell
    └── screens/
        ├── home.js          # dashboard
        ├── lessons.js       # all lessons
        ├── lesson.js        # one lesson (cards, grammar tips, play-all)
        ├── practice.js      # spaced-repetition flashcards
        ├── quiz.js          # multiple-choice quiz (incl. listening)
        ├── verbs.js         # conjugation tables
        └── search.js        # global search
```

## Extending it

- **Add a lesson:** append an object to `PT.data.lessons` in `js/data.js` (same
  shape as the others) — it appears everywhere automatically.
- **Switch to European Portuguese:** change the voice locale in `js/speech.js`
  (`pt-PT`) and regenerate `js/data.js` for that variant.
- **Reset progress:** `PT.store.reset()` in the console, or clear site data.

## Notes & limits

- Speech quality depends on the voices installed on the device/OS. Desktop
  Chrome, Safari and iOS/macOS generally have a good `pt-BR` voice; on Linux you
  may need to install one.
- Progress is per-browser (`localStorage`); there is no account sync by design.
