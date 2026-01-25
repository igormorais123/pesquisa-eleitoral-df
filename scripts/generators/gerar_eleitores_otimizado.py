#!/usr/bin/env python3
"""
Gerador Otimizado de Eleitores - Mínimo impacto, máxima correção
Adiciona exatamente 150 eleitores com distribuição calculada para maximizar conformidade
"""

import json
import random

# Carregar banco atual
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
print(f"Total atual: {n}")

# Contagens atuais
atual = {
    'carro': sum(1 for e in eleitores if e.get('meio_transporte') == 'carro'),
    'clt': sum(1 for e in eleitores if e.get('ocupacao_vinculo') == 'clt'),
    'critico': sum(1 for e in eleitores if e.get('posicao_bolsonaro') == 'critico_forte'),
    'superior': sum(1 for e in eleitores if e.get('escolaridade') == 'superior_completo_ou_pos'),
    'classe_baixa': sum(1 for e in eleitores if e.get('cluster_socioeconomico') == 'G4_baixa'),
    'suscept_4_6': sum(1 for e in eleitores if 4 <= e.get('susceptibilidade_desinformacao', 5) <= 6)
}

# Metas para 900 total
TOTAL_ALVO = 900
metas = {
    'carro': int(TOTAL_ALVO * 0.323),       # 291
    'clt': int(TOTAL_ALVO * 0.375),          # 338
    'critico': int(TOTAL_ALVO * 0.34),       # 306
    'superior': int(TOTAL_ALVO * 0.37),      # 333
    'classe_baixa': int(TOTAL_ALVO * 0.282), # 254 (não ultrapassar)
    'suscept_4_6': int(TOTAL_ALVO * 0.45)    # 405 (não ultrapassar)
}

# Quanto precisamos adicionar de cada
necessario = {
    'carro': max(0, metas['carro'] - atual['carro']),      # 166
    'clt': max(0, metas['clt'] - atual['clt']),            # 161
    'critico': max(0, metas['critico'] - atual['critico']),# 142
    'superior': max(0, metas['superior'] - atual['superior']),# 134
}

print(f"\nNecessário adicionar (de 150 novos):")
print(f"  Com carro: {necessario['carro']} (mas temos só 150, então ~150)")
print(f"  Com CLT: {necessario['clt']} (mas ~140 para não passar)")
print(f"  Crítico forte: {necessario['critico']} (mas ~130 para não passar)")
print(f"  Superior: {necessario['superior']} (mas ~120 para não passar)")
print(f"  Classe baixa: 0 (já temos excesso)")
print(f"  Suscept 4-6: 0 (já temos excesso)")

# Dados de referência
REGIOES = ['Ceilândia', 'Samambaia', 'Taguatinga', 'Plano Piloto', 'Planaltina',
           'Águas Claras', 'Recanto das Emas', 'Gama', 'Guará', 'Santa Maria',
           'Sobradinho', 'São Sebastião', 'Vicente Pires', 'Riacho Fundo']

NOMES_M = ["João", "Pedro", "Lucas", "Gabriel", "Rafael", "Matheus", "Bruno", "Felipe",
           "Gustavo", "Leonardo", "Rodrigo", "Thiago", "André", "Carlos", "Daniel",
           "Eduardo", "Fernando", "Henrique", "Igor", "José", "Leandro", "Marcelo"]

NOMES_F = ["Maria", "Ana", "Juliana", "Fernanda", "Patricia", "Camila", "Amanda",
           "Bruna", "Carolina", "Daniela", "Gabriela", "Helena", "Isabella", "Larissa"]

SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
              "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho"]

PROFISSOES_CLT_SUP = [
    "Analista de Sistemas", "Engenheiro(a)", "Advogado(a)", "Contador(a)",
    "Administrador(a)", "Economista", "Arquiteto(a)", "Psicólogo(a)",
    "Analista Financeiro", "Gerente de Projetos", "Consultor(a)", "Médico(a)"
]

PROFISSOES_CLT_MED = [
    "Técnico de Enfermagem", "Vendedor(a)", "Auxiliar Administrativo",
    "Recepcionista", "Operador de Caixa", "Assistente Contábil", "Motorista"
]

def gerar_nome(genero):
    nome = random.choice(NOMES_M if genero == 'masculino' else NOMES_F)
    return f"{nome} {random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"

def gerar_eleitor(idx, perfil):
    """Gera eleitor com perfil específico"""
    genero = random.choice(['masculino', 'feminino'])
    nome = gerar_nome(genero)
    idade = random.randint(25, 55) if perfil.get('clt') else random.randint(18, 70)

    # Região
    regiao = random.choice(REGIOES)

    # Cluster - NUNCA classe baixa para novos
    cluster = random.choices(
        ['G1_alta', 'G2_media_alta', 'G3_media_baixa'],
        weights=[0.20, 0.35, 0.45]
    )[0]

    # Escolaridade
    escolaridade = 'superior_completo_ou_pos' if perfil.get('superior') else random.choices(
        ['medio_completo_ou_sup_incompleto', 'superior_completo_ou_pos'],
        weights=[0.4, 0.6]
    )[0]

    # Ocupação
    ocupacao = 'clt' if perfil.get('clt') else random.choices(
        ['clt', 'autonomo', 'servidor_publico'],
        weights=[0.5, 0.3, 0.2]
    )[0]

    # Profissão
    if escolaridade == 'superior_completo_ou_pos':
        profissao = random.choice(PROFISSOES_CLT_SUP)
    else:
        profissao = random.choice(PROFISSOES_CLT_MED)

    # Transporte
    transporte = 'carro' if perfil.get('carro') else random.choices(
        ['carro', 'onibus', 'metro', 'app'],
        weights=[0.5, 0.25, 0.15, 0.10]
    )[0]

    # Renda (coerente com cluster)
    if cluster == 'G1_alta':
        renda = random.choice(['5_a_10', 'mais_de_10'])
    elif cluster == 'G2_media_alta':
        renda = random.choice(['3_a_5', '5_a_10'])
    else:
        renda = random.choice(['2_a_3', '3_a_5'])

    # Posição Bolsonaro
    if perfil.get('critico'):
        posicao_bolsonaro = 'critico_forte'
        orientacao = random.choices(['esquerda', 'centro_esquerda', 'centro'], weights=[0.5, 0.35, 0.15])[0]
    else:
        posicao_bolsonaro = random.choices(
            ['critico_forte', 'critico_moderado', 'neutro', 'apoiador_moderado', 'apoiador_forte'],
            weights=[0.25, 0.20, 0.20, 0.20, 0.15]
        )[0]
        if posicao_bolsonaro in ['critico_forte', 'critico_moderado']:
            orientacao = random.choices(['esquerda', 'centro_esquerda', 'centro'], weights=[0.4, 0.4, 0.2])[0]
        elif posicao_bolsonaro in ['apoiador_forte', 'apoiador_moderado']:
            orientacao = random.choices(['direita', 'centro_direita', 'centro'], weights=[0.4, 0.4, 0.2])[0]
        else:
            orientacao = 'centro'

    # Susceptibilidade - EVITAR 4-6
    susceptibilidade = random.choices(
        [1, 2, 3, 7, 8, 9, 10],
        weights=[0.10, 0.15, 0.20, 0.20, 0.15, 0.12, 0.08]
    )[0]

    # Cor/raça
    cor = random.choices(['branca', 'parda', 'preta'], weights=[0.35, 0.45, 0.20])[0]

    # Estado civil
    estado_civil = random.choices(
        ['solteiro(a)', 'casado(a)', 'divorciado(a)', 'uniao_estavel'],
        weights=[0.35, 0.40, 0.10, 0.15]
    )[0]

    filhos = random.choices([0, 1, 2, 3], weights=[0.25, 0.35, 0.30, 0.10])[0]

    # Religião
    religiao = random.choices(
        ['catolica', 'evangelica', 'espirita', 'sem_religiao'],
        weights=[0.35, 0.30, 0.10, 0.25]
    )[0]

    # Interesse político
    interesse = random.choices(['baixo', 'medio', 'alto'], weights=[0.30, 0.45, 0.25])[0]

    # Valores baseados na orientação
    if orientacao in ['esquerda', 'centro_esquerda']:
        valores = random.sample(['Igualdade social', 'Direitos humanos', 'Educação pública', 'Saúde pública', 'Meio ambiente'], 3)
        medos = random.sample(['Desemprego', 'Violência', 'Desigualdade', 'Autoritarismo'], 3)
        preocupacoes = random.sample(['Desemprego', 'Custo de vida', 'Saúde', 'Educação'], 3)
    elif orientacao in ['direita', 'centro_direita']:
        valores = random.sample(['Família', 'Liberdade econômica', 'Segurança', 'Meritocracia', 'Ordem'], 3)
        medos = random.sample(['Criminalidade', 'Impostos altos', 'Corrupção', 'Desemprego'], 3)
        preocupacoes = random.sample(['Segurança', 'Economia', 'Corrupção', 'Impostos'], 3)
    else:
        valores = random.sample(['Equilíbrio', 'Pragmatismo', 'Estabilidade', 'Progresso'], 3)
        medos = random.sample(['Instabilidade', 'Polarização', 'Crise econômica'], 3)
        preocupacoes = random.sample(['Economia', 'Saúde', 'Educação', 'Segurança'], 3)

    fontes = random.sample(['Jornal Nacional', 'G1', 'WhatsApp', 'Instagram', 'Redes sociais'], 2)
    vieses = random.sample(['confirmacao', 'disponibilidade', 'ancoragem', 'grupo'], 2)
    tolerancia = random.choices(['baixa', 'media', 'alta'], weights=[0.25, 0.50, 0.25])[0]
    estilo = random.choices(['emocional', 'racional', 'economico', 'ideologico'], weights=[0.25, 0.30, 0.30, 0.15])[0]

    # História
    primeiro_nome = nome.split()[0]
    if posicao_bolsonaro == 'critico_forte':
        visao = random.choice([
            "Crítico(a) ferrenho(a) do bolsonarismo, vê como ameaça à democracia.",
            "Se decepcionou com o governo Bolsonaro e hoje faz oposição firme.",
            "Sempre foi progressista e se opõe às políticas conservadoras."
        ])
    else:
        visao = "Acompanha a política mas prefere não se posicionar fortemente."

    historia = f"{primeiro_nome} trabalha como {profissao} em {regiao}. {estado_civil.replace('(a)', 'o(a)' if genero=='masculino' else 'a')}"
    if filhos > 0:
        historia += f", tem {filhos} filho(s)"
    historia += f". {visao}"

    instrucao = f"Tom: {'formal' if interesse=='alto' else 'coloquial'}. {'Acompanha política ativamente' if interesse=='alto' else 'Acompanha por alto'}. Vota pensando {'no bolso' if estilo=='economico' else 'na ideologia' if estilo=='ideologico' else 'no candidato'}."

    return {
        'id': f'df-{751 + idx:04d}',
        'nome': nome,
        'idade': idade,
        'genero': genero,
        'cor_raca': cor,
        'regiao_administrativa': regiao,
        'cluster_socioeconomico': cluster,
        'escolaridade': escolaridade,
        'ocupacao_vinculo': ocupacao,
        'profissao': profissao,
        'renda_salarios_minimos': renda,
        'meio_transporte': transporte,
        'tempo_deslocamento_trabalho': random.choice(['ate_30min', '30min_a_1h', '1h_a_2h']),
        'estado_civil': estado_civil,
        'filhos': filhos,
        'religiao': religiao,
        'orientacao_politica': orientacao,
        'posicao_bolsonaro': posicao_bolsonaro,
        'interesse_politico': interesse,
        'susceptibilidade_desinformacao': susceptibilidade,
        'valores': valores,
        'medos': medos,
        'preocupacoes': preocupacoes,
        'fontes_informacao': fontes,
        'vieses_cognitivos': vieses,
        'tolerancia_nuance': tolerancia,
        'estilo_decisao': estilo,
        'conflito_identitario': random.random() < 0.15,
        'voto_facultativo': False,
        'local_referencia': f"região de {regiao}",
        'historia_resumida': historia,
        'instrucao_comportamental': instrucao
    }

# Gerar 150 eleitores com distribuição otimizada
novos = []
idx = 0

# Grupo 1: 80 com TODOS os atributos (carro + CLT + superior + crítico)
# Máximo impacto em todas as métricas
for _ in range(80):
    novos.append(gerar_eleitor(idx, {'carro': True, 'clt': True, 'superior': True, 'critico': True}))
    idx += 1

# Grupo 2: 35 com carro + CLT + superior (sem crítico para não ultrapassar 34%)
for _ in range(35):
    novos.append(gerar_eleitor(idx, {'carro': True, 'clt': True, 'superior': True, 'critico': False}))
    idx += 1

# Grupo 3: 20 com carro + CLT (sem superior para não ultrapassar 37%)
for _ in range(20):
    novos.append(gerar_eleitor(idx, {'carro': True, 'clt': True, 'superior': False, 'critico': False}))
    idx += 1

# Grupo 4: 15 com carro apenas (balanceamento final)
for _ in range(15):
    novos.append(gerar_eleitor(idx, {'carro': True, 'clt': False, 'superior': False, 'critico': False}))
    idx += 1

print(f"\nGerados {len(novos)} eleitores otimizados")

# Combinar
todos = eleitores + novos
total = len(todos)
print(f"Total final: {total}")

# Verificar distribuições finais
final_carro = sum(1 for e in todos if e.get('meio_transporte') == 'carro')
final_clt = sum(1 for e in todos if e.get('ocupacao_vinculo') == 'clt')
final_critico = sum(1 for e in todos if e.get('posicao_bolsonaro') == 'critico_forte')
final_superior = sum(1 for e in todos if e.get('escolaridade') == 'superior_completo_ou_pos')
final_classe_baixa = sum(1 for e in todos if e.get('cluster_socioeconomico') == 'G4_baixa')
final_suscept = sum(1 for e in todos if 4 <= e.get('susceptibilidade_desinformacao', 5) <= 6)

print(f"\n=== RESULTADO FINAL ===")
print(f"Carro: {final_carro}/{total} = {100*final_carro/total:.1f}% (meta: 32.3%)")
print(f"CLT: {final_clt}/{total} = {100*final_clt/total:.1f}% (meta: 37.5%)")
print(f"Crítico Forte: {final_critico}/{total} = {100*final_critico/total:.1f}% (meta: 34%)")
print(f"Superior: {final_superior}/{total} = {100*final_superior/total:.1f}% (meta: 37%)")
print(f"Classe Baixa: {final_classe_baixa}/{total} = {100*final_classe_baixa/total:.1f}% (meta: 28.2%)")
print(f"Suscept 4-6: {final_suscept}/{total} = {100*final_suscept/total:.1f}% (meta: 45%)")

# Calcular índice aproximado de conformidade
desvios = [
    abs(100*final_carro/total - 32.3),
    abs(100*final_clt/total - 37.5),
    abs(100*final_critico/total - 34),
    abs(100*final_superior/total - 37),
    abs(100*final_classe_baixa/total - 28.2),
    abs(100*final_suscept/total - 45)
]
media_desvio = sum(desvios) / len(desvios)
conformidade_estimada = max(0, 100 - media_desvio * 2)
print(f"\nMédia de desvios: {media_desvio:.1f}%")
print(f"Conformidade estimada: ~{conformidade_estimada:.0f}%")

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)
print(f"\nSalvo em agentes/banco-eleitores-df.json")

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)
print(f"Copiado para frontend/src/data/eleitores-df-400.json")
