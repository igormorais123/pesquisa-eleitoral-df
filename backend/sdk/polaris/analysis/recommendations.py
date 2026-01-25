# POLARIS SDK - Recommendations
# Motor de recomendações estratégicas

from typing import Dict, Any, List, Optional
from collections import Counter

from ..models.report import (
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
    SegmentedAnalysis,
)


class RecommendationsEngine:
    """
    Motor de recomendações estratégicas.

    Gera recomendações acionáveis baseadas em análises.
    """

    def __init__(
        self,
        intencao_voto: Dict[str, float],
        rejeicao: Dict[str, float],
        analise_segmentada: List[SegmentedAnalysis],
        analise_sentimento: Dict[str, Any]
    ):
        """
        Inicializa o motor de recomendações.

        Args:
            intencao_voto: Distribuição de intenção de voto
            rejeicao: Taxas de rejeição
            analise_segmentada: Análises por segmento
            analise_sentimento: Análise de sentimento
        """
        self.intencao_voto = intencao_voto
        self.rejeicao = rejeicao
        self.analise_segmentada = analise_segmentada
        self.analise_sentimento = analise_sentimento

        self.recomendacoes: List[Recommendation] = []
        self._contador = 0

    def gerar_recomendacoes(
        self,
        cliente: Optional[str] = None
    ) -> List[Recommendation]:
        """
        Gera todas as recomendações.

        Args:
            cliente: Nome do candidato cliente

        Returns:
            Lista de recomendações
        """
        self.recomendacoes = []
        self._contador = 0

        # Identificar posição do cliente
        if cliente and cliente in self.intencao_voto:
            posicao_cliente = self._determinar_posicao(cliente)
        else:
            posicao_cliente = "desconhecida"
            cliente = list(self.intencao_voto.keys())[0] if self.intencao_voto else "Candidato"

        # Gerar recomendações por categoria
        self._recomendacoes_posicionamento(cliente, posicao_cliente)
        self._recomendacoes_comunicacao(cliente)
        self._recomendacoes_segmentacao(cliente)
        self._recomendacoes_temas(cliente)
        self._recomendacoes_defesa(cliente)
        self._recomendacoes_timing(cliente, posicao_cliente)
        self._recomendacoes_recursos(cliente)

        # Ordenar por prioridade
        ordem_prioridade = {
            RecommendationPriority.CRITICA: 0,
            RecommendationPriority.ALTA: 1,
            RecommendationPriority.MEDIA: 2,
            RecommendationPriority.BAIXA: 3
        }
        self.recomendacoes.sort(key=lambda r: ordem_prioridade.get(r.prioridade, 4))

        return self.recomendacoes

    def _determinar_posicao(self, cliente: str) -> str:
        """Determina posição do cliente na disputa."""
        ordenado = sorted(
            self.intencao_voto.items(),
            key=lambda x: x[1],
            reverse=True
        )

        for i, (candidato, _) in enumerate(ordenado):
            if candidato == cliente:
                if i == 0:
                    return "lider"
                elif i == 1:
                    return "segundo"
                else:
                    return "outsider"

        return "desconhecida"

    def _adicionar_recomendacao(
        self,
        categoria: RecommendationCategory,
        prioridade: RecommendationPriority,
        titulo: str,
        diagnostico: str,
        recomendacao: str,
        justificativa: str,
        risco: str,
        acoes: List[str],
        dificuldade: int = 3,
        segmentos: Optional[List[str]] = None,
        mensagens: Optional[List[str]] = None,
        canais: Optional[List[str]] = None
    ) -> None:
        """Adiciona uma recomendação à lista."""
        self._contador += 1

        self.recomendacoes.append(Recommendation(
            id=f"R{self._contador}",
            categoria=categoria,
            prioridade=prioridade,
            titulo=titulo,
            diagnostico=diagnostico,
            recomendacao=recomendacao,
            justificativa=justificativa,
            risco_nao_seguir=risco,
            acoes_especificas=acoes,
            dificuldade_implementacao=dificuldade,
            segmentos_alvo=segmentos or [],
            mensagens_chave=mensagens or [],
            canais_recomendados=canais or []
        ))

    def _recomendacoes_posicionamento(
        self,
        cliente: str,
        posicao: str
    ) -> None:
        """Gera recomendações de posicionamento."""
        if posicao == "lider":
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.POSICIONAMENTO,
                prioridade=RecommendationPriority.ALTA,
                titulo="Consolidar liderança",
                diagnostico="Você lidera a pesquisa, mas precisa manter a vantagem.",
                recomendacao="Adote postura de estadista, evite ataques diretos e foque em proposta de governo.",
                justificativa="Líderes que atacam podem parecer desesperados e perder votos.",
                risco="Perder imagem de favorito e abrir espaço para adversários.",
                acoes=[
                    "Evitar debates acalorados",
                    "Focar em realizações e propostas",
                    "Manter presença institucional",
                    "Reforçar mensagem de união"
                ],
                dificuldade=2
            )
        elif posicao == "segundo":
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.POSICIONAMENTO,
                prioridade=RecommendationPriority.CRITICA,
                titulo="Estratégia de ascensão",
                diagnostico="Você está em segundo lugar e precisa crescer para vencer.",
                recomendacao="Polarize com o líder, mostre diferenças claras e capture os indecisos.",
                justificativa="O segundo colocado precisa criar contraste para atrair votos.",
                risco="Permanecer estagnado e perder a eleição.",
                acoes=[
                    "Marcar posição clara contra o líder",
                    "Participar ativamente de debates",
                    "Intensificar campanha em redutos fracos do líder",
                    "Buscar apoio de outras forças políticas"
                ],
                dificuldade=3
            )
        else:
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.POSICIONAMENTO,
                prioridade=RecommendationPriority.CRITICA,
                titulo="Buscar viabilidade",
                diagnostico="Sua posição atual exige estratégia agressiva de crescimento.",
                recomendacao="Encontre um nicho não ocupado e posicione-se como alternativa diferenciada.",
                justificativa="Outsiders precisam de proposta única para se destacar.",
                risco="Não conseguir decolar e desperdiçar recursos.",
                acoes=[
                    "Identificar tema não explorado pelos líderes",
                    "Focar em segmentos específicos",
                    "Comunicação digital intensa",
                    "Proposta disruptiva"
                ],
                dificuldade=5
            )

    def _recomendacoes_comunicacao(self, cliente: str) -> None:
        """Gera recomendações de comunicação."""
        sentimento = self.analise_sentimento

        if sentimento.get("negativo", 0) > 40:
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.COMUNICACAO,
                prioridade=RecommendationPriority.ALTA,
                titulo="Comunicação empática",
                diagnostico=f"Há alto nível de sentimento negativo ({sentimento.get('negativo', 0):.1f}%) no eleitorado.",
                recomendacao="Adote tom empático que reconheça as dificuldades dos eleitores.",
                justificativa="Eleitores frustrados respondem melhor a candidatos que demonstram compreensão.",
                risco="Parecer desconectado da realidade e perder identificação.",
                acoes=[
                    "Usar linguagem que reconheça problemas",
                    "Evitar tom otimista excessivo",
                    "Mostrar indignação com problemas reais",
                    "Apresentar soluções concretas"
                ],
                dificuldade=2,
                mensagens=[
                    "Entendo sua frustração",
                    "Juntos podemos mudar",
                    "Não é justo o que você passa"
                ]
            )

        self._adicionar_recomendacao(
            categoria=RecommendationCategory.COMUNICACAO,
            prioridade=RecommendationPriority.MEDIA,
            titulo="Diversificar canais",
            diagnostico="Diferentes segmentos consomem mídia de formas distintas.",
            recomendacao="Adapte a mensagem para cada canal mantendo coerência central.",
            justificativa="Comunicação segmentada aumenta efetividade da campanha.",
            risco="Perder alcance em segmentos específicos.",
            acoes=[
                "Conteúdo específico para redes sociais",
                "Presença em rádio para público mais velho",
                "Material impresso para áreas periféricas",
                "Lives e interações diretas"
            ],
            dificuldade=3,
            canais=["Instagram", "Facebook", "Rádio", "WhatsApp", "Material impresso"]
        )

    def _recomendacoes_segmentacao(self, cliente: str) -> None:
        """Gera recomendações de segmentação."""
        # Identificar segmentos prioritários
        segmentos_prioritarios = self._identificar_segmentos_prioritarios()

        for seg in segmentos_prioritarios[:3]:
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.SEGMENTACAO,
                prioridade=RecommendationPriority.ALTA,
                titulo=f"Priorizar {seg['nome']}",
                diagnostico=seg['diagnostico'],
                recomendacao=seg['recomendacao'],
                justificativa=seg['justificativa'],
                risco=f"Perder votos em segmento com potencial de {seg.get('potencial', 'alto')} ganho.",
                acoes=seg.get('acoes', []),
                dificuldade=seg.get('dificuldade', 3),
                segmentos=[seg['nome']]
            )

    def _identificar_segmentos_prioritarios(self) -> List[Dict[str, Any]]:
        """Identifica segmentos prioritários para campanha."""
        segmentos = []

        # Analisar dados segmentados
        for analise in self.analise_segmentada:
            for seg in analise.segmentos:
                # Calcular potencial de persuasão
                indecisos = seg.indecisos
                tamanho = seg.percentual

                if indecisos > 15 and tamanho > 5:
                    segmentos.append({
                        'nome': f"{analise.variavel_segmentacao}: {seg.valor}",
                        'diagnostico': f"Segmento com {indecisos:.1f}% de indecisos e {tamanho:.1f}% do eleitorado.",
                        'recomendacao': f"Intensificar campanha em {seg.valor}.",
                        'justificativa': "Alto percentual de indecisos indica potencial de persuasão.",
                        'potencial': 'alto' if indecisos > 20 else 'medio',
                        'acoes': [
                            f"Eventos específicos em {seg.valor}",
                            "Mensagem customizada para o segmento",
                            "Presença de lideranças locais"
                        ],
                        'dificuldade': 3,
                        'score': indecisos * tamanho
                    })

        # Ordenar por score
        segmentos.sort(key=lambda x: x.get('score', 0), reverse=True)

        # Adicionar segmentos padrão se não houver dados
        if not segmentos:
            segmentos = [
                {
                    'nome': 'Indecisos',
                    'diagnostico': 'Grupo de eleitores sem preferência definida.',
                    'recomendacao': 'Focar em mensagem de proposta e mudança.',
                    'justificativa': 'Indecisos decidem eleições apertadas.',
                    'potencial': 'alto',
                    'acoes': ['Campanha informativa', 'Debates', 'Material comparativo'],
                    'dificuldade': 3
                }
            ]

        return segmentos

    def _recomendacoes_temas(self, cliente: str) -> None:
        """Gera recomendações sobre temas a enfatizar."""
        self._adicionar_recomendacao(
            categoria=RecommendationCategory.TEMAS,
            prioridade=RecommendationPriority.ALTA,
            titulo="Foco em segurança pública",
            diagnostico="Segurança é consistentemente o tema mais citado pelos eleitores.",
            recomendacao="Apresente proposta robusta e realista para segurança.",
            justificativa="Candidato sem proposta clara para segurança perde credibilidade.",
            risco="Ser visto como despreparado no tema mais importante.",
            acoes=[
                "Desenvolver plano detalhado de segurança",
                "Buscar apoio de especialistas",
                "Visitar comunidades afetadas pela violência",
                "Propor metas mensuráveis"
            ],
            dificuldade=3,
            mensagens=["Sua família protegida", "Tolerância zero com o crime"]
        )

        self._adicionar_recomendacao(
            categoria=RecommendationCategory.TEMAS,
            prioridade=RecommendationPriority.MEDIA,
            titulo="Evitar temas divisivos",
            diagnostico="Alguns temas geram mais rejeição do que apoio.",
            recomendacao="Evite posições polêmicas em temas que dividem o eleitorado.",
            justificativa="Perder votos por posição desnecessária é erro evitável.",
            risco="Criar rejeição em segmentos que poderiam votar em você.",
            acoes=[
                "Mapear temas polêmicos",
                "Preparar respostas evasivas para perguntas difíceis",
                "Redirecionar para temas de consenso"
            ],
            dificuldade=2
        )

    def _recomendacoes_defesa(self, cliente: str) -> None:
        """Gera recomendações de defesa contra ataques."""
        rejeicao_cliente = self.rejeicao.get(cliente, 0)

        if rejeicao_cliente > 20:
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.DEFESA,
                prioridade=RecommendationPriority.CRITICA,
                titulo="Reduzir rejeição",
                diagnostico=f"Sua rejeição está em {rejeicao_cliente:.1f}%, limitando seu teto eleitoral.",
                recomendacao="Implemente estratégia de redução de rejeição com ações concretas.",
                justificativa="Alta rejeição impede crescimento além de certo patamar.",
                risco="Teto eleitoral limitado pode impedir a vitória.",
                acoes=[
                    "Identificar causas da rejeição",
                    "Ações de reparação/reconciliação",
                    "Comunicação positiva intensa",
                    "Evitar confrontos desnecessários"
                ],
                dificuldade=4
            )

        self._adicionar_recomendacao(
            categoria=RecommendationCategory.DEFESA,
            prioridade=RecommendationPriority.MEDIA,
            titulo="Preparação para ataques",
            diagnostico="É provável que adversários façam ataques durante a campanha.",
            recomendacao="Prepare respostas rápidas e evite reações emocionais.",
            justificativa="Candidatos que perdem a compostura sob ataque perdem credibilidade.",
            risco="Ser pego desprevenido pode causar dano à imagem.",
            acoes=[
                "Mapear possíveis ataques",
                "Preparar respostas para cada cenário",
                "Treinar porta-vozes",
                "Montar war room de resposta rápida"
            ],
            dificuldade=3
        )

    def _recomendacoes_timing(
        self,
        cliente: str,
        posicao: str
    ) -> None:
        """Gera recomendações de timing."""
        if posicao == "lider":
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.TIMING,
                prioridade=RecommendationPriority.MEDIA,
                titulo="Manter ritmo constante",
                diagnostico="Como líder, você precisa manter a vantagem até a eleição.",
                recomendacao="Evite grandes mudanças de estratégia; mantenha o que está funcionando.",
                justificativa="Mudanças bruscas podem sinalizar desespero ou insegurança.",
                risco="Perder a liderança por erros não forçados.",
                acoes=[
                    "Manter agenda pública consistente",
                    "Não reagir exageradamente a pesquisas",
                    "Guardar recursos para reta final"
                ],
                dificuldade=2
            )
        else:
            self._adicionar_recomendacao(
                categoria=RecommendationCategory.TIMING,
                prioridade=RecommendationPriority.ALTA,
                titulo="Intensificar agora",
                diagnostico="Como desafiante, você precisa criar momentum de crescimento.",
                recomendacao="Intensifique a campanha imediatamente; não espere a reta final.",
                justificativa="Crescimento eleitoral leva tempo para se consolidar.",
                risco="Deixar para o final e não ter tempo de crescer.",
                acoes=[
                    "Aumentar presença de mídia imediatamente",
                    "Eventos de grande visibilidade",
                    "Buscar endorsements de peso",
                    "Campanha digital agressiva"
                ],
                dificuldade=3
            )

    def _recomendacoes_recursos(self, cliente: str) -> None:
        """Gera recomendações de alocação de recursos."""
        self._adicionar_recomendacao(
            categoria=RecommendationCategory.RECURSOS,
            prioridade=RecommendationPriority.MEDIA,
            titulo="Alocação estratégica de recursos",
            diagnostico="Recursos são limitados e devem ser usados onde geram mais retorno.",
            recomendacao="Priorize investimento em digital e regiões com mais indecisos.",
            justificativa="ROI de campanha digital é maior e mensurável.",
            risco="Desperdiçar recursos em áreas de baixo retorno.",
            acoes=[
                "60% do orçamento de mídia em digital",
                "Geotargeting para regiões prioritárias",
                "Testes A/B de mensagens",
                "Monitoramento de métricas em tempo real"
            ],
            dificuldade=2
        )

    def get_sumario(self) -> str:
        """Gera sumário executivo das recomendações."""
        if not self.recomendacoes:
            return "Nenhuma recomendação gerada."

        criticas = [r for r in self.recomendacoes if r.prioridade == RecommendationPriority.CRITICA]
        altas = [r for r in self.recomendacoes if r.prioridade == RecommendationPriority.ALTA]

        sumario = []
        sumario.append(f"Total de {len(self.recomendacoes)} recomendações geradas.")
        sumario.append(f"{len(criticas)} de prioridade crítica, {len(altas)} de prioridade alta.")

        if criticas:
            sumario.append("\nRecomendações críticas:")
            for r in criticas:
                sumario.append(f"- {r.titulo}")

        return "\n".join(sumario)
