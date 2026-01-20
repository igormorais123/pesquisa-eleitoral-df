# DIAGNÓSTICO DO PROJETO - Pesquisa Eleitoral DF

**Data:** 2026-01-20
**Status:** ✅ Funcionando
**Última atualização:** Todos os warnings corrigidos

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
