# 🧪 Sandbox

A small collection of self-contained, browser-based projects, published with **GitHub Pages**.

**Live:** https://hodrivenzon.github.io/sandbox/

The landing page ([`index.html`](index.html)) links to everything below.

## Projects

| | Project | What it is | Link |
| --- | --- | --- | --- |
| 🧸 | **Tiny Explorers** | A static, research-grounded learning playground for ages 2–3 (colors, shapes, numbers, animals, letters, music, matching, body parts, drawing). Tap-to-learn, narrated aloud, offline-ready, no ads, no data collection. | [`toddler-learn/`](toddler-learn/) |
| 🏋️ | **FORGE** | A CrossFit strength-analytics dashboard — track lifts, benchmark scores, and visualize progress. | [`crossfit-dashboard.html`](crossfit-dashboard.html) |
| 📋 | **Baby Gear List** | A Python (`openpyxl`) script that generates a color-coded Excel shopping list for baby equipment, organized by priority and status (Hebrew / RTL). Not a web app — run it locally. | [`build_list.py`](build_list.py) |

## Run locally

Everything except `build_list.py` is a static site — serve the folder and open it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

To generate the baby-gear spreadsheet:

```bash
pip install openpyxl
python3 build_list.py
```

## Deploy (GitHub Pages)

This repo is set up to deploy straight from the `main` branch root. In **Settings → Pages**, choose **Deploy from a branch → main → /(root)**. The included `.nojekyll` makes Pages serve all files as-is.
# sandbox
