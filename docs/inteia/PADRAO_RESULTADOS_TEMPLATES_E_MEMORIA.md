# Padrao de Resultados, Templates e Memoria (Nuvem)

Este padrao garante que toda pesquisa feita por IA (eleitores/parlamentares) vire um ativo reutilizavel no INTEIA.

---

## 1) Estrutura canonica de uma pesquisa

Salvar sempre estes blocos (mesmo que alguns vazios):

- `metadados_execucao`
  - `id_pesquisa` (backend)
  - `titulo`
  - `data_execucao` (ISO)
  - `provedor_ia` (claude_code|anthropic_api)
  - `modelo_entrevistas` / `modelo_insights`
  - `prompt_version`
  - `tempo_total_ms`
- `questionario`
  - `template_id` + `template_version`
  - `perguntas[]` (id, texto, tipo, opcoes)
- `amostra`
  - `universo` (eleitores|parlamentares)
  - `filtros`
  - `ids_respondentes[]`
  - `n`
- `contexto_considerado`
  - `resumo`
  - `fontes[]` (url, data, notas)
- `metodologia`
  - `priors`
  - `regras_prompt`
  - `clamps_prob`
  - `validacoes`
- `respostas_raw[]`
  - `respondente_id`
  - `pergunta_id`
  - `resposta_texto`
  - `resposta_estruturada`
  - `fluxo_cognitivo`
  - `tokens_entrada/tokens_saida` (quando disponivel)
- `analise`
  - agregados/estatisticas
  - mapas de calor
  - insights
  - limitacoes

---

## 2) Templates de perguntas

Regras:

- Toda pergunta criada por IA deve ser salva como template (mesmo rascunho).
- Templates devem ser versionados e ter:
  - objetivo
  - publico-alvo (eleitor/parlamentar)
  - tipos de resposta
  - instrucoes de interpretacao

Locais atuais no projeto:

- `agentes/templates-perguntas-eleitorais.json` (legado/arquivo)
- `backend/app/dados/templates_perguntas.json` (backend)

---

## 3) Onde salvar ("nuvem")

Objetivo: aparecer no frontend e ser consultavel depois.

Padrao:

- Persistencia primaria: Banco via backend (para UI)
- Persistencia secundaria: `memorias/` (backup/auditoria)

Metadados obrigatorios para reuso temporal:

- `data_execucao`
- `contexto_considerado`
- `nota_validade` (o que pode ter mudado desde entao)
