# Boas Praticas: Pesquisa Agentica, Memoria e Gestao de Contexto

Este documento define o padrao operacional para IAs rodando pesquisas/entrevistas no INTEIA (eleitores e parlamentares).

Objetivo: resultados mais fieis, auditaveis e reutilizaveis; evitar vies "eticamente perfeito"; manter inteligencia do agente ao longo de sessoes longas.

---

## 1) Regra de ouro: fato vs inferencia

- Tudo que for verificavel (voto nominal, cargo, autoria, declaracao publica, assinado/nao) deve estar em **FATOS** com fonte e data.
- Tudo que for hipotese (lealdade, medo de retaliação, dependencia de emendas) deve estar em **INFERENCIAS** com confianca.
- Nunca misturar "governo federal" e "governo local" no mesmo campo.

---

## 2) Anti-convergencia moral (realismo politico sem virar cinismo extremo)

Problema:

- Modelos tendem a responder pelo "certo" (transparencia, anticorrupcao) quando faltam incentivos concretos.

Contramedidas:

- Incluir explicitamente no prompt:
  - incentivos/punicoes reais (bancada, lideranca, mesa diretora, emendas, pauta)
  - custo de incoerencia (votou antes, agora muda)
  - possibilidade de resposta evasiva (apoio apuracao sem apoiar CPI)
- Usar priors numericos quando o tema for previsao (probabilidade de assinar, votar, romper).
- Exigir trade-off: o agente precisa dizer "o que ganha" e "o que perde" (em linguagem institucional).

---

## 3) Probabilidades: evitar 0% e 100%

Padrao:

- Nunca retornar 0% ou 100% por default.
- Clampar para 1..99 (epsilon configuravel) e marcar "certeza factual" apenas quando:
  - houver fonte verificavel (ex.: voto nominal registrado)
  - ou quando for uma regra logica/tecnica (ex.: requisito regimental objetivo)

---

## 4) Persistencia: tudo vira ativo de pesquisa

Para cada execucao, salvar:

- questionario completo (perguntas, ids, opcoes, versao)
- amostra (quem respondeu + filtros)
- contexto considerado (texto + fontes)
- respostas raw (JSON)
- analise (agregados, mapas, insights)
- metodologia (regras, priors, clamps, prompts)
- metadados de execucao (data, provedor, modelo, tempo)

Reuso:

- resultados antigos podem ser consultados em pesquisas futuras, mas sempre com:
  - data de coleta
  - contexto da epoca
  - nota de validade (pode ter mudado)

---

## 5) Templates: perguntas e formatos padrao

Padronizar:

- templates de perguntas versionados
- templates de resposta (JSON) por tipo de pergunta
- templates de relatorio (estrutura, secoes, graficos)

Regras:

- toda pergunta nova gerada por IA vira template (mesmo que "rascunho")
- templates devem carregar versao e objetivo

---

## 6) Gestao de contexto ("zona inteligente")

Em sessoes longas (agenticas), degrade ocorre quando o contexto vira ruido.

Padrao operacional:

- Trabalhar com "janela limpa": manter apenas informacao operacional e fatos relevantes.
- Antes de chegar em ~40% da janela de contexto do agente:
  - gerar um resumo compacto (estado atual, decisoes, proximos passos)
  - salvar em arquivo (ex.: `memorias/compactos/`) e/ou em um card na pesquisa
  - reiniciar/retomar a partir do resumo

Checklist de compactacao:

- o que foi feito
- o que foi decidido (e por que)
- fontes/dados usados
- pendencias imediatas (proximos 3-7 passos)
- riscos/assuncoes

---

## 7) Auditoria continua (nao esperar dar ruim)

- Rodar auditorias de coerencia periodicamente (por tema e por base de agentes)
- Manter um "ground truth" minimo para temas sensiveis e calibrar o motor
- Registrar divergencias e ajustar dados/prompts, nao apenas "aceitar" a saida do modelo
