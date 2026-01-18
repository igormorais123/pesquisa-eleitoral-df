# Script para limpar cache e node_modules
# Uso: .\scripts\clean.ps1

param(
    [switch]$All,        # Limpa tudo incluindo node_modules
    [switch]$Cache,      # Limpa só cache
    [switch]$Reinstall   # Limpa e reinstala dependências
)

Write-Host "🧹 Limpando projeto..." -ForegroundColor Cyan

# Limpar cache Next.js
Write-Host "📁 Removendo .next cache..." -ForegroundColor Yellow
Remove-Item "$PSScriptRoot\..\frontend\.next" -Recurse -Force -ErrorAction SilentlyContinue

# Limpar cache Python
Write-Host "📁 Removendo __pycache__..." -ForegroundColor Yellow
Get-ChildItem "$PSScriptRoot\..\backend" -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Limpar .pyc
Get-ChildItem "$PSScriptRoot\..\backend" -Recurse -File -Filter "*.pyc" | Remove-Item -Force -ErrorAction SilentlyContinue

# Limpar Vercel cache
Write-Host "📁 Removendo .vercel cache..." -ForegroundColor Yellow
Remove-Item "$PSScriptRoot\..\frontend\.vercel\.cache" -Recurse -Force -ErrorAction SilentlyContinue

if ($All -or $Reinstall) {
    # Limpar node_modules
    Write-Host "📁 Removendo node_modules (pode demorar)..." -ForegroundColor Yellow
    Remove-Item "$PSScriptRoot\..\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue

    # Limpar package-lock
    Remove-Item "$PSScriptRoot\..\frontend\package-lock.json" -Force -ErrorAction SilentlyContinue
}

if ($Reinstall) {
    Write-Host ""
    Write-Host "📦 Reinstalando dependências..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\frontend"
    npm install
}

# Calcular espaço liberado
Write-Host ""
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green

# Mostrar tamanho atual das pastas
Write-Host ""
Write-Host "📊 Tamanho das pastas:" -ForegroundColor Cyan

$frontend = (Get-ChildItem "$PSScriptRoot\..\frontend" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$backend = (Get-ChildItem "$PSScriptRoot\..\backend" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$agentes = (Get-ChildItem "$PSScriptRoot\..\agentes" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "   Frontend: $([math]::Round($frontend, 1)) MB" -ForegroundColor White
Write-Host "   Backend:  $([math]::Round($backend, 1)) MB" -ForegroundColor White
Write-Host "   Agentes:  $([math]::Round($agentes, 1)) MB" -ForegroundColor White
