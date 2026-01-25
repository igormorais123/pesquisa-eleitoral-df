# POLARIS SDK - Voter Respondents
# Claude Sonnet 4 como Voz dos Eleitores

import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import anthropic

from ..prompts.respondent_prompts import (
    VOTER_SYSTEM_PROMPT,
    INTERVIEW_PROMPT_TEMPLATE,
    COGNITIVE_FLOW_INSTRUCTIONS,
    BATCH_INTERVIEW_PROMPT,
)
from ..models.research import Question, Questionnaire
from ..models.response import (
    Response,
    CognitiveFlow,
    AttentionFilter,
    ConfirmationBias,
    EmotionalReaction,
    Decision,
    InterviewResult,
    CollectionProgress,
)

logger = logging.getLogger(__name__)


class VoterRespondent:
    """
    Claude Sonnet 4 atuando como a Voz dos Eleitores.

    Responsabilidades:
    - Encarnar perfis de eleitores sintéticos
    - Responder perguntas através do fluxo de 4 etapas cognitivas
    - Manter consistência com o perfil
    - Gerar respostas autênticas e realistas
    """

    MODEL = "claude-sonnet-4-5-20250929"
    MAX_TOKENS = 4000

    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa o respondente eleitor.

        Args:
            api_key: Chave da API Anthropic
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.total_tokens_used = 0
        self.total_cost = 0.0

        # Preços Sonnet (por 1M tokens)
        self.price_input = 3.0
        self.price_output = 15.0

        # Cache de memórias de eleitores
        self.memorias_eleitores: Dict[str, List[Dict[str, Any]]] = {}

    async def _call_claude(
        self,
        prompt: str,
        system: str = None,
        max_tokens: int = None
    ) -> Dict[str, Any]:
        """
        Faz chamada ao Claude Sonnet 4.

        Args:
            prompt: Prompt do usuário
            system: System prompt
            max_tokens: Máximo de tokens na resposta

        Returns:
            Resposta parseada como JSON
        """
        system = system or (VOTER_SYSTEM_PROMPT + "\n\n" + COGNITIVE_FLOW_INSTRUCTIONS)
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

            # Extrair texto
            text = response.content[0].text

            # Parsear JSON
            try:
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
                logger.warning("Resposta não é JSON válido")
                return {"raw_text": text}

        except Exception as e:
            logger.error(f"Erro na chamada ao Claude: {e}")
            raise

    def _formatar_perfil(self, eleitor: Dict[str, Any]) -> str:
        """Formata perfil do eleitor para o prompt."""
        campos_importantes = [
            "nome", "idade", "genero", "cor_raca", "regiao_administrativa",
            "cluster_socioeconomico", "escolaridade", "renda_salarios_minimos",
            "ocupacao_vinculo", "ocupacao_detalhada",
            "orientacao_politica", "posicao_bolsonaro", "interesse_politico",
            "estilo_decisao", "tolerancia_nuance", "valores", "preocupacoes",
            "medos", "vieses_cognitivos", "susceptibilidade_desinformacao",
            "fontes_informacao", "religiao", "estado_civil"
        ]

        linhas = []
        for campo in campos_importantes:
            if campo in eleitor:
                valor = eleitor[campo]
                if isinstance(valor, list):
                    valor = ", ".join(str(v) for v in valor)
                linhas.append(f"- **{campo}**: {valor}")

        # Adicionar campos extras se existirem
        for campo, valor in eleitor.items():
            if campo not in campos_importantes and campo != "id":
                if isinstance(valor, list):
                    valor = ", ".join(str(v) for v in valor[:3]) + ("..." if len(valor) > 3 else "")
                linhas.append(f"- {campo}: {valor}")

        return "\n".join(linhas)

    def _formatar_opcoes(self, pergunta: Question) -> str:
        """Formata opções da pergunta."""
        if pergunta.tipo.value == "escala_likert" and pergunta.escala:
            return f"""
**Escala**: {pergunta.escala.min} a {pergunta.escala.max}
**Rótulos**: {', '.join(pergunta.escala.rotulos)}
"""
        elif pergunta.opcoes:
            return "**Opções**:\n" + "\n".join(f"- {op}" for op in pergunta.opcoes)
        return ""

    async def entrevistar_eleitor(
        self,
        eleitor: Dict[str, Any],
        questionario: Questionnaire,
        progress_callback: Optional[callable] = None
    ) -> InterviewResult:
        """
        Realiza entrevista completa com um eleitor.

        Args:
            eleitor: Perfil do eleitor
            questionario: Questionário a aplicar
            progress_callback: Callback para progresso

        Returns:
            Resultado da entrevista
        """
        eleitor_id = eleitor.get("id", str(hash(eleitor.get("nome", ""))))
        eleitor_nome = eleitor.get("nome", "Eleitor Anônimo")

        logger.info(f"Iniciando entrevista com {eleitor_nome}")

        result = InterviewResult(
            eleitor_id=eleitor_id,
            eleitor_nome=eleitor_nome,
            questionario_id=questionario.titulo,
            total_perguntas=questionario.total_perguntas
        )

        # Inicializar memória do eleitor
        self.memorias_eleitores[eleitor_id] = []

        perguntas = questionario.todas_perguntas
        respostas_anteriores = []

        for i, pergunta in enumerate(perguntas):
            try:
                resposta = await self._responder_pergunta(
                    eleitor=eleitor,
                    pergunta=pergunta,
                    bloco_nome=self._get_bloco_nome(questionario, pergunta),
                    numero_pergunta=i + 1,
                    total_perguntas=len(perguntas),
                    respostas_anteriores=respostas_anteriores
                )

                result.adicionar_resposta(resposta)
                respostas_anteriores.append({
                    "pergunta": pergunta.texto[:100],
                    "resposta": resposta.resposta_texto[:100]
                })

                # Atualizar memória
                self.memorias_eleitores[eleitor_id].append({
                    "pergunta_id": pergunta.id,
                    "resposta": resposta.resposta_texto,
                    "emocao": resposta.fluxo_cognitivo.emocao.emocao_primaria.value
                })

                if progress_callback:
                    progress_callback(i + 1, len(perguntas))

            except Exception as e:
                logger.error(f"Erro na pergunta {pergunta.id}: {e}")
                result.erros_validacao = result.erros_validacao if hasattr(result, 'erros_validacao') else []

        result.finalizar()
        return result

    def _get_bloco_nome(self, questionario: Questionnaire, pergunta: Question) -> str:
        """Encontra o nome do bloco da pergunta."""
        for bloco in questionario.blocos:
            if any(p.id == pergunta.id for p in bloco.perguntas):
                return bloco.nome
        return "Geral"

    async def _responder_pergunta(
        self,
        eleitor: Dict[str, Any],
        pergunta: Question,
        bloco_nome: str,
        numero_pergunta: int,
        total_perguntas: int,
        respostas_anteriores: List[Dict[str, Any]]
    ) -> Response:
        """Responde uma pergunta individual."""
        perfil_formatado = self._formatar_perfil(eleitor)
        opcoes_formatadas = self._formatar_opcoes(pergunta)

        resumo_anteriores = "Nenhuma" if not respostas_anteriores else "\n".join(
            f"- {r['pergunta']}: {r['resposta']}"
            for r in respostas_anteriores[-3:]  # Últimas 3
        )

        prompt = INTERVIEW_PROMPT_TEMPLATE.format(
            perfil_completo=perfil_formatado,
            pergunta_id=pergunta.id,
            bloco_nome=bloco_nome,
            tipo_pergunta=pergunta.tipo.value,
            texto_pergunta=pergunta.texto,
            opcoes_se_aplicavel=opcoes_formatadas,
            instrucoes_ia=pergunta.instrucoes_ia or "Responda naturalmente baseado no perfil",
            numero_pergunta=numero_pergunta,
            total_perguntas=total_perguntas,
            resumo_anteriores=resumo_anteriores
        )

        result = await self._call_claude(prompt)

        # Parsear fluxo cognitivo
        fluxo_data = result.get("fluxo_cognitivo", {})

        fluxo = CognitiveFlow(
            atencao=self._parse_atencao(fluxo_data.get("atencao", {})),
            vies=self._parse_vies(fluxo_data.get("vies", {})),
            emocao=self._parse_emocao(fluxo_data.get("emocao", {})),
            decisao=self._parse_decisao(fluxo_data.get("decisao", {}))
        )

        resposta_final = result.get("resposta_final", {})

        return Response(
            eleitor_id=eleitor.get("id", ""),
            pergunta_id=pergunta.id,
            fluxo_cognitivo=fluxo,
            resposta_texto=resposta_final.get("texto", fluxo.decisao.resposta_texto),
            resposta_estruturada=resposta_final.get("valor"),
            modelo_utilizado=self.MODEL
        )

    def _parse_atencao(self, data: Dict[str, Any]) -> AttentionFilter:
        """Parseia dados de atenção."""
        return AttentionFilter(
            nivel=data.get("nivel", "media"),
            justificativa=data.get("justificativa", ""),
            baseado_em=data.get("baseado_em", []),
            passa_filtro=data.get("passa_filtro", True)
        )

    def _parse_vies(self, data: Dict[str, Any]) -> ConfirmationBias:
        """Parseia dados de viés."""
        return ConfirmationBias(
            confirma_crencas=data.get("confirma_crencas", True),
            nivel_ameaca=data.get("nivel_ameaca", 0),
            crencas_afetadas=data.get("crencas_afetadas", []),
            vieses_ativados=data.get("vieses_ativados", []),
            mecanismo_defesa=data.get("mecanismo_defesa"),
            justificativa=data.get("justificativa", "")
        )

    def _parse_emocao(self, data: Dict[str, Any]) -> EmotionalReaction:
        """Parseia dados de emoção."""
        return EmotionalReaction(
            emocao_primaria=data.get("emocao_primaria", "indiferenca"),
            intensidade=data.get("intensidade", 5),
            emocoes_secundarias=data.get("emocoes_secundarias", []),
            gatilhos=data.get("gatilhos", []),
            memoria_associada=data.get("memoria_associada"),
            justificativa=data.get("justificativa", "")
        )

    def _parse_decisao(self, data: Dict[str, Any]) -> Decision:
        """Parseia dados de decisão."""
        return Decision(
            resposta_texto=data.get("resposta_texto", ""),
            resposta_estruturada=data.get("resposta_estruturada"),
            tom=data.get("tom", "neutro"),
            certeza=data.get("certeza", "moderado"),
            certeza_numerica=data.get("certeza_numerica", 5),
            pode_mudar_opiniao=data.get("pode_mudar_opiniao", False),
            condicoes_mudanca=data.get("condicoes_mudanca", []),
            justificativa_interna=data.get("justificativa_interna", "")
        )

    async def entrevistar_batch(
        self,
        eleitores: List[Dict[str, Any]],
        questionario: Questionnaire,
        max_concurrent: int = 5,
        progress_callback: Optional[callable] = None
    ) -> List[InterviewResult]:
        """
        Entrevista múltiplos eleitores em paralelo.

        Args:
            eleitores: Lista de perfis de eleitores
            questionario: Questionário a aplicar
            max_concurrent: Máximo de entrevistas simultâneas
            progress_callback: Callback para progresso

        Returns:
            Lista de resultados de entrevistas
        """
        logger.info(f"Iniciando batch de {len(eleitores)} entrevistas")

        progress = CollectionProgress(total_eleitores=len(eleitores))
        results = []

        # Processar em lotes
        for i in range(0, len(eleitores), max_concurrent):
            batch = eleitores[i:i + max_concurrent]

            tasks = [
                self.entrevistar_eleitor(eleitor, questionario)
                for eleitor in batch
            ]

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in batch_results:
                if isinstance(result, Exception):
                    logger.error(f"Erro em entrevista: {result}")
                    progress.entrevistas_com_erro += 1
                else:
                    results.append(result)
                    progress.atualizar(result)

                if progress_callback:
                    progress_callback(progress)

        logger.info(f"Batch concluído: {len(results)} entrevistas bem-sucedidas")
        return results

    def get_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas de uso."""
        return {
            "model": self.MODEL,
            "total_tokens": self.total_tokens_used,
            "total_cost_usd": round(self.total_cost, 4),
            "eleitores_entrevistados": len(self.memorias_eleitores),
            "price_per_1m_input": self.price_input,
            "price_per_1m_output": self.price_output
        }
