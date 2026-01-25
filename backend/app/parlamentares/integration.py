"""
Integração de Parlamentares com o Motor de Entrevista

Adapta perfis de parlamentares para serem entrevistados pelo sistema.
"""

from typing import Any, Dict, List, Optional
from .models import ParlamentarProfile, ParlamentarHipoteses


class ParlamentarAgentAdapter:
    """
    Adapta um ParlamentarProfile para ser usado como agente no motor de entrevista.

    Converte campos parlamentares para o formato esperado pelo motor,
    substituindo campos de eleitor (ex: meio_transporte) por equivalentes
    parlamentares (ex: agenda_legislativa).
    """

    def __init__(self, parlamentar: ParlamentarProfile):
        self.parlamentar = parlamentar

    def to_agent_dict(self) -> Dict[str, Any]:
        """
        Converte o perfil para dicionário compatível com o motor de entrevista.

        Retorna um dicionário com:
        - Cartão de identidade (fatos)
        - Contexto parlamentar (derivados + hipóteses quando disponíveis)
        - Instrução comportamental para a IA
        """
        fatos = self.parlamentar.fatos
        derivados = self.parlamentar.derivados
        hipoteses = self.parlamentar.hipoteses

        # Cartão de identidade (apenas fatos verificáveis)
        cartao_identidade = {
            "id": fatos.id,
            "tipo_agente": "parlamentar",
            "casa_legislativa": fatos.casa_legislativa.value,
            "nome": fatos.nome_parlamentar,
            "nome_civil": fatos.nome_civil,
            "cargo": fatos.cargo.value,
            "partido": fatos.partido,
            "uf": fatos.uf,
            "legislatura": fatos.legislatura,
        }

        # Dados opcionais verificáveis
        if fatos.genero:
            cartao_identidade["genero"] = fatos.genero.value
        if fatos.votos_ultima_eleicao:
            cartao_identidade["votos_ultima_eleicao"] = fatos.votos_ultima_eleicao
        if fatos.formacao_academica:
            cartao_identidade["formacao"] = fatos.formacao_academica
        if fatos.profissao_declarada:
            cartao_identidade["profissao"] = fatos.profissao_declarada

        # Contexto parlamentar
        contexto = {
            "comissoes": fatos.comissoes_atuais,
            "frentes_parlamentares": fatos.frentes_parlamentares,
            "cargos_lideranca": fatos.cargos_lideranca,
        }

        # Temas de atuação (derivados)
        if derivados.temas_dominantes:
            contexto["temas_atuacao"] = derivados.temas_dominantes.valor

        # Idade (derivado)
        idade = None
        if derivados.idade:
            idade = derivados.idade.valor

        # Hipóteses (quando disponíveis, com label de confiança)
        perfil_inferido = {}

        if hipoteses.orientacao_politica:
            perfil_inferido["orientacao_politica"] = {
                "valor": hipoteses.orientacao_politica.valor,
                "confianca": hipoteses.orientacao_politica.confianca.value
            }

        if hipoteses.posicao_bolsonaro:
            perfil_inferido["posicao_bolsonaro"] = {
                "valor": hipoteses.posicao_bolsonaro.valor,
                "confianca": hipoteses.posicao_bolsonaro.confianca.value
            }

        if hipoteses.posicao_lula:
            perfil_inferido["posicao_lula"] = {
                "valor": hipoteses.posicao_lula.valor,
                "confianca": hipoteses.posicao_lula.confianca.value
            }

        if hipoteses.relacao_governo_atual:
            perfil_inferido["relacao_governo"] = {
                "valor": hipoteses.relacao_governo_atual.valor,
                "confianca": hipoteses.relacao_governo_atual.confianca.value
            }

        if hipoteses.estilo_comunicacao:
            perfil_inferido["estilo_comunicacao"] = {
                "valor": hipoteses.estilo_comunicacao.valor,
                "confianca": hipoteses.estilo_comunicacao.confianca.value
            }

        if hipoteses.valores_inferidos:
            perfil_inferido["valores"] = {
                "valor": hipoteses.valores_inferidos.valor,
                "confianca": hipoteses.valores_inferidos.confianca.value
            }

        if hipoteses.preocupacoes_inferidas:
            perfil_inferido["preocupacoes"] = {
                "valor": hipoteses.preocupacoes_inferidas.valor,
                "confianca": hipoteses.preocupacoes_inferidas.confianca.value
            }

        # Instrução comportamental
        instrucao = self._gerar_instrucao_comportamental()

        return {
            "id": fatos.id,
            "nome": fatos.nome_parlamentar,
            "tipo": "parlamentar",

            # Campos que o motor de entrevista espera
            "idade": idade,
            "genero": fatos.genero.value if fatos.genero else None,
            "profissao": fatos.profissao_declarada or f"{fatos.cargo.value} - {fatos.partido}",
            "regiao_administrativa": "Brasília/DF",  # Todos trabalham em Brasília

            # Campos políticos (substituem campos de eleitor)
            "orientacao_politica": self._extrair_valor_hipotese(hipoteses.orientacao_politica),
            "posicao_bolsonaro": self._extrair_valor_hipotese(hipoteses.posicao_bolsonaro),
            "interesse_politico": "alto",  # Parlamentares têm interesse alto por definição
            "tolerancia_nuance": "alta",  # Assumimos que parlamentares são nuançados

            # Campos parlamentares (substituem campos de eleitor irrelevantes)
            "base_eleitoral": self._inferir_base_eleitoral(),
            "agenda_legislativa": contexto.get("temas_atuacao", []),
            "prioridades_tematicas": fatos.comissoes_atuais,

            # Valores e preocupações
            "valores": self._extrair_valor_hipotese(hipoteses.valores_inferidos) or [],
            "preocupacoes": self._extrair_valor_hipotese(hipoteses.preocupacoes_inferidas) or [],

            # Contexto completo para o prompt
            "cartao_identidade": cartao_identidade,
            "contexto_parlamentar": contexto,
            "perfil_inferido": perfil_inferido,

            # Instrução para a IA
            "historia_resumida": self._gerar_historia_resumida(),
            "instrucao_comportamental": instrucao,
        }

    def _extrair_valor_hipotese(self, hipotese: Optional[Any]) -> Any:
        """Extrai apenas o valor de uma hipótese, se existir"""
        if hipotese and hasattr(hipotese, 'valor'):
            return hipotese.valor
        return None

    def _inferir_base_eleitoral(self) -> str:
        """Infere a base eleitoral do parlamentar"""
        fatos = self.parlamentar.fatos

        partes = []
        if fatos.partido:
            partes.append(f"eleitores do {fatos.partido}")

        if fatos.frentes_parlamentares:
            for frente in fatos.frentes_parlamentares[:2]:
                if "evangel" in frente.lower():
                    partes.append("evangélicos")
                elif "agro" in frente.lower() or "rural" in frente.lower():
                    partes.append("setor agropecuário")
                elif "mulher" in frente.lower():
                    partes.append("movimento de mulheres")
                elif "trabalhador" in frente.lower():
                    partes.append("trabalhadores")

        return ", ".join(partes) if partes else f"eleitores do {fatos.uf}"

    def _gerar_historia_resumida(self) -> str:
        """Gera história resumida do parlamentar"""
        fatos = self.parlamentar.fatos

        partes = [
            f"{fatos.nome_parlamentar} é {fatos.cargo.value.replace('_', ' ')} pelo {fatos.partido}/{fatos.uf}."
        ]

        if fatos.formacao_academica:
            partes.append(f"Formação: {', '.join(fatos.formacao_academica[:2])}.")

        if fatos.comissoes_atuais:
            partes.append(f"Atua nas comissões: {', '.join(fatos.comissoes_atuais[:2])}.")

        if fatos.votos_ultima_eleicao:
            partes.append(f"Eleito(a) com {fatos.votos_ultima_eleicao:,} votos.")

        return " ".join(partes)

    def _gerar_instrucao_comportamental(self) -> str:
        """
        Gera instrução comportamental para a IA simular o parlamentar.

        Se houver instrução nas hipóteses, usa ela.
        Caso contrário, gera uma instrução genérica baseada nos fatos.
        """
        hipoteses = self.parlamentar.hipoteses
        fatos = self.parlamentar.fatos

        # Se já existe instrução nas hipóteses, usar ela
        if hipoteses.instrucao_comportamental:
            return hipoteses.instrucao_comportamental.valor

        # Gerar instrução baseada nos fatos e hipóteses disponíveis
        partes = []

        partes.append(f"Você é {fatos.nome_parlamentar}, {fatos.cargo.value.replace('_', ' ')} pelo {fatos.partido}.")

        # Estilo de comunicação
        if hipoteses.estilo_comunicacao:
            estilo = hipoteses.estilo_comunicacao.valor
            partes.append(f"Seu estilo de comunicação é {estilo}.")

        # Orientação política
        if hipoteses.orientacao_politica:
            orientacao = hipoteses.orientacao_politica.valor
            partes.append(f"Você tem orientação política de {orientacao}.")

        # Posições políticas
        if hipoteses.posicao_bolsonaro:
            partes.append(f"Em relação a Bolsonaro, você é {hipoteses.posicao_bolsonaro.valor.replace('_', ' ')}.")

        if hipoteses.relacao_governo_atual:
            relacao = hipoteses.relacao_governo_atual.valor.replace('_', ' ')
            partes.append(f"Em relação ao governo Lula, você faz parte da {relacao}.")

        # Temas de atuação
        derivados = self.parlamentar.derivados
        if derivados.temas_dominantes and derivados.temas_dominantes.valor:
            temas = ", ".join(derivados.temas_dominantes.valor[:3])
            partes.append(f"Seus principais temas de atuação são: {temas}.")

        # Valores
        if hipoteses.valores_inferidos and hipoteses.valores_inferidos.valor:
            valores = ", ".join(hipoteses.valores_inferidos.valor[:3])
            partes.append(f"Você valoriza: {valores}.")

        partes.append("Responda como este parlamentar responderia, mantendo coerência com seu perfil e posições públicas conhecidas.")

        return " ".join(partes)

    def get_evidence_context(self) -> List[Dict[str, str]]:
        """
        Retorna contexto de evidências para fundamentar respostas factuais.

        Útil para RAG ou para incluir referências nas respostas.
        """
        fatos = self.parlamentar.fatos
        evidencias = []

        # Fonte da foto
        if fatos.url_foto_oficial:
            evidencias.append({
                "tipo": "foto_oficial",
                "descricao": "Foto oficial do parlamentar",
                "url": fatos.url_foto_oficial
            })

        # Perfil oficial
        if fatos.url_perfil_oficial:
            evidencias.append({
                "tipo": "perfil_oficial",
                "descricao": f"Perfil oficial no site da {fatos.casa_legislativa.value}",
                "url": fatos.url_perfil_oficial
            })

        # Fontes de dados
        for fonte in fatos.fontes:
            evidencias.append({
                "tipo": "fonte_dados",
                "descricao": fonte.nome,
                "url": fonte.url,
                "data_acesso": fonte.data_acesso.isoformat() if fonte.data_acesso else None
            })

        return evidencias


def adaptar_parlamentar_para_entrevista(parlamentar: ParlamentarProfile) -> Dict[str, Any]:
    """
    Função utilitária para converter parlamentar para formato de entrevista.

    Uso:
        from app.parlamentares.integration import adaptar_parlamentar_para_entrevista

        agente_dict = adaptar_parlamentar_para_entrevista(parlamentar)
        # agente_dict pode ser usado pelo motor de entrevista
    """
    adapter = ParlamentarAgentAdapter(parlamentar)
    return adapter.to_agent_dict()
