@echo off
REM ── Verdigris dev server ────────────────────────────────────────────────
REM Run this in your own terminal and leave the window open. A server
REM started by the agent lives only as long as its session and gets reaped;
REM this one lasts as long as you keep the window open.
REM
REM   Homepage          http://127.0.0.1:8787/index.html
REM   Design system     http://127.0.0.1:8787/docs/
REM   Mobile preview    http://127.0.0.1:8787/preview-mobile.html?w=320,390
REM   Starter template  http://127.0.0.1:8787/template.html
REM   Calibration 01-06 http://127.0.0.1:8787/calibration/calibration.html
REM                     ...-02 through ...-06 in the same folder
REM
REM Ctrl+C to stop.

cd /d "%~dp0"

REM Detect an existing server rather than dying on a bind error.
REM Chained findstr, not a regex with a literal space: netstat pads columns
REM with variable whitespace, so ":8787 .*LISTENING" does not reliably match.
netstat -ano | findstr ":8787" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
  echo Port 8787 is already in use. Opening the existing server instead.
  start "" http://127.0.0.1:8787/index.html
  exit /b 0
)

echo Serving %CD% on http://127.0.0.1:8787
echo Ctrl+C to stop.
start "" http://127.0.0.1:8787/index.html
python -m http.server 8787 --bind 127.0.0.1
