# Plano de Ajuste Estrutural dos Agentes Parlamentares (CLDF)

Objetivo: tornar as simulacoes/pesquisas com parlamentares da CLDF mais fieis a realidade (veracidade de fatos + realismo de incentivos politicos), reduzindo inflacao de resultados por vies do modelo e por dados incompletos/errados.

Este plano e para corrigir a base de agentes e o sistema de entrevista/simulacao de forma reutilizavel (serve para CPI, votacoes, pautas, coalizoes, etc.).

---

## 1) Diagnostico da raiz (por que inflou)

Checklist (causas estruturais mais comuns):

- [ ] Campo de alinhamento ao governo errado/ambiguo (ex.: mistura "governo federal" vs "governo GDF").
- [ ] Fatos "travados" (votos, cargos, lideranca, presidencia, relatorias) foram inferidos por lista manual ou por memoria do modelo.
- [ ] Persona sem incentivos materiais (emendas, cargos, rede de apoio, risco de retaliação) => o modelo escolhe o "moralmente correto".
- [ ] Prompt indutor (mais motivos pro-sim do que pro-nao) + contexto com carga emocional.
- [ ] Sem calibracao contra dados observaveis (assinaturas reais, declaracoes publicas, votacoes documentadas).
- [ ] Sem mecanismo de "custo politico" e "riscos concretos" (perda de espaco, pauta travada, isolamento na mesa diretora, corte de recursos).

Saida esperada desta etapa:

- Um "Relatorio de Falhas" por tipo de pesquisa (CPI, pauta orcamentaria, impeachment, etc.) com exemplos e correcoes propostas.

---

## 2) Separar DADO FACTUAL vs INFERENCIA (mudanca de schema)

Problema central: hoje o agente mistura fatos e inferencias no mesmo nivel. A correcao mais importante e estruturar o JSON do parlamentar com camadas e confianca.

Checklist do que adicionar no JSON de cada deputado distrital:

- [ ] `fontes`: lista com `{url, veiculo, data, tipo}` para cada fato relevante.
- [ ] `fatos_verificados`: bloco com campos que NAO podem ser inventados pelo modelo.
- [ ] `inferencias`: bloco com campos estimados (com `confianca` e `justificativa`).
- [ ] `timestamp_atualizacao` e `versao_schema`.

Campos factuais que valem muito para realismo:

- [ ] `votacoes_relevantes[]`: cada item com `{proposicao, data, voto, fonte_url}`.
- [ ] `assinaturas_requerimentos[]`: `{tema, assinou, data, fonte_url}`.
- [ ] `cargos_formais[]`: mesa diretora, lideranca, presidencia de comissao, relatoria importante.
- [ ] `vinculos_governo_gdf`: ex.: "base", "independente", "oposicao" (sempre GDF, nao federal).
- [ ] `vinculos_governo_federal` (se quiser manter, mas SEPARADO e opcional).

Campos inferenciais (sempre com confianca):

- [ ] `perfil_risco_retaliacao` (alto/medio/baixo) + porque.
- [ ] `dependencia_de_emendas_governo` (0-10) + porque.
- [ ] `disciplina_partidaria` (0-10) + porque.
- [ ] `tendencia_midiatica` (0-10) (se reage a imprensa/opiniao publica).
- [ ] `tendencia_investigativa` (0-10) (historico de CPIs, fiscalizacao, etc.).
- [ ] `ambicao_2026` (reeleicao, majoritaria, etc.) + peso.

Regra de ouro:

- Tudo que pode ser checado (voto nominal, cargo, autoria, declaracao publica) precisa estar em `fatos_verificados` com fonte.
- O modelo so "interpreta" em `inferencias`.

---

## 3) Criar um "Ground Truth" minimo para calibrar (CLDF)

Sem calibracao, o sistema sempre deriva para o "eticamente correto".

Checklist:

- [ ] Criar um arquivo de verdade basica por tema (ex.: CPI Master/BRB) com:
  - [ ] lista de assinaturas confirmadas (sim/nao/nao declarado)
  - [ ] votacao real do PL relacionado (sim/nao/ausente)
  - [ ] declaracoes publicas relevantes (a favor/contra/inseguro)
  - [ ] restricoes regimentais (ex.: limite de CPIs) + interpretacao
- [ ] Definir metricas de avaliacao:
  - [ ] acuracia por parlamentar (bateu/errou)
  - [ ] erro por partido/bloco
  - [ ] inflacao de assinaturas (simulacao - real)
  - [ ] calibracao de probabilidade (Brier score simples)

Saida esperada:

- Um "painel" (mesmo que em JSON/CSV) com comparacao Simulacao vs Realidade.

---

## 4) Prompt: reduzir vies moral e simular incentivos reais

O prompt precisa parar de perguntar "o correto" e passar a perguntar "o que voce faria dado seus incentivos".

Checklist de ajustes no prompt (aplicavel a qualquer pauta):

- [ ] Inserir uma secao explicita de "incentivos e punicoes" do mundo real:
  - [ ] risco de retaliação (pauta travada, isolamento, perda de espaco)
  - [ ] impacto em emendas/execucao orcamentaria
  - [ ] pressao de lideranca partidaria/mesa diretora
  - [ ] custo de se contradizer (votou sim antes, agora assina CPI)
- [ ] Inserir uma secao de "argumentos para NAO apoiar" equilibrada:
  - [ ] narrativa de redundancia (PF/BC/TCDF/MP ja investigam)
  - [ ] preservacao institucional ("nao politizar", "nao gerar corrida bancaria")
  - [ ] governabilidade/agenda do DF
- [ ] Proibir respostas "bonitinhas": exigir trade-offs e admitir cinismo politico quando pertinente.
- [ ] Exigir citacao de 2-3 fatos do `fatos_verificados` do proprio deputado (ex.: "votei X", "sou lider Y").

Formato recomendado de saida (mais auditavel):

- `POSICAO` (ASSINA/NAO/INDECISO)
- `PROB_ASSINAR` (0-100) + `MOTIVOS_PRO` + `MOTIVOS_CONTRA`
- `CUSTO_POLITICO` (0-10)
- `GATILHOS_DE_MUDANCA` (o que faria mudar)

---

## 5) Modelo hibrido: priors (numerico) + LLM (justificativa)

Para evitar que o LLM "puxe" tudo para o etico, voce precisa de uma camada numerica anterior (priors) que imponha realidade.

Ideia:

1) Um score base calculado do JSON (sem LLM):

- Base governista (GDF) => diminui probabilidade de assinar
- Cargo/mesa/lideranca => diminui (mais a perder)
- Historico fiscalizador/oposicao => aumenta
- Votou a favor do negocio => efeito duplo:
  - pode aumentar (seguro politico: "virar investigador")
  - OU diminuir (medo de expor a propria decisao)
  - isso deve ser parametrizavel por deputado (confianca)

2) O LLM entra depois para:

- gerar a narrativa coerente com a probabilidade definida
- explicar contradicoes
- listar condicoes/gatilhos

Checklist:

- [ ] Implementar `prior_prob_assinar(dep, tema)` retornando 0-100.
- [ ] Passar essa probabilidade para o prompt como "restricao":
  - ex.: "Sua probabilidade estimada de assinar e ~35%. Responda coerentemente com isso; nao racionalize para 90%".
- [ ] Registrar no output: `prob_prior` vs `prob_pos_llm`.

---

## 6) Anti-alucinacao: travar fatos e validar saida

Checklist:

- [ ] No prompt, passar um bloco pequeno e estruturado com os fatos do deputado (do JSON) e dizer:
  - "voce nao pode contradizer estes fatos".
- [ ] Validar automaticamente:
  - [ ] se o texto contradiz `voto` ou `cargo` => marcar como erro
  - [ ] se nao respeita formato => re-prompt
- [ ] Pergunta dupla (consistencia):
  - [ ] Rodar 2 prompts diferentes (um "hostil" e um "neutro") e comparar.
  - [ ] Se divergir muito, marcar como "incerto" e reduzir confianca.

---

## 7) Modelos: centralizar e atualizar sem caça-ao-hardcode

Hoje ha hardcodes espalhados (scripts e backend). O ideal e ter 1 lugar para escolher modelos.

Checklist:

- [ ] Criar um unico ponto de configuracao (env ou arquivo) para:
  - `MODELO_ENTREVISTAS`
  - `MODELO_INSIGHTS`
  - `MODELO_PARLAMENTARES` (separado de eleitores)
- [ ] Remover hardcode em scripts (ex.: `scripts/simulacao_cpi_banco_master.py`).
- [ ] Gravar no output sempre:
  - `modelo`
  - `temperature`
  - `prompt_version`
  - `data_execucao`

Observacao importante (limite atual):

- Atualizacao importante: este projeto passou a suportar execucao automatica via **Claude Code CLI (assinatura)** como provedor padrao (`IA_PROVIDER=claude_code`).
  A API fica como fallback opcional (`IA_PROVIDER=anthropic_api`) e pode ser bloqueada por default (`IA_ALLOW_API_FALLBACK=false`) para evitar gasto acidental.

---

## 8) Operacao: rotinas de manutencao (para nao degradar de novo)

Checklist mensal (CLDF):

- [ ] Atualizar cargos/liderancas/mesa diretora
- [ ] Atualizar votacoes-chave (pautas sensiveis)
- [ ] Atualizar "base x oposicao" do GDF (por evidencia)
- [ ] Rodar auditoria automatica de coerencia
- [ ] Rodar 1-2 temas de teste com ground truth (calibracao)

Checklist por pesquisa (antes de rodar):

- [ ] Confirmar lista de parlamentares atual
- [ ] Definir "tema" e "fatos do tema" com fontes
- [ ] Definir quais fatos sao obrigatorios (hard constraints)
- [ ] Definir priors e pesos (documentar)
- [ ] Executar e gerar relatorio com comparacao e incerteza

---

## 9) Checklist de implementacao (passo a passo)

Parte A - Dados (alta prioridade)

- [ ] Criar `schema` v2 para parlamentares (separando fatos/inferencias)
- [ ] Migrar `agentes/banco-deputados-distritais-df.json` para o schema v2
- [ ] Preencher fatos minimos: partido, cargos, lideranca, votacoes-chave, alinhamento GDF, fontes

Parte B - Motor (alta prioridade)

- [ ] Centralizar configuracao de modelos
- [ ] Implementar priors numericos por tema
- [ ] Ajustar prompts para incluir incentivos/punicoes e equilibrar pro/contra

Parte C - Qualidade (media prioridade)

- [ ] Implementar validadores (formato, contradicao factual)
- [ ] Implementar pergunta dupla e flag de inconsistencia
- [ ] Implementar relatorio de calibracao vs ground truth

Parte D - Evolucao (media/baixa)

- [ ] Adicionar "rede de aliancas" (grafo) e efeitos de bancada
- [ ] Modelar "regimento" como restricao (CPI simultanea, presidencia controla pauta)
- [ ] Simular retaliação (ex.: se X assina, custo aumenta em Y)

---

## 10) Resultado esperado (como saber que melhorou)

Metas praticas:

- Acuracia > 70% em temas com ground truth razoavel (assinaturas/votos conhecidos).
- Probabilidades calibradas (nao jogar tudo em 90-100%).
- Relatorio sempre explicita: fatos usados, incertezas, e "onde o modelo chutou".
