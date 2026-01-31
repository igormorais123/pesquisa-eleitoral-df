# Auditoria Factual - CPI Banco Master/BRB (CLDF)

**Arquivo auditado:** `cpi_banco_master_20260129_194240.html`
**Data da simulacao:** 29/01/2026 19:42
**Data da auditoria:** 30/01/2026
**Modelo da simulacao:** claude-sonnet-4-20250514
**Modelo da auditoria:** claude-opus-4-5-20251101
**Pesquisador:** Igor Morais Vasconcelos (INTEIA)

---

## Resumo Executivo

O relatorio de simulacao parlamentar foi submetido a auditoria factual completa com pesquisa na internet (18 fontes verificadas). A auditoria identificou **6 afirmacoes confirmadas**, **2 imprecisas** e **4 incorretas/superestimadas**. Todas as inconsistencias foram documentadas com notas editoriais no proprio HTML sem alterar os outputs originais do modelo IA.

---

## Alteracoes Realizadas (por sessao)

### Sessao 1 (30/01/2026) - Auditoria Inicial

| # | Tipo | Descricao | Severidade |
|---|------|-----------|------------|
| 1 | Tabela factual | Adicionada tabela "Auditoria Factual Detalhada" com 12 verificacoes | NOVO |
| 2 | CPI Rio Melchior | Corrigido insight: CPI encerrou em 15/12/2025, nao esta ativa | INCORRETO→CORRIGIDO |
| 3 | Papeis institucionais | 6 deputados reclassificados na tabela (Rogerio=Lider Maioria, Hermeto=Lider Governo, Wellington=Presidente, etc.) | INCORRETO→CORRIGIDO |
| 4 | Probabilidade | Reduzida de 100% para 75% com justificativa | SUPERESTIMADO→CORRIGIDO |
| 5 | Cenarios | Diferenciados (antes: 3 identicos 21/8). Agora: Otimista 30%, Base 45%, Pessimista 25% | MELHORIA |
| 6 | Barometro duplo | Adicionado barometro modelo (100%) vs auditado (75%) | NOVO |
| 7 | Timeline | Adicionada timeline completa Jan/2025 a Jan/2026 com 13 marcos | NOVO |
| 8 | Numeros-chave | Adicionados R$12,2bi, R$41bi FGC, 1,6mi clientes, R$5,7bi bloqueados | NOVO |
| 9 | Votacao real | Adicionado registro: 14 favor, 7 contra, 2 ausentes | NOVO |
| 10 | Mesa Diretora | Tabela com 10 cargos e comparacao com simulacao | NOVO |
| 11 | Fontes | 18 links verificados (CNN, Agencia Brasil, Metropoles, CLDF, etc.) | NOVO |
| 12 | Insights | 2 novos: CPMI Federal e Esquema Ponzi/Impacto Social | NOVO |
| 13 | Conexoes | Links para 6 estudos internos do projeto | NOVO |
| 14 | Hero | Badge "AUDITADO 30/01/2026" e data de auditoria | MELHORIA |
| 15 | Conclusao | Grid comparativo Modelo (21/24) vs Auditoria (~75%) | MELHORIA |
| 16 | Legenda tabela | Icones de warning e codigo de cores explicados | MELHORIA |

### Sessao 2 (30/01/2026) - Notas Editoriais nas Respostas

| # | Deputado | Tipo Nota | Erro Sinalizado |
|---|----------|-----------|-----------------|
| 1 | Daniel Donizet (MDB) | Vermelha | Modelo diz "votei a favor" mas estava AUSENTE |
| 2 | Joaquim Roriz Neto (PL) | Vermelha | Modelo diz "votei a favor" mas estava AUSENTE |
| 3 | Rogerio Morro da Cruz (PRD) | Vermelha | Classificado "independente" mas e Lider da Maioria |
| 4 | Wellington Luiz (MDB) | Amarela | CPI Rio Melchior citada como ativa (ja encerrada) |
| 5 | Pastor Daniel de Castro (PP) | Amarela | CPI Rio Melchior citada como ativa + papel 1o Secretario |
| 6 | Hermeto (MDB) | Amarela | CPI Rio Melchior citada como ativa + papel Lider Governo |
| 7 | Jaqueline Silva (MDB) | Amarela | Duplicidade cargo CCJ (Manzoni tambem diz ser presidente) |

### Sessao 3 (30/01/2026) - Revisao Pos-Auditoria

| # | Tipo | Descricao | Achado Resolvido |
|---|------|-----------|------------------|
| 1 | CRITICAL | Votacao real: 14+7+2=23 (faltava 1). Adicionado box "Nao Computado" com Roberio Negreiros | Achado #3 |
| 2 | MEDIUM | Probabilidade 75% vs cenarios 30%: adicionada nota metodologica explicando a diferenca | Achado #1 |
| 3 | MEDIUM | Timestamp 19:47→19:42 (alinhado com nome do arquivo) | Achado #5 |
| 4 | MEDIUM | Mapa de calor: adicionado warning no Rogerio M.C. | Achado #7 |
| 5 | MEDIUM | Conexoes: "14 deputados" → "14 votos registrados de 22 presentes" | Achado #8 |
| 6 | LOW | Ortografia "Roberio"→"Robério" padronizada em 3 ocorrencias | Achado #2 |
| 7 | LOW | Nota CCJ duplicada (Jaqueline Silva) | Achado #9 |
| 8 | CORRECAO | Tabela auditoria: votacao detalhada com 24/24 deputados | Achado #3 |
| 9 | CORRECAO | Resumo auditoria: "7 respostas" (era 6) e registro votacao | N/A |
| 10 | CORRECAO | Banner respostas: texto atualizado com tipos de erro | N/A |
| 11 | CORRECAO | Link URL-encoded para Intencao de Voto Celina Leao (acentos) | Link quebrado |

---

## Validacao Tecnica Final

| Verificacao | Resultado |
|-------------|-----------|
| Total de linhas | 1472 |
| Tags HTML balanceadas | Sim (div:367, span:163, table:3, tr:49, etc.) |
| DOCTYPE + </html> | Sim |
| Links externos (18) | Todos HTTP 200 |
| Links internos (6) | 5 existem, 1 corrigido (URL encoding) |
| Notas de auditoria | 7 no total |
| Anchors internos | 2 validos (#verificacao, #conexoes) |

---

## Inconsistencias Remanescentes (by design)

Estes itens NAO foram corrigidos intencionalmente:

1. **Respostas com "R$ 17 bilhoes"** - Multiplos deputados citam esse valor impreciso nas respostas. A tabela de auditoria geral sinaliza (IMPRECISO, valor mais correto: R$ 12,2 bi), mas notas individuais nao foram adicionadas para nao poluir visualmente todas as respostas. O banner da secao avisa que textos originais nao foram alterados.

2. **CPI Rio Melchior nos textos de resposta** - Os textos de Wellington Luiz, Pastor Daniel e Hermeto citam a CPI como ativa. Notas amarelas alertam o leitor, mas o texto original do modelo IA foi preservado.

3. **Rogerio M.C. com intensidade 7/10** - A auditoria questiona essa previsao (ele e Lider da Maioria, improvavel assinar CPI contra governo), mas o output do modelo foi preservado com nota vermelha.

4. **Presidente da CCJ** - Tanto Thiago Manzoni quanto Jaqueline Silva se descrevem como presidente da CCJ. Nota adicionada em Jaqueline. Output preservado.

---

## Sessao 4 (30/01/2026) - Auditoria de Incoerencias Parlamentares

### Vies Sistematico Detectado

O modelo IA apresenta **vies otimista sistematico** na previsao de apoio a CPI:

| Padrao | Deputados Afetados | Severidade |
|--------|--------------------|------------|
| Classificacao inflada ("Independente" para deputados governistas) | Roosevelt Vilela, Dra. Jane, Ed. Pedrosa, Iolando, Jaqueline Silva, J. Cardoso, Pepa, Martins Machado | CRITICA |
| Fabricacao de voto (afirmam ter votado mas estavam ausentes) | Daniel Donizet, Joaquim Roriz Neto, Roberio Negreiros | CRITICA |
| Papeis institucionais omitidos (membros da Mesa sem cargo registrado) | Ricardo Vale, Paula Belmonte, Roosevelt Vilela, Martins Machado, Jorge Vianna | MEDIA |
| CPI fantasma citada como ativa | Wellington Luiz, Pastor Daniel, Hermeto | CRITICA |
| Risco divergente (tabela ALTO vs resposta MEDIO) | Hermeto, Rogerio M.C., Wellington Luiz | MEDIA |
| Duplicidade de cargo (CCJ) | Jaqueline Silva, Thiago Manzoni | CRITICA |
| Lider da Maioria classificado como "independente" | Rogerio Morro da Cruz | CRITICA |

### Correcoes Aplicadas na Sessao 4

| # | Acao | Deputados |
|---|------|-----------|
| 1 | Coluna "Rel. Governo" corrigida com voto de agosto e cargos | 13 deputados (todos que votaram a favor + Mesa omitida) |
| 2 | Roosevelt Vilela: "Oposicao Forte" → "2o Secretario Mesa / Votou favor Ago", risco MEDIO→ALTO | 1 |
| 3 | Martins Machado: "Independente" → "3o Secretario Mesa / Votou favor Ago", risco MEDIO→ALTO | 1 |
| 4 | Jorge Vianna: "Independente" → "Ouvidor CLDF / Votou favor Ago" | 1 |
| 5 | Ricardo Vale: "Oposicao" → "1o Vice-Presidente / Oposicao" | 1 |
| 6 | Paula Belmonte: "Independente" → "2a Vice-Presidente / Oposicao" | 1 |
| 7 | Iolando: "Independente" → "MDB (gov.) / Votou favor Ago" | 1 |
| 8 | Jaqueline Silva: "Independente" → "MDB (gov.) / Votou favor Ago" | 1 |
| 9 | Pepa: "Independente" → "PP (base gov.) / Votou favor Ago" | 1 |
| 10 | Dra. Jane, Ed. Pedrosa, J. Cardoso: "Independente" → "Votou favor Ago" | 3 |
| 11 | Nota auditoria Roosevelt Vilela (resposta) | 1 |
| 12 | Nota auditoria Roberio Negreiros (resposta) | 1 |
| 13 | Insight CRITICO: "Vies Otimista Sistematico" adicionado | secao insights |
| 14 | Legenda tabela expandida com todas as categorias | secao tabela |
| 15 | Banner respostas atualizado (9 notas, categorias detalhadas) | secao respostas |

**Total de notas editoriais nas respostas: 9** (era 7, adicionadas Roosevelt Vilela e Roberio Negreiros)

---

## Fontes Utilizadas na Auditoria

### Sites oficiais
- cl.df.gov.br (CLDF - legislatura, votacoes, CPIs, Mesa Diretora, liderancas)

### Reportagens
- CNN Brasil (CPI, Operacao Compliance Zero, Vorcaro)
- Agencia Brasil (2a fase operacao, liquidacoes)
- Metropoles (CPI do Master)
- Correio Braziliense (CPIs no Congresso)
- Brasil de Fato (deputados cobram investigacao)
- Poder360 (CPMI, 229 assinaturas)
- Revista Movimento (impeachment Ibaneis)
- Portal Cooperativismo de Credito (resumo do caso)

### Dados parlamentares
- Wikipedia (lista 9a legislatura CLDF)
- CLDF oficial (Mesa Diretora 2025-2026)

---

## Sessao 5 (30/01/2026) - Verificacao Cruzada Completa + Mesa Diretora Suplentes

### Achados por Pesquisa Web

| # | Deputado | Achado | Severidade |
|---|----------|--------|------------|
| 1 | Doutora Jane | Confirmado REPUBLICANOS (migrou MDB→Republicanos em set/2025). Suplente do 2o Secretario da Mesa | NOVO |
| 2 | Eduardo Pedrosa | Confirmado UNIAO BRASIL. Suplente do 3o Secretario + Pres. CEOF | NOVO |
| 3 | Pepa | Confirmado PP. Vice-Lider do Governo + Suplente do 1o Secretario (DUPLO vinculo) | CRITICO |
| 4 | Iolando | Confirmado MDB. Preside Com. Fiscalizacao (CFGTC). NAO e mais 1o Secretario (era 2023-2024) | CORRECAO |
| 5 | Joao Cardoso | Confirmado AVANTE (ja correto no arquivo) | OK |
| 6 | Daniel Donizet | Confirmado MDB. Licenca medica confirmada em fontes externas | OK |
| 7 | Joaquim Roriz Neto | Confirmado PL. Corregedor da CLDF (ja correto no arquivo) | OK |
| 8 | Paula Belmonte | Confirmado PSDB (migrou Cidadania→PSDB em dez/2025). Foi presidente CPI Rio Melchior | NOVO |

### Correcoes Aplicadas na Sessao 5

| # | Acao | Deputados |
|---|------|-----------|
| 1 | Doutora Jane: "Votou favor Ago" → "Supl. 2o Sec. Mesa / Votou favor Ago", risco MEDIO→ALTO + nota auditoria + warning | 1 |
| 2 | Eduardo Pedrosa: "Votou favor Ago" → "Supl. 3o Sec. + Pres. CEOF / Votou favor Ago", risco MEDIO→ALTO + nota auditoria + warning | 1 |
| 3 | Pepa: "PP (base gov.) / Votou favor Ago" → "Vice-Lider Gov. + Supl. 1o Sec. / Votou favor Ago", risco MEDIO→ALTO + nota CRITICA + duplo warning mapa calor | 1 |
| 4 | Iolando: "MDB (gov.) / Votou favor Ago" → "Pres. Com. Fiscalizacao / Votou favor Ago" + nota auditoria + warning | 1 |
| 5 | Jaqueline Silva: risco MEDIO→ALTO | 1 |
| 6 | Mesa Diretora: adicionados 4 suplentes + 3 liderancas (Pepa, Doutora Jane, Eduardo Pedrosa, Jorge Vianna, Rogerio M.C., Gabriel Magno) | tabela |
| 7 | Timeline: CPI Rio Melchior com presidente (Paula Belmonte) e relator (Iolando) | timeline |
| 8 | Banner respostas: 9→13 notas, categorias atualizadas | banner |
| 9 | Legenda tabela: categorias Suplente e Pres. Comissao adicionadas | legenda |
| 10 | Resumo auditoria: texto atualizado com total de 13 notas | resumo |

**Total de notas editoriais nas respostas: 13** (era 9, adicionadas Doutora Jane, Eduardo Pedrosa, Iolando, Pepa)

### Sessao 5b - Deputados restantes (oposicao + base)

| # | Deputado | Achado | Acao |
|---|----------|--------|------|
| 1 | Chico Vigilante (PT) | Lider PT + Pres. CDC + Vice-Pres. CCJ + Coautor CPI + Procurador Idoso. 5o mandato. Mais vocal contra BRB/Master | Rel. Gov. enriquecido |
| 2 | Max Maciel (PSOL) | Pres. Com. Transporte. Pediu votacao nominal. Representacao no TCDF sobre FSG. 1o mandato | Rel. Gov. enriquecido |
| 3 | Dayse Amarilio (PSB) | Pres. Com. Saude. Acao judicial no TJDFT. Procuradora Adj. da Mulher | Rel. Gov. enriquecido |
| 4 | Jaqueline Silva (MDB) | Pres. Com. Assuntos Fundiarios (CAF). Vice-Pres. CPI Atos Antidemocraticos. Migrou PTB→Agir→MDB | Rel. Gov. + CAF adicionado |
| 5 | Fabio Felix (PSOL) | Pres. Com. Dir. Humanos + Coautor CPI | Rel. Gov. enriquecido |
| 6 | Paula Belmonte (PSDB) | Ex-Pres. CPI Rio Melchior adicionado ao Rel. Gov. | Rel. Gov. atualizado |
| 7 | Thiago Manzoni (PL) | Pres. CCJ adicionado ao Rel. Gov. | Rel. Gov. atualizado |
| 8 | Joao Cardoso (AVANTE) | Pres. Com. Seguranca | Rel. Gov. enriquecido |

**Resultado: 24/24 deputados com "Rel. Governo" enriquecido e verificado por pesquisa web.**

---

## Metricas da Auditoria

| Metrica | Valor |
|---------|-------|
| Afirmacoes verificadas | 12 |
| Confirmadas | 6 (50%) |
| Imprecisas | 2 (17%) |
| Incorretas/superestimadas | 4 (33%) |
| Notas editoriais adicionadas | 13 |
| Secoes novas criadas | 9 (incluindo insight "Vies Otimista") |
| Links externos verificados | 18 (100% ativos) |
| Deputados com "Rel. Governo" enriquecido | 24 de 24 (100%) |
| Incoerencias parlamentares encontradas | 33+ (11 criticas, 12 medias, 10 baixas) |
| Deputados 100% coerentes | 7 (toda a oposicao: PT, PSOL, PSB, PSDB) |
| Partidos verificados via web | 24 de 24 (100% confirmados corretos) |
| Comissoes permanentes mapeadas | 10 (CDC, CCJ, CDDHEC, CSA, CTMU, CEOF, CFGTC, CAF, CS, Com. Mulher) |
| Mesa Diretora completa | Titulares (10) + Suplentes (4) + Liderancas (3) |
| CPI BRB signatarios confirmados | 6 (Fabio Felix, Chico Vigilante, Max Maciel, Gabriel Magno, Dayse Amarilio, +1) |
| Linhas originais do arquivo | ~1098 |
| Linhas apos auditoria completa | ~1550+ |
