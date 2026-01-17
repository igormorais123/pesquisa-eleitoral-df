# Script de sincronizacao automatica com GitHub (PowerShell)
# Pesquisa Eleitoral DF 2026

$ProjectPath = "C:\Users\igorm\pesquisa-eleitoral-df"
$LogFile = "$ProjectPath\logs\git-sync.log"

# Cria pasta de logs se nao existir
if (!(Test-Path "$ProjectPath\logs")) {
    New-Item -ItemType Directory -Path "$ProjectPath\logs" -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

Set-Location $ProjectPath

Write-Log "Iniciando sincronizacao..."

# Puxa as ultimas mudancas
Write-Log "Puxando atualizacoes do remoto..."
$pullResult = git pull origin main --rebase 2>&1
Write-Log "$pullResult"

# Adiciona todas as mudancas
git add -A 2>&1 | Out-Null

# Verifica se ha mudancas para commitar
$changes = git diff --staged --name-only 2>&1

if ($changes) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $commitMsg = "sync: atualizacao automatica [$timestamp]"

    Write-Log "Commitando mudancas..."
    $commitResult = git commit -m $commitMsg 2>&1
    Write-Log "$commitResult"

    Write-Log "Enviando para GitHub..."
    $pushResult = git push origin main 2>&1
    Write-Log "$pushResult"

    Write-Log "Sincronizacao concluida com sucesso!"
} else {
    Write-Log "Nenhuma mudanca para sincronizar"
}

Write-Log "---"
