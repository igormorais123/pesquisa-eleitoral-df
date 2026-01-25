# Entendendo os Eleitores

Conheça os 1000 agentes sintéticos que respondem às pesquisas.

---

## O Que São Agentes Sintéticos?

Os **agentes sintéticos** são perfis de eleitores gerados por inteligência artificial. Cada um representa um eleitor fictício, mas **realista**, do Distrito Federal.

### Características

- **1000 perfis únicos**: Nenhum é igual ao outro
- **60+ atributos cada**: Desde idade até vieses cognitivos
- **Baseados em dados reais**: Distribuições demográficas do IBGE/TSE
- **Comportamento autêntico**: Respondem como eleitores reais, com vieses e emoções

### O Que NÃO São

- ❌ Pessoas reais
- ❌ Previsões de comportamento individual
- ❌ Substitutos para pesquisas tradicionais
- ❌ Representação 100% precisa do eleitorado

---

## Estrutura de um Perfil

Cada eleitor tem atributos organizados em categorias:

### 1. Dados Pessoais

| Atributo | Exemplo | Descrição |
|----------|---------|-----------|
| `nome` | Maria Silva | Nome fictício brasileiro |
| `idade` | 34 | 16 a 85 anos |
| `genero` | feminino | masculino, feminino |
| `cor_raca` | parda | branca, preta, parda, amarela, indígena |
| `estado_civil` | casada | solteiro, casado, divorciado, viúvo |
| `filhos` | 2 | Número de filhos |
| `religiao` | evangélica | católica, evangélica, sem religião, etc. |

### 2. Localização

| Atributo | Exemplo | Descrição |
|----------|---------|-----------|
| `regiao_administrativa` | Ceilândia | Uma das 33 RAs do DF |
| `cluster_socioeconomico` | G4_baixa | G1 a G4 (alta a baixa renda) |

**Regiões Administrativas (RAs):**
- **G1_alta**: Lago Sul, Lago Norte, Park Way, Sudoeste
- **G2_media_alta**: Plano Piloto, Águas Claras, Jardim Botânico
- **G3_media_baixa**: Taguatinga, Guará, Vicente Pires, Sobradinho
- **G4_baixa**: Ceilândia, Samambaia, Sol Nascente, Recanto das Emas

### 3. Perfil Socioeconômico

| Atributo | Exemplo | Descrição |
|----------|---------|-----------|
| `escolaridade` | ensino_medio_completo | Nível de educação formal |
| `profissao` | comerciante | Ocupação principal |
| `ocupacao_vinculo` | autonomo | CLT, autônomo, servidor, etc. |
| `renda_salarios_minimos` | 2.5 | Renda em salários mínimos |

### 4. Perfil Político

| Atributo | Valores Possíveis | Descrição |
|----------|-------------------|-----------|
| `orientacao_politica` | esquerda, centro-esquerda, centro, centro-direita, direita | Posição no espectro |
| `posicao_bolsonaro` | apoiador_forte a critico_forte | Relação com ex-presidente |
| `interesse_politico` | baixo, medio, alto | Engajamento com política |
| `estilo_decisao` | identitario, pragmatico, moral, economico, emocional | Como decide voto |
| `tolerancia_nuance` | baixa, media, alta | Aceita complexidade? |

### 5. Valores e Preocupações

| Atributo | Tipo | Exemplo |
|----------|------|---------|
| `valores` | Array | ["Família", "Trabalho", "Segurança"] |
| `preocupacoes` | Array | ["Desemprego", "Violência", "Saúde"] |
| `medos` | Array | ["Perder emprego", "Não pagar contas"] |

### 6. Perfil Cognitivo

| Atributo | Exemplo | Descrição |
|----------|---------|-----------|
| `vieses_cognitivos` | ["confirmação", "tribalismo"] | Vieses que afetam julgamento |
| `susceptibilidade_desinformacao` | 7 | Escala 1-10 |
| `fontes_informacao` | ["WhatsApp", "TV Globo"] | Onde se informa |

### 7. Narrativa

| Atributo | Descrição |
|----------|-----------|
| `historia_resumida` | Background que explica suas posições |
| `instrucao_comportamental` | Como deve responder a perguntas |
| `conflito_identitario` | Se tem posições contraditórias |

---

## Exemplo de Perfil Completo

```json
{
  "id": "el_047",
  "nome": "José Carlos Oliveira",
  "idade": 52,
  "genero": "masculino",
  "cor_raca": "parda",
  "estado_civil": "casado",
  "filhos": 3,
  "religiao": "evangelica",

  "regiao_administrativa": "Ceilândia",
  "cluster_socioeconomico": "G4_baixa",

  "escolaridade": "ensino_fundamental_incompleto",
  "profissao": "pedreiro",
  "ocupacao_vinculo": "autonomo",
  "renda_salarios_minimos": 1.8,

  "orientacao_politica": "centro-direita",
  "posicao_bolsonaro": "apoiador_moderado",
  "interesse_politico": "baixo",
  "estilo_decisao": "economico",
  "tolerancia_nuance": "baixa",

  "valores": [
    "Família tradicional",
    "Trabalho duro",
    "Fé em Deus",
    "Ordem e disciplina"
  ],
  "preocupacoes": [
    "Custo de vida",
    "Violência no bairro",
    "Futuro dos filhos",
    "Saúde pública"
  ],
  "medos": [
    "Ficar sem trabalho",
    "Não conseguir pagar as contas",
    "Assalto na rua"
  ],

  "vieses_cognitivos": ["confirmação", "aversao_perda", "tribalismo"],
  "susceptibilidade_desinformacao": 7,
  "fontes_informacao": ["WhatsApp", "Igreja", "TV Record"],

  "historia_resumida": "José Carlos nasceu no interior da Bahia e veio para Ceilândia aos 18 anos em busca de trabalho. Construiu a própria casa tijolo por tijolo. Passou por momentos difíceis nos governos do PT, quando o trabalho ficou escasso. Desde então, desconfia de qualquer político de esquerda. Na igreja, ouviu que 'a esquerda quer fechar igrejas' e acredita nisso.",

  "instrucao_comportamental": "Responde de forma direta e curta. Não tem paciência para 'politicagem'. Usa linguagem simples e pode ser rude se se sentir atacado. Não gosta de intelectuais 'que acham que sabem de tudo'.",

  "conflito_identitario": false,
  "voto_facultativo": false
}
```

---

## Distribuições no Banco

### Por Gênero
- Masculino: ~49%
- Feminino: ~51%

### Por Faixa Etária
| Faixa | Percentual |
|-------|------------|
| 16-24 | ~17% |
| 25-34 | ~23% |
| 35-44 | ~22% |
| 45-54 | ~19% |
| 55-64 | ~12% |
| 65+ | ~7% |

### Por Cluster Socioeconômico
| Cluster | Percentual | Regiões Típicas |
|---------|------------|-----------------|
| G1_alta | ~12% | Lago Sul, Park Way |
| G2_media_alta | ~24% | Plano Piloto, Águas Claras |
| G3_media_baixa | ~31% | Taguatinga, Guará |
| G4_baixa | ~33% | Ceilândia, Samambaia |

### Por Orientação Política
| Orientação | Percentual |
|------------|------------|
| Esquerda | ~18% |
| Centro-esquerda | ~22% |
| Centro | ~24% |
| Centro-direita | ~21% |
| Direita | ~15% |

### Por Religião
| Religião | Percentual |
|----------|------------|
| Católica | ~42% |
| Evangélica | ~32% |
| Sem religião | ~14% |
| Outras | ~12% |

---

## Usando os Filtros

### Filtros Básicos

No painel lateral da página de eleitores:

1. **Idade**: Arraste os controles para definir faixa
2. **Gênero**: Marque masculino, feminino ou ambos
3. **Região**: Selecione RAs específicas
4. **Cluster**: Escolha perfis de renda

### Filtros Avançados

Clique em "Mais Filtros" para:

- **Religião**: Católicos, evangélicos, sem religião
- **Orientação Política**: De esquerda a direita
- **Posição Bolsonaro**: De apoiador forte a crítico forte
- **Interesse Político**: Baixo, médio, alto
- **Escolaridade**: Fundamental a pós-graduação
- **Estilo de Decisão**: Identitário, pragmático, etc.

### Combinando Filtros

Você pode combinar qualquer número de filtros:

**Exemplo 1: Jovens de esquerda em áreas pobres**
- Idade: 18-30
- Orientação: esquerda, centro-esquerda
- Cluster: G4_baixa

**Exemplo 2: Evangélicos indecisos**
- Religião: evangélica
- Posição Bolsonaro: neutro
- Interesse: medio, alto

**Exemplo 3: Mulheres do Plano Piloto**
- Gênero: feminino
- Região: Plano Piloto, Asa Sul, Asa Norte

---

## Interpretando Perfis

### Coerência Interna

Cada perfil foi gerado para ser **internamente coerente**:

- Um pedreiro de Ceilândia provavelmente não é de esquerda radical
- Um professor universitário do Plano Piloto provavelmente não é bolsonarista forte
- Um evangélico raramente terá valores progressistas em costumes

### Conflitos Identitários

Alguns perfis têm `conflito_identitario = true`:

- Conservador em costumes, mas progressista em economia
- De esquerda em economia, mas contra políticas de gênero
- Classe média que vota na esquerda por ideologia

Esses perfis representam eleitores reais que não se encaixam em estereótipos.

### Limitações

1. **São estereótipos refinados**: Baseados em correlações estatísticas
2. **Não capturam exceções**: O pedreiro marxista existe, mas é raro
3. **Simplificam a realidade**: 60 atributos ainda é uma redução
4. **Refletem o momento**: Gerados em 2025, podem envelhecer

---

## Próximos Passos

- [Criando Entrevistas](03-criando-entrevistas.md) - Como formular perguntas
- [Interpretando Resultados](04-interpretando-resultados.md) - Analisar respostas
- [Glossário](../glossario.md) - Termos técnicos

---

*Última atualização: Janeiro 2026*
