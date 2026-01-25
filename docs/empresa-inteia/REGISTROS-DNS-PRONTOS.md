# Registros DNS para inteia.com.br - PRONTOS PARA ADICIONAR

**IMPORTANTE:** Aguarde a transição do DNS terminar (~18:20 de 25/01/2026)

Quando o Registro.br permitir, adicione estes registros na ordem:

---

## 1. VERIFICAÇÃO DO GOOGLE (TXT)

| Campo | Valor |
|-------|-------|
| Tipo | TXT |
| Nome | @ (ou deixe vazio) |
| Valor | `google-site-verification=a_stXiaZ9mkLZg-bjRc1erISre7QxCd5SMbXzw75-I0` |

---

## 2. REGISTROS MX (EMAIL) - Adicione os 5

| Tipo | Nome | Valor | Prioridade |
|------|------|-------|------------|
| MX | @ | ASPMX.L.GOOGLE.COM | 1 |
| MX | @ | ALT1.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT2.ASPMX.L.GOOGLE.COM | 5 |
| MX | @ | ALT3.ASPMX.L.GOOGLE.COM | 10 |
| MX | @ | ALT4.ASPMX.L.GOOGLE.COM | 10 |

---

## 3. SPF (ANTI-SPAM) - TXT

| Campo | Valor |
|-------|-------|
| Tipo | TXT |
| Nome | @ (ou deixe vazio) |
| Valor | `v=spf1 include:_spf.google.com ~all` |

---

## 4. SITE VERCEL - Registro A

| Campo | Valor |
|-------|-------|
| Tipo | A |
| Nome | @ (ou deixe vazio) |
| Valor | `76.76.21.21` |

---

## 5. WWW VERCEL - CNAME

| Campo | Valor |
|-------|-------|
| Tipo | CNAME |
| Nome | www |
| Valor | `cname.vercel-dns.com` |

---

## COMO ADICIONAR NO REGISTRO.BR

1. Acesse: https://registro.br/painel/dominios?dominio=inteia.com.br
2. Clique em "Configurar zona DNS"
3. No modo avançado, clique em "+ Adicionar" ou "Nova entrada"
4. Preencha os campos conforme as tabelas acima
5. Clique em "Salvar" após cada registro

---

## APÓS ADICIONAR OS REGISTROS

1. Volte ao Google Workspace (admin.google.com)
2. Clique em "Verificar domínio"
3. Aguarde até 4 horas para propagação completa
4. Teste o email igor@inteia.com.br

---

*Gerado em 25/01/2026 - Transição DNS estimada para ~18:20*
