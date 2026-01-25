# Guia de Configuração do Domínio inteia.com.br

Este guia vai te ajudar a configurar tudo passo a passo. Siga cada seção na ordem.

---

## PASSO 1: Criar Email Empresarial no Google Workspace

### 1.1 Acessar o Google Workspace
1. Abra o navegador
2. Vá para: **https://workspace.google.com/intl/pt-BR/**
3. Clique em **"Começar"** ou **"Iniciar teste grátis"**

### 1.2 Criar a conta do Workspace
1. Preencha:
   - **Nome da empresa:** INTEIA - Instituto de Treinamento e Estudos em IA
   - **Número de funcionários:** 1-10
   - **País:** Brasil
2. Clique em **Próximo**

### 1.3 Informar seus dados
1. Preencha:
   - **Nome:** Igor
   - **Sobrenome:** Morais Vasconcelos
   - **Email atual:** igormorais123@gmail.com
2. Clique em **Próximo**

### 1.4 Informar seu domínio
1. Selecione **"Sim, tenho um domínio que posso usar"**
2. Digite: **inteia.com.br**
3. Clique em **Próximo**

### 1.5 Criar seu email empresarial
1. Escolha seu endereço de email:
   - **Nome de usuário:** igor
   - **Resultado:** igor@inteia.com.br
2. Crie uma **senha forte** (anote ela!)
3. Clique em **Concordar e continuar**

### 1.6 Escolher o plano
- **Business Starter:** R$ 28,80/mês (suficiente para começar)
- **Business Standard:** R$ 57,60/mês (mais armazenamento)

> **Dica:** Comece com o Starter, você pode mudar depois.

---

## PASSO 2: Verificar o Domínio no Google

Após criar a conta, o Google vai pedir para você **verificar que é dono do domínio**.

### 2.1 Escolher método de verificação
1. O Google vai mostrar opções. Escolha: **"Adicionar registro TXT"**
2. O Google vai te dar um código tipo: `google-site-verification=XXXXXXXXXX`
3. **COPIE esse código** (você vai precisar no Passo 3)

---

## PASSO 3: Configurar o Registro.br

### 3.1 Acessar o Registro.br
1. Abra: **https://registro.br**
2. Faça login com sua conta

### 3.2 Acessar configuração do domínio
1. Clique em **"inteia.com.br"** na lista de domínios
2. Clique em **"Alterar servidores DNS"** ou **"Editar zona"**

### 3.3 Adicionar registro de verificação do Google
1. Clique em **"Adicionar registro"** ou **"Nova entrada"**
2. Preencha:
   - **Tipo:** TXT
   - **Nome:** @ (ou deixe vazio)
   - **Valor:** Cole o código do Google (google-site-verification=XXX)
3. Clique em **Salvar**

### 3.4 Adicionar registros MX (para email funcionar)
Adicione TODOS estes registros MX:

| Tipo | Nome | Valor | Prioridade |
|------|------|-------|------------|
| MX | @ | ASPMX.L.GOOGLE.COM | 1 |
| MX | @ | ALT1.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT2.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT3.ASPMX.L.GOOGLE.COM | 10 |
| MX | @ | ALT4.ASPMX.L.GOOGLE.COM | 10 |

### 3.5 Adicionar registro SPF (para email não cair em spam)
1. Adicione outro registro TXT:
   - **Tipo:** TXT
   - **Nome:** @
   - **Valor:** `v=spf1 include:_spf.google.com ~all`

### 3.6 Salvar e aguardar
1. Clique em **Salvar** todas as alterações
2. **Aguarde até 48 horas** para propagar (geralmente leva 1-4 horas)

---

## PASSO 4: Voltar ao Google e Verificar

### 4.1 Verificar domínio
1. Volte para o Google Workspace Admin: **https://admin.google.com**
2. Clique em **"Verificar domínio"** ou **"Verificar agora"**
3. Se aparecer erro, aguarde mais um pouco e tente novamente

### 4.2 Ativar Gmail
1. Após verificação, vá em **Apps > Google Workspace > Gmail**
2. Clique em **"Ativar"**
3. Aguarde alguns minutos

### 4.3 Testar seu email
1. Acesse: **https://mail.google.com**
2. Faça login com: **igor@inteia.com.br** e a senha que criou
3. Envie um email de teste para igormorais123@gmail.com

---

## PASSO 5: Configurar Site na Vercel

### 5.1 Acessar Vercel
1. Vá para: **https://vercel.com**
2. Faça login

### 5.2 Adicionar domínio ao projeto
1. Clique no projeto **"pesquisa-eleitoral-df"**
2. Vá em **Settings > Domains**
3. Digite: **inteia.com.br** e clique em **Add**
4. O Vercel vai mostrar registros DNS para adicionar

### 5.3 Voltar ao Registro.br
1. Adicione o registro que a Vercel pedir:

**Para domínio raiz (inteia.com.br):**
| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 76.76.21.21 |

**Para www (www.inteia.com.br):**
| Tipo | Nome | Valor |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |

### 5.4 Aguardar e verificar
1. Volte à Vercel
2. Clique em **"Refresh"** ou aguarde
3. Quando aparecer "Valid Configuration", está pronto!

---

## RESUMO DOS REGISTROS DNS NO REGISTRO.BR

Ao final, seu DNS deve ter estes registros:

| Tipo | Nome | Valor | Para quê |
|------|------|-------|----------|
| TXT | @ | google-site-verification=XXX | Verificar dono do domínio |
| TXT | @ | v=spf1 include:_spf.google.com ~all | Email não ir para spam |
| MX | @ | ASPMX.L.GOOGLE.COM (prioridade 1) | Email |
| MX | @ | ALT1.ASPMX.L.GOOGLE.COM (prioridade 5) | Email backup |
| MX | @ | ALT2.ASPMX.L.GOOGLE.COM (prioridade 5) | Email backup |
| MX | @ | ALT3.ASPMX.L.GOOGLE.COM (prioridade 10) | Email backup |
| MX | @ | ALT4.ASPMX.L.GOOGLE.COM (prioridade 10) | Email backup |
| A | @ | 76.76.21.21 | Site (Vercel) |
| CNAME | www | cname.vercel-dns.com | Site com www |

---

## PROBLEMAS COMUNS

### "Domínio não verificado"
- Aguarde mais tempo (até 48h)
- Verifique se digitou o código TXT corretamente

### "Email não chega"
- Verifique os registros MX
- Aguarde até 4 horas após configurar

### "Site não abre"
- Verifique o registro A
- Limpe o cache do navegador (Ctrl+Shift+Delete)

---

## PRECISA DE AJUDA?

Se travar em algum passo, me avise qual passo e qual erro aparece que eu te ajudo!

---

*Guia criado em 25/01/2026 para configuração do domínio inteia.com.br*
