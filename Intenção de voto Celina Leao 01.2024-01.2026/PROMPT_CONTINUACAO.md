# Prompts para Continuar o Trabalho - INTEIA v2.0

## Contexto Rápido
Você está trabalhando no projeto `pesquisa-eleitoral-df`, subpasta `Intenção de voto Celina Leao 01.2024-01.2026`. É um relatório de inteligência estratégica sobre pesquisas eleitorais da candidata Celina Leão (PP) ao governo do DF 2026. Já existem 10 gráficos, um CSV de pesquisas, um JSON de eventos e um HTML v1.0. Precisa evoluir para v2.0.

---

## PROMPT 1 — Criar dados de mídia

```
Leia o arquivo SESSION_STATE.md em:
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\SESSION_STATE.md

Depois crie o arquivo dados/midia_presenca.csv nessa mesma pasta do projeto com colunas:
mes,ano,mencoes_imprensa,posts_redes_sociais,sentimento_positivo,sentimento_negativo,sentimento_neutro,seguidores_instagram,seguidores_x,seguidores_tiktok,intencao_voto_celina

Preencha com estimativas mensais de jul/2024 a jan/2026 (19 linhas). Use estes marcos reais:
- Jul-Dez/2024: baixa presença de mídia, ~10-25 menções/mês, sentimento majoritariamente neutro
- Jan/2025: início do investimento em MKT, presença começa a subir
- Mar/2025: absolvição criminal = pico positivo de sentimento
- Jun/2025: entrada de Fred Linhares = aumento de menções mas sentimento mais negativo
- Ago-Set/2025: pico de mídia e sentimento positivo (pesquisas mostram até 54%)
- Out/2025: empate com Arruda = sentimento negativo sobe
- Dez/2025: recuperação, sentimento volta a positivo

Seguidores crescendo gradualmente: Instagram de ~150K para 197K, X de ~10K para 14K, TikTok de ~1K para 3.4K.
A coluna intencao_voto_celina deve refletir os dados reais: 22.0, 30.0, 36.6, 31.1, 27.5, 37.2, 49.0, 32.2, 40.0 (usar a do cenário 1 de cada data distinta).
```

---

## PROMPT 2 — Criar script de gráficos de mídia

```
Leia o script existente em:
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\scripts\analise_completa.py

Use o mesmo padrão visual (cores INTEIA, marca d'água, estilo seaborn) e crie o arquivo:
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\scripts\analise_midia.py

O script deve ler dados/midia_presenca.csv e gerar 3 gráficos na pasta graficos/:

1. 11_mencoes_midia.png — Barras empilhadas por mês mostrando menções na imprensa + posts em redes sociais. Eixo X = meses, cores diferenciando imprensa vs redes.

2. 12_midia_vs_votos.png — Gráfico dual-axis: eixo esquerdo = total de menções (barras), eixo direito = intenção de voto Celina (linha). Mostrar correlação visual entre presença na mídia e crescimento nas pesquisas.

3. 13_heatmap_sentimento.png — Heatmap com meses no eixo X e categorias (positivo/negativo/neutro) no eixo Y. Valores = percentual de cada sentimento naquele mês. Usar colormap azul-vermelho.

Salve em dpi=150 e use os mesmos padrões do analise_completa.py (CORES dict, adicionar_marca_agua, etc).
Depois execute o script com Python.
```

---

## PROMPT 3 — Reescrever HTML v2.0

```
Esta é a tarefa principal. Leia todos estes arquivos:
- C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\relatorio\relatorio-final.html
- C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\SESSION_STATE.md

Agora REESCREVA COMPLETAMENTE o arquivo relatorio-final.html com TODAS estas mudanças:

### BRANDING
- Logo "INTEIA" no header com destaque visual em "IA" (usar cor diferente, negrito, ou separação visual tipo int·EIA)
- Sidebar lateral fixa à esquerda com texto "INTEIA" rotacionado 90° verticalmente, estilo marca de periódico acadêmico, visível ao rolar a página. CSS position:fixed, fundo escuro, texto branco.

### AUTOR (no header)
- Nome: Igor Morais Vasconcelos PhD IDP
- Áreas: Administração Pública · Direito · Economia · Política · Ensino
- Linha: Inteligência Artificial
- Marca: INTEIA
- Links: Instagram @igormorais123 (https://instagram.com/igormorais123), Lattes (http://lattes.cnpq.br/), GitHub OpenCode Academy (https://github.com/OpenCodeAcademy)

### DESIGN (inspirado nas apresentações do Claude/Anthropic)
- Fundo: gradientes suaves entre branco e cinza muito claro
- Tipografia: Inter ou system-ui, pesos variados, espaçamento generoso
- Cards com sombras suaves e bordas arredondadas (16px)
- Cores: manter a paleta azul existente mas adicionar tons de roxo/índigo para modernizar
- Transições suaves em hover
- Seções com padding amplo (40px+)

### CONTEÚDO NOVO — Seção de Análise de Mídia (inserir como seção 6, antes da timeline)
Título: "Análise Qualitativa de Mídia e Redes Sociais"
Incluir:
- Cards com números de seguidores: Instagram 197K, X 14K, TikTok 3.4K
- Texto analítico sobre presença na mídia e correlação com pesquisas
- 3 containers para os gráficos 11, 12, 13 (com legenda)
- Análise de sentimento: texto descritivo sobre períodos positivos/negativos
- Insight box sobre correlação mídia × pesquisas eleitorais

### IMAGENS
- Todas as 13 imagens (01_ a 13_) devem ser referenciadas como ../graficos/NOME.png
- (Numa etapa posterior serão convertidas para base64 se necessário)

### BOTÃO DOWNLOAD PDF
- Botão fixo no canto superior direito "Baixar PDF"
- Ao clicar: window.print()
- CSS @media print otimizado: esconder sidebar, botão, chat; forçar cores; page-break entre seções

### CHAT COM IA
- Interface de chat no canto inferior direito (botão flutuante que abre/fecha)
- Design: bolha redonda com ícone, abre painel de chat
- Input de API key do usuário (campo no topo do chat, salva em localStorage)
- Mensagens do sistema com contexto da pesquisa embutido (resumo dos dados principais)
- Chamadas à API Anthropic (https://api.anthropic.com/v1/messages) via fetch client-side
- Model: claude-sonnet-4-20250514
- System prompt embutido: "Você é o assistente INTEIA. Responda sobre a pesquisa eleitoral de Celina Leão para governadora do DF 2026. Dados: média 38.4%, pré-MKT 26%, pós-MKT 39.9%, crescimento +13.9pp, pico 54% em set/2025. Institutos: Paraná Pesquisas, Real Time Big Data, Instituto Opinião, Colectta. Principais eventos: absolvição criminal mar/2025, entrada Fred Linhares jun/2025, empate Arruda out/2025, recuperação dez/2025."
- Estilo visual limpo, mensagens com bolhas, scroll automático

### REVISÃO DE TEXTO
- Corrigir TODOS os textos para português com acentos corretos (o HTML v1.0 não tem acentos)
- "Intencao" → "Intenção", "Analise" → "Análise", "Sumario" → "Sumário", etc.
- Verificar dados numéricos contra o CSV real
- Manter linguagem formal e acadêmica

O HTML deve ser COMPLETAMENTE standalone (sem dependências externas além das imagens).
Usar CSS interno, JavaScript interno. Sem CDN, sem frameworks.
```

---

## PROMPT 4 — Converter imagens para base64 e embutir no HTML

```
Leia todos os 13 arquivos PNG da pasta:
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\graficos\

Converta cada um para base64 e substitua no HTML as referências ../graficos/NOME.png por data:image/png;base64,DADOS.

Use um script Python para fazer isso:
1. Ler o HTML
2. Para cada <img src="../graficos/XX_*.png">, ler o arquivo PNG correspondente
3. Converter para base64
4. Substituir o src pelo data URI
5. Salvar o HTML atualizado

Isso torna o relatório 100% standalone (um único arquivo HTML).
```

---

## PROMPT 5 — Deploy GitHub + Render

```
Tenho MCPs de GitHub e Render configurados.

1. GITHUB: Crie um repositório público chamado "relatorio-inteia-celina-2026" na minha conta (use o MCP github create_repository). Depois faça push de todos os arquivos da pasta:
C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\

Estrutura no repo:
- /relatorio/relatorio-final.html (o HTML v2.0 com base64)
- /dados/*.csv, *.json
- /scripts/*.py
- /graficos/*.png
- README.md (breve, título INTEIA, descrição do projeto)

2. RENDER: Use o MCP render para criar um static site apontando para o repo GitHub. O diretório de publicação deve ser "relatorio" e o arquivo principal "relatorio-final.html".

Retorne a URL pública do Render quando estiver pronto.
```

---

## Ordem de Execução
1 → 2 → 3 → 4 → 5 (sequencial, cada um depende do anterior)

## Notas Importantes
- Todos os textos e respostas devem ser em **português do Brasil**
- O projeto fica em `C:\Users\igorm\pesquisa-eleitoral-df\Intenção de voto Celina Leao 01.2024-01.2026\`
- Tem um CLAUDE.md na raiz do projeto com autorização total para todas as operações
- O Python disponível é o do sistema Windows (verificar com `python --version`)
- As bibliotecas matplotlib, pandas, numpy, seaborn devem estar instaladas (instalar se necessário com `pip install`)
