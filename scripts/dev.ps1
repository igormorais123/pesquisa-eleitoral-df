# Script para iniciar ambiente de desenvolvimento completo
# Uso: .\scripts\dev.ps1

Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Cyan

# Verificar se as portas estão livres
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "⚠️  Porta 3000 em uso. Matando processo..." -ForegroundColor Yellow
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force -ErrorAction SilentlyContinue
}

if ($port8000) {
    Write-Host "⚠️  Porta 8000 em uso. Matando processo..." -ForegroundColor Yellow
    Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force -ErrorAction SilentlyContinue
}

# Iniciar backend em nova janela
Write-Host "📦 Iniciando Backend (FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..\backend; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Aguardar backend iniciar
Start-Sleep -Seconds 3

# Iniciar frontend em nova janela
Write-Host "🎨 Iniciando Frontend (Next.js)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\..\frontend; npm run dev"

Write-Host ""
Write-Host "✅ Ambiente iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
