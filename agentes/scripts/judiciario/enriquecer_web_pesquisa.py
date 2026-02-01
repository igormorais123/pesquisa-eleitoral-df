"""
Script de enriquecimento dos perfis de magistrados com dados da web.
Coleta dados de pesquisas realizadas (WebSearch, agentes) e atualiza os JSON.
"""
import json
import os
import re
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
META_DIR = Path("meta")

# ============================================================
# DADOS COLETADOS VIA PESQUISA WEB (hardcoded para confiabilidade)
# ============================================================

DADOS_PESQUISA = {
    # ===================== STJ =====================
    "stj-og-fernandes": {
        "nome_completo": "Geraldo Og Nicéas Marques Fernandes",
        "dados_dossie": {
            "nascimento": {"data": "26/11/1951", "cidade": "Recife/PE"},
            "origem": "Magistratura estadual (TJ-PE). Jornalista formado. Ingressou na magistratura em 1981. Presidente do TJ-PE em 2008.",
            "perfil_ideologico": "Garantista moderado com forte atuação em direito ambiental e processual penal. Técnico e institucionalista, evita protagonismo midiático. Decano em formação no STJ.",
            "perfil_psicologico": "Discreto, metódico, institucionalista. Jornalista de formação, valoriza a narrativa fundamentada. Perfil conciliador mas firme em questões processuais. Experiência diversificada (jornalismo, advocacia criminal, magistratura) lhe confere visão ampla.",
            "estilo_decisorio": "Técnico-processualista. Votos fundamentados em jurisprudência consolidada. Especialista em direito penal e ambiental. Evita ativismo, preferindo interpretação sistemática.",
            "secao": "Corte Especial (ex-3ª Seção/6ª Turma)",
            "turma": "Corte Especial",
            "formacao": "Direito (UFPE) e Jornalismo (UNICAP), 1974",
            "carreira_previa": "Repórter Diário de Pernambuco (1973-1981), advogado criminal (1977-1981), professor CMR (1975), juiz TJ-PE (1981), desembargador TJ-PE (1997), presidente TJ-PE (2008)",
            "indicado_por": "Presidente Lula",
            "posse_stj": "17/06/2008"
        }
    },
    "stj-nancy-andrighi": {
        "nome_completo": "Nancy Andrighi",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "3ª Turma",
            "indicado_por": "Presidente FHC"
        }
    },
    "stj-herman-benjamin": {
        "nome_completo": "Antônio Herman de Vasconcellos e Benjamin",
        "dados_dossie": {
            "secao": "Presidência",
            "turma": "Presidente do STJ",
            "indicado_por": "Presidente Lula",
            "origem": "Ministério Público (MP/SP). Referência mundial em direito ambiental e do consumidor."
        }
    },
    "stj-humberto-martins": {
        "nome_completo": "Humberto Eustáquio Soares Martins",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "2ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura estadual (TJ-AL)"
        }
    },
    "stj-luis-felipe-salomao": {
        "nome_completo": "Luis Felipe Salomão",
        "dados_dossie": {
            "secao": "Vice-Presidência",
            "turma": "Vice-Presidente do STJ",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura estadual (TJ-RJ)"
        }
    },
    "stj-mauro-campbell-marques": {
        "nome_completo": "Mauro Luiz Campbell Marques",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "2ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Ministério Público Federal (MPF)"
        }
    },
    "stj-benedito-goncalves": {
        "nome_completo": "Benedito Gonçalves",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-3)"
        }
    },
    "stj-raul-araujo": {
        "nome_completo": "Raul Araújo Filho",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura estadual (TJ-AL)"
        }
    },
    "stj-maria-thereza-de-assis-moura": {
        "nome_completo": "Maria Thereza Rocha de Assis Moura",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "6ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Advocacia (OAB)"
        }
    },
    "stj-antonio-carlos-ferreira": {
        "nome_completo": "Antônio Carlos Ferreira",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Advocacia (OAB)"
        }
    },
    "stj-isabel-gallotti": {
        "nome_completo": "Maria Isabel Diniz Gallotti Rodrigues",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-1)"
        }
    },
    "stj-marco-buzzi": {
        "nome_completo": "Marco Aurélio Gastaldi Buzzi",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura estadual (TJ-SC)"
        }
    },
    "stj-marco-aurelio-bellizze": {
        "nome_completo": "Marco Aurélio Bellizze Oliveira",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "3ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura estadual (TJ-RJ)"
        }
    },
    "stj-francisco-falcao": {
        "nome_completo": "Francisco Cavalcanti de Albuquerque Falcão",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "Decano - 2ª Turma",
            "indicado_por": "Presidente FHC",
            "origem": "Magistratura federal (TRF-5). Decano do STJ."
        }
    },
    "stj-reynaldo-soares-da-fonseca": {
        "nome_completo": "Reynaldo Soares da Fonseca",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-1)"
        }
    },
    "stj-joao-otavio-de-noronha": {
        "nome_completo": "João Otávio de Noronha",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "3ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Advocacia (OAB). Ex-presidente do STJ (2018-2020)."
        }
    },
    "stj-sergio-kukina": {
        "nome_completo": "Sérgio Luíz Kukina",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Ministério Público (MP/PR)"
        }
    },
    "stj-regina-helena-costa": {
        "nome_completo": "Regina Helena Costa",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-3)"
        }
    },
    "stj-sebastiao-reis-junior": {
        "nome_completo": "Sebastião Alves dos Reis Júnior",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "6ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Advocacia (OAB)"
        }
    },
    "stj-gurgel-de-faria": {
        "nome_completo": "Gurgel de Faria",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-5)"
        }
    },
    "stj-joel-ilan-paciornik": {
        "nome_completo": "Joel Ilan Paciornik",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-4)"
        }
    },
    "stj-ribeiro-dantas": {
        "nome_completo": "Ribeiro Dantas",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura federal (TRF-5)"
        }
    },
    "stj-rogerio-schietti": {
        "nome_completo": "Rogério Schietti Machado Cruz",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "6ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Ministério Público (MPDFT)"
        }
    },
    "stj-antonio-saldanha-palheiro": {
        "nome_completo": "Antônio Saldanha Palheiro",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "6ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura estadual (TJ-RJ). Aposentadoria compulsória em abril/2026."
        }
    },
    "stj-villas-boas-cueva": {
        "nome_completo": "Ricardo Villas Bôas Cueva",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "3ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Advocacia (OAB)"
        }
    },
    "stj-moura-ribeiro": {
        "nome_completo": "Paulo de Tarso Vieira Sanseverino Moura Ribeiro",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "3ª Turma",
            "indicado_por": "Presidente Dilma",
            "origem": "Magistratura estadual (TJ-SP)"
        }
    },
    "stj-daniela-teixeira": {
        "nome_completo": "Daniela Teixeira",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Advocacia (OAB)"
        }
    },
    "stj-messod-azulay-neto": {
        "nome_completo": "Messod Azulay Neto",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "2ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura federal (TRF-2)"
        }
    },
    "stj-paulo-sergio-domingues": {
        "nome_completo": "Paulo Sérgio Domingues",
        "dados_dossie": {
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura federal (TRF-3)"
        }
    },
    "stj-teodoro-silva-santos": {
        "nome_completo": "Teodoro Silva Santos",
        "dados_dossie": {
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura estadual (TJ-BA)"
        }
    },
    "stj-afranio-vilela": {
        "nome_completo": "José Afrânio Vilela de Oliveira",
        "dados_dossie": {
            "secao": "2ª Seção",
            "turma": "4ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura estadual (TJ-MG)"
        }
    },
    "stj-carlos-pires-brandao": {
        "nome_completo": "Carlos Augusto Pires Brandão",
        "dados_dossie": {
            "nascimento": {"data": "1964", "cidade": "Teresina/PI"},
            "secao": "1ª Seção",
            "turma": "2ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Magistratura federal (TRF-1). Engenheiro Elétrico (UFMG) antes do Direito.",
            "formacao": "Engenharia Elétrica (UFMG, 1986), Direito",
            "posse_stj": "04/09/2025"
        }
    },
    "stj-marluce-caldas": {
        "nome_completo": "Maria Marluce Caldas Bezerra",
        "dados_dossie": {
            "nascimento": {"data": "1960", "cidade": "Rio de Janeiro/RJ"},
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "indicado_por": "Presidente Lula",
            "origem": "Ministério Público Estadual (MP/AL). Primeira ministra do STJ vinda de MP Estadual. Aprovada no MP/AL em 1983, posse como promotora em 1986.",
            "posse_stj": "04/09/2025"
        }
    },

    # ===================== TJDFT (6 sem dossiê) =====================
    "tjdft-carmen-nicea-nogueira-bittencourt": {
        "nome_completo": "Carmen Nícea Nogueira Bittencourt",
        "dados_dossie": {
            "nascimento": {"cidade": "Araguari/MG"},
            "origem": "Magistratura (carreira). Filha do Des. Mauro Renan Bittencourt e sobrinha do Des. aposentado Sérgio Bittencourt, ambos do TJDFT. Vocação familiar para a magistratura.",
            "perfil_ideologico": "Familiarista e humanista. Atuação focada em direito de família (2ª Vara de Família de Taguatinga, 2ª Vara de Família do Paranoá). Pilar de atuação é a dignidade da pessoa humana.",
            "perfil_psicologico": "Comprometida com eficiência jurisdicional, tradição familiar na magistratura. Discreta mas firme em suas convicções. Valoriza a dignidade humana como princípio orientador.",
            "estilo_decisorio": "Especialista em direito de família e fazenda pública. Decisões pautadas pela proteção da dignidade humana.",
            "turma": "8ª Turma Cível",
            "formacao": "Pós-graduada University of North Carolina (EUA), CEUB, Escola Superior MPDFT",
            "carreira_previa": "Juíza substituta TJDFT (1995), juíza titular (1997), 2ª Vara Família Taguatinga, 2ª Vara Família Paranoá, 2º Juizado Fazenda Pública DF"
        }
    },
    "tjdft-diva-lucy-de-faria-pereira": {
        "nome_completo": "Diva Lucy de Faria Pereira",
        "dados_dossie": {
            "nascimento": {"cidade": "Anápolis/GO"},
            "origem": "Ministério Público (MPDFT) e depois magistratura. Assessora da Procuradoria do DF, promotora de justiça MPDFT por 5 anos, juíza desde 1994.",
            "perfil_ideologico": "Corajosa e combativa. Enfrentou grileiros em Brazlândia quando no MPDFT, recusando transferência apesar de ameaças. Forte em direito eleitoral (membro TRE-DF) e direito cível.",
            "perfil_psicologico": "Destemida e resiliente. Recusou proteção/transferência diante de ameaças de grileiros. Perfil combativo com forte senso de dever. Especialista em precatórios e direito cível.",
            "estilo_decisorio": "Pragmática e direta. Experiência vasta em varas cíveis e precatórios. Atuação firme contra irregularidades.",
            "turma": "8ª Turma Cível",
            "formacao": "Direito (UnB), especialização Direito Constitucional (IDP)",
            "carreira_previa": "Assessora Procuradoria DF, promotora MPDFT (5 anos), juíza TJDFT (1994), 1ª Vara Cível Gama, 1ª Vara Precatórias DF, juíza eleitoral TRE-DF"
        }
    },
    "tjdft-james-eduardo-da-cruz-de-moraes-oliveira": {
        "nome_completo": "James Eduardo da Cruz de Moraes Oliveira",
        "dados_dossie": {
            "nascimento": {"cidade": "Monte Carmelo/MG"},
            "origem": "Magistratura (carreira) com passagem pela advocacia e Procuradoria do DF. Sobrinho do Des. Getúlio de Moraes Oliveira (decano) e filho do Des. aposentado Eduardo Alberto Oliveira.",
            "perfil_ideologico": "Civilista e consumeirista. Autor de 'Código Civil Anotado e Comentado' e 'Código de Defesa do Consumidor Anotado'. Professor de Direitos Reais na Escola da Magistratura do DF. Acadêmico-prático.",
            "perfil_psicologico": "Intelectual e metódico. Perfil acadêmico forte com publicações jurídicas de referência. Tradição familiar na magistratura do DF (terceira geração). Versatilidade profissional (bancário, Correios, Câmara dos Deputados antes do Direito).",
            "estilo_decisorio": "Doutrinário e fundamentado. Votos longos com forte embasamento doutrinário, reflexo de sua produção acadêmica. Especialista em direito civil e do consumidor.",
            "turma": "4ª Turma Cível / 2ª Câmara Cível",
            "formacao": "Direito (CEUB, 1988)",
            "carreira_previa": "Escriturário Banco Real, funcionário Correios e Câmara dos Deputados, advogado (1989-1993), Procurador do DF (1992-1993), juiz TJDFT (1993), professor Escola Magistratura DF"
        }
    },
    "tjdft-jose-firmo-reis-soub": {
        "nome_completo": "José Firmo Reis Soub",
        "dados_dossie": {
            "nascimento": {"cidade": "Ilhéus/BA"},
            "origem": "Ministério Público (MPDFT). Quinto constitucional. Ingressou no MPDFT em 1984, foi promotor em Taguatinga, Brazlândia e Brasília por 14 anos. Nomeado por Bolsonaro em 2022.",
            "perfil_ideologico": "Processualista cível com longa experiência no MP. Atuação em direitos difusos e coletivos. Coordenou a 5ª Câmara do MPDFT. Ouvidor-Geral substituto do TJDFT (2024).",
            "perfil_psicologico": "Experiente e ponderado. 38 anos de carreira no MP antes de chegar ao TJDFT. Perfil institucional e colaborativo (eleito por 26 votos, mais votado da lista tríplice).",
            "estilo_decisorio": "Processualista com visão do MP. Especialista em direitos difusos, coletivos e individuais homogêneos.",
            "turma": "Ouvidor-Geral Substituto (2024-2026)",
            "formacao": "Direito",
            "carreira_previa": "Defensor público MPDFT (1984), promotor substituto (Taguatinga, Brazlândia, Brasília - 14 anos), procurador de justiça (1998), 18º Ofício Cível, Câmara Coordenação Cível"
        }
    },
    "tjdft-maria-de-fatima-rafael-de-aguiar": {
        "nome_completo": "Maria de Fátima Rafael de Aguiar",
        "dados_dossie": {
            "nascimento": {"data": "1956", "cidade": "Goiânia/GO"},
            "origem": "Magistratura (carreira). Filha do juiz aposentado Espedito Ângelo Rafael (TJDFT). Tradição familiar na magistratura. Iniciou como advogada na OCB/INCRA.",
            "perfil_ideologico": "Generalista cível com experiência em vara criminal. Atuação abrangente: gestão de pessoas, criminal, cível. Participou do Programa História Oral do TJDFT (2025).",
            "perfil_psicologico": "Dedicada e versátil. Passou por diversas áreas (gestão de pessoas, criminal, cível). Entrada na magistratura precedida por período como servidora do próprio TJDFT, conhecendo a instituição por dentro.",
            "estilo_decisorio": "Generalista com experiência diversificada. Atuação em varas cíveis, criminais e juizados.",
            "turma": "Palácio da Justiça Rui Barbosa",
            "formacao": "Direito (UnB), especialização Processo Civil (AEUDF)",
            "carreira_previa": "Advogada OCB/INCRA, servidora TJDFT (gestão de pessoas, diretora 6ª Vara Criminal), juíza TJDFT (1992), 1ª Vara Cível Paranoá, juíza eleitoral TRE-DF (2013)"
        }
    },
    "tjdft-maria-de-lourdes-abreu": {
        "nome_completo": "Maria de Lourdes Abreu",
        "dados_dossie": {
            "nascimento": {"data": "11/02/1953", "cidade": "Goiânia/GO"},
            "origem": "Ministério Público (MPDFT). Quinto constitucional. 33 anos como promotora e procuradora de justiça do DF. Nomeada por Dilma em 2014.",
            "perfil_ideologico": "Veterana do MP com forte viés institucional. Ouvidor-Geral do TJDFT (2024-2026). Foco em diversidade, inclusão social e atendimento ao cidadão. Defensora do acesso à justiça.",
            "perfil_psicologico": "Madura e experiente. 33 anos no MPDFT antes do TJDFT. Perfil institucional e de liderança (dirigiu Fundação Superior MPDFT, assessorou Ministério de Estado). Comprometida com serviço público.",
            "estilo_decisorio": "Processualista cível e penal com visão do MP. Presidenta da 1ª Câmara Cível e 3ª Turma Cível.",
            "turma": "1ª Câmara Cível / 3ª Turma Cível (Presidente)",
            "formacao": "Direito (UFG), pós-graduação Processo Civil e Penal (AEUDF)",
            "carreira_previa": "Defensora pública MPDFT (1981), promotora (1984), procuradora de justiça, diretora Fundação Superior MPDFT, assessora Ministério Desenvolvimento/Indústria/Comércio"
        }
    },

    # ===================== TRF1 (10 sem dossiê) =====================
    "trf1-alexandre-laranjeira": {
        "nome_completo": "Alexandre Jorge Fontes Laranjeira",
        "dados_dossie": {
            "origem": "Magistratura federal (SJDF). Promovido por antiguidade. Nomeado por Alckmin (no exercício da Presidência).",
            "perfil_ideologico": "Juiz federal de carreira com atuação na SJDF. Especialista em questões ambientais e administrativas.",
            "perfil_psicologico": "Técnico e experiente. Longa carreira na SJDF antes da promoção ao TRF1.",
            "estilo_decisorio": "Técnico-administrativo. Atuação em questões ambientais e administrativas como relator na 12ª Turma.",
            "secao": "3ª Seção",
            "turma": "12ª Turma",
            "carreira_previa": "Juiz federal SJDF, promovido por antiguidade em fev/2024"
        }
    },
    "trf1-alexandre-vasconcelos": {
        "nome_completo": "Alexandre Machado Vasconcelos",
        "dados_dossie": {
            "nascimento": {"cidade": "Brasília/DF"},
            "origem": "Magistratura federal. Ex-promotor MPDFT (1991-1993). Juiz federal desde 1993 (SJMG, SJDF). Promovido por antiguidade.",
            "perfil_ideologico": "Juiz federal de carreira com passagem pelo MP e pela magistratura eleitoral (TRE-TO, TRE-PA). Ampla experiência em convocações no TRF1.",
            "perfil_psicologico": "Experiente e versátil. Atuou em múltiplas seções judiciárias e tribunais eleitorais. Perfil institucional pela vasta experiência em convocações.",
            "estilo_decisorio": "Generalista federal com experiência em diversas matérias. Atuação em licitações, contratos administrativos e direito ambiental (3ª Seção).",
            "secao": "3ª Seção",
            "turma": "5ª Turma",
            "formacao": "Direito (UnB, 1990)",
            "carreira_previa": "Advogado (1990-1991), promotor MPDFT (1991-1993), juiz federal substituto SJMG (1993), juiz titular 18ª Vara SJDF (1999), juiz TRE-TO e TRE-PA"
        }
    },
    "trf1-daniele-maranhao": {
        "nome_completo": "Daniele Maranhão Costa",
        "dados_dossie": {
            "nascimento": {"cidade": "Rio de Janeiro/RJ"},
            "origem": "Magistratura federal. 12ª mulher a integrar o TRF1. Juíza federal desde 1993. Nomeada por Temer em 2017, após 3 listas tríplices consecutivas.",
            "perfil_ideologico": "Progressista e humanista. Autora de 'Juízes Cosmopolitas: por uma concepção mundial de direitos humanos'. Presidenta Comissão TRF1 Mulheres. Forte em direitos humanos e formação de magistrados.",
            "perfil_psicologico": "Acadêmica e engajada. Mestrado em Direito/Constituição pela UnB, instrutora CNJ para conciliadores. Ativista por representatividade feminina no Judiciário (AJUFE Mulheres, Vozes Mulheres).",
            "estilo_decisorio": "Constitucionalista e humanista. Votos fundamentados em direitos humanos e direito constitucional. Experiência como instrutora de formação de magistrados.",
            "secao": "3ª Seção (Presidente)",
            "turma": "Presidente da 3ª Seção",
            "formacao": "Direito (UnB), especialização Penal e Tributário, pós-graduação Constitucional (CEUB), pós-graduação Processual Civil (UnB), Mestrado Direito/Estado/Constituição (UnB)",
            "carreira_previa": "Juíza federal substituta SJMG (1993), juíza titular 5ª Vara Federal SJDF, 4 listas tríplices TRF1"
        }
    },
    "trf1-hercules-fajoses": {
        "nome_completo": "Hércules Fajoses",
        "dados_dossie": {
            "origem": "Advocacia (OAB). Quinto constitucional. Lista sêxtupla Conselho Federal OAB. Nomeado por Dilma em 2015.",
            "perfil_ideologico": "Advogado de formação com perfil prático e institucional. Classificou ingresso no TRF1 como 'realização de um sonho'. Atuação em segurança da Justiça Federal e questões administrativas.",
            "perfil_psicologico": "Apaixonado pela magistratura. Valoriza o peso institucional do TRF1. Perfil prático de advogado convertido em magistrado.",
            "estilo_decisorio": "Pragmático com visão da advocacia. Atuação diversificada: 5ª Turma e 7ª Turma. Especialista em execução fiscal e questões regulatórias.",
            "secao": "3ª Seção",
            "turma": "5ª Turma / 7ª Turma",
            "carreira_previa": "Advogado (OAB), quinto constitucional via Conselho Federal da OAB, nomeado Dilma 2015"
        }
    },
    "trf1-jamil-de-jesus-oliveira": {
        "nome_completo": "Jamil Rosa de Jesus Oliveira",
        "dados_dossie": {
            "nascimento": {"data": "06/12/1956", "cidade": "Itauçu/GO"},
            "origem": "Magistratura federal (carreira). Juiz federal desde 1988. Vasta experiência em correições nas seções judiciárias.",
            "perfil_ideologico": "Juiz federal veterano com 36 anos de magistratura antes da promoção. Perfil institucional forte (Corpo Diretor TRF1). Experiência em correições ordinárias e extraordinárias em 7 estados.",
            "perfil_psicologico": "Metódico e disciplinado. Carreira construída desde posições administrativas (INEP, TFR) antes da magistratura. Perfil de gestor (correições em múltiplos estados).",
            "estilo_decisorio": "Institucionalista e correcional. Forte experiência em fiscalização judicial. Atuação na 3ª Seção (licitações, contratos, meio ambiente).",
            "secao": "3ª Seção",
            "turma": "Corpo Diretor / 3ª Seção",
            "formacao": "Direito (AEUDF, 1982)",
            "carreira_previa": "Agente administrativo INEP (1978-1979), auxiliar judiciário TFR (1979-1983), assistente jurídico GDF (1983-1988), advogado (1983-1988), juiz federal (1988), correições 7 estados"
        }
    },
    "trf1-joao-luiz-de-sousa": {
        "nome_completo": "João Luiz de Sousa",
        "dados_dossie": {
            "nascimento": {"data": "09/04/1955", "cidade": "Barueri/SP"},
            "origem": "Magistratura federal. Ex-promotor MPDFT (1985-1988). Juiz federal desde 1988. Professor universitário.",
            "perfil_ideologico": "Juiz federal veterano com formação no MP. Atuação em varas federais no Amazonas, Bahia e DF. Professor universitário (UniDF). Experiência diversificada em estados e regiões.",
            "perfil_psicologico": "Experiente e acadêmico. Passagem pela Defensoria Pública antes do MP e da magistratura. Perfil formativo (instrutor de cursos de magistrados).",
            "estilo_decisorio": "Generalista federal com experiência em múltiplas jurisdições. Atuação na 2ª Turma (1ª Seção): servidores públicos e previdenciário.",
            "secao": "1ª Seção",
            "turma": "2ª Turma",
            "formacao": "Direito",
            "carreira_previa": "Estagiário Defensoria MPDFT (1980-1982), promotor substituto MPDFT (1985-1988), professor UniDF (1987-1993), juiz federal 2ª Vara SJAM (1988), juiz federal 15ª Vara SJDF"
        }
    },
    "trf1-leao-alves": {
        "nome_completo": "Leão Aparecido Alves",
        "dados_dossie": {
            "origem": "Magistratura federal (SJGO). Promovido por merecimento em maio/2023. Reconhecido como gestor que zela pelo bom clima organizacional.",
            "perfil_ideologico": "Garantista. Mantém linha das prerrogativas constitucionais da presunção de inocência e amplo direito de defesa. Experiência como juiz instrutor no STJ (gabinete Min. Isabel Gallotti).",
            "perfil_psicologico": "Gestor humanizado, reconhecido por servidores pelo bom clima organizacional. Garantista convicto. Versátil (convocado em 9 gabinetes diferentes no TRF1 e no STJ).",
            "estilo_decisorio": "Garantista e processualista penal. Atuação na 2ª Seção: matéria penal, improbidade administrativa, desapropriação.",
            "secao": "2ª Seção",
            "turma": "2ª Seção (3ª, 4ª e 10ª Turmas)",
            "formacao": "Direito (AEUDF, 1990), pós-graduação Penal e Processo Penal (Anhanguera Uniderp, 2013)",
            "carreira_previa": "Juiz federal SJGO (1994-1999), juiz TRE-GO (2009-2015), convocado TRF1 (9 gabinetes, 2003-2020), juiz instrutor STJ/Min. Gallotti (2021)"
        }
    },
    "trf1-morais-da-rocha": {
        "nome_completo": "Eduardo Morais da Rocha",
        "dados_dossie": {
            "nascimento": {"cidade": "Brasília/DF"},
            "origem": "Magistratura federal. Ex-promotor MPDFT (1997-1998). Doutor em Direito (UFMG), pós-doutor (Univ. Lisboa). Recordista: 30 mil processos em 2 anos.",
            "perfil_ideologico": "Eficientista e acadêmico de alto nível. Doutor em Direito pela UFMG sob orientação de Misabel Derzi (referência em tributário). Pós-doutor pela Univ. Lisboa sob Jorge Miranda. Professor Emérito da ESMAF. Foco em efetivação de direitos sociais.",
            "perfil_psicologico": "Altamente produtivo e inovador. Reduziu acervo de 41 mil ações em menos de 3 anos. Perfil acadêmico de elite combinado com gestão processual excepcional. Orientado por resultados.",
            "estilo_decisorio": "Eficientista com base acadêmica sólida. Especialista em direito tributário, previdenciário e de servidores. Projeto de gestão processual reconhecido pelo CNJ.",
            "secao": "1ª Seção",
            "turma": "1ª Turma",
            "formacao": "Direito (UnB, 1994), especialização ESMPDF (1995), Mestrado Tributário (UFMG, 2005, orient. Misabel Derzi), Doutorado (UFMG, 2015), Pós-doutorado (Univ. Lisboa, 2016, orient. Jorge Miranda)",
            "carreira_previa": "Promotor MPDFT (1997-1998), juiz federal substituto SJDF (1998), juiz titular 4ª Vara SJPI, juiz titular 27ª Vara SJMG (2002), Professor Emérito ESMAF (2019)"
        }
    },
    "trf1-novely-vilanova": {
        "nome_completo": "Novély Vilanova da Silva Reis",
        "dados_dossie": {
            "nascimento": {"data": "13/09/1950", "cidade": "Ribeira do Pombal/BA"},
            "origem": "Magistratura federal. Ex-procurador DNER. Juiz federal desde 1987. Professor de Processo Civil no UniCEUB por quase 20 anos.",
            "perfil_ideologico": "Processualista civil veterano. Quase 40 anos de magistratura federal. Professor de Processo Civil por duas décadas. Perfil técnico-processual consolidado.",
            "perfil_psicologico": "Veterano e acadêmico. Carreira longa que inclui docência universitária continuada (1991-2010). Perfil de estabilidade institucional. Atuou em 6 seções judiciárias diferentes.",
            "estilo_decisorio": "Processualista civil clássico. Votos fundamentados em técnica processual. Experiência diversificada em múltiplas jurisdições (RJ, AM, AC, PI, TO, DF).",
            "secao": "1ª Seção",
            "turma": "Sede II, 6º andar",
            "formacao": "Direito (Faculdade de Direito da Sociedade Barramansense de Ensino Superior/Barra Mansa/RJ, 1978)",
            "carreira_previa": "Procurador autárquico DNER, juiz federal 7ª Vara SJDF (1987), atuou em SJRJ/SJAM/SJAC/SJPI/SJTO, professor Processo Civil UniCEUB (1991-2010)"
        }
    },
    "trf1-rosana-noya-alves-weibel-kaufmann": {
        "nome_completo": "Rosana Noya Alves Weibel Kaufmann",
        "dados_dossie": {
            "origem": "Magistratura federal. Ex-procuradora Fazenda BA. Juíza federal com passagem pelo TRE-BA. Promovida por antiguidade em mai/2023.",
            "perfil_ideologico": "Justiça social e acesso ao ensino superior. Especialista em questões do FIES. Formação em Administração além de Direito. Mestrado em Direito Econômico (UFBA).",
            "perfil_psicologico": "Comprometida com justiça social. Trajetória diversificada (Administração, Fazenda estadual, TRE, magistratura federal). Foco em acesso à educação e financiamento estudantil.",
            "estilo_decisorio": "Especialista em direito econômico e educacional. Atuação em questões de FIES, contratos administrativos e meio ambiente (3ª Seção).",
            "secao": "3ª Seção",
            "turma": "12ª Turma",
            "formacao": "Administração de Empresas (UC Salvador), Mestrado Direito Econômico (UFBA)",
            "carreira_previa": "Procuradora Fazenda BA, analista TRE-BA, juíza federal 6ª Vara SJDF, 6ª e 7ª Varas SJBA, Vara Única Ilhéus/BA, diretora foro SJBA (1999-2001)"
        }
    },
}


def carregar_perfil(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def salvar_perfil(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def merge_dossie(existente, novo):
    """Merge dados_dossie sem sobrescrever dados existentes não-vazios."""
    if existente is None:
        existente = {}
    for key, value in novo.items():
        if key == "nascimento" and isinstance(value, dict):
            if "nascimento" not in existente or existente["nascimento"] is None:
                existente["nascimento"] = {}
            for nk, nv in value.items():
                if nv and (nk not in existente["nascimento"] or not existente["nascimento"].get(nk)):
                    existente["nascimento"][nk] = nv
        elif value and (key not in existente or not existente.get(key)):
            existente[key] = value
    return existente


def carregar_dados_agentes():
    """Carrega dados dos JSONs produzidos pelos agentes de pesquisa."""
    dados_extras = {}
    arquivos_agentes = [
        META_DIR / "pesquisa_stj_web.json",
        META_DIR / "pesquisa_tjdft_web.json",
        META_DIR / "pesquisa_trf1_web.json",
        META_DIR / "pesquisa_academica_tribunais.json",
    ]
    for arq in arquivos_agentes:
        if arq.exists():
            print(f"  Carregando dados do agente: {arq.name}")
            try:
                with open(arq, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # Extrair dados por magistrado
                for key in ["ministros", "desembargadores"]:
                    if key in data:
                        for mid, mdata in data[key].items():
                            if mid not in dados_extras:
                                dados_extras[mid] = {}
                            dados_extras[mid].update(mdata)
                # Dados acadêmicos por magistrado
                if "dados_por_magistrado" in data:
                    for mid, mdata in data["dados_por_magistrado"].items():
                        if mid not in dados_extras:
                            dados_extras[mid] = {}
                        dados_extras[mid]["dados_academicos"] = mdata
            except Exception as e:
                print(f"  ERRO ao carregar {arq}: {e}")
    return dados_extras


def enriquecer_perfis():
    print("=" * 60)
    print("ENRIQUECIMENTO DE PERFIS - DADOS WEB")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Carregar dados extras dos agentes
    print("\n1. Carregando dados dos agentes de pesquisa...")
    dados_agentes = carregar_dados_agentes()
    print(f"   Dados de agentes para {len(dados_agentes)} magistrados")

    # Combinar dados
    dados_combinados = dict(DADOS_PESQUISA)
    for mid, mdata in dados_agentes.items():
        if mid not in dados_combinados:
            dados_combinados[mid] = {}
        # Merge nome_completo
        if "nome_completo" in mdata and mdata["nome_completo"]:
            if "nome_completo" not in dados_combinados[mid] or not dados_combinados[mid].get("nome_completo"):
                dados_combinados[mid]["nome_completo"] = mdata["nome_completo"]
        # Merge dados_dossie
        if "dados_dossie" not in dados_combinados[mid]:
            dados_combinados[mid]["dados_dossie"] = {}
        for key in ["nascimento", "origem", "perfil_ideologico", "perfil_psicologico",
                     "estilo_decisorio", "secao", "turma", "formacao", "carreira_previa",
                     "indicado_por", "posse_stj", "especialidade", "curiosidades"]:
            val = mdata.get(key)
            if val and not dados_combinados[mid]["dados_dossie"].get(key):
                dados_combinados[mid]["dados_dossie"][key] = val

    print(f"   Total de magistrados com dados: {len(dados_combinados)}")

    # Processar perfis
    print("\n2. Atualizando perfis JSON...")
    tribunais = ["STF", "STJ", "TJDFT", "TRF1"]
    stats = {"atualizados": 0, "nome_completo": 0, "dossie_novo": 0, "dossie_enriquecido": 0, "sem_dados": 0}

    for tribunal in tribunais:
        pasta = BASE_DIR / tribunal
        if not pasta.exists():
            continue
        for arq in sorted(pasta.glob("*.json")):
            perfil = carregar_perfil(arq)
            perfil_id = perfil.get("id", arq.stem)
            modificado = False

            dados = dados_combinados.get(perfil_id, {})
            if not dados:
                stats["sem_dados"] += 1
                continue

            # Atualizar nome_completo
            if dados.get("nome_completo") and (not perfil.get("nome_completo") or perfil["nome_completo"] is None):
                perfil["nome_completo"] = dados["nome_completo"]
                stats["nome_completo"] += 1
                modificado = True

            # Atualizar dados_dossie
            if dados.get("dados_dossie"):
                if "dados_publicos" not in perfil:
                    perfil["dados_publicos"] = {}
                existente = perfil["dados_publicos"].get("dados_dossie")
                tinha_dossie = existente is not None and existente != {}

                novo_dossie = merge_dossie(existente, dados["dados_dossie"])
                perfil["dados_publicos"]["dados_dossie"] = novo_dossie

                if not tinha_dossie:
                    stats["dossie_novo"] += 1
                else:
                    stats["dossie_enriquecido"] += 1
                modificado = True

            if modificado:
                perfil["atualizado_em"] = "2026-01-31"
                salvar_perfil(arq, perfil)
                stats["atualizados"] += 1
                print(f"   ✓ {perfil_id}")

    # Relatório
    print("\n" + "=" * 60)
    print("RESULTADO DO ENRIQUECIMENTO")
    print("=" * 60)
    print(f"  Perfis atualizados:        {stats['atualizados']}")
    print(f"  nome_completo preenchido:   {stats['nome_completo']}")
    print(f"  dados_dossie criado (novo): {stats['dossie_novo']}")
    print(f"  dados_dossie enriquecido:   {stats['dossie_enriquecido']}")
    print(f"  Sem dados disponíveis:      {stats['sem_dados']}")

    # Salvar log
    log = {
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "stats": stats,
        "magistrados_atualizados": list(dados_combinados.keys())
    }
    META_DIR.mkdir(exist_ok=True)
    with open(META_DIR / "log_enriquecimento_web.json", 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
    print(f"\nLog salvo em: {META_DIR / 'log_enriquecimento_web.json'}")


if __name__ == "__main__":
    enriquecer_perfis()
