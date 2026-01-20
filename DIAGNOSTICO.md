# DIAGNÓSTICO DO PROJETO - Pesquisa Eleitoral DF

**Data:** 2026-01-20
**Status:** Em correção
**Última atualização:** Build passando

---

## ERROS CRÍTICOS (Bloqueiam Build)

### 1. ~~Props inexistentes no MapaCalorDF~~ ✅ CORRIGIDO
**Arquivo:** `src/app/(dashboard)/mapa/page.tsx` e `src/app/teste-mapa/page.tsx`
**Erro:** Props removidas do componente MapaCalorDF mas ainda usadas nas páginas
**Status:** CORRIGIDO - Props removidas das páginas

---

## WARNINGS (Não bloqueiam, mas devem ser corrigidos)

### React Hooks - Dependências Faltando

| Arquivo | Linha | Hook | Dependência Faltando |
|---------|-------|------|---------------------|
| admin/usuarios/page.tsx | 84 | useEffect | carregarDados |
| entrevistas/execucao/page.tsx | 219 | useCallback | respostasRecebidas, tempoInicio |
| entrevistas/execucao/page.tsx | 274 | useEffect | sessaoAtual |
| historico/page.tsx | 318 | useEffect | carregarPesquisas |
| mapa/page.tsx | 380 | useEffect | carregarDados |
| pesquisas-parlamentares/[id]/page.tsx | 74, 82 | useEffect | carregarPesquisa |
| pesquisas-parlamentares/[id]/resultados/page.tsx | 92 | useEffect | carregarDados |
| AgentesFilters.tsx | 356 | useEffect | buscaLocal |
| CandidatosList.tsx | 96, 113, 193 | useEffect | carregarCandidatos, filtros, limparErro |
| GestoresCharts.tsx | 298-312 | useMemo | formatarDados (15 ocorrências) |
| GestoresFilters.tsx | 375 | useEffect | buscaLocal |
| ParlamentaresCharts.tsx | 405-429 | useMemo | formatarDados (25 ocorrências) |
| ParlamentaresFilters.tsx | 381 | useEffect | buscaLocal |
| AnalisadorInteligente.tsx | 52 | useEffect | handleAnalisar |

### Uso de `<img>` ao invés de `<Image />`

| Arquivo | Linha |
|---------|-------|
| admin/usuarios/page.tsx | 341 |
| CandidatoCard.tsx | 83 |
| CandidatoDetails.tsx | 123 |
| SimuladorCenario.tsx | 286 |
| DadosTempoReal.tsx | 238, 300 |

---

## ARQUIVOS A VERIFICAR

### Páginas do Dashboard
- [ ] `/` - Dashboard principal
- [ ] `/mapa` - Mapa de calor (ERRO DE BUILD)
- [ ] `/eleitores` - Lista de eleitores
- [ ] `/entrevistas` - Gerenciar entrevistas
- [ ] `/resultados` - Resultados das pesquisas
- [ ] `/historico` - Histórico de pesquisas
- [ ] `/candidatos` - Gerenciar candidatos
- [ ] `/cenarios` - Simulador de cenários
- [ ] `/admin/usuarios` - Gerenciar usuários
- [ ] `/configuracoes` - Configurações

### Componentes Críticos
- [ ] MapaCalorDF - Simplificado, precisa verificar compatibilidade
- [ ] AgentesFilters - Warning de hook
- [ ] CandidatosList - Múltiplos warnings
- [ ] GestoresCharts - 15 warnings de useMemo
- [ ] ParlamentaresCharts - 25 warnings de useMemo

---

## PRÓXIMOS PASSOS

1. ~~**URGENTE:** Corrigir erro de build em `/mapa/page.tsx`~~ ✅ FEITO
2. ~~Corrigir warnings críticos de hooks~~ ✅ FEITO (principais páginas)
3. Substituir `<img>` por `<Image />` do Next.js (6 arquivos)
4. Corrigir warnings restantes em componentes de Charts (40+ warnings)
5. Testar todas as rotas do dashboard
6. Verificar integração com backend

## STATUS ATUAL

- **Build:** ✅ Passando
- **Dev Server:** ✅ Funcionando (localhost:3000)
- **Páginas verificadas:** 36 páginas encontradas
- **Dados:** ✅ Arquivos JSON de eleitores/candidatos presentes
- **Navegação:** ✅ Sidebar com 14 itens de menu principais

---

## COMANDOS ÚTEIS

```bash
# Rodar lint
cd frontend && npm run lint

# Rodar build (verifica erros)
cd frontend && npm run build

# Dev server
cd frontend && npm run dev
```

---

## NOTAS PARA OUTRAS IAs

- O componente `MapaCalorDF` foi simplificado e algumas props foram removidas
- A página `/mapa` ainda usa props antigas que não existem mais
- Muitos hooks têm dependências faltando - padrão comum quando funções são definidas fora do hook
- O projeto usa Next.js 14 com App Router
