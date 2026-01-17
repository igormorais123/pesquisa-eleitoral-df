# Configura sincronizacao automatica com GitHub via Task Scheduler
# Execute como Administrador: powershell -ExecutionPolicy Bypass -File setup-auto-sync.ps1

$ErrorActionPreference = "Stop"
$TaskName = "PesquisaEleitoralDF-GitSync"
$ScriptPath = "C:\Users\igorm\pesquisa-eleitoral-df\scripts\git-sync.ps1"

Write-Host "=== Configuracao de Sincronizacao Automatica ===" -ForegroundColor Cyan

# Remove tarefa existente se houver
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removendo tarefa existente..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Cria a acao (executar PowerShell com o script)
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""

# Cria o trigger (a cada 30 minutos)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -RepetitionDuration (New-TimeSpan -Days 9999)

# Configuracoes da tarefa
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Registra a tarefa
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

Register-ScheduledTask -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Sincroniza automaticamente o projeto Pesquisa Eleitoral DF com GitHub a cada 30 minutos" `
    | Out-Null

Write-Host ""
Write-Host "Tarefa agendada criada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Detalhes:" -ForegroundColor Cyan
Write-Host "  Nome: $TaskName"
Write-Host "  Frequencia: A cada 30 minutos"
Write-Host "  Script: $ScriptPath"
Write-Host "  Logs: C:\Users\igorm\pesquisa-eleitoral-df\logs\git-sync.log"
Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host "  Executar agora:  schtasks /run /tn `"$TaskName`""
Write-Host "  Ver status:      schtasks /query /tn `"$TaskName`""
Write-Host "  Desativar:       schtasks /change /tn `"$TaskName`" /disable"
Write-Host "  Remover:         schtasks /delete /tn `"$TaskName`" /f"
Write-Host ""
