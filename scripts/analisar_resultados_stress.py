"""
ANÁLISE DOS RESULTADOS DA SIMULAÇÃO DE STRESS POLÍTICO
======================================================
Processa os resultados coletados e gera relatório de inteligência usando Opus 4.5
"""

import json
import os
import re
from datetime import datetime
from collections import Counter, defaultdict
from pathlib import Path
from dotenv import load_dotenv
import anthropic

# Carregar variáveis de ambiente
BASE_PATH = Path(__file__).parent.parent
load_dotenv(BASE_PATH / ".env.local")
load_dotenv(BASE_PATH / "backend" / ".env")
load_dotenv(BASE_PATH / "frontend" / ".env.local")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
if ANTHROPIC_API_KEY:
    ANTHROPIC_API_KEY = ANTHROPIC_API_KEY.strip('"')

MODEL_OPUS = "claude-opus-4-20250514"

RESULTADOS_DIR = BASE_PATH / "resultados" / "simulacao_stress_politico"

def carregar_resultados():
    """Carrega resultados da simulação"""
    arquivo = RESULTADOS_DIR / "resultados_parcial.json"
    with open(arquivo, "r", encoding="utf-8") as f:
        return json.load(f)

def classificar_resposta_modulo1(raw):
    """Classifica resposta do Módulo 1 (Arruda)"""
    raw_lower = raw.lower()

    if "fico com celina" in raw_lower or ("celina" in raw_lower and "mantenho" in raw_lower):
        return "Fico com Celina"
    elif "sigo arruda" in raw_lower or ("arruda" in raw_lower and "sigo" in raw_lower):
        return "Sigo Arruda"
    elif "anulo" in raw_lower or "branco" in raw_lower:
        return "Anulo/Branco"
    elif "não sei" in raw_lower:
        return "Indeciso"

    # Análise semântica mais profunda
    if "gestão" in raw_lower and "celina" in raw_lower:
        return "Fico com Celina"
    if "lealdade" in raw_lower and "arruda" in raw_lower:
        return "Sigo Arruda"

    return "Não classificado"

def classificar_resposta_modulo2(raw):
    """Classifica resposta do Módulo 2 (Rouba mas Faz)"""
    raw_lower = raw.lower()

    if "obra" in raw_lower and ("mais importante" in raw_lower or "mantenho" in raw_lower):
        return "Obra mais importante"
    elif "corrupção" in raw_lower and ("inaceitável" in raw_lower or "mudo" in raw_lower):
        return "Corrupção inaceitável"
    elif "depende" in raw_lower:
        return "Depende do adversário"
    elif "anulo" in raw_lower:
        return "Anula"

    # Análise semântica
    if "50 milhões" in raw_lower or "roubo" in raw_lower or "desvio" in raw_lower:
        if "não dá" in raw_lower or "inaceitável" in raw_lower or "péssimo" in raw_lower:
            return "Corrupção inaceitável"
    if "benefício" in raw_lower and "supera" in raw_lower:
        return "Obra mais importante"

    return "Não classificado"

def classificar_resposta_modulo3(raw):
    """Classifica resposta do Módulo 3 (Fred Linhares)"""
    raw_lower = raw.lower()

    if "fred" in raw_lower and ("sim" in raw_lower or "prefiro" in raw_lower or "atrai" in raw_lower):
        if "não" not in raw_lower[:50]:
            return "Prefere Fred"
    if "celina" in raw_lower and ("gestão" in raw_lower or "prefiro" in raw_lower):
        return "Prefere Celina"
    if "dividido" in raw_lower or "estou entre" in raw_lower:
        return "Dividido"
    if "nenhum" in raw_lower:
        return "Nenhum"

    # Análise de sentimento
    if "linha dura" in raw_lower or "bala" in raw_lower:
        if "não gosto" in raw_lower or "não é" in raw_lower:
            return "Prefere Celina"
        else:
            return "Prefere Fred"

    return "Dividido"  # Default para casos ambíguos sobre segurança

def classificar_resposta_modulo4_pt(raw):
    """Classifica resposta do Módulo 4 - Celina vs PT"""
    raw_lower = raw.lower()

    if "celina" in raw_lower and ("barr" in raw_lower or "pt" in raw_lower):
        if "voto em celina" in raw_lower or "voto na celina" in raw_lower:
            return "Vota Celina contra PT"
    if "pt" in raw_lower and "voto" in raw_lower and "grass" not in raw_lower:
        if "não" not in raw_lower[:30]:
            return "Vota PT"
    if "grass" in raw_lower and "voto" in raw_lower:
        return "Vota PT"
    if "anulo" in raw_lower:
        return "Anula"

    return "Vota Celina contra PT"  # Default para anti-petistas

def classificar_resposta_modulo4_centro(raw):
    """Classifica resposta do Módulo 4 - Celina vs Centro"""
    raw_lower = raw.lower()

    if "centro" in raw_lower and ("considero" in raw_lower or "posso" in raw_lower):
        return "Considera Centro"
    if "reguffe" in raw_lower and "voto" in raw_lower:
        return "Vota Centro"
    if "celina" in raw_lower and "mantenho" in raw_lower:
        return "Mantém Celina"
    if "técnico" in raw_lower and ("competência" in raw_lower or "gestão" in raw_lower):
        return "Considera Centro"

    return "Considera Centro"  # Default quando menciona técnico/gestão

def analisar_resultados_completo(resultados):
    """Análise completa dos resultados"""

    # Classificar RAs
    ras_periferia = ["Ceilândia", "Samambaia", "Recanto das Emas", "Santa Maria",
                     "Estrutural", "Itapoã", "Paranoá", "São Sebastião", "Varjão",
                     "Planaltina", "Sobradinho II", "Brazlândia", "Fercal"]
    ras_classe_alta = ["Lago Sul", "Lago Norte", "Park Way", "Sudoeste/Octogonal",
                       "Noroeste", "Jardim Botânico"]

    analise = {
        "total": len(resultados),
        "modulo_1": {"contagem": defaultdict(int), "por_segmento": defaultdict(lambda: defaultdict(int))},
        "modulo_2": {"contagem": defaultdict(int), "por_segmento": defaultdict(lambda: defaultdict(int))},
        "modulo_3": {"contagem": defaultdict(int), "por_segmento": defaultdict(lambda: defaultdict(int))},
        "modulo_4_pt": {"contagem": defaultdict(int), "por_segmento": defaultdict(lambda: defaultdict(int))},
        "modulo_4_centro": {"contagem": defaultdict(int), "por_segmento": defaultdict(lambda: defaultdict(int))},
        "citacoes": [],
        "perfis": []
    }

    for r in resultados:
        perfil = r["perfil"]
        respostas = r["respostas"]

        # Classificar perfil
        ra = perfil["ra"]
        tipo_ra = "periferia" if ra in ras_periferia else ("classe_alta" if ra in ras_classe_alta else "classe_media")

        renda = perfil["renda"]
        if "ate_1" in renda or "mais_de_1_ate_2" in renda:
            faixa_renda = "baixa"
        elif "ate_5" in renda:
            faixa_renda = "media"
        else:
            faixa_renda = "alta"

        idade = perfil["idade"]
        faixa_idade = "jovem" if idade < 35 else ("adulto" if idade < 55 else "idoso")

        orientacao = perfil["orientacao"]

        # Módulo 1
        if "modulo_1_fidelidade_arruda" in respostas:
            raw = respostas["modulo_1_fidelidade_arruda"].get("raw", "")
            escolha = classificar_resposta_modulo1(raw)
            analise["modulo_1"]["contagem"][escolha] += 1
            analise["modulo_1"]["por_segmento"]["renda"][f"{faixa_renda}_{escolha}"] += 1
            analise["modulo_1"]["por_segmento"]["ra"][f"{tipo_ra}_{escolha}"] += 1
            analise["modulo_1"]["por_segmento"]["orientacao"][f"{orientacao}_{escolha}"] += 1

            if raw and len(analise["citacoes"]) < 30:
                analise["citacoes"].append({
                    "modulo": "Arruda",
                    "escolha": escolha,
                    "perfil": f"{ra}, renda {faixa_renda}, {orientacao}",
                    "texto": raw[:400]
                })

        # Módulo 2
        if "modulo_2_elasticidade_moral" in respostas:
            raw = respostas["modulo_2_elasticidade_moral"].get("raw", "")
            escolha = classificar_resposta_modulo2(raw)
            analise["modulo_2"]["contagem"][escolha] += 1
            analise["modulo_2"]["por_segmento"]["renda"][f"{faixa_renda}_{escolha}"] += 1
            analise["modulo_2"]["por_segmento"]["ra"][f"{tipo_ra}_{escolha}"] += 1

        # Módulo 3
        if "modulo_3_outsider_fred" in respostas:
            raw = respostas["modulo_3_outsider_fred"].get("raw", "")
            escolha = classificar_resposta_modulo3(raw)
            analise["modulo_3"]["contagem"][escolha] += 1
            analise["modulo_3"]["por_segmento"]["idade"][f"{faixa_idade}_{escolha}"] += 1
            analise["modulo_3"]["por_segmento"]["ra"][f"{tipo_ra}_{escolha}"] += 1

        # Módulo 4
        if "modulo_4_voto_silencioso" in respostas:
            raw = respostas["modulo_4_voto_silencioso"].get("raw", "")

            escolha_pt = classificar_resposta_modulo4_pt(raw)
            analise["modulo_4_pt"]["contagem"][escolha_pt] += 1
            analise["modulo_4_pt"]["por_segmento"]["orientacao"][f"{orientacao}_{escolha_pt}"] += 1

            escolha_centro = classificar_resposta_modulo4_centro(raw)
            analise["modulo_4_centro"]["contagem"][escolha_centro] += 1
            analise["modulo_4_centro"]["por_segmento"]["orientacao"][f"{orientacao}_{escolha_centro}"] += 1

        # Guardar perfil completo
        analise["perfis"].append({
            "nome": r["nome"],
            "ra": ra,
            "tipo_ra": tipo_ra,
            "renda": faixa_renda,
            "idade": faixa_idade,
            "orientacao": orientacao,
            "posicao_bolsonaro": perfil["posicao_bolsonaro"],
            "valores": perfil["valores"],
            "preocupacoes": perfil["preocupacoes"]
        })

    return analise

def calcular_indices(analise):
    """Calcula os índices principais"""
    total = analise["total"]

    indices = {}

    # Índice de Transferência Arruda
    m1 = analise["modulo_1"]["contagem"]
    celina = m1.get("Fico com Celina", 0)
    arruda = m1.get("Sigo Arruda", 0)
    anula_m1 = m1.get("Anulo/Branco", 0)

    indices["transferencia_arruda"] = {
        "propriedade_celina": celina,
        "emprestimo_arruda": arruda,
        "anulam": anula_m1,
        "pct_celina": round(celina / total * 100, 1),
        "pct_arruda": round(arruda / total * 100, 1),
        "risco": "ALTO" if arruda / total > 0.30 else ("MÉDIO" if arruda / total > 0.15 else "BAIXO")
    }

    # Coeficiente de Pragmatismo
    m2 = analise["modulo_2"]["contagem"]
    obra = m2.get("Obra mais importante", 0)
    corrupcao = m2.get("Corrupção inaceitável", 0)
    depende = m2.get("Depende do adversário", 0)

    indices["pragmatismo"] = {
        "tolera_corrupcao": obra,
        "rejeita_corrupcao": corrupcao,
        "depende": depende,
        "pct_tolera": round(obra / total * 100, 1),
        "coeficiente_rouba_mas_faz": round(obra / (obra + corrupcao) * 100, 1) if (obra + corrupcao) > 0 else 0
    }

    # Teto de Vidro da Segurança
    m3 = analise["modulo_3"]["contagem"]
    fred = m3.get("Prefere Fred", 0)
    celina_seg = m3.get("Prefere Celina", 0)
    dividido = m3.get("Dividido", 0)

    indices["seguranca_fred"] = {
        "migra_fred": fred,
        "mantém_celina": celina_seg,
        "dividido": dividido,
        "pct_migra": round(fred / total * 100, 1),
        "risco": "CRÍTICO" if fred / total > 0.20 else ("ALTO" if fred / total > 0.15 else "MODERADO")
    }

    # Barreira Anti-Petismo
    m4_pt = analise["modulo_4_pt"]["contagem"]
    m4_centro = analise["modulo_4_centro"]["contagem"]

    vota_celina_pt = m4_pt.get("Vota Celina contra PT", 0)
    vota_pt = m4_pt.get("Vota PT", 0)

    considera_centro = m4_centro.get("Considera Centro", 0) + m4_centro.get("Vota Centro", 0)
    mantem_celina = m4_centro.get("Mantém Celina", 0)

    indices["antipetismo"] = {
        "celina_vs_pt": vota_celina_pt,
        "vota_pt": vota_pt,
        "considera_centro": considera_centro,
        "mantem_celina_vs_centro": mantem_celina,
        "pct_voto_util": round(vota_celina_pt / total * 100, 1),
        "pct_foge_para_centro": round(considera_centro / total * 100, 1),
        "tipo_voto": "VOTO ÚTIL" if (vota_celina_pt - considera_centro) > total * 0.15 else "VOTO MISTO"
    }

    return indices

def gerar_relatorio_opus(client, analise, indices, resultados):
    """Gera relatório completo usando Opus 4.5"""

    prompt = f"""
Você é um cientista político sênior especializado em eleições brasileiras.
Analise os resultados desta simulação de "Stress Político" sobre CELINA LEÃO (PP) para Governador do DF 2026.

=== CONTEXTO POLÍTICO ===
- Celina Leão lidera pesquisas com 38-54% das intenções de voto
- É vice-governadora de Ibaneis Rocha e associada historicamente a José Roberto Arruda
- Principal adversário da esquerda: Leandro Grass (PT) - 19-33%
- Concorrente da direita populista: Fred Linhares - discurso linha dura em segurança
- Outros: Flávia Arruda (11-16%), Damares (6-8%)

=== METODOLOGIA ===
Entrevistamos {analise['total']} eleitores simulados (agentes de IA com perfis demográficos realistas do DF).
Os agentes foram submetidos a 4 módulos de "stress político" para testar seus limites de fidelidade.

=== RESULTADOS QUANTITATIVOS ===

**MÓDULO 1 - FIDELIDADE ARRUDA (Se Arruda romper com Celina)**
{json.dumps(dict(analise['modulo_1']['contagem']), indent=2)}
Segmentação por renda: {json.dumps(dict(analise['modulo_1']['por_segmento']['renda']), indent=2)}

**MÓDULO 2 - ELASTICIDADE MORAL (Obra + Corrupção)**
{json.dumps(dict(analise['modulo_2']['contagem']), indent=2)}
Segmentação por tipo de RA: {json.dumps(dict(analise['modulo_2']['por_segmento']['ra']), indent=2)}

**MÓDULO 3 - VULNERABILIDADE A FRED LINHARES (Segurança)**
{json.dumps(dict(analise['modulo_3']['contagem']), indent=2)}
Segmentação por idade: {json.dumps(dict(analise['modulo_3']['por_segmento']['idade']), indent=2)}

**MÓDULO 4 - VOTO ÚTIL vs VOTO DE CONVICÇÃO**
- Celina vs PT: {json.dumps(dict(analise['modulo_4_pt']['contagem']), indent=2)}
- Celina vs Centro: {json.dumps(dict(analise['modulo_4_centro']['contagem']), indent=2)}

=== ÍNDICES CALCULADOS ===
{json.dumps(indices, indent=2, ensure_ascii=False)}

=== CITAÇÕES REPRESENTATIVAS (amostra) ===
{json.dumps(analise['citacoes'][:15], indent=2, ensure_ascii=False)}

=== TAREFA ===

Produza um RELATÓRIO DE INTELIGÊNCIA ELEITORAL COMPLETO com as seguintes seções:

## 1. RESUMO EXECUTIVO
- Principal descoberta (1 parágrafo)
- Nível de risco geral (BAIXO/MÉDIO/ALTO/CRÍTICO)
- Prognóstico sintético

## 2. ÍNDICE DE TRANSFERÊNCIA ARRUDA
- Os votos são "propriedade de Celina" ou "emprestados de Arruda"?
- Análise: Se >30% seguem Arruda, a liderança é de vidro
- Qual segmento é mais vulnerável?
- Recomendação estratégica para blindagem

## 3. COEFICIENTE DE PRAGMATISMO ("ROUBA MAS FAZ")
- Qual a tolerância real à corrupção em troca de obras?
- Compare periferia vs classe média/alta
- Onde focar narrativa de "Entregas" vs "Ética/Compliance"?
- Cite respostas que ilustrem o raciocínio dos eleitores

## 4. VULNERABILIDADE À PAUTA DE SEGURANÇA (FRED LINHARES)
- Quantos eleitores podem migrar para discurso populista?
- Se >15%, segurança é o FLANCO EXPOSTO
- Qual perfil é mais suscetível?
- Como Celina deve responder?

## 5. VOTO ÚTIL vs VOTO DE PAIXÃO
- Celina vence por mérito próprio ou por anti-petismo?
- O que acontece contra candidato de centro?
- Risco de "derretimento" no segundo turno

## 6. MAPA DE RISCOS
Lista ordenada por gravidade (do mais grave ao menos grave)

## 7. OPORTUNIDADES INEXPLORADAS
O que a pesquisa revela sobre públicos que podem ser conquistados?

## 8. RECOMENDAÇÕES ESTRATÉGICAS
5 ações prioritárias (em ordem de urgência)
- Para cada ação, indique: público-alvo, mensagem-chave, canal

## 9. ARMADILHAS A EVITAR
O que Celina NÃO deve fazer?

## 10. CONCLUSÃO E PROGNÓSTICO
- Celina ganha fácil, ganha apertado, ou há risco real de derrota?
- Qual o cenário mais provável?
- O que pode mudar tudo?

IMPORTANTE: Use linguagem direta e assertiva. Evite eufemismos.
Seja BRUTALMENTE HONESTO sobre vulnerabilidades.
Cite números específicos da pesquisa para sustentar cada afirmação.
"""

    response = client.messages.create(
        model=MODEL_OPUS,
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text

def main():
    print("=" * 70)
    print("ANÁLISE DE RESULTADOS - SIMULAÇÃO DE STRESS POLÍTICO")
    print("CELINA LEÃO - GOVERNADOR DF 2026")
    print("=" * 70)
    print()

    # Verificar API
    if not ANTHROPIC_API_KEY:
        print("ERRO: API key não encontrada!")
        return

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Carregar resultados
    print("1. Carregando resultados da simulação...")
    resultados = carregar_resultados()
    print(f"   {len(resultados)} entrevistas carregadas")

    # Analisar
    print("\n2. Processando análise estatística...")
    analise = analisar_resultados_completo(resultados)

    # Calcular índices
    print("\n3. Calculando índices principais...")
    indices = calcular_indices(analise)

    print("\n   ÍNDICES CALCULADOS:")
    print(f"   - Transferência Arruda: {indices['transferencia_arruda']['pct_celina']:.1f}% ficam com Celina | {indices['transferencia_arruda']['pct_arruda']:.1f}% seguem Arruda")
    print(f"   - Coeficiente 'Rouba mas Faz': {indices['pragmatismo']['coeficiente_rouba_mas_faz']:.1f}%")
    print(f"   - Migração para Fred: {indices['seguranca_fred']['pct_migra']:.1f}% (Risco: {indices['seguranca_fred']['risco']})")
    print(f"   - Tipo de voto: {indices['antipetismo']['tipo_voto']}")

    # Salvar análise intermediária
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(RESULTADOS_DIR / f"analise_quantitativa_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump({
            "analise": {k: dict(v) if isinstance(v, defaultdict) else v for k, v in analise.items() if k not in ["citacoes", "perfis"]},
            "indices": indices,
            "citacoes": analise["citacoes"]
        }, f, ensure_ascii=False, indent=2, default=str)

    # Gerar relatório com Opus
    print("\n4. Gerando relatório de inteligência (Opus 4.5)...")
    print("   Isso pode levar 1-2 minutos...")

    relatorio = gerar_relatorio_opus(client, analise, indices, resultados)

    # Salvar relatório
    arquivo_relatorio = RESULTADOS_DIR / f"RELATORIO_INTELIGENCIA_CELINA_{timestamp}.md"
    with open(arquivo_relatorio, "w", encoding="utf-8") as f:
        f.write("# RELATÓRIO DE INTELIGÊNCIA ELEITORAL\n")
        f.write("## Simulação de Stress Político - Celina Leão (DF 2026)\n\n")
        f.write(f"**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        f.write(f"**Amostra:** {len(resultados)} eleitores simulados\n")
        f.write(f"**Metodologia:** Agentes de IA com perfis demográficos representativos do DF\n\n")
        f.write("---\n\n")
        f.write(relatorio)

    print(f"\n5. Relatório salvo em: {arquivo_relatorio}")

    # Exibir prévia
    print("\n" + "=" * 70)
    print("PRÉVIA DO RELATÓRIO")
    print("=" * 70)
    print(relatorio)

    return analise, indices, relatorio

if __name__ == "__main__":
    main()
