# _INSIGHTS.md - Notas para IAs

**Ultima atualizacao**: 26 Janeiro 2026  
**Proposito**: Anotacoes importantes, erros conhecidos e dicas para IAs trabalhando neste projeto

---

## Historico de Sessoes

### Sessao 26/01/2026

**O que foi feito:**

1. **Sistema GPS de Navegacao para IAs** - Criado sistema completo com 3 arquivos por pasta:
   - `_INDEX.md` - Mapa de navegacao (22 arquivos)
   - `_INSIGHTS.md` - Notas e erros conhecidos (21 arquivos)
   - `_CHECKLIST.md` - Tarefas pendentes (21 arquivos)
   - **Total: 64 arquivos de navegacao**

2. **CLAUDE.md Atualizado** - Adicionadas instrucoes completas do sistema GPS:
   - Como navegar usando os 3 arquivos
   - Quando ler e atualizar cada arquivo
   - Exemplos de fluxo de trabalho
   - Estrutura padrao de cada arquivo

3. **Mapeamento Completo do Codebase:**
   - Backend: core, db, esquemas, modelos, servicos, api/rotas, parlamentares
   - Frontend: app, components, hooks, lib, services, stores, types
   - Raiz: agentes, docs, scripts

4. **Ambiente Local Iniciado:**
   - Backend FastAPI: http://localhost:8000
   - Frontend Next.js: http://localhost:3000
   - Comando: `start powershell` para cada servico

**Problemas encontrados:**
- Script `dev.ps1` com problemas de encoding UTF-8 (emojis)
- Solucao: iniciar servicos manualmente com `start powershell`

---

## Erros LSP Conhecidos (nao quebram execucao)

### Backend - Tipos e Atributos

| Arquivo | Linha | Erro | Impacto |
|---------|-------|------|---------|
| `backend/app/core/database.py` | ~15 | `datetime` tipo incompativel | Baixo - funciona em runtime |
| `backend/app/core/rls_middleware.py` | ~20-30 | Atributos podem ser None | Baixo - tem fallbacks |
| `backend/app/db/session.py` | ~10 | `execute()` com string literal | Baixo - funciona em runtime |
| `backend/app/api/rotas/autenticacao.py` | ~45 | `usuario_id` pode ser None | Medio - tratar com `if` |
| `backend/app/api/rotas/eleitores.py` | ~80 | `exportar_csv` nao existe | Alto - funcao faltando |

### Acoes Recomendadas

1. **exportar_csv**: Precisa ser implementada ou removida da rota
2. **usuario_id None**: Adicionar verificacao `if not usuario_id: raise HTTPException(401)`
3. **Demais erros**: Sao warnings de tipagem, codigo funciona

---

## Decisoes Arquiteturais Importantes

### 1. Multi-tenancy via RLS (Row Level Security)

O sistema usa RLS do PostgreSQL para isolar dados por usuario:
- Cada request seta `app.current_user_id` no banco
- Politicas RLS filtram automaticamente
- **ATENCAO**: Middlewares devem setar usuario ANTES de queries

### 2. Eleitores Sinteticos - Nao Sao Usuarios Reais

Os 1000+ eleitores em `agentes/banco-eleitores-df.json`:
- Sao gerados por IA (Claude)
- Representam perfis estatisticamente realistas do DF
- Baseados em dados PDAD (Pesquisa Distrital por Amostra de Domicilios)
- **NUNCA** sao pessoas reais - nao confundir

### 3. Dois Modelos Claude

- **Claude Opus 4.5**: Para respostas complexas de eleitores
- **Claude Sonnet 4**: Para operacoes rapidas/simples
- Configurado em `frontend/src/lib/claude/`

### 4. Autenticacao JWT + bcrypt

- Tokens JWT com expiracao de 24h
- Senhas hasheadas com bcrypt
- Refresh tokens nao implementados ainda

---

## Padroes do Codigo

### Backend (Python/FastAPI)

```python
# Imports sempre organizados
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Rotas com prefixo /api/v1
router = APIRouter(prefix="/eleitores", tags=["eleitores"])

# Sempre usar tipagem
async def listar(db: AsyncSession = Depends(get_db)) -> list[EleitorSchema]:
```

### Frontend (TypeScript/Next.js)

```typescript
// Componentes com 'use client' quando necessario
'use client'

// Hooks customizados em /hooks
import { useEleitores } from '@/hooks/useEleitores'

// API via React Query
const { data, isLoading } = useEleitores()
```

---

## Dados Importantes

### Regioes Administrativas (RAs) do DF

As 33 RAs com maiores populacoes:
1. Ceilandia (~350k)
2. Samambaia (~280k)
3. Plano Piloto (~220k)
4. Taguatinga (~210k)
5. Planaltina (~200k)

### Distribuicao de Cluster Socioeconomico

| Cluster | Descricao | % Populacao |
|---------|-----------|-------------|
| A | Alta renda | 5% |
| B | Media-alta | 15% |
| C | Media | 35% |
| D | Media-baixa | 30% |
| E | Baixa | 15% |

### Orientacao Politica no DF

Baseado em votacoes recentes:
- Direita/Centro-direita: ~55%
- Centro: ~15%
- Esquerda/Centro-esquerda: ~30%

---

## Armadilhas Comuns

### 1. Banco de Eleitores Grande

O arquivo `agentes/banco-eleitores-df.json` tem ~15MB:
- Nao carregue tudo em memoria no frontend
- Use paginacao/virtualizacao
- Backend ja tem endpoints paginados

### 2. CORS em Desenvolvimento

Se tiver erros de CORS:
- Backend roda em `:8000`
- Frontend em `:3000`
- Verificar `FRONTEND_URL` no backend

### 3. Variaveis de Ambiente

Arquivos `.env` importantes:
- `.env` - Variaveis gerais
- `.env.local` - Sobrescreve para dev local
- Tokens Vercel/Render estao no `.env`

### 4. Imports Circulares no Backend

Se der erro de import circular:
- Mover imports para dentro das funcoes
- Usar `TYPE_CHECKING` para tipagem
- Revisar estrutura de modulos

---

## Features Planejadas (Backlog)

1. [ ] Implementar `exportar_csv` em eleitores
2. [ ] Adicionar refresh tokens
3. [ ] Melhorar tratamento de erros RLS
4. [ ] Cache Redis para consultas frequentes
5. [ ] Websockets para entrevistas em tempo real
6. [ ] Dashboard de metricas administrativas

---

## Contatos e Referencias

- **Projeto**: Pesquisa Eleitoral DF 2026
- **Autor**: Professor Igor
- **GitHub**: https://github.com/igormorais123/pesquisa-eleitoral-df
- **Vercel Dashboard**: https://vercel.com/igormorais123s-projects
- **Render Dashboard**: https://dashboard.render.com

---

## Como Usar Este Arquivo

1. **Leia primeiro** ao iniciar trabalho no projeto
2. **Atualize** quando descobrir algo importante
3. **Registre** decisoes arquiteturais aqui
4. **Anote** bugs conhecidos para evitar retrabalho

Este arquivo complementa os `_INDEX.md` com informacoes que nao cabem em indices de navegacao.
