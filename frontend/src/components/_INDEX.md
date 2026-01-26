# Components - React Components

> **GPS IA**: Componentes React organizados por dominio

## Estrutura

```
components/
├── ui/           <- Componentes base (shadcn/ui)
├── layout/       <- Header, Sidebar, MobileNav
├── charts/       <- Graficos e visualizacoes
├── eleitores/    <- Componentes de eleitores
├── agentes/      <- Filtros e insights de agentes
├── candidatos/   <- Cards, lista, formulario
├── entrevistas/  <- Execucao de entrevistas
├── resultados/   <- Dashboard, analises, insights
├── parlamentares/ <- Lista e filtros de parlamentares
├── gestores/     <- Entrevistas com gestores
├── cenarios/     <- Simulador de cenarios
├── templates/    <- Seletores de templates
├── validacao/    <- Validacao estatistica
├── estimativas/  <- Previsoes e agregados
├── analysis/     <- Analises automaticas
├── dashboard/    <- Dashboard geral
├── alertas/      <- Alertas proativos
├── mapa/         <- Mapas do DF
├── search/       <- Busca global
├── ai/           <- Editor de prompts
├── providers/    <- ThemeProvider, etc
└── swing-voters/ <- Analise de indecisos
```

## Componentes Chave por Pasta

### ui/ (shadcn/ui)
button, card, input, select, dialog, tabs, table, badge, checkbox, label, progress, slider, switch, textarea, tooltip, scroll-area, alert-dialog, skeleton

### layout/
- `Header.tsx` - Barra superior
- `Sidebar.tsx` - Menu lateral
- `MobileNav.tsx` - Navegacao mobile

### charts/
- `MapaCalorDF.tsx` - Mapa de calor do DF
- `MapaCalorEmocional.tsx` - Sentimentos
- `WordCloud.tsx` - Nuvem de palavras
- `RadarChartPerfil.tsx` - Perfil radar
- `PiramideEtaria.tsx` - Piramide etaria
- `Heatmap.tsx` - Mapa de calor generico
- `SankeyDiagram.tsx` - Fluxo de votos
- `GraficoDinamico.tsx` - Grafico configuravel

### resultados/
- `DashboardConsolidado.tsx` - Dashboard principal
- `InsightsPanel.tsx` - Painel de insights
- `ChatResultados.tsx` - Chat com IA sobre resultados
- `CaixaVotoSilencioso.tsx` - Votos silenciosos
- `CaixaPontoRuptura.tsx` - Pontos de ruptura

### agentes/
- `AgentesFilters.tsx` - Filtros avancados
- `AgentesCharts.tsx` - Graficos de distribuicao
- `AgentesInsights.tsx` - Insights automaticos
- `MapaDF.tsx` - Mapa do DF por regiao
