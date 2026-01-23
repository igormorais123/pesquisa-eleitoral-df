# Script para deploy completo (Frontend Vercel + Backend Render)
# Uso: .\scripts\deploy.ps1

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$SkipTests
)

Write-Host "🚀 Iniciando Deploy..." -ForegroundColor Cyan
Write-Host ""

# Carregar variáveis de ambiente
$envFile = "$PSScriptRoot\..\.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Verificar tokens
$vercelToken = $env:VERCEL_TOKEN
if (-not $vercelToken) {
    Write-Host "❌ VERCEL_TOKEN não encontrado em .env.local" -ForegroundColor Red
    exit 1
}

# Testes (se não pular)
if (-not $SkipTests) {
    Write-Host "🧪 Executando testes..." -ForegroundColor Yellow

    # Lint frontend
    Set-Location "$PSScriptRoot\..\frontend"
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lint falhou!" -ForegroundColor Red
        exit 1
    }

    # TypeCheck
    npm run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ TypeCheck falhou!" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Testes passaram!" -ForegroundColor Green
}

# Deploy Frontend (Vercel)
if (-not $BackendOnly) {
    Write-Host ""
    Write-Host "📦 Deployando Frontend para Vercel..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\..\frontend"

    npx vercel --prod --token $vercelToken --yes

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend deployado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no deploy do frontend" -ForegroundColor Red
    }
}

# Deploy Backend (Render - via git push)
if (-not $FrontendOnly) {
    Write-Host ""
    Write-Host "📦 Backend: Push para trigger deploy no Render..." -ForegroundColor Cyan
    Set-Location "$PSScriptRoot\.."

    git push origin main

    Write-Host "✅ Push realizado! Render vai fazer deploy automaticamente." -ForegroundColor Green
    Write-Host "   Acompanhe em: https://dashboard.render.com" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de Produção:" -ForegroundColor Cyan
Write-Host "   Frontend: https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app" -ForegroundColor White
Write-Host "   Backend:  https://pesquisa-eleitoral-df-1.onrender.com" -ForegroundColor White
Write-Host ""
