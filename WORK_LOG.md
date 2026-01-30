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

## Sessao 30/01/2026

### Objetivo

- Padronizar um **agente premium de pesquisa eleitoral** (metodologia, validação, predição, entrega curta)
- Melhorar relatório/simulação CPI Banco Master e corrigir inconsistências na origem
- Fortalecer o protocolo 40%/60% com compactação e commits

### Modificações (principais)

- Criadas novas skills:
  - `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
  - `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
  - `.claude/skills/insights-estrategicos-preditivos/SKILL.md`
  - `.claude/skills/polaris-sdk-pesquisa/SKILL.md`
- Criados templates premium:
  - `.claude/templates/pesquisa-eleitoral-premium.md`
  - `.claude/templates/checklist-pesquisa-eleitoral-premium.md`
  - `.claude/templates/relatorio-cliente-premium.html`
- Criado comando de operação:
  - `.claude/commands/pesquisa_eleitoral/pesquisa-premium.md`
  - `.claude/commands/compact.md`
- Atualizados índices:
  - `.claude/skills/SKILLS_INDEX.md`
  - `.claude/commands/COMMANDS_INDEX.md`
  - `CLAUDE.md`
  - `PROJECT_INDEX.md`
- Corrigido dado na origem:
  - `agentes/banco-deputados-distritais-df.json` (relacao_governo_atual de deputados de oposição)
- Melhorias em CPI Master:
  - `scripts/simulacao_cpi_banco_master.py` (título/checagem/UX)
  - `memorias/pesquisas_parlamentares/cpi_banco_master_20260129_194240.html` (leitura correta + conexões)

### Decisões

- Pesquisa premium = **Frontstage/Backstage** + evidência classificada (`DADO_INTERNO | FONTE_EXTERNA | INFERENCIA`).
- Red team e validação viram gates obrigatórios.
- Compactação de contexto em 40% é gate operacional.

### Próximos Passos

- [ ] Integrar geração automática de insights (Opus) no caso CPI (evitar texto fixo)
- [ ] Formalizar execução premium usando POLARIS com pacote em `resultados/pesquisas/`

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
