# Troubleshooting

Guia de resolução de problemas comuns.

---

## Índice de Problemas

1. [Instalação e Setup](#instalação-e-setup)
2. [Backend/API](#backendapi)
3. [Frontend](#frontend)
4. [Banco de Dados](#banco-de-dados)
5. [API Claude](#api-claude)
6. [Entrevistas](#entrevistas)
7. [Performance](#performance)
8. [Docker](#docker)

---

## Instalação e Setup

### Erro: "Docker não encontrado"

**Sintoma:**
```
docker: command not found
```

**Solução:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Faça logout e login novamente

# Mac
brew install docker
# Ou baixe Docker Desktop: https://docker.com/products/docker-desktop

# Windows
# Baixe Docker Desktop: https://docker.com/products/docker-desktop
```

---

### Erro: "Permissão negada ao Docker"

**Sintoma:**
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solução:**
```bash
# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Faça logout e login novamente
# OU reinicie o terminal

# Verificar
groups | grep docker
```

---

### Erro: "Porta já em uso"

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
# ou
Error: bind: address already in use :8000
```

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :3000
lsof -i :8000

# Matar o processo (substitua PID)
kill -9 <PID>

# Ou use portas diferentes no docker-compose.yml
ports:
  - "3001:3000"  # Frontend em 3001
  - "8001:8000"  # Backend em 8001
```

---

## Backend/API

### Erro: "CLAUDE_API_KEY não está definida"

**Sintoma:**
```
❌ Erro de configuração: CLAUDE_API_KEY não está definida
```

**Solução:**
```bash
# 1. Verifique se existe no .env
cat .env | grep CLAUDE_API_KEY

# 2. Se não existir, adicione
echo 'CLAUDE_API_KEY=sk-ant-api03-sua-chave' >> .env

# 3. Se usando Docker, recrie o container
docker compose down
docker compose up -d

# 4. Se rodando manualmente, exporte
export CLAUDE_API_KEY=sk-ant-api03-sua-chave
```

---

### Erro: "Token inválido ou expirado"

**Sintoma:**
```json
{"detail": "Token inválido ou expirado"}
```

**Solução:**
1. Faça login novamente para obter novo token
2. Verifique se o header está correto: `Authorization: Bearer <token>`
3. Aumente `ACCESS_TOKEN_EXPIRE_MINUTES` se expirar muito rápido

```bash
# No .env
ACCESS_TOKEN_EXPIRE_MINUTES=480  # 8 horas
```

---

### Erro: "CORS bloqueado"

**Sintoma:**
```
Access to fetch at 'http://localhost:8000/api/v1/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solução:**
```bash
# 1. Verifique FRONTEND_URL no .env do backend
FRONTEND_URL=http://localhost:3000

# 2. Reinicie o backend
docker compose restart backend
# ou
# Ctrl+C e reinicie uvicorn

# 3. Se ainda falhar, verifique main.py
# As origens permitidas devem incluir seu frontend
```

---

### Erro: "422 Unprocessable Entity"

**Sintoma:**
```json
{"detail": [{"loc": ["body", "campo"], "msg": "field required", "type": "value_error.missing"}]}
```

**Solução:**
Este erro indica dados inválidos na requisição.

1. Verifique o formato JSON
2. Verifique campos obrigatórios
3. Verifique tipos de dados

```bash
# Exemplo correto
curl -X POST http://localhost:8000/api/v1/entrevistas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titulo": "Minha Pesquisa",
    "tipo": "mista",
    "perguntas": [...],
    "eleitores_ids": [...]
  }'
```

---

## Frontend

### Erro: "Module not found"

**Sintoma:**
```
Module not found: Can't resolve '@/components/...'
```

**Solução:**
```bash
# Reinstale dependências
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

---

### Erro: "Hydration mismatch"

**Sintoma:**
```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Solução:**
Este erro ocorre quando o servidor e cliente renderizam diferente.

1. Verifique uso de `Date`, `Math.random()`, etc.
2. Use `useEffect` para código client-only
3. Limpe cache do Next.js:

```bash
cd frontend
rm -rf .next
npm run dev
```

---

### Erro: "Failed to fetch" no login

**Sintoma:**
Tela de login mostra erro ao tentar fazer login.

**Solução:**
```bash
# 1. Verifique se backend está rodando
curl http://localhost:8000/health

# 2. Verifique NEXT_PUBLIC_API_URL
cat frontend/.env.local

# 3. Deve ser:
NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Reinicie o frontend
docker compose restart frontend
```

---

## Banco de Dados

### Erro: "Connection refused" ao PostgreSQL

**Sintoma:**
```
could not connect to server: Connection refused
Is the server running on host "localhost" and accepting TCP/IP connections on port 5432?
```

**Solução:**
```bash
# 1. Verifique se PostgreSQL está rodando
docker ps | grep postgres
# ou
systemctl status postgresql

# 2. Se usando Docker, inicie
docker compose up -d db

# 3. Verifique a porta
netstat -tlnp | grep 5432

# 4. Se local, verifique pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Adicione: local all all md5
sudo systemctl restart postgresql
```

---

### Erro: "Database does not exist"

**Sintoma:**
```
FATAL: database "pesquisa_eleitoral" does not exist
```

**Solução:**
```bash
# Docker
docker compose down -v
docker compose up -d

# Manual
sudo -u postgres createdb pesquisa_eleitoral
```

---

### Erro: "Authentication failed"

**Sintoma:**
```
FATAL: password authentication failed for user "postgres"
```

**Solução:**
```bash
# 1. Verifique a senha no .env
cat .env | grep POSTGRES_PASSWORD

# 2. Se usando Docker, recrie o volume
docker compose down -v
docker compose up -d

# 3. Se local, redefina a senha
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nova_senha';
\q
```

---

## API Claude

### Erro: "Invalid API Key"

**Sintoma:**
```json
{"error": {"type": "authentication_error", "message": "Invalid API Key"}}
```

**Solução:**
1. Verifique se a chave começa com `sk-ant-api03-`
2. Verifique se não há espaços extras
3. Gere uma nova chave em [console.anthropic.com](https://console.anthropic.com)

```bash
# Teste a chave
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

---

### Erro: "Rate limit exceeded"

**Sintoma:**
```json
{"error": {"type": "rate_limit_error", "message": "Rate limit exceeded"}}
```

**Solução:**
1. Aguarde alguns segundos e tente novamente
2. Reduza o `batch_size` nas entrevistas
3. Aumente o `delay_entre_batches_ms`

```json
{
  "limite_custo_reais": 50.0,
  "batch_size": 5,           // Reduzir de 10 para 5
  "delay_entre_batches_ms": 1000  // Aumentar de 500 para 1000
}
```

---

### Erro: "Insufficient credit"

**Sintoma:**
```json
{"error": {"type": "invalid_request_error", "message": "Your credit balance is too low"}}
```

**Solução:**
1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em "Billing"
3. Adicione créditos à sua conta

---

## Entrevistas

### Erro: "Entrevista não inicia"

**Sintoma:**
Clica em "Iniciar" mas nada acontece.

**Solução:**
```bash
# 1. Verifique logs do backend
docker compose logs -f backend

# 2. Verifique se há eleitores selecionados
curl http://localhost:8000/api/v1/entrevistas/<id> \
  -H "Authorization: Bearer $TOKEN"

# 3. Verifique se CLAUDE_API_KEY está configurada
```

---

### Erro: "Respostas parecem genéricas"

**Sintoma:**
Todas as respostas são equilibradas e parecem IA genérica.

**Solução:**
Este pode ser um problema com as regras anti-convergência.

1. Verifique o arquivo `prompts.ts`
2. Garanta que a função `INSTRUCAO_ANTI_CONVERGENCIA` está sendo chamada
3. Verifique se o modelo está recebendo o perfil completo do eleitor

---

### Erro: "Custo muito alto"

**Sintoma:**
Entrevista é cancelada por exceder limite de custo.

**Solução:**
```json
{
  "limite_custo_reais": 100.0,  // Aumentar limite
  "batch_size": 10,
  "delay_entre_batches_ms": 500
}
```

Ou reduza o número de eleitores/perguntas.

---

## Performance

### Sistema lento ao carregar eleitores

**Sintoma:**
Página de eleitores demora muito para carregar.

**Solução:**
1. Verifique se virtualização está ativa (TanStack Virtual)
2. Reduza itens por página inicial
3. Use filtros para reduzir o conjunto

```bash
# Verifique memória do container
docker stats
```

---

### Backend demora para responder

**Sintoma:**
Requisições à API demoram mais de 2 segundos.

**Solução:**
```bash
# 1. Verifique conexão com banco
docker compose logs db

# 2. Verifique CPU/RAM
docker stats

# 3. Aumente recursos no docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

---

## Docker

### Erro: "Container keeps restarting"

**Sintoma:**
```
pesquisa-eleitoral-backend    restarting (1) 5 seconds ago
```

**Solução:**
```bash
# Ver logs de erro
docker compose logs backend

# Comum: banco não está pronto
# Solução: já existe healthcheck no docker-compose.yml
# Aguarde alguns segundos

# Se persistir, verifique .env
cat .env
```

---

### Erro: "No space left on device"

**Sintoma:**
```
no space left on device
```

**Solução:**
```bash
# Limpar recursos Docker não utilizados
docker system prune -a

# Limpar volumes órfãos
docker volume prune

# Verificar espaço
df -h
```

---

### Erro: "Network not found"

**Sintoma:**
```
network pesquisa-network not found
```

**Solução:**
```bash
# Recriar tudo
docker compose down
docker compose up -d
```

---

## Dicas Gerais

### Coletar Informações para Suporte

```bash
# Versões
docker --version
docker compose version
node --version
python --version

# Status dos containers
docker compose ps

# Logs recentes
docker compose logs --tail=50

# Configurações (OCULTE CHAVES!)
cat .env | grep -v KEY | grep -v PASSWORD
```

### Reinício Limpo

Quando tudo mais falhar:

```bash
# 1. Parar tudo
docker compose down -v

# 2. Limpar cache
rm -rf frontend/.next
rm -rf backend/__pycache__

# 3. Verificar .env
cat .env

# 4. Subir novamente
docker compose up -d --build

# 5. Ver logs
docker compose logs -f
```

---

## Ainda com Problemas?

1. Verifique os [Issues no GitHub](https://github.com/igormorais123/pesquisa-eleitoral-df/issues)
2. Crie um novo Issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs relevantes
   - Versões dos softwares

---

*Última atualização: Janeiro 2026*
