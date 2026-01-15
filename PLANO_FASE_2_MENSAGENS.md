# FASE 2: GERADOR DE MENSAGENS OTIMIZADAS

## Documento de Implementação Detalhado

**Dependências**: Fase 1 (opcional, mas recomendado)
**Estimativa**: 5-7 dias de desenvolvimento
**Risco**: Baixo (não altera funcionalidades existentes)

---

## OBJETIVO

Criar um sistema que gera mensagens de persuasão otimizadas para clusters específicos de eleitores, utilizando Claude AI para criar variações baseadas em diferentes gatilhos psicológicos.

---

## ARQUITETURA DO MÓDULO

```
┌─────────────────────────────────────────────────────────────────┐
│                    GERADOR DE MENSAGENS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:                                                         │
│  ├─ Objetivo (ex: "convencer a votar no candidato X")          │
│  ├─ Lista de eleitores-alvo (IDs ou filtros)                   │
│  ├─ Restrições (ex: "não usar medo", "tom esperançoso")        │
│  └─ Número de variações desejadas (1-5)                        │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ├─ 1. Agregar perfis dos eleitores-alvo                       │
│  ├─ 2. Identificar padrões (medos, valores, vieses comuns)     │
│  ├─ 3. Construir prompt otimizado para Claude                  │
│  ├─ 4. Gerar N variações de mensagem                           │
│  └─ 5. Classificar e ranquear por eficácia prevista            │
│                                                                 │
│  OUTPUT:                                                        │
│  ├─ Lista de mensagens geradas                                  │
│  ├─ Gatilho principal de cada mensagem                         │
│  ├─ Predição de eficácia (0-1)                                 │
│  ├─ Perfil de eleitor mais receptivo                           │
│  └─ Risco de backfire                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TIPOS DE MENSAGENS (GATILHOS)

### 1. MENSAGEM MEDO
- **Objetivo**: Ativar ansiedades e medos identificados
- **Quando usar**: Eleitores com alta aversão a perda
- **Exemplo**: "Se X vencer, você pode perder [medo específico]"
- **Risco de backfire**: Médio

### 2. MENSAGEM ESPERANÇA
- **Objetivo**: Ativar aspirações e valores positivos
- **Quando usar**: Eleitores com tolerância a nuance alta
- **Exemplo**: "Juntos podemos construir [valor específico]"
- **Risco de backfire**: Baixo

### 3. MENSAGEM ECONÔMICA
- **Objetivo**: Foco em impacto no bolso/família
- **Quando usar**: Eleitores com estilo_decisao = "economico"
- **Exemplo**: "Com X, seu dinheiro vai render mais"
- **Risco de backfire**: Baixo

### 4. MENSAGEM TRIBAL
- **Objetivo**: Criar senso de "nós vs eles"
- **Quando usar**: Eleitores com viés de tribalismo
- **Exemplo**: "Pessoas como você estão escolhendo X"
- **Risco de backfire**: Alto

### 5. MENSAGEM IDENTITÁRIA
- **Objetivo**: Ressoar com religião/valores profundos
- **Quando usar**: Eleitores com religião forte ou valores definidos
- **Exemplo**: "X defende os valores que você acredita"
- **Risco de backfire**: Médio-Alto

---

## ARQUIVOS A CRIAR

### Backend

#### 1. `backend/app/servicos/mensagem_servico.py`

```python
"""
Serviço de Geração de Mensagens Otimizadas

Este módulo utiliza Claude AI para gerar mensagens de persuasão
otimizadas para clusters específicos de eleitores.
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from collections import Counter

from anthropic import Anthropic

from app.core.config import configuracoes
from app.servicos.eleitor_servico import obter_servico_eleitores


class MensagemServico:
    """Serviço para geração de mensagens otimizadas"""

    # Configuração de modelos
    MODELO_GERACAO = "claude-sonnet-4-5-20250514"
    MAX_TOKENS = 4000
    TEMPERATURE = 0.8  # Mais criativo para mensagens

    # Tipos de gatilhos disponíveis
    GATILHOS = {
        "medo": {
            "nome": "Medo/Ameaça",
            "descricao": "Ativa ansiedades e medos identificados",
            "risco_backfire": 0.4,
            "eficacia_base": 0.7
        },
        "esperanca": {
            "nome": "Esperança/Aspiração",
            "descricao": "Ativa aspirações e valores positivos",
            "risco_backfire": 0.1,
            "eficacia_base": 0.6
        },
        "economico": {
            "nome": "Econômico/Bolso",
            "descricao": "Foca em impacto financeiro e material",
            "risco_backfire": 0.15,
            "eficacia_base": 0.75
        },
        "tribal": {
            "nome": "Tribal/Pertencimento",
            "descricao": "Cria senso de grupo e identidade coletiva",
            "risco_backfire": 0.5,
            "eficacia_base": 0.65
        },
        "identitario": {
            "nome": "Identitário/Valores",
            "descricao": "Ressoa com religião e valores profundos",
            "risco_backfire": 0.35,
            "eficacia_base": 0.7
        }
    }

    def __init__(self):
        self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_historico = base_path / "memorias" / "mensagens_geradas.json"
        self._historico: List[Dict] = []
        self._carregar_historico()

    def _carregar_historico(self):
        """Carrega histórico de mensagens geradas"""
        if self.caminho_historico.exists():
            with open(self.caminho_historico, "r", encoding="utf-8") as f:
                self._historico = json.load(f)

    def _salvar_historico(self):
        """Salva histórico de mensagens"""
        self.caminho_historico.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_historico, "w", encoding="utf-8") as f:
            json.dump(self._historico, f, ensure_ascii=False, indent=2, default=str)

    def _agregar_perfis(self, eleitores: List[Dict]) -> Dict[str, Any]:
        """
        Agrega informações de múltiplos eleitores para identificar padrões.
        """
        if not eleitores:
            return {}

        agregado = {
            "total": len(eleitores),
            "medos": Counter(),
            "valores": Counter(),
            "preocupacoes": Counter(),
            "vieses": Counter(),
            "religioes": Counter(),
            "estilos_decisao": Counter(),
            "orientacoes": Counter(),
            "clusters": Counter(),
            "regioes": Counter(),
            "idade_media": 0,
            "susceptibilidade_media": 0,
            "fontes_informacao": Counter()
        }

        total_idade = 0
        total_suscept = 0

        for e in eleitores:
            # Listas
            for medo in e.get("medos", []):
                agregado["medos"][medo] += 1
            for valor in e.get("valores", []):
                agregado["valores"][valor] += 1
            for preoc in e.get("preocupacoes", []):
                agregado["preocupacoes"][preoc] += 1
            for vies in e.get("vieses_cognitivos", []):
                agregado["vieses"][vies] += 1
            for fonte in e.get("fontes_informacao", []):
                agregado["fontes_informacao"][fonte] += 1

            # Categóricos
            agregado["religioes"][e.get("religiao", "nao_informado")] += 1
            agregado["estilos_decisao"][e.get("estilo_decisao", "nao_informado")] += 1
            agregado["orientacoes"][e.get("orientacao_politica", "nao_informado")] += 1
            agregado["clusters"][e.get("cluster_socioeconomico", "nao_informado")] += 1
            agregado["regioes"][e.get("regiao_administrativa", "nao_informado")] += 1

            # Numéricos
            total_idade += e.get("idade", 0)
            total_suscept += e.get("susceptibilidade_desinformacao", 5)

        agregado["idade_media"] = round(total_idade / len(eleitores), 1)
        agregado["susceptibilidade_media"] = round(total_suscept / len(eleitores), 1)

        # Converter Counters para listas ordenadas (top 10)
        for campo in ["medos", "valores", "preocupacoes", "vieses", "fontes_informacao"]:
            agregado[campo] = [
                {"item": item, "frequencia": freq, "percentual": round(freq/len(eleitores)*100, 1)}
                for item, freq in agregado[campo].most_common(10)
            ]

        for campo in ["religioes", "estilos_decisao", "orientacoes", "clusters", "regioes"]:
            agregado[campo] = [
                {"item": item, "frequencia": freq, "percentual": round(freq/len(eleitores)*100, 1)}
                for item, freq in agregado[campo].most_common()
            ]

        return agregado

    def _construir_prompt(
        self,
        objetivo: str,
        agregado: Dict[str, Any],
        gatilhos_solicitados: List[str],
        restricoes: List[str],
        num_variacoes: int
    ) -> str:
        """
        Constrói o prompt otimizado para geração de mensagens.
        """
        # Top itens para o prompt
        top_medos = [m["item"] for m in agregado.get("medos", [])[:5]]
        top_valores = [v["item"] for v in agregado.get("valores", [])[:5]]
        top_preocupacoes = [p["item"] for p in agregado.get("preocupacoes", [])[:5]]
        top_vieses = [v["item"] for v in agregado.get("vieses", [])[:5]]
        top_religioes = [r["item"] for r in agregado.get("religioes", [])[:3]]
        top_estilos = [e["item"] for e in agregado.get("estilos_decisao", [])[:3]]
        top_fontes = [f["item"] for f in agregado.get("fontes_informacao", [])[:5]]

        prompt = f"""Você é um estrategista de comunicação política especializado em mensagens persuasivas.

## OBJETIVO
{objetivo}

## PERFIL AGREGADO DO PÚBLICO-ALVO ({agregado.get('total', 0)} eleitores)

### Dados Demográficos
- Idade média: {agregado.get('idade_media', 0)} anos
- Susceptibilidade à persuasão: {agregado.get('susceptibilidade_media', 5)}/10

### Padrões Psicológicos Identificados

**Medos mais comuns:**
{chr(10).join(f"- {m}" for m in top_medos)}

**Valores mais frequentes:**
{chr(10).join(f"- {v}" for v in top_valores)}

**Preocupações principais:**
{chr(10).join(f"- {p}" for p in top_preocupacoes)}

**Vieses cognitivos dominantes:**
{chr(10).join(f"- {v}" for v in top_vieses)}

### Perfil Sociocultural
- Religiões predominantes: {', '.join(top_religioes)}
- Estilos de decisão: {', '.join(top_estilos)}
- Fontes de informação: {', '.join(top_fontes)}

## GATILHOS SOLICITADOS
Gere {num_variacoes} mensagens, uma para cada gatilho:
{chr(10).join(f"- {g.upper()}: {self.GATILHOS[g]['descricao']}" for g in gatilhos_solicitados)}

## RESTRIÇÕES
{chr(10).join(f"- {r}" for r in restricoes) if restricoes else "- Nenhuma restrição específica"}

## FORMATO DE SAÍDA
Retorne um JSON válido com a seguinte estrutura:

```json
{{
  "mensagens": [
    {{
      "gatilho": "nome_do_gatilho",
      "texto_curto": "Mensagem de até 280 caracteres para redes sociais",
      "texto_longo": "Versão expandida com 2-3 parágrafos para materiais impressos ou discursos",
      "headline": "Título impactante de 5-8 palavras",
      "palavras_gatilho": ["lista", "de", "palavras", "chave"],
      "tom": "esperançoso|urgente|indignado|acolhedor|combativo",
      "canal_ideal": "WhatsApp|Instagram|TV|Rádio|Panfleto|Comício",
      "perfil_mais_receptivo": "Descrição do tipo de eleitor que mais responderia",
      "risco_backfire_estimado": 0.0 a 1.0,
      "eficacia_estimada": 0.0 a 1.0,
      "justificativa": "Por que esta mensagem funcionaria para este público"
    }}
  ],
  "recomendacao_geral": "Análise estratégica geral sobre como abordar este público",
  "alerta_riscos": ["Lista de riscos a considerar"],
  "sequencia_sugerida": "Ordem recomendada para usar as mensagens"
}}
```

## INSTRUÇÕES IMPORTANTES
1. Cada mensagem deve ser ÚNICA e explorar um gatilho diferente
2. Use linguagem compatível com o perfil socioeconômico do público
3. Adapte o vocabulário às fontes de informação que consomem
4. Considere os vieses cognitivos para aumentar eficácia
5. Seja realista nas estimativas de eficácia e risco
6. O texto_curto DEVE ter no máximo 280 caracteres
7. Retorne APENAS o JSON, sem texto adicional"""

        return prompt

    def _parse_resposta_claude(self, resposta: str) -> Dict[str, Any]:
        """
        Faz parse da resposta do Claude, tratando possíveis erros.
        """
        # Tentar extrair JSON do texto
        try:
            # Primeiro, tentar parse direto
            return json.loads(resposta)
        except json.JSONDecodeError:
            pass

        # Tentar extrair JSON de bloco de código
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', resposta)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Tentar encontrar objeto JSON no texto
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

        # Fallback: retornar estrutura vazia com erro
        return {
            "mensagens": [],
            "erro": "Não foi possível parsear a resposta do Claude",
            "resposta_bruta": resposta[:1000]
        }

    def gerar_mensagens(
        self,
        objetivo: str,
        eleitor_ids: Optional[List[str]] = None,
        filtros: Optional[Dict[str, Any]] = None,
        gatilhos: Optional[List[str]] = None,
        restricoes: Optional[List[str]] = None,
        num_variacoes: int = 5
    ) -> Dict[str, Any]:
        """
        Gera mensagens otimizadas para um conjunto de eleitores.

        Args:
            objetivo: O que se deseja alcançar (ex: "convencer a votar em X")
            eleitor_ids: IDs específicos de eleitores (opcional)
            filtros: Filtros para selecionar eleitores (opcional)
            gatilhos: Lista de gatilhos a usar (default: todos)
            restricoes: Lista de restrições (ex: "não usar medo")
            num_variacoes: Número de variações a gerar (1-5)

        Returns:
            Dict com mensagens geradas e metadados
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

        if not eleitores:
            return {
                "erro": "Nenhum eleitor encontrado com os critérios especificados",
                "mensagens": []
            }

        # Agregar perfis
        agregado = self._agregar_perfis(eleitores)

        # Definir gatilhos
        if gatilhos is None:
            gatilhos = list(self.GATILHOS.keys())
        gatilhos = gatilhos[:num_variacoes]

        # Construir prompt
        prompt = self._construir_prompt(
            objetivo=objetivo,
            agregado=agregado,
            gatilhos_solicitados=gatilhos,
            restricoes=restricoes or [],
            num_variacoes=len(gatilhos)
        )

        # Chamar Claude
        inicio = datetime.now()
        try:
            response = self.client.messages.create(
                model=self.MODELO_GERACAO,
                max_tokens=self.MAX_TOKENS,
                temperature=self.TEMPERATURE,
                messages=[{"role": "user", "content": prompt}]
            )
            resposta_texto = response.content[0].text
            tokens_entrada = response.usage.input_tokens
            tokens_saida = response.usage.output_tokens
        except Exception as e:
            return {
                "erro": f"Erro ao chamar Claude: {str(e)}",
                "mensagens": []
            }

        tempo_geracao = (datetime.now() - inicio).total_seconds()

        # Parse da resposta
        resultado = self._parse_resposta_claude(resposta_texto)

        # Adicionar metadados
        resultado["metadados"] = {
            "objetivo": objetivo,
            "total_eleitores_analisados": len(eleitores),
            "gatilhos_utilizados": gatilhos,
            "restricoes_aplicadas": restricoes or [],
            "modelo_utilizado": self.MODELO_GERACAO,
            "tokens_entrada": tokens_entrada,
            "tokens_saida": tokens_saida,
            "tempo_geracao_segundos": round(tempo_geracao, 2),
            "custo_estimado_usd": round((tokens_entrada * 0.003 + tokens_saida * 0.015) / 1000, 4),
            "gerado_em": datetime.now().isoformat()
        }

        resultado["perfil_agregado"] = agregado

        # Salvar no histórico
        self._historico.append(resultado)
        self._salvar_historico()

        return resultado

    def listar_historico(
        self,
        limite: int = 20,
        objetivo_contem: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Lista histórico de mensagens geradas.
        """
        historico = self._historico.copy()

        if objetivo_contem:
            historico = [
                h for h in historico
                if objetivo_contem.lower() in h.get("metadados", {}).get("objetivo", "").lower()
            ]

        historico.sort(
            key=lambda x: x.get("metadados", {}).get("gerado_em", ""),
            reverse=True
        )

        return historico[:limite]

    def obter_gatilhos_disponiveis(self) -> Dict[str, Any]:
        """
        Retorna informações sobre os gatilhos disponíveis.
        """
        return {
            "gatilhos": self.GATILHOS,
            "descricao": "Tipos de mensagens que podem ser geradas"
        }


# Instância singleton
_mensagem_servico: Optional[MensagemServico] = None


def obter_mensagem_servico() -> MensagemServico:
    """Obtém instância singleton do serviço"""
    global _mensagem_servico
    if _mensagem_servico is None:
        _mensagem_servico = MensagemServico()
    return _mensagem_servico
```

#### 2. `backend/app/api/rotas/mensagens.py`

```python
"""
Rotas de API para Geração de Mensagens

Endpoints para criar mensagens otimizadas de persuasão.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.servicos.mensagem_servico import obter_mensagem_servico


router = APIRouter(prefix="/mensagens", tags=["Mensagens"])


class FiltrosEleitor(BaseModel):
    """Filtros para seleção de eleitores"""
    regiao_administrativa: Optional[List[str]] = None
    cluster_socioeconomico: Optional[List[str]] = None
    orientacao_politica: Optional[List[str]] = None
    religiao: Optional[List[str]] = None
    estilo_decisao: Optional[List[str]] = None


class GerarMensagensRequest(BaseModel):
    """Request para geração de mensagens"""
    objetivo: str = Field(
        ...,
        description="Objetivo da mensagem (ex: 'convencer a votar no candidato X')",
        min_length=10,
        max_length=500
    )
    eleitor_ids: Optional[List[str]] = Field(
        None,
        description="IDs específicos de eleitores-alvo"
    )
    filtros: Optional[FiltrosEleitor] = Field(
        None,
        description="Filtros para selecionar eleitores"
    )
    gatilhos: Optional[List[str]] = Field(
        None,
        description="Gatilhos específicos (medo, esperanca, economico, tribal, identitario)"
    )
    restricoes: Optional[List[str]] = Field(
        None,
        description="Restrições para geração (ex: 'não usar medo', 'tom esperançoso')"
    )
    num_variacoes: int = Field(
        5,
        ge=1,
        le=5,
        description="Número de variações a gerar"
    )


@router.post("/gerar")
async def gerar_mensagens(request: GerarMensagensRequest) -> Dict[str, Any]:
    """
    Gera mensagens de persuasão otimizadas para um público-alvo.

    Utiliza Claude AI para criar variações de mensagens baseadas em
    diferentes gatilhos psicológicos (medo, esperança, economia, etc).

    Retorna:
    - Lista de mensagens com texto curto e longo
    - Estimativas de eficácia e risco de backfire
    - Recomendações estratégicas
    - Perfil agregado do público-alvo
    """
    servico = obter_mensagem_servico()

    # Converter filtros para dict
    filtros_dict = None
    if request.filtros:
        filtros_dict = {
            k: v for k, v in request.filtros.model_dump().items()
            if v is not None
        }

    resultado = servico.gerar_mensagens(
        objetivo=request.objetivo,
        eleitor_ids=request.eleitor_ids,
        filtros=filtros_dict,
        gatilhos=request.gatilhos,
        restricoes=request.restricoes,
        num_variacoes=request.num_variacoes
    )

    if "erro" in resultado and not resultado.get("mensagens"):
        raise HTTPException(status_code=400, detail=resultado["erro"])

    return resultado


@router.get("/gatilhos")
async def listar_gatilhos() -> Dict[str, Any]:
    """
    Lista os tipos de gatilhos disponíveis para geração de mensagens.
    """
    servico = obter_mensagem_servico()
    return servico.obter_gatilhos_disponiveis()


@router.get("/historico")
async def listar_historico(
    limite: int = 20,
    objetivo_contem: Optional[str] = None
) -> Dict[str, Any]:
    """
    Lista histórico de mensagens geradas anteriormente.
    """
    servico = obter_mensagem_servico()
    historico = servico.listar_historico(
        limite=limite,
        objetivo_contem=objetivo_contem
    )

    return {
        "historico": historico,
        "total": len(historico)
    }
```

#### 3. Registrar rota em `backend/app/main.py`

**ADICIONAR** (não substituir):

```python
# No início, após outros imports:
from app.api.rotas.mensagens import router as mensagens_router

# Na seção de inclusão de routers:
app.include_router(mensagens_router, prefix="/api/v1")
```

---

### Frontend

#### 4. `frontend/src/app/(dashboard)/mensagens/page.tsx`

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
import { Checkbox } from "@/components/ui/checkbox";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageSquare,
  Sparkles,
  Target,
  AlertTriangle,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  Filter,
  History,
  Zap,
  Heart,
  DollarSign,
  Users,
  Shield
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

// Tipos
interface MensagemGerada {
  gatilho: string;
  texto_curto: string;
  texto_longo: string;
  headline: string;
  palavras_gatilho: string[];
  tom: string;
  canal_ideal: string;
  perfil_mais_receptivo: string;
  risco_backfire_estimado: number;
  eficacia_estimada: number;
  justificativa: string;
}

interface ResultadoGeracao {
  mensagens: MensagemGerada[];
  recomendacao_geral?: string;
  alerta_riscos?: string[];
  sequencia_sugerida?: string;
  metadados: {
    objetivo: string;
    total_eleitores_analisados: number;
    gatilhos_utilizados: string[];
    tempo_geracao_segundos: number;
    custo_estimado_usd: number;
    gerado_em: string;
  };
  perfil_agregado: {
    total: number;
    medos: Array<{ item: string; frequencia: number; percentual: number }>;
    valores: Array<{ item: string; frequencia: number; percentual: number }>;
    idade_media: number;
    susceptibilidade_media: number;
  };
}

// Ícones para gatilhos
const ICONES_GATILHO: Record<string, any> = {
  medo: Shield,
  esperanca: Heart,
  economico: DollarSign,
  tribal: Users,
  identitario: Zap
};

const CORES_GATILHO: Record<string, string> = {
  medo: "bg-red-100 text-red-800 border-red-200",
  esperanca: "bg-green-100 text-green-800 border-green-200",
  economico: "bg-blue-100 text-blue-800 border-blue-200",
  tribal: "bg-purple-100 text-purple-800 border-purple-200",
  identitario: "bg-amber-100 text-amber-800 border-amber-200"
};

export default function MensagensPage() {
  // Estados do formulário
  const [objetivo, setObjetivo] = useState("");
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [novaRestricao, setNovaRestricao] = useState("");
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([
    "medo", "esperanca", "economico", "tribal", "identitario"
  ]);
  const [filtroRegiao, setFiltroRegiao] = useState<string>("todas");
  const [filtroCluster, setFiltroCluster] = useState<string>("todos");

  // Estados de resultado
  const [resultado, setResultado] = useState<ResultadoGeracao | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Gatilhos disponíveis
  const gatilhosDisponiveis = [
    { id: "medo", nome: "Medo/Ameaça", descricao: "Ativa ansiedades" },
    { id: "esperanca", nome: "Esperança", descricao: "Ativa aspirações" },
    { id: "economico", nome: "Econômico", descricao: "Foca no bolso" },
    { id: "tribal", nome: "Tribal", descricao: "Pertencimento" },
    { id: "identitario", nome: "Identitário", descricao: "Valores/religião" }
  ];

  // Handlers
  const handleGerarMensagens = async () => {
    if (!objetivo.trim()) {
      toast.error("Digite o objetivo da mensagem");
      return;
    }

    if (gatilhosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um gatilho");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/mensagens/gerar", {
        objetivo: objetivo,
        gatilhos: gatilhosSelecionados,
        restricoes: restricoes.length > 0 ? restricoes : undefined,
        num_variacoes: gatilhosSelecionados.length,
        filtros: (filtroRegiao !== "todas" || filtroCluster !== "todos") ? {
          regiao_administrativa: filtroRegiao !== "todas" ? [filtroRegiao] : undefined,
          cluster_socioeconomico: filtroCluster !== "todos" ? [filtroCluster] : undefined
        } : undefined
      });

      setResultado(response.data);
      toast.success(`${response.data.mensagens?.length || 0} mensagens geradas!`);
    } catch (error: any) {
      console.error("Erro ao gerar mensagens:", error);
      toast.error(error.response?.data?.detail || "Erro ao gerar mensagens");
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = async (texto: string, index: number) => {
    await navigator.clipboard.writeText(texto);
    setCopiedIndex(index);
    toast.success("Copiado!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddRestricao = () => {
    if (novaRestricao.trim() && !restricoes.includes(novaRestricao.trim())) {
      setRestricoes([...restricoes, novaRestricao.trim()]);
      setNovaRestricao("");
    }
  };

  const handleRemoveRestricao = (r: string) => {
    setRestricoes(restricoes.filter(x => x !== r));
  };

  const toggleGatilho = (id: string) => {
    if (gatilhosSelecionados.includes(id)) {
      setGatilhosSelecionados(gatilhosSelecionados.filter(g => g !== id));
    } else {
      setGatilhosSelecionados([...gatilhosSelecionados, id]);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          Gerador de Mensagens
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie mensagens de persuasão otimizadas com IA para diferentes perfis de eleitores
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo da Mensagem *</Label>
                <Textarea
                  id="objetivo"
                  placeholder="Ex: Convencer eleitores indecisos a votar no candidato X destacando sua experiência em gestão"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Gatilhos */}
              <div className="space-y-2">
                <Label>Gatilhos Psicológicos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {gatilhosDisponiveis.map((g) => {
                    const Icon = ICONES_GATILHO[g.id] || Zap;
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          gatilhosSelecionados.includes(g.id)
                            ? CORES_GATILHO[g.id]
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => toggleGatilho(g.id)}
                      >
                        <Checkbox
                          checked={gatilhosSelecionados.includes(g.id)}
                          onCheckedChange={() => toggleGatilho(g.id)}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{g.nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Filtros */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar Público-Alvo
                </Label>

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
                    <SelectItem value="Águas Claras">Águas Claras</SelectItem>
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

              <Separator />

              {/* Restrições */}
              <div className="space-y-2">
                <Label>Restrições (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: não usar tom agressivo"
                    value={novaRestricao}
                    onChange={(e) => setNovaRestricao(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddRestricao()}
                  />
                  <Button variant="outline" size="sm" onClick={handleAddRestricao}>
                    +
                  </Button>
                </div>
                {restricoes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {restricoes.map((r, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveRestricao(r)}
                      >
                        {r} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Gerar */}
              <Button
                className="w-full"
                onClick={handleGerarMensagens}
                disabled={loading || !objetivo.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Mensagens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card de Metadados */}
          {resultado?.metadados && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estatísticas da Geração</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eleitores analisados:</span>
                  <span className="font-medium">{resultado.metadados.total_eleitores_analisados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo de geração:</span>
                  <span className="font-medium">{resultado.metadados.tempo_geracao_segundos}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo estimado:</span>
                  <span className="font-medium">${resultado.metadados.custo_estimado_usd}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {!resultado && !loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure os parâmetros e clique em "Gerar Mensagens"</p>
                <p className="text-sm mt-2">
                  As mensagens serão otimizadas para o perfil dos eleitores selecionados
                </p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
                <p className="font-medium">Gerando mensagens otimizadas...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Claude está analisando o perfil dos eleitores
                </p>
              </div>
            </Card>
          )}

          {resultado && !loading && (
            <Tabs defaultValue="mensagens" className="space-y-4">
              <TabsList>
                <TabsTrigger value="mensagens">
                  Mensagens ({resultado.mensagens?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                <TabsTrigger value="perfil">Perfil do Público</TabsTrigger>
              </TabsList>

              {/* Tab: Mensagens */}
              <TabsContent value="mensagens" className="space-y-4">
                {resultado.mensagens?.map((msg, index) => {
                  const Icon = ICONES_GATILHO[msg.gatilho] || Zap;
                  return (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={CORES_GATILHO[msg.gatilho]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {msg.gatilho.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{msg.tom}</Badge>
                            <Badge variant="outline">{msg.canal_ideal}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Eficácia: </span>
                              <span className={`font-bold ${
                                msg.eficacia_estimada >= 0.7 ? "text-green-600" :
                                msg.eficacia_estimada >= 0.5 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {Math.round(msg.eficacia_estimada * 100)}%
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Risco: </span>
                              <span className={`font-bold ${
                                msg.risco_backfire_estimado <= 0.2 ? "text-green-600" :
                                msg.risco_backfire_estimado <= 0.4 ? "text-amber-600" : "text-red-600"
                              }`}>
                                {Math.round(msg.risco_backfire_estimado * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{msg.headline}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Texto Curto */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Texto Curto (280 chars)</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopiar(msg.texto_curto, index)}
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-muted rounded-lg text-sm">
                            {msg.texto_curto}
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {msg.texto_curto.length}/280 caracteres
                          </div>
                        </div>

                        {/* Texto Longo */}
                        <Accordion type="single" collapsible>
                          <AccordionItem value="texto-longo">
                            <AccordionTrigger className="text-sm">
                              Ver texto expandido
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-line">
                                {msg.texto_longo}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleCopiar(msg.texto_longo, index + 100)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar texto longo
                              </Button>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Palavras-gatilho */}
                        <div>
                          <Label className="text-sm font-medium">Palavras-gatilho</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.palavras_gatilho?.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Perfil receptivo */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium text-blue-800">
                            <Target className="h-4 w-4 inline mr-1" />
                            Perfil mais receptivo
                          </Label>
                          <p className="text-sm text-blue-700 mt-1">
                            {msg.perfil_mais_receptivo}
                          </p>
                        </div>

                        {/* Justificativa */}
                        <Accordion type="single" collapsible>
                          <AccordionItem value="justificativa">
                            <AccordionTrigger className="text-sm">
                              Por que funciona?
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm text-muted-foreground">
                                {msg.justificativa}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Tab: Estratégia */}
              <TabsContent value="estrategia" className="space-y-4">
                {resultado.recomendacao_geral && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Recomendação Estratégica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{resultado.recomendacao_geral}</p>
                    </CardContent>
                  </Card>
                )}

                {resultado.sequencia_sugerida && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sequência Sugerida</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{resultado.sequencia_sugerida}</p>
                    </CardContent>
                  </Card>
                )}

                {resultado.alerta_riscos && resultado.alerta_riscos.length > 0 && (
                  <Card className="border-amber-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas de Risco
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resultado.alerta_riscos.map((alerta, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {alerta}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab: Perfil */}
              <TabsContent value="perfil" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Medos Mais Comuns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {resultado.perfil_agregado?.medos?.map((m, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <span className="text-sm">{m.item}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={m.percentual} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground w-10">
                              {m.percentual}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Valores Mais Frequentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {resultado.perfil_agregado?.valores?.map((v, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <span className="text-sm">{v.item}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={v.percentual} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground w-10">
                              {v.percentual}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Estatísticas do Público</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">
                          {resultado.perfil_agregado?.total || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Eleitores</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {resultado.perfil_agregado?.idade_media || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Idade Média</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {resultado.perfil_agregado?.susceptibilidade_media || 0}/10
                        </div>
                        <div className="text-xs text-muted-foreground">Susceptibilidade</div>
                      </div>
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

**ADICIONAR** ao grupo "Inteligência" no `Sidebar.tsx`:

```tsx
{
  title: "Mensagens",
  href: "/mensagens",
  icon: MessageSquare,
  description: "Gerador de mensagens"
}
```

---

### Testes

#### 6. `backend/tests/test_mensagens.py`

```python
"""
Testes para o serviço de Mensagens
"""

import pytest
from unittest.mock import patch, MagicMock
from app.servicos.mensagem_servico import MensagemServico, obter_mensagem_servico


class TestMensagemServico:
    """Testes do serviço de mensagens"""

    def test_instancia_singleton(self):
        """Verifica que o serviço é singleton"""
        servico1 = obter_mensagem_servico()
        servico2 = obter_mensagem_servico()
        assert servico1 is servico2

    def test_agregar_perfis_vazio(self):
        """Testa agregação com lista vazia"""
        servico = MensagemServico()
        resultado = servico._agregar_perfis([])
        assert resultado == {}

    def test_agregar_perfis_completo(self):
        """Testa agregação com eleitores"""
        servico = MensagemServico()
        eleitores = [
            {
                "id": "1",
                "idade": 30,
                "medos": ["Desemprego", "Violência"],
                "valores": ["Família"],
                "preocupacoes": ["Saúde"],
                "vieses_cognitivos": ["confirmacao"],
                "fontes_informacao": ["TV"],
                "religiao": "catolica",
                "estilo_decisao": "economico",
                "orientacao_politica": "centro",
                "cluster_socioeconomico": "G2_media_alta",
                "regiao_administrativa": "Taguatinga",
                "susceptibilidade_desinformacao": 5
            },
            {
                "id": "2",
                "idade": 40,
                "medos": ["Desemprego"],
                "valores": ["Segurança", "Família"],
                "preocupacoes": ["Economia"],
                "vieses_cognitivos": ["confirmacao", "aversao_perda"],
                "fontes_informacao": ["WhatsApp"],
                "religiao": "evangelica",
                "estilo_decisao": "emocional",
                "orientacao_politica": "direita",
                "cluster_socioeconomico": "G3_media_baixa",
                "regiao_administrativa": "Ceilândia",
                "susceptibilidade_desinformacao": 7
            }
        ]

        resultado = servico._agregar_perfis(eleitores)

        assert resultado["total"] == 2
        assert resultado["idade_media"] == 35
        assert resultado["susceptibilidade_media"] == 6
        assert len(resultado["medos"]) > 0
        assert resultado["medos"][0]["item"] == "Desemprego"  # Mais frequente

    def test_gatilhos_disponiveis(self):
        """Testa listagem de gatilhos"""
        servico = MensagemServico()
        gatilhos = servico.obter_gatilhos_disponiveis()

        assert "gatilhos" in gatilhos
        assert "medo" in gatilhos["gatilhos"]
        assert "esperanca" in gatilhos["gatilhos"]
        assert "economico" in gatilhos["gatilhos"]

    def test_parse_resposta_json_valido(self):
        """Testa parse de JSON válido"""
        servico = MensagemServico()
        json_valido = '{"mensagens": [{"gatilho": "medo"}]}'
        resultado = servico._parse_resposta_claude(json_valido)
        assert "mensagens" in resultado

    def test_parse_resposta_json_em_bloco(self):
        """Testa parse de JSON em bloco de código"""
        servico = MensagemServico()
        resposta = '```json\n{"mensagens": []}\n```'
        resultado = servico._parse_resposta_claude(resposta)
        assert "mensagens" in resultado

    def test_parse_resposta_invalida(self):
        """Testa parse de resposta inválida"""
        servico = MensagemServico()
        resultado = servico._parse_resposta_claude("texto sem json")
        assert "erro" in resultado


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 2

Antes de prosseguir para Fase 3, verificar:

- [ ] `backend/app/servicos/mensagem_servico.py` criado
- [ ] `backend/app/api/rotas/mensagens.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/mensagens/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] Testes passando: `pytest backend/tests/test_mensagens.py -v`
- [ ] Servidor backend rodando sem erros
- [ ] Servidor frontend rodando sem erros
- [ ] Página `/mensagens` acessível e funcional
- [ ] API `POST /api/v1/mensagens/gerar` retornando dados
- [ ] Mensagens sendo geradas corretamente pelo Claude

---

## NOTAS DE INTEGRAÇÃO COM FASE 1

Se a Fase 1 (Swing Voters) estiver implementada, você pode:

1. Na página de Swing Voters, adicionar botão "Gerar Mensagens para Selecionados"
2. Passar os IDs dos swing voters selecionados para o endpoint de mensagens
3. Isso cria um fluxo integrado: Identificar → Gerar Mensagens → Simular

---

## PRÓXIMA FASE

Continue para `PLANO_FASE_3_SIMULADOR_AB.md` após completar este checklist.
