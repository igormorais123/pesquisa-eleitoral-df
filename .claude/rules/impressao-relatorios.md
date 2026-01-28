# Regras de Impressão de Relatórios INTEIA

> Carregar sempre que criar ou editar páginas de relatório com função de impressão.

## Princípios Fundamentais

1. **Uma página só** - Resumos executivos DEVEM caber em 1 página impressa
2. **Orientação flexível** - Funcionar tanto em retrato quanto paisagem
3. **Não alterar layout web** - Apenas CSS @media print

## CSS de Impressão Padrão

```css
@media print {
    /* Margens mínimas */
    @page {
        margin: 4mm;
    }

    /* Fonte base ultra-compacta */
    html, body {
        font-size: 7pt !important;
        line-height: 1.1 !important;
    }

    /* Ocultar elementos não essenciais */
    .sidebar,
    .top-controls,
    .chat-panel,
    .chat-toggle,
    button,
    .no-print {
        display: none !important;
    }

    /* Layout de página única */
    .main-content {
        margin: 0 !important;
        padding: 2mm !important;
        width: 100% !important;
    }

    /* Header compacto */
    .hero-header {
        padding: 2mm !important;
        margin-bottom: 2mm !important;
    }

    .hero-header h1 {
        font-size: 14pt !important;
        margin: 0 !important;
    }

    .hero-header .taglines {
        font-size: 7pt !important;
        margin: 1mm 0 !important;
    }

    /* KPIs compactos */
    .key-points {
        gap: 2mm !important;
        margin: 2mm 0 !important;
    }

    .key-point {
        padding: 2mm !important;
    }

    .key-point .number {
        font-size: 14pt !important;
    }

    .key-point .label {
        font-size: 6pt !important;
    }

    /* Gráficos compactos */
    .charts-grid {
        gap: 2mm !important;
        margin: 2mm 0 !important;
    }

    .chart-card {
        padding: 2mm !important;
    }

    .chart-card h3 {
        font-size: 8pt !important;
        margin-bottom: 1mm !important;
    }

    .chart-container {
        height: 22mm !important;
    }

    /* Recomendações compactas */
    .recs-grid {
        gap: 1.5mm !important;
        margin: 2mm 0 !important;
    }

    .rec-card {
        padding: 2mm !important;
    }

    .rec-card h4 {
        font-size: 7pt !important;
        margin-bottom: 1mm !important;
    }

    .rec-card p {
        font-size: 6pt !important;
        line-height: 1.2 !important;
    }

    /* Executive Summary compacto */
    .executive-summary {
        padding: 2mm !important;
        margin: 2mm 0 !important;
    }

    .executive-summary h2 {
        font-size: 9pt !important;
        margin-bottom: 1mm !important;
    }

    /* Footer compacto */
    .footer,
    footer {
        padding: 1mm !important;
        margin-top: 2mm !important;
        font-size: 5pt !important;
    }

    /* Forçar quebra de página apenas no final */
    * {
        page-break-inside: avoid;
    }

    /* Cores para impressão */
    body {
        background: white !important;
        color: black !important;
    }

    .hero-header,
    .executive-summary,
    .chart-card,
    .rec-card {
        background: #f8fafc !important;
        border: 0.5pt solid #e2e8f0 !important;
    }
}
```

## Hierarquia de Tamanhos de Fonte (Impressão)

| Elemento | Tamanho |
|----------|---------|
| Título principal (h1) | 14pt |
| Números KPI | 14pt |
| Subtítulos (h2) | 9pt |
| Títulos de card (h3, h4) | 7-8pt |
| Texto normal | 7pt |
| Labels, taglines | 6pt |
| Footer | 5pt |

## Espaçamentos (Impressão)

| Elemento | Valor |
|----------|-------|
| Margem da página | 4mm |
| Padding de seções | 2mm |
| Gap entre cards | 1.5-2mm |
| Margin entre seções | 2mm |
| Altura de gráficos | 22mm |

## Checklist de Impressão

- [ ] Página cabe em folha A4 retrato
- [ ] Página cabe em folha A4 paisagem
- [ ] Sidebar oculta na impressão
- [ ] Botões ocultos na impressão
- [ ] Chat oculto na impressão
- [ ] Cores legíveis em preto e branco
- [ ] Gráficos visíveis mas compactos
- [ ] Footer com informações da INTEIA

## Exemplo de Implementação

Ver arquivo de referência:
`frontend/public/resultados-stress-test/resumo.html`

## Notas Importantes

1. **Nunca usar @page size fixo** - Deixar o usuário escolher orientação
2. **Testar ambas orientações** - Retrato e paisagem devem funcionar
3. **Priorizar conteúdo** - Ocultar navegação, manter dados
4. **Fontes legíveis** - Mínimo 5pt para texto crítico
5. **Bordas finas** - 0.5pt para economia de tinta
