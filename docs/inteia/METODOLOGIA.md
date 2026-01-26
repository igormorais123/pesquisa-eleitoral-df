# Metodologia INTEIA - Pesquisa Eleitoral com Agentes de IA

## Visão Geral

A metodologia INTEIA utiliza **agentes de IA sintéticos** calibrados com dados reais para simular comportamento eleitoral. Cada agente possui **60+ atributos** que determinam sua persona e respostas.

---

## Validação Estatística

| Parâmetro | Valor | Fonte |
|-----------|-------|-------|
| **Tamanho da Amostra** | 1.000 eleitores | Calculado para DF |
| **Nível de Confiança** | 95% | Padrão acadêmico |
| **Margem de Erro** | ±3,1 pontos | Fórmula: 1.96 × √(p×(1-p)/n) |
| **Cobertura Geográfica** | 33 RAs | Todas as Regiões Administrativas |
| **Proporcionalidade** | Sim | Baseada em população TSE/IBGE |

---

## As 60+ Categorias dos Agentes Sintéticos

### 1. Dados Demográficos Básicos (10 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 1 | `nome` | string | Gerado por IA |
| 2 | `idade` | int | IBGE - Pirâmide etária DF |
| 3 | `genero` | enum | IBGE - Proporção por gênero |
| 4 | `cor_raca` | enum | IBGE - Autodeclaração |
| 5 | `estado_civil` | enum | IBGE - Estado civil |
| 6 | `regiao_administrativa` | enum | TSE - Zonas eleitorais |
| 7 | `tipo_moradia` | enum | Censo IBGE |
| 8 | `tempo_residencia` | int | Estimado |
| 9 | `naturalidade` | enum | IBGE - Migração |
| 10 | `possui_dependentes` | bool | PNAD |

### 2. Dados Socioeconômicos (12 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 11 | `cluster_socioeconomico` | enum | ABEP + IBGE |
| 12 | `escolaridade` | enum | PNAD Contínua |
| 13 | `renda_familiar` | range | PNAD - Faixas salariais |
| 14 | `ocupacao` | string | CBO - Classificação |
| 15 | `situacao_emprego` | enum | PNAD - Mercado trabalho |
| 16 | `setor_economia` | enum | RAIS |
| 17 | `possui_imovel` | bool | Censo |
| 18 | `possui_veiculo` | bool | DENATRAN |
| 19 | `acesso_internet` | enum | PNAD TIC |
| 20 | `tipo_plano_saude` | enum | ANS |
| 21 | `nivel_endividamento` | enum | SPC/Serasa |
| 22 | `recebe_beneficio_social` | bool | CadÚnico |

### 3. Dados Políticos (15 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 23 | `orientacao_politica` | enum | Datafolha histórico |
| 24 | `posicao_espectro` | int (-5 a +5) | Escala esquerda-direita |
| 25 | `interesse_politico` | enum | Latinobarómetro |
| 26 | `participacao_eleitoral` | enum | TSE - Comparecimento |
| 27 | `voto_2022_presidente` | enum | TSE - Resultado |
| 28 | `voto_2022_governador` | enum | TSE - Resultado |
| 29 | `avaliacao_governo_federal` | enum | Datafolha |
| 30 | `avaliacao_governo_local` | enum | Pesquisas locais |
| 31 | `partido_preferencia` | enum | TSE - Filiações |
| 32 | `rejeicao_partidaria` | list | Pesquisas eleitorais |
| 33 | `pauta_prioritaria_1` | enum | Pesquisas qualitativas |
| 34 | `pauta_prioritaria_2` | enum | Pesquisas qualitativas |
| 35 | `pauta_prioritaria_3` | enum | Pesquisas qualitativas |
| 36 | `posicao_aborto` | enum | Datafolha |
| 37 | `posicao_armamento` | enum | Datafolha |

### 4. Dados Psicográficos (10 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 38 | `valores_principais` | list | Pesquisa de valores |
| 39 | `medos_principais` | list | Pesquisa qualitativa |
| 40 | `aspiracoes` | list | Pesquisa qualitativa |
| 41 | `estilo_decisao` | enum | Modelo comportamental |
| 42 | `abertura_mudanca` | enum | Big Five adaptado |
| 43 | `nivel_autoritarismo` | enum | Escala F adaptada |
| 44 | `confianca_institucional` | enum | Latinobarómetro |
| 45 | `percepcao_corrupcao` | enum | Transparency Int. |
| 46 | `otimismo_futuro` | enum | Pesquisa qualitativa |
| 47 | `identidade_regional` | enum | Pesquisa qualitativa |

### 5. Comportamento Informacional (8 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 48 | `fontes_informacao` | list | Reuters Institute |
| 49 | `redes_sociais_uso` | list | PNAD TIC |
| 50 | `frequencia_tv` | enum | Kantar IBOPE |
| 51 | `frequencia_radio` | enum | Kantar IBOPE |
| 52 | `frequencia_jornal` | enum | ANJ |
| 53 | `grupos_whatsapp` | int | Estimado |
| 54 | `susceptibilidade_fake` | enum | Pesquisa acadêmica |
| 55 | `verificacao_fatos` | enum | Pesquisa acadêmica |

### 6. Vieses Cognitivos (5 atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 56 | `vieses_cognitivos` | list | Literatura psicologia |
| 57 | `efeito_manada` | enum | Experimentos |
| 58 | `ancoragem` | enum | Experimentos |
| 59 | `confirmacao` | enum | Experimentos |
| 60 | `disponibilidade` | enum | Experimentos |

### 7. Religião e Cultura (5+ atributos)

| # | Atributo | Tipo | Fonte de Calibração |
|---|----------|------|---------------------|
| 61 | `religiao` | enum | IBGE - Censo religião |
| 62 | `pratica_religiosa` | enum | Datafolha |
| 63 | `denominacao` | string | Censo religioso |
| 64 | `influencia_religiosa_voto` | enum | Pesquisa qualitativa |
| 65 | `consumo_cultural` | list | POF/IBGE |

---

## Cruzamentos Demográficos Disponíveis

### Por Região Administrativa
- Aprovação por RA (33 regiões)
- Intenção de voto por RA
- Rejeição por RA
- Conhecimento do candidato por RA

### Por Perfil Demográfico
- Gênero × Idade × Classe Social
- Escolaridade × Renda × Ocupação
- Religião × Região × Orientação Política
- Faixa Etária × Fontes de Informação

### Correlações Estatísticas
- Coeficiente de Pearson (r) para variáveis contínuas
- Chi-quadrado para variáveis categóricas
- Regressão logística para predição de voto

---

## Trilha de Auditoria

### Fontes de Dados Primários

| Fonte | Tipo | URL/Referência |
|-------|------|----------------|
| TSE | Resultados eleitorais | dados.tse.jus.br |
| IBGE | Censo/PNAD | ibge.gov.br |
| Datafolha | Pesquisas de opinião | datafolha.folha.uol.com.br |
| ABEP | Critério Brasil | abep.org |
| ANS | Planos de saúde | ans.gov.br |

### Processo de Calibração

1. **Coleta**: Download de dados públicos oficiais
2. **Processamento**: Limpeza e normalização
3. **Distribuição**: Aplicação de proporções às personas
4. **Validação**: Comparação com pesquisas reais
5. **Ajuste**: Fine-tuning dos agentes de IA

### Garantia Anti-Alucinação

- [ ] Dados baseados em fontes oficiais documentadas
- [ ] Proporções validadas contra IBGE/TSE
- [ ] Resultados comparados com pesquisas reais
- [ ] Trilha de auditoria completa disponível
- [ ] Metodologia reproduzível e auditável

---

## Citação

```
INTEIA (2026). Metodologia de Pesquisa Eleitoral com Agentes de IA.
Pesquisador Responsável: Igor Morais Vasconcelos.
Amostra: 1.000 eleitores sintéticos | Confiança: 95% | Margem: ±3,1%
```
