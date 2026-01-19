"""
Verificação Completa de Coerência - Parlamentares, Gestores e Candidatos
"""
import json
from collections import Counter
from datetime import datetime

# =============================================================================
# CARREGAR ARQUIVOS
# =============================================================================
print("=" * 70)
print("VERIFICAÇÃO DE COERÊNCIA - PARLAMENTARES, GESTORES E CANDIDATOS")
print("=" * 70)

# Carregar todos os bancos
arquivos = {
    'candidatos': 'agentes/banco-candidatos-df-2026.json',
    'deputados_federais': 'agentes/banco-deputados-federais-df.json',
    'senadores': 'agentes/banco-senadores-df.json',
    'deputados_distritais': 'agentes/banco-deputados-distritais-df.json',
    'gestores': 'agentes/banco-gestores.json',
}

dados = {}
for nome, arquivo in arquivos.items():
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            dados[nome] = json.load(f)
        print(f"✓ Carregado: {nome}")
    except Exception as e:
        print(f"✗ Erro ao carregar {nome}: {e}")

# =============================================================================
# FUNÇÕES DE VERIFICAÇÃO
# =============================================================================

def verificar_idade_nascimento(pessoa, tolerancia=1):
    """Verifica se idade corresponde à data de nascimento"""
    idade = pessoa.get('idade')
    data_nasc = pessoa.get('data_nascimento')

    if not idade or not data_nasc:
        return None, "Dados incompletos"

    try:
        nasc = datetime.strptime(data_nasc, '%Y-%m-%d')
        hoje = datetime(2026, 1, 18)  # Data atual do sistema
        idade_calc = (hoje - nasc).days // 365

        if abs(idade_calc - idade) <= tolerancia:
            return True, None
        else:
            return False, f"Idade {idade} não confere com nascimento {data_nasc} (deveria ser ~{idade_calc})"
    except:
        return None, f"Data inválida: {data_nasc}"

def verificar_politica_bolsonaro(pessoa):
    """Verifica coerência entre orientação política e posição sobre Bolsonaro"""
    orientacao = pessoa.get('orientacao_politica', '')
    pos_bolso = pessoa.get('posicao_bolsonaro', '')

    incoerencias = []

    # Esquerda não pode ser apoiador forte de Bolsonaro
    if orientacao == 'esquerda' and pos_bolso in ['apoiador_forte', 'apoiador']:
        incoerencias.append(f"Esquerda + apoiador Bolsonaro ({pos_bolso})")

    # Centro-esquerda não deveria ser apoiador forte
    if orientacao == 'centro_esquerda' and pos_bolso == 'apoiador_forte':
        incoerencias.append(f"Centro-esquerda + apoiador_forte Bolsonaro")

    # Direita não deveria ser opositor forte de Bolsonaro (raro)
    if orientacao == 'direita' and pos_bolso == 'opositor_forte':
        incoerencias.append(f"Direita + opositor_forte Bolsonaro")

    return incoerencias

def verificar_politica_lula(pessoa):
    """Verifica coerência entre orientação política e posição sobre Lula"""
    orientacao = pessoa.get('orientacao_politica', '')
    pos_lula = pessoa.get('posicao_lula', '')

    incoerencias = []

    # Direita não pode ser apoiador forte de Lula
    if orientacao == 'direita' and pos_lula in ['apoiador_forte', 'apoiador']:
        incoerencias.append(f"Direita + apoiador Lula ({pos_lula})")

    # Esquerda não deveria ser opositor forte de Lula
    if orientacao == 'esquerda' and pos_lula == 'opositor_forte':
        incoerencias.append(f"Esquerda + opositor_forte Lula")

    return incoerencias

def verificar_religiao_valores(pessoa):
    """Verifica coerência entre religião e valores"""
    religiao = pessoa.get('religiao', '')
    valores = pessoa.get('valores', [])

    incoerencias = []

    # Sem religião com Fé como valor
    valores_fe = ['Fé', 'Fé cristã', 'Fé e religião']
    if religiao == 'sem_religiao':
        for v in valores:
            if v in valores_fe or 'fé' in v.lower():
                incoerencias.append(f"Sem religião + valor '{v}'")

    return incoerencias

def verificar_big_five(pessoa):
    """Verifica se valores do Big Five estão no range válido (1-10)"""
    big_five = pessoa.get('big_five', {})

    if not big_five:
        return []

    incoerencias = []
    for dim, valor in big_five.items():
        if not isinstance(valor, (int, float)) or valor < 1 or valor > 10:
            incoerencias.append(f"Big Five {dim}={valor} fora do range 1-10")

    return incoerencias

def verificar_genero_nome(pessoa):
    """Verifica se gênero corresponde ao tipo de nome"""
    genero = pessoa.get('genero', '')
    nome = pessoa.get('nome', '')

    # Nomes tipicamente femininos terminam em 'a' (simplificação)
    # Esta é uma verificação aproximada
    primeiro_nome = nome.split()[0] if nome else ''

    # Lista de exceções
    nomes_masc_a = ['LULA', 'COSTA', 'SILVA', 'JOSHUA', 'NIKITA']
    nomes_fem_o = ['SOCORRO']

    if primeiro_nome.upper() in nomes_masc_a or primeiro_nome.upper() in nomes_fem_o:
        return []

    # Verificação muito simplificada - apenas para casos óbvios
    return []

def verificar_podc_gestores(gestor):
    """Verifica se distribuição PODC soma ~100%"""
    podc = gestor.get('distribuicao_podc', {})

    if not podc:
        return [f"PODC ausente"]

    incoerencias = []

    total = sum(podc.values())
    if abs(total - 100) > 1:  # Tolerância de 1%
        incoerencias.append(f"PODC soma {total:.1f}% (deveria ser 100%)")

    # Verificar valores negativos ou muito altos
    for funcao, valor in podc.items():
        if valor < 0:
            incoerencias.append(f"PODC {funcao} negativo: {valor}")
        if valor > 60:
            incoerencias.append(f"PODC {funcao} muito alto: {valor}%")
        if valor < 5:
            incoerencias.append(f"PODC {funcao} muito baixo: {valor}%")

    return incoerencias

def verificar_genero_cargo(gestor):
    """Verifica se gênero corresponde ao cargo (a/o)"""
    import re
    genero = gestor.get('genero', '')
    cargo = gestor.get('cargo', '')

    incoerencias = []

    # Cargos epicenos (não mudam com gênero)
    # "Presidente", "Gerente", "Superintendente", "Chefe" são epicenos

    # Verificar flexão de cargos que mudam com gênero
    # Padrões femininos específicos (excluindo quando precedido de Diretor-)
    if genero == 'masculino':
        # Secretária mas não Secretário
        if 'Secretária' in cargo:
            incoerencias.append(f"Gênero masculino com cargo feminino: {cargo[:50]}")
        # Diretora mas não Diretora-Presidente (que seria ok para presidente épiceno)
        # Mas Diretora especificamente sem ser Diretor-Presidente
        if re.search(r'\bDiretora\b', cargo) and 'Diretor-' not in cargo:
            incoerencias.append(f"Gênero masculino com cargo feminino: {cargo[:50]}")
        # Coordenadora
        if 'Coordenadora' in cargo:
            incoerencias.append(f"Gênero masculino com cargo feminino: {cargo[:50]}")

    elif genero == 'feminino':
        # Secretário (não Secretária)
        if re.search(r'\bSecretário\b', cargo):
            incoerencias.append(f"Gênero feminino com cargo masculino: {cargo[:50]}")
        # Diretor (não Diretora, não Diretor-Presidente que é epiceno na parte "Presidente")
        # Mas "Diretor de Área" com gênero feminino é incoerente
        if re.search(r'\bDiretor\b', cargo) and 'Diretora' not in cargo:
            # Verificar se não é Diretor-Presidente (epiceno)
            if 'Presidente' not in cargo:
                incoerencias.append(f"Gênero feminino com cargo masculino: {cargo[:50]}")
        # Coordenador (não Coordenadora)
        if re.search(r'\bCoordenador\b', cargo) and 'Coordenadora' not in cargo:
            incoerencias.append(f"Gênero feminino com cargo masculino: {cargo[:50]}")

    return incoerencias

def verificar_elegibilidade(candidato):
    """Verifica coerência de elegibilidade"""
    elegivel = candidato.get('elegivel', True)
    obs = candidato.get('observacao_elegibilidade', '')

    incoerencias = []

    # Se inelegível, deve ter observação
    if not elegivel and not obs:
        incoerencias.append("Inelegível sem observação explicativa")

    return incoerencias

# =============================================================================
# VERIFICAÇÃO DOS CANDIDATOS
# =============================================================================
print("\n" + "=" * 70)
print("1. VERIFICAÇÃO DOS CANDIDATOS AO GOVERNO")
print("=" * 70)

candidatos = dados.get('candidatos', {}).get('candidatos', [])
print(f"\nTotal de candidatos: {len(candidatos)}")

erros_candidatos = []

for c in candidatos:
    nome = c.get('nome_urna', c.get('nome', 'Desconhecido'))
    erros_pessoa = []

    # Verificar idade vs nascimento
    ok, msg = verificar_idade_nascimento(c)
    if ok == False:
        erros_pessoa.append(msg)

    # Verificar coerência política
    erros_pessoa.extend(verificar_politica_bolsonaro(c))
    erros_pessoa.extend(verificar_politica_lula(c))

    # Verificar elegibilidade
    erros_pessoa.extend(verificar_elegibilidade(c))

    if erros_pessoa:
        erros_candidatos.append({
            'nome': nome,
            'id': c.get('id'),
            'erros': erros_pessoa
        })

if erros_candidatos:
    print(f"\n⚠ Encontradas {len(erros_candidatos)} incoerências em candidatos:")
    for e in erros_candidatos:
        print(f"\n  → {e['nome']} ({e['id']}):")
        for erro in e['erros']:
            print(f"    - {erro}")
else:
    print("\n✓ Nenhuma incoerência encontrada nos candidatos!")

# =============================================================================
# VERIFICAÇÃO DOS DEPUTADOS FEDERAIS
# =============================================================================
print("\n" + "=" * 70)
print("2. VERIFICAÇÃO DOS DEPUTADOS FEDERAIS")
print("=" * 70)

deputados_fed = dados.get('deputados_federais', [])
print(f"\nTotal de deputados federais: {len(deputados_fed)}")

erros_dep_fed = []

for d in deputados_fed:
    nome = d.get('nome_parlamentar', d.get('nome', 'Desconhecido'))
    erros_pessoa = []

    # Verificar idade vs nascimento
    ok, msg = verificar_idade_nascimento(d)
    if ok == False:
        erros_pessoa.append(msg)

    # Verificar coerência política
    erros_pessoa.extend(verificar_politica_bolsonaro(d))
    erros_pessoa.extend(verificar_politica_lula(d))

    # Verificar religião vs valores
    erros_pessoa.extend(verificar_religiao_valores(d))

    # Verificar Big Five
    erros_pessoa.extend(verificar_big_five(d))

    if erros_pessoa:
        erros_dep_fed.append({
            'nome': nome,
            'id': d.get('id'),
            'erros': erros_pessoa
        })

if erros_dep_fed:
    print(f"\n⚠ Encontradas {len(erros_dep_fed)} incoerências em deputados federais:")
    for e in erros_dep_fed:
        print(f"\n  → {e['nome']} ({e['id']}):")
        for erro in e['erros']:
            print(f"    - {erro}")
else:
    print("\n✓ Nenhuma incoerência encontrada nos deputados federais!")

# =============================================================================
# VERIFICAÇÃO DOS SENADORES
# =============================================================================
print("\n" + "=" * 70)
print("3. VERIFICAÇÃO DOS SENADORES")
print("=" * 70)

senadores = dados.get('senadores', [])
print(f"\nTotal de senadores: {len(senadores)}")

erros_senadores = []

for s in senadores:
    nome = s.get('nome_parlamentar', s.get('nome', 'Desconhecido'))
    erros_pessoa = []

    # Verificar idade vs nascimento
    ok, msg = verificar_idade_nascimento(s)
    if ok == False:
        erros_pessoa.append(msg)

    # Verificar coerência política
    erros_pessoa.extend(verificar_politica_bolsonaro(s))
    erros_pessoa.extend(verificar_politica_lula(s))

    # Verificar religião vs valores
    erros_pessoa.extend(verificar_religiao_valores(s))

    # Verificar Big Five
    erros_pessoa.extend(verificar_big_five(s))

    if erros_pessoa:
        erros_senadores.append({
            'nome': nome,
            'id': s.get('id'),
            'erros': erros_pessoa
        })

if erros_senadores:
    print(f"\n⚠ Encontradas {len(erros_senadores)} incoerências em senadores:")
    for e in erros_senadores:
        print(f"\n  → {e['nome']} ({e['id']}):")
        for erro in e['erros']:
            print(f"    - {erro}")
else:
    print("\n✓ Nenhuma incoerência encontrada nos senadores!")

# =============================================================================
# VERIFICAÇÃO DOS DEPUTADOS DISTRITAIS
# =============================================================================
print("\n" + "=" * 70)
print("4. VERIFICAÇÃO DOS DEPUTADOS DISTRITAIS")
print("=" * 70)

deputados_dist = dados.get('deputados_distritais', [])
print(f"\nTotal de deputados distritais: {len(deputados_dist)}")

erros_dep_dist = []

for d in deputados_dist:
    nome = d.get('nome_parlamentar', d.get('nome', 'Desconhecido'))
    erros_pessoa = []

    # Verificar idade vs nascimento
    ok, msg = verificar_idade_nascimento(d)
    if ok == False:
        erros_pessoa.append(msg)

    # Verificar coerência política
    erros_pessoa.extend(verificar_politica_bolsonaro(d))
    erros_pessoa.extend(verificar_politica_lula(d))

    # Verificar religião vs valores
    erros_pessoa.extend(verificar_religiao_valores(d))

    # Verificar Big Five
    erros_pessoa.extend(verificar_big_five(d))

    if erros_pessoa:
        erros_dep_dist.append({
            'nome': nome,
            'id': d.get('id'),
            'erros': erros_pessoa
        })

if erros_dep_dist:
    print(f"\n⚠ Encontradas {len(erros_dep_dist)} incoerências em deputados distritais:")
    for e in erros_dep_dist:
        print(f"\n  → {e['nome']} ({e['id']}):")
        for erro in e['erros']:
            print(f"    - {erro}")
else:
    print("\n✓ Nenhuma incoerência encontrada nos deputados distritais!")

# =============================================================================
# VERIFICAÇÃO DOS GESTORES
# =============================================================================
print("\n" + "=" * 70)
print("5. VERIFICAÇÃO DOS GESTORES")
print("=" * 70)

gestores = dados.get('gestores', {}).get('gestores', [])
print(f"\nTotal de gestores: {len(gestores)}")

erros_gestores = []

for g in gestores:
    nome = g.get('nome', 'Desconhecido')
    erros_pessoa = []

    # Verificar PODC
    erros_pessoa.extend(verificar_podc_gestores(g))

    # Verificar gênero vs cargo
    erros_pessoa.extend(verificar_genero_cargo(g))

    if erros_pessoa:
        erros_gestores.append({
            'nome': nome,
            'id': g.get('id'),
            'setor': g.get('setor'),
            'nivel': g.get('nivel_hierarquico'),
            'erros': erros_pessoa
        })

if erros_gestores:
    print(f"\n⚠ Encontradas {len(erros_gestores)} incoerências em gestores:")
    for e in erros_gestores[:20]:  # Limitar a 20 para não poluir
        print(f"\n  → {e['nome'][:40]} ({e['id']}):")
        print(f"    Setor: {e['setor']}, Nível: {e['nivel']}")
        for erro in e['erros']:
            print(f"    - {erro}")
    if len(erros_gestores) > 20:
        print(f"\n  ... e mais {len(erros_gestores) - 20} incoerências")
else:
    print("\n✓ Nenhuma incoerência encontrada nos gestores!")

# =============================================================================
# RESUMO GERAL
# =============================================================================
print("\n" + "=" * 70)
print("RESUMO GERAL")
print("=" * 70)

total_erros = (len(erros_candidatos) + len(erros_dep_fed) +
               len(erros_senadores) + len(erros_dep_dist) + len(erros_gestores))

print(f"""
Candidatos:         {len(candidatos):3d} registros, {len(erros_candidatos):3d} com erros
Deputados Federais: {len(deputados_fed):3d} registros, {len(erros_dep_fed):3d} com erros
Senadores:          {len(senadores):3d} registros, {len(erros_senadores):3d} com erros
Deputados Distrit.: {len(deputados_dist):3d} registros, {len(erros_dep_dist):3d} com erros
Gestores:           {len(gestores):3d} registros, {len(erros_gestores):3d} com erros

TOTAL DE INCOERÊNCIAS: {total_erros}
""")

if total_erros == 0:
    print("🎉 TODOS OS BANCOS ESTÃO COERENTES!")
else:
    print("⚠ Há incoerências que precisam ser corrigidas.")

# Salvar relatório
relatorio = {
    'data_verificacao': datetime.now().isoformat(),
    'resumo': {
        'candidatos': {'total': len(candidatos), 'erros': len(erros_candidatos)},
        'deputados_federais': {'total': len(deputados_fed), 'erros': len(erros_dep_fed)},
        'senadores': {'total': len(senadores), 'erros': len(erros_senadores)},
        'deputados_distritais': {'total': len(deputados_dist), 'erros': len(erros_dep_dist)},
        'gestores': {'total': len(gestores), 'erros': len(erros_gestores)},
    },
    'detalhes': {
        'candidatos': erros_candidatos,
        'deputados_federais': erros_dep_fed,
        'senadores': erros_senadores,
        'deputados_distritais': erros_dep_dist,
        'gestores': erros_gestores,
    }
}

with open('relatorio_coerencia_parlamentares_gestores.json', 'w', encoding='utf-8') as f:
    json.dump(relatorio, f, ensure_ascii=False, indent=2)

print("\nRelatório salvo em: relatorio_coerencia_parlamentares_gestores.json")
