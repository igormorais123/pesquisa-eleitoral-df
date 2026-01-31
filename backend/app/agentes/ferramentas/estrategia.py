"""
Ferramentas de análise estratégica eleitoral.

Fornece análise de cenário político, sugestão de ações estratégicas
e avaliação de adversários com análise SWOT.
"""

import json
from langchain_core.tools import tool


@tool
def analisar_cenario_politico(contexto: str) -> str:
    """Analisa o cenário político atual com base no contexto fornecido.

    Realiza uma análise estruturada do cenário político considerando
    fatores como conjuntura econômica, alianças partidárias, humor do
    eleitorado e eventos relevantes para a disputa eleitoral no DF.

    Args:
        contexto: Descrição textual do contexto político atual a ser analisado.
            Deve incluir informações relevantes como alianças, eventos recentes,
            posicionamentos de candidatos, indicadores econômicos, etc.
            Exemplo: "Candidato X firmou aliança com partido Y, pesquisa mostra
            crescimento de 5 pontos."

    Returns:
        String com análise estruturada do cenário político, organizada em
        dimensões (conjuntura, forças, fraquezas, oportunidades, ameaças)
        com recomendações estratégicas.
    """
    # Framework de análise política estruturada
    analise = {
        "contexto_analisado": contexto,
        "dimensoes_analise": {
            "conjuntura_geral": {
                "descricao": (
                    "Análise da conjuntura política geral do DF com base "
                    "no contexto fornecido."
                ),
                "fatores_positivos": [
                    "Avaliar aprovação do governo atual",
                    "Verificar indicadores econômicos locais",
                    "Considerar agenda legislativa em andamento",
                ],
                "fatores_negativos": [
                    "Analisar índices de insatisfação",
                    "Avaliar impacto de crises ou escândalos",
                    "Considerar desgaste institucional",
                ],
            },
            "dinamica_partidaria": {
                "descricao": "Mapa de alianças e correlação de forças.",
                "elementos": [
                    "Coligações formadas e potenciais",
                    "Tempo de TV e rádio por bloco",
                    "Fundo partidário e recursos disponíveis",
                    "Apoios de lideranças nacionais",
                ],
            },
            "eleitorado": {
                "descricao": "Análise do comportamento e tendências do eleitorado.",
                "indicadores": [
                    "Nível de definição de voto",
                    "Taxa de indecisos",
                    "Temas prioritários para o eleitor",
                    "Nível de engajamento político",
                ],
            },
            "comunicacao": {
                "descricao": "Análise do ambiente de comunicação política.",
                "canais": [
                    "Redes sociais - alcance e engajamento",
                    "Mídia tradicional - cobertura e viés",
                    "WhatsApp - penetração e viralidade",
                    "Boca a boca e cabo eleitoral",
                ],
            },
        },
        "matriz_swot_cenario": {
            "forcas": [
                "Identificar vantagens competitivas no cenário atual",
                "Recursos e capacidades disponíveis",
            ],
            "fraquezas": [
                "Vulnerabilidades e pontos de atenção",
                "Lacunas a serem preenchidas",
            ],
            "oportunidades": [
                "Janelas de oportunidade identificadas",
                "Tendências favoráveis a explorar",
            ],
            "ameacas": [
                "Riscos e ameaças no horizonte",
                "Movimentos adversários a monitorar",
            ],
        },
        "recomendacoes": [
            "Priorizar ações com base na análise acima",
            "Monitorar evolução dos indicadores semanalmente",
            "Ajustar estratégia conforme mudanças no cenário",
        ],
        "observacao": (
            "Esta análise é baseada no contexto fornecido e deve ser "
            "complementada com dados de pesquisa atualizados e inteligência "
            "de campo."
        ),
    }

    return json.dumps(analise, ensure_ascii=False, indent=2)


@tool
def sugerir_acoes(objetivo: str, contexto: str = "") -> str:
    """Sugere ações estratégicas concretas para atingir um objetivo eleitoral.

    Gera recomendações táticas e operacionais com base no objetivo
    definido e no contexto político atual, priorizando por impacto
    e viabilidade.

    Args:
        objetivo: Objetivo estratégico a ser atingido.
            Exemplos: "aumentar intenção de voto em 5 pontos entre jovens",
            "reduzir rejeição em Ceilândia", "conquistar eleitorado feminino".
        contexto: Informações adicionais de contexto para refinar as sugestões.
            Pode incluir recursos disponíveis, restrições, prazo, etc.

    Returns:
        String JSON com lista de ações estratégicas priorizadas, cada uma com
        descrição, prazo, recursos estimados, impacto esperado e métricas
        de acompanhamento.
    """
    # Categorias de ações estratégicas
    categorias_acoes = {
        "comunicacao_digital": {
            "nome": "Comunicação Digital",
            "acoes": [
                {
                    "acao": "Campanha segmentada em redes sociais",
                    "descricao": (
                        "Criar conteúdo direcionado por público-alvo "
                        "com mensagens personalizadas por região e perfil."
                    ),
                    "prazo": "Imediato (1-2 semanas)",
                    "impacto_estimado": "Médio-Alto",
                    "recursos": "Equipe de mídias sociais + verba de impulsionamento",
                    "metricas": [
                        "Alcance por segmento",
                        "Engajamento (curtidas, compartilhamentos)",
                        "Crescimento de seguidores",
                    ],
                },
                {
                    "acao": "Produção de conteúdo em vídeo",
                    "descricao": (
                        "Vídeos curtos para redes sociais abordando "
                        "temas prioritários do eleitorado."
                    ),
                    "prazo": "1-3 semanas",
                    "impacto_estimado": "Alto",
                    "recursos": "Produtora de vídeo + roteirista",
                    "metricas": [
                        "Visualizações",
                        "Taxa de retenção",
                        "Compartilhamentos",
                    ],
                },
            ],
        },
        "trabalho_campo": {
            "nome": "Trabalho de Campo",
            "acoes": [
                {
                    "acao": "Intensificação de corpo a corpo",
                    "descricao": (
                        "Mobilizar cabos eleitorais para ações presenciais "
                        "nas regiões prioritárias."
                    ),
                    "prazo": "Contínuo",
                    "impacto_estimado": "Alto",
                    "recursos": "Rede de cabos eleitorais + material impresso",
                    "metricas": [
                        "Número de contatos realizados",
                        "Cobertura por região",
                        "Conversão reportada",
                    ],
                },
                {
                    "acao": "Eventos comunitários",
                    "descricao": (
                        "Organizar reuniões em comunidades para "
                        "apresentar propostas e ouvir demandas."
                    ),
                    "prazo": "2-4 semanas",
                    "impacto_estimado": "Médio-Alto",
                    "recursos": "Logística + equipe de eventos",
                    "metricas": [
                        "Participantes por evento",
                        "Demandas coletadas",
                        "NPS do evento",
                    ],
                },
            ],
        },
        "aliancas_politicas": {
            "nome": "Alianças Políticas",
            "acoes": [
                {
                    "acao": "Articulação com lideranças comunitárias",
                    "descricao": (
                        "Buscar apoio de líderes comunitários e "
                        "formadores de opinião locais."
                    ),
                    "prazo": "1-2 semanas",
                    "impacto_estimado": "Médio",
                    "recursos": "Equipe de articulação política",
                    "metricas": [
                        "Apoios formalizados",
                        "Alcance dos apoiadores",
                        "Regiões cobertas",
                    ],
                },
            ],
        },
        "propostas_programaticas": {
            "nome": "Propostas Programáticas",
            "acoes": [
                {
                    "acao": "Lançamento de propostas setoriais",
                    "descricao": (
                        "Apresentar propostas concretas para temas "
                        "prioritários do eleitorado-alvo."
                    ),
                    "prazo": "2-3 semanas",
                    "impacto_estimado": "Médio",
                    "recursos": "Equipe técnica + assessoria de comunicação",
                    "metricas": [
                        "Repercussão na mídia",
                        "Engajamento digital",
                        "Pesquisa de recall",
                    ],
                },
            ],
        },
    }

    resultado = {
        "objetivo": objetivo,
        "contexto": contexto or "Não especificado",
        "acoes_sugeridas": categorias_acoes,
        "priorizacao": {
            "criterios": [
                "Impacto no objetivo definido",
                "Viabilidade de execução no prazo",
                "Recursos disponíveis",
                "Risco de exposição negativa",
            ],
            "recomendacao": (
                "Priorizar ações de alto impacto e execução imediata. "
                "Combinar ações de curto prazo (comunicação digital) com "
                "médio prazo (campo e alianças) para efeito sustentado."
            ),
        },
        "cronograma_sugerido": {
            "semana_1_2": "Comunicação digital + articulação com lideranças",
            "semana_3_4": "Eventos comunitários + lançamento de propostas",
            "continuo": "Corpo a corpo e monitoramento de resultados",
        },
        "observacao": (
            "Ações devem ser adaptadas ao contexto específico da campanha. "
            "Recomenda-se revisão semanal de efetividade com ajuste tático."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def avaliar_adversario(nome: str) -> str:
    """Realiza análise SWOT de um adversário político.

    Gera uma avaliação estruturada de forças, fraquezas, oportunidades
    e ameaças de um candidato adversário com base nas informações
    disponíveis no sistema.

    Args:
        nome: Nome do candidato adversário a ser avaliado.
            Exemplo: "João Silva" ou "Candidato do Partido X".

    Returns:
        String JSON com análise SWOT completa do adversário, incluindo
        perfil resumido, pontos fortes e fracos, oportunidades de ataque
        e riscos associados, com recomendações de posicionamento.
    """
    analise_swot = {
        "adversario": nome,
        "perfil_resumo": {
            "descricao": (
                f"Perfil político de {nome} - análise baseada em dados "
                "públicos disponíveis."
            ),
            "elementos_perfil": [
                "Histórico político e eleitoral",
                "Base eleitoral e redutos",
                "Posicionamento ideológico",
                "Estilo de comunicação",
                "Principais bandeiras",
            ],
        },
        "analise_swot": {
            "forcas": {
                "descricao": "Pontos fortes do adversário que merecem atenção",
                "itens_a_avaliar": [
                    "Reconhecimento de nome / marca pessoal",
                    "Estrutura partidária e coligações",
                    "Recursos financeiros disponíveis",
                    "Presença em mídia e redes sociais",
                    "Apoio de lideranças e formadores de opinião",
                    "Capilaridade em regiões-chave",
                    "Tempo de TV e rádio",
                ],
            },
            "fraquezas": {
                "descricao": "Vulnerabilidades e pontos fracos identificados",
                "itens_a_avaliar": [
                    "Taxa de rejeição por segmento",
                    "Inconsistências no discurso",
                    "Escândalos ou processos judiciais",
                    "Fraqueza em regiões específicas",
                    "Dificuldade com temas específicos",
                    "Problemas de imagem ou comunicação",
                    "Dependência de padrinho político",
                ],
            },
            "oportunidades": {
                "descricao": (
                    "Oportunidades estratégicas para explorar contra "
                    "o adversário"
                ),
                "itens_a_avaliar": [
                    "Contrastar propostas em temas-chave",
                    "Explorar lacunas de comunicação",
                    "Disputar base eleitoral flutuante",
                    "Aproveitar desgaste de alianças",
                    "Capitalizar erros de campanha",
                ],
            },
            "ameacas": {
                "descricao": "Riscos que o adversário representa",
                "itens_a_avaliar": [
                    "Potencial de crescimento na reta final",
                    "Capacidade de mobilização de base",
                    "Possíveis ataques e narrativas negativas",
                    "Transferência de votos de aliados",
                    "Estratégia de migração de votos",
                ],
            },
        },
        "recomendacoes_posicionamento": {
            "fazer": [
                "Monitorar diariamente as movimentações do adversário",
                "Preparar respostas para possíveis ataques",
                "Contrastar positivamente as propostas",
                "Focar nas fraquezas identificadas de forma propositiva",
            ],
            "evitar": [
                "Ataques pessoais sem embasamento factual",
                "Subestimar o potencial do adversário",
                "Reagir impulsivamente a provocações",
                "Adotar postura excessivamente defensiva",
            ],
        },
        "observacao": (
            f"Análise de {nome} baseada em framework SWOT político. "
            "Deve ser atualizada regularmente com dados de inteligência "
            "de campo e monitoramento de mídia."
        ),
    }

    return json.dumps(analise_swot, ensure_ascii=False, indent=2)
