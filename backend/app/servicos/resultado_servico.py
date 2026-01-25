"""
Serviço de Resultados e Análises

Lógica de negócio para análise de resultados de entrevistas.
"""

import json
import math
import re
import uuid
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.servicos.eleitor_helper import obter_eleitores_por_ids
from app.servicos.entrevista_servico import obter_entrevista_servico


class ResultadoServico:
    """Serviço para análise de resultados"""

    def __init__(self, caminho_dados: Optional[str] = None):
        if caminho_dados is None:
            base_path = Path(__file__).parent.parent.parent.parent
            self.caminho_dados = base_path / "memorias" / "resultados.json"
        else:
            self.caminho_dados = Path(caminho_dados)
        self._resultados: List[Dict[str, Any]] = []
        self._carregar_dados()

    def _carregar_dados(self):
        """Carrega resultados do arquivo JSON"""
        if self.caminho_dados.exists():
            with open(self.caminho_dados, "r", encoding="utf-8") as f:
                self._resultados = json.load(f)
        else:
            self._resultados = []

    def _salvar_dados(self):
        """Salva resultados no arquivo JSON"""
        self.caminho_dados.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_dados, "w", encoding="utf-8") as f:
            json.dump(self._resultados, f, ensure_ascii=False, indent=2, default=str)

    def _gerar_id(self) -> str:
        """Gera ID único"""
        return f"res-{uuid.uuid4().hex[:8]}"

    # ============================================
    # ANÁLISES ESTATÍSTICAS
    # ============================================

    def _calcular_estatisticas_descritivas(
        self, valores: List[float], variavel: str
    ) -> Dict[str, Any]:
        """Calcula estatísticas descritivas"""
        if not valores:
            return {"variavel": variavel, "erro": "Sem dados"}

        n = len(valores)
        valores_sorted = sorted(valores)

        # Média
        media = sum(valores) / n

        # Mediana
        if n % 2 == 0:
            mediana = (valores_sorted[n // 2 - 1] + valores_sorted[n // 2]) / 2
        else:
            mediana = valores_sorted[n // 2]

        # Moda
        contagem = Counter(valores)
        moda = contagem.most_common(1)[0][0]

        # Desvio padrão
        variancia = sum((x - media) ** 2 for x in valores) / n
        desvio_padrao = math.sqrt(variancia)

        # Quartis
        q1_idx = int(n * 0.25)
        q2_idx = int(n * 0.5)
        q3_idx = int(n * 0.75)

        return {
            "variavel": variavel,
            "media": round(media, 2),
            "mediana": round(mediana, 2),
            "moda": moda,
            "desvio_padrao": round(desvio_padrao, 2),
            "variancia": round(variancia, 2),
            "minimo": min(valores),
            "maximo": max(valores),
            "q1": valores_sorted[q1_idx],
            "q2": valores_sorted[q2_idx],
            "q3": valores_sorted[q3_idx],
            "amplitude": max(valores) - min(valores),
            "coeficiente_variacao": (round((desvio_padrao / media) * 100, 2) if media != 0 else 0),
        }

    def _calcular_distribuicao(self, valores: List[Any], total: int) -> List[Dict[str, Any]]:
        """Calcula distribuição de valores"""
        contagem = Counter(valores)
        return [
            {
                "categoria": str(cat),
                "quantidade": qtd,
                "percentual": round(qtd / total * 100, 1),
            }
            for cat, qtd in contagem.most_common()
        ]

    def _calcular_correlacao(
        self, x: List[float], y: List[float], var1: str, var2: str
    ) -> Optional[Dict[str, Any]]:
        """Calcula correlação de Pearson"""
        if len(x) != len(y) or len(x) < 3:
            return None

        n = len(x)
        media_x = sum(x) / n
        media_y = sum(y) / n

        # Covariância
        cov = sum((x[i] - media_x) * (y[i] - media_y) for i in range(n)) / n

        # Desvios padrão
        std_x = math.sqrt(sum((xi - media_x) ** 2 for xi in x) / n)
        std_y = math.sqrt(sum((yi - media_y) ** 2 for yi in y) / n)

        if std_x == 0 or std_y == 0:
            return None

        # Correlação de Pearson
        r = cov / (std_x * std_y)
        r_quadrado = r**2

        # P-valor simplificado (seria necessário scipy para cálculo preciso)
        # Usando aproximação
        t = r * math.sqrt((n - 2) / (1 - r**2)) if abs(r) < 1 else 0
        p_valor = 0.05 if abs(t) > 2 else 0.1 if abs(t) > 1.5 else 0.5

        # Significância
        if p_valor < 0.01:
            significancia = "alta"
        elif p_valor < 0.05:
            significancia = "media"
        else:
            significancia = "baixa"

        # Interpretação
        if abs(r) > 0.7:
            forca = "forte"
        elif abs(r) > 0.4:
            forca = "moderada"
        else:
            forca = "fraca"

        direcao = "positiva" if r > 0 else "negativa"

        return {
            "variavel1": var1,
            "variavel2": var2,
            "coeficiente_pearson": round(r, 3),
            "r_quadrado": round(r_quadrado, 3),
            "p_valor": round(p_valor, 3),
            "significancia": significancia,
            "interpretacao": f"Correlação {forca} {direcao} entre {var1} e {var2}",
        }

    # ============================================
    # ANÁLISES QUALITATIVAS
    # ============================================

    def _analisar_sentimento(self, texto: str) -> Dict[str, Any]:
        """Análise básica de sentimento"""
        texto_lower = texto.lower()

        # Palavras positivas
        positivas = [
            "bom",
            "ótimo",
            "excelente",
            "maravilhoso",
            "feliz",
            "satisfeito",
            "gosto",
            "apoio",
            "concordo",
            "melhor",
            "positivo",
            "esperança",
            "confiança",
            "progresso",
            "sucesso",
            "vitória",
        ]

        # Palavras negativas
        negativas = [
            "ruim",
            "péssimo",
            "horrível",
            "triste",
            "insatisfeito",
            "odeio",
            "contra",
            "discordo",
            "pior",
            "negativo",
            "medo",
            "raiva",
            "frustração",
            "fracasso",
            "derrota",
            "desastre",
            "corrupto",
        ]

        score_pos = sum(1 for p in positivas if p in texto_lower)
        score_neg = sum(1 for n in negativas if n in texto_lower)

        score = (score_pos - score_neg) / max(score_pos + score_neg, 1)

        if score > 0.2:
            sentimento = "positivo"
        elif score < -0.2:
            sentimento = "negativo"
        else:
            sentimento = "neutro"

        return {
            "sentimento": sentimento,
            "score": round(score, 2),
            "palavras_positivas": score_pos,
            "palavras_negativas": score_neg,
        }

    def _extrair_palavras_frequentes(
        self, textos: List[str], limite: int = 30
    ) -> List[Dict[str, Any]]:
        """Extrai palavras mais frequentes"""
        # Stopwords em português
        stopwords = {
            "a",
            "o",
            "e",
            "de",
            "da",
            "do",
            "em",
            "um",
            "uma",
            "que",
            "para",
            "com",
            "não",
            "se",
            "na",
            "no",
            "os",
            "as",
            "por",
            "mais",
            "mas",
            "como",
            "foi",
            "ao",
            "ele",
            "ela",
            "dos",
            "das",
            "seu",
            "sua",
            "ou",
            "já",
            "quando",
            "muito",
            "nos",
            "eu",
            "isso",
            "esse",
            "essa",
            "ter",
            "ser",
            "está",
            "são",
            "tem",
            "vai",
            "bem",
            "só",
            "também",
            "me",
            "você",
            "gente",
            "aí",
            "aqui",
            "lá",
            "então",
            "porque",
        }

        todas_palavras = []
        for texto in textos:
            # Limpar texto
            texto_limpo = re.sub(r"[^\w\s]", "", texto.lower())
            palavras = texto_limpo.split()
            palavras_filtradas = [p for p in palavras if len(p) > 2 and p not in stopwords]
            todas_palavras.extend(palavras_filtradas)

        total = len(todas_palavras)
        contagem = Counter(todas_palavras)

        return [
            {
                "palavra": palavra,
                "frequencia": freq,
                "percentual": round(freq / total * 100, 2),
            }
            for palavra, freq in contagem.most_common(limite)
        ]

    def _identificar_temas(self, textos: List[str]) -> List[Dict[str, Any]]:
        """Identifica temas nas respostas"""
        # Temas pré-definidos com palavras-chave
        temas_config = {
            "Economia": [
                "economia",
                "emprego",
                "dinheiro",
                "salário",
                "preço",
                "inflação",
                "trabalho",
                "renda",
            ],
            "Segurança": [
                "segurança",
                "violência",
                "crime",
                "polícia",
                "bandido",
                "medo",
                "assalto",
            ],
            "Saúde": [
                "saúde",
                "hospital",
                "médico",
                "doença",
                "vacina",
                "sus",
                "remédio",
            ],
            "Educação": [
                "educação",
                "escola",
                "professor",
                "ensino",
                "universidade",
                "estudo",
            ],
            "Corrupção": [
                "corrupção",
                "corrupto",
                "roubo",
                "político",
                "desvio",
                "propina",
            ],
            "Família": ["família", "filho", "criança", "mãe", "pai", "casa", "lar"],
            "Religião": [
                "deus",
                "igreja",
                "fé",
                "cristão",
                "evangélico",
                "católico",
                "oração",
            ],
        }

        resultados = []
        total = len(textos)

        for tema, palavras_chave in temas_config.items():
            contagem = 0
            sentimento_total = 0

            for texto in textos:
                texto_lower = texto.lower()
                if any(p in texto_lower for p in palavras_chave):
                    contagem += 1
                    analise = self._analisar_sentimento(texto)
                    sentimento_total += analise["score"]

            if contagem > 0:
                resultados.append(
                    {
                        "nome": tema,
                        "frequencia": contagem,
                        "percentual": round(contagem / total * 100, 1),
                        "palavras_chave": palavras_chave[:5],
                        "sentimento_medio": round(sentimento_total / contagem, 2),
                    }
                )

        return sorted(resultados, key=lambda x: x["frequencia"], reverse=True)

    # ============================================
    # CAIXAS ESPECIAIS
    # ============================================

    def _identificar_votos_silenciosos(
        self, respostas: List[Dict], eleitores: Dict[str, Dict]
    ) -> List[Dict[str, Any]]:
        """Identifica eleitores com voto silencioso"""
        votos_silenciosos = []

        for resp in respostas:
            eleitor_id = str(resp.get("eleitor_id", ""))
            eleitor = eleitores.get(eleitor_id, {})

            if not eleitor:
                continue

            texto = resp.get("resposta_texto", "").lower()
            fluxo = resp.get("fluxo_cognitivo", {})

            # Indicadores de voto silencioso
            concordancia_economia = any(
                p in texto for p in ["economia", "emprego", "dinheiro", "melhorou", "funcionou"]
            )

            rejeicao_costumes = any(
                p in texto
                for p in [
                    "exagero",
                    "não concordo",
                    "bobagem",
                    "mas não",
                    "respeito mas",
                    "pessoalmente não",
                ]
            )

            # Verificar se há contradição entre resposta e valores
            sentimento = fluxo.get("emocional", {}).get("sentimento_dominante", "")
            tem_conflito = sentimento in ["ameaca", "indiferenca"] and concordancia_economia

            if concordancia_economia and (rejeicao_costumes or tem_conflito):
                votos_silenciosos.append(
                    {
                        "eleitor_id": eleitor_id,
                        "eleitor_nome": eleitor.get("nome", ""),
                        "perfil_resumido": f"{eleitor.get('profissao', '')} de {eleitor.get('regiao_administrativa', '')}",
                        "regiao": eleitor.get("regiao_administrativa", ""),
                        "cluster": eleitor.get("cluster_socioeconomico", ""),
                        "concorda_economia": concordancia_economia,
                        "rejeita_costumes": rejeicao_costumes,
                        "probabilidade_voto_escondido": 75 if rejeicao_costumes else 50,
                        "citacao_reveladora": (texto[:200] + "..." if len(texto) > 200 else texto),
                        "contradicoes_detectadas": [],
                        "interpretacao": "Concorda com política econômica mas rejeita pautas de costumes",
                    }
                )

        return votos_silenciosos[:20]  # Limitar a 20

    def _identificar_pontos_ruptura(
        self, respostas: List[Dict], eleitores: Dict[str, Dict]
    ) -> List[Dict[str, Any]]:
        """Identifica pontos de ruptura dos eleitores"""
        pontos_ruptura = []

        # Palavras que indicam linhas vermelhas
        gatilhos = [
            "nunca",
            "jamais",
            "se isso acontecer",
            "aí eu mudo",
            "não aceito",
            "não tolero",
            "linha vermelha",
            "limite",
        ]

        for resp in respostas:
            eleitor_id = str(resp.get("eleitor_id", ""))
            eleitor = eleitores.get(eleitor_id, {})

            if not eleitor:
                continue

            texto = resp.get("resposta_texto", "").lower()
            fluxo = resp.get("fluxo_cognitivo", {})

            # Verificar se há indicação de ruptura
            tem_gatilho = any(g in texto for g in gatilhos)
            medos_ativados = fluxo.get("vies", {}).get("ativa_medos", [])

            if tem_gatilho or medos_ativados:
                # Extrair linhas vermelhas do texto
                linhas = eleitor.get("medos", [])[:3]

                pontos_ruptura.append(
                    {
                        "eleitor_id": eleitor_id,
                        "eleitor_nome": eleitor.get("nome", ""),
                        "perfil_resumido": f"{eleitor.get('profissao', '')} de {eleitor.get('regiao_administrativa', '')}",
                        "orientacao_atual": eleitor.get("orientacao_politica", ""),
                        "linhas_vermelhas": linhas,
                        "gatilho_mudanca": (
                            medos_ativados[0] if medos_ativados else "Não identificado"
                        ),
                        "probabilidade_ruptura": 60 if tem_gatilho else 40,
                        "citacao_reveladora": (texto[:200] + "..." if len(texto) > 200 else texto),
                        "valores_em_conflito": eleitor.get("valores", [])[:3],
                        "vulnerabilidade": "alta" if tem_gatilho else "media",
                        "estrategia_persuasao": None,
                    }
                )

        return pontos_ruptura[:20]  # Limitar a 20

    # ============================================
    # MAPA DE CALOR EMOCIONAL
    # ============================================

    def _gerar_mapa_calor_emocional(
        self,
        respostas: List[Dict],
        eleitores: Dict[str, Dict],
        agrupar_por: str = "religiao",
    ) -> Dict[str, Any]:
        """Gera mapa de calor emocional"""
        grupos: Dict[str, Dict[str, List[Dict[str, Any]]]] = {}
        sentimentos = ["seguranca", "ameaca", "indiferenca", "raiva", "esperanca"]

        for resp in respostas:
            eleitor_id = str(resp.get("eleitor_id", ""))
            eleitor = eleitores.get(eleitor_id, {})
            grupo = eleitor.get(agrupar_por, "Outros")

            if grupo not in grupos:
                grupos[grupo] = {s: [] for s in sentimentos}

            fluxo = resp.get("fluxo_cognitivo", {})
            sentimento = fluxo.get("emocional", {}).get("sentimento_dominante", "indiferenca")
            intensidade = fluxo.get("emocional", {}).get("intensidade", 5)

            if sentimento in sentimentos:
                grupos[grupo][sentimento].append(
                    {
                        "intensidade": intensidade,
                        "texto": resp.get("resposta_texto", "")[:100],
                    }
                )

        # Calcular médias
        dados = []
        for grupo, sentimentos_data in grupos.items():
            for sentimento, items in sentimentos_data.items():
                if items:
                    intensidade_media = sum(i["intensidade"] for i in items) / len(items)
                    dados.append(
                        {
                            "grupo": grupo,
                            "sentimento": sentimento,
                            "intensidade": round(intensidade_media * 10, 1),  # 0-100
                            "quantidade": len(items),
                            "citacao_exemplo": items[0]["texto"] if items else None,
                        }
                    )

        return {
            "pergunta": "Análise geral",
            "total_respostas": len(respostas),
            "dados": dados,
        }

    # ============================================
    # GERAÇÃO DE INSIGHTS
    # ============================================

    def _gerar_insights(
        self,
        estatisticas: Dict,
        correlacoes: List[Dict],
        temas: List[Dict],
        votos_silenciosos: List[Dict],
        pontos_ruptura: List[Dict],
    ) -> List[Dict[str, Any]]:
        """Gera insights automáticos"""
        insights = []

        # Insight de correlações significativas
        for corr in correlacoes[:5]:
            if corr.get("significancia") == "alta":
                insights.append(
                    {
                        "tipo": "correlacao",
                        "titulo": f"Correlação entre {corr['variavel1']} e {corr['variavel2']}",
                        "descricao": corr["interpretacao"],
                        "relevancia": "alta",
                        "dados_suporte": {
                            "coeficiente": corr["coeficiente_pearson"],
                            "r_quadrado": corr["r_quadrado"],
                        },
                    }
                )

        # Insight de votos silenciosos
        if votos_silenciosos:
            pct = len(votos_silenciosos) / estatisticas.get("total_respostas", 1) * 100
            insights.append(
                {
                    "tipo": "descoberta",
                    "titulo": "Votos Silenciosos Identificados",
                    "descricao": f"{len(votos_silenciosos)} eleitores ({pct:.1f}%) concordam com política econômica mas rejeitam pautas de costumes. Potencial 'voto envergonhado'.",
                    "relevancia": "alta",
                    "recomendacao_pratica": "Pesquisas podem subestimar este grupo. Considere metodologias de urna secreta.",
                    "dados_suporte": {
                        "quantidade": len(votos_silenciosos),
                        "percentual": round(pct, 1),
                    },
                }
            )

        # Insight de pontos de ruptura
        if pontos_ruptura:
            insights.append(
                {
                    "tipo": "ruptura",
                    "titulo": "Pontos de Ruptura Detectados",
                    "descricao": f"Identificados {len(pontos_ruptura)} eleitores com potencial de mudança de voto sob determinadas condições.",
                    "relevancia": "alta",
                    "recomendacao_pratica": "Evite tocar nas 'linhas vermelhas' identificadas. Foque em temas de convergência.",
                    "dados_suporte": {"quantidade": len(pontos_ruptura)},
                }
            )

        # Insight de temas dominantes
        if temas:
            tema_principal = temas[0]
            insights.append(
                {
                    "tipo": "descoberta",
                    "titulo": f"Tema Dominante: {tema_principal['nome']}",
                    "descricao": f"O tema '{tema_principal['nome']}' aparece em {tema_principal['percentual']}% das respostas com sentimento médio de {tema_principal['sentimento_medio']:.2f}.",
                    "relevancia": "media",
                    "dados_suporte": tema_principal,
                }
            )

        return insights

    # ============================================
    # MÉTODOS PÚBLICOS
    # ============================================

    def listar(
        self, pagina: int = 1, por_pagina: int = 20, entrevista_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lista resultados com paginação"""
        resultado = self._resultados

        if entrevista_id:
            resultado = [r for r in resultado if r.get("entrevista_id") == entrevista_id]

        resultado = sorted(resultado, key=lambda x: x.get("criado_em", ""), reverse=True)

        total = len(resultado)
        total_paginas = math.ceil(total / por_pagina) if total > 0 else 1

        inicio = (pagina - 1) * por_pagina
        fim = inicio + por_pagina
        resultado = resultado[inicio:fim]

        return {
            "resultados": resultado,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "total_paginas": total_paginas,
        }

    def obter_por_id(self, resultado_id: str) -> Optional[Dict]:
        """Obtém resultado por ID"""
        for r in self._resultados:
            if r.get("id") == resultado_id:
                return r
        return None

    def analisar_entrevista(self, entrevista_id: str) -> Dict[str, Any]:
        """
        Executa análise completa de uma entrevista.

        Args:
            entrevista_id: ID da entrevista

        Returns:
            Resultado da análise
        """
        entrevista_servico = obter_entrevista_servico()

        # Obter entrevista e respostas
        entrevista = entrevista_servico.obter_por_id(entrevista_id)
        if not entrevista:
            raise ValueError(f"Entrevista {entrevista_id} não encontrada")

        respostas = entrevista_servico.obter_respostas(entrevista_id)
        if not respostas:
            raise ValueError("Nenhuma resposta encontrada para análise")

        # Obter eleitores
        eleitor_ids = list(set(r["eleitor_id"] for r in respostas))
        eleitores_lista = obter_eleitores_por_ids(eleitor_ids)
        eleitores = {e["id"]: e for e in eleitores_lista}

        # Extrair textos
        textos = [r.get("resposta_texto", "") for r in respostas if r.get("resposta_texto")]

        # Executar análises
        resultado_id = self._gerar_id()
        inicio = datetime.now()

        # Palavras frequentes
        palavras_freq = self._extrair_palavras_frequentes(textos)

        # Temas
        temas = self._identificar_temas(textos)

        # Sentimentos
        sentimentos = [self._analisar_sentimento(t) for t in textos]
        sent_counts = Counter(s["sentimento"] for s in sentimentos)
        total_sent = len(sentimentos)

        # Citações representativas
        citacoes = []
        for resp in respostas[:10]:
            eleitor = eleitores.get(resp.get("eleitor_id"), {})
            analise = self._analisar_sentimento(resp.get("resposta_texto", ""))
            citacoes.append(
                {
                    "texto": resp.get("resposta_texto", "")[:300],
                    "eleitor_id": resp.get("eleitor_id"),
                    "eleitor_nome": resp.get("eleitor_nome", ""),
                    "regiao": eleitor.get("regiao_administrativa"),
                    "cluster": eleitor.get("cluster_socioeconomico"),
                    "orientacao_politica": eleitor.get("orientacao_politica"),
                    "sentimento": analise["sentimento"],
                }
            )

        # Mapa de calor
        mapa_calor = self._gerar_mapa_calor_emocional(respostas, eleitores)

        # Caixas especiais
        votos_silenciosos = self._identificar_votos_silenciosos(respostas, eleitores)
        pontos_ruptura = self._identificar_pontos_ruptura(respostas, eleitores)

        # Correlações (simplificadas)
        correlacoes: List[Dict[str, Any]] = []

        # Insights
        estatisticas_gerais = {
            "total_respostas": len(respostas),
            "total_eleitores": len(eleitores),
        }
        insights = self._gerar_insights(
            estatisticas_gerais, correlacoes, temas, votos_silenciosos, pontos_ruptura
        )

        # Montar resultado
        resultado = {
            "id": resultado_id,
            "entrevista_id": entrevista_id,
            "titulo_entrevista": entrevista.get("titulo", ""),
            "total_respostas": len(respostas),
            "total_eleitores": len(eleitores),
            "perguntas_analisadas": len(entrevista.get("perguntas", [])),
            "custo_total": entrevista.get("custo_real", 0),
            "tempo_execucao_segundos": (datetime.now() - inicio).total_seconds(),
            "criado_em": datetime.now().isoformat(),
            # Qualitativo
            "sentimento_geral": (sent_counts.most_common(1)[0][0] if sent_counts else "neutro"),
            "proporcao_sentimentos": {
                "positivo": round(sent_counts.get("positivo", 0) / total_sent * 100, 1),
                "negativo": round(sent_counts.get("negativo", 0) / total_sent * 100, 1),
                "neutro": round(sent_counts.get("neutro", 0) / total_sent * 100, 1),
            },
            "palavras_frequentes": palavras_freq,
            "temas_principais": temas,
            "citacoes_representativas": citacoes,
            # Mapas
            "mapa_calor_emocional": mapa_calor,
            # Caixas especiais
            "votos_silenciosos": votos_silenciosos,
            "pontos_ruptura": pontos_ruptura,
            # Insights
            "insights": insights,
            "conclusoes": [
                (
                    f"A maioria das respostas ({sent_counts.most_common(1)[0][1]} de {total_sent}) apresenta sentimento {sent_counts.most_common(1)[0][0]}."
                    if sent_counts
                    else ""
                ),
                (
                    f"O tema mais mencionado foi '{temas[0]['nome']}' com {temas[0]['percentual']}% de menções."
                    if temas
                    else ""
                ),
            ],
            "implicacoes_politicas": [
                (
                    "Identificados grupos com potencial voto envergonhado."
                    if votos_silenciosos
                    else ""
                ),
                (
                    "Existem pontos de ruptura que podem ser explorados ou evitados."
                    if pontos_ruptura
                    else ""
                ),
            ],
        }

        # Salvar resultado
        self._resultados.append(resultado)
        self._salvar_dados()

        return resultado

    def deletar(self, resultado_id: str) -> bool:
        """Remove um resultado"""
        for i, r in enumerate(self._resultados):
            if r.get("id") == resultado_id:
                del self._resultados[i]
                self._salvar_dados()
                return True
        return False


# Instância global
_resultado_servico: Optional[ResultadoServico] = None


def obter_resultado_servico() -> ResultadoServico:
    """Obtém instância singleton do serviço"""
    global _resultado_servico
    if _resultado_servico is None:
        _resultado_servico = ResultadoServico()
    return _resultado_servico
