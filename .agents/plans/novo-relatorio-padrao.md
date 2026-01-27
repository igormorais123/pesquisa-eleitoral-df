# Plano: Criar Novo Relatório Padrão INTEIA

## Descrição

Criar um novo relatório de pesquisa seguindo todos os padrões visuais e estruturais da INTEIA.

## User Story

Como analista político, quero gerar relatórios profissionais padronizados para apresentar resultados de pesquisas aos candidatos.

## Metadados

- **Tipo**: relatorio
- **Complexidade**: média
- **Sistemas afetados**: frontend
- **Estimativa de arquivos**: 2-3 arquivos

## Referências do Codebase

### Templates de Referência

| Arquivo | Propósito |
|---------|-----------|
| `frontend/public/resultados-stress-test/index.html` | Template completo |
| `Intenção de voto Celina Leao 01.2024-01.2026/relatorio/index.html` | Análise científica |

### Padrões Visuais

Consultar `CLAUDE.md` seção "PADRÃO VISUAL INTEIA":
- Cores: âmbar (#d69e2e), success (#22c55e), danger (#ef4444)
- Tipografia: Inter, hierarquia definida
- Espaçamento: sistema de 4px
- Border radius: sm (6px) a 2xl (24px)

## Estrutura Obrigatória do Relatório

### 1. Header Hero
```html
<header class="hero">
    <div class="logo-container">
        <div class="logo-box">IA</div>
        <span class="logo-name">INTE<span class="highlight">IA</span></span>
    </div>
    <h1>Título da Pesquisa</h1>
    <span class="badge confidencial">Confidencial</span>
</header>
```

### 2. Conclusão Principal (Helena)
```html
<section class="conclusao-principal">
    <div class="alert alert-danger">
        <h2>Conclusão da Análise</h2>
        <p>[Texto direto da Helena sobre os resultados]</p>
    </div>
</section>
```

### 3. Recomendações Estratégicas
```html
<section class="recomendacoes">
    <div class="card urgent">
        <span class="priority">🔴 Urgente</span>
        <h3>Título da Ação</h3>
        <p>Descrição...</p>
    </div>
    <!-- Mais cards: important (🟡), monitor (🟢) -->
</section>
```

### 4. Validação Estatística
```html
<section class="validacao">
    <div class="stats-grid">
        <div class="stat">
            <span class="label">Amostra</span>
            <span class="value">500</span>
        </div>
        <div class="stat">
            <span class="label">Margem de Erro</span>
            <span class="value">±4.4%</span>
        </div>
        <div class="stat">
            <span class="label">Confiança</span>
            <span class="value">95%</span>
        </div>
    </div>
</section>
```

### 5. KPIs
```html
<section class="kpis">
    <div class="kpi-grid">
        <div class="kpi-card">
            <span class="kpi-value">45.2%</span>
            <span class="kpi-label">Candidato Líder</span>
        </div>
        <!-- 3 mais KPIs -->
    </div>
</section>
```

### 6. Gráficos Chart.js
```html
<section class="graficos">
    <canvas id="grafico-intencao"></canvas>
    <canvas id="grafico-segmentos"></canvas>
</section>

<script>
new Chart(ctx, {
    type: 'bar',
    data: {...},
    options: {
        plugins: {
            legend: { display: true }
        }
    }
});
</script>
```

### 7. Análise da Helena
```html
<section class="analise-helena">
    <div class="helena-header">
        <div class="helena-avatar"><!-- SVG --></div>
        <div class="helena-info">
            <h3>Helena Montenegro</h3>
            <p>Agente de Sistemas de IA Avançados</p>
        </div>
    </div>
    <div class="helena-messages">
        <div class="message">[Análise detalhada...]</div>
    </div>
</section>
```

### 8. Pesquisador Responsável
```html
<section class="pesquisador">
    <div class="researcher-card">
        <div class="researcher-avatar">IM</div>
        <div class="researcher-info">
            <h3>Igor Morais Vasconcelos</h3>
            <p>Pesquisador Responsável | Presidente INTEIA</p>
            <p>igor@inteia.com.br | inteia.com.br</p>
        </div>
    </div>
</section>
```

### 9. Footer
```html
<footer>
    <p>INTEIA - Inteligência Estratégica</p>
    <p>CNPJ: 63.918.490/0001-20</p>
    <p>SHN Quadra 2 Bloco F, Sala 625/626 - Brasília/DF</p>
    <p>© 2026 INTEIA. Todos os direitos reservados.</p>
</footer>
```

## Funcionalidades Obrigatórias

### Toggle Tema
```javascript
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
```

### Botão Imprimir
```javascript
function imprimir() {
    window.print();
}
```

```css
@media print {
    .no-print { display: none; }
    .page-break { page-break-before: always; }
    body { font-size: 12pt; }
}
```

## Tarefas

- [ ] Criar pasta `frontend/public/resultados-{nome}/`
- [ ] Copiar template base de `resultados-stress-test/`
- [ ] Substituir dados placeholder pelos dados reais
- [ ] Configurar gráficos Chart.js com dados
- [ ] Testar tema claro/escuro
- [ ] Testar impressão A4
- [ ] Validar responsividade mobile

## Critérios de Aceitação

- [ ] Todas as 9 seções presentes
- [ ] Cores seguem paleta INTEIA
- [ ] Tipografia Inter carregada
- [ ] Tema toggle funcional
- [ ] Impressão formatada
- [ ] Responsivo em mobile
- [ ] Gráficos interativos
- [ ] Footer com CNPJ correto
