# Guia de Deployment

Como instalar e executar o Sistema de Pesquisa Eleitoral DF 2026.

---

## Visão Geral

O sistema possui três componentes principais:

| Componente | Tecnologia | Porta |
|------------|------------|-------|
| **Frontend** | Next.js 14 | 3000 |
| **Backend** | FastAPI | 8000 |
| **Banco de Dados** | PostgreSQL 15 | 5432 |

### Opções de Deployment

| Método | Complexidade | Recomendado para |
|--------|--------------|------------------|
| [Docker Compose](#docker-compose) | Baixa | Desenvolvimento, demos |
| [Manual (Local)](#instalação-manual) | Média | Desenvolvimento avançado |
| [Produção (VPS)](#produção) | Alta | Uso real, produção |

---

## Requisitos

### Hardware Mínimo

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disco | 10 GB | 20+ GB SSD |
| Rede | 10 Mbps | 100+ Mbps |

### Software

| Software | Versão | Verificar |
|----------|--------|-----------|
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Node.js | 18+ | `node --version` |
| Python | 3.11+ | `python --version` |
| PostgreSQL | 15+ | `psql --version` |
| Git | 2.30+ | `git --version` |

---

## Docker Compose

A forma mais rápida de subir o sistema completo.

### 1. Clone o Repositório

```bash
git clone https://github.com/igormorais123/pesquisa-eleitoral-df.git
cd pesquisa-eleitoral-df
```

### 2. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas configurações
nano .env
```

**Variáveis recomendadas (padrão: assinatura Claude Code):**

```env
# IA (padrão: Claude Code CLI / assinatura)
IA_PROVIDER=claude_code
IA_MODELO_ENTREVISTAS=sonnet
IA_MODELO_INSIGHTS=opus
IA_ALLOW_API_FALLBACK=false

# API Claude (opcional; use só se IA_PROVIDER=anthropic_api)
CLAUDE_API_KEY=

# Segurança (gere uma chave única)
SECRET_KEY=sua-chave-secreta-unica-de-32-caracteres

# Banco de dados (pode manter padrão para dev)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pesquisa_eleitoral
```

### 3. Inicie os Serviços

```bash
# Subir todos os serviços
docker compose up -d

# Ver logs em tempo real
docker compose logs -f

# Ver status dos containers
docker compose ps
```

### 4. Acesse o Sistema

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

**Credenciais padrão:** `admin` / `admin123`

### 5. Comandos Úteis

```bash
# Parar serviços
docker compose stop

# Reiniciar serviços
docker compose restart

# Remover containers (mantém dados)
docker compose down

# Remover tudo (APAGA DADOS!)
docker compose down -v

# Rebuild após mudanças no código
docker compose up -d --build

# Ver logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## Instalação Manual

Para desenvolvimento ou quando Docker não está disponível.

### Backend (FastAPI)

```bash
# 1. Entre no diretório
cd backend

# 2. Crie ambiente virtual
python -m venv venv

# 3. Ative o ambiente
# Linux/Mac:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# 4. Instale dependências
pip install -r requirements.txt

 
# 5. Configure variáveis (recomendado: assinatura)
export IA_PROVIDER=claude_code
export IA_MODELO_ENTREVISTAS=sonnet
export IA_MODELO_INSIGHTS=opus

# (Opcional) API
export CLAUDE_API_KEY=sk-ant-api03-xxxxx
export SECRET_KEY=sua-chave-secreta
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral

# 6. Inicie o servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Next.js)

```bash
# 1. Entre no diretório
cd frontend

# 2. Instale dependências
npm install

# 3. Configure variáveis
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Banco de Dados (PostgreSQL)

```bash
# Opção 1: Docker apenas para o banco
docker run -d \
  --name pesquisa-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pesquisa_eleitoral \
  -p 5432:5432 \
  postgres:15-alpine

# Opção 2: Instalação local
# Ubuntu/Debian:
sudo apt install postgresql-15
sudo -u postgres createdb pesquisa_eleitoral

# Mac (Homebrew):
brew install postgresql@15
createdb pesquisa_eleitoral
```

---

## Produção

### Checklist Pré-Deploy

- [ ] `SECRET_KEY` única e segura (32+ caracteres)
- [ ] IA configurada (preferencialmente `IA_PROVIDER=claude_code` + Claude Code autenticado)
- [ ] PostgreSQL com senha forte
- [ ] HTTPS configurado
- [ ] Firewall configurado (apenas portas 80/443)
- [ ] Backups automatizados
- [ ] Monitoramento de logs

### Arquitetura Recomendada

```
                    ┌─────────────┐
                    │   Nginx     │ (Reverse Proxy + SSL)
                    │  :80/:443   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐            ┌─────▼─────┐
        │  Frontend │            │  Backend  │
        │  Next.js  │            │  FastAPI  │
        │   :3000   │            │   :8000   │
        └───────────┘            └─────┬─────┘
                                       │
                                 ┌─────▼─────┐
                                 │ PostgreSQL│
                                 │   :5432   │
                                 └───────────┘
```

### Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/pesquisa-eleitoral

upstream frontend {
    server 127.0.0.1:3000;
}

upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name pesquisa.exemplo.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pesquisa.exemplo.com;

    ssl_certificate /etc/letsencrypt/live/pesquisa.exemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pesquisa.exemplo.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger/ReDoc
    location /docs {
        proxy_pass http://backend;
    }

    location /redoc {
        proxy_pass http://backend;
    }

    location /openapi.json {
        proxy_pass http://backend;
    }
}
```

### SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d pesquisa.exemplo.com

# Renovação automática (já configurada)
sudo certbot renew --dry-run
```

### Systemd Services

**Backend (`/etc/systemd/system/pesquisa-backend.service`):**

```ini
[Unit]
Description=Pesquisa Eleitoral Backend
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pesquisa-eleitoral/backend
Environment="PATH=/var/www/pesquisa-eleitoral/backend/venv/bin"
EnvironmentFile=/var/www/pesquisa-eleitoral/.env
ExecStart=/var/www/pesquisa-eleitoral/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Frontend (`/etc/systemd/system/pesquisa-frontend.service`):**

```ini
[Unit]
Description=Pesquisa Eleitoral Frontend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pesquisa-eleitoral/frontend
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/pesquisa-eleitoral/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar
sudo systemctl enable pesquisa-backend pesquisa-frontend
sudo systemctl start pesquisa-backend pesquisa-frontend

# Ver status
sudo systemctl status pesquisa-backend
sudo systemctl status pesquisa-frontend

# Ver logs
sudo journalctl -u pesquisa-backend -f
sudo journalctl -u pesquisa-frontend -f
```

### Build de Produção (Frontend)

```bash
cd frontend

# Build otimizado
npm run build

# Iniciar em produção
npm start
```

---

## Variáveis de Ambiente

Veja o guia completo: [variaveis-ambiente.md](variaveis-ambiente.md)

---

## Troubleshooting

Veja o guia completo: [troubleshooting.md](troubleshooting.md)

---

## Monitoramento

### Logs

```bash
# Docker
docker compose logs -f --tail=100

# Systemd
journalctl -u pesquisa-backend -f
journalctl -u pesquisa-frontend -f

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend (deve retornar HTML)
curl -s http://localhost:3000 | head -20

# Banco de dados
docker exec pesquisa-eleitoral-db pg_isready
```

### Métricas Recomendadas

| Métrica | Ferramenta | Alerta |
|---------|------------|--------|
| CPU/RAM | htop, Grafana | > 80% |
| Disco | df -h | > 90% |
| Uptime | UptimeRobot | Downtime > 1min |
| Erros 5xx | Logs Nginx | > 10/min |
| Latência API | curl timing | > 2s |

---

## Próximos Passos

- [Variáveis de Ambiente](variaveis-ambiente.md) - Configuração detalhada
- [Troubleshooting](troubleshooting.md) - Resolução de problemas
- [Backup e Restore](backup-restore.md) - Proteção de dados

---

*Última atualização: Janeiro 2026*
