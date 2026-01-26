# Esquemas - Modelos Pydantic

> **GPS IA**: Validacao e serializacao de dados da API

## Arquivos por Dominio

### Usuarios e Autenticacao
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [usuario.py](usuario.py) | Auth, usuarios, perfis | `RegistroRequest`, `LoginRequest`, `TokenResponse`, `UsuarioResponse`, `PapelUsuario` (enum: admin/pesquisador/visualizador/leitor) |

### Eleitores (Agentes Sinteticos)
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [eleitor.py](eleitor.py) | CRUD e filtros de eleitores | `EleitorBase`, `EleitorCreate`, `EleitorResponse`, `FiltrosEleitor`, `EstatisticasEleitores` |

**Enums importantes:**
- `GeneroEnum`: masculino, feminino
- `ClusterSocioeconomicoEnum`: G1_alta, G2_media_alta, G3_media_baixa, G4_baixa
- `PosicaoBolsonaroEnum`: opositor_forte -> apoiador_forte (7 niveis)
- `InteressePoliticoEnum`: baixo, medio, alto

### Candidatos
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [candidato.py](candidato.py) | Candidatos eleitorais | `CandidatoBase`, `CandidatoCreate`, `CandidatoResponse`, `CenarioEleitoral`, `ResultadoCenario` |

**Enums:**
- `CargoPretendidoEnum`: governador, vice, senador, dep_federal, dep_distrital
- `StatusCandidaturaEnum`: pre_candidato, candidato_oficial, indeferido, desistente
- `OrientacaoPoliticaEnum`: esquerda -> direita

### Pesquisas Persistidas
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [pesquisa.py](pesquisa.py) | Pesquisas, perguntas, respostas | `PesquisaCreate`, `PesquisaResponse`, `PerguntaPesquisaCreate`, `RespostaPesquisaResponse`, `DashboardGlobal` |

**Enums:**
- `TipoPesquisa`: quantitativa, qualitativa, mista
- `StatusPesquisa`: rascunho, agendada, executando, pausada, concluida, cancelada, erro
- `TipoPerguntaPesquisa`: aberta, aberta_longa, escala_likert, multipla_escolha, sim_nao, ranking, numerica

### Entrevistas (Execucao)
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [entrevista.py](entrevista.py) | Execucao de entrevistas | `EntrevistaCreate`, `Entrevista`, `FluxoCognitivo`, `RespostaEleitor`, `ProgressoEntrevista`, `EstimativaCusto` |

**FluxoCognitivo** (Chain of Thought 4 etapas):
1. `atencao`: prestaria_atencao, motivo
2. `vies`: confirma_crencas, ameaca_valores, ativa_medos
3. `emocional`: sentimento_dominante, intensidade
4. `decisao`: muda_intencao_voto, aumenta_cinismo, acao_provavel, resposta_final

### Memorias
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [memoria.py](memoria.py) | Historico de respostas | `MemoriaCreate`, `MemoriaResponse`, `HistoricoEleitor`, `AnalyticsGlobais`, `UsoAPIResponse` |

### Resultados e Analises
| Arquivo | Funcao | Classes Principais |
|---------|--------|-------------------|
| [resultado.py](resultado.py) | Analise de resultados | `ResultadoAnalise`, `EstatisticasDescritivas`, `Correlacao`, `MapaCalorEmocional`, `VotoSilencioso`, `PontoRuptura`, `Insight` |

**Caixas Especiais:**
- `VotoSilencioso`: eleitores que escondem intencao real
- `PontoRuptura`: eleitores propensos a mudar de lado

## Padroes Comuns

### Nomenclatura
- `*Base`: campos compartilhados
- `*Create`: criacao (input)
- `*Update`: atualizacao parcial
- `*Response`: resposta da API
- `*Resumo`: versao reduzida para listagens
- `Filtros*`: parametros de busca

### Paginacao
```python
pagina: int = 1
por_pagina: int = 20
# Response:
total: int
total_paginas: int
```
