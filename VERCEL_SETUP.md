# Configuração do Vercel - Pesquisa Eleitoral DF

## Variáveis de Ambiente Obrigatórias

Configure no dashboard do Vercel (Settings > Environment Variables):

### API Claude (OBRIGATÓRIO para chat funcionar)

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

ou

```
CLAUDE_API_KEY=sk-ant-api03-...
```

### Backend (para outras funcionalidades)

```
NEXT_PUBLIC_BACKEND_URL=https://pesquisa-eleitoral-df-1.onrender.com
```

### JWT (opcional, para autenticação)

```
SECRET_KEY=sua-chave-secreta-segura-em-producao
```

---

## URLs Disponíveis

Após o deploy, as seguintes URLs estarão disponíveis:

| Recurso | URL |
|---------|-----|
| **Dashboard Principal** | `https://seu-projeto.vercel.app/` |
| **Relatório INTEIA** | `https://seu-projeto.vercel.app/inteia` |
| **Chat API (POST)** | `https://seu-projeto.vercel.app/api/chat-inteligencia` |

---

## Testando o Chat

```bash
curl -X POST https://seu-projeto.vercel.app/api/chat-inteligencia \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Qual a situação atual de Celina Leão nas pesquisas?"}'
```

Resposta esperada:
```json
{
  "resposta": "Sou Helena Strategos, sua analista de inteligência eleitoral...",
  "sessao_id": "uuid-da-sessao",
  "tokens_usados": 1234
}
```

---

## Deploy Automático

O Vercel está configurado para deploy automático no push para `main`:

1. Push para GitHub → Vercel detecta
2. Build Next.js (`npm run build`)
3. Deploy para CDN global
4. URLs atualizadas em ~2 minutos

---

## Custos Estimados

### Vercel (Free Tier)
- 100GB bandwidth/mês: GRÁTIS
- Serverless Functions: 100 GB-hours/mês GRÁTIS
- Build: 6000 min/mês GRÁTIS

### Claude API (Opus 4.5)
- Input: $15/1M tokens
- Output: $75/1M tokens
- **Estimativa**: ~$0.50-2.00 por conversa completa

---

## Troubleshooting

### Chat retorna erro 500
1. Verifique se `ANTHROPIC_API_KEY` está configurada
2. Verifique os logs em Vercel > Functions > Logs

### Relatório não carrega
1. Verifique se `/public/relatorio-inteia/index.html` existe
2. Limpe o cache: `vercel --force`

### Build falha
1. Verifique `npm run build` localmente
2. Verifique logs detalhados no Vercel

---

## Contato

Igor Morais Vasconcelos
- Instagram: @igormorais123
- Lattes: http://lattes.cnpq.br/2845626717136000
