# _CHECKLIST.md - Agentes (Dados JSON)

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Nenhuma tarefa critica

## Importante

- [ ] Verificar conformidade com PDAD atualizado
- [ ] Adicionar mais diversidade de perfis
- [ ] Documentar schema completo dos campos

## Qualidade de Dados

- [ ] Rodar verificacao de coerencia
- [ ] Corrigir inconsistencias detectadas
- [ ] Validar distribuicao por RA

## Melhorias Futuras

- [ ] Gerar eleitores para outros estados
- [ ] Adicionar perfis de gestores publicos
- [ ] Versionar dados com changelog

## Concluido

- [x] Geracao inicial de 1000+ eleitores
- [x] Validacao contra dados PDAD
- [x] Correcoes de inconsistencias
- [x] Banco de candidatos 2026

## Notas

- Arquivo principal: `banco-eleitores-df.json`
- Scripts de geracao em `/scripts/generators/`
- Scripts de validacao em `/scripts/data-quality/`
