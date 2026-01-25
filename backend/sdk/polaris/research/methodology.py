# POLARIS SDK - Methodology
# Construtor de metodologias de pesquisa

from typing import Dict, Any, List, Optional
from ..models.research import (
    MethodologyDesign,
    MethodologyType,
    Paradigm,
    Approach,
    AnalysisTechnique,
    ValidityCheck,
    ReliabilityMeasures,
)


# Templates de metodologia pré-definidos
METHODOLOGY_TEMPLATES = {
    "pesquisa_eleitoral_quantitativa": {
        "tipo_pesquisa": MethodologyType.QUANTITATIVA,
        "paradigma": Paradigm.POSITIVISTA,
        "abordagem": Approach.SURVEY,
        "tecnicas_analise": [
            AnalysisTechnique.DESCRITIVA,
            AnalysisTechnique.INFERENCIAL,
        ],
        "descricao": "Pesquisa quantitativa tradicional com questionário estruturado"
    },
    "pesquisa_eleitoral_mista": {
        "tipo_pesquisa": MethodologyType.MISTA,
        "paradigma": Paradigm.PRAGMATICO,
        "abordagem": Approach.SURVEY,
        "tecnicas_analise": [
            AnalysisTechnique.DESCRITIVA,
            AnalysisTechnique.INFERENCIAL,
            AnalysisTechnique.QUALITATIVA,
        ],
        "descricao": "Pesquisa mista combinando dados quantitativos e qualitativos"
    },
    "pesquisa_exploratoria": {
        "tipo_pesquisa": MethodologyType.QUALITATIVA,
        "paradigma": Paradigm.INTERPRETATIVISTA,
        "abordagem": Approach.ESTUDO_CASO,
        "tecnicas_analise": [
            AnalysisTechnique.QUALITATIVA,
        ],
        "descricao": "Pesquisa exploratória qualitativa"
    },
    "pesquisa_preditiva": {
        "tipo_pesquisa": MethodologyType.QUANTITATIVA,
        "paradigma": Paradigm.POSITIVISTA,
        "abordagem": Approach.SURVEY,
        "tecnicas_analise": [
            AnalysisTechnique.DESCRITIVA,
            AnalysisTechnique.INFERENCIAL,
            AnalysisTechnique.MULTIVARIADA,
            AnalysisTechnique.PREDITIVA,
        ],
        "descricao": "Pesquisa com foco em projeções e previsões"
    }
}


class MethodologyBuilder:
    """
    Construtor de metodologias de pesquisa.

    Permite criar metodologias customizadas ou usar templates pré-definidos.
    """

    def __init__(self):
        self._tipo: MethodologyType = MethodologyType.MISTA
        self._paradigma: Paradigm = Paradigm.PRAGMATICO
        self._abordagem: Approach = Approach.SURVEY
        self._tecnicas: List[AnalysisTechnique] = []
        self._software: List[str] = ["Python/pandas", "scipy"]
        self._validade_interna: List[ValidityCheck] = []
        self._validade_externa: List[ValidityCheck] = []
        self._confiabilidade: Optional[ReliabilityMeasures] = None
        self._justificativa: str = ""

    @classmethod
    def from_template(cls, template_name: str) -> "MethodologyBuilder":
        """
        Cria builder a partir de template.

        Args:
            template_name: Nome do template

        Returns:
            Builder configurado
        """
        if template_name not in METHODOLOGY_TEMPLATES:
            raise ValueError(f"Template não encontrado: {template_name}")

        template = METHODOLOGY_TEMPLATES[template_name]
        builder = cls()
        builder._tipo = template["tipo_pesquisa"]
        builder._paradigma = template["paradigma"]
        builder._abordagem = template["abordagem"]
        builder._tecnicas = template["tecnicas_analise"]
        builder._justificativa = template["descricao"]

        return builder

    def set_tipo(self, tipo: MethodologyType) -> "MethodologyBuilder":
        """Define tipo de pesquisa."""
        self._tipo = tipo
        return self

    def set_paradigma(self, paradigma: Paradigm) -> "MethodologyBuilder":
        """Define paradigma."""
        self._paradigma = paradigma
        return self

    def set_abordagem(self, abordagem: Approach) -> "MethodologyBuilder":
        """Define abordagem."""
        self._abordagem = abordagem
        return self

    def add_tecnica_analise(self, tecnica: AnalysisTechnique) -> "MethodologyBuilder":
        """Adiciona técnica de análise."""
        if tecnica not in self._tecnicas:
            self._tecnicas.append(tecnica)
        return self

    def set_tecnicas_analise(self, tecnicas: List[AnalysisTechnique]) -> "MethodologyBuilder":
        """Define todas as técnicas de análise."""
        self._tecnicas = tecnicas
        return self

    def add_software(self, software: str) -> "MethodologyBuilder":
        """Adiciona software de análise."""
        if software not in self._software:
            self._software.append(software)
        return self

    def add_validade_interna(
        self,
        tipo: str,
        descricao: str,
        como_garantir: str
    ) -> "MethodologyBuilder":
        """Adiciona verificação de validade interna."""
        self._validade_interna.append(ValidityCheck(
            tipo=tipo,
            descricao=descricao,
            verificado=False,
            resultado=como_garantir
        ))
        return self

    def add_validade_externa(
        self,
        tipo: str,
        descricao: str,
        limitacoes: str
    ) -> "MethodologyBuilder":
        """Adiciona verificação de validade externa."""
        self._validade_externa.append(ValidityCheck(
            tipo=tipo,
            descricao=descricao,
            verificado=False,
            resultado=limitacoes
        ))
        return self

    def set_confiabilidade(
        self,
        alpha_cronbach: Optional[float] = None,
        teste_reteste: Optional[float] = None,
        split_half: Optional[float] = None
    ) -> "MethodologyBuilder":
        """Define medidas de confiabilidade."""
        self._confiabilidade = ReliabilityMeasures(
            alpha_cronbach=alpha_cronbach,
            teste_reteste=teste_reteste,
            split_half=split_half
        )
        return self

    def set_justificativa(self, justificativa: str) -> "MethodologyBuilder":
        """Define justificativa da metodologia."""
        self._justificativa = justificativa
        return self

    def build(self) -> MethodologyDesign:
        """
        Constrói a metodologia.

        Returns:
            Metodologia construída
        """
        # Validações básicas
        if not self._tecnicas:
            # Adicionar técnica padrão
            self._tecnicas.append(AnalysisTechnique.DESCRITIVA)

        # Adicionar validade padrão se não definida
        if not self._validade_interna:
            self._add_default_validade_interna()

        if not self._validade_externa:
            self._add_default_validade_externa()

        return MethodologyDesign(
            tipo_pesquisa=self._tipo,
            paradigma=self._paradigma,
            abordagem=self._abordagem,
            tecnicas_analise=self._tecnicas,
            software_analise=self._software,
            validade_interna=self._validade_interna,
            validade_externa=self._validade_externa,
            confiabilidade=self._confiabilidade,
            justificativa=self._justificativa
        )

    def _add_default_validade_interna(self) -> None:
        """Adiciona verificações de validade interna padrão."""
        self._validade_interna = [
            ValidityCheck(
                tipo="Controle de variáveis",
                descricao="Controle de variáveis intervenientes",
                verificado=False,
                resultado="Estratificação da amostra por variáveis demográficas"
            ),
            ValidityCheck(
                tipo="Consistência do instrumento",
                descricao="Verificação de consistência das respostas",
                verificado=False,
                resultado="Perguntas de controle e verificação de contradições"
            ),
        ]

    def _add_default_validade_externa(self) -> None:
        """Adiciona verificações de validade externa padrão."""
        self._validade_externa = [
            ValidityCheck(
                tipo="Representatividade",
                descricao="Representatividade da amostra",
                verificado=False,
                resultado="Amostragem estratificada proporcional"
            ),
            ValidityCheck(
                tipo="Generalização",
                descricao="Capacidade de generalização dos resultados",
                verificado=False,
                resultado="Limitada ao Distrito Federal para o período analisado"
            ),
        ]


def get_recommended_methodology(
    objetivo: str,
    tem_dados_qualitativos: bool = True,
    precisa_projecoes: bool = True
) -> MethodologyDesign:
    """
    Retorna metodologia recomendada baseada no objetivo.

    Args:
        objetivo: Objetivo da pesquisa
        tem_dados_qualitativos: Se incluirá dados qualitativos
        precisa_projecoes: Se precisa de projeções

    Returns:
        Metodologia recomendada
    """
    builder = MethodologyBuilder()

    if precisa_projecoes:
        builder = MethodologyBuilder.from_template("pesquisa_preditiva")
    elif tem_dados_qualitativos:
        builder = MethodologyBuilder.from_template("pesquisa_eleitoral_mista")
    else:
        builder = MethodologyBuilder.from_template("pesquisa_eleitoral_quantitativa")

    builder.set_justificativa(
        f"Metodologia selecionada para: {objetivo}. "
        f"{'Inclui análise qualitativa.' if tem_dados_qualitativos else ''} "
        f"{'Foco em projeções.' if precisa_projecoes else ''}"
    )

    return builder.build()
