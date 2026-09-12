# Changelog

Verdigris is versioned by what it publishes, not by semver on an API — nothing consumes it as
a package. A version bump means the asset query strings moved and the docs page changed with
them. Entries record what was *measured*, because that is the part that can be wrong.

## 1.7.0 — 2026-08-06

Forms, feedback, and the namesake. Settled in Calibration 05.

### Added

- **Form kit.** `vd-form`, `.vd-field`, `.vd-input`, `.vd-textarea`, `.vd-select`, `.vd-check`.
  There were no form control rules in the system before this — not unstyled ones, none. Native
  `<select>`; the closed control is styled and the open panel is left to the OS.
- **Validation state model.** Invalid, valid, warn, disabled, readonly. Validates on blur, then
  re-validates on every keystroke once a field has been blurred. `novalidate` is set from script
  so the browser's own enforcement survives with JS off. Author wording via `data-msg-*`.
  No error summary — focus moves to the first invalid control.
- **`--vd-editorial`.** Patina teal, given a job after two calibrations unassigned: pull-quote
  rules, figure captions, marginalia, `.vd-cite`.
- **`--vd-ok` / `--vd-warn`.** Success and warning, both explained below.
- **`--vd-control-border`.** `--vd-ink-400` `#6E6963` / `--vd-slate-300` `#868074`.
- **`--vd-nav-h`.** The nav's height, named so anything clearing it stays in sync.
- **`.vd-table--zebra`, `.vd-skeleton`, `.vd-empty`.**
- **`custom-elements.json`.** Hand-authored Custom Elements Manifest, nine elements. Carries a
  `checkedAgainst` field because a hand-written manifest can drift and a generated one cannot.
- **docs §10 — Forms and feedback.** Live specimen, not a screenshot.
- **`verdigris/audit.js`.** The conformance harness, shipped. Contrast, control boundaries,
  target size, reflow, table wrapping, and the numerals-only data rule — measured on the
  rendered page. Also emits the token table and class index, derived rather than stored.
- **`template.html`.** A starter page using every major element once, annotated.
- **`CHANGELOG.md`, `.gitignore`, and a git repository.**

### Changed

- **Inline links are underlined.** They were `text-decoration:none`, identifiable by colour
  alone at **1.51:1** in ink and **1.67:1** on paper — under the 3:1 WCAG G183 requires. A 1.4.1
  failure independent of forms. Components with their own non-colour channel opt out.
- **`--vd-teal-400` `#4AACA4` retired** at 6.67:1 — the only token in the system that failed its
  own tier and stayed. Replaced by `--vd-teal-500` `#4FB8AF` at 7.60:1, with `--vd-patina-500`
  `#0F4F4A` at 8.02:1 on paper, 0.5° of hue drift.
- **The section rule is gone.** Sections were separated by a full-width hairline across 90px of
  existing whitespace. The green signature segment survives as a freestanding, centred mark.
- **Control borders no longer use `--vd-rule-strong`.** See below.

### Fixed

- **Every form control at rest failed WCAG 1.4.11.** `--vd-rule-strong` is a decorative hairline
  and exempt; a control boundary is not. Measured **1.76:1** against the adjacent surface where
  3:1 is required. Now 3.33:1 (ink) and 3.35:1 (paper), via `--vd-control-border`.
- **The sticky rail was sliced by the sticky nav.** It stuck at `--vd-space-1` (30px) while
  `vd-nav` occupies 0–60px at z-index 50, so the first readout line was cut in half. Now offset
  by `--vd-nav-h` plus a gap.
- **Print emitted a screen colour.** `print.css` overrides an explicit token list, and
  `--vd-editorial` was not in it — it resolved to teal at **2.38:1 on white**, so quote rules and
  captions printed nearly invisible. All four new tokens are now listed, with a comment saying
  the list is exhaustive by necessity.
- **Print had no form handling.** Controls print flattened, with values; buttons and skeletons
  do not print.
- **Buttons failed 1.4.11.** `.vd-btn` used `--vd-rule` for its boundary, measuring **1.32:1**
  on paper and **1.33:1** in ink. Now `--vd-control-border`. Found by `audit.js` on its first run.
- **The docs page broke its own data-colour rule.** Every `PASS` verdict rendered in the data
  colour, which is reserved for numerals — the rule `vd-system-card` enforces in code. Verdicts
  now use `--vd-ok`. Also found by `audit.js`.
- **Reflow at 320px.** The docs page overflowed by 131px: two unwrapped tables, `vd-swatch`
  refusing to shrink below its content, and the type-scale row. Both pages now report
  scrollWidth 301 against a 316px viewport.

### Corrected

Two published claims measured the opposite of the truth. Both are corrected in place rather than
deleted, in `verdigris/README.md`, `verdigris.md` and the docs.

- **"Green and lime stay distinguishable under deuteranopia."** They do not. Simulated with the
  Viénot 1999 matrices they land **0.4°** apart — same hue, two values apart. What separates
  them is size and position; both are mono tabular numerals, so hue was never doing the work.
- **"Responsive art direction — STRATA above 860px, SHADE below."** The mode switch was removed;
  SHADE runs at every width and `contourColor` is dead configuration on the shipped palettes.

### Measured

Success has no hue available. Against the error colour, under dichromat simulation:

| Candidate | Deuteranopia | Protanopia | Verdict |
|---|---|---|---|
| green `#44BB44` | 0.7° | 4.1° | collapses |
| lime `#AAFF00` | 0.3° | 4.4° | collapses |
| teal `#4FB8AF` | 180.0° | 4.6° | collapses on one axis |
| fir `#12551E` (paper) | 0.0° | 1.2° | collapses |
| blue `#7FA9CE` | 180.0° | 175.4° | **separable** |

Blue is the only hue clearing both axes, and it is already the link colour. So `--vd-ok` aliases
`--vd-link` and the collision is paid for: a success message carries a glyph and is never
underlined, while every inline link is. Remove the underline and the aliasing becomes a real
collision.

Warning carries no hue at all — orange is 5.77:1 and cannot be text, and a fourth accent was not
worth it.

### Verified

All six `verdigrisAudit()` checks pass on `index.html`, `docs/index.html` and `template.html`,
measured on fresh loads:

| Page | Elements checked | Result |
|---|---|---|
| `index.html` (ink) | 95 | pass |
| `docs/index.html` (ink) | 537 | pass |
| `template.html` (paper) | 104 | pass |

- Reflow verified at 320px in an iframe, which has its own viewport so media queries fire —
  constraining a div does not, and proves nothing.
- topolang 9/9 conformant, unchanged.
- `custom-elements.json` tag list matches the `defs` array in `verdigris.js` exactly.

Two of the three failures fixed in this release were found by `audit.js` on its first run, on
pages that had already been reviewed by eye and by hand-written checks. That is the argument for
shipping it.

## 1.8.0 — 2026-08-07

Document primitives, a reader page, and a resume. Settled in Calibration 06.

### Added

- **Thirteen base elements, previously unstyled.** `ul`, `ol`, `dl`, `dt`, `dd`, `hr`, `sup`,
  `sub`, `small`, `time`, `kbd`, `details`, `summary`. Before this, the only list rules in the
  system were `.vd-nav__list` and `.vd-toc` — both `list-style:none`, for navigation. A list
  inside prose had never been rendered.
- **`reader.html`** — one template for case studies and Field Notes. Metadata in the rail, no
  generative field, endnotes with back-links, bare figures, and end matter carrying
  previous/next, a contact line and a last-updated date.
- **`resume.html`** — date column and content column, so a career's shape reads in one pass.
  Positioning statement, experience, skills. Print is the deliverable here, not a courtesy.
- **Print page-break rules**, all previously unset: `orphans`/`widows` on paragraphs,
  `break-inside` on roles and list items, figures kept with their captions, endnotes kept with
  their article.
- **`.vd-article__title`, `.vd-article__dek`, `.vd-notes`, `.vd-endmatter`, `.vd-role`.**

### Changed

- **`vd-figure` lost its frame**, and its caption lost the editorial rule. It had zero uses on
  any page until Calibration 06, so neither had ever been looked at. **This narrows the editorial
  family** set in 1.7.0: teal now marks the pull-quote, `.vd-marginalia` and `.vd-cite` only.
  What distinguishes `vd-figure` from a bare image is now the caption, not the box.
- **A bare `<img>` is max-width constrained.** A 1.4.10 fix, not a style: only `vd-figure img`
  had it, so a 900px screenshot in a 320px column pushed the document sideways and the reflow
  guarantee depended on authors remembering to wrap every image.
- **List markers are muted, not the structure colour** — a stated exception to the ordinal rule.
  A list marker is an ordinal, but at list frequency green would stop being rare.
- **The résumé button and footer links point at `resume.html`**, which now exists.
- **`custom-elements.json` documents 14 elements, not 9.** `vd-nav`, `vd-footer`, `vd-quote`,
  `vd-figure` and `vd-meta` are CSS-only and were missing. The 1.7.0 check that the manifest
  "matched exactly" compared it against registered elements only and so could not have found them.

### Fixed

- **`audit.js` reported compliant targets as near-misses.** `getBoundingClientRect` is
  fractional, so a real 44px control measures 43.996 and `< 44` flagged it. Twelve of thirteen
  AAA notes on `reader.html` were this artifact. Rounded, with a 0.5px tolerance.
- **`audit.js` does not implement 2.5.5's Spacing exception**, so its AAA notes over-report
  narrow-but-well-spaced nav links. Now stated in the file, because an audit that cries wolf
  gets ignored.
- Two real AA target-size failures the audit caught: a standalone footer link in `template.html`
  and the resume's rail links, both bare inline anchors at 15–18px. A standalone link is not
  covered by 2.5.8's inline exception; both now use `.vd-tag`.

### Verified

All five pages pass every `verdigrisAudit()` check, and all five pass 1.4.10 at 320px with
scrollWidth 301 against a 316px viewport: `index.html`, `docs/index.html`, `template.html`,
`reader.html`, `resume.html`.

## Unreleased — site infrastructure

No version bump: nothing under `verdigris/` changed, so the asset query strings stay at 1.8.0.
The convention is that a version marks a *kit* release; this is the site around it. Fold this
section into the next version when the content build lands.

### Added

- **`.htaccess`** — `ErrorDocument`, cache headers, `Options -Indexes`, and the `woff2` MIME
  type. Deliberately contains no HTTPS rewrite: Cloudflare terminates TLS and the origin sees
  plain HTTP, so a rewrite would redirect against its own output indefinitely.
- **`404.html`**, built on the system. Every path in it is root-absolute, because it is served
  for a miss at any depth while the browser keeps the URL it asked for — a relative stylesheet
  href would resolve against `/work/` and the error page would arrive unstyled.
- **`robots.txt`** and **`sitemap.xml`**, both hand-maintained. The instruments and the archive
  are `Disallow`ed; the specimens carry `noindex` instead, because a page blocked from crawling
  is never fetched and so its `noindex` is never read.
- **Favicon** (`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`) — three contour segments on
  the page ground, reduced until they still read at 16px. The ground is part of the mark, so it
  needs no `prefers-color-scheme` variant it could not carry into `.ico`.
- **Canonical, Open Graph and Twitter tags** on every page, with absolute URLs throughout.
- **`tools/og.html`** — draws the 1200×630 social card from the same topolang runtime, mode,
  palette and seed as the hero, with `frozen:true` so the card is reproducible from the seed.
  The hero's AAA guarantee comes from a CSS mask, which a canvas has no equivalent for, so the
  card repaints the ground under the text column at full opacity instead — the published token
  ratios then hold unmodified rather than against a composite needing its own measurement.
- **AGENTS.md: Building a page and Shipping**, with a six-step release gate.

### Fixed

- **`custom-elements.json` was stamped 1.7.0** while docs §09 said the five CSS-only hooks
  entered the manifest in 1.8.0. Re-verified against both sources — nine `defs` entries plus five
  CSS-only hooks, fourteen total, exact — and re-stamped. The note now carries the procedure and
  the three `vd-*` strings that are comment headers or CSS counter names, which produce a false
  positive in the obvious grep.
- **README claimed two calibration passes**; there are six.
- **README described the hero field as switching STRATA/SHADE at 860px.** It has run SHADE at
  every width since the breakpoint switch was removed. What varies by theme is palette and
  opacity: `VERDIGRIS_BAND` at 0.62 in ink, `VERDIGRIS_PAPER` at 1.0 on paper.
- **README listed the page templates as not done.** They exist; the instances do not.
- **docs §08's usage snippet omitted `audit.js`**, which every page carries, and its
  `vd-system-card` example used a directory-style `href` the URL scheme does not use.

## Earlier

Not retroactively written up. Calibration 01–04 and the sessions that implemented them are the
record: dark-only retired and the paper theme authored, the topolang drift and density work, the
mask contrast guarantee, and the accessibility measurements in docs §07.
