$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting AI Interview Platform..." -ForegroundColor Cyan
Write-Host "  Backend  -> http://localhost:8080" -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:5174" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$root\backend'; uvicorn app.main:app --reload --port 8080"

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$root\frontend'; npm run dev"
