# POLARIS SDK - Political Scientist
# Claude Opus 4.5 como Cientista Político Sênior

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
import anthropic

from ..prompts.scientist_prompts import (
    SCIENTIST_SYSTEM_PROMPT,
    PROBLEM_DEFINITION_PROMPT,
    METHODOLOGY_DESIGN_PROMPT,
    SAMPLING_STRATEGY_PROMPT,
    QUESTIONNAIRE_BUILDER_PROMPT,
    DATA_ANALYSIS_PROMPT,
    PROJECTIONS_PROMPT,
    RECOMMENDATIONS_PROMPT,
    REPORT_GENERATION_PROMPT,
)
from ..models.research import (
    ProblemDefinition,
    MethodologyDesign,
    Questionnaire,
    ResearchState,
)
from ..models.sample import SamplingStrategy, SelectedSample
from ..models.report import (
    ResearchReport,
    ExecutiveSummary,
    Recommendation,
    ProjectionScenario,
    HTMLReport,
)

logger = logging.getLogger(__name__)


class PoliticalScientist:
    """
    Claude Opus 4.5 atuando como Cientista Político Sênior.

    Responsabilidades:
    - Definir problemática de pesquisa
    - Desenhar metodologia
    - Criar estratégia de amostragem
    - Construir questionário
    - Analisar dados
    - Gerar projeções
    - Criar recomendações
    - Produzir relatório HTML
    """

    MODEL = "claude-opus-4-5-20251101"
    MAX_TOKENS = 16000

    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa o Cientista Político.

        Args:
            api_key: Chave da API Anthropic (ou usa variável de ambiente)
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.total_tokens_used = 0
        self.total_cost = 0.0

        # Preços Opus (por 1M tokens)
        self.price_input = 15.0
        self.price_output = 75.0

    async def _call_claude(
        self,
        prompt: str,
        system: str = SCIENTIST_SYSTEM_PROMPT,
        max_tokens: int = None
    ) -> Dict[str, Any]:
        """
        Faz chamada ao Claude Opus 4.5.

        Args:
            prompt: Prompt do usuário
            system: System prompt
            max_tokens: Máximo de tokens na resposta

        Returns:
            Resposta parseada como JSON
        """
        max_tokens = max_tokens or self.MAX_TOKENS

        try:
            response = self.client.messages.create(
                model=self.MODEL,
                max_tokens=max_tokens,
                system=system,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Contabilizar tokens
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
            self.total_tokens_used += input_tokens + output_tokens

            # Calcular custo
            cost = (input_tokens / 1_000_000 * self.price_input +
                    output_tokens / 1_000_000 * self.price_output)
            self.total_cost += cost

            # Extrair texto da resposta
            text = response.content[0].text

            # Tentar parsear JSON
            try:
                # Encontrar JSON no texto (pode estar entre ```json e ```)
                if "```json" in text:
                    start = text.find("```json") + 7
                    end = text.find("```", start)
                    text = text[start:end].strip()
                elif "```" in text:
                    start = text.find("```") + 3
                    end = text.find("```", start)
                    text = text[start:end].strip()

                return json.loads(text)
            except json.JSONDecodeError:
                # Retornar texto bruto se não for JSON
                return {"raw_text": text}

        except Exception as e:
            logger.error(f"Erro na chamada ao Claude: {e}")
            raise

    async def definir_problematica(
        self,
        tema: str,
        contexto: str = ""
    ) -> ProblemDefinition:
        """
        Define a problemática de pesquisa.

        Args:
            tema: Tema da pesquisa
            contexto: Contexto adicional

        Returns:
            Definição da problemática
        """
        logger.info(f"Definindo problemática para tema: {tema}")

        prompt = PROBLEM_DEFINITION_PROMPT.format(
            tema=tema,
            contexto=contexto or "Pesquisa eleitoral no Distrito Federal, Brasil"
        )

        result = await self._call_claude(prompt)

        # Converter para modelo Pydantic
        return ProblemDefinition(
            tema_central=result.get("tema_central", tema),
            problema_pesquisa=result.get("problema_pesquisa", ""),
            perguntas_pesquisa=result.get("perguntas_pesquisa", []),
            hipoteses=[
                {
                    "id": h.get("id", f"H{i+1}"),
                    "enunciado": h.get("enunciado", ""),
                    "variavel_independente": h.get("variavel_independente", ""),
                    "variavel_dependente": h.get("variavel_dependente", ""),
                    "tipo": h.get("tipo", "correlacional")
                }
                for i, h in enumerate(result.get("hipoteses", []))
            ],
            objetivos=result.get("objetivos", {"geral": "", "especificos": []}),
            justificativa=result.get("justificativa", ""),
            delimitacao=result.get("delimitacao", {
                "temporal": "",
                "geografico": "Distrito Federal",
                "tematico": tema,
                "populacao": "Eleitores do DF",
                "limitacoes": []
            })
        )

    async def desenhar_metodologia(
        self,
        problematica: ProblemDefinition
    ) -> MethodologyDesign:
        """
        Desenha a metodologia de pesquisa.

        Args:
            problematica: Definição da problemática

        Returns:
            Desenho metodológico
        """
        logger.info("Desenhando metodologia")

        prompt = METHODOLOGY_DESIGN_PROMPT.format(
            problematica=problematica.model_dump_json(indent=2)
        )

        result = await self._call_claude(prompt)

        return MethodologyDesign(
            tipo_pesquisa=result.get("tipo_pesquisa", "mista"),
            paradigma=result.get("paradigma", "pragmatico"),
            abordagem=result.get("abordagem", "survey"),
            tecnicas_analise=[
                t.get("tipo", "descritiva")
                for t in result.get("tecnicas_analise", [])
            ],
            software_analise=result.get("software_analise", ["Python/pandas"]),
            justificativa=result.get("justificativa_metodologia", "")
        )

    async def criar_estrategia_amostragem(
        self,
        metodologia: MethodologyDesign,
        total_eleitores: int,
        variaveis_estratificacao: List[str],
        distribuicao_populacao: Dict[str, Any]
    ) -> SamplingStrategy:
        """
        Cria estratégia de amostragem.

        Args:
            metodologia: Desenho metodológico
            total_eleitores: Total de eleitores disponíveis
            variaveis_estratificacao: Variáveis para estratificação
            distribuicao_populacao: Distribuição da população

        Returns:
            Estratégia de amostragem
        """
        logger.info("Criando estratégia de amostragem")

        prompt = SAMPLING_STRATEGY_PROMPT.format(
            metodologia=metodologia.model_dump_json(indent=2),
            total_eleitores=total_eleitores,
            variaveis_estratificacao="\n".join(f"- {v}" for v in variaveis_estratificacao),
            distribuicao_populacao=json.dumps(distribuicao_populacao, indent=2, ensure_ascii=False)
        )

        result = await self._call_claude(prompt)

        strategy = SamplingStrategy(
            tipo=result.get("tipo_amostragem", "estratificada_proporcional"),
            variaveis_estratificacao=[
                v.get("nome", "") for v in result.get("variaveis_estratificacao", [])
            ],
            justificativa=result.get("justificativa", "")
        )

        # Configurar tamanho da amostra
        tamanho_info = result.get("tamanho_amostra", {})
        strategy.config.populacao = total_eleitores
        strategy.config.nivel_confianca = tamanho_info.get("nivel_confianca", 0.95)
        strategy.config.margem_erro = tamanho_info.get("margem_erro", 0.03)
        strategy.calcular_tamanho()

        return strategy

    async def construir_questionario(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign
    ) -> Questionnaire:
        """
        Constrói o questionário.

        Args:
            problematica: Definição da problemática
            metodologia: Desenho metodológico

        Returns:
            Questionário construído
        """
        logger.info("Construindo questionário")

        prompt = QUESTIONNAIRE_BUILDER_PROMPT.format(
            problematica=problematica.model_dump_json(indent=2),
            metodologia=metodologia.model_dump_json(indent=2)
        )

        result = await self._call_claude(prompt, max_tokens=8000)

        return Questionnaire(
            titulo=result.get("titulo", problematica.tema_central),
            versao=result.get("versao", "1.0"),
            blocos=result.get("blocos", []),
            tempo_estimado_minutos=result.get("tempo_estimado_minutos", 15)
        )

    async def analisar_dados(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        respostas: List[Dict[str, Any]],
        hipoteses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analisa os dados coletados.

        Args:
            problematica: Definição da problemática
            metodologia: Desenho metodológico
            respostas: Lista de respostas coletadas
            hipoteses: Hipóteses a testar

        Returns:
            Resultados da análise
        """
        logger.info(f"Analisando {len(respostas)} respostas")

        # Criar resumo dos dados
        resumo = self._criar_resumo_dados(respostas)

        prompt = DATA_ANALYSIS_PROMPT.format(
            problematica=problematica.model_dump_json(indent=2),
            metodologia=metodologia.model_dump_json(indent=2),
            total_respostas=len(respostas),
            total_eleitores=len(set(r.get("eleitor_id") for r in respostas)),
            resumo_dados=json.dumps(resumo, indent=2, ensure_ascii=False),
            hipoteses=json.dumps(hipoteses, indent=2, ensure_ascii=False)
        )

        return await self._call_claude(prompt, max_tokens=12000)

    def _criar_resumo_dados(self, respostas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Cria resumo estatístico dos dados."""
        # Implementação simplificada
        return {
            "total_respostas": len(respostas),
            "perguntas_respondidas": len(set(r.get("pergunta_id") for r in respostas)),
            "eleitores_unicos": len(set(r.get("eleitor_id") for r in respostas))
        }

    async def gerar_projecoes(
        self,
        resultados_analise: Dict[str, Any]
    ) -> List[ProjectionScenario]:
        """
        Gera projeções eleitorais.

        Args:
            resultados_analise: Resultados da análise

        Returns:
            Lista de cenários de projeção
        """
        logger.info("Gerando projeções")

        prompt = PROJECTIONS_PROMPT.format(
            resultados_analise=json.dumps(resultados_analise, indent=2, ensure_ascii=False)
        )

        result = await self._call_claude(prompt)

        cenarios = []
        for c in result.get("cenarios", []):
            cenarios.append(ProjectionScenario(
                tipo=c.get("tipo", "realista"),
                nome=c.get("nome", ""),
                descricao=c.get("descricao", ""),
                intencao_voto=c.get("intencao_voto", {}),
                probabilidade_vitoria=c.get("probabilidade_vitoria", {}),
                premissas=c.get("premissas", [])
            ))

        return cenarios

    async def gerar_recomendacoes(
        self,
        analises: Dict[str, Any],
        projecoes: List[ProjectionScenario],
        cliente: str = ""
    ) -> List[Recommendation]:
        """
        Gera recomendações estratégicas.

        Args:
            analises: Resultados das análises
            projecoes: Cenários de projeção
            cliente: Nome do candidato/cliente

        Returns:
            Lista de recomendações
        """
        logger.info("Gerando recomendações")

        prompt = RECOMMENDATIONS_PROMPT.format(
            analises=json.dumps(analises, indent=2, ensure_ascii=False),
            projecoes=json.dumps([p.model_dump() for p in projecoes], indent=2, ensure_ascii=False),
            cliente=cliente or "Candidato"
        )

        result = await self._call_claude(prompt, max_tokens=10000)

        recomendacoes = []
        for r in result.get("recomendacoes", []):
            recomendacoes.append(Recommendation(
                id=r.get("id", ""),
                categoria=r.get("categoria", "comunicacao"),
                prioridade=r.get("prioridade", "media"),
                titulo=r.get("titulo", ""),
                diagnostico=r.get("diagnostico", ""),
                recomendacao=r.get("recomendacao", ""),
                justificativa=r.get("justificativa", ""),
                risco_nao_seguir=r.get("risco_nao_seguir", ""),
                acoes_especificas=r.get("acoes_especificas", []),
                dificuldade_implementacao=r.get("dificuldade_implementacao", 3),
                segmentos_alvo=r.get("segmentos_alvo", []),
                mensagens_chave=r.get("mensagens_chave", []),
                canais_recomendados=r.get("canais_recomendados", [])
            ))

        return recomendacoes

    async def gerar_relatorio_html(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        amostra: SelectedSample,
        analises: Dict[str, Any],
        projecoes: List[ProjectionScenario],
        recomendacoes: List[Recommendation]
    ) -> HTMLReport:
        """
        Gera relatório HTML.

        Args:
            problematica: Definição da problemática
            metodologia: Desenho metodológico
            amostra: Amostra selecionada
            analises: Resultados das análises
            projecoes: Cenários de projeção
            recomendacoes: Recomendações estratégicas

        Returns:
            Relatório HTML
        """
        logger.info("Gerando relatório HTML")

        prompt = REPORT_GENERATION_PROMPT.format(
            problematica=problematica.model_dump_json(indent=2),
            metodologia=metodologia.model_dump_json(indent=2),
            amostra=amostra.get_estatisticas(),
            analises=json.dumps(analises, indent=2, ensure_ascii=False),
            projecoes=json.dumps([p.model_dump() for p in projecoes], indent=2, ensure_ascii=False),
            recomendacoes=json.dumps([r.model_dump() for r in recomendacoes], indent=2, ensure_ascii=False)
        )

        result = await self._call_claude(prompt, max_tokens=16000)

        html_content = result.get("raw_text", "")
        if not html_content.startswith("<!DOCTYPE"):
            html_content = self._gerar_html_fallback(
                problematica, metodologia, amostra, analises, projecoes, recomendacoes
            )

        return HTMLReport(
            titulo=problematica.tema_central,
            html_content=html_content,
            secoes=["capa", "sumario_executivo", "metodologia", "resultados", "projecoes", "recomendacoes"]
        )

    def _gerar_html_fallback(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        amostra: SelectedSample,
        analises: Dict[str, Any],
        projecoes: List[ProjectionScenario],
        recomendacoes: List[Recommendation]
    ) -> str:
        """Gera HTML básico como fallback."""
        return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{problematica.tema_central}</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }}
        h1 {{ color: #1e40af; }}
        h2 {{ color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }}
        .kpi {{ display: inline-block; padding: 20px; margin: 10px; background: #eff6ff; border-radius: 8px; }}
        .kpi-value {{ font-size: 2em; font-weight: bold; color: #1e40af; }}
        .kpi-label {{ color: #64748b; }}
    </style>
</head>
<body>
    <h1>{problematica.tema_central}</h1>
    <p><em>Relatório POLARIS - {datetime.now().strftime('%d/%m/%Y')}</em></p>

    <h2>Sumário Executivo</h2>
    <div class="kpi">
        <div class="kpi-value">{amostra.total_selecionados}</div>
        <div class="kpi-label">Eleitores Entrevistados</div>
    </div>

    <h2>Metodologia</h2>
    <p><strong>Tipo:</strong> {metodologia.tipo_pesquisa}</p>
    <p><strong>Abordagem:</strong> {metodologia.abordagem}</p>

    <h2>Resultados</h2>
    <pre>{json.dumps(analises, indent=2, ensure_ascii=False)}</pre>

    <h2>Recomendações</h2>
    <ul>
    {"".join(f"<li><strong>{r.titulo}</strong>: {r.recomendacao}</li>" for r in recomendacoes)}
    </ul>

    <footer>
        <p><small>Gerado por POLARIS SDK - {datetime.now().isoformat()}</small></p>
    </footer>
</body>
</html>"""

    def get_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas de uso."""
        return {
            "model": self.MODEL,
            "total_tokens": self.total_tokens_used,
            "total_cost_usd": round(self.total_cost, 4),
            "price_per_1m_input": self.price_input,
            "price_per_1m_output": self.price_output
        }
