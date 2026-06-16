/* For Grown-Ups — the research behind Tiny Explorers.
   Documents the early-childhood evidence the site is designed around and how
   to use it well. Figures and sources are drawn from CDC, AAP, WHO, ASHA,
   NAEYC, Nielsen Norman Group, peer-reviewed studies, and the FTC (COPPA). */
window.TE = window.TE || {}; TE.screens = TE.screens || {};

TE.screens.parents = {
  title: "For Grown-Ups",
  theme: "parents",
  render: function (host) {
    var el = TE.ui.el;
    TE.ui.clear(host);

    function section(title, kids) { return el("div", {}, [el("h3", { text: title })].concat(kids)); }
    function p(html) { return el("p", { html: html }); }
    function ul(items) { return el("ul", {}, items.map(function (t) { return el("li", { html: t }); })); }

    var pills = ["50 → ~1,000 words (age 2→3)", "~4–9 min attention span",
                 "Tap targets ≥ 2cm (4× adult)", "0 data collected", "0 ads, 0 purchases"]
      .map(function (t) { return el("span", { class: "pill", text: t }); });

    var doc = el("div", { class: "doc" }, [
      el("h2", { text: "👋 For Grown-Ups" }),
      el("div", { style: { margin: "0 0 18px" } }, [
        el("button", {
          class: "mode-btn",
          onclick: function () { TE.audio.pop(); TE.router.go("settings"); }
        }, [el("span", { text: TE.t("settingsBtn") })])
      ]),
      p("Tiny Explorers is a free, ad-free learning playground for children roughly 2–3 years old. " +
        "It's built around published early-childhood development guidance, so the activities match what " +
        "toddlers can actually do, the interface fits little hands, and the screen experience itself stays " +
        "healthy. Here's the thinking — with sources at the end."),
      el("div", {}, pills),

      section("How to use it well", [
        ul([
          "<b>Play together.</b> The biggest research-backed benefit comes from a caregiver sitting alongside, naming things, and talking about them — not solo screen time. The AAP is clear that 2–3s learn best from real-world interaction and a co-viewing adult.",
          "<b>Keep sessions short.</b> Toddlers focus on one thing for only a few minutes (~4–6 min at age 2, ~6–9 at age 3). Each activity finishes quickly with a small celebration; 5–15 minutes total is plenty. We followed the AAP's ~1 hour/day of high-quality, co-viewed media for ages 2–5, and the WHO's stricter advice for ages 2–4: no more than 1 hour of sedentary screen time, and “less is better.”",
          "<b>Let them lead and repeat.</b> Tapping the same animal ten times is learning, not a glitch — repetition is how this age consolidates words. Between 2 and 3, spoken vocabulary grows from roughly 50 words to around 1,000 (ASHA, CDC), and everything here is narrated to feed that.",
          "<b>Nothing to “lose.”</b> Every tap is rewarded with a warm sound and a friendly picture. In the “find it” games a wrong tap gets a gentle spoken hint — never a buzzer, a red X, or a lost point. Toddlers can read a negative outcome as their own fault, so the whole app is no-fail."
        ])
      ]),

      section("What your child is learning (and why it fits 2–3)", [
        ul([
          "<b>Colors & shapes</b> are named aloud on every tap. Most children begin naming a few colors only around their third birthday, so progress never depends on getting a color “right.”",
          "<b>Numbers 1–10</b> light up one object per number spoken and restate the total — building genuine counting (one-to-one correspondence and cardinality), not just recitation. Real understanding at this age centers on small quantities (~1–5), with bigger numbers to grow into.",
          "<b>Animals & sounds</b> are a favorite at this age and a rich source of new vocabulary.",
          "<b>First letters</b> are exposure (“A is for Apple”), not reading. Letter recognition usually begins after age 3 — often with the letters in a child's own name — so we show one letter at a time and never drill.",
          "<b>Matching, body parts, music & drawing</b> map onto well-documented 24–36-month strengths: matching identical pictures, pointing to named body parts, cause-and-effect musical play, and open-ended pretend."
        ])
      ]),

      section("How it's designed for little hands and minds", [
        ul([
          "<b>Single taps only.</b> Toddlers reliably tap but can't yet drag precisely, swipe for control, double-tap or pinch — in one study only ~27% of under-30-month-olds could even tap an intended target, and precise gestures were far less reliable. So every interaction here is a single tap.",
          "<b>Big, well-spaced targets.</b> Buttons are at least 2cm (~96px), about 4× the adult minimum that Nielsen Norman Group recommends for young children, with generous spacing to absorb accidental taps.",
          "<b>Audio-first.</b> Children this age can't read, so pictures and spoken narration carry all the meaning; the text is here for you.",
          "<b>Immediate, positive feedback</b> on every touch — a warm sound, a small animation, and the spoken name of what was tapped. No timers, no fail states.",
          "<b>Predictable & simple.</b> One obvious Home button, consistent layouts, bright high-contrast colors, and no hidden gestures to discover. The viewport is locked against accidental pinch-zoom."
        ])
      ]),

      section("Screen-time guidance we followed", [
        ul([
          "<b>AAP:</b> for ages 2–5, about 1 hour/day of high-quality programming, co-viewed so you can help your child understand it. Under 18 months, avoid screens except video chat.",
          "<b>WHO (2019):</b> for ages 2–4, no more than 1 hour of sedentary screen time per day — “less is better” — and none under age 2.",
          "Because of this the app has no autoplay video, no streaks or daily-use rewards, and nothing engineered to keep a child hooked. Keep mealtimes and the hour before bed screen-free."
        ])
      ]),

      section("Privacy & safety", [
        ul([
          "<b>No data is collected.</b> No accounts, sign-in, analytics, cookies, or third-party requests — the simplest path to compliance with the U.S. Children's Online Privacy Protection Act (COPPA) and its 2025 updates (effective June 23, 2025).",
          "<b>No ads and no purchases, ever.</b> About 95% of apps for kids 5 and under contain ads young children can't tell apart from content; this one has none.",
          "<b>No links a child can tap to leave the app.</b> This grown-ups area sits behind a simple parent gate (an arithmetic problem a toddler can't solve).",
          "<b>Works offline.</b> Once loaded it keeps working with no connection, so nothing is pulled from the web while your child plays."
        ])
      ]),

      el("h3", { text: "Sources" }),
      el("ul", {}, [
        ["AAP — Media and Young Minds (Pediatrics, 2016)", "https://publications.aap.org/pediatrics/article/138/5/e20162591/60503/Media-and-Young-Minds"],
        ["HealthyChildren.org (AAP) — Cognitive Development: Two-Year-Old", "https://www.healthychildren.org/English/ages-stages/toddler/Pages/Cognitive-Development-Two-Year-Old.aspx"],
        ["WHO — Physical activity, sedentary behaviour and sleep for children under 5 (2019)", "https://www.who.int/publications/i/item/9789241550536"],
        ["CDC — Learn the Signs. Act Early.: Milestones (2 & 3 years)", "https://www.cdc.gov/act-early/milestones/index.html"],
        ["ASHA — Communication Milestones: 2 to 3 Years", "https://www.asha.org/public/developmental-milestones/communication-milestones-2-to-3-years/"],
        ["NAEYC — Developmentally Appropriate Practice", "https://www.naeyc.org/resources/topics/dap"],
        ["Nielsen Norman Group — Design for Kids by Stage of Physical Development", "https://www.nngroup.com/articles/children-ux-physical-development/"],
        ["Nielsen Norman Group — Touch Targets on Touchscreens", "https://www.nngroup.com/articles/touch-target-size/"],
        ["Children's touchscreen gesture abilities (peer-reviewed study, PMC)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC7303424/"],
        ["Children's understanding of cardinality (peer-reviewed study, PMC)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3830647/"],
        ["ZERO TO THREE — Tips on Learning to Talk", "https://www.zerotothree.org/resource/tips-on-learning-to-talk/"],
        ["FTC — Children's Online Privacy Protection Rule (COPPA), 16 CFR Part 312", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312"],
        ["FTC — Complying with COPPA: FAQ", "https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions"],
        ["Federal Register — COPPA Rule 2025 Amendments", "https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule"],
        ["Common Sense Media — Apps to Watch Out For", "https://www.commonsensemedia.org/articles/apps-to-watch-out-for"]
      ].map(function (s) {
        return el("li", { class: "src" }, [
          el("a", { href: s[1], target: "_blank", rel: "noopener noreferrer", text: s[0] })
        ]);
      })),

      el("p", { class: "src", style: { marginTop: "22px", color: "#8a86a0" },
        text: "Tiny Explorers is an educational toy, not medical advice. Every child develops at their own pace; if you have concerns about your child's development, talk with your pediatrician." })
    ]);

    host.appendChild(doc);
  }
};
