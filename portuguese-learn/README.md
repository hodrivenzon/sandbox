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
| **🗣️ AI conversation tutor** | A live chat tutor powered by **Claude** (Messages API): pick a dialect, level, lesson structure and topic, then converse in Portuguese with English corrections. Ending a session produces a review + a word list you can **save straight into your flashcards**. Bring your own Anthropic API key (stored only in your browser). Degrades gracefully without a key. |
| **13 topic lessons, 191 words/phrases** | Greetings, survival phrases, numbers, time, family, food, restaurant, colors, travel, shopping, body/health, weather, home. |
| **🎵 Famous songs (advanced)** | 8 Brazilian classics (*Garota de Ipanema*, *Construção*, *Evidências*, *Eduardo e Mônica*…). Each teaches advanced, often literary vocabulary, idioms and slang plus the song's cultural context — **never the lyrics** — with original example sentences and a link to go listen. |
| **💬 Real conversations (advanced)** | 8 colloquial daily-interaction dialogues (catching up, the bakery, haggling at the market, a doctor's visit, workplace gossip…) as chat bubbles with idiomatic translations, inline slang notes, key-expression cards, and play-the-whole-thing audio. |
| **Practice hub** | Flashcards (spaced repetition), **listening dictation**, a **conjugation drill**, and a **"review your mistakes"** deck that surfaces your weakest words. |
| **Quizzes** | Read-PT, produce-PT, listen, **cloze (fill-the-gap)** and **typed-recall** (accent-aware) question types. |
| **Native-style audio** | The browser's built-in **Web Speech API** speaks every word, line and phrase — in `pt-BR` **or `pt-PT`** depending on your dialect setting. No audio files shipped. |
| **Settings & progress** | Daily-goal, default flashcard direction, speech speed, light/dark theme, a progress page (mastery distribution, accuracy, per-lesson rings), and JSON **export/import** of your progress (the API key is never written to the backup). |
| **Spaced repetition** | A 5-box **Leitner system** schedules each item; correct answers wait longer, mistakes come back soon. A word counts as "learned" only once it survives into a multi-day box. Stored in `localStorage`. |
| **Flashcards** | Flip cards in either direction (PT→EN or EN→PT), self-grade *Again / Good*. Keyboard-operable. |
| **Quizzes** | Generated on the fly from the vocabulary: read-PT, produce-PT, and **listen-and-choose** question types with plausible distractors and ✓/✗ feedback. |
| **Verb conjugations** | Present tense of the 12 most useful verbs (`eu / você / nós / eles`), irregulars flagged, every form tappable to hear. |
| **Progress** | Streak (calendar-day based), XP, words-learned, and a daily review goal on the dashboard. |
| **Search** | Accent-insensitive search across all ~300 words, phrases & expressions, in English or Portuguese. |
| **Accessibility** | Screen-reader live region, focus management on navigation, `aria-current`/`aria-expanded`, non-color quiz feedback, WCAG-checked contrast, reduced-motion support. |
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

### Songs without lyrics (copyright)
"Learn from famous songs" is implemented as **teaching the language and culture
around** each song — its advanced vocabulary, idioms, slang and significance —
**not by reproducing copyrighted lyrics**. Every example sentence is original,
and each entry links out to YouTube/Spotify so you hear the real recording from
the rights holder. The content pipeline explicitly checks for and strips any
lyric quotation.

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
    ├── speech.js           # Web Speech (pt-BR / pt-PT TTS) + Web Audio cues
    ├── store.js            # localStorage: Leitner SRS, streak, XP, settings, tutor words
    ├── data.js             # GENERATED verified lesson + verb content
    ├── data-advanced.js    # GENERATED verified song + dialogue content
    ├── content.js          # normalizes PT.data: keys, routes, search, queries
    ├── components.js        # wordCard / speakBtn / dialogueLine / pills
    ├── tutor-api.js         # Claude Messages API client (fetch + SSE streaming)
    ├── app.js              # hash router + app shell + a11y/theme helpers
    └── screens/
        ├── home.js          # dashboard
        ├── lessons.js       # all lessons (+ verbs entry)
        ├── lesson.js        # one lesson (cards, grammar tips, play-all)
        ├── practice.js      # practice hub + reusable flashcard runner
        ├── quiz.js          # quiz (read/produce/listen/cloze/typed)
        ├── verbs.js         # conjugation tables
        ├── songs.js         # famous songs: culture + advanced vocab
        ├── conversations.js # daily-interaction dialogues
        ├── tutor.js         # AI conversation tutor (chat + review)
        ├── dictation.js     # listen-and-type dictation
        ├── drill.js         # typed conjugation drill
        ├── mistakes.js      # "review your mistakes" deck
        ├── progress.js      # mastery / accuracy / per-lesson rings
        ├── settings.js      # goal, speed, theme, dialect, tutor key, export/import
        └── search.js        # global search
```

## AI tutor (bring your own key)

The tutor calls the **Claude Messages API** directly from the browser over `fetch`
with SSE streaming (no SDK — this is a buildless site). You supply your own
Anthropic API key in **Settings**; it lives only in `localStorage`, is sent only
to `api.anthropic.com`, and is **never** included in the JSON progress backup.
Default model is `claude-opus-4-8` (switchable to Sonnet/Haiku to save cost).
Get a key at [console.anthropic.com](https://console.anthropic.com/settings/keys)
and set a low spend limit. No key → the tutor shows a setup card; everything else
in the app works offline without it.

## Extending it

- **Add a lesson:** append an object to `PT.data.lessons` in `js/data.js` (same
  shape as the others) — it appears everywhere automatically.
- **European Portuguese:** flip the dialect to 🇵🇹 in Settings (drives TTS + the
  tutor). The lesson *content* is still Brazilian; regenerate `js/data.js` for a
  fully pt-PT variant.
- **Reset progress:** Settings → Reset, `PT.store.reset()` in the console, or
  clear site data.

## Notes & limits

- Speech quality depends on the voices installed on the device/OS. Desktop
  Chrome, Safari and iOS/macOS generally have a good `pt-BR` voice; on Linux you
  may need to install one.
- Progress is per-browser (`localStorage`); there is no account sync by design.
