# SKILL: Auditoria e Validação de Pesquisa (Anti-Alucinação + Qualidade)

> **Propósito**: Garantir que toda pesquisa INTEIA seja auditável, estatisticamente consistente, criticada (red team) e que erros recorrentes sejam corrigidos na origem do sistema.

---

## QUANDO USAR ESTA SKILL

- Sempre que finalizar uma pesquisa (antes de entregar ao cliente).
- Quando houver resultados “bons demais para ser verdade”.
- Quando aparecerem incoerências (ex.: probabilidade 100% sem separar gargalos reais).
- Quando o sistema repetir um erro (corrigir na origem: prompt/template/código).

---

## CHECKS OBRIGATÓRIOS (Quality Gates)

### 1) Integridade do Dataset

- [ ] `N` entrevistados conforme plano
- [ ] Taxa de respostas válidas >= 95%
- [ ] Campos obrigatórios preenchidos (sem null em massa)
- [ ] Sem duplicatas óbvias (mesmo eleitor repetido sem justificativa)
- [ ] Logs de erro (timeouts/retry) documentados

### 2) Representatividade / Estratificação

- [ ] Distribuições por estrato (RA, sexo, idade, cluster) coerentes com a base
- [ ] Divergências > 5pp precisam de justificativa (oversample intencional) ou correção (re-weight)
- [ ] Se houver ponderação: registrar pesos, método e efeito

### 3) Validação Estatística Básica

- [ ] Margem de erro calculada e registrada
- [ ] Intervalos de confiança para métricas principais (quando aplicável)
- [ ] Teste qui-quadrado para cruzamentos relevantes (quando categórico)
- [ ] Teste de diferença de proporções (quando comparar grupos)

### 4) Estabilidade / Sensibilidade

- [ ] Rodar pelo menos 2 seeds/amostras (quando for simulação)
- [ ] Se os resultados mudarem muito: registrar instabilidade e reduzir confiança

### 5) Anti-Alucinação (Classificação de Afirmativas)

Para cada afirmação forte do relatório, marcar:

- `DADO_INTERNO`: citar evidência (estatística, tabela, trecho)
- `FONTE_EXTERNA`: citar URL + data de acesso
- `INFERENCIA`: listar premissas e incertezas

Regra: relatório para cliente não pode conter “fatos externos” sem link.

---

## RED TEAM (CRÍTICA OBRIGATÓRIA)

Executar uma revisão cética antes de fechar:

Perguntas padrão:
- O que nesse resultado pode ser artefato do prompt/modelo?
- Há incentivo/viés do agente sintético para “parecer razoável”?
- Existe hipótese alternativa mais simples?
- Qual evidência derrubaria a principal conclusão?
- Qual variável oculta pode estar dirigindo o resultado?

Saída mínima:
- 3 contra-hipóteses
- 3 inconsistências
- 3 sinais de monitoramento (early warnings)

---

## CORRIGIR ERROS NA ORIGEM (Sistema > Caso isolado)

Quando algo der errado, classificar a correção:

1) **Prompt** (instruções incompletas/ambíguas)
2) **Template/Relatório** (labels confusas, mistura de métricas)
3) **Código** (bug, parsing, agregação)
4) **Dados** (banco inconsistente, campos errados)
5) **Processo** (faltou gate/checagem)

Aplicar correção no lugar certo e registrar:
- `WORK_LOG.md` (o que aconteceu e como foi prevenido)
- Atualizar skill/template/command relevante

---

## TEMPLATE: SEÇÃO "VALIDAÇÃO" (para colar em VALIDACAO.md)

```markdown
## Validação e Qualidade

### Amostra
- N: {n}
- Confiança: 95%
- Margem de erro (p=0.5): ±{moe}%

### Representatividade
- Estratos checados: {estratos}
- Divergências > 5pp: {lista ou "nenhuma"}
- Ponderação: {sim/nao} (método: {metodo})

### Integridade
- Respostas válidas: {validas}/{n}
- Erros/retries: {qtd}
- Observações: {texto}

### Red Team (crítica)
- Contra-hipótese 1: ...
- Contra-hipótese 2: ...
- Contra-hipótese 3: ...

### Limitações
- (1) ...
- (2) ...
- (3) ...
```

---

## REFERÊNCIAS

| Arquivo | Uso |
|--------|-----|
| `scripts/validacao_estatistica.py` | checks/relatórios de validação |
| `docs/inteia/METODOLOGIA.md` | parâmetros e trilha de auditoria |
| `.claude/commands/validation/system-review.md` | correção na origem |

---

*Skill criada em: 2026-01-30*
*Mantida por: INTEIA / Igor Morais (com apoio de IA)*
