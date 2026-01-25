# Sistema Cognitivo: As 4 Etapas do Pensamento

Como os agentes sintéticos "pensam" e respondem às perguntas de pesquisa.

---

## Visão Geral

O sistema utiliza um processo chamado **Chain of Thought** (Cadeia de Pensamento) que simula como eleitores reais processam informação política. Diferente de um chatbot convencional que dá respostas "educadas", nossos agentes passam por 4 etapas cognitivas que introduzem vieses, emoções e irracionalidade realistas.

```
┌─────────────────────────────────────────────────────────────┐
│                    PERGUNTA RECEBIDA                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ETAPA 1: FILTRO DE ATENÇÃO                                 │
│  "Eu sequer prestaria atenção nisso?"                       │
│  → Se NÃO: resposta superficial/desinteressada              │
│  → Se SIM: continua para próxima etapa                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ETAPA 2: VIÉS DE CONFIRMAÇÃO                               │
│  "Isso confirma ou ameaça o que eu acredito?"               │
│  → Ativa vieses cognitivos do perfil                        │
│  → Identifica medos acionados                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ETAPA 3: REAÇÃO EMOCIONAL                                  │
│  "Como isso me faz SENTIR?"                                 │
│  → Segurança, Ameaça, Raiva, Indiferença ou Esperança       │
│  → Intensidade de 1 a 10                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ETAPA 4: DECISÃO/RESPOSTA                                  │
│  "Qual é minha resposta GENUÍNA?"                           │
│  → Pode ser irracional, rude, contraditória                 │
│  → Autêntica ao perfil do eleitor                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESPOSTA GERADA                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Etapa 1: Filtro de Atenção

### O Que É

Simula a **atenção seletiva** - nem todo mundo presta atenção em tudo. Um eleitor com interesse político "baixo" pode simplesmente ignorar a pergunta ou dar uma resposta superficial.

### Fatores Considerados

| Fator | Influência |
|-------|------------|
| `interesse_politico` | Baixo = ignora mais |
| `rotina_diaria` | Ocupado demais? |
| `preocupacoes` | Isso me afeta? |
| `fontes_informacao` | Vi algo sobre isso? |

### Exemplos de Comportamento

**Interesse Alto:**
```
"Li sobre isso no jornal ontem. Deixa eu pensar..."
→ Prossegue para próxima etapa
```

**Interesse Baixo:**
```
"Nem li direito isso aí. Sei lá, tanto faz."
→ Resposta superficial, processo encerra
```

**Interesse Médio:**
```
"Vi algo no WhatsApp sobre isso..."
→ Prossegue, mas com base em informação parcial
```

---

## Etapa 2: Viés de Confirmação

### O Que É

Simula como humanos **filtram informação** para confirmar crenças existentes. Se algo contradiz o que acreditamos, tendemos a rejeitar ou distorcer.

### Perguntas Processadas

1. **Confirma minhas crenças?**
   - Se SIM: aceita facilmente
   - Se NÃO: resiste, questiona, descarta

2. **Ameaça meus valores?**
   - Se SIM: reação defensiva, medo
   - Se NÃO: processa normalmente

3. **Ativa algum dos meus medos?**
   - Medos específicos do perfil são checados
   - Ex: "medo de violência" → reage forte a temas de segurança

### Vieses Cognitivos Implementados

| Viés | Comportamento |
|------|---------------|
| **Confirmação** | Aceita só o que concorda |
| **Aversão à Perda** | Medo de perder > desejo de ganhar |
| **Tribalismo** | "Meu grupo está certo" |
| **Efeito Halo** | Uma qualidade generaliza tudo |
| **Ancoragem** | Fixa na primeira informação |
| **Disponibilidade** | Lembra do que viu recentemente |

### Exemplo de Processamento

```json
{
  "etapa2_vies": {
    "confirma_crencas": false,
    "ameaca_valores": true,
    "medos_ativados": ["perder emprego", "violência urbana"]
  }
}
```

**Interpretação:** A pergunta contradiz o que o eleitor acredita e ativa medos sobre emprego e violência. A resposta será defensiva e emocional.

---

## Etapa 3: Reação Emocional

### O Que É

Identifica a **resposta emocional primária** antes da racionalização. Humanos sentem ANTES de pensar - só depois constroem justificativas.

### Sentimentos Possíveis

| Sentimento | Quando Ocorre | Comportamento Resultante |
|------------|---------------|--------------------------|
| **Segurança** | Confirma worldview | Resposta confiante, pode ser condescendente |
| **Ameaça** | Desafia identidade | Defensivo, pode atacar |
| **Raiva** | Percebe injustiça | Agressivo, pode ser irracional |
| **Indiferença** | Não afeta sua vida | Desinteressado, resposta curta |
| **Esperança** | Vê possibilidade positiva | Otimista, pode ignorar problemas |

### Intensidade (1-10)

- **1-3**: Reação leve, resposta equilibrada
- **4-6**: Reação moderada, algum viés
- **7-10**: Reação forte, resposta dominada pela emoção

### Exemplo de Processamento

```json
{
  "etapa3_emocional": {
    "sentimento": "raiva",
    "intensidade": 8
  }
}
```

**Interpretação:** O eleitor está com raiva intensa. Sua resposta provavelmente será agressiva, pode conter xingamentos ou generalizações.

---

## Etapa 4: Decisão/Resposta

### O Que É

A **resposta final** é gerada considerando todas as etapas anteriores. NÃO é necessariamente racional ou politicamente correta.

### Características da Resposta

A resposta é moldada por:

1. **Escolaridade**: Vocabulário e complexidade
2. **Instrução comportamental**: Tom e estilo
3. **Tolerância a nuances**: Binário ou complexo?
4. **Conflito identitário**: Pode ser contraditória

### Outputs Adicionais

| Campo | Descrição |
|-------|-----------|
| `muda_voto` | A pergunta fez reconsiderar voto? |
| `aumenta_cinismo` | Ficou mais descrente da política? |

### Exemplo de Resposta Completa

```json
{
  "chain_of_thought": {
    "etapa1_atencao": {
      "prestou_atencao": true,
      "motivo": "Afeta meu bairro diretamente"
    },
    "etapa2_vies": {
      "confirma_crencas": false,
      "ameaca_valores": true,
      "medos_ativados": ["violência"]
    },
    "etapa3_emocional": {
      "sentimento": "raiva",
      "intensidade": 7
    },
    "etapa4_decisao": {
      "muda_voto": false,
      "aumenta_cinismo": true
    }
  },
  "resposta_texto": "Mais uma promessa vazia! Esses políticos são tudo igual, só querem o voto da gente. Aqui na Ceilândia ninguém vê melhoria nenhuma, pode falar o que quiser.",
  "resposta_estruturada": {
    "opcao": "Candidato B (oposição)"
  }
}
```

---

## Por Que Esse Sistema?

### Problema: Respostas Genéricas

Sem o Chain of Thought, IAs tendem a dar respostas:
- Equilibradas demais ("os dois lados têm pontos válidos")
- Politicamente corretas
- Racionais e bem estruturadas
- Sem personalidade

**Isso não representa eleitores reais.**

### Solução: Autenticidade Forçada

O sistema força a IA a:
- Processar a pergunta através do PERFIL do eleitor
- Considerar vieses e limitações cognitivas
- Reagir emocionalmente ANTES de racionalizar
- Dar respostas que podem ser rudes, irracionais ou contraditórias

### Resultado

Respostas que refletem como **eleitores reais** respondem a pesquisas:
- Alguns não leem a pergunta direito
- Alguns respondem baseado em fake news
- Alguns são agressivos ou evasivos
- Alguns mudam de assunto
- Poucos dão respostas "equilibradas"

---

## Como Usar na Análise

### Filtrando por Etapa

Você pode analisar respostas filtrando por características cognitivas:

**Eleitores que não prestaram atenção:**
```python
respostas_ignoradas = [r for r in respostas
  if not r["chain_of_thought"]["etapa1_atencao"]["prestou_atencao"]]
```

**Eleitores que sentiram ameaça:**
```python
respostas_defensivas = [r for r in respostas
  if r["chain_of_thought"]["etapa2_vies"]["ameaca_valores"]]
```

**Eleitores com raiva intensa:**
```python
respostas_raivosas = [r for r in respostas
  if r["chain_of_thought"]["etapa3_emocional"]["sentimento"] == "raiva"
  and r["chain_of_thought"]["etapa3_emocional"]["intensidade"] >= 7]
```

### Insights Derivados

O sistema gera insights automáticos baseados nas etapas:

| Padrão Detectado | Insight |
|------------------|---------|
| Muitos "não prestaram atenção" | Tema não mobiliza esse segmento |
| Muitos "ameaça_valores = true" | Tema é divisivo |
| Alta intensidade de raiva | Tema pode ser explorado/evitado |
| Muitos "muda_voto = true" | Tema tem potencial de persuasão |

---

## Limitações

1. **É uma simulação**: Não substitui pesquisas com eleitores reais
2. **Baseado em perfis**: Se o perfil é impreciso, a resposta também será
3. **Sem memória longa**: Não lembra de notícias reais recentes
4. **Viés do modelo**: A IA base (Claude) tem seus próprios vieses

---

## Referências

- Kahneman, D. (2011). *Thinking, Fast and Slow*
- Tversky, A. & Kahneman, D. (1974). *Judgment under Uncertainty: Heuristics and Biases*
- Lodge, M. & Taber, C. (2013). *The Rationalizing Voter*
- Westen, D. (2007). *The Political Brain*

---

*Última atualização: Janeiro 2026*
