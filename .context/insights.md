# Insights Acumulados - INTEIA

> Descobertas e aprendizados que persistem entre sessões.

## Resumo Executivo

O projeto Pesquisa Eleitoral DF 2026 usa agentes IA sintéticos para simular respostas de eleitores. Principais insights:

1. **Eleitores sintéticos** com 60+ atributos permitem respostas realistas
2. **Estratificação** por região/classe/idade essencial para representatividade
3. **Padrão visual INTEIA** (âmbar) cria identidade forte
4. **Helena** como agente de análise aumenta percepção de valor

## Descobertas Técnicas

### Claude API
- **Sonnet 4** suficiente para entrevistas (custo-benefício)
- **Opus 4.5** reservar para análises complexas
- Prompts com persona completa geram respostas mais consistentes
- Batch de 5 requests simultâneos é limite seguro

### Frontend
- Virtualização essencial para 1000+ eleitores
- Chart.js melhor que Plotly para relatórios (mais leve)
- Tema claro/escuro aumenta usabilidade

### Backend
- SQLite para desenvolvimento, PostgreSQL para produção
- Rate limiting essencial em endpoints de Claude
- Logs estruturados (structlog) facilitam debug

## Padrões que Funcionam

### Estrutura de Relatório
1. Conclusão PRIMEIRO (não no final)
2. Recomendações priorizadas (🔴🟡🟢)
3. Validação estatística visível
4. Helena como "Agente de IA Avançados"
5. Pesquisador responsável (não "técnico")

### Comunicação com Eleitor Sintético
- Usar nome próprio do eleitor
- Incluir região administrativa
- Mencionar classe socioeconômica indiretamente
- Respeitar nível de escolaridade no vocabulário

## Anti-Padrões (O que evitar)

- ❌ Mencionar nomes de candidatos adversários
- ❌ Relatórios sem validação estatística
- ❌ Conclusões vagas sem percentuais
- ❌ Ignorar margem de erro nas análises
- ❌ Prompts genéricos sem persona

## Métricas de Referência

| Métrica | Valor Atual | Meta |
|---------|-------------|------|
| Tempo por entrevista | ~2s | <3s |
| Custo por pesquisa (500) | ~$1.50 | <$2 |
| Cobertura de testes | 70% | 80% |
| Build time | 45s | <60s |

## Próximos Experimentos

1. Testar Claude 3.5 Haiku para entrevistas simples
2. Cache de respostas similares para reduzir custos
3. Análise de sentimento nas respostas
4. Geração automática de word clouds

---

*Atualizar após cada análise significativa ou descoberta importante.*
