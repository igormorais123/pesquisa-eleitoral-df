# Execucao Agentica (Claude Code CLI) vs API (Fallback)

Este projeto suporta 2 modos de execucao para entrevistas/pesquisas por IA.

Objetivo: por padrao, **evitar API** e usar a assinatura do **Claude Code** (mais barato/rapido). A API fica como plano B quando necessario.

---

## Modos de execucao

### 1) `IA_PROVIDER=claude_code` (PADRAO)

- O backend/scripts chamam o **Claude Code CLI** (comando `claude`) em modo nao-interativo (`-p`).
- Isso usa a autenticacao do Claude Code (assinatura) e evita custo por token via API.

Requisitos:

- `claude` instalado no PATH
- Claude Code autenticado no ambiente onde o backend/script roda

Setup (uma vez por maquina/ambiente):

1) Verificar CLI:
   - `claude --version`
2) Configurar token da assinatura:
   - `claude setup-token`
3) Autenticar:
   - rode `claude` e faça `/login` (ou o fluxo indicado pelo CLI)
4) Validar modo print:
   - `claude -p "Responda apenas: OK"`

Importante:

- Se você usar WSL + Windows, precisa autenticar no mesmo ambiente onde o backend roda.
  Ex.: autenticar no Windows não autentica automaticamente no WSL.

Observacoes:

- O sistema chama o CLI com `--tools ""` para bloquear tool-use durante as entrevistas (mais rapido e previsivel).

### 2) `IA_PROVIDER=anthropic_api` (fallback/servidor)

- O backend usa `CLAUDE_API_KEY` e chama a API da Anthropic.
- Use quando:
  - rodar em servidor/Render sem Claude Code
  - o ambiente nao puder autenticar via assinatura

---

## Variaveis recomendadas (.env)

```env
IA_PROVIDER=claude_code
CLAUDE_CODE_BIN=claude
IA_MODELO_ENTREVISTAS=sonnet
IA_MODELO_INSIGHTS=opus
IA_EVITAR_PROB_ABSOLUTA=true
IA_PROB_EPSILON=1.0
IA_ALLOW_API_FALLBACK=false

# API (opcional)
CLAUDE_API_KEY=
```

Notas:

- `IA_MODELO_ENTREVISTAS` e `IA_MODELO_INSIGHTS` aceitam alias (`sonnet`/`opus`) ou nome completo.
- O backend sempre registra `modelo_usado` + `provedor_usado` nas respostas.
- Por padrao, nao existe fallback silencioso para API. Se o Claude Code nao estiver autenticado, a execucao falha.
  Para permitir fallback, use `IA_ALLOW_API_FALLBACK=true`.

---

## Persistencia ("nuvem") e reuso

Recomendacao pratica:

- Sempre persistir **brutos + analise + metodologia + contexto** com data/hora.
- Persistir em 2 lugares:
  - Banco (backend) para aparecer no frontend
  - Arquivo (JSON/HTML) em `memorias/` para backup e auditoria

Campos minimos a salvar em cada pesquisa:

- `data_execucao` (ISO)
- `modelo_usado` + `provedor_usado`
- `questionario` (perguntas e versao/template)
- `amostra` (quem foi entrevistado e filtros)
- `contexto_considerado` (texto/base usada)
- `respostas_raw` (tudo)
- `metodologia` (regras, clamps, priors)
- `analise` (tabelas, mapas, probabilidades)

---

## Boas praticas para realismo (anti-"bozinho")

- Separar **fato verificavel** vs **inferencia** no perfil do agente.
- Incluir incentivos reais (retaliacao, governabilidade, bancada, custos) no prompt.
- Usar camada de "priors" (numerico) + LLM (justificativa) quando o tema exigir previsao.
- Evitar probabilidades absolutas por padrao (clamp 1..99), salvo certeza factual.
- Registrar sempre as fontes/assuncos e a incerteza.
