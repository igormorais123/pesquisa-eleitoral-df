# FAQ - Perguntas Frequentes

Respostas para as dúvidas mais comuns sobre o sistema.

---

## Geral

### O que é este sistema?

O **Pesquisa Eleitoral DF 2026** é uma plataforma que simula pesquisas de opinião usando **1000 eleitores virtuais** (agentes de IA). Cada agente tem um perfil realista baseado em dados demográficos do Distrito Federal.

### Para quem é destinado?

- Cientistas políticos e pesquisadores
- Analistas de campanha
- Estudantes de ciência política
- Profissionais de marketing político
- Jornalistas especializados

### Os resultados são previsões reais?

**Não.** O sistema simula como os perfis criados responderiam, não o eleitorado real. Use como ferramenta de análise e teste de hipóteses, não como substituto de pesquisas tradicionais.

### Quanto custa usar?

O sistema em si é gratuito. Os custos vêm da **API Claude da Anthropic**:

| Operação | Custo Estimado |
|----------|----------------|
| 1 pergunta × 1000 eleitores | R$ 12-35 |
| Pesquisa completa (5 perguntas) | R$ 25-75 |
| Geração de insights | R$ 2-10 |

Você precisa ter uma chave de API da Anthropic.

---

## Eleitores/Agentes

### Quantos eleitores existem no sistema?

O sistema vem com **1000 eleitores** pré-configurados, representando a diversidade do Distrito Federal em termos de:
- Regiões administrativas (33 RAs)
- Classes sociais (G1 a G4)
- Orientações políticas (esquerda a direita)
- Religiões, idades, profissões, etc.

### Posso criar mais eleitores?

Sim! Você pode:
1. **Gerar via IA**: Use a página "Gerar" no menu Eleitores
2. **Importar JSON**: Faça upload de um arquivo com novos perfis
3. **Via API**: Use o endpoint POST `/api/v1/eleitores`

### Os perfis são de pessoas reais?

**Não.** Todos os perfis são **100% fictícios**, gerados por IA. Nomes, histórias e características são inventados para representar arquétipos do eleitorado do DF.

### Como os agentes "decidem" suas respostas?

Os agentes usam um processo de **4 etapas cognitivas**:

1. **Atenção**: Prestaria atenção neste assunto?
2. **Viés**: Confirma ou ameaça minhas crenças?
3. **Emoção**: Como isso me faz sentir?
4. **Decisão**: Qual é minha resposta genuína?

Veja a [documentação do sistema cognitivo](cognicao/4-etapas-cognitivas.md).

### Por que algumas respostas parecem "rudes" ou "extremas"?

Por design. Eleitores reais podem ser:
- Impacientes e rudes
- Mal-informados ou desinformados
- Extremistas em suas posições
- Emocionalmente reativos

O sistema **não filtra** essas características para manter autenticidade. Veja as [regras anti-convergência](cognicao/regras-anti-convergencia.md).

---

## Entrevistas

### Quais tipos de pergunta posso fazer?

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Escala** | Nota de 0-10 | "Quanto você confia no governador?" |
| **Múltipla escolha** | Selecionar uma opção | "Em quem votaria?" |
| **Sim/Não** | Resposta binária | "Você votaria em fulano?" |
| **Aberta** | Texto livre | "O que te preocupa?" |

### Quantas perguntas posso fazer por entrevista?

Não há limite técnico, mas considere:
- Cada pergunta = custo adicional
- Mais perguntas = mais tempo de execução
- Recomendado: 3-7 perguntas por entrevista

### Posso selecionar apenas alguns eleitores?

Sim! Use os filtros para selecionar por:
- Região administrativa
- Classe social (cluster)
- Orientação política
- Idade, gênero, religião
- E mais 15+ filtros

### Quanto tempo demora uma pesquisa?

Depende do número de eleitores e perguntas:

| Eleitores × Perguntas | Tempo Estimado |
|----------------------|----------------|
| 100 × 3 | ~5 minutos |
| 500 × 3 | ~25 minutos |
| 1000 × 3 | ~50 minutos |
| 1000 × 5 | ~90 minutos |

### Posso pausar uma pesquisa em andamento?

Sim! Use os botões:
- **Pausar**: Interrompe temporariamente
- **Retomar**: Continua de onde parou
- **Cancelar**: Encerra definitivamente

---

## Resultados

### Que tipo de análise o sistema gera?

**Quantitativas:**
- Médias, medianas, desvio padrão
- Distribuição de respostas
- Correlações entre variáveis
- Crosstabs (cruzamentos)

**Qualitativas:**
- Análise de sentimentos
- Palavras mais frequentes
- Temas identificados
- Citações representativas

**Insights:**
- Padrões identificados por IA
- Votos silenciosos
- Pontos de ruptura

### O que são "votos silenciosos"?

São eleitores cujo perfil sugere uma posição, mas que declaram outra (ou "não sei") na pesquisa. Exemplos:
- Conservador que não declara voto em candidato de direita
- Eleitor de oposição em região governista que se diz "indeciso"

### O que são "pontos de ruptura"?

São eventos hipotéticos que fariam um grupo mudar de posição. Exemplos:
- "Escândalo de corrupção comprovado" → 65% dos apoiadores moderados abandonariam
- "Proposta de emprego convincente" → 40% dos críticos moderados reconsiderariam

### Posso exportar os dados?

Sim! Formatos disponíveis:
- **Excel (.xlsx)**: Dados brutos + análises
- **PDF**: Relatório formatado
- **CSV**: Para importar em outros sistemas
- **JSON**: Via API

---

## Técnico

### Preciso saber programar?

**Não para uso básico.** A interface web permite:
- Explorar eleitores
- Criar entrevistas
- Ver resultados

**Sim para customização avançada:**
- Criar novos eleitores via JSON
- Integrar via API
- Modificar prompts

### Quais são os requisitos de sistema?

**Para rodar localmente:**
- Docker e Docker Compose
- 4GB de RAM mínimo (8GB recomendado)
- 10GB de disco

**Para desenvolvimento:**
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Como faço backup dos dados?

Veja o [guia de backup](deployment/backup-restore.md). Resumo:

```bash
# Backup do banco
docker exec pesquisa-db pg_dump -U postgres pesquisa_eleitoral > backup.sql

# Backup dos eleitores
cp agentes/banco-eleitores-df.json backup/
```

### O sistema funciona offline?

**Parcialmente.** Você pode:
- ✅ Navegar eleitores (cache local)
- ✅ Ver resultados anteriores
- ❌ Executar novas entrevistas (requer API Claude)
- ❌ Gerar novos eleitores

---

## Custos e API

### De onde vêm os custos?

Os custos vêm da **API Claude da Anthropic**. Cada vez que um eleitor "responde" uma pergunta, o sistema faz uma chamada à API.

### Como obtenho uma chave de API?

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta
3. Vá em "API Keys"
4. Clique em "Create Key"
5. Adicione créditos (cartão de crédito)
6. Copie a chave para o arquivo `.env`

### Posso definir um limite de gastos?

Sim! Ao iniciar uma entrevista, defina `limite_custo_reais`. O sistema para automaticamente ao atingir o limite.

### Por que algumas respostas são mais caras?

Respostas mais longas = mais tokens = mais custo. Perguntas abertas geram respostas mais longas que perguntas de escala.

---

## Problemas Comuns

### "Erro de autenticação" no login

1. Verifique usuário e senha (`admin` / `admin123`)
2. Verifique se o backend está rodando
3. Verifique a URL da API no frontend

### "IA não configurada" (Claude Code ou API)

O projeto suporta 2 modos:

1) **Recomendado (assinatura):** `IA_PROVIDER=claude_code`
   - requer `claude` instalado e autenticado (`claude setup-token` + `/login`)

2) **Fallback:** `IA_PROVIDER=anthropic_api`
   - requer `CLAUDE_API_KEY` (começa com `sk-ant-api03-`)

Depois de alterar `.env`, reinicie os containers/servicos.

### Entrevista não inicia

1. Verifique se há eleitores selecionados
2. Verifique logs do backend
3. Verifique se a API key é válida

### Respostas muito genéricas

Isso pode indicar problema com as regras anti-convergência. Verifique:
1. O prompt está completo?
2. As instruções comportamentais estão sendo passadas?
3. Tente um perfil mais extremo para testar

Veja mais em [Troubleshooting](deployment/troubleshooting.md).

---

## Ética e Limitações

### É ético usar este sistema?

**Sim, para usos legítimos:**
- ✅ Pesquisa acadêmica
- ✅ Testes de mensagens de campanha
- ✅ Educação política
- ✅ Jornalismo investigativo

**Não para usos problemáticos:**
- ❌ Criar bots de desinformação
- ❌ Manipular debates online
- ❌ Substituir pesquisas reais em decisões críticas

### Quais são as limitações?

1. **Não é previsão**: Simula perfis, não o eleitorado real
2. **Vieses do modelo**: Claude tem seus próprios vieses
3. **Dados sintéticos**: Perfis são fictícios, não estatisticamente representativos
4. **Contexto temporal**: Não captura eventos em tempo real

### Os dados são privados?

- Os perfis de eleitores são **fictícios** (não há dados pessoais reais)
- Suas pesquisas ficam no **seu servidor/banco**
- As chamadas à API Claude são processadas pela Anthropic (veja política deles)

---

## Suporte

### Onde reporto bugs?

[GitHub Issues](https://github.com/igormorais123/pesquisa-eleitoral-df/issues)

### Onde encontro mais documentação?

- [Guia de Primeiros Passos](guia-usuario/01-primeiros-passos.md)
- [Referência da API](api/README.md)
- [Troubleshooting](deployment/troubleshooting.md)

### Posso contribuir com o projeto?

Sim! O projeto é open source. Veja as guidelines de contribuição no repositório.

---

*Última atualização: Janeiro 2026*
