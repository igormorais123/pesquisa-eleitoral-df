# SKILLS_INDEX.md - Índice de Skills do Projeto

> **Propósito**: Catálogo central de todas as skills disponíveis para IAs navegarem e utilizarem no projeto Pesquisa Eleitoral DF.

---

## SKILLS DISPONÍVEIS

| Skill | Propósito | Localização |
|-------|-----------|-------------|
| **design-system-inteia** | Design system completo (cores, componentes, layouts) | `.claude/skills/design-system-inteia/` |
| **branding-inteia** | Padrões visuais, cores, logo, estética | `.claude/skills/branding-inteia/` |
| **navegacao-projeto** | Como navegar pelas pastas do projeto | `.claude/skills/navegacao-projeto/` |
| **funcoes-programa** | Como usar as funcionalidades do sistema | `.claude/skills/funcoes-programa/` |
| **criacao-skills** | Boas práticas para criar novas skills | `.claude/skills/criacao-skills/` |
| **templates-relatorios** | Padrão visual e estrutural de relatórios INTEIA | `.claude/skills/templates-relatorios/` |
| **executar-pesquisa-eleitoral** | Executar pesquisas eleitorais via IA (sem UI) | `.claude/skills/executar-pesquisa-eleitoral/` |
| **pesquisa-eleitoral-premium** | Fluxo premium end-to-end (auditável) | `.claude/skills/pesquisa-eleitoral-premium/` |
| **auditoria-e-validacao-pesquisa** | Quality gates, red team, correção na origem | `.claude/skills/auditoria-e-validacao-pesquisa/` |
| **insights-estrategicos-preditivos** | Insights + previsões com evidência e confiança | `.claude/skills/insights-estrategicos-preditivos/` |
| **polaris-sdk-pesquisa** | Motor POLARIS (metodologia + execução + relatório) | `.claude/skills/polaris-sdk-pesquisa/` |
| **piv-loop** | Ciclo Plan-Implement-Verify para desenvolvimento | `.claude/commands/core_piv_loop/` |
| **pesquisa-eleitoral** | Comandos para execução de pesquisas | `.claude/commands/pesquisa_eleitoral/` |

---

## QUANDO USAR CADA SKILL

### design-system-inteia ⭐ PRINCIPAL
- **USAR SEMPRE** ao criar qualquer componente UI
- Cores, gradientes, sombras, bordas
- Botões, cards, inputs, modais
- Layouts de página e seções
- Responsividade e animações
- Referência: `.claude/identity/` para tokens e exemplos

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

### templates-relatorios
- Criar relatórios de pesquisa
- Manter padrão visual INTEIA
- Implementar trilhas de auditoria
- Adicionar chatbots de consultoria

### executar-pesquisa-eleitoral
- Executar pesquisas eleitorais via IA sem interface web
- Selecionar eleitores com 20+ filtros
- Entrevistar eleitores usando Claude API
- Analisar resultados (quantitativo e qualitativo)
- Salvar pesquisas em JSON para posterior acesso
- Quando o usuário pedir "pesquisa sobre X para público Y"

### piv-loop (Comandos)
- Carregar contexto do projeto (`/prime`)
- Planejar novas features (`/plan-feature`)
- Executar planos (`/execute`)
- Fluxo estruturado de desenvolvimento

### pesquisa-eleitoral (Comandos)
- Executar pesquisas eleitorais (`/executar-pesquisa`)
- Gerar relatórios padrão INTEIA (`/gerar-relatorio`)
- Analisar eleitores sintéticos (`/analisar-eleitor`)

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
├── .claude/identity/              # 🆕 Identidade Visual Completa
│   ├── README.md                  # Visão geral
│   ├── cores.md                   # Paleta de cores
│   ├── tipografia.md              # Fontes e hierarquia
│   ├── componentes.md             # Padrões de componentes
│   ├── layouts.md                 # Estruturas de página
│   └── tokens.json                # Design tokens exportáveis
│
└── .claude/skills/
    ├── SKILLS_INDEX.md (este arquivo)
    ├── design-system-inteia/      # 🆕 Skill principal de UI
    │   └── SKILL.md
    ├── branding-inteia/
    │   └── SKILL.md
    ├── navegacao-projeto/
    │   └── SKILL.md
    ├── funcoes-programa/
    │   └── SKILL.md
    ├── criacao-skills/
    │   └── SKILL.md
    ├── templates-relatorios/
    │   └── SKILL.md
    └── executar-pesquisa-eleitoral/
        ├── SKILL.md
        └── executar_pesquisa.py
```

---

## RELAÇÃO COM OUTROS ÍNDICES

| Arquivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Instruções gerais do projeto |
| `PROJECT_INDEX.md` | Mapa de arquivos e funções |
| `SKILLS_INDEX.md` | Catálogo de skills (este arquivo) |

---

## COMANDOS DISPONÍVEIS

Ver índice completo em: `.claude/commands/COMMANDS_INDEX.md`

### Comandos Core
| Comando | Descrição |
|---------|-----------|
| `/prime` | Carregar contexto do projeto |
| `/plan-feature` | Planejar feature |
| `/execute` | Executar plano |
| `/commit` | Commit padronizado |
| `/init-project` | Inicializar ambiente |

### Comandos Pesquisa
| Comando | Descrição |
|---------|-----------|
| `/executar-pesquisa` | Executar pesquisa eleitoral |
| `/gerar-relatorio` | Gerar relatório INTEIA |
| `/analisar-eleitor` | Analisar eleitor sintético |

---

## ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| Total de Skills | 13 |
| Total de Comandos | 8 |
| Última Atualização | 2026-01-30 |
| Próxima Revisão | 2026-02-27 |

## IDENTIDADE VISUAL

Nova pasta `.claude/identity/` contém documentação completa de design:

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Visão geral e filosofia |
| `cores.md` | Paleta completa (âmbar, slate, status) |
| `tipografia.md` | Fonte Inter, hierarquia, estilos |
| `componentes.md` | Botões, cards, inputs, modais, navegação |
| `layouts.md` | Hero, seções, grids, responsividade |
| `tokens.json` | Design tokens programáticos |

---

*Índice criado em: 2026-01-25*
*Mantido por: Claude Code*
