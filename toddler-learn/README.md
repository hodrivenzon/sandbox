# 🧸 Tiny Explorers — a learning website for ages 2–3

A free, ad-free, **100% static** learning playground for toddlers. No server, no
build step, no accounts, no data collection — just open it in a browser. It runs
perfectly on **GitHub Pages** and even works **offline** after the first load.

## What's inside

Nine tap-to-learn activities, all narrated aloud (toddlers can't read yet):

| Activity | What it teaches |
| --- | --- |
| 🎨 Colors | Name 10 colors; optional "find it" game |
| 🔺 Shapes | Circle, square, triangle, star, heart, rectangle |
| 🔢 Numbers | Count objects 1–10 (one-to-one correspondence) |
| 🐮 Animals | Animal names + the sounds they make |
| 🔤 Letters | "A is for Apple" — gentle letter exposure, A–Z |
| 🎵 Music | Pentatonic sound pads (no wrong notes) + a song |
| 🧩 Matching | "Which one is the same?" visual matching |
| 🧒 My Body | Name/find body parts |
| 🖍️ Draw | Open-ended sticker/stamp pad |

Plus a gated **For Grown-Ups** page documenting the research the design is based
on (AAP & WHO screen-time guidance, CDC/ASHA milestones, NAEYC, Nielsen Norman
Group children's-UX findings, and COPPA privacy practice).

## Design principles (grounded in early-childhood research)

- **Single taps only** — no drag, swipe, double-tap, pinch or multi-touch (all unreliable for toddlers).
- **Big targets** (≥ ~96px) for imprecise little hands.
- **Audio-first**: pictures + spoken narration carry the meaning.
- **No fail states**: every tap is rewarded; wrong answers get a gentle hint, never a buzzer.
- **Predictable & simple**: one Home button, consistent layouts, bright high-contrast colors.
- **Private & safe**: no ads, no purchases, no analytics, no third-party requests, no child-reachable links; the grown-ups area sits behind a parent gate.

## Run it locally

Because of browser security rules, open it through a tiny local web server (not by
double-clicking, if you want the service worker / offline cache to register):

```bash
cd toddler-learn
python3 -m http.server 8000
# then visit http://localhost:8000
```

> It also works from a double-clicked `index.html` (`file://`) — only the offline
> service worker is skipped in that mode.

## Deploy to GitHub Pages

1. Create a GitHub repo and push the contents of this `toddler-learn/` folder
   (the `index.html` should be at the repository root, or in a `/docs` folder).
2. In the repo: **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick your
   branch and the folder (`/root` or `/docs`), and **Save**.
4. Wait ~1 minute, then open the URL GitHub gives you (e.g.
   `https://<you>.github.io/<repo>/`).

The included `.nojekyll` file tells GitHub Pages to serve the files as-is. No
configuration, secrets, or actions are required.

## File structure

```
toddler-learn/
├── index.html              # app shell
├── manifest.webmanifest    # installable PWA metadata
├── sw.js                   # offline service worker
├── .nojekyll               # serve files as-is on GitHub Pages
├── icons/icon.svg          # app icon
├── css/styles.css          # design system
└── js/
    ├── data.js             # all content (colors, animals, letters…)
    ├── audio.js            # Web Speech (narration) + Web Audio (tones)
    ├── ui.js               # shared helpers + the grid-activity engine
    ├── app.js              # hash router, start overlay, parent gate
    └── activities/         # one file per screen
        ├── home.js  colors.js  shapes.js  numbers.js
        ├── animals.js  letters.js  music.js  match.js
        ├── body.js  draw.js  parents.js
```

## Accessibility & tech notes

- Pure HTML/CSS/vanilla JS. No frameworks, no dependencies, no fonts/CDNs.
- All visuals are emoji or inline SVG — zero image files, no licensing.
- Narration uses the browser's built-in Web Speech API; sound effects use the
  Web Audio API. Both degrade gracefully if unsupported.
- Respects `prefers-reduced-motion`; keyboard-focusable; ARIA labels on controls.

*Tiny Explorers is an educational toy, not medical advice. Every child develops
at their own pace.*
