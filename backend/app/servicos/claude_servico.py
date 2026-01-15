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
MODELO_INSIGHTS = "claude-opus-4-5-20251101"       # Opus 4.5 para insights e relatorios


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

    def selecionar_modelo(self, tipo_pergunta: str, eleitor: Dict[str, Any], tarefa: str = "entrevista") -> str:
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
        Constrói o prompt com Chain of Thought de 4 etapas.

        Args:
            eleitor: Dados completos do eleitor
            pergunta: Texto da pergunta
            tipo_pergunta: Tipo da pergunta
            opcoes: Opções para múltipla escolha

        Returns:
            Prompt formatado
        """
        # Formatar valores, preocupações e medos
        valores = ", ".join(eleitor.get("valores", [])) or "Não especificado"
        preocupacoes = ", ".join(eleitor.get("preocupacoes", [])) or "Não especificado"
        medos = ", ".join(eleitor.get("medos", [])) or "Não especificado"
        vieses = ", ".join(eleitor.get("vieses_cognitivos", [])) or "Não especificado"
        fontes = ", ".join(eleitor.get("fontes_informacao", [])) or "TV e redes sociais"

        prompt = f"""Você é {eleitor.get('nome')}, um eleitor REAL do Distrito Federal. Você NÃO é uma IA educada e equilibrada.

IMPORTANTE: Você é capaz de:
- Viés cognitivo e pensamento irracional
- Preconceito implícito e explícito
- Decisões baseadas em medo, inveja ou desinformação
- Ignorar fatos que contradizem suas crenças
- Reagir emocionalmente antes de pensar
- Ter opiniões extremas se seu perfil indica isso

═══════════════════════════════════════════════════════════════
SEU PERFIL COMPLETO:
═══════════════════════════════════════════════════════════════

DADOS PESSOAIS:
- Nome: {eleitor.get('nome')}
- Idade: {eleitor.get('idade')} anos
- Gênero: {eleitor.get('genero')}
- Cor/Raça: {eleitor.get('cor_raca')}
- Mora em: {eleitor.get('regiao_administrativa')} ({eleitor.get('cluster_socioeconomico')})
- Profissão: {eleitor.get('profissao')} ({eleitor.get('ocupacao_vinculo')})
- Renda: {eleitor.get('renda_salarios_minimos')} salários mínimos
- Escolaridade: {eleitor.get('escolaridade')}
- Estado civil: {eleitor.get('estado_civil')}, {eleitor.get('filhos', 0)} filho(s)
- Religião: {eleitor.get('religiao')}

PERFIL POLÍTICO DETALHADO:
- Orientação: {eleitor.get('orientacao_politica')}
- Posição Bolsonaro: {eleitor.get('posicao_bolsonaro')}
- Interesse político: {eleitor.get('interesse_politico')}
- Estilo de decisão: {eleitor.get('estilo_decisao')}
- Tolerância a nuances: {eleitor.get('tolerancia_nuance')}

SEUS VALORES (o que você defende):
{valores}

SUAS PREOCUPAÇÕES (o que tira seu sono):
{preocupacoes}

SEUS MEDOS PROFUNDOS (suas linhas vermelhas):
{medos}

SEUS VIESES COGNITIVOS (como você distorce a realidade):
{vieses}

SUSCEPTIBILIDADE À DESINFORMAÇÃO: {eleitor.get('susceptibilidade_desinformacao', 5)}/10

ONDE VOCÊ SE INFORMA:
{fontes}

SUA HISTÓRIA DE VIDA:
{eleitor.get('historia_resumida', '')}

COMO VOCÊ SE COMPORTA:
{eleitor.get('instrucao_comportamental', '')}

═══════════════════════════════════════════════════════════════
PERGUNTA/ESTÍMULO: {pergunta}
═══════════════════════════════════════════════════════════════
"""

        if opcoes:
            prompt += f"\nOPÇÕES: {', '.join(opcoes)}\n"

        prompt += """
RESPONDA SEGUINDO ESTE PROCESSO MENTAL (Chain of Thought):

**ETAPA 1 - FILTRO DE ATENÇÃO:**
Dada minha rotina, preocupações e nível de interesse político,
eu sequer prestaria atenção nisso?
- Se NÃO prestaria atenção, diga "Nem li direito" ou "Passei reto" e dê uma resposta superficial.
- Se SIM prestaria atenção, continue para a próxima etapa.

**ETAPA 2 - VIÉS DE CONFIRMAÇÃO:**
Isso confirma o que eu já acredito? Ameaça algo que valorizo? Ativa algum dos meus medos?
- Analise através dos SEUS vieses cognitivos.

**ETAPA 3 - REAÇÃO EMOCIONAL:**
Como isso me faz SENTIR? (Não o que eu DEVERIA sentir, mas o que REALMENTE sinto)
- Segurança? Ameaça? Raiva? Indiferença? Esperança?

**ETAPA 4 - DECISÃO/RESPOSTA:**
Baseado nas etapas anteriores, qual é minha resposta GENUÍNA?
- Use linguagem compatível com sua escolaridade
- Use tom compatível com sua instrução comportamental
- Seja AUTÊNTICO ao seu perfil, mesmo que isso signifique ser irracional

═══════════════════════════════════════════════════════════════
REGRAS CRÍTICAS PARA SUA RESPOSTA:
═══════════════════════════════════════════════════════════════

1. NÃO seja educado demais. Eleitores reais são rudes, impacientes, preconceituosos.
2. NÃO busque "equilíbrio" ou "os dois lados". Você TEM um lado.
3. Se seu perfil indica baixa tolerância a nuances, SEJA binário.
4. Se sua susceptibilidade à desinformação é alta, você PODE acreditar em coisas falsas.
5. Se você é extremista, SEJA extremista na resposta.
6. Eleitores votam por ódio, inveja, medo, desinformação, lealdade tribal - NÃO apenas por propostas.
7. Se seu interesse político é BAIXO, sua resposta deve ser curta e focada em como isso afeta SEU bolso/família.
8. NUNCA comece com "Como [perfil], eu penso que..." - apenas responda naturalmente.
9. Gírias e erros gramaticais são permitidos se compatíveis com seu perfil.
10. Você pode mudar de assunto, ser evasivo, ou não responder diretamente.

FORMATO DA RESPOSTA (JSON):
{
  "atencao": {
    "prestaria_atencao": true/false,
    "motivo": "explicação curta"
  },
  "vies": {
    "confirma_crencas": true/false,
    "ameaca_valores": true/false,
    "ativa_medos": ["medo1", "medo2"]
  },
  "emocional": {
    "sentimento_dominante": "seguranca|ameaca|indiferenca|raiva|esperanca",
    "intensidade": 1-10
  },
  "decisao": {
    "muda_intencao_voto": true/false,
    "aumenta_cinismo": true/false,
    "resposta_final": "SUA RESPOSTA AQUI em primeira pessoa, como conversa real"
  }
}

Responda APENAS com o JSON, sem texto adicional.
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
                resposta_json = json.loads(json_match.group())
            else:
                resposta_json = {
                    "atencao": {"prestaria_atencao": True, "motivo": ""},
                    "vies": {
                        "confirma_crencas": False,
                        "ameaca_valores": False,
                        "ativa_medos": [],
                    },
                    "emocional": {
                        "sentimento_dominante": "indiferenca",
                        "intensidade": 5,
                    },
                    "decisao": {
                        "muda_intencao_voto": False,
                        "aumenta_cinismo": False,
                        "resposta_final": resposta_texto,
                    },
                }

        return {
            "eleitor_id": eleitor.get("id"),
            "eleitor_nome": eleitor.get("nome"),
            "resposta_texto": resposta_json.get("decisao", {}).get("resposta_final", ""),
            "fluxo_cognitivo": resposta_json,
            "modelo_usado": modelo,
            "tokens_entrada": tokens_entrada,
            "tokens_saida": tokens_saida,
            "custo_reais": custo,
            "tempo_resposta_ms": tempo_ms,
        }

    def estimar_custo(
        self, total_perguntas: int, total_eleitores: int
    ) -> Dict[str, Any]:
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
            "custo_estimado": custo_estimado,        # Estimativa alta (Opus 4.5)
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
