# Pesquisa Eleitoral DF 2026 - Mapa do Sistema

> **GPS IA**: Indice raiz para navegacao rapida no codebase

## Visao Geral

Sistema full-stack de pesquisa eleitoral usando agentes sinteticos de IA.
Simula pesquisas com 1000+ perfis de eleitores do Distrito Federal.

## Estrutura Principal

```
/
├── frontend/         <- [_INDEX.md] Next.js 14 + TypeScript
├── backend/          <- [_INDEX.md] FastAPI + PostgreSQL
├── agentes/          <- [_INDEX.md] JSONs de eleitores/candidatos
├── docs/             <- [_INDEX.md] Documentacao completa
├── scripts/          <- [_INDEX.md] Scripts Python e PowerShell
├── data/             <- Dados de parlamentares
├── memorias/         <- Historico de entrevistas (JSON)
├── resultados/       <- Resultados exportados
├── _INSIGHTS.md      <- Notas importantes para IAs
└── .env              <- Variaveis de ambiente
```

## Navegacao Rapida

| Preciso de... | Ir para... |
|---------------|------------|
| **Frontend (UI)** | [frontend/_INDEX.md](frontend/_INDEX.md) |
| **Backend (API)** | [backend/_INDEX.md](backend/_INDEX.md) |
| **Dados de eleitores** | [agentes/_INDEX.md](agentes/_INDEX.md) |
| **Dados verificados (overrides/snapshots)** | [data/_INDEX.md](data/_INDEX.md) |
| **Documentacao** | [docs/_INDEX.md](docs/_INDEX.md) |
| **Scripts utilitarios** | [scripts/_INDEX.md](scripts/_INDEX.md) |
| **Notas e insights** | [_INSIGHTS.md](_INSIGHTS.md) |
| **Endpoints da API** | [backend/app/api/rotas/_INDEX.md](backend/app/api/rotas/_INDEX.md) |
| **Componentes React** | [frontend/src/components/_INDEX.md](frontend/src/components/_INDEX.md) |
| **Estado global** | [frontend/src/stores/_INDEX.md](frontend/src/stores/_INDEX.md) |
| **Modelos do banco** | [backend/app/modelos/_INDEX.md](backend/app/modelos/_INDEX.md) |
| **Servicos/logica** | [backend/app/servicos/_INDEX.md](backend/app/servicos/_INDEX.md) |
| **Integracao Claude** | [backend/app/servicos/_INDEX.md](backend/app/servicos/_INDEX.md) -> claude_servico.py |
| **Tipos TypeScript** | [frontend/src/types/_INDEX.md](frontend/src/types/_INDEX.md) |
| **Schemas Pydantic** | [backend/app/esquemas/_INDEX.md](backend/app/esquemas/_INDEX.md) |

## Comandos Essenciais

```bash
# Frontend
cd frontend && npm run dev      # http://localhost:3000

# Backend
cd backend && uvicorn app.main:app --reload  # http://localhost:8000

# Docker (Full Stack)
docker-compose up -d
```

## URLs de Producao

- **Frontend**: https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app
- **Backend**: https://pesquisa-eleitoral-df-1.onrender.com
- **API Docs**: https://pesquisa-eleitoral-df-1.onrender.com/docs

## Credenciais de Teste

```
Usuario: professorigor
Senha: professorigor
Papel: admin
```

## Fluxo Principal

```
1. Usuario faz login (/login)
2. Ve dashboard com estatisticas dos eleitores
3. Cria entrevista: seleciona eleitores + perguntas
4. Executa entrevista: Claude processa cada resposta
5. Ve resultados: graficos, insights, mapas de calor
6. Exporta: PDF, XLSX, DOCX
```

## Arquivos Importantes

| Arquivo | Funcao |
|---------|--------|
| `CLAUDE.md` | Instrucoes para o Claude Code |
| `.env` | Variaveis de ambiente (API keys, etc) |
| `docker-compose.yml` | Configuracao Docker |
| `agentes/banco-eleitores-df.json` | Banco de eleitores |

## Sistema GPS (3 Arquivos por Pasta)

Cada pasta importante tem 3 arquivos de controle:

| Arquivo | Proposito |
|---------|-----------|
| `_INDEX.md` | **MAPA** - Lista arquivos, funcoes, links |
| `_INSIGHTS.md` | **NOTAS** - Descobertas, problemas, decisoes |
| `_CHECKLIST.md` | **TAREFAS** - O que fazer, status, prioridade |

**Como usar**: Leia os 3 arquivos ao entrar em uma pasta. Atualize-os ao fazer mudancas.

## Ver tambem

- [_INSIGHTS.md](_INSIGHTS.md) - Notas importantes para IAs
- [_CHECKLIST.md](_CHECKLIST.md) - Tarefas pendentes do projeto
- [CLAUDE.md](CLAUDE.md) - Instrucoes completas do sistema GPS
