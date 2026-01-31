# INSTRUÇÕES PARA IMPLEMENTAÇÃO DA FASE 1 - MVP BETA
# Projeto: Pesquisa Eleitoral DF 2026

## CONTEXTO DO PROJETO

Este é um sistema de simulação de pesquisas eleitorais usando 400+ agentes de IA (Claude) que representam eleitores sintéticos do Distrito Federal.

**Repositório:** https://github.com/igormorais123/pesquisa-eleitoral-df

### Stack Tecnológico
- **Backend:** FastAPI (Python 3.11+)
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Banco de Dados:** PostgreSQL (ou JSON local para desenvolvimento)
- **IA:** Claude API (Anthropic) - Sonnet 4.5 para entrevistas, Opus 4.5 para insights
- **Deploy:** Render (backend) + Vercel (frontend)

---

## ESTADO ATUAL DO CÓDIGO

O repositório JÁ POSSUI código implementado:

### Backend (IMPLEMENTADO):
- ✅ FastAPI configurado com CORS
- ✅ Autenticação JWT (usuário demo: professorigor/professorigor)
- ✅ CRUD de eleitores
- ✅ Sistema de entrevistas com execução assíncrona
- ✅ Integração com Claude API (4 etapas cognitivas)
- ✅ Serviço de resultados
- ✅ Dockerfile configurado

### Frontend (IMPLEMENTADO):
- ✅ Next.js 14 com App Router
- ✅ Páginas: login, dashboard, eleitores, entrevistas, resultados
- ✅ Componentes shadcn/ui
- ✅ API routes para Claude

### Dados:
- ✅ 400+ perfis de eleitores em `agentes/banco-eleitores-df.json`
- ✅ Pasta `memorias/` para armazenamento de entrevistas

---

## TAREFAS DA FASE 1 (MVP)

### PASSO 1: Clonar e Configurar Ambiente

```bash
# Clonar o repositório
git clone https://github.com/igormorais123/pesquisa-eleitoral-df.git
cd pesquisa-eleitoral-df

# Backend - criar ambiente virtual e instalar dependências
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
```

### PASSO 2: Configurar Variáveis de Ambiente

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Editar `backend/.env` (recomendado: assinatura Claude Code):
```env
IA_PROVIDER=claude_code
IA_MODELO_ENTREVISTAS=sonnet
IA_MODELO_INSIGHTS=opus
IA_ALLOW_API_FALLBACK=false

# (Opcional) API - use apenas se IA_PROVIDER=anthropic_api
CLAUDE_API_KEY=
SECRET_KEY=chave-secreta-para-jwt-gerar-uma-forte
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
AMBIENTE=development
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.example .env.local
```

Editar `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NODE_ENV=development
```

### PASSO 3: Iniciar Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Verificar:** Acessar http://localhost:8000/docs para ver Swagger UI

### PASSO 4: Testar Endpoints Básicos

1. **Login:** POST /api/v1/auth/login
   - Body: `{"username": "professorigor", "password": "professorigor"}`
   - Copiar o `access_token` retornado

2. **Listar Eleitores:** GET /api/v1/eleitores
   - Header: `Authorization: Bearer <token>`

3. **Estatísticas:** GET /api/v1/eleitores/estatisticas

### PASSO 5: Iniciar Frontend

```bash
cd frontend
npm install
npm run dev
```

**Verificar:** Acessar http://localhost:3000

### PASSO 6: Testar Fluxo Completo

1. Fazer login no frontend (professorigor/professorigor)
2. Navegar para "Eleitores" - verificar se lista os 400+ agentes
3. Navegar para "Entrevistas" > "Nova Entrevista"
4. Criar uma entrevista de teste com:
   - Título: "Teste MVP"
   - 1 pergunta simples
   - 5 eleitores selecionados (para economizar custo)
5. Iniciar a execução
6. Verificar os resultados

### PASSO 7: Corrigir Problemas Encontrados

Problemas comuns a verificar:
- [ ] CORS bloqueando requisições
- [ ] API Key do Claude inválida
- [ ] Conexão com banco de dados
- [ ] Erros de TypeScript no frontend
- [ ] Endpoints retornando 500

### PASSO 8: Deploy no Render (Backend)

1. Acessar https://render.com
2. Conectar repositório GitHub
3. Criar Web Service:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Environment Variables:**
      - IA_PROVIDER (recomendado: anthropic_api em servidor)
      - IA_MODELO_ENTREVISTAS
      - IA_MODELO_INSIGHTS
      - IA_ALLOW_API_FALLBACK
      - CLAUDE_API_KEY (se IA_PROVIDER=anthropic_api)
      - SECRET_KEY
      - DATABASE_URL (usar Render PostgreSQL ou outro)
      - FRONTEND_URL (URL do Vercel após deploy)
      - AMBIENTE=production

### PASSO 9: Deploy na Vercel (Frontend)

1. Acessar https://vercel.com
2. Importar repositório
3. Configurar:
   - **Root Directory:** `frontend`
   - **Environment Variables:**
      - NEXT_PUBLIC_BACKEND_URL (URL do Render)
      - NODE_ENV=production

### PASSO 10: Testes Finais em Produção

1. Acessar URL da Vercel
2. Fazer login
3. Testar fluxo completo de entrevista
4. Verificar se resultados são exibidos corretamente

---

## ARQUIVOS PRINCIPAIS A VERIFICAR/MODIFICAR

### Backend:
- `backend/app/main.py` - Entry point
- `backend/app/core/config.py` - Configurações
- `backend/app/servicos/claude_servico.py` - Integração Claude
- `backend/app/servicos/entrevista_servico.py` - Lógica de entrevistas
- `backend/app/api/rotas/entrevistas.py` - Endpoints de entrevistas

### Frontend:
- `frontend/src/app/(dashboard)/page.tsx` - Dashboard
- `frontend/src/app/(dashboard)/entrevistas/nova/page.tsx` - Criar entrevista
- `frontend/src/app/(dashboard)/entrevistas/execucao/page.tsx` - Executar
- `frontend/src/app/(dashboard)/resultados/page.tsx` - Resultados
- `frontend/src/services/api.ts` - Cliente HTTP

---

## CREDENCIAIS DE TESTE

- **Usuário:** professorigor
- **Senha:** professorigor

---

## CHECKLIST FINAL DO MVP

- [ ] Backend roda sem erros localmente
- [ ] Frontend roda sem erros localmente
- [ ] Login funciona
- [ ] Listagem de eleitores funciona
- [ ] Criar entrevista funciona
- [ ] Executar entrevista com Claude API funciona
- [ ] Resultados são exibidos
- [ ] Deploy no Render está online
- [ ] Deploy na Vercel está online
- [ ] Fluxo completo funciona em produção

---

## OBSERVAÇÕES IMPORTANTES

1. **Custo da API:** Cada entrevista com 400 eleitores e múltiplas perguntas pode custar R$50-200. Para testes, use apenas 5-10 eleitores.

2. **Limite de custo:** O sistema tem controle de limite de custo por entrevista. Configure adequadamente.

3. **CORS:** Se houver problemas de CORS em produção, verificar `backend/app/main.py` e adicionar a URL da Vercel na lista de origens permitidas.

4. **Banco de dados:** O sistema pode funcionar com JSON local (pasta `memorias/`) ou PostgreSQL. Para produção, recomenda-se PostgreSQL.

---

## COMANDO PARA INICIAR CLAUDE CODE NO DIRETÓRIO CORRETO

```bash
cd C:\Users\igorm\pesquisa-eleitoral-df
claude
```

Ou clonar novamente se necessário:
```bash
git clone https://github.com/igormorais123/pesquisa-eleitoral-df.git C:\Users\igorm\pesquisa-eleitoral-df
cd C:\Users\igorm\pesquisa-eleitoral-df
claude
```
