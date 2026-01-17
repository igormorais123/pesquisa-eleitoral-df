@echo off
REM Sincronizacao manual com GitHub - Pesquisa Eleitoral DF
cd /d "C:\Users\igorm\pesquisa-eleitoral-df"

echo === Sincronizando com GitHub ===
echo.

echo [1/3] Buscando atualizacoes do GitHub...
git fetch origin

echo.
echo [2/3] Atualizando branch local...
git pull origin main

echo.
echo [3/3] Verificando status...
git status

echo.
echo === Sincronizacao concluida! ===
pause
