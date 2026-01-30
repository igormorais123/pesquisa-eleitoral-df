# -*- coding: utf-8 -*-
"""
INTEIA - Simulacao Parlamentar: CPI do Banco Master/BRB na CLDF
Simula os 24 deputados distritais decidindo sobre a instalacao da CPI

Autor: INTEIA - Inteligencia Estrategica
Data: Janeiro 2026
"""

import json
import sys
import io
import os
import time
import anthropic
import subprocess
import shutil
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Fix encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuracoes
# Padrao: usar alias do Claude Code (mais moderno). Pode ser sobrescrito via env.
MODELO = os.environ.get("IA_MODELO_ENTREVISTAS") or os.environ.get("MODELO") or "sonnet"
MAX_TOKENS = 1500
ARQUIVO_DEPUTADOS = Path(__file__).parent.parent / "agentes" / "banco-deputados-distritais-df.json"
ARQUIVO_SAIDA = Path(__file__).parent.parent / "memorias" / "pesquisas_parlamentares" / f"cpi_banco_master_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

# Contexto da CPI para o prompt
CONTEXTO_CPI = """
## CONTEXTO FACTUAL - CPI DO BANCO MASTER/BRB NA CLDF (Janeiro 2026)

### Cronologia dos fatos:
1. **Marco 2025**: BRB (Banco de Brasilia, estatal do GDF) anuncia intencao de comprar 58% do Banco Master por ~R$2 bilhoes
2. **Agosto 2025**: CLDF aprova em sessao unica e regime de urgencia o PL 1882/2025 autorizando a compra (14 votos a favor x 7 contra)
3. **Setembro 2025**: Banco Central REJEITA a operacao por irregularidades e riscos excessivos nos ativos do Master
4. **Novembro 2025**: Banco Central decreta liquidacao extrajudicial do Banco Master
5. **Novembro 2025**: PF deflagra Operacao Compliance Zero - prende Daniel Vorcaro (dono do Master) e afasta presidente do BRB Paulo Henrique Costa
6. **Novembro 2025**: Investigacoes revelam esquema de ate R$17 bilhoes em fraudes - carteiras de credito ficticias
7. **Novembro 2025**: BRB teria repassado R$12 bilhoes ao Master em operacoes sem lastro
8. **Novembro 2025**: Oposicao protocola requerimento de CPI na CLDF - consegue 7 assinaturas (falta 1 para as 8 necessarias)
9. **Janeiro 2026**: CVM torna reus governo do DF e chefe de gabinete de Ibaneis
10. **Janeiro 2026**: Oposicao pede impeachment de Ibaneis Rocha (MDB) no STJ
11. **Janeiro 2026**: Celular de Vorcaro apreendido causa temor em Brasilia - revelar rede de politicos
12. **Janeiro 2026**: Deputados aliados de Ibaneis sao pressionados pela opiniao publica

### Atores principais:
- **Governador Ibaneis Rocha (MDB)**: Defendeu a compra, esta sendo investigado, reus na CVM
- **Daniel Vorcaro**: CEO do Master, preso na Operacao Compliance Zero
- **Paulo Henrique Costa**: Ex-presidente do BRB, afastado judicialmente
- **Wellington Luiz (MDB)**: Presidente da CLDF, aliado de Ibaneis, controla pauta da Casa
- **Bancada PT/PSOL/PSB**: Lideraram oposicao, protocolaram CPI

### Sobre a CPI na CLDF:
- Necessarias 8 assinaturas (1/3 dos 24 deputados) para protocolar
- Atualmente 7 assinaturas confirmadas (PT, PSOL, PSB + Paula Belmonte)
- Falta 1 assinatura para instalacao
- Regimento limita a 2 CPIs simultaneas - ja existe CPI do Rio Melchior
- Presidente Wellington Luiz (MDB) controla a pauta e pode retardar
- CPI investigaria: aprovacao da compra, carteiras ficticias, favorecimentos, papel do GDF

### Votacao do PL da compra em agosto 2025:
- **A FAVOR (14)**: Doutora Jane, Eduardo Pedrosa, Hermeto, Iolando, Jaqueline Silva, Joao Cardoso, Jorge Vianna, Martins Machado, Pastor Daniel de Castro, Pepa, Thiago Manzoni, Wellington Luiz + 2 outros
- **CONTRA (7)**: Chico Vigilante, Dayse Amarilio, Fabio Felix, Gabriel Magno, Max Maciel, Paula Belmonte, Ricardo Vale
"""

PERGUNTA_CPI = """
Considerando TODOS os fatos acima e o momento politico atual (janeiro de 2026), responda como este deputado distrital responderia:

**PERGUNTA**: "Deputado(a), o(a) senhor(a) assinaria o requerimento para instalacao da CPI do Banco Master/BRB na CLDF? Justifique sua posicao."

Voce DEVE responder EM PRIMEIRA PESSOA, como se fosse o deputado, considerando:
1. Seu partido e orientacao politica
2. Sua relacao com o governo Ibaneis Rocha
3. Seu historico de votacao (votou a favor ou contra a compra do Master em agosto)
4. Seus interesses eleitorais para 2026
5. Pressao da opiniao publica apos a Operacao Compliance Zero
6. Possibilidade de ser associado a um escandalo se nao apoiar a investigacao
7. Risco politico de romper com a base do governo

FORMATO OBRIGATORIO da resposta:
---
POSICAO: [ASSINA_CPI | NAO_ASSINA | INDECISO]
INTENSIDADE: [1-10] (1=resistencia total, 5=neutro, 10=apoio entusiastico)
JUSTIFICATIVA: [2-3 paragrafos em primeira pessoa, como o deputado falaria]
CONDICOES: [Se houver condicoes para mudar de posicao, liste-as]
RISCO_POLITICO: [ALTO | MEDIO | BAIXO] - risco que o deputado corre com essa posicao
---
"""


def carregar_deputados():
    """Carrega todos os 24 deputados do JSON"""
    with open(ARQUIVO_DEPUTADOS, 'r', encoding='utf-8') as f:
        deputados = json.load(f)
    print(f"[OK] {len(deputados)} deputados carregados")
    return deputados


def construir_prompt_deputado(dep):
    """Constroi o prompt personalizado para cada deputado"""
    # Determinar se votou a favor ou contra a compra
    votou_contra = dep['nome_parlamentar'] in [
        'Chico Vigilante', 'Dayse Amarilio', 'Fabio Felix', 'Fábio Felix',
        'Gabriel Magno', 'Max Maciel', 'Paula Belmonte', 'Ricardo Vale'
    ]
    voto_agosto = "CONTRA a compra do Master pelo BRB" if votou_contra else "A FAVOR da compra do Master pelo BRB"

    # Ja assinou o requerimento?
    ja_assinou = dep['nome_parlamentar'] in [
        'Fabio Felix', 'Fábio Felix', 'Chico Vigilante', 'Gabriel Magno',
        'Ricardo Vale', 'Max Maciel', 'Dayse Amarilio', 'Paula Belmonte'
    ]
    status_assinatura = "JA ASSINOU o requerimento de CPI" if ja_assinou else "AINDA NAO assinou o requerimento"

    persona = f"""
Voce e {dep['nome_parlamentar']} ({dep['partido']}), deputado(a) distrital do Distrito Federal.

## PERFIL COMPLETO:
- Nome: {dep.get('nome', '')}
- Partido: {dep['partido']}
- Idade: {dep.get('idade', 'N/A')}
- Orientacao politica: {dep.get('orientacao_politica', 'N/A')}
- Relacao com governo Ibaneis: {dep.get('relacao_governo_atual', 'N/A')}
- Posicao sobre Bolsonaro: {dep.get('posicao_bolsonaro', 'N/A')}
- Posicao sobre Lula: {dep.get('posicao_lula', 'N/A')}
- Temas de atuacao: {', '.join(dep.get('temas_atuacao', []))}
- Base eleitoral: {dep.get('base_eleitoral', 'N/A')}
- Comissoes: {', '.join(dep.get('comissoes_atuais', []))}
- Votos na eleicao: {dep.get('votos_eleicao', 'N/A')}
- Estilo de comunicacao: {dep.get('estilo_comunicacao', 'N/A')}
- Valores: {', '.join(dep.get('valores', []))}
- Preocupacoes: {', '.join(dep.get('preocupacoes', []))}
- Historia: {dep.get('historia_resumida', 'N/A')}
- Instrucao comportamental: {dep.get('instrucao_comportamental', 'N/A')}
- Motivacao primaria: {dep.get('motivacao_primaria', 'N/A')}
- Capital politico: {dep.get('capital_politico', 'N/A')}
- Influencia no partido: {dep.get('influencia_no_partido', 'N/A')}
- Resiliencia a crises: {dep.get('resiliencia_crises', 'N/A')}
- Tendencia ao populismo: {dep.get('tendencia_populismo', 'N/A')}

## SEU HISTORICO NESTE CASO:
- Em agosto 2025, voce votou: {voto_agosto}
- Status atual do requerimento de CPI: {status_assinatura}
- Religiao: {dep.get('religiao', 'N/A')}
"""
    return persona


def _call_claude_code(prompt: str, modelo: str) -> tuple[str, int, int]:
    """Chama Claude Code CLI (assinatura) e retorna (texto, in_tokens, out_tokens)."""

    claude_bin = os.environ.get("CLAUDE_CODE_BIN", "claude")
    if not shutil.which(claude_bin):
        raise RuntimeError(f"Claude Code CLI nao encontrado no PATH: '{claude_bin}'")

    cmd = [
        claude_bin,
        "-p",
        "--output-format",
        "json",
        "--model",
        modelo,
        "--tools",
        "",
        prompt,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    out = (proc.stdout or "").strip()
    data = json.loads(out) if out else {}
    if data.get("is_error"):
        raise RuntimeError(data.get("result") or "Erro ao chamar Claude Code")

    usage = data.get("usage") or {}
    return str(data.get("result", "")), int(usage.get("input_tokens", 0) or 0), int(
        usage.get("output_tokens", 0) or 0
    )


def simular_deputado(client, dep, provider: str):
    """Executa simulacao para um deputado via Claude (CLI ou API)."""
    persona = construir_prompt_deputado(dep)
    nome = dep['nome_parlamentar']
    partido = dep['partido']

    print(f"  Simulando {nome} ({partido})...", end=" ", flush=True)

    try:
        system = (
            "Voce e um ator politico simulando fielmente o comportamento do deputado distrital descrito abaixo. "
            "Responda EXATAMENTE como este politico responderia, considerando fatores politicos, eleitorais e pessoais.\n\n"
            f"{persona}"
        )
        user = f"{CONTEXTO_CPI}\n\n{PERGUNTA_CPI}"

        if provider == "claude_code":
            prompt = f"SISTEMA:\n{system}\n\nUSUARIO:\n{user}"
            resposta_texto, tokens_entrada, tokens_saida = _call_claude_code(prompt, MODELO)
        else:
            response = client.messages.create(
                model=MODELO,
                max_tokens=MAX_TOKENS,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
            resposta_texto = response.content[0].text
            tokens_entrada = response.usage.input_tokens
            tokens_saida = response.usage.output_tokens

        # Extrair campos estruturados
        resultado = extrair_campos(resposta_texto)
        resultado['nome_parlamentar'] = nome
        resultado['partido'] = partido
        resultado['id'] = dep['id']
        resultado['orientacao_politica'] = dep.get('orientacao_politica', '')
        resultado['relacao_governo'] = dep.get('relacao_governo_atual', '')
        resultado['resposta_completa'] = resposta_texto
        resultado['tokens_entrada'] = tokens_entrada
        resultado['tokens_saida'] = tokens_saida

        posicao = resultado.get('posicao', 'INDECISO')
        intensidade = resultado.get('intensidade', '?')
        print(f"-> {posicao} (intensidade: {intensidade})")

        return resultado

    except Exception as e:
        print(f"ERRO: {str(e)}")
        return {
            'nome_parlamentar': nome,
            'partido': partido,
            'id': dep['id'],
            'orientacao_politica': dep.get('orientacao_politica', ''),
            'relacao_governo': dep.get('relacao_governo_atual', ''),
            'posicao': 'ERRO',
            'intensidade': 0,
            'resposta_completa': f'Erro: {str(e)}',
            'tokens_entrada': 0,
            'tokens_saida': 0
        }


def extrair_campos(texto):
    """Extrai campos estruturados da resposta"""
    resultado = {
        'posicao': 'INDECISO',
        'intensidade': 5,
        'justificativa': '',
        'condicoes': '',
        'risco_politico': 'MEDIO'
    }

    linhas = texto.split('\n')
    for linha in linhas:
        linha_upper = linha.strip().upper()
        if linha_upper.startswith('POSICAO:') or linha_upper.startswith('POSIÇÃO:'):
            valor = linha.split(':', 1)[1].strip().upper()
            if 'ASSINA' in valor and 'NAO' not in valor and 'NÃO' not in valor:
                resultado['posicao'] = 'ASSINA_CPI'
            elif 'NAO' in valor or 'NÃO' in valor:
                resultado['posicao'] = 'NAO_ASSINA'
            else:
                resultado['posicao'] = 'INDECISO'
        elif linha_upper.startswith('INTENSIDADE:'):
            try:
                valor = linha.split(':', 1)[1].strip()
                # Extrair numero
                num = ''.join(c for c in valor.split('/')[0].split('(')[0] if c.isdigit())
                if num:
                    resultado['intensidade'] = int(num)
            except:
                resultado['intensidade'] = 5
        elif linha_upper.startswith('JUSTIFICATIVA:'):
            resultado['justificativa'] = linha.split(':', 1)[1].strip()
        elif linha_upper.startswith('CONDICOES:') or linha_upper.startswith('CONDIÇÕES:'):
            resultado['condicoes'] = linha.split(':', 1)[1].strip()
        elif linha_upper.startswith('RISCO_POLITICO:') or linha_upper.startswith('RISCO POLITICO:') or linha_upper.startswith('RISCO POLÍTICO:'):
            valor = linha.split(':', 1)[1].strip().upper()
            if 'ALTO' in valor:
                resultado['risco_politico'] = 'ALTO'
            elif 'BAIXO' in valor:
                resultado['risco_politico'] = 'BAIXO'
            else:
                resultado['risco_politico'] = 'MEDIO'

    # Capturar justificativa completa (tudo entre JUSTIFICATIVA e CONDICOES)
    if 'JUSTIFICATIVA' in texto.upper():
        try:
            inicio = texto.upper().index('JUSTIFICATIVA')
            fim_markers = ['CONDICOES:', 'CONDIÇÕES:', 'RISCO_POLITICO:', 'RISCO POLITICO:', 'RISCO POLÍTICO:', '---']
            fim = len(texto)
            for marker in fim_markers:
                idx = texto.upper().find(marker.upper(), inicio + 15)
                if idx != -1 and idx < fim:
                    fim = idx
            justificativa = texto[inicio:fim].split(':', 1)
            if len(justificativa) > 1:
                resultado['justificativa'] = justificativa[1].strip()
        except:
            pass

    return resultado


def calcular_probabilidades(resultados):
    """Calcula probabilidades da CPI ser instalada"""
    total = len(resultados)
    assina = sum(1 for r in resultados if r['posicao'] == 'ASSINA_CPI')
    nao_assina = sum(1 for r in resultados if r['posicao'] == 'NAO_ASSINA')
    indecisos = sum(1 for r in resultados if r['posicao'] == 'INDECISO')
    erros = sum(1 for r in resultados if r['posicao'] == 'ERRO')

    # CPI precisa de 8 assinaturas (1/3 de 24)
    ASSINATURAS_NECESSARIAS = 8

    # Cenario otimista: todos indecisos assinam
    cenario_otimista = assina + indecisos

    # Cenario pessimista: nenhum indeciso assina
    cenario_pessimista = assina

    # Cenario base: metade dos indecisos assina
    cenario_base = assina + (indecisos // 2)

    # Probabilidade baseada na intensidade media dos indecisos
    intensidades_indecisos = [r['intensidade'] for r in resultados if r['posicao'] == 'INDECISO']
    prob_indeciso_assinar = sum(i for i in intensidades_indecisos) / (len(intensidades_indecisos) * 10) if intensidades_indecisos else 0

    # Probabilidade calculada
    assinaturas_esperadas = assina + (indecisos * prob_indeciso_assinar)
    prob_cpi = min(100, max(0, (assinaturas_esperadas / ASSINATURAS_NECESSARIAS) * 100))

    # Evitar probabilidades absolutas por padrao (0%/100% quase sempre sao ilusao de modelo)
    evitar_absoluto = os.environ.get("IA_EVITAR_PROB_ABSOLUTA", "true").lower() in ("1", "true", "yes")
    try:
        eps = float(os.environ.get("IA_PROB_EPSILON", "1"))
    except ValueError:
        eps = 1.0

    if evitar_absoluto:
        if prob_cpi <= 0:
            prob_cpi = eps
        elif prob_cpi >= 100:
            prob_cpi = max(0.0, 100.0 - eps)

    return {
        'total_deputados': total,
        'assinam': assina,
        'nao_assinam': nao_assina,
        'indecisos': indecisos,
        'erros': erros,
        'necessarias': ASSINATURAS_NECESSARIAS,
        'cenario_otimista': cenario_otimista,
        'cenario_pessimista': cenario_pessimista,
        'cenario_base': cenario_base,
        'prob_indeciso_assinar': round(prob_indeciso_assinar * 100, 1),
        'assinaturas_esperadas': round(assinaturas_esperadas, 1),
        'probabilidade_cpi': round(prob_cpi, 1),
        'cpi_instalada_otimista': cenario_otimista >= ASSINATURAS_NECESSARIAS,
        'cpi_instalada_pessimista': cenario_pessimista >= ASSINATURAS_NECESSARIAS,
        'cpi_instalada_base': cenario_base >= ASSINATURAS_NECESSARIAS
    }


def gerar_mapa_calor_por_partido(resultados):
    """Gera dados para mapa de calor por partido"""
    partidos = defaultdict(list)
    for r in resultados:
        partidos[r['partido']].append(r)

    mapa = {}
    for partido, deps in partidos.items():
        intensidades = [d['intensidade'] for d in deps]
        posicoes = [d['posicao'] for d in deps]
        mapa[partido] = {
            'deputados': len(deps),
            'intensidade_media': round(sum(intensidades) / len(intensidades), 1),
            'assinam': sum(1 for p in posicoes if p == 'ASSINA_CPI'),
            'nao_assinam': sum(1 for p in posicoes if p == 'NAO_ASSINA'),
            'indecisos': sum(1 for p in posicoes if p == 'INDECISO'),
            'membros': [{'nome': d['nome_parlamentar'], 'posicao': d['posicao'], 'intensidade': d['intensidade']} for d in deps]
        }
    return mapa


def gerar_relatorio_html(resultados, probabilidades, mapa_partido):
    """Gera relatorio HTML completo com mapa de calor"""
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")

    # Ordenar resultados por intensidade
    resultados_ordenados = sorted(resultados, key=lambda x: x['intensidade'], reverse=True)

    # Partidos ordenados por intensidade media
    partidos_ordenados = sorted(mapa_partido.items(), key=lambda x: x[1]['intensidade_media'], reverse=True)

    # Gerar linhas da tabela de deputados
    linhas_deputados = ""
    for r in resultados_ordenados:
        posicao = r['posicao']
        cor_posicao = '#22c55e' if posicao == 'ASSINA_CPI' else '#ef4444' if posicao == 'NAO_ASSINA' else '#eab308'
        emoji_posicao = '&#x2705;' if posicao == 'ASSINA_CPI' else '&#x274C;' if posicao == 'NAO_ASSINA' else '&#x2753;'
        label_posicao = 'ASSINA' if posicao == 'ASSINA_CPI' else 'NAO ASSINA' if posicao == 'NAO_ASSINA' else 'INDECISO'
        intensidade = r['intensidade']

        # Cor da barra de intensidade
        if intensidade >= 7:
            cor_barra = '#22c55e'
        elif intensidade >= 4:
            cor_barra = '#eab308'
        else:
            cor_barra = '#ef4444'

        risco = r.get('risco_politico', 'MEDIO')
        cor_risco = '#ef4444' if risco == 'ALTO' else '#eab308' if risco == 'MEDIO' else '#22c55e'

        linhas_deputados += f"""
        <tr>
            <td style="font-weight:600;">{r['nome_parlamentar']}</td>
            <td><span style="background:{cor_posicao}20;color:{cor_posicao};padding:2px 8px;border-radius:4px;font-weight:600;">{emoji_posicao} {label_posicao}</span></td>
            <td>{r['partido']}</td>
            <td>
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:60px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
                        <div style="width:{intensidade*10}%;height:100%;background:{cor_barra};border-radius:4px;"></div>
                    </div>
                    <span style="font-weight:600;">{intensidade}/10</span>
                </div>
            </td>
            <td>{r.get('orientacao_politica', '').replace('_', ' ').title()}</td>
            <td>{r.get('relacao_governo', '').replace('_', ' ').title()}</td>
            <td><span style="background:{cor_risco}20;color:{cor_risco};padding:2px 6px;border-radius:4px;font-size:11px;">{risco}</span></td>
        </tr>"""

    # Gerar mapa de calor por partido
    celulas_mapa = ""
    for partido, dados in partidos_ordenados:
        intensidade = dados['intensidade_media']
        # Cor do mapa de calor: verde=pro-CPI, vermelho=contra-CPI
        if intensidade >= 7:
            bg = f'rgba(34, 197, 94, {intensidade/10})'
            txt = '#fff' if intensidade > 8 else '#166534'
        elif intensidade >= 4:
            bg = f'rgba(234, 179, 8, {intensidade/10})'
            txt = '#713f12'
        else:
            bg = f'rgba(239, 68, 68, {max(0.3, (10-intensidade)/10)})'
            txt = '#fff' if intensidade < 3 else '#991b1b'

        membros_html = ""
        for m in dados['membros']:
            emoji = '&#x2705;' if m['posicao'] == 'ASSINA_CPI' else '&#x274C;' if m['posicao'] == 'NAO_ASSINA' else '&#x2753;'
            membros_html += f"<div style='font-size:11px;margin:2px 0;'>{emoji} {m['nome']} ({m['intensidade']}/10)</div>"

        celulas_mapa += f"""
        <div style="background:{bg};color:{txt};padding:16px;border-radius:12px;min-width:180px;text-align:center;">
            <div style="font-size:24px;font-weight:800;">{partido}</div>
            <div style="font-size:36px;font-weight:800;margin:4px 0;">{intensidade}</div>
            <div style="font-size:11px;opacity:0.8;">intensidade media</div>
            <div style="font-size:13px;margin-top:8px;">
                <span style="color:#22c55e;">&#x2705; {dados['assinam']}</span> |
                <span style="color:#ef4444;">&#x274C; {dados['nao_assinam']}</span> |
                <span style="color:#eab308;">&#x2753; {dados['indecisos']}</span>
            </div>
            <div style="margin-top:8px;text-align:left;border-top:1px solid rgba(255,255,255,0.2);padding-top:8px;">
                {membros_html}
            </div>
        </div>"""

    # Gerar indicador de probabilidade
    prob = probabilidades['probabilidade_cpi']
    cor_prob = '#22c55e' if prob >= 70 else '#eab308' if prob >= 40 else '#ef4444'
    label_prob = 'PROVAVEL' if prob >= 70 else ('INCERTA' if prob >= 40 else 'IMPROVAVEL')
    label_prob_assinaturas = 'CERTA (NO MODELO)' if probabilidades['cenario_pessimista'] >= probabilidades['necessarias'] else label_prob

    # Cards de cenarios
    def card_cenario(titulo, valor, necessario, emoji):
        instalada = valor >= necessario
        cor = '#22c55e' if instalada else '#ef4444'
        return f"""
        <div style="background:#1e293b;padding:20px;border-radius:12px;text-align:center;border:2px solid {cor};">
            <div style="font-size:14px;color:#94a3b8;">{emoji} {titulo}</div>
            <div style="font-size:36px;font-weight:800;color:{cor};margin:8px 0;">{valor}/{necessario}</div>
            <div style="font-size:13px;color:{cor};font-weight:600;">{'&#x2705; CPI INSTALADA' if instalada else '&#x274C; CPI NAO INSTALADA'}</div>
        </div>"""

    # Gerar respostas completas
    respostas_html = ""
    for r in resultados_ordenados:
        posicao = r['posicao']
        cor = '#22c55e' if posicao == 'ASSINA_CPI' else '#ef4444' if posicao == 'NAO_ASSINA' else '#eab308'
        resposta = r.get('resposta_completa', '').replace('\n', '<br>')
        respostas_html += f"""
        <div style="background:#1e293b;border-radius:12px;padding:20px;margin-bottom:16px;border-left:4px solid {cor};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h3 style="margin:0;color:#f8fafc;font-size:16px;">{r['nome_parlamentar']} ({r['partido']})</h3>
                <span style="background:{cor}20;color:{cor};padding:4px 12px;border-radius:6px;font-weight:700;font-size:13px;">
                    {posicao.replace('_', ' ')} | {r['intensidade']}/10
                </span>
            </div>
            <div style="color:#94a3b8;font-size:13px;line-height:1.6;">{resposta}</div>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INTEIA | Simulacao CPI Banco Master/BRB - CLDF</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 24px; }}
        .hero {{
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            text-align: center;
        }}
        .logo-box {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px; height: 48px;
            background: linear-gradient(135deg, #d69e2e, #b7791f);
            border-radius: 12px;
            font-weight: 900;
            font-size: 18px;
            color: #0f172a;
            margin-bottom: 12px;
        }}
        .badge {{
            display: inline-block;
            background: #ef444420;
            color: #ef4444;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }}
        h1 {{ font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }}
        h2 {{
            font-size: 20px; font-weight: 700; margin-bottom: 16px;
            padding-bottom: 8px; border-bottom: 2px solid #d69e2e;
        }}
        .subtitle {{ color: #94a3b8; font-size: 14px; }}
        .grid2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }}
        .grid3 {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }}
        .grid4 {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }}
        .card {{
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 20px;
        }}
        .kpi {{ text-align: center; }}
        .kpi .number {{ font-size: 36px; font-weight: 800; }}
        .kpi .label {{ font-size: 12px; color: #94a3b8; margin-top: 4px; }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }}
        th {{
            background: #334155;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
        }}
        td {{
            padding: 10px 12px;
            border-bottom: 1px solid #1e293b;
        }}
        tr:hover {{ background: #1e293b80; }}
        .prob-meter {{
            width: 100%;
            height: 24px;
            background: #334155;
            border-radius: 12px;
            overflow: hidden;
            margin: 16px 0;
        }}
        .prob-fill {{
            height: 100%;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            transition: width 1s ease;
        }}
        .mapa-calor {{
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
        }}
        .section {{ margin-bottom: 32px; }}
        .insight-box {{
            background: linear-gradient(135deg, #d69e2e15, #b7791f15);
            border: 1px solid #d69e2e40;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }}
        .insight-box h3 {{
            color: #d69e2e;
            font-size: 16px;
            margin-bottom: 12px;
        }}
        .footer {{
            text-align: center;
            padding: 24px;
            color: #475569;
            font-size: 11px;
            border-top: 1px solid #1e293b;
            margin-top: 48px;
        }}

        /* UX helpers */
        .respostas-section {{ display: none; }}
        body.show-respostas .respostas-section {{ display: block; }}
        ul.clean {{
            margin: 10px 0 0 18px;
            color: #cbd5e1;
            font-size: 13px;
        }}
        ul.clean li {{ margin: 6px 0; }}
        a.inline-link {{ color: #d69e2e; text-decoration: none; border-bottom: 1px solid #d69e2e40; }}
        a.inline-link:hover {{ border-bottom-color: #d69e2e; }}
        .toolbar {{
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 14px;
        }}
        .btn {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #1e293b;
            border: 1px solid #334155;
            color: #e2e8f0;
            padding: 8px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }}
        .btn:hover {{ border-color: #d69e2e70; }}
        .btn.primary {{ background: linear-gradient(135deg, #d69e2e25, #b7791f25); border-color: #d69e2e40; }}

        /* Mobile */
        @media (max-width: 960px) {{
            .grid4 {{ grid-template-columns: 1fr 1fr; }}
            .grid3 {{ grid-template-columns: 1fr; }}
            .grid2 {{ grid-template-columns: 1fr; }}
            .container {{ padding: 16px; }}
        }}
        @media (max-width: 520px) {{
            .grid4 {{ grid-template-columns: 1fr; }}
            h1 {{ font-size: 22px; }}
        }}

        @media print {{
            @page {{ size: A4 landscape; margin: 5mm; }}
            * {{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }}
            body {{ background: #fff !important; color: #0f172a !important; font-size: 7pt !important; }}
            .container {{ padding: 0 !important; }}
            .respostas-section {{ display: none !important; }}
            .card {{ background: #f8fafc !important; border: 0.5pt solid #e2e8f0 !important; }}
            th {{ background: #e2e8f0 !important; color: #0f172a !important; }}
            .hero {{ background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- HERO -->
        <div class="hero">
            <div class="logo-box">IA</div>
            <div style="font-size:18px;font-weight:800;">INTE<span style="color:#d69e2e;">IA</span></div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:16px;">Inteligencia Estrategica</div>
            <div class="badge">CONFIDENCIAL - SIMULACAO IA</div>
            <h1>CPI do Banco Master/BRB</h1>
            <div class="subtitle">Simulacao Parlamentar com Agentes IA - 24 Deputados Distritais da CLDF</div>
            <div style="color:#64748b;font-size:12px;margin-top:8px;">{timestamp} | Modelo: {MODELO}</div>

            <div class="toolbar">
                <button id="toggle-respostas" class="btn">Mostrar respostas completas</button>
                <a class="btn primary" href="#verificacao">Checagem factual</a>
                <a class="btn" href="#conexoes">Conectar com outros estudos</a>
            </div>
        </div>

        <!-- CONCLUSAO PRINCIPAL -->
        <div style="background:#ef444420;border:2px solid #ef4444;border-radius:12px;padding:24px;margin-bottom:24px;">
            <h2 style="color:#ef4444;border:none;padding:0;margin-bottom:8px;">Conclusao Principal (leitura correta)</h2>
            <p style="font-size:16px;font-weight:600;">
                No modelo: probabilidade de atingir o minimo de assinaturas: <span style="color:{cor_prob};font-size:24px;">{prob}%</span>
                <span style="background:{cor_prob}20;color:{cor_prob};padding:2px 8px;border-radius:4px;margin-left:8px;font-size:13px;">{label_prob_assinaturas}</span>
            </p>
            <p style="color:#94a3b8;margin-top:8px;">
                {probabilidades['assinam']} assinam | {probabilidades['nao_assinam']} nao assinam | {probabilidades['indecisos']} indecisos | Minimo regimental: {probabilidades['necessarias']} assinaturas (1/3)
            </p>
            <p style="color:#cbd5e1;margin-top:10px;font-size:13px;">
                Observacao: instalacao efetiva pode sofrer atraso por pauta/regimento (limite de CPIs simultaneas) mesmo com assinaturas.
            </p>
        </div>

        <div class="card" id="conexoes" style="margin-bottom:24px;">
            <h2>Conexoes com Outros Estudos (interno)</h2>
            <ul class="clean">
                <li><a class="inline-link" href="../../frontend/public/relatorios/INTEIA_Ibaneis_Celina_2026.html">Relatorio Executivo: Ibaneis x Celina (BRB/Master)</a> (efeitos eleitorais, timeline e riscos juridicos)</li>
                <li><a class="inline-link" href="../../frontend/public/caso-brb-master/index.html">Dashboard: Caso BRB-Master 2026 (HELENA)</a> (cenarios e probabilidades a priori)</li>
                <li><a class="inline-link" href="../../frontend/public/analise/casomaster/index.html">Analise Estrategica (casomaster)</a> (kanban, paradoxos e hipoteses)</li>
            </ul>
        </div>

        <div class="card" id="verificacao" style="margin-bottom:24px;">
            <h2>Checagem Factual e Inconsistencias (o que requer validacao externa)</h2>
            <ul class="clean">
                <li><strong>"100%" nao e probabilidade empirica:</strong> e um resultado do proprio modelo (assinaturas > minimo). Para o mundo real, precisa de evidencias (assinaturas publicas/decl. formais).</li>
                <li><strong>Risco de atraso/regimento:</strong> o texto cita limite de CPIs simultaneas; isso pode afetar instalacao mesmo com assinaturas. Aqui o barometro mede "assinaturas".</li>
                <li><strong>Votacao de agosto/2025:</strong> checar lista nominal completa (quem votou a favor/contra) e datas oficiais.</li>
                <li><strong>Valores (R$ 17 bi / R$ 12 bi / R$ 2 bi):</strong> tratar como dado externo que precisa de fonte primaria/reportagem especifica.</li>
                <li><strong>Cargos e papeis individuais:</strong> validar composicao de comissoes e funcoes (Mesa/CCJ/etc) na data.</li>
            </ul>
            <div style="margin-top:12px;color:#94a3b8;font-size:12px;">
                Dica: ao anexar links oficiais/reportagens, esta secao pode virar uma tabela "afirmacao → fonte → status (confirmado/duvidoso)".
            </div>
        </div>

        <!-- KPIs -->
        <div class="grid4">
            <div class="card kpi">
                <div class="number" style="color:#d69e2e;">{probabilidades['assinam']}</div>
                <div class="label">Assinam a CPI</div>
            </div>
            <div class="card kpi">
                <div class="number" style="color:#ef4444;">{probabilidades['nao_assinam']}</div>
                <div class="label">Nao Assinam</div>
            </div>
            <div class="card kpi">
                <div class="number" style="color:#eab308;">{probabilidades['indecisos']}</div>
                <div class="label">Indecisos</div>
            </div>
            <div class="card kpi">
                <div class="number" style="color:{cor_prob};">{prob}%</div>
                <div class="label">Prob. Assinaturas (modelo)</div>
            </div>
        </div>

        <!-- BARRA DE PROBABILIDADE -->
        <div class="card" style="margin-bottom:24px;">
            <h2>Barometro (assinar o requerimento)</h2>
            <div class="prob-meter">
                <div class="prob-fill" style="width:{prob}%;background:linear-gradient(90deg,{cor_prob},{cor_prob}aa);">
                    {prob}%
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
                <span>0% - Impossivel</span>
                <span style="color:#ef4444;">|</span>
                <span>Necessario: 8 assinaturas (33%)</span>
                <span style="color:#eab308;">|</span>
                <span>100% - Certa</span>
            </div>
        </div>

        <!-- CENARIOS -->
        <div class="section">
            <h2>Cenarios de Instalacao (risco de atraso)</h2>
            <div class="grid3">
                <div style="background:#1e293b;padding:20px;border-radius:12px;text-align:center;border:2px solid #22c55e;">
                    <div style="font-size:14px;color:#94a3b8;">&#x1F7E2; Instalacao Rapida</div>
                    <div style="font-size:28px;font-weight:800;color:#22c55e;margin:8px 0;">Assinaturas sobrando</div>
                    <div style="font-size:13px;color:#cbd5e1;font-weight:600;">Pauta libera / pressao publica alta</div>
                </div>

                <div style="background:#1e293b;padding:20px;border-radius:12px;text-align:center;border:2px solid #eab308;">
                    <div style="font-size:14px;color:#94a3b8;">&#x1F7E1; Instalacao Atrasada</div>
                    <div style="font-size:28px;font-weight:800;color:#eab308;margin:8px 0;">Risco regimental</div>
                    <div style="font-size:13px;color:#cbd5e1;font-weight:600;">Limite de CPIs / manobra de pauta</div>
                </div>

                <div style="background:#1e293b;padding:20px;border-radius:12px;text-align:center;border:2px solid #ef4444;">
                    <div style="font-size:14px;color:#94a3b8;">&#x1F534; Nao Instalada (janela)</div>
                    <div style="font-size:28px;font-weight:800;color:#ef4444;margin:8px 0;">Custo politico</div>
                    <div style="font-size:13px;color:#cbd5e1;font-weight:600;">Atrasos ate perder timing eleitoral</div>
                </div>
            </div>
        </div>

        <!-- MAPA DE CALOR POR PARTIDO -->
        <div class="section">
            <h2>Mapa de Calor por Partido</h2>
            <p style="color:#94a3b8;font-size:13px;margin-bottom:16px;">Intensidade media de apoio a CPI (1=contra, 10=a favor)</p>
            <div class="mapa-calor">
                {celulas_mapa}
            </div>
        </div>

        <!-- TABELA DE DEPUTADOS -->
        <div class="section">
            <h2>Posicao Individual dos 24 Deputados</h2>
            <div class="card" style="overflow-x:auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Deputado</th>
                            <th>Posicao</th>
                            <th>Partido</th>
                            <th>Intensidade</th>
                            <th>Orientacao</th>
                            <th>Rel. Governo</th>
                            <th>Risco</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas_deputados}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- INSIGHTS EXCLUSIVOS -->
        <div class="section">
            <h2>Insights Exclusivos INTEIA</h2>

            <div class="insight-box">
                <h3>&#x1F50D; O que ninguem esta vendo: A Chave e o MDB</h3>
                <p>A narrativa publica foca na oposicao (PT/PSOL) vs base do governo. Mas a chave real esta DENTRO do MDB.
                O partido tem 5 deputados na CLDF e Wellington Luiz, como presidente da Casa, e o verdadeiro gatilho.
                Se o escandalo continuar crescendo e ameacar as pretensoes de Ibaneis ao Senado em 2026,
                deputados do MDB podem "permitir" a CPI como forma de distanciamento estrategico do governador.
                A CPI nao seria contra o MDB - seria a favor da sobrevivencia eleitoral de cada um.</p>
            </div>

            <div class="insight-box">
                <h3>&#x1F4A1; O Efeito Celular de Vorcaro</h3>
                <p>A apreensao do celular de Daniel Vorcaro pela PF e o fator mais subestimado.
                Esse dispositivo contem registros de comunicacoes com politicos de todos os espectros.
                Deputados que votaram a favor da compra em agosto estao em posicao vulneravel.
                A CPI na CLDF pode ser uma forma de "se antecipar" as revelacoes - quem investiga nao e investigado.
                Isso muda o calculo para independentes como Joao Cardoso (Avante) e Jorge Vianna (PSD).</p>
            </div>

            <div class="insight-box">
                <h3>&#x26A0; A Armadilha do Regimento</h3>
                <p>O limite de 2 CPIs simultaneas e a verdadeira blindagem. A CPI do Rio Melchior ocupa uma vaga.
                A estrategia do governo seria manter essa CPI ativa e abrir uma segunda CPI sobre outro tema (ICMS, Feminicidio, IGESDF)
                para impedir regimentalmente a CPI do BRB. Isso e mais efetivo que bloquear assinaturas.
                A oposicao precisa de maioria absoluta (13 votos) para abrir uma terceira CPI simultanea - praticamente impossivel.</p>
            </div>

            <div class="insight-box">
                <h3>&#x1F3AF; O Fator 2026: Eleicoes Distritais</h3>
                <p>Todos os 24 deputados tem mandato ate janeiro 2027 e buscarao reeleicao em outubro 2026.
                Quem votou a favor da compra do Master precisa de uma narrativa de defesa.
                Apoiar a CPI agora ("fui enganado pelo governo") e mais seguro eleitoralmente do que defender Ibaneis.
                O timing e critico: quanto mais proximo de outubro, maior a pressao por distanciamento do escandalo.</p>
            </div>
        </div>

        <!-- RESPOSTAS COMPLETAS -->
        <div class="section respostas-section">
            <h2>Respostas Completas dos Agentes Parlamentares</h2>
            {respostas_html}
        </div>

        <!-- METODOLOGIA -->
        <div class="card" style="margin-bottom:24px;">
            <h2>Metodologia</h2>
            <p style="color:#94a3b8;font-size:13px;">
                <strong>Modelo:</strong> {MODELO} (Anthropic)<br>
                <strong>Agentes:</strong> 24 personas baseadas em perfis reais dos deputados distritais da 9a Legislatura CLDF<br>
                <strong>Atributos por agente:</strong> 60+ campos (demografico, politico, psicologico, comportamental)<br>
                <strong>Contexto:</strong> Fatos publicos ate janeiro 2026 sobre CPI Banco Master/BRB<br>
                <strong>Limitacao:</strong> Simulacao IA - nao representa declaracoes reais dos parlamentares<br>
                <strong>Data:</strong> {timestamp}
            </p>
        </div>

        <!-- PESQUISADOR -->
        <div class="card" style="display:flex;gap:16px;align-items:center;margin-bottom:24px;">
            <div style="width:56px;height:56px;background:linear-gradient(135deg,#d69e2e,#b7791f);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#0f172a;">IM</div>
            <div>
                <div style="font-weight:700;font-size:16px;">Igor Morais Vasconcelos</div>
                <div style="color:#94a3b8;font-size:13px;">Pesquisador Responsavel | Presidente INTEIA</div>
                <div style="color:#64748b;font-size:12px;">igor@inteia.com.br | inteia.com.br</div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>INTEIA - Inteligencia Estrategica</p>
            <p>CNPJ: 63.918.490/0001-20 | SHN Quadra 2 Bloco F, Sala 625/626 - Brasilia/DF</p>
            <p>inteia.com.br | igor@inteia.com.br</p>
            <p>&copy; 2026 INTEIA. Todos os direitos reservados.</p>
        </div>
    </div>

    <script>
        (function () {{
            var btn = document.getElementById('toggle-respostas');
            if (!btn) return;
            btn.addEventListener('click', function () {{
                document.body.classList.toggle('show-respostas');
                btn.textContent = document.body.classList.contains('show-respostas')
                    ? 'Ocultar respostas completas'
                    : 'Mostrar respostas completas';
            }});
        }})();
    </script>
</body>
</html>"""
    return html


def main():
    print("=" * 70)
    print("  INTEIA - Simulacao Parlamentar: CPI do Banco Master/BRB")
    print("  24 Deputados Distritais da CLDF")
    print("=" * 70)
    print()

    provider = os.environ.get("IA_PROVIDER", "claude_code").strip()

    client = None
    if provider == "claude_code":
        print("[OK] Provedor IA: Claude Code CLI (assinatura)")
        # Validacao leve: existencia do binario
        if not shutil.which(os.environ.get("CLAUDE_CODE_BIN", "claude")):
            print("[ERRO] Claude Code CLI nao encontrado. Configure CLAUDE_CODE_BIN ou use IA_PROVIDER=anthropic_api")
            sys.exit(1)
    else:
        # Carregar API key
        api_key = os.environ.get('CLAUDE_API_KEY')
        if not api_key:
            # Tentar carregar do .env
            env_path = Path(__file__).parent.parent / "backend" / ".env"
            if env_path.exists():
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.startswith('CLAUDE_API_KEY='):
                            api_key = line.strip().split('=', 1)[1]
                            break

        if not api_key:
            print("[ERRO] CLAUDE_API_KEY nao encontrada (IA_PROVIDER=anthropic_api)!")
            sys.exit(1)

        print("[OK] API Key carregada")
        client = anthropic.Anthropic(api_key=api_key)
        print("[OK] Cliente Anthropic inicializado")

    # Carregar deputados
    deputados = carregar_deputados()

    # Executar simulacao
    print(f"\n{'='*50}")
    print(f"  INICIANDO SIMULACAO - {len(deputados)} deputados")
    print(f"{'='*50}\n")

    resultados = []
    total_tokens_entrada = 0
    total_tokens_saida = 0
    inicio = time.time()

    for i, dep in enumerate(deputados, 1):
        print(f"[{i}/{len(deputados)}]", end=" ")
        resultado = simular_deputado(client, dep, provider)
        resultados.append(resultado)
        total_tokens_entrada += resultado.get('tokens_entrada', 0)
        total_tokens_saida += resultado.get('tokens_saida', 0)

        # Pausa entre chamadas para evitar rate limiting
        if i < len(deputados):
            time.sleep(1)

    duracao = time.time() - inicio

    # Calcular resultados
    print(f"\n{'='*50}")
    print(f"  RESULTADOS")
    print(f"{'='*50}\n")

    probabilidades = calcular_probabilidades(resultados)
    mapa_partido = gerar_mapa_calor_por_partido(resultados)

    # Exibir resumo
    print(f"  Assinam CPI:    {probabilidades['assinam']}")
    print(f"  Nao Assinam:    {probabilidades['nao_assinam']}")
    print(f"  Indecisos:      {probabilidades['indecisos']}")
    print(f"  Necessarias:    {probabilidades['necessarias']}")
    print(f"  Probabilidade:  {probabilidades['probabilidade_cpi']}%")
    print()
    print(f"  Cenario Pessimista: {probabilidades['cenario_pessimista']}/8 -> {'CPI INSTALADA' if probabilidades['cpi_instalada_pessimista'] else 'NAO INSTALADA'}")
    print(f"  Cenario Base:       {probabilidades['cenario_base']}/8 -> {'CPI INSTALADA' if probabilidades['cpi_instalada_base'] else 'NAO INSTALADA'}")
    print(f"  Cenario Otimista:   {probabilidades['cenario_otimista']}/8 -> {'CPI INSTALADA' if probabilidades['cpi_instalada_otimista'] else 'NAO INSTALADA'}")
    print()
    print(f"  Tokens entrada: {total_tokens_entrada:,}")
    print(f"  Tokens saida:   {total_tokens_saida:,}")
    print(f"  Custo estimado: ~R${(total_tokens_entrada * 0.003 + total_tokens_saida * 0.015) / 1000 * 5.5:.2f}")
    print(f"  Duracao:        {duracao:.0f}s")

    # Mapa por partido
    print(f"\n  MAPA DE CALOR POR PARTIDO:")
    print(f"  {'Partido':<15} {'Deps':>4} {'Media':>6} {'Assinam':>7} {'Nao':>4} {'Ind':>4}")
    print(f"  {'-'*45}")
    for partido, dados in sorted(mapa_partido.items(), key=lambda x: x[1]['intensidade_media'], reverse=True):
        print(f"  {partido:<15} {dados['deputados']:>4} {dados['intensidade_media']:>6.1f} {dados['assinam']:>7} {dados['nao_assinam']:>4} {dados['indecisos']:>4}")

    # Salvar resultados JSON
    ARQUIVO_SAIDA.parent.mkdir(parents=True, exist_ok=True)
    dados_saida = {
        'titulo': 'Simulacao CPI Banco Master/BRB - CLDF',
        'data': datetime.now().isoformat(),
        'modelo': MODELO,
        'total_deputados': len(deputados),
        'probabilidades': probabilidades,
        'mapa_partido': {k: {kk: vv for kk, vv in v.items()} for k, v in mapa_partido.items()},
        'resultados': [{k: v for k, v in r.items()} for r in resultados],
        'tokens_entrada_total': total_tokens_entrada,
        'tokens_saida_total': total_tokens_saida,
        'duracao_segundos': round(duracao, 1)
    }

    with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dados_saida, f, ensure_ascii=False, indent=2)
    print(f"\n[OK] JSON salvo em: {ARQUIVO_SAIDA}")

    # Gerar HTML
    html = gerar_relatorio_html(resultados, probabilidades, mapa_partido)
    arquivo_html = ARQUIVO_SAIDA.with_suffix('.html')
    with open(arquivo_html, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"[OK] Relatorio HTML salvo em: {arquivo_html}")

    print(f"\n{'='*70}")
    print(f"  SIMULACAO CONCLUIDA!")
    print(f"{'='*70}")


if __name__ == '__main__':
    main()
