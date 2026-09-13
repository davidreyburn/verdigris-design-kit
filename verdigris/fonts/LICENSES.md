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

They are already subset, but broadly. Cutting them tighter is a real saving and the kit has not
done it, because it ships no build step and no `fonttools`.

**`≈ ≡ █ ‖` are in none of the shipped faces.** An earlier version of this file claimed the
opposite, on the strength of an advance-width probe in the browser — which cannot tell a present
glyph from a substituted one, because the fallback for a monospace face is another monospace face
landing within hundredths of a pixel of the same advance. The authority is the font's `cmap`, and
the check that settles it is that adding those four codepoints to a subset range produces a
byte-identical file: nothing was there to keep.

This matters because `topolang.js` picks glyphs from a mode's `fill` and `cfn` arrays, which
appear in no stylesheet and in no markup, so nothing greps them out of a page:

```
STRATA  fill  . _ - = ≈ ≡ █      cfn  # = ‖ #
RELIEF  fill  . ° o O 0 @ █      cfn  + - ¦ +
SHADE   fill  . + # @            cfn  none
```

**SHADE is pure ASCII and is the mode the site ships, so nothing is broken today.** STRATA and
RELIEF are not usable with these faces as they stand: those four glyphs fall back to a system
font at a different advance, and the cell grid the renderer assumes comes apart. Either add faces
that carry them, or treat the two unshipped modes as unsupported until someone does.

`U+2193 (↓)` for `.vd-hero__cue` is carried by **PlexMono only** — Chivo does not have it. That
is why the cue sets `--vd-face-mono` explicitly, and why changing that family would silently
replace the glyph with a fallback.

If you subset, verify afterwards by reading the `cmap`, not by measuring advances in a browser.
