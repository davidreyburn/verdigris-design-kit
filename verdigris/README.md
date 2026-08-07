# Verdigris

Design system for dreyburn.com. Framework-agnostic CSS plus light-DOM web components.
No build step, no dependencies, no external requests.

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
<script src="verdigris/topolang.js" defer></script>
<script src="verdigris/verdigris.js" defer></script>
```

Every component upgrades markup that is already valid and semantic without JavaScript.
Nothing uses shadow DOM.

## Decisions, and what each one cost

| Decision | Cost accepted |
|---|---|
| Dark only, stated as a position | No light theme. A real print stylesheet covers paper. |
| AAA on all text | The palette lost orange, teal and purple as text colours. Red had to be lightened to `#E68C8C`. |
| Three accents on three salience tiers | More to hold in your head than "max two". Green must be rationed or it becomes cosplay. |
| Two-register type scale | No size between 18px and 56px. Sub-headings carry hierarchy by weight, case and numbering. |
| Baseline-derived rhythm | 30px unit forces half-steps (15px, 7.5px) for tight spacing. Embeds must be forced onto the grid. |
| Light DOM, no shadow roots | No style encapsulation. Component CSS must stay namespaced by hand. |
| Luminance-capped field bands | Terrain shading in the hero is nearly invisible. Contour lines carry the whole read. |
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
| `--vd-bone-400` | 7.06:1 | AAA, the lowest legal text value |
| `--vd-orange-400` | 5.77:1 | non-text only |
| `--vd-red-300` | 4.31:1 | borders only |
| `--vd-purple-400` | 3.51:1 | non-text only |
| `--vd-shadow-400` | 2.19:1 | decorative rules, exempt from 1.4.11 |

`docs/` regenerates this table live from the running tokens, so the published numbers
cannot drift from the actual values.

## topolang

`topolang.js` is a conformant browser runtime for **spec-topolang v1.3.2**
(`~/agent/config/specs/spec-topolang.md`). Pure-field core only; the stateful sketch
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

This section used to describe a field that switched character mode at 860px — STRATA with
contour lines on desktop, SHADE below. **That is gone.** SHADE runs at every width and the
breakpoint mode switch has been removed from `verdigris.js`.

The reason the switch existed was real: 30 columns cannot draw a legible contour line, measured
at 57% of cells as contour against 9% on desktop, which reads as static. But the fix was to
stop drawing contours at all rather than to keep two renderers. `contourColor` is now dead
configuration on the shipped palettes — SHADE runs with `cfn: null`, so no contour pass
executes and the colour is never read.

| | Above 860px | Below 860px |
|---|---|---|
| Role | masked background behind the hero | standalone band, above the hero line |
| Mode | SHADE | SHADE |
| Palette | VERDIGRIS_BAND (ink) / VERDIGRIS_PAPER (paper) | same |

What still differs by width is *placement*, not character: a percentage mask cannot keep a
full-bleed field clear of text once the layout stacks, because the fade line lands wherever the
paragraph happens to end. Below 860px the field becomes a band with `mask-image:none`, which
makes overlap structurally impossible rather than merely unlikely.

Two failure modes found the hard way, both worth not repeating:

- **Fixed per-cell frequency with a fixed stretch window** looks correct on one grid only. A
  small grid samples a small patch of noise space and sees a much narrower slice of the range
  (measured 0.14–0.21 against 0.17–0.48), so the window collapses it to nothing.
- **Scaling the noise span to the grid** fixes the flatness and breaks the contours: each cell
  then steps further through the noise, and contour crossings scale with per-cell gradient.

Frequency is therefore fixed and the mode changes instead.

## Forms and feedback

The controls did not exist before v1.7.0 — there was no `input` rule anywhere in the system.
The kit and the state model landed together.

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
the measured ratio. Muted text is 7.06:1 in ink and 8.50:1 on paper, so a disabled control is
still readable — which is the point, since a control you cannot use is still one you must read.

**`--vd-control-border` is not `--vd-rule-strong`.** A decorative hairline is exempt from
1.4.11; the boundary of a form control is not, and needs 3:1 against what sits beside it.
Rule-strong measures 1.28:1 in ink and 1.64:1 on paper against the page, so every control at
rest failed until this token existed. Do not collapse the two back together.

**The skeleton does not shimmer.** A looping sweep on a block that may persist for seconds is
what 2.2.2 exists to prevent, and a loading state has nowhere sensible to put a pause control.

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
| `.vd-grid` | Auto-fitting card grid |
| `.vd-stack` | Vertical flow with consistent spacing |
| `.vd-rule` | A horizontal hairline. Decorative, exempt from 1.4.11 |

### Type and prose

| Class | What it does |
|---|---|
| `.vd-prose` | Body copy, capped at `--vd-measure` |
| `.vd-prose--lead` | One register up, for a standfirst |
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
| `.vd-code__bar` `.vd-code__copy` | Code block header and copy control |
| `.vd-node` `.vd-node--active` | Diagram primitives |

Classes marked `__` are internals written by a custom element. You will rarely author them by
hand; they are listed so you can target them and so the surface is not a mystery.

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

- **Reflow (WCAG 1.4.10):** passes at 320 CSS px. Document scroll width 305 against a 305
  viewport. Tested in a 320px iframe, because constraining an element does not fire media
  queries. It failed first time: the nav was the only offender in the page.
- **Target size (2.5.8 AA, 24px):** every target passes.
- **Target size (2.5.5 AAA, 44px):** met for all standalone controls, and for cards. Heading
  links used to be a stated deviation; they are not any more — the card itself is the target,
  with the click forwarded under drag, selection and nested-interactive guards.
- **topolang conformance:** 9/9 against the spec's own published vector.

## Not done yet

- Screen-reader transcripts. Requires driving NVDA or VoiceOver by hand; cannot be automated
  honestly, so it is listed as absent rather than asserted.
- React and Astro adapters. Deferred deliberately: there is no consumer yet, and a wrapper
  written before the thing it wraps is used is a guess. `custom-elements.json` at the repository
  root is the substitute — hand-authored, so it carries a `checkedAgainst` field.
- A working contact form. The kit exists and is exercised by the docs specimen; the endpoint
  does not, because submitting anywhere needs a runtime dependency this site does not have.
- Case-study and Field Note page templates.

**Target size, resolved.** Heading links are 30px, and the two ways of reaching 44 were both
rejected: 45px leading on 18px type wrecks a two-line title, and a stretched overlay breaks text
selection. The card is the target instead — far past 44×44 — with the click forwarded in script
under three guards: a press that moved more than 6px was a drag, a non-empty selection means the
reader is highlighting, and a target inside another interactive element handles itself. One gap,
stated: middle-clicking the card *body* does not open a tab, because that is browser behaviour
attached to a real anchor hit. Middle-clicking the title works. Inline links in prose are exempt
under 2.5.8. The claim is AA on every target, AAA on every standalone control and card.
