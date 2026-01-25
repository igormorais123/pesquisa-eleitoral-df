"""
Serviço de Parlamentares

Gerencia carregamento, cache, filtros e estatísticas de parlamentares.
Suporta snapshots por data para reprodutibilidade.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from .models import (
    CasaLegislativaEnum,
    CargoEnum,
    GeneroEnum,
    ParlamentarFatos,
    ParlamentarDerivados,
    ParlamentarHipoteses,
    ParlamentarProfile,
    ParlamentarResponse,
    ParlamentarListResponse,
    FiltrosParlamentar,
    EstatisticasParlamentares,
    MetricaDerivada,
    Hipotese,
    NivelConfiancaEnum,
    OrientacaoPoliticaEnum,
    RelacaoGovernoEnum,
)

logger = logging.getLogger(__name__)

# Diretório base de dados
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "parlamentares"
AGENTES_DIR = Path(__file__).parent.parent.parent.parent / "agentes"


class ParlamentarService:
    """Serviço para gestão de parlamentares"""

    def __init__(self):
        self._cache: Dict[str, ParlamentarProfile] = {}
        self._loaded = False
        self._snapshot_date: Optional[str] = None

    def _carregar_json_legado(self, arquivo: Path, casa: CasaLegislativaEnum) -> List[ParlamentarProfile]:
        """
        Carrega parlamentares de arquivos JSON legados (formato anterior).
        Converte para o novo formato de camadas de verdade.
        """
        if not arquivo.exists():
            logger.warning(f"Arquivo não encontrado: {arquivo}")
            return []

        try:
            with open(arquivo, "r", encoding="utf-8") as f:
                dados = json.load(f)

            parlamentares = []
            for item in dados:
                perfil = self._converter_legado_para_profile(item, casa)
                if perfil:
                    parlamentares.append(perfil)

            logger.info(f"Carregados {len(parlamentares)} parlamentares de {arquivo}")
            return parlamentares

        except Exception as e:
            logger.error(f"Erro ao carregar {arquivo}: {e}")
            return []

    def _converter_legado_para_profile(
        self, dados: Dict[str, Any], casa: CasaLegislativaEnum
    ) -> Optional[ParlamentarProfile]:
        """Converte formato legado para ParlamentarProfile com camadas de verdade"""
        try:
            # CAMADA 1: FATOS (apenas dados verificáveis)
            cargo_str = dados.get("cargo", "")
            cargo = self._inferir_cargo(cargo_str, casa, dados.get("genero"))

            fatos = ParlamentarFatos(
                id=dados.get("id", ""),
                casa_legislativa=casa,
                nome_civil=dados.get("nome", dados.get("nome_parlamentar", "")),
                nome_parlamentar=dados.get("nome_parlamentar", dados.get("nome", "")),
                data_nascimento=dados.get("data_nascimento"),
                genero=GeneroEnum(dados["genero"]) if dados.get("genero") in ["masculino", "feminino"] else None,
                naturalidade=dados.get("naturalidade"),
                uf_nascimento=dados.get("uf_nascimento"),
                cargo=cargo,
                partido=dados.get("partido", ""),
                uf=dados.get("uf", "DF"),
                legislatura=dados.get("legislatura"),
                mandato_inicio=dados.get("mandato_inicio"),
                mandato_fim=dados.get("mandato_fim"),
                votos_ultima_eleicao=dados.get("votos_eleicao"),
                email=dados.get("email_contato"),
                telefone_gabinete=dados.get("telefone_gabinete"),
                gabinete_localizacao=dados.get("gabinete_localizacao"),
                url_foto_oficial=dados.get("foto_url"),
                redes_sociais=dados.get("redes_sociais", {}),
                formacao_academica=dados.get("formacao_academica", []),
                profissao_declarada=dados.get("profissao_anterior"),
                comissoes_atuais=dados.get("comissoes_atuais", []),
                frentes_parlamentares=dados.get("frentes_parlamentares", []),
                cargos_lideranca=dados.get("liderancas", []),
            )

            # CAMADA 2: DERIVADOS (calculados)
            idade_valor = dados.get("idade")
            idade = None
            if idade_valor:
                idade = MetricaDerivada(
                    valor=idade_valor,
                    metodo_calculo="Calculado a partir de data_nascimento ou informado na fonte",
                    dados_base=["data_nascimento"]
                )

            temas = self._extrair_temas(
                dados.get("temas_atuacao", []),
                dados.get("comissoes_atuais", []),
                dados.get("frentes_parlamentares", [])
            )

            completude = self._calcular_completude(fatos)

            derivados = ParlamentarDerivados(
                idade=idade,
                completude_perfil=MetricaDerivada(
                    valor=completude,
                    metodo_calculo="(campos_preenchidos / total_campos_fatos) * 100",
                    dados_base=list(fatos.model_dump().keys())
                ),
                temas_dominantes=MetricaDerivada(
                    valor=temas,
                    metodo_calculo="União de temas_atuacao, comissões e frentes",
                    dados_base=["temas_atuacao", "comissoes_atuais", "frentes_parlamentares"]
                )
            )

            # CAMADA 3: HIPÓTESES (inferências do arquivo legado)
            hipoteses = ParlamentarHipoteses()

            # Orientação política (se informada no legado)
            if dados.get("orientacao_politica"):
                try:
                    orientacao = dados["orientacao_politica"].replace("-", "_")
                    if orientacao in [e.value.replace("-", "_") for e in OrientacaoPoliticaEnum]:
                        hipoteses.orientacao_politica = Hipotese(
                            label="orientacao_politica",
                            valor=dados["orientacao_politica"],
                            confianca=NivelConfiancaEnum.media,
                            rationale="Baseado em análise de votações e posicionamentos públicos",
                            evidencias=["Histórico de votações", "Declarações públicas", "Partido político"]
                        )
                except Exception:
                    pass

            # Posição Bolsonaro
            if dados.get("posicao_bolsonaro"):
                hipoteses.posicao_bolsonaro = Hipotese(
                    label="posicao_bolsonaro",
                    valor=dados["posicao_bolsonaro"],
                    confianca=NivelConfiancaEnum.media,
                    rationale="Baseado em votações e declarações públicas",
                    evidencias=["Posicionamentos públicos", "Votações nominais"]
                )

            # Posição Lula
            if dados.get("posicao_lula"):
                hipoteses.posicao_lula = Hipotese(
                    label="posicao_lula",
                    valor=dados["posicao_lula"],
                    confianca=NivelConfiancaEnum.media,
                    rationale="Baseado em votações e declarações públicas",
                    evidencias=["Posicionamentos públicos", "Votações nominais"]
                )

            # Relação com governo
            if dados.get("relacao_governo_atual"):
                try:
                    relacao = dados["relacao_governo_atual"]
                    if relacao in [e.value for e in RelacaoGovernoEnum]:
                        hipoteses.relacao_governo_atual = Hipotese(
                            label="relacao_governo_atual",
                            valor=relacao,
                            confianca=NivelConfiancaEnum.media,
                            rationale="Baseado em votações com o governo e alianças partidárias",
                            evidencias=["Bloco parlamentar", "Votações nominais"]
                        )
                except Exception:
                    pass

            # Estilo de comunicação
            if dados.get("estilo_comunicacao"):
                hipoteses.estilo_comunicacao = Hipotese(
                    label="estilo_comunicacao",
                    valor=dados["estilo_comunicacao"],
                    confianca=NivelConfiancaEnum.baixa,
                    rationale="Inferido de análise de discursos e aparições públicas",
                    evidencias=["Discursos em plenário", "Entrevistas"]
                )

            # Valores e preocupações
            if dados.get("valores"):
                hipoteses.valores_inferidos = Hipotese(
                    label="valores",
                    valor=dados["valores"],
                    confianca=NivelConfiancaEnum.baixa,
                    rationale="Inferido de projetos de lei e discursos",
                    evidencias=["Projetos de lei", "Discursos"]
                )

            if dados.get("preocupacoes"):
                hipoteses.preocupacoes_inferidas = Hipotese(
                    label="preocupacoes",
                    valor=dados["preocupacoes"],
                    confianca=NivelConfiancaEnum.baixa,
                    rationale="Inferido de projetos de lei e pronunciamentos",
                    evidencias=["Projetos de lei", "Pronunciamentos"]
                )

            # Instrução comportamental
            if dados.get("instrucao_comportamental"):
                hipoteses.instrucao_comportamental = Hipotese(
                    label="instrucao_comportamental",
                    valor=dados["instrucao_comportamental"],
                    confianca=NivelConfiancaEnum.baixa,
                    rationale="Síntese para simulação baseada em perfil público",
                    evidencias=["Análise de comportamento público", "Estilo de comunicação"]
                )

            return ParlamentarProfile(
                fatos=fatos,
                derivados=derivados,
                hipoteses=hipoteses
            )

        except Exception as e:
            logger.error(f"Erro ao converter parlamentar {dados.get('id', 'desconhecido')}: {e}")
            return None

    def _inferir_cargo(self, cargo_str: str, casa: CasaLegislativaEnum, genero: Optional[str]) -> CargoEnum:
        """Infere o cargo baseado na string e casa legislativa"""
        genero = genero or "masculino"

        if casa == CasaLegislativaEnum.camara_federal:
            return CargoEnum.deputada_federal if genero == "feminino" else CargoEnum.deputado_federal
        elif casa == CasaLegislativaEnum.senado:
            return CargoEnum.senadora if genero == "feminino" else CargoEnum.senador
        else:  # CLDF
            return CargoEnum.deputada_distrital if genero == "feminino" else CargoEnum.deputado_distrital

    def _extrair_temas(
        self,
        temas_atuacao: List[str],
        comissoes: List[str],
        frentes: List[str]
    ) -> List[str]:
        """Extrai temas dominantes das atividades parlamentares"""
        temas = set(temas_atuacao)

        # Extrair temas de comissões
        palavras_chave = [
            "educação", "saúde", "segurança", "economia", "meio ambiente",
            "direitos humanos", "trabalho", "agricultura", "cultura", "esporte",
            "transporte", "habitação", "ciência", "tecnologia", "mulher",
            "criança", "idoso", "juventude"
        ]

        for item in comissoes + frentes:
            item_lower = item.lower()
            for palavra in palavras_chave:
                if palavra in item_lower:
                    temas.add(palavra.title())

        return list(temas)[:10]  # Limitar a 10 temas

    def _calcular_completude(self, fatos: ParlamentarFatos) -> float:
        """Calcula percentual de completude do perfil"""
        campos_importantes = [
            "nome_civil", "nome_parlamentar", "partido", "cargo",
            "data_nascimento", "genero", "email", "url_foto_oficial",
            "formacao_academica", "comissoes_atuais"
        ]

        preenchidos = 0
        for campo in campos_importantes:
            valor = getattr(fatos, campo, None)
            if valor and (not isinstance(valor, list) or len(valor) > 0):
                preenchidos += 1

        return round((preenchidos / len(campos_importantes)) * 100, 1)

    async def carregar_todos(self, forcar_reload: bool = False) -> None:
        """Carrega todos os parlamentares dos arquivos JSON"""
        if self._loaded and not forcar_reload:
            return

        self._cache.clear()

        # Carregar dos arquivos JSON legados na pasta agentes/
        arquivos = [
            (AGENTES_DIR / "banco-deputados-federais-df.json", CasaLegislativaEnum.camara_federal),
            (AGENTES_DIR / "banco-senadores-df.json", CasaLegislativaEnum.senado),
            (AGENTES_DIR / "banco-deputados-distritais-df.json", CasaLegislativaEnum.cldf),
        ]

        for arquivo, casa in arquivos:
            parlamentares = self._carregar_json_legado(arquivo, casa)
            for p in parlamentares:
                self._cache[p.id] = p

        self._loaded = True
        self._snapshot_date = datetime.now().strftime("%Y-%m-%d")
        logger.info(f"Total de parlamentares carregados: {len(self._cache)}")

    async def listar(self, filtros: FiltrosParlamentar) -> Dict[str, Any]:
        """Lista parlamentares com filtros"""
        await self.carregar_todos()

        resultado = list(self._cache.values())

        # Aplicar filtros
        if filtros.casas:
            resultado = [p for p in resultado if p.fatos.casa_legislativa in filtros.casas]

        if filtros.partidos:
            resultado = [p for p in resultado if p.fatos.partido in filtros.partidos]

        if filtros.ufs:
            resultado = [p for p in resultado if p.fatos.uf in filtros.ufs]

        if filtros.generos:
            resultado = [p for p in resultado if p.fatos.genero in filtros.generos]

        if filtros.busca_texto:
            busca = filtros.busca_texto.lower()
            resultado = [
                p for p in resultado
                if busca in p.fatos.nome_parlamentar.lower()
                or busca in p.fatos.nome_civil.lower()
                or busca in p.fatos.partido.lower()
            ]

        # Ordenar
        reverse = filtros.ordem == "desc"
        if filtros.ordenar_por == "nome_parlamentar":
            resultado.sort(key=lambda p: p.fatos.nome_parlamentar, reverse=reverse)
        elif filtros.ordenar_por == "partido":
            resultado.sort(key=lambda p: p.fatos.partido, reverse=reverse)
        elif filtros.ordenar_por == "votos":
            resultado.sort(key=lambda p: p.fatos.votos_ultima_eleicao or 0, reverse=reverse)

        # Paginar
        total = len(resultado)
        inicio = (filtros.pagina - 1) * filtros.por_pagina
        fim = inicio + filtros.por_pagina
        resultado_paginado = resultado[inicio:fim]

        # Converter para response
        parlamentares_response = [
            ParlamentarResponse(
                id=p.fatos.id,
                nome=p.fatos.nome_civil,
                nome_parlamentar=p.fatos.nome_parlamentar,
                casa_legislativa=p.fatos.casa_legislativa,
                cargo=p.fatos.cargo,
                partido=p.fatos.partido,
                uf=p.fatos.uf,
                url_foto=p.fatos.url_foto_oficial,
                completude_perfil=p.derivados.completude_perfil.valor if p.derivados.completude_perfil else 0.0
            )
            for p in resultado_paginado
        ]

        return {
            "parlamentares": parlamentares_response,
            "total": total,
            "pagina": filtros.pagina,
            "por_pagina": filtros.por_pagina,
            "total_paginas": (total + filtros.por_pagina - 1) // filtros.por_pagina,
            "filtros_aplicados": filtros.model_dump(exclude_none=True)
        }

    async def obter_por_id(self, id: str) -> Optional[ParlamentarProfile]:
        """Obtém parlamentar por ID"""
        await self.carregar_todos()
        return self._cache.get(id)

    async def obter_por_ids(self, ids: List[str]) -> List[ParlamentarProfile]:
        """Obtém múltiplos parlamentares por IDs"""
        await self.carregar_todos()
        return [self._cache[id] for id in ids if id in self._cache]

    async def obter_estatisticas(self, filtros: Optional[FiltrosParlamentar] = None) -> EstatisticasParlamentares:
        """Calcula estatísticas dos parlamentares"""
        await self.carregar_todos()

        parlamentares = list(self._cache.values())

        # Aplicar filtros se fornecidos
        if filtros and filtros.casas:
            parlamentares = [p for p in parlamentares if p.fatos.casa_legislativa in filtros.casas]

        # Calcular estatísticas
        por_casa = {}
        por_partido = {}
        por_genero = {}
        por_uf = {}
        completudes = []

        for p in parlamentares:
            # Por casa
            casa = p.fatos.casa_legislativa.value
            por_casa[casa] = por_casa.get(casa, 0) + 1

            # Por partido
            partido = p.fatos.partido
            por_partido[partido] = por_partido.get(partido, 0) + 1

            # Por gênero
            genero = p.fatos.genero.value if p.fatos.genero else "não_informado"
            por_genero[genero] = por_genero.get(genero, 0) + 1

            # Por UF
            uf = p.fatos.uf
            por_uf[uf] = por_uf.get(uf, 0) + 1

            # Completude
            if p.derivados.completude_perfil:
                completudes.append(p.derivados.completude_perfil.valor)

        return EstatisticasParlamentares(
            total=len(parlamentares),
            por_casa=por_casa,
            por_partido=por_partido,
            por_genero=por_genero,
            por_uf=por_uf,
            completude_media=sum(completudes) / len(completudes) if completudes else 0.0,
            data_ultimo_snapshot=self._snapshot_date
        )

    async def obter_ids_por_casa(self, casa: CasaLegislativaEnum) -> List[str]:
        """Retorna IDs de parlamentares de uma casa específica"""
        await self.carregar_todos()
        return [
            p.fatos.id
            for p in self._cache.values()
            if p.fatos.casa_legislativa == casa
        ]
