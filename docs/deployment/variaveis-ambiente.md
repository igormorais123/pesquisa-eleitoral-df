# Variáveis de Ambiente

Guia completo de configuração do sistema.

---

## Visão Geral

O sistema usa variáveis de ambiente para configuração. Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
nano .env
```

---

## Variáveis de IA (recomendado)

### IA_PROVIDER

**Descrição:** Define como o sistema executa as entrevistas.

- `claude_code` (PADRÃO): usa o **Claude Code CLI** (assinatura) localmente.
- `anthropic_api`: usa a **API da Anthropic** via `CLAUDE_API_KEY`.

**Exemplo:**
```env
IA_PROVIDER=claude_code
```

### IA_MODELO_ENTREVISTAS / IA_MODELO_INSIGHTS

**Descrição:** Modelos/aliases usados nas chamadas.

**Recomendado:**
```env
IA_MODELO_ENTREVISTAS=sonnet
IA_MODELO_INSIGHTS=opus
```

### IA_ALLOW_API_FALLBACK

**Descrição:** Permite fallback automático para API quando `IA_PROVIDER=claude_code` falhar.

**Padrão recomendado:** `false` (evita gasto acidental por token).

```env
IA_ALLOW_API_FALLBACK=false
```

### CLAUDE_API_KEY (opcional)

**Descrição:** Chave da API da Anthropic (usar apenas quando necessário/sem Claude Code CLI).

**Formato:** `sk-ant-api03-xxxxxxxxxxxxxxxx`

**Exemplo:**
```env
CLAUDE_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz123456
```

**⚠️ Segurança:**
- NUNCA commite esta chave no Git
- NUNCA exponha no frontend
- Adicione `.env` ao `.gitignore`

---

### SECRET_KEY

**Descrição:** Chave secreta para assinatura de tokens JWT.

**Formato:** String aleatória de 32+ caracteres.

**Como gerar:**
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32

# Linux
head -c 32 /dev/urandom | base64
```

**Exemplo:**
```env
SECRET_KEY=Kj8mNp2xQr5sVw9yBc3fGh7jLn0qTu4xZa6dEi1oMk
```

**⚠️ Segurança:**
- Use uma chave DIFERENTE em cada ambiente (dev, staging, prod)
- NUNCA use a chave padrão em produção
- Rotacione periodicamente (invalida tokens existentes)

---

## Variáveis de Banco de Dados

### DATABASE_URL

**Descrição:** URL de conexão com o PostgreSQL.

**Formato:** `postgresql://usuario:senha@host:porta/banco`

**Exemplos:**
```env
# Desenvolvimento local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral

# Docker Compose
DATABASE_URL=postgresql://postgres:postgres@db:5432/pesquisa_eleitoral

# Produção
DATABASE_URL=postgresql://pesquisa_user:senha_forte_123@db.exemplo.com:5432/pesquisa_prod
```

### Variáveis Separadas (Docker Compose)

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pesquisa_eleitoral
```

---

## Variáveis de Autenticação

### ALGORITHM

**Descrição:** Algoritmo de assinatura JWT.

**Valores:** `HS256` (padrão), `HS384`, `HS512`

**Exemplo:**
```env
ALGORITHM=HS256
```

**Nota:** Não altere a menos que tenha motivo específico.

---

### ACCESS_TOKEN_EXPIRE_MINUTES

**Descrição:** Tempo de expiração do token JWT em minutos.

**Padrão:** `60` (1 hora)

**Exemplos:**
```env
# Desenvolvimento (8 horas)
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Produção (1 hora)
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Alta segurança (15 minutos)
ACCESS_TOKEN_EXPIRE_MINUTES=15
```

---

## Variáveis de URLs

### FRONTEND_URL

**Descrição:** URL do frontend para configuração de CORS.

**Exemplos:**
```env
# Desenvolvimento
FRONTEND_URL=http://localhost:3000

# Produção
FRONTEND_URL=https://pesquisa.exemplo.com
```

---

### BACKEND_URL

**Descrição:** URL do backend para referências internas.

**Exemplos:**
```env
# Desenvolvimento
BACKEND_URL=http://localhost:8000

# Produção
BACKEND_URL=https://api.pesquisa.exemplo.com
```

---

### NEXT_PUBLIC_API_URL

**Descrição:** URL da API para o frontend (Next.js).

**⚠️ Importante:** Variáveis `NEXT_PUBLIC_*` são expostas no browser!

**Exemplos:**
```env
# Desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:8000

# Produção
NEXT_PUBLIC_API_URL=https://api.pesquisa.exemplo.com
```

---

## Variáveis de Ambiente

### AMBIENTE

**Descrição:** Define o ambiente de execução.

**Valores:** `development`, `staging`, `production`

**Exemplo:**
```env
AMBIENTE=development
```

**Comportamentos por ambiente:**

| Variável | development | production |
|----------|-------------|------------|
| Logs | Verbosos | Apenas erros |
| Reload | Ativo | Desativado |
| Debug | Ativo | Desativado |
| CORS | Permissivo | Restritivo |

---

## Variáveis de Caminhos

### CAMINHO_DADOS

**Descrição:** Diretório para armazenamento de dados.

**Padrão:** `./data`

**Exemplo:**
```env
CAMINHO_DADOS=/var/lib/pesquisa-eleitoral/data
```

**Conteúdo:**
```
data/
├── agentes/          # Banco de eleitores (JSON)
├── memorias/         # Memórias dos agentes
└── resultados/       # Resultados de pesquisas
```

---

## Arquivo .env Completo

### Desenvolvimento

```env
# ============================================
# PESQUISA ELEITORAL DF 2026 - DESENVOLVIMENTO
# ============================================

# API Claude (OBRIGATÓRIO)
CLAUDE_API_KEY=sk-ant-api03-sua-chave-aqui

# Segurança (pode usar padrão em dev)
SECRET_KEY=chave-desenvolvimento-apenas-local
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pesquisa_eleitoral

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Ambiente
AMBIENTE=development
CAMINHO_DADOS=./data
```

### Produção

```env
# ============================================
# PESQUISA ELEITORAL DF 2026 - PRODUÇÃO
# ============================================

# API Claude (OBRIGATÓRIO)
CLAUDE_API_KEY=sk-ant-api03-sua-chave-producao

# Segurança (DEVE SER ÚNICA E FORTE)
SECRET_KEY=Kj8mNp2xQr5sVw9yBc3fGh7jLn0qTu4xZa6dEi1oMk
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Banco de Dados (use senha forte!)
DATABASE_URL=postgresql://pesquisa_user:SenhaForte123!@db.interno:5432/pesquisa_prod
POSTGRES_USER=pesquisa_user
POSTGRES_PASSWORD=SenhaForte123!
POSTGRES_DB=pesquisa_prod

# URLs (use HTTPS!)
FRONTEND_URL=https://pesquisa.exemplo.com
BACKEND_URL=https://api.pesquisa.exemplo.com
NEXT_PUBLIC_API_URL=https://api.pesquisa.exemplo.com

# Ambiente
AMBIENTE=production
CAMINHO_DADOS=/var/lib/pesquisa-eleitoral/data
```

---

## Validação

### Verificar Configurações

```bash
# Backend - mostra warnings de configuração
cd backend
python -c "from app.core.config import validar_configuracoes; validar_configuracoes()"
```

### Verificar Conexão com Banco

```bash
# Usando psql
psql $DATABASE_URL -c "SELECT 1"

# Usando Python
python -c "
from sqlalchemy import create_engine
engine = create_engine('$DATABASE_URL')
with engine.connect() as conn:
    print('✅ Conexão OK')
"
```

### Verificar API Claude

```bash
# Teste simples
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

---

## Segurança

### Checklist

- [ ] `.env` está no `.gitignore`
- [ ] `SECRET_KEY` é única por ambiente
- [ ] `CLAUDE_API_KEY` não está no código
- [ ] Senhas de banco são fortes (12+ chars, especiais)
- [ ] URLs de produção usam HTTPS
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` adequado

### Rotação de Chaves

**SECRET_KEY:**
1. Gere nova chave
2. Atualize `.env`
3. Reinicie o backend
4. ⚠️ Todos os tokens existentes serão invalidados

**CLAUDE_API_KEY:**
1. Gere nova chave no console Anthropic
2. Atualize `.env`
3. Reinicie o backend
4. Delete a chave antiga no console

**Senha do Banco:**
1. Altere no PostgreSQL
2. Atualize `DATABASE_URL`
3. Reinicie todos os serviços

---

## Troubleshooting

### "IA não configurada" (Claude Code ou API)

Se estiver em `IA_PROVIDER=claude_code`:

```bash
claude --version
claude -p "Responda apenas: OK"
```

Se estiver em `IA_PROVIDER=anthropic_api`:

```bash
# Verifique se está no arquivo
grep CLAUDE_API_KEY .env

# Verifique se está sendo carregada
cd backend
python -c "from app.core.config import configuracoes; print((configuracoes.CLAUDE_API_KEY or '')[:10] + '...')"
```

### "SECRET_KEY padrão detectada"

```bash
# Gere uma nova chave
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Atualize o .env
nano .env
```

### "Conexão com banco recusada"

```bash
# Verifique se PostgreSQL está rodando
docker ps | grep postgres
# ou
systemctl status postgresql

# Verifique a URL
echo $DATABASE_URL

# Teste conexão manual
psql postgresql://usuario:senha@host:porta/banco
```

---

*Última atualização: Janeiro 2026*
