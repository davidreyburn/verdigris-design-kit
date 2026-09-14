# Verdigris

A hand-authored design system. Framework-agnostic CSS plus light-DOM web components.
No build step, no dependencies, no external requests. This file is the component and class
reference; the repository root README covers serving and project layout.

```
verdigris/
  verdigris.css     tokens (3 tiers) + base + components
  verdigris.js      custom elements + contrast maths
  topolang.js       conformant topolang v1.3.2 runtime
  print.css         paper stylesheet
  fonts/            Chivo, Literata, IBM Plex Mono — 13 faces, 503 KB
```

## Use

```html
<link rel="stylesheet" href="verdigris/verdigris.css">
<link rel="stylesheet" href="verdigris/print.css">
<script src="verdigris/topolang.js" defer></script>   <!-- only if the page has a field -->
<script src="verdigris/verdigris.js" defer></script>
<script src="verdigris/audit.js" defer></script>
```

Every component upgrades markup that is already valid and semantic without JavaScript.
Nothing uses shadow DOM.

## Decisions, and what each one cost

| Decision | Cost accepted |
|---|---|
| Two themes, ink and paper | Every semantic token is mapped twice, and the paper mapping exists in two places that must be edited together. |
| AAA on all text | The palette lost orange, teal and purple as text colours. Red had to be lightened to `#E68C8C`. |
| Three accents on three salience tiers | More to hold in your head than "max two". Green must be rationed or it becomes cosplay. |
| Two-register type scale, plus one reading size | Nothing between 18px and 56px for UI, where hierarchy comes from weight, case and numbering. That failed across a 2,700-word essay — `h2` matched the article title and `h3` matched the body — so `--vd-size-section` (32px) exists for headings inside `.vd-article__body` and nowhere else. |
| Baseline-derived rhythm | 30px unit forces half-steps (15px, 7.5px) for tight spacing. Embeds must be forced onto the grid. |
| Light DOM, no shadow roots | No style encapsulation. Component CSS must stay namespaced by hand. |
| The hero field is masked, not luminance-capped | The mask carries the AAA guarantee under the text column, so the field's own alpha can be tuned for legibility instead of for contrast. |
| Chivo 500 **and** 600, both shipped | Asked twice whether they can collapse, and the answer is no. Rendered side by side at 56px they are plainly different weights, not interchangeable — 500 carries the display sizes, 600 the text ones. The saving is real, ~30 KB, and it costs the display voice. Settle `.vd-role__title` (500 at 18px) against `.vd-system-card__title` (600 at 18px) before asking again: two title-alikes at one size in two weights is the inconsistency to fix first |
| No mono italic | `plex-mono-400-italic` was loading for the single word *Drift* in the hero caption. The `<cite>` uses colour and tracking instead, and the face comes out of the payload |
| No Tailwind | Slower to write. The point is that the system is authored. |

## Convention: no padding/margin shorthands on composable classes

`.vd-page` and `.vd-section` both land on every homepage section. `.vd-page` set
`padding: 0 30px` and `.vd-section` set `padding: 90px 0`, and the second silently zeroed the
first: the shorthand always writes all four sides. Desktop hid it behind auto margins; on
mobile the body copy sat flush against the screen edge with no gutter at all.

Composable classes use `padding-inline` / `padding-block`. Audited: `.vd-page` + `.vd-section`
was the only colliding pair in the system.

## Token tiers

Three, in order. **Never reference a tier-1 primitive from a component** — go through the
semantic layer so the system stays re-themeable.

```
tier 1  --vd-bone-500   raw values, measured contrast in comments
tier 2  --vd-text       what a value means
tier 3  --vd-card-*     per-component
```

## Three accents, one per salience tier

Supersedes the earlier "two accents per viewport". Counting colours was a crude proxy for
"do not make a rainbow". The real discipline is that accents sit at different **salience
tiers**, so they read as hierarchy rather than as peers competing.

| Token | Colour | Frequency | Salience | Job |
|---|---|---|---|---|
| `--vd-structure` | green 7.28:1 | high | low | Rules, section marks, contour lines, ordinals, active states |
| `--vd-link` | blue 7.31:1 | medium | medium | Links and hover affordances. Nothing else. |
| `--vd-data` | lime 14.68:1 | very low | maximum | Quantities only, plus the focus ring |

Green and lime are close in hue and two stops apart in luminance. An earlier version of this
file claimed they "stay distinguishable under deuteranopia". **That was wrong.** Simulated with
the Viénot 1999 matrices they land 0.4° apart — the same hue, two values apart. What actually
separates them is size and position: both are mono tabular numerals, so hue was never doing the
work. Never place them adjacent expecting colour to tell them apart.

**Ordinals versus quantities.** Both are digits; they are not the same job. An ordinal counts
position (card index, section number) and is structure, so it is green. A quantity counts
amount (`4 agents`, `41/41`, `2020`) and is data, so it is lime. `vd-system-card` enforces
this in code: a proof value only gets lime if it starts with a digit, so `deployed` and
`founded` cannot quietly become data.

Orange and purple remain held back for Prismatic Instrument contexts. A fourth *salience tier*
outside that context is a violation.

**Teal is not a fourth tier.** `--vd-editorial` sits outside the frequency/salience system
entirely: it marks the places where the page is quoting, crediting or annotating rather than
speaking — pull-quote rules, figure captions, marginalia. It never competes with structure,
link or data for attention because it never appears in the same role. It was lifted from
`#4AACA4` (6.67:1, the one token that failed its own tier and stayed) to `--vd-teal-500`
`#4FB8AF` at 7.60:1, with `--vd-patina-500` `#0F4F4A` at 8.02:1 on paper.

One constraint travels with it: teal and link blue are **0.0°** apart under deuteranopia.
Marginalia sits beside prose and prose contains links, so the underline on inline links is what
keeps them apart.

**Rationing green.** It is the signature, which means it works by restraint. Green belongs on
rules and marks, never on fills or large text. Thin green on near-black reads as
instrumentation; thick green reads as hacker cosplay, which is a named anti-goal.

## Each topolang mode has a font requirement

A mode paints glyphs chosen from its `fill` and `cfn` arrays. Those appear in no stylesheet and
no markup, so nothing greps them out of a page — and the faces this kit ships **do not carry all
of them**:

| Mode | Needs beyond ASCII | Usable with the shipped faces |
|---|---|---|
| **SHADE** | nothing — `. + # @` | **yes**, and it is what the site runs |
| STRATA | `≈ ≡ █ ‖` | **no** |
| RELIEF | `° ¦ █` | **no** — `█` is missing |

The runtime keeps all three, because it implements `spec-topolang v1.3.2` and `selfTest()` asserts
conformance against the spec's own vector — dropping a mode would make that claim false. What is
constrained is the *fonts*, not the renderer. A consumer wanting STRATA or RELIEF supplies a face
carrying those codepoints; `tools/subset.sh` keeps them in range so such a face will work.

A missing glyph here fails silently and badly: the substitute comes from a different family at a
different advance, and the cell grid the renderer assumes comes apart.

## Two measures, because `ch` is not a unit of width

`--vd-measure` is `58ch`. `ch` resolves against **the element's own font-size**, so one token
does not mean one width:

| Applied to | Font size | Resolves to | Effect |
|---|---|---|---|
| `.vd-prose` | 16px | 538px | caps the column, renders ~61 characters |
| `.vd-article__title` | 56px | 1997px | caps nothing — wider than any container it can occupy |

Two consequences, both of which were live bugs:

**`ch` is the width of `0`, which is wider than average lowercase.** A 58ch cap therefore renders
about 61 characters, not 58. If you tune the token, expect it to read long by roughly three.

**`.vd-prose` serves two registers and they want different things.** The same rule sets a
three-line card blurb and a 2,700-word essay. At 16px/58ch both render 61 characters a line —
right for the blurb, thin for the essay, because 538px of 16px type in a 928px column leaves
390px of empty space beside every line. Long-form therefore has its own register:

```css
--vd-size-read:19px;      /* a reading-only size, like --vd-size-section */
--vd-measure-read:790px;  /* ~76 characters. px, not ch — see below */
```

applied by `.vd-prose--read` — and by `.vd-article__body`, which carries it — and **only above 860px**. The reading size is 19px and the measure 790px — about 76 characters at a 1.58 leading ratio. Three things improve together and
nothing is traded: 70 characters instead of 61, leading from 16/30 (1.88, loose) to 18/30
(1.67), and the 30px baseline untouched. Below 860px the column is the viewport, so there is no
empty space to reclaim and the larger size only costs characters — 29 a line at 320px against
33. The narrow screen was never the problem and keeps the body register.

**Do not fix this by retuning `.vd-prose`.** It would resize every card blurb on the site. Add
`vd-prose--read` to the block that needs it instead.

## Contrast

Every text token clears 7:1 against `--vd-ink-000`. Measured in-browser, not by hand:

| Token | Ratio | |
|---|---|---|
| `--vd-bone-700` | 15.48:1 | AAA |
| `--vd-lime-400` | 14.68:1 | AAA |
| `--vd-bone-600` | 14.00:1 | AAA |
| `--vd-bone-500` | 11.06:1 | AAA |
| `--vd-red-400` | 7.33:1 | AAA |
| `--vd-blue-400` | 7.31:1 | AAA |
| `--vd-teal-500` | 7.60:1 | AAA, the editorial voice |
| `--vd-green-400` | 7.28:1 | AAA |
| `--vd-bone-400` | 7.25:1 | AAA, the lowest legal text value. Measured against the **grained** ground, not the token — see the note beside it in `verdigris.css` |
| `--vd-orange-400` | 5.77:1 | non-text only |
| `--vd-red-300` | 4.31:1 | borders only |
| `--vd-purple-400` | 3.51:1 | non-text only |
| `--vd-shadow-400` | 2.19:1 | decorative rules, exempt from 1.4.11 |

`docs/` regenerates this table live from the running tokens, so the published numbers
cannot drift from the actual values.

## topolang

`topolang.js` is a conformant browser runtime for **spec-topolang v1.3.2**. The spec itself is
not in this repository; the conformance vector it is checked against is embedded in the runtime,
so `topolang.selfTest()` is verifiable from what ships here. Pure-field core only; the stateful sketch
extension is not claimed, so `step()`-bearing sketches are rejected as the spec requires.

Noise primitives are bit-exact ports of the normative arithmetic. The fixed pipeline runs in
order and is not reordered. Verify at any time:

```js
topolang.selfTest()   // -> { conformant: true, passed: 9, total: 9 }
```

Two notes for a future spec revision:

1. **Discrepancy in the canonical example.** The trace states `colorSlot = 3` for elevation
   0.30, justified as "0.12, 0.22, 0.30 are all ≤ 0.30". 0.30 is the elevation, not a
   threshold; the third threshold is 0.32. The normative rule gives 2. Conformance is
   unaffected because the contour pass overwrites the slot and the published vector still
   matches, but the prose should be corrected in v1.3.3.

2. **Output distribution is not documented.** `warped_fbm` averages averaged octaves, so its
   output clusters near the mean: a 125×51 sample measured p5–p95 of 0.17–0.48. Sketches that
   map elevation straight to glyphs will never reach the top three glyphs or the top four
   colour bands. This runtime applies a stretch and gamma **in the sketch**, leaving the
   normative arithmetic untouched. Worth a non-normative note in the spec's performance
   guidance, because everyone implementing it will hit this.

## One character mode, at every width

The field runs SHADE at every width. `cfn` is null on that mode, so the contour pass never
executes, no contour colour is read, and `contourColor` is dead configuration on the shipped
palettes — kept only so they stay conformant with the spec's shape.

Contours are not drawn at any width because they cannot survive the narrow one: 30 columns put
57% of cells on a contour against 9% on desktop, which reads as static rather than as line-work.
Two renderers would have been the alternative.

| | Above 860px | Below 860px |
|---|---|---|
| Role | masked background behind the hero | standalone band, above the hero line |
| Mode | SHADE | SHADE |
| Palette | VERDIGRIS_BAND (ink) / VERDIGRIS_PAPER (paper) | same |

What still differs by width is *placement*, not character: a percentage mask cannot keep a
full-bleed field clear of text once the layout stacks, because the fade line lands wherever the
paragraph happens to end. Below 860px the field becomes a band with `mask-image:none`, which
makes overlap structurally impossible rather than merely unlikely.

Two things not to try, because both have been measured:

- **A fixed stretch window** is correct on one grid only. A small grid samples a small patch of
  noise space and sees a much narrower slice of the range — 0.14–0.21 against 0.17–0.48 — so a
  window calibrated on a desktop grid collapses a narrow one to nothing.
- **Scaling the noise span to the grid** fixes that flatness by making each cell step further
  through the noise, which rescales every band transition with it. It was rejected when contours
  were still drawn and there is no reason to revisit it: `autoRange` removes the flatness without
  touching frequency.

So per-cell frequency is fixed, and `autoRange` measures the window per grid instead of
hard-coding it. Leave it on.

## Forms and feedback

The kit and its validation state model are one unit: a control's appearance and the wording of
its error are defined together, because a styled control with an unstyled error is worse than
neither.

```html
<vd-form>
  <form class="vd-form">
    <p class="vd-form__legend">Fields marked <span class="vd-form__req">*</span> are required.</p>

    <div class="vd-field">
      <label class="vd-field__label" for="email">Email<span class="vd-form__req" aria-hidden="true">*</span></label>
      <input class="vd-input" id="email" type="email" required
             data-msg-required="An email address is required."
             data-msg-type="This address is missing an @."
             data-msg-valid="That address will work.">
      <p class="vd-field__hint">Only used to reply.</p>
    </div>
  </form>
</vd-form>
```

`vd-form` is progressive enhancement over the browser's Constraint Validation API. It sets
`novalidate` **from script**, so with JS off the browser's own enforcement still applies and
only the styled messages are lost. Validation runs on blur, then re-runs on every keystroke
once a field has been blurred — telling someone their email is wrong before they have finished
typing it is the thing this timing exists to avoid.

`data-msg-required`, `-type`, `-short`, `-pattern` and `-valid` override the browser's generic
wording. `aria-describedby` wires the message to the control and `aria-invalid` marks the
failure; there is no live region, because the message is already announced when focus lands.

| Class | What it is |
|---|---|
| `.vd-input` `.vd-textarea` `.vd-select` | Controls. 44px minimum height, hairline box, sunken fill |
| `.vd-field` | Wrapper. Carries `is-invalid`, `is-valid`, `is-warn` |
| `.vd-field__label` `.vd-field__msg` `.vd-field__hint` | Label, state message, persistent hint |
| `.vd-check` | Checkbox or radio row. The input is restyled, never replaced |
| `.vd-table--zebra` | Striped rows, using the sunken surface rather than a tint |
| `.vd-skeleton` | Loading placeholder. Does not shimmer — see below |
| `.vd-empty` | Empty state. The instrument reads zero |

**Success has no colour of its own, and that is measured.** Every conventional success hue
collapses against the error colour under dichromat simulation: green 0.7°, lime 0.3°, teal 4.6°
under protanopia, and on paper fir and citron both reach 0.0°. Red-versus-green is the canonical
colour-vision failure and this palette reproduces it exactly. Blue is the only hue that clears
both axes — so `--vd-ok` aliases `--vd-link`, and the collision is paid for rather than denied.

A success message is separated from a real link by **two** things, both required: it carries a
glyph, and it is not underlined. This is why inline links are underlined as of v1.7.0. That
change was overdue anyway — a link identified by colour alone needs 3:1 against surrounding
text under WCAG G183, and it measured 1.51:1 in ink and 1.67:1 on paper.

**Warning carries no hue.** Orange is 5.77:1, a non-text value, so a warning *message* could not
be orange without breaking the AAA commitment. `--vd-warn` resolves to the ordinary text colour;
the glyph and the wording do the work.

**Disabled is muted, never faded.** `opacity:.5` composites text toward the surface and destroys
the measured ratio. Muted text is 7.25:1 in ink and 8.50:1 on paper, so a disabled control is
still readable — which is the point, since a control you cannot use is still one you must read.

**`--vd-control-border` is not `--vd-rule-strong`.** A decorative hairline is exempt from
1.4.11; the boundary of a form control is not, and needs 3:1 against what sits beside it.
Rule-strong measures 1.28:1 in ink and 1.64:1 on paper against the page, so every control at
rest failed until this token existed. Do not collapse the two back together.

**The skeleton does not shimmer.** A looping sweep on a block that may persist for seconds is
what 2.2.2 exists to prevent, and a loading state has nowhere sensible to put a pause control.

## A card may decline to be a link

`vd-system-card` and `vd-note-card` used to default `href` to `'#'`, so a card with nothing to
point at became a link to nowhere — which the release gate then failed the page for. There is a
real case for it: sanitized work whose artifact cannot travel.

**Omit `href` entirely.** The title renders as a `<span>`, `makeRegionClickable` does not run,
`data-clickable` is not set, and the hover treatment does not fire. Never write `href="#"` to
mean "no destination".

```html
<vd-system-card index="02" kicker="Enterprise, sanitized"
  title="Work with no artifact that can travel"
  proof="domain:regulated">
  The boundary itself is part of the design.
</vd-system-card>
```

The hover rules take the same gate the cursor does — `[data-clickable]` — because a region that
looks clickable and is not is worse than one that never claimed to be. `:focus-within` stays
ungated: it fires only when something inside really is focused.

## `vd-code[wrap]` for prose in a code block

`vd-code pre` is `white-space:pre` with a sideways scrollbar, which is right for code and wrong
for the other thing that goes in a code block — a quoted text file, an instruction sheet, a log.
A reader should not drag a sentence horizontally to finish it.

```html
<vd-code file="soul.md" wrap>
<pre>A quoted paragraph that should wrap rather than scroll.</pre>
</vd-code>
```

Attribute selector, so it needs no JavaScript and survives the upgrade.

## Submitting a form

`vd-form` validates whether or not there is an endpoint. It takes over **submission** only when
the inner `<form>` has an `action`:

```html
<vd-form honeypot="company" min-seconds="2.5">
  <form class="vd-form" action="https://your-endpoint.example" method="post">
    …fields…
    <div class="vd-form__result" data-state="idle"></div>
    <button class="vd-btn vd-btn--primary" type="submit">Send</button>
  </form>
</vd-form>
```

**`action` is the whole transport seam.** A Cloudflare Worker, a hosted form service, anything
that accepts a POST — the kit never learns which, and carries no URL, key or address. With no
`action` it does nothing on submit beyond validating, because a form without an endpoint is a
specimen; the consumer supplies whatever channel it falls back to.

**`mailto:` is refused.** It behaves differently in every browser, hands the reader a half-filled
mail client, and publishes the address in the markup — which defeats the reason anyone wanted a
form. If that is the channel, use a link and no form.

**With script off the form posts natively.** That path is the platform's, not a fallback this kit
maintains.

### What the endpoint has to satisfy

Four things, and the first one is a silent `400` if you get it wrong:

| | |
|---|---|
| **Body** | `FormData`, **not JSON**. Sent as `multipart/form-data`, so parse it as a form. There is no `Content-Type: application/json` |
| **Success** | Any `2xx`. The response body is **ignored** — returning JSON the kit will read is wasted work |
| **Honeypot** | Arrives as a normal field under whatever `honeypot` names, `company` by default. **The endpoint must reject it when non-empty** |
| **Timing floor** | Enforced client-side only and **never reaches you**. A bot that ignores script is invisible to it |

The last two are the same warning twice: the kit's traps protect against scripted form-fillers,
not against a POST straight to your URL. Everything you actually rely on has to be on your side.

### Spam, and what the kit can and cannot promise

`honeypot` adds an off-screen trap field; `min-seconds` rejects anything submitted faster than a
person could read the form. Both fail **silently** — a tripped trap renders success and sends
nothing, because telling a bot it failed is how it learns to pass.

The trap is positioned off-screen, not `display:none`: a hidden input is trivially detected, and
some assistive tech still reaches it.

**A bot that ignores script posts straight to your endpoint and sees neither trap.** The kit
provides the client half and names the contract — the honeypot rides in the payload under its own
name, and the endpoint must reject it when non-empty. Server-side enforcement is not something a
stylesheet and a custom element can promise, and it would be dishonest to imply otherwise.

### A challenge widget

Drop it in the form body as ordinary markup, **inside `.vd-scroll-x`**. Turnstile and its
equivalents carry a min-width around 300px, and a form column narrower than that pushes the whole
document sideways — a 1.4.10 reflow failure on a site that publishes its reflow measurements. The
wrapper is the same idiom `.vd-table-scroll` uses for wide tables: the overflow is contained
rather than propagated.

```html
<div class="vd-scroll-x"><div class="cf-turnstile" data-sitekey="…"></div></div>
```

**A challenge widget also ends "no external requests."** That claim is load-bearing on a site
built from this kit, and it is worth knowing which features cost it: a captcha, a hosted form
endpoint, an analytics beacon and a webfont CDN each do. The kit itself makes none — every byte
it ships is served from the same origin — but it cannot make that true of what you add.

### How the widget rides along

Drop it in the form body as ordinary markup. The kit submits with `FormData` over the whole form,
so the widget's hidden input rides along — no vendor branch, no script, no key in the kit. This is
also why `vd-form` only ever queries and wires, and never rebuilds `innerHTML`: doing so would
destroy a third-party widget.

### The result region

Author it. The kit fills it and moves focus to it, and generates one only if you did not — every
element here upgrades markup that is already complete. `role="status"` and `tabindex="-1"` are set
by the kit. Focus is what announces the outcome, the same reasoning as the absent error summary.

## The print control

`window.print()` is one line, so the line is not what this is for. The kit carries the 44px
target, hiding the control on the printed page, and a fallback that survives with script off:

```html
<button class="vd-btn" type="button" data-vd-print hidden>Print</button>
<p data-vd-print-alt>Print or save as PDF with Ctrl&thinsp;+&thinsp;P.</p>
```

The button is authored **`hidden`** and `verdigris.js` unhides it. Script off gets the
instruction rather than a dead control; script on hides the instruction and shows the button.
Only one ever appears, and `print.css` hides both on paper.

Keep the label short if it lives in a rail. A `--vd-rail` content box is 117px, and
"Print / Save PDF" wraps to three lines there — an action row in the content column is the better
home for anything longer than a word.

## Reduced motion

Not "everything stops". The field freezes to a single deterministic seeded frame, so it is
still generative and still rendered by the DSL. The same seed always yields the same frame.
Rule-draw hovers resolve to a static underline at reduced opacity, because a hover affordance
that disappears entirely is a usability regression. The setting is honoured live, without a
reload.

## Class reference

Eighty-two classes, which is the real API surface — `custom-elements.json` covers the nine
custom elements and nothing else. Grouped by what you reach for, not alphabetically.

This table is hand-authored, because a description of *intent* cannot be derived from a
stylesheet. The **values** are never duplicated here; `verdigrisAudit.tokens()` derives those
from the running CSS. To check this table has not gone stale, diff it against
`verdigrisAudit.classes()` — anything the stylesheet defines that is missing below is drift.

### Layout

| Class | What it does |
|---|---|
| `.vd-page` | Constrains to `--vd-page` and centres. The standard page container |
| `.vd-section` | Vertical rhythm plus the centred green signature mark. Suppressed on the first section |
| `.vd-spread` | Rail-plus-body grid. Collapses to one column below 860px |
| `.vd-spread__rail` | The sticky left rail. Offsets itself by `--vd-nav-h` to clear the nav |
| `.vd-spread__body` | The content column |
| `.vd-grid` | Card grid, **two columns** above 860px and one below. Two is the system's position, not a side effect of an auto-fit minimum: three cards at this measure make the body copy inside them uncomfortably narrow. Cards stretch to equal height and their proof line pins to the foot, so every proof rule in a row shares one line. `--vd-grid-cols` and `--vd-grid-card-max` are the escape hatches — set them **on the element**, never on `:root` |
| `.vd-stack` | Vertical flow with consistent spacing |
| `.vd-rule` | A horizontal hairline. Decorative, exempt from 1.4.11 |

### Type and prose

| Class | What it does |
|---|---|
| `.vd-prose` | Body copy, capped at `--vd-measure`. Also carries the document primitives: lists, `hr`, bare `img`, bare `blockquote`, `dl` |
| `.vd-prose--lead` | One register up, for a standfirst |
| `.vd-prose--read` | The reading register, as a modifier. Anything **read** rather than scanned opts in — a long About section as much as an essay. `.vd-article__body` applies it automatically |
| `.vd-article__body` | Long-form reading register: 18px at `--vd-measure-read` above 860px, body register below. See **Two measures** above |
| `.vd-article__meta` | The masthead block. A `<dl>` in mono with a rule under each row and a stronger rule closing it — metadata to scan, not prose to read. Put it between the dek and the body. A **linked value** gets its target height automatically; the row grows to 60px |
| `.vd-article__title` | Article or resume h1. One register below the hero display line |
| `.vd-article__dek` | Standfirst. Capped shorter than the measure so it reads as a summary |
| `.vd-article__body` | The article body wrapper |
| `.vd-label` | Uppercase mono micro-label. Section eyebrows, field labels, table keys |
| `.vd-mono` | Mono face with tabular figures |
| `.vd-cite` | Inline superscript marker. Takes `--vd-editorial` |
| `.vd-marginalia` | Aside block with an editorial left rule |
| `.vd-tag` | Small pill for categories |
| `.vd-visually-hidden` | Present for assistive tech, not painted |
| `.vd-skip` | Skip-to-content link. First element in `<body>` |

### Numerics

| Class | What it does |
|---|---|
| `.vd-num` | Tabular figures without the data colour |
| `.vd-is-num` | A numeric table cell. **Takes `--vd-data` — numerals only** |
| `.vd-is-data` | Data colour on a value that is a quantity |
| `.vd-is-grade` | A grade or rating. Deliberately *not* the data colour |

> `--vd-data` is quantities only — not grades, not statuses, not `PASS`. `vd-system-card`
> enforces it in code and `verdigrisAudit()` checks it everywhere else.

### Forms

| Class | What it does |
|---|---|
| `.vd-form` | Form wrapper, capped at the measure |
| `.vd-form__legend` | The "fields marked \* are required" line. **Not optional** — it is what makes the asterisk parseable |
| `.vd-form__req` | The required asterisk |
| `.vd-field` | One field. Carries `is-invalid`, `is-valid`, `is-warn` |
| `.vd-field__label` | Field label |
| `.vd-field__msg` | State message, below the control |
| `.vd-field__glyph` | The message glyph. `aria-hidden` — the sentence says the same thing |
| `.vd-field__hint` | Persistent hint. Not a state |
| `.vd-input` `.vd-textarea` `.vd-select` | Controls. 44px minimum, hairline box |
| `.vd-check` | Checkbox or radio row. The input is restyled, never replaced |
| `.vd-btn` | Button. Boundary uses `--vd-control-border` for 1.4.11 |
| `.vd-btn--primary` `.vd-btn--danger` | Button variants |

### Feedback

| Class | What it does |
|---|---|
| `.vd-skeleton` | Loading placeholder. Does not shimmer, by decision |
| `.vd-skeleton--title` `.vd-skeleton--short` | Width variants |
| `.vd-empty` | Empty state block |
| `.vd-empty__value` `.vd-empty__label` `.vd-empty__note` | The instrument reading zero |

### Reader and resume

| Class | What it does |
|---|---|
| `.vd-notes` | Endnote block. Numbered from `--vd-editorial`, with `:target` highlighting |
| `.vd-notes__list` `.vd-notes__back` | The list, and the back-link that makes an endnote usable |
| `.vd-endmatter` | End of an article: previous/next, contact line, last-updated |
| `.vd-endmatter__nav` `.vd-endmatter__dir` `.vd-endmatter__note` | Its parts. Hidden in print — on paper there is nothing to navigate to |
| `.vd-role` | A resume entry. Date column, content column, so every date lands on one edge |
| `.vd-role__when` `.vd-role__head` `.vd-role__title` `.vd-role__org` `.vd-role__body` | Its parts |
| `.vd-resume` | On `<main>`. **Do not remove** — `print.css` targets it for the page-scoped print exceptions |

### Tables

| Class | What it does |
|---|---|
| `.vd-table` | Hairline table |
| `.vd-table--zebra` | Striped rows, using the sunken surface |
| `.vd-table-scroll` | **Required wrapper for any wide table.** Without it the document scrolls sideways at 320px |

### Chrome and components

| Class | What it does |
|---|---|
| `.vd-nav__inner` `.vd-nav__list` `.vd-nav__mark` | Navigation internals |
| `.vd-theme-toggle` `.vd-theme-toggle__glyph` | Sun/moon button, 44×44 |
| `.vd-toc` | Table of contents, built by `vd-toc` |
| `.vd-footer__inner` `.vd-footer__sig` | Footer internals |
| `.vd-hero__*` | Hero internals: `thesis`, `sub`, `caption`, `inner`, `field`, `fieldwrap` |
| `.vd-system-card__*` | Work card internals: `index`, `title`, `body`, `proof` |
| `.vd-note-card__*` | Note card internals: `row`, `date`, `title`, `len`, `dek` |
| `.vd-readout` `.vd-readout__key` `.vd-readout__value` | Rail readouts |
| `.vd-readout__value--grade` | A readout holding a grade rather than a quantity — deliberately not the data colour |
| `.vd-swatch__*` | Swatch internals, built by `vd-swatch` |
| `vd-code[wrap]` | Soft-wraps a code block holding prose rather than code |
| `.vd-code__bar` `.vd-code__copy` | Code block header and copy control |
| `.vd-node` `.vd-node--active` | Diagram primitives |

Classes marked `__` are internals written by a custom element. You will rarely author them by
hand; they are listed so you can target them and so the surface is not a mystery.

### `vd-swatch` measures against a ground you have to choose

`against` defaults to `--vd-ink-000`, which is a tier-1 primitive and therefore the same value in
both themes. That default is right for a swatch showing a **primitive**, where the claim is fixed
— "this ink hex measures 7.31:1 on the ink ground" stays true whatever theme the reader is in,
which is why `docs/` pairs the paper primitives with an explicit `against="--vd-paper-000"`.

It is wrong for a swatch showing a **semantic token**. Those follow the theme while the default
ground does not, so on paper the component measures a paper foreground against a near-black
background and prints a red `FAIL` for a token that is correct. Pass `against="--vd-surface"`,
which resolves to `#161614` in ink and `#F0EDE4` on paper:

```html
<vd-swatch token="--vd-link" against="--vd-surface" min="7"></vd-swatch>
```

The component cannot pick for you: it has no way to know whether the swatch is making a fixed
claim about a primitive or a live one about the current theme.

## Document primitives

`.vd-prose` styles the elements an author types without reaching for a component. Three of these
decisions are load-bearing rather than cosmetic:

**A bare `<img>` is max-width constrained.** This is a 1.4.10 fix. Only `vd-figure img` had it, so
a 900px screenshot in a 320px column pushed the whole document sideways — the reflow guarantee
depended on authors remembering to wrap every image. No border and no radius: framing was never
the job, and after Calibration 06 `vd-figure` does not frame either. **The difference between the
two is the caption, not the box.**

**List markers are muted, a stated exception to the ordinal rule.** An ordinal is structure and
takes green — card indices do. A list marker is also an ordinal, but frequency changes what a
colour means: a fifteen-item list would put more green on screen than the rest of the page. The
marker hangs outside the measure so list text stays flush with surrounding paragraphs, and
ordered lists use zero-padded tabular numerals so 9 and 10 align.

**No margin between list items.** `--vd-space-h` is half a line, and with it ten of twenty-three
elements measured 15px off the 30px grid. The published spacing rule permits halves so it was
legal, but the rhythm demo shows lines on a shared grid and a half-step would falsify that for
lists. The hanging marker supplies the separation.

An `<hr>` in prose is **space, not a line** — consistent with the section divider being removed.
Use `.vd-rule` when a visible hairline is the point.

A bare `<blockquote>` is someone else's words: indent and a hairline, no teal. `vd-quote` is a
pull-quote — your own line, lifted out, in the editorial colour. Two devices, deliberately
different, because if they matched teal would stop being rare.

## Verify it yourself

`verdigris/audit.js` is the measurement harness, shipped rather than kept as a dev tool. Load it
and call it:

```html
<script src="verdigris/audit.js"></script>
```
```js
verdigrisAudit()             // readable summary in the console
verdigrisAudit({json:true})  // structured result
verdigrisAudit.tokens()      // every --vd-* token, with its ratio on the current ground
verdigrisAudit.classes()     // every .vd-* class the stylesheet defines
```

It checks text contrast (1.4.6), control boundaries (1.4.11), target size (2.5.8 / 2.5.5),
reflow (1.4.10), whether wide tables are wrapped, and the doctrine rule that the data colour is
numerals only. The token and class emitters derive from the running stylesheet rather than a
checked-in export, because a second source of truth is the exact thing this system argues
against elsewhere.

**One trap, and it will bite you.** Do not switch theme and audit in the same tick. Custom
properties on `:root` recompute immediately; descendants keep their previous resolved values
until style recalculation finishes, so you get a confident report full of failures that do not
exist. Audit one theme per page load. AAA needs both, so that is two loads, and 320px is a
third. The header of `audit.js` says this again, at more length, because it cost real time.

`template.html` at the repository root is a working page using every major element once, with
the reasoning that is easy to get wrong written beside it. Copy it and delete what you do not
need.

## Verified

- **Reflow (WCAG 1.4.10):** passes at 320 CSS px. Document scroll width 305 against a 305 client
  width, zero overflow, on every page in both themes. Measured in a real 320px viewport —
  constraining an element does not fire media queries and proves nothing.
- **Target size (2.5.8 AA, 24px):** every target passes.
- **Target size (2.5.5 AAA, 44px):** met for every standalone control and card. The card itself
  is the target, with the click forwarded under drag, selection and nested-interactive guards.
- **topolang conformance:** 9/9 against the spec's conformance vector, which is embedded in
  `topolang.js` and run live on the docs page. `topolang.js` is Apache 2.0 — see LICENSE.

## Not done yet

- Screen-reader transcripts. Requires driving NVDA or VoiceOver by hand; cannot be automated
  honestly, so it is listed as absent rather than asserted.
- React and Astro adapters. Deferred deliberately: there is no consumer yet, and a wrapper
  written before the thing it wraps is used is a guess. `custom-elements.json` at the repository
  root is the substitute — hand-authored, so it carries a `checkedAgainst` field.
- A working contact form. The kit exists and is exercised by the docs specimen; the endpoint
  does not, because submitting anywhere needs a runtime dependency this site does not have.
- An email address anywhere in a page built on this system. See AGENTS.md, Building a page.

**Target size, resolved.** Heading links are 30px, and the two ways of reaching 44 were both
rejected: 45px leading on 18px type wrecks a two-line title, and a stretched overlay breaks text
selection. The card is the target instead — far past 44×44 — with the click forwarded in script
under three guards: a press that moved more than 6px was a drag, a non-empty selection means the
reader is highlighting, and a target inside another interactive element handles itself. One gap,
stated: middle-clicking the card *body* does not open a tab, because that is browser behaviour
attached to a real anchor hit. Middle-clicking the title works. Inline links in prose are exempt
under 2.5.8. The claim is AA on every target, AAA on every standalone control and card.
