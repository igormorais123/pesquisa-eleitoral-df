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

- IA: provedor preferencial via assinatura (Claude Code CLI), API apenas como opcao:
  - `backend/app/servicos/claude_servico.py` (CLI por padrao, API fallback controlado)
  - `backend/app/core/config.py` + `.env.example` (IA_PROVIDER, modelos/aliases, clamps, IA_ALLOW_API_FALLBACK)
  - `scripts/simulacao_cpi_banco_master.py` (IA_PROVIDER + clamp de 0/100)

- Realismo parlamentar:
  - `backend/app/servicos/parlamentar_prompt.py` (incentivos/restricoes, leitura de campos inferidos)
  - `data/parlamentares/cldf/overrides.json` + `overrides_TEMPLATE.json` (correcoes incrementais por nome)
  - `backend/app/parlamentares/ingest/cldf_provider.py` (merge automatico de overrides)

- Operacao agentica e persistencia:
  - `scripts/agentico/rodar_entrevista_via_backend.py`
  - `scripts/agentico/criar_e_rodar_entrevista_cldf.py`
  - `docs/inteia/EXECUCAO_AGENTICA_CLAUDE_CODE.md`
  - `docs/inteia/BOAS_PRATICAS_PESQUISA_AGENTICA.md`
  - `docs/inteia/PADRAO_RESULTADOS_TEMPLATES_E_MEMORIA.md`
  - Indices atualizados: `docs/_INDEX.md`, `scripts/_INDEX.md`, `agentes/_INDEX.md`, `data/_INDEX.md`, `_INDEX.md`, `_INSIGHTS.md`

### Decisões

- Pesquisa premium = **Frontstage/Backstage** + evidência classificada (`DADO_INTERNO | FONTE_EXTERNA | INFERENCIA`).
- Red team e validação viram gates obrigatórios.
- Compactação de contexto em 40% é gate operacional.

### Próximos Passos

- [ ] Integrar geração automática de insights (Opus) no caso CPI (evitar texto fixo)
- [ ] Formalizar execução premium usando POLARIS com pacote em `resultados/pesquisas/`
- [ ] Preencher `data/parlamentares/cldf/overrides.json` para os 24 (alinhamento GDF + fontes) e criar ground truth por tema

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
