# Trilha de Auditoria INTEIA

## Objetivo

Este documento garante **rastreabilidade completa** dos dados utilizados nas análises INTEIA, assegurando um documento **livre de alucinações**.

---

## Princípios Anti-Alucinação

### 1. Dados Baseados em Fontes Reais
Toda estatística deve ter origem documentada em fonte oficial ou pesquisa publicada.

### 2. Documentação do Caminho
Cada dado deve ter seu "caminho" de obtenção registrado:
```
Fonte → Coleta → Processamento → Aplicação → Validação
```

### 3. Verificação Final
Antes de publicar, executar checklist de verificação.

---

## Fontes de Dados Oficiais

### Eleitorais

| Fonte | Dados | URL | Última Atualização |
|-------|-------|-----|-------------------|
| TSE | Resultados, zonas, seções | dados.tse.jus.br | 2024 |
| TSE | Filiações partidárias | filia-se.tse.jus.br | 2025 |
| TRE-DF | Zonas eleitorais DF | tre-df.jus.br | 2024 |

### Demográficos

| Fonte | Dados | URL | Última Atualização |
|-------|-------|-----|-------------------|
| IBGE Censo | População, idade, gênero, raça | censo2022.ibge.gov.br | 2022 |
| PNAD Contínua | Emprego, renda, educação | ibge.gov.br/pnad | 2024 |
| CODEPLAN | Dados DF específicos | codeplan.df.gov.br | 2024 |

### Pesquisas de Opinião

| Fonte | Dados | Referência |
|-------|-------|------------|
| Datafolha | Pesquisas nacionais/DF | datafolha.folha.uol.com.br |
| Paraná Pesquisas | Pesquisas regionais | paranaresearch.com.br |
| Real Time Big Data | Pesquisas flash | realtimebigdata.com.br |
| Latinobarómetro | Valores políticos | latinobarometro.org |

### Socioeconômicos

| Fonte | Dados | URL |
|-------|-------|-----|
| ABEP | Critério Brasil | abep.org/criterio-brasil |
| SPC/Serasa | Endividamento | serasa.com.br |
| ANS | Planos de saúde | ans.gov.br |

---

## Processo de Verificação

### Checklist Pré-Publicação

```markdown
## Verificação de Dados - [Nome do Relatório]

### 1. Fontes
- [ ] Todas as estatísticas têm fonte citada
- [ ] Fontes são oficiais ou acadêmicas
- [ ] Datas de atualização verificadas

### 2. Cálculos
- [ ] Margens de erro calculadas corretamente
- [ ] Proporções somam 100% quando aplicável
- [ ] Correlações têm valor r documentado

### 3. Comparação
- [ ] Resultados plausíveis vs. pesquisas reais
- [ ] Não há outliers inexplicáveis
- [ ] Tendências consistentes com contexto

### 4. Metodologia
- [ ] Tamanho da amostra adequado
- [ ] Critérios de seleção documentados
- [ ] Limitações explicitadas

### 5. Anti-Alucinação
- [ ] Nenhum dado inventado
- [ ] Nenhum nome de pessoa real não-pública
- [ ] Projeções marcadas como "estimativa"
```

---

## Estrutura de Dados Verificáveis

### Formato de Citação de Dado

```json
{
  "valor": "28%",
  "descricao": "Intenção de voto Celina Leão",
  "fonte": "Simulação INTEIA",
  "data_coleta": "2026-01-25",
  "metodologia": "1.000 agentes sintéticos",
  "confianca": "95%",
  "margem_erro": "±3,1%",
  "validacao": "Comparado com Paraná Pesquisas Jan/2026",
  "caminho_dados": [
    "TSE - Eleitorado DF 2024",
    "IBGE - Censo 2022",
    "Proporções aplicadas aos agentes",
    "Simulação de entrevistas",
    "Agregação de resultados"
  ]
}
```

---

## Registro de Processamento

### Pipeline de Dados

```
1. COLETA
   ├── TSE: Zonas eleitorais, resultados 2022
   ├── IBGE: Demografia DF
   └── Pesquisas: Baseline de intenção

2. PROCESSAMENTO
   ├── Normalização de categorias
   ├── Cálculo de proporções
   └── Geração de distribuições

3. APLICAÇÃO
   ├── Criação de 1.000 personas
   ├── Atribuição de 60+ atributos
   └── Calibração com dados reais

4. SIMULAÇÃO
   ├── Entrevistas com agentes IA
   ├── Coleta de respostas
   └── Agregação estatística

5. VALIDAÇÃO
   ├── Comparação com pesquisas reais
   ├── Verificação de outliers
   └── Ajuste se necessário
```

---

## Limitações Declaradas

### O que a metodologia NÃO faz:
1. Não substitui pesquisas presenciais tradicionais
2. Não captura eventos em tempo real
3. Não prevê com certeza resultados eleitorais
4. Não representa preferências individuais reais

### O que a metodologia FAZ:
1. Simula comportamento agregado baseado em dados reais
2. Identifica tendências e correlações
3. Permite testes de cenários hipotéticos
4. Complementa inteligência de campanha

---

## Selo de Verificação

```
╔════════════════════════════════════════════════════╗
║           INTEIA - VERIFICAÇÃO DE DADOS            ║
╠════════════════════════════════════════════════════╣
║ Status: ✓ VERIFICADO                               ║
║ Data: [DATA]                                       ║
║ Responsável: Igor Morais Vasconcelos               ║
║ Fontes: TSE, IBGE, Pesquisas Públicas              ║
║ Trilha: Documentada                                ║
║ Anti-Alucinação: Confirmado                        ║
╚════════════════════════════════════════════════════╝
```
