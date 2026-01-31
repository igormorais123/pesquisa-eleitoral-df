# Compactar Contexto (Padrão INTEIA)

## Objetivo

Compilar o estado do trabalho (antes de entrar na zona burra), salvar em arquivos de persistência, commitar mudanças seguras e reiniciar a sessão com contexto limpo.

## Quando Usar

- Sempre que o agente perceber que está chegando em ~40% de uso de contexto.
- Obrigatório antes de atingir 60%.

## Processo

### 1) Parar expansão de contexto

- Não ler arquivos grandes.
- Não abrir novas frentes.
- Só operar em “modo consolidação”.

### 2) Compilar estado em disco

Atualizar/criar:

- `SESSAO_TEMP.md`
- `WORK_LOG.md`
- `.context/todos.md`
- `.context/insights.md`
- `.memoria/CONTEXTO_ATIVO.md`
- `.memoria/APRENDIZADOS.md`
- `.memoria/MEMORIA_LONGO_PRAZO.md` (se houver novo padrão permanente)

Template mínimo para `SESSAO_TEMP.md`:

```markdown
# SESSAO_TEMP - {data}

## Objetivo

...

## O que foi feito

- ...

## Arquivos principais tocados

- ...

## Decisões e rationale

- ...

## Riscos / inconsistências

- ...

## Próximos passos

1.
2.
3.
```

### 3) Commit seguro (sem segredos)

1. Rodar status:

```bash
git -c safe.directory=$(pwd) status
```

2. Verificar e NÃO commitar:

- `.env`, exports de env (ex.: `*temp_env*.json`), credenciais, dumps, venvs.

3. Adicionar arquivos relevantes (granular):

```bash
git -c safe.directory=$(pwd) add caminho/arquivo1 caminho/arquivo2 ...
```

4. Commit com mensagem no padrão do repo (conventional commits):

```bash
git -c safe.directory=$(pwd) commit -m "feat(...): ..."
```

### 4) Reset operacional (contexto limpo)

Após compilar e commitar:

- Iniciar uma NOVA conversa.
- Na nova conversa, ler primeiro:
  - `SESSAO_TEMP.md`
  - `WORK_LOG.md`
  - `.context/todos.md`

E continuar do ponto exato onde parou.
