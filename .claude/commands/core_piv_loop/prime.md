# Prime: Carregar Contexto do Projeto INTEIA

## Objetivo

Construir compreensão completa do codebase analisando estrutura, documentação e arquivos-chave. Este comando deve ser executado no **início de cada sessão** ou após reset de memória.

## Processo

### 1. Verificar Contexto Persistente

**PRIMEIRO**, ler arquivos de contexto persistente:
```
.context/context.md   → Objetivo e regras
.context/todos.md     → Progresso atual
.context/insights.md  → Descobertas anteriores
```

### 2. Analisar Estrutura do Projeto

```bash
# Listar arquivos rastreados
git ls-files | head -100

# Estrutura de diretórios (se tree disponível)
tree -L 3 -I "node_modules|__pycache__|.git|dist|.next" || find . -type d -maxdepth 3

# Estado do git
git status
git log --oneline -5
```

### 3. Ler Documentação Core (em ordem)

| Prioridade | Arquivo | Conteúdo |
|------------|---------|----------|
| 1 | `CLAUDE.md` | Regras globais obrigatórias |
| 2 | `.claude/PRD.md` | Requisitos do produto |
| 3 | `PROJECT_INDEX.md` | Mapa do projeto |
| 4 | `.claude/skills/SKILLS_INDEX.md` | Skills disponíveis |

### 4. Identificar Arquivos-Chave por Domínio

**Backend (FastAPI)**:
- `backend/app/main.py` - Entry point
- `backend/app/core/config.py` - Configurações
- `backend/app/api/rotas/` - Endpoints
- `backend/app/servicos/claude_servico.py` - Integração Claude API

**Frontend (Next.js)**:
- `frontend/src/app/` - App Router
- `frontend/src/components/` - Componentes React
- `frontend/src/services/api.ts` - Cliente API

**Dados**:
- `agentes/banco-eleitores-df.json` - 1000+ eleitores sintéticos

### 5. Carregar Regras Modulares (sob demanda)

| Tarefa | Carregar |
|--------|----------|
| Trabalhar com API | `.claude/rules/api.md` |
| Criar componentes | `.claude/rules/components.md` |
| Review de segurança | `.claude/rules/seguranca.md` |

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════╗
║                    CONTEXTO CARREGADO                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  PROJETO: Pesquisa Eleitoral DF 2026                          ║
║  VERSÃO: X.X.X                                                 ║
║  BRANCH: [branch atual]                                        ║
║                                                                ║
║  STACK                                                         ║
║  ├── Frontend: Next.js 14, TypeScript, Tailwind               ║
║  ├── Backend: FastAPI, SQLAlchemy, Pydantic                   ║
║  ├── Banco: PostgreSQL 15                                      ║
║  └── IA: Claude API (Opus 4.5, Sonnet 4)                      ║
║                                                                ║
║  REGRAS FUNDAMENTAIS                                           ║
║  ├── 🇧🇷 Português brasileiro SEMPRE                          ║
║  ├── ⚡ Execução autônoma sem confirmações                     ║
║  ├── 🎨 Padrão visual INTEIA (âmbar #d69e2e)                  ║
║  └── 📊 Validação estatística obrigatória                     ║
║                                                                ║
║  PROGRESSO (de .context/todos.md)                              ║
║  ├── ✅ Concluídas: X tarefas                                  ║
║  ├── 🔄 Em progresso: Y tarefas                                ║
║  └── 📋 Pendentes: Z tarefas                                   ║
║                                                                ║
║  MUDANÇAS RECENTES                                             ║
║  ├── [commit 1]                                                ║
║  ├── [commit 2]                                                ║
║  └── [commit 3]                                                ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Instruções Pós-Reset

Se a memória foi resetada durante uma tarefa:

1. ✅ Ler `.context/context.md`
2. ✅ Ler `.context/todos.md`
3. ✅ Verificar `git status`
4. ✅ Continuar de onde parou

## Comandos Relacionados

| Comando | Próximo Passo |
|---------|---------------|
| `/plan-feature` | Após entender contexto, planejar nova feature |
| `/execute` | Se já existe plano aprovado |
| `/validate` | Verificar estado do código |

## Exemplo de Uso

```
/prime
```

Executar no início de TODA sessão de desenvolvimento.
