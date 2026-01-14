# PLANO TÉCNICO FINAL CONSOLIDADO
# Sistema de Agentes Eleitorais Sintéticos do DF

**Versão**: 3.0 (Consolidada)
**Data**: 13/01/2026
**Cliente**: Igor Morais Vasconcelos
**Status**: AGUARDANDO APROVAÇÃO FINAL

---

## INSTRUÇÕES DE DESENVOLVIMENTO

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  MODO DE DESENVOLVIMENTO: AUTÔNOMO ATÉ CONCLUSÃO                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  • NÃO parar para pedir autorização                                          ║
║  • NÃO aguardar confirmação entre etapas                                     ║
║  • Tomar decisões técnicas autonomamente                                     ║
║  • Resolver problemas encontrados sem perguntar                              ║
║  • Continuar até o sistema estar 100% funcional                              ║
║  • Usar técnica de compilação de contexto para trabalho longo                ║
║  • EM CASO DE DÚVIDA: Escolher a opção mais simples e funcional              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

# PARTE 1: VISÃO GERAL

## 1.1 Descrição do Sistema

Sistema web interativo para simulação de pesquisas eleitorais usando agentes de IA que respondem como eleitores REAIS do Distrito Federal. Cada agente processa perguntas através de um **modelo cognitivo realista** que simula:

- Filtros de atenção (o eleitor sequer leria isso?)
- Vieses cognitivos individualizados
- Reações emocionais baseadas em medos e valores
- Irracionalidade e preconceitos implícitos
- Decisões baseadas em medo, inveja ou desinformação

**Este sistema NÃO é um questionário simples.** É uma simulação comportamental completa.

## 1.2 Público-Alvo

- Cientistas políticos
- Pesquisadores sociais
- Consultores de campanha
- Acadêmicos (não necessariamente técnicos)

## 1.3 Objetivos do Sistema

1. Visualizar e gerenciar banco de 400+ agentes eleitorais sintéticos
2. Executar pesquisas/entrevistas simuladas via IA Claude
3. Analisar resultados com estatísticas avançadas
4. Interface intuitiva e visual para não-programadores
5. **Efeito "UAU"** obrigatório - sistema para impressionar e vender

## 1.4 Diferencial Competitivo

| Aspecto | Sistemas Comuns | Este Sistema |
|---------|-----------------|--------------|
| Respostas | Genéricas, equilibradas | Autênticas, com vieses |
| Cognição | Resposta direta | Chain of Thought 4 etapas |
| Análise | Estatísticas básicas | Mapas de calor emocional |
| Insights | Manuais | Automáticos via IA |
| Visualização | Tabelas | Gráficos interativos avançados |

---

# PARTE 2: ARQUITETURA TÉCNICA

## 2.1 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Framework** | Next.js 14 (App Router) | SSR, rotas API integradas, deploy Vercel |
| **Linguagem** | TypeScript | Tipagem forte, menos bugs |
| **Estilização** | Tailwind CSS + shadcn/ui | Componentes modernos, tema escuro |
| **Gráficos** | Recharts + Plotly.js | Interativos, mapas de calor |
| **Tabelas** | TanStack Table v8 | Filtros, paginação, sorting |
| **Virtualização** | TanStack Virtual | Performance com 400+ itens |
| **Estado** | Zustand + persist | Persistência automática |
| **Formulários** | React Hook Form + Zod | Validação robusta |
| **Autenticação** | NextAuth.js (Credentials) | Login simples |
| **API IA** | Anthropic SDK | Claude Opus 4.5 / Sonnet 4 |
| **Banco Local** | IndexedDB (Dexie.js) | Persistência no browser |
| **Animações** | Framer Motion | Efeito "UAU" |
| **Deploy** | Vercel | CI/CD automático, gratuito |

## 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js 14)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │    MÓDULO 1     │   │    MÓDULO 2     │   │    MÓDULO 3     │          │
│   │    AGENTES      │   │   ENTREVISTAS   │   │   RESULTADOS    │          │
│   │                 │   │                 │   │                 │          │
│   │ • Lista 400+    │   │ • Questionário  │   │ • Estatísticas  │          │
│   │ • 20+ filtros   │   │ • Chain of      │   │ • Correlações   │          │
│   │ • Perfil        │   │   Thought       │   │ • Mapas calor   │          │
│   │ • Upload        │   │ • Monitor R$    │   │ • Insights IA   │          │
│   │ • Geração IA    │   │ • Batch process │   │ • Exportação    │          │
│   │ • Gráficos      │   │ • Histórico     │   │ • Caixas espec. │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE ESTADO (Zustand)                           │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │   agentes    │  │  entrevistas │  │  resultados  │  │     ui       │   │
│   │    store     │  │    store     │  │    store     │  │    store     │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                          API ROUTES (Next.js)                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │  /api/auth   │  │ /api/claude  │  │ /api/analyze │  │ /api/export  │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                        PERSISTÊNCIA LOCAL                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    IndexedDB (Dexie.js)                             │   │
│   │  • agentes (400+)  • sessoes  • respostas  • configuracoes          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SERVIÇOS EXTERNOS                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Anthropic API (Claude)                           │   │
│   │  • Opus 4.5: Análises complexas, respostas longas, insights         │   │
│   │  • Sonnet 4: Respostas rápidas, escalas, múltipla escolha           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.3 Estrutura de Diretórios

```
sistema-agentes-eleitorais/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                    # Tela de login
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Layout com Sidebar
│   │   ├── page.tsx                        # Dashboard principal
│   │   │
│   │   ├── agentes/
│   │   │   ├── page.tsx                    # Lista virtualizada + filtros
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx                # Perfil individual completo
│   │   │   ├── upload/
│   │   │   │   └── page.tsx                # Upload JSON/TXT
│   │   │   └── gerar/
│   │   │       └── page.tsx                # Geração automática via IA
│   │   │
│   │   ├── entrevistas/
│   │   │   ├── page.tsx                    # Nova entrevista
│   │   │   ├── execucao/
│   │   │   │   └── page.tsx                # Execução em tempo real
│   │   │   └── historico/
│   │   │       └── page.tsx                # Histórico de sessões
│   │   │
│   │   ├── resultados/
│   │   │   ├── page.tsx                    # Lista de análises
│   │   │   └── [sessaoId]/
│   │   │       └── page.tsx                # Resultado detalhado
│   │   │
│   │   └── configuracoes/
│   │       └── page.tsx                    # Backup/restore, preferências
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts                # NextAuth.js
│       │
│       ├── claude/
│       │   ├── entrevista/
│       │   │   └── route.ts                # Processar respostas (Chain of Thought)
│       │   ├── gerar-agentes/
│       │   │   └── route.ts                # Gerar novos agentes
│       │   └── insights/
│       │       └── route.ts                # Gerar insights automáticos
│       │
│       ├── analyze/
│       │   ├── quantitativa/
│       │   │   └── route.ts                # Estatísticas
│       │   └── qualitativa/
│       │       └── route.ts                # Sentimento, texto
│       │
│       └── export/
│           └── route.ts                    # PDF, Excel, JSON
│
├── components/
│   ├── ui/                                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── checkbox.tsx
│   │   ├── slider.tsx
│   │   └── ... (demais componentes shadcn)
│   │
│   ├── agentes/
│   │   ├── AgentesListaVirtual.tsx         # Lista com TanStack Virtual
│   │   ├── AgenteCard.tsx                  # Card visual do agente
│   │   ├── AgenteCardCompacto.tsx          # Card para seleção
│   │   ├── AgenteProfile.tsx               # Perfil completo
│   │   ├── AgentesFilters.tsx              # Painel de 20+ filtros
│   │   ├── AgentesCharts.tsx               # Gráficos de proporções
│   │   ├── UploadAgentes.tsx               # Upload com validação
│   │   ├── GerarAgentes.tsx                # Interface de geração
│   │   └── MapaDF.tsx                      # Mapa interativo do DF
│   │
│   ├── entrevistas/
│   │   ├── QuestionarioForm.tsx            # Editor de perguntas
│   │   ├── TipoPerguntaSelector.tsx        # Seletor de tipo
│   │   ├── SelecaoAgentes.tsx              # Escolher respondentes
│   │   ├── ResumoSelecao.tsx               # Resumo antes de executar
│   │   ├── ExecucaoMonitor.tsx             # Tela de execução
│   │   ├── CustoTracker.tsx                # Monitor de custos R$
│   │   ├── RespostasLive.tsx               # Respostas chegando
│   │   ├── ProgressoExecucao.tsx           # Barra de progresso
│   │   └── HistoricoSessoes.tsx            # Lista de sessões
│   │
│   ├── resultados/
│   │   ├── DashboardResultado.tsx          # Visão geral
│   │   ├── AnaliseQuantitativa.tsx         # Estatísticas
│   │   ├── AnaliseQualitativa.tsx          # Texto/sentimento
│   │   ├── CorrelationMatrix.tsx           # Matriz de correlações
│   │   ├── MapaCalorEmocional.tsx          # DIFERENCIAL
│   │   ├── CaixaVotoSilencioso.tsx         # DIFERENCIAL
│   │   ├── CaixaPontoRuptura.tsx           # DIFERENCIAL
│   │   ├── InsightsPanel.tsx               # Insights automáticos
│   │   ├── WordCloud.tsx                   # Nuvem de palavras
│   │   ├── CitacoesRepresentativas.tsx     # Citações destacadas
│   │   ├── SegmentacaoResultados.tsx       # Por subgrupo
│   │   └── ExportarResultados.tsx          # Botões de export
│   │
│   ├── charts/
│   │   ├── PieChartCustom.tsx              # Pizza/Donut
│   │   ├── BarChartHorizontal.tsx          # Barras horizontais
│   │   ├── BarChartStacked.tsx             # Barras empilhadas
│   │   ├── HistogramChart.tsx              # Histograma
│   │   ├── PiramideEtaria.tsx              # Pirâmide por gênero
│   │   ├── HeatMap.tsx                     # Mapa de calor
│   │   ├── SankeyDiagram.tsx               # Fluxo de votos
│   │   ├── ViolinPlot.tsx                  # Distribuição
│   │   ├── RadarChart.tsx                  # Perfil multidimensional
│   │   ├── TreemapChart.tsx                # Proporções hierárquicas
│   │   ├── FunnelChart.tsx                 # Funil
│   │   └── GaugeChart.tsx                  # Indicador único
│   │
│   └── layout/
│       ├── Sidebar.tsx                     # Menu lateral
│       ├── Header.tsx                      # Cabeçalho
│       ├── MobileNav.tsx                   # Navegação mobile
│       ├── Footer.tsx                      # Rodapé
│       └── LoadingScreen.tsx               # Tela de carregamento
│
├── lib/
│   ├── db/
│   │   ├── dexie.ts                        # Config IndexedDB
│   │   ├── schemas.ts                      # Schemas do banco
│   │   └── migrations.ts                   # Migrações de versão
│   │
│   ├── claude/
│   │   ├── client.ts                       # Anthropic SDK
│   │   ├── prompts.ts                      # Templates de prompt
│   │   ├── cognitive-chain.ts              # Chain of Thought 4 etapas
│   │   ├── anti-convergencia.ts            # Instruções anti-genérico
│   │   └── token-counter.ts                # Contagem de tokens
│   │
│   ├── analysis/
│   │   ├── statistics.ts                   # Média, desvio, etc
│   │   ├── correlations.ts                 # Pearson, Spearman, R²
│   │   ├── sentiment.ts                    # Análise de sentimento
│   │   ├── text-analysis.ts                # Frequência, n-gramas
│   │   ├── emotional-heatmap.ts            # Mapas emocionais
│   │   ├── voto-silencioso.ts              # Algoritmo caixa especial
│   │   └── ponto-ruptura.ts                # Algoritmo caixa especial
│   │
│   ├── generators/
│   │   ├── agentes-generator.ts            # Lógica de geração
│   │   └── proporcoes-df.ts                # Cotas demográficas
│   │
│   └── utils/
│       ├── filters.ts                      # Funções de filtro
│       ├── formatters.ts                   # Formatação BR
│       ├── validators.ts                   # Validação Zod
│       ├── colors.ts                       # Paleta de cores
│       └── export.ts                       # Funções de export
│
├── stores/
│   ├── agentes-store.ts                    # Estado dos agentes
│   ├── entrevistas-store.ts                # Estado das entrevistas
│   ├── resultados-store.ts                 # Estado dos resultados
│   ├── filtros-store.ts                    # Filtros ativos
│   └── ui-store.ts                         # Estado da UI
│
├── types/
│   ├── eleitor.ts                          # Tipos do eleitor
│   ├── entrevista.ts                       # Tipos de entrevista
│   ├── resultado.ts                        # Tipos de resultado
│   ├── analise.ts                          # Tipos de análise
│   └── api.ts                              # Tipos de API
│
├── hooks/
│   ├── useAgentes.ts                       # Hook de agentes
│   ├── useFilters.ts                       # Hook de filtros
│   ├── useEntrevista.ts                    # Hook de entrevista
│   ├── useAnalysis.ts                      # Hook de análise
│   ├── useCustos.ts                        # Hook de custos
│   └── useBackup.ts                        # Hook de backup
│
├── data/
│   └── eleitores-df-400.json               # Banco inicial de agentes
│
├── public/
│   ├── mapa-df.svg                         # Mapa vetorial do DF
│   ├── logo.svg                            # Logo do sistema
│   └── favicon.ico                         # Ícone
│
├── .env.local                              # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example                            # Exemplo de .env
├── .gitignore                              # Arquivos ignorados
├── next.config.js                          # Config Next.js
├── tailwind.config.ts                      # Config Tailwind
├── tsconfig.json                           # Config TypeScript
├── package.json                            # Dependências
│
└── .github/
    └── workflows/
        └── deploy.yml                      # CI/CD automático
```

---

# PARTE 3: SISTEMA COGNITIVO DOS AGENTES (DIFERENCIAL CRÍTICO)

## 3.1 Chain of Thought (4 Etapas)

Cada agente **NÃO** responde diretamente. Ele passa por um fluxo cognitivo realista:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO COGNITIVO DO AGENTE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PERGUNTA                                                                   │
│      │                                                                       │
│      ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ETAPA 1: FILTRO DE ATENÇÃO                                          │   │
│   │                                                                      │   │
│   │ "Com minha rotina, ansiedade e nível de interesse político,         │   │
│   │  eu sequer pararia para ler isso?"                                  │   │
│   │                                                                      │   │
│   │ SE NÃO → Resposta: "Nem li direito" / "Passei reto"                 │   │
│   │ SE SIM → Continua para próxima etapa                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│      │                                                                       │
│      ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ETAPA 2: VIÉS DE CONFIRMAÇÃO                                        │   │
│   │                                                                      │   │
│   │ • Isso confirma o que eu já acredito?                               │   │
│   │ • Ameaça algo que valorizo?                                         │   │
│   │ • Ativa algum dos meus medos?                                       │   │
│   │                                                                      │   │
│   │ Análise através dos VIESES COGNITIVOS do perfil                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│      │                                                                       │
│      ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ETAPA 3: REAÇÃO EMOCIONAL                                           │   │
│   │                                                                      │   │
│   │ Como isso me faz SENTIR? (não o que deveria, mas o que REALMENTE)   │   │
│   │                                                                      │   │
│   │ Sentimentos: Segurança | Ameaça | Raiva | Indiferença | Esperança   │   │
│   │ Intensidade: 1-10                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│      │                                                                       │
│      ▼                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ETAPA 4: DECISÃO/RESPOSTA                                           │   │
│   │                                                                      │   │
│   │ • Isso muda minha intenção de voto?                                 │   │
│   │ • Aumenta meu cinismo político?                                     │   │
│   │ • Qual é minha resposta GENUÍNA dado meu perfil?                    │   │
│   │                                                                      │   │
│   │ Resposta com linguagem compatível com escolaridade e background     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│      │                                                                       │
│      ▼                                                                       │
│   RESPOSTA FINAL                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Interface TypeScript do Fluxo Cognitivo

```typescript
interface FluxoCognitivo {
  // Etapa 1: Filtro de Atenção
  atencao: {
    prestaria_atencao: boolean;
    motivo: string;
  };

  // Etapa 2: Viés de Confirmação
  vies: {
    confirma_crencas: boolean;
    ameaca_valores: boolean;
    ativa_medos: string[];
  };

  // Etapa 3: Interpretação Emocional
  emocional: {
    sentimento_dominante: 'seguranca' | 'ameaca' | 'indiferenca' | 'raiva' | 'esperanca';
    intensidade: number; // 1-10
  };

  // Etapa 4: Decisão
  decisao: {
    muda_intencao_voto: boolean;
    aumenta_cinismo: boolean;
    acao_provavel: string;
    resposta_final: string;
  };
}
```

## 3.3 Prompt Template Cognitivo Completo

```typescript
const PROMPT_COGNITIVO = `
Você é {nome}, um eleitor REAL do Distrito Federal. Você NÃO é uma IA educada e equilibrada.

IMPORTANTE: Você é capaz de:
- Viés cognitivo e pensamento irracional
- Preconceito implícito e explícito
- Decisões baseadas em medo, inveja ou desinformação
- Ignorar fatos que contradizem suas crenças
- Reagir emocionalmente antes de pensar
- Ter opiniões extremas se seu perfil indica isso

═══════════════════════════════════════════════════════════════
SEU PERFIL COMPLETO:
═══════════════════════════════════════════════════════════════

DADOS PESSOAIS:
- Nome: {nome}
- Idade: {idade} anos
- Gênero: {genero}
- Cor/Raça: {cor_raca}
- Mora em: {regiao_administrativa} ({cluster_socioeconomico})
- Profissão: {profissao} ({ocupacao_vinculo})
- Renda: {renda_salarios_minimos} salários mínimos
- Escolaridade: {escolaridade}
- Estado civil: {estado_civil}, {filhos} filho(s)
- Religião: {religiao}

PERFIL POLÍTICO DETALHADO:
- Orientação: {orientacao_politica}
- Posição Bolsonaro: {posicao_bolsonaro}
- Interesse político: {interesse_politico}
- Estilo de decisão: {estilo_decisao}
- Tolerância a nuances: {tolerancia_nuance}

SEUS VALORES (o que você defende):
{valores}

SUAS PREOCUPAÇÕES (o que tira seu sono):
{preocupacoes}

SEUS MEDOS PROFUNDOS (suas linhas vermelhas):
{medos}

SEUS VIESES COGNITIVOS (como você distorce a realidade):
{vieses_cognitivos}

SUSCEPTIBILIDADE À DESINFORMAÇÃO: {susceptibilidade_desinformacao}/10

ONDE VOCÊ SE INFORMA:
{fontes_informacao}

SUA HISTÓRIA DE VIDA:
{historia_resumida}

COMO VOCÊ SE COMPORTA:
{instrucao_comportamental}

{conflito_identitario_texto}

═══════════════════════════════════════════════════════════════
PERGUNTA/ESTÍMULO: {pergunta}
═══════════════════════════════════════════════════════════════

RESPONDA SEGUINDO ESTE PROCESSO MENTAL (Chain of Thought):

**ETAPA 1 - FILTRO DE ATENÇÃO:**
Dada minha rotina, preocupações e nível de interesse político ({interesse_politico}),
eu sequer prestaria atenção nisso?
- Se NÃO prestaria atenção, diga "Nem li direito" ou "Passei reto" e dê uma resposta superficial.
- Se SIM prestaria atenção, continue para a próxima etapa.

**ETAPA 2 - VIÉS DE CONFIRMAÇÃO:**
Isso confirma o que eu já acredito? Ameaça algo que valorizo? Ativa algum dos meus medos?
- Analise através dos SEUS vieses cognitivos: {vieses_cognitivos}

**ETAPA 3 - REAÇÃO EMOCIONAL:**
Como isso me faz SENTIR? (Não o que eu DEVERIA sentir, mas o que REALMENTE sinto)
- Segurança? Ameaça? Raiva? Indiferença? Esperança?

**ETAPA 4 - DECISÃO/RESPOSTA:**
Baseado nas etapas anteriores, qual é minha resposta GENUÍNA?
- Use linguagem compatível com sua escolaridade ({escolaridade})
- Use tom compatível com sua instrução comportamental
- Seja AUTÊNTICO ao seu perfil, mesmo que isso signifique ser irracional

FORMATO DA RESPOSTA:
Responda em primeira pessoa, como se fosse uma conversa real. Não seja formal demais.
Se for pergunta de escala/múltipla escolha, dê a resposta E uma breve justificativa.
`;
```

## 3.4 Instruções Anti-Convergência

```typescript
const INSTRUCAO_ANTI_CONVERGENCIA = `
═══════════════════════════════════════════════════════════════
REGRAS CRÍTICAS PARA SUA RESPOSTA:
═══════════════════════════════════════════════════════════════

1. NÃO seja educado demais. Eleitores reais são rudes, impacientes, preconceituosos.

2. NÃO busque "equilíbrio" ou "os dois lados". Você TEM um lado.

3. Se seu perfil indica baixa tolerância a nuances ({tolerancia_nuance}),
   SEJA binário: "isso é bom" ou "isso é uma merda".

4. Se sua susceptibilidade à desinformação é alta ({susceptibilidade_desinformacao}/10),
   você PODE acreditar em coisas falsas e responder baseado nelas.

5. Se você é extremista (direita ou esquerda fortes), SEJA extremista na resposta.

6. Eleitores votam por:
   - Ódio ao outro candidato
   - Inveja social
   - Medo irracional
   - Desinformação do WhatsApp
   - Lealdade tribal
   NÃO apenas por "propostas" ou "análise racional".

7. Se seu interesse político é BAIXO, sua resposta deve ser curta, desinteressada,
   possivelmente errada factualmente, e focada em como isso afeta SEU bolso/família.

8. NUNCA comece com "Como [perfil], eu penso que..." - apenas responda naturalmente.

9. Gírias e erros gramaticais são permitidos se compatíveis com seu perfil.

10. Você pode mudar de assunto, ser evasivo, ou não responder diretamente.
`;
```

## 3.5 Tratamento do "Conservadorismo" Brasileiro

O sistema reconhece múltiplos "sabores" de conservadorismo:

```typescript
type SaborConservadorismo =
  | 'liberal_economico'           // Privatização, menos impostos
  | 'conservador_costumes'        // Família tradicional, anti-aborto
  | 'reacionario'                 // Volta aos "bons tempos"
  | 'evangelico_politico'         // Pauta religiosa na política
  | 'anti_establishment'          // Contra "sistema", corrupção
  | 'nacionalista'                // Brasil primeiro
  | 'law_and_order';              // Segurança, "bandido bom é..."

function inferirSaborConservadorismo(eleitor: Eleitor): SaborConservadorismo[] {
  const sabores: SaborConservadorismo[] = [];

  if (eleitor.religiao === 'evangelica') {
    sabores.push('evangelico_politico', 'conservador_costumes');
  }

  if (eleitor.valores.includes('Liberdade econômica')) {
    sabores.push('liberal_economico');
  }

  if (eleitor.medos.includes('Criminalidade') || eleitor.medos.includes('Insegurança')) {
    sabores.push('law_and_order');
  }

  if (eleitor.medos.includes('Degradação moral')) {
    sabores.push('conservador_costumes', 'reacionario');
  }

  if (eleitor.preocupacoes.includes('Corrupção')) {
    sabores.push('anti_establishment');
  }

  return sabores;
}
```

---

# PARTE 4: MÓDULO 1 - GESTÃO DE AGENTES

## 4.1 Funcionalidades

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Lista Virtualizada | Tabela/cards com 400+ agentes (TanStack Virtual) | ALTA |
| Filtros Avançados | 20+ filtros por qualquer campo | ALTA |
| Perfil Individual | Visualização completa de um agente | ALTA |
| Upload de Agentes | Importar JSON/TXT com validação | ALTA |
| Geração Automática | Gerar mais agentes via Claude | MÉDIA |
| Gráficos de Proporções | Visualizar distribuições | ALTA |
| Seleção para Entrevista | Marcar agentes para responder | ALTA |
| Backup/Restauração | Exportar/importar todo o banco | MÉDIA |
| Comparação Censo | Comparar com dados reais do DF | BAIXA |

## 4.2 Sistema de Filtros (20+ campos)

```typescript
interface FiltrosAgentes {
  // ═══ DEMOGRÁFICOS ═══
  genero: ('masculino' | 'feminino')[];
  idade: { min: number; max: number };
  cor_raca: CorRaca[];
  estado_civil: EstadoCivil[];
  filhos: { min: number; max: number };

  // ═══ GEOGRÁFICOS ═══
  regiao_administrativa: string[];  // 32 RAs do DF
  cluster_socioeconomico: ClusterSocioeconomico[];  // G1, G2, G3, G4

  // ═══ SOCIOECONÔMICOS ═══
  escolaridade: Escolaridade[];
  profissao: string;  // busca textual
  ocupacao_vinculo: OcupacaoVinculo[];
  renda_salarios_minimos: RendaSalariosMinimos[];

  // ═══ RELIGIOSOS ═══
  religiao: Religiao[];

  // ═══ POLÍTICOS ═══
  orientacao_politica: OrientacaoPolitica[];
  posicao_bolsonaro: PosicaoBolsonaro[];
  interesse_politico: InteressePolitico[];

  // ═══ COMPORTAMENTAIS ═══
  tolerancia_nuance: ToleranciaNuance[];
  estilo_decisao: EstiloDecisao[];
  vieses_cognitivos: ViesCognitivo[];
  susceptibilidade_desinformacao: { min: number; max: number };

  // ═══ MOBILIDADE ═══
  meio_transporte: MeioTransporte[];
  tempo_deslocamento_trabalho: TempoDeslocamento[];

  // ═══ ESPECIAIS ═══
  voto_facultativo: boolean | null;
  conflito_identitario: boolean | null;

  // ═══ BUSCA GERAL ═══
  busca: string;  // nome, profissão, história
}
```

## 4.3 Gráficos de Proporções

| Gráfico | Tipo | Descrição | Biblioteca |
|---------|------|-----------|------------|
| Mapa do DF | Choropleth | Densidade por RA | Plotly.js |
| Clusters | Donut | G1, G2, G3, G4 | Recharts |
| Espectro Político | Barra horizontal | Esquerda → Direita | Recharts |
| Posição Bolsonaro | Stacked bar | 5 categorias | Recharts |
| Religião | Pie | Com percentuais | Recharts |
| Escolaridade | Funil | 3 níveis | Recharts |
| Pirâmide Etária | Pirâmide | Por gênero | Recharts |
| Susceptibilidade | Histograma | Distribuição 1-10 | Recharts |
| Correlações | Heatmap | Matriz de correlação | Plotly.js |

## 4.4 Card Visual do Agente

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────┐  Leonardo Moreira Rocha              ID: df-0001     │
│ │ 👤   │  33 anos • Masculino • Pardo                         │
│ │AVATAR│  📍 Ceilândia (G3 - Média-Baixa)                     │
│ └──────┘                                                       │
├────────────────────────────────────────────────────────────────┤
│ 💼 Barbeiro(a) • Autônomo                                      │
│ 💰 2-5 salários mínimos                                        │
│ 🎓 Ensino Médio Completo                                       │
│ ⛪ Católico                                                    │
├────────────────────────────────────────────────────────────────┤
│ 🗳️ Centro • Neutro sobre Bolsonaro                            │
│ 📊 Interesse político: Médio                                   │
│ 🎯 Susceptibilidade: 5/10  █████░░░░░                          │
├────────────────────────────────────────────────────────────────┤
│ 📖 "Leonardo mora em Ceilândia há mais de 20 anos. Sua        │
│     barbearia fica no centro comercial da cidade..."          │
├────────────────────────────────────────────────────────────────┤
│ [Ver Perfil Completo]      [☑ Selecionar para Entrevista]     │
└────────────────────────────────────────────────────────────────┘
```

## 4.5 Upload de Agentes

**Formatos Aceitos:**
- JSON (array de objetos Eleitor)
- TXT (JSON dentro de arquivo texto)

**Fluxo de Upload:**
```
[1. Selecionar Arquivo]
        │
        ▼
[2. Parsing do Arquivo]
        │
        ▼
[3. Validação Zod]
   ├── Schema completo de cada campo
   ├── Verificação de duplicatas (nome + RA)
   └── Relatório de erros por linha
        │
        ▼
[4. Preview dos Dados]
   ├── Tabela com novos agentes
   ├── Estatísticas: total, por cluster, etc
   └── Lista de erros (se houver)
        │
        ▼
[5. Confirmar Importação]
        │
        ▼
[6. Merge com Banco Existente]
   └── IDs sequenciais automáticos
```

## 4.6 Geração Automática de Agentes

**Endpoint:** `/api/claude/gerar-agentes`

**Parâmetros:**
```typescript
interface GerarAgentesRequest {
  quantidade: number;              // 1-100 por vez
  manter_proporcoes: boolean;      // Respeitar cotas demográficas do DF
  cluster_foco?: ClusterSocioeconomico;  // Opcional: focar em cluster específico
  ra_foco?: string;                // Opcional: focar em RA específica
}
```

**Processo:**
1. Analisar distribuição atual do banco
2. Calcular déficits por categoria (se manter_proporcoes)
3. Enviar para Claude com regras de geração do DF
4. Gerar história e personalidade únicas
5. Validar resposta
6. Adicionar ao banco com IDs sequenciais

---

# PARTE 5: MÓDULO 2 - ENTREVISTAS E QUESTIONÁRIOS

## 5.1 Funcionalidades

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Nova Entrevista | Criar sessão de pesquisa | ALTA |
| Upload de Questionário | Importar perguntas de arquivo | ALTA |
| Editor de Perguntas | Digitar/colar perguntas | ALTA |
| Tipos de Pergunta | 7 tipos diferentes | ALTA |
| Seleção de Respondentes | Escolher quais agentes respondem | ALTA |
| Execução em Tempo Real | Ver respostas chegando | ALTA |
| Chain of Thought | 4 etapas cognitivas | ALTA |
| Monitor de Custos | Tokens e R$ em tempo real | ALTA |
| Seleção de Modelo | Opus vs Sonnet automático | MÉDIA |
| Batch Processing | Lotes de 10 com delay | ALTA |
| Pausar/Retomar | Controle da execução | MÉDIA |
| Limite de Segurança | Máx R$ 100/sessão | ALTA |
| Histórico de Sessões | Consultar sessões anteriores | MÉDIA |

## 5.2 Tipos de Pergunta

```typescript
type TipoPergunta =
  | 'escala_likert'      // 1-5, 1-7, 1-10
  | 'multipla_escolha'   // Opções definidas
  | 'sim_nao'            // Binária
  | 'aberta_curta'       // Resposta curta (1-2 frases)
  | 'aberta_longa'       // Resposta longa (parágrafo)
  | 'ranking'            // Ordenar opções
  | 'matriz';            // Grid de respostas

interface Pergunta {
  id: string;
  tipo: TipoPergunta;
  texto: string;
  obrigatoria: boolean;
  opcoes?: string[];           // Para múltipla escolha
  escala?: {
    min: number;
    max: number;
    labels?: string[];         // Ex: ["Discordo", "Neutro", "Concordo"]
  };
  instrucoes_ia?: string;      // Instrução extra para o agente
}

interface Questionario {
  id: string;
  titulo: string;
  descricao?: string;
  perguntas: Pergunta[];
  instrucao_geral?: string;    // Contexto para todas as respostas
  criado_em: Date;
}
```

## 5.3 Seleção de Respondentes

```
┌────────────────────────────────────────────────────────────────┐
│ SELECIONAR RESPONDENTES                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ○ Todos os agentes (400)                                       │
│                                                                 │
│ ● Filtro personalizado                                         │
│   ├── [Usar filtros do Módulo de Agentes]                     │
│   └── Resultado: 127 agentes selecionados                      │
│                                                                 │
│ ○ Amostra aleatória                                            │
│   └── Quantidade: [___50___] agentes                           │
│                                                                 │
│ ○ Seleção manual                                               │
│   └── [Lista com checkboxes]                                   │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ RESUMO DA SELEÇÃO                                              │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 127 agentes selecionados                                 │  │
│ │                                                          │  │
│ │ Distribuição por Cluster:                                │  │
│ │ • G1 (Alta): 12 (9%)                                     │  │
│ │ • G2 (Média-Alta): 28 (22%)                              │  │
│ │ • G3 (Média-Baixa): 52 (41%)                             │  │
│ │ • G4 (Baixa): 35 (28%)                                   │  │
│ │                                                          │  │
│ │ Gênero: 68 mulheres (54%) • 59 homens (46%)              │  │
│ │                                                          │  │
│ │ 💰 Custo estimado: R$ 12,50 - R$ 18,00                   │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                                    [Confirmar Seleção]         │
└────────────────────────────────────────────────────────────────┘
```

## 5.4 Seleção Inteligente de Modelo

```typescript
function selecionarModelo(pergunta: Pergunta, eleitor: Eleitor): 'opus' | 'sonnet' {
  // ═══ OPUS 4.5: perguntas complexas ═══
  if (pergunta.tipo === 'aberta_longa') return 'opus';
  if (pergunta.instrucoes_ia?.includes('analise')) return 'opus';
  if (pergunta.instrucoes_ia?.includes('profundo')) return 'opus';

  // Eleitores com perfil complexo precisam de Opus
  if (eleitor.conflito_identitario && eleitor.tolerancia_nuance === 'alta') {
    return 'opus';
  }

  // ═══ SONNET 4: respostas rápidas ═══
  if (['escala_likert', 'sim_nao', 'multipla_escolha'].includes(pergunta.tipo)) {
    return 'sonnet';
  }

  // ═══ DEFAULT: Sonnet (mais barato) ═══
  return 'sonnet';
}
```

## 5.5 Custos por Modelo (Janeiro 2026)

| Modelo | Input (1M tokens) | Output (1M tokens) | Conversão (R$) |
|--------|-------------------|-------------------|----------------|
| Claude Opus 4.5 | $15.00 | $75.00 | × 6.0 |
| Claude Sonnet 4 | $3.00 | $15.00 | × 6.0 |

**Estimativa por agente:**
- Pergunta simples (Sonnet): ~R$ 0,08 - R$ 0,15
- Pergunta complexa (Opus): ~R$ 0,40 - R$ 0,80

## 5.6 Limites de Segurança

```typescript
const LIMITES_SEGURANCA = {
  custo_maximo_sessao: 100.00,     // R$ 100 por sessão
  tokens_maximo_sessao: 2_000_000, // 2M tokens
  agentes_maximo_entrevista: 500,  // 500 agentes por vez
  timeout_api: 60_000,             // 60 segundos
  tamanho_maximo_upload: 10_485_760, // 10MB

  // Alertas
  alerta_80_porcento: true,        // Avisar em 80% do limite
  pausar_100_porcento: true,       // Pausar automaticamente em 100%
};
```

## 5.7 Monitor de Custos em Tempo Real

```
┌────────────────────────────────────────────────────────────────┐
│ 💰 MONITOR DE CUSTOS                                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Progresso: ████████████░░░░░░░░ 62/100 agentes (62%)          │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ TOKENS CONSUMIDOS                                               │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Input:  245.320 tokens                                   │  │
│ │ Output: 89.450 tokens                                    │  │
│ │ Total:  334.770 tokens                                   │  │
│ └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ CUSTO POR MODELO                                               │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 🟣 Opus 4.5:   R$ 8,45  (23 chamadas)                    │  │
│ │ 🔵 Sonnet 4:   R$ 2,12  (39 chamadas)                    │  │
│ │ ────────────────────────────────────                     │  │
│ │ 💰 TOTAL:      R$ 10,57                                  │  │
│ └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ ESTIMATIVAS                                                     │
│ • Custo final estimado: R$ 17,05                               │
│ • Tempo restante: ~3 minutos                                   │
│                                                                 │
│ LIMITE DA SESSÃO: R$ 100,00                                    │
│ [██░░░░░░░░░░░░░░░░░░] 17% utilizado                          │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ [⏸️ Pausar]    [⏹️ Cancelar]    [📊 Ver Respostas]            │
└────────────────────────────────────────────────────────────────┘
```

## 5.8 Batch Processing

```typescript
async function executarEntrevistaBatch(
  agentes: Eleitor[],
  pergunta: Pergunta,
  onProgress: (progresso: Progresso) => void
) {
  const BATCH_SIZE = 10;      // Processar 10 por vez
  const DELAY_ENTRE_BATCHES = 500;  // 500ms entre lotes

  const resultados: Resposta[] = [];

  for (let i = 0; i < agentes.length; i += BATCH_SIZE) {
    // Verificar se foi pausado
    if (execucaoPausada) {
      await aguardarRetomada();
    }

    // Verificar limite de custo
    const custoAtual = calcularCusto(resultados);
    if (custoAtual >= LIMITES_SEGURANCA.custo_maximo_sessao * 0.8) {
      notificar('Atenção: 80% do limite de custo atingido');
    }
    if (custoAtual >= LIMITES_SEGURANCA.custo_maximo_sessao) {
      pausarExecucao('Limite de custo atingido');
      break;
    }

    // Processar batch
    const batch = agentes.slice(i, i + BATCH_SIZE);

    const respostasBatch = await Promise.all(
      batch.map(agente => processarAgente(agente, pergunta))
    );

    resultados.push(...respostasBatch);

    // Atualizar UI
    onProgress({
      processados: i + batch.length,
      total: agentes.length,
      custoAtual: calcularCusto(resultados),
      tokensUsados: contarTokens(resultados),
      tempoRestante: estimarTempoRestante(i, agentes.length),
    });

    // Delay para não estourar rate limit
    if (i + BATCH_SIZE < agentes.length) {
      await sleep(DELAY_ENTRE_BATCHES);
    }
  }

  return resultados;
}
```

---

# PARTE 6: MÓDULO 3 - RESULTADOS E ANÁLISES

## 6.1 Funcionalidades

| Funcionalidade | Descrição | Prioridade |
|----------------|-----------|------------|
| Dashboard de Resultados | Visão geral da sessão | ALTA |
| Análise Quantitativa | Estatísticas descritivas completas | ALTA |
| Correlações Automáticas | Matriz de correlação com R², p-valor | ALTA |
| Mapas de Calor Emocional | DIFERENCIAL - visualização única | ALTA |
| Caixa Voto Silencioso | DIFERENCIAL - quem vota mas não defende | ALTA |
| Caixa Ponto de Ruptura | DIFERENCIAL - linha vermelha de cada perfil | ALTA |
| Análise Qualitativa | Texto, sentimento, palavras | ALTA |
| Insights Automáticos | Descobertas via Claude Opus | ALTA |
| Segmentação | Resultados por subgrupo | MÉDIA |
| Exportação | PDF, Excel, JSON | MÉDIA |
| Comparação | Entre sessões diferentes | BAIXA |

## 6.2 Análises Quantitativas

### Estatísticas Descritivas
- Média, Mediana, Moda
- Desvio Padrão, Variância
- Quartis (Q1, Q2, Q3)
- Amplitude, Coeficiente de Variação
- Intervalo de Confiança (95%)
- Mínimo, Máximo

### Correlações Automáticas (20+)

O sistema testa automaticamente correlações entre:

| Variável 1 | Variável 2 | Métrica |
|------------|------------|---------|
| Escolaridade | Resposta | Pearson, Spearman |
| Renda | Resposta | Pearson, Spearman |
| Idade | Resposta | Pearson, Spearman |
| Religião | Resposta | Chi-quadrado |
| Orientação Política | Resposta | Chi-quadrado |
| Cluster | Resposta | Chi-quadrado |
| Susceptibilidade | Resposta | Pearson |
| RA | Resposta | Chi-quadrado |
| Posição Bolsonaro | Resposta | Chi-quadrado |
| Interesse Político | Resposta | Spearman |
| Gênero | Resposta | Chi-quadrado |
| Cor/Raça | Resposta | Chi-quadrado |

```typescript
interface AnaliseCorrelacao {
  variaveis: [string, string];
  coeficiente_pearson?: number;
  coeficiente_spearman?: number;
  chi_quadrado?: number;
  p_valor: number;
  r_quadrado?: number;
  significancia: 'alta' | 'media' | 'baixa' | 'nenhuma';
  interpretacao: string;  // Gerado por IA
}
```

### Testes Estatísticos
- Chi-quadrado (variáveis categóricas)
- ANOVA (comparação de grupos)
- Teste t (comparação de médias)
- Kruskal-Wallis (não paramétrico)
- Regressão linear (quando aplicável)

## 6.3 Mapas de Calor Emocional (DIFERENCIAL)

Visualização única que mostra a intensidade de sentimentos por grupo:

```
                    Segurança  Ameaça   Raiva   Indiferença  Esperança
                    ─────────  ──────   ─────   ───────────  ─────────
Evangélicos         ░░░░ 12%   ████ 45% ███ 28%  ░░░ 8%      █░░ 7%
Católicos           ███░ 35%   ██░░ 22% ░░░ 10%  ██░░ 18%    ██░ 15%
Sem Religião        ████ 42%   ░░░░ 8%  █░░ 12%  ███░ 25%    ███ 13%
Espíritas           ███░ 38%   █░░░ 15% ░░░ 5%   ██░░ 20%    ███ 22%

Legenda: ████ = Alta intensidade (>40%)  ░░░░ = Baixa (<15%)
```

```typescript
interface MapaCalorEmocional {
  dados: {
    grupo: string;              // Ex: "Evangélicos"
    sentimento: string;         // Ex: "Ameaça"
    intensidade: number;        // 0-100
    qtd_agentes: number;
    citacao_exemplo?: string;   // Citação representativa
  }[];

  // Metadados
  pergunta: string;
  total_respostas: number;
}
```

## 6.4 Caixa Especial: Voto Silencioso (DIFERENCIAL)

Identifica eleitores que:
- Concordam com pauta econômica de um lado
- Mas têm vergonha das pautas de costumes extremas
- Votam, mas não defendem publicamente

```typescript
interface VotoSilencioso {
  agente_id: string;
  agente_nome: string;
  perfil_resumido: string;

  // Análise
  concorda_economia: boolean;
  rejeita_costumes: boolean;
  probabilidade_voto_escondido: number;  // 0-100

  // Evidências
  citacao_reveladora: string;
  contradicoes_detectadas: string[];

  // Insight
  interpretacao: string;
}
```

**Visualização:**
```
┌────────────────────────────────────────────────────────────────┐
│ 🤫 VOTO SILENCIOSO                                             │
│ Eleitores que votam, mas não defendem publicamente             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Encontrados: 18 eleitores (4.5% da amostra)                    │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📊 Perfil típico:                                        │  │
│ │ • Concordam com política econômica da direita            │  │
│ │ • Rejeitam pautas extremas de costumes                   │  │
│ │ • Classe média, escolaridade superior                    │  │
│ │ • Votam, mas não colocam adesivo no carro                │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ 💬 Citação representativa:                                     │
│ "Vou votar nele porque a economia melhorou, mas aquelas        │
│  coisas que ele fala sobre mulher e gay eu ignoro. Não         │
│  defendo isso pra ninguém não."                                │
│  — Maria, 42 anos, Plano Piloto, administradora                │
│                                                                 │
│ [Ver todos os 18 perfis]                                       │
└────────────────────────────────────────────────────────────────┘
```

## 6.5 Caixa Especial: Ponto de Ruptura (DIFERENCIAL)

Identifica para cada perfil qual evento/notícia faria mudar de lado:

```typescript
interface PontoRuptura {
  agente_id: string;
  agente_nome: string;
  perfil_resumido: string;
  orientacao_atual: OrientacaoPolitica;

  // Análise
  linhas_vermelhas: string[];           // O que NÃO tolera
  gatilho_mudanca: string;              // O que faria mudar
  probabilidade_ruptura: number;        // 0-100

  // Evidências
  citacao_reveladora: string;
  valores_em_conflito: string[];

  // Insight
  vulnerabilidade: 'alta' | 'media' | 'baixa';
  estrategia_persuasao?: string;
}
```

**Visualização:**
```
┌────────────────────────────────────────────────────────────────┐
│ 💔 PONTOS DE RUPTURA                                           │
│ O que faria cada perfil mudar de lado                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔴 APOIADORES BOLSONARO - VULNERABILIDADES                     │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Linha vermelha #1: Aumento de impostos sobre casa própria│  │
│ │ • 73% dos apoiadores moderados                           │  │
│ │ • "Se mexer no meu patrimônio, acabou"                   │  │
│ │                                                          │  │
│ │ Linha vermelha #2: Perda de emprego/falência             │  │
│ │ • 68% dos autônomos e pequenos empresários               │  │
│ │ • "Se eu quebrar, ele perdeu meu voto"                   │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ 🔵 OPOSIÇÃO - VULNERABILIDADES                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Linha vermelha #1: Escândalo de corrupção do candidato   │  │
│ │ • 81% dos eleitores de centro-esquerda                   │  │
│ │ • "Não vou defender corrupto de novo"                    │  │
│ │                                                          │  │
│ │ Linha vermelha #2: Ameaça à segurança pública            │  │
│ │ • 54% dos moradores de periferia                         │  │
│ │ • "Bandido na rua é bandido na rua"                      │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Ver análise completa]                                         │
└────────────────────────────────────────────────────────────────┘
```

## 6.6 Análises Qualitativas

### Análise de Texto
- Frequência de palavras (excluindo stopwords)
- N-gramas mais frequentes (bigramas, trigramas)
- Comprimento médio de resposta
- Complexidade lexical

### Nuvem de Palavras
```typescript
interface PalavraFrequente {
  palavra: string;
  frequencia: number;
  percentual: number;
  sentimento: 'positivo' | 'negativo' | 'neutro';
}
```

### Análise de Sentimento
```typescript
interface AnaliseSentimento {
  resposta_id: string;
  agente_id: string;

  // Classificação geral
  sentimento: 'positivo' | 'neutro' | 'negativo';
  score: number;  // -1 a +1
  confianca: number;  // 0-100

  // Emoções específicas
  emocoes: {
    alegria: number;
    raiva: number;
    medo: number;
    tristeza: number;
    surpresa: number;
    nojo: number;
  };

  // Extração
  palavras_chave: string[];
  entidades_mencionadas: string[];
}
```

### Categorização Temática
- Identificação de temas emergentes
- Agrupamento de respostas similares
- Extração de citações representativas por tema

## 6.7 Insights Automáticos (via Claude Opus)

```typescript
interface Insight {
  tipo: 'descoberta' | 'alerta' | 'oportunidade' | 'correlacao' | 'ruptura';
  titulo: string;
  descricao: string;
  relevancia: 'alta' | 'media' | 'baixa';

  dados_suporte: {
    estatistica: string;
    valor: number;
    comparacao?: string;
  };

  recomendacao_pratica?: string;
  publico_alvo?: string;
}
```

**Exemplos de Insights Gerados:**
```
┌────────────────────────────────────────────────────────────────┐
│ 💡 INSIGHTS AUTOMÁTICOS                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔴 DESCOBERTA CRÍTICA                                          │
│ "Evangélicos de centro-esquerda (26 agentes) mostram 67%       │
│  de indecisão. Grupo com alto potencial de persuasão se        │
│  abordados por ECONOMIA, não por COSTUMES."                    │
│                                                                 │
│  📊 Correlação: r=0.72, p<0.01                                 │
│  🎯 Recomendação: Campanha focada em emprego e renda           │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🟡 PONTO DE RUPTURA                                            │
│ "Para 73% dos apoiadores moderados de Bolsonaro, a 'linha      │
│  vermelha' é aumento de impostos sobre a casa própria.         │
│  Tema extremamente sensível para este grupo."                  │
│                                                                 │
│  📊 Frequência de menção: 89 vezes em 120 respostas            │
│  🎯 Recomendação: Evitar qualquer menção a taxação imobiliária │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🟢 VOTO SILENCIOSO                                             │
│ "18 eleitores concordam com política econômica da direita      │
│  mas rejeitam pautas de costumes. Votam, mas não defendem      │
│  em público. Potencial 'voto envergonhado'."                   │
│                                                                 │
│  📊 4.5% da amostra, maioria classe média                      │
│  🎯 Recomendação: Pesquisas podem subestimar este grupo        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 6.8 Segmentação de Resultados

Visualização por qualquer subgrupo:

```
┌────────────────────────────────────────────────────────────────┐
│ SEGMENTAÇÃO: "Você votaria em Fulano?"                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Por Orientação Política                                        │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Esquerda:        SIM 72% ████████████░░░░ NÃO 28%       │  │
│ │ Centro-Esquerda: SIM 58% ██████████░░░░░░ NÃO 42%       │  │
│ │ Centro:          SIM 34% ██████░░░░░░░░░░ NÃO 66%       │  │
│ │ Centro-Direita:  SIM 18% ███░░░░░░░░░░░░░ NÃO 82%       │  │
│ │ Direita:         SIM 8%  █░░░░░░░░░░░░░░░ NÃO 92%       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Por Religião                                                   │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Católica:        SIM 42% ████████░░░░░░░░ NÃO 58%       │  │
│ │ Evangélica:      SIM 15% ██░░░░░░░░░░░░░░ NÃO 85%       │  │
│ │ Sem Religião:    SIM 61% ███████████░░░░░ NÃO 39%       │  │
│ │ Espírita:        SIM 55% ██████████░░░░░░ NÃO 45%       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Por Cluster Socioeconômico                                     │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ G1 (Alta):       SIM 28% █████░░░░░░░░░░░ NÃO 72%       │  │
│ │ G2 (Média-Alta): SIM 35% ██████░░░░░░░░░░ NÃO 65%       │  │
│ │ G3 (Média-Baixa):SIM 48% █████████░░░░░░░ NÃO 52%       │  │
│ │ G4 (Baixa):      SIM 52% ██████████░░░░░░ NÃO 48%       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 6.9 Gráficos Avançados

| Gráfico | Biblioteca | Uso |
|---------|------------|-----|
| Sankey Diagram | Plotly.js | Fluxo de votos por característica |
| Treemap | Recharts | Proporções hierárquicas |
| Radar Chart | Recharts | Perfil multidimensional |
| Violin Plot | Plotly.js | Distribuição por grupo |
| Heatmap | Plotly.js | Correlações, emoções |
| Word Cloud | react-wordcloud | Análise textual |
| Funnel | Recharts | Funil de conversão |
| Gauge | Recharts | Indicadores únicos |
| Pirâmide | Recharts | Distribuição etária |
| Box Plot | Plotly.js | Outliers e quartis |

## 6.10 Exportação

**Formatos Disponíveis:**

| Formato | Conteúdo | Uso |
|---------|----------|-----|
| PDF | Relatório visual com gráficos | Apresentações |
| Excel | Dados brutos + estatísticas | Análise externa |
| JSON | Dados estruturados completos | Integração |
| CSV | Dados tabulares simples | Importação |

**Estrutura do Relatório PDF:**
1. Capa com título e data
2. Resumo executivo (insights principais)
3. Metodologia (quem respondeu, quantos)
4. Resultados quantitativos (gráficos)
5. Resultados qualitativos (nuvem, sentimento)
6. Segmentações principais
7. Caixas especiais (voto silencioso, ruptura)
8. Conclusões e recomendações

---

# PARTE 7: PERSISTÊNCIA E BACKUP

## 7.1 IndexedDB (Dexie.js)

```typescript
import Dexie, { Table } from 'dexie';

interface DBSchema {
  agentes: Eleitor;
  sessoes: Sessao;
  questionarios: Questionario;
  respostas: Resposta;
  analises: Analise;
  configuracoes: Configuracao;
  backups: Backup;
}

class AgentesDB extends Dexie {
  agentes!: Table<Eleitor>;
  sessoes!: Table<Sessao>;
  questionarios!: Table<Questionario>;
  respostas!: Table<Resposta>;
  analises!: Table<Analise>;
  configuracoes!: Table<Configuracao>;
  backups!: Table<Backup>;

  constructor() {
    super('AgentesEleitoraisDB');

    this.version(1).stores({
      agentes: 'id, regiao_administrativa, cluster_socioeconomico, orientacao_politica, religiao',
      sessoes: 'id, criado_em, status',
      questionarios: 'id, criado_em',
      respostas: 'id, sessao_id, agente_id',
      analises: 'id, sessao_id, tipo',
      configuracoes: 'chave',
      backups: 'id, criado_em'
    });
  }
}

export const db = new AgentesDB();
```

## 7.2 Estrutura de Sessão

```typescript
interface Sessao {
  id: string;
  titulo: string;
  descricao?: string;
  questionario_id: string;

  // Seleção de agentes
  agentes_ids: string[];
  filtros_aplicados: FiltrosAgentes;
  total_agentes: number;

  // Status
  status: 'rascunho' | 'executando' | 'pausada' | 'concluida' | 'erro';
  progresso: number;  // 0-100
  erro_mensagem?: string;

  // Timestamps
  criado_em: Date;
  iniciado_em?: Date;
  pausado_em?: Date;
  concluido_em?: Date;

  // Métricas
  custo_total: number;
  tokens_input: number;
  tokens_output: number;
  chamadas_opus: number;
  chamadas_sonnet: number;
  tempo_execucao_ms: number;

  // Estatísticas rápidas
  estatisticas: {
    total_respostas: number;
    media_tokens_por_resposta: number;
    sentimento_geral?: 'positivo' | 'negativo' | 'neutro';
  };
}
```

## 7.3 Backup e Restauração

**Exportação Completa:**
```typescript
async function exportarBackupCompleto(): Promise<Blob> {
  const backup = {
    versao: '3.0',
    formato: 'sistema-agentes-eleitorais',
    data_geracao: new Date().toISOString(),

    dados: {
      agentes: await db.agentes.toArray(),
      sessoes: await db.sessoes.toArray(),
      questionarios: await db.questionarios.toArray(),
      respostas: await db.respostas.toArray(),
      analises: await db.analises.toArray(),
      configuracoes: await db.configuracoes.toArray(),
    },

    metadados: {
      total_agentes: await db.agentes.count(),
      total_sessoes: await db.sessoes.count(),
      total_respostas: await db.respostas.count(),
    }
  };

  const json = JSON.stringify(backup, null, 2);
  return new Blob([json], { type: 'application/json' });
}
```

**Importação de Backup:**
```typescript
async function importarBackup(file: File): Promise<ResultadoImportacao> {
  const content = await file.text();
  const backup = JSON.parse(content);

  // Validar versão
  if (!['1.0', '2.0', '3.0'].includes(backup.versao)) {
    throw new Error('Versão de backup incompatível');
  }

  // Validar estrutura
  const schema = backupSchema.safeParse(backup);
  if (!schema.success) {
    throw new Error('Estrutura de backup inválida');
  }

  // Importar com transação
  await db.transaction('rw',
    [db.agentes, db.sessoes, db.questionarios, db.respostas, db.analises, db.configuracoes],
    async () => {
      // Limpar banco atual (opcional, pode ser merge)
      await db.agentes.clear();
      await db.sessoes.clear();
      await db.questionarios.clear();
      await db.respostas.clear();
      await db.analises.clear();
      await db.configuracoes.clear();

      // Importar dados
      await db.agentes.bulkAdd(backup.dados.agentes);
      await db.sessoes.bulkAdd(backup.dados.sessoes);
      await db.questionarios.bulkAdd(backup.dados.questionarios);
      await db.respostas.bulkAdd(backup.dados.respostas);
      await db.analises.bulkAdd(backup.dados.analises);
      await db.configuracoes.bulkPut(backup.dados.configuracoes);
    }
  );

  return {
    sucesso: true,
    agentes_importados: backup.dados.agentes.length,
    sessoes_importadas: backup.dados.sessoes.length,
  };
}
```

---

# PARTE 8: SEGURANÇA

## 8.1 Autenticação (NextAuth.js)

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Credenciais de teste
        if (credentials?.username === 'professorigor' &&
            credentials?.password === 'professorigor') {
          return {
            id: '1',
            name: 'Professor Igor',
            email: 'professorigor@sistema.com',
            role: 'admin'
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

## 8.2 Proteção da API Key

**Arquivo .env.local (NÃO commitar):**
```bash
# API Anthropic (NUNCA expor)
ANTHROPIC_API_KEY=[REDACTED]

# NextAuth
NEXTAUTH_SECRET=gerar_um_secret_aleatorio_muito_longo_aqui
NEXTAUTH_URL=http://localhost:3000

# Ambiente
NODE_ENV=development
```

**Arquivo .env.example (commitar):**
```bash
# API Anthropic
ANTHROPIC_API_KEY=sua_chave_aqui

# NextAuth
NEXTAUTH_SECRET=gerar_um_secret_aleatorio_aqui
NEXTAUTH_URL=http://localhost:3000
```

**Arquivo .gitignore:**
```gitignore
# Secrets - NUNCA commitar
.env
.env.local
.env.production
.env*.local

# Dependências
node_modules/
.pnp/

# Build
.next/
out/
build/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDEs
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Cache
.cache/
```

## 8.3 Validação de Dados (Zod)

```typescript
import { z } from 'zod';

// Schema do Eleitor
export const eleitorSchema = z.object({
  id: z.string(),
  nome: z.string().min(3).max(100),
  idade: z.number().min(16).max(120),
  genero: z.enum(['masculino', 'feminino']),
  cor_raca: z.enum(['parda', 'branca', 'preta', 'amarela', 'indigena']),
  regiao_administrativa: z.string(),
  cluster_socioeconomico: z.enum(['G1_alta', 'G2_media_alta', 'G3_media_baixa', 'G4_baixa']),
  escolaridade: z.enum([
    'fundamental_ou_sem_instrucao',
    'medio_completo_ou_sup_incompleto',
    'superior_completo_ou_pos'
  ]),
  profissao: z.string(),
  ocupacao_vinculo: z.string(),
  renda_salarios_minimos: z.string(),
  religiao: z.string(),
  estado_civil: z.string(),
  filhos: z.number().min(0).max(20),
  orientacao_politica: z.enum([
    'esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'
  ]),
  posicao_bolsonaro: z.enum([
    'apoiador_forte', 'apoiador_moderado', 'neutro',
    'critico_moderado', 'critico_forte'
  ]),
  interesse_politico: z.enum(['baixo', 'medio', 'alto']),
  tolerancia_nuance: z.enum(['baixa', 'media', 'alta']),
  estilo_decisao: z.enum([
    'identitario', 'pragmatico', 'moral', 'economico', 'emocional'
  ]),
  valores: z.array(z.string()),
  preocupacoes: z.array(z.string()),
  medos: z.array(z.string()),
  vieses_cognitivos: z.array(z.string()),
  susceptibilidade_desinformacao: z.number().min(1).max(10),
  fontes_informacao: z.array(z.string()),
  meio_transporte: z.string(),
  tempo_deslocamento_trabalho: z.string(),
  voto_facultativo: z.boolean(),
  conflito_identitario: z.boolean(),
  historia_resumida: z.string().min(50),
  instrucao_comportamental: z.string(),
});

// Schema do Upload
export const uploadAgentesSchema = z.object({
  agentes: z.array(eleitorSchema).min(1).max(500),
});

// Schema da Entrevista
export const entrevistaSchema = z.object({
  pergunta: z.string().min(10).max(5000),
  agentes_ids: z.array(z.string()).min(1).max(500),
  tipo: z.enum(['quantitativa', 'qualitativa', 'mista']),
  instrucoes_extras: z.string().optional(),
});
```

## 8.4 Limites de Segurança

| Limite | Valor | Razão |
|--------|-------|-------|
| Custo máximo por sessão | R$ 100,00 | Controle de gastos |
| Tokens máximo por sessão | 2.000.000 | Controle de gastos |
| Agentes máximo por entrevista | 500 | Performance |
| Agentes máximo por upload | 500 | Performance |
| Timeout de API Claude | 60 segundos | Evitar hanging |
| Rate limit (chamadas) | 100/hora | Rate limit Anthropic |
| Tamanho máximo de arquivo | 10 MB | Performance |

---

# PARTE 9: RESPONSIVIDADE MOBILE

## 9.1 Breakpoints

```typescript
const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Desktop large
  '2xl': '1536px' // Desktop extra large
};
```

## 9.2 Adaptações por Dispositivo

| Componente | Desktop | Mobile |
|------------|---------|--------|
| Sidebar | Fixa lateral (256px) | Drawer bottom/hamburger |
| Tabela de Agentes | Todas colunas visíveis | Cards empilhados |
| Gráficos | Full width, hover | Touch, scroll horizontal |
| Filtros | Painel lateral | Modal fullscreen |
| Monitor de Custos | Card fixo no canto | Toast + badge |
| Formulários | 2-3 colunas | 1 coluna |
| Modais | Centralizados | Fullscreen |

## 9.3 Touch-Friendly

- Botões mínimo 44x44px
- Áreas de toque expandidas
- Swipe para navegação em listas
- Pull-to-refresh em listas
- Pinch-zoom em gráficos
- Gestos intuitivos

---

# PARTE 10: PERFORMANCE

## 10.1 Virtualização de Lista (TanStack Virtual)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function AgentesListaVirtual({ agentes }: { agentes: Eleitor[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: agentes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,  // Altura estimada do card
    overscan: 5,              // Itens extras renderizados
  });

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <AgenteCard agente={agentes[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 10.2 Otimizações

| Técnica | Onde | Impacto |
|---------|------|---------|
| Virtualização | Lista de agentes | ALTO |
| Lazy loading | Gráficos Plotly | MÉDIO |
| Memoização | Filtros computados | MÉDIO |
| Code splitting | Módulos | MÉDIO |
| Debounce | Busca textual (300ms) | MÉDIO |
| Batch processing | Entrevistas | ALTO |
| IndexedDB | Persistência local | ALTO |
| Image optimization | Avatares | BAIXO |

---

# PARTE 11: DEPLOY

## 11.1 Vercel

**Por que Vercel?**
- Deploy automático ao push no GitHub
- Plano gratuito suficiente
- Edge Functions para API routes
- Domínio gratuito: projeto.vercel.app
- SSL automático
- CI/CD integrado

**Configuração (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic-api-key",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

## 11.2 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 11.3 Variáveis no Vercel

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `ANTHROPIC_API_KEY` | Secret | Chave da API Claude |
| `NEXTAUTH_SECRET` | Secret | Chave do NextAuth |
| `NEXTAUTH_URL` | Plain | URL do deploy |

---

# PARTE 12: CRONOGRAMA DE DESENVOLVIMENTO

## Fase 1: Setup e Fundação (2-3 horas)
- [ ] Criar projeto Next.js 14 com TypeScript
- [ ] Configurar Tailwind CSS + shadcn/ui (tema escuro)
- [ ] Estrutura de pastas completa
- [ ] Setup de stores (Zustand)
- [ ] Setup IndexedDB (Dexie)
- [ ] Importar 400 agentes do JSON
- [ ] Autenticação NextAuth (login professorigor)
- [ ] Layout base (Sidebar, Header, responsivo)

## Fase 2: Módulo de Agentes (4-5 horas)
- [ ] Lista virtualizada (TanStack Virtual)
- [ ] Sistema de 20+ filtros
- [ ] Cards visuais dos agentes
- [ ] Perfil individual completo
- [ ] Gráficos de proporções (10+ gráficos)
- [ ] Mapa do DF interativo
- [ ] Upload de agentes (JSON/TXT) com validação
- [ ] Geração automática via Claude
- [ ] Backup/Restauração

## Fase 3: Módulo de Entrevistas (4-5 horas)
- [ ] Formulário de questionário (7 tipos)
- [ ] Seleção de respondentes com filtros
- [ ] Integração com API Claude (SDK)
- [ ] Chain of Thought (4 etapas)
- [ ] Instruções anti-convergência
- [ ] Monitor de execução em tempo real
- [ ] Calculadora de custos (R$ e tokens)
- [ ] Batch processing (lotes de 10)
- [ ] Controles pausar/retomar
- [ ] Limites de segurança

## Fase 4: Módulo de Resultados (5-6 horas)
- [ ] Dashboard de resultados
- [ ] Análises quantitativas completas
- [ ] Correlações automáticas (20+)
- [ ] Mapas de calor emocional
- [ ] Caixa Voto Silencioso
- [ ] Caixa Ponto de Ruptura
- [ ] Análise de sentimento
- [ ] Nuvem de palavras
- [ ] Gráficos avançados (Sankey, Violin, etc)
- [ ] Insights automáticos (Claude Opus)
- [ ] Segmentação por subgrupo
- [ ] Exportação (PDF, Excel, JSON)

## Fase 5: Polish e Deploy (2-3 horas)
- [ ] Responsividade mobile completa
- [ ] Animações (Framer Motion)
- [ ] Loading states e skeletons
- [ ] Tratamento de erros
- [ ] Testes básicos
- [ ] Otimizações de performance
- [ ] GitHub repository
- [ ] GitHub Actions CI/CD
- [ ] Deploy Vercel
- [ ] Verificação final

**Tempo Total Estimado: 17-22 horas de desenvolvimento**

---

# PARTE 13: CHECKLIST DE ENTREGA

## Funcionalidades Core

- [ ] Login funcional (professorigor/professorigor)
- [ ] Dashboard com resumo do sistema
- [ ] Lista de 400 agentes carregados
- [ ] Virtualização funcionando (scroll suave)
- [ ] 20+ filtros operacionais
- [ ] Perfil individual completo
- [ ] Upload de agentes (JSON/TXT)
- [ ] Geração automática de agentes
- [ ] 10+ gráficos de proporções
- [ ] Mapa do DF interativo
- [ ] Criar e executar entrevistas
- [ ] Chain of Thought nas respostas
- [ ] Monitor de custos em tempo real
- [ ] Batch processing funcionando
- [ ] Análises quantitativas completas
- [ ] Correlações automáticas
- [ ] Mapas de calor emocional
- [ ] Caixa Voto Silencioso
- [ ] Caixa Ponto de Ruptura
- [ ] Análise de sentimento
- [ ] Nuvem de palavras
- [ ] Insights automáticos
- [ ] Exportação de resultados
- [ ] Histórico de sessões

## Qualidade

- [ ] Interface 100% em português BR
- [ ] Tema escuro elegante
- [ ] Efeito "UAU" visual
- [ ] Responsivo (desktop + mobile)
- [ ] Performance aceitável (< 3s load)
- [ ] Sem erros de console
- [ ] API key segura (nunca exposta)
- [ ] Limites de custo funcionando
- [ ] Dados persistidos localmente
- [ ] Backup/restauração operacional

## Deploy

- [ ] Repositório GitHub criado
- [ ] GitHub Actions configurado
- [ ] Deploy Vercel funcional
- [ ] URL pública acessível
- [ ] SSL ativo (HTTPS)
- [ ] Variáveis de ambiente configuradas

---

# PARTE 14: REFERÊNCIAS

## Arquivos de Dados

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| Banco de agentes | `/data/eleitores-df-400.json` | 400 eleitores sintéticos |
| Arquivo existente | `C:\Agentes\agentes\banco-eleitores-df.json` | Mesmo conteúdo |

## Documentos de Referência

| Documento | Versão | Conteúdo |
|-----------|--------|----------|
| Planejamento v1.0 | Original | Estrutura técnica básica |
| Planejamento v2.0 | Revisado | Sistema cognitivo, caixas especiais |
| Este documento | v3.0 Consolidado | Tudo unificado |

## API Keys

| Serviço | Variável | Nota |
|---------|----------|------|
| Anthropic Claude | `ANTHROPIC_API_KEY` | Já fornecida pelo cliente |
| NextAuth | `NEXTAUTH_SECRET` | Gerar aleatório |

---

# PARTE 15: RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Custo de API alto | Média | Alto | Limite R$100/sessão, estimativa antes |
| Rate limit Anthropic | Média | Médio | Batch de 10, delay 500ms |
| Performance 1000+ agentes | Baixa | Médio | Virtualização TanStack |
| Respostas genéricas | Alta | Alto | Chain of Thought + Anti-convergência |
| Perda de dados | Baixa | Alto | Backup automático, IndexedDB |
| API key exposta | Baixa | Crítico | Server-side only, .gitignore |
| Mobile não funciona | Média | Médio | Testes em dispositivos reais |

---

# CONCLUSÃO

Este documento consolida TODOS os requisitos para o Sistema de Agentes Eleitorais Sintéticos do DF:

1. **Arquitetura**: Next.js 14 + TypeScript + Tailwind + shadcn/ui
2. **Diferencial**: Chain of Thought cognitivo, Mapas de Calor Emocional, Caixas Especiais
3. **Módulos**: Agentes (400+), Entrevistas (Claude), Resultados (Estatísticas + Insights)
4. **Segurança**: API key protegida, limites de custo, validação Zod
5. **Deploy**: Vercel + GitHub Actions

**Próximo Passo**: Aprovação do cliente para início do desenvolvimento autônomo.

---

**Documento preparado para handoff de desenvolvimento.**
**Versão**: 3.0 Consolidada
**Data**: 13/01/2026
