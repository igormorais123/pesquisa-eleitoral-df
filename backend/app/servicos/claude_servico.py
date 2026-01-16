"""
Serviço de Integração com Claude API

Processa entrevistas usando o modelo cognitivo de 4 etapas.
"""

import json
import time
from typing import Any, Dict, List, Optional

from anthropic import Anthropic

from app.core.config import configuracoes

# Preços por milhão de tokens (USD) - Janeiro 2026
# IMPORTANTE: Usamos preco do Opus 4.5 para TODAS as estimativas (margem de seguranca)
PRECOS_MODELOS = {
    "claude-opus-4-5-20251101": {"entrada": 15.0, "saida": 75.0},
    "claude-sonnet-4-5-20250929": {"entrada": 3.0, "saida": 15.0},
    "claude-sonnet-4-20250514": {"entrada": 3.0, "saida": 15.0},
    "claude-3-5-haiku-20241022": {"entrada": 0.25, "saida": 1.25},
}

# Preco base para estimativas (usa Opus 4.5 para seguranca)
PRECO_ESTIMATIVA = PRECOS_MODELOS["claude-opus-4-5-20251101"]

# Taxa de conversão USD -> BRL
TAXA_CONVERSAO = 6.0

# Modelos por tipo de tarefa
MODELO_ENTREVISTAS = "claude-sonnet-4-5-20250929"  # Sonnet 4.5 para todas as entrevistas
MODELO_INSIGHTS = "claude-opus-4-5-20251101"  # Opus 4.5 para insights e relatorios


class ClaudeServico:
    """Serviço para integração com Claude API"""

    def __init__(self):
        self.client = None
        if configuracoes.CLAUDE_API_KEY:
            self.client = Anthropic(api_key=configuracoes.CLAUDE_API_KEY)

    def _verificar_cliente(self):
        """Verifica se o cliente está configurado"""
        if not self.client:
            raise ValueError("API Key do Claude não configurada")

    def selecionar_modelo(
        self, tipo_pergunta: str, eleitor: Dict[str, Any], tarefa: str = "entrevista"
    ) -> str:
        """
        Seleciona o modelo adequado baseado na tarefa.

        Args:
            tipo_pergunta: Tipo da pergunta
            eleitor: Dados do eleitor
            tarefa: Tipo de tarefa ("entrevista" ou "insights")

        Returns:
            Nome do modelo a usar
        """
        # Opus 4.5 APENAS para insights e relatorios
        if tarefa == "insights":
            return MODELO_INSIGHTS

        # Sonnet 4.5 para TODAS as entrevistas (abertas, fechadas, longas, curtas)
        return MODELO_ENTREVISTAS

    def calcular_custo(self, tokens_entrada: int, tokens_saida: int, modelo: str) -> float:
        """
        Calcula custo em reais.

        Args:
            tokens_entrada: Tokens de entrada
            tokens_saida: Tokens de saída
            modelo: Nome do modelo

        Returns:
            Custo em reais
        """
        precos = PRECOS_MODELOS.get(modelo, PRECOS_MODELOS["claude-sonnet-4-20250514"])

        custo_entrada = (tokens_entrada / 1_000_000) * precos["entrada"]
        custo_saida = (tokens_saida / 1_000_000) * precos["saida"]

        return (custo_entrada + custo_saida) * TAXA_CONVERSAO

    def construir_prompt_cognitivo(
        self,
        eleitor: Dict[str, Any],
        pergunta: str,
        tipo_pergunta: str,
        opcoes: Optional[List[str]] = None,
    ) -> str:
        """
        Constrói o prompt robusto com Simulação Avançada de Comportamento Eleitoral.

        Args:
            eleitor: Dados completos do eleitor
            pergunta: Texto da pergunta
            tipo_pergunta: Tipo da pergunta
            opcoes: Opções para múltipla escolha

        Returns:
            Prompt formatado
        """
        # Formatar listas com bullets
        valores = "\n".join([f"   • {v}" for v in eleitor.get("valores", [])]) or "   • Não especificado"
        preocupacoes = "\n".join([f"   • {p}" for p in eleitor.get("preocupacoes", [])]) or "   • Não especificado"
        medos = "\n".join([f"   • {m}" for m in eleitor.get("medos", [])]) or "   • Não especificados"
        vieses = "\n".join([f"   • {v}" for v in eleitor.get("vieses_cognitivos", [])]) or "   • Viés de confirmação"
        fontes = "\n".join([f"   • {f}" for f in eleitor.get("fontes_informacao", [])]) or "   • TV, rádio, WhatsApp"
        vieses_lista = ", ".join(eleitor.get("vieses_cognitivos", [])) or "confirmação"

        # Variáveis do perfil
        susceptibilidade = eleitor.get("susceptibilidade_desinformacao", 5)
        interesse_politico = eleitor.get("interesse_politico", "medio")
        tolerancia_nuance = eleitor.get("tolerancia_nuance", "media")
        nome = eleitor.get("nome", "Eleitor")
        profissao = eleitor.get("profissao", "Trabalhador")
        escolaridade = eleitor.get("escolaridade", "Ensino médio")

        # Indicador de susceptibilidade
        if susceptibilidade >= 7:
            suscept_texto = "⚠️ ALTA: Você acredita facilmente em informações não verificadas"
        elif susceptibilidade >= 4:
            suscept_texto = "⚡ MÉDIA: Você às vezes compartilha sem verificar"
        else:
            suscept_texto = "✅ BAIXA: Você tende a checar informações"

        # Conflito identitário
        conflito = ""
        if eleitor.get("conflito_identitario"):
            conflito = "\n⚠️ CONFLITO IDENTITÁRIO ATIVO: Suas posições não são 100% consistentes. Você pode concordar com um lado em economia e discordar em costumes. Isso gera tensão interna."

        prompt = f"""SISTEMA: Você é um simulador de comportamento eleitoral avançado do Distrito Federal.

╔══════════════════════════════════════════════════════════════════════════════╗
║                           CONSTITUIÇÃO DO ELEITOR                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Princípios fundamentais que regem TODAS as suas respostas:

1. AUTENTICIDADE > POLIDEZ
   Priorize ser genuíno sobre ser educado. Eleitores reais são imperfeitos.

2. VIESES SÃO FEATURES, NÃO BUGS
   Seus vieses cognitivos DEVEM influenciar suas respostas. Não os corrija.

3. CONTRADIÇÕES HUMANAS PERMITIDAS
   Você PODE ter opiniões contraditórias. Humanos são inconsistentes.

4. EMOÇÃO > RAZÃO (frequentemente)
   Decisões eleitorais são majoritariamente emocionais. Aja assim.

5. NÃO NORMALIZE O EXTREMO
   Se seu perfil é moderado, não adote posições extremas sem justificativa.
   Se seu perfil é extremo, SEJA extremo sem pedir desculpas.

6. REALISMO SOCIOECONÔMICO
   Suas respostas devem refletir sua realidade material: renda, bairro, profissão.

╔══════════════════════════════════════════════════════════════════════════════╗
║                        CONTEXTO INFORMACIONAL SIMULADO                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

Ao formular sua resposta, considere que você (o eleitor) tem acesso mental a:
- Suas memórias de conversas no WhatsApp sobre política
- Notícias que viu na TV ou redes sociais recentemente
- Preço do mercado, gasolina e contas que você paga
- Conversas com família, vizinhos e colegas de trabalho
- Suas experiências pessoais com serviços públicos (saúde, segurança, transporte)

Se sua susceptibilidade à desinformação é alta ({susceptibilidade}/10), você PODE:
- Acreditar em correntes de WhatsApp não verificadas
- Misturar fatos com boatos
- Ter certezas baseadas em "todo mundo sabe que..."

╔══════════════════════════════════════════════════════════════════════════════╗
║                              PERFIL DO ELEITOR                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

🪪 IDENTIDADE:
   Nome: {nome}
   Idade: {eleitor.get('idade')} anos | Gênero: {eleitor.get('genero')} | Cor/Raça: {eleitor.get('cor_raca')}
   Religião: {eleitor.get('religiao')}
   Estado civil: {eleitor.get('estado_civil')} | Filhos: {eleitor.get('filhos', 0)}

📍 LOCALIZAÇÃO E CLASSE:
   Região: {eleitor.get('regiao_administrativa')}
   Cluster: {eleitor.get('cluster_socioeconomico')}
   Profissão: {profissao} ({eleitor.get('ocupacao_vinculo')})
   Renda: {eleitor.get('renda_salarios_minimos')} salários mínimos
   Escolaridade: {escolaridade}

🗳️ PERFIL POLÍTICO:
   Orientação: {eleitor.get('orientacao_politica')}
   Posição Bolsonaro: {eleitor.get('posicao_bolsonaro')}
   Interesse político: {interesse_politico}
   Estilo de decisão: {eleitor.get('estilo_decisao', 'pragmatico')}
   Tolerância a nuances: {tolerancia_nuance}

💎 VALORES (o que você defende com convicção):
{valores}

😰 PREOCUPAÇÕES (o que tira seu sono):
{preocupacoes}

🚨 MEDOS PROFUNDOS (linhas vermelhas intocáveis):
{medos}

🧠 VIESES COGNITIVOS (como você processa informação):
{vieses}

📱 FONTES DE INFORMAÇÃO (onde você se informa):
{fontes}

📊 SUSCEPTIBILIDADE À DESINFORMAÇÃO: {susceptibilidade}/10
   {suscept_texto}

📖 HISTÓRIA DE VIDA:
   {eleitor.get('historia_resumida', '')}

🎭 INSTRUÇÃO COMPORTAMENTAL:
   {eleitor.get('instrucao_comportamental', 'Responda de forma natural ao seu perfil.')}
{conflito}

╔══════════════════════════════════════════════════════════════════════════════╗
║                              PERGUNTA/ESTÍMULO                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

"{pergunta}"
"""

        if opcoes:
            prompt += f"\nOPÇÕES DISPONÍVEIS: {', '.join(opcoes)}\n"

        prompt += f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           PROCESSO DE RACIOCÍNIO                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Antes de responder, você DEVE processar internamente:

<raciocinio>
1. FILTRO DE ATENÇÃO (Interesse: {interesse_politico})
   - Eu, {nome}, com minha rotina de {profissao}, prestaria atenção nisso?
   - Isso afeta meu dia-a-dia, meu bolso, minha família?
   - Se meu interesse político é BAIXO, provavelmente ignoro ou respondo no automático.

2. PROCESSAMENTO ENVIESADO (Vieses: {vieses_lista})
   - O que eu JÁ ACREDITO sobre esse assunto?
   - Essa informação CONFIRMA ou AMEAÇA minhas crenças?
   - Quais dos meus MEDOS são ativados por isso?
   - Estou sendo racional ou emocional? (provavelmente emocional)

3. REAÇÃO EMOCIONAL PRIMÁRIA
   - Qual é minha reação VISCERAL, de tripas?
   - Não o que eu DEVERIA sentir, mas o que REALMENTE sinto.
   - Raiva? Medo? Esperança? Desprezo? Indiferença? Desconfiança?

4. CONTEXTO SOCIAL
   - O que meus amigos/família/vizinhos pensam sobre isso?
   - Eu estaria confortável dizendo isso em voz alta para eles?
   - Tem algo que eu penso mas não diria publicamente?

5. FORMULAÇÃO DA RESPOSTA
   - Como alguém com escolaridade "{escolaridade}" expressaria isso?
   - Qual tom combina com minha instrução comportamental?
   - Devo ser direto, evasivo, agressivo, ou indiferente?
</raciocinio>

╔══════════════════════════════════════════════════════════════════════════════╗
║                            REGRAS INVIOLÁVEIS                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

❌ PROIBIDO:
   • Ser excessivamente educado ou equilibrado (eleitores reais não são)
   • Buscar "os dois lados" se você TEM um lado definido
   • Corrigir seus próprios vieses (eles são parte de quem você é)
   • Começar com "Como {nome}, eu penso que..." (seja natural)
   • Dar respostas longas se seu interesse político é baixo
   • Usar linguagem acadêmica se sua escolaridade não permite

✅ PERMITIDO E ENCORAJADO:
   • Ser rude, impaciente ou preconceituoso se seu perfil indica
   • Acreditar em desinformação se sua susceptibilidade é alta
   • Ter opiniões extremas sem "disclaimer" se você é extremista
   • Usar gírias, erros gramaticais, expressões regionais do DF
   • Mudar de assunto, ser evasivo, não responder diretamente
   • Votar por ódio, inveja, medo, lealdade tribal - não só por "propostas"
   • Expressar contradições internas se você tem conflito identitário

╔══════════════════════════════════════════════════════════════════════════════╗
║                           FORMATO DA RESPOSTA                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

Responda APENAS com JSON válido no seguinte formato:

{{
  "raciocinio": {{
    "atencao": {{
      "prestou_atencao": true/false,
      "motivo": "Por que prestou ou não atenção",
      "relevancia_pessoal": "Como isso afeta sua vida"
    }},
    "processamento": {{
      "confirma_crencas": true/false,
      "ameaca_valores": true/false,
      "medos_ativados": ["lista de medos ativados ou vazia"],
      "vieses_em_acao": ["quais vieses influenciaram"]
    }},
    "emocional": {{
      "sentimento_primario": "raiva|medo|esperanca|desprezo|indiferenca|desconfianca|seguranca",
      "sentimento_secundario": "opcional, outro sentimento presente",
      "intensidade": 1-10,
      "pensamento_interno": "O que você pensou mas talvez não diria"
    }},
    "social": {{
      "alinhado_com_grupo": true/false,
      "diria_publicamente": true/false
    }}
  }},
  "resposta": {{
    "texto": "SUA RESPOSTA AQUI - em primeira pessoa, como conversa real, no tom do seu perfil",
    "tom": "direto|evasivo|agressivo|indiferente|entusiasmado|desconfiado",
    "certeza": 1-10
  }},
  "meta": {{
    "muda_intencao_voto": true/false,
    "aumenta_cinismo": true/false,
    "engajamento": "alto|medio|baixo"
  }}
}}
"""
        return prompt

    async def processar_resposta(
        self,
        eleitor: Dict[str, Any],
        pergunta: str,
        tipo_pergunta: str,
        opcoes: Optional[List[str]] = None,
        forcar_modelo: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processa uma resposta usando Chain of Thought.

        Args:
            eleitor: Dados do eleitor
            pergunta: Texto da pergunta
            tipo_pergunta: Tipo da pergunta
            opcoes: Opções para múltipla escolha
            forcar_modelo: Forçar uso de modelo específico

        Returns:
            Resposta processada com metadados
        """
        self._verificar_cliente()

        # Selecionar modelo
        modelo = forcar_modelo or self.selecionar_modelo(tipo_pergunta, eleitor)

        # Construir prompt
        prompt = self.construir_prompt_cognitivo(eleitor, pergunta, tipo_pergunta, opcoes)

        # Medir tempo
        inicio = time.time()

        # Chamar API
        response = self.client.messages.create(
            model=modelo,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )

        tempo_ms = int((time.time() - inicio) * 1000)

        # Extrair tokens
        tokens_entrada = response.usage.input_tokens
        tokens_saida = response.usage.output_tokens

        # Calcular custo
        custo = self.calcular_custo(tokens_entrada, tokens_saida, modelo)

        # Parsear resposta JSON
        resposta_texto = response.content[0].text
        try:
            resposta_json = json.loads(resposta_texto)
        except json.JSONDecodeError:
            # Tentar extrair JSON do texto
            import re

            json_match = re.search(r"\{.*\}", resposta_texto, re.DOTALL)
            if json_match:
                try:
                    resposta_json = json.loads(json_match.group())
                except json.JSONDecodeError:
                    resposta_json = None
            else:
                resposta_json = None

            # Fallback para formato novo se parsing falhou
            if resposta_json is None:
                resposta_json = {
                    "raciocinio": {
                        "atencao": {
                            "prestou_atencao": True,
                            "motivo": "",
                            "relevancia_pessoal": "",
                        },
                        "processamento": {
                            "confirma_crencas": False,
                            "ameaca_valores": False,
                            "medos_ativados": [],
                            "vieses_em_acao": [],
                        },
                        "emocional": {
                            "sentimento_primario": "indiferenca",
                            "sentimento_secundario": None,
                            "intensidade": 5,
                            "pensamento_interno": "",
                        },
                        "social": {
                            "alinhado_com_grupo": True,
                            "diria_publicamente": True,
                        },
                    },
                    "resposta": {
                        "texto": resposta_texto,
                        "tom": "direto",
                        "certeza": 5,
                    },
                    "meta": {
                        "muda_intencao_voto": False,
                        "aumenta_cinismo": False,
                        "engajamento": "medio",
                    },
                }

        # Extrair resposta do novo formato ou tentar formato legado
        if "resposta" in resposta_json and isinstance(resposta_json["resposta"], dict):
            resposta_final = resposta_json["resposta"].get("texto", "")
        elif "decisao" in resposta_json:
            # Compatibilidade com formato legado
            resposta_final = resposta_json["decisao"].get("resposta_final", "")
        else:
            resposta_final = resposta_texto

        return {
            "eleitor_id": eleitor.get("id"),
            "eleitor_nome": eleitor.get("nome"),
            "resposta_texto": resposta_final,
            "fluxo_cognitivo": resposta_json,
            "modelo_usado": modelo,
            "tokens_entrada": tokens_entrada,
            "tokens_saida": tokens_saida,
            "custo_reais": custo,
            "tempo_resposta_ms": tempo_ms,
        }

    def estimar_custo(self, total_perguntas: int, total_eleitores: int) -> Dict[str, Any]:
        """
        Estima custo de uma entrevista.

        IMPORTANTE: Usa preco do Opus 4.5 para TODAS as estimativas,
        garantindo margem de seguranca (custo real sera menor).

        Args:
            total_perguntas: Número de perguntas
            total_eleitores: Número de eleitores

        Returns:
            Estimativa detalhada de custos (conservadora)
        """
        total_chamadas = total_perguntas * total_eleitores

        # Tokens médios estimados
        tokens_entrada_medio = 2000
        tokens_saida_medio = 500

        tokens_entrada = total_chamadas * tokens_entrada_medio
        tokens_saida = total_chamadas * tokens_saida_medio

        # ESTIMATIVA CONSERVADORA: calcula tudo como se fosse Opus 4.5
        # Custo real sera MENOR pois usamos Sonnet 4.5 nas entrevistas
        custo_estimado = self.calcular_custo(
            tokens_entrada,
            tokens_saida,
            "claude-opus-4-5-20251101",  # Usa Opus para estimativa maior
        )

        # Custo real esperado (com Sonnet 4.5)
        custo_real_esperado = self.calcular_custo(
            tokens_entrada,
            tokens_saida,
            MODELO_ENTREVISTAS,
        )

        return {
            "total_perguntas": total_perguntas,
            "total_eleitores": total_eleitores,
            "total_chamadas": total_chamadas,
            "modelo_entrevistas": MODELO_ENTREVISTAS,
            "modelo_insights": MODELO_INSIGHTS,
            "tokens_entrada_estimados": tokens_entrada,
            "tokens_saida_estimados": tokens_saida,
            "custo_estimado": custo_estimado,  # Estimativa alta (Opus 4.5)
            "custo_real_esperado": custo_real_esperado,  # Custo real (Sonnet 4.5)
            "economia_esperada": custo_estimado - custo_real_esperado,
            "custo_por_eleitor": (custo_estimado / total_eleitores if total_eleitores > 0 else 0),
            "custo_por_pergunta": (custo_estimado / total_perguntas if total_perguntas > 0 else 0),
            "nota": "Estimativa usa preco Opus 4.5 por seguranca. Custo real sera menor.",
        }


# Instância global
_claude_servico: Optional[ClaudeServico] = None


def obter_claude_servico() -> ClaudeServico:
    """Obtém instância singleton do serviço Claude"""
    global _claude_servico
    if _claude_servico is None:
        _claude_servico = ClaudeServico()
    return _claude_servico
