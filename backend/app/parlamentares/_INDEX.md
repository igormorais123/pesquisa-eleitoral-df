# Parlamentares - Modulo de Deputados e Senadores

> **GPS IA**: Importacao, armazenamento e integracao de dados de parlamentares

## Arquivos

| Arquivo | Funcao |
|---------|--------|
| [routes.py](routes.py) | Rotas FastAPI `/parlamentares` |
| [services.py](services.py) | Logica de negocio para parlamentares |
| [models.py](models.py) | Modelo SQLAlchemy de parlamentar |
| [integration.py](integration.py) | Integracao com APIs externas |

## Subpasta: ingest/

| Arquivo | Funcao |
|---------|--------|
| [ingest/camara_fetcher.py](ingest/camara_fetcher.py) | Busca dados da API da Camara dos Deputados |
| [ingest/senado_fetcher.py](ingest/senado_fetcher.py) | Busca dados da API do Senado |
| [ingest/cldf_provider.py](ingest/cldf_provider.py) | Busca dados da CLDF (Deputados Distritais) |

## Fontes de Dados

- **Camara dos Deputados**: API Dados Abertos (deputados federais)
- **Senado Federal**: API Dados Abertos (senadores)
- **CLDF**: Camara Legislativa do DF (deputados distritais)

## Dados do Parlamentar

- Identificacao: id, nome, nome_parlamentar, partido, uf
- Cargo: deputado_federal, senador, deputado_distrital
- Comissoes: lista de comissoes
- Votacoes: historico de votacoes
- Posicionamentos: orientacao_politica, posicao_bolsonaro
- Foto: URL da foto oficial

## Uso nas Pesquisas

Parlamentares podem ser usados como respondentes em pesquisas,
similar a eleitores. O tipo_respondente = "parlamentar" no
EntrevistaCreate ativa o modo de entrevista com parlamentares.
