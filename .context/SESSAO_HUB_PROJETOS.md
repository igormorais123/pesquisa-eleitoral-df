# Sessão: Hub de Projetos INTEIA

> Arquivo de tracking para implementação da página intermediária de escolha de projetos

## Data: 2026-01-27

## Objetivo

Criar página intermediária criativa (estilo Apple) entre login e sistema, permitindo escolha entre diferentes projetos/produtos da INTEIA.

---

## Checklist de Implementação

### Fase 1 - Estrutura
- [x] Criar componente Hub de Projetos (`/` - rota raiz)
- [x] Configurar roteamento pós-login
- [x] Definir estrutura de dados dos projetos

### Fase 2 - Design Criativo
- [x] Layout fluido com animações Framer Motion
- [x] Cards de projeto com hover effects
- [x] Background com efeitos visuais (blur, gradientes)
- [x] Design responsivo (mobile-first)

### Fase 3 - Projetos a Incluir
- [x] Sistema de Pesquisa Eleitoral (principal)
- [x] Stress Test Eleitoral (relatórios)
- [x] Aula de Claude Code
- [x] Chatbot INTEIA
- [x] Sistema de Ouvidoria
- [x] Participa DF
- [x] Aula de Agentes Simulados
- [x] Jogo Agentes Generativos

### Fase 4 - Integração
- [x] Atualizar fluxo de login
- [x] Corrigir links existentes (Sidebar, MobileNav, Header, GlobalSearch)
- [x] Build de produção validado

---

## Projetos Identificados

| Nome | Descrição | URL/Path | Status |
|------|-----------|----------|--------|
| Pesquisa Eleitoral | Sistema principal de agentes eleitorais | /dashboard | Ativo |
| Stress Test | Relatórios de stress test eleitoral | /resultados-stress-test | Ativo |
| Aula Claude Code | Tutorial interativo de Claude Code | Em desenvolvimento | Beta |
| Chatbot | Chatbot conversacional INTEIA | Em desenvolvimento | Beta |
| Ouvidoria | Análise de demandas de ouvidoria | Em desenvolvimento | Beta |
| Participa DF | Sistema participativo | Em desenvolvimento | Planejado |
| Agentes Simulados | Aula de agentes simulados | Em desenvolvimento | Planejado |
| Jogo Generativo | Jogo com agentes generativos | Em desenvolvimento | Planejado |

---

## Regras de Design

### Paleta de Cores (do Design System)
- Primária: amber-500 (#f59e0b)
- Background: slate-950 (#020617)
- Cards: slate-900/80 com glassmorphism
- Texto: white com opacidades (100%, 70%, 50%, 40%)

### Animações
- Entry: fade + scale + y translation
- Hover: scale(1.02), border-color amber
- Parallax suave no background
- Stagger em listas de cards

### Layout Criativo (Estilo Apple)
- Grid orgânico, não tradicional
- Elementos flutuantes
- Profundidade com sombras e blur
- Narrativa visual (storytelling)

---

## Insights da Sessão

1. **Página de login atual** já tem design system implementado com Framer Motion
2. **Padrão visual** usa glassmorphism e gradientes âmbar
3. **Projetos externos** podem ser links para subdomínios ou páginas separadas
4. **Navegação** deve manter consistência visual
5. **Roteamento Next.js** - grupos de rotas `(hub)` e `(dashboard)` permitem layouts diferentes
6. **Status dos projetos** - sistema de badges (ativo, beta, em-breve) para UX clara

---

## Estrutura Final de Rotas

```
/               → Hub de Projetos (escolha do projeto)
/dashboard      → Dashboard do Sistema de Pesquisa Eleitoral
/eleitores      → Listagem de eleitores
/entrevistas    → Entrevistas
/resultados     → Resultados
... (demais rotas do sistema)
```

## Arquivos Criados/Modificados

### Criados
- `frontend/src/app/(hub)/page.tsx` - Página do Hub
- `frontend/src/app/(hub)/layout.tsx` - Layout do Hub (sem sidebar)
- `frontend/src/app/(dashboard)/dashboard/page.tsx` - Dashboard movido

### Modificados
- `frontend/src/components/layout/Sidebar.tsx` - Links atualizados
- `frontend/src/components/layout/MobileNav.tsx` - Links atualizados
- `frontend/src/components/layout/Header.tsx` - Adicionado link Hub
- `frontend/src/components/search/GlobalSearch.tsx` - Links atualizados
- `frontend/src/components/eleitores/MiniDashboard.tsx` - Links atualizados
- `frontend/src/components/agentes/MiniDashboard.tsx` - Links atualizados

## Próximos Passos (Futuros)

1. Implementar páginas de projetos beta (chatbot, ouvidoria, etc.)
2. Adicionar analytics de uso por projeto
3. Personalizar cards com imagens/screenshots
4. Implementar busca inteligente no hub

---

*Última atualização: 2026-01-27*
