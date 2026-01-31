# > GPS IA: Scripts Utilitarios

**Tipo**: Scripts Python e PowerShell  
**Proposito**: Automacao, geracao de dados, deploy e manutencao

---

## Navegacao Rapida

| Destino | Descricao |
|---------|-----------|
| [Raiz](../_INDEX.md) | Voltar ao indice principal |
| [Backend](../backend/_INDEX.md) | API FastAPI |
| [Frontend](../frontend/_INDEX.md) | Next.js App |
| [Agentes](../agentes/_INDEX.md) | Dados JSON |

---

## Scripts PowerShell (Operacoes)

| Arquivo | Descricao | Uso |
|---------|-----------|-----|
| [deploy.ps1](deploy.ps1) | Deploy completo (Vercel + Render) | `.\scripts\deploy.ps1` |
| [dev.ps1](dev.ps1) | Inicia ambiente dev local | `.\scripts\dev.ps1` |
| [backup.ps1](backup.ps1) | Backup de dados (JSON, .env, memorias) | `.\scripts\backup.ps1` |
| [clean.ps1](clean.ps1) | Limpa cache (.next, __pycache__) | `.\scripts\clean.ps1 -All` |
| [git-sync.ps1](git-sync.ps1) | Sincroniza com GitHub automaticamente | `.\scripts\git-sync.ps1` |
| [setup-auto-sync.ps1](setup-auto-sync.ps1) | Configura sync automatico | `.\scripts\setup-auto-sync.ps1` |

### Scripts Batch (Atalhos)

| Arquivo | Descricao |
|---------|-----------|
| [sync-agora.bat](sync-agora.bat) | Atalho para sync imediato |
| [git-sync.bat](git-sync.bat) | Wrapper do git-sync.ps1 |
| [git-sync-manual.bat](git-sync-manual.bat) | Sync manual com confirmacao |

---

## Geradores de Dados (/generators)

| Arquivo | Descricao |
|---------|-----------|
| [gerar_eleitores_df_v4.py](generators/gerar_eleitores_df_v4.py) | **PRINCIPAL** - Gera 1000+ eleitores sinteticos |
| [gerar_eleitores_otimizado.py](generators/gerar_eleitores_otimizado.py) | Versao otimizada para grandes volumes |
| [gerar_eleitores_corretivos.py](generators/gerar_eleitores_corretivos.py) | Gera eleitores para corrigir distribuicao |
| [gerar_graficos_correlacoes.py](generators/gerar_graficos_correlacoes.py) | Gera graficos de analise |

---

## Qualidade de Dados (/data-quality)

Scripts para validar e corrigir o banco de eleitores:

### Analise

| Arquivo | Descricao |
|---------|-----------|
| [analisar_eleitores.py](data-quality/analisar_eleitores.py) | Analise geral do banco |
| [analise_correlacoes_completa.py](data-quality/analise_correlacoes_completa.py) | Correlacoes entre atributos |
| [analise_coerencia_regional.py](data-quality/analise_coerencia_regional.py) | Coerencia por RA |
| [comparacao_pdad_oficial.py](data-quality/comparacao_pdad_oficial.py) | Compara com dados PDAD oficiais |

### Verificacao

| Arquivo | Descricao |
|---------|-----------|
| [verificar_conformidade_final.py](data-quality/verificar_conformidade_final.py) | Verifica conformidade com PDAD |
| [verificar_coerencia_completa.py](data-quality/verificar_coerencia_completa.py) | Verifica coerencia logica |
| [verificar_inconsistencias.py](data-quality/verificar_inconsistencias.py) | Encontra inconsistencias |
| [auditar_todos_campos.py](data-quality/auditar_todos_campos.py) | Auditoria completa de campos |

### Correcao

| Arquivo | Descricao |
|---------|-----------|
| [corrigir_inconsistencias.py](data-quality/corrigir_inconsistencias.py) | Corrige inconsistencias gerais |
| [corrigir_idade_por_ra.py](data-quality/corrigir_idade_por_ra.py) | Ajusta faixa etaria por RA |
| [corrigir_cor_e_ra.py](data-quality/corrigir_cor_e_ra.py) | Corrige cor/raca por RA |
| [corrigir_campos_criticos.py](data-quality/corrigir_campos_criticos.py) | Corrige campos obrigatorios |
| [rebalancear_faixa_etaria.py](data-quality/rebalancear_faixa_etaria.py) | Rebalancea distribuicao etaria |
| [normalizar_valores.py](data-quality/normalizar_valores.py) | Normaliza valores de campos |

---

## Importacao e Enriquecimento

| Arquivo | Descricao |
|---------|-----------|
| [pesquisa_governador_2026.py](pesquisa_governador_2026.py) | Simula pesquisa eleitoral completa |
| [importar_entrevistas.py](importar_entrevistas.py) | Importa entrevistas para o banco |
| [importar_dados_podc.py](importar_dados_podc.py) | Importa dados PODC |
| [importar_candidatos.py](importar_candidatos.py) | Importa candidatos |
| [enriquecer_deputados_api_camara.py](enriquecer_deputados_api_camara.py) | Enriquece com API da Camara |
| [enriquecer_senadores_api_senado.py](enriquecer_senadores_api_senado.py) | Enriquece com API do Senado |

---

## Execucao Agentica (sem UI)

| Arquivo | Descricao | Uso |
|---------|-----------|-----|
| [agentico/rodar_entrevista_via_backend.py](agentico/rodar_entrevista_via_backend.py) | Inicia entrevista existente via API (background) | `python3 scripts/agentico/rodar_entrevista_via_backend.py --help` |
| [agentico/criar_e_rodar_entrevista_cldf.py](agentico/criar_e_rodar_entrevista_cldf.py) | Cria + roda entrevista com os 24 da CLDF | `python3 scripts/agentico/criar_e_rodar_entrevista_cldf.py --help` |

---

## Parlamentares

| Arquivo | Descricao |
|---------|-----------|
| [gerar_parlamentares_brasil_completo.py](gerar_parlamentares_brasil_completo.py) | Gera base completa de parlamentares |
| [gerar_parlamentares_congresso.py](gerar_parlamentares_congresso.py) | Gera dados do Congresso |
| [enriquecer_parlamentares.py](enriquecer_parlamentares.py) | Enriquece dados parlamentares |
| [converter_parlamentares_frontend.py](converter_parlamentares_frontend.py) | Converte para formato frontend |
| [converter_personas_gestores.py](converter_personas_gestores.py) | Converte personas de gestores |
| [parlamentares/gerar_overrides_cldf_stub.py](parlamentares/gerar_overrides_cldf_stub.py) | Gera/atualiza stub do overrides CLDF |
| [parlamentares/validar_cldf_overrides.py](parlamentares/validar_cldf_overrides.py) | Valida consistencia minima CLDF (heuristica) |

---

## Fluxo de Uso Tipico

```
1. GERACAO INICIAL
   python scripts/generators/gerar_eleitores_df_v4.py
   
2. VERIFICACAO
   python scripts/data-quality/verificar_conformidade_final.py
   python scripts/data-quality/verificar_coerencia_completa.py
   
3. CORRECAO (se necessario)
   python scripts/data-quality/corrigir_inconsistencias.py
   
4. SIMULACAO DE PESQUISA
   python scripts/pesquisa_governador_2026.py
   
5. DEPLOY
   .\scripts\deploy.ps1
```

---

## Notas Importantes

- **gerar_eleitores_df_v4.py** e a versao mais atual e correta
- Scripts de data-quality sao iterativos - rode verificacao apos cada correcao
- **pesquisa_governador_2026.py** usa os candidatos provaveis para 2026
- Todos os scripts Python assumem execucao da raiz do projeto
