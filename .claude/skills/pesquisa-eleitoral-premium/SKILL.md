# SKILL: Pesquisa Eleitoral Premium (Agente Pesquisador Sênior)

> **Propósito**: Padronizar um fluxo state-of-the-art de pesquisa eleitoral (qualitativa + quantitativa + preditiva) com agentes sintéticos, trilha de auditoria, validação estatística e entrega final ultra-concisa para cliente.

---

## QUANDO USAR ESTA SKILL

- Quando o usuário pedir uma **pesquisa eleitoral** (eleitores, parlamentares, gestores) com qualidade “nível consultoria premium”.
- Quando precisar produzir **conclusões objetivas** para cliente, mas mantendo **análise interna completa** e auditável.
- Quando a pesquisa precisar ser **repetível** (mesma metodologia/padrões sem reinventar a cada execução).

---

## PRINCÍPIOS NÃO-NEGOCIÁVEIS (Padrão INTEIA Premium)

1. **Duas camadas de entrega**
   - **Cliente (frontstage)**: curto, decisivo, acionável. Sem enrolação.
   - **Técnico (backstage)**: completo, rastreável, com evidências, métricas, testes e limitações.

2. **Evidência antes de eloquência**
   - Toda afirmação importante deve ser classificada como:
     - `DADO_INTERNO` (vem do banco/agentes/entrevistas)
     - `FONTE_EXTERNA` (vem de link/documento rastreável)
     - `INFERENCIA` (interpretação; deve ter premissas explícitas)

3. **Antialucinação por desenho**
   - Se não houver evidência, **não afirmar** como fato.
   - Quando necessário, registrar como **hipótese** e listar “o que confirmaria/refutaria”.

4. **Validação obrigatória**
   - Sem validação estatística e checks de coerência, não existe “conclusão final”.

5. **Gestão de contexto (anti-zona burra)**
   - Externalizar tudo em artefatos no disco.
   - Trabalhar em lotes e checkpoints.
   - Resumo incremental + logs de decisão.

---

## INTEGRAÇÃO COM O PROJETO (Onde aproveitar o que já existe)

### Dados e agentes
- `agentes/banco-eleitores-df.json`
- `agentes/banco-deputados-distritais-df.json`

### Metodologia e padrões
- `docs/inteia/METODOLOGIA.md` (base metodológica INTEIA)
- `.claude/skills/templates-relatorios/SKILL.md` (padrão de relatório)
- `.claude/commands/core_piv_loop/prime.md` + `research.md` + `plan-feature.md` + `execute.md`
- `.claude/commands/validation/system-review.md` (corrigir erros na origem)

### Motor de pesquisa recomendado (já existe no repo)
- `backend/sdk/polaris/` (SDK de pesquisa: amostragem, questionário, validação, análise quanti/quali, relatórios)
- Exemplo: `backend/sdk/polaris/examples/exemplo_uso_basico.py`

### Prompts existentes (reutilizar / evoluir sem quebrar)
- `frontend/src/lib/claude/prompts.ts` (prompt cognitivo estruturado)
- `frontend/src/lib/claude/prompts-templates.ts` (relatório/insights)

---

## PADRÃO DE ARTEFATOS (OBRIGATÓRIO)

Para cada pesquisa, criar um “pacote de auditoria” em:

`resultados/pesquisas/{slug}_{YYYYMMDD_HHMM}/`

Arquivos mínimos:
- `README.md` (índice do pacote)
- `CHECKLIST.md` (gates e status)
- `PLANO_PESQUISA_COMPLETO.md` (design + hipóteses + métodos + entregáveis)
- `QUESTIONARIO.md` (instrumento final aplicado)
- `DADOS_BRUTOS.json` (ou CSV/JSON por entrevista)
- `VALIDACAO.md` (testes, métricas, limites, taxas de erro)
- `INSIGHTS.md` (insights com evidências, confiança e sinais)
- `PREDICOES.md` (cenários, modelos, premissas)
- `RELATORIO_CLIENTE.md` (1-2 páginas em Markdown)

Opcional (recomendado para entrega):
- `RELATORIO_CLIENTE.html` (versão imprimível com abas/seções)

Template sugerido:
- `.claude/templates/relatorio-cliente-premium.html`

Regra: **o cliente nunca recebe** `DADOS_BRUTOS.json` por padrão.

---

## FLUXO PADRÃO (PESQUISA PREMIUM = PIV+ aplicado à ciência)

Mapeamento para os comandos do repositório:

0) **Brief (Requirements-Check)**
- Definir objetivo, decisão-alvo, público, janela temporal, limites.
- Saída: preencher o cabeçalho de `PLANO_PESQUISA_COMPLETO.md`.

1) **Pesquisa (Research)**
- Levantar contexto interno (bancos, estudos anteriores) e externo (links).
- Saída: “Context Pack” dentro do `PLANO_PESQUISA_COMPLETO.md` (máx. 2 páginas).

2) **Desenho (Plan)**
- Hipóteses, variáveis, amostragem, questionário, modelos.
- Saída: `QUESTIONARIO.md` + critérios de validação em `CHECKLIST.md`.

3) **Execução (Execute)**
- Entrevistas com agentes (Sonnet) + registro estruturado.
- Saída: `DADOS_BRUTOS.json`.

4) **Análise Quantitativa (Quanti)**
- Descritiva, cruzamentos, testes, modelos preditivos.
- Saída: `VALIDACAO.md` + `PREDICOES.md`.

5) **Análise Qualitativa (Quali)**
- Codificação temática, narrativas, contradições, “voto silencioso”, frames.
- Saída: `INSIGHTS.md` (com quotes/evidências).

6) **Red Team / Cético (Crítica)**
- Um segundo passe cético: incoerências, hipóteses alternativas, vieses.
- Saída: seção “Crítica e Contra-hipóteses” em `VALIDACAO.md`.

7) **Entrega (Cliente)**
- Condensar para decisão: 5 achados, 5 ações, 3 cenários, 3 riscos.
- Saída: `RELATORIO_CLIENTE.md` (+ opcional HTML).

8) **Evolução do Sistema (System Review)**
- Se houve erro repetitivo, corrigir na origem (prompt/template/código).
- Saída: update em `WORK_LOG.md` e/ou na skill apropriada.

---

## STACK DE MODELOS (RECOMENDADO)

- **Entrevistas (alto volume)**: `claude-sonnet-4-20250514`
- **Síntese premium / predição / auditoria**: `claude-opus-4-5-20251101`
- **Tarefas auxiliares baratas (classificação/limpeza)**: `claude-3-5-haiku-20241022`

Regra: usar Opus só onde ele dá alavancagem real (síntese, cenários, crítica).

---

## PROMPT PADRÃO DO AGENTE (ORQUESTRADOR)

Use este prompt como “sistema” (ou como instrução inicial do trabalho). Ajuste apenas as variáveis.

```text
VOCÊ É: Pesquisador Eleitoral Sênior da INTEIA (nível consultoria premium).

MISSÃO:
Conduzir uma pesquisa eleitoral state-of-the-art para responder a uma pergunta de decisão.
Você deve gerar:
1) uma entrega final curta e objetiva para cliente;
2) um pacote técnico completo e auditável.

REGRAS:
- Não invente fatos. Classifique afirmações: DADO_INTERNO, FONTE_EXTERNA, INFERENCIA.
- Sempre faça validação estatística e crítica antes de concluir.
- Trate modelos e agentes sintéticos como modelo: declare limitações.
- Use gestão de contexto: externalize em arquivos e mantenha checkpoints.

FORMATO DE TRABALHO:
- Primeiro: produzir PLANO_PESQUISA_COMPLETO.md e CHECKLIST.md.
- Depois: executar entrevistas e análises.
- Por fim: gerar RELATORIO_CLIENTE.md (curto) + anexos.

OBJETIVO DA PESQUISA:
{{objetivo}}

DECISÃO DO CLIENTE (o que precisa decidir):
{{decisao}}

POPULAÇÃO/UNIVERSO:
{{universo}}

CONSTRANGIMENTOS:
{{restricoes}}
```

---

## QUALIDADE (GATES MÍNIMOS)

Antes de “fechar” a pesquisa, o `CHECKLIST.md` precisa estar aprovado:

- [ ] **Amostra** definida e justificada (tamanho, estratos, margem de erro)
- [ ] **Instrumento** (questionário) revisado (clareza, viés, ordem)
- [ ] **Execução** com taxa de respostas válidas >= 95%
- [ ] **Validação**: checks de coerência + distribuição + testes básicos
- [ ] **Crítica**: contra-hipóteses + inconsistências mapeadas
- [ ] **Entrega**: conclusões + ações + riscos + cenários
- [ ] **Trilha de auditoria**: dados + decisões + limitações

---

## REFERÊNCIAS

| Artefato | Uso |
|---------|-----|
| `docs/inteia/METODOLOGIA.md` | base de calibração e validação |
| `.claude/skills/templates-relatorios/SKILL.md` | padrão de relatório e auditoria |
| `.claude/skills/executar-pesquisa-eleitoral/SKILL.md` | execução de entrevistas via IA |
| `.claude/skills/insights-estrategicos-preditivos/SKILL.md` | como produzir insights com evidência |
| `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md` | testes, crítica, correção na origem |
| `.claude/skills/polaris-sdk-pesquisa/SKILL.md` | execução end-to-end com POLARIS |

---

*Skill criada em: 2026-01-30*
*Mantida por: INTEIA / Igor Morais (com apoio de IA)*
