# INTEIA | Relatório de Inteligência Estratégica

## Caso BRB-Master: Cenários para Ibaneis Rocha e Celina Leão

**Sistema HELENA** — Human-Enhanced Learning and Evaluation Neural Architecture

---

## 📊 Visão Geral

Este relatório apresenta análise preditiva baseada em metodologia científica rigorosa para avaliar os cenários políticos do Distrito Federal em 2026, considerando o impacto do escândalo BRB/Banco Master.

### Metodologias Utilizadas

1. **Regressão Temporal** — Modelo de regressão linear sobre séries históricas de pesquisas eleitorais
2. **Simulação de Monte Carlo** — 10.000 iterações com distribuição normal
3. **Agentes Sintéticos** — 10.000 eleitores virtuais estratificados em 6 perfis ideológicos
4. **Árvore Bayesiana** — Modelagem de cenários com probabilidades a priori

---

## 📈 Principais Resultados

| Métrica | Valor |
|---------|-------|
| Projeção Celina (Out/2026) | **44.1%** |
| Projeção Ibaneis Senado | **23.2%** |
| Prob. Eleição Monte Carlo | **37.4%** |
| Prob. Operação PF | **65%** |
| Perda máxima (impacto alto) | **-8.6pp** |

---

## 🗂️ Estrutura do Projeto

```
inteia-ibaneis-celina-2026/
├── index.html          # Relatório interativo principal
├── README.md           # Este arquivo
├── data/
│   ├── pesquisas.json  # Dados das pesquisas eleitorais
│   └── agentes.json    # Configuração dos agentes sintéticos
└── assets/
    └── logo.svg        # Logo INTEIA
```

---

## 🚀 Como Visualizar

### Localmente
```bash
# Abrir diretamente no navegador
open index.html
# ou
start index.html  # Windows
```

### Deploy (Vercel/Netlify)
O projeto é estático e pode ser deployado em qualquer plataforma de hospedagem estática.

---

## 📋 Fontes de Dados

- **Pesquisas Eleitorais:** Paraná Pesquisas, Real Time Big Data (Mar-Dez/2025)
- **Análise Documental:** 47 fontes jornalísticas
- **Jurisprudência:** STF/STJ sobre foro privilegiado (2020-2025)

---

## ⚠️ Limitações

- Dados de pesquisas possuem margens de erro (±2.5-3.0pp)
- Probabilidades bayesianas são estimativas qualitativas
- Agentes sintéticos são simplificações do comportamento eleitoral
- Eventos jurídicos são intrinsecamente imprevisíveis

---

## 📄 Licença

Documento confidencial - Uso interno INTEIA

---

**INTEIA — Instituto de Treinamento e Estudos em Inteligência Artificial**  
Brasília/DF — 28 de janeiro de 2026
