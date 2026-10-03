@echo off
title Rohan Portfolio Dev Server
cd /d "%~dp0"
echo ===================================================
echo   Starting Rohan Verma Portfolio Local Server
echo   URL: http://localhost:5173
echo ===================================================
echo.
echo Opening browser...
start http://localhost:5173
echo Serving files... (Press Ctrl+C to stop)
python -m http.server 5173
pause
