# OpenCode — Pesquisa Eleitoral DF 2026 — Plano de Implantacao: Memoria Cultural (2026-01-24)

## 1) Objetivo
Os LLMs tendem a:
- Ocidentalizar respostas (referenciais e pressupostos nao-BR/nao-DF)
- Ficar desatualizados (treino ate 2025; estamos em 2026)
- Gerar interacoes genericas (falta de "memorias comuns" locais)

Objetivo do recurso: inserir uma **Memoria Cultural do Distrito Federal (atualizada e versionada)** para que cada agente responda com alta localidade, temporalidade e plausibilidade social, mantendo rastreabilidade academica.

## 2) Tecnica escolhida (melhor pratica)

### 2.1 RAG (Retrieval-Augmented Generation) como memoria nao-parametrica
Em vez de "treinar" o modelo, a resposta do agente passa a ser condicionada por um **Pacote Cultural** recuperado sob demanda:
- Recuperacao por relevancia + recencia + contexto (RA, tema, perfil)
- Proveniencia (fonte + data + confiabilidade) para auditoria e reproducao

Base conceitual:
- Lewis et al., 2020 (RAG) — arXiv:2005.11401
- Park et al., 2023 (Agentes com memoria/reflexao) — arXiv:2304.03442

### 2.2 Curadoria anti-sesgo cultural (opcional, forte para o campeonato)
Adicionar um curador multi-agente (sem treino) para produzir itens culturais mais realistas/robustos:
- Agente Fact-checker: classifica fato/boato; atribui confiabilidade
- Agente Jornalista local: resume em linguagem popular; destaca repercussao
- Agente Cientista politico DF: contextualiza campanha e clivagens locais

Referencia util: Tan et al., 2026 (Multi-Agent Cultural Debate) — arXiv:2601.12091.

## 3) Definicoes (para precisao academica)
- **Memoria Cultural**: base comum do "clima social" (DF/2026), com itens datados, citaveis e versionados.
- **Memoria Pessoal**: historico do eleitor (voce ja tem via MemoriaServico / tabela `memorias`).
- **Item Cultural**: unidade curta (1-3 linhas) com metadados (tema, data, fonte, confiabilidade).
- **Data de simulacao**: tempo "dentro da campanha" (ex.: 2026-08-15), para evolucao temporal.

## 4) Mapa visual do modelo proposto (arquitetura)

```text
                    (Atualizacao continua: diaria/semanal)

+------------------+    +---------------------+    +---------------------------+
| Fontes (abertas) | -> | Coletor + Curadoria | -> | Memoria Cultural (DB)     |
| IBGE/IPEDF/TSE   |    | dedup + extracao    |    | itens + metadados         |
| GDF + RSS (links)|    | tags + confiabilidade|   | + indice de busca (FTS/V) |
+------------------+    +---------------------+    +---------------------------+
                                                           |
                                                           | (consulta por pergunta/perfil/tempo/RA)
                                                           v
+----------------------------+   +-------------------+   +------------------------+
| Execucao entrevista        |-> | Retriever/Reranker|-> | Pacote Cultural (Top-K)|
| eleitor + pergunta + data  |   | recencia+RA+tema  |   | curto p/ prompt        |
+----------------------------+   +-------------------+   +------------------------+
                                                           |
                                                           v
                                       +------------------------------------------+
                                       | Construtor de prompt                     |
                                       | Perfil + Memoria pessoal + Pacote cultural|
                                       +------------------------------------------+
                                                           |
                                                           v
                                       +-------------------------------+
                                       | Claude (resposta do eleitor)  |
                                       +-------------------------------+
                                                           |
                                                           v
                                       +--------------------------------------+
                                       | Persistencia + Auditoria             |
                                       | resposta + IDs itens culturais usados|
                                       +--------------------------------------+
```

## 5) Fluxograma (uma pergunta)

### 5.1 Versao ASCII (sempre funciona)

```text
[Inicio] eleitor+pergunta+data_simulacao
   |
   v
[Gerar consulta] (tema, RA, palavras-chave, perfil)
   |
   v
[Buscar itens] Memoria Cultural (FTS/BM25 e/ou embeddings)
   |
   v
[Rerank] relevancia * recencia * ajuste_RA * ajuste_perfil
   |
   v
[Selecionar Top-K] + (opcional) resumo curto do pacote
   |
   v
[Montar prompt] perfil + memoria pessoal + pacote cultural
   |
   v
[Chamar Claude] -> resposta
   |
   v
[Salvar] resposta + metadados + IDs dos itens culturais usados
   |
   v
[Fim]
```

### 5.2 Versao Mermaid (se o renderizador suportar)

```mermaid
flowchart TD
  A[Inicio: eleitor + pergunta + data_simulacao] --> B[Gerar consulta de recuperacao]
  B --> C[Buscar itens relevantes na Memoria Cultural]
  C --> D[Rerank: recencia + RA + tema + confiabilidade vs perfil]
  D --> E[Selecionar Top-K + (opcional) resumir em pacote curto]
  E --> F[Montar prompt: Perfil + Memoria pessoal + Pacote cultural]
  F --> G[Chamar Claude]
  G --> H[Salvar resposta + metadados + IDs itens culturais usados]
  H --> I[Fim]
```

## 6) Modelo de dados (MVP e extensao)
Criar tabela/entidade: `memoria_cultural_itens`

Campos minimos:
- `id` (uuid/string)
- `tipo`: `fato | narrativa | boato`
- `tema`: `custo_de_vida | politica_df | servicos_publicos | transporte | futebol | seguranca | saude | educacao | ...`
- `regiao_administrativa` (opcional; default `DF`)
- `data_evento` (quando ocorreu) + `data_publicacao` (da fonte)
- `validade_inicio` / `validade_fim` (opcional)
- `texto_curto` (1-3 linhas, pronto para prompt)
- `fontes[]`: `{titulo, veiculo, url, data}`
- `confiabilidade` (0.0–1.0)
- `tags[]`
- `versao_base` (ex.: `2026-01-24`)
- (opcional) `embedding` + (opcional) `tsvector`

Auditoria por resposta (critico):
- `itens_culturais_usados: [ids...]`
- `versao_base_cultural`
- `data_simulacao`
- `parametros_retrieval` (K, filtros, pesos)

## 7) Pipeline de ingestao (atualizar DF/2026)

### 7.1 Fontes recomendadas (prioridade por confiabilidade)
Alta:
- IBGE (IPCA Brasilia, Censo, PNAD), IPEDF/CODEPLAN (PDAD), TSE/TRE, dados abertos gov.

Media (com link; evitar texto integral):
- Veiculos jornalisticos via RSS, mantendo apenas resumo curto e URL.

Baixa (para simular WhatsApp / boatos):
- Bases de checagem (Aos Fatos, Lupa etc.) para registrar "o boato circulante" como boato.

Observacao de rigor: evitar armazenar texto integral de noticias (copyright). Guardar link + resumo curto + metadados.

### 7.2 Etapas (ETL)
1) Coleta (RSS/API)
2) Normalizacao (data, localidade, tema)
3) Deduplicacao (hash/url canonical)
4) Curadoria (extrair fato principal em 1-3 linhas; classificar tipo; atribuir confiabilidade)
5) Persistencia no DB + versionamento (snapshot)
6) Indexacao (FTS e/ou embeddings)

## 8) Retrieval/Rerank (como escolher o que entra no prompt)
Entrada:
- pergunta, eleitor (RA, classe, valores, preocupacoes, fontes), data_simulacao

Score explicavel (auditavel):
- `score = relevancia_textual * (1 + bonus_recencia) * (1 + bonus_RA) * ajuste_perfil`

Ajuste por perfil (exemplos):
- `interesse_politico` baixo -> menos itens, mais "ouvi por alto"
- `susceptibilidade_desinformacao` alta -> pode incluir 1-2 boatos (sempre rotulados)
- `susceptibilidade_desinformacao` baixa -> priorizar fatos/oficiais

Parametros iniciais:
- `K = 6..10` itens
- Janela temporal default: ultimos `30..90` dias (configuravel)

## 9) Injecao no prompt (formato do Pacote Cultural)
Adicionar bloco padrao ao prompt:

PACOTE CULTURAL (DF / data_simulacao: YYYY-MM-DD / versao: X)
- FATOS (data + fonte curta)
- CLIMA SOCIAL / CUSTO DE VIDA (indicadores e percepcao)
- POLITICA LOCAL / CAMPANHA (eventos-chave e disputas)
- BOATOS EM CIRCULACAO (somente se perfil permitir; rotulado como boato)

Regras de fala (para realismo):
- Eleitor nao "cita paper"; ele diz "vi no jornal", "no zap tao falando".
- Se item for boato, pode repetir como boato (principalmente se suscetivel), mas sem virar "verdade objetiva".
- Se o pacote nao tiver informacao, nao inventar "fatos locais".

## 10) Integracao no seu sistema (pontos de encaixe)
Contexto do repo:
- Prompt cognitivo existe em:
  - `backend/app/servicos/claude_servico.py`
  - `frontend/src/lib/claude/prompts.ts` e rota `frontend/src/app/api/claude/entrevista/route.ts`
- Memoria pessoal ja existe no backend:
  - `backend/app/servicos/memoria_servico.py`
  - `backend/app/modelos/memoria.py`

Recomendacao (evitar duplicacao):
1) Implementar Memoria Cultural no backend (FastAPI + Postgres).
2) Criar endpoint interno de contexto cultural:
   - `GET /api/v1/memoria-cultural/contexto?eleitor_id=...&pergunta=...&data_simulacao=...`
   - Retorna: `{versao, itens[], texto_para_prompt, ids[]}`
3) Backend (Python) e Next (route.ts) consomem esse endpoint para montar o prompt.
4) Ao salvar memoria de entrevista, registrar IDs culturais usados em `contexto`/`metadados`.

Pre-requisito tecnico importante:
- Existem conflitos de merge no repo (marcadores `<<<<<<< >>>>>>>`) em arquivos criticos. Resolver antes de implementar.

## 11) Observabilidade, reproducibilidade e auditoria (academico)
- Log por resposta:
  - query do retriever, K, filtros, pesos, ids dos itens
  - versao_base_cultural
  - data_simulacao
- Permitir "replay" de uma entrevista usando a mesma `versao_base_cultural`.

## 12) Avaliacao (para provar que melhorou)
A/B (baseline vs com Memoria Cultural):
- Localidade DF (1-5): menciona RAs/servicos/rotina coerentes?
- Atualizacao temporal (1-5): condiz com data_simulacao?
- Naturalidade (1-5): menos "americanismos" e generalidades?
- Coerencia com perfil (1-5): classe/RA/valores batem?
- Transparencia de boatos (1-5 inverso): nao transforma boato em fato.

Metricas automaticas (baratas):
- Percentual de respostas com pelo menos 1 entidade local (RA, termos DF)
- Taxa de repeticao de "contexto generico" vs baseline

Referencia de alerta:
- Prama et al., 2025 (arXiv:2512.02058): personas LLM podem divergir de humanos em contexto local; exige validacao humana.

## 13) Cronograma (MVP -> robusto)
Fase 0 (imediata): resolver conflitos de merge; estabilizar build/testes.

Fase 1 (MVP 1-2 dias):
- Base cultural estatica (JSON/DB) com 100-300 itens curados
- Retrieval simples por palavras-chave + recencia
- Injecao no prompt + auditoria de IDs

Fase 2 (1 semana):
- Ingestao automatica (RSS/APIs) + dedup + confiabilidade
- Versionamento de base por dia

Fase 3 (2-3 semanas):
- Busca hibrida (FTS + embeddings/pgvector)
- UI/rotina de curadoria (ativar/desativar item, ajustar confiabilidade)
- Parametrizar `data_simulacao` por entrevista/campanha

## 14) Riscos e mitigacoes
- Direitos autorais (noticias): armazenar link + resumo curto + metadados.
- Alucinacao ao "atualizar": usar somente itens recuperados; logar fontes; nao inventar fatos fora da base.
- Estereotipos de RA/classe: curadoria + rubrica humana + limitar "narrativas" a itens rotulados.

## 15) Referencias (citacao)
- Lewis et al., 2020. Retrieval-Augmented Generation (arXiv:2005.11401)
- Park et al., 2023. Generative Agents (arXiv:2304.03442)
- Tan et al., 2026. Multi-Agent Cultural Debate (arXiv:2601.12091)
- Prama et al., 2025. Misalignment of LLM personas in low-resource settings (arXiv:2512.02058)
