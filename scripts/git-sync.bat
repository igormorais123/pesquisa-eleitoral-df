@echo off
REM Script de sincronizacao automatica com GitHub
REM Pesquisa Eleitoral DF 2026

cd /d C:\Agentes

echo [%date% %time%] Iniciando sincronizacao...

REM Verifica se ha mudancas
git status --porcelain > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel verificar status do git
    exit /b 1
)

REM Puxa as ultimas mudancas do remoto
echo Puxando atualizacoes do remoto...
git pull origin main --rebase

REM Adiciona todas as mudancas
git add -A

REM Verifica se ha algo para commitar
git diff --staged --quiet
if %errorlevel% neq 0 (
    echo Commitando mudancas...
    git commit -m "sync: atualizacao automatica [%date% %time%]"

    REM Push para o remoto
    echo Enviando para GitHub...
    git push origin main

    echo [%date% %time%] Sincronizacao concluida com sucesso!
) else (
    echo [%date% %time%] Nenhuma mudanca para sincronizar
)

exit /b 0
