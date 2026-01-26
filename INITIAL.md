# Requisição de Feature - INTEIA

> Template para solicitar novas funcionalidades ao sistema.
> Preencha este arquivo e execute `/plan-feature INITIAL.md`

---

## FEATURE

<!-- Descreva o que você quer construir - seja específico sobre funcionalidade e requisitos -->

Exemplo:
> Adicionar filtro de orientação política na listagem de eleitores, permitindo
> filtrar por esquerda, centro-esquerda, centro, centro-direita e direita,
> com atualização em tempo real da lista.

---

## EXEMPLOS

<!-- Liste arquivos de exemplo que devem ser seguidos -->

| Arquivo | Como Usar |
|---------|-----------|
| `frontend/src/components/eleitores/FiltroRegiao.tsx` | Seguir padrão de componente de filtro |
| `backend/app/api/rotas/eleitores.py` | Seguir padrão de query params |

---

## DOCUMENTAÇÃO

<!-- Inclua links para documentação relevante, APIs ou recursos -->

- [Next.js App Router](https://nextjs.org/docs/app)
- [FastAPI Query Parameters](https://fastapi.tiangolo.com/tutorial/query-params/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## OUTRAS CONSIDERAÇÕES

<!-- Mencione gotchas, requisitos específicos ou coisas que a IA comumente perde -->

- [ ] Orientação política está no campo `orientacao_politica` (int de -5 a +5)
- [ ] Filtro deve ser combinável com outros filtros existentes
- [ ] Manter estado do filtro na URL para compartilhamento
- [ ] Labels em português: "Esquerda", "Centro", "Direita"

---

## CRITÉRIOS DE SUCESSO

<!-- Defina como saber que está pronto -->

- [ ] Filtro aparece na interface de listagem
- [ ] Seleção atualiza lista em tempo real
- [ ] Combinável com filtros de região e cluster
- [ ] Estado persiste na URL
- [ ] Testes unitários para componente
- [ ] Teste E2E do fluxo completo

---

## PRIORIDADE

<!-- Marque uma opção -->

- [ ] 🔴 Crítica - Bloqueia outras funcionalidades
- [ ] 🟡 Alta - Importante para próxima entrega
- [x] 🟢 Normal - Pode ser feita no fluxo normal
- [ ] ⚪ Baixa - Nice to have

---

*Após preencher, execute:*
```
/plan-feature INITIAL.md
```
