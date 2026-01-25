# POLARIS SDK - Qualitative Analysis
# Análises qualitativas de conteúdo

import re
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter

from ..models.report import ContentAnalysis, Category, SentimentAnalysis, SentimentDistribution
from ..models.response import EmotionType


# Stop words em português
STOP_WORDS_PT = {
    "a", "o", "e", "de", "da", "do", "que", "em", "para", "com", "não", "uma",
    "um", "os", "as", "dos", "das", "no", "na", "por", "mais", "se", "como",
    "mas", "ao", "ele", "ela", "entre", "era", "depois", "sem", "mesmo",
    "aos", "ter", "seus", "sua", "ou", "ser", "quando", "muito", "há",
    "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até",
    "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "foi",
    "esse", "essa", "num", "nem", "suas", "meu", "minha", "tem", "numa",
    "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho",
    "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele"
}


class QualitativeAnalyzer:
    """
    Analisador de dados qualitativos.

    Realiza análise de conteúdo temática e análise de sentimento.
    """

    def __init__(self, respostas: List[Dict[str, Any]]):
        """
        Inicializa o analisador.

        Args:
            respostas: Lista de respostas coletadas
        """
        self.respostas = respostas

    def analise_conteudo(
        self,
        pergunta_id: str,
        min_frequencia: int = 2
    ) -> ContentAnalysis:
        """
        Realiza análise de conteúdo para respostas abertas.

        Args:
            pergunta_id: ID da pergunta
            min_frequencia: Frequência mínima para incluir categoria

        Returns:
            Análise de conteúdo
        """
        # Filtrar respostas da pergunta
        textos = [
            r.get("resposta_texto", "")
            for r in self.respostas
            if r.get("pergunta_id") == pergunta_id
        ]

        analise = ContentAnalysis(
            pergunta_id=pergunta_id,
            total_respostas=len(textos)
        )

        if not textos:
            return analise

        # Extrair palavras frequentes
        todas_palavras = []
        for texto in textos:
            palavras = self._extrair_palavras(texto)
            todas_palavras.extend(palavras)

        contagem_palavras = Counter(todas_palavras)
        analise.palavras_frequentes = {
            palavra: count
            for palavra, count in contagem_palavras.most_common(50)
            if count >= min_frequencia
        }

        # Categorizar temas (simplificado - em produção, usar Claude)
        categorias = self._categorizar_temas(textos)
        analise.categorias = categorias

        # Selecionar citações representativas
        analise.citacoes_positivas = self._selecionar_citacoes(textos, "positivo")[:3]
        analise.citacoes_negativas = self._selecionar_citacoes(textos, "negativo")[:3]
        analise.citacoes_neutras = self._selecionar_citacoes(textos, "neutro")[:3]

        return analise

    def _extrair_palavras(self, texto: str) -> List[str]:
        """Extrai palavras significativas do texto."""
        # Limpar e tokenizar
        texto = texto.lower()
        texto = re.sub(r'[^\w\s]', '', texto)
        palavras = texto.split()

        # Remover stop words e palavras muito curtas
        palavras = [
            p for p in palavras
            if p not in STOP_WORDS_PT and len(p) > 2
        ]

        return palavras

    def _categorizar_temas(
        self,
        textos: List[str]
    ) -> List[Category]:
        """
        Categoriza textos por temas (implementação simplificada).

        Em produção, usar Claude para categorização mais sofisticada.
        """
        # Temas políticos comuns
        temas = {
            "seguranca": ["segurança", "violência", "crime", "polícia", "bandido"],
            "saude": ["saúde", "hospital", "médico", "atendimento", "sus"],
            "educacao": ["educação", "escola", "professor", "ensino", "universidade"],
            "emprego": ["emprego", "trabalho", "desemprego", "salário", "renda"],
            "corrupcao": ["corrupção", "corrupto", "roubo", "ladrão", "desvio"],
            "transporte": ["transporte", "ônibus", "metrô", "trânsito", "mobilidade"],
            "economia": ["economia", "preço", "inflação", "custo", "caro"],
            "moradia": ["moradia", "casa", "aluguel", "habitação", "morar"]
        }

        contagem_temas: Dict[str, List[str]] = {tema: [] for tema in temas}

        for texto in textos:
            texto_lower = texto.lower()
            for tema, palavras_chave in temas.items():
                if any(palavra in texto_lower for palavra in palavras_chave):
                    contagem_temas[tema].append(texto)

        # Criar categorias
        total = len(textos)
        categorias = []

        for tema, textos_tema in contagem_temas.items():
            if textos_tema:
                cat = Category(
                    nome=tema.capitalize(),
                    frequencia=len(textos_tema),
                    percentual=round(len(textos_tema) / total * 100, 2) if total > 0 else 0,
                    citacoes=textos_tema[:3]
                )
                categorias.append(cat)

        # Ordenar por frequência
        categorias.sort(key=lambda x: x.frequencia, reverse=True)

        return categorias

    def _selecionar_citacoes(
        self,
        textos: List[str],
        tipo: str
    ) -> List[str]:
        """
        Seleciona citações representativas por tipo.

        Args:
            textos: Lista de textos
            tipo: Tipo de citação (positivo, negativo, neutro)

        Returns:
            Lista de citações
        """
        palavras_positivas = {"bom", "ótimo", "excelente", "melhor", "esperança", "confiança"}
        palavras_negativas = {"ruim", "péssimo", "pior", "medo", "preocupação", "raiva"}

        selecionadas = []

        for texto in textos:
            texto_lower = texto.lower()
            tem_positivo = any(p in texto_lower for p in palavras_positivas)
            tem_negativo = any(p in texto_lower for p in palavras_negativas)

            if tipo == "positivo" and tem_positivo and not tem_negativo:
                selecionadas.append(texto)
            elif tipo == "negativo" and tem_negativo and not tem_positivo:
                selecionadas.append(texto)
            elif tipo == "neutro" and not tem_positivo and not tem_negativo:
                selecionadas.append(texto)

        # Selecionar citações de tamanho médio (mais informativas)
        selecionadas.sort(key=lambda x: abs(len(x) - 100))

        return selecionadas[:5]

    def analise_sentimento(self) -> SentimentAnalysis:
        """
        Analisa sentimentos das respostas.

        Usa dados de fluxo cognitivo se disponíveis.

        Returns:
            Análise de sentimento
        """
        total = len(self.respostas)

        analise = SentimentAnalysis(
            total_respostas=total,
            positivo=0,
            neutro=0,
            negativo=0
        )

        if total == 0:
            return analise

        # Extrair emoções do fluxo cognitivo
        emocoes = []
        intensidades = []

        for resp in self.respostas:
            fluxo = resp.get("fluxo_cognitivo", {})
            emocao_data = fluxo.get("emocao", {})

            emocao = emocao_data.get("emocao_primaria")
            intensidade = emocao_data.get("intensidade", 5)

            if emocao:
                emocoes.append(emocao)
                intensidades.append(intensidade)

        if not emocoes:
            # Fallback: análise por palavras
            return self._analise_sentimento_por_texto()

        # Classificar sentimentos
        emocoes_positivas = {"alegria", "esperanca"}
        emocoes_negativas = {"raiva", "medo", "tristeza", "nojo", "frustacao", "desconfianca"}
        emocoes_neutras = {"surpresa", "indiferenca"}

        contagem_sentimento = {"positivo": 0, "negativo": 0, "neutro": 0}

        for emocao in emocoes:
            if emocao in emocoes_positivas:
                contagem_sentimento["positivo"] += 1
            elif emocao in emocoes_negativas:
                contagem_sentimento["negativo"] += 1
            else:
                contagem_sentimento["neutro"] += 1

        analise.positivo = round(contagem_sentimento["positivo"] / total * 100, 2)
        analise.negativo = round(contagem_sentimento["negativo"] / total * 100, 2)
        analise.neutro = round(contagem_sentimento["neutro"] / total * 100, 2)

        # Distribuição por emoção
        contagem_emocoes = Counter(emocoes)
        analise.distribuicao_emocoes = [
            SentimentDistribution(
                emocao=emocao,
                frequencia=count,
                percentual=round(count / total * 100, 2),
                intensidade_media=self._calcular_intensidade_media(emocao, emocoes, intensidades)
            )
            for emocao, count in contagem_emocoes.most_common()
        ]

        # Intensidade média geral
        if intensidades:
            analise.intensidade_media_geral = round(sum(intensidades) / len(intensidades), 2)

        return analise

    def _calcular_intensidade_media(
        self,
        emocao_alvo: str,
        emocoes: List[str],
        intensidades: List[int]
    ) -> float:
        """Calcula intensidade média para uma emoção específica."""
        valores = [
            intensidades[i]
            for i, e in enumerate(emocoes)
            if e == emocao_alvo
        ]
        return round(sum(valores) / len(valores), 2) if valores else 0.0

    def _analise_sentimento_por_texto(self) -> SentimentAnalysis:
        """Fallback: análise de sentimento por palavras."""
        palavras_positivas = {
            "bom", "ótimo", "excelente", "melhor", "esperança", "confiança",
            "satisfeito", "feliz", "apoio", "concordo", "correto"
        }
        palavras_negativas = {
            "ruim", "péssimo", "pior", "medo", "preocupação", "raiva",
            "insatisfeito", "triste", "contra", "discordo", "errado"
        }

        total = len(self.respostas)
        contagem = {"positivo": 0, "negativo": 0, "neutro": 0}

        for resp in self.respostas:
            texto = resp.get("resposta_texto", "").lower()

            tem_positivo = any(p in texto for p in palavras_positivas)
            tem_negativo = any(p in texto for p in palavras_negativas)

            if tem_positivo and not tem_negativo:
                contagem["positivo"] += 1
            elif tem_negativo and not tem_positivo:
                contagem["negativo"] += 1
            else:
                contagem["neutro"] += 1

        return SentimentAnalysis(
            total_respostas=total,
            positivo=round(contagem["positivo"] / total * 100, 2) if total > 0 else 0,
            negativo=round(contagem["negativo"] / total * 100, 2) if total > 0 else 0,
            neutro=round(contagem["neutro"] / total * 100, 2) if total > 0 else 0
        )

    def extrair_gatilhos_emocionais(self) -> List[Dict[str, Any]]:
        """
        Extrai gatilhos emocionais das respostas.

        Returns:
            Lista de gatilhos identificados
        """
        gatilhos_contagem: Dict[str, Dict[str, int]] = {}

        for resp in self.respostas:
            fluxo = resp.get("fluxo_cognitivo", {})
            emocao_data = fluxo.get("emocao", {})

            emocao = emocao_data.get("emocao_primaria", "indiferenca")
            gatilhos = emocao_data.get("gatilhos", [])

            for gatilho in gatilhos:
                if gatilho not in gatilhos_contagem:
                    gatilhos_contagem[gatilho] = Counter()
                gatilhos_contagem[gatilho][emocao] += 1

        # Formatar resultado
        resultado = []
        for gatilho, emocoes in gatilhos_contagem.items():
            emocao_predominante = emocoes.most_common(1)[0][0] if emocoes else "indiferenca"
            resultado.append({
                "gatilho": gatilho,
                "frequencia": sum(emocoes.values()),
                "emocao_predominante": emocao_predominante,
                "distribuicao_emocoes": dict(emocoes)
            })

        resultado.sort(key=lambda x: x["frequencia"], reverse=True)
        return resultado[:20]

    def nuvem_palavras_data(
        self,
        pergunta_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Gera dados para nuvem de palavras.

        Args:
            pergunta_id: ID da pergunta (opcional, usa todas se não fornecido)

        Returns:
            Lista de palavras com frequências
        """
        if pergunta_id:
            textos = [
                r.get("resposta_texto", "")
                for r in self.respostas
                if r.get("pergunta_id") == pergunta_id
            ]
        else:
            textos = [r.get("resposta_texto", "") for r in self.respostas]

        todas_palavras = []
        for texto in textos:
            palavras = self._extrair_palavras(texto)
            todas_palavras.extend(palavras)

        contagem = Counter(todas_palavras)

        return [
            {"text": palavra, "value": count}
            for palavra, count in contagem.most_common(100)
        ]
