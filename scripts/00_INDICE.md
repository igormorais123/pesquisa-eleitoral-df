# INDICE - /scripts

## Scripts de Geracao de Dados

### gerar_eleitores_df_v4.py (PRINCIPAL)
Gera 1000+ eleitores sinteticos com 60+ atributos
- Usa distribuicoes PDAD reais
- Coerencia entre campos
- Output: agentes/banco-eleitores-df.json

### gerar_parlamentares_brasil_completo.py
Gera banco de parlamentares (deputados, senadores)

### pesquisa_governador_2026.py
Simula pesquisa completa com eleitores sinteticos

## Scripts de Validacao/Correcao

### verificar_coerencia_completa.py
Valida consistencia entre campos dos eleitores
- Idade vs escolaridade
- Renda vs cluster
- RA vs caracteristicas

### corrigir_inconsistencias.py
Corrige automaticamente inconsistencias encontradas

### analisar_eleitores.py
Gera estatisticas descritivas do banco

## Scripts de Ajuste Fino

### ajustar_estatisticas_v*.py
Ajustes nas distribuicoes estatisticas

### corrigir_campos_criticos.py
Correcoes em campos especificos

### rebalancear_*.py
Rebalanceamento de distribuicoes

## Scripts de Importacao

### importar_candidatos.py
Importa candidatos de fontes externas

### enriquecer_parlamentares.py
Enriquece dados de parlamentares via APIs

## Scripts de Deploy

### deploy.ps1
Deploy para producao

### dev.ps1
Inicia ambiente de desenvolvimento

### backup.ps1
Backup dos dados

### git-sync.ps1
Sincronizacao com GitHub
