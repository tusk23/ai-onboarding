@echo off
echo Starting LLM Concepts server...
cd /d "%~dp0dist"
start "LLM Concepts" npx serve -p 5173 -C --cors
echo Server should be running at http://localhost:5173/
pause
