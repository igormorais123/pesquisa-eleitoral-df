'use client';

import { useState, useEffect, useCallback } from 'react';
import { MensagemWhatsApp, listarMensagens } from '@/services/whatsapp-api';

interface ConversasViewProps {
  contatoId: number;
  onFechar: () => void;
}

export function ConversasView({ contatoId, onFechar }: ConversasViewProps) {
  const [mensagens, setMensagens] = useState<MensagemWhatsApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMensagens = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarMensagens(contatoId, 100);
      // Ordenar por criado_em (mais antigo primeiro)
      const ordenadas = [...dados].sort(
        (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
      );
      setMensagens(ordenadas);
    } catch {
      setErro('Erro ao carregar mensagens');
    } finally {
      setCarregando(false);
    }
  }, [contatoId]);

  useEffect(() => {
    carregarMensagens();
  }, [carregarMensagens]);

  const formatarData = (dataStr: string) => {
    try {
      return new Date(dataStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataStr;
    }
  };

  const formatarCusto = (custo: number) => {
    if (custo === 0) return '--';
    return `$${custo.toFixed(4)}`;
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#0f172a]/80 dark:bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-200">
            Conversas - Contato #{contatoId}
          </h3>
        </div>
        <button
          onClick={onFechar}
          className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          title="Fechar"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Corpo */}
      <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
        {carregando && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
          </div>
        )}

        {erro && (
          <div className="text-center py-8">
            <p className="text-sm text-red-400">{erro}</p>
            <button
              onClick={carregarMensagens}
              className="mt-2 text-sm text-amber-500 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && mensagens.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem encontrada
            </p>
          </div>
        )}

        {!carregando &&
          !erro &&
          mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.direcao === 'saida' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.direcao === 'saida'
                    ? 'bg-amber-500/15 border border-amber-500/20'
                    : 'bg-secondary border border-border/50'
                }`}
              >
                {/* Direcao */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      msg.direcao === 'saida'
                        ? 'text-amber-500'
                        : 'text-blue-400'
                    }`}
                  >
                    {msg.direcao === 'saida' ? 'Oraculo' : 'Contato'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatarData(msg.criado_em)}
                  </span>
                </div>

                {/* Conteudo */}
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {msg.conteudo}
                </p>

                {/* Metadados */}
                <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-border/30">
                  {msg.agente_usado && (
                    <span className="text-[10px] text-muted-foreground">
                      Agente: <span className="text-amber-500/80">{msg.agente_usado}</span>
                    </span>
                  )}
                  {(msg.tokens_entrada > 0 || msg.tokens_saida > 0) && (
                    <span className="text-[10px] text-muted-foreground">
                      Tokens: {msg.tokens_entrada}in / {msg.tokens_saida}out
                    </span>
                  )}
                  {msg.custo > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      Custo: {formatarCusto(msg.custo)}
                    </span>
                  )}
                  {msg.tempo_resposta_ms > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {(msg.tempo_resposta_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
