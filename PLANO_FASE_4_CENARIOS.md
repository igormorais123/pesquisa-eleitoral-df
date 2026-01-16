# FASE 4: SIMULADOR DE CENÁRIOS ("WHAT-IF")

## Documento de Implementação Detalhado

**Dependências**: Fases 1, 2, 3 (recomendado ter todas implementadas)
**Estimativa**: 5-7 dias de desenvolvimento
**Risco**: Baixo

---

## OBJETIVO

Criar um sistema que simula como a intenção de voto dos eleitores mudaria em resposta a eventos hipotéticos (notícias, escândalos, mudanças econômicas, alianças políticas, etc).

---

## CONCEITO

```
┌─────────────────────────────────────────────────────────────────┐
│                 SIMULADOR DE CENÁRIOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PERGUNTA CENTRAL:                                              │
│  "Se acontecer X, como os eleitores reagiriam?"                 │
│                                                                 │
│  EXEMPLOS DE CENÁRIOS:                                          │
│  ├─ "Notícia de corrupção envolvendo candidato A"               │
│  ├─ "Economia piora: inflação sobe 5%"                          │
│  ├─ "Candidato B forma aliança com partido controverso"         │
│  ├─ "Escândalo pessoal do candidato C vem à tona"               │
│  ├─ "Debate televisivo: candidato A se sai muito bem"           │
│  └─ "Endorsement de celebridade para candidato D"               │
│                                                                 │
│  OUTPUT:                                                        │
│  ├─ Delta de intenção de voto (antes vs depois)                 │
│  ├─ Quem mudou (perfil dos afetados)                           │
│  ├─ Para onde foram (redistribuição)                           │
│  └─ Insights estratégicos                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TIPOS DE CENÁRIOS PRÉ-CONFIGURADOS

### 1. ESCÂNDALOS E CRISES
- Corrupção (desvio de dinheiro, propina)
- Escândalo pessoal (traição, violência)
- Declaração polêmica
- Fake news viralizada

### 2. ECONOMIA
- Inflação sobe
- Desemprego aumenta
- Dólar dispara
- Bolsa cai

### 3. ALIANÇAS E ENDORSEMENTS
- Aliança com partido X
- Apoio de celebridade
- Apoio de líder religioso
- Rejeição de aliado importante

### 4. DESEMPENHO EM EVENTOS
- Debate televisivo (bom/ruim)
- Entrevista viraliza (positiva/negativa)
- Comício lotado/vazio

### 5. PERSONALIZADOS
- Usuário define cenário customizado

---

## ARQUIVOS A CRIAR

### Backend

#### 1. `backend/app/servicos/cenario_servico.py`

```python
"""
Serviço de Simulação de Cenários

Simula como eventos hipotéticos afetariam a intenção de voto.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from collections import Counter

from anthropic import Anthropic

from app.core.config import configuracoes
from app.servicos.eleitor_servico import obter_servico_eleitores


class CenarioServico:
    """Serviço para simulação de cenários eleitorais"""

    MODELO = "claude-sonnet-4-5-20250514"
    MAX_TOKENS = 2000
    TEMPERATURE = 0.4

    # Cenários pré-configurados
    CENARIOS_PREDEFINIDOS = {
        "corrupcao": {
            "categoria": "escandalo",
            "titulo": "Escândalo de Corrupção",
            "descricao": "Surge notícia de que o candidato {candidato} está envolvido em esquema de desvio de dinheiro público.",
            "impacto_esperado": "alto",
            "variaveis": ["candidato"]
        },
        "escandalo_pessoal": {
            "categoria": "escandalo",
            "titulo": "Escândalo Pessoal",
            "descricao": "Vaza vídeo/áudio comprometedor do candidato {candidato} em situação pessoal constrangedora.",
            "impacto_esperado": "medio",
            "variaveis": ["candidato"]
        },
        "declaracao_polemica": {
            "categoria": "escandalo",
            "titulo": "Declaração Polêmica",
            "descricao": "O candidato {candidato} faz declaração polêmica sobre {tema}, gerando revolta nas redes.",
            "impacto_esperado": "medio",
            "variaveis": ["candidato", "tema"]
        },
        "inflacao_sobe": {
            "categoria": "economia",
            "titulo": "Inflação em Alta",
            "descricao": "Inflação dispara {percentual}% e preço dos alimentos sobe significativamente.",
            "impacto_esperado": "alto",
            "variaveis": ["percentual"]
        },
        "desemprego_aumenta": {
            "categoria": "economia",
            "titulo": "Desemprego Aumenta",
            "descricao": "Taxa de desemprego sobe para {percentual}%, com demissões em massa na região.",
            "impacto_esperado": "alto",
            "variaveis": ["percentual"]
        },
        "alianca_controversa": {
            "categoria": "alianca",
            "titulo": "Aliança Controversa",
            "descricao": "O candidato {candidato} anuncia aliança com {partido_aliado}, partido considerado controverso.",
            "impacto_esperado": "medio",
            "variaveis": ["candidato", "partido_aliado"]
        },
        "apoio_religioso": {
            "categoria": "alianca",
            "titulo": "Apoio de Líder Religioso",
            "descricao": "Importante líder {religiao} declara apoio público ao candidato {candidato}.",
            "impacto_esperado": "medio",
            "variaveis": ["religiao", "candidato"]
        },
        "debate_vencedor": {
            "categoria": "evento",
            "titulo": "Vitória em Debate",
            "descricao": "O candidato {candidato} tem desempenho excelente em debate televisivo, dominando adversários.",
            "impacto_esperado": "medio",
            "variaveis": ["candidato"]
        },
        "debate_perdedor": {
            "categoria": "evento",
            "titulo": "Derrota em Debate",
            "descricao": "O candidato {candidato} tem desempenho péssimo em debate, passando vergonha ao vivo.",
            "impacto_esperado": "medio",
            "variaveis": ["candidato"]
        },
        "economia_melhora": {
            "categoria": "economia",
            "titulo": "Economia em Recuperação",
            "descricao": "Indicadores econômicos melhoram: emprego cresce, inflação cai, dólar estabiliza.",
            "impacto_esperado": "medio",
            "variaveis": []
        }
    }

    def __init__(self):
        self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_historico = base_path / "memorias" / "cenarios.json"
        self._historico: List[Dict] = []
        self._carregar_historico()

    def _carregar_historico(self):
        if self.caminho_historico.exists():
            with open(self.caminho_historico, "r", encoding="utf-8") as f:
                self._historico = json.load(f)

    def _salvar_historico(self):
        self.caminho_historico.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_historico, "w", encoding="utf-8") as f:
            json.dump(self._historico, f, ensure_ascii=False, indent=2, default=str)

    def listar_cenarios_predefinidos(self) -> Dict[str, Any]:
        """Retorna lista de cenários pré-configurados"""
        return {
            "cenarios": self.CENARIOS_PREDEFINIDOS,
            "categorias": ["escandalo", "economia", "alianca", "evento", "customizado"]
        }

    def _construir_cenario(
        self,
        tipo_cenario: str,
        variaveis: Dict[str, str]
    ) -> str:
        """Constrói descrição do cenário com variáveis"""
        if tipo_cenario not in self.CENARIOS_PREDEFINIDOS:
            return variaveis.get("descricao_customizada", "Cenário não especificado")

        cenario = self.CENARIOS_PREDEFINIDOS[tipo_cenario]
        descricao = cenario["descricao"]

        for var, valor in variaveis.items():
            descricao = descricao.replace(f"{{{var}}}", valor)

        return descricao

    def _construir_prompt_cenario(
        self,
        eleitor: Dict[str, Any],
        cenario_descricao: str,
        intencao_voto_atual: Optional[str]
    ) -> str:
        """Constrói prompt para simulação de reação ao cenário"""
        prompt = f"""Você é um eleitor REAL do Distrito Federal reagindo a uma notícia/evento político.

## SEU PERFIL

**Dados Básicos:**
- Nome: {eleitor.get('nome')}
- Idade: {eleitor.get('idade')} anos
- Região: {eleitor.get('regiao_administrativa')}
- Profissão: {eleitor.get('profissao')}
- Renda: {eleitor.get('renda_salarios_minimos')} salários mínimos

**Perfil Político:**
- Orientação: {eleitor.get('orientacao_politica')}
- Posição sobre Bolsonaro: {eleitor.get('posicao_bolsonaro')}
- Interesse político: {eleitor.get('interesse_politico')}

**Perfil Psicológico:**
- Valores: {', '.join(eleitor.get('valores', []))}
- Medos: {', '.join(eleitor.get('medos', []))}
- Preocupações: {', '.join(eleitor.get('preocupacoes', []))}
- Vieses: {', '.join(eleitor.get('vieses_cognitivos', []))}
- Susceptibilidade desinformação: {eleitor.get('susceptibilidade_desinformacao')}/10

**Comportamento:**
- Religião: {eleitor.get('religiao')}
- Estilo decisão: {eleitor.get('estilo_decisao')}
- Fontes de informação: {', '.join(eleitor.get('fontes_informacao', []))}

**Instrução Comportamental:**
{eleitor.get('instrucao_comportamental', '')}

## CENÁRIO/EVENTO

{cenario_descricao}

## INTENÇÃO DE VOTO ATUAL
{intencao_voto_atual or "Ainda não definida/Indeciso"}

## SUA TAREFA

Simule sua reação AUTÊNTICA a este evento. Considere:
1. Como você ficaria sabendo disso?
2. Isso muda sua percepção de algum candidato?
3. Isso afeta sua intenção de voto?

## FORMATO DE RESPOSTA (JSON)

```json
{{
  "tomaria_conhecimento": true/false,
  "canal_conhecimento": "TV|WhatsApp|redes_sociais|conversa|não_saberia",

  "reacao_emocional": "indignacao|decepcao|raiva|indiferenca|apoio|satisfacao|medo|esperanca",
  "intensidade_reacao": 1-10,

  "acredita_informacao": true/false,
  "motivo_credibilidade": "Por que acredita ou não",

  "afeta_percepcao": true/false,
  "candidato_afetado": "Nome do candidato mais afetado ou null",
  "direcao_percepcao": "positiva|negativa|neutra",

  "muda_intencao_voto": true/false,
  "intencao_voto_antes": "candidato atual ou indeciso",
  "intencao_voto_depois": "novo candidato ou mantém",
  "motivo_mudanca": "Por que mudou ou não",

  "probabilidade_mudanca": 0.0-1.0,

  "comentario_espontaneo": "O que você diria sobre isso (fala autêntica)"
}}
```

Responda APENAS com o JSON."""

        return prompt

    def _simular_eleitor_cenario(
        self,
        eleitor: Dict[str, Any],
        cenario_descricao: str,
        intencao_voto_atual: Optional[str]
    ) -> Dict[str, Any]:
        """Simula reação de um eleitor ao cenário"""
        prompt = self._construir_prompt_cenario(eleitor, cenario_descricao, intencao_voto_atual)

        try:
            response = self.client.messages.create(
                model=self.MODELO,
                max_tokens=self.MAX_TOKENS,
                temperature=self.TEMPERATURE,
                messages=[{"role": "user", "content": prompt}]
            )
            resposta_texto = response.content[0].text

            # Parse JSON
            import re
            json_match = re.search(r'\{[\s\S]*\}', resposta_texto)
            if json_match:
                resultado = json.loads(json_match.group(0))
            else:
                resultado = {"erro": "Não foi possível parsear resposta"}

            resultado["eleitor_id"] = eleitor.get("id")
            resultado["eleitor_nome"] = eleitor.get("nome")
            resultado["regiao"] = eleitor.get("regiao_administrativa")
            resultado["cluster"] = eleitor.get("cluster_socioeconomico")
            resultado["orientacao"] = eleitor.get("orientacao_politica")
            resultado["tokens"] = response.usage.input_tokens + response.usage.output_tokens

            return resultado

        except Exception as e:
            return {
                "eleitor_id": eleitor.get("id"),
                "erro": str(e),
                "muda_intencao_voto": False
            }

    def simular_cenario(
        self,
        tipo_cenario: str,
        variaveis: Dict[str, str],
        eleitor_ids: Optional[List[str]] = None,
        filtros: Optional[Dict[str, Any]] = None,
        intencao_voto_baseline: Optional[Dict[str, str]] = None,
        limite_eleitores: int = 50
    ) -> Dict[str, Any]:
        """
        Simula impacto de um cenário na intenção de voto.

        Args:
            tipo_cenario: ID do cenário predefinido ou "customizado"
            variaveis: Variáveis para preencher o cenário
            eleitor_ids: IDs específicos (opcional)
            filtros: Filtros de seleção
            intencao_voto_baseline: Dict {eleitor_id: candidato} com intenção atual
            limite_eleitores: Máximo de eleitores

        Returns:
            Análise completa do impacto do cenário
        """
        eleitor_servico = obter_servico_eleitores()

        # Construir cenário
        cenario_descricao = self._construir_cenario(tipo_cenario, variaveis)

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

        inicio = datetime.now()
        resultados = []
        total_tokens = 0

        # Simular cada eleitor
        for eleitor in eleitores:
            intencao_atual = None
            if intencao_voto_baseline:
                intencao_atual = intencao_voto_baseline.get(eleitor.get("id"))

            resultado = self._simular_eleitor_cenario(
                eleitor, cenario_descricao, intencao_atual
            )
            resultados.append(resultado)
            total_tokens += resultado.get("tokens", 0)

        # Agregar resultados
        analise = self._agregar_cenario(resultados, cenario_descricao)

        tempo_total = (datetime.now() - inicio).total_seconds()

        resultado_final = {
            "id": f"cen-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "cenario": {
                "tipo": tipo_cenario,
                "variaveis": variaveis,
                "descricao": cenario_descricao,
                "categoria": self.CENARIOS_PREDEFINIDOS.get(tipo_cenario, {}).get("categoria", "customizado")
            },
            "analise": analise,
            "resultados_individuais": resultados[:30],  # Top 30
            "metadados": {
                "total_eleitores": len(eleitores),
                "tempo_segundos": round(tempo_total, 1),
                "tokens_totais": total_tokens,
                "custo_usd": round(total_tokens * 0.006 / 1000, 4),
                "executado_em": datetime.now().isoformat()
            }
        }

        self._historico.append(resultado_final)
        self._salvar_historico()

        return resultado_final

    def _agregar_cenario(
        self,
        resultados: List[Dict[str, Any]],
        cenario_descricao: str
    ) -> Dict[str, Any]:
        """Agrega resultados da simulação de cenário"""
        validos = [r for r in resultados if "erro" not in r]
        total = len(validos)

        if total == 0:
            return {"erro": "Nenhum resultado válido"}

        # Métricas básicas
        tomariam_conhecimento = sum(1 for r in validos if r.get("tomaria_conhecimento"))
        acreditariam = sum(1 for r in validos if r.get("acredita_informacao"))
        mudariam_voto = sum(1 for r in validos if r.get("muda_intencao_voto"))

        # Distribuição de reações
        reacoes = Counter(r.get("reacao_emocional", "indiferenca") for r in validos)

        # Intensidade média
        intensidades = [r.get("intensidade_reacao", 5) for r in validos]
        intensidade_media = sum(intensidades) / len(intensidades)

        # Probabilidade média de mudança
        probs = [r.get("probabilidade_mudanca", 0) for r in validos]
        prob_media = sum(probs) / len(probs)

        # Fluxo de votos
        fluxo_votos = {
            "mantiveram": 0,
            "mudaram": 0,
            "de_para": {}
        }

        for r in validos:
            antes = r.get("intencao_voto_antes", "indeciso")
            depois = r.get("intencao_voto_depois", "indeciso")

            if antes == depois:
                fluxo_votos["mantiveram"] += 1
            else:
                fluxo_votos["mudaram"] += 1
                chave = f"{antes} → {depois}"
                fluxo_votos["de_para"][chave] = fluxo_votos["de_para"].get(chave, 0) + 1

        # Breakdown por segmento
        por_regiao: Dict[str, Dict] = {}
        por_orientacao: Dict[str, Dict] = {}

        for r in validos:
            regiao = r.get("regiao", "Outros")
            orientacao = r.get("orientacao", "Outros")

            for seg, chave in [(por_regiao, regiao), (por_orientacao, orientacao)]:
                if chave not in seg:
                    seg[chave] = {"total": 0, "mudaram": 0, "acreditaram": 0}
                seg[chave]["total"] += 1
                if r.get("muda_intencao_voto"):
                    seg[chave]["mudaram"] += 1
                if r.get("acredita_informacao"):
                    seg[chave]["acreditaram"] += 1

        # Calcular taxas
        for seg in [por_regiao, por_orientacao]:
            for dados in seg.values():
                t = dados["total"]
                dados["taxa_mudanca"] = round(dados["mudaram"] / t * 100, 1)
                dados["taxa_credibilidade"] = round(dados["acreditaram"] / t * 100, 1)

        # Citações representativas
        citacoes = [
            {
                "eleitor": r.get("eleitor_nome"),
                "regiao": r.get("regiao"),
                "comentario": r.get("comentario_espontaneo", "")[:200],
                "mudou": r.get("muda_intencao_voto"),
                "reacao": r.get("reacao_emocional")
            }
            for r in validos[:10]
            if r.get("comentario_espontaneo")
        ]

        return {
            "resumo": {
                "taxa_conhecimento": round(tomariam_conhecimento / total * 100, 1),
                "taxa_credibilidade": round(acreditariam / total * 100, 1),
                "taxa_mudanca_voto": round(mudariam_voto / total * 100, 1),
                "probabilidade_media_mudanca": round(prob_media * 100, 1),
                "intensidade_media_reacao": round(intensidade_media, 1)
            },
            "distribuicao_reacoes": dict(reacoes.most_common()),
            "fluxo_votos": fluxo_votos,
            "impacto_por_regiao": dict(sorted(
                por_regiao.items(),
                key=lambda x: x[1]["taxa_mudanca"],
                reverse=True
            )),
            "impacto_por_orientacao": dict(sorted(
                por_orientacao.items(),
                key=lambda x: x[1]["taxa_mudanca"],
                reverse=True
            )),
            "citacoes_representativas": citacoes,
            "conclusao": self._gerar_conclusao(
                mudariam_voto / total * 100,
                reacoes.most_common(1)[0][0] if reacoes else "indiferenca",
                intensidade_media
            )
        }

    def _gerar_conclusao(
        self,
        taxa_mudanca: float,
        reacao_dominante: str,
        intensidade: float
    ) -> str:
        """Gera conclusão textual sobre o impacto"""
        if taxa_mudanca > 30:
            impacto = "MUITO ALTO"
            acao = "Este cenário teria impacto devastador na campanha."
        elif taxa_mudanca > 20:
            impacto = "ALTO"
            acao = "Este cenário causaria danos significativos."
        elif taxa_mudanca > 10:
            impacto = "MODERADO"
            acao = "Este cenário teria impacto perceptível mas gerenciável."
        elif taxa_mudanca > 5:
            impacto = "BAIXO"
            acao = "Este cenário teria impacto limitado."
        else:
            impacto = "MÍNIMO"
            acao = "Este cenário provavelmente não afetaria os resultados."

        return f"Impacto {impacto}: {taxa_mudanca:.1f}% mudariam de voto. Reação dominante: {reacao_dominante} (intensidade {intensidade:.1f}/10). {acao}"

    def listar_historico(self, limite: int = 10) -> List[Dict]:
        """Lista histórico de simulações"""
        return sorted(
            self._historico,
            key=lambda x: x.get("metadados", {}).get("executado_em", ""),
            reverse=True
        )[:limite]


# Singleton
_cenario_servico: Optional[CenarioServico] = None


def obter_cenario_servico() -> CenarioServico:
    global _cenario_servico
    if _cenario_servico is None:
        _cenario_servico = CenarioServico()
    return _cenario_servico
```

#### 2. `backend/app/api/rotas/cenarios.py`

```python
"""
Rotas de API para Simulador de Cenários
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.servicos.cenario_servico import obter_cenario_servico


router = APIRouter(prefix="/cenarios", tags=["Cenários"])


class SimularCenarioRequest(BaseModel):
    """Request para simulação de cenário"""
    tipo_cenario: str = Field(
        ...,
        description="ID do cenário predefinido ou 'customizado'"
    )
    variaveis: Dict[str, str] = Field(
        default_factory=dict,
        description="Variáveis para preencher o cenário"
    )
    filtros: Optional[Dict[str, Any]] = Field(
        None,
        description="Filtros de seleção de eleitores"
    )
    intencao_voto_baseline: Optional[Dict[str, str]] = Field(
        None,
        description="Intenção de voto atual por eleitor"
    )
    limite_eleitores: int = Field(
        30,
        ge=5,
        le=100
    )


@router.get("/predefinidos")
async def listar_cenarios_predefinidos() -> Dict[str, Any]:
    """Lista todos os cenários pré-configurados disponíveis."""
    servico = obter_cenario_servico()
    return servico.listar_cenarios_predefinidos()


@router.post("/simular")
async def simular_cenario(request: SimularCenarioRequest) -> Dict[str, Any]:
    """
    Simula o impacto de um cenário na intenção de voto.

    Retorna análise de como os eleitores reagiriam ao evento,
    incluindo taxa de mudança de voto e fluxo de votos.
    """
    servico = obter_cenario_servico()

    resultado = servico.simular_cenario(
        tipo_cenario=request.tipo_cenario,
        variaveis=request.variaveis,
        filtros=request.filtros,
        intencao_voto_baseline=request.intencao_voto_baseline,
        limite_eleitores=request.limite_eleitores
    )

    if "erro" in resultado and "analise" not in resultado:
        raise HTTPException(status_code=400, detail=resultado["erro"])

    return resultado


@router.get("/historico")
async def listar_historico(limite: int = 10) -> Dict[str, Any]:
    """Lista histórico de simulações de cenários."""
    servico = obter_cenario_servico()
    return {"historico": servico.listar_historico(limite)}
```

#### 3. Registrar rota em `backend/app/main.py`

```python
from app.api.rotas.cenarios import router as cenarios_router
app.include_router(cenarios_router, prefix="/api/v1")
```

---

### Frontend

#### 4. `frontend/src/app/(dashboard)/cenarios/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
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
  Lightbulb,
  Play,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  DollarSign,
  Users,
  Tv,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sankey,
  Layer,
  Rectangle
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";

// Tipos
interface CenarioPredefinido {
  categoria: string;
  titulo: string;
  descricao: string;
  impacto_esperado: string;
  variaveis: string[];
}

interface ResultadoCenario {
  id: string;
  cenario: {
    tipo: string;
    descricao: string;
    categoria: string;
  };
  analise: {
    resumo: {
      taxa_conhecimento: number;
      taxa_credibilidade: number;
      taxa_mudanca_voto: number;
      probabilidade_media_mudanca: number;
      intensidade_media_reacao: number;
    };
    distribuicao_reacoes: Record<string, number>;
    fluxo_votos: {
      mantiveram: number;
      mudaram: number;
      de_para: Record<string, number>;
    };
    impacto_por_regiao: Record<string, any>;
    impacto_por_orientacao: Record<string, any>;
    citacoes_representativas: Array<any>;
    conclusao: string;
  };
  metadados: any;
}

// Ícones por categoria
const ICONES_CATEGORIA: Record<string, any> = {
  escandalo: AlertTriangle,
  economia: DollarSign,
  alianca: Users,
  evento: Tv,
  customizado: Lightbulb
};

const CORES_CATEGORIA: Record<string, string> = {
  escandalo: "bg-red-100 text-red-800",
  economia: "bg-blue-100 text-blue-800",
  alianca: "bg-purple-100 text-purple-800",
  evento: "bg-green-100 text-green-800",
  customizado: "bg-gray-100 text-gray-800"
};

const CORES_REACAO = {
  indignacao: "#ef4444",
  raiva: "#dc2626",
  decepcao: "#f97316",
  medo: "#eab308",
  indiferenca: "#9ca3af",
  esperanca: "#22c55e",
  satisfacao: "#10b981",
  apoio: "#3b82f6"
};

export default function CenariosPage() {
  // Estados
  const [cenariosPredefinidos, setCenariosPredefinidos] = useState<Record<string, CenarioPredefinido>>({});
  const [tipoCenario, setTipoCenario] = useState<string>("");
  const [variaveis, setVariaveis] = useState<Record<string, string>>({});
  const [descricaoCustomizada, setDescricaoCustomizada] = useState("");
  const [limiteEleitores, setLimiteEleitores] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCenario | null>(null);

  // Carregar cenários predefinidos
  useEffect(() => {
    carregarCenarios();
  }, []);

  const carregarCenarios = async () => {
    try {
      const response = await api.get("/api/v1/cenarios/predefinidos");
      setCenariosPredefinidos(response.data.cenarios);
    } catch (error) {
      console.error("Erro ao carregar cenários:", error);
    }
  };

  // Handler de seleção de cenário
  const handleSelectCenario = (tipo: string) => {
    setTipoCenario(tipo);
    setVariaveis({});
    if (tipo !== "customizado") {
      const cenario = cenariosPredefinidos[tipo];
      if (cenario) {
        const novasVars: Record<string, string> = {};
        cenario.variaveis.forEach(v => novasVars[v] = "");
        setVariaveis(novasVars);
      }
    }
  };

  // Executar simulação
  const handleSimular = async () => {
    if (!tipoCenario) {
      toast.error("Selecione um cenário");
      return;
    }

    if (tipoCenario === "customizado" && !descricaoCustomizada) {
      toast.error("Descreva o cenário customizado");
      return;
    }

    const cenario = cenariosPredefinidos[tipoCenario];
    if (cenario) {
      const varsFaltando = cenario.variaveis.filter(v => !variaveis[v]);
      if (varsFaltando.length > 0) {
        toast.error(`Preencha: ${varsFaltando.join(", ")}`);
        return;
      }
    }

    setLoading(true);
    setResultado(null);

    try {
      const varsFinais = tipoCenario === "customizado"
        ? { descricao_customizada: descricaoCustomizada }
        : variaveis;

      const response = await api.post("/api/v1/cenarios/simular", {
        tipo_cenario: tipoCenario,
        variaveis: varsFinais,
        limite_eleitores: limiteEleitores
      });

      setResultado(response.data);
      toast.success("Simulação concluída!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro na simulação");
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const dadosReacoes = resultado?.analise?.distribuicao_reacoes
    ? Object.entries(resultado.analise.distribuicao_reacoes).map(([nome, valor]) => ({
        name: nome,
        value: valor,
        fill: CORES_REACAO[nome as keyof typeof CORES_REACAO] || "#9ca3af"
      }))
    : [];

  const dadosImpactoRegiao = resultado?.analise?.impacto_por_regiao
    ? Object.entries(resultado.analise.impacto_por_regiao).map(([regiao, dados]: [string, any]) => ({
        regiao,
        taxa_mudanca: dados.taxa_mudanca
      }))
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-amber-500" />
          Simulador de Cenários
        </h1>
        <p className="text-muted-foreground mt-1">
          Simule "E se...?" - Como eventos afetariam a intenção de voto
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecionar Cenário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={tipoCenario} onValueChange={handleSelectCenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cenário..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customizado">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Cenário Customizado
                    </div>
                  </SelectItem>
                  <Separator className="my-2" />
                  {Object.entries(cenariosPredefinidos).map(([id, cenario]) => {
                    const Icon = ICONES_CATEGORIA[cenario.categoria] || Lightbulb;
                    return (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {cenario.titulo}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Descrição do cenário selecionado */}
              {tipoCenario && tipoCenario !== "customizado" && cenariosPredefinidos[tipoCenario] && (
                <div className="p-3 bg-muted rounded-lg">
                  <Badge className={CORES_CATEGORIA[cenariosPredefinidos[tipoCenario].categoria]}>
                    {cenariosPredefinidos[tipoCenario].categoria}
                  </Badge>
                  <p className="text-sm mt-2">
                    {cenariosPredefinidos[tipoCenario].descricao}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Impacto esperado: {cenariosPredefinidos[tipoCenario].impacto_esperado}
                  </p>
                </div>
              )}

              {/* Variáveis do cenário */}
              {tipoCenario && tipoCenario !== "customizado" && cenariosPredefinidos[tipoCenario]?.variaveis.length > 0 && (
                <div className="space-y-3">
                  <Label>Preencha as variáveis:</Label>
                  {cenariosPredefinidos[tipoCenario].variaveis.map(v => (
                    <div key={v}>
                      <Label className="text-sm text-muted-foreground">{v}</Label>
                      <Input
                        placeholder={`Digite ${v}...`}
                        value={variaveis[v] || ""}
                        onChange={(e) => setVariaveis({ ...variaveis, [v]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Cenário customizado */}
              {tipoCenario === "customizado" && (
                <div className="space-y-2">
                  <Label>Descreva o cenário:</Label>
                  <Textarea
                    placeholder="Ex: O candidato X é flagrado em vídeo fazendo declarações racistas..."
                    value={descricaoCustomizada}
                    onChange={(e) => setDescricaoCustomizada(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Eleitores a simular: {limiteEleitores}</Label>
                <Input
                  type="range"
                  min={10}
                  max={100}
                  value={limiteEleitores}
                  onChange={(e) => setLimiteEleitores(Number(e.target.value))}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSimular}
                disabled={loading || !tipoCenario}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Simulando cenário...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Simular Cenário
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {!resultado && !loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um cenário e clique em "Simular"</p>
                <p className="text-sm mt-2">
                  Veja como eventos hipotéticos afetariam a intenção de voto
                </p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-amber-500" />
                <p className="font-medium">Simulando reações ao cenário...</p>
              </div>
            </Card>
          )}

          {resultado && !loading && (
            <Tabs defaultValue="resumo" className="space-y-4">
              <TabsList>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="reacoes">Reações</TabsTrigger>
                <TabsTrigger value="impacto">Impacto</TabsTrigger>
                <TabsTrigger value="citacoes">Citações</TabsTrigger>
              </TabsList>

              {/* Tab: Resumo */}
              <TabsContent value="resumo" className="space-y-4">
                {/* Card de Conclusão */}
                <Card className={`border-2 ${
                  resultado.analise.resumo.taxa_mudanca_voto > 20
                    ? "border-red-500"
                    : resultado.analise.resumo.taxa_mudanca_voto > 10
                      ? "border-amber-500"
                      : "border-green-500"
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {resultado.analise.resumo.taxa_mudanca_voto > 20 ? (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      ) : resultado.analise.resumo.taxa_mudanca_voto > 10 ? (
                        <TrendingDown className="h-6 w-6 text-amber-500" />
                      ) : (
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      )}
                      Conclusão da Análise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{resultado.analise.conclusao}</p>
                  </CardContent>
                </Card>

                {/* Métricas */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {resultado.analise.resumo.taxa_mudanca_voto}%
                      </div>
                      <div className="text-sm text-muted-foreground">Mudariam de Voto</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {resultado.analise.resumo.taxa_credibilidade}%
                      </div>
                      <div className="text-sm text-muted-foreground">Acreditariam</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-amber-600">
                        {resultado.analise.resumo.intensidade_media_reacao}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Intensidade Média</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cenário simulado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Cenário Simulado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{resultado.cenario.descricao}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Reações */}
              <TabsContent value="reacoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Reações Emocionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dadosReacoes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {dadosReacoes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Fluxo de votos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fluxo de Votos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {resultado.analise.fluxo_votos.mantiveram}
                        </div>
                        <div className="text-sm text-green-700">Mantiveram o voto</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {resultado.analise.fluxo_votos.mudaram}
                        </div>
                        <div className="text-sm text-red-700">Mudaram o voto</div>
                      </div>
                    </div>

                    {Object.entries(resultado.analise.fluxo_votos.de_para).length > 0 && (
                      <div className="space-y-2">
                        <Label>Movimentação:</Label>
                        {Object.entries(resultado.analise.fluxo_votos.de_para).map(([fluxo, qtd]) => (
                          <div key={fluxo} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              {fluxo}
                            </span>
                            <Badge>{qtd} eleitores</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Impacto */}
              <TabsContent value="impacto" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Impacto por Região</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosImpactoRegiao} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="regiao" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="taxa_mudanca" fill="#ef4444" name="% Mudança" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Impacto por Orientação Política</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {resultado.analise.impacto_por_orientacao &&
                        Object.entries(resultado.analise.impacto_por_orientacao).map(([orient, dados]: [string, any]) => (
                          <div key={orient} className="flex items-center justify-between">
                            <span>{orient}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={dados.taxa_mudanca} className="w-24 h-2" />
                              <span className="text-sm font-medium w-12">{dados.taxa_mudanca}%</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Citações */}
              <TabsContent value="citacoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>O que os eleitores diriam</CardTitle>
                    <CardDescription>Reações espontâneas simuladas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {resultado.analise.citacoes_representativas?.map((citacao, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{citacao.eleitor}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{citacao.regiao}</Badge>
                            <Badge className={citacao.mudou ? "bg-red-500" : "bg-green-500"}>
                              {citacao.mudou ? "Mudou voto" : "Manteve"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm italic text-muted-foreground">
                          "{citacao.comentario}"
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {citacao.reacao}
                        </Badge>
                      </div>
                    ))}
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

```tsx
{
  title: "Cenários",
  href: "/cenarios",
  icon: Lightbulb,
  description: "Simulador What-If"
}
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 4

- [ ] `backend/app/servicos/cenario_servico.py` criado
- [ ] `backend/app/api/rotas/cenarios.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/cenarios/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] Cenários predefinidos listando corretamente
- [ ] Simulação executando e retornando resultados
- [ ] Gráficos e análises sendo exibidos

---

## PRÓXIMA FASE

Continue para `PLANO_FASE_5_MEMORIA_EVOLUTIVA.md`
