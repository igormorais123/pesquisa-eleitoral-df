# Backend - FastAPI + PostgreSQL

> **GPS IA**: API REST Python para pesquisa eleitoral

## Estrutura

```
backend/
├── app/                 <- [_INDEX.md] Aplicacao FastAPI
├── alembic/             <- Migrations de banco de dados
├── data/                <- Dados gerados (memorias, resultados)
├── scripts/             <- Scripts utilitarios
├── tests/               <- Testes pytest
├── requirements.txt     <- Dependencias Python
└── .env                 <- Variaveis de ambiente (NAO commitado)
```

## Links Rapidos

| Preciso de... | Ir para... |
|---------------|------------|
| Codigo da aplicacao | [app/_INDEX.md](app/_INDEX.md) |
| Endpoints da API | [app/api/rotas/_INDEX.md](app/api/rotas/_INDEX.md) |
| Modelos do banco | [app/modelos/_INDEX.md](app/modelos/_INDEX.md) |
| Servicos/logica | [app/servicos/_INDEX.md](app/servicos/_INDEX.md) |
| Configuracoes | [app/core/_INDEX.md](app/core/_INDEX.md) |

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLAlchemy 2.0 (async)
- **Banco**: PostgreSQL 15
- **Auth**: JWT + bcrypt
- **IA**: Anthropic Claude API
- **Migrations**: Alembic

## Comandos

```bash
# Instalar dependencias
cd backend
pip install -r requirements.txt

# Iniciar servidor (dev)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Rodar testes
pytest

# Migrations
alembic upgrade head        # Aplicar
alembic revision --autogenerate -m "msg"  # Criar
```

## Variaveis de Ambiente

```
CLAUDE_API_KEY=sk-ant-...
SECRET_KEY=<chave-jwt-segura>
DATABASE_URL=postgresql://user:pass@host:5432/db
FRONTEND_URL=http://localhost:3000
AMBIENTE=development|production

# OAuth Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

## Deploy (Render)

- URL Producao: https://pesquisa-eleitoral-df-1.onrender.com
- Tipo: Web Service
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## API Base URL

- Dev: http://localhost:8000/api/v1
- Prod: https://pesquisa-eleitoral-df-1.onrender.com/api/v1
