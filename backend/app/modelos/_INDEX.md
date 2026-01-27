# Modelos - SQLAlchemy ORM

> **GPS IA**: Tabelas PostgreSQL e mapeamento objeto-relacional

## Arquivos

| Arquivo | Tabela | Campos Principais |
|---------|--------|-------------------|
| [base.py](base.py) | - | `Base` (DeclarativeBase), `TimestampMixin` (criado_em, atualizado_em) |
| [usuario.py](usuario.py) | `usuarios` | id, email, nome, papel, provedor_auth, google_id, aprovado, ativo |
| [eleitor.py](eleitor.py) | `eleitores` | 60+ campos demograficos/politicos/comportamentais |
| [candidato.py](candidato.py) | `candidatos` | nome, nome_urna, partido, cargo_pretendido, biografia, propostas |
| [pesquisa.py](pesquisa.py) | `pesquisas` | titulo, tipo, status, progresso, custo_total, tokens |
| [memoria.py](memoria.py) | `memorias`, `uso_api` | Historico de respostas + analytics de tokens |

## Usuario - Campos Chave

```python
papel: admin | pesquisador | visualizador | leitor
provedor_auth: local | google
aprovado: bool  # Requer aprovacao do admin
```

**Properties uteis:**
- `is_admin`, `is_pesquisador`
- `pode_usar_api` (aprovado e nao-leitor)
- `pode_visualizar` (ativo e aprovado ou leitor)

## Eleitor - Enums Importantes

| Enum | Valores |
|------|---------|
| `Genero` | masculino, feminino |
| `ClusterSocioeconomico` | G1_alta, G2_media_alta, G3_media_baixa, G4_baixa, G5_vulneravel |
| `OrientacaoPolitica` | esquerda, centro-esquerda, centro, centro-direita, direita |
| `PosicaoBolsonaro` | opositor_forte -> apoiador_forte |
| `InteressePolitico` | baixo, medio, alto |
| `EstiloDecisao` | economico, emocional, identitario, pragmatico |

**Campos JSONB (arrays flexiveis):**
- valores, preocupacoes, medos, vieses_cognitivos, fontes_informacao

## Pesquisa - Status Flow

```
rascunho -> agendada -> executando -> concluida
                    \-> pausada -> executando
                    \-> erro
                    \-> cancelada
```

## Memoria - Analytics de Tokens

```python
# Por chamada
tokens_entrada, tokens_saida, tokens_total
custo, tempo_resposta_ms
modelo_usado: str

# UsoAPI (agregado por periodo)
periodo: "2026-01-16" | "2026-W03" | "2026-01"
tipo_periodo: dia | semana | mes
```

## Metodos Uteis

```python
# Todos os modelos
modelo.to_dict()  # Converte para dict
Modelo.from_dict(data)  # Cria instancia de dict

# Memoria
memoria.sentimento_dominante  # Extrai do fluxo_cognitivo
memoria.custo_por_token

# Pesquisa
pesquisa.duracao_segundos
pesquisa.esta_em_execucao
pesquisa.pode_iniciar
```

## Relacionamentos

```
Pesquisa 1--N PerguntaPesquisa (perguntas/)
Pesquisa 1--N Resposta (respostas/)
Pesquisa 1--N Analise (analises/)
```
