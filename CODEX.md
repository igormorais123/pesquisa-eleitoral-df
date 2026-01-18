# CODEX.md

Instruções para o OpenAI Codex CLI neste projeto.

## IDIOMA

Todas as respostas devem ser em **Português do Brasil**.

## Projeto

**Pesquisa Eleitoral DF 2026** - Sistema full-stack de pesquisa eleitoral com agentes AI sintéticos.

## Comandos Principais

```bash
# Frontend (Next.js)
cd frontend && npm run dev

# Backend (FastAPI)
cd backend && python -m uvicorn app.main:app --reload

# Docker
docker-compose up -d
```

## Estrutura

- `frontend/` - Next.js 14 + TypeScript + Tailwind
- `backend/` - FastAPI + SQLAlchemy + PostgreSQL
- `agentes/` - Perfis de eleitores sintéticos (JSON)

## Deploy

- **Frontend**: Vercel (pesquisa-eleitoral-df)
- **Backend**: Render (pesquisa-eleitoral-df-1.onrender.com)

## Permissões

Este projeto autoriza execução autônoma de:
- Criação/edição de arquivos
- Execução de scripts
- Commits e push para Git
- Deploy para Vercel/Render
