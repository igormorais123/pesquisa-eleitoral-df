#!/bin/bash
# Watchdog - Verifica e reinicia serviços automaticamente

BACKEND_DIR="/home/user/pesquisa-eleitoral-df/backend"
FRONTEND_DIR="/home/user/pesquisa-eleitoral-df/frontend"
LOG_FILE="/tmp/pesquisa-eleitoral/watchdog.log"

mkdir -p /tmp/pesquisa-eleitoral

log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_backend() {
    if curl -s --max-time 3 http://localhost:8000/api/v1/auth/verificar > /dev/null 2>&1; then
        return 0
    fi
    return 1
}

check_frontend() {
    if curl -s --max-time 3 http://localhost:3000 > /dev/null 2>&1; then
        return 0
    fi
    return 1
}

start_backend() {
    log "Iniciando backend..."
    pkill -f "uvicorn app.main:app" 2>/dev/null
    sleep 1
    cd "$BACKEND_DIR"
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 >> /tmp/pesquisa-eleitoral/backend.log 2>&1 &
    sleep 4
}

start_frontend() {
    log "Iniciando frontend..."
    pkill -f "next dev" 2>/dev/null
    sleep 1
    cd "$FRONTEND_DIR"
    nohup npm run dev >> /tmp/pesquisa-eleitoral/frontend.log 2>&1 &
    sleep 8
}

log "=== Watchdog iniciado ==="

while true; do
    # Verificar backend
    if ! check_backend; then
        log "Backend caiu! Reiniciando..."
        start_backend
        if check_backend; then
            log "✓ Backend restaurado"
        else
            log "✗ Falha ao restaurar backend"
        fi
    fi

    # Verificar frontend
    if ! check_frontend; then
        log "Frontend caiu! Reiniciando..."
        start_frontend
        if check_frontend; then
            log "✓ Frontend restaurado"
        else
            log "✗ Falha ao restaurar frontend"
        fi
    fi

    sleep 30
done
