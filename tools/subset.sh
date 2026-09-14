#!/bin/sh
# ── Verdigris font subsetting ───────────────────────────────────────────
# The kit ships broadly-subset faces and does not cut them tighter, because
# it has no build step and no fonttools. This script is the invocation, so a
# consumer who does have the toolchain is not guessing at the range.
#
#   pip install fonttools brotli
#   sh tools/subset.sh verdigris/fonts
#
# Writes <name>.subset.woff2 beside each source. It does NOT rewrite the
# @font-face rules — that is yours, and it is also why the work is lost on
# every pull: a fresh verdigris/ copy overwrites both the files and the rules
# naming them. See AGENTS.md, Shipping.
#
# ── THE RANGE IS NOT "LATIN-1 PLUS PUNCTUATION" ─────────────────────────
# Six of the glyphs below are painted from JavaScript or from CSS `content`,
# so they appear in no markup and nothing greps them out of a page. Cutting
# to Latin-1 drops every one of them, and each fails silently — a substituted
# glyph still draws:
#
#   U+2713  ✓   the form's success state          verdigris.js GLYPH.valid
#   U+203C  ‼   the form's warning state          verdigris.js GLYPH.warn
#   U+2026  …   "Sending…" while a form posts     verdigris.js
#   U+2212  −   the open-details marker           verdigris.css
#   U+2014  —   the prose list marker             verdigris.css
#   U+2193  ↓   the hero scroll cue               verdigris.css
#
# And six more belong to topolang, chosen from a mode's fill/cfn arrays:
#
#   U+2248 ≈   U+2261 ≡   U+2588 █   U+2016 ‖      STRATA
#   U+00B0 °   U+00A6 ¦                            RELIEF
#
# Those four non-Latin-1 ones are absent from the shipped faces already, which
# is why STRATA and RELIEF are unusable with them. Keeping them in the range
# costs nothing and means a face that carries them will work.
#
# Verify by reading the cmap afterwards, never by measuring advances in a
# browser: the fallback for a monospace face is another monospace face landing
# within hundredths of a pixel of the same advance, and that is how an earlier
# check in this repository reported four missing glyphs as present.

set -eu
DIR="${1:-verdigris/fonts}"

UNICODES="U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201A,U+201C-201E,U+2026,\
U+2016,U+2039-203A,U+203C,U+2193,U+2212,U+2248,U+2261,U+2588,U+2713"

command -v pyftsubset >/dev/null 2>&1 || {
  echo "pyftsubset not found — pip install fonttools brotli" >&2; exit 1; }

for f in "$DIR"/*.woff2; do
  case "$f" in *.subset.woff2) continue;; esac
  out="${f%.woff2}.subset.woff2"
  pyftsubset "$f" \
    --output-file="$out" \
    --flavor=woff2 \
    --layout-features='kern,liga,tnum,frac' \
    --unicodes="$UNICODES"
  printf '%s  %s -> %s\n' "$(du -h "$out" | cut -f1)" "$f" "$out"
done

cat <<'NOTE'

Done. Two things left, both yours:
  1. Point the @font-face src at the .subset.woff2 files.
  2. Re-read the cmap to confirm coverage. Do not trust an advance-width probe.
NOTE
