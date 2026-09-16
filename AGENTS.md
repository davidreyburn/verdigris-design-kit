# Working in this repository

Two things live here. **The kit** is `verdigris/` — a hand-authored design system, usable by any
project: plain CSS, plain JS, custom elements in light DOM. **The reference site** is everything
at the root plus `docs/`, and it is the kit's first consumer. No build step, no npm, no
framework, no shadow DOM anywhere in either.

Sections below marked *(reference site)* carry rules specific to that site — its URLs, its host,
its contact policy. Everything else applies to the kit wherever it is used.

**Read `LICENSE` first.** This repository is published to be inspected, not reused. If you are
here to lift the system into another project, the answer is no — ask David instead. Two things
are carved out and do carry reusable licences: `verdigris/topolang.js` is Apache 2.0, and
`verdigris/fonts/` is OFL. If you are here to work *on this site*, carry on.

Writing a page? Go to **Building a page** below — it names which template to copy and where
the file lands. `template.html` is a working page using every major element once, with the
reasoning written beside it; read it before you write markup by hand.

---

## Where facts live

These overlap. When they disagree, this is the order of authority:

| File | Owns | Do not look here for |
|---|---|---|
| `verdigris/verdigris.css` | **The truth.** Token values, and the reasoning in comments beside them | Narrative |
| `docs/index.html` | Measured conformance claims, published with their failures | Implementation detail |
| `verdigris/README.md` | How to use the kit; component and class reference | Why the palette exists |
| `verdigris.md` | The terminal palette's origin and its translation to the web | Anything about layout |
| `CHANGELOG.md` | What changed, what was measured, what was corrected | Current state |

The CSS wins. A comment beside a token is more current than any prose file, because it cannot
be updated without touching the value it describes.

`custom-elements.json` documents all **fourteen** `vd-*` elements for editors and tooling — nine
registered custom elements and five CSS-only styling hooks (`vd-nav`, `vd-footer`, `vd-quote`,
`vd-figure`, `vd-meta`). It is hand-authored and carries a `checkedAgainst` field. If you add or
change an element, update it — and verify against **both** the `defs` array in `verdigris.js` and
the `vd-*` selectors in `verdigris.css`. Checking only the first is how the five CSS-only ones went
missing while the manifest reported an exact match.

---

## Building a page *(reference site)*

Copy a template. Do not author a page from scratch, and do not edit a template in place.

| Writing | Copy | Lands at |
|---|---|---|
| A case study | `reader.html` | `work/<slug>.html` |
| A Field Note | `reader.html` | `notes/<slug>.html` |
| Anything else | `template.html` | `<slug>.html` |

**URLs are flat and carry `.html`.** `work/agent-os.html`, never `work/agent-os/`. Write the
extension in every href. The host would strip it and `python -m http.server` would not, so a
directory-style URL works in production and 404s on the dev server — the worst possible split.
The two exceptions are directory indexes that already exist: the site root, whose canonical is
`https://dreyburn.com/`, and `docs/`.

**A copy in `work/` or `notes/` is one directory down, so every relative path gains a `../`.**
The stylesheets, every script, the nav's four links, and the footer's. The nav and footer links
are the ones that get missed, because the page still renders correctly without them — it just
sends every reader to a 404.

**`reader.html` and `template.html` are specimens, not pages.** They stay at the root, stay
generic, and keep their placeholders — that is what makes them copyable. A *copy* is not
finished while it still holds `href="#"`, a `figure placeholder` or `hero placeholder` data-URI,
or previous/next links pointing nowhere. If the piece has no picture, **delete** the hero block
rather than leaving the placeholder in it.

### Every page carries

```html
<link rel="canonical" href="https://dreyburn.com/work/<slug>.html">
<meta property="og:url"   content="https://dreyburn.com/work/<slug>.html">
<meta property="og:title" content="...">   <!-- the <title>, without the site suffix -->
<meta property="og:description" content="...">  <!-- the same text as <meta name=description> -->
<meta property="og:image" content="https://dreyburn.com/notes/og-<slug>.png?v=2.6.2">
```

Absolute URLs, every time — a relative `og:image` is ignored by every crawler that reads it.
`og:type` is `article` for anything in `work/` or `notes/`, `website` elsewhere. The rest of the
head — charset, viewport, `color-scheme`, the blocking theme script, the asset tags and the
favicon — is already correct in both templates. Copy it, do not retype it. A reader page needs
`topolang.js` only if it carries a field, which by Calibration 06 it does not.

`audit.js` ships on every page. It is deferred and inert until called, and a system that
publishes its own conformance does not hide the instrument that measures it.

### A piece with a picture declares it three times

Optional throughout. A piece with no picture is a complete page, a complete listing row and a
complete share card — the card falls back to the field. Do not go looking for an image to
satisfy the pattern.

When there is one, it is the *same* picture and the *same* crop in all three places:

| Where | What to write |
|---|---|
| The article | `<vd-figure class="vd-article__hero" style="--vd-hero-focus:50% 35%">` after the dek |
| `index.html` | `image="/images/<name>.webp"` on that piece's `vd-note-card` |
| The share card | `tools/og.html?title=…&meta=…&image=/images/<name>.webp&focus=50,35` |

Nothing deduplicates these. Changing the picture or the focus means changing three files, and
the share card is the one that will be forgotten, because it is a binary nobody re-reads.

**Point `image=` at the hero file, not a small crop of it.** The thumbnail is a 90px square on
a desktop and a full-bleed 16:9 band on a phone — a nine-fold spread — so a 180px file cut for
the square slot is upscaled about 4× on mobile and looks soft. The hero is already large and
already on disk; the browser downsamples it for the square for free.

**Set `--vd-thumb-focus` when the subject is off-centre.** The square slot crops to the middle
by default, which takes the middle of a portrait and can cut a face in half.

**Drawing the card.** Serve the repo, open the harness with those parameters, press Save, put
the PNG beside the article, and bump its `?v=` in `og:image`. Use a *path* for `image=` — a
cross-origin URL taints the canvas and the Save button silently stops working.

**The hero `<img>` keeps its `width` and `height`** even though the CSS overrides both. They are
the aspect ratio the browser reserves space from; without them the article jumps when the file
lands. No `loading="lazy"` on a hero — it is above the fold by definition.

**Name image files by what they are, with the right extension.** A WebP called `.jpeg` is served
with the wrong `Content-Type` by some hosts and confuses every tool that reads the name instead
of the bytes.

### A portrait goes in the About rail, and nowhere else

`.vd-portrait` is optional. If there is one, it goes in `#about`'s
`.vd-spread__rail`, under the label — 120px, grayscale, grained, inert.
Full reasoning in `verdigris/README.md`.

Two site-level consequences:

- **Add `"image"` to the `Person` object in `index.html`'s JSON-LD**, absolute
  URL, same file. A portrait the page shows and the structured data omits is a
  knowledge-panel left on the table.
- **Not on `resume.html`.** In US hiring practice a photograph on a CV is a
  liability rather than a courtesy, and the résumé is already being trimmed to
  one printed page. `print.css` hides the component everywhere, so this is
  about the screen.

Source file: WebP or AVIF at twice the rendered box — 240px for the 120px slot
— named with the extension it actually is.

### The résumé PDF is one page, and the form never goes on it

`print.css` removes every form control from every printed page, so the contact
form on `resume.html` no longer prints — that alone took the live résumé from
**5 pages to 2** with no content change.

Two things left to do on the page itself:

- **Mark the whole Contact section `data-vd-screen-only`.** The kit hides the
  form; the heading and the sentence introducing it are yours to judge. Worth
  86px.
- **Trim roughly 10 bullet lines.** After both of the above the résumé
  measures 1114px against a 920px page — 194px over. A bullet line is 19px.
  Experience is 71% of the sheet at 18 bullets across four roles; the two
  oldest roles carry 5 bullets between them and could carry 3.

Do not solve it by shrinking the type. 9.5pt/1.32 was measured and still
lands at 1.05 pages, so it buys nothing and costs legibility.

**Use `data-print-as` on the contact links.** Without it they print
`LINKEDIN <HTTPS://WWW.LINKEDIN.COM/IN/DREYBURN/>` — uppercase and
letter-spaced, because `.vd-tag` is both and `::after` inherits them. With it,
one quiet line under the name. An empty value suppresses the URL where the
link text is already the address.

**Check the page count, do not estimate it.** `Page.printToPDF` over CDP
returns the real number; `document.body.scrollHeight` at 665px wide under
`setEmulatedMedia('print')` returns the flow against a 920px budget.

### Never put an email address on this site

Not a `mailto:`, not in prose, not in the résumé, not in print, not in JSON-LD. The site is
public and scrapable; LinkedIn is the contact channel. A contact section that wants an address
links to LinkedIn instead. The form kit in docs §10 is a specimen with no endpoint and stays
that way.

This is the rule most likely to be broken by reflex, because "add a contact section" and "add a
mailto" are the same motion almost everywhere else.

### Numbers in the rail are measurements

`index.html` claims `04 Systems`, `03 Published` and `7,300 Words`. Those are assertions about
what is actually on the site. Ship fewer pages and the numbers are wrong — and a number in the
data colour that nobody can verify is precisely the failure this system exists to argue against.
Recount, do not round.

---

## Shipping *(reference site)*

Served from Hostinger (Apache/LiteSpeed) behind Cloudflare, at `dreyburn.com`. Deploy is a file
copy. There is no build, no pipeline, and nothing to invoke.

**`.htaccess` is the deploy artifact.** It carries the 404 mapping and the cache headers. A bare
`404.html` is never used unless `ErrorDocument` names it.

**Cloudflare caches `verdigris/` and does not cache HTML.** Pages go live on upload; CSS, JS and
fonts do not — the edge keeps serving the old file until the query string changes.

**Semantic versioning, and the major digit is not decorative.** MAJOR is anything that changes an
existing page without its markup changing — a token value, a removed custom property, altered
class behaviour, new margins on a shared selector. MINOR is additions. PATCH is fixes nobody
depends on. The kit *is* consumed now, so a consumer must be able to read the number and know
whether pulling will move their layout. 1.14.0 through 1.16.0 each broke something and each
shipped as a minor; a consumer pulled one and their card grid went from three columns to two with
nothing in the version to warn them.

**One version per handoff, not per commit.** Nobody consumes intermediate states during a working
session. Bump once, immediately before pushing, and lead the changelog entry with a `### Breaking`
table if there is anything in it.

> **If any CSS or JS under `verdigris/` changed, bump the version.** In `?v=` on every page, and
> in `CHANGELOG.md`. Leaving it alone does not mean "no change shipped" — it means every
> returning reader gets last week's stylesheet against this week's markup, and the bug reports
> will describe a page you cannot reproduce.

**A consumer that re-subsets the fonts loses it on every pull**, because a fresh `verdigris/`
copy overwrites both the `.woff2` files and the `@font-face` sources that name them — leaving a
page that references thirteen files which are not there. The kit does not subset further itself:
it ships no build step and no `fonttools`. If you do it downstream, read
`verdigris/fonts/LICENSES.md` first — `topolang.js` paints from arrays that appear in no
stylesheet and no markup, and **four of those glyphs are in none of the shipped faces**, so
STRATA and RELIEF are unusable until someone adds faces that carry them.

Documentation under `verdigris/` is not served, so it does not count. Fonts are cached
`immutable` and content-addressed by filename: a changed face is a new file, never an edit in
place.

### Release gate

Run all six before calling a build done. Each has caught something real. They are scoped to the
pages that ship — `docs/` and the calibration instruments contain deliberate `href="#"` specimens
and are not checked.

```sh
# 1 — no dead links on a published page
grep -rn 'href="#"' index.html resume.html 404.html work notes 2>/dev/null

# 2 — no template scaffolding survived a copy
grep -rEn 'figure placeholder|hero placeholder|portrait placeholder' work notes 2>/dev/null

# 3 — one asset version across the site, and it moved if verdigris/ did
grep -rho '?v=[0-9.]*' --include='*.html' . | sort -u   # exactly one line
git diff --stat HEAD -- 'verdigris/*.css' 'verdigris/*.js'   # non-empty ⇒ that line must be new

# 4 — 404.html has no relative paths. It is served at any depth, so a
#     relative href resolves against the URL that missed, not against root
grep -nP '(href|src)="(?!/|https?:|#)' 404.html

# 5 — every sitemap URL resolves to a file that exists
grep -oE '<loc>[^<]+' sitemap.xml | sed 's|<loc>https://dreyburn.com||' | while read -r u; do
  case "$u" in */) f=".${u}index.html";; *) f=".${u}";; esac
  [ -f "$f" ] || echo "MISSING $u"
done

# 6 — the social card exists, and still says what the hero says. It is the
#     one copy surface grep cannot reach; tools/og.html redraws it.
[ -f og.png ] || echo 'og.png missing — regenerate with tools/og.html'
grep -o 'thesis="[^"]*"' index.html   # compare by eye with the card
```

1, 2, 4 and 5 must print nothing. Then, with the server and headless Chrome up:

```sh
# 7 — every page, ink + paper + 320px. Exits non-zero on a measured failure.
#     find, not a glob: zsh aborts the whole command on an unmatched one,
#     so work/ and notes/ not existing yet would take the line down with them.
PAGES=$(find . -name '*.html' -not -path './calibration/*' -not -path './tools/*' \
        -not -name 'preview-mobile.html' \
        | sed 's|^\./||' | sort | paste -sd, -) node tools/audit.mjs
```

Audit **every** new page, not one representative one: reflow failures are per-layout, and every
case study has a different layout.


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
only. Several real bugs were found by this script on pages that had already been reviewed by eye.

`fails` is a measured failure. `notes` is "worth looking at" — it does **not** implement 2.5.5's
Spacing exception, under which an undersized target still conforms if a 44px circle centred on it
does not overlap another's. A narrow but well-spaced nav link appears in `notes` without being a
failure. Do not report notes as violations.

`tools/audit.mjs` drives all of it — every page, every load — over the DevTools protocol
using Node's built-in WebSocket, so it adds no dependency:

```sh
./serve.command                                    # in its own terminal
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 --no-first-run \
  --user-data-dir=/tmp/vd-audit about:blank &      # never your real profile
node tools/audit.mjs                               # exits non-zero on a measured failure
```

`PAGES` defaults to **this** site's pages, specimens included. A site built on the kit that
ships none of them must override it — the release gate below derives the list with `find`, which
is the form to copy.

It disables the HTTP cache first. Without that the audit will measure the page as it was before
your last edit and report it as passing, which is worse than not running it.

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

**Never write `href="#"` to mean "no destination".** Omit `href` and the card title renders as a
`<span>`, the region stays inert and the hover treatment does not fire. `#` is a link to nowhere
and release gate 1 fails the page for it. This is the supported way to ship sanitized work whose
artifact cannot travel.

**Headings are `margin:0` globally, and `.vd-prose` overrides that.** A sectioned page gets its
rhythm from `.vd-section`; long-form has no such wrapper, so an `h2` in an essay inherited nothing
and sat flush against the text it introduced. `.vd-prose h2/h3/h4` carry the rhythm, and space
above always exceeds space below — that is what binds a heading to the section it opens rather
than the one it closes.

**`--vd-measure-read` is a px length, not `ch`, and that is deliberate.** `ch` resolves against
each element's own font-size, so the same token is 790px on 19px prose and 2340px on a 56px
title — it cannot make two elements share an edge, which is its job. It is derived by hand (790px
at the 19px reading size, ~76 characters); if `--vd-size-read` moves, re-derive it.

**The reading column cannot fill its container, and that is arithmetic, not an oversight.**
Filling a 928px body needs 21–22px type, where 30px leading falls to a 1.43 ratio and the next
grid step of 45 is looser still — the grid allows a good measure *or* a full container, never
both. So the gap is closed from the other side: 19px at 790px keeps 76 characters and a 1.58
ratio, `.vd-article` narrows the body cell to 850, and the title, masthead, prose, endnotes and
endmatter are each capped at the measure so nothing renders wider than anything else. Do not
"fix" a visible gap by lengthening the line.

**Do not add `-webkit-font-smoothing:antialiased`.** It was in `body` and cost 26% of the ink on
screen: measured on an 18px paragraph in ink, coverage 13.22% with it against 16.68% without.
Light text on dark already reads lighter in weight than the same pair inverted, and grayscale AA
compounds it. If body text ever reads dim, check this before reaching for a brighter token —
raising `--vd-text` a step buys 3.6% and costs contrast that long reading does not want.

**`.vd-prose` serves two registers, and the reading one is opt-in.** Add `vd-prose--read` to a
block that is read rather than scanned — running prose on a landing page needs it as much as an
essay does. Never retune `.vd-prose` itself: it would resize every card blurb on the site.

**`--vd-measure` is in `ch`, which resolves against the element's own font-size.** It is 538px on
16px prose and 1997px on a 56px title — wide enough to constrain nothing. Adding it to a display
rule looks like a cap and is not one. See `verdigris/README.md`, **Two measures**.

**Do not remove the underline on inline links.** It is load-bearing in two places: `--vd-ok`
aliases `--vd-link`, so the underline is what separates a success message from a link; and
`--vd-editorial` teal collapses onto link blue for a deuteranope. Remove it and both become real
collisions. See docs §10.

**`--vd-teal-400` is retired.** It measured 6.67:1 and failed its own tier. Use `--vd-teal-500`
(`#4FB8AF`, 7.60:1) or `--vd-patina-500` (`#0F4F4A`, 8.02:1 on paper) via `--vd-editorial`.

**Control boundaries use `--vd-control-border`, never `--vd-rule` or `--vd-rule-strong`.** A
decorative hairline is exempt from 1.4.11; the boundary of an input or a button is not, and
needs 3:1. The rule tokens measure 1.28–1.64:1 against the page.

**The mobile hero splits its text by size, and that split is the design.** The display line is
large text, so it sits on the field at full strength. Everything small — caption, cue, nav — is
*cleared* of the field by the wrapper mask, not attenuated, because no usable field alpha reaches
7:1 for small text. Two problems, two tools. Measured on the rendered page (ink / paper): thesis
9.53 / 9.75, caption 10.20 / 11.82, cue 7.89 / 8.97.

**A hero with a `sub` cannot run the vibrant field, and the component enforces it.** A sub is
body text at 7:1 sitting directly under the display line, and no mask clears one without clearing
the other. `VdHero` sets `data-hero-sub`, which drops the field to `--vd-hero-mask-dim`. Measured
there: sub 7.53 / 7.79. Set from JS rather than `:has()` so an engine without `:has()` cannot
silently ship the sub under-measured.

**A published ratio measured token-against-token is not the ratio a reader gets.** `body::before`
lays 5% grain over the ground, which lifted `--vd-bone-400` from its published 7.06:1 to a
rendered 6.44:1 — under AAA on every page in ink, for as long as the grain has existed, and
invisible to `audit.js` because that resolves tokens and cannot see an overlay. The token is now
`#B2AB9C`. Any new text token must be measured against the **grained** ground, not `--vd-surface`.

**Measure the rendered page, never the token.** `audit.js` computes contrast against
`--vd-surface` and cannot see a canvas, so it passes hero text that is failing. Screenshot with
the text blanked and sample the pixels under each element's box.

**`--vd-nav-h` is measured at runtime, not declared.** The token says 60px, which is true only
while the nav fits one row; it wraps below 860 and measures 134, and 178 at 320. A ResizeObserver
writes the real height back. Anything clearing the nav must read the property, never the 60.

**Nothing inside the hero may use the muted text value.** The generative field is masked to a
capped alpha across the text column, and muted measures below 7:1 against the worst composite.

**Never `opacity` a disabled control.** It composites the text toward the surface and destroys
the measured ratio. Use the muted text colour, which is still legal at 7.25:1 / 8.50:1.

**A bare `<img>` must keep its `max-width`.** That rule is a 1.4.10 fix, not a style: without it a
wide screenshot scrolls the whole document sideways at 320px. Do not tidy it away.

**`vd-figure` does not frame.** No border on the image, no editorial rule on the caption — what
makes it a figure rather than an image is the caption. Teal covers the pull-quote,
`.vd-marginalia` and `.vd-cite`, not captions.

**List markers are muted, not structure green.** A stated exception to the ordinal rule, because at
list frequency the accent stops being rare. List items also carry **no** margin: `--vd-space-h` is
half a line and knocks every item after the first off the 30px grid.

**Keep `.vd-resume` on the resume's `<main>`.** `print.css` targets it for page-scoped exceptions,
including suppressing printed link destinations. Remove it and every bullet grows a URL.

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
form endpoint. Each is a **system** non-goal, recorded with its reason in docs §09. **Do not add
them speculatively.** If you think one is needed now, say why the reason in §09 no longer holds.

An email address anywhere on the site is absent too, but it is a **site** policy rather than a
system non-goal, so it is not in §09 — it is under **Building a page** above.

Screen-reader transcripts have not been recorded. That needs NVDA or VoiceOver driven by hand
and cannot be automated honestly, so it is listed as absent rather than claimed.

## Layout

```
index.html          the homepage
work/               case studies.  work/<slug>.html
notes/              Field Notes.   notes/<slug>.html
resume.html         résumé. Print is the deliverable, the screen is the courtesy
docs/               the design system, published as a portfolio piece
                    COUPLED: shipping without it means editing the nav and
                    footer on every page, the resume rail, and sitemap.xml
404.html            not-found page. Reached only via .htaccess ErrorDocument

template.html       starter page — copy this. A specimen, not a page
reader.html         case study / Field Note template. A specimen, not a page
preview-mobile.html width harness. ?w=320,390 picks widths, &y= sets scroll
tools/og.html       redraws the hero field at 1200×630 and saves og.png
tools/audit.mjs     drives the audit over every page in both themes and at every breakpoint. See Verify your work

verdigris/          the kit: verdigris.css, verdigris.js, topolang.js, print.css, audit.js
custom-elements.json  the element manifest. Hand-authored; carries checkedAgainst
og.png              the social card. Regenerate with tools/og.html, do not hand-edit
favicon.svg/.ico    the mark. apple-touch-icon.png is the 180px raster of it
.htaccess           404 mapping and cache headers. The deploy artifact
robots.txt          crawl policy. Templates and instruments are excluded, see Shipping
sitemap.xml         every published URL. Hand-maintained; add new pages to it

calibration/        the questionnaires that settled each decision. Historical record
inbox/              files handed over by hand. Gitignored, never published
.private/           not published, gitignored. Do not read or surface it
```
