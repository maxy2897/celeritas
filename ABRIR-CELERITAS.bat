@echo off
cd /d "%~dp0"
start "Celeritas servidor" /min node server.js
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:4173/"
