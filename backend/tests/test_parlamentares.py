"""
Testes do módulo de Parlamentares.

Testa models, services, integration e routes.
"""

import pytest
from datetime import datetime
from typing import Dict, Any

from app.parlamentares.models import (
    CasaLegislativaEnum,
    CargoEnum,
    GeneroEnum,
    OrientacaoPoliticaEnum,
    NivelConfiancaEnum,
    ParlamentarFatos,
    ParlamentarDerivados,
    ParlamentarHipoteses,
    ParlamentarProfile,
    FiltrosParlamentar,
    MetricaDerivada,
    Hipotese,
)
from app.parlamentares.integration import (
    ParlamentarAgentAdapter,
    adaptar_parlamentar_para_entrevista,
)


# ============================================
# FIXTURES
# ============================================


@pytest.fixture
def fatos_deputado_federal():
    """Fatos de um deputado federal de exemplo."""
    return ParlamentarFatos(
        id="dep-001",
        id_externo="12345",
        casa_legislativa=CasaLegislativaEnum.camara_federal,
        nome_civil="João da Silva Santos",
        nome_parlamentar="João Santos",
        data_nascimento="1970-05-15",
        genero=GeneroEnum.masculino,
        naturalidade="Brasília",
        uf_nascimento="DF",
        cargo=CargoEnum.deputado_federal,
        partido="PT",
        uf="DF",
        legislatura=57,
        mandato_inicio="2023-02-01",
        votos_ultima_eleicao=85000,
        email="joao.santos@camara.leg.br",
        formacao_academica=["Direito - UnB", "Mestrado em Ciências Políticas"],
        profissao_declarada="Advogado",
        comissoes_atuais=["CCJC", "CFT"],
        frentes_parlamentares=["Frente em Defesa da Democracia", "Frente Ambientalista"],
        cargos_lideranca=["Vice-líder do partido"],
    )


@pytest.fixture
def fatos_senadora():
    """Fatos de uma senadora de exemplo."""
    return ParlamentarFatos(
        id="sen-001",
        casa_legislativa=CasaLegislativaEnum.senado,
        nome_civil="Maria Oliveira Costa",
        nome_parlamentar="Maria Oliveira",
        genero=GeneroEnum.feminino,
        cargo=CargoEnum.senadora,
        partido="MDB",
        uf="DF",
        legislatura=57,
        votos_ultima_eleicao=500000,
        comissoes_atuais=["CCJ", "CAS"],
        frentes_parlamentares=["Frente Parlamentar Mista da Mulher"],
    )


@pytest.fixture
def fatos_deputado_distrital():
    """Fatos de um deputado distrital de exemplo."""
    return ParlamentarFatos(
        id="cldf-001",
        casa_legislativa=CasaLegislativaEnum.cldf,
        nome_civil="Carlos Ferreira Lima",
        nome_parlamentar="Carlos Ferreira",
        genero=GeneroEnum.masculino,
        cargo=CargoEnum.deputado_distrital,
        partido="PL",
        uf="DF",
        legislatura=9,
        votos_ultima_eleicao=25000,
        comissoes_atuais=["Comissão de Segurança"],
        frentes_parlamentares=["Frente Evangélica"],
    )


@pytest.fixture
def derivados_exemplo():
    """Derivados de exemplo."""
    return ParlamentarDerivados(
        idade=MetricaDerivada(
            valor=54,
            metodo_calculo="data_atual - data_nascimento",
            dados_base=["data_nascimento"]
        ),
        completude_perfil=MetricaDerivada(
            valor=85.0,
            metodo_calculo="(campos_preenchidos / total_campos) * 100",
            dados_base=["todos os campos"]
        ),
        temas_dominantes=MetricaDerivada(
            valor=["Justiça", "Economia", "Meio Ambiente"],
            metodo_calculo="Extração de temas das comissões",
            dados_base=["comissoes_atuais", "frentes_parlamentares"]
        ),
    )


@pytest.fixture
def hipoteses_exemplo():
    """Hipóteses de exemplo."""
    return ParlamentarHipoteses(
        orientacao_politica=Hipotese(
            label="orientacao_politica",
            valor="centro-esquerda",
            confianca=NivelConfiancaEnum.alta,
            rationale="Baseado no histórico de votações e filiação partidária",
            evidencias=["Votou a favor de pautas sociais", "Membro do PT"]
        ),
        posicao_bolsonaro=Hipotese(
            label="posicao_bolsonaro",
            valor="critico_forte",
            confianca=NivelConfiancaEnum.alta,
            rationale="Declarações públicas e votações contrárias",
            evidencias=["Votou contra medidas do governo Bolsonaro"]
        ),
        valores_inferidos=Hipotese(
            label="valores",
            valor=["democracia", "justiça social", "sustentabilidade"],
            confianca=NivelConfiancaEnum.media,
            rationale="Baseado nas frentes e comissões",
            evidencias=["Membro da Frente em Defesa da Democracia"]
        ),
        preocupacoes_inferidas=Hipotese(
            label="preocupacoes",
            valor=["desigualdade", "desmatamento", "corrupção"],
            confianca=NivelConfiancaEnum.media,
            rationale="Temas recorrentes em discursos",
            evidencias=[]
        ),
        estilo_comunicacao=Hipotese(
            label="estilo",
            valor="técnico e formal",
            confianca=NivelConfiancaEnum.media,
            rationale="Formação jurídica influencia o discurso",
            evidencias=["Advogado de formação"]
        ),
    )


@pytest.fixture
def profile_deputado_federal(fatos_deputado_federal, derivados_exemplo, hipoteses_exemplo):
    """Profile completo de deputado federal."""
    return ParlamentarProfile(
        fatos=fatos_deputado_federal,
        derivados=derivados_exemplo,
        hipoteses=hipoteses_exemplo,
    )


@pytest.fixture
def profile_senadora(fatos_senadora):
    """Profile de senadora (sem derivados/hipóteses customizados)."""
    return ParlamentarProfile(fatos=fatos_senadora)


@pytest.fixture
def profile_deputado_distrital(fatos_deputado_distrital):
    """Profile de deputado distrital (sem derivados/hipóteses customizados)."""
    return ParlamentarProfile(fatos=fatos_deputado_distrital)


# ============================================
# TESTES DE MODELS
# ============================================


class TestParlamentarModels:
    """Testes dos modelos Pydantic."""

    def test_criar_fatos_minimos(self):
        """Testa criação de fatos com campos mínimos obrigatórios."""
        fatos = ParlamentarFatos(
            id="dep-teste",
            casa_legislativa=CasaLegislativaEnum.camara_federal,
            nome_civil="Teste",
            nome_parlamentar="Teste",
            cargo=CargoEnum.deputado_federal,
            partido="PT",
        )
        assert fatos.id == "dep-teste"
        assert fatos.casa_legislativa == CasaLegislativaEnum.camara_federal
        assert fatos.uf == "DF"  # default

    def test_criar_fatos_completos(self, fatos_deputado_federal):
        """Testa criação de fatos com todos os campos."""
        assert fatos_deputado_federal.id == "dep-001"
        assert fatos_deputado_federal.nome_parlamentar == "João Santos"
        assert fatos_deputado_federal.partido == "PT"
        assert len(fatos_deputado_federal.comissoes_atuais) == 2
        assert len(fatos_deputado_federal.frentes_parlamentares) == 2

    def test_derivados_defaults(self):
        """Testa que derivados têm valores default corretos."""
        derivados = ParlamentarDerivados()
        assert derivados.completude_perfil.valor == 0.0
        assert derivados.temas_dominantes.valor == []
        assert derivados.idade is None

    def test_hipoteses_defaults(self):
        """Testa que hipóteses são None por default."""
        hipoteses = ParlamentarHipoteses()
        assert hipoteses.orientacao_politica is None
        assert hipoteses.posicao_bolsonaro is None
        assert hipoteses.valores_inferidos is None

    def test_profile_completo(self, profile_deputado_federal):
        """Testa criação de profile completo."""
        assert profile_deputado_federal.id == "dep-001"
        assert profile_deputado_federal.nome == "João Santos"
        assert profile_deputado_federal.partido == "PT"
        assert profile_deputado_federal.casa == CasaLegislativaEnum.camara_federal

    def test_profile_minimo(self, fatos_deputado_federal):
        """Testa criação de profile apenas com fatos."""
        profile = ParlamentarProfile(fatos=fatos_deputado_federal)
        assert profile.derivados is not None  # default
        assert profile.hipoteses is not None  # default

    def test_filtros_parlamentar(self):
        """Testa modelo de filtros."""
        filtros = FiltrosParlamentar(
            casas=[CasaLegislativaEnum.camara_federal],
            partidos=["PT", "MDB"],
            pagina=1,
            por_pagina=50,
        )
        assert len(filtros.casas) == 1
        assert len(filtros.partidos) == 2
        assert filtros.pagina == 1


# ============================================
# TESTES DE INTEGRATION
# ============================================


class TestParlamentarIntegration:
    """Testes do adapter de integração."""

    def test_adapter_to_agent_dict_basico(self, profile_deputado_federal):
        """Testa conversão básica para dict de agente."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        assert agent_dict["id"] == "dep-001"
        assert agent_dict["nome"] == "João Santos"
        assert agent_dict["tipo"] == "parlamentar"
        assert agent_dict["genero"] == "masculino"
        assert agent_dict["interesse_politico"] == "alto"

    def test_adapter_cartao_identidade(self, profile_deputado_federal):
        """Testa cartão de identidade no dict de agente."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        cartao = agent_dict["cartao_identidade"]
        assert cartao["id"] == "dep-001"
        assert cartao["tipo_agente"] == "parlamentar"
        assert cartao["casa_legislativa"] == "camara_federal"
        assert cartao["partido"] == "PT"
        assert cartao["cargo"] == "deputado_federal"

    def test_adapter_contexto_parlamentar(self, profile_deputado_federal):
        """Testa contexto parlamentar no dict de agente."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        contexto = agent_dict["contexto_parlamentar"]
        assert "comissoes" in contexto
        assert "frentes_parlamentares" in contexto
        assert len(contexto["comissoes"]) == 2

    def test_adapter_valores_hipoteses(self, profile_deputado_federal):
        """Testa extração de valores de hipóteses."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        assert agent_dict["orientacao_politica"] == "centro-esquerda"
        assert agent_dict["posicao_bolsonaro"] == "critico_forte"
        assert "democracia" in agent_dict["valores"]
        assert "desigualdade" in agent_dict["preocupacoes"]

    def test_adapter_sem_hipoteses(self, profile_senadora):
        """Testa adapter com profile sem hipóteses customizadas."""
        adapter = ParlamentarAgentAdapter(profile_senadora)
        agent_dict = adapter.to_agent_dict()

        assert agent_dict["id"] == "sen-001"
        assert agent_dict["orientacao_politica"] is None
        assert agent_dict["valores"] == []
        assert agent_dict["preocupacoes"] == []

    def test_adapter_instrucao_comportamental(self, profile_deputado_federal):
        """Testa geração de instrução comportamental."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        instrucao = agent_dict["instrucao_comportamental"]
        assert "João Santos" in instrucao
        assert "deputado federal" in instrucao.lower() or "deputado_federal" in instrucao

    def test_adapter_historia_resumida(self, profile_deputado_federal):
        """Testa geração de história resumida."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        historia = agent_dict["historia_resumida"]
        assert "João Santos" in historia
        assert "PT" in historia
        assert "DF" in historia

    def test_adapter_base_eleitoral(self, profile_deputado_federal):
        """Testa inferência de base eleitoral."""
        adapter = ParlamentarAgentAdapter(profile_deputado_federal)
        agent_dict = adapter.to_agent_dict()

        base = agent_dict["base_eleitoral"]
        assert "PT" in base  # partido deve estar na base

    def test_funcao_utilitaria(self, profile_deputado_federal):
        """Testa função utilitária adaptar_parlamentar_para_entrevista."""
        agent_dict = adaptar_parlamentar_para_entrevista(profile_deputado_federal)
        assert agent_dict["id"] == "dep-001"
        assert agent_dict["tipo"] == "parlamentar"

    def test_adapter_diferentes_casas(
        self, profile_deputado_federal, profile_senadora, profile_deputado_distrital
    ):
        """Testa adapter com parlamentares de diferentes casas."""
        for profile, casa_esperada in [
            (profile_deputado_federal, "camara_federal"),
            (profile_senadora, "senado"),
            (profile_deputado_distrital, "cldf"),
        ]:
            agent_dict = adaptar_parlamentar_para_entrevista(profile)
            assert agent_dict["cartao_identidade"]["casa_legislativa"] == casa_esperada


# ============================================
# TESTES DE SERVICES
# ============================================


class TestParlamentarService:
    """Testes do serviço de parlamentares."""

    @pytest.mark.asyncio
    async def test_carregar_todos(self):
        """Testa carregamento de todos os parlamentares."""
        from app.parlamentares.services import ParlamentarService

        servico = ParlamentarService()
        await servico.carregar_todos()

        # Verifica se carregou (atributo interno é _cache)
        assert servico._cache is not None
        assert servico._loaded is True

    @pytest.mark.asyncio
    async def test_listar_com_filtros(self):
        """Testa listagem com filtros."""
        from app.parlamentares.services import ParlamentarService

        servico = ParlamentarService()
        await servico.carregar_todos()

        filtros = FiltrosParlamentar(
            pagina=1,
            por_pagina=10,
        )

        resultado = await servico.listar(filtros)
        assert "parlamentares" in resultado
        assert "total" in resultado
        assert "pagina" in resultado

    @pytest.mark.asyncio
    async def test_obter_estatisticas(self):
        """Testa obtenção de estatísticas."""
        from app.parlamentares.services import ParlamentarService

        servico = ParlamentarService()
        await servico.carregar_todos()

        stats = await servico.obter_estatisticas()
        assert hasattr(stats, "total")
        assert hasattr(stats, "por_casa")
        assert hasattr(stats, "por_partido")


# ============================================
# TESTES DE ROUTES (API)
# ============================================


class TestParlamentaresAPI:
    """Testes dos endpoints da API."""

    def test_listar_parlamentares(self, client, auth_headers):
        """Testa endpoint de listagem."""
        response = client.get("/api/v1/parlamentares/", headers=auth_headers)
        assert response.status_code == 200

        data = response.json()
        assert "parlamentares" in data
        assert "total" in data
        assert "pagina" in data

    def test_listar_parlamentares_sem_auth(self, client):
        """Testa endpoint sem autenticação."""
        response = client.get("/api/v1/parlamentares/")
        assert response.status_code == 401

    def test_listar_com_filtro_casa(self, client, auth_headers):
        """Testa listagem filtrada por casa."""
        response = client.get(
            "/api/v1/parlamentares/?casas=camara_federal",
            headers=auth_headers
        )
        assert response.status_code == 200

    def test_listar_com_filtro_partido(self, client, auth_headers):
        """Testa listagem filtrada por partido."""
        response = client.get(
            "/api/v1/parlamentares/?partidos=PT,MDB",
            headers=auth_headers
        )
        assert response.status_code == 200

    def test_obter_estatisticas(self, client, auth_headers):
        """Testa endpoint de estatísticas."""
        response = client.get(
            "/api/v1/parlamentares/estatisticas",
            headers=auth_headers
        )
        assert response.status_code == 200

        data = response.json()
        assert "total" in data
        assert "por_casa" in data

    def test_listar_por_casa(self, client, auth_headers):
        """Testa endpoint de listagem por casa específica."""
        response = client.get(
            "/api/v1/parlamentares/por-casa/senado",
            headers=auth_headers
        )
        assert response.status_code == 200

    def test_listar_ids(self, client, auth_headers):
        """Testa endpoint de listagem de IDs."""
        response = client.get(
            "/api/v1/parlamentares/ids",
            headers=auth_headers
        )
        assert response.status_code == 200

        data = response.json()
        assert "ids" in data
        assert "total" in data

    def test_obter_parlamentar_inexistente(self, client, auth_headers):
        """Testa obtenção de parlamentar que não existe."""
        response = client.get(
            "/api/v1/parlamentares/inexistente-999",
            headers=auth_headers
        )
        assert response.status_code == 404


# ============================================
# TESTES DE PROMPT
# ============================================


class TestParlamentarPrompt:
    """Testes do construtor de prompts."""

    def test_construir_prompt_basico(self, profile_deputado_federal):
        """Testa construção de prompt básico."""
        from app.servicos.parlamentar_prompt import construir_prompt_parlamentar

        agent_dict = adaptar_parlamentar_para_entrevista(profile_deputado_federal)
        prompt = construir_prompt_parlamentar(
            parlamentar=agent_dict,
            pergunta="Qual sua posição sobre reforma tributária?",
            tipo_pergunta="aberta",
        )

        assert "João Santos" in prompt
        assert "PT" in prompt
        assert "reforma tributária" in prompt

    def test_construir_prompt_com_opcoes(self, profile_deputado_federal):
        """Testa construção de prompt com opções."""
        from app.servicos.parlamentar_prompt import construir_prompt_parlamentar

        agent_dict = adaptar_parlamentar_para_entrevista(profile_deputado_federal)
        prompt = construir_prompt_parlamentar(
            parlamentar=agent_dict,
            pergunta="Você apoia a reforma tributária?",
            tipo_pergunta="escolha_unica",
            opcoes=["Sim", "Não", "Parcialmente"],
        )

        assert "Sim" in prompt
        assert "Não" in prompt
        assert "Parcialmente" in prompt

    def test_construir_prompt_simplificado(self, profile_deputado_federal):
        """Testa construção de prompt simplificado."""
        from app.servicos.parlamentar_prompt import construir_prompt_parlamentar_simplificado

        agent_dict = adaptar_parlamentar_para_entrevista(profile_deputado_federal)
        prompt = construir_prompt_parlamentar_simplificado(
            parlamentar=agent_dict,
            pergunta="Qual sua opinião?",
            tipo_pergunta="aberta",
        )

        # Prompt simplificado deve ser menor
        assert len(prompt) < 2000


# ============================================
# TESTES DE HELPER
# ============================================


class TestParlamentarHelper:
    """Testes do helper de parlamentares."""

    def test_contar_parlamentares(self):
        """Testa contagem de parlamentares."""
        from app.servicos.parlamentar_helper import contar_parlamentares

        contagem = contar_parlamentares()
        assert "total" in contagem
        assert "camara_federal" in contagem
        assert "senado" in contagem
        assert "cldf" in contagem

    def test_obter_parlamentar_inexistente(self):
        """Testa obtenção de parlamentar inexistente."""
        from app.servicos.parlamentar_helper import obter_parlamentar_por_id

        resultado = obter_parlamentar_por_id("inexistente-999")
        assert resultado is None

    def test_obter_parlamentares_lista_vazia(self):
        """Testa obtenção com lista vazia de IDs."""
        from app.servicos.parlamentar_helper import obter_parlamentares_por_ids

        resultado = obter_parlamentares_por_ids([])
        assert resultado == []
