# POLARIS SDK - Coordinator
# Agente Coordenador de longa duração

import json
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, AsyncGenerator
import asyncio

from .scientist import PoliticalScientist
from .respondents import VoterRespondent
from .context_manager import ContextManager
from ..models.research import (
    ResearchState,
    ResearchPhase,
    ProblemDefinition,
    MethodologyDesign,
    Questionnaire,
)
from ..models.sample import SamplingStrategy, SelectedSample, SelectedVoter
from ..models.response import InterviewResult, CollectionProgress
from ..models.report import (
    ResearchReport,
    ProjectionScenario,
    Recommendation,
    HTMLReport,
    ExecutiveSummary,
    KeyFinding,
)
from ..utils.checkpoint import CheckpointManager

logger = logging.getLogger(__name__)


class ResearchProgress:
    """Progresso da pesquisa."""
    def __init__(self, fase: str, percentual: float, mensagem: str = ""):
        self.fase = fase
        self.percentual = percentual
        self.mensagem = mensagem
        self.timestamp = datetime.now()


class PolarisCoordinator:
    """
    Agente Coordenador de longa duração para pesquisas eleitorais.

    Responsabilidades:
    - Orquestrar as 9 fases da pesquisa
    - Gerenciar janela de contexto
    - Persistir estado entre sessões
    - Coordenar Opus 4.5 (cientista) e Sonnet 4 (eleitores)
    - Salvar checkpoints para recuperação
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        checkpoint_dir: str = "./checkpoints"
    ):
        """
        Inicializa o coordenador.

        Args:
            api_key: Chave da API Anthropic
            checkpoint_dir: Diretório para checkpoints
        """
        self.scientist = PoliticalScientist(api_key=api_key)
        self.respondent = VoterRespondent(api_key=api_key)
        self.context = ContextManager()
        self.checkpoint = CheckpointManager(checkpoint_dir)

        self.state: Optional[ResearchState] = None
        self.eleitores: List[Dict[str, Any]] = []

    def carregar_eleitores(self, caminho: str) -> int:
        """
        Carrega banco de eleitores.

        Args:
            caminho: Caminho para arquivo JSON com eleitores

        Returns:
            Número de eleitores carregados
        """
        with open(caminho, 'r', encoding='utf-8') as f:
            self.eleitores = json.load(f)

        logger.info(f"Carregados {len(self.eleitores)} eleitores de {caminho}")
        return len(self.eleitores)

    async def executar_pesquisa(
        self,
        tema: str,
        amostra_tamanho: Optional[int] = None,
        nivel_confianca: float = 0.95,
        margem_erro: float = 0.03,
        cliente: str = ""
    ) -> AsyncGenerator[ResearchProgress, None]:
        """
        Executa ciclo completo de pesquisa.

        Args:
            tema: Tema da pesquisa
            amostra_tamanho: Tamanho da amostra (ou calcula automaticamente)
            nivel_confianca: Nível de confiança estatística
            margem_erro: Margem de erro desejada
            cliente: Nome do candidato/cliente

        Yields:
            Progresso da pesquisa
        """
        # Inicializar estado
        self.state = ResearchState(
            id=str(uuid.uuid4()),
            tema=tema
        )

        logger.info(f"Iniciando pesquisa: {tema}")

        # FASE 1: Definição da Problemática
        yield ResearchProgress("definicao_problematica", 0, "Definindo problemática...")
        self.state.atualizar_fase(ResearchPhase.DEFINICAO_PROBLEMATICA)
        self._save_checkpoint()

        problematica = await self.scientist.definir_problematica(tema)
        self.state.problematica = problematica
        self.context.add_to_context(
            problematica.model_dump_json(),
            "problematica",
            prioridade=1
        )

        yield ResearchProgress("definicao_problematica", 100, "Problemática definida")

        # FASE 2: Desenho Metodológico
        yield ResearchProgress("metodologia", 0, "Desenhando metodologia...")
        self.state.atualizar_fase(ResearchPhase.METODOLOGIA)
        self._save_checkpoint()

        metodologia = await self.scientist.desenhar_metodologia(problematica)
        self.state.metodologia = metodologia.model_dump()
        self.context.add_to_context(
            metodologia.model_dump_json(),
            "metodologia",
            prioridade=2
        )

        yield ResearchProgress("metodologia", 100, "Metodologia definida")

        # FASE 3: Seleção da Amostra
        yield ResearchProgress("amostragem", 0, "Definindo amostragem...")
        self.state.atualizar_fase(ResearchPhase.AMOSTRAGEM)
        self._save_checkpoint()

        # Extrair variáveis e distribuição dos eleitores
        variaveis = self._extrair_variaveis_estratificacao()
        distribuicao = self._calcular_distribuicao()

        estrategia = await self.scientist.criar_estrategia_amostragem(
            metodologia=metodologia,
            total_eleitores=len(self.eleitores),
            variaveis_estratificacao=variaveis,
            distribuicao_populacao=distribuicao
        )

        # Aplicar tamanho personalizado se fornecido
        if amostra_tamanho:
            estrategia.tamanho_amostra = amostra_tamanho
        else:
            estrategia.config.nivel_confianca = nivel_confianca
            estrategia.config.margem_erro = margem_erro
            estrategia.calcular_tamanho()

        # Selecionar eleitores
        amostra = self._selecionar_amostra(estrategia)
        self.state.amostra = amostra.model_dump()

        yield ResearchProgress("amostragem", 100, f"Amostra selecionada: {amostra.total_selecionados} eleitores")

        # FASE 4: Construção do Questionário
        yield ResearchProgress("questionario", 0, "Construindo questionário...")
        self.state.atualizar_fase(ResearchPhase.QUESTIONARIO)
        self._save_checkpoint()

        questionario = await self.scientist.construir_questionario(
            problematica=problematica,
            metodologia=metodologia
        )
        self.state.questionario = questionario.model_dump()
        self.context.add_to_context(
            questionario.model_dump_json(),
            "questionario",
            prioridade=3
        )

        yield ResearchProgress("questionario", 100, f"Questionário criado: {questionario.total_perguntas} perguntas")

        # FASE 5: Coleta de Dados
        yield ResearchProgress("coleta", 0, "Iniciando coleta de dados...")
        self.state.atualizar_fase(ResearchPhase.COLETA)
        self._save_checkpoint()

        # Obter eleitores da amostra
        eleitores_amostra = [
            e for e in self.eleitores
            if e.get("id") in amostra.get_ids_eleitores()
        ]

        respostas = []
        total = len(eleitores_amostra)

        for i, eleitor in enumerate(eleitores_amostra):
            try:
                resultado = await self.respondent.entrevistar_eleitor(
                    eleitor=eleitor,
                    questionario=questionario
                )
                respostas.append(resultado.model_dump())

                percentual = ((i + 1) / total) * 100
                yield ResearchProgress(
                    "coleta",
                    percentual,
                    f"Entrevistado {i + 1}/{total}: {eleitor.get('nome', 'Anônimo')}"
                )

                # Checkpoint a cada 10 entrevistas
                if (i + 1) % 10 == 0:
                    self.state.respostas = respostas
                    self._save_checkpoint()

            except Exception as e:
                logger.error(f"Erro na entrevista {i + 1}: {e}")

        self.state.respostas = respostas

        yield ResearchProgress("coleta", 100, f"Coleta concluída: {len(respostas)} entrevistas")

        # FASE 6: Análise de Dados
        yield ResearchProgress("analise", 0, "Analisando dados...")
        self.state.atualizar_fase(ResearchPhase.ANALISE)
        self._save_checkpoint()

        analise = await self.scientist.analisar_dados(
            problematica=problematica,
            metodologia=metodologia,
            respostas=self._extrair_respostas_para_analise(respostas),
            hipoteses=[h.model_dump() for h in problematica.hipoteses]
        )
        self.state.analise = analise

        yield ResearchProgress("analise", 100, "Análise concluída")

        # FASE 7: Projeções
        yield ResearchProgress("projecoes", 0, "Gerando projeções...")
        self.state.atualizar_fase(ResearchPhase.PROJECOES)
        self._save_checkpoint()

        projecoes = await self.scientist.gerar_projecoes(analise)
        self.state.projecoes = [p.model_dump() for p in projecoes]

        yield ResearchProgress("projecoes", 100, "Projeções geradas")

        # FASE 8: Recomendações
        yield ResearchProgress("recomendacoes", 0, "Gerando recomendações...")
        self.state.atualizar_fase(ResearchPhase.RECOMENDACOES)
        self._save_checkpoint()

        recomendacoes = await self.scientist.gerar_recomendacoes(
            analises=analise,
            projecoes=projecoes,
            cliente=cliente
        )
        self.state.recomendacoes = [r.model_dump() for r in recomendacoes]

        yield ResearchProgress("recomendacoes", 100, "Recomendações geradas")

        # FASE 9: Relatório
        yield ResearchProgress("relatorio", 0, "Gerando relatório HTML...")
        self.state.atualizar_fase(ResearchPhase.RELATORIO)
        self._save_checkpoint()

        relatorio = await self.scientist.gerar_relatorio_html(
            problematica=problematica,
            metodologia=metodologia,
            amostra=amostra,
            analises=analise,
            projecoes=projecoes,
            recomendacoes=recomendacoes
        )

        # Finalizar
        self.state.atualizar_fase(ResearchPhase.CONCLUIDO)
        self._save_checkpoint()

        yield ResearchProgress("concluido", 100, "Pesquisa concluída!")

    def _save_checkpoint(self) -> None:
        """Salva checkpoint do estado atual."""
        if self.state:
            self.checkpoint.save(
                research_id=self.state.id,
                fase=self.state.fase.value,
                data=self.state.to_dict()
            )

    def _extrair_variaveis_estratificacao(self) -> List[str]:
        """Extrai variáveis disponíveis para estratificação."""
        if not self.eleitores:
            return []

        # Pegar primeiro eleitor como referência
        sample = self.eleitores[0]
        variaveis = [
            "regiao_administrativa",
            "faixa_etaria",
            "genero",
            "orientacao_politica",
            "cluster_socioeconomico",
            "escolaridade",
            "religiao",
            "interesse_politico"
        ]
        return [v for v in variaveis if v in sample]

    def _calcular_distribuicao(self) -> Dict[str, Dict[str, int]]:
        """Calcula distribuição da população por variáveis."""
        distribuicao = {}

        for variavel in self._extrair_variaveis_estratificacao():
            contagem = {}
            for eleitor in self.eleitores:
                valor = eleitor.get(variavel, "desconhecido")
                if isinstance(valor, list):
                    valor = valor[0] if valor else "desconhecido"
                contagem[str(valor)] = contagem.get(str(valor), 0) + 1
            distribuicao[variavel] = contagem

        return distribuicao

    def _selecionar_amostra(self, estrategia: SamplingStrategy) -> SelectedSample:
        """Seleciona amostra de eleitores."""
        import random

        amostra = SelectedSample(
            id=str(uuid.uuid4()),
            estrategia=estrategia
        )

        # Amostragem estratificada simplificada
        n = estrategia.tamanho_amostra
        variaveis = estrategia.variaveis_estratificacao

        if not variaveis or estrategia.tipo.value == "aleatoria_simples":
            # Amostragem aleatória simples
            selecionados = random.sample(self.eleitores, min(n, len(self.eleitores)))
        else:
            # Estratificada proporcional por primeira variável
            var_principal = variaveis[0]
            grupos = {}

            for eleitor in self.eleitores:
                valor = eleitor.get(var_principal, "outro")
                if isinstance(valor, list):
                    valor = valor[0] if valor else "outro"
                if valor not in grupos:
                    grupos[valor] = []
                grupos[valor].append(eleitor)

            # Selecionar proporcionalmente
            selecionados = []
            for grupo, membros in grupos.items():
                proporcao = len(membros) / len(self.eleitores)
                n_grupo = max(1, int(n * proporcao))
                selecionados.extend(random.sample(membros, min(n_grupo, len(membros))))

            # Ajustar para tamanho exato
            if len(selecionados) > n:
                selecionados = random.sample(selecionados, n)
            elif len(selecionados) < n:
                restantes = [e for e in self.eleitores if e not in selecionados]
                adicionar = min(n - len(selecionados), len(restantes))
                selecionados.extend(random.sample(restantes, adicionar))

        # Adicionar à amostra
        for i, eleitor in enumerate(selecionados):
            estrato = {
                v: str(eleitor.get(v, ""))
                for v in variaveis
            }
            voter = SelectedVoter(
                id=eleitor.get("id", str(i)),
                nome=eleitor.get("nome", f"Eleitor {i + 1}"),
                estrato=estrato,
                ordem_selecao=i + 1
            )
            amostra.adicionar_eleitor(voter)

        return amostra

    def _extrair_respostas_para_analise(
        self,
        resultados: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Extrai respostas em formato para análise."""
        respostas = []

        for resultado in resultados:
            eleitor_id = resultado.get("eleitor_id")
            for resposta in resultado.get("respostas", []):
                respostas.append({
                    "eleitor_id": eleitor_id,
                    "pergunta_id": resposta.get("pergunta_id"),
                    "resposta_texto": resposta.get("resposta_texto"),
                    "resposta_estruturada": resposta.get("resposta_estruturada"),
                    "emocao": resposta.get("fluxo_cognitivo", {}).get("emocao", {}).get("emocao_primaria"),
                    "intensidade": resposta.get("fluxo_cognitivo", {}).get("emocao", {}).get("intensidade"),
                    "tom": resposta.get("fluxo_cognitivo", {}).get("decisao", {}).get("tom"),
                    "certeza": resposta.get("fluxo_cognitivo", {}).get("decisao", {}).get("certeza_numerica")
                })

        return respostas

    def retomar_pesquisa(self, checkpoint_id: str) -> Optional[ResearchState]:
        """
        Retoma pesquisa de um checkpoint.

        Args:
            checkpoint_id: ID do checkpoint

        Returns:
            Estado da pesquisa ou None se não encontrado
        """
        data = self.checkpoint.load(checkpoint_id)
        if data:
            self.state = ResearchState.from_dict(data)
            logger.info(f"Pesquisa retomada da fase: {self.state.fase}")
            return self.state
        return None

    def get_relatorio(self) -> Optional[HTMLReport]:
        """Retorna o relatório gerado."""
        if self.state and hasattr(self.state, 'relatorio'):
            return self.state.relatorio
        return None

    def get_statistics(self) -> Dict[str, Any]:
        """Retorna estatísticas do uso."""
        return {
            "scientist": self.scientist.get_statistics(),
            "respondent": self.respondent.get_statistics(),
            "context": self.context.get_status(),
            "state": {
                "id": self.state.id if self.state else None,
                "fase": self.state.fase.value if self.state else None,
                "tokens_utilizados": self.state.tokens_utilizados if self.state else 0
            }
        }
