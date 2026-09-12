# Verdigris

A hand-authored design system: framework-agnostic CSS and light-DOM custom elements. No build
step, no dependencies, no npm, no external requests, no Tailwind. Everything it needs — three
typefaces, a generative field runtime, a conformance harness — is in the repository and served
from it.

It ships with its own documentation site and a reference implementation built on it.

| | |
|---|---|
| `verdigris/` | **The kit.** Tokens, components, print stylesheet, audit harness |
| `docs/` | The system documented, with its conformance runner |
| `index.html`, `resume.html` | The reference implementation |
| `template.html`, `reader.html` | Starter pages — copy these |

`verdigris/README.md` is the component and class reference. [AGENTS.md](AGENTS.md) is the
working contract: how to build a page, what breaks silently, and what to run before shipping.

## Serve it

```sh
./serve.command     # macOS and Linux — also double-clickable in Finder
serve.cmd           # Windows
```

**Run it in your own terminal and leave the window open.** A server started by an agent lives
only as long as its session and gets reaped; this one lasts as long as the window does. Both
scripts detect a server already on 8787 and open the browser instead of failing on a bind error.

| | |
|---|---|
| Reference site | <http://127.0.0.1:8787/index.html> |
| Design system | <http://127.0.0.1:8787/docs/> |
| Starter template | <http://127.0.0.1:8787/template.html> |
| Mobile harness | <http://127.0.0.1:8787/preview-mobile.html?w=320,390> |
| Calibration record | <http://127.0.0.1:8787/calibration/> |

**Do not open pages from `file://`.** Chrome restricts `localStorage` there, so the theme toggle
silently stops persisting and the calibration instruments fail to autosave.

The mobile harness renders only the widths in `?w=` and cache-busts each frame, so a CSS fix can
never be hidden behind a stale iframe. `&y=` sets scroll position.

## Use it

```html
<link rel="stylesheet" href="verdigris/verdigris.css">
<link rel="stylesheet" href="verdigris/print.css">
<script src="verdigris/topolang.js" defer></script>   <!-- only if the page has a field -->
<script src="verdigris/verdigris.js" defer></script>
<script src="verdigris/audit.js" defer></script>
```

Copy `template.html` rather than assembling a page from the reference — it uses every major
element once, with the reasoning written beside it. Every component upgrades markup that is
already valid and semantic without JavaScript, and nothing uses shadow DOM.

Assets carry a `?v=` query string. Bump it whenever CSS or JS changes, or browsers and the CDN
will keep serving the old file.

`LICENSE` governs reuse: this is published to be inspected, not lifted.

## What it is

- **Three token tiers.** Primitives, semantic roles, component values. Components never reach
  into tier 1, so every value follows the theme.
- **Two themes.** Ink and paper, both measured. The theme is a reader choice that persists, and
  falls back to `prefers-color-scheme`.
- **Fourteen `vd-*` elements** — nine registered custom elements, five CSS-only styling hooks.
  Documented for editors and tooling in `custom-elements.json`.
- **`topolang.js`** — a conformant topolang v1.3.2 runtime that draws the generative field.
- **`print.css`** — paper is a real target, not a stylesheet afterthought. The résumé is
  designed for it.
- **`audit.js`** — the conformance harness, shipped on every page rather than kept in a drawer.

## What it guarantees

Every claim below is produced by measuring a rendered page. `docs/` re-runs the contrast and
conformance checks live from the running tokens rather than printing a stored table.

| Check | Result |
|---|---|
| Contrast, all text tokens | AAA, 7:1 or better, in both themes |
| Reflow, WCAG 1.4.10 | Passes at 320 CSS px. Document scroll width 305 against a 305 client width — zero overflow — on every page, both themes |
| Target size, 2.5.8 AA | Every target passes |
| Target size, 2.5.5 AAA | Every standalone control and card passes. The card is the target, with the click forwarded under drag, selection and nested-interactive guards |
| Form controls, 1.4.11 | Every control boundary 3:1 or better against its adjacent surface, both themes |
| Colour vision | Viénot 1999 simulation published for every same-context pair, including the two that **fail** and what carries them instead |
| topolang conformance | 9/9 against the spec's own published vector, run live on the docs page |

Not done: screen-reader transcripts, which need NVDA or VoiceOver driven by hand and cannot be
automated honestly. React and Astro adapters are deliberately absent — see docs §09.

## Deploying

The reference site runs on Hostinger behind Cloudflare. Deploy is a file copy; `.htaccess` is
the only server configuration. Cloudflare caches everything under `verdigris/` and does not
cache HTML, so **changing CSS or JS under `verdigris/` without bumping `?v=` ships new
markup against last week's stylesheet.** The full rule and the release gate are in
[AGENTS.md](AGENTS.md) under **Shipping**.

## Files

| File | Purpose |
|---|---|
| `verdigris/` | **The kit.** See `verdigris/README.md` |
| `verdigris/fonts/` | Chivo, Literata, IBM Plex Mono — 13 faces, each with its verbatim OFL licence |
| `index.html` | The reference homepage |
| `work/`, `notes/` | Case studies and Field Notes — `work/<slug>.html` |
| `resume.html` | Résumé. Print is the deliverable, the screen is the courtesy |
| `docs/` | The system documented, with the live conformance runner |
| `404.html` | Not-found page. Reached through `.htaccess`, not by filename |
| `template.html` | Starter page, every element once. A specimen — copy it, do not edit it |
| `reader.html` | Case-study and Field Note template. Also a specimen |
| `custom-elements.json` | Element manifest for editors and tooling. Hand-authored |
| `.htaccess` | 404 mapping and cache headers. The deploy artifact |
| `robots.txt`, `sitemap.xml` | Crawl policy and the published URL list. Both hand-maintained |
| `og.png`, `tools/og.html` | Social card, and the harness that draws it. Regenerate, do not hand-edit |
| `tools/audit.mjs` | Runs the conformance audit over every page in both themes and at 320px |
| `serve.cmd`, `serve.command` | Dev server, Windows and macOS/Linux |
| `preview-mobile.html` | Width harness. `?w=320,390` picks widths, `&y=` sets scroll |
| `calibration/` | The instruments that settled each decision. See `calibration/README.md` |
| `verdigris.md` | The terminal palette this system translates to the web |

## Where the history lives

This file and `verdigris/README.md` describe what works now. They are not a record of how it got
that way.

- **`CHANGELOG.md`** — what changed in each version, what was measured, and what turned out to
  be wrong. Including the typeface licence survey and the decisions that were reversed.
- **`calibration/`** — six questionnaire passes, complete, with the answers that produced the
  system. Historical record; nothing in the site references it.
