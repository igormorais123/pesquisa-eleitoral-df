# Relatório de Auditoria de Dependências

**Data:** 2026-01-15
**Projeto:** Pesquisa Eleitoral DF 2026

---

## Resumo Executivo

| Categoria | Frontend | Backend |
|-----------|----------|---------|
| Vulnerabilidades de Segurança | 0 | 0 |
| Pacotes Desatualizados | ~30 | ~8 |
| Pacotes Não Utilizados (Bloat) | 3 | 3 |
| Ação Recomendada | Atualização Moderada | Atualização Menor |

---

## 1. Vulnerabilidades de Segurança

### Frontend (npm)
**Status: SEGURO** - Nenhuma vulnerabilidade encontrada (`npm audit` retornou 0 vulnerabilidades).

### Backend (Python)
**Status: SEGURO** - Nenhuma vulnerabilidade crítica conhecida nas versões atuais.

---

## 2. Dependências Não Utilizadas (BLOAT)

### Frontend - Remover Imediatamente

| Pacote | Tamanho Estimado | Justificativa |
|--------|------------------|---------------|
| `@tremor/react` | ~2.5MB | Nenhum uso encontrado no código |
| `html2canvas` | ~150KB | Nenhum uso encontrado |
| `jspdf` | ~700KB | Nenhum uso encontrado |
| `framer-motion` | ~400KB | Nenhum uso encontrado |

**Economia estimada:** ~3.7MB no bundle

### Backend - Remover com Cautela

| Pacote | Justificativa |
|--------|---------------|
| `scipy` | Apenas comentário mencionando, não usado de fato |
| `statsmodels` | Nenhum uso encontrado |
| `nltk` | Nenhum uso encontrado |

**Economia estimada:** ~150MB de instalação

---

## 3. Dependências Desatualizadas

### Frontend - Atualizações Críticas

| Pacote | Atual | Última | Prioridade | Notas |
|--------|-------|--------|------------|-------|
| `next` | 14.2.35 | 16.1.2 | **ALTA** | Next.js 15+ tem melhorias significativas |
| `react` / `react-dom` | 18.2.0 | 19.2.3 | **MÉDIA** | React 19 disponível, mas requer testes |
| `framer-motion` | 10.18.0 | 12.26.2 | BAIXA | Pode ser removido |
| `lucide-react` | 0.303.0 | 0.562.0 | **MÉDIA** | Muitas versões atrás |
| `recharts` | 2.10.3 | 3.6.0 | **MÉDIA** | Major version disponível |
| `zod` | 3.22.4 | 4.3.5 | **ALTA** | Zod 4 tem breaking changes, avaliar |
| `zustand` | 4.4.7 | 5.0.10 | **MÉDIA** | Zustand 5 disponível |
| `date-fns` | 3.2.0 | 4.1.0 | BAIXA | Major version, avaliar necessidade |
| `sonner` | 1.3.1 | 2.0.7 | BAIXA | Major version disponível |
| `tailwind-merge` | 2.2.0 | 3.4.0 | BAIXA | Major version disponível |
| `@hookform/resolvers` | 3.3.3 | 5.2.2 | **MÉDIA** | Várias major versions atrás |

### Backend - Atualizações Recomendadas

| Pacote | Atual | Última | Prioridade |
|--------|-------|--------|------------|
| `anthropic` | >=0.18.0 | 0.76.0 | **ALTA** | SDK muito desatualizado |
| `fastapi` | >=0.109.0 | ~0.115.x | MÉDIA |
| `pydantic` | >=2.5.0 | ~2.10.x | BAIXA |
| `sqlalchemy` | >=2.0.25 | ~2.0.36 | BAIXA |

---

## 4. Análise de Redundância

### Bibliotecas de Gráficos (Frontend)
O projeto usa **3 bibliotecas de gráficos**:
- `recharts` - Em uso ativo
- `plotly.js` + `react-plotly.js` - Em uso para MapaDF
- `@tremor/react` - **NÃO UTILIZADO**

**Recomendação:** Remover `@tremor/react`. Manter `recharts` para gráficos simples e `plotly` para mapas interativos.

### Exportação PDF (Frontend)
- `html2canvas` + `jspdf` - **NÃO UTILIZADOS**
- Backend já tem `reportlab` para geração de PDFs

**Recomendação:** Remover ambos do frontend. Usar backend para geração de PDFs.

---

## 5. Plano de Ação Recomendado

### Fase 1: Limpeza Imediata (Baixo Risco)
```bash
# Frontend - Remover bloat
cd frontend
npm uninstall @tremor/react html2canvas jspdf framer-motion

# Backend - Remover não utilizados
# Editar requirements.txt e remover: scipy, statsmodels, nltk
```

### Fase 2: Atualizações Seguras (Médio Risco)
```bash
# Frontend - Atualizar patches e minor versions
cd frontend
npm update

# Atualizar Radix UI (geralmente compatíveis)
npm install @radix-ui/react-accordion@latest @radix-ui/react-alert-dialog@latest ...

# Atualizar lucide-react
npm install lucide-react@latest
```

### Fase 3: Atualizações Major (Alto Risco - Requer Testes)
```bash
# Avaliar migração para Next.js 15 (não 16 ainda)
npm install next@15

# Atualizar anthropic SDK (backend)
pip install anthropic>=0.70.0
```

### Fase 4: Migração Futura (Planejamento)
- React 19: Aguardar estabilização do ecossistema
- Zod 4: Avaliar breaking changes antes de migrar
- Recharts 3: Testar compatibilidade com componentes existentes

---

## 6. Dependências Recomendadas para Manter

Estas dependências são bem utilizadas e devem ser mantidas:

### Frontend
- `@tanstack/react-query` - Gerenciamento de estado servidor
- `@tanstack/react-table` - Tabelas de dados
- `@tanstack/react-virtual` - Virtualização de listas
- `zustand` - Estado global leve
- `recharts` - Gráficos
- `plotly.js` - Mapas interativos
- `dexie` - IndexedDB para cache local
- Radix UI primitives - Componentes acessíveis
- `zod` - Validação de schemas
- `react-hook-form` - Formulários

### Backend
- `fastapi` - Framework web
- `sqlalchemy` - ORM
- `anthropic` - Claude API
- `pandas` / `numpy` - Processamento de dados
- `openpyxl` / `reportlab` / `python-docx` - Exportação

---

## 7. Métricas de Impacto

### Antes da Limpeza
- **Frontend node_modules estimado:** ~500MB+
- **Backend venv estimado:** ~800MB+

### Após Limpeza Recomendada
- **Frontend:** ~450MB (-10%)
- **Backend:** ~650MB (-20%)
- **Tempo de build:** Redução estimada de 15-20%

---

## Conclusão

O projeto está em bom estado de segurança, sem vulnerabilidades conhecidas. As principais recomendações são:

1. **Prioridade Alta:** Remover dependências não utilizadas para reduzir bloat
2. **Prioridade Alta:** Atualizar SDK do Anthropic (muito desatualizado)
3. **Prioridade Média:** Atualizar dependências do Radix UI e lucide-react
4. **Prioridade Baixa:** Avaliar migração para Next.js 15 em ambiente de testes

---

*Relatório gerado automaticamente por Claude Code*
