@echo off
echo Starting AI Interview Platform...
echo   Backend  -^> http://localhost:8080
echo   Frontend -^> http://localhost:5174
start "Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --reload --port 8080"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
