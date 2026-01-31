"""
Ferramentas para operações de campo e gestão de cabos eleitorais.

Permite listar cabos eleitorais, preparar mensagens para a rede de campo
e gerar relatórios de atividade de campo via WhatsApp.
"""

import json
from datetime import datetime, timedelta
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
def listar_cabos(regiao: str = "") -> str:
    """Lista cabos eleitorais cadastrados no sistema, com opção de filtro por região.

    Recupera a lista de cabos eleitorais (contatos com tipo 'cabo_eleitoral')
    registrados no banco de dados, incluindo informações de contato, região
    de atuação e status.

    Args:
        regiao: Região administrativa do DF para filtrar os cabos eleitorais.
            Deixe vazio para listar todos.
            Exemplos: "Ceilândia", "Taguatinga", "Samambaia", "Plano Piloto".

    Returns:
        String JSON com lista de cabos eleitorais incluindo nome, telefone,
        região de atuação, status e estatísticas resumidas.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        params = {}
        sql = """
            SELECT
                c.id,
                c.nome,
                c.telefone,
                c.regiao,
                c.observacoes,
                c.ativo,
                COUNT(DISTINCT conv.id) AS total_conversas,
                COUNT(m.id) AS total_mensagens,
                MAX(m.data_envio) AS ultima_atividade
            FROM contatos_whatsapp c
            LEFT JOIN conversas_whatsapp conv ON conv.contato_id = c.id
            LEFT JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE c.tipo = 'cabo_eleitoral'
        """

        if regiao:
            sql += " AND c.regiao = :regiao"
            params["regiao"] = regiao

        sql += """
            GROUP BY c.id, c.nome, c.telefone, c.regiao, c.observacoes, c.ativo
            ORDER BY c.nome
        """

        resultado_db = session.execute(text(sql), params).fetchall()

        cabos = []
        ativos = 0
        inativos = 0
        regioes_cobertas = set()

        for row in resultado_db:
            is_ativo = row[5] if row[5] is not None else True
            if is_ativo:
                ativos += 1
            else:
                inativos += 1

            regiao_cabo = row[3] or "Não definida"
            regioes_cobertas.add(regiao_cabo)

            cabos.append({
                "id": row[0],
                "nome": row[1],
                "telefone": row[2],
                "regiao": regiao_cabo,
                "observacoes": row[4],
                "ativo": is_ativo,
                "total_conversas": row[6] or 0,
                "total_mensagens": row[7] or 0,
                "ultima_atividade": row[8].isoformat() if row[8] else None,
            })

        resultado = {
            "filtro_regiao": regiao or "Todas",
            "resumo": {
                "total_cabos": len(cabos),
                "ativos": ativos,
                "inativos": inativos,
                "regioes_cobertas": sorted(list(regioes_cobertas)),
            },
            "cabos": cabos,
        }

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "filtro_regiao": regiao,
                "mensagem": (
                    "Erro ao listar cabos eleitorais. Verifique se a tabela "
                    "contatos_whatsapp está configurada."
                ),
            },
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def preparar_mensagem_cabos(mensagem: str, filtro_regiao: str = "") -> str:
    """Prepara mensagem formatada para envio aos cabos eleitorais via WhatsApp.

    Formata uma mensagem para distribuição à rede de cabos eleitorais,
    identificando os destinatários com base na região e gerando o texto
    formatado para WhatsApp com orientações operacionais.

    Args:
        mensagem: Conteúdo da mensagem a ser enviada aos cabos eleitorais.
            Deve conter as instruções ou informações a serem repassadas.
            Exemplo: "Amanhã teremos ação de corpo a corpo em Ceilândia.
            Ponto de encontro: Praça central às 8h."
        filtro_regiao: Região para filtrar destinatários. Deixe vazio para
            enviar a todos os cabos eleitorais.

    Returns:
        String JSON com mensagem formatada para WhatsApp, lista de
        destinatários e instruções de envio.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        # Buscar cabos eleitorais destinatários
        params = {}
        sql = """
            SELECT c.id, c.nome, c.telefone, c.regiao
            FROM contatos_whatsapp c
            WHERE c.tipo = 'cabo_eleitoral'
              AND (c.ativo = true OR c.ativo IS NULL)
        """

        if filtro_regiao:
            sql += " AND c.regiao = :regiao"
            params["regiao"] = filtro_regiao

        sql += " ORDER BY c.regiao, c.nome"

        destinatarios_db = session.execute(text(sql), params).fetchall()

        destinatarios = []
        for row in destinatarios_db:
            destinatarios.append({
                "id": row[0],
                "nome": row[1],
                "telefone": row[2],
                "regiao": row[3] or "Não definida",
            })

        # Formatar mensagem para WhatsApp
        agora = datetime.now()
        mensagem_formatada = (
            f"*COMUNICADO - REDE DE CAMPO*\n"
            f"_{agora.strftime('%d/%m/%Y %H:%M')}_\n\n"
            f"{mensagem}\n\n"
            f"---\n"
            f"_Mensagem enviada para "
            f"{len(destinatarios)} cabo(s) eleitoral(is)"
        )

        if filtro_regiao:
            mensagem_formatada += f" da região {filtro_regiao}"

        mensagem_formatada += "._"

        # Agrupar destinatários por região
        por_regiao = {}
        for d in destinatarios:
            r = d["regiao"]
            if r not in por_regiao:
                por_regiao[r] = []
            por_regiao[r].append(d["nome"])

        resultado = {
            "mensagem_original": mensagem,
            "mensagem_formatada_whatsapp": mensagem_formatada,
            "destinatarios": {
                "total": len(destinatarios),
                "filtro_regiao": filtro_regiao or "Todas",
                "por_regiao": por_regiao,
                "lista_completa": destinatarios,
            },
            "instrucoes_envio": {
                "metodo": "Envio individual via API WhatsApp ou lista de transmissão",
                "prioridade": "Normal",
                "horario_sugerido": "08:00-09:00 ou 18:00-19:00",
                "acompanhamento": (
                    "Verificar confirmação de leitura após 2 horas"
                ),
            },
        }

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "mensagem_original": mensagem,
                "mensagem_sistema": (
                    "Erro ao preparar mensagem para cabos eleitorais."
                ),
            },
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def relatorio_campo() -> str:
    """Gera relatório consolidado das atividades de campo dos cabos eleitorais.

    Compila dados de interações, mensagens trocadas e atividade dos
    cabos eleitorais para gerar uma visão geral das operações de campo,
    incluindo métricas de engajamento e cobertura regional.

    Returns:
        String JSON com relatório de campo incluindo métricas gerais,
        atividade por região, cabos mais ativos, alertas de inatividade
        e recomendações operacionais.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        agora = datetime.now()
        semana_atras = agora - timedelta(days=7)

        # Métricas gerais de cabos eleitorais
        metricas_sql = """
            SELECT
                COUNT(DISTINCT c.id) AS total_cabos,
                COUNT(DISTINCT CASE
                    WHEN m.data_envio >= :semana_atras THEN c.id
                END) AS cabos_ativos_semana,
                COUNT(DISTINCT conv.id) AS total_conversas,
                COUNT(m.id) AS total_mensagens,
                COUNT(CASE
                    WHEN m.data_envio >= :semana_atras THEN 1
                END) AS mensagens_semana
            FROM contatos_whatsapp c
            LEFT JOIN conversas_whatsapp conv ON conv.contato_id = c.id
            LEFT JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE c.tipo = 'cabo_eleitoral'
        """

        metricas = session.execute(
            text(metricas_sql), {"semana_atras": semana_atras}
        ).fetchone()

        # Atividade por região
        regioes_sql = """
            SELECT
                c.regiao,
                COUNT(DISTINCT c.id) AS cabos,
                COUNT(m.id) AS mensagens_total,
                COUNT(CASE
                    WHEN m.data_envio >= :semana_atras THEN 1
                END) AS mensagens_semana,
                MAX(m.data_envio) AS ultima_atividade
            FROM contatos_whatsapp c
            LEFT JOIN conversas_whatsapp conv ON conv.contato_id = c.id
            LEFT JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE c.tipo = 'cabo_eleitoral'
            GROUP BY c.regiao
            ORDER BY COUNT(m.id) DESC
        """

        regioes_db = session.execute(
            text(regioes_sql), {"semana_atras": semana_atras}
        ).fetchall()

        atividade_regioes = []
        for row in regioes_db:
            atividade_regioes.append({
                "regiao": row[0] or "Não definida",
                "total_cabos": row[1] or 0,
                "mensagens_total": row[2] or 0,
                "mensagens_ultima_semana": row[3] or 0,
                "ultima_atividade": row[4].isoformat() if row[4] else None,
            })

        # Cabos mais ativos na última semana
        top_cabos_sql = """
            SELECT
                c.nome,
                c.regiao,
                COUNT(m.id) AS mensagens_semana
            FROM contatos_whatsapp c
            JOIN conversas_whatsapp conv ON conv.contato_id = c.id
            JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE c.tipo = 'cabo_eleitoral'
              AND m.data_envio >= :semana_atras
            GROUP BY c.id, c.nome, c.regiao
            ORDER BY COUNT(m.id) DESC
            LIMIT 10
        """

        top_cabos_db = session.execute(
            text(top_cabos_sql), {"semana_atras": semana_atras}
        ).fetchall()

        top_cabos = []
        for row in top_cabos_db:
            top_cabos.append({
                "nome": row[0],
                "regiao": row[1] or "N/I",
                "mensagens_semana": row[2] or 0,
            })

        # Cabos inativos (sem atividade na última semana)
        inativos_sql = """
            SELECT c.nome, c.regiao, c.telefone, MAX(m.data_envio) AS ultima_msg
            FROM contatos_whatsapp c
            LEFT JOIN conversas_whatsapp conv ON conv.contato_id = c.id
            LEFT JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE c.tipo = 'cabo_eleitoral'
              AND (c.ativo = true OR c.ativo IS NULL)
            GROUP BY c.id, c.nome, c.regiao, c.telefone
            HAVING MAX(m.data_envio) < :semana_atras
               OR MAX(m.data_envio) IS NULL
            ORDER BY MAX(m.data_envio) ASC NULLS FIRST
            LIMIT 15
        """

        inativos_db = session.execute(
            text(inativos_sql), {"semana_atras": semana_atras}
        ).fetchall()

        cabos_inativos = []
        for row in inativos_db:
            cabos_inativos.append({
                "nome": row[0],
                "regiao": row[1] or "N/I",
                "telefone": row[2],
                "ultima_atividade": row[3].isoformat() if row[3] else "Nunca",
            })

        resultado = {
            "periodo": {
                "de": semana_atras.strftime("%d/%m/%Y"),
                "ate": agora.strftime("%d/%m/%Y"),
            },
            "metricas_gerais": {
                "total_cabos_cadastrados": metricas[0] or 0 if metricas else 0,
                "cabos_ativos_semana": metricas[1] or 0 if metricas else 0,
                "total_conversas": metricas[2] or 0 if metricas else 0,
                "total_mensagens": metricas[3] or 0 if metricas else 0,
                "mensagens_ultima_semana": metricas[4] or 0 if metricas else 0,
            },
            "atividade_por_regiao": atividade_regioes,
            "top_cabos_semana": top_cabos,
            "alertas_inatividade": {
                "total_inativos": len(cabos_inativos),
                "cabos": cabos_inativos,
            },
            "recomendacoes": [
                "Contatar cabos inativos para verificar status",
                "Reforçar presença em regiões com baixa atividade",
                "Reconhecer e motivar os cabos mais ativos",
                "Avaliar necessidade de recrutamento em regiões descobertas",
            ],
        }

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "mensagem": (
                    "Erro ao gerar relatório de campo. "
                    "Verifique se as tabelas estão configuradas."
                ),
            },
            ensure_ascii=False,
        )
    finally:
        session.close()
