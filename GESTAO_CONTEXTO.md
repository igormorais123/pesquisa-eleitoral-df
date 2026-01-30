# GESTAO DE CONTEXTO - Regras para Agentes de IA

## LEIA PRIMEIRO

Este arquivo contem regras de gestao de contexto para evitar
que o agente entre na ZONA BURRA (mais de 60 porcento de contexto usado).

---

## ZONAS DE OPERACAO

### ZONA INTELIGENTE (0-40 porcento)
- Explorar livremente
- Ler arquivos completos
- Fazer multiplas buscas
- Sem restricoes

### ZONA ATENCAO (40-60 porcento)
Ao entrar nesta zona:
1. PARAR novas leituras extensivas
2. COMPILAR descobertas ate agora
3. FOCAR apenas no essencial
4. Usar grep ao inves de cat

### ZONA BURRA (mais de 60 porcento)
ACAO IMEDIATA:
1. PARAR TUDO
2. Salvar estado em SESSAO_TEMP.md
3. Informar usuario
4. Considerar reiniciar sessao

---

## SINAIS DE ALERTA

Voce esta na zona de atencao se:
- Ja leu mais de 10 arquivos completos
- Respostas estao ficando mais lentas
- Contexto parece confuso
- Repetindo informacoes

---

## PROTOCOLO DE COMPILACAO

Quando atingir 40 porcento:

1. Criar/atualizar arquivo `SESSAO_TEMP.md` com:
   - Objetivo da sessao
   - O que foi feito (checklist de entrega)
   - Arquivos criados/alterados (lista curta)
   - Decisoes importantes + racional
   - Inconsistencias encontradas
   - Proximos passos (max 5)

2. Atualizar rastreadores do projeto (OBRIGATORIO):
   - `WORK_LOG.md` (resumo + decisao + links)
   - `.context/todos.md` (tarefas: feito/em progresso/pendente)
   - `.context/insights.md` (insights persistentes)
   - `.memoria/CONTEXTO_ATIVO.md` (estado da sessao)
   - `.memoria/APRENDIZADOS.md` (o que virou regra)

3. Higiene de versionamento (OBRIGATORIO):
   - Rodar `git status` e identificar arquivos sensiveis
   - NUNCA commitar segredos (ex.: exports de env/keys)
   - Criar commit(s) pequenos e coesos com mensagem clara

4. Executar compactacao de contexto (PADRAO):
   - Rodar o comando `/compact` (ver `.claude/commands/compact.md`)
   - Reiniciar a conversa/sessao usando apenas `SESSAO_TEMP.md` + `WORK_LOG.md`

---

## ARQUIVOS SEGUROS PARA LER SEMPRE

Estes arquivos sao pequenos e seguros:
- CLAUDE.md
- GPS_NAVEGACAO_AGENTES.md
- 00_INDICE.md (qualquer pasta)
- WORK_LOG.md
- package.json
- requirements.txt

## ARQUIVOS PARA EVITAR

Nunca ler completamente:
- node_modules/ (qualquer coisa)
- __pycache__/ (qualquer coisa)
- .git/ (qualquer coisa)
- *.json com mais de 100KB
- Arquivos de backup (*_backup*)

## COMO VERIFICAR TAMANHO

Antes de ler arquivo grande:
- Use head -50 para preview
- Use wc -l para contar linhas
- Use du -h para ver tamanho

---

## MELHORES PRATICAS

1. Comece SEMPRE lendo GPS_NAVEGACAO_AGENTES.md
2. Use indices (00_INDICE.md) antes de explorar pastas
3. Compile descobertas incrementalmente
4. Atualize WORK_LOG.md ao final da sessao
5. Prefira grep a cat para buscas
6. Leia apenas secoes relevantes de arquivos grandes

---

## EXEMPLO DE FLUXO IDEAL

1. Ler GPS_NAVEGACAO_AGENTES.md (visao geral)
2. Ler 00_INDICE.md da pasta relevante
3. Buscar com grep o que precisa
4. Ler apenas arquivos especificos
5. Compilar ao atingir 40 porcento
6. Atualizar WORK_LOG.md ao finalizar
