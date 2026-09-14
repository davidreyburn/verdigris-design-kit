# Changelog

**Semantic versioning, as of 2.0.0.** The old rule was "versioned by what it publishes, not by
semver on an API — nothing consumes it as a package." That stopped being true the moment a site
was built on the kit, and 1.14.0 through 1.16.0 shipped breaking changes as minor bumps because
of it: heading margins that relayout every prose page, a token whose colour changed, a custom
property removed, and a measure whose unit changed under the same name. A consumer pulled a minor
and their card grid silently went from three columns to two.

From here:

| | |
|---|---|
| **MAJOR** | Anything that changes existing pages without their markup changing — a token value, a removed custom property, altered class behaviour, new margins on a shared selector |
| **MINOR** | Additions. A new component, a new opt-in modifier, a new attribute |
| **PATCH** | Fixes that change nothing a consumer depends on |

**One version per handoff, not per commit.** The asset query strings still carry the version, so
a change to served CSS or JS must move it before anyone pulls — but nobody consumes intermediate
states during a working session, and eight versions in a day is churn with no information in it.
Bump once, immediately before pushing.

Entries record what was *measured*, because that is the part that can be wrong. An entry with
breaking changes leads with them.

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

## 1.14.0 — 2026-09-13

The reading view. Five complaints from actually reading a 2,700-word essay in it.

### Fixed

- **Headings in long-form prose had no rhythm at all.** `h1,h2,h3,h4{margin:0}` is global and
  correct for a sectioned page, where `.vd-section` supplies the space. An essay has no such
  wrapper, so an `h2` was a bare sibling of a `<p>`: 30px above — and that 30 is the *previous
  paragraph's* bottom margin, not the heading's — and **0px below**. The heading touched the first
  line of its own section. `.vd-prose h2/h3/h4` now carry it, 90/30 for `h2`, and space above
  always exceeds space below.

- **`-webkit-font-smoothing:antialiased` was costing 26% of the ink on screen.** It forces
  grayscale AA over the platform default, which renders every glyph thinner; light text on dark
  already reads lighter in weight than the same pair inverted, and the two compound. Measured on
  an 18px paragraph in ink: coverage **13.22% with it, 16.68% without**; mean luminance 43.42
  against 50.02. Removed. The colour is untouched, so every ratio published in this repository
  stands. Raising `--vd-text` a step instead buys 3.6% and takes contrast from 11.06:1 to 14:1,
  which is where halation starts for sustained reading — the obvious lever was worth almost
  nothing next to the one nobody looks at.

- **Three right edges stacked down one page.** The title ran the full 928px of the spread body
  while the prose stopped at 689 and the metadata ran wider still. The eye takes the widest as
  true and everything narrower as squeezed, which is why a 70-character column read as cramped.
  Title, masthead and prose now share one edge.

### Changed

- **`--vd-measure-read` is 752px, not 66ch** — about 76 characters, up from 70. The unit is the
  point: `ch` resolves against each element's own font-size, so one token is 752px on 18px prose
  and 2340px on a 56px title and can never make the two agree.

- **Article `h2` drops to a third register, 32px.** The scale is deliberately two-register and
  that holds for UI, where hierarchy comes from weight, case and numbering. It fails across an
  essay: `h2` at 56px was the same size as the article title, so a section shouted as loudly as
  the piece, and `h3` at 18px is the same size as the body it introduces. `--vd-size-section`
  sits clear of both, on a 45px line — one and a half baselines, so the grid holds.

### Added

- **`.vd-article__meta`**, the masthead. A plain `<dl>` in `.vd-prose` renders its values in the
  reading face at reading size, so six rows of metadata *were* prose — the block read as the
  first section of the essay rather than the card in front of it, and cost ~180px before the
  first sentence. Mono values at half leading, a hairline under each row, and a stronger rule
  closing the block. About half the height, and scanned rather than read.
- **The closing rule is the threshold.** It bounds the metadata and it is the line the reader
  crosses into the essay, which is the other half of why the piece used to just start.
- **`.vd-article__body>p:first-of-type`** takes `--vd-text-strong`. One step, nothing else. A
  raised initial is the obvious device and reads as magazine pastiche in a system this geometric.
- **`--vd-size-section`, `--vd-lead-1h`**, and a masthead specimen in `reader.html`.

## 1.15.0 — 2026-09-13

A token that had been failing AAA for as long as the grain has existed, and the second round of
consumer reports.

### Fixed

- **`--vd-bone-400` was published at 7.06:1 and rendered at 6.44:1.** The published figure is
  measured against the `--vd-ink-000` *token*, and no reader ever sees that colour: `body::before`
  lays 5% grain over it, lifting the worst ground pixel from `#161614` to `#1F1F1A`. Every muted
  element in ink — nav links, labels, captions, `dt`, swatch meta — has been under AAA on every
  page since the grain landed. `#A8A192` → **`#B2AB9C`, 7.25:1 against the grained ground.**
  Re-measured across 66 muted elements on four pages: **7.25–7.94 ink, 8.21–8.50 paper**, none
  under 7:1.

  `audit.js` could not have caught this. It resolves tokens and composites against
  `--vd-surface`; an overlay painted by a pseudo-element is invisible to it. The rendered-pixel
  method is the authority, and AGENTS.md now says so.

- **A link in `.vd-article__meta` failed 2.5.8.** Reported by the build agent and confirmed: an
  inline anchor's box is driven by font metrics, not the row's line-height, so a link in a 14px
  mono value measured **193×18** against a 24px minimum. A masthead is where a repo, a DOI or a
  live URL goes — the second thing anyone puts there. `dd a` now carries **45px**, so the row
  closes at 60 and buying the target costs the grid nothing. The specimen gained a linked row,
  because the reason this shipped broken is that four rows of plain text never exercised it.

### Added

- **`--vd-grid-min`**, set on the `.vd-grid` element. `auto-fit` lands on two columns inside
  `.vd-spread__body`, so three cards orphan one — the grid tiles at 2 or 4 and taxes 3, which is
  a content decision it should not be making. `280px` gives three columns in a 928px body. A knob
  on an existing magic number, not a new component.

- **`verdigris/fonts/LICENSES.md` — "Before you subset these further".** The faces are subset but
  broadly, and cutting them tighter is a real saving the kit cannot make (no build step, no
  `fonttools`). The range is **not** Latin-1 plus punctuation: `topolang.js` paints from a mode's
  `fill` and `cfn` arrays, which appear in no stylesheet and no markup, and `≈ ≡ █ ‖` are all
  outside Latin-1. A Latin-1 subset drops them, the field falls back to a system face at a
  different advance, and the grid the renderer assumes breaks — invisibly, because the shipped
  mode is SHADE and its set is pure ASCII. `U+2193` for the scroll cue is the other easy miss.
  Coverage in the shipped faces verified by advance-width probe.

- **AGENTS.md, Shipping:** a downstream subset is lost on every pull, since a fresh `verdigris/`
  copy overwrites both the `.woff2` files and the `@font-face` rules naming them.

## 1.16.0 — 2026-09-13

### Changed

- **The reading column was visibly narrower than the container it sat in**, and the instinct —
  run the line longer — is the wrong fix. Filling a 928px body needs 21–22px type, where 30px
  leading falls to a **1.43** ratio, and the next grid step of 45px is looser still. The grid
  allows a good measure *or* a full container, never both.

  So the gap closes from the other side. `--vd-size-read` is **19px** and `--vd-measure-read`
  **790px**: the same 76 characters as before, bigger type, a wider column, and the leading ratio
  stays at a comfortable **1.58**. `.vd-article` on `<main>` narrows the body cell to 850 — one
  baseline of slack — using the same page-scoped hook `.vd-resume` uses for print.

  `.vd-notes` and `.vd-endmatter` are capped at the measure too. They were the elements still
  running the full 928px, which is what made the prose look short by comparison: endnotes and
  end matter are prose, and belong on the reading measure. A page that has not adopted
  `.vd-article` is therefore still coherent — every element shares the 790 measure, it just sits
  in a wider cell.

### Fixed

- **The card grid produced whatever column count a consumer's `--vd-grid-min` implied.** 1.15.0
  exposed that minimum as an escape hatch and it promptly did what a width-that-implies-a-count
  does: `280px` gave three columns, and three cards at this measure make the body copy inside
  them uncomfortably narrow. `.vd-grid` is now **two columns above 860px and one below**, stated
  rather than derived. `--vd-grid-cols` replaces `--vd-grid-min` — it names the thing being
  chosen instead of a number that implies it.
- **Card proof lines did not share a baseline across a row.** Reported long ago and never fixed.
  Grid items already stretch to equal height, but their content was top-aligned, so the proof
  rules floated at different heights depending on how long the body copy ran. In a system whose
  argument is measurement, the measurements were the thing that would not line up.
  `vd-system-card` is a flex column and the proof takes `margin-top:auto`. Verified: four cards,
  heights 423/423/423/423, every proof rule 31px off the bottom edge.
- **`--vd-grid-card-max`** caps the grid at two 420px cards plus the gutter. Past that the body
  copy inside a card runs longer than a card wants to be read at.

### Corrected

- **`verdigris/fonts/LICENSES.md` claimed `≈ ≡ █ ‖` were present in the shipped faces. They are
  not.** That claim came from an advance-width probe in a browser, which cannot tell a present
  glyph from a substituted one: the fallback for a monospace face is another monospace face,
  landing within hundredths of a pixel of the same advance. The authority is the font's `cmap`,
  and the check that settles it is that adding those four codepoints to a subset range produces a
  **byte-identical file** — nothing was there to keep. Reported by the build agent, who had the
  toolchain to read it directly.

  Consequence, now stated: **STRATA and RELIEF are not usable with these faces.** Their glyphs
  fall back at a different advance and the cell grid comes apart. SHADE is pure ASCII and is what
  the site ships, so nothing is broken today.
- **`U+2193` is carried by PlexMono only; Chivo does not have it.** `.vd-hero__cue` now says so
  beside the `--vd-face-mono` declaration, because changing that family would replace the arrow
  with a fallback silently — a substituted glyph still draws.

## 2.0.0 — 2026-09-13

`vd-form` learns to submit, and the reading register stops being article-only.

**Numbered 2.0.0, and the major digit is overdue rather than earned by this release alone.**
1.14.0 through 1.16.0 each shipped breaking changes as minor bumps, on the strength of a
convention — "nothing consumes it as a package" — that a consumer had already disproved. Those
versions are published and are not being rewritten. The list below is therefore everything that
breaks for anyone upgrading **from 1.13.0 or earlier**, not only what changed today, so the whole
jump can be read in one place.

### Breaking

| Since | Change | What it does to an existing page |
|---|---|---|
| **2.0.0** | `vd-quote blockquote` capped at `--vd-measure-read` | Pull quotes narrow. They were running 91 characters a line |
| **1.16.0** | `--vd-grid-min` **removed**; `.vd-grid` fixed at two columns | A three-column grid becomes two. Use `--vd-grid-cols` |
| **1.16.0** | `--vd-measure-read` changed from `ch` to `px` | Same token name, different unit. Re-derive any override |
| **1.16.0** | `vd-system-card` is a flex column; proof takes `margin-top:auto` | Card internals reflow and the proof line pins to the foot |
| **1.15.0** | `--vd-bone-400` `#A8A192` → `#B2AB9C` | Every muted element in ink lightens. It was failing AAA at 6.44:1 against the grained ground |
| **1.14.0** | `.vd-prose h2/h3/h4` gained margins | Every page with headings inside prose relayouts vertically |
| **1.14.0** | `-webkit-font-smoothing:antialiased` removed from `body` | All text renders heavier. It was costing 26% of the ink on screen |
| **1.14.0** | `--vd-measure-read` 66ch → 752px, `--vd-size-read` 18px → 19px | The reading column widens and the type grows |
| **1.13.0** | Mobile hero rebuilt: full-viewport, field behind the text | Any page using `vd-hero` below 860px changes shape entirely |

None of these require a markup change. All of them change what renders.

### Fixed

- **A pull quote measured 91 characters a line** — the widest text on the site, well past the 80
  any reader tolerates. `vd-quote blockquote` inherits the width of whatever holds it, and in a
  `.vd-spread__body` that is 928px. Capped at the reading measure: **80 characters**.

  **The audit should have caught this and did not.** Its measure check only inspected `<p>`, and a
  pull quote's text sits directly in a `<blockquote>`. The net now covers `blockquote`, `dd` and
  `li` — everything that holds running text — while skipping any element that wraps another, so
  nothing is counted twice.

- **The reading register was welded to `.vd-article__body`**, so the About section on the
  homepage — running prose by any measure — sat at 16px in a 928px column while the essay two
  clicks away had 19px in a 790px one. It is now a modifier, `.vd-prose--read`, and anything read
  rather than scanned can opt in. About measures **790px, 19px, 76 characters**, up from 538px,
  16px, 61.

  Deliberately unchanged: the About `h2` stays at 56px, because a landing-page section head is
  the loudest thing in its band with no title above it competing. The first-paragraph emphasis
  stays article-only — it marks the start of an essay, and elsewhere it is noise.

### Added

- **A submission lifecycle on `vd-form`**, active only when the inner `<form>` has an `action`:
  a fetch POST, a pending state, and the outcome announced in `.vd-form__result` with focus moved
  to it. Focus is what announces a result — the same reasoning as the absent error summary.

  **`action` is the entire transport seam.** A Cloudflare Worker, a hosted form service, anything
  accepting a POST: the kit never learns which and carries no URL, key or address. With no
  `action` it does nothing beyond validating, because a form without an endpoint is a specimen.
  With script off the form posts natively — that path is the platform's, not one this kit
  maintains.

  **`mailto:` is refused deliberately.** Different behaviour in every browser, a half-filled mail
  client handed to the reader, and the address published in the markup — which defeats the reason
  anyone wanted a form.

- **Two spam traps, both silent.** `honeypot` adds an off-screen field; `min-seconds` rejects
  anything submitted faster than a person could read the form. A tripped trap renders success and
  sends nothing, because telling a bot it failed is how it learns to pass. Verified: with the trap
  filled, `fetch` is called **zero** times.

  The trap is positioned off-screen, not `display:none` — a hidden input is trivially detected and
  some assistive tech still reaches it.

  **Stated, not glossed:** a bot that ignores script posts straight to the endpoint and sees
  neither trap. The kit provides the client half and names the contract — the honeypot rides in
  the payload under its own name and the endpoint must reject it non-empty. Server-side
  enforcement is not something a stylesheet and a custom element can promise.

- **Challenge-widget compatibility, with no vendor branch.** The body is submitted with
  `FormData` over the whole form, so a Turnstile-style hidden input rides along. This is also why
  `vd-form` only queries and wires and never rebuilds `innerHTML` — doing so would destroy a
  third-party widget.

- **`.vd-form__result` and `.vd-form__trap`.** The result region is authored and the kit generates
  one only if absent. Pending uses `aria-busy` and the **muted** colour, never `opacity` — the
  existing invariant. Success carries no underline and is never an anchor, because `--vd-ok`
  aliases `--vd-link` and the underline is the only channel separating them.

- **`template.html`** exercises it: honeypot, timing floor, authored result region, and a comment
  explaining that the absent `action` is the point.

### Changed

- **docs §09's contact-form row** said the endpoint is absent because submitting needs a runtime
  dependency. Still true of this site, so the row stays — but it now records that the kit carries
  the lifecycle, since a lifecycle is not an endpoint and the row would otherwise read as false.

## 2.0.1 — 2026-09-13

PATCH: nothing a consumer depends on changes. Published numbers that a value change had
invalidated, and the palette document's rewrite.

### Fixed

- **Four stale contrast figures.** `--vd-bone-400` moved to `#B2AB9C` in 1.15.0 and four places
  still published its old 7.06:1: the token table and the disabled-control note in
  `verdigris/README.md`, the muted invariant in `AGENTS.md`, and the colour constant in
  `tools/og.html`. All now 7.25:1. `docs/` regenerates its swatch table from the running tokens
  and was already correct, which is what made the prose the only place still wrong.
- **`--vd-measure-read`'s comment still described it as 752px** after 2.0.0 moved it to 790.
- **`og.png` regenerated** against the corrected muted colour, and the specimen figure
  placeholder in `reader.html` with it.

### Documented

- **`verdigris.md` rewritten from the voice corpus.** The Concept section is gone — its work is
  done by the two paragraphs that now open the document. The correction section leads with the
  failure, in the first person, and closes on what fixing it required. A new **Where it stands**
  section dates the document and says which artifact is ready, which is the thing a design
  document should do and this one did not. Mechanically: no em dashes, one spelling convention,
  and the two kill-list phrases gone.

### Verified, not changed

- **Print.** Untested all session and now checked on four pages: nav, footer, skip link, hero
  field, scroll cue, form result and buttons are all correctly hidden under the print media type,
  and every page renders a valid PDF.
- **The résumé runs 1192px against Letter's 1056.** Measured against the **pre-session kit** as
  well, which gives an identical 1192 — so this is not a regression from anything in 1.9.0–2.0.1.
  It is the length of what is written, which is exactly where `resume.html` says the one-page
  constraint is enforced. Recorded rather than fixed.

## 2.0.2 — 2026-09-13

PATCH. Two more stale copies of the same figure, in `verdigris.css` comments: the disabled-control
note and the mobile nav-overlay note both still said `--vd-text-muted` holds at 7.06:1. It is
7.25:1.

2.0.1's sweep missed them because the filter excluded every line that mentioned the old value in a
historical sense — and these two read as history but are live claims about the current token. The
remaining three occurrences are genuinely historical and stay: two describe what the value *was*,
and one is a field-band measurement that has nothing to do with muted text.

## 2.1.0 — 2026-09-13

The résumé, from a visual assessment of the live page.

**MINOR.** Two of these are defect fixes — a component escaping its container, and a control
stretched by a flex default — and the rest are scoped to `.vd-resume`, one page type. Nothing
that a consumer builds on changes shape unless they have a résumé page. The table below is still
here, because what matters to someone pulling this is knowing what moves, not which digit did.

### What changes visually

| Change | What it does to an existing page |
|---|---|
| `.vd-resume h2` takes `--vd-size-section` | Résumé section heads drop 56px → 32px |
| `.vd-resume .vd-spread__body` capped at 850px, `h2` at the measure | The résumé column narrows to one edge |
| `.vd-tag` is bounded and wraps | A tag that was overflowing its container now wraps instead |
| `.vd-spread__rail` gets `align-items:flex-start` below 860px | A block child of a mobile rail is no longer stretched |

### Fixed

- **`.vd-tag` escaped the rail's hairline by 7px.** `dreyburn.com` measures **139px** in a rail
  whose content box is **117px**, so it crossed the border and read as broken. No label length
  makes 139 fit in 117, so the fix could not be wording: the box is bounded and the label wraps
  inside it. A tag that is too long for its column now gets taller, never wider. If the wrap looks
  wrong, the label is wrong for the column — which is the signal, not a defect.

- **A control in a mobile rail was stretched to the strip's full height.** Below 860px the rail
  becomes a flex strip, and a flex container defaults to `stretch` — so a 50px button measured
  **114×147**, a target three times the size of the thing it looked like. Readouts and labels
  never showed it; the first control put in a rail did.

- **Résumé section heads matched the name.** Both `h1` and `h2` were `--vd-size-xl`, which inverts
  the hierarchy on a document whose job is a seven-second scan. And three right edges ran down one
  page — `h1` 790, summary 543, `h2` **928**. One edge now, the same fix `.vd-article` got.

- **A print regression I introduced and caught.** `.vd-resume h2` at (0,1,1) outranks `print.css`'s
  bare `h2` at (0,0,1), so the first version of this change made the résumé print **larger** heads
  than before — 1231px against Letter's 1056, worse than the 1192 it started at. `print.css` now
  sets the size as well as the margin, and print is back to 1192.

### Added

- **`[data-vd-print]`**, a print control. `window.print()` is one line, so the line is not what
  the kit is for: the 44px target, hiding the button on paper, and a fallback that survives with
  script off. The button is authored `hidden` and unhidden by script; `[data-vd-print-alt]` marks
  the instruction that script then hides. Only one ever shows.

### Not fixed, and deliberately

**The résumé still prints 1192px against Letter's 1056.** Verified against the pre-session kit in
2.0.1 — identical then, identical now — so nothing here caused it and nothing here can fix it.
It is the length of what is written, which is where `resume.html` says the constraint lives.

## 2.1.1 — 2026-09-14

PATCH: a layout fault 2.1.0 introduced, found once the build dropped the rail.

### Fixed

- **The résumé column hugged the left.** 2.1.0 capped `.vd-resume .vd-spread__body` at 850px to
  close the gap between 790px content and a 928px cell — correct while the page still had a
  132px rail, which balanced the composition. The build then removed the rail *and* the
  `.vd-spread` grid, leaving the cap to left-align an 850px column in a 1120px page: **160px of
  margin on the left against 430 on the right.** It read as content that had slid off centre.

  `margin-inline:auto`. The column now sits 295→1145 at 1440 and 215→1065 at 1280, symmetric at
  both.

  Two alternatives measured and rejected. Letting the body fill the page changed nothing, because
  the text inside is capped at the measure and nothing painted in the space it gained. Narrowing
  `--vd-page` on the résumé put the content in exactly the same place as the auto margins, for a
  token override and a wider blast radius.

  **The nav mark stays at the page's left edge and deliberately does not follow.** The nav is
  chrome and is identical on every page; a mark that jumped position between the homepage and the
  résumé would be a worse inconsistency than a static offset. A full-width bar over a centred
  sheet is what a document viewer looks like, and a résumé is a sheet.

## 2.2.0 — 2026-09-14

Seven items from the build agent. Six verified against source and acted on; one I could not
reproduce and did anyway, because the risk behind it is structural.

### Fixed

- **A hand-authored card lost four behaviours silently.** `VdSystemCard` and `VdNoteCard` opened
  with an early `return` when the author had written the internals — which protected the markup
  and threw away `makeRegionClickable` with it. No `data-clickable`, and since 2.1.0 gated the
  hover treatment on that attribute, the card lost its accent border, its sunken fill, its title
  underline and its click target at once. Nothing warned.

  Construction is what must not clobber authored markup; behaviour is not construction. Only the
  building is skipped now, and the region is wired either way. Verified: an authored card keeps
  its markup, gains `data-clickable`, and matches the hover gate. A card with no `href` still ends
  up inert, because `makeRegionClickable` checks for one.

- **`og.png` was the one versioned artifact with no cache key.** No query string on `og:image`,
  and `.htaccess` caches images for 30 days — so when 2.0.1 regenerated the card the edge kept
  serving the old one and there was nothing to change. Now `og.png?v=<version>`.

- **The hero `<cite>` was pulling a whole font face for one word.** `plex-mono-400-italic`, 10 KB,
  loaded on every page with a hero, for *Drift*. A citation does not need a slope: the step to
  `--vd-text-strong` and wider tracking already separate it, and they are the channels the system
  uses for emphasis everywhere else. Verified: the homepage now loads **five** faces, not six.

### Added

- **`.vd-scroll-x`**, the containment `.vd-table-scroll` provides, named for everything that is
  not a table. A third-party widget with a min-width larger than its column — a captcha, usually
  around 300px — pushes the document sideways rather than overflowing quietly, which is a 1.4.10
  failure on a site that publishes its reflow numbers.

  **I could not reproduce the specific break.** At 320px the live form measures 290px wide and a
  300px child produced zero document overflow, because it starts at x=15 and ends inside the
  viewport. The reported 245px column implies a narrower container than I can find. The utility
  ships anyway: the risk does not depend on that one instance.

- **The endpoint contract, in `verdigris/README.md`.** Four things `vd-form` requires that were
  only discoverable by reading `verdigris.js`: the body is `FormData` and not JSON, any `2xx` is
  success and the response is ignored, the honeypot arrives as a normal field, and the timing
  floor never reaches the server. Getting the first wrong is a silent `400`.

- **A note that a challenge widget ends "no external requests."** That claim is load-bearing on a
  site built from this kit, so the kit now says which features cost it.

- **`tools/subset.sh`.** The kit still cannot subset — no build step, no `fonttools` — but it can
  stop consumers guessing at the range. Six of the glyphs in it are painted from JavaScript or CSS
  `content` and appear in no markup: `✓` and `‼` (form states), `…` (pending), `−` (details
  marker), `—` (list marker), `↓` (scroll cue). A Latin-1 subset drops every one, and each fails
  silently because a substituted glyph still draws.

### Documented

- **Each topolang mode's font requirement**, as an obligation rather than a fact. SHADE is pure
  ASCII and works; STRATA needs `≈ ≡ █ ‖` and RELIEF needs `█`, none of which the shipped faces
  carry. The runtime keeps all three — it implements `spec-topolang v1.3.2` and `selfTest()`
  asserts conformance against the spec's own vector, so dropping a mode would make that claim
  false. What is constrained is the fonts, not the renderer.

- **Chivo 500 and 600 stay, and why.** This was asked twice. It was answered the first time and
  **never written down**, which is the same as not answering: rendered side by side at 56px they
  are plainly different weights. The saving is real and it costs the display voice. The
  inconsistency to settle first is `.vd-role__title` at 500/18px against `.vd-system-card__title`
  at 600/18px — two title-alikes at one size in two weights.

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
