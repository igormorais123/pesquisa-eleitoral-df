# Gerar Relatório de Pesquisa

## Objetivo

Criar relatório visual completo seguindo o padrão INTEIA a partir de dados de pesquisa.

## Argumento

`$ARGUMENTS` - Caminho para dados ou nome da pesquisa

## Padrão Visual INTEIA

### Cores Oficiais
```css
--amber: #d69e2e;           /* Cor principal */
--amber-light: #f6e05e;     /* Hover */
--success: #22c55e;         /* Positivo */
--warning: #eab308;         /* Atenção */
--danger: #ef4444;          /* Crítico */
```

### Estrutura Obrigatória

1. **Header Hero** - Logo INTEIA + Título + Badge Confidencial
2. **Conclusão Principal** - Box vermelho com análise da Helena
3. **Recomendações Estratégicas** - Cards priorizados
4. **Validação Estatística** - Amostra, margem, confiança
5. **KPIs** - 4 cards métricas principais
6. **Mapa de Palavras** - Word cloud
7. **Gráficos** - Chart.js interativos
8. **Análise do Agente** - Helena com mensagens
9. **Pesquisador Responsável** - Igor Morais
10. **Footer** - CNPJ, endereço

### Componentes Padrão

```html
<!-- Logo -->
<div class="logo-box">IA</div>
<span class="logo-name">INTE<span class="highlight">IA</span></span>

<!-- Pesquisador -->
<div class="researcher-card">
    <div class="researcher-avatar">IM</div>
    <div class="researcher-info">
        <h3>Igor Morais Vasconcelos</h3>
        <div class="role">Pesquisador Responsável | Presidente INTEIA</div>
    </div>
</div>

<!-- Helena -->
<div class="helena-header">
    <div class="helena-avatar"><!-- SVG --></div>
    <h3>Helena Montenegro</h3>
    <p>Agente de Sistemas de IA Avançados</p>
</div>
```

### Funcionalidades Obrigatórias

- [ ] Tema claro/escuro com toggle
- [ ] Botão imprimir A4
- [ ] Sidebar lateral fixa
- [ ] Responsivo
- [ ] Chart.js para gráficos
- [ ] Google Fonts Inter

## Processo de Geração

### 1. Carregar Dados
```python
import json
dados = json.load(open(f'{caminho}/dados.json'))
```

### 2. Calcular Métricas
- Total de entrevistados
- Distribuição de respostas
- Segmentações (idade, região, gênero)
- Tendências temporais

### 3. Gerar Análise IA
Usar Claude para gerar:
- Conclusão principal
- Recomendações estratégicas
- Insights por segmento

### 4. Renderizar HTML
Usar template base em:
`frontend/public/resultados-stress-test/index.html`

### 5. Salvar Relatório
```
frontend/public/resultados-{nome}/
├── index.html
├── dados.json
└── assets/
    └── charts/
```

## Footer Padrão

```
INTEIA - Inteligência Estratégica
CNPJ: 63.918.490/0001-20
SHN Quadra 2 Bloco F, Sala 625/626 - Brasília/DF
inteia.com.br | igor@inteia.com.br
© 2026 INTEIA. Todos os direitos reservados.
```

## Exemplo de Uso

```
/gerar-relatorio frontend/public/resultados-governador-2026
/gerar-relatorio pesquisa-celina-leao
```
