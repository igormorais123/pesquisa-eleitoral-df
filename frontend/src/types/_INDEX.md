# Types - Tipos TypeScript

> **GPS IA**: Definicoes de tipos do sistema

## Arquivos

| Arquivo | Conteudo |
|---------|----------|
| [index.ts](index.ts) | Tipos principais (Eleitor, Entrevista, Pergunta, etc) |
| [global.d.ts](global.d.ts) | Declaracoes globais TypeScript |

## Tipos Principais

### Enums (Union Types)
```typescript
Genero = 'masculino' | 'feminino'
ClusterSocioeconomico = 'G1_alta' | 'G2_media_alta' | 'G3_media_baixa' | 'G4_baixa'
OrientacaoPolitica = 'esquerda' | 'centro-esquerda' | 'centro' | 'centro-direita' | 'direita'
PosicaoBolsonaro = 'apoiador_forte' | 'apoiador_moderado' | 'neutro' | 'critico_moderado' | 'critico_forte'
InteressePolitico = 'baixo' | 'medio' | 'alto'
TipoEntrevista = 'quantitativa' | 'qualitativa' | 'mista'
StatusEntrevista = 'rascunho' | 'executando' | 'concluida' | 'erro'
TipoPergunta = 'aberta' | 'escala' | 'multipla_escolha' | 'sim_nao'
```

### Interfaces Principais
- `Eleitor` - Perfil completo do agente sintetico (60+ campos)
- `EleitorResumo` - Versao reduzida para listagens
- `FiltrosEleitor` - Parametros de busca
- `Entrevista` - Pesquisa com perguntas e eleitores
- `Pergunta` - Item de pesquisa
- `Resposta` - Resposta do eleitor
- `FluxoCognitivo` - Chain of Thought (4 etapas)
- `Usuario` - Usuario do sistema
- `Candidato` - Candidato eleitoral
