# Rotas - API REST FastAPI

> **GPS IA**: Endpoints da API REST (base: /api/v1)

## Endpoints por Dominio

### Autenticacao
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [autenticacao.py](autenticacao.py) | `/auth` | `POST /registro`, `POST /login`, `POST /token`, `GET /google/url`, `POST /google/callback`, `GET /me` |

### Usuarios (Admin)
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [usuarios.py](usuarios.py) | `/usuarios` | `GET /`, `GET /{id}`, `POST /{id}/aprovar`, `POST /{id}/revogar`, `PUT /{id}/papel` |

### Eleitores (Agentes Sinteticos)
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [eleitores.py](eleitores.py) | `/eleitores` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `GET /estatisticas`, `GET /filtros/opcoes`, `POST /importar` |

### Candidatos
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [candidatos.py](candidatos.py) | `/candidatos` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `GET /estatisticas`, `GET /para-pesquisa` |

### Entrevistas
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [entrevistas.py](entrevistas.py) | `/entrevistas` | `GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`, `POST /{id}/iniciar`, `POST /{id}/pausar`, `POST /{id}/retomar`, `GET /{id}/progresso`, `GET /{id}/respostas` |

### Resultados e Analises
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [resultados.py](resultados.py) | `/resultados` | `GET /`, `GET /{id}`, `POST /analisar/{entrevista_id}`, `GET /{id}/exportar` |

### Pesquisas (Persistidas)
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [pesquisas.py](pesquisas.py) | `/pesquisas` | CRUD completo de pesquisas persistidas no banco |
| [pesquisas_podc.py](pesquisas_podc.py) | `/pesquisas-podc` | Pesquisas PODC especiais |
| [pesquisas_parlamentares.py](pesquisas_parlamentares.py) | `/pesquisas-parlamentares` | Pesquisas com parlamentares |

### Parlamentares
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| (ver pasta `/parlamentares`) | `/parlamentares` | Importacao e consulta de parlamentares |

### Outros
| Arquivo | Prefixo | Endpoints Principais |
|---------|---------|---------------------|
| [memorias.py](memorias.py) | `/memorias` | `GET /`, `GET /{eleitor_id}/historico`, `GET /analytics` |
| [geracao.py](geracao.py) | `/geracao` | `POST /eleitores` - Gerar eleitores via IA |
| [templates.py](templates.py) | `/templates` | Templates de perguntas |
| [cenarios_eleitorais.py](cenarios_eleitorais.py) | `/cenarios` | Simulacao de cenarios |
| [historico.py](historico.py) | `/historico` | Historico de pesquisas |
| [analytics.py](analytics.py) | `/analytics` | Metricas globais |
| [sessoes.py](sessoes.py) | `/sessoes` | Sessoes de entrevista |
| [mensagens.py](mensagens.py) | `/mensagens` | Comunicacao |
| [rls.py](rls.py) | `/rls` | Row Level Security debug |
| [dados_usuarios.py](dados_usuarios.py) | `/dados-usuarios` | Dados de usuarios Google |

## Autenticacao

Todos os endpoints (exceto /auth/login, /auth/registro) requerem token JWT:

```http
Authorization: Bearer <token>
```

Dependency padrao: `obter_usuario_atual` -> retorna `DadosToken`

## Filtros de Eleitores (GET /eleitores/)

```
?idade_min=18&idade_max=60
?generos=masculino,feminino
?regioes=Plano Piloto,Taguatinga
?clusters=G1_alta,G2_media_alta
?orientacoes=direita,centro-direita
?posicoes_bolsonaro=apoiador_forte,apoiador_moderado
?busca=professor
?pagina=1&por_pagina=50
?ordenar_por=nome&ordem=asc
```

## Fluxo Entrevista

```
1. POST /entrevistas/           -> Criar (status: rascunho)
2. POST /entrevistas/{id}/iniciar -> Iniciar execucao
3. GET /entrevistas/{id}/progresso -> Acompanhar (0-100%)
4. GET /entrevistas/{id}/respostas -> Ver respostas
5. POST /resultados/analisar/{id} -> Gerar analise
6. GET /resultados/{id}          -> Ver analise completa
```

## Respostas Padrao

```json
// Sucesso listagem
{
  "eleitores": [...],
  "total": 1000,
  "pagina": 1,
  "por_pagina": 50,
  "total_paginas": 20
}

// Erro
{
  "detail": "Mensagem de erro"
}
```
