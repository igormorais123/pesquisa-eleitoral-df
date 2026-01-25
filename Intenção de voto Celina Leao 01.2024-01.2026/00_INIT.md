# INTEIA / Projeto de Inteligencia - Celina Leao (DF 2026)

Este arquivo existe para **gestao de contexto** e **memoria de execucao** durante a producao do relatorio.

## Objetivo
Construir um relatorio completo (01/2024 a 01/2026) sobre a **evolucao da intencao de voto** para **Celina Leao** ao Governo do DF, cruzando:
- Pesquisas eleitorais (todos institutos encontrados no periodo)
- Presenca na rede / midia (posts, mencoes na imprensa, interesse de busca, etc.)
- Linha do tempo de eventos (noticias relevantes) e hipotese de impacto de investimentos em marketing a partir de 01/2025

## Regras do espaco de trabalho
- Alterar/criar arquivos **somente nesta pasta**: `Intencao de voto Celina Leao 01.2024-01.2026/`
- Guardar **todas as fontes** em `fontes/` (html/md/pdf quando disponivel)
- Guardar **dados brutos** em `dados/`
- Guardar **scripts** em `scripts/`
- Guardar **graficos e artefatos finais** em `outputs/`

## Estrutura criada
- `01_PLANO_PESQUISA_E_TRABALHO.md` (plano detalhado)
- `dados/` (csv/json consolidados)
- `fontes/pesquisas/` (materiais das pesquisas: release/pdf/html)
- `fontes/noticias/` (materiais para linha do tempo: links e recortes)
- `scripts/` (coleta + parsing + analise + graficos)
- `outputs/graficos/` (png/svg)
- `outputs/relatorio/` (md final e anexos)

## Padrao de dados (rascunho)
Arquivo principal de pesquisas (CSV): `dados/pesquisas_df_governador_2024-01_2026-01.csv`

Campos previstos:
- id_pesquisa
- instituto
- contratante
- data_inicio
- data_fim
- data_publicacao
- amostra_n
- margem_erro_pp
- nivel_confianca
- metodologia
- universo
- registro_tse
- tipo_pergunta (espontanea/estimulada)
- cenario
- candidato
- partido
- percentual
- fonte_url
- fonte_arquivo

## Status (atualizar durante o trabalho)
- Ultima atualizacao: 2026-01-24
- Proximo passo: consolidar lista completa de pesquisas (01/2024-01/2026) e baixar fontes
