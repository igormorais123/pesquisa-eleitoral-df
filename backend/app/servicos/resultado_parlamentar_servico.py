"""
Serviço de Resultados e Análises para Parlamentares

Lógica de negócio para análise de resultados de pesquisas com parlamentares.
"""

import json
import math
import re
import uuid
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.servicos.parlamentar_helper import obter_parlamentares_por_ids
from app.servicos.pesquisa_parlamentar_servico import obter_pesquisa_parlamentar_servico


class ResultadoParlamentarServico:
    """Serviço para análise de resultados de pesquisas com parlamentares"""

    def __init__(self, caminho_dados: Optional[str] = None):
        if caminho_dados is None:
            base_path = Path(__file__).parent.parent.parent.parent
            self.caminho_dados = base_path / "memorias" / "resultados_parlamentares.json"
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
        return f"res-parl-{uuid.uuid4().hex[:8]}"

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

        media = sum(valores) / n

        if n % 2 == 0:
            mediana = (valores_sorted[n // 2 - 1] + valores_sorted[n // 2]) / 2
        else:
            mediana = valores_sorted[n // 2]

        contagem = Counter(valores)
        moda = contagem.most_common(1)[0][0]

        variancia = sum((x - media) ** 2 for x in valores) / n
        desvio_padrao = math.sqrt(variancia)

        return {
            "variavel": variavel,
            "media": round(media, 2),
            "mediana": round(mediana, 2),
            "moda": moda,
            "desvio_padrao": round(desvio_padrao, 2),
            "minimo": min(valores),
            "maximo": max(valores),
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

    # ============================================
    # ANÁLISES QUALITATIVAS
    # ============================================

    def _analisar_sentimento(self, texto: str) -> Dict[str, Any]:
        """Análise básica de sentimento"""
        texto_lower = texto.lower()

        positivas = [
            "concordo", "apoio", "favorável", "importante", "necessário",
            "fundamental", "positivo", "avanço", "progresso", "sucesso"
        ]

        negativas = [
            "discordo", "contra", "rejeito", "absurdo", "inaceitável",
            "negativo", "retrocesso", "fracasso", "erro", "problema"
        ]

        score_pos = sum(1 for p in positivas if p in texto_lower)
        score_neg = sum(1 for n in negativas if n in texto_lower)

        score = (score_pos - score_neg) / max(score_pos + score_neg, 1)

        if score > 0.2:
            sentimento = "favorável"
        elif score < -0.2:
            sentimento = "contrário"
        else:
            sentimento = "neutro"

        return {
            "sentimento": sentimento,
            "score": round(score, 2),
        }

    def _extrair_palavras_frequentes(
        self, textos: List[str], limite: int = 30
    ) -> List[Dict[str, Any]]:
        """Extrai palavras mais frequentes"""
        stopwords = {
            "a", "o", "e", "de", "da", "do", "em", "um", "uma", "que",
            "para", "com", "não", "se", "na", "no", "os", "as", "por",
            "mais", "mas", "como", "foi", "ao", "dos", "das", "seu", "sua",
            "ou", "já", "quando", "muito", "nos", "eu", "isso", "esse",
            "essa", "ter", "ser", "está", "são", "tem", "vai", "bem"
        }

        todas_palavras = []
        for texto in textos:
            texto_limpo = re.sub(r"[^\w\s]", "", texto.lower())
            palavras = texto_limpo.split()
            palavras_filtradas = [p for p in palavras if len(p) > 2 and p not in stopwords]
            todas_palavras.extend(palavras_filtradas)

        total = len(todas_palavras) if todas_palavras else 1
        contagem = Counter(todas_palavras)

        return [
            {
                "palavra": palavra,
                "frequencia": freq,
                "percentual": round(freq / total * 100, 2),
            }
            for palavra, freq in contagem.most_common(limite)
        ]

    def _identificar_temas_parlamentares(self, textos: List[str]) -> List[Dict[str, Any]]:
        """Identifica temas nas respostas parlamentares"""
        temas_config = {
            "Economia/Orçamento": [
                "economia", "orçamento", "fiscal", "impostos", "dívida",
                "gastos", "investimento", "recurso", "verba"
            ],
            "Saúde": [
                "saúde", "sus", "hospital", "vacina", "pandemia",
                "atendimento", "médico"
            ],
            "Educação": [
                "educação", "escola", "ensino", "universidade",
                "professor", "estudante"
            ],
            "Segurança": [
                "segurança", "polícia", "crime", "violência",
                "armamento", "prisão"
            ],
            "Meio Ambiente": [
                "ambiente", "ambiental", "clima", "sustentável",
                "desmatamento", "preservação"
            ],
            "Direitos Sociais": [
                "direitos", "social", "igualdade", "minoria",
                "inclusão", "diversidade"
            ],
            "Infraestrutura": [
                "infraestrutura", "transporte", "obra", "estrada",
                "mobilidade", "saneamento"
            ],
            "Reforma Política": [
                "reforma", "política", "eleição", "partido",
                "democracia", "voto"
            ],
        }

        resultados = []
        total = len(textos) if textos else 1

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
                resultados.append({
                    "nome": tema,
                    "frequencia": contagem,
                    "percentual": round(contagem / total * 100, 1),
                    "palavras_chave": palavras_chave[:5],
                    "sentimento_medio": round(sentimento_total / contagem, 2),
                })

        return sorted(resultados, key=lambda x: x["frequencia"], reverse=True)

    # ============================================
    # ANÁLISES ESPECÍFICAS PARLAMENTARES
    # ============================================

    def _analisar_alinhamento_partidario(
        self, respostas: List[Dict], parlamentares: Dict[str, Dict]
    ) -> Dict[str, Any]:
        """Analisa alinhamento das respostas com posição partidária"""
        por_partido: Dict[str, List[Dict]] = {}

        for resp in respostas:
            parl_id = str(resp.get("parlamentar_id", ""))
            parlamentar = parlamentares.get(parl_id, {})
            partido = parlamentar.get("partido", "Sem Partido")

            if partido not in por_partido:
                por_partido[partido] = []
            por_partido[partido].append(resp)

        resultado = []
        for partido, respostas_partido in por_partido.items():
            # Analisar coerência interna do partido
            sentimentos = []
            for r in respostas_partido:
                fluxo = r.get("fluxo_cognitivo", {})
                meta = fluxo.get("meta", {})
                if meta.get("alinhado_partido"):
                    sentimentos.append("alinhado")
                else:
                    sentimentos.append("divergente")

            alinhados = sum(1 for s in sentimentos if s == "alinhado")
            total = len(sentimentos)

            resultado.append({
                "partido": partido,
                "total_respostas": total,
                "alinhados": alinhados,
                "divergentes": total - alinhados,
                "taxa_alinhamento": round(alinhados / total * 100, 1) if total > 0 else 0,
            })

        return {
            "por_partido": sorted(resultado, key=lambda x: x["taxa_alinhamento"], reverse=True),
            "media_alinhamento": round(
                sum(r["taxa_alinhamento"] for r in resultado) / len(resultado), 1
            ) if resultado else 0,
        }

    def _analisar_por_casa_legislativa(
        self, respostas: List[Dict], parlamentares: Dict[str, Dict]
    ) -> Dict[str, Any]:
        """Analisa respostas por casa legislativa"""
        por_casa: Dict[str, List[Dict]] = {}

        for resp in respostas:
            parl_id = str(resp.get("parlamentar_id", ""))
            parlamentar = parlamentares.get(parl_id, {})
            casa = parlamentar.get("casa_legislativa", "desconhecida")

            if casa not in por_casa:
                por_casa[casa] = []
            por_casa[casa].append(resp)

        resultado = []
        for casa, respostas_casa in por_casa.items():
            textos = [r.get("resposta_texto", "") for r in respostas_casa]
            sentimentos = [self._analisar_sentimento(t) for t in textos]

            favoraveis = sum(1 for s in sentimentos if s["sentimento"] == "favorável")
            contrarios = sum(1 for s in sentimentos if s["sentimento"] == "contrário")
            neutros = sum(1 for s in sentimentos if s["sentimento"] == "neutro")

            resultado.append({
                "casa": casa,
                "total_respostas": len(respostas_casa),
                "favoraveis": favoraveis,
                "contrarios": contrarios,
                "neutros": neutros,
                "sentimento_predominante": max(
                    [("favorável", favoraveis), ("contrário", contrarios), ("neutro", neutros)],
                    key=lambda x: x[1]
                )[0],
            })

        return {"por_casa": resultado}

    def _identificar_posicoes_polemicas(
        self, respostas: List[Dict], parlamentares: Dict[str, Dict]
    ) -> List[Dict[str, Any]]:
        """Identifica respostas potencialmente polêmicas"""
        polemicas = []

        for resp in respostas:
            fluxo = resp.get("fluxo_cognitivo", {})
            meta = fluxo.get("meta", {})

            if meta.get("potencial_polemico"):
                parl_id = str(resp.get("parlamentar_id", ""))
                parlamentar = parlamentares.get(parl_id, {})

                polemicas.append({
                    "parlamentar_id": parl_id,
                    "parlamentar_nome": resp.get("parlamentar_nome", ""),
                    "partido": parlamentar.get("partido", ""),
                    "casa": parlamentar.get("casa_legislativa", ""),
                    "resposta_resumo": resp.get("resposta_texto", "")[:200] + "...",
                    "tom": fluxo.get("resposta", {}).get("tom", "direto"),
                })

        return polemicas[:20]

    def _gerar_mapa_calor_parlamentar(
        self,
        respostas: List[Dict],
        parlamentares: Dict[str, Dict],
        agrupar_por: str = "partido",
    ) -> Dict[str, Any]:
        """Gera mapa de calor de posicionamentos"""
        grupos: Dict[str, Dict[str, int]] = {}
        posicoes = ["favorável", "contrário", "neutro"]

        for resp in respostas:
            parl_id = str(resp.get("parlamentar_id", ""))
            parlamentar = parlamentares.get(parl_id, {})
            grupo = parlamentar.get(agrupar_por, "Outros")

            if grupo not in grupos:
                grupos[grupo] = {p: 0 for p in posicoes}

            texto = resp.get("resposta_texto", "")
            analise = self._analisar_sentimento(texto)
            sentimento = analise["sentimento"]

            if sentimento in posicoes:
                grupos[grupo][sentimento] += 1

        dados = []
        for grupo, contagens in grupos.items():
            total = sum(contagens.values())
            for posicao, qtd in contagens.items():
                if qtd > 0:
                    dados.append({
                        "grupo": grupo,
                        "posicao": posicao,
                        "quantidade": qtd,
                        "percentual": round(qtd / total * 100, 1) if total > 0 else 0,
                    })

        return {
            "agrupamento": agrupar_por,
            "total_respostas": len(respostas),
            "dados": dados,
        }

    # ============================================
    # INSIGHTS PARLAMENTARES
    # ============================================

    def _gerar_insights_parlamentares(
        self,
        estatisticas: Dict,
        alinhamento: Dict,
        por_casa: Dict,
        temas: List[Dict],
        polemicas: List[Dict],
    ) -> List[Dict[str, Any]]:
        """Gera insights específicos para parlamentares"""
        insights = []

        # Insight de alinhamento partidário
        if alinhamento.get("por_partido"):
            maior_alinhamento = alinhamento["por_partido"][0]
            menor_alinhamento = alinhamento["por_partido"][-1]

            insights.append({
                "tipo": "alinhamento",
                "titulo": "Alinhamento Partidário",
                "descricao": f"O {maior_alinhamento['partido']} apresenta maior alinhamento interno ({maior_alinhamento['taxa_alinhamento']}%), enquanto o {menor_alinhamento['partido']} tem menor coesão ({menor_alinhamento['taxa_alinhamento']}%).",
                "relevancia": "alta",
                "dados_suporte": alinhamento["por_partido"][:3],
            })

        # Insight de diferenças entre casas
        if por_casa.get("por_casa"):
            casas = por_casa["por_casa"]
            if len(casas) > 1:
                insights.append({
                    "tipo": "comparacao",
                    "titulo": "Diferenças entre Casas Legislativas",
                    "descricao": f"Análise comparativa entre {len(casas)} casas legislativas mostra diferentes padrões de posicionamento.",
                    "relevancia": "media",
                    "dados_suporte": casas,
                })

        # Insight de temas dominantes
        if temas:
            tema_principal = temas[0]
            insights.append({
                "tipo": "temas",
                "titulo": f"Tema Dominante: {tema_principal['nome']}",
                "descricao": f"O tema '{tema_principal['nome']}' foi o mais abordado nas respostas ({tema_principal['percentual']}% das menções).",
                "relevancia": "media",
                "dados_suporte": temas[:3],
            })

        # Insight de posições polêmicas
        if polemicas:
            insights.append({
                "tipo": "alerta",
                "titulo": "Posições Potencialmente Polêmicas",
                "descricao": f"Identificadas {len(polemicas)} respostas com potencial polêmico que podem gerar repercussão.",
                "relevancia": "alta",
                "recomendacao": "Revisar essas respostas antes de divulgação pública.",
                "dados_suporte": {"quantidade": len(polemicas)},
            })

        return insights

    # ============================================
    # MÉTODOS PÚBLICOS
    # ============================================

    def listar(
        self, pagina: int = 1, por_pagina: int = 20, pesquisa_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lista resultados com paginação"""
        resultado = self._resultados

        if pesquisa_id:
            resultado = [r for r in resultado if r.get("pesquisa_id") == pesquisa_id]

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

    def analisar_pesquisa(self, pesquisa_id: str) -> Dict[str, Any]:
        """
        Executa análise completa de uma pesquisa com parlamentares.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            Resultado da análise
        """
        pesquisa_servico = obter_pesquisa_parlamentar_servico()

        # Obter pesquisa e respostas
        pesquisa = pesquisa_servico.obter_por_id(pesquisa_id)
        if not pesquisa:
            raise ValueError(f"Pesquisa {pesquisa_id} não encontrada")

        respostas = pesquisa_servico.obter_respostas(pesquisa_id)
        if not respostas:
            raise ValueError("Nenhuma resposta encontrada para análise")

        # Obter parlamentares (filtrando IDs nulos/vazios)
        parlamentar_ids = list(set(
            str(r.get("parlamentar_id"))
            for r in respostas
            if r.get("parlamentar_id") is not None and r.get("parlamentar_id") != ""
        ))
        parlamentares_lista = obter_parlamentares_por_ids(parlamentar_ids)
        parlamentares = {str(p["id"]): p for p in parlamentares_lista if p.get("id")}

        # Extrair textos
        textos = [r.get("resposta_texto", "") for r in respostas if r.get("resposta_texto")]

        # Executar análises
        resultado_id = self._gerar_id()
        inicio = datetime.now()

        # Palavras frequentes
        palavras_freq = self._extrair_palavras_frequentes(textos)

        # Temas
        temas = self._identificar_temas_parlamentares(textos)

        # Sentimentos
        sentimentos = [self._analisar_sentimento(t) for t in textos]
        sent_counts = Counter(s["sentimento"] for s in sentimentos)
        total_sent = len(sentimentos) if sentimentos else 1

        # Análises específicas
        alinhamento = self._analisar_alinhamento_partidario(respostas, parlamentares)
        por_casa = self._analisar_por_casa_legislativa(respostas, parlamentares)
        polemicas = self._identificar_posicoes_polemicas(respostas, parlamentares)

        # Mapas de calor
        mapa_partido = self._gerar_mapa_calor_parlamentar(respostas, parlamentares, "partido")
        mapa_casa = self._gerar_mapa_calor_parlamentar(respostas, parlamentares, "casa_legislativa")

        # Citações representativas
        citacoes = []
        for resp in respostas[:10]:
            parlamentar = parlamentares.get(str(resp.get("parlamentar_id")), {})
            analise = self._analisar_sentimento(resp.get("resposta_texto", ""))
            citacoes.append({
                "texto": resp.get("resposta_texto", "")[:300],
                "parlamentar_id": resp.get("parlamentar_id"),
                "parlamentar_nome": resp.get("parlamentar_nome", ""),
                "partido": parlamentar.get("partido"),
                "casa": parlamentar.get("casa_legislativa"),
                "sentimento": analise["sentimento"],
            })

        # Insights
        estatisticas_gerais = {
            "total_respostas": len(respostas),
            "total_parlamentares": len(parlamentares),
        }
        insights = self._gerar_insights_parlamentares(
            estatisticas_gerais, alinhamento, por_casa, temas, polemicas
        )

        # Montar resultado
        resultado = {
            "id": resultado_id,
            "pesquisa_id": pesquisa_id,
            "titulo_pesquisa": pesquisa.get("titulo", ""),
            "total_respostas": len(respostas),
            "total_parlamentares": len(parlamentares),
            "perguntas_analisadas": len(pesquisa.get("perguntas", [])),
            "custo_total": pesquisa.get("custo_real", 0),
            "tempo_analise_segundos": (datetime.now() - inicio).total_seconds(),
            "criado_em": datetime.now().isoformat(),
            # Posicionamento geral
            "posicionamento_geral": sent_counts.most_common(1)[0][0] if sent_counts else "neutro",
            "proporcao_posicionamentos": {
                "favoravel": round(sent_counts.get("favorável", 0) / total_sent * 100, 1),
                "contrario": round(sent_counts.get("contrário", 0) / total_sent * 100, 1),
                "neutro": round(sent_counts.get("neutro", 0) / total_sent * 100, 1),
            },
            # Análises textuais
            "palavras_frequentes": palavras_freq,
            "temas_principais": temas,
            "citacoes_representativas": citacoes,
            # Análises parlamentares
            "alinhamento_partidario": alinhamento,
            "por_casa_legislativa": por_casa,
            "posicoes_polemicas": polemicas,
            # Mapas de calor
            "mapa_calor_partido": mapa_partido,
            "mapa_calor_casa": mapa_casa,
            # Insights
            "insights": insights,
            # Conclusões
            "conclusoes": [
                f"A maioria dos parlamentares ({sent_counts.most_common(1)[0][1]} de {total_sent}) apresenta posicionamento {sent_counts.most_common(1)[0][0]}." if sent_counts else "",
                f"Taxa média de alinhamento partidário: {alinhamento.get('media_alinhamento', 0)}%.",
                f"O tema mais abordado foi '{temas[0]['nome']}' com {temas[0]['percentual']}% de menções." if temas else "",
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
_resultado_parlamentar_servico: Optional[ResultadoParlamentarServico] = None


def obter_resultado_parlamentar_servico() -> ResultadoParlamentarServico:
    """Obtém instância singleton do serviço"""
    global _resultado_parlamentar_servico
    if _resultado_parlamentar_servico is None:
        _resultado_parlamentar_servico = ResultadoParlamentarServico()
    return _resultado_parlamentar_servico
