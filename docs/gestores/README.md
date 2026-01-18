# Módulo de Gestores - Pesquisa sobre Funções Administrativas (PODC)

Este módulo integra a pesquisa sobre **Distribuição de Tempo entre Funções Administrativas nos Níveis Estratégico, Tático e Operacional**, permitindo reproduzir e expandir o estudo original utilizando a plataforma de pesquisa eleitoral.

---

## Visão Geral

### Objetivo
Investigar como gestores de diferentes níveis hierárquicos (estratégico, tático, operacional) distribuem seu tempo entre as quatro funções administrativas clássicas de Fayol:
- **Planejar**: Definição de objetivos, estratégias e planos futuros
- **Organizar**: Estruturação de recursos, processos e sistemas
- **Dirigir**: Liderança, coordenação, comunicação e negociação
- **Controlar**: Monitoramento, avaliação e correção de desvios

### Base de Dados
- **180 personas** de gestores (90 setor público + 90 setor privado)
- **60 por nível hierárquico** (estratégico, tático, operacional)
- Arquivo: `agentes/banco-gestores.json`

---

## Estrutura da Documentação

```
docs/gestores/
├── README.md                              ← Este arquivo
├── metodologia/
│   ├── CONTEXTO_ARTIGO.md                 ← Tese e contexto da pesquisa
│   ├── DADOS_BRUTOS.md                    ← Dados numéricos para citação
│   ├── INDICE_GRAFICOS.md                 ← Índice de figuras geradas
│   └── VERIFICACAO_COERENCIA_PERSONAS.md  ← Validação das personas
├── prompts/
│   └── PROMPTS_ORIGINAIS.md               ← Prompts para gerar personas e questionários
└── personas/
    ├── PERSONAS_PUBLICO_COMPLETO.md       ← 90 personas setor público
    └── PERSONAS_PRIVADO_COMPLETO.md       ← 90 personas setor privado
```

---

## Como Usar o Módulo

### 1. Acessar a Interface
Navegue para `/gestores` na aplicação. A interface permite:
- Visualizar todas as 180 personas
- Filtrar por **setor** (público/privado) e **nível** (estratégico/tático/operacional)
- Ver estatísticas e gráficos de distribuição PODC
- Selecionar personas para entrevistas

### 2. Filtros Disponíveis
| Filtro | Opções |
|--------|--------|
| Setor | Público, Privado |
| Nível Hierárquico | Estratégico, Tático, Operacional |
| Área de Atuação | gestao_pessoas, financeiro_orcamento, operacoes, etc. |
| Estilo de Liderança | Transformacional, Transacional, Situacional, etc. |

### 3. Realizar Entrevistas
1. Selecione gestores para pesquisa
2. Vá para `/gestores/entrevistas`
3. Escolha o template de questionário (PODC)
4. Execute as entrevistas com IA
5. Analise os resultados

---

## Reproduzindo a Pesquisa

### Passo 1: Gerar Novas Personas
Use os prompts em `prompts/PROMPTS_ORIGINAIS.md`:
- **Prompt 1**: Criação de Personas
- **Prompt 2**: Desenvolvimento do Questionário
- **Prompt 3**: Preenchimento Agêntico

### Passo 2: Aplicar Questionário
O questionário mede:
- Frequência de atividades específicas por função
- Horas semanais dedicadas a cada função
- Autoavaliação percentual (soma = 100%)
- Validação cruzada

### Passo 3: Analisar Resultados
Métricas principais:
- Distribuição percentual PODC por nível
- Comparação setor público vs. privado
- Índice de Autonomia Decisória
- Correlações entre funções

---

## Tese Principal

> As práticas administrativas contemporâneas divergem significativamente do modelo teórico clássico de Fayol, evidenciando paradigmas setoriais distintos: **o setor público prioriza accountability e controle**, enquanto **o setor privado enfatiza eficiência e organização**.

### Achados-Chave
1. **Nível Estratégico**: Mais tempo em Planejar (ambos setores)
2. **Nível Tático**: Equilíbrio entre Organizar e Dirigir
3. **Nível Operacional**: Predominância de Dirigir (execução)
4. **Diferença Setor**: Público enfatiza Controlar, Privado enfatiza Organizar

---

## Templates de Perguntas

### Template PODC (Funções Administrativas)
```json
{
  "nome": "Distribuição de Tempo PODC",
  "categoria": "gestores",
  "perguntas": [
    {
      "tipo": "percentual",
      "pergunta": "Como você distribui seu tempo entre as funções administrativas?",
      "opcoes": ["Planejar", "Organizar", "Dirigir", "Controlar"],
      "validacao": "soma_100"
    },
    {
      "tipo": "escala",
      "pergunta": "Com que frequência você define objetivos estratégicos?",
      "escala": ["Nunca", "Raramente", "Mensalmente", "Semanalmente", "Diariamente"]
    }
  ]
}
```

---

## Links Úteis

- **Página de Gestores**: `/gestores`
- **Entrevistas de Gestores**: `/gestores/entrevistas`
- **Banco de Dados**: `agentes/banco-gestores.json`
- **Personas Detalhadas**: `docs/gestores/personas/`
- **Prompts Originais**: `docs/gestores/prompts/PROMPTS_ORIGINAIS.md`

---

## Origem dos Dados

Este módulo foi integrado a partir do projeto de pesquisa acadêmica:

**"Distribuição de Tempo entre Funções Administrativas nos Níveis Estratégico, Tático e Operacional: Um Estudo com Agentes Generativos"**

- **Autor**: Igor Morais Vasconcelos
- **Instituição**: IDP Brasília - Doutorado em Gestão Pública
- **Metodologia**: Simulação social com agentes generativos (Claude)
- **Data**: Janeiro 2026
