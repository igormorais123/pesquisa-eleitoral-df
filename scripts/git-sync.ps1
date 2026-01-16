# Script de sincronizacao automatica com GitHub (PowerShell)
# Pesquisa Eleitoral DF 2026

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Agentes"
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

try {
    Set-Location $ProjectPath

    Write-Log "Iniciando sincronizacao..."

    # Puxa as ultimas mudancas
    Write-Log "Puxando atualizacoes do remoto..."
    git pull origin main --rebase 2>&1 | ForEach-Object { Write-Log $_ }

    # Adiciona todas as mudancas
    git add -A

    # Verifica se ha mudancas para commitar
    $changes = git diff --staged --name-only

    if ($changes) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $commitMsg = "sync: atualizacao automatica [$timestamp]"

        Write-Log "Commitando mudancas..."
        git commit -m $commitMsg 2>&1 | ForEach-Object { Write-Log $_ }

        Write-Log "Enviando para GitHub..."
        git push origin main 2>&1 | ForEach-Object { Write-Log $_ }

        Write-Log "Sincronizacao concluida com sucesso!"
    } else {
        Write-Log "Nenhuma mudanca para sincronizar"
    }

} catch {
    Write-Log "ERRO: $_"
    exit 1
}
