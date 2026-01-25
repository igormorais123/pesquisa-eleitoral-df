"""
Correção de Gênero dos Gestores
Corrige inconsistências entre nome, gênero e cargo
"""
import json
import re

# Carregar gestores
with open('agentes/banco-gestores.json', 'r', encoding='utf-8') as f:
    dados = json.load(f)

gestores = dados['gestores']
print(f"Total de gestores: {len(gestores)}")

# Nomes tipicamente femininos (primeiro nome)
nomes_femininos = [
    'MARCELA', 'JULIANA', 'ANA', 'MARIA', 'CRISTIANE', 'PATRÍCIA', 'PATRICIA',
    'LUCIANA', 'FERNANDA', 'DÉBORA', 'DEBORA', 'RENATA', 'TEREZA', 'TERESA',
    'FLÁVIA', 'FLAVIA', 'MARINA', 'ANDRÉA', 'ANDREA', 'BEATRIZ', 'LARISSA',
    'CARLA', 'CAMILA', 'JULIANA', 'AMANDA', 'GABRIELA', 'LETÍCIA', 'LETICIA',
    'PRISCILA', 'VANESSA', 'ALINE', 'DANIELA', 'ROBERTA', 'PAULA', 'ADRIANA',
    'TATIANA', 'RAQUEL', 'CLÁUDIA', 'CLAUDIA', 'MARIANA', 'BIANCA', 'BRUNA',
    'CAROLINA', 'ISABELA', 'ISABEL', 'LÚCIA', 'LUCIA', 'SANDRA', 'MÔNICA',
    'MONICA', 'SILVIA', 'SÍLVIA', 'HELENA', 'REGINA', 'ROSANA', 'ROSANGELA',
    'SIMONE', 'SONIA', 'SÔNIA', 'VERA', 'DENISE', 'ELAINE', 'ELIANA'
]

nomes_masculinos = [
    'ROBERTO', 'CARLOS', 'JOSÉ', 'JOSE', 'FERNANDO', 'RICARDO', 'MARCOS',
    'ANTÔNIO', 'ANTONIO', 'JORGE', 'PEDRO', 'PAULO', 'JOÃO', 'JOAO',
    'LUÍS', 'LUIS', 'FRANCISCO', 'MARCELO', 'DANIEL', 'RAFAEL', 'LUCAS',
    'GUSTAVO', 'BRUNO', 'EDUARDO', 'RODRIGO', 'FELIPE', 'THIAGO', 'TIAGO',
    'ANDRÉ', 'ANDRE', 'RENATO', 'ALEXANDRE', 'FÁBIO', 'FABIO', 'LEANDRO',
    'MÁRCIO', 'MARCIO', 'SÉRGIO', 'SERGIO', 'CLÁUDIO', 'CLAUDIO', 'HÉLIO',
    'HELIO', 'ROGÉRIO', 'ROGERIO', 'VINICIUS', 'VINÍCIUS', 'WAGNER'
]

def inferir_genero(nome):
    """Infere gênero pelo primeiro nome"""
    primeiro_nome = nome.split()[0].upper() if nome else ''

    if primeiro_nome in nomes_femininos:
        return 'feminino'
    elif primeiro_nome in nomes_masculinos:
        return 'masculino'

    # Heurística: nomes terminando em 'A' são femininos (com exceções)
    if primeiro_nome.endswith('A') and primeiro_nome not in ['LUCA', 'NIKITA', 'COSTA', 'JOSHUA']:
        return 'feminino'

    return None

def ajustar_cargo_genero(cargo, genero):
    """Ajusta a flexão do cargo de acordo com o gênero"""

    # Mapeamento de cargos masculino -> feminino
    substituicoes_m_f = [
        (r'\bDiretor-Presidente\b', 'Diretora-Presidente'),
        (r'\bDiretor\b', 'Diretora'),
        (r'\bSecretário\b', 'Secretária'),
        (r'\bCoordenador-Geral\b', 'Coordenadora-Geral'),
        (r'\bCoordenador\b', 'Coordenadora'),
        (r'\bPresidente\b', 'Presidente'),  # Presidente não muda
        (r'\bSuperintendente\b', 'Superintendente'),  # Não muda
        (r'\bGerente\b', 'Gerente'),  # Não muda
        (r'\bChefe\b', 'Chefe'),  # Não muda
    ]

    # Mapeamento de cargos feminino -> masculino
    substituicoes_f_m = [
        (r'\bDiretora-Presidente\b', 'Diretor-Presidente'),
        (r'\bDiretora\b', 'Diretor'),
        (r'\bSecretária\b', 'Secretário'),
        (r'\bCoordenadora-Geral\b', 'Coordenador-Geral'),
        (r'\bCoordenadora\b', 'Coordenador'),
    ]

    novo_cargo = cargo

    if genero == 'feminino':
        for padrao, subst in substituicoes_m_f:
            novo_cargo = re.sub(padrao, subst, novo_cargo)
    elif genero == 'masculino':
        for padrao, subst in substituicoes_f_m:
            novo_cargo = re.sub(padrao, subst, novo_cargo)

    return novo_cargo

# Corrigir gestores
correcoes_genero = 0
correcoes_cargo = 0

for g in gestores:
    nome = g.get('nome', '')
    genero_atual = g.get('genero', '')
    cargo_atual = g.get('cargo', '')

    # Inferir gênero pelo nome
    genero_inferido = inferir_genero(nome)

    # Se conseguiu inferir e está diferente, corrigir
    if genero_inferido and genero_inferido != genero_atual:
        g['genero'] = genero_inferido
        correcoes_genero += 1
        print(f"  Gênero corrigido: {nome[:40]} -> {genero_inferido}")

    # Usar o gênero correto para ajustar o cargo
    genero_final = g.get('genero')
    cargo_novo = ajustar_cargo_genero(cargo_atual, genero_final)

    if cargo_novo != cargo_atual:
        g['cargo'] = cargo_novo
        correcoes_cargo += 1
        print(f"  Cargo corrigido: {cargo_atual[:40]}... -> {cargo_novo[:40]}...")

# Salvar
with open('agentes/banco-gestores.json', 'w', encoding='utf-8') as f:
    json.dump(dados, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print("RESUMO DAS CORREÇÕES")
print(f"{'='*60}")
print(f"Gêneros corrigidos: {correcoes_genero}")
print(f"Cargos corrigidos: {correcoes_cargo}")
print(f"Total de correções: {correcoes_genero + correcoes_cargo}")
print("\nArquivo salvo!")
