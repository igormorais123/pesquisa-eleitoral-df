# -*- coding: utf-8 -*-
"""
Script para converter personas de gestores do MD para JSON
"""
import json
import re
import os
from datetime import datetime

# Caminhos
MD_PUBLICO = r"C:\Users\igorm\Downloads\artigo nivel estrategico tatico e operacional\PERSONAS_PUBLICO_COMPLETO.md"
MD_PRIVADO = r"C:\Users\igorm\Downloads\artigo nivel estrategico tatico e operacional\PERSONAS_PRIVADO_COMPLETO.md"
OUTPUT_JSON = r"C:\Users\igorm\pesquisa-eleitoral-df\agentes\banco-gestores.json"

def extrair_valor(texto, campo):
    """Extrai valor de um campo específico"""
    padrao = rf"{campo}:\s*(.+?)(?:\n|$)"
    match = re.search(padrao, texto, re.IGNORECASE)
    return match.group(1).strip() if match else ""

def extrair_idade(texto):
    """Extrai idade do texto"""
    match = re.search(r"(\d{2})\s*anos", texto)
    return int(match.group(1)) if match else 45

def extrair_genero(nome):
    """Infere gênero pelo nome"""
    nomes_femininos = ['maria', 'ana', 'juliana', 'patricia', 'cristiane', 'luciana',
                       'debora', 'sandra', 'adriana', 'helena', 'mariana', 'carolina',
                       'amanda', 'fernanda', 'andrea', 'renata', 'camila', 'beatriz',
                       'larissa', 'leticia', 'priscila', 'vanessa', 'daniela', 'tatiana',
                       'marcela', 'gabriela', 'rafaela', 'paula', 'carla', 'simone']
    primeiro_nome = nome.split()[0].lower()
    return 'feminino' if primeiro_nome in nomes_femininos else 'masculino'

def extrair_podc(texto):
    """Extrai distribuição PODC"""
    match = re.search(r"Planejar:\s*(\d+(?:[.,]\d+)?)\s*%?\s*\|\s*Organizar:\s*(\d+(?:[.,]\d+)?)\s*%?\s*\|\s*Dirigir:\s*(\d+(?:[.,]\d+)?)\s*%?\s*\|\s*Controlar:\s*(\d+(?:[.,]\d+)?)", texto)
    if match:
        return {
            "planejar": float(match.group(1).replace(',', '.')),
            "organizar": float(match.group(2).replace(',', '.')),
            "dirigir": float(match.group(3).replace(',', '.')),
            "controlar": float(match.group(4).replace(',', '.'))
        }
    return {"planejar": 25, "organizar": 25, "dirigir": 25, "controlar": 25}

def determinar_area_atuacao(cargo, contexto):
    """Determina área de atuação baseado no cargo"""
    texto = (cargo + " " + contexto).lower()

    if any(x in texto for x in ['rh', 'pessoas', 'gestão de pessoas', 'recursos humanos']):
        return 'gestao_pessoas'
    elif any(x in texto for x in ['financ', 'orçament', 'contab', 'tesour']):
        return 'financeiro_orcamento'
    elif any(x in texto for x in ['jurídic', 'legal', 'advogad', 'procurad']):
        return 'juridico'
    elif any(x in texto for x in ['ti', 'tecnologia', 'informação', 'sistema', 'dados', 'digital']):
        return 'tecnologia_informacao'
    elif any(x in texto for x in ['infraestrutura', 'obras', 'engenharia', 'construção']):
        return 'infraestrutura_obras'
    elif any(x in texto for x in ['saúde', 'hospital', 'médic', 'vigilância']):
        return 'saude'
    elif any(x in texto for x in ['educação', 'ensino', 'escola', 'pedagog']):
        return 'educacao'
    elif any(x in texto for x in ['avaliação', 'monitoramento', 'pesquisa', 'estudo']):
        return 'avaliacao_monitoramento'
    elif any(x in texto for x in ['licitação', 'contrat', 'compras']):
        return 'licitacoes_contratos'
    elif any(x in texto for x in ['comunicação', 'imprensa', 'mídia']):
        return 'comunicacao'
    elif any(x in texto for x in ['auditoria', 'controle interno']):
        return 'auditoria'
    elif any(x in texto for x in ['vendas', 'comercial']):
        return 'comercial_vendas'
    elif any(x in texto for x in ['marketing', 'marca', 'publicidade']):
        return 'marketing'
    elif any(x in texto for x in ['produção', 'manufatura', 'fábrica', 'planta']):
        return 'producao'
    elif any(x in texto for x in ['logística', 'supply', 'cadeia']):
        return 'logistica_supply'
    elif any(x in texto for x in ['controller', 'controladoria']):
        return 'controladoria'
    elif any(x in texto for x in ['compliance']):
        return 'compliance'
    elif any(x in texto for x in ['operaç', 'operation']):
        return 'operacoes'
    else:
        return 'estrategia'

def determinar_tipo_orgao(instituicao, contexto):
    """Determina tipo de órgão público"""
    texto = (instituicao + " " + contexto).lower()

    if any(x in texto for x in ['ministério', 'secretaria nacional', 'secretaria-executiva']):
        return 'ministerio'
    elif any(x in texto for x in ['autarquia', 'inss', 'inep', 'anatel', 'anvisa', 'ana', 'anm', 'aneel', 'funai']):
        return 'autarquia'
    elif any(x in texto for x in ['empresa pública', 'embrapa', 'correios', 'codesp', 'bndes', 'caixa', 'bb']):
        return 'empresa_publica'
    elif any(x in texto for x in ['fundação', 'fiocruz', 'funarte']):
        return 'fundacao'
    elif any(x in texto for x in ['agência reguladora', 'agência nacional', 'aneel', 'anatel', 'anp', 'ana', 'anm', 'anpd']):
        return 'agencia_reguladora'
    elif any(x in texto for x in ['cgu', 'tcu', 'controle', 'auditoria']):
        return 'orgao_controle'
    elif any(x in texto for x in ['tribunal', 'justiça', 'trf', 'stf', 'stj']):
        return 'tribunal'
    elif any(x in texto for x in ['hospital', 'hc', 'hu']):
        return 'hospital_publico'
    elif any(x in texto for x in ['universidade federal', 'ufrj', 'unb', 'usp', 'unicamp']):
        return 'universidade_federal'
    elif any(x in texto for x in ['instituto', 'ipea', 'ibge', 'inpe']):
        return 'instituto_pesquisa'
    else:
        return 'autarquia'

def determinar_setor_privado(instituicao, contexto):
    """Determina setor privado"""
    texto = (instituicao + " " + contexto).lower()

    if any(x in texto for x in ['indústria', 'manufatura', 'fábrica', 'autopeças', 'automotiv']):
        return 'industria'
    elif any(x in texto for x in ['banco', 'financ', 'fintech', 'seguradora', 'investimento']):
        return 'financeiro'
    elif any(x in texto for x in ['varejo', 'loja', 'supermercado', 'farmácia', 'moda']):
        return 'varejo'
    elif any(x in texto for x in ['tecnologia', 'software', 'startup', 'tech', 'ia', 'ti']):
        return 'tecnologia'
    elif any(x in texto for x in ['hospital', 'saúde', 'clínica', 'operadora']):
        return 'saude'
    elif any(x in texto for x in ['agro', 'fazenda', 'agrícola', 'agronegócio']):
        return 'agronegocio'
    elif any(x in texto for x in ['construtor', 'incorporador', 'imobiliár']):
        return 'construcao'
    elif any(x in texto for x in ['energia', 'elétric', 'petróleo', 'gás', 'petroquímic']):
        return 'energia'
    elif any(x in texto for x in ['telecom', 'telefon']):
        return 'telecomunicacoes'
    elif any(x in texto for x in ['logística', 'transporte', 'distribuição']):
        return 'logistica'
    elif any(x in texto for x in ['escola', 'universidade', 'ensino']):
        return 'educacao_privada'
    elif any(x in texto for x in ['escritório', 'advocacia', 'jurídic']):
        return 'juridico'
    elif any(x in texto for x in ['consultoria', 'consulting']):
        return 'consultoria'
    else:
        return 'servicos'

def determinar_estilo_lideranca(texto):
    """Determina estilo de liderança"""
    texto = texto.lower()

    if any(x in texto for x in ['transformacional', 'mudança', 'inovação']):
        return 'transformacional'
    elif any(x in texto for x in ['transacional', 'metas', 'resultados']):
        return 'transacional'
    elif any(x in texto for x in ['democrático', 'participativo', 'colegiado']):
        return 'democratico'
    elif any(x in texto for x in ['autoritário', 'diretivo', 'centralizador']):
        return 'autoritario'
    elif any(x in texto for x in ['laissez-faire', 'delega', 'autonomia']):
        return 'laissez_faire'
    elif any(x in texto for x in ['servical', 'servant', 'apoio']):
        return 'servical'
    elif any(x in texto for x in ['técnico', 'especialista', 'expert']):
        return 'tecnico'
    elif any(x in texto for x in ['coaching', 'mentor', 'desenvolv']):
        return 'coaching'
    elif any(x in texto for x in ['visionário', 'visão', 'estratégico']):
        return 'visionario'
    elif any(x in texto for x in ['coordenativo', 'articulador', 'orquestra']):
        return 'coordenativo'
    else:
        return 'democratico'

def processar_persona_md(texto_persona, setor, nivel, numero):
    """Processa uma persona do MD e retorna objeto JSON"""

    # Extrair nome
    match_nome = re.search(r"##\s*PERSONA\s+(?:ESTRATÉGICA|TÁTICA|OPERACIONAL)\s+\d+:\s*(.+)", texto_persona, re.IGNORECASE)
    nome = match_nome.group(1).strip() if match_nome else f"Gestor {setor.title()} {nivel.title()} {numero}"

    # Extrair campos
    idade = extrair_idade(texto_persona)
    genero = extrair_genero(nome)

    # Formação
    formacao_match = re.search(r"Formação:\s*(.+?)(?:\n|$)", texto_persona)
    formacao_texto = formacao_match.group(1) if formacao_match else ""
    formacao_lista = [f.strip() for f in re.split(r'[,;]', formacao_texto) if f.strip()]

    # Cargo
    cargo_match = re.search(r"Cargo(?:\s+atual)?:\s*(.+?)(?:\n|$)", texto_persona, re.IGNORECASE)
    cargo = cargo_match.group(1).strip() if cargo_match else "Gestor"

    # Instituição (contexto organizacional)
    contexto_match = re.search(r"\*\*Contexto Organizacional\*\*\s*\n(.+?)(?:\n\*\*|\Z)", texto_persona, re.DOTALL)
    contexto = contexto_match.group(1).strip() if contexto_match else ""

    # Extrair instituição do cargo ou contexto
    if "em " in cargo.lower() or "do " in cargo.lower() or "da " in cargo.lower():
        partes = re.split(r'\s+(?:em|do|da|no|na)\s+', cargo, maxsplit=1, flags=re.IGNORECASE)
        if len(partes) > 1:
            instituicao = partes[1].strip()
        else:
            instituicao = contexto[:100] if contexto else "Órgão Federal"
    else:
        # Tentar extrair do contexto
        inst_match = re.search(r"^([^,.:]+)", contexto)
        instituicao = inst_match.group(1).strip() if inst_match else "Organização"

    # Tempo no cargo
    tempo_match = re.search(r"Tempo no cargo:\s*(.+?)(?:\n|$)", texto_persona, re.IGNORECASE)
    tempo_cargo = tempo_match.group(1).strip() if tempo_match else "2 anos"

    # Trajetória
    trajetoria_match = re.search(r"\*\*Trajetória(?:\s+de\s+Carreira)?\*\*\s*\n(.+?)(?:\n\*\*|\Z)", texto_persona, re.DOTALL)
    trajetoria = trajetoria_match.group(1).strip() if trajetoria_match else ""

    # Desafios
    desafios_match = re.search(r"\*\*Desafios(?:\s+Cotidianos)?\*\*\s*\n(.+?)(?:\n\*\*|\Z)", texto_persona, re.DOTALL)
    desafios_texto = desafios_match.group(1).strip() if desafios_match else ""
    desafios = [d.strip() for d in re.split(r'[;.]', desafios_texto) if d.strip() and len(d.strip()) > 5][:6]

    # Competências
    comp_match = re.search(r"\*\*Competências(?:\s+Distintivas)?\*\*\s*\n(.+?)(?:\n\*\*|\Z)", texto_persona, re.DOTALL)
    comp_texto = comp_match.group(1).strip() if comp_match else ""
    competencias = [c.strip() for c in re.split(r'[;,]', comp_texto) if c.strip() and len(c.strip()) > 3][:8]

    # Estilo de liderança
    estilo_match = re.search(r"\*\*Estilo de Liderança\*\*\s*\n(.+?)(?:\n\*\*|\Z)", texto_persona, re.DOTALL)
    estilo_texto = estilo_match.group(1).strip() if estilo_match else ""
    estilo = determinar_estilo_lideranca(estilo_texto)

    # PODC
    podc = extrair_podc(texto_persona)

    # Determinar área de atuação
    area = determinar_area_atuacao(cargo, contexto)

    # Localização
    loc_match = re.search(r"Localização:\s*(.+?)(?:\n|$)", texto_persona, re.IGNORECASE)
    localizacao = loc_match.group(1).strip() if loc_match else "Brasília, DF"

    # Criar ID
    prefixo = "pub" if setor == "publico" else "prv"
    nivel_abrev = nivel[0]
    id_gestor = f"gest-{prefixo}-{nivel_abrev}-{numero:03d}"

    # Montar objeto
    gestor = {
        "id": id_gestor,
        "nome": nome,
        "setor": setor,
        "nivel_hierarquico": nivel,
        "idade": idade,
        "genero": genero,
        "formacao_academica": formacao_lista[:3] if formacao_lista else ["Graduação"],
        "cargo": cargo,
        "instituicao": instituicao[:100],
        "area_atuacao": area,
        "tempo_no_cargo": tempo_cargo,
        "localizacao": localizacao,
        "trajetoria_carreira": trajetoria[:500] if trajetoria else "Trajetória profissional sólida na área.",
        "desafios_cotidianos": desafios if desafios else ["Gestão de equipe", "Cumprimento de metas", "Limitações orçamentárias"],
        "competencias_distintivas": competencias if competencias else ["Liderança", "Comunicação", "Planejamento"],
        "estilo_lideranca": estilo,
        "distribuicao_podc": podc,
        "historia_resumida": f"{nome} é {cargo.lower()} com experiência em {area.replace('_', ' ')}. {trajetoria[:200] if trajetoria else ''}",
        "criado_em": datetime.now().isoformat(),
        "atualizado_em": datetime.now().isoformat()
    }

    # Adicionar campos específicos por setor
    if setor == "publico":
        gestor["tipo_orgao"] = determinar_tipo_orgao(instituicao, contexto)
        carreira_match = re.search(r"Carreira:\s*(.+?)(?:\n|$)", texto_persona, re.IGNORECASE)
        if carreira_match:
            gestor["carreira"] = carreira_match.group(1).strip()
    else:
        gestor["setor_privado"] = determinar_setor_privado(instituicao, contexto)
        gestor["porte_empresa"] = "grande_nacional"  # Default

    return gestor

def extrair_personas_md(arquivo_md, setor):
    """Extrai todas as personas de um arquivo MD"""

    try:
        with open(arquivo_md, 'r', encoding='utf-8') as f:
            conteudo = f.read()
    except Exception as e:
        print(f"Erro ao ler {arquivo_md}: {e}")
        return []

    gestores = []

    # Separar por níveis
    niveis = [
        ('estrategico', r'#\s*PARTE\s*1.*?ESTRATÉGICO.*?(?=#\s*PARTE\s*2|\Z)'),
        ('tatico', r'#\s*PARTE\s*2.*?TÁTICO.*?(?=#\s*PARTE\s*3|\Z)'),
        ('operacional', r'#\s*PARTE\s*3.*?OPERACIONAL.*?(?=\Z)')
    ]

    for nivel, padrao_nivel in niveis:
        match_nivel = re.search(padrao_nivel, conteudo, re.DOTALL | re.IGNORECASE)
        if not match_nivel:
            continue

        texto_nivel = match_nivel.group(0)

        # Encontrar todas as personas neste nível
        personas = re.split(r'(?=##\s*PERSONA\s+(?:ESTRATÉGICA|TÁTICA|OPERACIONAL)\s+\d+:)', texto_nivel)

        contador = 0
        for persona_texto in personas:
            if '## PERSONA' in persona_texto.upper():
                contador += 1
                try:
                    gestor = processar_persona_md(persona_texto, setor, nivel, contador)
                    gestores.append(gestor)
                    print(f"  Processado: {gestor['nome']} ({nivel})")
                except Exception as e:
                    print(f"  Erro ao processar persona {contador} ({nivel}): {e}")

    return gestores

def gerar_personas_complementares(setor, nivel, existentes, total_desejado=30):
    """Gera personas complementares para atingir o total desejado"""

    personas_geradas = []
    atual = len(existentes)

    # Templates de cargos por nível e setor
    cargos_publico = {
        'estrategico': [
            ("Secretário Nacional", "ministerio", "Secretaria Nacional"),
            ("Diretor de Autarquia", "autarquia", "Autarquia Federal"),
            ("Presidente de Fundação", "fundacao", "Fundação Pública"),
            ("Diretor de Agência Reguladora", "agencia_reguladora", "Agência Reguladora"),
            ("Secretário-Executivo", "ministerio", "Ministério"),
        ],
        'tatico': [
            ("Coordenador-Geral", "ministerio", "Ministério"),
            ("Superintendente Regional", "autarquia", "Superintendência Regional"),
            ("Gerente de Departamento", "empresa_publica", "Empresa Pública"),
            ("Coordenador de Área", "autarquia", "Autarquia"),
            ("Diretor de Divisão", "ministerio", "Secretaria"),
        ],
        'operacional': [
            ("Técnico Administrativo", "autarquia", "Autarquia Federal"),
            ("Analista de Sistemas", "ministerio", "Ministério"),
            ("Assistente de Atendimento", "autarquia", "Agência de Atendimento"),
            ("Técnico de Enfermagem", "hospital_publico", "Hospital Federal"),
            ("Auxiliar Administrativo", "ministerio", "Ministério"),
        ]
    }

    cargos_privado = {
        'estrategico': [
            ("CEO", "industria", "Indústria Nacional"),
            ("CFO", "financeiro", "Banco Digital"),
            ("Diretor-Presidente", "tecnologia", "Empresa de Tecnologia"),
            ("COO", "varejo", "Rede de Varejo"),
            ("VP de Operações", "logistica", "Empresa de Logística"),
        ],
        'tatico': [
            ("Gerente Regional", "varejo", "Rede de Lojas"),
            ("Gerente de Planta", "industria", "Fábrica"),
            ("Head de RH", "tecnologia", "Startup"),
            ("Controller", "financeiro", "Empresa"),
            ("Gerente de Projetos", "consultoria", "Consultoria"),
        ],
        'operacional': [
            ("Vendedor", "varejo", "Loja de Varejo"),
            ("Operador de Máquinas", "industria", "Fábrica"),
            ("Atendente de SAC", "servicos", "Central de Atendimento"),
            ("Técnico de Manutenção", "industria", "Indústria"),
            ("Auxiliar de Logística", "logistica", "Centro de Distribuição"),
        ]
    }

    templates = cargos_publico if setor == 'publico' else cargos_privado
    cargos_nivel = templates.get(nivel, templates['tatico'])

    nomes_masculinos = ["Carlos", "José", "Paulo", "Marcos", "Ricardo", "Fernando", "Roberto", "Eduardo", "André", "Pedro", "Luiz", "Bruno", "Rafael", "Diego", "Thiago"]
    nomes_femininos = ["Maria", "Ana", "Juliana", "Fernanda", "Patrícia", "Carla", "Luciana", "Cristiane", "Amanda", "Camila", "Beatriz", "Larissa", "Gabriela", "Rafaela", "Tatiana"]
    sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Araújo"]

    areas = ['gestao_pessoas', 'financeiro_orcamento', 'tecnologia_informacao', 'operacoes', 'estrategia']
    estilos = ['transformacional', 'transacional', 'democratico', 'tecnico', 'coordenativo']

    import random

    for i in range(atual + 1, total_desejado + 1):
        # Alternar gênero
        if i % 2 == 0:
            nome = f"{random.choice(nomes_femininos)} {random.choice(sobrenomes)} {random.choice(sobrenomes)}"
            genero = "feminino"
        else:
            nome = f"{random.choice(nomes_masculinos)} {random.choice(sobrenomes)} {random.choice(sobrenomes)}"
            genero = "masculino"

        cargo_info = cargos_nivel[i % len(cargos_nivel)]
        area = areas[i % len(areas)]
        estilo = estilos[i % len(estilos)]

        # Idade baseada no nível
        if nivel == 'estrategico':
            idade = random.randint(45, 60)
        elif nivel == 'tatico':
            idade = random.randint(38, 52)
        else:
            idade = random.randint(25, 45)

        # PODC baseado no nível
        if nivel == 'estrategico':
            podc = {"planejar": random.randint(25, 35), "organizar": random.randint(28, 38), "dirigir": random.randint(20, 28), "controlar": random.randint(10, 18)}
        elif nivel == 'tatico':
            podc = {"planejar": random.randint(20, 28), "organizar": random.randint(22, 32), "dirigir": random.randint(28, 38), "controlar": random.randint(18, 28)}
        else:
            podc = {"planejar": random.randint(8, 15), "organizar": random.randint(18, 28), "dirigir": random.randint(42, 55), "controlar": random.randint(15, 25)}

        # Normalizar para 100%
        total = sum(podc.values())
        podc = {k: round(v * 100 / total, 1) for k, v in podc.items()}

        prefixo = "pub" if setor == "publico" else "prv"
        nivel_abrev = nivel[0]

        gestor = {
            "id": f"gest-{prefixo}-{nivel_abrev}-{i:03d}",
            "nome": nome,
            "setor": setor,
            "nivel_hierarquico": nivel,
            "idade": idade,
            "genero": genero,
            "formacao_academica": ["Graduação em Administração", "MBA em Gestão"],
            "cargo": cargo_info[0],
            "instituicao": cargo_info[2],
            "area_atuacao": area,
            "tempo_no_cargo": f"{random.randint(1, 8)} anos",
            "localizacao": random.choice(["Brasília, DF", "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG"]),
            "trajetoria_carreira": f"Profissional com experiência sólida na área de {area.replace('_', ' ')}.",
            "desafios_cotidianos": ["Gestão de equipe", "Cumprimento de metas", "Otimização de processos"],
            "competencias_distintivas": ["Liderança", "Comunicação", "Planejamento estratégico"],
            "estilo_lideranca": estilo,
            "distribuicao_podc": podc,
            "historia_resumida": f"{nome} é {cargo_info[0].lower()} com experiência em {area.replace('_', ' ')}.",
            "criado_em": datetime.now().isoformat(),
            "atualizado_em": datetime.now().isoformat()
        }

        if setor == "publico":
            gestor["tipo_orgao"] = cargo_info[1]
        else:
            gestor["setor_privado"] = cargo_info[1]
            gestor["porte_empresa"] = "grande_nacional"

        personas_geradas.append(gestor)

    return personas_geradas

def main():
    print("=" * 60)
    print("CONVERSAO DE PERSONAS DE GESTORES MD -> JSON")
    print("=" * 60)

    todos_gestores = []

    # Processar setor público
    print("\n[1/2] Processando personas do SETOR PÚBLICO...")
    if os.path.exists(MD_PUBLICO):
        gestores_publico = extrair_personas_md(MD_PUBLICO, "publico")
        print(f"  -> Extraídas {len(gestores_publico)} personas")

        # Separar por nível e complementar
        for nivel in ['estrategico', 'tatico', 'operacional']:
            existentes = [g for g in gestores_publico if g['nivel_hierarquico'] == nivel]
            if len(existentes) < 30:
                print(f"  -> Gerando {30 - len(existentes)} personas complementares para {nivel} público")
                complementares = gerar_personas_complementares("publico", nivel, existentes, 30)
                gestores_publico.extend(complementares)

        todos_gestores.extend(gestores_publico)
    else:
        print(f"  AVISO: Arquivo não encontrado: {MD_PUBLICO}")
        # Gerar todas as personas
        for nivel in ['estrategico', 'tatico', 'operacional']:
            print(f"  -> Gerando 30 personas para {nivel} público")
            complementares = gerar_personas_complementares("publico", nivel, [], 30)
            todos_gestores.extend(complementares)

    # Processar setor privado
    print("\n[2/2] Processando personas do SETOR PRIVADO...")
    if os.path.exists(MD_PRIVADO):
        gestores_privado = extrair_personas_md(MD_PRIVADO, "privado")
        print(f"  -> Extraídas {len(gestores_privado)} personas")

        # Separar por nível e complementar
        for nivel in ['estrategico', 'tatico', 'operacional']:
            existentes = [g for g in gestores_privado if g['nivel_hierarquico'] == nivel]
            if len(existentes) < 30:
                print(f"  -> Gerando {30 - len(existentes)} personas complementares para {nivel} privado")
                complementares = gerar_personas_complementares("privado", nivel, existentes, 30)
                gestores_privado.extend(complementares)

        todos_gestores.extend(gestores_privado)
    else:
        print(f"  AVISO: Arquivo não encontrado: {MD_PRIVADO}")
        # Gerar todas as personas
        for nivel in ['estrategico', 'tatico', 'operacional']:
            print(f"  -> Gerando 30 personas para {nivel} privado")
            complementares = gerar_personas_complementares("privado", nivel, [], 30)
            todos_gestores.extend(complementares)

    # Salvar JSON
    print(f"\n[3/3] Salvando {len(todos_gestores)} gestores em JSON...")

    dados_json = {
        "metadados": {
            "versao": "1.0.0",
            "data_criacao": datetime.now().isoformat(),
            "descricao": "Banco de gestores públicos e privados para pesquisa sobre distribuição de tempo (PODC)",
            "total_gestores": len(todos_gestores),
            "por_setor": {
                "publico": len([g for g in todos_gestores if g['setor'] == 'publico']),
                "privado": len([g for g in todos_gestores if g['setor'] == 'privado'])
            },
            "por_nivel": {
                "estrategico": len([g for g in todos_gestores if g['nivel_hierarquico'] == 'estrategico']),
                "tatico": len([g for g in todos_gestores if g['nivel_hierarquico'] == 'tatico']),
                "operacional": len([g for g in todos_gestores if g['nivel_hierarquico'] == 'operacional'])
            }
        },
        "gestores": todos_gestores
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(dados_json, f, ensure_ascii=False, indent=2)

    print(f"  -> Salvo em: {OUTPUT_JSON}")

    # Resumo
    print("\n" + "=" * 60)
    print("RESUMO")
    print("=" * 60)
    print(f"Total de gestores: {len(todos_gestores)}")
    print(f"  - Público: {dados_json['metadados']['por_setor']['publico']}")
    print(f"  - Privado: {dados_json['metadados']['por_setor']['privado']}")
    print(f"  - Estratégico: {dados_json['metadados']['por_nivel']['estrategico']}")
    print(f"  - Tático: {dados_json['metadados']['por_nivel']['tatico']}")
    print(f"  - Operacional: {dados_json['metadados']['por_nivel']['operacional']}")
    print("\nConversão concluída com sucesso!")

if __name__ == "__main__":
    main()
