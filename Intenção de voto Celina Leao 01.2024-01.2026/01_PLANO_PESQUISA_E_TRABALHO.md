# Plano de Pesquisa e Trabalho (01/2024 a 01/2026)
## Relatorio de Inteligencia Estrategica - INTEIA
Autor: Igor Morais Vasconcelos

## 1) Pergunta central e hipoteses
**Pergunta central**
- Como evoluiu a intencao de voto de **Celina Leao** para o Governo do DF (2026), de 01/2024 a 01/2026, em **todos os institutos** com dados publicos no periodo?

**Hipotese principal (do cliente)**
- A partir de **01/2025**, houve aumento sustentado de intencao de voto associado a **investimento em marketing/imagem**.

**Hipoteses auxiliares (a testar com dados)**
- O ganho (se existir) ocorre com defasagem de 1-3 meses apos aumento de presenca digital/midia.
- Variacoes entre institutos refletem metodologia (online vs presencial), amostra e formulacao (espontanea vs estimulada).
- Picos/vales na serie se explicam por eventos noticiosos (aliancas, crises, seguranca, saude, escandalos, entregas de governo, etc.).

## 2) Produtos / entregaveis
**Relatorio final (principal)**
- `outputs/relatorio/RELATORIO_INTEIA_CELINA_LEAO_DF_2024-01_2026-01.md`
- Estilo: relatorio de inteligencia estrategica (layout, secoes executivas, narrativa + evidencias, graficos comentados, anexos).

**Base de dados (anexos tecnicos)**
- `dados/pesquisas_df_governador_2024-01_2026-01.csv` (dados brutos por candidato, por pesquisa)
- `dados/pesquisas_df_celina_serie.csv` (serie consolidada da Celina por pesquisa)
- `dados/agregados_mensais.csv` (media por mes, por instituto; media geral)
- `dados/presenca_midia_rede_mensal.csv` (posts/mencoes/interesse de busca por mes)
- `dados/linha_do_tempo_eventos.csv` (eventos/noticias com data, relevancia, URL, tag)

**Fontes (evidencias)**
- `fontes/pesquisas/` (1 pasta/arquivo por pesquisa: pdf/html/md + metadata)
- `fontes/noticias/` (recortes e links de eventos relevantes citados nos graficos)

**Graficos (minimo 6 tipos, incluindo barras)**
- Salvos em `outputs/graficos/` em PNG (e quando fizer sentido, SVG)
- Conjunto minimo proposto:
  1. Linha (time-series) - Celina (media geral) + pontos por instituto + anotacoes de eventos
  2. Barras - comparativo por instituto (ultimas pesquisas e/ou media do periodo)
  3. Area empilhada - evolucao do share dos principais candidatos (quando a pesquisa trouxer varios nomes)
  4. Heatmap - calendario mensal (Celina x meses) e/ou matriz de correlacao (voto x mencoes x posts)
  5. Dispersao (scatter) + regressao - voto x mencoes/impressao (com defasagem)
  6. Box/Violin - distribuicao da Celina por instituto (variabilidade/metodologia)
  7. (Extra) Waterfall / decomposicao - variacao acumulada 01/2025 -> 01/2026, separando periodos/eventos

## 3) Escopo de dados
**Periodo**
- 01/01/2024 a 31/01/2026

**Geografia**
- Distrito Federal

**Pesquisa alvo**
- Intencao de voto para **Governo do DF 2026** (principal)

**Complementares**
- Rejeicao, conhecimento, aprovacao de governo (quando houver)
- Cenarios testados (com e sem Arruda, com/sem Izalci, etc.)

## 4) Fontes e estrategia de coleta
**4.1 Pesquisas eleitorais**
- Busca exaustiva em:
  - Releases dos institutos
  - Veiculos que publicaram resultados (Poder360, CNN Brasil, Metrópoles, R7, Band, Correio Braziliense, etc.)
  - Sistema do TSE (quando a pesquisa tiver registro) como checagem de metadados

**4.2 Presenca na midia/rede (proxies de marketing)**
- Mencoes na imprensa por mes (API aberta):
  - GDELT 2.1 (contagem de artigos com "Celina Leao" / "Celina Leão")
- Rede social (se viavel tecnicamente sem credenciais):
  - X/Twitter: coleta via snscrape (tweets da conta e/ou busca por termo)
  - Instagram: tentativa via instaloader (perfil publico) e fallback para proxies (imprensa + google trends)
- Interesse de busca:
  - Google Trends via pytrends (se a coleta funcionar com estabilidade)

**4.3 Linha do tempo de eventos**
- Curadoria de 2024-2026 com foco em:
  - Anuncios/aliancas (Ibaneis, Michelle, Republicanos, PP, etc.)
  - Escandalos/crises e respostas
  - Entregas de governo (programas, obras, seguranca, saude)
  - Eventos que aumentam exposição (posse, viagens, agenda, debates)

## 5) Metodologia analitica
**5.1 Normalizacao**
- Padronizar nomes (Celina Leao / Celina Leão; partidos; abreviacoes)
- Padronizar datas (inicio/fim/coleta/publicacao)
- Registrar tipo de pergunta e cenario (nao misturar cenarios incomparaveis sem sinalizar)

**5.2 Agregacao e medias**
- Media simples por mes (quando houver mais de uma pesquisa no mes)
- Media ponderada por amostra (peso = n)
- Curva suavizada (LOESS) para tendencia, com marcacao de pontos reais

**5.3 Impacto do marketing (01/2025)**
- Analise antes/depois:
  - Comparar nivel medio e inclinacao (tendencia) pre 01/2025 vs pos 01/2025
  - Teste de mudanca estrutural (quando houver observacoes suficientes)
- Correlacao e defasagem:
  - Voto(t) vs mencoes(t-k), posts(t-k), trends(t-k)
  - k = 0..3 meses (avaliar defasagem mais plausivel)

**5.4 Explicacao de altas/baixas**
- Para cada maior variacao entre pesquisas consecutivas:
  - Identificar eventos no intervalo (linha do tempo)
  - Classificar o mecanismo provavel (exposicao positiva/negativa; polarizacao; efeito arrasto; fadiga; rejeicao)
  - Marcar no grafico de tendencia com anotacao curta + referencia (URL)

## 6) Qualidade, validacao e transparencia
- Cada ponto de pesquisa no dataset precisa ter:
  - URL da fonte
  - Arquivo salvo em `fontes/pesquisas/`
  - Metadados minimos (n, margem de erro, data)
- Checagens automaticas:
  - Soma de percentuais (quando aplicavel)
  - Consistencia de datas
  - Duplicatas (mesma pesquisa republicada em varios portais)

## 7) Plano de execucao (tarefas)
1. Varredura web (01/2024-01/2026) e lista mes-a-mes de pesquisas relevantes
2. Download/salvamento de fontes e extracao dos numeros (Celina + demais)
3. Montagem do CSV bruto e dicionario de dados
4. Coleta de mencoes na imprensa (GDELT) e montagem da serie mensal
5. Coleta de rede (Twitter/Instagram quando viavel) e serie mensal de posts
6. Curadoria da linha do tempo e classificacao de eventos
7. Analises (medias, tendencia, variacao, correlacoes, impacto 01/2025)
8. Geracao de graficos (>= 6 tipos) com anotacoes e padrao visual INTEIA
9. Escrita do relatorio final (narrativa + conclusoes + recomendacoes)
10. Anexos: tabela de dados brutos ao final + links/fontes

## 8) Padrao visual (direcao de design)
- Tema: "Inteligencia estrategica" (tons neutros + azul"INTEIA" + destaques em laranja/verde para movimentos)
- Graficos limpos, com:
  - grade leve
  - legenda clara
  - notas de eventos (marcadores) sem poluir a leitura
- Todas as figuras exportadas em 1600px+ de largura para nitidez
