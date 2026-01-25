"""
Verificador Completo de Coerência Interna dos Eleitores
Analisa múltiplas dimensões de coerência lógica
"""
import json
from collections import defaultdict

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")
print("\n" + "=" * 80)
print("VERIFICAÇÃO COMPLETA DE COERÊNCIA INTERNA")
print("=" * 80)

# Estrutura para armazenar incoerências
incoerencias = defaultdict(list)
eleitores_problematicos = {}

def adicionar_incoerencia(eleitor_id, categoria, descricao, dados):
    """Registra uma incoerência encontrada"""
    incoerencias[categoria].append({
        'id': eleitor_id,
        'descricao': descricao,
        'dados': dados
    })
    if eleitor_id not in eleitores_problematicos:
        eleitores_problematicos[eleitor_id] = []
    eleitores_problematicos[eleitor_id].append(f"[{categoria}] {descricao}")

# ==============================================================================
# 1. IDADE vs OCUPAÇÃO
# ==============================================================================
print("\n[1] Verificando IDADE vs OCUPAÇÃO...")

for e in eleitores:
    idade = e.get('idade', 30)
    ocupacao = e.get('ocupacao_vinculo', '')
    eid = e['id']

    # Menor de 16 não pode trabalhar formalmente
    if idade < 16 and ocupacao not in ['estudante', 'desempregado']:
        adicionar_incoerencia(eid, 'IDADE_OCUPACAO',
            f'Menor de 16 ({idade}) com ocupação "{ocupacao}"',
            {'idade': idade, 'ocupacao': ocupacao})

    # Menor de 18 não pode ser CLT (exceto aprendiz), servidor ou empresário
    if idade < 18 and ocupacao in ['servidor_publico', 'empresario']:
        adicionar_incoerencia(eid, 'IDADE_OCUPACAO',
            f'Menor de 18 ({idade}) como "{ocupacao}"',
            {'idade': idade, 'ocupacao': ocupacao})

    # Aposentado muito jovem (antes de 50 é muito raro)
    if idade < 45 and ocupacao == 'aposentado':
        adicionar_incoerencia(eid, 'IDADE_OCUPACAO',
            f'Aposentado muito jovem ({idade} anos)',
            {'idade': idade, 'ocupacao': ocupacao})

    # Estudante muito velho (>35 é incomum como ocupação principal)
    if idade > 40 and ocupacao == 'estudante':
        adicionar_incoerencia(eid, 'IDADE_OCUPACAO',
            f'Estudante com {idade} anos (incomum como ocupação principal)',
            {'idade': idade, 'ocupacao': ocupacao})

# ==============================================================================
# 2. IDADE vs ESTADO CIVIL e FILHOS
# ==============================================================================
print("[2] Verificando IDADE vs ESTADO CIVIL e FILHOS...")

for e in eleitores:
    idade = e.get('idade', 30)
    estado_civil = e.get('estado_civil', '')
    filhos = e.get('filhos', 0)
    eid = e['id']

    # Menor de 16 casado
    if idade < 16 and estado_civil in ['casado(a)', 'uniao_estavel', 'divorciado(a)', 'viuvo(a)']:
        adicionar_incoerencia(eid, 'IDADE_CIVIL',
            f'Menor de 16 ({idade}) com estado civil "{estado_civil}"',
            {'idade': idade, 'estado_civil': estado_civil})

    # Divorciado/viúvo muito jovem
    if idade < 22 and estado_civil in ['divorciado(a)', 'viuvo(a)']:
        adicionar_incoerencia(eid, 'IDADE_CIVIL',
            f'Muito jovem ({idade}) para ser {estado_civil}',
            {'idade': idade, 'estado_civil': estado_civil})

    # Muitos filhos para idade
    if idade < 20 and filhos > 2:
        adicionar_incoerencia(eid, 'IDADE_FILHOS',
            f'Menor de 20 ({idade}) com {filhos} filhos',
            {'idade': idade, 'filhos': filhos})

    if idade < 18 and filhos > 1:
        adicionar_incoerencia(eid, 'IDADE_FILHOS',
            f'Menor de 18 ({idade}) com {filhos} filhos',
            {'idade': idade, 'filhos': filhos})

    # Solteiro com muitos filhos (possível mas vale verificar)
    # Não é erro, apenas nota

# ==============================================================================
# 3. RENDA vs CLASSE SOCIAL
# ==============================================================================
print("[3] Verificando RENDA vs CLASSE SOCIAL...")

coerencia_renda_classe = {
    'G1_alta': ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20'],
    'G2_media_alta': ['mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20'],
    'G3_media_baixa': ['mais_de_1_ate_2', 'mais_de_2_ate_5'],
    'G4_baixa': ['ate_1', 'mais_de_1_ate_2'],
}

for e in eleitores:
    renda = e.get('renda_salarios_minimos', '')
    classe = e.get('cluster_socioeconomico', '')
    eid = e['id']

    rendas_validas = coerencia_renda_classe.get(classe, [])
    if renda and rendas_validas and renda not in rendas_validas:
        adicionar_incoerencia(eid, 'RENDA_CLASSE',
            f'Renda "{renda}" incompatível com classe "{classe}"',
            {'renda': renda, 'classe': classe, 'validas': rendas_validas})

# ==============================================================================
# 4. ESCOLARIDADE vs OCUPAÇÃO
# ==============================================================================
print("[4] Verificando ESCOLARIDADE vs OCUPAÇÃO...")

for e in eleitores:
    escolaridade = e.get('escolaridade', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    profissao = e.get('profissao', '')
    eid = e['id']

    # Servidor público geralmente requer pelo menos ensino médio
    if ocupacao == 'servidor_publico' and escolaridade == 'fundamental_ou_sem_instrucao':
        adicionar_incoerencia(eid, 'ESCOLARIDADE_OCUPACAO',
            f'Servidor público com escolaridade fundamental/sem instrução',
            {'escolaridade': escolaridade, 'ocupacao': ocupacao})

    # Empresário com escolaridade fundamental (possível mas raro)
    # Profissões que exigem formação superior
    profissoes_superior = ['médico', 'advogado', 'engenheiro', 'professor universitário',
                          'dentista', 'arquiteto', 'psicólogo', 'farmacêutico']
    prof_lower = profissao.lower()
    if escolaridade != 'superior_ou_pos':
        for prof in profissoes_superior:
            if prof in prof_lower:
                adicionar_incoerencia(eid, 'ESCOLARIDADE_PROFISSAO',
                    f'Profissão "{profissao}" requer nível superior',
                    {'escolaridade': escolaridade, 'profissao': profissao})
                break

# ==============================================================================
# 5. IDADE vs VOTO FACULTATIVO
# ==============================================================================
print("[5] Verificando IDADE vs VOTO FACULTATIVO...")

for e in eleitores:
    idade = e.get('idade', 30)
    voto_fac = e.get('voto_facultativo', False)
    eid = e['id']

    # Voto facultativo: 16-17 anos e 70+ anos
    deveria_ser_facultativo = (16 <= idade <= 17) or (idade >= 70)

    if voto_fac and not deveria_ser_facultativo:
        adicionar_incoerencia(eid, 'VOTO_FACULTATIVO',
            f'Voto facultativo=True mas idade={idade} (deveria ser obrigatório)',
            {'idade': idade, 'voto_facultativo': voto_fac})

    if not voto_fac and deveria_ser_facultativo:
        adicionar_incoerencia(eid, 'VOTO_FACULTATIVO',
            f'Voto facultativo=False mas idade={idade} (deveria ser facultativo)',
            {'idade': idade, 'voto_facultativo': voto_fac})

# ==============================================================================
# 6. RELIGIÃO vs VALORES (coerência temática)
# ==============================================================================
print("[6] Verificando RELIGIÃO vs VALORES...")

for e in eleitores:
    religiao = e.get('religiao', '')
    valores = e.get('valores', [])
    eid = e['id']

    # Evangélico/católico deveria ter valores religiosos ou familiares
    if religiao in ['evangelica', 'catolica']:
        valores_religiosos = ['Fé e religião', 'Família', 'Tradição', 'Ordem']
        tem_valor_religioso = any(v in valores for v in valores_religiosos)
        # Não é erro crítico, apenas nota de atenção
        # if not tem_valor_religioso:
        #     adicionar_incoerencia(eid, 'RELIGIAO_VALORES',
        #         f'Religioso ({religiao}) sem valores religiosos/tradicionais',
        #         {'religiao': religiao, 'valores': valores})

    # Sem religião com "Fé e religião" como valor principal (contraditório)
    if religiao == 'sem_religiao' and 'Fé e religião' in valores:
        adicionar_incoerencia(eid, 'RELIGIAO_VALORES',
            f'Sem religião mas tem "Fé e religião" como valor',
            {'religiao': religiao, 'valores': valores})

# ==============================================================================
# 7. ORIENTAÇÃO POLÍTICA vs POSIÇÃO BOLSONARO
# ==============================================================================
print("[7] Verificando ORIENTAÇÃO POLÍTICA vs POSIÇÃO BOLSONARO...")

for e in eleitores:
    orientacao = e.get('orientacao_politica', '')
    pos_bolso = e.get('posicao_bolsonaro', '')
    eid = e['id']

    # Esquerda apoiando Bolsonaro fortemente (muito incoerente)
    if orientacao == 'esquerda' and pos_bolso in ['apoiador_forte']:
        adicionar_incoerencia(eid, 'POLITICA_BOLSONARO',
            f'Esquerda como apoiador forte de Bolsonaro',
            {'orientacao': orientacao, 'posicao_bolsonaro': pos_bolso})

    # Direita como opositor forte de Bolsonaro (possível mas incomum)
    if orientacao == 'direita' and pos_bolso == 'opositor_forte':
        adicionar_incoerencia(eid, 'POLITICA_BOLSONARO',
            f'Direita como opositor forte de Bolsonaro (incomum)',
            {'orientacao': orientacao, 'posicao_bolsonaro': pos_bolso})

# ==============================================================================
# 8. CONFLITO IDENTITÁRIO (verificar se faz sentido)
# ==============================================================================
print("[8] Verificando CONFLITO IDENTITÁRIO...")

for e in eleitores:
    conflito = e.get('conflito_identitario', False)
    orientacao = e.get('orientacao_politica', '')
    religiao = e.get('religiao', '')
    valores = e.get('valores', [])
    eid = e['id']

    if conflito:
        # Verificar se realmente há elementos de conflito
        tem_conflito_real = False

        # Esquerda + valores conservadores
        if orientacao in ['esquerda', 'centro_esquerda']:
            if any(v in valores for v in ['Ordem', 'Tradição', 'Fé e religião']):
                tem_conflito_real = True
            if religiao == 'evangelica':
                tem_conflito_real = True

        # Direita + valores progressistas
        if orientacao in ['direita', 'centro_direita']:
            if any(v in valores for v in ['Igualdade', 'Liberdade']):
                tem_conflito_real = True
            if religiao == 'sem_religiao':
                tem_conflito_real = True

        # Se marcado como conflito mas não há elementos conflitantes
        # (isso não é necessariamente erro, pois conflito pode ser sutil)

# ==============================================================================
# 9. RENDA vs RENDA_MENSAL (coerência numérica)
# ==============================================================================
print("[9] Verificando RENDA FAIXA vs RENDA MENSAL...")

SM = 1502  # Salário mínimo 2026

faixas_renda = {
    'ate_1': (0, SM),
    'mais_de_1_ate_2': (SM, SM * 2),
    'mais_de_2_ate_5': (SM * 2, SM * 5),
    'mais_de_5_ate_10': (SM * 5, SM * 10),
    'mais_de_10_ate_20': (SM * 10, SM * 20),
    'mais_de_20': (SM * 20, float('inf')),
}

for e in eleitores:
    faixa = e.get('renda_salarios_minimos', '')
    renda_mensal = e.get('renda_mensal', 0)
    eid = e['id']

    if faixa in faixas_renda:
        min_val, max_val = faixas_renda[faixa]
        # Dar margem de tolerância de 10%
        if renda_mensal < min_val * 0.9 or (max_val != float('inf') and renda_mensal > max_val * 1.1):
            adicionar_incoerencia(eid, 'RENDA_NUMERICA',
                f'Renda mensal R${renda_mensal:.0f} fora da faixa "{faixa}" (R${min_val:.0f}-R${max_val:.0f})',
                {'faixa': faixa, 'renda_mensal': renda_mensal})

# ==============================================================================
# 10. TEMPO DESLOCAMENTO vs OCUPAÇÃO
# ==============================================================================
print("[10] Verificando TEMPO DESLOCAMENTO vs OCUPAÇÃO...")

for e in eleitores:
    tempo = e.get('tempo_deslocamento_minutos', 0)
    tempo_cat = e.get('tempo_deslocamento_trabalho', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    eid = e['id']

    # Desempregado/aposentado/estudante não deveria ter tempo de deslocamento para trabalho
    if ocupacao in ['desempregado', 'aposentado'] and tempo > 0 and tempo_cat != 'nao_se_aplica':
        adicionar_incoerencia(eid, 'DESLOCAMENTO_OCUPACAO',
            f'{ocupacao} com tempo de deslocamento de {tempo} minutos',
            {'ocupacao': ocupacao, 'tempo': tempo})

# ==============================================================================
# 11. FAIXA ETÁRIA vs IDADE (campo derivado)
# ==============================================================================
print("[11] Verificando FAIXA ETÁRIA vs IDADE...")

def calc_faixa(idade):
    if idade <= 24: return '16-24'
    elif idade <= 34: return '25-34'
    elif idade <= 44: return '35-44'
    elif idade <= 54: return '45-54'
    elif idade <= 64: return '55-64'
    else: return '65+'

for e in eleitores:
    idade = e.get('idade', 30)
    faixa = e.get('faixa_etaria', '')
    faixa_correta = calc_faixa(idade)
    eid = e['id']

    if faixa != faixa_correta:
        adicionar_incoerencia(eid, 'FAIXA_ETARIA',
            f'Faixa etária "{faixa}" não corresponde à idade {idade} (deveria ser "{faixa_correta}")',
            {'idade': idade, 'faixa': faixa, 'faixa_correta': faixa_correta})

# ==============================================================================
# 12. INTERESSE POLÍTICO vs ESTILO DECISÃO
# ==============================================================================
print("[12] Verificando INTERESSE POLÍTICO vs ESTILO DECISÃO...")

for e in eleitores:
    interesse = e.get('interesse_politico', '')
    estilo = e.get('estilo_decisao', '')
    eid = e['id']

    # Interesse alto com estilo emocional (possível mas incomum)
    # Interesse baixo com estilo identitário (contraditório)
    if interesse == 'baixo' and estilo == 'identitario':
        # Identitário implica forte identificação política
        # Não é erro grave, mas nota de atenção
        pass

# ==============================================================================
# RELATÓRIO FINAL
# ==============================================================================
print("\n" + "=" * 80)
print("RELATÓRIO DE INCOERÊNCIAS")
print("=" * 80)

total_incoerencias = sum(len(v) for v in incoerencias.values())
print(f"\nTotal de incoerências encontradas: {total_incoerencias}")
print(f"Eleitores com problemas: {len(eleitores_problematicos)}")

print("\n--- POR CATEGORIA ---")
for categoria, lista in sorted(incoerencias.items(), key=lambda x: -len(x[1])):
    print(f"\n{categoria}: {len(lista)} casos")
    # Mostrar exemplos
    for item in lista[:3]:
        print(f"  • {item['id']}: {item['descricao']}")
    if len(lista) > 3:
        print(f"  ... e mais {len(lista) - 3} casos")

# Eleitores com mais problemas
print("\n--- ELEITORES MAIS PROBLEMÁTICOS ---")
eleitores_ordenados = sorted(eleitores_problematicos.items(), key=lambda x: -len(x[1]))
for eid, problemas in eleitores_ordenados[:10]:
    print(f"\n{eid} ({len(problemas)} problemas):")
    for p in problemas:
        print(f"  - {p}")

# Estatísticas
print("\n" + "=" * 80)
print("ESTATÍSTICAS")
print("=" * 80)
pct_problematicos = 100 * len(eleitores_problematicos) / len(eleitores)
print(f"\nEleitores sem problemas: {len(eleitores) - len(eleitores_problematicos)} ({100-pct_problematicos:.1f}%)")
print(f"Eleitores com problemas: {len(eleitores_problematicos)} ({pct_problematicos:.1f}%)")

if total_incoerencias == 0:
    print("\n✓ EXCELENTE! Nenhuma incoerência encontrada.")
elif pct_problematicos < 5:
    print(f"\n✓ BOM! Apenas {pct_problematicos:.1f}% dos eleitores têm incoerências.")
elif pct_problematicos < 10:
    print(f"\n⚠ ATENÇÃO! {pct_problematicos:.1f}% dos eleitores têm incoerências.")
else:
    print(f"\n✗ CRÍTICO! {pct_problematicos:.1f}% dos eleitores têm incoerências graves.")

# Salvar relatório em JSON
relatorio = {
    'total_eleitores': len(eleitores),
    'total_incoerencias': total_incoerencias,
    'eleitores_problematicos': len(eleitores_problematicos),
    'por_categoria': {k: len(v) for k, v in incoerencias.items()},
    'detalhes': dict(incoerencias)
}

with open('relatorio_coerencia.json', 'w', encoding='utf-8') as f:
    json.dump(relatorio, f, ensure_ascii=False, indent=2)

print("\nRelatório salvo em: relatorio_coerencia.json")
