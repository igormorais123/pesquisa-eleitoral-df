"""
Script de enriquecimento - Rodada 2.
Foca nos 30 perfis sem nome_completo e 21 sem perfil_ideologico.
"""
import json
import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
META_DIR = Path("meta")

# ============================================================
# DADOS COLETADOS VIA PESQUISA WEB - RODADA 2
# ============================================================

DADOS_RODADA2 = {
    # ===================== STF =====================
    "stf-luis-roberto-barroso": {
        "nome_completo": "Luís Roberto Barroso",
        "dados_dossie": {
            "nascimento": {"data": "11/03/1958", "cidade": "Vassouras/RJ"},
            "perfil_ideologico": "Progressista. Defensor de direitos individuais e liberdades civis. Advogou pelo reconhecimento de uniões homoafetivas, Lei de Biossegurança e interrupção de gestação de anencéfalos. Votou pela descriminalização do aborto até 12 semanas. Defendeu voto eletrônico contra ataques do governo Bolsonaro. Perfil marcadamente liberal em costumes e garantista.",
            "perfil_psicologico": "Articulado, assertivo e midiático. Intelectual público com forte presença acadêmica e comunicacional. Combina rigor técnico com capacidade de traduzir questões jurídicas para linguagem acessível. Não evita polêmicas quando convicto.",
            "estilo_decisorio": "Constitucionalista ativista moderado. Votos longos e fundamentados com referências ao direito comparado. Combina interpretação constitucional progressista com pragmatismo institucional. Especialista em controle de constitucionalidade.",
            "formacao": "Direito (UERJ, 1980), Mestrado (Yale Law School, 1989), Doutorado (UERJ, 1990), Pós-doutorado (Harvard Law School). Professor titular de Direito Constitucional da UERJ.",
            "carreira_previa": "Procurador do Estado do RJ (1985, 1° lugar), advogado constitucionalista sócio-sênior de Barroso & Associados (RJ/BSB/SP), professor visitante em Poitiers (2010) e Wroclaw (2009)",
            "indicado_por": "Presidente Dilma Rousseff",
            "posse_stf": "26/06/2013"
        }
    },

    # ===================== STJ =====================
    "stj-messod-azulay": {
        "nome_completo": "Messod Azulay Neto",
        "dados_dossie": {
            "nascimento": {"data": "26/10/1963", "cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Técnico-moderado na área penal. Oriundo do quinto constitucional (advocacia), traz visão equilibrada entre garantismo e efetividade. Indicado por Bolsonaro, mas perfil mais técnico que ideológico. Especialista em direito penal e previdenciário.",
            "perfil_psicologico": "Metódico e reservado. Formação multicultural (descendente de judeus marroquinos, judeu ortodoxo). Experiência diversificada entre advocacia corporativa e magistratura. Autor prolífico (7 livros). Interessado em inteligência artificial aplicada ao judiciário.",
            "estilo_decisorio": "Técnico-processualista com experiência prática em direito empresarial e penal. Valoriza fundamentação detalhada e jurisprudência consolidada.",
            "formacao": "Direito (UFRJ), extensão em Direito Administrativo e Empresarial (FGV)",
            "carreira_previa": "Advogado (1986-2005), chefe jurídico Telerj (1993-1998), assessor jurídico Telemar (1998-2005), desembargador TRF-2 (2005-2022, indicado por Lula pelo quinto), diretor Centro Cultural Justiça Federal, professor direito penal Assespa (2006-2009)",
            "indicado_por": "Presidente Jair Bolsonaro",
            "posse_stj": "06/12/2022"
        }
    },

    "stj-joao-otavio-de-noronha": {
        "dados_dossie": {
            "perfil_ideologico": "Conservador-pragmático. Próximo dos governos Temer e Bolsonaro (cotado para vaga no STF). Decisões polêmicas incluem prisão domiciliar para Queiroz, sigilo dos exames de Bolsonaro, e voto contra ação penal no caso do menino Miguel. Contrário a uniões poliafetivas. Defensor da segurança jurídica e unificação de jurisprudência. Perfil institucionalista com tendência conservadora em costumes.",
            "perfil_psicologico": "Empreendedor e político-institucional. Hábil articulador. Combina experiência bancária (Banco do Brasil) com visão pragmática. Defende modernização e eficiência (reduziu acervo do STJ em 15% como presidente). Investiu em IA e informática no tribunal.",
            "estilo_decisorio": "Pragmático-institucionalista. Prioriza segurança jurídica e uniformização de jurisprudência. Reconhece que 'muitas vezes é preciso abrir mão de convicção pessoal em favor da unidade da jurisprudência'. Perfil mais gerencial que acadêmico.",
            "formacao": "Direito (Faculdade de Direito do Sul de Minas, 1981), especialização em Direito do Trabalho, Processual do Trabalho e Processual Civil",
            "carreira_previa": "Funcionário Banco do Brasil (1975-1984), advogado do BB (1984-1994), consultor jurídico geral BB (1994-2001), diretor jurídico BB (2001-2002)",
            "indicado_por": "Presidente Fernando Henrique Cardoso",
            "posse_stj": "2002"
        }
    },

    # ===================== TJDFT =====================
    "tjdft-alvaro-luis-de-araujo-sales-ciarlini": {
        "nome_completo": "Álvaro Luís de Araújo Sales Ciarlini",
        "dados_dossie": {
            "nascimento": {"cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Juiz da Caixa de Pandora — condenou ex-governador Arruda e envolvidos em esquema de corrupção, gerando inelegibilidade de diversos ex-deputados distritais. Doutor em Direito Constitucional pela UnB, mestre em Filosofia. Ex-secretário-geral do CNJ (2008-2009). Perfil técnico-garantista com coragem para enfrentar poder político.",
            "formacao": "Direito (AEUDF, 1987), Mestrado em Filosofia (UnB, 2001), Doutorado em Direito, Estado e Constituição (UnB, 2008), especialização em Direito Processual (AEUDF). Professor titular UniCEUB (1997-2018).",
            "carreira_previa": "Juiz substituto TJDFT (1994), juiz de direito (1996), titular 1ª Vara Cível Planaltina e 2ª Vara Fazenda Pública DF, Secretário-Geral CNJ (2008-2009), membro titular TRE-DF, diretor Escola Judiciária Eleitoral TRE-DF (2004-2006)"
        }
    },

    "tjdft-angelo-canducci-passareli": {
        "nome_completo": "Ângelo Canducci Passareli",
        "dados_dossie": {
            "nascimento": {"data": "02/1954", "cidade": "Coronel Goulart/SP"},
            "perfil_ideologico": "Veterano da magistratura do DF (desde 1989). Carreira diversificada: Promotor em MG, Procurador do Estado de SP. 2º Vice-Presidente do TJDFT (2024-2026). Presidente TRE-DF e Ouvidor-Geral da Justiça Eleitoral. Reconhecido pela discrição e técnica na elaboração de votos. Perfil institucionalista.",
            "formacao": "Direito (Faculdade Anhanguera de Ciências Humanas, Goiânia/GO)",
            "carreira_previa": "Promotor de Justiça MG (1983-1985), Procurador do Estado de SP (1985-1989), juiz TJDFT (1989), presidente TRE-DF, Ouvidor-Geral Justiça Eleitoral DF, 1º vice-presidente TJDFT (2022-2024), 2º vice-presidente TJDFT (2024-2026)"
        }
    },

    "tjdft-esdras-neves-almeida": {
        "nome_completo": "Esdras Neves Almeida",
        "dados_dossie": {
            "nascimento": {"data": "16/09/1951", "cidade": "Boa Vista/RR"},
            "perfil_ideologico": "Acadêmico-processualista com formação incomum (bacharel em Economia e Direito, mestre em Economia, doutor em Direito). Tese crítica sobre tribunais superiores ('O Mito da Prestação Jurisdicional'). Especialista em direito processual civil e empresarial. Professor universitário desde 1981.",
            "formacao": "Economia (UnB, 1973), Mestrado em Economia (UnB, 1980), Direito (UnB, 1984), Doutorado em Direito (UFPE, 2004), tese 'O Mito da Prestação Jurisdicional pelos Tribunais Superiores Brasileiros'",
            "carreira_previa": "Professor universitário (desde 1981, UCB, IESB, UPIS/DF), juiz substituto TJDFT (1993), juiz de direito 1ª Vara Cível Taguatinga (1996), juiz substituto 2º Grau (2013), desembargador 6ª Turma Cível"
        }
    },

    "tjdft-hector-valverde-santanna": {
        "nome_completo": "Héctor Valverde Santanna",
        "dados_dossie": {
            "nascimento": {"data": "17/05/1965", "cidade": "Goiânia/GO"},
            "perfil_ideologico": "Consumerista acadêmico — doutor e mestre em Direito do Consumidor pela PUC-SP (orientador: Nelson Nery Junior). Terceira geração de desembargadores na família. Perfil afável, conciliador e discreto. Declarou que 'questões políticas têm que ser decididas pelo Executivo' — evita ativismo judicial.",
            "formacao": "Direito (UFG, 1988), Mestrado em Direito das Relações Sociais (PUC-SP, 2001), Doutorado em Direito das Relações Sociais (PUC-SP, 2004), ambos orientados por Nelson Nery Junior. Autor de 'Dano Moral no Direito do Consumidor' e 'Prescrição e Decadência nas Relações de Consumo'.",
            "carreira_previa": "Procurador do Estado de Goiás (1990-1994), juiz TJDFT (1994), titular Vara Criminal Sobradinho (1996), desembargador eleitoral substituto TRE-DF (2016), titular TRE-DF (2018-2020), diretor Escola Judiciária Eleitoral DF (2018-2020), professor UniCEUB, FACIPLAC e FESMPDFT"
        }
    },

    "tjdft-leonardo-roscoe-bessa": {
        "nome_completo": "Leonardo Roscoe Bessa",
        "dados_dossie": {
            "nascimento": {"cidade": "Brasília/DF"},
            "perfil_ideologico": "Consumerista de destaque — 18 anos na Promotoria de Defesa do Consumidor. Ex-Procurador-Geral de Justiça do DF (2014-2018). Presidente do BRASILCON. Integrou Comissão de Juristas do Senado para atualização do CDC. Autor de 9 livros sobre direito do consumidor. Perfil técnico-progressista na proteção do consumidor.",
            "formacao": "Direito (UnB, 1990), Mestrado em Direito Público (UnB), Doutorado em Direito Civil (UERJ, 2008). Professor mestrado/doutorado UniCEUB.",
            "carreira_previa": "Promotor de Justiça MPDFT (1991), 18 anos na Promotoria de Defesa do Consumidor, Procurador-Geral de Justiça DF (2014-2018), presidente BRASILCON (2006-2010), membro Comissão Juristas Senado (CDC), desembargador TJDFT (2021, quinto MP)"
        }
    },

    "tjdft-sandoval-gomes-de-oliveira": {
        "nome_completo": "Sandoval Gomes de Oliveira",
        "dados_dossie": {
            "nascimento": {"cidade": "Brasília/DF"},
            "perfil_ideologico": "Primeiro desembargador nascido em Brasília. Começou como auxiliar judiciário no TJDFT (1981) e percorreu toda a carreira interna. Carreira passando por MG (Promotor e Juiz estadual) antes de retornar ao DF. Presidente da AMAGIS-DF (2012-2014). Perfil pragmático-institucionalista, conhecedor profundo do tribunal.",
            "formacao": "Direito (AEUDF, 1986), especialização em Direito Privado (UCB, 1999), especialização em Direito Civil e Novo Código (UniCEUB, 2008)",
            "carreira_previa": "Auxiliar judiciário TJDFT (1981), técnico e analista judiciário (1981-1988), Promotor de Justiça MG (1988, Carmo do Paranaíba, Paracatu, Ituiutaba), juiz TJMG (1990), juiz substituto TJDFT (1993), presidente AMAGIS-DF (2012-2014), membro TRE-DF (2014-2016), professor PMDF e AEUDF"
        }
    },

    "tjdft-waldir-leoncio-cordeiro-lopes-junior": {
        "nome_completo": "Waldir Leôncio Cordeiro Lopes Júnior",
        "dados_dossie": {
            "nascimento": {"data": "04/09/1957", "cidade": "Fortaleza/CE"},
            "perfil_ideologico": "Presidente do TJDFT (2024-2026). Carreira longa na magistratura do DF (desde 1984, 40 anos). Ex-Defensor Público do MPDFT. Presidiu comissão de alteração do Regimento Interno do TJDFT (2009). Atua na 3ª Turma Criminal, Câmara Criminal e Conselho Especial. Perfil institucionalista-conservador com ênfase em gestão.",
            "formacao": "Direito (AEUDF), especialização em Direito Público Interno e Direito Privado (AEUDF e UCB), Mestrado em Direito Público (UFPE)",
            "carreira_previa": "Defensor Público MPDFT (1981-1984), juiz substituto TJDFT (1984), juiz de direito (1991), desembargador (2003), 2º Vice-Presidente TJDFT (2014-2016), Vice-Presidente e Corregedor TRE-DF (2018-2020), Presidente TJDFT (2024-2026)"
        }
    },

    # ===================== TRF1 =====================
    "trf1-i-talo-mendes": {
        "nome_completo": "Ítalo Fioravanti Sabo Mendes",
        "dados_dossie": {
            "nascimento": {"cidade": "Diamantino/MT"},
            "perfil_ideologico": "Garantista-moderado com viés constitucionalista. Acadêmico (doutor e pós-doutor), com forte base teórica. Primo do ministro Gilmar Mendes. Oriundo do MPF pelo quinto constitucional. Perfil institucionalista com ênfase em direitos fundamentais e processo civil.",
            "formacao": "Direito (UnB, 1983), Mestrado em Direito e Estado (UnB, 1987), Doutorado em Direito, Estado e Constituição (UnB, 2008), Pós-Doutorado (Universidade de Salamanca/Espanha, 2020). Professor Adjunto de Direito Processual Civil na UnB desde 1995.",
            "carreira_previa": "Advogado SERPRO (1983-1984), Procurador da República (1984-1998), Procurador-Chefe DF (1989-1994), Procurador Regional Eleitoral DF (1988-1993), negociador do Tratado de Extradição Brasil-Reino Unido (1994), procurador-chefe no caso PC Farias",
            "indicado_por": "Presidente Fernando Henrique Cardoso (quinto constitucional MPF)"
        }
    },

    "trf1-solange-salgado-da-silva": {
        "dados_dossie": {
            "nascimento": {"data": "08/04/1961", "cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Perfil complexo. Carreira diversificada (MP-MG, defensoria, magistratura estadual e federal). Decisão controversa no caso Banco Master (2025) — primeiro manteve prisão, depois revogou para medidas cautelares. Ex-presidente da Ajufer. Absolvida em inquérito sobre Ajufer por falta de provas. Atuação em direito penal federal.",
            "formacao": "Direito (Faculdade Cândido Mendes/RJ, 1985), Mestrado em Direito Penal (Universidade Gama Filho), pós-graduações (AEUDF e UnB)",
            "carreira_previa": "Promotora de Justiça MP-MG (1987-1992), defensora pública RJ, juíza de direito TJ-MG (1992), juíza federal TRF1 (1992, lotada no Maranhão e depois DF), ex-presidente da Ajufer, professora em várias instituições, presidente Comissão TRF1 Mulheres"
        }
    },

    "trf1-antonio-scarpa": {
        "dados_dossie": {
            "nascimento": {"cidade": "Minas Gerais"},
            "perfil_ideologico": "Especialista em direito penal federal com atuação destacada na Bahia. Perfil técnico com experiência em varas criminais especializadas. Atuou na Justiça Eleitoral baiana e recebeu honrarias. Mestre em Direito Público pela UFBA.",
            "formacao": "Direito (Faculdade Milton Campos/MG, 1992), Mestrado em Direito Público (UFBA, 2005), especialização em Processo (Faculdade Maurício de Nassau/Salvador)",
            "carreira_previa": "Juiz federal substituto 6ª Vara DF (1997), juiz titular 17ª Vara Criminal BA, vice e diretor do Foro da SJBA, juiz relator 1ª Turma Recursal JEF-BA, auxílio à Corregedoria e Presidência do TRF1, membro TRE-BA (2018-2020), professor Direito Penal UniJorge, coautor 'Temas de Direito Penal e Processual Penal' (Jus Podivm, 2013)",
            "indicado_por": "Presidente Lula (merecimento, 2023)"
        }
    },

    "trf1-carlos-eduardo-moreira-alves": {
        "nome_completo": "Carlos Eduardo Maul Moreira Alves",
        "dados_dossie": {
            "nascimento": {"cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Institucionalista-moderado. Filho do ministro Moreira Alves (ex-presidente e decano do STF). Perfil gerencial focado em produtividade. Como presidente do TRF1 (2018-2020), ao lado do vice Kassio Nunes Marques. Oriundo do quinto constitucional.",
            "formacao": "Direito (CEUB/Brasília, 1982), Pós-Graduação (UnB, 1985) em Direito Civil, Constitucional, Penal Especial e Teoria Geral do Direito Público",
            "carreira_previa": "Nomeado desembargador em 1998 pelo quinto constitucional. Presidente TRF1 (2018-2020), presidente da 2ª e 6ª Turmas",
            "indicado_por": "Presidente Fernando Henrique Cardoso (quinto constitucional)"
        }
    },

    "trf1-pedro-braga-filho": {
        "nome_completo": "Pedro Braga Filho",
        "dados_dossie": {
            "nascimento": {"cidade": "Salvador/BA"},
            "perfil_ideologico": "Técnico com forte base acadêmica em direito econômico e tributário. Longa carreira como juiz federal na Bahia (30 anos). Atuação em direito tributário e econômico. Promovido por antiguidade em 2022.",
            "formacao": "Direito (UFBA, 1978), Mestrado em Direito Econômico (UFBA, 1998)",
            "carreira_previa": "Procurador do Trabalho MPT (1991-1992), juiz federal substituto SJPI (1992-1993), juiz federal SJBA (1993-2022, com várias funções), membro TRE-PI e TRE-BA, presidente 2ª Turma Recursal SJBA, professor substituto UFBA e FACS-Salvador"
        }
    },

    "trf1-roberto-carvalho-veloso": {
        "nome_completo": "Roberto Carvalho Veloso",
        "dados_dossie": {
            "nascimento": {"data": "25/11/1963", "cidade": "Teresina/PI"},
            "perfil_ideologico": "Acadêmico e institucionalista com forte atuação associativa. Ex-presidente da AJUFE (2016-2018). Membro da Comissão de Juristas do Senado para o novo Código Eleitoral. Especialista em direito penal, tributário e eleitoral. Perfil progressista-moderado, com ênfase em modernização do Judiciário.",
            "formacao": "Direito (UFPI, 1987), Mestrado em Direito (UFPE, 2002), Doutorado em Direito (UFPE, 2008), Pós-Doutorado em Direito (Mackenzie, 2021), especialização em Teologia Sistemática (Faculdades Batista/PR, 2024). Professor Associado UFMA e UNIEURO.",
            "carreira_previa": "Assessor Parlamentar Câmara dos Deputados, Promotor de Justiça do Maranhão, juiz federal (1995), juiz TRE-PI e TRE-MA, presidente da AJUFE (2016-2018), membro Comissão Juristas Senado (novo Código Eleitoral), coordenador Pós-Graduação Direito UFMA",
            "indicado_por": "Presidente Lula (merecimento, 2023)"
        }
    },

    "trf1-jose-amilcar-machado": {
        "nome_completo": "José Amilcar de Queiroz Machado",
        "dados_dossie": {
            "nascimento": {"data": "01/01/1952", "cidade": "Patrocínio/MG"},
            "perfil_ideologico": "Veterano institucionalista. Decano do TRF1 com mais de 25 anos como desembargador (posse em 1999). Ex-presidente do TRF1. Nomeado pelo extinto TFR em 1987. Experiência em tribunal de alçada e advocacia antes da magistratura.",
            "formacao": "Direito (UFMG, 1980)",
            "carreira_previa": "Auxiliar Judiciário e Oficial de Gabinete do Tribunal de Alçada de MG, advogado (sócio-fundador ADESP), juiz federal substituto 16ª Vara RJ (1987, nomeado por Sarney via TFR), juiz titular 5ª Vara Federal MG, 6x convocado para TRF1, presidente TRF1"
        }
    },

    "trf1-rafael-paulo": {
        "dados_dossie": {
            "nascimento": {"cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Técnico com ampla experiência em diversas seções judiciárias (DF, Acre, Tocantins, Bahia, Goiás). Passou pela Presidência do STJ (auxiliar, 2016-2018) e pelo gabinete do ministro Gilmar Mendes no STF (2019-2020). Promovido por merecimento após 3 listas tríplices. Atua em matérias de servidores públicos e previdência.",
            "formacao": "Direito (UnB, 1995), pós-graduação lato sensu em Direito Público (UnB, 2002-2004)",
            "carreira_previa": "Advogado (1995-1998), promotor adjunto MPDFT (1998), juiz federal substituto SJDF (1998-2021), atuação em múltiplas varas e turmas recursais, auxílio Presidência STJ (2016-2018), auxiliar gabinete Min. Gilmar Mendes STF (2019-2020)"
        }
    },

    "trf1-euler-de-almeida": {
        "dados_dossie": {
            "nascimento": {"cidade": "Goiás"},
            "perfil_ideologico": "Especialista em direito agrário e previdenciário. Mestre em Direito Agrário pela UFG. Atuou como juiz federal em Goiás antes da promoção. Relator na 9ª Turma (1ª Seção) com foco em servidores públicos e previdência social.",
            "formacao": "Mestrado em Direito Agrário (UFG, 2001), dissertação sobre desapropriação agrária e indenização",
            "carreira_previa": "Juiz federal SJGO, promovido por antiguidade em 2023 (Lei 14.253/2021 que ampliou TRF1 de 27 para 43 desembargadores)"
        }
    },

    "trf1-gustavo-soares-amorim": {
        "nome_completo": "Luis Gustavo Soares Amorim de Sousa",
        "dados_dossie": {
            "nascimento": {"cidade": "São Luís/MA"},
            "perfil_ideologico": "Advogado oriundo do quinto constitucional. Desembargador mais jovem do Brasil quando empossado (38 anos). Conexões políticas relevantes: sobrinho do ministro Reynaldo Soares da Fonseca (STJ), genro da ex-governadora Roseana Sarney. Indicado por Bolsonaro. Especialista em direito tributário e administrativo.",
            "formacao": "Direito (UniCEUB/Brasília), pós-graduação em Poder Judiciário e Atividade Meio, especialização em Direito Tributário, mestrando em Ciências Jurídico-Políticas (Universidade Portucalense/Portugal). Professor da Universidade Ceuma.",
            "carreira_previa": "Assessor Departamento de Transformação Mineral do Ministério de Minas e Energia (2008-2009), sócio Soares Amorim Advogados (São Luís e Brasília), presidente Comissão de Direito Sindical OAB-MA (2019-2021)",
            "indicado_por": "Presidente Jair Bolsonaro (quinto constitucional advocacia, 2022)"
        }
    },

    "trf1-gilda-sigmaringa-seixas": {
        "dados_dossie": {
            "nascimento": {"cidade": "Rio de Janeiro/RJ"},
            "perfil_ideologico": "Progressista-institucionalista com foco em modernização e questões de gênero. Vice-presidente do TRF1 (2024-2026). Segunda mulher a dirigir a Esmaf. Representante da Ouvidoria Nacional da Mulher na Região Norte (CNJ). Sensível a questões sociais (concedeu isenção de IR para cegueira monocular). Forte atuação em conciliação.",
            "formacao": "Direito (UNICEUB/Brasília), pós-graduação lato sensu em Carreiras Jurídicas",
            "carreira_previa": "Juíza federal SJBH (1999-2005), juíza federal SJDF (2005-2014), coordenadora JEFs, diretora do Foro SJDF (2012), inaugurou Central de Conciliação SJDF (2012) e Central de Descarte e Videoconferência (2014), diretora Esmaf (2023-2024), vice-presidente TRF1 (2024-2026)"
        }
    },

    "trf1-rosimayre-goncalves-de-carvalho": {
        "nome_completo": "Rosimayre Gonçalves de Carvalho",
        "dados_dossie": {
            "nascimento": {"cidade": "Paracatu/MG"},
            "perfil_ideologico": "Perfil de superação pessoal (filha de trabalhadores rurais). Primeira lista tríplice do TRF1 formada exclusivamente por mulheres. Foco em direito digital (mestrado). Atuação na 9ª Turma (1ª Seção) em direito previdenciário e de servidores.",
            "formacao": "Direito (UFU/MG, 1992), Filosofia (UCB/Brasília, 2020), Mestrado em Ciências Jurídicas com ênfase em Direito Digital (UFPB)",
            "carreira_previa": "Juíza federal (múltiplas seções), juíza eleitoral TRE-MA (2001-2003), auxílio Presidência STF (2013-2014), mãe solo de dois filhos. Nomeada por Lula após 3 listas tríplices consecutivas",
            "indicado_por": "Presidente Lula (merecimento)"
        }
    },

    "trf1-candice-lavocat-galvao-jobim": {
        "dados_dossie": {
            "perfil_ideologico": "Perfil institucionalista-técnico com forte viés de gestão. Ex-presidente da Ajufer, ex-conselheira do CNJ (2019-2021), ex-auxiliar na Corregedoria do CNJ e Presidência do STJ e TRF1. Oriunda da procuradoria e advocacia pública. Especialista em direito ambiental (mestrado nos EUA). Professora licenciada de Direito Civil.",
            "formacao": "Direito (UniCEUB, 1996), Mestrado em Direito Ambiental e Propriedade Intelectual (Universidade do Texas em Austin/EUA)",
            "carreira_previa": "Procuradora da Fazenda Nacional, Procuradora do Estado da Bahia, analista do MPU, juíza federal SJDF (2005), auxiliar Corregedoria CNJ, auxiliar Presidência STJ e TRF1, presidente Ajufer (2012-2014), vice-presidente Ajufe (2016-2018), conselheira CNJ (2019-2021), professora Direito Civil UniCEUB"
        }
    },

    "trf1-cesar-jatahy": {
        "dados_dossie": {
            "nascimento": {"cidade": "Salvador/BA"},
            "perfil_ideologico": "Técnico com forte viés acadêmico em direito penal. Mestre em Direito Público pela UFBA com dissertação sobre responsabilidade penal da pessoa jurídica em crimes ambientais. Família jurídica (pai foi vice-presidente e corregedor do TRE-BA, irmão preside o TRE-BA). Promovido por merecimento após 3 listas consecutivas.",
            "formacao": "Direito (UFBA, 1993), Mestrado em Direito Público (UFBA), dissertação sobre responsabilidade penal de pessoa jurídica e proteção do meio ambiente",
            "carreira_previa": "Auxiliar judiciário TRE-BA (1989-1993), promotor eleitoral, juiz federal substituto SJBA (1998), juiz titular 6ª Vara Cível SJMA (2001), diretor do Foro SJMA, membro Turma Recursal JEF-MA, professor Direito Penal UFBA (1998-2000) e EMAB",
            "indicado_por": "Presidente Bolsonaro (merecimento, 2020)"
        }
    },

    "trf1-marcos-augusto-de-sousa": {
        "dados_dossie": {
            "nascimento": {"data": "08/10/1965", "cidade": "Ceres/GO"},
            "perfil_ideologico": "Institucionalista-moderado com perfil gerencial. Vice-presidente do TRF1 (2022-2024). Carreira diversificada antes da magistratura (aprovado em 1º lugar como Promotor de Justiça em GO). Especialista em processo civil e direito ambiental. Membro do TRE-DF (2024). Preside Comissão Permanente do Manual de Cálculos da Justiça Federal desde 2001.",
            "formacao": "Direito (PUC Goiás, 1988), mestrado em Direito e Políticas Públicas (UniCEUB, em andamento)",
            "carreira_previa": "Advogado em Goiânia (1989-1990), aprovado como Procurador do Estado GO, Promotor de Justiça GO (1º lugar) e Juiz de Direito GO (1990), juiz estadual GO (Goianésia, Vianópolis), juiz federal substituto SJAM (1992), juiz titular 1ª Vara SJAM (1995), professor UFAM e UniCEUB (licenciado), membro TRE-AM",
            "indicado_por": "Presidente Dilma Rousseff (merecimento, 2014)"
        }
    },

    "trf1-maura-moraes-tayer": {
        "dados_dossie": {
            "nascimento": {"data": "26/09/1957", "cidade": "Paraúna/GO"},
            "perfil_ideologico": "Veterana com carreira diversificada (advocacia, MP, procuradoria estadual, Procuradoria da República, magistratura). Especialista em direito agrário (mestre pela UFG com dissertação sobre reforma agrária). Promovida por antiguidade. Professora na PUC Goiás desde 1996.",
            "formacao": "Direito (UFG, 1981), especialização em Direito Civil, Processual Civil e Constitucional, Mestrado em Direito Agrário (UFG), dissertação 'Efetivação Judicial das Normas Constitucionais sobre Reforma Agrária'",
            "carreira_previa": "Advogada, promotora de Justiça GO, procuradora do Estado de Goiás, procuradora da República, juíza federal titular 1ª Vara SJGO (1992), professora PUC Goiás desde 1996"
        }
    },

    "trf1-newton-ramos": {
        "dados_dossie": {
            "nascimento": {"data": "21/02/1975", "cidade": "São Luís/MA"},
            "perfil_ideologico": "Processualista acadêmico com forte viés em cooperação judicial. Doutor em Direito Processual Civil pela PUC-SP com tese sobre poderes do juiz no processo cooperativo. Foco em eficiência processual e precedentes (defende que sistema traz segurança jurídica). Membro do IBDP e ABDPRO.",
            "formacao": "Direito (UFMA, 2000), Mestrado em Direito, Estado e Constituição (UnB, 2011), Doutorado em Direito Processual Civil (PUC-SP, 2017), tese sobre poderes do juiz no processo civil cooperativo. Professor Adjunto UFMA (em colaboração com UnB).",
            "carreira_previa": "Procurador do Estado e juiz de direito do Maranhão, juiz federal (2005, posse em Caxias/MA), juiz federal em Imperatriz/MA, São Luís/MA e SJDF, auxiliar Corregedoria TRF1 (2017-2018, 2020-2022), auxiliar Presidência TRF1 (2018), auxiliar Vice-Presidência TRF1 (2018-2020, 2022)",
            "indicado_por": "Presidente Lula (merecimento, 2023)"
        }
    },

    "trf1-urbano-leal-berquo-neto": {
        "dados_dossie": {
            "nascimento": {"cidade": "Goiânia/GO"},
            "perfil_ideologico": "Técnico com carreira multifacetada (Promotor, Procurador, Juiz estadual e federal). Goiano com base em direito processual civil. Participou da instalação da Turma Recursal dos JEFs em Goiás. Promovido por antiguidade em 2023.",
            "formacao": "Direito (UFG), pós-graduação em Direito Processual Civil, Processual Penal e Civil (UFG)",
            "carreira_previa": "Procurador do Estado de Goiás, Promotor de Justiça de GO e do MPDFT, juiz de direito GO e TO, procurador da República, juiz federal SJGO, diretor do Foro SJGO, professor Direito Civil e Processual Civil UFG"
        }
    },

    "trf1-wilson-alves-de-souza": {
        "dados_dossie": {
            "nascimento": {"data": "24/03/1953", "cidade": "Riachão do Jacuípe/BA"},
            "perfil_ideologico": "Acadêmico prolífico com múltiplos doutorados internacionais. Forte viés processualista. Especialista em processo civil com formação em Buenos Aires e pós-doutorado em Coimbra. Professor convidado da Universidade de Girona. Longa carreira na Bahia com atuação em direito previdenciário.",
            "formacao": "Direito (UFBA), Mestrado em Direito Econômico, Doutorado em Direito (Universidade de Buenos Aires), Doutorado em Direito e Ciências Sociais (Universidad del Museo Social Argentino), Pós-doutorado em Direito Processual Civil (Universidade de Coimbra). Professor convidado Universidade de Girona (Máster em Cultura Jurídica).",
            "carreira_previa": "Juiz federal substituto SJBA (1990), membro TRE-BA (1996-1998), juiz convocado Câmara Regional Previdenciária BA, pai do juiz Valnei Souza (TJBA)",
            "indicado_por": "Presidente Bolsonaro (antiguidade, 2019)"
        }
    },
}


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


def carregar_dados_agentes_v2():
    """Carrega dados dos JSONs produzidos pelos agentes - rodada 2."""
    dados_extras = {}
    arquivos = [
        META_DIR / "pesquisa_tjdft_rodada2.json",
        META_DIR / "pesquisa_trf1_rodada2.json",
    ]
    for arq in arquivos:
        if arq.exists():
            print(f"  Carregando: {arq.name}")
            try:
                with open(arq, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # Aceita formato direto {id: dados} ou {chave: {id: dados}}
                if isinstance(data, dict):
                    for key, val in data.items():
                        if isinstance(val, dict) and ("nome_completo" in val or "nascimento" in val or "perfil_ideologico" in val or "formacao" in val):
                            dados_extras[key] = val
                        elif isinstance(val, dict):
                            for mid, mdata in val.items():
                                if isinstance(mdata, dict):
                                    dados_extras[mid] = mdata
            except Exception as e:
                print(f"  ERRO: {e}")
    return dados_extras


def enriquecer():
    print("=" * 60)
    print("ENRIQUECIMENTO RODADA 2 - LACUNAS RESTANTES")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Carregar dados agentes
    print("\n1. Carregando dados dos agentes...")
    dados_agentes = carregar_dados_agentes_v2()
    print(f"   Dados de agentes: {len(dados_agentes)} magistrados")

    # Combinar
    dados_combinados = dict(DADOS_RODADA2)
    for mid, mdata in dados_agentes.items():
        if mid not in dados_combinados:
            dados_combinados[mid] = {}
        if "nome_completo" in mdata and mdata["nome_completo"]:
            if not dados_combinados[mid].get("nome_completo"):
                dados_combinados[mid]["nome_completo"] = mdata["nome_completo"]
        if "dados_dossie" not in dados_combinados[mid]:
            dados_combinados[mid]["dados_dossie"] = {}
        for key in ["nascimento", "origem", "perfil_ideologico", "perfil_psicologico",
                     "estilo_decisorio", "secao", "turma", "formacao", "carreira_previa",
                     "indicado_por"]:
            val = mdata.get(key)
            if val and not dados_combinados[mid]["dados_dossie"].get(key):
                dados_combinados[mid]["dados_dossie"][key] = val

    print(f"   Total combinado: {len(dados_combinados)} magistrados")

    # Processar perfis
    print("\n2. Atualizando perfis JSON...")
    tribunais = ["STF", "STJ", "TJDFT", "TRF1"]
    stats = {"atualizados": 0, "nome_completo": 0, "perfil_ideologico": 0, "outros": 0, "sem_dados": 0}

    for tribunal in tribunais:
        pasta = BASE_DIR / tribunal
        if not pasta.exists():
            continue
        for arq in sorted(pasta.glob("*.json")):
            with open(arq, 'r', encoding='utf-8') as f:
                perfil = json.load(f)
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

                # Verificar se perfil_ideologico será preenchido
                tinha_pi = existente and existente.get("perfil_ideologico")
                novo_dossie = merge_dossie(existente, dados["dados_dossie"])
                tem_pi = novo_dossie.get("perfil_ideologico")
                if not tinha_pi and tem_pi:
                    stats["perfil_ideologico"] += 1

                perfil["dados_publicos"]["dados_dossie"] = novo_dossie
                modificado = True

            if modificado:
                perfil["atualizado_em"] = "2026-01-31"
                with open(arq, 'w', encoding='utf-8') as f:
                    json.dump(perfil, f, ensure_ascii=False, indent=2)
                stats["atualizados"] += 1
                print(f"   + {perfil_id}")

    # Relatorio
    print("\n" + "=" * 60)
    print("RESULTADO RODADA 2")
    print("=" * 60)
    print(f"  Perfis atualizados:         {stats['atualizados']}")
    print(f"  nome_completo preenchidos:   {stats['nome_completo']}")
    print(f"  perfil_ideologico novos:     {stats['perfil_ideologico']}")
    print(f"  Sem dados disponíveis:       {stats['sem_dados']}")

    # Log
    log = {
        "data": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "rodada": 2,
        "stats": stats,
        "magistrados_atualizados": [k for k in dados_combinados.keys()]
    }
    META_DIR.mkdir(exist_ok=True)
    with open(META_DIR / "log_enriquecimento_rodada2.json", 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
    print(f"\nLog: {META_DIR / 'log_enriquecimento_rodada2.json'}")


if __name__ == "__main__":
    enriquecer()
