# Memória de Longo Prazo - INTEIA

> **Persistência**: Este arquivo mantém conhecimento que deve sobreviver entre sessões.
> Atualizar ao descobrir padrões importantes, soluções recorrentes ou conhecimento valioso.

## Padrões do Projeto

### Backend (FastAPI)

- Endpoints em `backend/app/api/rotas/`
- Schemas Pydantic em `backend/app/esquemas/`
- Serviços em `backend/app/servicos/`
- Convenção: português para nomes, docstrings e comentários

### Frontend (Next.js)

- App Router em `frontend/src/app/`
- Componentes em `frontend/src/components/`
- API client em `frontend/src/services/api.ts`
- Stores Zustand em `frontend/src/stores/`

### Dados

- Eleitores sintéticos: `agentes/banco-eleitores-df.json`
- 1000+ perfis com 60+ atributos cada
- Clusters socioeconômicos: A1, A2, B1, B2, C1, C2, D, E

## Soluções Recorrentes

### Problema: Timeout na API Claude

**Solução**: Usar streaming para respostas longas
```python
async for chunk in response:
    yield chunk
```

### Problema: Build Next.js falha

**Solução**: Verificar imports com `@/` e tipos TypeScript
```bash
npx tsc --noEmit
```

### Problema: CORS em desenvolvimento

**Solução**: Configurar origins no FastAPI
```python
origins = ["http://localhost:3000", "https://inteia.com.br"]
```

## Conhecimento Acumulado

### Sobre Eleitores Sintéticos

- Perfis baseados em dados demográficos reais do DF
- Vieses cognitivos afetam respostas
- Susceptibilidade a desinformação varia por cluster

### Sobre Pesquisa Eleitoral

- Margem de erro padrão: ±3%
- Nível de confiança: 95%
- Amostra mínima recomendada: 400 eleitores

### Sobre Relatórios INTEIA

- Sempre incluir validação estatística
- Pesquisador responsável: Igor Morais
- Formato preferido: HTML com Chart.js

## Pesquisa Premium (Padrão INTEIA)

### Conceito

- **Frontstage (cliente)**: conclusão objetiva + ações + cenários + riscos.
- **Backstage (técnico)**: pacote auditável com dados, validação, red team e premissas.

### Skills e templates

- `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
- `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
- `.claude/skills/insights-estrategicos-preditivos/SKILL.md`
- `.claude/skills/polaris-sdk-pesquisa/SKILL.md`
- `.claude/templates/relatorio-cliente-premium.html`
- `.claude/commands/pesquisa_eleitoral/pesquisa-premium.md`

### Local de pacotes

- `resultados/pesquisas/{slug}_{YYYYMMDD_HHMM}/`

## Gestão de Contexto

- Regra 40%: compilar `SESSAO_TEMP.md` + atualizar `WORK_LOG.md` + commitar e executar `/compact`.
- Regra 60%: STOP (zona burra). Compilar e reiniciar imediatamente.

## Erros Comuns Resolvidos

| Erro | Causa | Solução |
|------|-------|---------|
| `422 Unprocessable Entity` | Schema Pydantic incorreto | Verificar tipos e campos required |
| `Module not found` | Import path errado | Usar `@/` para aliases |
| `Hydration mismatch` | Server/client diferente | Usar `use client` ou dynamic import |

---

*Última atualização: 2026-01-26*
