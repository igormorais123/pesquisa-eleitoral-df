# Agentes - Dados JSON dos Agentes Sinteticos

> **GPS IA**: Banco de dados em JSON de eleitores, candidatos e templates

## Arquivos de Dados

| Arquivo | Conteudo | Quantidade |
|---------|----------|------------|
| [banco-eleitores-df.json](banco-eleitores-df.json) | Eleitores sinteticos do DF | ~1000 |
| [banco-candidatos-df-2026.json](banco-candidatos-df-2026.json) | Candidatos eleicoes 2026 | Varios |
| [candidatos-df-2026.json](candidatos-df-2026.json) | Candidatos (versao alternativa) | Varios |
| [banco-gestores.json](banco-gestores.json) | Gestores para entrevistas | Varios |
| [banco-deputados-distritais-df.json](banco-deputados-distritais-df.json) | Deputados distritais | 24 |
| [banco-deputados-federais-df.json](banco-deputados-federais-df.json) | Deputados federais DF | 8 |
| [banco-deputados-federais-brasil.json](banco-deputados-federais-brasil.json) | Todos deputados federais | 513 |
| [banco-senadores-df.json](banco-senadores-df.json) | Senadores DF | 3 |
| [banco-senadores-brasil.json](banco-senadores-brasil.json) | Todos senadores | 81 |
| [banco-parlamentares-brasil.json](banco-parlamentares-brasil.json) | Todos parlamentares | ~600 |
| [templates-perguntas-eleitorais.json](templates-perguntas-eleitorais.json) | Templates de perguntas | Varios |
| [templates-perguntas-gestores.json](templates-perguntas-gestores.json) | Templates para gestores | Varios |
| [regioes-administrativas-df.json](regioes-administrativas-df.json) | RAs do DF | 33 |
| [dados-usuarios-google.json](dados-usuarios-google.json) | Usuarios cadastrados via Google | Dinamico |

## Estrutura do Eleitor (60+ campos)

```json
{
  "id": "df-0001",
  "nome": "Maria da Silva",
  "idade": 42,
  "genero": "feminino",
  "cor_raca": "parda",
  "regiao_administrativa": "Taguatinga",
  "cluster_socioeconomico": "G2_media_alta",
  "escolaridade": "superior_completo",
  "profissao": "professora",
  "ocupacao_vinculo": "servidor_publico",
  "renda_salarios_minimos": "5-10",
  "religiao": "catolica",
  "estado_civil": "casada",
  "filhos": 2,
  "orientacao_politica": "centro-esquerda",
  "posicao_bolsonaro": "critico_moderado",
  "interesse_politico": "alto",
  "valores": ["educacao", "justica_social"],
  "preocupacoes": ["saude_publica", "seguranca"],
  "medos": ["desemprego", "violencia"],
  "vieses_cognitivos": ["confirmacao", "disponibilidade"],
  "fontes_informacao": ["TV", "WhatsApp", "jornal"],
  "susceptibilidade_desinformacao": 3,
  "historia_resumida": "Maria nasceu em Taguatinga...",
  "instrucao_comportamental": "Responda de forma..."
}
```

## Uso

```python
# Backend Python
import json
with open('agentes/banco-eleitores-df.json') as f:
    eleitores = json.load(f)

# Frontend (via API)
const response = await api.get('/eleitores');
```

## Backups

Pasta `backups/` contem versoes anteriores dos arquivos JSON.

## Nota importante (CLDF)

- O backend aplica correcoes incrementais via `data/parlamentares/cldf/overrides.json` (nao edite o legado para ajustes finos).
- Documentacao: `data/parlamentares/cldf/README.md`
