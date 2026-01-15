# Pesquisa Eleitoral DF 2026

Sistema de simulação de pesquisas eleitorais usando agentes de IA que representam 400+ perfis sintéticos de eleitores do Distrito Federal.

## Rodar Localmente

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

### Docker (Tudo junto)

```bash
docker-compose up -d
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `CLAUDE_API_KEY` | Sua chave da API Anthropic |
| `SECRET_KEY` | Chave secreta para JWT |
| `DATABASE_URL` | URL do PostgreSQL |
| `FRONTEND_URL` | URL do frontend |

## Deploy

### Backend no Render

1. Acesse [render.com](https://render.com) e faça login com GitHub
2. Clique **New** → **Web Service**
3. Conecte o repositório `pesquisa-eleitoral-df`
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Docker
5. Adicione as variáveis de ambiente (veja tabela acima)
6. Clique **Create Web Service**

### Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique **Add New** → **Project**
3. Selecione o repositório `pesquisa-eleitoral-df`
4. Configure **Root Directory**: `frontend`
5. Adicione variável: `NEXT_PUBLIC_API_URL` = URL do backend no Render
6. Clique **Deploy**

## Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Banco**: PostgreSQL
- **IA**: Claude API (Anthropic)
