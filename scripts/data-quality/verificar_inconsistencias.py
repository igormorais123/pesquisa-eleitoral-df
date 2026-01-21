#!/usr/bin/env python3
"""
Verificador de Inconsistências em Perfis de Eleitores
Detecta incoerências, contradições, erros, irrealidades e improbabilidades
"""
import json
from collections import defaultdict
from typing import List, Dict, Any, Tuple

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

# Contadores de problemas
problemas = defaultdict(list)

# ============================================================
# REGRAS DE VALIDAÇÃO
# ============================================================

def verificar_idade_escolaridade(e: Dict) -> List[str]:
    """Verifica se escolaridade é compatível com idade"""
    erros = []
    idade = e['idade']
    esc = e['escolaridade']

    # 16-17 anos não pode ter superior completo
    if idade <= 17 and esc == 'superior_completo_ou_pos':
        erros.append(f"Idade {idade} com superior completo (impossível)")

    # 16-19 anos com superior completo é muito improvável
    if 18 <= idade <= 19 and esc == 'superior_completo_ou_pos':
        erros.append(f"Idade {idade} com superior completo (muito improvável)")

    return erros

def verificar_idade_profissao(e: Dict) -> List[str]:
    """Verifica se profissão é compatível com idade"""
    erros = []
    idade = e['idade']
    profissao = e.get('profissao', '').lower()
    ocupacao = e.get('ocupacao_vinculo', '').lower()

    # Aposentado muito jovem (antes dos 50 é raro, antes dos 40 muito raro)
    if 'aposentado' in profissao or 'aposentado' in ocupacao:
        if idade < 40:
            erros.append(f"Aposentado(a) com {idade} anos (muito improvável)")
        elif idade < 50:
            erros.append(f"Aposentado(a) com {idade} anos (improvável, exceto invalidez)")

    # Profissões que exigem formação
    profissoes_superior = ['médico', 'advogado', 'engenheiro', 'arquiteto', 'dentista',
                          'psicólogo', 'farmacêutico', 'veterinário', 'contador']
    for prof in profissoes_superior:
        if prof in profissao.lower():
            if e['escolaridade'] != 'superior_completo_ou_pos':
                erros.append(f"Profissão '{e['profissao']}' requer superior completo")
            if idade < 22:
                erros.append(f"Profissão '{e['profissao']}' com {idade} anos (muito jovem)")

    return erros

def verificar_idade_filhos(e: Dict) -> List[str]:
    """Verifica se quantidade de filhos é compatível com idade"""
    erros = []
    idade = e['idade']
    filhos = e.get('filhos', 0)

    # Muitos filhos para idade jovem
    if idade <= 20 and filhos >= 3:
        erros.append(f"Idade {idade} com {filhos} filhos (muito improvável)")
    if idade <= 25 and filhos >= 4:
        erros.append(f"Idade {idade} com {filhos} filhos (improvável)")
    if idade <= 18 and filhos >= 2:
        erros.append(f"Idade {idade} com {filhos} filhos (improvável)")

    # Pessoa muito jovem com filhos
    if idade == 16 and filhos > 0:
        erros.append(f"Idade 16 com {filhos} filho(s) (raro)")

    return erros

def verificar_idade_estado_civil(e: Dict) -> List[str]:
    """Verifica se estado civil é compatível com idade"""
    erros = []
    idade = e['idade']
    estado = e.get('estado_civil', '')

    # Viúvo muito jovem
    if 'viuvo' in estado.lower() or 'viúvo' in estado.lower():
        if idade < 30:
            erros.append(f"Viúvo(a) com {idade} anos (muito raro)")
        elif idade < 40:
            erros.append(f"Viúvo(a) com {idade} anos (incomum)")

    # Divorciado muito jovem
    if 'divorciado' in estado.lower():
        if idade < 22:
            erros.append(f"Divorciado(a) com {idade} anos (muito raro)")

    # Casado muito jovem
    if 'casado' in estado.lower() and idade < 18:
        erros.append(f"Casado(a) com {idade} anos (menor de idade)")

    return erros

def verificar_voto_facultativo(e: Dict) -> List[str]:
    """Verifica se voto facultativo está correto para a idade"""
    erros = []
    idade = e['idade']
    facultativo = e.get('voto_facultativo', False)

    # 16-17 ou 70+ deve ser facultativo
    if (idade <= 17 or idade >= 70) and not facultativo:
        erros.append(f"Idade {idade} deveria ter voto_facultativo=true")

    # 18-69 deve ser obrigatório
    if 18 <= idade <= 69 and facultativo:
        erros.append(f"Idade {idade} deveria ter voto_facultativo=false")

    return erros

def verificar_cluster_renda(e: Dict) -> List[str]:
    """Verifica se cluster socioeconômico é compatível com renda"""
    erros = []
    cluster = e.get('cluster_socioeconomico', '')
    renda = e.get('renda_salarios_minimos', '')

    # Cluster alto com renda baixa
    if cluster == 'G1_alta':
        if renda in ['ate_1', 'mais_de_1_ate_2']:
            erros.append(f"Cluster alta renda ({cluster}) mas renda '{renda}' (incoerente)")

    # Cluster baixo com renda alta
    if cluster == 'G4_baixa':
        if renda in ['mais_de_10_ate_20', 'mais_de_20']:
            erros.append(f"Cluster baixa renda ({cluster}) mas renda '{renda}' (incoerente)")

    # G2 média-alta com renda muito baixa
    if cluster == 'G2_media_alta':
        if renda == 'ate_1':
            erros.append(f"Cluster média-alta ({cluster}) mas renda até 1 SM (incoerente)")

    return erros

def verificar_escolaridade_renda(e: Dict) -> List[str]:
    """Verifica probabilidade de escolaridade vs renda"""
    erros = []
    esc = e.get('escolaridade', '')
    renda = e.get('renda_salarios_minimos', '')

    # Superior completo com renda muito baixa (possível mas improvável)
    if esc == 'superior_completo_ou_pos' and renda == 'ate_1':
        # Só é erro se não for aposentado ou estudante
        ocupacao = e.get('ocupacao_vinculo', '').lower()
        if 'aposentado' not in ocupacao and 'estudante' not in ocupacao and 'desempregado' not in ocupacao:
            erros.append(f"Superior completo com renda até 1 SM e ocupação '{e.get('ocupacao_vinculo')}' (improvável)")

    # Sem instrução com renda muito alta
    if esc == 'fundamental_ou_sem_instrucao' and renda in ['mais_de_10_ate_20', 'mais_de_20']:
        erros.append(f"Escolaridade fundamental/sem instrução com renda {renda} (muito improvável)")

    return erros

def verificar_orientacao_posicao_bolsonaro(e: Dict) -> List[str]:
    """Verifica coerência entre orientação política e posição sobre Bolsonaro"""
    erros = []
    orientacao = e.get('orientacao_politica', '')
    posicao = e.get('posicao_bolsonaro', '')

    # Esquerda apoiando Bolsonaro fortemente
    if orientacao == 'esquerda' and posicao == 'apoiador_forte':
        erros.append(f"Orientação esquerda com apoiador forte de Bolsonaro (contraditório)")

    # Direita sendo crítico ferrenho
    if orientacao == 'direita' and posicao == 'critico_ferrenho':
        erros.append(f"Orientação direita com crítico ferrenho de Bolsonaro (incomum)")

    return erros

def verificar_valores_orientacao(e: Dict) -> List[str]:
    """Verifica coerência entre valores e orientação política"""
    erros = []
    orientacao = e.get('orientacao_politica', '')
    valores = [v.lower() for v in e.get('valores', [])]

    # Valores tipicamente de direita em pessoa de esquerda
    valores_direita = ['livre iniciativa', 'empreendedorismo', 'meritocracia', 'segurança pública', 'patriotismo']
    valores_esquerda = ['igualdade social', 'direitos humanos', 'justiça social', 'diversidade', 'sustentabilidade']

    if orientacao == 'esquerda':
        conflitos = [v for v in valores if any(vd in v for vd in valores_direita)]
        if len(conflitos) >= 2:
            erros.append(f"Orientação esquerda com múltiplos valores de direita: {conflitos} (possível mas raro)")

    if orientacao == 'direita':
        conflitos = [v for v in valores if any(ve in v for ve in valores_esquerda)]
        if len(conflitos) >= 2:
            erros.append(f"Orientação direita com múltiplos valores de esquerda: {conflitos} (possível mas raro)")

    return erros

def verificar_transporte_ocupacao(e: Dict) -> List[str]:
    """Verifica coerência entre meio de transporte e ocupação"""
    erros = []
    transporte = e.get('meio_transporte', '')
    ocupacao = e.get('ocupacao_vinculo', '').lower()
    tempo = e.get('tempo_deslocamento_trabalho', '')

    # Aposentado/desempregado com tempo de deslocamento definido
    if ocupacao in ['aposentado', 'desempregado', 'do_lar']:
        if tempo not in ['nao_se_aplica', '']:
            erros.append(f"Ocupação '{ocupacao}' com tempo_deslocamento '{tempo}' (deveria ser nao_se_aplica)")

    return erros

def verificar_historia_atributos(e: Dict) -> List[str]:
    """Verifica se história resumida é coerente com atributos"""
    erros = []
    historia = e.get('historia_resumida', '').lower()
    genero = e.get('genero', '')
    estado_civil = e.get('estado_civil', '')
    filhos = e.get('filhos', 0)

    # Verificar gênero na história
    if genero == 'feminino':
        if ' ele ' in historia or 'casado ' in historia or ' aposentado ' in historia:
            if 'casado(a)' not in historia and 'aposentado(a)' not in historia:
                erros.append(f"Gênero feminino mas história usa pronomes/termos masculinos")
    elif genero == 'masculino':
        if ' ela ' in historia or 'casada ' in historia or ' aposentada ' in historia:
            if 'casado(a)' not in historia and 'aposentado(a)' not in historia:
                erros.append(f"Gênero masculino mas história usa pronomes/termos femininos")

    # Verificar menção de filhos
    if filhos == 0 and ('filho' in historia and 'sem filho' not in historia and '0 filho' not in historia):
        # Verificar se não é apenas menção ao próprio eleitor como filho de alguém
        if 'com' in historia and 'filho' in historia:
            pass  # Provavelmente fala de ter filhos

    return erros

def verificar_faixa_etaria(e: Dict) -> List[str]:
    """Verifica se faixa_etaria corresponde à idade"""
    erros = []
    idade = e['idade']
    faixa = e.get('faixa_etaria', '')

    faixas_esperadas = {
        range(16, 18): '16-17',
        range(18, 25): '18-24',
        range(25, 35): '25-34',
        range(35, 45): '35-44',
        range(45, 60): '45-59',
        range(60, 65): '60-64',
    }

    faixa_correta = None
    for faixa_range, nome in faixas_esperadas.items():
        if idade in faixa_range:
            faixa_correta = nome
            break

    if idade >= 65:
        faixa_correta = '65+'

    if faixa_correta and faixa != faixa_correta:
        erros.append(f"Idade {idade} deveria ter faixa_etaria '{faixa_correta}', não '{faixa}'")

    return erros

def verificar_filhos_cat(e: Dict) -> List[str]:
    """Verifica se filhos_cat corresponde a filhos"""
    erros = []
    filhos = e.get('filhos', 0)
    filhos_cat = e.get('filhos_cat', '')

    if filhos == 0 and filhos_cat != 'sem_filhos':
        erros.append(f"filhos=0 mas filhos_cat='{filhos_cat}' (deveria ser 'sem_filhos')")
    elif filhos > 0 and filhos_cat != 'com_filhos':
        erros.append(f"filhos={filhos} mas filhos_cat='{filhos_cat}' (deveria ser 'com_filhos')")

    return erros

def verificar_regiao_cluster(e: Dict) -> List[str]:
    """Verifica plausibilidade de região administrativa vs cluster"""
    erros = []
    regiao = e.get('regiao_administrativa', '')
    cluster = e.get('cluster_socioeconomico', '')

    # Regiões predominantemente de alta renda
    regioes_alta = ['Lago Sul', 'Lago Norte', 'Park Way', 'Sudoeste', 'Noroeste']
    # Regiões predominantemente de baixa renda
    regioes_baixa = ['Estrutural', 'Varjão', 'Itapoã', 'Fercal', 'SCIA']

    if regiao in regioes_alta and cluster == 'G4_baixa':
        erros.append(f"Região {regiao} (alta renda) com cluster G4_baixa (possível mas raro)")

    if regiao in regioes_baixa and cluster == 'G1_alta':
        erros.append(f"Região {regiao} (baixa renda) com cluster G1_alta (possível mas raro)")

    return erros

def verificar_interesse_tolerancia(e: Dict) -> List[str]:
    """Verifica coerência entre interesse político e tolerância a nuances"""
    erros = []
    interesse = e.get('interesse_politico', '')
    tolerancia = e.get('tolerancia_nuance', '')

    # Alto interesse com baixa tolerância pode indicar extremismo (válido mas notável)
    # Não é erro, apenas observação

    return erros

def verificar_susceptibilidade_escolaridade(e: Dict) -> List[str]:
    """Verifica relação entre susceptibilidade a desinformação e escolaridade"""
    erros = []
    suscept = e.get('susceptibilidade_desinformacao', '')
    esc = e.get('escolaridade', '')

    # Superior completo com alta susceptibilidade (possível mas menos provável)
    # Não tratamos como erro pois existem casos reais

    return erros

# ============================================================
# EXECUTAR VERIFICAÇÕES
# ============================================================

print("=" * 70)
print("ANÁLISE DE INCONSISTÊNCIAS EM PERFIS DE ELEITORES")
print("=" * 70)
print(f"Total de perfis analisados: {len(eleitores)}\n")

# Lista de todas as funções de verificação
verificacoes = [
    ("Idade vs Escolaridade", verificar_idade_escolaridade),
    ("Idade vs Profissão", verificar_idade_profissao),
    ("Idade vs Filhos", verificar_idade_filhos),
    ("Idade vs Estado Civil", verificar_idade_estado_civil),
    ("Voto Facultativo", verificar_voto_facultativo),
    ("Cluster vs Renda", verificar_cluster_renda),
    ("Escolaridade vs Renda", verificar_escolaridade_renda),
    ("Orientação vs Bolsonaro", verificar_orientacao_posicao_bolsonaro),
    ("Valores vs Orientação", verificar_valores_orientacao),
    ("Transporte vs Ocupação", verificar_transporte_ocupacao),
    ("História vs Atributos", verificar_historia_atributos),
    ("Faixa Etária", verificar_faixa_etaria),
    ("Filhos Categoria", verificar_filhos_cat),
    ("Região vs Cluster", verificar_regiao_cluster),
]

# Executar todas as verificações
todos_problemas = []
problemas_por_categoria = defaultdict(list)
eleitores_com_problemas = set()

for eleitor in eleitores:
    for nome_verif, func_verif in verificacoes:
        erros = func_verif(eleitor)
        for erro in erros:
            todos_problemas.append({
                'id': eleitor['id'],
                'nome': eleitor['nome'],
                'categoria': nome_verif,
                'erro': erro
            })
            problemas_por_categoria[nome_verif].append({
                'id': eleitor['id'],
                'nome': eleitor['nome'],
                'erro': erro
            })
            eleitores_com_problemas.add(eleitor['id'])

# ============================================================
# RELATÓRIO
# ============================================================

print("-" * 70)
print("RESUMO POR CATEGORIA")
print("-" * 70)

categorias_ordenadas = sorted(problemas_por_categoria.items(), key=lambda x: -len(x[1]))

for categoria, lista in categorias_ordenadas:
    print(f"{categoria:30} | {len(lista):4} problema(s)")

print("-" * 70)
print(f"{'TOTAL':30} | {len(todos_problemas):4} problema(s)")
print(f"{'Eleitores afetados':30} | {len(eleitores_com_problemas):4} de {len(eleitores)}")
print("-" * 70)

# Classificar por gravidade
erros_graves = []  # Impossibilidades
erros_medios = []  # Contradições claras
erros_leves = []   # Improbabilidades

for p in todos_problemas:
    erro_lower = p['erro'].lower()
    if 'impossível' in erro_lower or 'deveria' in erro_lower or 'incoerente' in erro_lower:
        erros_graves.append(p)
    elif 'contraditório' in erro_lower or 'muito improvável' in erro_lower or 'muito raro' in erro_lower:
        erros_medios.append(p)
    else:
        erros_leves.append(p)

print("\n" + "=" * 70)
print("CLASSIFICAÇÃO POR GRAVIDADE")
print("=" * 70)
print(f"[GRAVES] Impossibilidades/erros: {len(erros_graves)}")
print(f"[MEDIOS] Contradicoes/muito improvavel: {len(erros_medios)}")
print(f"[LEVES] Improbabilidades: {len(erros_leves)}")

# Mostrar detalhes dos erros graves
if erros_graves:
    print("\n" + "-" * 70)
    print("DETALHES - ERROS GRAVES (requerem correção)")
    print("-" * 70)
    for p in erros_graves[:50]:  # Limitar a 50
        print(f"[{p['id']}] {p['nome']}")
        print(f"   > {p['erro']}")
    if len(erros_graves) > 50:
        print(f"   ... e mais {len(erros_graves) - 50} erros graves")

# Mostrar detalhes dos erros médios
if erros_medios:
    print("\n" + "-" * 70)
    print("DETALHES - ERROS MÉDIOS (avaliar caso a caso)")
    print("-" * 70)
    for p in erros_medios[:30]:  # Limitar a 30
        print(f"[{p['id']}] {p['nome']}")
        print(f"   > {p['erro']}")
    if len(erros_medios) > 30:
        print(f"   ... e mais {len(erros_medios) - 30} erros médios")

# Mostrar amostra dos erros leves
if erros_leves:
    print("\n" + "-" * 70)
    print("AMOSTRA - ERROS LEVES (improbabilidades aceitáveis)")
    print("-" * 70)
    for p in erros_leves[:15]:  # Limitar a 15
        print(f"[{p['id']}] {p['nome']}")
        print(f"   > {p['erro']}")
    if len(erros_leves) > 15:
        print(f"   ... e mais {len(erros_leves) - 15} erros leves")

# ============================================================
# ÍNDICE DE QUALIDADE
# ============================================================

print("\n" + "=" * 70)
print("ÍNDICE DE QUALIDADE DOS PERFIS")
print("=" * 70)

# Calcular índice (penalizar mais erros graves)
penalidade = (len(erros_graves) * 3 + len(erros_medios) * 1.5 + len(erros_leves) * 0.5)
max_penalidade = len(eleitores) * 3  # Se todos tivessem 1 erro grave
indice = max(0, 100 - (penalidade / len(eleitores) * 10))

print(f"Índice de Qualidade: {indice:.1f}%")

if indice >= 95:
    print("Status: EXCELENTE - Perfis altamente consistentes")
elif indice >= 85:
    print("Status: BOM - Poucos problemas, maioria aceitável")
elif indice >= 70:
    print("Status: REGULAR - Alguns problemas a corrigir")
else:
    print("Status: ATENÇÃO - Muitos problemas detectados")

print("=" * 70)

# Salvar relatório completo em arquivo
with open('relatorio_inconsistencias.json', 'w', encoding='utf-8') as f:
    json.dump({
        'resumo': {
            'total_perfis': len(eleitores),
            'total_problemas': len(todos_problemas),
            'eleitores_afetados': len(eleitores_com_problemas),
            'erros_graves': len(erros_graves),
            'erros_medios': len(erros_medios),
            'erros_leves': len(erros_leves),
            'indice_qualidade': round(indice, 1)
        },
        'problemas_por_categoria': {k: len(v) for k, v in problemas_por_categoria.items()},
        'erros_graves': erros_graves,
        'erros_medios': erros_medios,
        'erros_leves': erros_leves
    }, f, ensure_ascii=False, indent=2)

print(f"\nRelatório completo salvo em: relatorio_inconsistencias.json")
