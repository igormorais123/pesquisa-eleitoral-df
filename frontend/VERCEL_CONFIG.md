# Configuracao do Vercel - Pesquisa Eleitoral DF

## Variaveis de Ambiente OBRIGATORIAS

Configure estas variaveis no dashboard do Vercel:
**Settings > Environment Variables**

### 1. SECRET_KEY (CRITICA!)

```
Nome: SECRET_KEY
Valor: (gere uma chave forte)
Ambiente: Production, Preview, Development
```

**Como gerar:**
```bash
# No terminal:
openssl rand -base64 32

# Ou use: https://generate-secret.vercel.app/32
```

**Por que e importante:**
- Assina os tokens JWT de autenticacao
- Sem esta variavel, o login sera INSTAVEL
- Cada instancia serverless pode usar chave diferente
- Tokens criados em uma instancia nao funcionam em outra

---

### 2. NEXT_PUBLIC_BACKEND_URL (CRITICA!)

```
Nome: NEXT_PUBLIC_BACKEND_URL
Valor: https://pesquisa-eleitoral-df-1.onrender.com
Ambiente: Production
```

**Por que e importante:**
- Redireciona requisicoes de API para o backend no Render
- Sem ela, apenas autenticacao funciona (local)
- Endpoints de eleitores, entrevistas, resultados vao falhar

---

### 3. NODE_ENV

```
Nome: NODE_ENV
Valor: production
Ambiente: Production
```

---

## Checklist de Deploy

1. [ ] SECRET_KEY configurada com valor forte
2. [ ] NEXT_PUBLIC_BACKEND_URL apontando para Render
3. [ ] NODE_ENV = production
4. [ ] Redeploy feito APOS configurar variaveis

## Importante

Apos adicionar/alterar variaveis de ambiente no Vercel:
1. Va em **Deployments**
2. Clique nos 3 pontos do ultimo deploy
3. Selecione **Redeploy**
4. Aguarde o novo deploy completar

As variaveis so fazem efeito apos um novo deploy!

## Verificar se funcionou

1. Acesse: https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app/login
2. Login: professorigor / professorigor
3. Se funcionar consistentemente, a configuracao esta correta

## Problema de "as vezes funciona, as vezes nao"

Este problema ocorre quando:
- SECRET_KEY nao esta definida no Vercel
- O codigo usa fallback: `'chave-secreta-padrao-desenvolvimento'`
- Mas serverless functions podem ter comportamento inconsistente
- Solucao: definir SECRET_KEY explicitamente
