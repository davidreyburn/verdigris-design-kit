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

## 1.9.0 — 2026-09-12

Site infrastructure, and a licence that distinguishes what may be reused from what may not.

The version moved because `verdigris/topolang.js` did — it gained an SPDX header. That is a
comment, and a comment cannot break a page, which is exactly the judgement call the bump rule
exists to remove: the rule is that any change to served CSS or JS moves the query string, so
nobody has to decide which byte was harmless.

### Licensing

- **`verdigris/topolang.js` is now Apache 2.0**, carved out of the repository's otherwise
  read-only terms, with the full text as `LICENSE-APACHE-2.0.txt`. It implements a spec: it
  declares a version, negotiates capabilities, and self-tests against a conformance vector —
  machinery that exists so *other* implementations can be written and checked. A conformance
  suite nobody is permitted to conform to is decoration.
- **`LICENSE` gained a ratchet.** Permissions granted for a published version are never
  withdrawn; a narrowing binds only later releases.
- **Machine-readable manifests may be consumed by tooling.** `custom-elements.json` is published
  so editors can read it, which was a hollow offer while reading it was a breach.
- **The model-training clause lost its qualifier.** It read "as a source of reusable design
  assets", which invited the reading that other training was fine.
- **Contact moved to GitHub issues.** The site carries no email address anywhere by policy; a
  licence in a public repository putting one back was the same address by another route.

### Fixed in the docs

- **`verdigris/README.md` published a local filesystem path** — `~/agent/config/specs/` — for the
  topolang spec. The spec is not in this repository, and the path was wrong as well as private.
- **"the spec's own published vector"** overstated a claim in two READMEs. The vector is embedded
  in `topolang.js`, so `selfTest()` is verifiable from what ships; the spec it came from is not
  published. Reworded to say what is actually checkable.

### Added

- **`.htaccess`** — `ErrorDocument`, cache headers, `Options -Indexes`, and the `woff2` MIME
  type. Deliberately contains no HTTPS rewrite: Cloudflare terminates TLS and the origin sees
  plain HTTP, so a rewrite would redirect against its own output indefinitely.
- **`404.html`**, built on the system. Every path in it is root-absolute, because it is served
  for a miss at any depth while the browser keeps the URL it asked for — a relative stylesheet
  href would resolve against `/work/` and the error page would arrive unstyled.
- **`robots.txt`** and **`sitemap.xml`**, both hand-maintained. The calibration instruments are
  `Disallow`ed; the specimens carry `noindex` instead, because a page blocked from crawling is
  never fetched and so its `noindex` is never read.
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

### Removed

- **`archive/`** — one screenshot, referenced by nothing, constituting a directory.
- **`calibration/open-calibration.cmd`** — superseded by `serve.cmd` and `serve.command`, and
  referenced only by the line recording that it was superseded.

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

## 1.10.0 — 2026-09-12

A reading register. Long-form prose was set at the UI size.

### Fixed

- **The article column was 16px in a 928px container** — 538px of text, 61 characters a line,
  and 390px of empty space beside every line. The count was never the problem; 61 is inside the
  45–75 range. The problem was physical size, and the leading gave it away: 16/30 is a **1.88**
  ratio, very loose. `.vd-article__body` now sets `--vd-size-read` (18px) at `--vd-measure-read`
  (66ch) **above 860px only**, which moves three things at once and trades nothing — 70
  characters a line, leading to **1.67**, and the 30px baseline untouched.

  Below 860px the column already *is* the viewport, so there is no empty space to reclaim and
  the larger size only costs characters: 29 a line at 320px against 33. Narrow screens keep the
  body register, measured at 320, 390, 768, 1024 and 1440 with no horizontal overflow at any.

- **`.vd-article__title` carried a `max-width` that capped nothing.** `--vd-measure` is `58ch`,
  and `ch` resolves against the element's own font-size — 538px on 16px prose, **1997px** on a
  56px title, wider than any container it can occupy. Removed. The spread body caps it at 928px
  and always did. A rule that appears to constrain and does not is worse than no rule, because
  the next person tunes the token and nothing moves.

### Added

- **`--vd-size-read` and `--vd-measure-read`**, the long-form register, semantic tokens aliasing
  the existing scale rather than new steps in it.
- **A measure check in `audit.js`.** Reports characters per line (min, median, max) for every
  block of running text, and flags only the unambiguous: over 80, or under 45 where there is
  room to be wider. Characters are counted from a rendered lowercase alphabet, not from `ch` —
  `ch` is the width of `0`, so a 58ch cap reads about 61 characters, and that three-character
  gap is part of how the column looked right in the token and thin on screen.

  Two heuristics were tried and removed. Flagging a column for using little of its container
  fired on 56–65% of every deliberately asymmetric block on the site — it cannot tell an
  authored margin from a starved one, and a check that flags the design's own signature gets
  ignored. Flagging the leading ratio fired on every 16px paragraph, which is one global
  decision, not a per-page fault. The check is also honest that it would **not** have caught the
  bug above: 61 characters is in range, and line length and type size are separate faults.

### Documented

- **`verdigris/README.md` — "Two measures, because `ch` is not a unit of width"**, with the
  resolution table and the rule that `.vd-prose` must never be retuned globally.
- **Two AGENTS.md invariants**: `.vd-prose` serves two registers, and `--vd-measure` in `ch`
  constrains nothing when applied to display type.

## 1.11.0 — 2026-09-12

Five defects found by the first outside consumer of the kit, reported in a build handoff. All
five were verified against the source before being accepted.

### Fixed

- **`template.html` wrote `.vd-readout__label`, which the stylesheet does not define.** Three
  times. `verdigris.css` defines `.vd-readout__key`; `index.html` and `reader.html` both use it
  correctly. The failure is silent — the readout renders, it just loses the mono treatment — and
  it mattered more than an ordinary typo because AGENTS.md sends every author to that file
  first. The one file you are told to copy was the one propagating a dead class.

- **`vd-hero`'s `caption` attribute was never read.** `template.html` set it; `VdHero.upgrade()`
  only ever looked for a `.vd-hero__caption` child. **The starter template's hero rendered no
  caption at all.** The attribute is now read as a plain-text fallback, and the template shows
  the child-element form instead, which is what a real page uses because a credit line usually
  wants markup.

- **A card could not decline to be a link.** `href` defaulted to `'#'` on both card types, so a
  card with no destination became a link to nowhere — and release gate 1 then failed the page
  for carrying it. The case is real: sanitized work whose artifact cannot travel. Omitting
  `href` now renders the title as a `<span>` and leaves the region inert. Applied to
  `vd-note-card` as well; the case is not specific to system cards.

- **Card hover was ungated while the cursor was not.** `vd-system-card:hover` painted the accent
  border and the sunken fill on any card, clickable or not, while only `cursor:pointer` checked
  `[data-clickable]`. The rule's own comment already stated the principle it was breaking: a
  region that looks clickable and is not is worse than one that never claimed to be. Both card
  types now gate hover the same way the cursor does. `:focus-within` stays ungated — it fires
  only when something inside really is focused.

### Added

- **`vd-code[wrap]`** — `white-space:pre-wrap` for a code block holding prose rather than code: a
  quoted text file, an instruction sheet, a log. Code wants the sideways scrollbar; a sentence
  does not. Attribute selector, so it needs no JavaScript.
- **`template.html` demonstrates both new cases** — card 02 has no `href`, and a second
  `vd-code` carries `wrap`. The template is the file people copy, so the capability has to be
  visible in it.

### Changed

- `template.html`'s readouts are `<span>`, matching `index.html`. Both worked; two exemplars
  disagreeing is its own defect.

## 1.12.0 — 2026-09-12

The mobile hero fills the viewport, with the field behind the text rather than beside it.

### Changed

- **The mobile hero was a BAND** — the field in its own grid row above the display line, no mask,
  overlap structurally impossible. It is now full-bleed behind text centred in `min-height:100svh`,
  with the caption and a scroll cue at the bottom.

  The band existed for a stated reason: *"a percentage mask cannot keep a full-bleed field clear
  of text at an unknown content height."* That was correct and no longer applies. The text is
  centred in the hero box, so its centre is the box's centre at every width and a centred mask
  tracks it without knowing the content height. The thing that made the old mask fragile is the
  thing this layout removes.

  `min-height`, never `height`: at 320×568 the stack needs more room than the screen has, so the
  hero grows and the page scrolls rather than clipping. That also keeps 1.4.10 safe at 400% zoom,
  where the viewport is about 256px tall and nothing fits one screen. `svh`, not `vh` — `vh` is
  the large viewport, so a hero sized to it is taller than the screen until the URL bar retracts.

- **Two nested masks, never `mask-composite`.** The wrapper clears the field behind the nav and
  the cue; the canvas holds the centre back to the new `--vd-hero-mask-a`. Clearing the top also
  bought back the nav's own colour: with no field behind it the links stay `--vd-text-muted`,
  which is what the nav is meant to be.

- **The nav overlays the hero** and goes solid once the reader leaves the top, via a
  `data-scrolled` attribute set from scroll position.

### Added

- **`--vd-hero-mask-a`**, per theme: `.48` in ink against a `.62` canvas, `.30` on paper against
  a `1.0` canvas. Both land 0.30 effective, measured on the mobile grid. Do not copy the desktop
  figure — `autoRange` calibrates per grid and the narrow field's worst band is brighter.
- **`vd-hero[cue]`** — an opt-in scroll cue, mobile only, 44×44, `--vd-text`, hidden in print.
  A full-viewport hero puts every other section below the fold with nothing to say so.
- **A ResizeObserver on the field.** A window resize was not the only way the canvas changes
  size: the hero settles after first layout with no window event, and the field kept whatever
  size it had at `upgrade()` — painting a band in the top of a full-bleed box.

### Fixed

- **`--vd-nav-h` was a guess.** Declared 60px and read by the sticky rail and now the hero, while
  the real nav is 134 below 860 and 178 at 320. Measured at runtime and written back.
- **A `@media(max-width:480px)` rule pinned the field wrapper to 160px**, overriding the
  full-bleed geometry at exactly the widths this change is for.

### Measured

Worst case under every hero element, taken from the rendered page rather than the token, because
`audit.js` computes against `--vd-surface` and cannot see a canvas:

| Element | Ink | Paper |
|---|---|---|
| thesis | 13.05 | 12.56 |
| sub | 8.42 | 8.80 |
| caption | 7.16 | 7.41 |
| cue | 9.51 | 10.08 |

## 1.13.0 — 2026-09-13

Four fixes to the mobile hero, all from looking at it on a real phone.

### Changed

- **The nav's two rows now say what they mean.** The toggle rode the mark's row because the
  links row had no spare width, which put identity and a control on one line and destinations on
  another — a wrap accident, not a decision. Row one is who this is; row two is everything you
  can do. Gaps drop to the half-step so three destinations and a control fit one line at 390.
- **The identity row retracts on scroll down and returns on scroll up.** 134px to 75 at 390 —
  wanted when you are working out where you are, in the way while you are reading. A transform,
  not a height animation: the nav is sticky, so the row it vacates is already scrolled past and
  nothing below reflows. Focus always wins over scroll state, in CSS *and* in script, so a
  keyboard reader can never land on a row translated off the top.
- **The field is vibrant again.** It was held to 0.30 everywhere the text might land, which
  dimmed the whole field to protect four words of micro type. The display line is large text —
  4.5:1 is its actual AAA bar — so it now sits on the field at full strength, and the small text
  is cleared outright instead. Measured under the thesis: **9.53 ink, 9.75 paper**, so it clears
  7:1 anyway and the large-text allowance is headroom rather than the argument.
- **The caption is a colophon at the foot**, centred under the cue, with no left rule. The rule
  is what made it read as attached to the display line; what it is, is provenance for the
  background, and that belongs at the bottom.
- **The cue is centred, says SEE WORK, and the arrow trails the label.** "SEE WORK ↓" is an
  instruction with a direction; "↓ SEE WORK" is a label wearing an ornament. 140×44, because the
  target should match what the eye reads as the control. The glyph carries a 3px bob, off under
  `prefers-reduced-motion` — the one movement on this site that earns itself, since saying the
  page continues is the single thing a full-viewport hero cannot do on its own.

### Fixed

- **The caption was never pinned to the bottom, despite 1.12.0 saying it was.**
  `VdHero.upgrade()` appends it *inside* `.vd-hero__inner`, so it is a grandchild of the hero
  grid and `align-self` could never reach it. It is absolutely positioned against the hero now.
  The gate did not catch this because it measures ratios, not positions.
- **`.vd-hero__inner` was `position:relative`**, which captured that absolute caption and pinned
  it to the bottom of the text block instead of the viewport. It is a grid item, so `z-index`
  works without it.

### Added

- **`--vd-hero-mask-dim`** and `data-hero-sub`, the guard above.

## The design record

Moved here from `README.md`, which describes what works now rather than how it got that way.
These are the positions the six calibration passes settled and the prices they were settled
against. Both are historical: the values are current only where the CSS still says so.

### Direction, as settled

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

Klim pricing is the 5,000 monthly-unique-visitor tier. Berkeley Mono's web fonts are a
separately priced module, which put it at nearly twice the budget for the least visible role.
Every shipped face is OFL, self-hosted, and cost nothing.

## Earlier

Not retroactively written up. Calibration 01–04 and the sessions that implemented them are the
record: dark-only retired and the paper theme authored, the topolang drift and density work, the
mask contrast guarantee, and the accessibility measurements in docs §07.
