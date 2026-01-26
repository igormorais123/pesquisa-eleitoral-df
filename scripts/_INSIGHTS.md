# _INSIGHTS.md - Scripts

**Ultima atualizacao**: Janeiro 2026

---

## Erros Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Organizacao
- `generators/` - Scripts de geracao de dados
- `data-quality/` - Validacao e correcao
- Raiz: Scripts operacionais (deploy, backup, etc)

### Linguagens
- Python: Geracao e processamento de dados
- PowerShell: Automacao Windows (deploy, dev)
- Batch: Atalhos para PowerShell

## Scripts Importantes

| Script | Proposito |
|--------|-----------|
| `deploy.ps1` | Deploy Vercel + Render |
| `dev.ps1` | Inicia ambiente local |
| `backup.ps1` | Backup de dados |
| `generators/gerar_eleitores_df_v4.py` | Gera eleitores |
| `pesquisa_governador_2026.py` | Simula pesquisa |

## Armadilhas Comuns

1. **Caminhos**: Scripts assumem execucao da raiz do projeto
2. **Encoding**: Usar UTF-8 para arquivos JSON
3. **Dependencias**: Verificar requirements antes de rodar
