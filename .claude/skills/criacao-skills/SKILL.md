# SKILL: Criação de Skills

> **Propósito**: Ensinar IAs a criar skills específicas seguindo boas práticas, garantindo documentação completa e integração com o sistema de índices.

---

## O QUE É UMA SKILL?

Uma **skill** é um arquivo de instruções especializado que ensina a IA a executar tarefas específicas de forma consistente e eficiente.

### Características de uma Boa Skill

1. **Focada** - Uma skill = Um domínio
2. **Acionável** - Instruções claras e executáveis
3. **Documentada** - Exemplos práticos
4. **Indexada** - Registrada no sistema de navegação
5. **Versionada** - Data de criação e atualizações

---

## ESTRUTURA OBRIGATÓRIA

### Localização

```
projeto/.claude/skills/{nome-skill}/
├── SKILL.md          # Arquivo principal (OBRIGATÓRIO)
├── examples/         # Exemplos de uso (opcional)
└── templates/        # Templates reutilizáveis (opcional)
```

### Template do SKILL.md

```markdown
# SKILL: {Nome da Skill}

> **Propósito**: {Descrição em uma linha do que a skill faz}

---

## QUANDO USAR ESTA SKILL

- {Situação 1}
- {Situação 2}
- {Situação 3}

---

## CONTEÚDO PRINCIPAL

### Seção 1

{Conteúdo...}

### Seção 2

{Conteúdo...}

---

## EXEMPLOS PRÁTICOS

### Exemplo 1: {Título}

```{linguagem}
{código ou comando}
```

### Exemplo 2: {Título}

```{linguagem}
{código ou comando}
```

---

## REFERÊNCIAS

| Arquivo | Descrição |
|---------|-----------|
| `caminho/arquivo1` | {descrição} |
| `caminho/arquivo2` | {descrição} |

---

*Skill criada em: {YYYY-MM-DD}*
*Mantida por: {autor}*
```

---

## PROCESSO DE CRIAÇÃO

### Passo 1: Identificar Necessidade

Antes de criar uma skill, responda:

- [ ] Esta funcionalidade será usada mais de uma vez?
- [ ] Existe complexidade que justifica documentação?
- [ ] Outras IAs/usuários se beneficiariam?
- [ ] Não existe skill similar já criada?

### Passo 2: Criar Estrutura

```bash
# Criar pasta da skill
mkdir -p projeto/.claude/skills/{nome-skill}

# Criar arquivo principal
touch projeto/.claude/skills/{nome-skill}/SKILL.md
```

### Passo 3: Escrever Conteúdo

Seguir o template acima com:

1. **Título claro** - `# SKILL: {Nome}`
2. **Propósito** - Uma linha explicando o objetivo
3. **Quando usar** - Lista de situações
4. **Conteúdo** - Instruções detalhadas
5. **Exemplos** - Código/comandos práticos
6. **Referências** - Arquivos relacionados
7. **Metadados** - Data, autor

### Passo 4: Atualizar Índices

**OBRIGATÓRIO** - Após criar a skill:

1. Atualizar `CLAUDE.md` do projeto
2. Atualizar `PROJECT_INDEX.md` (se existir)
3. Atualizar `SKILLS_INDEX.md` (se existir)

### Passo 5: Commitar

```bash
git add .claude/skills/{nome-skill}/
git commit -m "feat(skills): adiciona skill {nome-skill}

{Descrição do que a skill ensina}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

---

## BOAS PRÁTICAS

### DO (Fazer)

- ✅ Uma skill por domínio específico
- ✅ Usar formatação Markdown consistente
- ✅ Incluir exemplos executáveis
- ✅ Referenciar arquivos do projeto
- ✅ Manter atualizada com mudanças do projeto
- ✅ Usar tabelas para dados estruturados
- ✅ Incluir "Quando usar" no início

### DON'T (Não Fazer)

- ❌ Skills genéricas demais (ex: "como programar")
- ❌ Duplicar conteúdo de outras skills
- ❌ Deixar sem exemplos práticos
- ❌ Criar sem atualizar índices
- ❌ Usar caminhos relativos ambíguos
- ❌ Esquecer de commitar

---

## CATEGORIAS DE SKILLS

### Por Tipo

| Categoria | Propósito | Exemplo |
|-----------|-----------|---------|
| **Navegação** | Como encontrar coisas | `navegacao-projeto` |
| **Funcional** | Como executar tarefas | `funcoes-programa` |
| **Branding** | Padrões visuais | `branding-inteia` |
| **Processo** | Workflows | `criacao-skills` |
| **Domínio** | Conhecimento específico | `analise-eleitoral` |

### Nomenclatura

```
{categoria}-{especificidade}

Exemplos:
- branding-inteia
- navegacao-projeto
- funcoes-programa
- criacao-skills
- analise-eleitoral
- deploy-vercel
```

---

## CHECKLIST DE CRIAÇÃO

Antes de finalizar, verificar:

- [ ] Arquivo SKILL.md criado na pasta correta
- [ ] Título segue padrão `# SKILL: {Nome}`
- [ ] Propósito definido em uma linha
- [ ] Seção "Quando usar" presente
- [ ] Conteúdo organizado em seções claras
- [ ] Pelo menos 2 exemplos práticos
- [ ] Referências a arquivos do projeto
- [ ] Data de criação no final
- [ ] CLAUDE.md atualizado
- [ ] PROJECT_INDEX.md atualizado (se existir)
- [ ] Commit realizado e pushado

---

## MANUTENÇÃO DE SKILLS

### Quando Atualizar

- Mudanças no projeto que afetam a skill
- Feedback de usuários/IAs
- Novos exemplos relevantes
- Correção de erros

### Como Atualizar

1. Editar SKILL.md
2. Adicionar nota de atualização no final:
   ```
   *Atualizado em: {YYYY-MM-DD} - {motivo}*
   ```
3. Commit com mensagem clara

### Quando Depreciar

Se a skill não é mais relevante:

1. Adicionar aviso no topo:
   ```markdown
   > ⚠️ **DEPRECATED**: Esta skill foi descontinuada. Use `{nova-skill}` em vez disso.
   ```
2. Não deletar imediatamente (manter histórico)
3. Remover do índice ativo

---

## EXEMPLO COMPLETO

### Criando Skill "Deploy Vercel"

**1. Criar pasta:**
```bash
mkdir -p .claude/skills/deploy-vercel
```

**2. Criar SKILL.md:**
```markdown
# SKILL: Deploy Vercel

> **Propósito**: Documentar processo de deploy do frontend na Vercel.

---

## QUANDO USAR ESTA SKILL

- Deploy de novas versões
- Configuração de domínio
- Debug de erros de build

---

## COMANDOS

### Deploy Manual

\`\`\`bash
cd frontend
vercel --prod --token $VERCEL_TOKEN
\`\`\`

### Ver Deploys

\`\`\`bash
vercel ls --token $VERCEL_TOKEN
\`\`\`

---

## CONFIGURAÇÃO

| Variável | Descrição |
|----------|-----------|
| `VERCEL_TOKEN` | Token de API |
| `VERCEL_PROJECT_ID` | ID do projeto |

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
```

**3. Atualizar CLAUDE.md:**
```markdown
## Skills do Projeto

- `deploy-vercel` - Processo de deploy na Vercel
```

**4. Commitar:**
```bash
git add .claude/skills/deploy-vercel/ CLAUDE.md
git commit -m "feat(skills): adiciona skill deploy-vercel"
git push
```

---

## INTEGRAÇÃO COM SISTEMA

### Referência no CLAUDE.md

```markdown
## Skills Disponíveis

| Skill | Propósito | Localização |
|-------|-----------|-------------|
| `branding-inteia` | Padrões visuais | `.claude/skills/branding-inteia/` |
| `navegacao-projeto` | Navegação de pastas | `.claude/skills/navegacao-projeto/` |
| `funcoes-programa` | Funcionalidades | `.claude/skills/funcoes-programa/` |
| `criacao-skills` | Como criar skills | `.claude/skills/criacao-skills/` |
```

### Ativação Automática

IAs podem ser instruídas a carregar skills automaticamente:

```markdown
## CLAUDE.md

Ao iniciar sessão neste projeto, consultar:
1. PROJECT_INDEX.md para navegação
2. .claude/skills/ para instruções específicas
```

---

## MÉTRICAS DE QUALIDADE

Uma boa skill deve:

| Métrica | Alvo |
|---------|------|
| **Clareza** | Entendível em 30 segundos |
| **Completude** | Cobre 80%+ dos casos de uso |
| **Atualização** | Última revisão < 30 dias |
| **Exemplos** | Mínimo 2 exemplos executáveis |
| **Referências** | Links para arquivos reais |

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
