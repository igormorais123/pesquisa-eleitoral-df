# Estado da Sessão - INTEIA v2.0

## Data: 2026-01-24

## Progresso das Tarefas

| # | Tarefa | Status |
|---|--------|--------|
| 1 | Criar dados de mídia (CSV) | PENDENTE |
| 2 | Criar script de análise de mídia | PENDENTE |
| 3 | Gerar gráficos de mídia | PENDENTE |
| 4 | Reescrever HTML v2.0 completo | PENDENTE |
| 5 | Deploy no GitHub e Render | PENDENTE |

## Arquivos Existentes Lidos

- `relatorio/relatorio-final.html` — HTML v1.0 completo (856 linhas)
- `dados/pesquisas_eleitorais.csv` — 19 registros de pesquisas eleitorais (Jul/2024 - Dez/2025)
- `dados/eventos_timeline.json` — 18 eventos políticos com impacto
- `scripts/analise_completa.py` — Script Python com 10 funções de gráficos (587 linhas)
- `graficos/01_*.png` a `10_*.png` — 10 gráficos existentes

## Estrutura do Projeto

```
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\
├── dados/
│   ├── pesquisas_eleitorais.csv
│   └── eventos_timeline.json
├── scripts/
│   └── analise_completa.py
├── graficos/
│   ├── 01_evolucao_linhas.png
│   ├── 02_barras_institutos.png
│   ├── 03_area_tendencia.png
│   ├── 04_radar_metricas.png
│   ├── 05_waterfall_variacoes.png
│   ├── 06_dispersao_correlacao.png
│   ├── 07_boxplot_institutos.png
│   ├── 08_comparativo_candidatos.png
│   ├── 09_pre_pos_mkt.png
│   └── 10_timeline_eventos.png
└── relatorio/
    └── relatorio-final.html
```

## Plano de Execução Pendente

### Etapa 1: Dados de Mídia
- Criar `dados/midia_presenca.csv` com estimativas mensais:
  - Volume de menções na imprensa
  - Posts em redes sociais
  - Sentimento (pos/neg/neutro)
  - Seguidores estimados (Instagram 197K, X 14K, TikTok 3.4K)

### Etapa 2: Script + Gráficos de Mídia
- Criar `scripts/analise_midia.py`
- Gerar 3 gráficos:
  1. `11_mencoes_midia.png` — Barras empilhadas (menções por mês)
  2. `12_midia_vs_votos.png` — Dual-axis (mídia × intenção de voto)
  3. `13_heatmap_sentimento.png` — Heatmap de sentimento por período

### Etapa 3: HTML v2.0
Reescrever `relatorio/relatorio-final.html` com:
- Logo INTEIA com destaque em "IA" (int·EIA ou INT**EIA**)
- Sidebar lateral fixa com marca "INTEIA" estilo periódico
- Cabeçalho do autor:
  - Igor Morais Vasconcelos PhD IDP
  - Administração Pública - Direito - Economia - Política - Ensino
  - Inteligência Artificial
  - INTEIA
- Design inspirado em Claude (gradients suaves, tipografia moderna)
- Seção de análise de mídia com novos gráficos
- Botão de download/print (window.print() com CSS @media print)
- Chat com IA (Anthropic API client-side, Claude Opus 4.5)
- Imagens base64 embutidas (standalone)
- Links: Instagram (@igormorais123), Lattes, GitHub OpenCode Academy
- Texto revisado e corrigido

### Etapa 4: Deploy
- Criar repo GitHub via MCP github
- Push dos arquivos
- Deploy no Render como static site via MCP render
- Retornar URL pública

## Dados-Chave para Referência

- **Média geral**: 38.4%
- **Pré-MKT (Jul-Dez 2024)**: 26.0%
- **Pós-MKT (Jan 2025-Jan 2026)**: 39.9%
- **Variação**: +13.9 p.p.
- **Pico**: 54% (Set/2025)
- **Institutos**: Paraná Pesquisas (10), Real Time Big Data (5), Instituto Opinião (1), Colectta (2)
- **Total pesquisas**: 18 registros no CSV (inclui múltiplos cenários)

## Redes Sociais (para seção de mídia)
- Instagram: @igormorais123 — 197K seguidores
- X (Twitter): 14K seguidores
- TikTok: 3.4K seguidores

## Transcript Completo
Arquivo JSONL: C:\Users\igorm\.claude\projects\C--Users-igorm\ae46789c-c956-4a36-b57b-b4a809ec7ae4.jsonl
