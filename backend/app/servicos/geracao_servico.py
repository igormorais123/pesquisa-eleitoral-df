"""
Serviço de Geração de Eleitores Sintéticos via IA

Este módulo utiliza Claude AI para gerar perfis de eleitores
realistas do Distrito Federal.

Autor: Professor Igor
Fase 2 - Geração de Eleitores
"""

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from anthropic import Anthropic

from app.core.config import configuracoes


class GeracaoServico:
    """Serviço para geração de eleitores sintéticos via IA"""

    MODELO_GERACAO = "claude-sonnet-4-5-20250514"
    MAX_TOKENS = 8000
    TEMPERATURE = 0.9  # Mais variação para perfis diversos

    # Dados de referência do DF
    REGIOES_DF = [
        "Ceilândia", "Taguatinga", "Samambaia", "Plano Piloto", "Águas Claras",
        "Gama", "Santa Maria", "Recanto das Emas", "Sobradinho", "Planaltina",
        "Guará", "Vicente Pires", "Brazlândia", "São Sebastião", "Riacho Fundo",
        "Paranoá", "Núcleo Bandeirante", "Candangolândia", "Lago Sul", "Lago Norte",
        "Sudoeste/Octogonal", "Cruzeiro", "Park Way", "SIA", "SCIA (Estrutural)",
        "Fercal", "Varjão", "Itapoã", "Jardim Botânico", "Sol Nascente/Pôr do Sol"
    ]

    CLUSTERS = {
        "G1_alta": {
            "regioes": ["Lago Sul", "Lago Norte", "Park Way", "Sudoeste/Octogonal"],
            "renda": ["mais de 20 SM", "10 a 20 SM"],
            "escolaridade": ["superior completo", "pós-graduação"],
            "profissoes": ["empresário", "médico", "advogado", "engenheiro", "gestor público"]
        },
        "G2_media_alta": {
            "regioes": ["Plano Piloto", "Águas Claras", "Guará", "Cruzeiro"],
            "renda": ["5 a 10 SM", "10 a 20 SM"],
            "escolaridade": ["superior completo", "superior incompleto"],
            "profissoes": ["analista", "professor", "técnico", "servidor público"]
        },
        "G3_media_baixa": {
            "regioes": ["Taguatinga", "Vicente Pires", "Sobradinho", "Gama"],
            "renda": ["2 a 5 SM", "5 a 10 SM"],
            "escolaridade": ["médio completo", "superior incompleto"],
            "profissoes": ["comerciante", "motorista", "vendedor", "autônomo"]
        },
        "G4_baixa": {
            "regioes": ["Ceilândia", "Samambaia", "Santa Maria", "Recanto das Emas", "Sol Nascente/Pôr do Sol"],
            "renda": ["até 1 SM", "1 a 2 SM", "2 a 5 SM"],
            "escolaridade": ["fundamental incompleto", "fundamental completo", "médio incompleto"],
            "profissoes": ["auxiliar de serviços gerais", "doméstica", "pedreiro", "vendedor ambulante"]
        }
    }

    ORIENTACOES_POLITICAS = ["esquerda", "centro-esquerda", "centro", "centro-direita", "direita"]
    RELIGIOES = ["católica", "evangélica", "espírita", "sem religião", "umbanda/candomblé", "outras"]
    ESTILOS_DECISAO = ["emocional", "racional", "econômico", "social", "ideológico"]

    def __init__(self):
        self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_eleitores = base_path / "agentes" / "banco-eleitores-df.json"
        self._eleitores: List[Dict] = []
        self._carregar_eleitores()

    def _carregar_eleitores(self):
        """Carrega banco de eleitores existente"""
        if self.caminho_eleitores.exists():
            try:
                with open(self.caminho_eleitores, "r", encoding="utf-8") as f:
                    self._eleitores = json.load(f)
            except (json.JSONDecodeError, OSError) as e:
                print(f"Aviso: Não foi possível carregar eleitores: {e}")
                self._eleitores = []

    def _salvar_eleitores(self):
        """Salva eleitores no arquivo JSON"""
        self.caminho_eleitores.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_eleitores, "w", encoding="utf-8") as f:
            json.dump(self._eleitores, f, ensure_ascii=False, indent=2)

    def _construir_prompt(
        self,
        quantidade: int,
        cluster: Optional[str] = None,
        regiao: Optional[str] = None,
        orientacao_politica: Optional[str] = None,
        faixa_etaria: Optional[str] = None,
        genero: Optional[str] = None,
        caracteristicas_extras: Optional[str] = None
    ) -> str:
        """Constrói o prompt para geração de eleitores"""

        # Determinar restrições baseadas nos parâmetros
        restricoes = []
        if cluster and cluster in self.CLUSTERS:
            info_cluster = self.CLUSTERS[cluster]
            restricoes.append(f"- Cluster socioeconômico: {cluster}")
            restricoes.append(f"- Regiões típicas: {', '.join(info_cluster['regioes'])}")
            restricoes.append(f"- Faixas de renda: {', '.join(info_cluster['renda'])}")
            restricoes.append(f"- Escolaridade típica: {', '.join(info_cluster['escolaridade'])}")

        if regiao:
            restricoes.append(f"- Região administrativa específica: {regiao}")

        if orientacao_politica:
            restricoes.append(f"- Orientação política: {orientacao_politica}")

        if faixa_etaria:
            restricoes.append(f"- Faixa etária: {faixa_etaria}")

        if genero:
            restricoes.append(f"- Gênero: {genero}")

        if caracteristicas_extras:
            restricoes.append(f"- Características adicionais: {caracteristicas_extras}")

        restricoes_texto = "\n".join(restricoes) if restricoes else "- Nenhuma restrição específica (gerar perfis diversos)"

        prompt = f"""Você é um especialista em criação de perfis demográficos e psicográficos para pesquisa eleitoral no Distrito Federal.

## TAREFA
Gere {quantidade} perfil(s) de eleitor(es) sintético(s) do Distrito Federal, Brasil, para uso em simulações de pesquisa eleitoral.

## RESTRIÇÕES/PARÂMETROS
{restricoes_texto}

## DADOS DE REFERÊNCIA DO DF
- Regiões Administrativas: {', '.join(self.REGIOES_DF)}
- Clusters: G1_alta (Lago Sul/Norte), G2_media_alta (Plano Piloto), G3_media_baixa (Taguatinga), G4_baixa (Ceilândia/Samambaia)
- Orientações políticas: {', '.join(self.ORIENTACOES_POLITICAS)}
- Religiões: {', '.join(self.RELIGIOES)}
- Estilos de decisão: {', '.join(self.ESTILOS_DECISAO)}

## FORMATO DE SAÍDA
Retorne APENAS um JSON válido com a seguinte estrutura (sem texto adicional):

{{
  "eleitores": [
    {{
      "nome": "Nome completo fictício brasileiro",
      "idade": 35,
      "genero": "masculino ou feminino",
      "cor_raca": "branca, parda, preta, amarela ou indígena",
      "regiao_administrativa": "Nome da RA do DF",
      "local_referencia": "Bairro ou setor específico da RA",
      "cluster_socioeconomico": "G1_alta, G2_media_alta, G3_media_baixa ou G4_baixa",
      "escolaridade": "nível de escolaridade",
      "profissao": "profissão principal",
      "ocupacao_vinculo": "CLT, servidor público, autônomo, informal, etc",
      "renda_salarios_minimos": "até 1 SM, 1 a 2 SM, 2 a 5 SM, 5 a 10 SM, 10 a 20 SM, mais de 20 SM",
      "religiao": "católica, evangélica, espírita, sem religião, etc",
      "estado_civil": "solteiro, casado, divorciado, viúvo, união estável",
      "filhos": 2,
      "orientacao_politica": "esquerda, centro-esquerda, centro, centro-direita, direita",
      "posicao_bolsonaro": "opositor_forte, opositor_moderado, critico_forte, critico_moderado, neutro, apoiador_moderado, apoiador_forte",
      "interesse_politico": "baixo, medio, alto",
      "tolerancia_nuance": "baixa, media, alta",
      "estilo_decisao": "emocional, racional, economico, social, ideologico",
      "valores": ["lista", "de", "valores", "pessoais"],
      "preocupacoes": ["lista", "de", "preocupações", "principais"],
      "vieses_cognitivos": ["lista", "de", "vieses", "cognitivos"],
      "medos": ["lista", "de", "medos", "principais"],
      "fontes_informacao": ["WhatsApp", "TV aberta", "redes sociais", "etc"],
      "susceptibilidade_desinformacao": 5,
      "meio_transporte": "carro, ônibus, metrô, etc",
      "tempo_deslocamento_trabalho": "até 30 min, 30-60 min, etc",
      "voto_facultativo": false,
      "conflito_identitario": false,
      "historia_resumida": "Breve história de vida (2-3 frases) que explique a formação política e valores do eleitor",
      "instrucao_comportamental": "Instrução de como este eleitor deve se comportar em entrevistas (tom, verbosidade, resistências)"
    }}
  ]
}}

## INSTRUÇÕES IMPORTANTES
1. Cada perfil deve ser ÚNICO e coerente internamente
2. A história_resumida deve explicar de forma crível como a pessoa chegou às suas posições políticas
3. Os valores, preocupações e medos devem ser coerentes com o perfil socioeconômico
4. Use nomes brasileiros realistas (diversos etnicamente)
5. A instrucao_comportamental deve guiar como a IA deve responder como este eleitor
6. Susceptibilidade a desinformação de 1 (muito crítico) a 10 (muito suscetível)
7. Os vieses cognitivos devem incluir: viés de confirmação, ancoragem, disponibilidade, efeito manada, etc
8. Considere a realidade do Distrito Federal (funcionalismo público, desigualdade regional)
9. Retorne APENAS o JSON, sem markdown, sem explicações"""

        return prompt

    def _parse_resposta(self, resposta: str) -> Dict[str, Any]:
        """Faz parse da resposta do Claude"""
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

        return {"eleitores": [], "erro": "Não foi possível parsear a resposta"}

    def gerar_eleitores(
        self,
        quantidade: int = 5,
        cluster: Optional[str] = None,
        regiao: Optional[str] = None,
        orientacao_politica: Optional[str] = None,
        faixa_etaria: Optional[str] = None,
        genero: Optional[str] = None,
        caracteristicas_extras: Optional[str] = None,
        salvar_no_banco: bool = True
    ) -> Dict[str, Any]:
        """
        Gera eleitores sintéticos usando Claude AI.

        Args:
            quantidade: Número de eleitores a gerar (1-20)
            cluster: Cluster socioeconômico (G1_alta, G2_media_alta, etc)
            regiao: Região administrativa específica
            orientacao_politica: Filtrar por orientação
            faixa_etaria: Ex: "18-25", "26-35", "36-50", "51-65", "65+"
            genero: "masculino" ou "feminino"
            caracteristicas_extras: Texto livre com características adicionais
            salvar_no_banco: Se True, adiciona ao banco de eleitores

        Returns:
            Dict com eleitores gerados e metadados
        """
        # Validar quantidade
        quantidade = min(max(quantidade, 1), 20)

        # Construir prompt
        prompt = self._construir_prompt(
            quantidade=quantidade,
            cluster=cluster,
            regiao=regiao,
            orientacao_politica=orientacao_politica,
            faixa_etaria=faixa_etaria,
            genero=genero,
            caracteristicas_extras=caracteristicas_extras
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
                "eleitores": [],
                "metadados": {
                    "quantidade_solicitada": quantidade,
                    "quantidade_gerada": 0,
                    "erro": True
                }
            }

        tempo_geracao = (datetime.now() - inicio).total_seconds()

        # Parse da resposta
        resultado = self._parse_resposta(resposta_texto)
        eleitores_gerados = resultado.get("eleitores", [])

        # Adicionar IDs únicos
        for eleitor in eleitores_gerados:
            eleitor["id"] = f"eleitor_{uuid4().hex[:12]}"

        # Salvar no banco se solicitado
        ids_adicionados = []
        if salvar_no_banco and eleitores_gerados:
            for eleitor in eleitores_gerados:
                self._eleitores.append(eleitor)
                ids_adicionados.append(eleitor["id"])
            self._salvar_eleitores()

        # Calcular custo
        custo_entrada = (tokens_entrada / 1_000_000) * 3.0
        custo_saida = (tokens_saida / 1_000_000) * 15.0
        custo_total = custo_entrada + custo_saida

        return {
            "eleitores": eleitores_gerados,
            "metadados": {
                "quantidade_solicitada": quantidade,
                "quantidade_gerada": len(eleitores_gerados),
                "ids_adicionados": ids_adicionados,
                "salvo_no_banco": salvar_no_banco,
                "total_eleitores_no_banco": len(self._eleitores),
                "filtros_aplicados": {
                    "cluster": cluster,
                    "regiao": regiao,
                    "orientacao_politica": orientacao_politica,
                    "faixa_etaria": faixa_etaria,
                    "genero": genero
                },
                "modelo_utilizado": self.MODELO_GERACAO,
                "tokens_entrada": tokens_entrada,
                "tokens_saida": tokens_saida,
                "tempo_geracao_segundos": round(tempo_geracao, 2),
                "custo_estimado_usd": round(custo_total, 4),
                "gerado_em": datetime.now().isoformat()
            }
        }

    def obter_opcoes_geracao(self) -> Dict[str, Any]:
        """Retorna opções disponíveis para geração"""
        return {
            "clusters": list(self.CLUSTERS.keys()),
            "regioes": self.REGIOES_DF,
            "orientacoes_politicas": self.ORIENTACOES_POLITICAS,
            "religioes": self.RELIGIOES,
            "estilos_decisao": self.ESTILOS_DECISAO,
            "faixas_etarias": ["18-25", "26-35", "36-50", "51-65", "65+"],
            "generos": ["masculino", "feminino"],
            "max_quantidade_por_vez": 20,
            "total_eleitores_atual": len(self._eleitores)
        }

    def obter_estatisticas_banco(self) -> Dict[str, Any]:
        """Retorna estatísticas do banco de eleitores atual"""
        if not self._eleitores:
            return {"total": 0, "erro": "Banco de eleitores vazio"}

        from collections import Counter

        stats = {
            "total": len(self._eleitores),
            "por_cluster": dict(Counter(e.get("cluster_socioeconomico") for e in self._eleitores)),
            "por_regiao": dict(Counter(e.get("regiao_administrativa") for e in self._eleitores)),
            "por_orientacao": dict(Counter(e.get("orientacao_politica") for e in self._eleitores)),
            "por_genero": dict(Counter(e.get("genero") for e in self._eleitores)),
            "por_religiao": dict(Counter(e.get("religiao") for e in self._eleitores)),
            "idade_media": sum(e.get("idade", 0) for e in self._eleitores) / len(self._eleitores)
        }

        return stats


# Instância singleton
_geracao_servico: Optional[GeracaoServico] = None


def obter_geracao_servico() -> GeracaoServico:
    """Obtém instância singleton do serviço"""
    global _geracao_servico
    if _geracao_servico is None:
        _geracao_servico = GeracaoServico()
    return _geracao_servico
