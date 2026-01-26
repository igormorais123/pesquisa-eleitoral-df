# Prime: Carregar Contexto do Projeto INTEIA

## Objetivo

Construir compreensão completa do codebase analisando estrutura, documentação e arquivos-chave do sistema de Pesquisa Eleitoral DF 2026.

## Processo

### 1. Analisar Estrutura do Projeto

```bash
# Listar arquivos rastreados
git ls-files | head -100

# Estrutura de diretórios
tree -L 3 -I "node_modules|__pycache__|.git|dist|.next"
```

### 2. Ler Documentação Core

Ler na seguinte ordem:
1. `CLAUDE.md` - Instruções gerais e regras
2. `PROJECT_INDEX.md` - Mapa do projeto
3. `GPS_NAVEGACAO_AGENTES.md` - Guia de navegação
4. `.claude/skills/SKILLS_INDEX.md` - Skills disponíveis
5. `README.md` - Visão geral

### 3. Identificar Arquivos-Chave

**Backend (FastAPI)**:
- `backend/app/main.py` - Entry point
- `backend/app/core/config.py` - Configurações
- `backend/app/api/rotas/` - Endpoints
- `backend/app/servicos/claude_servico.py` - Integração Claude API

**Frontend (Next.js)**:
- `frontend/src/app/` - App Router
- `frontend/src/components/` - Componentes React
- `frontend/src/lib/claude/` - Cliente Claude
- `frontend/src/services/api.ts` - Cliente API

**Dados & Scripts**:
- `agentes/banco-eleitores-df.json` - Banco de eleitores sintéticos
- `scripts/gerar_eleitores_df_v4.py` - Geração de eleitores
- `scripts/pesquisa_governador_2026.py` - Simulação de pesquisa

### 4. Entender Estado Atual

```bash
# Histórico recente
git log --oneline -10

# Status do repositório
git status

# Branch atual
git branch --show-current
```

## Formato de Saída

Entregar relatório estruturado com:

### Visão Geral do Projeto
- Propósito: Sistema de pesquisa eleitoral com agentes IA sintéticos
- Stack: Next.js 14 + FastAPI + PostgreSQL + Claude API
- Versão atual e estado

### Arquitetura
- Estrutura de diretórios e propósitos
- Padrões de código identificados
- Fluxo de dados principal

### Stack Técnico
- Linguagens: TypeScript, Python
- Frameworks: Next.js 14, FastAPI, SQLAlchemy
- IA: Anthropic Claude (Opus 4.5, Sonnet 4)
- Banco: PostgreSQL 15

### Princípios Core
- Português brasileiro obrigatório
- Execução autônoma sem confirmações
- Padrão visual INTEIA (cores âmbar)
- Validação estatística em relatórios

### Estado Atual
- Branch ativa
- Mudanças recentes
- Observações importantes

## Notas

- Foco em bullets concisos e escaneáveis
- Identificar pontos de integração com Claude API
- Mapear fluxo completo: Eleitor → Entrevista → Resultado
