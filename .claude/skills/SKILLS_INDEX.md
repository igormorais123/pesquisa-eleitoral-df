# SKILLS_INDEX.md - Índice de Skills do Projeto

> **Propósito**: Catálogo central de todas as skills disponíveis para IAs navegarem e utilizarem no projeto Pesquisa Eleitoral DF.

---

## SKILLS DISPONÍVEIS

| Skill | Propósito | Localização |
|-------|-----------|-------------|
| **branding-inteia** | Padrões visuais, cores, logo, estética | `.claude/skills/branding-inteia/` |
| **navegacao-projeto** | Como navegar pelas pastas do projeto | `.claude/skills/navegacao-projeto/` |
| **funcoes-programa** | Como usar as funcionalidades do sistema | `.claude/skills/funcoes-programa/` |
| **criacao-skills** | Boas práticas para criar novas skills | `.claude/skills/criacao-skills/` |

---

## QUANDO USAR CADA SKILL

### branding-inteia
- Criar novos componentes UI
- Definir cores para gráficos
- Usar logo corretamente
- Manter consistência visual

### navegacao-projeto
- Encontrar arquivos específicos
- Entender estrutura do projeto
- Localizar funcionalidades no código
- Início de novas sessões

### funcoes-programa
- Implementar novas features
- Usar APIs do sistema
- Executar scripts de utilidade
- Integrar com Claude API

### criacao-skills
- Criar novas skills
- Documentar conhecimento
- Padronizar processos
- Ensinar outras IAs

---

## ESTRUTURA DE CADA SKILL

Todas as skills seguem o padrão:

```
.claude/skills/{nome-skill}/
└── SKILL.md          # Arquivo principal com instruções
```

---

## COMO USAR SKILLS

### Carregamento Manual

A IA pode ler a skill quando necessário:

```
Ler: .claude/skills/{nome-skill}/SKILL.md
```

### Carregamento Automático

Configurar no CLAUDE.md para carregar skills específicas no início da sessão.

---

## ADICIONANDO NOVAS SKILLS

1. Criar pasta em `.claude/skills/{nome-skill}/`
2. Criar `SKILL.md` seguindo o template em `criacao-skills`
3. Atualizar este índice (`SKILLS_INDEX.md`)
4. Atualizar `CLAUDE.md` do projeto
5. Commitar e pushar

---

## HIERARQUIA DE SKILLS

```
CLAUDE.md (raiz)
└── .claude/skills/
    ├── SKILLS_INDEX.md (este arquivo)
    ├── branding-inteia/
    │   └── SKILL.md
    ├── navegacao-projeto/
    │   └── SKILL.md
    ├── funcoes-programa/
    │   └── SKILL.md
    └── criacao-skills/
        └── SKILL.md
```

---

## RELAÇÃO COM OUTROS ÍNDICES

| Arquivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Instruções gerais do projeto |
| `PROJECT_INDEX.md` | Mapa de arquivos e funções |
| `SKILLS_INDEX.md` | Catálogo de skills (este arquivo) |

---

## ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| Total de Skills | 4 |
| Última Atualização | 2026-01-25 |
| Próxima Revisão | 2026-02-25 |

---

*Índice criado em: 2026-01-25*
*Mantido por: Claude Code*
