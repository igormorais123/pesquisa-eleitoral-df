# Guia de Primeiros Passos

Aprenda a usar o Sistema de Pesquisa Eleitoral DF 2026 em 10 minutos.

---

## O Que é Este Sistema?

O **Pesquisa Eleitoral DF 2026** é uma plataforma que simula pesquisas de opinião usando **1000 eleitores virtuais** (agentes de IA). Cada eleitor tem um perfil completo baseado em dados reais do Distrito Federal.

### Para Quem é?

- Cientistas políticos e pesquisadores
- Analistas de campanha
- Estudantes de ciência política
- Profissionais de marketing político

### O Que Você Pode Fazer?

1. **Explorar Eleitores**: Visualizar e filtrar os 1000 perfis
2. **Criar Entrevistas**: Formular perguntas de pesquisa
3. **Executar Pesquisas**: Os agentes de IA respondem como eleitores reais
4. **Analisar Resultados**: Gráficos, correlações e insights automáticos

---

## Passo 1: Acessando o Sistema

### 1.1 Abra o Sistema

Acesse: **http://localhost:3000** (ou o endereço fornecido)

### 1.2 Faça Login

Use as credenciais de demonstração:

```
Usuário: admin
Senha: admin123
```

### 1.3 Conheça a Interface

Após login, você verá o **Dashboard** com:

- **Menu Lateral**: Navegação principal
- **Área Central**: Conteúdo da página atual
- **Header**: Informações do usuário e logout

---

## Passo 2: Explorando os Eleitores

### 2.1 Acesse a Lista de Eleitores

No menu lateral, clique em **"Eleitores"**.

### 2.2 Visualize os Perfis

Você verá cards com os 1000 eleitores. Cada card mostra:

- Nome e foto
- Idade, região e profissão
- Orientação política
- Cluster socioeconômico

### 2.3 Use os Filtros

No painel esquerdo, aplique filtros para encontrar perfis específicos:

| Filtro | Exemplo |
|--------|---------|
| Idade | 18-35 anos |
| Região | Ceilândia, Taguatinga |
| Renda | G4 (baixa renda) |
| Orientação | Esquerda, Centro |
| Posição Bolsonaro | Crítico forte |

### 2.4 Veja um Perfil Completo

Clique em um card para ver todos os 60+ atributos do eleitor:

- **Dados Pessoais**: Nome, idade, profissão
- **Perfil Político**: Orientação, valores, preocupações
- **Perfil Psicológico**: Vieses, medos, susceptibilidade
- **História**: Narrativa que explica suas posições

---

## Passo 3: Criando Sua Primeira Entrevista

### 3.1 Acesse "Nova Entrevista"

No menu lateral, clique em **"Entrevistas"** → **"Nova Entrevista"**.

### 3.2 Configure a Entrevista

Preencha os campos:

| Campo | Exemplo |
|-------|---------|
| Título | "Intenção de Voto - Janeiro 2026" |
| Tipo | Mista (quantitativa + qualitativa) |
| Descrição | "Pesquisa sobre candidatos ao governo" |

### 3.3 Adicione Perguntas

Clique em **"Adicionar Pergunta"** e configure:

**Pergunta 1 (Múltipla Escolha):**
```
Texto: "Se a eleição fosse hoje, em quem você votaria?"
Tipo: Múltipla Escolha
Opções:
  - Candidato A (situação)
  - Candidato B (oposição)
  - Candidato C (terceira via)
  - Branco/Nulo
  - Não sei
```

**Pergunta 2 (Escala):**
```
Texto: "De 0 a 10, quanto você confia no atual governador?"
Tipo: Escala
Mínimo: 0
Máximo: 10
```

**Pergunta 3 (Aberta):**
```
Texto: "O que mais te preocupa em relação ao futuro do DF?"
Tipo: Aberta
```

### 3.4 Selecione os Eleitores

Use os filtros para selecionar quem responderá:

- **Amostra representativa**: Selecione todos (1000)
- **Segmento específico**: Filtre por região, renda, etc.

### 3.5 Salve a Entrevista

Clique em **"Criar Entrevista"**. Ela será salva como rascunho.

---

## Passo 4: Executando a Pesquisa

### 4.1 Acesse a Entrevista

Em **"Entrevistas"**, encontre sua entrevista e clique nela.

### 4.2 Verifique o Custo Estimado

O sistema mostrará uma estimativa de custo em reais:

```
Estimativa:
- 3 perguntas × 1000 eleitores = 3.000 interações
- Custo estimado: R$ 35,00 - R$ 75,00
```

### 4.3 Inicie a Execução

Clique em **"Iniciar Pesquisa"** e configure:

| Parâmetro | Recomendação |
|-----------|--------------|
| Limite de Custo | R$ 50,00 (segurança) |
| Tamanho do Lote | 10 (padrão) |
| Delay entre Lotes | 500ms |

### 4.4 Acompanhe o Progresso

A tela de execução mostra em tempo real:

- **Barra de progresso**: % concluído
- **Respostas**: Chegando uma a uma
- **Custo acumulado**: Em reais
- **Tempo restante**: Estimativa

---

## Passo 5: Analisando Resultados

### 5.1 Acesse os Resultados

Quando a pesquisa terminar, clique em **"Ver Resultados"**.

### 5.2 Explore as Visualizações

**Gráfico de Barras** (Intenção de Voto):
- Mostra distribuição das respostas
- Cores indicam cada candidato

**Mapa de Calor** (Por Região):
- Cruza região administrativa com intenção de voto
- Identifica redutos eleitorais

**Análise de Sentimentos**:
- Classifica respostas abertas em positivo/negativo/neutro
- Mostra palavras mais frequentes

### 5.3 Leia os Insights Automáticos

O sistema gera insights como:

```
🔍 DESCOBERTA: Eleitores de G4 (baixa renda) em Ceilândia
   mostram 73% de rejeição ao candidato da situação.

⚠️ ALERTA: Votos silenciosos identificados - 12% dos
   eleitores de centro-direita não declaram voto.

📈 TENDÊNCIA: Candidato B tem crescimento consistente
   entre eleitores de 18-25 anos.
```

### 5.4 Exporte os Dados

Clique em **"Exportar"** para baixar:

- **Excel (.xlsx)**: Dados brutos para análise própria
- **PDF**: Relatório formatado
- **JSON**: Para integração com outros sistemas

---

## Dicas Importantes

### Sobre os Agentes

1. **São simulações, não previsões**: Os resultados refletem como os perfis responderiam, não o eleitorado real.

2. **Respostas autênticas**: Os agentes podem ser rudes, contraditórios ou irracionais - como eleitores reais.

3. **Vieses propositais**: Os perfis incluem vieses cognitivos que afetam suas respostas.

### Sobre Custos

1. **Monitore o consumo**: Cada interação com a IA tem custo.

2. **Use limites**: Sempre defina um limite de custo antes de executar.

3. **Teste pequeno primeiro**: Faça um piloto com 10-20 eleitores antes de rodar com todos.

### Sobre Resultados

1. **Correlações não são causas**: Se X correlaciona com Y, não significa que X causa Y.

2. **Margem de erro**: Com 1000 eleitores, considere margem de ~3%.

3. **Contexto importa**: Leia as respostas abertas para entender o "porquê".

---

## Próximos Passos

Agora que você completou o básico, explore:

1. [Entendendo os Eleitores](02-entendendo-eleitores.md) - Detalhes sobre os 1000 perfis
2. [Criando Entrevistas Avançadas](03-criando-entrevistas.md) - Tipos de pergunta e estratégias
3. [Interpretando Resultados](04-interpretando-resultados.md) - Como ler gráficos e insights
4. [Glossário](../glossario.md) - Termos técnicos explicados

---

## Precisa de Ajuda?

- **Documentação**: Você está aqui!
- **API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Issues**: [GitHub](https://github.com/igormorais123/pesquisa-eleitoral-df/issues)

---

*Última atualização: Janeiro 2026*
