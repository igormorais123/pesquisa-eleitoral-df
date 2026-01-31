# Critica do Plano e Limitacoes (custo/beneficio, riscos e como mitigar)

Este documento e uma auto-critica do plano de realismo e da implementacao para evitar extremos.

---

## O que melhora muito (alto ROI)

- Separar fatos verificaveis vs inferencias: reduz alucinacao e melhora auditabilidade.
- Overrides incrementais (sem mexer no legado): corrige rapido e sem quebrar compatibilidade.
- Priors/clamps para probabilidades: reduz 0/100 falsos e melhora calibracao.
- Registrar provedor/modelo/metodologia: facilita comparar execucoes no tempo.

---

## Riscos (e como mitigar)

1) "Engessar" o modelo (so repetir consolidado)

- Risco: se o prompt proibir contradicao demais, o modelo nunca projeta mudanca.
- Mitigacao:
  - manter um bloco "GATILHOS_DE_MUDANCA" e permitir cenario alternativo
  - guardar fatos como hard constraints, mas permitir inferencias mudarem com evento novo

2) Overrides virarem "verdade absoluta" sem fonte

- Risco: o sistema passa a reproduzir opiniao de quem preencheu o override.
- Mitigacao:
  - exigir `fonte` para fatos
  - exigir `confianca` + `nota` para inferencia
  - revisar overrides mensalmente

3) Claude Code CLI como provedor (operacional)

- Risco: exige ambiente com `claude` autenticado; em servidor isso falha.
- Mitigacao:
  - manter API como fallback opcional (`IA_PROVIDER=anthropic_api`)
  - bloquear fallback silencioso por default (`IA_ALLOW_API_FALLBACK=false`)
  - documentar fluxo de login

4) "Anti-bozinho" virar cinismo estereotipado

- Risco: o modelo pode exagerar e tornar todos corruptos/amedrontados.
- Mitigacao:
  - incentivos devem vir do perfil (por deputado), nao do prompt geral
  - calibrar com ground truth (assinaturas reais, declaracoes)
  - rodar dupla pergunta (neutra vs antagonica) e marcar incerteza

---

## Onde ainda falta implementacao (proximo ciclo)

- Preencher overrides dos 24 deputados com fontes.
- Criar ground truth real (nao template) e rodar calibracao automatica.
- Padrao de export "pacote de pesquisa" (JSON unico) para arquivamento/compartilhamento.
