# Contexto da Sessão - INTEIA

> Este arquivo persiste informações entre sessões e resets de memória.
> **SEMPRE leia este arquivo ao iniciar uma sessão.**

## Objetivo do Projeto

**Pesquisa Eleitoral DF 2026** - Sistema de pesquisa eleitoral usando 1000+ agentes IA sintéticos representando eleitores do Distrito Federal.

## Regras Fundamentais

1. **Português brasileiro** em todas as comunicações
2. **Execução autônoma** sem pedir confirmações
3. **Padrão visual INTEIA** (âmbar #d69e2e) em relatórios
4. **Validação estatística** obrigatória em pesquisas

## Arquivos Críticos para Contexto

| Arquivo | Propósito | Quando Ler |
|---------|-----------|------------|
| `CLAUDE.md` | Regras globais | Início de sessão |
| `.claude/PRD.md` | Requisitos do produto | Antes de implementar features |
| `.context/todos.md` | Progresso atual | Após reset de memória |
| `.context/insights.md` | Descobertas acumuladas | Análises complexas |

## Instruções de Continuação

Após qualquer reset de memória ou início de sessão:

1. **Ler este arquivo** (context.md)
2. **Ler todos.md** para ver progresso atual
3. **Ler insights.md** se análise em andamento
4. **Verificar git status** para mudanças pendentes
5. **Continuar de onde parou**

## Stack Técnico (Referência Rápida)

- **Frontend**: Next.js 14, TypeScript, Tailwind, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Banco**: PostgreSQL 15
- **IA**: Claude API (Opus 4.5 para complexo, Sonnet 4 para volume)
- **Deploy**: Vercel (frontend) + Render (backend)

## URLs de Produção

- Frontend: https://inteia.com.br
- Backend: https://api.inteia.com.br
- Docs API: https://api.inteia.com.br/docs

## Contato do Projeto

- **Responsável**: Igor Morais Vasconcelos
- **Email**: igor@inteia.com.br
- **CNPJ**: 63.918.490/0001-20

---

*Última atualização: 2026-01-26*
