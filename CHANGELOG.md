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

## Earlier

Not retroactively written up. Calibration 01–04 and the sessions that implemented them are the
record: dark-only retired and the paper theme authored, the topolang drift and density work, the
mask contrast guarantee, and the accessibility measurements in docs §07.
