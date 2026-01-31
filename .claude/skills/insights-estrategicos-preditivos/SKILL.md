# SKILL: Insights Estratégicos e Preditivos (Alta Densidade)

> **Propósito**: Transformar dados (quanti + quali + contexto) em insights acionáveis, com evidência, confiança calibrada e saída final curta para cliente.

---

## QUANDO USAR ESTA SKILL

- Para gerar “Insights Exclusivos INTEIA” com qualidade e rastreabilidade.
- Para produzir previsões e cenários (com premissas explícitas).
- Para condensar um relatório técnico em uma entrega curta (sem perder rigor).

---

## DEFINIÇÃO OPERACIONAL DE “INSIGHT”

Um insight premium precisa ter 6 peças:

1) **Tese**: o que está acontecendo (em 1 frase)
2) **Mecanismo**: por que acontece (cadeia causal curta)
3) **Evidências**: números/quotes/estratos (com origem)
4) **Contra-hipótese**: alternativa plausível
5) **Sinais**: como monitorar (early warnings)
6) **Ação**: o que fazer (decisão prática)

Sem essas 6 peças, é só opinião.

---

## TAXONOMIA (não misturar)

- **Achado descritivo**: “X% diz Y”.
- **Hipótese causal**: “X acontece por causa de Z (premissas)”.
- **Previsão**: “Se A ocorrer, então B com probabilidade p (intervalo)”.

Regra: o relatório para cliente deve deixar claro se é **descritivo**, **hipótese** ou **previsão**.

---

## FORMATO PADRÃO (para INSIGHTS.md)

```markdown
## Insight {n}: {titulo}

- Tipo: DESCRITIVO | HIPOTESE | PREDICAO
- Confianca: {0.0-1.0}
- Para quem importa: {segmentos/atores}

Tese:
{1 frase}

Mecanismo:
{3-6 bullets curtos}

Evidencias (com origem):
- DADO_INTERNO: ... (citar tabela/estatística/quote)
- FONTE_EXTERNA: ... (URL, data)

Contra-hipotese:
{1-2 frases}

Sinais de monitoramento (early warnings):
- ...

Acao recomendada:
- ...
```

---

## CONFIANÇA (calibração)

Use uma heurística consistente:

- **0.9+**: convergência de evidências + baixa ambiguidade + robusto a seed
- **0.7-0.8**: evidência boa, mas com variáveis ocultas relevantes
- **0.5-0.6**: plausível, mas frágil / depende de premissa forte
- **<0.5**: hipótese exploratória (não vender como conclusão)

---

## “SAÍDA MÍNIMA” PARA CLIENTE (suco, sem gordura)

Checklist de compressão:

- Limitar a **5 insights** (os mais acionáveis)
- Limitar a **5 ações** (com prioridade e timing)
- Limitar a **3 cenários** (base / otimista / pessimista)
- Limitar a **3 riscos** (com mitigação)

Regra: cada bullet precisa responder “e daí?” e “o que eu faço?”.

---

## PROMPT PADRÃO (Gerador de Insights com Evidência)

Usar com Opus na síntese final.

```text
Você é um ANALISTA POLÍTICO SÊNIOR da INTEIA.

Tarefa: gerar insights estratégicos a partir de dados de pesquisa.

Regras:
- Proibido inventar fatos externos sem URL.
- Toda afirmação deve ser marcada como DADO_INTERNO, FONTE_EXTERNA ou INFERENCIA.
- Gere no máximo 7 insights; priorize os 5 mais acionáveis.
- Para cada insight, inclua: tese, mecanismo, evidências, contra-hipótese, sinais, ação.

Contexto:
{{contexto}}

Dados:
{{dados}}

Formato de saída: Markdown seguindo o template do INSIGHTS.md.
```

---

## REFERÊNCIAS

| Arquivo | Uso |
|--------|-----|
| `frontend/src/lib/claude/prompts-templates.ts` | templates de análise |
| `.claude/skills/templates-relatorios/SKILL.md` | padrão de seção “Conclusão / Recomendações” |
| `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md` | gates e anti-alucinação |

---

*Skill criada em: 2026-01-30*
*Mantida por: INTEIA / Igor Morais (com apoio de IA)*
