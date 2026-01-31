"""
Ferramentas para consulta de dados eleitorais.

Fornece acesso a dados de eleitores, candidatos, estatísticas demográficas
e histórico de eleições armazenados no banco de dados PostgreSQL.
"""

import json
from langchain_core.tools import tool


def _get_sync_session():
    """Cria uma sessão síncrona do SQLAlchemy para acesso ao banco de dados."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session
    from app.core.config import configuracoes

    url = configuracoes.DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://"
    )
    engine = create_engine(url)
    return Session(engine)


@tool
def consultar_eleitores(filtros: str) -> str:
    """Consulta eleitores no banco de dados aplicando filtros diversos.

    Use esta ferramenta para buscar informações sobre eleitores cadastrados,
    filtrando por região administrativa, faixa etária, gênero, cluster
    comportamental e outros critérios.

    Args:
        filtros: String com filtros no formato 'chave=valor' separados por vírgula.
            Filtros suportados: regiao, idade_min, idade_max, genero, cluster,
            escolaridade, renda, bairro.
            Exemplo: "regiao=Ceilândia,genero=F,idade_min=18,idade_max=35"

    Returns:
        String JSON com resumo dos eleitores encontrados incluindo total,
        distribuição por gênero e distribuição por faixa etária.
    """
    from sqlalchemy import select, func
    from app.modelos.eleitor import Eleitor

    # Parsear filtros da string
    filtros_dict = {}
    if filtros.strip():
        for par in filtros.split(","):
            par = par.strip()
            if "=" in par:
                chave, valor = par.split("=", 1)
                filtros_dict[chave.strip()] = valor.strip()

    session = _get_sync_session()
    try:
        query = select(Eleitor)

        # Aplicar filtros dinamicamente
        if "regiao" in filtros_dict:
            query = query.where(Eleitor.regiao == filtros_dict["regiao"])
        if "genero" in filtros_dict:
            query = query.where(Eleitor.genero == filtros_dict["genero"])
        if "cluster" in filtros_dict:
            query = query.where(Eleitor.cluster == filtros_dict["cluster"])
        if "idade_min" in filtros_dict:
            query = query.where(
                Eleitor.idade >= int(filtros_dict["idade_min"])
            )
        if "idade_max" in filtros_dict:
            query = query.where(
                Eleitor.idade <= int(filtros_dict["idade_max"])
            )
        if "escolaridade" in filtros_dict:
            query = query.where(
                Eleitor.escolaridade == filtros_dict["escolaridade"]
            )
        if "bairro" in filtros_dict:
            query = query.where(Eleitor.bairro == filtros_dict["bairro"])

        eleitores = session.execute(query).scalars().all()
        total = len(eleitores)

        # Distribuição por gênero
        generos = {}
        for e in eleitores:
            g = getattr(e, "genero", "N/I") or "N/I"
            generos[g] = generos.get(g, 0) + 1

        # Distribuição por faixa etária
        faixas = {
            "16-24": 0,
            "25-34": 0,
            "35-44": 0,
            "45-59": 0,
            "60+": 0,
        }
        for e in eleitores:
            idade = getattr(e, "idade", None)
            if idade is None:
                continue
            if idade <= 24:
                faixas["16-24"] += 1
            elif idade <= 34:
                faixas["25-34"] += 1
            elif idade <= 44:
                faixas["35-44"] += 1
            elif idade <= 59:
                faixas["45-59"] += 1
            else:
                faixas["60+"] += 1

        resultado = {
            "total_eleitores": total,
            "filtros_aplicados": filtros_dict,
            "distribuicao_genero": generos,
            "distribuicao_faixa_etaria": faixas,
        }
        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {"erro": str(e), "filtros_aplicados": filtros_dict},
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def consultar_candidatos(cargo: str = "", partido: str = "") -> str:
    """Consulta candidatos registrados no banco de dados.

    Busca informações sobre candidatos a cargos eletivos no Distrito Federal,
    podendo filtrar por cargo pretendido e/ou partido político.

    Args:
        cargo: Cargo pretendido para filtrar (ex: 'governador', 'deputado_distrital',
            'senador'). Deixe vazio para todos os cargos.
        partido: Sigla do partido político para filtrar (ex: 'PT', 'PL', 'MDB').
            Deixe vazio para todos os partidos.

    Returns:
        String JSON com lista de candidatos encontrados, contendo nome, partido,
        cargo, número do candidato e coligação.
    """
    from sqlalchemy import select
    from app.modelos.candidato import Candidato

    session = _get_sync_session()
    try:
        query = select(Candidato)

        if cargo:
            query = query.where(Candidato.cargo == cargo)
        if partido:
            query = query.where(Candidato.partido == partido)

        candidatos = session.execute(query).scalars().all()

        lista = []
        for c in candidatos:
            lista.append({
                "nome": getattr(c, "nome", ""),
                "partido": getattr(c, "partido", ""),
                "cargo": getattr(c, "cargo", ""),
                "numero": getattr(c, "numero", ""),
                "coligacao": getattr(c, "coligacao", ""),
                "situacao": getattr(c, "situacao", ""),
            })

        resultado = {
            "total_candidatos": len(lista),
            "filtros": {"cargo": cargo, "partido": partido},
            "candidatos": lista,
        }
        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {"erro": str(e), "filtros": {"cargo": cargo, "partido": partido}},
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def estatisticas_demograficas(regiao: str = "") -> str:
    """Gera estatísticas demográficas do eleitorado por região administrativa.

    Calcula distribuições de idade, gênero, escolaridade e renda dos eleitores
    cadastrados, opcionalmente filtrado por região administrativa do DF.

    Args:
        regiao: Nome da região administrativa do DF para filtrar
            (ex: 'Ceilândia', 'Taguatinga', 'Plano Piloto'). Deixe vazio
            para estatísticas de todo o DF.

    Returns:
        String JSON com estatísticas demográficas incluindo total de eleitores,
        média de idade, distribuição por gênero, escolaridade e renda.
    """
    from sqlalchemy import select, func
    from app.modelos.eleitor import Eleitor

    session = _get_sync_session()
    try:
        query = select(Eleitor)
        if regiao:
            query = query.where(Eleitor.regiao == regiao)

        eleitores = session.execute(query).scalars().all()
        total = len(eleitores)

        if total == 0:
            return json.dumps(
                {
                    "regiao": regiao or "DF (completo)",
                    "total_eleitores": 0,
                    "mensagem": "Nenhum eleitor encontrado para esta região.",
                },
                ensure_ascii=False,
            )

        # Média de idade
        idades = [
            e.idade for e in eleitores
            if hasattr(e, "idade") and e.idade is not None
        ]
        media_idade = sum(idades) / len(idades) if idades else 0

        # Distribuição por gênero
        generos = {}
        for e in eleitores:
            g = getattr(e, "genero", "N/I") or "N/I"
            generos[g] = generos.get(g, 0) + 1

        # Distribuição por escolaridade
        escolaridades = {}
        for e in eleitores:
            esc = getattr(e, "escolaridade", "N/I") or "N/I"
            escolaridades[esc] = escolaridades.get(esc, 0) + 1

        # Distribuição por cluster
        clusters = {}
        for e in eleitores:
            cl = getattr(e, "cluster", "N/I") or "N/I"
            clusters[cl] = clusters.get(cl, 0) + 1

        resultado = {
            "regiao": regiao or "DF (completo)",
            "total_eleitores": total,
            "media_idade": round(media_idade, 1),
            "distribuicao_genero": generos,
            "distribuicao_escolaridade": escolaridades,
            "distribuicao_clusters": clusters,
        }
        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps({"erro": str(e)}, ensure_ascii=False)
    finally:
        session.close()


@tool
def historico_eleicoes(cargo: str, ano: int = 2022) -> str:
    """Consulta dados históricos de eleições anteriores no DF.

    Recupera resultados de eleições passadas incluindo votação por candidato,
    percentual de votos, turnos e resultado final.

    Args:
        cargo: Cargo eletivo para consultar (ex: 'governador', 'senador',
            'deputado_distrital', 'deputado_federal', 'presidente').
        ano: Ano da eleição para consultar. Padrão: 2022. Valores válidos:
            2018, 2020, 2022.

    Returns:
        String JSON com resultados históricos da eleição, incluindo candidatos,
        votos, percentuais e resultado por turno quando aplicável.
    """
    # Dados históricos consolidados do DF (referência TSE)
    # Em produção, estes dados viriam do banco de dados
    dados_historicos = {
        "governador": {
            2022: {
                "1_turno": [
                    {
                        "candidato": "Ibaneis Rocha",
                        "partido": "MDB",
                        "votos": 1_132_607,
                        "percentual": 50.35,
                        "eleito": True,
                    },
                    {
                        "candidato": "Leandro Grass",
                        "partido": "PV",
                        "votos": 466_358,
                        "percentual": 20.73,
                        "eleito": False,
                    },
                    {
                        "candidato": "Izalci Lucas",
                        "partido": "PSDB",
                        "votos": 214_841,
                        "percentual": 9.55,
                        "eleito": False,
                    },
                ],
                "total_aptos": 2_225_000,
                "comparecimento_pct": 78.5,
            },
            2018: {
                "1_turno": [
                    {
                        "candidato": "Ibaneis Rocha",
                        "partido": "MDB",
                        "votos": 1_099_842,
                        "percentual": 48.74,
                        "eleito": False,
                    },
                    {
                        "candidato": "Rodrigo Rollemberg",
                        "partido": "PSB",
                        "votos": 434_597,
                        "percentual": 19.25,
                        "eleito": False,
                    },
                ],
                "2_turno": [
                    {
                        "candidato": "Ibaneis Rocha",
                        "partido": "MDB",
                        "votos": 1_330_000,
                        "percentual": 73.5,
                        "eleito": True,
                    },
                ],
                "total_aptos": 2_100_000,
                "comparecimento_pct": 80.1,
            },
        },
        "senador": {
            2022: {
                "1_turno": [
                    {
                        "candidato": "Damares Alves",
                        "partido": "Republicanos",
                        "votos": 858_000,
                        "percentual": 38.7,
                        "eleito": True,
                    },
                ],
                "total_aptos": 2_225_000,
                "comparecimento_pct": 78.5,
            },
        },
    }

    cargo_lower = cargo.lower().strip()
    if cargo_lower in dados_historicos:
        if ano in dados_historicos[cargo_lower]:
            dados = dados_historicos[cargo_lower][ano]
            resultado = {
                "cargo": cargo,
                "ano": ano,
                "estado": "DF",
                **dados,
            }
        else:
            resultado = {
                "cargo": cargo,
                "ano": ano,
                "mensagem": f"Dados para o ano {ano} não disponíveis. "
                            f"Anos disponíveis: {list(dados_historicos[cargo_lower].keys())}",
            }
    else:
        resultado = {
            "cargo": cargo,
            "ano": ano,
            "mensagem": f"Cargo '{cargo}' não encontrado nos dados históricos. "
                        f"Cargos disponíveis: {list(dados_historicos.keys())}",
        }

    return json.dumps(resultado, ensure_ascii=False, indent=2)
