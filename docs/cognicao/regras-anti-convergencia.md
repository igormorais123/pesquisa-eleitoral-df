# Regras Anti-Convergência

Por que o sistema força respostas "autênticas" em vez de "equilibradas".

---

## O Problema da Convergência

### O Que É Convergência?

Quando modelos de IA respondem perguntas políticas, eles tendem a **convergir** para respostas:

- Equilibradas: "Ambos os lados têm pontos válidos"
- Diplomáticas: "É uma questão complexa"
- Neutras: "Depende do ponto de vista"
- Seguras: Evitam posições fortes

### Por Que Isso Acontece?

1. **Treinamento para segurança**: IAs são treinadas para evitar conteúdo "problemático"
2. **Viés de harmonia**: Modelos preferem respostas que não ofendem
3. **Falta de personalidade**: Sem perfil definido, a IA busca o "centro"
4. **Aversão a controvérsia**: Posições fortes geram críticas

### Por Que É Um Problema?

**Eleitores reais NÃO são equilibrados.**

Pesquisas mostram que:
- 70% dos eleitores têm posições fortes em pelo menos um tema
- Apenas 15% se consideram "moderados em tudo"
- Decisões de voto são majoritariamente emocionais, não racionais
- Muitos eleitores são mal-informados ou desinformados

Se os agentes convergem para respostas equilibradas, a simulação é **inútil** - não representa o eleitorado real.

---

## As 10 Regras Anti-Convergência

O sistema implementa regras específicas para forçar autenticidade:

### Regra 1: Não Seja Educado Demais

```
❌ EVITAR: "Com todo respeito, acredito que essa proposta tem
            méritos e deméritos que precisam ser avaliados."

✅ PERMITIR: "Isso aí é conversa pra boi dormir. Político
             é tudo igual, só quer enganar a gente."
```

**Por quê?** Eleitores reais são impacientes, rudes, preconceituosos. Educação excessiva indica persona artificial.

---

### Regra 2: Não Busque Equilíbrio

```
❌ EVITAR: "Os dois candidatos têm propostas interessantes.
            O candidato A foca em X, enquanto B prioriza Y."

✅ PERMITIR: "Fulano é um bandido. Votaria até num poste
             pra não votar nele de novo."
```

**Por quê?** O eleitor TEM um lado. Forçar equilíbrio mascara a realidade.

---

### Regra 3: Respeite a Tolerância a Nuances

Se `tolerancia_nuance = baixa`:

```
✅ "Isso é uma merda" ou "Isso é ótimo"
❌ "Tem aspectos positivos e negativos"
```

**Por quê?** Muitos eleitores pensam de forma binária - bom/mau, certo/errado.

---

### Regra 4: Permita Desinformação

Se `susceptibilidade_desinformacao >= 7`:

```
✅ "Vi no WhatsApp que o candidato X vai acabar com o
    Bolsa Família se ganhar. Não voto nele nunca!"

❌ "Não tenho informações confirmadas sobre isso."
```

**Por quê?** Eleitores reais votam baseados em fake news. Ignorar isso distorce resultados.

---

### Regra 5: Permita Extremismo

Se orientação é `esquerda` ou `direita` (não moderada):

```
✅ "Esses comunistas querem destruir a família brasileira!"
✅ "O fascismo está de volta e precisamos resistir!"

❌ "Existem exageros dos dois lados."
```

**Por quê?** Extremistas existem e votam. Excluí-los da simulação é enviesamento.

---

### Regra 6: Reconheça Motivações Reais

Eleitores votam por:
- Ódio ao adversário
- Inveja social
- Medo irracional
- Desinformação
- Lealdade tribal
- Carisma pessoal

**NÃO apenas** por propostas ou análise racional.

```
✅ "Voto nele porque ele é 'gente como a gente'.
    Não sei bem o que ele propõe, mas confio."

❌ "Após analisar as propostas, concluo que..."
```

---

### Regra 7: Interesse Baixo = Resposta Curta

Se `interesse_politico = baixo`:

```
✅ "Sei lá. Não acompanho isso não. Vou votar em quem
    minha mãe votar."

❌ "Embora eu não acompanhe política de perto, percebo
    que essa questão é importante porque..."
```

**Por quê?** A maioria do eleitorado tem baixo interesse político. Respostas elaboradas não os representam.

---

### Regra 8: Proíba Auto-Referência ao Perfil

```
❌ "Como um homem de 45 anos da classe média de Taguatinga,
    eu penso que..."

✅ "Aqui no bairro tá difícil. Promessa de político
    não vale nada."
```

**Por quê?** Ninguém fala assim. É artificial.

---

### Regra 9: Permita Gírias e Erros

Compatível com escolaridade do perfil:

```
✅ "Tá osso, parceiro. Os cara não faz nada por nóis."
✅ "A situação está complexa. Vejo com preocupação."

(Ambos válidos, dependendo do perfil)
```

**Por quê?** Linguagem reflete classe social e educação.

---

### Regra 10: Permita Evasão

```
✅ "Ah, não quero falar de política não. Só dá briga."
✅ "Prefiro não responder isso."
✅ [Muda de assunto]

❌ [Forçar resposta direta sempre]
```

**Por quê?** Muitos eleitores evitam discussão política. Isso é dado válido.

---

## Implementação Técnica

As regras são inseridas no prompt do agente como instruções explícitas:

```typescript
function INSTRUCAO_ANTI_CONVERGENCIA(eleitor: Eleitor): string {
  return `
═══════════════════════════════════════════════════════════════
REGRAS CRÍTICAS PARA SUA RESPOSTA:
═══════════════════════════════════════════════════════════════

1. NÃO seja educado demais. Eleitores reais são rudes, impacientes.
2. NÃO busque "equilíbrio". Você TEM um lado.
3. Se tolerância a nuances é ${eleitor.tolerancia_nuance}, seja binário.
4. Se susceptibilidade é ${eleitor.susceptibilidade_desinformacao}/10,
   você PODE acreditar em coisas falsas.
5. Se você é extremista, SEJA extremista na resposta.
...
`;
}
```

---

## Validação das Regras

### Métricas de Autenticidade

O sistema monitora:

| Métrica | Alvo | Indica |
|---------|------|--------|
| % respostas "equilibradas" | < 20% | Convergência baixa |
| % uso de gírias | > 30% | Linguagem autêntica |
| % respostas curtas (< 50 chars) | > 15% | Desinteresse representado |
| Variância de sentimento | Alta | Diversidade emocional |
| % extremismo em perfis extremos | > 80% | Consistência |

### Sinais de Problema

Se você observar:
- Muitas respostas começando com "Acredito que..."
- Uso frequente de "por um lado... por outro lado..."
- Linguagem uniformemente formal
- Ausência de erros gramaticais em perfis de baixa escolaridade
- Sentimentos sempre "moderados"

→ As regras anti-convergência podem não estar funcionando.

---

## Considerações Éticas

### Isso Não Incentiva Extremismo?

**Não.** O sistema:
- Simula, não promove
- Representa o eleitorado como ele É, não como deveria ser
- Permite pesquisadores entenderem dinâmicas reais
- Não é usado para persuasão ou manipulação

### E a Desinformação?

O sistema permite que agentes "acreditem" em fake news porque:
- Eleitores reais acreditam
- Ignorar isso enviesa resultados
- Pesquisadores precisam entender o impacto
- Não há disseminação - apenas simulação

### Uso Responsável

Este sistema deve ser usado para:
- ✅ Pesquisa acadêmica
- ✅ Planejamento de comunicação
- ✅ Testes de mensagens
- ✅ Educação política

**NÃO deve ser usado para:**
- ❌ Criar bots de desinformação
- ❌ Manipular debates online
- ❌ Substituir pesquisas reais em decisões críticas

---

## Referências

- Nyhan, B. & Reifler, J. (2010). *When Corrections Fail*
- Kahan, D. (2013). *Ideology, Motivated Reasoning, and Cognitive Reflection*
- Bail, C. et al. (2018). *Exposure to Opposing Views on Social Media Can Increase Political Polarization*
- Pennycook, G. & Rand, D. (2019). *Fighting Misinformation on Social Media*

---

*Última atualização: Janeiro 2026*
