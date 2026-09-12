# Calibration

Six questionnaire passes, all complete. These are the instruments that settled the design
system — a historical record, kept as artifacts of how each decision was made. **Nothing in the
site references this folder**, and it is `Disallow`ed in `robots.txt`.

Serve them; do not open them from `file://`. Chrome restricts `localStorage` there and autosave
fails silently. Each page shows a red banner if storage is unavailable.

| Pass | File | Settled | Result |
|---|---|---|---|
| 01 | `calibration.html` | Stance, territory, type, colour, space, surface, motion, components, voice, accessibility, anti-goals, execution | 67/68 |
| 02 | `calibration-02.html` | Container, rhythm, grid, and typeface selection against verified licence prices | 7/7 |
| 03 | `calibration-03.html` | Colour, the hero field, and system scope — including the colour-vision finding | complete |
| 04 | `calibration-04.html` | Resolutions: the forced choices left open by 03, and the paper theme | complete |
| 05 | `calibration-05.html` | Forms, feedback, and the namesake. Shipped as v1.7.0 | complete |
| 06 | `calibration-06.html` | Document primitives, the reader page, the résumé. Shipped as v1.8.0 | complete |

`all-response.txt` is pass one's output.

## What pass 01 covered

| § | Section | What it settles |
|---|---|---|
| 01 | Stance | North-star weighting, primary reader, the failure mode to design against |
| 02 | Territory bake-off | Five named territories plus Verdigris, rendered as identical content — score, synthesize, kill |
| 03 | Typography | Display voice, reading voice, mono reach, scale ratio, measure, labels |
| 04 | Colour | Background strategy, accent count, semantic mapping of all 15 hexes, lime, links, contrast posture |
| 05 | Space | Density, container behaviour, spacing unit, grid visibility |
| 06 | Surface | What replaces the card, radius, elevation, where the topolang field lives |
| 07 | Motion | Hover behaviour, entrance, tempo, easing, reduced-motion fallback |
| 08 | Components | v1 inventory, ship order, naming convention, how the system documents itself |
| 09 | Voice | Section nomenclature, grammatical person, numbering, the Chives signature |
| 10 | Accessibility | Focus indicator, what gets published, the shared-legibility question |
| 11 | Anti-goals | Hard rules, including the previous site's treatments as named controls |
| 12 | Execution | Scope, target repo, Tailwind, timeline |

Visual decisions were made by choosing between **live rendered specimens**, not descriptions.
§12 generates three artifacts: `verdigris-brief.md`, `verdigris-tokens.css` — a token seed with
real computed values — and `verdigris-answers.json`.

## How pass two was built

The chrome of `calibration-02.html` is written **in** the settled Signal Lab language:
measurement register, lime rule under each section head, numbered labels, hairline structure,
two accents only. Typography stays on system fonts, because typography is what the page is
deciding and biasing the comparison would defeat the point.

Every open-source typeface in §§04–06 is self-hosted and rendered for real, so what is shown is
what ships. The five paid faces cannot legally be embedded, so those show a clearly labelled
proxy plus a link to the foundry's own live tester. The prices they were judged against are
recorded in `CHANGELOG.md` under **The design record**.

## Two notes on pass 01

**The territory specimens are interpretations.** No definitions of Cybernetic Minimalism,
Academic Cyberpunk, Prismatic Instrument, Black Box or Signal Lab existed anywhere — only
one-line fragments in the strategy notes that seeded the work. They were authored from those
fragments, which is why §02 carries a correction field.

**It was built to terminate.** Strategy recursion was the named execution risk, and this would
have been the fifth positioning artifact since March. So the instrument ends in a token file and
a component contract rather than a direction document.
