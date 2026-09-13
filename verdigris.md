# Verdigris

A retro-refined terminal palette. [Verdigris is the blue-green patina that forms
on aged copper and bronze.]

## Where it came from

Initially I was trying to configure all of my terminal interfaces to have the
classic hacker phosphor green on a black background. I love the aesthetic. I
love the movie *Hackers*, and *The Matrix* of course, and that type of style is
really nice initially and can be good to demonstrate a particular visual style.

But as I began to rely on the terminal more as a daily driver, something I was
looking at quite frequently, I had to tone down the intensities of the greens
and soften up the dark colors a little bit, just so it'd be easier for long
reading sessions.

## The name

The original color scheme is called Phosphor. That one's very bright and it's
burning, which is how a pure green font looks. This was thinking: what happens
if it was aged a little bit, and softened. [Verdigris is] the way things look
after they've been exposed to real use and real wear, which I thought was an
appropriate metaphor.

The terminal green is still present, deliberately. It connects back to Phosphor
and signals that this is the same machine, just older. Green is the first accent
color to reach for, not the primary text.

## The two reference points

matcha-dark-sea is a very dark, night-theme, but soft type of color scheme.
There's nothing in it that's too intense. Everything feels gentle and feels very
cool, and both the name and the colors evoke a certain type of Japanese
sophistication and minimalism that I really love.

From BoneVibrant it was the idea of a darker off-white, bone parchment color as
the base. I really liked it, and that was the best example. That was the idea I
took away from it. From there I just needed a foreground color that I thought
looked nice and would pass the accessibility ratio.

## Palette

| Role | Hex | Description |
|------|-----|-------------|
| Background | `#161614` | Near-black, faintly warm, no green tint |
| Background dim | `#111110` | Floating panels, sidebar |
| Background highlight | `#1e1d1b` | Cursor line |
| Background selection | `#2c2b28` | Visual selection |
| Dim | `#524e48` | Warm gray, comments, structural noise |
| Bone | `#D0CAB8` | Primary text, warm off-white, readable at volume |
| Bone bright | `#E8E2D0` | Emphasis, operators, parameters |
| White | `#F0EDE4` | Near-white, matchparen, high contrast moments |
| Green | `#44BB44` | Muted phosphor, keywords, folders, structural |
| Orange | `#C4834A` | Warm terra, strings, headings, system/mechanical |
| Teal | `#4AACA4` | Slate teal, functions, links |
| Blue | `#5B8DB8` | Steel blue, constants, operators, attention |
| Purple | `#8855BB` | Dusty violet, types, classes, italic |
| Lime | `#AAFF00` | Numbers only, bright and numerically distinct |
| Red | `#CC5555` | Errors, diff removed |

## Color separation, and a correction

> When I found this I was trying to get the whole system ready to ship. I was at
> home, just looking over the test pages I was generating to get a feel for the
> design system.

The terminal palette gets away with fifteen values because syntax puts distance
between them: keywords and numeric literals are separated by punctuation and
dozens of intervening glyphs. Ported to a three-accent web context, the two
closest hues ended up adjacent inside a 132px rail, and the claim that they
were safe there turned out to be wrong.

Measured with the Viénot 1999 dichromat matrices, green `#44BB44` and lime
`#AAFF00` simulate to `#A3A44A` and `#EAEB20`: a hue gap of **0.4°**. They do
not stay distinguishable under deuteranopia. They become the same hue, two
stops of value apart, which is exactly why the pairing read as "one color, one
of which is dimmed" rather than as two categories.

Sweeping 115°–185° at AAA on `#161614`, the dichromat hue flip lands between
160° and 165°. No structure hue is far from both lime and blue, because two of
three dichromat axes collapse hue to a single yellow–blue opposition. Structure
has to pick a side. Green picks the yellow side: it separates cleanly from link
blue and collides with lime.

So the rule is now stated in a form that can be checked:

> Any two tokens carrying different meanings in the same context must separate
> after dichromat simulation, by 20° of hue or 3:1 of value. Where color cannot
> do it, a named non-color channel must, and it is named.

There is a second instance of the same problem, found later, and it is the
harder one. Validation needs a *success* state, and every
conventional success hue collapses against the error color: green **0.7°**, lime
**0.3°**, teal **4.6°** under protanopia, and on paper fir and citron both reach
**0.0°**. Red-versus-green is the canonical color-vision failure and this palette
reproduces it exactly. Blue is the only hue that clears both axes, and it is
already the link color. So success takes it anyway, and the collision is paid for: a success message carries a glyph and is never
underlined, while every inline link is.

That underline was overdue on its own. A link identified by color alone needs
3:1 against surrounding text under WCAG G183; measured, it was **1.51:1** in ink
and **1.67:1** on paper.

In practice: structure and data are told apart by **size and position** (both
are mono tabular numerals, so hue does nothing), and data is told apart from
prose by the **mono face and tabular figures**. Neither pair relies on color,
which is why both still read correctly. WCAG conformance is measured on
rendered color and does not simulate CVD, so the AAA claim was never in
question. But the ratios are supposed to buy a hierarchy, and a hierarchy that
dissolves for one reader in twelve has not been delivered.

> That required me to go back to the original color math that ensures we have a
> good accessibility ratio, and then space out the colors on the spectrum again
> so they have a correct contrast.

## Design decisions

**Bone as primary.** Text is `#D0CAB8`, a warm off-white that reads like aged paper or vellum. It is comfortable at the volume of a dense document. The move away from green-as-text was the central decision, and it changes the environment from "I am inside a CRT" to "I am reading something serious on a dark surface."

**Green as first accent, not primary.** `#44BB44` is a direct descendant of phosphor green, muted to sit as an accent rather than a base. It appears on keywords, folder icons, list markers, the structural skeleton of content. The eye is still drawn to it, but it no longer dominates.

**Orange as mechanical/system.** `#C4834A` warm terra marks things that are structural metadata rather than content: strings (literal data), markdown headings (document structure), YAML front matter (machine-readable). The rationale is "touch with care": orange signals that something is a container or label, not prose.

**Blue and purple as attention markers.** `#5B8DB8` steel blue and `#8855BB` dusty purple are used for things that need to be noticed but not urgently: constants, types, `self`/`this`, italic text. In a game UI these would be item rarity indicators: present, meaningful, not alarming.

**Lime for numbers only.** `#AAFF00` is the brightest color in the palette and appears exactly once: numbers. This makes numeric literals immediately scannable, which matters in pattern code and config files where values are the point.

**Muted but not flat.** The palette deliberately sits between full saturation (Phosphor, the original BoneVibrant) and the near-gray of matcha themes. Each color has enough saturation to be distinct and vivid without any single one feeling like a warning signal.

**Haskell/Tidal overrides.** The green–bone–blue–purple logic is extended to Tidal livecoding files: keywords (`let`, `where`) are orange (structural/system), operators (`$`, `#`) are blue (connective tissue), strings are green (pattern data is signal), numbers are lime.

## The web translation

The table above is the **terminal** palette, and it stays as it is. The web
system built on it (see `docs/`) diverges in four ways, and
the terminal scheme is where people will look first, so they are recorded here.
Because the terminal scheme is where people will look first.

**Green is the structure accent, not a keyword color.** On the web it carries
rules, section marks, list markers, the active nav indicator, and card hover.
Same value, `#44BB44`, different job: in a terminal it distinguishes a token
class, on a page it states the condition of a region.

**Teal is the editorial voice, and it had to be lifted to get there.** In the
terminal it takes functions and links. On the page, links needed AAA against a
near-black ground, which the steel blue could not reach, so blue was lightened
to `#7FA9CE` and given links outright, which left teal, the color the system
is *named* for, orphaned for two calibrations.

It has a job now: the marks that indicate the page is quoting, crediting or
annotating rather than speaking: pull-quote rules, figure captions, marginalia.
Getting there cost a token. `#4AACA4` measures **6.67:1**, and `vd-quote` renders
at 18px regular, which is not large text and so needs the full 7:1. It was the
only value in the system that failed its own tier and stayed. It is retired.
`--vd-teal-500` `#4FB8AF` is the same hue at **7.60:1**; the paper counterpart
`--vd-patina-500` `#0F4F4A` is **8.02:1** at 0.5° of drift.

One constraint travels with it: teal and link blue simulate to a **0.0°** hue gap
under deuteranopia. Marginalia sits beside prose and prose contains links, so the
underline on inline links is what keeps them apart.

**Lime is numerics only, enforced in code.** Not grades, not statuses, not
asterisks. `vd-system-card` tests each value and grants lime only to one
starting with a digit; `AAA` takes the emphasis bone instead. The reason is in
the next point.

**There is a paper theme, and it is authored, not inverted.** On a bone ground
every value above fails: lime measures 1.05:1, green 2.13:1, blue 2.12:1. So
the light set is its own: fir `#12551E`, citron `#454F00`, slate `#22506F`,
oxide `#8A1F1F`, all AAA on `#F0EDE4`. Hue drift from each ink counterpart is
held under 13°, so the families survive the switch. Dark is emitted light;
paper is absorbed pigment. Same logic, opposite physics.

## Where it stands

[As of September 2026:] if you take my Ghostty theme, that will work. The HTML
theme just needs more testing. We're working on that right now.

## Files

| File | Path |
|------|------|
| Neovim colorscheme | `~/.config/nvim/colors/verdigris.lua` |
| Emacs theme | `~/.config/emacs/themes/verdigris-theme.el` |
| bat theme | `~/.config/bat/themes/Verdigris.tmTheme` |
| bat config | `~/.config/bat/config` |
| Ghostty config | `~/.config/ghostty/config` |
