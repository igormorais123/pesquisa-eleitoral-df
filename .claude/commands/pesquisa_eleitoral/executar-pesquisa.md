# Executar Pesquisa Eleitoral

## Objetivo

Executar uma pesquisa eleitoral completa usando os eleitores sintéticos e gerar relatório de resultados.

## Argumento

`$ARGUMENTS` - Parâmetros da pesquisa (ex: "governador 2026 amostra=500")

## Processo

### 1. Validar Ambiente

```bash
# Verificar se backend está rodando
curl -s http://localhost:8000/health || echo "Backend offline"

# Verificar banco de eleitores
python -c "import json; data=json.load(open('agentes/banco-eleitores-df.json')); print(f'{len(data)} eleitores disponíveis')"
```

### 2. Configurar Pesquisa

Parâmetros padrão:
- **Cargo**: Definido no argumento
- **Amostra**: 500 eleitores (ou especificado)
- **Margem de erro**: 4.4% (amostra 500)
- **Nível de confiança**: 95%

### 3. Selecionar Amostra

Usar estratificação por:
- Região Administrativa
- Cluster socioeconômico
- Faixa etária
- Gênero

```python
# Exemplo de seleção estratificada
from scripts.selecao_amostra import selecionar_estratificado
amostra = selecionar_estratificado(
    banco="agentes/banco-eleitores-df.json",
    tamanho=500,
    estratos=["regiao_administrativa", "cluster_socioeconomico"]
)
```

### 4. Executar Entrevistas

Via API backend:
```bash
# Para cada eleitor na amostra
curl -X POST http://localhost:8000/api/v1/entrevistas/{id}/executar \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Em quem você votaria para governador do DF?"}'
```

### 5. Agregar Resultados

```python
from scripts.agregacao_resultados import agregar
resultados = agregar(
    entrevistas=respostas,
    segmentacoes=["regiao", "idade", "genero", "cluster"]
)
```

### 6. Gerar Relatório

Salvar em `frontend/public/resultados-{cargo}-{data}/`:
- `index.html` - Relatório visual (padrão INTEIA)
- `dados.json` - Dados brutos
- `metodologia.md` - Descrição metodológica

### 7. Validação Estatística

Incluir no relatório:
- Tamanho da amostra
- Margem de erro calculada
- Nível de confiança
- Distribuição estratificada
- Comparação com pesquisas anteriores

## Formato de Saída

```
📊 PESQUISA ELEITORAL CONCLUÍDA

Cargo: Governador DF 2026
Data: {data}
Amostra: 500 eleitores
Margem: ±4.4%
Confiança: 95%

RESULTADOS:
1. Candidato A: XX.X%
2. Candidato B: XX.X%
3. Indecisos: XX.X%

Relatório: frontend/public/resultados-governador-2026/index.html
```

## Exemplo de Uso

```
/executar-pesquisa governador 2026 amostra=500
/executar-pesquisa senador 2026 amostra=300
```
