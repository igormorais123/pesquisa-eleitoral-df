"""
SIMULAÇÃO DE STRESS POLÍTICO - CELINA LEÃO (DF 2026)
====================================================
Pesquisa de Cenários Contrafatuais e Elasticidade Moral do Voto

Módulos:
1. O Teste de Fidelidade (O Fator Arruda)
2. O Teste da Elasticidade Moral (O Fator Rouba mas Faz)
3. O Teste do Outsider (O Fator Fred Linhares)
4. O Voto Silencioso (O Fator Esquerda/Centro)

Usando: Sonnet 4 para respostas dos agentes
"""

import json
import os
import time
import random
from datetime import datetime
from collections import Counter, defaultdict
from pathlib import Path
from dotenv import load_dotenv
import anthropic

# Carregar variáveis de ambiente de múltiplos locais
BASE_PATH = Path(__file__).parent.parent
load_dotenv(BASE_PATH / ".env.local")
load_dotenv(BASE_PATH / "backend" / ".env")
load_dotenv(BASE_PATH / "frontend" / ".env.local")

# Configuração
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
if ANTHROPIC_API_KEY:
    ANTHROPIC_API_KEY = ANTHROPIC_API_KEY.strip('"')
MODEL_SONNET = "claude-sonnet-4-20250514"
MODEL_OPUS = "claude-opus-4-20250514"

# Diretórios
BASE_DIR = Path(__file__).parent.parent
AGENTES_DIR = BASE_DIR / "agentes"
RESULTADOS_DIR = BASE_DIR / "resultados" / "simulacao_stress_politico"
RESULTADOS_DIR.mkdir(parents=True, exist_ok=True)

def carregar_eleitores():
    """Carrega eleitores do arquivo limpo"""
    with open(AGENTES_DIR / "banco-eleitores-df-clean.json", "r", encoding="utf-8") as f:
        return json.load(f)

def criar_prompt_sistema():
    """Cria o prompt de sistema para a simulação"""
    return """Você é um eleitor do Distrito Federal que será submetido a um teste de 'Stress Político'.

REGRAS ABSOLUTAS:
- Responda SEMPRE em primeira pessoa
- NÃO dê respostas polidas ou politicamente corretas
- Tome decisões baseadas ESTRITAMENTE nos seus atributos demográficos e valores
- Seja BRUTALMENTE honesto sobre suas motivações reais
- Se você não gosta de política, demonstre isso
- Se você votaria por interesse próprio mesmo sabendo que é "errado", admita
- Use linguagem coloquial adequada ao seu perfil

Responda de forma CURTA e DIRETA. Máximo 2-3 frases por pergunta."""

def criar_perfil_eleitor(eleitor):
    """Cria descrição do perfil do eleitor para o prompt"""
    return f"""
VOCÊ É: {eleitor['nome']}
- Idade: {eleitor['idade']} anos
- Gênero: {eleitor['genero']}
- Cor/Raça: {eleitor['cor_raca']}
- Mora em: {eleitor['regiao_administrativa']} ({eleitor.get('local_referencia', '')})
- Escolaridade: {eleitor['escolaridade'].replace('_', ' ')}
- Profissão: {eleitor['profissao']}
- Vínculo: {eleitor['ocupacao_vinculo'].replace('_', ' ')}
- Renda: {eleitor['renda_salarios_minimos'].replace('_', ' ')} salários mínimos
- Religião: {eleitor['religiao'].replace('_', ' ')}
- Estado civil: {eleitor['estado_civil']}
- Filhos: {eleitor['filhos']}
- Orientação política: {eleitor['orientacao_politica'].replace('_', ' ')}
- Posição sobre Bolsonaro: {eleitor['posicao_bolsonaro'].replace('_', ' ')}
- Interesse em política: {eleitor['interesse_politico']}
- Valores principais: {', '.join(eleitor['valores'])}
- Preocupações: {', '.join(eleitor['preocupacoes'])}
- Medos: {', '.join(eleitor['medos'])}
- Vieses cognitivos: {', '.join(eleitor['vieses_cognitivos'])}
- Susceptibilidade a desinformação: {eleitor['susceptibilidade_desinformacao']}
- Fontes de informação: {', '.join(eleitor['fontes_informacao'][:3])}
- Estilo de decisão: {eleitor['estilo_decisao']}
- História: {eleitor['historia_resumida']}
- Tom de fala: {eleitor['instrucao_comportamental']}
"""

def criar_questionario_modulos():
    """Retorna os módulos do questionário"""
    return {
        "modulo_1_fidelidade_arruda": {
            "titulo": "O Teste de Fidelidade (O Fator Arruda)",
            "contexto": """Você declarou simpatia por Celina Leão (ou pelo menos considera votar nela).
Imagine agora o seguinte cenário: José Roberto Arruda rompe publicamente com Celina,
chamando-a de TRAIDORA, e pede votos para um candidato desconhecido do PL.""",
            "perguntas": [
                {
                    "id": "p1_voto_arruda",
                    "texto": "Você mantém o voto em Celina pela gestão dela, ou segue a indicação de Arruda por lealdade histórica?",
                    "opcoes": ["Fico com Celina", "Sigo Arruda", "Anulo/Branco", "Não sei ainda"],
                    "tipo": "escolha"
                },
                {
                    "id": "p2_justificativa_arruda",
                    "texto": "Justifique sua escolha em UMA frase curta baseada na sua maior preocupação hoje.",
                    "tipo": "aberta"
                }
            ]
        },
        "modulo_2_elasticidade_moral": {
            "titulo": "O Teste da Elasticidade Moral (O Fator Rouba mas Faz)",
            "contexto": """Celina entrega uma GRANDE obra viária perto da sua casa que resolve seu problema
de trânsito. Uma semana depois, surge uma denúncia SÓLIDA de superfaturamento nesta obra
(desvio de R$ 50 milhões), mas sem risco de prisão imediata para ela.""",
            "perguntas": [
                {
                    "id": "p3_obra_corrupcao",
                    "texto": "O benefício da obra supera a denúncia moral para você? Você mantém o voto?",
                    "opcoes": ["A obra é mais importante, mantenho o voto", "A corrupção é inaceitável, mudo o voto", "Depende de quem for o outro candidato", "Vou anular"],
                    "tipo": "escolha"
                },
                {
                    "id": "p3b_justificativa_moral",
                    "texto": "Seja honesto: qual é o seu limite de tolerância para corrupção se você se beneficia diretamente?",
                    "tipo": "aberta"
                }
            ]
        },
        "modulo_3_outsider_fred": {
            "titulo": "O Teste do Outsider (O Fator Fred Linhares)",
            "contexto": """A segurança pública no seu bairro piorou DRASTICAMENTE. Assaltos frequentes,
tiroteios, você ou alguém próximo foi vítima de crime recentemente.

Fred Linhares começa uma campanha AGRESSIVA prometendo 'caçar bandidos',
'bala na cabeça de vagabundo', estilo Bolsonaro radicalizado.

Enquanto isso, Celina promete 'mais gestão, tecnologia e inteligência policial'.""",
            "perguntas": [
                {
                    "id": "p4_seguranca_fred",
                    "texto": "Diante do medo REAL da violência, o discurso agressivo do Fred te atrai mais que o discurso de gestão da Celina?",
                    "opcoes": ["Sim, quero alguém linha dura como Fred", "Não, prefiro a gestão técnica da Celina", "Estou dividido entre os dois", "Nenhum dos dois me convence"],
                    "tipo": "escolha"
                },
                {
                    "id": "p4b_seguranca_emocao",
                    "texto": "Quando você pensa em segurança, o que fala mais alto: a razão ou a emoção/raiva?",
                    "tipo": "aberta"
                }
            ]
        },
        "modulo_4_voto_silencioso": {
            "titulo": "O Voto Silencioso (O Fator Esquerda/Centro)",
            "contexto": """Considere os seguintes cenários de SEGUNDO TURNO:""",
            "perguntas": [
                {
                    "id": "p5_celina_vs_pt",
                    "texto": "Se o segundo turno for entre Celina Leão e um candidato do PT (Leandro Grass), você vota em Celina para impedir o PT, ou anula o voto?",
                    "opcoes": ["Voto em Celina para barrar o PT", "Voto no PT/Grass", "Anulo/Branco", "Depende da campanha"],
                    "tipo": "escolha"
                },
                {
                    "id": "p6_celina_vs_centro",
                    "texto": "E se o adversário for um gestor técnico de centro (tipo Reguffe), sem ligação com PT? Você ainda vota em Celina ou considera o concorrente?",
                    "opcoes": ["Mantenho em Celina de qualquer forma", "Considero votar no candidato de centro", "Voto no centro/Reguffe", "Anulo/Branco"],
                    "tipo": "escolha"
                },
                {
                    "id": "p6b_motivacao_voto",
                    "texto": "Seja sincero: seu voto em Celina é mais por GOSTAR dela ou por REJEITAR o adversário?",
                    "tipo": "aberta"
                }
            ]
        }
    }

def executar_entrevista_eleitor(client, eleitor, modulos, verbose=True):
    """Executa entrevista completa com um eleitor"""

    prompt_sistema = criar_prompt_sistema()
    perfil = criar_perfil_eleitor(eleitor)

    respostas_eleitor = {
        "id": eleitor["id"],
        "nome": eleitor["nome"],
        "perfil": {
            "ra": eleitor["regiao_administrativa"],
            "idade": eleitor["idade"],
            "genero": eleitor["genero"],
            "renda": eleitor["renda_salarios_minimos"],
            "orientacao": eleitor["orientacao_politica"],
            "posicao_bolsonaro": eleitor["posicao_bolsonaro"],
            "escolaridade": eleitor["escolaridade"],
            "religiao": eleitor["religiao"],
            "valores": eleitor["valores"],
            "preocupacoes": eleitor["preocupacoes"],
            "estilo_decisao": eleitor["estilo_decisao"]
        },
        "respostas": {},
        "timestamp": datetime.now().isoformat()
    }

    for modulo_key, modulo in modulos.items():
        respostas_eleitor["respostas"][modulo_key] = {}

        # Construir prompt do módulo
        prompt_modulo = f"""
{perfil}

===== {modulo['titulo'].upper()} =====

CONTEXTO: {modulo['contexto']}

Responda às seguintes perguntas:
"""
        for pergunta in modulo["perguntas"]:
            prompt_modulo += f"\n{pergunta['id']}: {pergunta['texto']}\n"
            if pergunta["tipo"] == "escolha":
                prompt_modulo += f"Opções: {' | '.join(pergunta['opcoes'])}\n"
                prompt_modulo += "Escolha UMA opção e justifique brevemente.\n"

        prompt_modulo += "\nResponda no formato:\n[id_pergunta]: [sua resposta]\n"

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.messages.create(
                    model=MODEL_SONNET,
                    max_tokens=800,
                    system=prompt_sistema,
                    messages=[{"role": "user", "content": prompt_modulo}]
                )

                resposta_texto = response.content[0].text
                respostas_eleitor["respostas"][modulo_key]["raw"] = resposta_texto

                # Parsear respostas
                for pergunta in modulo["perguntas"]:
                    pid = pergunta["id"]
                    # Tentar extrair resposta específica
                    if pid in resposta_texto:
                        # Extrair texto após o ID da pergunta
                        start = resposta_texto.find(pid) + len(pid)
                        end = resposta_texto.find("\n", start + 50) if "\n" in resposta_texto[start+50:] else len(resposta_texto)
                        resposta_extraida = resposta_texto[start:end].strip(": \n")
                        respostas_eleitor["respostas"][modulo_key][pid] = resposta_extraida[:500]

                if verbose:
                    print(f"  ✓ {modulo['titulo']}")
                break  # Sucesso, sai do loop de retry

            except Exception as e:
                if "rate" in str(e).lower() or "overloaded" in str(e).lower():
                    wait_time = (attempt + 1) * 30  # 30s, 60s, 90s
                    print(f"  ⏳ Rate limit, aguardando {wait_time}s...")
                    time.sleep(wait_time)
                elif attempt < max_retries - 1:
                    print(f"  ⚠ Erro (tentativa {attempt+1}): {e}")
                    time.sleep(5)
                else:
                    print(f"  ✗ Erro no {modulo['titulo']}: {e}")
                    respostas_eleitor["respostas"][modulo_key]["erro"] = str(e)

        # Rate limiting entre módulos
        time.sleep(0.3)

    return respostas_eleitor

def selecionar_amostra_estratificada(eleitores, tamanho=150):
    """Seleciona amostra estratificada por RA e orientação política"""

    # Agrupar por orientação política
    por_orientacao = defaultdict(list)
    for e in eleitores:
        por_orientacao[e["orientacao_politica"]].append(e)

    amostra = []

    # Proporção por orientação (baseado na distribuição real)
    proporcoes = {
        "direita": 0.40,
        "esquerda": 0.20,
        "centro_direita": 0.15,
        "centro": 0.15,
        "centro_esquerda": 0.10
    }

    for orientacao, prop in proporcoes.items():
        n = int(tamanho * prop)
        disponivel = por_orientacao.get(orientacao, [])
        if disponivel:
            selecionados = random.sample(disponivel, min(n, len(disponivel)))
            amostra.extend(selecionados)

    # Completar se necessário
    while len(amostra) < tamanho:
        restante = [e for e in eleitores if e not in amostra]
        if restante:
            amostra.append(random.choice(restante))
        else:
            break

    return amostra[:tamanho]

def classificar_resposta(resposta_texto, opcoes):
    """Classifica resposta em uma das opções"""
    resposta_lower = resposta_texto.lower()

    for opcao in opcoes:
        if any(palavra in resposta_lower for palavra in opcao.lower().split()[:3]):
            return opcao

    # Heurísticas específicas
    if "celina" in resposta_lower and ("fico" in resposta_lower or "mantenho" in resposta_lower):
        return opcoes[0] if "Celina" in opcoes[0] else opcoes[0]
    if "arruda" in resposta_lower and "sigo" in resposta_lower:
        return "Sigo Arruda"
    if "anulo" in resposta_lower or "branco" in resposta_lower:
        return [o for o in opcoes if "anulo" in o.lower() or "branco" in o.lower()][0] if any("anulo" in o.lower() or "branco" in o.lower() for o in opcoes) else "Anulo/Branco"

    return "Não classificado"

def analisar_resultados(resultados):
    """Analisa resultados da simulação"""

    analise = {
        "total_entrevistados": len(resultados),
        "modulo_1_fidelidade_arruda": defaultdict(int),
        "modulo_2_elasticidade_moral": defaultdict(int),
        "modulo_3_outsider_fred": defaultdict(int),
        "modulo_4_voto_silencioso": defaultdict(int),
        "segmentacoes": {},
        "citacoes_representativas": []
    }

    # Segmentações
    por_renda = defaultdict(lambda: defaultdict(int))
    por_orientacao = defaultdict(lambda: defaultdict(int))
    por_ra_tipo = defaultdict(lambda: defaultdict(int))  # periferia vs classe alta
    por_idade = defaultdict(lambda: defaultdict(int))

    ras_periferia = ["Ceilândia", "Samambaia", "Recanto das Emas", "Santa Maria", "Estrutural", "Itapoã", "Paranoá", "São Sebastião", "Varjão"]
    ras_classe_alta = ["Lago Sul", "Lago Norte", "Park Way", "Sudoeste/Octogonal", "Noroeste"]

    for r in resultados:
        perfil = r["perfil"]
        respostas = r["respostas"]

        # Classificar RA
        ra = perfil["ra"]
        tipo_ra = "periferia" if ra in ras_periferia else ("classe_alta" if ra in ras_classe_alta else "outros")

        # Classificar idade
        idade = perfil["idade"]
        faixa_idade = "jovem" if idade < 35 else ("adulto" if idade < 55 else "idoso")

        # Classificar renda
        renda = perfil["renda"]
        if "ate_1" in renda or "ate_2" in renda:
            faixa_renda = "baixa"
        elif "ate_5" in renda:
            faixa_renda = "media"
        else:
            faixa_renda = "alta"

        # Módulo 1 - Arruda
        if "modulo_1_fidelidade_arruda" in respostas:
            mod1 = respostas["modulo_1_fidelidade_arruda"]
            raw = mod1.get("raw", "")

            if "celina" in raw.lower() and ("fico" in raw.lower() or "mantenho" in raw.lower()):
                escolha = "Fico com Celina"
            elif "arruda" in raw.lower() and "sigo" in raw.lower():
                escolha = "Sigo Arruda"
            elif "anulo" in raw.lower() or "branco" in raw.lower():
                escolha = "Anulo/Branco"
            else:
                escolha = "Não classificado"

            analise["modulo_1_fidelidade_arruda"][escolha] += 1
            por_renda[faixa_renda]["m1_" + escolha] += 1
            por_orientacao[perfil["orientacao"]]["m1_" + escolha] += 1
            por_ra_tipo[tipo_ra]["m1_" + escolha] += 1

            # Coletar citação
            if len(analise["citacoes_representativas"]) < 20 and raw:
                analise["citacoes_representativas"].append({
                    "modulo": "1_arruda",
                    "perfil": f"{perfil['ra']}, {faixa_renda}, {perfil['orientacao']}",
                    "resposta": raw[:300]
                })

        # Módulo 2 - Rouba mas Faz
        if "modulo_2_elasticidade_moral" in respostas:
            mod2 = respostas["modulo_2_elasticidade_moral"]
            raw = mod2.get("raw", "")

            if "obra" in raw.lower() and "important" in raw.lower():
                escolha = "Obra mais importante"
            elif "corrup" in raw.lower() and ("inaceit" in raw.lower() or "mudo" in raw.lower()):
                escolha = "Corrupção inaceitável"
            elif "depende" in raw.lower():
                escolha = "Depende"
            else:
                escolha = "Não classificado"

            analise["modulo_2_elasticidade_moral"][escolha] += 1
            por_renda[faixa_renda]["m2_" + escolha] += 1
            por_ra_tipo[tipo_ra]["m2_" + escolha] += 1

        # Módulo 3 - Fred Linhares
        if "modulo_3_outsider_fred" in respostas:
            mod3 = respostas["modulo_3_outsider_fred"]
            raw = mod3.get("raw", "")

            if "fred" in raw.lower() and ("sim" in raw.lower() or "prefiro" in raw.lower() or "atrai" in raw.lower()):
                escolha = "Prefere Fred"
            elif "celina" in raw.lower() and ("não" in raw.lower() or "prefiro" in raw.lower() or "gestão" in raw.lower()):
                escolha = "Prefere Celina"
            elif "dividid" in raw.lower():
                escolha = "Dividido"
            else:
                escolha = "Não classificado"

            analise["modulo_3_outsider_fred"][escolha] += 1
            por_ra_tipo[tipo_ra]["m3_" + escolha] += 1
            por_idade[faixa_idade]["m3_" + escolha] += 1

        # Módulo 4 - Voto Silencioso
        if "modulo_4_voto_silencioso" in respostas:
            mod4 = respostas["modulo_4_voto_silencioso"]
            raw = mod4.get("raw", "")

            # P5 - Celina vs PT
            if "celina" in raw.lower() and "pt" in raw.lower() and "barr" in raw.lower():
                escolha_pt = "Vota Celina contra PT"
            elif "pt" in raw.lower() and ("voto" in raw.lower() or "grass" in raw.lower()):
                escolha_pt = "Vota PT"
            elif "anulo" in raw.lower():
                escolha_pt = "Anula"
            else:
                escolha_pt = "Não classificado"

            analise["modulo_4_voto_silencioso"]["vs_pt_" + escolha_pt] += 1

            # P6 - Celina vs Centro
            if "centro" in raw.lower() and ("considero" in raw.lower() or "voto" in raw.lower()):
                escolha_centro = "Considera Centro"
            elif "celina" in raw.lower() and "mantenho" in raw.lower():
                escolha_centro = "Mantém Celina"
            else:
                escolha_centro = "Não classificado"

            analise["modulo_4_voto_silencioso"]["vs_centro_" + escolha_centro] += 1

    analise["segmentacoes"] = {
        "por_renda": dict(por_renda),
        "por_orientacao": dict(por_orientacao),
        "por_tipo_ra": dict(por_ra_tipo),
        "por_idade": dict(por_idade)
    }

    return analise

def gerar_relatorio_opus(client, resultados, analise):
    """Usa Opus 4.5 para gerar análise final aprofundada"""

    prompt_analise = f"""
Você é um cientista político sênior analisando os resultados de uma pesquisa de cenários contrafatuais
sobre Celina Leão (PP) para a eleição de Governador do DF em 2026.

CONTEXTO DA PESQUISA:
- Celina Leão lidera as pesquisas com 38-54% das intenções de voto
- Ela é vice-governadora e sua imagem está associada a José Roberto Arruda
- Principal adversário da esquerda: Leandro Grass (PT)
- Concorrente da direita radical: Fred Linhares (discurso linha dura)

METODOLOGIA:
Usamos 1000 agentes simulados estatisticamente representativos do eleitorado do DF.
Realizamos entrevistas de "Stress Político" com {analise['total_entrevistados']} eleitores para testar:

1. ÍNDICE DE TRANSFERÊNCIA ARRUDA:
   O voto é "propriedade de Celina" ou "empréstimo de Arruda"?
   Resultados: {json.dumps(dict(analise['modulo_1_fidelidade_arruda']), indent=2)}

2. COEFICIENTE DE PRAGMATISMO ("ROUBA MAS FAZ"):
   Qual a tolerância à corrupção em troca de obras?
   Resultados: {json.dumps(dict(analise['modulo_2_elasticidade_moral']), indent=2)}

3. TETO DE VIDRO DA SEGURANÇA:
   Quantos migram para discurso populista de violência (Fred Linhares)?
   Resultados: {json.dumps(dict(analise['modulo_3_outsider_fred']), indent=2)}

4. BARREIRA DO ANTI-PETISMO:
   A vitória é mérito de Celina ou rejeição ao PT?
   Resultados: {json.dumps(dict(analise['modulo_4_voto_silencioso']), indent=2)}

SEGMENTAÇÕES:
{json.dumps(analise['segmentacoes'], indent=2)}

CITAÇÕES REPRESENTATIVAS (amostra):
{json.dumps(analise['citacoes_representativas'][:10], indent=2, ensure_ascii=False)}

=== TAREFA ===

Produza um RELATÓRIO DE INTELIGÊNCIA ELEITORAL completo contendo:

1. **RESUMO EXECUTIVO** (1 parágrafo)
   - Principal descoberta
   - Nível de risco geral para Celina

2. **ÍNDICE DE TRANSFERÊNCIA ARRUDA**
   - Calcule a % de votos que são "propriedade de Celina" vs "empréstimo de Arruda"
   - Avalie: Se >30% seguem Arruda, a liderança é de vidro
   - Recomendação estratégica

3. **COEFICIENTE DE PRAGMATISMO**
   - Analise a tolerância à corrupção por segmento (periferia vs classe alta)
   - Onde a campanha deve focar "Entregas" vs "Compliance/Ética"?

4. **TETO DE VIDRO DA SEGURANÇA**
   - Quantifique a vulnerabilidade ao discurso de Fred Linhares
   - Se >15% migram, segurança é o flanco exposto
   - Recomendação de posicionamento

5. **BARREIRA DO ANTI-PETISMO**
   - Celina é candidata de "voto útil" ou "voto de paixão"?
   - O que acontece se enfrentar candidato de centro (tipo Reguffe)?
   - Risco de derretimento no 2º turno

6. **MAPA DE RISCOS E OPORTUNIDADES**
   - Vulnerabilidades críticas (ordenadas por gravidade)
   - Oportunidades inexploradas
   - Públicos a conquistar vs públicos a blindar

7. **RECOMENDAÇÕES ESTRATÉGICAS**
   - 5 ações prioritárias para a campanha
   - Mensagens-chave por segmento
   - O que NÃO fazer (armadilhas)

8. **CONCLUSÃO**
   - Prognóstico: Celina ganha fácil, ganha apertado, ou há risco real de derrota?

Use linguagem direta, evite jargões acadêmicos. Seja BRUTALMENTE honesto sobre as fraquezas.
"""

    response = client.messages.create(
        model=MODEL_OPUS,
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt_analise}]
    )

    return response.content[0].text

def main():
    """Execução principal"""

    print("=" * 60)
    print("SIMULAÇÃO DE STRESS POLÍTICO - CELINA LEÃO (DF 2026)")
    print("=" * 60)
    print()

    # Verificar API key
    if not ANTHROPIC_API_KEY:
        print("ERRO: ANTHROPIC_API_KEY não encontrada!")
        print("Configure no arquivo .env")
        return

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Carregar eleitores
    print("1. Carregando eleitores...")
    eleitores = carregar_eleitores()
    print(f"   Total disponível: {len(eleitores)}")

    # Selecionar amostra
    print("\n2. Selecionando amostra estratificada...")
    TAMANHO_AMOSTRA = 1000  # Amostra completa
    amostra = selecionar_amostra_estratificada(eleitores, TAMANHO_AMOSTRA)
    print(f"   Amostra selecionada: {len(amostra)} eleitores")

    # Mostrar distribuição da amostra
    dist_orientacao = Counter([e["orientacao_politica"] for e in amostra])
    dist_ra = Counter([e["regiao_administrativa"] for e in amostra])
    print(f"   Distribuição por orientação: {dict(dist_orientacao)}")
    print(f"   Top 5 RAs: {dict(dist_ra.most_common(5))}")

    # Carregar módulos
    modulos = criar_questionario_modulos()

    # Executar entrevistas
    print("\n3. Executando entrevistas (Sonnet 4)...")
    print("   Isso pode levar alguns minutos...\n")

    # Verificar se há resultados anteriores para retomar
    arquivo_parcial = RESULTADOS_DIR / "resultados_parcial.json"
    ids_ja_entrevistados = set()
    resultados = []

    if arquivo_parcial.exists():
        with open(arquivo_parcial, "r", encoding="utf-8") as f:
            resultados = json.load(f)
        ids_ja_entrevistados = {r["id"] for r in resultados}
        print(f"   Retomando de {len(resultados)} entrevistas anteriores...")

    # Filtrar apenas eleitores não entrevistados
    amostra_pendente = [e for e in amostra if e["id"] not in ids_ja_entrevistados]
    print(f"   Pendentes: {len(amostra_pendente)} eleitores\n")

    for i, eleitor in enumerate(amostra_pendente):
        total_feito = len(resultados)
        print(f"[{total_feito+1}/{len(amostra)}] Entrevistando {eleitor['nome']} ({eleitor['regiao_administrativa']})...")

        try:
            resposta = executar_entrevista_eleitor(client, eleitor, modulos, verbose=True)
            resultados.append(resposta)

            # Salvar parcial a cada 5 entrevistas
            if len(resultados) % 5 == 0:
                with open(arquivo_parcial, "w", encoding="utf-8") as f:
                    json.dump(resultados, f, ensure_ascii=False, indent=2)
                progresso = len(resultados) / len(amostra) * 100
                print(f"   [Salvo: {len(resultados)}/{len(amostra)} ({progresso:.1f}%)]\n")

        except Exception as e:
            print(f"   ERRO FATAL: {e}")
            # Salvar antes de continuar
            with open(arquivo_parcial, "w", encoding="utf-8") as f:
                json.dump(resultados, f, ensure_ascii=False, indent=2)
            continue

        # Rate limiting entre eleitores (0.5s para 1000 eleitores)
        time.sleep(0.5)

    # Salvar resultados brutos
    print("\n4. Salvando resultados brutos...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(RESULTADOS_DIR / f"resultados_brutos_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)

    # Analisar resultados
    print("\n5. Analisando resultados...")
    analise = analisar_resultados(resultados)

    with open(RESULTADOS_DIR / f"analise_{timestamp}.json", "w", encoding="utf-8") as f:
        json.dump(analise, f, ensure_ascii=False, indent=2, default=str)

    # Gerar relatório com Opus
    print("\n6. Gerando relatório de inteligência (Opus 4.5)...")
    relatorio = gerar_relatorio_opus(client, resultados, analise)

    with open(RESULTADOS_DIR / f"relatorio_inteligencia_{timestamp}.md", "w", encoding="utf-8") as f:
        f.write(f"# Relatório de Inteligência Eleitoral - Celina Leão (DF 2026)\n\n")
        f.write(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
        f.write(f"Amostra: {len(resultados)} eleitores simulados\n\n")
        f.write("---\n\n")
        f.write(relatorio)

    print("\n" + "=" * 60)
    print("SIMULAÇÃO CONCLUÍDA!")
    print("=" * 60)
    print(f"\nArquivos gerados em: {RESULTADOS_DIR}")
    print(f"- resultados_brutos_{timestamp}.json")
    print(f"- analise_{timestamp}.json")
    print(f"- relatorio_inteligencia_{timestamp}.md")

    print("\n" + "=" * 60)
    print("PRÉVIA DO RELATÓRIO:")
    print("=" * 60)
    print(relatorio[:3000] + "...\n")

    return resultados, analise, relatorio

if __name__ == "__main__":
    main()
