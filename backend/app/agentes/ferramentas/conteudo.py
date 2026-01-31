"""
Ferramentas de criação de conteúdo para campanha eleitoral.

Gera textos para redes sociais, WhatsApp, slogans de campanha
e roteiros de vídeo otimizados para diferentes públicos e canais.
"""

import json
from langchain_core.tools import tool


@tool
def gerar_post_rede_social(tema: str, tom: str = "informativo") -> str:
    """Gera texto para publicação em redes sociais sobre um tema de campanha.

    Cria conteúdo otimizado para redes sociais (Instagram, Facebook, Twitter/X)
    com tom adequado e formatação própria de cada plataforma, incluindo
    sugestões de hashtags.

    Args:
        tema: Tema ou assunto do post a ser criado.
            Exemplos: "proposta de saúde pública", "visita a Ceilândia",
            "debate com candidatos", "inauguração de obra".
        tom: Tom da comunicação desejado. Opções: "informativo" (padrão),
            "motivacional", "urgente", "emocional", "técnico", "popular".

    Returns:
        String JSON com versões do post para cada rede social (Instagram,
        Facebook, Twitter/X), incluindo texto principal, hashtags sugeridas
        e recomendações de conteúdo visual.
    """
    tons_config = {
        "informativo": {
            "estilo": "claro, objetivo e factual",
            "emojis": "moderados",
            "cta": "Saiba mais",
        },
        "motivacional": {
            "estilo": "inspirador, positivo e engajante",
            "emojis": "frequentes",
            "cta": "Vamos juntos!",
        },
        "urgente": {
            "estilo": "direto, enfático e chamativo",
            "emojis": "alertas e atenção",
            "cta": "Compartilhe agora!",
        },
        "emocional": {
            "estilo": "pessoal, empático e próximo",
            "emojis": "sensíveis",
            "cta": "Conte sua história",
        },
        "técnico": {
            "estilo": "preciso, dados e evidências",
            "emojis": "mínimos",
            "cta": "Confira os dados",
        },
        "popular": {
            "estilo": "acessível, coloquial e direto",
            "emojis": "frequentes e populares",
            "cta": "Passa pra frente!",
        },
    }

    config_tom = tons_config.get(tom, tons_config["informativo"])

    resultado = {
        "tema": tema,
        "tom": tom,
        "configuracao_tom": config_tom,
        "versoes": {
            "instagram": {
                "texto_principal": (
                    f"[TÍTULO SOBRE: {tema.upper()}]\n\n"
                    f"[Desenvolver texto com tom {config_tom['estilo']}]\n\n"
                    "[Incluir dados ou argumentos relevantes]\n\n"
                    "[Chamada para ação]\n\n"
                    "[Hashtags]"
                ),
                "limite_caracteres": 2200,
                "formato_recomendado": "Carrossel com 5-7 slides ou Reels até 60s",
                "hashtags_sugeridas": [
                    f"#{tema.replace(' ', '')}",
                    "#DF", "#Brasília",
                    "#Eleições2026",
                    "#DistritoFederal",
                ],
                "dicas": [
                    "Usar imagem de alta qualidade ou infográfico",
                    "Primeira linha impactante (gancho)",
                    "Parágrafos curtos com espaçamento",
                    "CTA no final do texto",
                ],
            },
            "facebook": {
                "texto_principal": (
                    f"[TEXTO SOBRE: {tema}]\n\n"
                    f"[Desenvolver com tom {config_tom['estilo']}]\n\n"
                    "[Contextualizar com dados locais do DF]\n\n"
                    "[Perguntar opinião do eleitor]\n\n"
                    f"{config_tom['cta']}"
                ),
                "limite_caracteres": 63206,
                "formato_recomendado": "Imagem + texto ou vídeo nativo até 3min",
                "dicas": [
                    "Texto mais longo é aceito, mas manter objetividade",
                    "Incluir pergunta para estimular comentários",
                    "Marcar página oficial e parceiros",
                ],
            },
            "twitter_x": {
                "texto_principal": (
                    f"[Mensagem concisa sobre {tema} "
                    f"com tom {config_tom['estilo']}] "
                    "#Eleições2026 #DF"
                ),
                "limite_caracteres": 280,
                "formato_recomendado": "Texto + imagem ou thread para mais detalhes",
                "dicas": [
                    "Ir direto ao ponto",
                    "Máximo 2-3 hashtags",
                    "Usar thread para temas complexos",
                    "Responder comentários rapidamente",
                ],
            },
        },
        "recomendacoes_gerais": [
            f"Manter consistência no tom '{tom}' em todas as plataformas",
            "Adaptar linguagem ao público de cada rede",
            "Publicar nos horários de pico de engajamento",
            "Monitorar métricas de alcance e engajamento após publicação",
            "Responder comentários para estimular algoritmo",
        ],
        "observacao": (
            "Templates de referência para criação de conteúdo. "
            "O texto final deve ser elaborado pela equipe de comunicação "
            "com base nesta estrutura."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def gerar_texto_whatsapp(tema: str, publico: str = "geral") -> str:
    """Gera texto formatado para envio via WhatsApp sobre tema de campanha.

    Cria mensagem otimizada para WhatsApp considerando o público-alvo,
    com formatação adequada (negrito, itálico, listas), tamanho ideal
    para leitura mobile e tom conversacional.

    Args:
        tema: Tema ou assunto da mensagem a ser criada.
            Exemplos: "agenda da semana", "resultado da pesquisa",
            "convite para evento", "posicionamento sobre saúde".
        publico: Público-alvo da mensagem. Opções: "geral" (padrão),
            "cabos_eleitorais", "liderancas", "jovens", "idosos",
            "mulheres", "empreendedores".

    Returns:
        String JSON com texto formatado para WhatsApp, adaptado ao
        público-alvo, incluindo versão curta e versão completa.
    """
    publicos_config = {
        "geral": {
            "linguagem": "acessível e direta",
            "comprimento_ideal": "150-300 palavras",
            "formalidade": "informal moderado",
        },
        "cabos_eleitorais": {
            "linguagem": "objetiva e operacional",
            "comprimento_ideal": "100-200 palavras",
            "formalidade": "informal",
        },
        "liderancas": {
            "linguagem": "respeitosa e estratégica",
            "comprimento_ideal": "200-400 palavras",
            "formalidade": "formal moderado",
        },
        "jovens": {
            "linguagem": "descontraída e engajante",
            "comprimento_ideal": "100-200 palavras",
            "formalidade": "muito informal",
        },
        "idosos": {
            "linguagem": "clara, simples e respeitosa",
            "comprimento_ideal": "100-200 palavras",
            "formalidade": "formal",
        },
        "mulheres": {
            "linguagem": "empática e propositiva",
            "comprimento_ideal": "150-300 palavras",
            "formalidade": "informal moderado",
        },
        "empreendedores": {
            "linguagem": "pragmática e focada em resultados",
            "comprimento_ideal": "150-250 palavras",
            "formalidade": "semiformal",
        },
    }

    config = publicos_config.get(publico, publicos_config["geral"])

    resultado = {
        "tema": tema,
        "publico_alvo": publico,
        "configuracao_publico": config,
        "versao_curta": {
            "texto": (
                f"[Saudação adequada ao público '{publico}']\n\n"
                f"[Mensagem principal sobre '{tema}' - 2-3 frases]\n\n"
                f"[Chamada para ação]"
            ),
            "caracteres_estimados": "até 500",
            "uso": "Primeiro disparo ou mensagem rápida",
        },
        "versao_completa": {
            "texto": (
                f"[Saudação personalizada para '{publico}']\n\n"
                f"*{tema.upper()}*\n\n"
                f"[Parágrafo de contexto - tom {config['linguagem']}]\n\n"
                "[Pontos principais:]\n"
                "- [Ponto 1]\n"
                "- [Ponto 2]\n"
                "- [Ponto 3]\n\n"
                "[Conclusão e próximos passos]\n\n"
                "[Chamada para ação + contato/link]\n\n"
                "_[Assinatura]_"
            ),
            "caracteres_estimados": "800-1500",
            "uso": "Mensagem detalhada ou informativa",
        },
        "dicas_formatacao_whatsapp": [
            "*negrito* para destaques importantes",
            "_itálico_ para nomes e termos especiais",
            "~tachado~ para correções ou comparações",
            "```monoespaçado``` para dados e números",
            "Usar listas com - ou • para organizar pontos",
            "Parágrafos curtos (2-3 linhas máximo)",
            "Emojis com moderação conforme o público",
        ],
        "horarios_recomendados": {
            "manha": "07:00-09:00 (abertura do dia)",
            "almoco": "12:00-13:00 (pausa do almoço)",
            "noite": "19:00-21:00 (pós-trabalho)",
        },
        "observacao": (
            "Template de referência. O texto final deve ser personalizado "
            "pela equipe de comunicação mantendo a formatação WhatsApp."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def gerar_slogan(contexto: str) -> str:
    """Gera sugestões de slogans de campanha eleitoral.

    Cria opções de slogans e frases de efeito para campanha com base
    no contexto político, valores do candidato e público-alvo,
    organizados por categoria e tom.

    Args:
        contexto: Contexto da campanha para orientar a criação do slogan.
            Deve incluir valores do candidato, público-alvo, diferencial
            e tom desejado.
            Exemplo: "Candidato jovem, foco em inovação e tecnologia,
            público jovem e empreendedores, tom moderno."

    Returns:
        String JSON com sugestões de slogans organizados por categoria
        (institucional, popular, segmentado), com análise de cada opção.
    """
    resultado = {
        "contexto": contexto,
        "sugestoes_slogans": {
            "institucional": {
                "descricao": (
                    "Slogans formais para material oficial de campanha"
                ),
                "sugestoes": [
                    {
                        "slogan": "[Slogan institucional baseado no contexto]",
                        "analise": (
                            "Tom formal, transmite credibilidade e "
                            "competência administrativa."
                        ),
                        "uso_recomendado": "Material oficial, HGPE, debates",
                    },
                    {
                        "slogan": "[Variação institucional com foco em futuro]",
                        "analise": (
                            "Projeta visão de futuro e compromisso "
                            "com transformação."
                        ),
                        "uso_recomendado": "Propagandas de TV e rádio",
                    },
                ],
            },
            "popular": {
                "descricao": "Slogans acessíveis para o público geral",
                "sugestoes": [
                    {
                        "slogan": "[Slogan popular e memorável]",
                        "analise": (
                            "Fácil de memorizar, tom próximo do povo, "
                            "ideal para viralização."
                        ),
                        "uso_recomendado": "Redes sociais, adesivos, camisetas",
                    },
                    {
                        "slogan": "[Slogan com rima ou jogo de palavras]",
                        "analise": (
                            "Recurso mnemônico facilita memorização "
                            "e reprodução espontânea."
                        ),
                        "uso_recomendado": "Jingles, material de rua",
                    },
                ],
            },
            "segmentado": {
                "descricao": "Slogans para públicos específicos",
                "sugestoes": [
                    {
                        "slogan": "[Slogan para jovens/inovação]",
                        "publico": "Jovens 18-29 anos",
                        "analise": "Linguagem moderna, referências atuais.",
                        "uso_recomendado": "Redes sociais, eventos universitários",
                    },
                    {
                        "slogan": "[Slogan para mulheres/famílias]",
                        "publico": "Mulheres e famílias",
                        "analise": "Empatia e propostas concretas.",
                        "uso_recomendado": "WhatsApp, material de bairro",
                    },
                    {
                        "slogan": "[Slogan para periferia/trabalhadores]",
                        "publico": "Trabalhadores e periferia",
                        "analise": "Linguagem direta, foco em resultados.",
                        "uso_recomendado": "Corpo a corpo, panfletagem",
                    },
                ],
            },
        },
        "criterios_bom_slogan": [
            "Curto: máximo 5-7 palavras",
            "Memorável: fácil de lembrar e repetir",
            "Diferenciador: destaca o candidato dos demais",
            "Positivo: projeta esperança e solução",
            "Autêntico: coerente com a trajetória do candidato",
            "Versátil: funciona em diferentes mídias e contextos",
        ],
        "observacao": (
            "Templates de estrutura para slogans. A equipe de comunicação "
            "deve desenvolver o texto final com base no contexto específico "
            "da campanha e teste com grupos focais."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)


@tool
def gerar_roteiro_video(tema: str, duracao_segundos: int = 60) -> str:
    """Gera roteiro para vídeo de campanha eleitoral.

    Cria estrutura de roteiro com indicações de cena, falas, tempo
    e recursos visuais para produção de vídeo de campanha,
    otimizado para a duração especificada.

    Args:
        tema: Tema central do vídeo a ser produzido.
            Exemplos: "proposta de saúde", "apresentação do candidato",
            "depoimento de apoiador", "resposta a adversário".
        duracao_segundos: Duração alvo do vídeo em segundos.
            Padrão: 60 segundos. Formatos comuns: 15s (stories),
            30s (spot), 60s (padrão), 120s (detalhado), 180s (documentário curto).

    Returns:
        String JSON com roteiro estruturado em cenas, incluindo tempo,
        descrição visual, texto/fala, trilha sonora e observações técnicas.
    """
    # Calcular estrutura de cenas baseada na duração
    if duracao_segundos <= 15:
        n_cenas = 2
        formato = "Stories / Reels curto"
    elif duracao_segundos <= 30:
        n_cenas = 3
        formato = "Spot rápido"
    elif duracao_segundos <= 60:
        n_cenas = 5
        formato = "Vídeo padrão redes sociais"
    elif duracao_segundos <= 120:
        n_cenas = 7
        formato = "Vídeo detalhado"
    else:
        n_cenas = 10
        formato = "Mini documentário / Programa eleitoral"

    tempo_por_cena = duracao_segundos / n_cenas

    # Estrutura de roteiro
    estrutura_cenas = {
        "abertura": {
            "duracao_seg": round(tempo_por_cena),
            "descricao_visual": (
                f"[Imagem impactante relacionada a '{tema}'. "
                "Plano aberto ou close no candidato.]"
            ),
            "texto_fala": (
                f"[Gancho inicial que prende atenção sobre '{tema}']"
            ),
            "trilha": "Trilha de impacto - crescendo",
            "grafismo": "Título do tema em lettering",
        },
        "desenvolvimento": [],
        "encerramento": {
            "duracao_seg": round(tempo_por_cena),
            "descricao_visual": (
                "[Candidato olhando para câmera. "
                "Logo da campanha e número do candidato.]"
            ),
            "texto_fala": (
                "[Chamada para ação + slogan da campanha + "
                "número do candidato]"
            ),
            "trilha": "Trilha de encerramento - resolução",
            "grafismo": "Logo + número + redes sociais",
        },
    }

    # Gerar cenas de desenvolvimento
    for i in range(n_cenas - 2):
        estrutura_cenas["desenvolvimento"].append({
            "cena": i + 2,
            "duracao_seg": round(tempo_por_cena),
            "descricao_visual": (
                f"[Cena {i + 2}: Imagem/vídeo de apoio para argumento {i + 1} "
                f"sobre '{tema}']"
            ),
            "texto_fala": (
                f"[Argumento {i + 1} sobre '{tema}' - "
                f"tom adequado ao formato '{formato}']"
            ),
            "trilha": "Trilha de fundo - tom emocional/informativo",
            "grafismo": f"[Dados ou texto de apoio para cena {i + 2}]",
        })

    resultado = {
        "tema": tema,
        "duracao_total_segundos": duracao_segundos,
        "formato": formato,
        "total_cenas": n_cenas,
        "roteiro": estrutura_cenas,
        "especificacoes_tecnicas": {
            "resolucao": "1080x1920 (vertical) ou 1920x1080 (horizontal)",
            "fps": 30,
            "formato_arquivo": "MP4 / H.264",
            "aspect_ratio": {
                "stories_reels": "9:16 (vertical)",
                "feed_youtube": "16:9 (horizontal)",
                "feed_quadrado": "1:1",
            },
        },
        "orientacoes_producao": [
            "Filmar em ambiente bem iluminado",
            "Áudio limpo - usar microfone de lapela",
            "Legendar todo o vídeo (muitos assistem sem som)",
            "Nos primeiros 3 segundos: capturar atenção",
            "Manter ritmo dinâmico com cortes a cada 5-8 segundos",
            "Incluir número do candidato nos últimos 5 segundos",
            "Versão com e sem legenda para diferentes plataformas",
        ],
        "adaptacoes_plataforma": {
            "instagram_reels": "Até 90s, vertical, legendado, trending audio",
            "tiktok": "Até 60s, vertical, dinâmico, trends",
            "youtube_shorts": "Até 60s, vertical, SEO no título",
            "facebook": "Até 3min, horizontal ou quadrado, legenda",
            "whatsapp_status": "Até 30s, vertical, direto ao ponto",
            "hgpe_tv": "30s ou 60s, horizontal, normas TSE",
        },
        "observacao": (
            "Estrutura de roteiro para orientar a produção. "
            "O texto final das falas deve ser elaborado pela equipe "
            "de comunicação e aprovado pelo candidato."
        ),
    }

    return json.dumps(resultado, ensure_ascii=False, indent=2)
