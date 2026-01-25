# WORK LOG - Pesquisa Eleitoral DF 2026

Arquivo de persistencia entre sessoes de agentes de IA.
Atualize este arquivo ao final de cada sessao.

---

## Sessao 25/01/2026

### Objetivo
Criar documentacao de engenharia de contexto para navegacao de agentes

### Descobertas
- Projeto full-stack: FastAPI (Python) + Next.js (TypeScript)
- 1000+ eleitores sinteticos em agentes/banco-eleitores-df.json
- Integracao Claude API em backend/app/servicos/claude_servico.py
- Frontend com shadcn/ui, Zustand, Recharts
- Deploy: Vercel (frontend) + Render (backend)

### Arquivos Criados
- GPS_NAVEGACAO_AGENTES.md: Mapa completo do projeto
- WORK_LOG.md: Este arquivo de persistencia
- CLAUDE.md atualizado com secao GPS

### Estrutura Principal
backend/app/
  - api/rotas/: Endpoints REST
  - servicos/: Logica de negocio
  - esquemas/: Pydantic models

frontend/src/
  - app/: Next.js App Router
  - components/: React components
  - lib/claude/: Prompts IA
  - services/: Axios client

scripts/
  - gerar_eleitores_df_v4.py: Geracao de eleitores
  - verificar_coerencia_completa.py: Validacao

### Proximos Passos
- [ ] Criar indices detalhados por pasta (se necessario)
- [ ] Documentar funcoes especificas dos servicos
- [ ] Mapear dependencias entre componentes

---

## Template para Novas Sessoes

## Sessao [DATA]

### Objetivo
[O que foi solicitado]

### Descobertas
- [Item 1]
- [Item 2]

### Modificacoes
- [Arquivo]: [O que foi alterado]

### Proximos Passos
- [ ] [Task pendente]
