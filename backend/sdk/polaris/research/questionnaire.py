# POLARIS SDK - Questionnaire
# Construtor de questionários de pesquisa

from typing import Dict, Any, List, Optional
from ..models.research import (
    Question,
    QuestionType,
    QuestionBlock,
    Questionnaire,
    ScaleConfig,
)


# Definições de tipos de pergunta
QUESTION_TYPES = {
    "escala_likert": {
        "descricao": "Escala de concordância de 5 a 7 pontos",
        "uso": "Atitudes, opiniões, satisfação",
        "config_padrao": ScaleConfig(
            min=1,
            max=5,
            rotulos=["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
        )
    },
    "multipla_escolha": {
        "descricao": "Seleção de uma entre múltiplas opções",
        "uso": "Preferências, comportamentos, escolhas",
        "max_opcoes": 7
    },
    "ranking": {
        "descricao": "Ordenação de itens por preferência",
        "uso": "Prioridades, importância relativa",
        "max_itens": 5
    },
    "aberta": {
        "descricao": "Resposta livre em texto",
        "uso": "Exploração, nuances, citações",
        "min_palavras": 10,
        "max_palavras": 200
    },
    "dicotomica": {
        "descricao": "Resposta sim/não",
        "uso": "Decisões binárias, filtros",
        "opcoes": ["Sim", "Não"]
    },
    "semantico_diferencial": {
        "descricao": "Escala entre dois polos opostos",
        "uso": "Percepções, imagens",
        "pontos": 7
    }
}

# Regras de construção
REGRAS_CONSTRUCAO = [
    "Evitar perguntas duplas (double-barreled)",
    "Evitar negativas duplas",
    "Usar linguagem simples e clara",
    "Evitar indução de resposta",
    "Ordenar do geral ao específico",
    "Incluir perguntas de controle",
    "Balancear escalas",
    "Randomizar ordem quando apropriado"
]


class QuestionnaireBuilder:
    """
    Construtor de questionários de pesquisa.

    Permite criar questionários estruturados seguindo
    boas práticas metodológicas.
    """

    def __init__(self, titulo: str):
        """
        Inicializa o construtor.

        Args:
            titulo: Título do questionário
        """
        self.titulo = titulo
        self.versao = "1.0"
        self.blocos: List[QuestionBlock] = []
        self._bloco_atual: Optional[QuestionBlock] = None
        self._contador_perguntas = 0

    def iniciar_bloco(
        self,
        nome: str,
        descricao: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Inicia um novo bloco de perguntas.

        Args:
            nome: Nome do bloco
            descricao: Descrição do bloco

        Returns:
            Self para encadeamento
        """
        bloco_id = f"B{len(self.blocos) + 1}"
        self._bloco_atual = QuestionBlock(
            id=bloco_id,
            nome=nome,
            descricao=descricao,
            perguntas=[]
        )
        return self

    def finalizar_bloco(self) -> "QuestionnaireBuilder":
        """
        Finaliza o bloco atual e adiciona ao questionário.

        Returns:
            Self para encadeamento
        """
        if self._bloco_atual:
            self.blocos.append(self._bloco_atual)
            self._bloco_atual = None
        return self

    def adicionar_pergunta_likert(
        self,
        texto: str,
        pontos: int = 5,
        rotulos: Optional[List[str]] = None,
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta tipo escala Likert.

        Args:
            texto: Texto da pergunta
            pontos: Número de pontos (5 ou 7)
            rotulos: Rótulos das âncoras
            instrucoes_ia: Instruções para a IA responder

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        if not rotulos:
            if pontos == 5:
                rotulos = ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
            else:
                rotulos = ["Discordo totalmente", "Discordo muito", "Discordo pouco",
                          "Neutro", "Concordo pouco", "Concordo muito", "Concordo totalmente"]

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.ESCALA_LIKERT,
            escala=ScaleConfig(min=1, max=pontos, rotulos=rotulos),
            instrucoes_ia=instrucoes_ia,
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_multipla_escolha(
        self,
        texto: str,
        opcoes: List[str],
        randomizar: bool = False,
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta de múltipla escolha.

        Args:
            texto: Texto da pergunta
            opcoes: Lista de opções
            randomizar: Se deve randomizar ordem
            instrucoes_ia: Instruções para a IA

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.MULTIPLA_ESCOLHA,
            opcoes=opcoes,
            randomizar_ordem=randomizar,
            instrucoes_ia=instrucoes_ia,
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_ranking(
        self,
        texto: str,
        itens: List[str],
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta de ranking.

        Args:
            texto: Texto da pergunta
            itens: Itens a ordenar
            instrucoes_ia: Instruções para a IA

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.RANKING,
            opcoes=itens,
            instrucoes_ia=instrucoes_ia,
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_aberta(
        self,
        texto: str,
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta aberta.

        Args:
            texto: Texto da pergunta
            instrucoes_ia: Instruções para a IA

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.ABERTA,
            instrucoes_ia=instrucoes_ia or "Responda naturalmente, expressando sua opinião genuína",
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_dicotomica(
        self,
        texto: str,
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta dicotômica (sim/não).

        Args:
            texto: Texto da pergunta
            instrucoes_ia: Instruções para a IA

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.DICOTOMICA,
            opcoes=["Sim", "Não"],
            instrucoes_ia=instrucoes_ia,
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_semantico_diferencial(
        self,
        texto: str,
        polo_negativo: str,
        polo_positivo: str,
        pontos: int = 7,
        instrucoes_ia: str = ""
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta de diferencial semântico.

        Args:
            texto: Texto da pergunta
            polo_negativo: Rótulo do polo negativo
            polo_positivo: Rótulo do polo positivo
            pontos: Número de pontos na escala
            instrucoes_ia: Instruções para a IA

        Returns:
            Self para encadeamento
        """
        self._contador_perguntas += 1

        pergunta = Question(
            id=f"Q{self._contador_perguntas}",
            texto=texto,
            tipo=QuestionType.SEMANTICO_DIFERENCIAL,
            escala=ScaleConfig(
                min=1,
                max=pontos,
                rotulos=[polo_negativo, polo_positivo]
            ),
            instrucoes_ia=instrucoes_ia,
            bloco_id=self._bloco_atual.id if self._bloco_atual else None
        )

        self._adicionar_ao_bloco(pergunta)
        return self

    def adicionar_pergunta_customizada(
        self,
        pergunta: Question
    ) -> "QuestionnaireBuilder":
        """
        Adiciona pergunta customizada.

        Args:
            pergunta: Pergunta já construída

        Returns:
            Self para encadeamento
        """
        if not pergunta.id:
            self._contador_perguntas += 1
            pergunta.id = f"Q{self._contador_perguntas}"

        self._adicionar_ao_bloco(pergunta)
        return self

    def _adicionar_ao_bloco(self, pergunta: Question) -> None:
        """Adiciona pergunta ao bloco atual."""
        if self._bloco_atual:
            self._bloco_atual.perguntas.append(pergunta)
        else:
            # Criar bloco padrão
            if not self.blocos:
                self.iniciar_bloco("Geral", "Perguntas gerais")
            else:
                self._bloco_atual = self.blocos[-1]
            self._bloco_atual.perguntas.append(pergunta)

    def build(self) -> Questionnaire:
        """
        Constrói o questionário.

        Returns:
            Questionário construído
        """
        # Finalizar bloco atual se existir
        if self._bloco_atual:
            self.finalizar_bloco()

        # Calcular tempo estimado (média de 30 segundos por pergunta)
        total_perguntas = sum(len(b.perguntas) for b in self.blocos)
        tempo_estimado = max(5, total_perguntas // 2)

        return Questionnaire(
            titulo=self.titulo,
            versao=self.versao,
            blocos=self.blocos,
            tempo_estimado_minutos=tempo_estimado
        )


def criar_questionario_eleitoral_padrao(
    candidatos: List[str],
    temas_prioritarios: Optional[List[str]] = None
) -> Questionnaire:
    """
    Cria questionário eleitoral padrão.

    Args:
        candidatos: Lista de candidatos
        temas_prioritarios: Temas a incluir (opcional)

    Returns:
        Questionário construído
    """
    if not temas_prioritarios:
        temas_prioritarios = [
            "Segurança pública",
            "Saúde",
            "Educação",
            "Emprego e economia",
            "Transporte",
            "Meio ambiente"
        ]

    builder = QuestionnaireBuilder("Pesquisa Eleitoral")

    # Bloco 1: Aquecimento
    builder.iniciar_bloco("Aquecimento", "Perguntas introdutórias")
    builder.adicionar_pergunta_likert(
        "De modo geral, você diria que acompanha notícias sobre política...",
        pontos=5,
        rotulos=["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"],
        instrucoes_ia="Considerar interesse_politico do perfil"
    )
    builder.finalizar_bloco()

    # Bloco 2: Avaliação do Governo
    builder.iniciar_bloco("Avaliação Governo Atual", "Avaliação do governo")
    builder.adicionar_pergunta_likert(
        "Como você avalia o atual governo do Distrito Federal?",
        pontos=5,
        rotulos=["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"],
        instrucoes_ia="Considerar orientacao_politica e posicao_bolsonaro"
    )
    builder.adicionar_pergunta_aberta(
        "O que você considera o principal problema do DF atualmente?",
        instrucoes_ia="Responder baseado em preocupacoes e valores do perfil"
    )
    builder.finalizar_bloco()

    # Bloco 3: Intenção de Voto
    opcoes_voto = candidatos + ["Outro", "Nenhum/Branco/Nulo", "Indeciso"]

    builder.iniciar_bloco("Intenção de Voto", "Preferência eleitoral")
    builder.adicionar_pergunta_multipla_escolha(
        "Se a eleição para Governador do DF fosse hoje, em quem você votaria?",
        opcoes=opcoes_voto,
        randomizar=True,
        instrucoes_ia="Considerar orientacao_politica, posicao_bolsonaro, valores e estilo_decisao"
    )
    builder.adicionar_pergunta_likert(
        "Qual a probabilidade de você mudar seu voto até a eleição?",
        pontos=5,
        rotulos=["Nenhuma", "Baixa", "Média", "Alta", "Muito alta"],
        instrucoes_ia="Considerar tolerancia_nuance e estilo_decisao"
    )
    builder.finalizar_bloco()

    # Bloco 4: Rejeição
    builder.iniciar_bloco("Rejeição", "Candidatos rejeitados")
    builder.adicionar_pergunta_multipla_escolha(
        "Em qual candidato você NÃO votaria de jeito nenhum?",
        opcoes=candidatos + ["Nenhum", "Rejeitaria todos"],
        instrucoes_ia="Considerar valores, medos e vieses_cognitivos"
    )
    builder.adicionar_pergunta_aberta(
        "Por que você rejeita este candidato?",
        instrucoes_ia="Expressar motivações genuínas baseadas no perfil"
    )
    builder.finalizar_bloco()

    # Bloco 5: Temas Prioritários
    builder.iniciar_bloco("Temas Prioritários", "Prioridades do eleitor")
    builder.adicionar_pergunta_ranking(
        "Ordene os seguintes temas por importância para sua decisão de voto:",
        itens=temas_prioritarios[:5],
        instrucoes_ia="Ordenar baseado em preocupacoes e valores do perfil"
    )
    builder.finalizar_bloco()

    # Bloco 6: Encerramento
    builder.iniciar_bloco("Encerramento", "Perguntas finais")
    builder.adicionar_pergunta_aberta(
        "Há algo mais que gostaria de comentar sobre as eleições?",
        instrucoes_ia="Fazer comentário opcional que reflita o perfil"
    )
    builder.finalizar_bloco()

    return builder.build()
