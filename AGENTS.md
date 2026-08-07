# Working in this repository

Verdigris is a hand-authored design system and the site built on it. No build step, no npm, no
framework, no shadow DOM. Everything is plain CSS, plain JS and custom elements in light DOM.

**Read `LICENSE` first.** This repository is published to be inspected, not reused. If you are
here to lift the system into another project, the answer is no — ask David instead. If you are
here to work *on this site*, carry on.

Start from `template.html`. It is a working page using every major element once, with the
reasoning written beside it.

---

## Where facts live

Four documents overlap. When they disagree, this is the order of authority:

| File | Owns | Do not look here for |
|---|---|---|
| `verdigris/verdigris.css` | **The truth.** Token values, and the reasoning in comments beside them | Narrative |
| `docs/index.html` | Measured conformance claims, published with their failures | Implementation detail |
| `verdigris/README.md` | How to use the kit; component and class reference | Why the palette exists |
| `verdigris.md` | The terminal palette's origin and its translation to the web | Anything about layout |
| `CHANGELOG.md` | What changed, what was measured, what was corrected | Current state |

The CSS wins. A comment beside a token is more current than any prose file, because it cannot
be updated without touching the value it describes.

`custom-elements.json` documents the nine custom elements for editors and tooling. It is
hand-authored and carries a `checkedAgainst` field; if you add or change an element, update it.

---

## Verify your work — do not assert it

```html
<script src="verdigris/audit.js"></script>
```
```js
verdigrisAudit()             // readable summary
verdigrisAudit({json:true})  // structured, for you
verdigrisAudit.tokens()      // every --vd-* token with its ratio on the current ground
verdigrisAudit.classes()     // every .vd-* class the stylesheet defines
```

It checks text contrast (1.4.6 AAA), control boundaries (1.4.11), target size (2.5.8 / 2.5.5),
reflow (1.4.10), whether wide tables are wrapped, and the rule that the data colour is numerals
only. Two of the three bugs fixed in v1.7.0 were found by this script on pages that had already
been reviewed by eye.

**A full check is three page loads**, and there is no shortcut:

1. ink theme — `localStorage.setItem('verdigris-theme','dark')`, then reload
2. paper theme — `'light'`, then reload
3. 320px width — load the page in a 320px iframe, which has its own viewport so media queries
   fire. Constraining a `<div>` does not fire them and proves nothing.

> **Do not switch theme and audit in the same tick.** Custom properties on `:root` recompute
> immediately, but descendants keep their previously resolved values until style recalculation
> finishes. You will get a confident report full of failures that do not exist, mixing one
> theme's text against the other's background. This wasted hours during development, more than
> once. One theme per page load.

The same trap applies to any `getComputedStyle` reading after a style change. If a measurement
contradicts what a screenshot shows, believe the screenshot and re-measure on a fresh load.

---

## Invariants

These break silently. The page still renders; something measured is just quietly wrong.

**Edit both light-theme blocks together.** The paper mapping exists twice — once inside
`@media (prefers-color-scheme: light)` for the system preference, once as `:root[data-theme="light"]`
for the explicit override. Changing one and not the other means the theme toggle and the OS
preference disagree. They are adjacent in the file and commented; keep them that way.

**`print.css` overrides an exhaustive token list.** Any semantic token you add that resolves to
a tier-1 primitive must also be listed there, or the screen value prints. Teal is the worked
example: `--vd-editorial` was missed and printed at 2.38:1 on white.

**Components never reference tier-1 primitives.** A component reads `--vd-structure`, never
`--vd-green-400`. Reaching into tier 1 means the value cannot follow the theme — lime is 1.05:1
on paper, so a focus ring hard-wired to it is invisible in light mode.

**The data colour is numerals only.** `--vd-data` marks quantities. Not grades, not statuses,
not `PASS`. `vd-system-card` enforces this in code; the audit checks it everywhere else.

**Wrap wide tables in `.vd-table-scroll`.** Without it a wide table scrolls the whole document
sideways at 320px, which is a 1.4.10 failure. The audit checks this specifically.

**Do not remove the underline on inline links.** It is load-bearing in two places: `--vd-ok`
aliases `--vd-link`, so the underline is what separates a success message from a link; and
`--vd-editorial` teal collapses onto link blue for a deuteranope. Remove it and both become real
collisions. See docs §10.

**`--vd-teal-400` is retired.** It measured 6.67:1 and failed its own tier. Use `--vd-teal-500`
(`#4FB8AF`, 7.60:1) or `--vd-patina-500` (`#0F4F4A`, 8.02:1 on paper) via `--vd-editorial`.

**Control boundaries use `--vd-control-border`, never `--vd-rule` or `--vd-rule-strong`.** A
decorative hairline is exempt from 1.4.11; the boundary of an input or a button is not, and
needs 3:1. The rule tokens measure 1.28–1.64:1 against the page.

**Nothing inside the hero may use the muted text value.** The generative field is masked to a
capped alpha across the text column, and muted measures below 7:1 against the worst composite.

**Never `opacity` a disabled control.** It composites the text toward the surface and destroys
the measured ratio. Use the muted text colour, which is still legal at 7.06:1 / 8.50:1.

---

## Conventions

- **Comments explain why, not what.** Every non-obvious declaration in `verdigris.css` says what
  it costs and what breaks without it. Match that. A comment saying `/* set the colour */` is
  worse than none.
- **Publish failures.** The docs page lists values that fail and why they are never used for
  text, and corrects two claims that turned out to be false. A table with no failing rows
  usually means the failing rows were left out.
- **Measure, then state.** Every number in this repository was produced by measuring a rendered
  page. If you cannot measure it, say it is unmeasured rather than asserting it.
- **No padding/margin shorthands on composable classes** — see `verdigris/README.md`.
- Assets carry a `?v=` query string. Bump it when you change CSS or JS, or browsers will serve
  the old file and you will spend an hour debugging a fix that already landed.

## What is deliberately absent

Framework adapters, a Figma kit, a token pipeline, dropdown menus, tabs, a modal, and a working
form endpoint. Each is recorded with its reason in docs §09. **Do not add them speculatively.**
If you think one is needed now, say why the reason in §09 no longer holds.

Screen-reader transcripts have not been recorded. That needs NVDA or VoiceOver driven by hand
and cannot be automated honestly, so it is listed as absent rather than claimed.

## Layout

```
index.html          the site
template.html       starter page — copy this
docs/               the design system, published as a portfolio piece
verdigris/          the kit: verdigris.css, verdigris.js, topolang.js, print.css, audit.js
calibration/        the questionnaires that settled each decision. Historical record
archive/            evaluated and rejected. Nothing here is referenced
.private/           not published, gitignored. Do not read or surface it
```
