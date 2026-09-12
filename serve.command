#!/bin/sh
# ── Verdigris dev server (macOS / Linux) ────────────────────────────────
# The counterpart to serve.cmd. Run this in your own terminal and leave
# the window open — a server started by the agent lives only as long as
# its session and gets reaped; this one lasts as long as the window does.
# On macOS it is also double-clickable from Finder, which opens its own
# Terminal window.
#
#   Homepage          http://127.0.0.1:8787/index.html
#   Design system     http://127.0.0.1:8787/docs/
#   Mobile preview    http://127.0.0.1:8787/preview-mobile.html?w=320,390
#   Starter template  http://127.0.0.1:8787/template.html
#   Calibration 01-06 http://127.0.0.1:8787/calibration/calibration.html
#                     ...-02 through ...-06 in the same folder
#
# Ctrl+C to stop.

cd "$(dirname "$0")" || exit 1

# Detect an existing server rather than dying on a bind error.
if lsof -nP -iTCP:8787 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port 8787 is already in use. Opening the existing server instead."
  open http://127.0.0.1:8787/index.html 2>/dev/null || xdg-open http://127.0.0.1:8787/index.html
  exit 0
fi

echo "Serving $(pwd) on http://127.0.0.1:8787"
echo "Ctrl+C to stop."
open http://127.0.0.1:8787/index.html 2>/dev/null || xdg-open http://127.0.0.1:8787/index.html
exec python3 -m http.server 8787 --bind 127.0.0.1
