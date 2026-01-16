# Plano de Melhoria de Conteúdo - Pesquisa Eleitoral DF 2026

**Data:** 15 de Janeiro de 2026
**Branch:** `claude/plan-content-improvements-NwWAn`
**Objetivo:** Identificar e planejar melhorias de conteúdo e documentação do sistema

---

## 1. Resumo Executivo

O sistema **Pesquisa Eleitoral DF 2026** é tecnicamente robusto:
- ✅ 400+ agentes realistas com 60+ atributos cada
- ✅ 30+ endpoints de API bem estruturados
- ✅ Chain of Thought cognitivo de 4 etapas
- ✅ Integração inteligente com Claude API (Opus/Sonnet/Haiku)
- ✅ Frontend moderno com virtualização e performance otimizada

**Porém**, existe uma **lacuna significativa de conteúdo**:
- ❌ Documentação de usuário quase inexistente
- ❌ Faltam exemplos práticos de API
- ❌ Processos de deployment pouco claros
- ❌ Interpretação de insights desconectada

**Oportunidade:** Investimento em documentação estratégica pode multiplicar adoção e reduzir fricção para usuários finais (cientistas políticos, pesquisadores, analistas de campanha) sem mudanças no código.

---

## 2. Análise de Gaps de Conteúdo

### 2.1 Documentação Existente

| Arquivo | Linhas | Status |
|---------|--------|--------|
| `README.md` | ~50 | ⚠️ Básico - setup mínimo |
| `CLAUDE.md` | ~200 | ✅ Bom - instruções para IA |
| `PLANO_FINAL_CONSOLIDADO.md` | ~1900 | ✅ Detalhado - arquitetura técnica |
| `DEPENDENCY_AUDIT_REPORT.md` | ~180 | ✅ Completo - análise de deps |

### 2.2 Coverage de Documentação

**Bem Documentado (70-100%):**
- ✅ Arquitetura geral do sistema
- ✅ Setup local com Docker
- ✅ Tech stack utilizado
- ✅ Estrutura de diretórios
- ✅ Modelo de eleitor (60+ atributos)

**Parcialmente Documentado (30-70%):**
- ⚠️ Endpoints de API (listados, sem exemplos)
- ⚠️ Tipos de pergunta e formatos de resposta
- ⚠️ Chain of Thought process (código, não docs)
- ⚠️ Lógica de geração de insights

**Não Documentado (0-30%):**
- ❌ Guia de desenvolvimento (como contribuir)
- ❌ Guia de deployment passo a passo
- ❌ Troubleshooting comum
- ❌ Exemplos de uso de API (cURL, JS, Python)
- ❌ OpenAPI/Swagger specification
- ❌ Guia de customização de prompts
- ❌ Performance tuning
- ❌ Scaling considerations
- ❌ Guia de usuário para não-programadores

---

## 3. Gaps Críticos Identificados

### 3.1 🔴 CRÍTICO: Documentação de API com Exemplos

**Problema:** Endpoints listados em CLAUDE.md mas sem exemplos práticos de request/response.

**Impacto:**
- Desenvolvedores não conseguem integrar com sistemas externos
- Tempo de onboarding aumentado significativamente
- Erros comuns por falta de documentação de schemas

**Solução Proposta:**
```
docs/api/
├── README.md                    # Visão geral da API
├── autenticacao.md              # Login, JWT, refresh
├── eleitores.md                 # CRUD + 20 filtros
├── entrevistas.md               # Criação e execução
├── resultados.md                # Análises e insights
└── exemplos/
    ├── curl/                    # Exemplos cURL
    ├── python/                  # Cliente Python
    └── javascript/              # Cliente JS/TS
```

**Entregável:** OpenAPI 3.0 spec + Swagger UI integrado

---

### 3.2 🔴 CRÍTICO: Guia de Usuário para Não-Programadores

**Problema:** Sistema destinado a cientistas políticos e pesquisadores, mas documentação é 100% técnica.

**Impacto:**
- Barreira de entrada extremamente alta
- Usuários-alvo não conseguem usar o sistema
- Valor do produto subutilizado

**Solução Proposta:**
```
docs/guia-usuario/
├── 01-introducao.md             # O que é, para quem é
├── 02-primeiros-passos.md       # Login, navegação básica
├── 03-entendendo-eleitores.md   # Os 400 agentes
├── 04-criando-entrevista.md     # Passo a passo com screenshots
├── 05-executando-pesquisa.md    # Monitoramento em tempo real
├── 06-interpretando-resultados.md # Como ler gráficos
├── 07-exportando-dados.md       # Excel, PDF, relatórios
└── glossario.md                 # Termos técnicos explicados
```

**Entregável:** Guia PDF de 30-40 páginas com screenshots

---

### 3.3 🔴 CRÍTICO: Documentação de Cognição dos Agentes

**Problema:** Lógica do Chain of Thought está no código (`prompts.ts`) mas não explicada em linguagem acessível.

**Impacto:**
- Impossível customizar comportamento dos agentes
- Usuários não entendem por que agentes respondem de certas formas
- Dificuldade em ajustar para contextos específicos

**Solução Proposta:**
```
docs/cognição/
├── visao-geral.md               # Como agentes "pensam"
├── 4-etapas-cognitivas.md       # Detalhamento do processo
│   ├── etapa1-atencao.md        # Filtro de atenção seletiva
│   ├── etapa2-vies.md           # Viés de confirmação
│   ├── etapa3-emocao.md         # Reação emocional
│   └── etapa4-decisao.md        # Decisão e resposta
├── regras-anti-convergencia.md  # Por que evitar respostas "equilibradas"
├── personalizacao.md            # Como ajustar prompts
└── limitacoes.md                # O que o sistema não faz bem
```

**Entregável:** Documento técnico de 15-20 páginas

---

### 3.4 🟠 IMPORTANTE: Guia de Interpretação de Resultados

**Problema:** Sistema gera estatísticas avançadas (correlações, sentimentos, mapas de calor), mas usuários não sabem interpretar.

**Impacto:**
- Dados gerados mas não aplicados
- Insights perdidos por falta de contexto
- ROI do sistema diminuído

**Solução Proposta:**
```
docs/resultados/
├── estatisticas-basicas.md      # Média, mediana, desvio padrão
├── correlacoes.md               # O que significa correlação
├── analise-sentimentos.md       # Positivo/negativo/neutro
├── mapa-calor-emocional.md      # Como ler heatmaps
├── votos-silenciosos.md         # O que são e como identificar
├── pontos-ruptura.md            # Gatilhos de mudança de voto
├── casos-uso-politicos.md       # Quando usar qual análise
└── templates-relatorio.md       # Modelos para relatórios
```

---

### 3.5 🟠 IMPORTANTE: Deployment Guide Completo

**Problema:** README tem instruções resumidas, Docker pode falhar sem troubleshooting.

**Solução Proposta:**
```
docs/deployment/
├── requisitos.md                # Hardware, software, rede
├── local-docker.md              # Setup com Docker Compose
├── local-manual.md              # Setup sem Docker
├── producao-vps.md              # Deploy em VPS (AWS, GCP, etc)
├── variaveis-ambiente.md        # Todas as env vars explicadas
├── banco-dados.md               # PostgreSQL setup e manutenção
├── backup-restore.md            # Procedimentos de backup
├── monitoramento.md             # Logs, métricas, alertas
└── troubleshooting.md           # 20 erros comuns + soluções
```

---

### 3.6 🟠 IMPORTANTE: Guia de Customização de Agentes

**Problema:** Banco tem 400 agentes fixos do DF. Como adaptar para outras regiões?

**Solução Proposta:**
```
docs/agentes/
├── schema-eleitor.md            # Todos os 60+ atributos
├── geracao-automatica.md        # Usando gerar_eleitores_df_v4.py
├── importacao-manual.md         # Formato JSON esperado
├── validacoes.md                # Regras de consistência
├── boas-praticas.md             # Como criar agentes realistas
├── adaptacao-regional.md        # Ajustar para SP, RJ, etc
└── exemplos/
    ├── eleitor-minimo.json      # Campos obrigatórios
    └── eleitor-completo.json    # Todos os campos
```

---

## 4. Plano de Implementação

### Fase 1: Fundação (Prioridade Crítica)

| # | Entregável | Esforço | Impacto |
|---|-----------|---------|---------|
| 1.1 | OpenAPI Spec + Swagger UI | Médio | Alto |
| 1.2 | Guia "Primeiros Passos" (5 páginas) | Baixo | Alto |
| 1.3 | Documentação das 4 Etapas Cognitivas | Médio | Alto |
| 1.4 | Glossário de Termos (2 páginas) | Baixo | Médio |

### Fase 2: Educação (Prioridade Alta)

| # | Entregável | Esforço | Impacto |
|---|-----------|---------|---------|
| 2.1 | Guia Completo de Usuário (30 páginas) | Alto | Alto |
| 2.2 | Guia de Interpretação de Resultados | Médio | Alto |
| 2.3 | Deployment Guide Completo | Médio | Médio |
| 2.4 | Exemplos de API (cURL, Python, JS) | Médio | Médio |

### Fase 3: Refinamento (Prioridade Média)

| # | Entregável | Esforço | Impacto |
|---|-----------|---------|---------|
| 3.1 | Guia de Customização de Agentes | Médio | Médio |
| 3.2 | Performance & Scaling Guide | Médio | Baixo |
| 3.3 | Architecture Decision Records (ADRs) | Baixo | Baixo |
| 3.4 | FAQ + Troubleshooting (20 itens) | Baixo | Médio |

---

## 5. Quick Wins (Implementação Rápida)

Documentação de máximo valor com mínimo esforço:

### 5.1 Cheat Sheet de API (1 página)

```markdown
# API Cheat Sheet - Pesquisa Eleitoral DF

## Autenticação
POST /api/v1/auth/login
Body: { "usuario": "...", "senha": "..." }
Response: { "access_token": "...", "token_type": "bearer" }

## Eleitores
GET /api/v1/eleitores?idade_min=18&idade_max=35&orientacao_politica=esquerda
GET /api/v1/eleitores/estatisticas
GET /api/v1/eleitores/{id}

## Entrevistas
POST /api/v1/entrevistas
POST /api/v1/entrevistas/{id}/iniciar
GET /api/v1/entrevistas/{id}/progresso

## Resultados
GET /api/v1/resultados/{id}/estatisticas
GET /api/v1/resultados/{id}/sentimentos
GET /api/v1/resultados/{id}/mapa-calor
```

### 5.2 Glossário Rápido (1 página)

| Termo | Definição |
|-------|-----------|
| **Agente/Eleitor** | Perfil sintético de IA que simula eleitor brasileiro |
| **Chain of Thought** | Processo de 4 etapas que simula cognição humana |
| **Cluster Socioeconômico** | G1 (alta renda) a G4 (baixa renda) |
| **RA** | Região Administrativa do DF (Taguatinga, Ceilândia, etc) |
| **Voto Silencioso** | Intenção de voto não declarada publicamente |
| **Ponto de Ruptura** | Evento que pode mudar posição política |

### 5.3 Template de Relatório (2 páginas)

```markdown
# Relatório de Pesquisa Eleitoral
**Data:** [DATA]
**Amostra:** [N] eleitores
**Margem de Erro:** [X]%

## Intenção de Voto
[GRÁFICO DE BARRAS]

## Análise por Segmento
### Por Região Administrativa
[TABELA]

### Por Faixa Etária
[TABELA]

## Insights Qualitativos
1. [INSIGHT]
2. [INSIGHT]

## Conclusões
[TEXTO]
```

---

## 6. Métricas de Sucesso

### Indicadores de Adoção

| Métrica | Atual | Meta |
|---------|-------|------|
| Tempo de onboarding (novo usuário) | 4+ horas | < 30 min |
| Dúvidas técnicas no suporte | Alto | Reduzir 70% |
| Usuários não-técnicos ativos | ~10% | > 50% |
| Documentação coverage | 30% | 90% |

### Indicadores de Qualidade

| Métrica | Atual | Meta |
|---------|-------|------|
| Exemplos de API documentados | 0 | 30+ |
| Screenshots no guia de usuário | 0 | 50+ |
| FAQs documentadas | 0 | 20+ |
| Páginas de troubleshooting | 0 | 10+ |

---

## 7. Estrutura de Diretórios Proposta

```
docs/
├── README.md                    # Índice da documentação
├── guia-usuario/                # Para não-programadores
│   ├── 01-introducao.md
│   ├── 02-primeiros-passos.md
│   ├── 03-entendendo-eleitores.md
│   ├── 04-criando-entrevista.md
│   ├── 05-executando-pesquisa.md
│   ├── 06-interpretando-resultados.md
│   ├── 07-exportando-dados.md
│   └── glossario.md
├── api/                         # Referência técnica
│   ├── openapi.yaml             # Spec OpenAPI 3.0
│   ├── autenticacao.md
│   ├── eleitores.md
│   ├── entrevistas.md
│   ├── resultados.md
│   └── exemplos/
├── cognicao/                    # Sistema de agentes
│   ├── visao-geral.md
│   ├── 4-etapas-cognitivas.md
│   ├── regras-anti-convergencia.md
│   └── personalizacao.md
├── deployment/                  # Operações
│   ├── requisitos.md
│   ├── docker.md
│   ├── producao.md
│   ├── variaveis-ambiente.md
│   └── troubleshooting.md
├── agentes/                     # Customização
│   ├── schema-eleitor.md
│   ├── geracao.md
│   └── boas-praticas.md
└── contribuicao/                # Para desenvolvedores
    ├── como-contribuir.md
    ├── arquitetura.md
    └── testes.md
```

---

## 8. Próximos Passos

### Ação Imediata (Esta Sprint)
1. [ ] Criar estrutura de diretórios `docs/`
2. [ ] Implementar API Cheat Sheet (Quick Win)
3. [ ] Criar Glossário Rápido (Quick Win)
4. [ ] Iniciar OpenAPI spec baseado em código existente

### Curto Prazo (2-4 Sprints)
5. [ ] Completar Guia de Usuário (Fase 1)
6. [ ] Documentar 4 Etapas Cognitivas
7. [ ] Integrar Swagger UI no backend

### Médio Prazo (4-8 Sprints)
8. [ ] Deployment Guide completo
9. [ ] Guia de Customização de Agentes
10. [ ] FAQ + Troubleshooting

---

## 9. Conclusão

O projeto Pesquisa Eleitoral DF 2026 tem uma base técnica sólida, mas sofre de uma **lacuna crítica de documentação** que limita sua adoção por usuários não-técnicos - exatamente o público-alvo primário (cientistas políticos, analistas de campanha, pesquisadores).

A implementação deste plano de melhoria de conteúdo irá:
- **Reduzir** tempo de onboarding de 4+ horas para < 30 minutos
- **Aumentar** adoção por usuários não-técnicos de ~10% para > 50%
- **Diminuir** carga de suporte técnico em ~70%
- **Habilitar** customização do sistema por usuários avançados

**Investimento estimado:** 40-60 horas de documentação técnica + 20-30 horas de design/screenshots.

**ROI esperado:** Multiplicação significativa do valor entregue pelo sistema já construído.

---

*Documento gerado automaticamente em 15/01/2026*
*Branch: claude/plan-content-improvements-NwWAn*
