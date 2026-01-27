# Servicos - Logica de Negocio

> **GPS IA**: Camada de servicos entre rotas e dados

## Arquivos por Dominio

### IA / Claude
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [claude_servico.py](claude_servico.py) | Integracao Claude API | `ClaudeServico`, `processar_resposta()`, `construir_prompt_cognitivo()`, `calcular_custo()`, `estimar_custo()` |
| [parlamentar_prompt.py](parlamentar_prompt.py) | Prompts para parlamentares | `construir_prompt_parlamentar()`, `construir_prompt_parlamentar_simplificado()` |
| [parlamentar_helper.py](parlamentar_helper.py) | Helpers para parlamentares | Funcoes auxiliares de formatacao |

### Eleitores (Agentes)
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [eleitor_servico.py](eleitor_servico.py) | CRUD eleitores JSON | `EleitorServico`, `listar()`, `obter_por_id()`, `obter_estatisticas()`, `importar_json()` |
| [eleitor_servico_db.py](eleitor_servico_db.py) | CRUD eleitores PostgreSQL | Versao DB do servico |
| [eleitor_helper.py](eleitor_helper.py) | Helpers de eleitor | `obter_eleitores_por_ids()` |
| [geracao_servico.py](geracao_servico.py) | Geracao de eleitores via IA | Criar novos agentes sinteticos |

### Pesquisas e Entrevistas
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [entrevista_servico.py](entrevista_servico.py) | Execucao de entrevistas | `EntrevistaServico`, `iniciar_execucao()`, `pausar_execucao()`, `obter_progresso()` |
| [pesquisa_servico.py](pesquisa_servico.py) | CRUD pesquisas | Gerenciamento de pesquisas |
| [pesquisa_persistencia_servico.py](pesquisa_persistencia_servico.py) | Persistencia de pesquisas | Salvar em banco |
| [pesquisa_parlamentar_servico.py](pesquisa_parlamentar_servico.py) | Pesquisas com parlamentares | Entrevistas especificas |

### Resultados e Analytics
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [resultado_servico.py](resultado_servico.py) | Analise de resultados | Estatisticas, graficos, insights |
| [resultado_parlamentar_servico.py](resultado_parlamentar_servico.py) | Resultados parlamentares | Analise especifica |
| [analise_acumulativa_servico.py](analise_acumulativa_servico.py) | Analise acumulativa | Agregacao entre pesquisas |
| [memoria_servico.py](memoria_servico.py) | Persistencia de memorias | `MemoriaServico`, `salvar_resposta_entrevista()`, analytics globais |

### Usuarios e Auth
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [usuario_servico.py](usuario_servico.py) | Usuarios e auth | `UsuarioServico`, `autenticar()`, `registrar()`, `aprovar()`, `listar()` |
| [oauth_servico.py](oauth_servico.py) | OAuth Google | Integracao com Google |

### Outros
| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [candidato_servico.py](candidato_servico.py) | CRUD candidatos | Gerenciamento de candidatos |
| [cenario_eleitoral_servico.py](cenario_eleitoral_servico.py) | Cenarios eleitorais | Simulacao de cenarios |
| [mensagem_servico.py](mensagem_servico.py) | Mensagens | Comunicacao |

## Claude Servico - Detalhes

### Modelos e Precos
```python
MODELO_ENTREVISTAS = "claude-sonnet-4-5-20250929"  # Para entrevistas
MODELO_INSIGHTS = "claude-opus-4-5-20251101"      # Para relatorios

PRECOS_MODELOS = {
    "claude-opus-4-5-20251101": {"entrada": 15.0, "saida": 75.0},
    "claude-sonnet-4-5-20250929": {"entrada": 3.0, "saida": 15.0},
}
TAXA_CONVERSAO = 6.0  # USD -> BRL
```

### Prompt Cognitivo (4 etapas)
1. **Filtro de Atencao**: Prestaria atencao? Relevancia pessoal?
2. **Processamento Enviesado**: Confirma crencas? Ameaca valores? Medos ativados?
3. **Reacao Emocional**: Sentimento primario/secundario, intensidade
4. **Contexto Social**: Alinhado com grupo? Diria publicamente?

### Tipos de Pergunta
- `sim_nao`: Resposta binaria
- `escala_likert`: Nota 0-10
- `multipla_escolha`: Escolher 1 opcao
- `ranking`: Ordenar opcoes
- `intencao_voto`: Candidato preferido
- `aberta`: Texto livre

## Singletons

```python
# Obter instancias globais
claude = obter_claude_servico()
eleitores = obter_servico_eleitores()
entrevistas = obter_entrevista_servico()
```

## Fluxo de Execucao de Entrevista

```
1. criar() -> EntrevistaCreate -> entrevista com ID
2. iniciar_execucao(entrevista_id, limite_custo, batch_size)
   -> Loop por perguntas
   -> Loop por eleitores em batches
   -> claude.processar_resposta() para cada
   -> Salva no JSON + Memoria no banco
3. obter_progresso() -> status, % concluido, custos
4. pausar/retomar/cancelar_execucao()
```
