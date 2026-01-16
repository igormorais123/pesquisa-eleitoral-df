# FASE 3: SIMULADOR A/B VIRTUAL

## Documento de Implementação Detalhado

**Dependências**: Fase 2 (Gerador de Mensagens) - OBRIGATÓRIO
**Estimativa**: 3-5 dias de desenvolvimento
**Risco**: Baixo (não altera funcionalidades existentes)

---

## OBJETIVO

Criar um sistema que simula a reação dos eleitores a diferentes mensagens ANTES de ir a campo, permitindo testar e comparar eficácia de mensagens de forma virtual usando os agentes sintéticos.

---

## CONCEITO

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIMULADOR A/B VIRTUAL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "E se pudéssemos testar mensagens de campanha em 400           │
│   eleitores sintéticos ANTES de gastar milhões em mídia?"       │
│                                                                 │
│  INPUT:                                                         │
│  ├─ Mensagem A (controle)                                       │
│  ├─ Mensagem B (teste) - ou múltiplas variações                 │
│  ├─ Lista de eleitores-alvo                                     │
│  └─ Métricas de interesse (persuasão, rejeição, etc)           │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ├─ Para cada eleitor:                                          │
│  │   ├─ Simular exposição à Mensagem A → Reação A              │
│  │   └─ Simular exposição à Mensagem B → Reação B              │
│  ├─ Usar Chain of Thought cognitivo existente                  │
│  └─ Agregar resultados comparativos                            │
│                                                                 │
│  OUTPUT:                                                        │
│  ├─ Taxa de persuasão por mensagem                             │
│  ├─ Taxa de rejeição/backfire                                  │
│  ├─ Breakdown por segmento (região, cluster, etc)              │
│  ├─ Análise de quem respondeu melhor a cada mensagem           │
│  └─ Recomendação: qual mensagem usar                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## MÉTRICAS SIMULADAS

### 1. Taxa de Persuasão
- **Definição**: % de eleitores que mudariam de opinião favoravelmente
- **Cálculo**: Baseado na reação emocional + vieses ativados
- **Valores**: 0-100%

### 2. Taxa de Rejeição (Backfire)
- **Definição**: % de eleitores que reagiriam negativamente
- **Cálculo**: Baseado em medos ativados contra + valores violados
- **Valores**: 0-100%

### 3. Engajamento Emocional
- **Definição**: Intensidade da reação emocional
- **Cálculo**: Média da intensidade (1-10) das reações
- **Valores**: 1-10

### 4. Intenção de Compartilhamento
- **Definição**: Probabilidade de compartilhar a mensagem
- **Cálculo**: Baseado em fontes de informação + viés tribal
- **Valores**: 0-100%

### 5. Mudança de Voto
- **Definição**: % que declara que mudaria o voto
- **Cálculo**: Baseado na análise cognitiva completa
- **Valores**: 0-100%

---

## ARQUIVOS A CRIAR

### Backend

#### 1. `backend/app/servicos/simulador_ab_servico.py`

```python
"""
Serviço de Simulação A/B Virtual

Simula reações de eleitores a diferentes mensagens usando
o Chain of Thought cognitivo de 4 etapas.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from collections import Counter
import asyncio

from anthropic import Anthropic

from app.core.config import configuracoes
from app.servicos.eleitor_servico import obter_servico_eleitores


class SimuladorABServico:
    """Serviço para simulação A/B virtual de mensagens"""

    MODELO_SIMULACAO = "claude-sonnet-4-5-20250514"
    MAX_TOKENS = 2000
    TEMPERATURE = 0.3  # Mais determinístico para simulação

    def __init__(self):
        self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_historico = base_path / "memorias" / "simulacoes_ab.json"
        self._historico: List[Dict] = []
        self._carregar_historico()

    def _carregar_historico(self):
        """Carrega histórico de simulações"""
        if self.caminho_historico.exists():
            with open(self.caminho_historico, "r", encoding="utf-8") as f:
                self._historico = json.load(f)

    def _salvar_historico(self):
        """Salva histórico"""
        self.caminho_historico.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_historico, "w", encoding="utf-8") as f:
            json.dump(self._historico, f, ensure_ascii=False, indent=2, default=str)

    def _construir_prompt_simulacao(
        self,
        eleitor: Dict[str, Any],
        mensagem: str,
        contexto: str
    ) -> str:
        """
        Constrói prompt para simular reação do eleitor à mensagem.
        """
        prompt = f"""Você é um eleitor REAL do Distrito Federal. Você NÃO é uma IA educada - você é uma pessoa comum com vieses, preconceitos e reações emocionais.

## SEU PERFIL COMPLETO

**Identificação:**
- Nome: {eleitor.get('nome', 'Não informado')}
- Idade: {eleitor.get('idade', 'Não informado')} anos
- Gênero: {eleitor.get('genero', 'Não informado')}
- Região: {eleitor.get('regiao_administrativa', 'Não informado')}
- Profissão: {eleitor.get('profissao', 'Não informado')}

**Perfil Político:**
- Orientação: {eleitor.get('orientacao_politica', 'Não informado')}
- Posição sobre Bolsonaro: {eleitor.get('posicao_bolsonaro', 'Não informado')}
- Interesse político: {eleitor.get('interesse_politico', 'Não informado')}

**Perfil Psicológico:**
- Valores: {', '.join(eleitor.get('valores', []))}
- Medos: {', '.join(eleitor.get('medos', []))}
- Preocupações: {', '.join(eleitor.get('preocupacoes', []))}
- Vieses cognitivos: {', '.join(eleitor.get('vieses_cognitivos', []))}

**Comportamento:**
- Estilo de decisão: {eleitor.get('estilo_decisao', 'Não informado')}
- Tolerância a nuance: {eleitor.get('tolerancia_nuance', 'Não informado')}
- Susceptibilidade à desinformação: {eleitor.get('susceptibilidade_desinformacao', 5)}/10
- Fontes de informação: {', '.join(eleitor.get('fontes_informacao', []))}
- Religião: {eleitor.get('religiao', 'Não informado')}

**Instrução Comportamental:**
{eleitor.get('instrucao_comportamental', 'Responda naturalmente.')}

## CONTEXTO
{contexto}

## MENSAGEM RECEBIDA
"{mensagem}"

## SUA TAREFA
Simule sua reação autêntica a essa mensagem. Passe pelas 4 etapas cognitivas:

1. **FILTRO DE ATENÇÃO**: Você prestaria atenção? Por quê?
2. **VIÉS DE CONFIRMAÇÃO**: Isso confirma ou contradiz suas crenças?
3. **REAÇÃO EMOCIONAL**: Como isso te faz SENTIR? (segurança/ameaça/raiva/indiferença/esperança)
4. **DECISÃO**: Qual seria sua reação/resposta?

## FORMATO DE RESPOSTA (JSON)
```json
{{
  "prestaria_atencao": true/false,
  "motivo_atencao": "Por que prestaria ou não atenção",

  "confirma_crencas": true/false,
  "ameaca_valores": true/false,
  "medos_ativados": ["lista de medos ativados, se houver"],

  "sentimento_dominante": "seguranca|ameaca|raiva|indiferenca|esperanca",
  "intensidade_emocional": 1-10,

  "reacao_imediata": "O que você diria/pensaria imediatamente",
  "mudaria_opiniao": true/false,
  "direcao_mudanca": "positiva|negativa|neutra",
  "probabilidade_mudanca_voto": 0.0-1.0,

  "compartilharia": true/false,
  "para_quem_compartilharia": "família|amigos|redes_sociais|ninguém",

  "persuadido": true/false,
  "motivo_persuasao": "Por que foi ou não persuadido",

  "backfire": true/false,
  "motivo_backfire": "Por que rejeitou a mensagem, se aplicável"
}}
```

Responda APENAS com o JSON, sem texto adicional. Seja AUTÊNTICO ao perfil."""

        return prompt

    def _parse_resposta_simulacao(self, resposta: str) -> Dict[str, Any]:
        """Parse da resposta de simulação"""
        try:
            return json.loads(resposta)
        except json.JSONDecodeError:
            pass

        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', resposta)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

        return {
            "erro": "Não foi possível parsear resposta",
            "prestaria_atencao": False,
            "persuadido": False,
            "backfire": False
        }

    def _simular_eleitor(
        self,
        eleitor: Dict[str, Any],
        mensagem: str,
        contexto: str
    ) -> Dict[str, Any]:
        """
        Simula reação de um eleitor a uma mensagem.
        """
        prompt = self._construir_prompt_simulacao(eleitor, mensagem, contexto)

        try:
            response = self.client.messages.create(
                model=self.MODELO_SIMULACAO,
                max_tokens=self.MAX_TOKENS,
                temperature=self.TEMPERATURE,
                messages=[{"role": "user", "content": prompt}]
            )
            resposta_texto = response.content[0].text
            resultado = self._parse_resposta_simulacao(resposta_texto)

            resultado["eleitor_id"] = eleitor.get("id")
            resultado["eleitor_nome"] = eleitor.get("nome")
            resultado["regiao"] = eleitor.get("regiao_administrativa")
            resultado["cluster"] = eleitor.get("cluster_socioeconomico")
            resultado["orientacao"] = eleitor.get("orientacao_politica")
            resultado["tokens_usados"] = response.usage.input_tokens + response.usage.output_tokens

            return resultado

        except Exception as e:
            return {
                "eleitor_id": eleitor.get("id"),
                "erro": str(e),
                "prestaria_atencao": False,
                "persuadido": False,
                "backfire": False
            }

    def _agregar_resultados(
        self,
        resultados: List[Dict[str, Any]],
        nome_mensagem: str
    ) -> Dict[str, Any]:
        """
        Agrega resultados de múltiplas simulações.
        """
        total = len(resultados)
        if total == 0:
            return {"erro": "Nenhum resultado para agregar"}

        # Filtrar resultados válidos
        validos = [r for r in resultados if "erro" not in r]
        total_validos = len(validos)

        if total_validos == 0:
            return {"erro": "Nenhum resultado válido"}

        # Métricas agregadas
        prestaram_atencao = sum(1 for r in validos if r.get("prestaria_atencao"))
        persuadidos = sum(1 for r in validos if r.get("persuadido"))
        backfires = sum(1 for r in validos if r.get("backfire"))
        mudariam_voto = sum(1 for r in validos if r.get("mudaria_opiniao"))
        compartilhariam = sum(1 for r in validos if r.get("compartilharia"))

        # Intensidade média
        intensidades = [r.get("intensidade_emocional", 5) for r in validos]
        intensidade_media = sum(intensidades) / len(intensidades)

        # Probabilidade média de mudança
        probs = [r.get("probabilidade_mudanca_voto", 0) for r in validos]
        prob_media = sum(probs) / len(probs)

        # Distribuição de sentimentos
        sentimentos = Counter(r.get("sentimento_dominante", "indiferenca") for r in validos)

        # Breakdown por segmento
        por_regiao: Dict[str, Dict] = {}
        por_cluster: Dict[str, Dict] = {}
        por_orientacao: Dict[str, Dict] = {}

        for r in validos:
            regiao = r.get("regiao", "Outros")
            cluster = r.get("cluster", "Outros")
            orientacao = r.get("orientacao", "Outros")

            # Por região
            if regiao not in por_regiao:
                por_regiao[regiao] = {"total": 0, "persuadidos": 0, "backfires": 0}
            por_regiao[regiao]["total"] += 1
            if r.get("persuadido"):
                por_regiao[regiao]["persuadidos"] += 1
            if r.get("backfire"):
                por_regiao[regiao]["backfires"] += 1

            # Por cluster
            if cluster not in por_cluster:
                por_cluster[cluster] = {"total": 0, "persuadidos": 0, "backfires": 0}
            por_cluster[cluster]["total"] += 1
            if r.get("persuadido"):
                por_cluster[cluster]["persuadidos"] += 1
            if r.get("backfire"):
                por_cluster[cluster]["backfires"] += 1

            # Por orientação
            if orientacao not in por_orientacao:
                por_orientacao[orientacao] = {"total": 0, "persuadidos": 0, "backfires": 0}
            por_orientacao[orientacao]["total"] += 1
            if r.get("persuadido"):
                por_orientacao[orientacao]["persuadidos"] += 1
            if r.get("backfire"):
                por_orientacao[orientacao]["backfires"] += 1

        # Calcular percentuais nos breakdowns
        for segmento in [por_regiao, por_cluster, por_orientacao]:
            for key, data in segmento.items():
                total_seg = data["total"]
                data["taxa_persuasao"] = round(data["persuadidos"] / total_seg * 100, 1)
                data["taxa_backfire"] = round(data["backfires"] / total_seg * 100, 1)

        return {
            "mensagem": nome_mensagem,
            "total_simulacoes": total,
            "simulacoes_validas": total_validos,
            "erros": total - total_validos,

            "metricas": {
                "taxa_atencao": round(prestaram_atencao / total_validos * 100, 1),
                "taxa_persuasao": round(persuadidos / total_validos * 100, 1),
                "taxa_backfire": round(backfires / total_validos * 100, 1),
                "taxa_mudanca_voto": round(mudariam_voto / total_validos * 100, 1),
                "taxa_compartilhamento": round(compartilhariam / total_validos * 100, 1),
                "intensidade_emocional_media": round(intensidade_media, 1),
                "probabilidade_mudanca_media": round(prob_media * 100, 1)
            },

            "distribuicao_sentimentos": dict(sentimentos.most_common()),

            "breakdown": {
                "por_regiao": dict(sorted(
                    por_regiao.items(),
                    key=lambda x: x[1]["taxa_persuasao"],
                    reverse=True
                )),
                "por_cluster": dict(sorted(
                    por_cluster.items(),
                    key=lambda x: x[1]["taxa_persuasao"],
                    reverse=True
                )),
                "por_orientacao": dict(sorted(
                    por_orientacao.items(),
                    key=lambda x: x[1]["taxa_persuasao"],
                    reverse=True
                ))
            },

            "resultados_individuais": validos[:20]  # Top 20 para análise
        }

    def executar_teste_ab(
        self,
        mensagens: List[Dict[str, str]],  # [{"nome": "A", "texto": "..."}]
        eleitor_ids: Optional[List[str]] = None,
        filtros: Optional[Dict[str, Any]] = None,
        contexto: str = "Você está navegando nas redes sociais e vê esta mensagem política.",
        limite_eleitores: int = 50
    ) -> Dict[str, Any]:
        """
        Executa teste A/B virtual comparando múltiplas mensagens.

        Args:
            mensagens: Lista de mensagens a testar (nome + texto)
            eleitor_ids: IDs específicos (opcional)
            filtros: Filtros para selecionar eleitores
            contexto: Contexto de exposição à mensagem
            limite_eleitores: Máximo de eleitores a simular

        Returns:
            Comparação completa entre as mensagens
        """
        eleitor_servico = obter_servico_eleitores()

        # Obter eleitores
        if eleitor_ids:
            eleitores = eleitor_servico.obter_por_ids(eleitor_ids)
        else:
            resultado = eleitor_servico.listar(pagina=1, por_pagina=500)
            eleitores = resultado.get("eleitores", [])

        # Aplicar filtros
        if filtros:
            for campo, valor in filtros.items():
                if isinstance(valor, list):
                    eleitores = [e for e in eleitores if e.get(campo) in valor]
                else:
                    eleitores = [e for e in eleitores if e.get(campo) == valor]

        eleitores = eleitores[:limite_eleitores]

        if not eleitores:
            return {"erro": "Nenhum eleitor encontrado"}

        if not mensagens:
            return {"erro": "Nenhuma mensagem fornecida"}

        inicio = datetime.now()
        resultados_por_mensagem: Dict[str, List[Dict]] = {m["nome"]: [] for m in mensagens}
        total_tokens = 0
        total_simulacoes = 0

        # Executar simulações
        for eleitor in eleitores:
            for msg in mensagens:
                resultado = self._simular_eleitor(
                    eleitor=eleitor,
                    mensagem=msg["texto"],
                    contexto=contexto
                )
                resultados_por_mensagem[msg["nome"]].append(resultado)
                total_tokens += resultado.get("tokens_usados", 0)
                total_simulacoes += 1

        # Agregar resultados
        agregados = {}
        for nome, resultados in resultados_por_mensagem.items():
            agregados[nome] = self._agregar_resultados(resultados, nome)

        # Comparação direta
        comparacao = self._gerar_comparacao(agregados)

        tempo_total = (datetime.now() - inicio).total_seconds()

        resultado_final = {
            "id": f"ab-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "mensagens_testadas": [m["nome"] for m in mensagens],
            "total_eleitores": len(eleitores),
            "total_simulacoes": total_simulacoes,
            "contexto": contexto,

            "resultados": agregados,
            "comparacao": comparacao,

            "metadados": {
                "tempo_total_segundos": round(tempo_total, 1),
                "tokens_totais": total_tokens,
                "custo_estimado_usd": round(total_tokens * 0.006 / 1000, 4),
                "modelo": self.MODELO_SIMULACAO,
                "executado_em": datetime.now().isoformat()
            }
        }

        # Salvar no histórico
        self._historico.append(resultado_final)
        self._salvar_historico()

        return resultado_final

    def _gerar_comparacao(self, agregados: Dict[str, Dict]) -> Dict[str, Any]:
        """
        Gera comparação direta entre as mensagens testadas.
        """
        if len(agregados) < 2:
            return {"info": "Necessário pelo menos 2 mensagens para comparação"}

        # Encontrar vencedora por métrica
        metricas_comparadas = {}
        mensagens_nomes = list(agregados.keys())

        metricas = ["taxa_persuasao", "taxa_backfire", "taxa_mudanca_voto",
                    "taxa_compartilhamento", "intensidade_emocional_media"]

        for metrica in metricas:
            valores = {}
            for nome, dados in agregados.items():
                if "metricas" in dados:
                    valores[nome] = dados["metricas"].get(metrica, 0)

            if valores:
                if metrica == "taxa_backfire":
                    # Menor é melhor
                    vencedor = min(valores, key=valores.get)
                else:
                    # Maior é melhor
                    vencedor = max(valores, key=valores.get)

                metricas_comparadas[metrica] = {
                    "valores": valores,
                    "vencedor": vencedor,
                    "diferenca": max(valores.values()) - min(valores.values())
                }

        # Pontuação geral (quem venceu mais métricas)
        pontuacao = {nome: 0 for nome in mensagens_nomes}
        for metrica, dados in metricas_comparadas.items():
            if "vencedor" in dados:
                pontuacao[dados["vencedor"]] += 1

        vencedor_geral = max(pontuacao, key=pontuacao.get)

        # Análise por segmento
        melhor_por_regiao = {}
        for nome, dados in agregados.items():
            breakdown = dados.get("breakdown", {}).get("por_regiao", {})
            for regiao, stats in breakdown.items():
                if regiao not in melhor_por_regiao:
                    melhor_por_regiao[regiao] = {"mensagem": nome, "taxa": stats["taxa_persuasao"]}
                elif stats["taxa_persuasao"] > melhor_por_regiao[regiao]["taxa"]:
                    melhor_por_regiao[regiao] = {"mensagem": nome, "taxa": stats["taxa_persuasao"]}

        return {
            "vencedor_geral": vencedor_geral,
            "pontuacao": pontuacao,
            "metricas_comparadas": metricas_comparadas,
            "melhor_por_regiao": melhor_por_regiao,
            "recomendacao": self._gerar_recomendacao(agregados, vencedor_geral, metricas_comparadas)
        }

    def _gerar_recomendacao(
        self,
        agregados: Dict,
        vencedor: str,
        metricas: Dict
    ) -> str:
        """
        Gera recomendação textual baseada nos resultados.
        """
        vencedor_dados = agregados.get(vencedor, {}).get("metricas", {})
        taxa_persuasao = vencedor_dados.get("taxa_persuasao", 0)
        taxa_backfire = vencedor_dados.get("taxa_backfire", 0)

        if taxa_persuasao > 60 and taxa_backfire < 20:
            qualidade = "EXCELENTE"
            acao = "Recomendamos usar esta mensagem imediatamente."
        elif taxa_persuasao > 40 and taxa_backfire < 30:
            qualidade = "BOA"
            acao = "Esta mensagem pode ser usada com ajustes menores."
        elif taxa_persuasao > 25:
            qualidade = "MODERADA"
            acao = "Considere refinar a mensagem antes de usar em escala."
        else:
            qualidade = "FRACA"
            acao = "Recomendamos reformular completamente a abordagem."

        return f"A mensagem '{vencedor}' teve desempenho {qualidade} com {taxa_persuasao}% de persuasão e {taxa_backfire}% de rejeição. {acao}"

    def listar_historico(self, limite: int = 10) -> List[Dict]:
        """Lista histórico de testes A/B"""
        return sorted(
            self._historico,
            key=lambda x: x.get("metadados", {}).get("executado_em", ""),
            reverse=True
        )[:limite]


# Instância singleton
_simulador_ab_servico: Optional[SimuladorABServico] = None


def obter_simulador_ab_servico() -> SimuladorABServico:
    """Obtém instância singleton"""
    global _simulador_ab_servico
    if _simulador_ab_servico is None:
        _simulador_ab_servico = SimuladorABServico()
    return _simulador_ab_servico
```

#### 2. `backend/app/api/rotas/simulador_ab.py`

```python
"""
Rotas de API para Simulador A/B Virtual

Endpoints para testar mensagens em eleitores sintéticos.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from app.servicos.simulador_ab_servico import obter_simulador_ab_servico


router = APIRouter(prefix="/simulador-ab", tags=["Simulador A/B"])


class MensagemTeste(BaseModel):
    """Uma mensagem para testar"""
    nome: str = Field(..., description="Nome/identificador da mensagem (ex: 'A', 'B', 'Controle')")
    texto: str = Field(..., description="Texto da mensagem", min_length=10, max_length=2000)


class FiltrosEleitor(BaseModel):
    """Filtros para seleção de eleitores"""
    regiao_administrativa: Optional[List[str]] = None
    cluster_socioeconomico: Optional[List[str]] = None
    orientacao_politica: Optional[List[str]] = None


class TesteABRequest(BaseModel):
    """Request para executar teste A/B"""
    mensagens: List[MensagemTeste] = Field(
        ...,
        description="Lista de mensagens a comparar (mínimo 2)",
        min_length=2,
        max_length=5
    )
    eleitor_ids: Optional[List[str]] = Field(
        None,
        description="IDs específicos de eleitores"
    )
    filtros: Optional[FiltrosEleitor] = Field(
        None,
        description="Filtros para seleção"
    )
    contexto: str = Field(
        "Você está navegando nas redes sociais e vê esta mensagem política.",
        description="Contexto de exposição à mensagem"
    )
    limite_eleitores: int = Field(
        30,
        ge=5,
        le=100,
        description="Máximo de eleitores a simular"
    )


@router.post("/executar")
async def executar_teste_ab(request: TesteABRequest) -> Dict[str, Any]:
    """
    Executa teste A/B virtual comparando múltiplas mensagens.

    Simula a exposição de eleitores sintéticos a cada mensagem e
    compara métricas como taxa de persuasão, rejeição e engajamento.

    **Atenção**: Este endpoint pode demorar alguns minutos dependendo
    do número de eleitores e mensagens.
    """
    servico = obter_simulador_ab_servico()

    # Converter mensagens para formato interno
    mensagens = [{"nome": m.nome, "texto": m.texto} for m in request.mensagens]

    # Converter filtros
    filtros_dict = None
    if request.filtros:
        filtros_dict = {
            k: v for k, v in request.filtros.model_dump().items()
            if v is not None
        }

    resultado = servico.executar_teste_ab(
        mensagens=mensagens,
        eleitor_ids=request.eleitor_ids,
        filtros=filtros_dict,
        contexto=request.contexto,
        limite_eleitores=request.limite_eleitores
    )

    if "erro" in resultado:
        raise HTTPException(status_code=400, detail=resultado["erro"])

    return resultado


@router.get("/historico")
async def listar_historico(limite: int = 10) -> Dict[str, Any]:
    """
    Lista histórico de testes A/B executados.
    """
    servico = obter_simulador_ab_servico()
    historico = servico.listar_historico(limite)

    return {
        "historico": historico,
        "total": len(historico)
    }


@router.get("/{teste_id}")
async def obter_teste(teste_id: str) -> Dict[str, Any]:
    """
    Obtém detalhes de um teste A/B específico pelo ID.
    """
    servico = obter_simulador_ab_servico()

    for teste in servico._historico:
        if teste.get("id") == teste_id:
            return teste

    raise HTTPException(status_code=404, detail="Teste não encontrado")
```

#### 3. Registrar rota em `backend/app/main.py`

**ADICIONAR**:

```python
from app.api.rotas.simulador_ab import router as simulador_ab_router
app.include_router(simulador_ab_router, prefix="/api/v1")
```

---

### Frontend

#### 4. `frontend/src/app/(dashboard)/simulador/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FlaskConical,
  Plus,
  Trash2,
  Play,
  Loader2,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";

// Tipos
interface MensagemTeste {
  nome: string;
  texto: string;
}

interface MetricasResultado {
  taxa_atencao: number;
  taxa_persuasao: number;
  taxa_backfire: number;
  taxa_mudanca_voto: number;
  taxa_compartilhamento: number;
  intensidade_emocional_media: number;
  probabilidade_mudanca_media: number;
}

interface ResultadoMensagem {
  mensagem: string;
  total_simulacoes: number;
  simulacoes_validas: number;
  metricas: MetricasResultado;
  distribuicao_sentimentos: Record<string, number>;
  breakdown: {
    por_regiao: Record<string, any>;
    por_cluster: Record<string, any>;
    por_orientacao: Record<string, any>;
  };
}

interface Comparacao {
  vencedor_geral: string;
  pontuacao: Record<string, number>;
  metricas_comparadas: Record<string, any>;
  recomendacao: string;
}

interface ResultadoTesteAB {
  id: string;
  mensagens_testadas: string[];
  total_eleitores: number;
  total_simulacoes: number;
  resultados: Record<string, ResultadoMensagem>;
  comparacao: Comparacao;
  metadados: {
    tempo_total_segundos: number;
    tokens_totais: number;
    custo_estimado_usd: number;
  };
}

// Cores para mensagens
const CORES_MENSAGENS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function SimuladorPage() {
  // Estados
  const [mensagens, setMensagens] = useState<MensagemTeste[]>([
    { nome: "A", texto: "" },
    { nome: "B", texto: "" }
  ]);
  const [contexto, setContexto] = useState(
    "Você está navegando nas redes sociais e vê esta mensagem política."
  );
  const [limiteEleitores, setLimiteEleitores] = useState(30);
  const [filtroRegiao, setFiltroRegiao] = useState("todas");
  const [filtroCluster, setFiltroCluster] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTesteAB | null>(null);

  // Handlers
  const handleAddMensagem = () => {
    if (mensagens.length >= 5) {
      toast.error("Máximo de 5 mensagens");
      return;
    }
    const letras = "ABCDE";
    const novaLetra = letras[mensagens.length];
    setMensagens([...mensagens, { nome: novaLetra, texto: "" }]);
  };

  const handleRemoveMensagem = (index: number) => {
    if (mensagens.length <= 2) {
      toast.error("Mínimo de 2 mensagens para comparação");
      return;
    }
    setMensagens(mensagens.filter((_, i) => i !== index));
  };

  const handleUpdateMensagem = (index: number, campo: "nome" | "texto", valor: string) => {
    const novas = [...mensagens];
    novas[index][campo] = valor;
    setMensagens(novas);
  };

  const handleExecutarTeste = async () => {
    // Validações
    const vazias = mensagens.filter(m => !m.texto.trim());
    if (vazias.length > 0) {
      toast.error("Todas as mensagens devem ter texto");
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await api.post("/api/v1/simulador-ab/executar", {
        mensagens: mensagens,
        contexto: contexto,
        limite_eleitores: limiteEleitores,
        filtros: (filtroRegiao !== "todas" || filtroCluster !== "todos") ? {
          regiao_administrativa: filtroRegiao !== "todas" ? [filtroRegiao] : undefined,
          cluster_socioeconomico: filtroCluster !== "todos" ? [filtroCluster] : undefined
        } : undefined
      });

      setResultado(response.data);
      toast.success("Teste A/B concluído!");
    } catch (error: any) {
      console.error("Erro no teste A/B:", error);
      toast.error(error.response?.data?.detail || "Erro ao executar teste");
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const dadosComparacao = resultado ? Object.entries(resultado.resultados).map(([nome, dados], idx) => ({
    nome,
    "Taxa Persuasão": dados.metricas?.taxa_persuasao || 0,
    "Taxa Backfire": dados.metricas?.taxa_backfire || 0,
    "Mudança de Voto": dados.metricas?.taxa_mudanca_voto || 0,
    "Compartilhamento": dados.metricas?.taxa_compartilhamento || 0,
    fill: CORES_MENSAGENS[idx]
  })) : [];

  const dadosRadar = resultado ? Object.entries(resultado.resultados).map(([nome, dados]) => ({
    mensagem: nome,
    atencao: dados.metricas?.taxa_atencao || 0,
    persuasao: dados.metricas?.taxa_persuasao || 0,
    emocao: dados.metricas?.intensidade_emocional_media * 10 || 0,
    compartilhamento: dados.metricas?.taxa_compartilhamento || 0,
    mudanca: dados.metricas?.taxa_mudanca_voto || 0
  })) : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-cyan-500" />
          Simulador A/B Virtual
        </h1>
        <p className="text-muted-foreground mt-1">
          Teste mensagens em eleitores sintéticos antes de ir a campo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mensagens para Testar</CardTitle>
              <CardDescription>
                Adicione 2-5 mensagens para comparar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mensagens.map((msg, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        style={{ backgroundColor: CORES_MENSAGENS[index] }}
                        className="text-white"
                      >
                        Mensagem {msg.nome}
                      </Badge>
                    </div>
                    {mensagens.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMensagem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Digite o texto da mensagem..."
                    value={msg.texto}
                    onChange={(e) => handleUpdateMensagem(index, "texto", e.target.value)}
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {msg.texto.length} caracteres
                  </div>
                </div>
              ))}

              {mensagens.length < 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddMensagem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Mensagem
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contexto de Exposição</Label>
                <Textarea
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  rows={2}
                  placeholder="Em que situação o eleitor veria esta mensagem?"
                />
              </div>

              <div className="space-y-2">
                <Label>Eleitores a Simular: {limiteEleitores}</Label>
                <Input
                  type="range"
                  min={5}
                  max={100}
                  value={limiteEleitores}
                  onChange={(e) => setLimiteEleitores(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 (rápido)</span>
                  <span>100 (preciso)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Filtrar Público</Label>
                <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as regiões</SelectItem>
                    <SelectItem value="Ceilândia">Ceilândia</SelectItem>
                    <SelectItem value="Taguatinga">Taguatinga</SelectItem>
                    <SelectItem value="Samambaia">Samambaia</SelectItem>
                    <SelectItem value="Plano Piloto">Plano Piloto</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroCluster} onValueChange={setFiltroCluster}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os clusters</SelectItem>
                    <SelectItem value="G1_alta">G1 - Alta</SelectItem>
                    <SelectItem value="G2_media_alta">G2 - Média Alta</SelectItem>
                    <SelectItem value="G3_media_baixa">G3 - Média Baixa</SelectItem>
                    <SelectItem value="G4_baixa">G4 - Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleExecutarTeste}
                disabled={loading || mensagens.some(m => !m.texto.trim())}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Simulando... (pode levar alguns minutos)
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Executar Teste A/B
                  </>
                )}
              </Button>

              {loading && (
                <div className="text-center text-sm text-muted-foreground">
                  Simulando {limiteEleitores} eleitores × {mensagens.length} mensagens
                  <br />= {limiteEleitores * mensagens.length} simulações
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {!resultado && !loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure as mensagens e clique em "Executar Teste A/B"</p>
                <p className="text-sm mt-2">
                  O simulador testará cada mensagem em eleitores sintéticos
                </p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-cyan-500" />
                <p className="font-medium">Executando simulações...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Claude está simulando as reações de cada eleitor
                </p>
                <Progress className="w-64 mt-4" value={undefined} />
              </div>
            </Card>
          )}

          {resultado && !loading && (
            <Tabs defaultValue="vencedor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vencedor">Vencedor</TabsTrigger>
                <TabsTrigger value="metricas">Métricas</TabsTrigger>
                <TabsTrigger value="segmentos">Por Segmento</TabsTrigger>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              </TabsList>

              {/* Tab: Vencedor */}
              <TabsContent value="vencedor" className="space-y-4">
                <Card className="border-2 border-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-amber-500" />
                        Vencedor: Mensagem {resultado.comparacao.vencedor_geral}
                      </CardTitle>
                      <Badge className="bg-green-500 text-white text-lg px-4 py-1">
                        {resultado.resultados[resultado.comparacao.vencedor_geral]?.metricas?.taxa_persuasao || 0}%
                        persuasão
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg mb-4">{resultado.comparacao.recomendacao}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(resultado.comparacao.pontuacao).map(([nome, pontos], idx) => (
                        <Card key={nome} className={nome === resultado.comparacao.vencedor_geral ? "border-green-500" : ""}>
                          <CardContent className="p-4 text-center">
                            <Badge
                              style={{ backgroundColor: CORES_MENSAGENS[idx] }}
                              className="text-white mb-2"
                            >
                              {nome}
                            </Badge>
                            <div className="text-2xl font-bold">{pontos}</div>
                            <div className="text-xs text-muted-foreground">
                              métricas vencidas
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de comparação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação Visual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosComparacao}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Taxa Persuasão" fill="#10b981" />
                        <Bar dataKey="Taxa Backfire" fill="#ef4444" />
                        <Bar dataKey="Mudança de Voto" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Métricas */}
              <TabsContent value="metricas" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(resultado.resultados).map(([nome, dados], idx) => (
                    <Card key={nome}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Badge
                            style={{ backgroundColor: CORES_MENSAGENS[idx] }}
                            className="text-white"
                          >
                            Mensagem {nome}
                          </Badge>
                          {nome === resultado.comparacao.vencedor_geral && (
                            <Trophy className="h-5 w-5 text-amber-500" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Taxa de Persuasão
                          </span>
                          <span className="font-bold text-green-600">
                            {dados.metricas?.taxa_persuasao || 0}%
                          </span>
                        </div>
                        <Progress value={dados.metricas?.taxa_persuasao || 0} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Taxa de Rejeição
                          </span>
                          <span className="font-bold text-red-600">
                            {dados.metricas?.taxa_backfire || 0}%
                          </span>
                        </div>
                        <Progress value={dados.metricas?.taxa_backfire || 0} className="h-2 bg-red-100" />

                        <Separator />

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Atenção:</span>
                            <span className="ml-2 font-medium">{dados.metricas?.taxa_atencao || 0}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mudança voto:</span>
                            <span className="ml-2 font-medium">{dados.metricas?.taxa_mudanca_voto || 0}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compartilhamento:</span>
                            <span className="ml-2 font-medium">{dados.metricas?.taxa_compartilhamento || 0}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Intensidade:</span>
                            <span className="ml-2 font-medium">{dados.metricas?.intensidade_emocional_media || 0}/10</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tab: Segmentos */}
              <TabsContent value="segmentos" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Melhor Mensagem por Região</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Região</TableHead>
                          <TableHead>Melhor Mensagem</TableHead>
                          <TableHead>Taxa Persuasão</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.comparacao.melhor_por_regiao &&
                          Object.entries(resultado.comparacao.melhor_por_regiao).map(([regiao, dados]: [string, any]) => (
                            <TableRow key={regiao}>
                              <TableCell>{regiao}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{dados.mensagem}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-green-600">{dados.taxa}%</span>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Breakdown detalhado da mensagem vencedora */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Breakdown: Mensagem {resultado.comparacao.vencedor_geral}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Por Cluster */}
                      <div>
                        <h4 className="font-semibold mb-2">Por Cluster</h4>
                        {resultado.resultados[resultado.comparacao.vencedor_geral]?.breakdown?.por_cluster &&
                          Object.entries(resultado.resultados[resultado.comparacao.vencedor_geral].breakdown.por_cluster)
                            .map(([cluster, dados]: [string, any]) => (
                              <div key={cluster} className="flex justify-between py-1">
                                <span className="text-sm">{cluster}</span>
                                <span className="text-sm font-medium">{dados.taxa_persuasao}%</span>
                              </div>
                            ))
                        }
                      </div>

                      {/* Por Orientação */}
                      <div>
                        <h4 className="font-semibold mb-2">Por Orientação</h4>
                        {resultado.resultados[resultado.comparacao.vencedor_geral]?.breakdown?.por_orientacao &&
                          Object.entries(resultado.resultados[resultado.comparacao.vencedor_geral].breakdown.por_orientacao)
                            .map(([orient, dados]: [string, any]) => (
                              <div key={orient} className="flex justify-between py-1">
                                <span className="text-sm">{orient}</span>
                                <span className="text-sm font-medium">{dados.taxa_persuasao}%</span>
                              </div>
                            ))
                        }
                      </div>

                      {/* Sentimentos */}
                      <div>
                        <h4 className="font-semibold mb-2">Sentimentos</h4>
                        {resultado.resultados[resultado.comparacao.vencedor_geral]?.distribuicao_sentimentos &&
                          Object.entries(resultado.resultados[resultado.comparacao.vencedor_geral].distribuicao_sentimentos)
                            .map(([sent, qtd]: [string, any]) => (
                              <div key={sent} className="flex justify-between py-1">
                                <span className="text-sm">{sent}</span>
                                <span className="text-sm font-medium">{qtd}</span>
                              </div>
                            ))
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Detalhes */}
              <TabsContent value="detalhes">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Simulação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{resultado.total_eleitores}</div>
                        <div className="text-sm text-muted-foreground">Eleitores</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{resultado.total_simulacoes}</div>
                        <div className="text-sm text-muted-foreground">Simulações</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{resultado.metadados.tempo_total_segundos}s</div>
                        <div className="text-sm text-muted-foreground">Tempo Total</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">${resultado.metadados.custo_estimado_usd}</div>
                        <div className="text-sm text-muted-foreground">Custo</div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Contexto Utilizado</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded">
                        {resultado.contexto}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">ID do Teste</h4>
                      <code className="text-sm bg-muted p-2 rounded">{resultado.id}</code>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 5. Atualizar Sidebar

**ADICIONAR** ao grupo "Inteligência":

```tsx
{
  title: "Simulador A/B",
  href: "/simulador",
  icon: FlaskConical,
  description: "Teste A/B virtual"
}
```

---

### Testes

#### 6. `backend/tests/test_simulador_ab.py`

```python
"""
Testes para o Simulador A/B Virtual
"""

import pytest
from app.servicos.simulador_ab_servico import SimuladorABServico, obter_simulador_ab_servico


class TestSimuladorABServico:
    """Testes do simulador A/B"""

    def test_instancia_singleton(self):
        """Verifica singleton"""
        s1 = obter_simulador_ab_servico()
        s2 = obter_simulador_ab_servico()
        assert s1 is s2

    def test_construir_prompt(self):
        """Testa construção de prompt"""
        servico = SimuladorABServico()
        eleitor = {
            "nome": "Teste",
            "idade": 30,
            "regiao_administrativa": "Ceilândia",
            "orientacao_politica": "centro",
            "valores": ["Família"],
            "medos": ["Desemprego"],
            "vieses_cognitivos": ["confirmacao"]
        }

        prompt = servico._construir_prompt_simulacao(
            eleitor, "Mensagem teste", "Contexto teste"
        )

        assert "Teste" in prompt
        assert "30" in prompt
        assert "Ceilândia" in prompt
        assert "Mensagem teste" in prompt

    def test_agregar_resultados_vazio(self):
        """Testa agregação com lista vazia"""
        servico = SimuladorABServico()
        resultado = servico._agregar_resultados([], "Teste")
        assert "erro" in resultado

    def test_agregar_resultados_validos(self):
        """Testa agregação com resultados válidos"""
        servico = SimuladorABServico()
        resultados = [
            {
                "prestaria_atencao": True,
                "persuadido": True,
                "backfire": False,
                "mudaria_opiniao": True,
                "compartilharia": False,
                "intensidade_emocional": 7,
                "probabilidade_mudanca_voto": 0.6,
                "sentimento_dominante": "esperanca",
                "regiao": "Ceilândia",
                "cluster": "G2_media_alta",
                "orientacao": "centro"
            },
            {
                "prestaria_atencao": True,
                "persuadido": False,
                "backfire": True,
                "mudaria_opiniao": False,
                "compartilharia": False,
                "intensidade_emocional": 8,
                "probabilidade_mudanca_voto": 0.2,
                "sentimento_dominante": "raiva",
                "regiao": "Taguatinga",
                "cluster": "G3_media_baixa",
                "orientacao": "direita"
            }
        ]

        agregado = servico._agregar_resultados(resultados, "Teste")

        assert agregado["total_simulacoes"] == 2
        assert agregado["simulacoes_validas"] == 2
        assert "metricas" in agregado
        assert agregado["metricas"]["taxa_persuasao"] == 50.0
        assert agregado["metricas"]["taxa_backfire"] == 50.0

    def test_gerar_comparacao(self):
        """Testa geração de comparação"""
        servico = SimuladorABServico()
        agregados = {
            "A": {
                "metricas": {
                    "taxa_persuasao": 60,
                    "taxa_backfire": 10,
                    "taxa_mudanca_voto": 40,
                    "taxa_compartilhamento": 30,
                    "intensidade_emocional_media": 7
                }
            },
            "B": {
                "metricas": {
                    "taxa_persuasao": 40,
                    "taxa_backfire": 30,
                    "taxa_mudanca_voto": 20,
                    "taxa_compartilhamento": 20,
                    "intensidade_emocional_media": 5
                }
            }
        }

        comparacao = servico._gerar_comparacao(agregados)

        assert comparacao["vencedor_geral"] == "A"
        assert comparacao["pontuacao"]["A"] > comparacao["pontuacao"]["B"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 3

- [ ] `backend/app/servicos/simulador_ab_servico.py` criado
- [ ] `backend/app/api/rotas/simulador_ab.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/simulador/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] Testes passando
- [ ] Página `/simulador` acessível
- [ ] Teste A/B executando corretamente
- [ ] Resultados sendo exibidos com comparação

---

## INTEGRAÇÃO COM FASES ANTERIORES

### Com Fase 2 (Mensagens):
Na página de Mensagens, adicionar botão "Testar no Simulador" que:
1. Pega as mensagens geradas
2. Redireciona para `/simulador` com as mensagens pré-carregadas
3. Ou abre modal para executar teste rápido

### Com Fase 1 (Swing Voters):
Permitir selecionar apenas swing voters para o teste A/B:
1. Adicionar opção "Apenas Swing Voters" nos filtros
2. Isso testa mensagens especificamente no público mais persuadível

---

## PRÓXIMA FASE

Continue para `PLANO_FASE_4_CENARIOS.md` após completar este checklist.
