# INDICE - /agentes

## Arquivos de Dados Principais

### banco-eleitores-df.json (PRINCIPAL)
- 1000+ perfis de eleitores sinteticos
- 60+ atributos por eleitor
- Distribuicoes baseadas no PDAD 2021

### banco-candidatos-df-2026.json
- Candidatos a governador 2026
- Inclui propostas, historico, partido

### banco-deputados-federais-df.json
- 8 deputados federais do DF
- Dados atualizados da Camara

### banco-senadores-df.json
- 3 senadores do DF
- Dados atualizados do Senado

### banco-gestores.json
- 50+ gestores publicos
- Para pesquisas PODC

### regioes-administrativas-df.json
- 33 RAs do Distrito Federal
- Dados demograficos PDAD
- Clusters socioeconomicos

### templates-perguntas-eleitorais.json
- Templates de perguntas
- Tipos: aberta, fechada, escala, ranking

## Arquivos de Backup

Arquivos com sufixo _backup ou _backup_[data]:
- NAO ler - apenas para recuperacao

## Estrutura do Eleitor

Campos principais:
- id: eleitor-XXX
- nome, idade, genero, cor_raca
- regiao_administrativa (RA do DF)
- cluster_socioeconomico (A/B/C/D/E)
- escolaridade, ocupacao, renda_familiar
- orientacao_politica
- posicao_bolsonaro (apoiador/neutro/opositor)
- interesse_politico (0-10)
- vieses_cognitivos (array)
- preocupacoes (array)
- valores (array)
- susceptibilidade_desinformacao (0-10)
- fontes_informacao (array)
- historico_voto (objeto)

## Estrutura de Candidato

- id, nome, partido, cargo
- idade, genero, cor_raca
- propostas (array)
- historico_politico
- aprovacao_atual (0-100)
- rejeicao_atual (0-100)

## Uso Tipico

Para ler eleitores:
import json
with open(agentes/banco-eleitores-df.json) as f:
    eleitores = json.load(f)
