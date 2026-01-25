# Script para backup dos dados importantes
# Uso: .\scripts\backup.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "$PSScriptRoot\..\backups\$timestamp"

Write-Host "💾 Criando backup..." -ForegroundColor Cyan

# Criar pasta de backup
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Copiar arquivos de dados
Write-Host "📁 Copiando dados dos agentes..." -ForegroundColor Yellow
Copy-Item "$PSScriptRoot\..\agentes\*.json" -Destination $backupDir -Force

# Copiar .env
Write-Host "🔐 Copiando configurações..." -ForegroundColor Yellow
Copy-Item "$PSScriptRoot\..\.env.local" -Destination "$backupDir\.env.local.backup" -Force -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\..\.env" -Destination "$backupDir\.env.backup" -Force -ErrorAction SilentlyContinue

# Copiar memorias se existir
if (Test-Path "$PSScriptRoot\..\memorias") {
    Write-Host "🧠 Copiando memórias..." -ForegroundColor Yellow
    Copy-Item "$PSScriptRoot\..\memorias" -Destination $backupDir -Recurse -Force
}

# Copiar resultados se existir
if (Test-Path "$PSScriptRoot\..\resultados") {
    Write-Host "📊 Copiando resultados..." -ForegroundColor Yellow
    Copy-Item "$PSScriptRoot\..\resultados" -Destination $backupDir -Recurse -Force
}

# Compactar backup (opcional)
$zipPath = "$PSScriptRoot\..\backups\backup_$timestamp.zip"
Compress-Archive -Path $backupDir -DestinationPath $zipPath -Force

# Remover pasta não compactada
Remove-Item $backupDir -Recurse -Force

# Limpar backups antigos (manter últimos 10)
$backups = Get-ChildItem "$PSScriptRoot\..\backups\*.zip" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 10) {
    $backups | Select-Object -Skip 10 | Remove-Item -Force
    Write-Host "🗑️  Backups antigos removidos (mantendo últimos 10)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Backup criado: $zipPath" -ForegroundColor Green
Write-Host "   Tamanho: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor White
