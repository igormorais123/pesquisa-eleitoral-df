#!/usr/bin/env python3
import json
import random

# Carregar banco atual
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n_atual = len(eleitores)
print(f'Atual: {n_atual} eleitores')

# Dados
REGIOES = ['Ceilandia', 'Samambaia', 'Taguatinga', 'Planaltina', 'Gama', 'Santa Maria', 'Recanto das Emas', 'Sobradinho', 'Riacho Fundo', 'Paranoa']
NOMES_M = ['Joao', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Matheus', 'Bruno', 'Felipe', 'Gustavo', 'Leonardo', 'Rodrigo', 'Thiago', 'Andre', 'Carlos', 'Daniel', 'Eduardo', 'Fernando', 'Henrique', 'Igor', 'Jose']
NOMES_F = ['Maria', 'Ana', 'Juliana', 'Fernanda', 'Patricia', 'Camila', 'Amanda', 'Bruna', 'Carolina', 'Daniela', 'Gabriela', 'Helena', 'Isabella', 'Larissa', 'Leticia', 'Mariana']
SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho']

def gerar_nome(genero):
    nome = random.choice(NOMES_M if genero == 'masculino' else NOMES_F)
    return f'{nome} {random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}'

def gerar_eleitor(idx, perfil):
    genero = random.choice(['masculino', 'feminino'])
    nome = gerar_nome(genero)
    idade = random.randint(22, 58)
    regiao = random.choice(REGIOES)

    # SEMPRE G3_media_baixa
    cluster = 'G3_media_baixa'

    # Escolaridade variada
    escolaridade = random.choices(
        ['fundamental_ou_sem_instrucao', 'medio_completo_ou_sup_incompleto', 'superior_completo_ou_pos'],
        weights=[0.25, 0.45, 0.30]
    )[0]

    # Ocupacao variada
    ocupacao = random.choices(
        ['clt', 'autonomo', 'servidor_publico', 'informal'],
        weights=[0.40, 0.25, 0.20, 0.15]
    )[0]

    # Profissao
    profissoes = ['Vendedor(a)', 'Auxiliar Administrativo', 'Motorista', 'Tecnico(a)', 'Atendente', 'Operador(a)', 'Assistente', 'Recepcionista']
    profissao = random.choice(profissoes)

    # Transporte - priorizar metro e moto
    transporte = perfil.get('transporte', random.choices(
        ['metro', 'moto', 'onibus', 'carro', 'a_pe'],
        weights=[0.30, 0.25, 0.25, 0.10, 0.10]
    )[0])

    # Renda media-baixa
    renda = random.choice(['1_a_2', '2_a_3', '3_a_5'])

    # Posicao Bolsonaro - priorizar criticos
    if perfil.get('critico_forte'):
        posicao_bolsonaro = 'critico_forte'
    elif perfil.get('critico_moderado'):
        posicao_bolsonaro = 'critico_moderado'
    else:
        posicao_bolsonaro = random.choices(
            ['critico_forte', 'critico_moderado', 'neutro', 'apoiador_moderado'],
            weights=[0.35, 0.30, 0.25, 0.10]
        )[0]

    # Orientacao coerente
    if posicao_bolsonaro in ['critico_forte', 'critico_moderado']:
        orientacao = random.choices(['esquerda', 'centro_esquerda', 'centro'], weights=[0.4, 0.4, 0.2])[0]
    else:
        orientacao = random.choices(['centro', 'centro_direita', 'centro_esquerda'], weights=[0.5, 0.3, 0.2])[0]

    # Susceptibilidade - evitar 4-6
    susceptibilidade = random.choices([1, 2, 3, 7, 8, 9], weights=[0.12, 0.18, 0.20, 0.20, 0.18, 0.12])[0]

    cor = random.choices(['branca', 'parda', 'preta'], weights=[0.30, 0.50, 0.20])[0]
    estado_civil = random.choices(['solteiro(a)', 'casado(a)', 'divorciado(a)', 'uniao_estavel'], weights=[0.35, 0.40, 0.10, 0.15])[0]
    filhos = random.choices([0, 1, 2, 3], weights=[0.25, 0.35, 0.30, 0.10])[0]
    religiao = random.choices(['catolica', 'evangelica', 'espirita', 'sem_religiao'], weights=[0.35, 0.35, 0.10, 0.20])[0]
    interesse = random.choices(['baixo', 'medio', 'alto'], weights=[0.35, 0.45, 0.20])[0]

    if orientacao in ['esquerda', 'centro_esquerda']:
        valores = random.sample(['Igualdade social', 'Direitos humanos', 'Educacao publica', 'Saude publica', 'Meio ambiente'], 3)
        medos = random.sample(['Desemprego', 'Violencia', 'Desigualdade', 'Autoritarismo'], 3)
        preocupacoes = random.sample(['Desemprego', 'Custo de vida', 'Saude', 'Educacao'], 3)
    else:
        valores = random.sample(['Familia', 'Trabalho', 'Seguranca', 'Estabilidade', 'Honestidade'], 3)
        medos = random.sample(['Criminalidade', 'Desemprego', 'Corrupcao', 'Crise economica'], 3)
        preocupacoes = random.sample(['Seguranca', 'Economia', 'Saude', 'Emprego'], 3)

    fontes = random.sample(['Jornal Nacional', 'WhatsApp', 'Instagram', 'TV aberta', 'Redes sociais'], 2)
    vieses = random.sample(['confirmacao', 'disponibilidade', 'ancoragem', 'grupo'], 2)
    tolerancia = random.choices(['baixa', 'media', 'alta'], weights=[0.25, 0.50, 0.25])[0]
    estilo = random.choices(['emocional', 'racional', 'economico'], weights=[0.30, 0.35, 0.35])[0]

    primeiro_nome = nome.split()[0]
    if posicao_bolsonaro == 'critico_forte':
        visao = 'Critico(a) do bolsonarismo, ve como ameaca a democracia.'
    elif posicao_bolsonaro == 'critico_moderado':
        visao = 'Tem criticas ao governo Bolsonaro, especialmente na pandemia.'
    else:
        visao = 'Prefere nao se posicionar fortemente na politica.'

    historia = f'{primeiro_nome} mora em {regiao} e trabalha como {profissao}. {visao}'
    instrucao = 'Tom: coloquial. Acompanha politica por alto. Vota pensando no dia a dia.'

    return {
        'id': f'df-{901 + idx:04d}',
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
        'local_referencia': f'regiao de {regiao}',
        'historia_resumida': historia,
        'instrucao_comportamental': instrucao
    }

# Gerar 100 eleitores otimizados
novos = []
idx = 0

# 45 criticos fortes com metro/moto
for _ in range(45):
    transporte = random.choice(['metro', 'moto'])
    novos.append(gerar_eleitor(idx, {'critico_forte': True, 'transporte': transporte}))
    idx += 1

# 35 criticos moderados com metro/moto
for _ in range(35):
    transporte = random.choice(['metro', 'moto'])
    novos.append(gerar_eleitor(idx, {'critico_moderado': True, 'transporte': transporte}))
    idx += 1

# 20 neutros/variados
for _ in range(20):
    novos.append(gerar_eleitor(idx, {}))
    idx += 1

print(f'Gerados: {len(novos)} novos eleitores')

# Combinar
todos = eleitores + novos
total = len(todos)
print(f'Total final: {total}')

# Verificar
g3 = sum(1 for e in todos if e.get('cluster_socioeconomico') == 'G3_media_baixa')
g4 = sum(1 for e in todos if e.get('cluster_socioeconomico') == 'G4_baixa')
cf = sum(1 for e in todos if e.get('posicao_bolsonaro') == 'critico_forte')
cm = sum(1 for e in todos if e.get('posicao_bolsonaro') == 'critico_moderado')
af = sum(1 for e in todos if e.get('posicao_bolsonaro') == 'apoiador_forte')
metro = sum(1 for e in todos if e.get('meio_transporte') == 'metro')
moto = sum(1 for e in todos if e.get('meio_transporte') == 'moto')

print()
print('=== NOVAS DISTRIBUICOES ===')
print(f'G3_media_baixa: {g3} ({100*g3/total:.1f}%) - meta: 38.2%')
print(f'G4_baixa: {g4} ({100*g4/total:.1f}%) - meta: 28.2%')
print(f'critico_forte: {cf} ({100*cf/total:.1f}%) - meta: 34%')
print(f'critico_moderado: {cm} ({100*cm/total:.1f}%) - meta: 18%')
print(f'apoiador_forte: {af} ({100*af/total:.1f}%) - meta: 15%')
print(f'metro: {metro} ({100*metro/total:.1f}%) - meta: 12%')
print(f'moto: {moto} ({100*moto/total:.1f}%) - meta: 10%')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)
print()
print('Salvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(todos, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
