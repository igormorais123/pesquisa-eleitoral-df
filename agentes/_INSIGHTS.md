# _INSIGHTS.md - Agentes (Dados JSON)

**Ultima atualizacao**: Janeiro 2026

---

## Erros Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Eleitores Sinteticos
- 1000+ perfis gerados por IA
- Baseados em dados PDAD do DF
- **NAO SAO PESSOAS REAIS**

### Atributos (60+)
- Demograficos: nome, idade, genero, cor_raca, RA
- Socioeconomicos: cluster, escolaridade, renda
- Politicos: orientacao, posicao_bolsonaro
- Psicologicos: vieses, medos, valores
- Comportamentais: susceptibilidade, fontes_info

### Formato JSON
- Array de objetos
- IDs unicos por eleitor
- Campos padronizados

## Dados Importantes

### Distribuicao por RA
Top 5 RAs:
1. Ceilandia: ~41 eleitores
2. Samambaia: ~32 eleitores
3. Plano Piloto: ~29 eleitores
4. Taguatinga: ~28 eleitores
5. Planaltina: ~27 eleitores

### Clusters Socioeconomicos
| Cluster | % |
|---------|---|
| A (alta) | 5% |
| B | 15% |
| C | 35% |
| D | 30% |
| E (baixa) | 15% |

## Armadilhas Comuns

1. **Tamanho do arquivo**: ~15MB, nao carregar tudo no frontend
2. **Dados sensiveis**: Nao confundir com dados reais
3. **Atualizacoes**: Regenerar via scripts se necessario
