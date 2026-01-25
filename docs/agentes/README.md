# Guia de Customização de Agentes

Como criar, modificar e importar eleitores sintéticos.

---

## Visão Geral

Os **agentes** (eleitores sintéticos) são o coração do sistema. Cada agente representa um eleitor fictício do Distrito Federal com perfil completo e realista.

### Características

- **60+ atributos** por eleitor
- **Coerência interna** entre valores, medos e comportamentos
- **Diversidade** demográfica e política
- **Personalidade** que influencia respostas

### Arquivos de Dados

```
agentes/
└── banco-eleitores-df.json   # 400 eleitores padrão
```

---

## Schema do Eleitor

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | Identificador único (ex: "el_001") |
| `nome` | string | Nome completo brasileiro |
| `idade` | number | 18-100 |
| `genero` | "masculino" \| "feminino" | - |
| `cor_raca` | string | Branca, Preta, Parda, etc. |
| `regiao_administrativa` | string | RA do DF |
| `cluster_socioeconomico` | string | G1_alta, G2_media_alta, G3_media_baixa, G4_baixa |
| `escolaridade` | string | Nível de ensino |
| `profissao` | string | Ocupação atual |
| `ocupacao_vinculo` | string | CLT, servidor, autônomo, etc. |
| `renda_salarios_minimos` | string | Faixa de renda |
| `religiao` | string | Crença religiosa |
| `estado_civil` | string | Solteiro, casado, etc. |
| `filhos` | number | Quantidade de filhos |
| `orientacao_politica` | string | Esquerda a direita |
| `posicao_bolsonaro` | string | Apoiador a crítico |
| `interesse_politico` | string | Baixo, médio, alto |
| `valores` | string[] | Lista de valores |
| `preocupacoes` | string[] | Lista de preocupações |
| `historia_resumida` | string | Narrativa de vida |
| `criado_em` | string | Data ISO |
| `atualizado_em` | string | Data ISO |

### Campos Opcionais (Mas Recomendados)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tolerancia_nuance` | "baixa" \| "media" \| "alta" | Aceita nuances? |
| `estilo_decisao` | string | Como decide voto |
| `medos` | string[] | Medos profundos |
| `fontes_informacao` | string[] | Onde se informa |
| `vieses_cognitivos` | string[] | Vieses ativos |
| `susceptibilidade_desinformacao` | number | 1-10 |
| `conflito_identitario` | boolean | Posições contraditórias? |
| `instrucao_comportamental` | string | Como responder |
| `voto_facultativo` | boolean | Pode não votar? |

---

## Valores Permitidos

### Gênero

```typescript
type Genero = 'masculino' | 'feminino';
```

### Cluster Socioeconômico

```typescript
type ClusterSocioeconomico =
  | 'G1_alta'        // Alta renda (10+ SM)
  | 'G2_media_alta'  // Média-alta (5-10 SM)
  | 'G3_media_baixa' // Média-baixa (2-5 SM)
  | 'G4_baixa';      // Baixa (<2 SM)
```

### Orientação Política

```typescript
type OrientacaoPolitica =
  | 'esquerda'
  | 'centro-esquerda'
  | 'centro'
  | 'centro-direita'
  | 'direita';
```

### Posição Bolsonaro

```typescript
type PosicaoBolsonaro =
  | 'apoiador_forte'
  | 'apoiador_moderado'
  | 'neutro'
  | 'critico_moderado'
  | 'critico_forte';
```

### Interesse Político

```typescript
type InteressePolitico = 'baixo' | 'medio' | 'alto';
```

### Tolerância a Nuances

```typescript
type ToleranciaNuance = 'baixa' | 'media' | 'alta';
```

### Estilo de Decisão

```typescript
type EstiloDecisao =
  | 'identitario'  // Vota por identidade de grupo
  | 'pragmatico'   // Avalia propostas
  | 'moral'        // Baseado em valores morais
  | 'economico'    // Foco no bolso
  | 'emocional';   // Baseado em sentimentos
```

### Ocupação/Vínculo

```typescript
type OcupacaoVinculo =
  | 'clt'
  | 'servidor_publico'
  | 'autonomo'
  | 'empresario'
  | 'informal'
  | 'desempregado'
  | 'aposentado'
  | 'estudante';
```

---

## Regiões Administrativas do DF

```json
[
  "Plano Piloto", "Gama", "Taguatinga", "Brazlândia",
  "Sobradinho", "Planaltina", "Paranoá", "Núcleo Bandeirante",
  "Ceilândia", "Guará", "Cruzeiro", "Samambaia",
  "Santa Maria", "São Sebastião", "Recanto das Emas",
  "Lago Sul", "Riacho Fundo", "Lago Norte", "Candangolândia",
  "Águas Claras", "Riacho Fundo II", "Sudoeste/Octogonal",
  "Varjão", "Park Way", "SCIA/Estrutural", "Sobradinho II",
  "Jardim Botânico", "Itapoã", "SIA", "Vicente Pires",
  "Fercal", "Sol Nascente/Pôr do Sol", "Arniqueira"
]
```

---

## Exemplo de Eleitor Completo

```json
{
  "id": "el_custom_001",
  "nome": "Maria das Graças Oliveira",
  "idade": 42,
  "genero": "feminino",
  "cor_raca": "Parda",
  "regiao_administrativa": "Ceilândia",
  "local_referencia": "Próximo ao Shopping JK",
  "cluster_socioeconomico": "G3_media_baixa",
  "escolaridade": "Ensino médio completo",
  "profissao": "Auxiliar administrativa",
  "ocupacao_vinculo": "clt",
  "renda_salarios_minimos": "2-3",
  "religiao": "Evangélica",
  "estado_civil": "Casada",
  "filhos": 2,
  "orientacao_politica": "centro-direita",
  "posicao_bolsonaro": "apoiador_moderado",
  "interesse_politico": "baixo",
  "tolerancia_nuance": "baixa",
  "estilo_decisao": "moral",
  "valores": [
    "Família",
    "Fé",
    "Trabalho",
    "Honestidade",
    "Segurança"
  ],
  "preocupacoes": [
    "Violência urbana",
    "Emprego dos filhos",
    "Inflação",
    "Saúde pública"
  ],
  "medos": [
    "Perder o emprego",
    "Filhos se envolverem com drogas",
    "Assalto"
  ],
  "fontes_informacao": [
    "WhatsApp da família",
    "Igreja",
    "Jornal Nacional",
    "Facebook"
  ],
  "vieses_cognitivos": [
    "confirmacao",
    "tribalismo",
    "aversao_perda"
  ],
  "susceptibilidade_desinformacao": 7,
  "meio_transporte": "Ônibus",
  "tempo_deslocamento_trabalho": "1h30",
  "voto_facultativo": false,
  "conflito_identitario": false,
  "historia_resumida": "Maria nasceu em Ceilândia, filha de migrantes nordestinos. Trabalhou como doméstica por 15 anos antes de conseguir emprego com carteira assinada. É membro ativa da sua igreja evangélica, onde participa do grupo de louvor. Seus dois filhos estudam em escola pública. Ela se preocupa muito com a violência no bairro depois que o sobrinho foi assaltado. Não gosta de falar de política, mas vota sempre 'pelo bem da família'. Desconfia de políticos 'que falam difícil' e prefere candidatos que 'parecem gente comum'.",
  "instrucao_comportamental": "Respostas curtas e diretas. Usa expressões como 'sei lá', 'acho que'. Desvia de perguntas muito políticas. Fala muito da família e da igreja. Desconfia de 'comunistas'. Acredita em correntes de WhatsApp da família.",
  "observacao_territorial": "Mora na QNM, área de classe média-baixa de Ceilândia. Conhece bem a realidade de transporte lotado e postos de saúde com fila.",
  "criado_em": "2026-01-15T00:00:00Z",
  "atualizado_em": "2026-01-15T00:00:00Z"
}
```

---

## Criando Novos Eleitores

### Via Interface (Recomendado)

1. Acesse **Eleitores** → **Gerar**
2. Configure os parâmetros:
   - Quantidade
   - Região foco
   - Cluster foco
3. Clique em **Gerar**
4. Revise e ajuste os eleitores gerados

### Via JSON Manual

1. Crie um arquivo JSON com array de eleitores
2. Importe via **Eleitores** → **Upload**

```json
[
  {
    "id": "el_custom_001",
    "nome": "...",
    ...
  },
  {
    "id": "el_custom_002",
    "nome": "...",
    ...
  }
]
```

### Via API

```bash
# Criar um eleitor
curl -X POST http://localhost:8000/api/v1/eleitores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "idade": 35,
    ...
  }'

# Importar lote
curl -X POST http://localhost:8000/api/v1/eleitores/lote \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{...}, {...}]'
```

---

## Regras de Coerência

Para agentes realistas, mantenha coerência entre atributos:

### Cluster ↔ Região

| Cluster | Regiões Típicas |
|---------|-----------------|
| G1_alta | Lago Sul, Lago Norte, Park Way |
| G2_media_alta | Águas Claras, Sudoeste, Guará |
| G3_media_baixa | Taguatinga, Samambaia, Gama |
| G4_baixa | Ceilândia, Sol Nascente, Estrutural |

### Cluster ↔ Escolaridade

| Cluster | Escolaridade Típica |
|---------|---------------------|
| G1_alta | Superior completo, Pós-graduação |
| G2_media_alta | Superior completo/incompleto |
| G3_media_baixa | Médio completo, Superior incompleto |
| G4_baixa | Fundamental, Médio incompleto |

### Orientação ↔ Valores

| Orientação | Valores Típicos |
|------------|-----------------|
| Esquerda | Igualdade, Diversidade, Sustentabilidade |
| Centro | Equilíbrio, Pragmatismo, Estabilidade |
| Direita | Família, Tradição, Livre iniciativa |

### Posição Bolsonaro ↔ Orientação

| Orientação | Posição Bolsonaro Provável |
|------------|----------------------------|
| Esquerda | critico_forte |
| Centro-esquerda | critico_moderado |
| Centro | neutro a critico_moderado |
| Centro-direita | neutro a apoiador_moderado |
| Direita | apoiador_moderado a apoiador_forte |

---

## Boas Práticas

### 1. Diversidade

Garanta distribuição variada:
- Diferentes idades (18-80)
- Todas as regiões
- Todos os clusters
- Espectro político completo

### 2. Contradições Realistas

Use `conflito_identitario: true` para eleitores com posições não 100% consistentes:

```json
{
  "orientacao_politica": "direita",
  "conflito_identitario": true,
  "valores": ["Família", "Meio ambiente"],  // Conservador, mas ecológico
  "historia_resumida": "Evangelico, mas discorda da igreja em questões ambientais..."
}
```

### 3. Histórias Ricas

A `historia_resumida` deve explicar as posições:

**Ruim:**
```
"João é de direita e gosta de Bolsonaro."
```

**Bom:**
```
"João cresceu em família militar. Seu pai serviu durante a ditadura e sempre
falou dos 'bons tempos de ordem'. Trabalha em empresa de segurança privada.
Foi assaltado duas vezes e perdeu um primo para violência. Acredita que
'bandido bom é bandido morto' e que o Brasil precisa de 'mão firme'."
```

### 4. Instrução Comportamental Específica

Use `instrucao_comportamental` para definir como o eleitor responde:

```json
{
  "interesse_politico": "baixo",
  "instrucao_comportamental": "Respostas monossilábicas. Frequentemente diz 'não sei' ou 'tanto faz'. Só se anima quando o assunto é futebol ou BBB."
}
```

---

## Adaptação para Outras Regiões

### Substituir Regiões

Para usar em São Paulo, por exemplo:

1. Substitua `regiao_administrativa` pelos distritos de SP
2. Ajuste `cluster_socioeconomico` conforme IDH local
3. Modifique `local_referencia` para pontos de SP

### Ajustar Referências Culturais

- Remova referências ao DF
- Adicione gírias e referências locais
- Ajuste `fontes_informacao` conforme mercado local

### Script de Conversão

```python
import json

# Carregar eleitores do DF
with open('agentes/banco-eleitores-df.json') as f:
    eleitores = json.load(f)

# Mapeamento de regiões
MAPA_REGIOES = {
    'Ceilândia': 'Itaquera',
    'Taguatinga': 'Santo Amaro',
    'Plano Piloto': 'Pinheiros',
    # ... continuar mapeamento
}

# Converter
for eleitor in eleitores:
    ra = eleitor['regiao_administrativa']
    if ra in MAPA_REGIOES:
        eleitor['regiao_administrativa'] = MAPA_REGIOES[ra]

    # Ajustar história
    eleitor['historia_resumida'] = eleitor['historia_resumida'].replace(
        'Distrito Federal', 'São Paulo'
    ).replace('DF', 'SP')

# Salvar
with open('agentes/banco-eleitores-sp.json', 'w') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
```

---

## Validação

### Validar JSON

```bash
# Verificar sintaxe JSON
python -m json.tool agentes/banco-eleitores-df.json > /dev/null && echo "JSON válido"

# Contar eleitores
python -c "import json; print(len(json.load(open('agentes/banco-eleitores-df.json'))))"
```

### Verificar Campos Obrigatórios

```python
import json

CAMPOS_OBRIGATORIOS = [
    'id', 'nome', 'idade', 'genero', 'cor_raca',
    'regiao_administrativa', 'cluster_socioeconomico',
    'orientacao_politica', 'historia_resumida'
]

with open('agentes/banco-eleitores-df.json') as f:
    eleitores = json.load(f)

for i, eleitor in enumerate(eleitores):
    for campo in CAMPOS_OBRIGATORIOS:
        if campo not in eleitor:
            print(f"Eleitor {i}: falta campo '{campo}'")
```

### Verificar Distribuição

```python
from collections import Counter

orientacoes = Counter(e['orientacao_politica'] for e in eleitores)
print("Distribuição de orientação política:")
for o, c in orientacoes.most_common():
    print(f"  {o}: {c} ({100*c/len(eleitores):.1f}%)")
```

---

## Próximos Passos

- [4 Etapas Cognitivas](../cognicao/4-etapas-cognitivas.md) - Como os agentes "pensam"
- [Regras Anti-Convergência](../cognicao/regras-anti-convergencia.md) - Respostas autênticas
- [Referência da API](../api/README.md) - Endpoints de eleitores

---

*Última atualização: Janeiro 2026*
