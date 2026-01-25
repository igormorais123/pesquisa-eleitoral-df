"""
Corrige incoerências de menores de 18 anos
"""
import json

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

corrigidos = 0
for e in eleitores:
    idade = e.get('idade', 30)

    if idade < 18:
        # Ocupação deve ser estudante ou desempregado
        if e.get('ocupacao_vinculo') not in ['estudante', 'desempregado']:
            e['ocupacao_vinculo'] = 'estudante'
            corrigidos += 1

        # Estado civil deve ser solteiro
        if e.get('estado_civil') not in ['solteiro(a)']:
            e['estado_civil'] = 'solteiro(a)'
            corrigidos += 1

        # Sem filhos
        if e.get('filhos', 0) > 0:
            e['filhos'] = 0
            e['filhos_cat'] = 'sem_filhos'
            corrigidos += 1

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print(f"Correções aplicadas: {corrigidos}")
