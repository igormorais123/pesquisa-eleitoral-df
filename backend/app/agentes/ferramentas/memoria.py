"""
Ferramentas de memória e histórico de conversas.

Permite buscar histórico de interações, resumir contexto de conversas
e recuperar decisões passadas registradas via WhatsApp e outros canais.
"""

import json
from datetime import datetime
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
def buscar_historico(query: str, contato_id: int = 0) -> str:
    """Busca no histórico de conversas por palavras-chave ou tópicos.

    Pesquisa nas mensagens de WhatsApp e conversas registradas no sistema,
    retornando trechos relevantes que correspondem à busca. Útil para
    recuperar informações discutidas anteriormente.

    Args:
        query: Termo de busca ou palavras-chave para pesquisar no histórico.
            Exemplos: "pesquisa Ceilândia", "resultado debate", "estratégia jovens".
        contato_id: ID do contato para filtrar mensagens de um interlocutor
            específico. Use 0 para buscar em todas as conversas.

    Returns:
        String JSON com mensagens encontradas, incluindo remetente, data,
        conteúdo resumido e contexto da conversa.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        # Buscar mensagens que correspondam à query
        params = {"query": f"%{query}%"}

        sql = """
            SELECT
                m.id,
                m.conteudo,
                m.direcao,
                m.data_envio,
                c.nome AS contato_nome,
                c.telefone AS contato_telefone,
                conv.titulo AS conversa_titulo
            FROM mensagens_whatsapp m
            LEFT JOIN conversas_whatsapp conv ON m.conversa_id = conv.id
            LEFT JOIN contatos_whatsapp c ON conv.contato_id = c.id
            WHERE m.conteudo ILIKE :query
        """

        if contato_id > 0:
            sql += " AND conv.contato_id = :contato_id"
            params["contato_id"] = contato_id

        sql += " ORDER BY m.data_envio DESC LIMIT 20"

        resultado_db = session.execute(text(sql), params).fetchall()

        mensagens = []
        for row in resultado_db:
            mensagens.append({
                "id": row[0],
                "conteudo": (
                    row[1][:200] + "..." if row[1] and len(row[1]) > 200
                    else row[1]
                ),
                "direcao": row[2],
                "data_envio": row[3].isoformat() if row[3] else None,
                "contato": row[4] or "Desconhecido",
                "telefone": row[5],
                "conversa": row[6],
            })

        resultado = {
            "query": query,
            "contato_id": contato_id if contato_id > 0 else "todos",
            "total_encontrado": len(mensagens),
            "mensagens": mensagens,
        }

        if not mensagens:
            resultado["mensagem"] = (
                f"Nenhuma mensagem encontrada para a busca '{query}'."
            )

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "query": query,
                "mensagem": (
                    "Erro ao buscar histórico. Verifique se as tabelas "
                    "de mensagens estão configuradas."
                ),
            },
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def resumir_contexto(contato_id: int) -> str:
    """Resume todo o contexto de interações com um contato específico.

    Compila um resumo abrangente de todas as conversas, decisões,
    temas discutidos e status de acompanhamentos com um determinado
    contato do sistema.

    Args:
        contato_id: ID do contato cujo contexto será resumido.
            Este é o identificador único do contato na tabela
            contatos_whatsapp.

    Returns:
        String JSON com resumo contextual incluindo dados do contato,
        total de interações, principais temas discutidos, última
        interação e resumo das conversas.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        # Buscar dados do contato
        contato_sql = """
            SELECT id, nome, telefone, tipo, regiao, observacoes
            FROM contatos_whatsapp
            WHERE id = :contato_id
        """
        contato_row = session.execute(
            text(contato_sql), {"contato_id": contato_id}
        ).fetchone()

        if not contato_row:
            return json.dumps(
                {
                    "erro": f"Contato com ID {contato_id} não encontrado.",
                    "contato_id": contato_id,
                },
                ensure_ascii=False,
            )

        contato_info = {
            "id": contato_row[0],
            "nome": contato_row[1],
            "telefone": contato_row[2],
            "tipo": contato_row[3],
            "regiao": contato_row[4],
            "observacoes": contato_row[5],
        }

        # Buscar resumo de conversas
        conversas_sql = """
            SELECT
                conv.id,
                conv.titulo,
                conv.status,
                conv.criado_em,
                COUNT(m.id) AS total_mensagens,
                MAX(m.data_envio) AS ultima_mensagem
            FROM conversas_whatsapp conv
            LEFT JOIN mensagens_whatsapp m ON m.conversa_id = conv.id
            WHERE conv.contato_id = :contato_id
            GROUP BY conv.id, conv.titulo, conv.status, conv.criado_em
            ORDER BY MAX(m.data_envio) DESC NULLS LAST
        """
        conversas = session.execute(
            text(conversas_sql), {"contato_id": contato_id}
        ).fetchall()

        conversas_resumo = []
        total_mensagens = 0
        for c in conversas:
            total_mensagens += c[4] or 0
            conversas_resumo.append({
                "id": c[0],
                "titulo": c[1],
                "status": c[2],
                "criada_em": c[3].isoformat() if c[3] else None,
                "total_mensagens": c[4] or 0,
                "ultima_mensagem": c[5].isoformat() if c[5] else None,
            })

        # Buscar últimas mensagens para contexto
        ultimas_sql = """
            SELECT m.conteudo, m.direcao, m.data_envio
            FROM mensagens_whatsapp m
            JOIN conversas_whatsapp conv ON m.conversa_id = conv.id
            WHERE conv.contato_id = :contato_id
            ORDER BY m.data_envio DESC
            LIMIT 10
        """
        ultimas = session.execute(
            text(ultimas_sql), {"contato_id": contato_id}
        ).fetchall()

        ultimas_mensagens = []
        for u in ultimas:
            ultimas_mensagens.append({
                "conteudo": (
                    u[0][:150] + "..." if u[0] and len(u[0]) > 150
                    else u[0]
                ),
                "direcao": u[1],
                "data": u[2].isoformat() if u[2] else None,
            })

        resultado = {
            "contato": contato_info,
            "estatisticas": {
                "total_conversas": len(conversas_resumo),
                "total_mensagens": total_mensagens,
                "ultima_interacao": (
                    conversas_resumo[0]["ultima_mensagem"]
                    if conversas_resumo
                    else None
                ),
            },
            "conversas": conversas_resumo,
            "ultimas_mensagens": ultimas_mensagens,
        }

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "contato_id": contato_id,
                "mensagem": "Erro ao resumir contexto do contato.",
            },
            ensure_ascii=False,
        )
    finally:
        session.close()


@tool
def lembrar_decisao(topico: str) -> str:
    """Recupera decisões passadas relacionadas a um tópico específico.

    Busca no histórico de conversas por registros de decisões, definições
    estratégicas e direcionamentos que foram discutidos e acordados
    sobre um determinado assunto.

    Args:
        topico: Tópico ou tema da decisão a ser recuperada.
            Exemplos: "calendário de eventos", "estratégia digital",
            "posicionamento saúde", "contratação equipe".

    Returns:
        String JSON com decisões encontradas relacionadas ao tópico,
        incluindo data, contexto da decisão, participantes e status
        de implementação.
    """
    from sqlalchemy import text

    session = _get_sync_session()
    try:
        # Buscar mensagens que contenham indicadores de decisão
        # relacionadas ao tópico
        palavras_decisao = [
            "decidimos", "ficou definido", "vamos", "aprovado",
            "combinado", "resolvi", "definição", "decisão",
            "próximos passos", "ação", "encaminhamento",
        ]

        # Construir query com busca pelo tópico e palavras de decisão
        condicoes_decisao = " OR ".join(
            [f"m.conteudo ILIKE :dec_{i}" for i in range(len(palavras_decisao))]
        )

        sql = f"""
            SELECT
                m.id,
                m.conteudo,
                m.direcao,
                m.data_envio,
                c.nome AS contato,
                conv.titulo AS conversa
            FROM mensagens_whatsapp m
            LEFT JOIN conversas_whatsapp conv ON m.conversa_id = conv.id
            LEFT JOIN contatos_whatsapp c ON conv.contato_id = c.id
            WHERE m.conteudo ILIKE :topico
              AND ({condicoes_decisao})
            ORDER BY m.data_envio DESC
            LIMIT 15
        """

        params = {"topico": f"%{topico}%"}
        for i, palavra in enumerate(palavras_decisao):
            params[f"dec_{i}"] = f"%{palavra}%"

        resultado_db = session.execute(text(sql), params).fetchall()

        decisoes = []
        for row in resultado_db:
            decisoes.append({
                "id": row[0],
                "conteudo": (
                    row[1][:300] + "..." if row[1] and len(row[1]) > 300
                    else row[1]
                ),
                "direcao": row[2],
                "data": row[3].isoformat() if row[3] else None,
                "contato": row[4] or "N/I",
                "conversa": row[5] or "N/I",
            })

        resultado = {
            "topico_buscado": topico,
            "total_decisoes_encontradas": len(decisoes),
            "decisoes": decisoes,
        }

        if not decisoes:
            resultado["mensagem"] = (
                f"Nenhuma decisão registrada encontrada para o tópico "
                f"'{topico}'. Tente termos alternativos ou mais genéricos."
            )

        return json.dumps(resultado, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "erro": str(e),
                "topico": topico,
                "mensagem": "Erro ao buscar decisões no histórico.",
            },
            ensure_ascii=False,
        )
    finally:
        session.close()
