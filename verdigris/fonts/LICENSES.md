# Font licences

The three families in this directory are **not mine**. They are redistributed here under the
SIL Open Font License 1.1, and the root `LICENSE` explicitly carves them out — nothing in my
terms restricts your rights to these files.

The OFL requires that its text accompany the fonts wherever they are redistributed. Publishing
this repository *is* redistribution, so the licence has to be here, in this directory, as a
file — not merely referenced.

| Family | Files | Copyright | Licence |
|---|---|---|---|
| Chivo | `chivo-*.woff2` | Omnibus Type | OFL 1.1 |
| Literata | `literata-*.woff2` | TypeTogether, commissioned by Google | OFL 1.1 |
| IBM Plex Mono | `plex-mono-*.woff2` | IBM Corp., designed by Bold Monday | OFL 1.1 |

Subset `.woff2` files count as Modified Versions under the OFL. That is permitted — subsetting
is the intended use — provided the licence travels with them and the Reserved Font Name is not
used to describe a modified font in a misleading way. These keep their original names and are
unmodified apart from character-set subsetting, which is the normal web workflow.

## The licence files

Three verbatim copies ship here, one per family, each taken from that family's own upstream
distribution:

| File | Source |
|---|---|
| `OFL-chivo.txt` | `github.com/google/fonts` — `ofl/chivo/OFL.txt` |
| `OFL-literata.txt` | `github.com/google/fonts` — `ofl/literata/OFL.txt` |
| `OFL-plex-mono.txt` | `github.com/IBM/plex` — `LICENSE.txt` |

They were not transcribed. Each was fetched from its source and the licence body cross-checked:
all three, plus a fourth unrelated OFL copy already present on the authoring machine, share a
byte-identical 85-line body (`md5 edd6f47454c4058303e56eeff7a2fe31` from the
`SIL OPEN FONT LICENSE Version 1.1` banner onward). Only the copyright line differs, which is
exactly what the OFL expects — hence three files rather than one.

If you add or replace a family, add its `OFL-*.txt` at the same time. The obligation attaches to
redistribution, and publishing this repository is redistribution.

## Before you subset these further

They are already subset, but broadly — `literata-400-normal.woff2` alone is 86 KB. Cutting them
tighter is a real saving and the kit has not done it, because it ships no build step and no
`fonttools`. If you do it in a consumer, **the range is not "Latin-1 plus punctuation".**

`topolang.js` paints glyphs chosen from a mode's `fill` and `cfn` arrays, so they appear nowhere
in the CSS and nothing greps them out of the markup. Across the three shipped modes that is:

```
STRATA  fill  . _ - = ≈ ≡ █      cfn  # = ‖ #
RELIEF  fill  . ° o O 0 @ █      cfn  + - ¦ +
SHADE   fill  . + # @            cfn  none
```

`≈ ≡ █ ‖` are U+2248, U+2261, U+2588 and U+2016 — none of them Latin-1. A Latin-1 subset drops
all four, and the field silently falls back to a system face for those cells, at a different
advance width, which breaks the grid the whole renderer assumes. The site ships SHADE, whose set
is pure ASCII, so the damage would not appear until someone changed mode.

Also required and easy to miss: **U+2193 (↓)** for `.vd-hero__cue`, and `° · — ’ é` across the
mono and text faces. Verified present in the shipped faces by advance-width probe — in a
monospace face every glyph shares one advance, so a substituted glyph measures differently.

If you subset, re-run that probe afterwards rather than trusting the range.
