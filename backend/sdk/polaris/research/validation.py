# POLARIS SDK - Validation
# Validação científica de pesquisas

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from ..models.research import (
    ProblemDefinition,
    MethodologyDesign,
    Questionnaire,
    Question,
    QuestionType,
)
from ..models.sample import SamplingStrategy, SelectedSample


class ValidationLevel(str, Enum):
    """Níveis de validação."""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ValidationIssue:
    """Problema de validação."""
    level: ValidationLevel
    category: str
    message: str
    suggestion: str = ""


class ResearchValidator:
    """
    Validador de pesquisas eleitorais.

    Verifica conformidade com padrões científicos.
    """

    def __init__(self):
        self.issues: List[ValidationIssue] = []

    def validar_problematica(
        self,
        problematica: ProblemDefinition
    ) -> List[ValidationIssue]:
        """
        Valida definição da problemática.

        Args:
            problematica: Problemática a validar

        Returns:
            Lista de problemas encontrados
        """
        issues = []

        # Verificar tema
        if not problematica.tema_central or len(problematica.tema_central) < 10:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="problematica",
                message="Tema central muito curto ou ausente",
                suggestion="Forneça um tema descritivo com pelo menos 10 caracteres"
            ))

        # Verificar problema de pesquisa
        if not problematica.problema_pesquisa:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="problematica",
                message="Problema de pesquisa não definido",
                suggestion="Formule uma questão central de pesquisa"
            ))
        elif "?" not in problematica.problema_pesquisa:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="problematica",
                message="Problema de pesquisa não está em forma de pergunta",
                suggestion="Reformule como uma questão científica"
            ))

        # Verificar perguntas de pesquisa
        if len(problematica.perguntas_pesquisa) < 3:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="problematica",
                message="Poucas perguntas de pesquisa",
                suggestion="Recomenda-se ter pelo menos 3-5 perguntas derivadas"
            ))

        # Verificar hipóteses
        if not problematica.hipoteses:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="problematica",
                message="Nenhuma hipótese definida",
                suggestion="Formule hipóteses testáveis para a pesquisa"
            ))

        for h in problematica.hipoteses:
            if not h.variavel_independente or not h.variavel_dependente:
                issues.append(ValidationIssue(
                    level=ValidationLevel.ERROR,
                    category="hipoteses",
                    message=f"Hipótese {h.id} sem variáveis definidas",
                    suggestion="Defina variável independente e dependente"
                ))

        # Verificar objetivos
        if not problematica.objetivos.geral:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="objetivos",
                message="Objetivo geral não definido",
                suggestion="Defina o objetivo geral da pesquisa"
            ))

        if len(problematica.objetivos.especificos) < 2:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="objetivos",
                message="Poucos objetivos específicos",
                suggestion="Defina pelo menos 2-3 objetivos específicos"
            ))

        return issues

    def validar_metodologia(
        self,
        metodologia: MethodologyDesign
    ) -> List[ValidationIssue]:
        """
        Valida desenho metodológico.

        Args:
            metodologia: Metodologia a validar

        Returns:
            Lista de problemas encontrados
        """
        issues = []

        # Verificar técnicas de análise
        if not metodologia.tecnicas_analise:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="metodologia",
                message="Nenhuma técnica de análise definida",
                suggestion="Defina as técnicas de análise a serem utilizadas"
            ))

        # Verificar coerência entre tipo e paradigma
        from ..models.research import MethodologyType, Paradigm

        if (metodologia.tipo_pesquisa == MethodologyType.QUALITATIVA and
            metodologia.paradigma == Paradigm.POSITIVISTA):
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="metodologia",
                message="Pesquisa qualitativa com paradigma positivista pode ser incoerente",
                suggestion="Considere paradigma interpretativista ou pragmático"
            ))

        # Verificar validade
        if not metodologia.validade_interna:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="validade",
                message="Medidas de validade interna não definidas",
                suggestion="Defina como garantir a validade interna"
            ))

        return issues

    def validar_amostragem(
        self,
        estrategia: SamplingStrategy,
        populacao_total: int
    ) -> List[ValidationIssue]:
        """
        Valida estratégia de amostragem.

        Args:
            estrategia: Estratégia a validar
            populacao_total: Tamanho da população

        Returns:
            Lista de problemas encontrados
        """
        issues = []

        # Verificar tamanho da amostra
        if estrategia.tamanho_amostra <= 0:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="amostragem",
                message="Tamanho da amostra inválido",
                suggestion="Calcule o tamanho amostral adequado"
            ))
        elif estrategia.tamanho_amostra < 30:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="amostragem",
                message="Amostra muito pequena para análises estatísticas robustas",
                suggestion="Recomenda-se amostra de pelo menos 30 elementos"
            ))

        # Verificar proporção
        if populacao_total > 0:
            proporcao = estrategia.tamanho_amostra / populacao_total
            if proporcao > 0.8:
                issues.append(ValidationIssue(
                    level=ValidationLevel.INFO,
                    category="amostragem",
                    message="Amostra representa mais de 80% da população",
                    suggestion="Considere realizar censo completo"
                ))

        # Verificar variáveis de estratificação
        from ..models.sample import SamplingType

        if estrategia.tipo in [SamplingType.ESTRATIFICADA_PROPORCIONAL,
                               SamplingType.ESTRATIFICADA_OTIMA]:
            if not estrategia.variaveis_estratificacao:
                issues.append(ValidationIssue(
                    level=ValidationLevel.ERROR,
                    category="amostragem",
                    message="Amostragem estratificada sem variáveis de estratificação",
                    suggestion="Defina as variáveis para estratificação"
                ))

        return issues

    def validar_questionario(
        self,
        questionario: Questionnaire
    ) -> List[ValidationIssue]:
        """
        Valida questionário.

        Args:
            questionario: Questionário a validar

        Returns:
            Lista de problemas encontrados
        """
        issues = []

        # Verificar se há perguntas
        if questionario.total_perguntas == 0:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="questionario",
                message="Questionário sem perguntas",
                suggestion="Adicione perguntas ao questionário"
            ))
            return issues

        # Verificar tamanho
        if questionario.total_perguntas > 50:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="questionario",
                message="Questionário muito longo (> 50 perguntas)",
                suggestion="Considere reduzir para evitar fadiga do respondente"
            ))

        # Verificar tempo estimado
        if questionario.tempo_estimado_minutos > 30:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="questionario",
                message="Tempo estimado muito longo (> 30 minutos)",
                suggestion="Questionários longos têm maior taxa de abandono"
            ))

        # Verificar cada pergunta
        ids_vistos = set()
        for pergunta in questionario.todas_perguntas:
            pergunta_issues = self._validar_pergunta(pergunta)
            issues.extend(pergunta_issues)

            # Verificar IDs duplicados
            if pergunta.id in ids_vistos:
                issues.append(ValidationIssue(
                    level=ValidationLevel.ERROR,
                    category="questionario",
                    message=f"ID de pergunta duplicado: {pergunta.id}",
                    suggestion="Use IDs únicos para cada pergunta"
                ))
            ids_vistos.add(pergunta.id)

        # Verificar variedade de tipos
        tipos = [p.tipo for p in questionario.todas_perguntas]
        tipos_unicos = set(tipos)
        if len(tipos_unicos) == 1:
            issues.append(ValidationIssue(
                level=ValidationLevel.INFO,
                category="questionario",
                message="Questionário usa apenas um tipo de pergunta",
                suggestion="Considere variar os tipos para maior engajamento"
            ))

        # Verificar se há perguntas abertas para análise qualitativa
        if QuestionType.ABERTA not in tipos_unicos:
            issues.append(ValidationIssue(
                level=ValidationLevel.INFO,
                category="questionario",
                message="Sem perguntas abertas para análise qualitativa",
                suggestion="Perguntas abertas podem revelar insights valiosos"
            ))

        return issues

    def _validar_pergunta(self, pergunta: Question) -> List[ValidationIssue]:
        """Valida uma pergunta individual."""
        issues = []

        # Verificar texto
        if not pergunta.texto:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="pergunta",
                message=f"Pergunta {pergunta.id} sem texto",
                suggestion="Defina o texto da pergunta"
            ))
            return issues

        # Verificar tamanho do texto
        if len(pergunta.texto) > 500:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="pergunta",
                message=f"Pergunta {pergunta.id} muito longa ({len(pergunta.texto)} caracteres)",
                suggestion="Simplifique o texto da pergunta"
            ))

        # Verificar perguntas duplas
        if " e " in pergunta.texto.lower() and "?" in pergunta.texto:
            issues.append(ValidationIssue(
                level=ValidationLevel.WARNING,
                category="pergunta",
                message=f"Pergunta {pergunta.id} pode ser dupla (double-barreled)",
                suggestion="Evite perguntar duas coisas em uma única pergunta"
            ))

        # Verificar opções para múltipla escolha
        if pergunta.tipo == QuestionType.MULTIPLA_ESCOLHA:
            if not pergunta.opcoes:
                issues.append(ValidationIssue(
                    level=ValidationLevel.ERROR,
                    category="pergunta",
                    message=f"Pergunta {pergunta.id} sem opções de resposta",
                    suggestion="Defina as opções de resposta"
                ))
            elif len(pergunta.opcoes) > 10:
                issues.append(ValidationIssue(
                    level=ValidationLevel.WARNING,
                    category="pergunta",
                    message=f"Pergunta {pergunta.id} com muitas opções ({len(pergunta.opcoes)})",
                    suggestion="Recomenda-se no máximo 7 opções"
                ))

        # Verificar escala Likert
        if pergunta.tipo == QuestionType.ESCALA_LIKERT:
            if not pergunta.escala:
                issues.append(ValidationIssue(
                    level=ValidationLevel.ERROR,
                    category="pergunta",
                    message=f"Pergunta {pergunta.id} Likert sem configuração de escala",
                    suggestion="Defina a configuração da escala"
                ))

        return issues

    def validar_amostra(
        self,
        amostra: SelectedSample,
        populacao: List[Dict[str, Any]],
        tolerancia: float = 0.05
    ) -> List[ValidationIssue]:
        """
        Valida amostra selecionada.

        Args:
            amostra: Amostra a validar
            populacao: Lista de eleitores da população
            tolerancia: Tolerância para diferenças de proporção

        Returns:
            Lista de problemas encontrados
        """
        issues = []

        # Verificar tamanho
        if amostra.total_selecionados == 0:
            issues.append(ValidationIssue(
                level=ValidationLevel.ERROR,
                category="amostra",
                message="Amostra vazia",
                suggestion="Selecione eleitores para a amostra"
            ))
            return issues

        # Verificar representatividade (implementação simplificada)
        if not amostra.representa_populacao:
            for erro in amostra.erros_proporcao:
                issues.append(ValidationIssue(
                    level=ValidationLevel.WARNING,
                    category="amostra",
                    message=erro,
                    suggestion="Ajuste a seleção para melhor representatividade"
                ))

        return issues

    def validar_pesquisa_completa(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        estrategia: SamplingStrategy,
        questionario: Questionnaire,
        populacao_total: int
    ) -> Dict[str, Any]:
        """
        Valida toda a pesquisa.

        Args:
            problematica: Definição da problemática
            metodologia: Desenho metodológico
            estrategia: Estratégia de amostragem
            questionario: Questionário
            populacao_total: Tamanho da população

        Returns:
            Relatório de validação
        """
        all_issues = []

        # Validar cada componente
        all_issues.extend(self.validar_problematica(problematica))
        all_issues.extend(self.validar_metodologia(metodologia))
        all_issues.extend(self.validar_amostragem(estrategia, populacao_total))
        all_issues.extend(self.validar_questionario(questionario))

        # Classificar por nível
        errors = [i for i in all_issues if i.level == ValidationLevel.ERROR]
        warnings = [i for i in all_issues if i.level == ValidationLevel.WARNING]
        infos = [i for i in all_issues if i.level == ValidationLevel.INFO]

        return {
            "valida": len(errors) == 0,
            "total_issues": len(all_issues),
            "errors": len(errors),
            "warnings": len(warnings),
            "infos": len(infos),
            "issues": [
                {
                    "level": i.level.value,
                    "category": i.category,
                    "message": i.message,
                    "suggestion": i.suggestion
                }
                for i in all_issues
            ]
        }
