# POLARIS SDK - Context Manager
# Gestão de janela de contexto entre chamadas

import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
import tiktoken


@dataclass
class ContextItem:
    """Item de contexto."""
    content: str
    tipo: str
    prioridade: int  # 1=crítico, 10=dispensável
    tokens: int
    timestamp: datetime = field(default_factory=datetime.now)
    resumo: Optional[str] = None


class ContextManager:
    """
    Gerencia janela de contexto entre chamadas aos modelos Claude.

    Responsabilidades:
    - Manter histórico de contexto
    - Otimizar uso do contexto (remover itens de baixa prioridade)
    - Sumarizar conteúdo antigo
    - Fornecer contexto relevante para cada fase
    """

    # Limites de contexto por modelo
    MAX_TOKENS = {
        "claude-opus-4-5-20251101": 200000,
        "claude-sonnet-4-5-20250929": 200000,
    }

    # Mapeamento de relevância por fase
    RELEVANCE_MAP = {
        "definicao_problematica": ["tema_original"],
        "metodologia": ["problematica", "tema_original"],
        "amostragem": ["metodologia", "problematica"],
        "questionario": ["problematica", "metodologia"],
        "coleta": ["questionario", "amostra", "eleitores"],
        "analise": ["respostas", "problematica", "metodologia", "questionario"],
        "projecoes": ["analise", "respostas", "problematica"],
        "recomendacoes": ["analise", "projecoes", "problematica"],
        "relatorio": ["tudo"]
    }

    def __init__(self, model: str = "claude-opus-4-5-20251101"):
        self.model = model
        self.max_tokens = self.MAX_TOKENS.get(model, 200000)
        self.context_history: List[ContextItem] = []
        self.summary_cache: Dict[str, str] = {}

        # Tentar carregar tokenizer (fallback para estimativa)
        try:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        except Exception:
            self.tokenizer = None

    def _count_tokens(self, text: str) -> int:
        """Conta tokens no texto."""
        if self.tokenizer:
            return len(self.tokenizer.encode(text))
        # Estimativa: ~4 caracteres por token
        return len(text) // 4

    def add_to_context(
        self,
        content: str,
        tipo: str,
        prioridade: int = 5
    ) -> None:
        """
        Adiciona conteúdo ao contexto.

        Args:
            content: Conteúdo a adicionar
            tipo: Tipo do conteúdo (ex: 'problematica', 'metodologia')
            prioridade: 1=crítico (nunca remover), 10=dispensável
        """
        tokens = self._count_tokens(content)

        item = ContextItem(
            content=content,
            tipo=tipo,
            prioridade=prioridade,
            tokens=tokens
        )

        self.context_history.append(item)
        self._optimize_context()

    def _optimize_context(self) -> None:
        """Mantém contexto dentro do limite."""
        total_tokens = sum(item.tokens for item in self.context_history)
        target_tokens = int(self.max_tokens * 0.8)  # 80% do máximo

        while total_tokens > target_tokens and self.context_history:
            # Ordenar por prioridade (maior = menos importante) e timestamp (mais antigo primeiro)
            self.context_history.sort(
                key=lambda x: (-x.prioridade, x.timestamp)
            )

            # Remover item de menor importância
            removed = self.context_history.pop()

            # Sumarizar antes de descartar se for moderadamente importante
            if removed.prioridade < 8:
                summary = self._create_summary(removed.content, removed.tipo)
                self.summary_cache[removed.tipo] = summary

            total_tokens = sum(item.tokens for item in self.context_history)

    def _create_summary(self, content: str, tipo: str) -> str:
        """Cria resumo do conteúdo removido."""
        # Resumo simplificado (em produção, usar Claude para sumarizar)
        max_chars = 500
        if len(content) <= max_chars:
            return content
        return content[:max_chars] + f"... [resumido de {len(content)} caracteres]"

    def get_context_for_phase(self, fase: str) -> str:
        """
        Retorna contexto relevante para uma fase específica.

        Args:
            fase: Nome da fase da pesquisa

        Returns:
            String com contexto concatenado
        """
        tipos_relevantes = self.RELEVANCE_MAP.get(fase, ["tudo"])

        if "tudo" in tipos_relevantes:
            return self._build_full_context()

        return self._build_filtered_context(tipos_relevantes)

    def _build_full_context(self) -> str:
        """Constrói contexto completo."""
        parts = []

        # Adicionar itens do histórico
        for item in self.context_history:
            parts.append(f"## {item.tipo.upper()}\n{item.content}")

        # Adicionar sumários de itens removidos
        for tipo, summary in self.summary_cache.items():
            if not any(item.tipo == tipo for item in self.context_history):
                parts.append(f"## {tipo.upper()} (resumo)\n{summary}")

        return "\n\n".join(parts)

    def _build_filtered_context(self, tipos: List[str]) -> str:
        """Constrói contexto filtrado por tipos."""
        parts = []

        for item in self.context_history:
            if item.tipo in tipos:
                parts.append(f"## {item.tipo.upper()}\n{item.content}")

        # Adicionar sumários relevantes
        for tipo in tipos:
            if tipo in self.summary_cache:
                if not any(item.tipo == tipo for item in self.context_history):
                    parts.append(f"## {tipo.upper()} (resumo)\n{self.summary_cache[tipo]}")

        return "\n\n".join(parts)

    def get_tokens_used(self) -> int:
        """Retorna total de tokens em uso."""
        return sum(item.tokens for item in self.context_history)

    def get_tokens_available(self) -> int:
        """Retorna tokens disponíveis."""
        return self.max_tokens - self.get_tokens_used()

    def clear(self) -> None:
        """Limpa todo o contexto."""
        self.context_history.clear()
        self.summary_cache.clear()

    def get_status(self) -> Dict[str, Any]:
        """Retorna status do contexto."""
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "tokens_used": self.get_tokens_used(),
            "tokens_available": self.get_tokens_available(),
            "utilization_percent": (self.get_tokens_used() / self.max_tokens) * 100,
            "items_count": len(self.context_history),
            "summaries_count": len(self.summary_cache),
            "items_by_type": self._count_by_type()
        }

    def _count_by_type(self) -> Dict[str, int]:
        """Conta itens por tipo."""
        counts = {}
        for item in self.context_history:
            counts[item.tipo] = counts.get(item.tipo, 0) + 1
        return counts

    def export_state(self) -> Dict[str, Any]:
        """Exporta estado para persistência."""
        return {
            "model": self.model,
            "context_history": [
                {
                    "content": item.content,
                    "tipo": item.tipo,
                    "prioridade": item.prioridade,
                    "tokens": item.tokens,
                    "timestamp": item.timestamp.isoformat(),
                    "resumo": item.resumo
                }
                for item in self.context_history
            ],
            "summary_cache": self.summary_cache
        }

    def import_state(self, state: Dict[str, Any]) -> None:
        """Importa estado de persistência."""
        self.model = state.get("model", self.model)
        self.max_tokens = self.MAX_TOKENS.get(self.model, 200000)

        self.context_history = [
            ContextItem(
                content=item["content"],
                tipo=item["tipo"],
                prioridade=item["prioridade"],
                tokens=item["tokens"],
                timestamp=datetime.fromisoformat(item["timestamp"]),
                resumo=item.get("resumo")
            )
            for item in state.get("context_history", [])
        ]

        self.summary_cache = state.get("summary_cache", {})
