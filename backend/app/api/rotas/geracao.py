"""
Rotas de Geração de Eleitores

Endpoints para gerenciar eleitores gerados por IA.
Inclui salvamento, validação e sincronização com o banco principal.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import DadosToken, obter_usuario_atual
from app.servicos.eleitor_servico import EleitorServico, obter_servico_eleitores

router = APIRouter()


def get_servico() -> EleitorServico:
    """Dependência para obter o serviço de eleitores"""
    return obter_servico_eleitores()


# ============================================
# SCHEMAS
# ============================================


class EleitorGeradoSchema(BaseModel):
    """Schema flexível para eleitor gerado por IA"""

    id: Optional[str] = None
    nome: str
    idade: int = Field(ge=16, le=120)
    genero: str
    cor_raca: str
    regiao_administrativa: str
    local_referencia: Optional[str] = None
    cluster_socioeconomico: str
    escolaridade: str
    profissao: str
    ocupacao_vinculo: str
    renda_salarios_minimos: str
    religiao: str
    estado_civil: str
    filhos: int = Field(ge=0, default=0)
    orientacao_politica: str
    posicao_bolsonaro: str
    interesse_politico: str
    tolerancia_nuance: Optional[str] = None
    estilo_decisao: Optional[str] = None
    valores: List[str] = Field(default_factory=list)
    preocupacoes: List[str] = Field(default_factory=list)
    medos: List[str] = Field(default_factory=list)
    vieses_cognitivos: List[str] = Field(default_factory=list)
    fontes_informacao: List[str] = Field(default_factory=list)
    susceptibilidade_desinformacao: int = Field(ge=1, le=10, default=5)
    meio_transporte: Optional[str] = None
    tempo_deslocamento_trabalho: Optional[str] = None
    voto_facultativo: bool = False
    conflito_identitario: bool = False
    historia_resumida: str
    instrucao_comportamental: Optional[str] = None
    criado_em: Optional[str] = None
    atualizado_em: Optional[str] = None

    class Config:
        extra = "allow"  # Permite campos extras


class SalvarEleitoresGeradosRequest(BaseModel):
    """Request para salvar eleitores gerados"""

    eleitores: List[Dict[str, Any]]
    modo_corretivo: bool = False
    divergencias_corrigidas: Optional[List[str]] = None


class SalvarEleitoresGeradosResponse(BaseModel):
    """Response do salvamento de eleitores"""

    sucesso: bool
    total_recebidos: int
    total_salvos: int
    total_erros: int
    erros: List[str] = Field(default_factory=list)
    ids_criados: List[str] = Field(default_factory=list)
    total_eleitores_banco: int


class ValidarCoerenciaResponse(BaseModel):
    """Response da validação de coerência"""

    valido: bool
    erros: List[str] = Field(default_factory=list)
    avisos: List[str] = Field(default_factory=list)


# ============================================
# VALIDAÇÃO DE COERÊNCIA
# ============================================


def validar_coerencia_eleitor(eleitor: Dict[str, Any]) -> tuple[bool, List[str], List[str]]:
    """
    Valida a coerência interna de um eleitor gerado.

    Retorna:
        (valido, erros, avisos)
    """
    erros: List[str] = []
    avisos: List[str] = []

    nome = eleitor.get("nome", "Desconhecido")
    idade = eleitor.get("idade", 0)
    cluster = eleitor.get("cluster_socioeconomico", "")
    regiao = eleitor.get("regiao_administrativa", "")
    ocupacao = eleitor.get("ocupacao_vinculo", "")
    renda = eleitor.get("renda_salarios_minimos", "")
    escolaridade = eleitor.get("escolaridade", "")

    # Regiões por cluster
    regioes_g1 = {"Lago Sul", "Lago Norte", "Park Way", "Sudoeste", "Sudoeste/Octogonal", "Jardim Botânico"}
    regioes_g2 = {"Plano Piloto", "Águas Claras", "Aguas Claras", "Guará", "Cruzeiro", "Noroeste"}
    regioes_g3 = {"Taguatinga", "Gama", "Sobradinho", "Vicente Pires", "Núcleo Bandeirante", "Nucleo Bandeirante"}
    regioes_g4 = {
        "Ceilândia", "Ceilandia", "Samambaia", "Recanto das Emas", "Santa Maria",
        "Planaltina", "São Sebastião", "Sao Sebastiao", "Paranoá", "Paranoa",
        "Itapoã", "Itapoa", "Sol Nascente", "Sol Nascente/Pôr do Sol",
        "SCIA/Estrutural", "Estrutural", "Fercal", "Varjão", "Varjao"
    }

    # 1. Validar cluster vs região
    if cluster == "G1_alta" and regiao not in regioes_g1:
        avisos.append(f"{nome}: Cluster G1_alta em região {regiao} (esperado: Lago Sul, Lago Norte, etc.)")
    elif cluster == "G2_media_alta" and regiao not in regioes_g2 | regioes_g1:
        avisos.append(f"{nome}: Cluster G2_media_alta em região {regiao}")
    elif cluster == "G4_baixa" and regiao in regioes_g1:
        erros.append(f"{nome}: Cluster G4_baixa não pode estar em {regiao}")

    # 2. Validar idade vs ocupação
    if idade >= 65 and ocupacao == "estudante":
        erros.append(f"{nome}: Idade {idade} com ocupação 'estudante' é improvável")
    if idade < 25 and ocupacao == "aposentado":
        erros.append(f"{nome}: Idade {idade} com ocupação 'aposentado' é impossível")
    if idade >= 70 and ocupacao not in ["aposentado", "autonomo", "empresario", "nao_se_aplica"]:
        avisos.append(f"{nome}: Idade {idade} com ocupação '{ocupacao}' é incomum")

    # 3. Validar renda vs ocupação
    if ocupacao == "desempregado" and renda in ["mais_de_5_ate_10", "mais_de_10"]:
        erros.append(f"{nome}: Desempregado com renda alta é contraditório")
    if ocupacao == "servidor_publico" and renda == "ate_1":
        erros.append(f"{nome}: Servidor público com renda mínima é impossível")

    # 4. Validar renda vs escolaridade (flexível)
    if renda == "mais_de_10" and escolaridade == "fundamental_incompleto":
        avisos.append(f"{nome}: Renda alta com escolaridade fundamental_incompleto é incomum")

    # 5. Campos obrigatórios
    campos_obrigatorios = [
        "nome", "idade", "genero", "regiao_administrativa",
        "cluster_socioeconomico", "orientacao_politica", "historia_resumida"
    ]
    for campo in campos_obrigatorios:
        if not eleitor.get(campo):
            erros.append(f"{nome}: Campo obrigatório '{campo}' está vazio")

    return len(erros) == 0, erros, avisos


# ============================================
# ENDPOINTS
# ============================================


@router.post("/salvar", response_model=SalvarEleitoresGeradosResponse)
async def salvar_eleitores_gerados(
    request: SalvarEleitoresGeradosRequest,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Salva eleitores gerados por IA no banco de dados principal.

    Este endpoint:
    1. Valida coerência interna de cada eleitor
    2. Gera IDs únicos para eleitores sem ID
    3. Adiciona ao arquivo banco-eleitores-df.json
    4. Retorna estatísticas e lista de IDs criados

    Os eleitores são ADICIONADOS ao banco existente (não substituem).
    """
    eleitores = request.eleitores
    total_recebidos = len(eleitores)
    erros_gerais: List[str] = []
    avisos_gerais: List[str] = []
    eleitores_validos: List[Dict[str, Any]] = []

    # Validar cada eleitor
    for i, eleitor in enumerate(eleitores):
        valido, erros, avisos = validar_coerencia_eleitor(eleitor)
        avisos_gerais.extend(avisos)

        if valido:
            eleitores_validos.append(eleitor)
        else:
            erros_gerais.extend([f"Eleitor {i+1}: {e}" for e in erros])

    # Salvar eleitores válidos
    if eleitores_validos:
        resultado = servico.importar_json(eleitores_validos)
        ids_criados = [e.get("id", "") for e in eleitores_validos if e.get("id")]

        # Obter IDs dos que foram salvos (podem ter sido gerados pelo serviço)
        total_salvos = resultado.total_adicionados
        erros_importacao = resultado.erros

        return SalvarEleitoresGeradosResponse(
            sucesso=total_salvos > 0,
            total_recebidos=total_recebidos,
            total_salvos=total_salvos,
            total_erros=len(erros_gerais) + len(erros_importacao),
            erros=erros_gerais + erros_importacao,
            ids_criados=ids_criados[:total_salvos],
            total_eleitores_banco=len(servico._eleitores),
        )

    return SalvarEleitoresGeradosResponse(
        sucesso=False,
        total_recebidos=total_recebidos,
        total_salvos=0,
        total_erros=len(erros_gerais),
        erros=erros_gerais,
        ids_criados=[],
        total_eleitores_banco=len(servico._eleitores),
    )


@router.post("/validar-coerencia")
async def validar_coerencia(
    eleitores: List[Dict[str, Any]] = Body(...),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Valida a coerência interna de uma lista de eleitores SEM salvá-los.

    Útil para preview antes de salvar.
    """
    todos_erros: List[str] = []
    todos_avisos: List[str] = []
    validos = 0

    for i, eleitor in enumerate(eleitores):
        valido, erros, avisos = validar_coerencia_eleitor(eleitor)
        if valido:
            validos += 1
        todos_erros.extend([f"Eleitor {i+1}: {e}" for e in erros])
        todos_avisos.extend([f"Eleitor {i+1}: {a}" for a in avisos])

    return {
        "total": len(eleitores),
        "validos": validos,
        "invalidos": len(eleitores) - validos,
        "erros": todos_erros,
        "avisos": todos_avisos,
    }


@router.get("/estatisticas-banco")
async def obter_estatisticas_banco(
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna estatísticas do banco de eleitores atual.

    Inclui total de eleitores e distribuição por categorias principais.
    """
    estatisticas = servico.obter_estatisticas()

    return {
        "total_eleitores": estatisticas.get("total", 0),
        "distribuicao": {
            "por_genero": estatisticas.get("por_genero", []),
            "por_cluster": estatisticas.get("por_cluster", []),
            "por_orientacao_politica": estatisticas.get("por_orientacao_politica", []),
            "por_religiao": estatisticas.get("por_religiao", []),
            "por_faixa_etaria": estatisticas.get("por_faixa_etaria", []),
        },
    }


@router.delete("/limpar-gerados")
async def limpar_eleitores_gerados(
    prefixo_id: str = "df-gen-",
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove eleitores gerados por IA (identificados pelo prefixo do ID).

    Por padrão, remove eleitores com ID começando em 'df-gen-'.
    Use com cuidado - esta ação é irreversível.
    """
    ids_para_remover = [
        e.get("id", "") for e in servico._eleitores
        if e.get("id", "").startswith(prefixo_id)
    ]

    removidos = 0
    for eleitor_id in ids_para_remover:
        if servico.deletar(eleitor_id):
            removidos += 1

    return {
        "sucesso": True,
        "total_removidos": removidos,
        "total_eleitores_restantes": len(servico._eleitores),
    }
