@echo off
REM Comando rapido para sincronizar manualmente
REM Use: git-sync-manual.bat

echo.
echo ========================================
echo  Sincronizacao Manual com GitHub
echo  Pesquisa Eleitoral DF 2026
echo ========================================
echo.

cd /d C:\Agentes

echo [1/4] Verificando status...
git status --short

echo.
echo [2/4] Puxando atualizacoes...
git pull origin main --rebase

echo.
echo [3/4] Adicionando mudancas...
git add -A

echo.
echo [4/4] Commitando e enviando...
git diff --staged --quiet
if %errorlevel% neq 0 (
    set /p msg="Mensagem do commit (ou Enter para auto): "
    if "%msg%"=="" (
        git commit -m "sync: atualizacao manual [%date% %time%]"
    ) else (
        git commit -m "%msg%"
    )
    git push origin main
    echo.
    echo Sincronizacao concluida!
) else (
    echo Nenhuma mudanca para sincronizar.
)

echo.
pause
