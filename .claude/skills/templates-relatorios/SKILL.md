# SKILL: Templates de Relatórios INTEIA

> **Propósito**: Definir o padrão visual e estrutural de relatórios de inteligência da INTEIA, garantindo consistência, credibilidade e apresentação profissional.

---

## PADRÃO VISUAL INTEIA

### Design System Base

```css
/* Cores Primárias */
--amber: #d69e2e;           /* Cor da marca */
--amber-light: #f6e05e;
--amber-dark: #b7791f;

/* Cores Semânticas */
--success: #22c55e;         /* Verde - positivo */
--warning: #eab308;         /* Amarelo - atenção */
--danger: #ef4444;          /* Vermelho - crítico */
--info: #3b82f6;            /* Azul - informativo */

/* Tipografia */
font-family: 'Inter', -apple-system, sans-serif;

/* Bordas */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.5rem;
```

### Temas Obrigatórios

| Tema | Uso |
|------|-----|
| **Light** | Padrão para impressão |
| **Dark** | Leitura em tela |

**Alternância**: Botão no topo direito com ícones sol/lua.

---

## ESTRUTURA OBRIGATÓRIA DO RELATÓRIO

### 1. Cabeçalho (Hero Header)

```
┌────────────────────────────────────────────────────────┐
│ [Logo INTEIA]               [Pesquisador Responsável]  │
│ INTE[IA]                    Igor Morais Vasconcelos    │
│ Inteligência Estratégica    Presidente INTEIA          │
│                             igor@inteia.com.br         │
├────────────────────────────────────────────────────────┤
│ TÍTULO DO RELATÓRIO                                    │
│ Subtítulo descritivo                                   │
│                                                        │
│ 📅 Data  │  👥 Amostra  │  ⚡ Módulos  │ 🔒 Confidencial│
└────────────────────────────────────────────────────────┘
```

### 2. Resumo Executivo (PRIMEIRO!)

```
┌─ CONCLUSÃO PRINCIPAL ─────────────────────────────────┐
│ ⚠️ Análise do Agente de IA Helena Montenegro          │
│                                                        │
│ [Conclusão em 2-3 frases com os achados principais]   │
│                                                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │  56,9%  │ │  67,2%  │ │  82,6%  │                   │
│ │ Métrica1│ │ Métrica2│ │ Métrica3│                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
└────────────────────────────────────────────────────────┘
```

### 3. Recomendações Estratégicas (Logo após resumo)

**Ordem de prioridade**:
- 🔴 Urgente (vermelho)
- 🟡 Importante (amarelo)
- 🔵 Monitorar (azul)

### 4. Validação da Amostra

```
┌─ TRILHA DE AUDITORIA DOS DADOS ──────────────────────┐
│ ✓ 1.000 Eleitores Sintéticos                          │
│ ✓ ±3,1% Margem de Erro                               │
│ ✓ 95% Nível de Confiança                              │
│ ✓ 2,6M População Eleitoral DF                        │
│                                                        │
│ FONTES DE DADOS:                                       │
│ • IBGE 2024 - Distribuição demográfica                │
│ • TSE - Cadastro eleitoral                            │
│ • PNAD-DF - Perfil socioeconômico                     │
│                                                        │
│ METODOLOGIA:                                           │
│ • Estratificação por 60+ variáveis                    │
│ • Validação cruzada com dados oficiais                │
│ • Auditoria de coerência interna                      │
└────────────────────────────────────────────────────────┘
```

### 5. KPIs Principais (Cards visuais)

Grid de 4 cards com:
- Número grande
- Label descritivo
- Cor semântica (success/danger/warning/info)

### 6. Análises Demográficas

**60+ Categorias dos Agentes**:

| Categoria | Tipo | Descrição |
|-----------|------|-----------|
| **Demográficos** | | |
| nome | texto | Nome completo |
| idade | número | 16-80+ |
| genero | enum | masculino/feminino |
| cor_raca | enum | branco/pardo/preto/amarelo/indígena |
| **Geográficos** | | |
| regiao_administrativa | enum | 31 RAs do DF |
| local_referencia | texto | Bairro/setor específico |
| tempo_residencia | enum | Nativo/migrante recente/etc |
| **Socioeconômicos** | | |
| cluster_socioeconomico | enum | G1_alta/G2_media_alta/G3_media_baixa/G4_baixa |
| escolaridade | enum | 8 níveis |
| profissao | texto | Ocupação |
| ocupacao_vinculo | enum | CLT/autônomo/servidor/etc |
| renda_salarios_minimos | enum | Faixas de renda |
| **Políticos** | | |
| orientacao_politica | enum | esquerda/centro-esquerda/centro/centro-direita/direita |
| posicao_bolsonaro | enum | apoiador_fervoroso/simpatizante/neutro/critico/critico_forte |
| posicao_lula | enum | idem |
| interesse_politico | enum | muito_alto/alto/medio/baixo/nenhum |
| participacao_politica | enum | Ativista/engajado/passivo/alienado |
| historico_voto | array | Votos anteriores |
| **Psicológicos** | | |
| valores | array | Família/honestidade/liberdade/etc |
| preocupacoes | array | Saúde/emprego/violência/etc |
| medos | array | Desemprego/doença/etc |
| vieses_cognitivos | array | Confirmação/ancoragem/etc |
| estilo_decisao | enum | Racional/emocional/impulsivo |
| tolerancia_corrupcao | enum | Zero/baixa/media/alta |
| **Comportamentais** | | |
| fontes_informacao | array | TV/WhatsApp/redes/etc |
| susceptibilidade_desinformacao | enum | Baixa/media/alta |
| confianca_instituicoes | object | Por instituição |
| **Religiosos** | | |
| religiao | enum | católica/evangélica/espírita/etc |
| frequencia_religiosa | enum | Frequente/ocasional/raro/nunca |
| influencia_religiosa_voto | enum | Alta/media/baixa/nenhuma |
| **Narrativos** | | |
| historia_resumida | texto | Background do eleitor |
| instrucao_comportamental | texto | Como o agente deve responder |

### 7. Gráficos

**Tipos obrigatórios**:
- Doughnut para proporções (2-3 categorias)
- Barras horizontais para rankings
- Pizza para distribuições (5+ categorias)
- Linhas para tendências temporais

**Biblioteca**: Chart.js

### 8. Análise do Agente de IA

```
┌─ HELENA MONTENEGRO ─────────────────────────────────────┐
│ 🤖 Agente de IA Avançado | Cientista Política           │
│                                                          │
│ [Análise estruturada em mensagens numeradas]            │
│                                                          │
│ 1. SUA MAIOR FORÇA: ...                                  │
│ 2. SUA MAIOR VULNERABILIDADE: ...                        │
│ 3. RECOMENDAÇÃO FINAL: ...                               │
└──────────────────────────────────────────────────────────┘
```

**IMPORTANTE**: NÃO exibir o prompt do agente de IA no relatório público.

### 9. Chatbot de Consultoria

```html
<!-- Botão flutuante no canto inferior direito -->
<button class="chat-fab" onclick="openChat()">
    💬 Consultar Especialista
</button>

<!-- Modal de chat -->
<div id="chatModal" class="chat-modal">
    <div class="chat-header">
        <span>Helena Montenegro - Consultoria</span>
        <button onclick="closeChat()">✕</button>
    </div>
    <div class="chat-messages"></div>
    <div class="chat-input">
        <input type="text" placeholder="Pergunte sobre os dados...">
        <button>Enviar</button>
    </div>
</div>
```

### 10. Rodapé

```
┌────────────────────────────────────────────────────────┐
│ [Logo IA]  INTEIA - Inteligência Estratégica           │
│            CNPJ: 63.918.490/0001-20                    │
│            SHN Quadra 2 Bloco F, Sala 625/626          │
│            Brasília/DF                                 │
│                                                        │
│                              🔒 Confidencial           │
│                              © 2026 INTEIA             │
└────────────────────────────────────────────────────────┘
```

---

## TRILHA DE AUDITORIA OBRIGATÓRIA

### Seção de Verificação de Dados

Todo relatório DEVE incluir:

```markdown
## METODOLOGIA E VERIFICAÇÃO

### Fontes de Dados
| Fonte | URL/Referência | Data de Acesso | Dado Utilizado |
|-------|----------------|----------------|----------------|
| IBGE | ibge.gov.br/estatisticas | 2026-01-20 | Distribuição demográfica DF |
| TSE | tse.jus.br/eleitorado | 2026-01-20 | Cadastro eleitoral |
| PNAD | ibge.gov.br/pnad | 2026-01-20 | Renda e escolaridade |

### Processo de Validação
1. ✓ Dados cruzados com fontes oficiais
2. ✓ Consistência interna verificada
3. ✓ Outliers identificados e tratados
4. ✓ Margem de erro calculada

### Limitações Conhecidas
- Agentes sintéticos não capturam eventos recentes
- Viés de seleção mitigado por estratificação
- Resultados válidos para cenário específico

### Declaração Anti-Alucinação
Este relatório foi gerado com base em:
- Dados verificáveis e rastreáveis
- Metodologia estatística documentada
- Validação cruzada de resultados
- Revisão humana dos outputs de IA
```

---

## CONTROLES DO RELATÓRIO

### Barra Superior

```
┌──────────────────────────────────────────────────────┐
│                    [☀️ Tema] [🖨️ Imprimir] [💬 Chat] │
└──────────────────────────────────────────────────────┘
```

### Funcionalidades Obrigatórias

1. **Alternância Claro/Escuro** - Botão com ícone sol/lua
2. **Impressão A4** - CSS @media print otimizado
3. **Chat com IA** - Botão flutuante para consultas

---

## DADOS DA EMPRESA

### INTEIA

| Campo | Valor |
|-------|-------|
| **Nome** | INTEIA - Instituto de Inteligência Artificial |
| **CNPJ** | 63.918.490/0001-20 |
| **Endereço** | SHN Quadra 2 Bloco F, Sala 625/626 - Brasília/DF |
| **Site** | https://inteia.com.br |
| **API** | https://api.inteia.com.br |
| **Email** | igor@inteia.com.br |
| **Presidente** | Igor Morais Vasconcelos |

### Pesquisador Responsável

| Campo | Valor |
|-------|-------|
| **Nome** | Igor Morais Vasconcelos |
| **Cargo** | Presidente INTEIA |
| **Email** | igor@inteia.com.br |
| **Site** | inteia.com.br |

---

## CHECKLIST DE RELATÓRIO

Antes de publicar, verificar:

- [ ] Logo INTEIA presente no cabeçalho
- [ ] Dados do pesquisador responsável
- [ ] Resumo executivo NO INÍCIO
- [ ] Recomendações priorizadas (🔴🟡🔵)
- [ ] Trilha de auditoria com fontes
- [ ] Validação estatística documentada
- [ ] 60+ categorias dos agentes mencionadas
- [ ] Cruzamentos demográficos presentes
- [ ] Prompt do agente REMOVIDO
- [ ] Chatbot de consultoria ativo
- [ ] Botões tema/impressão funcionando
- [ ] CSS de impressão A4 testado
- [ ] Rodapé com CNPJ e endereço
- [ ] Classificação (Confidencial/Público)

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Descrição |
|---------|-----------|
| `frontend/public/resultados-stress-test/index.html` | Template base de referência |
| `frontend/src/styles/globals.css` | Variáveis CSS do sistema |
| `frontend/tailwind.config.ts` | Cores e configurações |

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
