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
