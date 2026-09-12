# Verdigris

The design system behind dreyburn.com, plus the two calibration instruments that produced it.

Framework-agnostic CSS and light-DOM web components. No build step, no dependencies, no
external requests, no Tailwind. The system documents itself at `docs/`, which is intended to
ship as a portfolio piece in its own right.

## Current state

All six calibration passes are **complete**, and the design system is **built and verified**.
What is not built is the site's content: the case-study and Field Note pages the homepage
links to. See **Building a page** in [AGENTS.md](AGENTS.md) before writing one.

**Run the dev server in your own terminal and leave the window open** — `serve.cmd` on Windows,
`./serve.command` on macOS and Linux. A server started by an agent lives only as long as its
session and gets reaped; this one lasts as long as the window does. Both detect a server already
on 8787 and just open the browser instead of failing.

| | |
|---|---|
| Homepage | <http://127.0.0.1:8787/index.html> |
| Design system | <http://127.0.0.1:8787/docs/> |
| Mobile preview | <http://127.0.0.1:8787/preview-mobile.html?w=320,390> |
| Calibration 01–06 | `/calibration/` — six passes, 01 through 06 |

The mobile harness renders only the widths in `?w=`, and cache-busts each frame so a CSS fix
can never be hidden by a stale iframe.

### What got built

- `verdigris/verdigris.css` — 3-tier tokens, base, and all components. No Tailwind.
- `verdigris/verdigris.js` — light-DOM custom elements. No shadow roots.
- `verdigris/topolang.js` — conformant topolang v1.3.2 runtime, 9/9 on the spec's own vector.
- `verdigris/print.css` — the paper stylesheet.
- `index.html` — thesis-first homepage.
- `docs/` — the design system published as portfolio piece five, with a live conformance
  runner and a contrast table that measures itself from the running tokens.

### Settled direction

- **Spine: Signal Lab.** Guests: Verdigris Native (long-form), Black Box (technical detail),
  Prismatic Instrument (multi-pillar only). Cybernetic Minimalism and Academic Cyberpunk dead.
- **Type: Chivo, Literata, IBM Plex Mono.** All open licence, self-hosted, $0 spent.
- **Structure:** asymmetric content column plus persistent rail; 30px baseline; hairline rules.
- **Link blue** corrected `#5B8DB8` → `#7FA9CE` (5.25:1 → 7.31:1) to hold AAA.
- **Green promoted to structural signature.** Three accents at three salience tiers:
  green (structure, high frequency), blue (links), lime (quantities only, plus focus).
  Ordinals are green, quantities are lime, and the component enforces it.
- **Patina teal given a job at last.** `--vd-editorial` is not a fourth tier — it sits outside
  the salience system, marking where the page quotes, credits or annotates rather than speaks.
  Lifted to 7.60:1 so it is legal as text, since the old value failed its own tier and stayed.
- **Inline links underlined.** Colour-only link identification measured 1.51:1 against body
  text, under the 3:1 that WCAG G183 requires. It was a 1.4.1 failure independent of anything
  else, and it is now also the channel separating a success message from a link.
- **Japan:** structural influence, no motifs.
- Academic Cyberpunk was killed as a *look*, but its serif reading voice and margin rail were
  chosen independently and survive.

### Verified, not asserted

Every number below was measured, and the measurements are re-run in the browser rather than
typed into a table.

| Check | Result |
|---|---|
| Contrast, all text tokens | AAA (7:1+) against `--vd-ink-000`; `docs/` regenerates the table live from the running tokens |
| Reflow, WCAG 1.4.10 | Passes at 320 CSS px. Failed first time — the nav was the only offender |
| Target size, 2.5.8 AA | Every target passes |
| Target size, 2.5.5 AAA | All standalone controls and cards pass. Heading links were a stated deviation; **resolved** — the card is the target, click forwarded under drag/selection guards |
| topolang conformance | 9/9 against the spec's own published vector, run live on the docs page |
| Reflow at 320px | All five pages: scrollWidth 301 against a 316px viewport |
| Colour vision | Viénot 1999 simulation published for every same-context pair, including the two that **fail** and what carries them instead |
| Form controls, 1.4.11 | Every control boundary ≥3:1 against its adjacent surface, both themes |

Not done: screen-reader transcripts (needs NVDA/VoiceOver by hand), and React and Astro
adapters (no consumer yet — see docs §09). The page templates exist: `reader.html` serves both
case studies and Field Notes, and `template.html` is the general starter. What is missing is the
*instances* — every card on the homepage still points at `#`.

### Responsive

The field runs **one character mode at every width**: SHADE, whose `cfn` is null, so the
contour pass never runs and there is no contour colour anywhere on the site. This replaced an
earlier breakpoint switch into STRATA above 860px — SHADE reads as dithered relief rather than
line-work, which is quieter where the display line crosses the field, and the line is now meant
to cross it. What still changes with the theme is the palette and opacity: `VERDIGRIS_BAND` at
0.62 in ink, `VERDIGRIS_PAPER` at 1.0 on paper, because subtractive marks on bone have less room
than emissive marks on near-black. The AAA guarantee under the text column is carried by the CSS
mask, not by the palette — 7.56:1 in ink, 7.29:1 on paper.

Two bugs worth not repeating, both documented in `verdigris/README.md`:

- **`padding` shorthand collision.** `.vd-page` and `.vd-section` both land on every homepage
  section; `padding: 90px 0` silently zeroed the horizontal padding, putting mobile body copy
  on the screen edge. Desktop hid it behind auto margins. Composable classes now use
  `padding-inline` / `padding-block`.
- **A percentage mask cannot keep a field clear of text once the layout stacks**, because the
  fade line lands wherever the paragraph happens to end.

### Verified typeface pricing (2026-08-01)

| Face | Foundry | Web licence |
|---|---|---|
| Archivo, Saira, Barlow, Chivo | Omnibus Type and others | $0, OFL |
| Newsreader, Source Serif 4, Literata, Spectral | various | $0, OFL |
| JetBrains, IBM Plex, Martian, Azeret Mono | various | $0, OFL |
| Söhne, Signifier | Klim | $60 per style; 3 styles = $180 |
| Söhne full family, 16 styles | Klim | $528 |
| PP Neue Montreal | Pangram Pangram | from $40 |
| Berkeley Mono | US Graphics | **$370** ($225 Indie + $145 web module) |

Klim pricing is the 5,000 monthly-unique-visitor tier. Berkeley Mono's web fonts are a
separately priced module, which puts it at nearly twice the budget for the least visible role.

## The calibration instruments

Both are complete; kept as artifacts of how the system was decided. Serve them rather than
opening from `file://` — Chrome restricts `localStorage` there and autosave fails silently.
Each shows a red banner if storage is unavailable.

**Pass 01** (`calibration/calibration.html`) — 12 sections, 68 required questions, ~45–70 minutes.
Visual decisions made by choosing between **live rendered specimens**; strategy, voice and
anti-goals as prose and scales. Answered 67/68. Output in `all-response.txt`.

**Pass 02** (`calibration/calibration-02.html`) — 7 questions closing container, rhythm, grid and typeface
selection, the last against verified licence prices with every open-source candidate
self-hosted and rendered at real size. Answered 7/7.

| § | Section | What it settles |
|---|---|---|
| 01 | Stance | North-star weighting, primary reader, the failure mode to design against |
| 02 | Territory bake-off | The five named territories + Verdigris, rendered as identical content — score, synthesize, kill |
| 03 | Typography | Display voice, reading voice, mono reach, scale ratio, measure, labels |
| 04 | Colour | Background strategy, accent count, semantic mapping of all 15 hexes, lime, links, contrast posture |
| 05 | Space | Density, container behaviour, spacing unit, grid visibility |
| 06 | Surface | What replaces the card, radius, elevation, where the topolang field lives |
| 07 | Motion | Hover behaviour, entrance, tempo, easing, reduced-motion fallback |
| 08 | Components | v1 inventory, ship order, naming convention, how the system documents itself |
| 09 | Voice | Section nomenclature, grammatical person, numbering, the Chives signature |
| 10 | Accessibility | Focus indicator, what gets published, the shared-legibility question |
| 11 | Anti-goals | Hard rules, including the current site's treatments as named controls |
| 12 | Execution | Scope, target repo, Tailwind, timeline |

### What pass 01 produced

§12 Output generates three artifacts — copy each, or **Download all three**:

- `verdigris-brief.md` — the full design brief
- `verdigris-tokens.css` — a derived token seed with real computed values (spacing scale,
  type scale, motion durations and easing, semantic colour tokens, focus ring)
- `verdigris-answers.json` — raw answers

Hand those back and the system gets built from them.

### Two things that shaped pass 01

**The territory specimens are interpretations.** No definitions of Cybernetic Minimalism,
Academic Cyberpunk, Prismatic Instrument, Black Box, or Signal Lab exist on this machine —
only one-line fragments in the strategy notes that seeded this work. They were authored from those fragments.
§02 has a correction field; it is the highest-value box in the instrument.

**This is built to terminate.** Your consultation report names strategy recursion as the
largest execution risk, and this would be the fifth positioning artifact since March. So the
instrument ends in a token file and a component contract, not a direction document. Fill it
once, in one sitting, on instinct.

### A note on pass two

The chrome of `calibration/calibration-02.html` is deliberately written **in** the settled Signal Lab
language: measurement register, lime rule under each section head, numbered labels, hairline
structure, two accents only. Typography stays on system fonts, because that is what the page
is deciding, and biasing the comparison would defeat the point.

Every open-source typeface in sections 04 to 06 is self-hosted and rendered for real, so what
you see is what ships. The five paid faces cannot legally be embedded, so those show a clearly
labelled proxy plus a link to the foundry's own live tester.

## Deploying

`dreyburn.com` runs on Hostinger behind Cloudflare. Deploy is a file copy — there is no build
step, no pipeline and nothing to invoke. `.htaccess` carries the 404 mapping and the cache
headers, and is the only server configuration.

Cloudflare caches everything under `verdigris/` and does not cache HTML, so pages go live on
upload while CSS and JS do not. **Changing a byte under `verdigris/` without bumping `?v=` ships
new markup against last week's stylesheet.** The full rule and the five-step release gate are in
[AGENTS.md](AGENTS.md) under **Shipping**.

## Files

| File | Purpose |
|---|---|
| `verdigris/` | **The design system.** See `verdigris/README.md` |
| `verdigris/fonts/` | The three shipped families, each with its verbatim OFL licence |
| `index.html` | The homepage, built on it |
| `work/`, `notes/` | Case studies and Field Notes — `work/<slug>.html` |
| `resume.html` | Résumé. Print is the deliverable, the screen is the courtesy |
| `docs/` | The system published as a portfolio piece |
| `404.html` | Not-found page. Reached through `.htaccess`, not by filename |
| `template.html` | Starter page, every element once. A specimen — copy it, do not edit it |
| `reader.html` | Case-study and Field Note template. Also a specimen |
| `.htaccess` | 404 mapping and cache headers. The deploy artifact |
| `robots.txt`, `sitemap.xml` | Crawl policy and the published URL list. Both hand-maintained |
| `og.png` | Social card, drawn by `tools/og.html`. Regenerate, do not hand-edit |
| `tools/og.html` | Redraws the hero field at 1200×630 and saves `og.png` |
| `serve.cmd` | Dev server, Windows. Run in your own terminal, leave it open |
| `serve.command` | Dev server, macOS/Linux. Same, and double-clickable in Finder |
| `preview-mobile.html` | Mobile harness. `?w=320,390` picks widths, `&y=` sets scroll |
| `calibration/` | Six passes and `all-response.txt`. Historical record, not referenced |
| `verdigris.md` | The terminal palette spec (input) |
