# PLANO DE PESQUISA E TRABALHO
## Análise de Intenção de Voto - Celina Leão (Governador DF)
### Janeiro/2024 - Janeiro/2026

---

## 1. OBJETIVO DO PROJETO

Produzir um relatório de inteligência estratégica completo analisando a evolução da intenção de voto de **Celina Leão** para o cargo de **Governador do Distrito Federal**, correlacionando com investimentos em marketing realizados a partir de janeiro/2025.

---

## 2. ESCOPO DA PESQUISA

### 2.1 Período de Análise
- **Início:** Janeiro de 2024
- **Fim:** Janeiro de 2026
- **Período crítico:** Janeiro/2025 (início investimento MKT)

### 2.2 Dados a Coletar

| Categoria | Fonte | Frequência |
|-----------|-------|------------|
| Pesquisas eleitorais | Institutos (Datafolha, Ipec, Real Time Big Data, Paraná Pesquisas, Atlas, Quaest, etc.) | Por pesquisa |
| Presença na mídia | Portais de notícias, jornais | Mensal |
| Redes sociais | Instagram, Twitter/X, Facebook | Mensal |
| Eventos políticos | Notícias, timeline | Por evento |
| Dados de MKT | Estimativas públicas | Mensal |

---

## 3. METODOLOGIA

### 3.1 Coleta de Dados
1. **Web scraping** de resultados de pesquisas eleitorais
2. **Busca sistemática** em portais de notícias
3. **Análise de tendências** de menções em redes
4. **Compilação de timeline** de eventos relevantes

### 3.2 Análise
1. Consolidação de dados por instituto
2. Cálculo de médias ponderadas
3. Análise de tendência temporal
4. Correlação com eventos e investimentos
5. Teste da hipótese principal

### 3.3 Visualização
Mínimo de 6 tipos de gráficos:
1. **Barras** - Comparativo por instituto
2. **Linhas** - Evolução temporal
3. **Área** - Tendência acumulada
4. **Radar** - Múltiplas métricas
5. **Dispersão** - Correlação MKT x Votos
6. **Waterfall** - Variações período a período
7. **Timeline** - Eventos marcantes

---

## 4. PRODUTOS A ENTREGAR

### 4.1 Documentos
| Produto | Formato | Descrição |
|---------|---------|-----------|
| Plano de Pesquisa | .md | Este documento |
| Base de Dados | .csv/.json | Dados brutos consolidados |
| Relatório Final | .html | Documento principal interativo |
| Relatório PDF | .pdf | Versão para impressão |
| Gráficos | .png/.svg | Visualizações individuais |

### 4.2 Estrutura do Relatório Final

```
1. SUMÁRIO EXECUTIVO
   - Principais findings
   - Conclusão sobre hipótese

2. METODOLOGIA
   - Fontes utilizadas
   - Período de análise

3. CONTEXTO POLÍTICO DF
   - Cenário 2024-2026
   - Principais candidatos

4. ANÁLISE DE PESQUISAS
   - Por instituto
   - Média consolidada
   - Tendência temporal

5. ANÁLISE DE MÍDIA
   - Presença na imprensa
   - Volume de menções
   - Sentimento (se disponível)

6. CORRELAÇÃO MKT x VOTOS
   - Análise pré/pós investimento
   - Gráficos de correlação
   - Conclusões

7. EVENTOS RELEVANTES
   - Timeline anotada
   - Impacto nas pesquisas

8. DADOS BRUTOS
   - Tabelas completas
   - Fontes e referências

9. CONCLUSÕES
   - Validação da hipótese
   - Insights estratégicos
   - Recomendações
```

---

## 5. CRONOGRAMA DE EXECUÇÃO

### Fase 1: Setup (ATUAL)
- [x] Criar estrutura de pastas
- [x] Criar plano de pesquisa
- [ ] Configurar ambiente Python

### Fase 2: Coleta de Dados
- [ ] Pesquisar pesquisas eleitorais DF 2024-2026
- [ ] Coletar dados de mídia
- [ ] Mapear eventos relevantes
- [ ] Estruturar dados coletados

### Fase 3: Processamento
- [ ] Consolidar em base única
- [ ] Calcular métricas
- [ ] Identificar padrões

### Fase 4: Visualização
- [ ] Criar scripts de gráficos
- [ ] Gerar todas visualizações
- [ ] Ajustar design

### Fase 5: Relatório
- [ ] Redigir análises
- [ ] Montar documento final
- [ ] Revisar e formatar

---

## 6. RECURSOS TÉCNICOS

### Ferramentas
- Python (pandas, matplotlib, plotly, seaborn)
- Web scraping (requests, BeautifulSoup)
- HTML/CSS para relatório
- Markdown para documentação

### Estrutura de Pastas
```
/pesquisa-eleitoral-df/
├── init.md
├── plano-pesquisa.md
├── dados/
│   ├── pesquisas.csv
│   ├── midia.csv
│   └── eventos.json
├── scripts/
│   └── analise.py
├── graficos/
│   └── [visualizações]
└── relatorio/
    ├── relatorio-final.html
    └── assets/
```

---

## 7. HIPÓTESE A TESTAR

> **H1:** A partir de janeiro/2025, observou-se crescimento significativo na intenção de voto de Celina Leão, correlacionado com o aumento de investimentos em marketing político.

### Métricas de Validação
- Variação % pré/pós jan/2025
- Correlação entre métricas de mídia e intenção de voto
- Análise de tendência (slope)

---

## 8. ASSINATURA

**INTEIA - Inteligência Estratégica**
Igor Morais Vasconcelos
Data: 2026-01-24

---

*Este documento será atualizado conforme progresso do projeto.*
