#!/bin/bash
# Script para manter backend e frontend rodando de forma estável
# Reinicia automaticamente se algum serviço cair

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/pesquisa-eleitoral"
mkdir -p "$LOG_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Matar processos anteriores
cleanup() {
    log "${YELLOW}Parando serviços...${NC}"
    pkill -f "uvicorn app.main:app" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Função para iniciar e monitorar o backend
start_backend() {
    while true; do
        if ! pgrep -f "uvicorn app.main:app" > /dev/null; then
            log "${GREEN}Iniciando Backend...${NC}"
            cd "$SCRIPT_DIR/backend"
            python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 >> "$LOG_DIR/backend.log" 2>&1 &
            sleep 3
            if pgrep -f "uvicorn app.main:app" > /dev/null; then
                log "${GREEN}✓ Backend rodando em http://localhost:8000${NC}"
            else
                log "${RED}✗ Falha ao iniciar backend, tentando novamente em 5s...${NC}"
            fi
        fi
        sleep 5
    done
}

# Função para iniciar e monitorar o frontend
start_frontend() {
    while true; do
        if ! pgrep -f "next dev" > /dev/null; then
            log "${GREEN}Iniciando Frontend...${NC}"
            cd "$SCRIPT_DIR/frontend"
            npm run dev >> "$LOG_DIR/frontend.log" 2>&1 &
            sleep 8
            if pgrep -f "next dev" > /dev/null; then
                log "${GREEN}✓ Frontend rodando em http://localhost:3000${NC}"
            else
                log "${RED}✗ Falha ao iniciar frontend, tentando novamente em 5s...${NC}"
            fi
        fi
        sleep 5
    done
}

# Iniciar monitores em background
log "${GREEN}=== Iniciando Sistema Pesquisa Eleitoral ===${NC}"
log "Logs em: $LOG_DIR"
log "Pressione Ctrl+C para parar"
echo ""

start_backend &
BACKEND_PID=$!

start_frontend &
FRONTEND_PID=$!

# Aguardar
wait
