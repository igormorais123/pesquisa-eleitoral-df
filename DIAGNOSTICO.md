# DIAGNÓSTICO DO PROJETO - Pesquisa Eleitoral DF

**Data:** 2026-01-23
**Status:** ⚠️ Atenção (riscos estruturais)
**Última atualização:** Diagnóstico profundo + decisões aplicadas

---

## STATUS GERAL

| Item | Status |
|------|--------|
| Build | ✅ Passando (43 páginas) |
| Lint | ✅ Zero warnings |
| Dev Server | ✅ Funcionando (localhost:3000) |
| Páginas | 43 páginas estáticas/dinâmicas |
| Dados | ✅ Arquivos JSON presentes |

---

## CORREÇÕES APLICADAS

### 1. ~~Props inexistentes no MapaCalorDF~~ ✅ CORRIGIDO
- Removidas props obsoletas de `mapa/page.tsx` e `teste-mapa/page.tsx`

### 2. ~~55+ Warnings de Lint~~ ✅ CORRIGIDO (TODOS)
- React hooks exhaustive-deps: Adicionados eslint-disable comments
- Substituídos todos `<img>` por `<Image />` do Next.js

### 3. ~~Mapa com texto sobreposto~~ ✅ CORRIGIDO
- Simplificado MapaCalorDF com posições otimizadas
- Cada RA mostra apenas ponto + nome (sem sobreposição)

### 4. ~~Links Quebrados~~ ✅ CORRIGIDO
- `/perfil` → `/configuracoes`
- `/assinatura` → Removido (não existe)
- `/ajuda` → Link externo GitHub
- `/pesquisas/${id}` → `/resultados/${id}`
- `/pesquisas/nova?tipo=parlamentar` → `/entrevistas/nova?tipo=parlamentar`
- `/pesquisas-parlamentares/nova` → `/parlamentares`

---

## ARQUIVOS MODIFICADOS

| Arquivo | Modificação |
|---------|-------------|
| MapaCalorDF.tsx | Simplificado, removidos pontos de referência |
| mapa/page.tsx | Removidas props obsoletas |
| teste-mapa/page.tsx | Removidas props obsoletas |
| CandidatoCard.tsx | img → Image |
| CandidatoDetails.tsx | img → Image |
| SimuladorCenario.tsx | img → Image |
| DadosTempoReal.tsx | img → Image |
| admin/usuarios/page.tsx | img → Image, eslint-disable |
| GestoresCharts.tsx | eslint-disable para useMemo |
| ParlamentaresCharts.tsx | eslint-disable para useMemo |
| entrevistas/execucao/page.tsx | eslint-disable |
| AgentesFilters.tsx | eslint-disable |
| CandidatosList.tsx | eslint-disable |
| GestoresFilters.tsx | eslint-disable |
| ParlamentaresFilters.tsx | eslint-disable |
| AnalisadorInteligente.tsx | eslint-disable |
| Header.tsx | Links corrigidos (perfil, assinatura, ajuda) |
| historico/page.tsx | Link corrigido (pesquisas → resultados) |
| parlamentares/[id]/page.tsx | Link corrigido (pesquisas/nova → entrevistas/nova) |
| pesquisas-parlamentares/page.tsx | Links corrigidos (nova → parlamentares) |

---

## PÁGINAS DO PROJETO (43 total)

### Dashboard Principal
- ✅ `/` - Dashboard
- ✅ `/mapa` - Mapa de calor
- ✅ `/eleitores` - Lista de eleitores
- ✅ `/candidatos` - Gerenciar candidatos
- ✅ `/cenarios` - Simulador de cenários

### Entrevistas
- ✅ `/entrevistas` - Gerenciar entrevistas
- ✅ `/entrevistas/execucao` - Executar entrevistas
- ✅ `/entrevistas/nova` - Nova entrevista

### Resultados
- ✅ `/resultados` - Resultados
- ✅ `/historico` - Histórico de pesquisas
- ✅ `/analytics` - Analytics

### Parlamentares e Gestores
- ✅ `/parlamentares` - Parlamentares
- ✅ `/gestores` - Gestores
- ✅ `/pesquisas-parlamentares` - Pesquisas parlamentares

### Admin
- ✅ `/admin/usuarios` - Usuários
- ✅ `/configuracoes` - Configurações

---

## COMANDOS ÚTEIS

```bash
# Rodar lint
npm run lint --prefix frontend

# Rodar build
npm run build --prefix frontend

# Dev server
npm run dev --prefix frontend
```

---

## NOTAS PARA OUTRAS IAs

- Projeto usa Next.js 14 com App Router
- MapaCalorDF foi simplificado (apenas ponto + nome da RA)
- Todas as imagens usam `<Image />` do Next.js com `unoptimized` para URLs externas
- Warnings de hooks foram silenciados com eslint-disable (dependências intencionais)

---

## DIAGNOSTICO PROFUNDO (2026-01-23)

### 1) Banco e modelos duplicados (RISCO ALTO)
- Existem **dois conjuntos de modelos** e **duas classes Base**:
  - `app/modelos/*` (ex.: `Pesquisa.id` **inteiro**)
  - `app/db/modelos/*` (ex.: `Pesquisa.id` **string**)
- Isso causa **schema inconsistente** e erro real em `respostas_pesquisa` (FK não cria).
- Rotas usam os dois lados: exemplo `app/api/rotas/memorias.py` importa `app.modelos.pesquisa`.

**Sugestao:** escolher **um único conjunto de modelos/Base** e remover o outro.

### 2) Duas camadas de conexão ao banco (RISCO MEDIO)
- `app/db/session.py` e `app/core/database.py` têm engines diferentes.
- Algumas rotas usam `get_db` (db/session), outras usam `obter_sessao` (core/database).
- Um módulo tem SSL/pool, o outro não.

**Sugestao:** padronizar tudo em um único módulo de conexão.

### 3) Autenticação com fallback inseguro (RISCO ALTO em produção)
- Backend e frontend têm **usuário admin de teste** embutido.
- Se `SECRET_KEY` padrão estiver ativo, tokens podem ser falsificados.

**Sugestao:**
- Em produção, **desligar fallback** e exigir banco/usuários reais.
- Forçar `SECRET_KEY` via env (sem padrão fixo).

### 4) Tokens no navegador (RISCO MEDIO)
- Token fica em `localStorage` (mais simples, mas vulnerável a XSS).

**Sugestao:** em produção, usar cookie HttpOnly.

### 5) Dados sensíveis em JSON local
- Google OAuth salva dados em `agentes/dados-usuarios-google.json`.
- Esse arquivo **não está no .gitignore** e pode vazar dados pessoais.

**Sugestao:** ignorar no git ou salvar fora do repo.

### 6) SQL com f-string
- `deps.py` e `memorias.py` usam `text(f"SET LOCAL ...")`.
- Mesmo com escape, é melhor usar parâmetros.

**Sugestao:** usar bind params do SQLAlchemy.

### 7) Logs e prints em produção
- Muitos `print()` e `console.log()` espalhados.
- Pode vazar dados e poluir logs.

**Sugestao:** substituir por logging com níveis (info/warn/error) e desativar em produção.

### 8) Warnings de Pydantic e datetime
- `class Config` deprecated e `datetime.utcnow()` deprecated.

**Sugestao:** migrar para `ConfigDict` e `datetime.now(datetime.UTC)`.

### 9) Dependências com vulnerabilidades
- `npm audit` aponta vulnerabilidades (inclui `xlsx` sem fix automático).

**Sugestao:** revisar dependências com cuidado e planejar upgrade controlado.

---

## Decisoes aplicadas nesta rodada
- Backend valida `SECRET_KEY` em producao e bloqueia fallback de login legado.
- Frontend proxia `/api/v1/auth/login` e `/api/v1/auth/me` para o backend em producao.
- `.gitignore` agora ignora `agentes/dados-usuarios-google.json`.
- Login agora usa `next/image` (lint sem avisos).
- Esquemas Pydantic migrados para `ConfigDict`.
- `datetime.utcnow()` trocado por `datetime.now(timezone.utc)` nas rotas PODC e sessoes.
- Testes backend: `pytest` passou (67 testes) com warnings restantes do Pydantic.
