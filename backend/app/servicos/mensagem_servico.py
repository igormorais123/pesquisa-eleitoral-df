"""
Serviço de Geração de Mensagens Otimizadas

Este módulo utiliza Claude AI para gerar mensagens de persuasão
otimizadas para clusters específicos de eleitores.

Autor: Professor Igor
Fase 2 - Gerador de Mensagens
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from collections import Counter

from anthropic import Anthropic

from app.core.config import configuracoes


class MensagemServico:
    """Serviço para geração de mensagens otimizadas de campanha"""

    # Configuração de modelos
    MODELO_GERACAO = "claude-sonnet-4-5-20250514"
    MAX_TOKENS = 4000
    TEMPERATURE = 0.8  # Mais criativo para mensagens

    # Tipos de gatilhos disponíveis
    GATILHOS = {
        "medo": {
            "nome": "Medo/Ameaça",
            "descricao": "Ativa ansiedades e medos identificados no público-alvo",
            "risco_backfire": 0.4,
            "eficacia_base": 0.7,
            "icone": "shield",
            "cor": "red"
        },
        "esperanca": {
            "nome": "Esperança/Aspiração",
            "descricao": "Ativa aspirações, sonhos e valores positivos",
            "risco_backfire": 0.1,
            "eficacia_base": 0.6,
            "icone": "heart",
            "cor": "green"
        },
        "economico": {
            "nome": "Econômico/Bolso",
            "descricao": "Foca em impacto financeiro, emprego e qualidade de vida material",
            "risco_backfire": 0.15,
            "eficacia_base": 0.75,
            "icone": "dollar-sign",
            "cor": "blue"
        },
        "tribal": {
            "nome": "Tribal/Pertencimento",
            "descricao": "Cria senso de grupo, identidade coletiva e pertencimento",
            "risco_backfire": 0.5,
            "eficacia_base": 0.65,
            "icone": "users",
            "cor": "purple"
        },
        "identitario": {
            "nome": "Identitário/Valores",
            "descricao": "Ressoa com religião, tradição e valores profundos",
            "risco_backfire": 0.35,
            "eficacia_base": 0.7,
            "icone": "zap",
            "cor": "amber"
        }
    }

    def __init__(self):
        self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_historico = base_path / "memorias" / "mensagens_geradas.json"
        self.caminho_eleitores = base_path / "agentes" / "banco-eleitores-df.json"
        self._historico: List[Dict] = []
        self._eleitores: List[Dict] = []
        self._carregar_historico()
        self._carregar_eleitores()

    def _carregar_historico(self):
        """Carrega histórico de mensagens geradas"""
        if self.caminho_historico.exists():
            try:
                with open(self.caminho_historico, "r", encoding="utf-8") as f:
                    self._historico = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                print(f"Aviso: Não foi possível carregar histórico: {e}")
                self._historico = []

    def _salvar_historico(self):
        """Salva histórico de mensagens"""
        self.caminho_historico.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_historico, "w", encoding="utf-8") as f:
            json.dump(self._historico, f, ensure_ascii=False, indent=2, default=str)

    def _carregar_eleitores(self):
        """Carrega banco de eleitores do JSON"""
        if self.caminho_eleitores.exists():
            try:
                with open(self.caminho_eleitores, "r", encoding="utf-8") as f:
                    self._eleitores = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                print(f"Aviso: Não foi possível carregar eleitores: {e}")
                self._eleitores = []

    def _filtrar_eleitores(
        self,
        eleitor_ids: Optional[List[str]] = None,
        filtros: Optional[Dict[str, Any]] = None
    ) -> List[Dict]:
        """
        Filtra eleitores por IDs ou critérios.
        """
        eleitores = self._eleitores.copy()

        # Filtrar por IDs específicos
        if eleitor_ids:
            eleitores = [e for e in eleitores if e.get("id") in eleitor_ids]

        # Aplicar filtros
        if filtros:
            for campo, valor in filtros.items():
                if valor is None:
                    continue
                if isinstance(valor, list) and len(valor) > 0:
                    eleitores = [e for e in eleitores if e.get(campo) in valor]
                elif not isinstance(valor, list):
                    eleitores = [e for e in eleitores if e.get(campo) == valor]

        return eleitores

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
            "fontes_informacao": Counter(),
            "generos": Counter(),
            "escolaridades": Counter()
        }

        total_idade = 0
        total_suscept = 0
        count_idade = 0
        count_suscept = 0

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
            if e.get("religiao"):
                agregado["religioes"][e.get("religiao")] += 1
            if e.get("estilo_decisao"):
                agregado["estilos_decisao"][e.get("estilo_decisao")] += 1
            if e.get("orientacao_politica"):
                agregado["orientacoes"][e.get("orientacao_politica")] += 1
            if e.get("cluster_socioeconomico"):
                agregado["clusters"][e.get("cluster_socioeconomico")] += 1
            if e.get("regiao_administrativa"):
                agregado["regioes"][e.get("regiao_administrativa")] += 1
            if e.get("genero"):
                agregado["generos"][e.get("genero")] += 1
            if e.get("escolaridade"):
                agregado["escolaridades"][e.get("escolaridade")] += 1

            # Numéricos
            if e.get("idade"):
                total_idade += e.get("idade", 0)
                count_idade += 1
            if e.get("susceptibilidade_desinformacao") is not None:
                total_suscept += e.get("susceptibilidade_desinformacao", 5)
                count_suscept += 1

        if count_idade > 0:
            agregado["idade_media"] = round(total_idade / count_idade, 1)
        if count_suscept > 0:
            agregado["susceptibilidade_media"] = round(total_suscept / count_suscept, 1)

        # Converter Counters para listas ordenadas (top 10)
        for campo in ["medos", "valores", "preocupacoes", "vieses", "fontes_informacao"]:
            agregado[campo] = [
                {"item": item, "frequencia": freq, "percentual": round(freq/len(eleitores)*100, 1)}
                for item, freq in agregado[campo].most_common(10)
            ]

        for campo in ["religioes", "estilos_decisao", "orientacoes", "clusters", "regioes", "generos", "escolaridades"]:
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
        top_regioes = [r["item"] for r in agregado.get("regioes", [])[:5]]
        top_clusters = [c["item"] for c in agregado.get("clusters", [])[:3]]

        gatilhos_desc = "\n".join(
            f"- {g.upper()}: {self.GATILHOS[g]['descricao']}"
            for g in gatilhos_solicitados if g in self.GATILHOS
        )

        restricoes_texto = "\n".join(f"- {r}" for r in restricoes) if restricoes else "- Nenhuma restrição específica"

        prompt = f"""Você é um estrategista de comunicação política especializado em mensagens persuasivas para campanhas eleitorais brasileiras.

## OBJETIVO DA MENSAGEM
{objetivo}

## PERFIL AGREGADO DO PÚBLICO-ALVO ({agregado.get('total', 0)} eleitores analisados)

### Dados Demográficos
- Idade média: {agregado.get('idade_media', 0)} anos
- Susceptibilidade à persuasão: {agregado.get('susceptibilidade_media', 5)}/10
- Regiões principais: {', '.join(top_regioes) if top_regioes else 'Diversas'}
- Clusters socioeconômicos: {', '.join(top_clusters) if top_clusters else 'Diversos'}

### Padrões Psicológicos Identificados

**Medos mais comuns:**
{chr(10).join(f"- {m}" for m in top_medos) if top_medos else "- Não identificados"}

**Valores mais frequentes:**
{chr(10).join(f"- {v}" for v in top_valores) if top_valores else "- Não identificados"}

**Preocupações principais:**
{chr(10).join(f"- {p}" for p in top_preocupacoes) if top_preocupacoes else "- Não identificadas"}

**Vieses cognitivos dominantes:**
{chr(10).join(f"- {v}" for v in top_vieses) if top_vieses else "- Não identificados"}

### Perfil Sociocultural
- Religiões predominantes: {', '.join(top_religioes) if top_religioes else 'Diversas'}
- Estilos de decisão: {', '.join(top_estilos) if top_estilos else 'Diversos'}
- Fontes de informação: {', '.join(top_fontes) if top_fontes else 'Diversas'}

## GATILHOS SOLICITADOS
Gere {num_variacoes} mensagem(ns), uma para cada gatilho:
{gatilhos_desc}

## RESTRIÇÕES
{restricoes_texto}

## FORMATO DE SAÍDA
Retorne APENAS um JSON válido com a seguinte estrutura (sem texto adicional antes ou depois):

{{
  "mensagens": [
    {{
      "gatilho": "nome_do_gatilho",
      "texto_curto": "Mensagem de até 280 caracteres para redes sociais/WhatsApp",
      "texto_longo": "Versão expandida com 2-3 parágrafos para materiais impressos, discursos ou vídeos",
      "headline": "Título impactante de 5-8 palavras",
      "palavras_gatilho": ["lista", "de", "palavras", "chave", "usadas"],
      "tom": "esperançoso|urgente|indignado|acolhedor|combativo",
      "canal_ideal": "WhatsApp|Instagram|Facebook|TV|Rádio|Panfleto|Comício",
      "perfil_mais_receptivo": "Descrição do tipo de eleitor que mais responderia a esta mensagem",
      "risco_backfire_estimado": 0.15,
      "eficacia_estimada": 0.75,
      "justificativa": "Explicação de por que esta mensagem funcionaria para este público específico"
    }}
  ],
  "recomendacao_geral": "Análise estratégica geral sobre como abordar este público, considerando seus medos, valores e vieses",
  "alerta_riscos": ["Lista de riscos a considerar ao usar estas mensagens"],
  "sequencia_sugerida": "Ordem recomendada para usar as mensagens em uma campanha (ex: começar com esperança, depois economia)"
}}

## INSTRUÇÕES IMPORTANTES
1. Cada mensagem deve ser ÚNICA e explorar um gatilho diferente de forma criativa
2. Use linguagem compatível com o perfil socioeconômico do público (simples para G4, elaborada para G1)
3. Adapte o vocabulário às fontes de informação que consomem (WhatsApp = informal, TV = formal)
4. Considere os vieses cognitivos para aumentar eficácia (ex: se têm viés de confirmação, reforce crenças existentes)
5. Seja realista nas estimativas de eficácia (0.0 a 1.0) e risco de backfire
6. O texto_curto DEVE ter no máximo 280 caracteres
7. Use elementos culturais brasileiros e do Distrito Federal quando apropriado
8. Evite clichês políticos genéricos - seja específico para o perfil
9. Retorne APENAS o JSON, sem markdown, sem explicações adicionais"""

        return prompt

    def _parse_resposta_claude(self, resposta: str) -> Dict[str, Any]:
        """
        Faz parse da resposta do Claude, tratando possíveis erros.
        """
        # Limpar a resposta
        resposta = resposta.strip()

        # Tentar parse direto
        try:
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
            "resposta_bruta": resposta[:500]
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
        # Obter eleitores filtrados
        eleitores = self._filtrar_eleitores(eleitor_ids, filtros)

        if not eleitores:
            return {
                "erro": "Nenhum eleitor encontrado com os critérios especificados",
                "mensagens": [],
                "metadados": {
                    "objetivo": objetivo,
                    "total_eleitores_analisados": 0,
                    "erro": True
                }
            }

        # Agregar perfis
        agregado = self._agregar_perfis(eleitores)

        # Definir gatilhos
        if gatilhos is None or len(gatilhos) == 0:
            gatilhos = list(self.GATILHOS.keys())

        # Limitar ao número de variações
        gatilhos = [g for g in gatilhos if g in self.GATILHOS][:num_variacoes]

        if not gatilhos:
            return {
                "erro": "Nenhum gatilho válido selecionado",
                "mensagens": [],
                "metadados": {
                    "objetivo": objetivo,
                    "total_eleitores_analisados": len(eleitores),
                    "erro": True
                }
            }

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
                "mensagens": [],
                "metadados": {
                    "objetivo": objetivo,
                    "total_eleitores_analisados": len(eleitores),
                    "erro": True
                }
            }

        tempo_geracao = (datetime.now() - inicio).total_seconds()

        # Parse da resposta
        resultado = self._parse_resposta_claude(resposta_texto)

        # Calcular custo estimado (preços Claude Sonnet 4 - jan/2025)
        # Input: $3/1M tokens, Output: $15/1M tokens
        custo_entrada = (tokens_entrada / 1_000_000) * 3.0
        custo_saida = (tokens_saida / 1_000_000) * 15.0
        custo_total = custo_entrada + custo_saida

        # Adicionar metadados
        resultado["metadados"] = {
            "objetivo": objetivo,
            "total_eleitores_analisados": len(eleitores),
            "gatilhos_utilizados": gatilhos,
            "restricoes_aplicadas": restricoes or [],
            "filtros_aplicados": filtros or {},
            "modelo_utilizado": self.MODELO_GERACAO,
            "tokens_entrada": tokens_entrada,
            "tokens_saida": tokens_saida,
            "tempo_geracao_segundos": round(tempo_geracao, 2),
            "custo_estimado_usd": round(custo_total, 4),
            "gerado_em": datetime.now().isoformat()
        }

        resultado["perfil_agregado"] = agregado

        # Salvar no histórico
        self._historico.append({
            "id": f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            **resultado
        })
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
            "total": len(self.GATILHOS),
            "descricao": "Tipos de abordagens psicológicas para mensagens de persuasão"
        }

    def obter_estatisticas_eleitores(
        self,
        filtros: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Retorna estatísticas dos eleitores para preview antes de gerar mensagens.
        """
        eleitores = self._filtrar_eleitores(filtros=filtros)

        if not eleitores:
            return {
                "total": 0,
                "erro": "Nenhum eleitor encontrado com os filtros especificados"
            }

        agregado = self._agregar_perfis(eleitores)

        return {
            "total": len(eleitores),
            "perfil_resumido": {
                "idade_media": agregado.get("idade_media", 0),
                "susceptibilidade_media": agregado.get("susceptibilidade_media", 0),
                "top_regioes": agregado.get("regioes", [])[:5],
                "top_clusters": agregado.get("clusters", [])[:3],
                "top_medos": agregado.get("medos", [])[:5],
                "top_valores": agregado.get("valores", [])[:5],
                "top_religioes": agregado.get("religioes", [])[:3]
            }
        }


# Instância singleton
_mensagem_servico: Optional[MensagemServico] = None


def obter_mensagem_servico() -> MensagemServico:
    """Obtém instância singleton do serviço"""
    global _mensagem_servico
    if _mensagem_servico is None:
        _mensagem_servico = MensagemServico()
    return _mensagem_servico
