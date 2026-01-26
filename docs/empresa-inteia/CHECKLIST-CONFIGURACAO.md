# Checklist de Configuração - INTEIA

Marque com [x] o que já fez:

## Email Empresarial (Google Workspace)
- [x] Criar conta no Google Workspace (workspace.google.com)
- [x] Informar domínio inteia.com.br
- [x] Criar email igor@inteia.com.br
- [x] Copiar código de verificação TXT

## Registro.br (DNS)
- [x] Fazer login no Registro.br
- [x] Ativar modo avançado de DNS
- [x] Adicionar registro A para Vercel (76.76.21.21)
- [x] Adicionar servidor de email Google (MX) - todos os 5 registros
- [x] Adicionar registro TXT de verificação do Google
- [x] Adicionar registro TXT do SPF (anti-spam)
- [x] Adicionar registro CNAME www para Vercel
- [x] Adicionar registro CNAME api para Render

## Verificação Google
- [ ] Verificar domínio no Google Admin
- [ ] Ativar Gmail no Google Workspace
- [ ] Testar envio de email

## Vercel
- [x] Adicionar domínio inteia.com.br no projeto
- [x] Adicionar domínio www.inteia.com.br no projeto
- [x] Verificar se domínios estão configurados
- [x] Atualizar variáveis para api.inteia.com.br

## Render (Backend API)
- [x] Adicionar domínio api.inteia.com.br no serviço
- [x] Verificar domínio (DNS CNAME configurado)

## Testes Finais
- [x] Acessar https://inteia.com.br (site funciona?)
- [x] Acessar https://www.inteia.com.br (site funciona?)
- [ ] Acessar https://api.inteia.com.br/health (backend funciona?)
- [ ] Enviar email de igor@inteia.com.br (email funciona?)
- [ ] Receber email em igor@inteia.com.br (email funciona?)

---

## Anotações

**Senha do Google Workspace:** _________________ (anote em local seguro!)

**Código de verificação Google:** `google-site-verification=a_stXiaZ9mkLZg-bjRc1erISre7QxCd5SMbXzw75-I0`

**Data de início:** 25/01/2026

**Transição DNS iniciada:** 25/01/2026 ~16:20 (aguardar ~2h para adicionar registros)

**Data de conclusão:** _____________

---

## Links Úteis

- Google Workspace: https://workspace.google.com
- Google Admin: https://admin.google.com
- Gmail: https://mail.google.com
- Registro.br: https://registro.br
- Vercel: https://vercel.com
