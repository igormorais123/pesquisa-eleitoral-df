# Analisar Eleitor Sintético

## Objetivo

Analisar perfil detalhado de um eleitor sintético do banco de dados e prever comportamento eleitoral.

## Argumento

`$ARGUMENTS` - ID do eleitor ou filtros (ex: "id=123" ou "regiao=Ceilandia classe=C")

## Atributos do Eleitor (60+)

### Demográficos
- nome, idade, genero, cor_raca
- regiao_administrativa, bairro
- estado_civil, filhos

### Socioeconômicos
- cluster_socioeconomico (A, B, C, D, E)
- escolaridade
- renda_familiar
- ocupacao
- tipo_moradia

### Políticos
- orientacao_politica (esquerda → direita)
- posicao_bolsonaro (-5 a +5)
- interesse_politico (baixo, médio, alto)
- participacao_eleicoes_anteriores
- candidatos_preferidos

### Psicológicos
- vieses_cognitivos
- medos_principais
- valores_fundamentais
- preocupacoes_prioritarias
- estilo_decisao

### Comportamentais
- susceptibilidade_desinformacao
- fontes_informacao
- redes_sociais_usadas
- influenciadores

## Processo de Análise

### 1. Carregar Perfil
```python
import json
eleitores = json.load(open('agentes/banco-eleitores-df.json'))
eleitor = next(e for e in eleitores if e['id'] == id)
```

### 2. Análise de Persona
Usar Claude para:
- Construir narrativa do eleitor
- Identificar motivações de voto
- Prever reações a temas específicos

### 3. Simulação de Entrevista
```python
prompt = f"""
Você é {eleitor['nome']}, um eleitor de {eleitor['regiao_administrativa']}.
Perfil: {json.dumps(eleitor, indent=2)}

Responda como este eleitor responderia:
{pergunta}
"""
```

### 4. Análise de Vulnerabilidades
- Quais narrativas podem influenciar?
- Quais medos podem ser explorados?
- Qual tom de comunicação é mais eficaz?

## Formato de Saída

```
👤 PERFIL DO ELEITOR

Nome: {nome}
Região: {regiao_administrativa}
Cluster: {cluster_socioeconomico}
Idade: {idade} anos
Orientação: {orientacao_politica}

📊 ANÁLISE COMPORTAMENTAL

Probabilidade de voto:
- Candidato A: XX%
- Candidato B: XX%
- Indeciso: XX%

🎯 FATORES DE INFLUÊNCIA

1. {fator_1} - Peso alto
2. {fator_2} - Peso médio
3. {fator_3} - Peso baixo

💡 RECOMENDAÇÕES DE ABORDAGEM

- Mensagem ideal: {mensagem}
- Canal preferido: {canal}
- Tom: {tom}
```

## Exemplo de Uso

```
/analisar-eleitor id=42
/analisar-eleitor regiao=Taguatinga idade=35-45
/analisar-eleitor cluster=C orientacao=centro
```
