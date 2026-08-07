@echo off
REM Serves this directory on localhost and opens the calibration instrument.
REM Chrome restricts localStorage on bare file:// URLs, which would break autosave.
cd /d "%~dp0"
start "" http://127.0.0.1:8787/calibration.html
python -m http.server 8787 --bind 127.0.0.1
