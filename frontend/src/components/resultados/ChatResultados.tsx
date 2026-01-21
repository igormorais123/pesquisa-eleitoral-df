'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Download,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { cn, formatarMoeda } from '@/lib/utils';
import type { SessaoEntrevista } from '@/lib/db/dexie';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsados?: number;
  custo?: number;
}

interface ChatResultadosProps {
  sessao: SessaoEntrevista;
  relatorio?: {
    sumarioExecutivo: {
      titulo: string;
      dataCriacao: string;
      totalEntrevistados: number;
      conclusaoPrincipal: string;
      nivelAlerta: string;
    };
    analiseEstrategica: {
      panoramaGeral: string;
      fortalezas: string[];
      vulnerabilidades: string[];
      oportunidades: string[];
      ameacas: string[];
    };
    perfisPsicograficos: Array<{
      segmento: string;
      percentual: number;
      caracteristicas: string[];
      gatilhosEmocionais: string[];
      mensagensEficazes: string[];
      errosEvitar: string[];
    }>;
    votoSilencioso: {
      estimativaPercentual: number;
      perfilTipico: string;
      indicadoresIdentificacao: string[];
      estrategiasConversao: string[];
      riscos: string[];
    };
    pontosRuptura: Array<{
      grupo: string;
      eventoGatilho: string;
      probabilidadeMudanca: number;
      direcaoMudanca: string;
      sinaisAlerta: string[];
    }>;
    recomendacoesEstrategicas: {
      curtoPrazo: string[];
      medioPrazo: string[];
      mensagensChave: string[];
      temasEvitar: string[];
      canaisRecomendados: string[];
    };
    alertasInteligencia: Array<{
      tipo: string;
      titulo: string;
      descricao: string;
      acaoRecomendada: string;
      prioridade: number;
    }>;
    conclusaoAnalitica: string;
  } | null;
  estatisticas?: {
    totalRespostas: number;
    sentimentos: { positivo: number; negativo: number; neutro: number };
    tempoMedio: number;
    palavrasFrequentes: Array<{ palavra: string; contagem: number }>;
    estatisticasPorPergunta: Array<{
      perguntaId: string;
      totalRespostas: number;
      sentimentos: { positivo: number; negativo: number; neutro: number };
      palavrasChave: Array<{ palavra: string; contagem: number }>;
    }>;
    tokensTotal: number;
    custoTotal: number;
  } | null;
}

// Sugestões de perguntas pré-definidas
const SUGESTOES_PERGUNTAS = [
  "Qual é o principal insight desta pesquisa?",
  "Quais candidatos têm maior potencial de crescimento?",
  "Quais são os pontos de atenção para a campanha?",
  "Como está o voto silencioso nesta pesquisa?",
  "Quais temas devo evitar na comunicação?",
  "Qual o perfil do eleitor indeciso?",
  "Como posso converter eleitores indecisos?",
  "Quais são as fortalezas e fraquezas identificadas?",
];

export function ChatResultados({ sessao, relatorio, estatisticas }: ChatResultadosProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(true);
  const [custoTotal, setCustoTotal] = useState(0);
  const [tokensTotal, setTokensTotal] = useState(0);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensagens]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const historico = localStorage.getItem(`chat-resultados-${sessao.id}`);
    if (historico) {
      try {
        const parsed = JSON.parse(historico);
        setMensagens(parsed.mensagens || []);
        setCustoTotal(parsed.custoTotal || 0);
        setTokensTotal(parsed.tokensTotal || 0);
        setMostrarSugestoes(parsed.mensagens?.length === 0);
      } catch (e) {
        console.error('Erro ao carregar histórico do chat:', e);
      }
    }
  }, [sessao.id]);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (mensagens.length > 0) {
      localStorage.setItem(`chat-resultados-${sessao.id}`, JSON.stringify({
        mensagens,
        custoTotal,
        tokensTotal,
      }));
    }
  }, [mensagens, custoTotal, tokensTotal, sessao.id]);

  // Preparar contexto completo da pesquisa
  const prepararContextoPesquisa = useCallback(() => {
    const respostasTexto = sessao.respostas.map((r, i) => {
      const respostasEleitor = r.respostas.map(resp =>
        `  Pergunta: ${resp.pergunta_id}\n  Resposta: ${resp.resposta}`
      ).join('\n');
      return `Eleitor ${i + 1} - ${r.eleitor_nome}:\n${respostasEleitor}`;
    }).join('\n\n');

    const estatisticasTexto = estatisticas ? `
ESTATÍSTICAS DA PESQUISA:
- Total de Respondentes: ${estatisticas.totalRespostas}
- Sentimentos: Positivo ${estatisticas.sentimentos.positivo}, Negativo ${estatisticas.sentimentos.negativo}, Neutro ${estatisticas.sentimentos.neutro}
- Tempo Médio de Resposta: ${estatisticas.tempoMedio.toFixed(2)}s
- Tokens Total: ${estatisticas.tokensTotal}
- Custo Total: R$ ${estatisticas.custoTotal.toFixed(4)}
- Palavras Mais Frequentes: ${estatisticas.palavrasFrequentes.slice(0, 10).map(p => `${p.palavra}(${p.contagem})`).join(', ')}

ANÁLISE POR PERGUNTA:
${estatisticas.estatisticasPorPergunta.map(p => `
  "${p.perguntaId}":
  - Respostas: ${p.totalRespostas}
  - Sentimentos: +${p.sentimentos.positivo} / =${p.sentimentos.neutro} / -${p.sentimentos.negativo}
  - Termos-chave: ${p.palavrasChave.slice(0, 5).map(k => k.palavra).join(', ')}
`).join('')}
` : '';

    const relatorioTexto = relatorio ? `
RELATÓRIO DE INTELIGÊNCIA POLÍTICA:

SUMÁRIO EXECUTIVO:
${relatorio.sumarioExecutivo.conclusaoPrincipal}
Nível de Alerta: ${relatorio.sumarioExecutivo.nivelAlerta}

ANÁLISE ESTRATÉGICA (SWOT):
Panorama: ${relatorio.analiseEstrategica.panoramaGeral}
Fortalezas: ${relatorio.analiseEstrategica.fortalezas.join('; ')}
Vulnerabilidades: ${relatorio.analiseEstrategica.vulnerabilidades.join('; ')}
Oportunidades: ${relatorio.analiseEstrategica.oportunidades.join('; ')}
Ameaças: ${relatorio.analiseEstrategica.ameacas.join('; ')}

PERFIS PSICOGRÁFICOS:
${relatorio.perfisPsicograficos.map(p => `
  ${p.segmento} (${p.percentual}%):
  - Características: ${p.caracteristicas.join(', ')}
  - Gatilhos Emocionais: ${p.gatilhosEmocionais.join(', ')}
  - Mensagens Eficazes: ${p.mensagensEficazes.join(', ')}
  - Erros a Evitar: ${p.errosEvitar.join(', ')}
`).join('')}

VOTO SILENCIOSO:
- Estimativa: ${relatorio.votoSilencioso.estimativaPercentual}%
- Perfil Típico: ${relatorio.votoSilencioso.perfilTipico}
- Como Identificar: ${relatorio.votoSilencioso.indicadoresIdentificacao.join('; ')}
- Estratégias de Conversão: ${relatorio.votoSilencioso.estrategiasConversao.join('; ')}
- Riscos: ${relatorio.votoSilencioso.riscos.join('; ')}

PONTOS DE RUPTURA:
${relatorio.pontosRuptura.map(p => `
  ${p.grupo}:
  - Gatilho: ${p.eventoGatilho}
  - Probabilidade: ${p.probabilidadeMudanca}%
  - Direção: ${p.direcaoMudanca}
  - Sinais de Alerta: ${p.sinaisAlerta.join(', ')}
`).join('')}

RECOMENDAÇÕES ESTRATÉGICAS:
Curto Prazo: ${relatorio.recomendacoesEstrategicas.curtoPrazo.join('; ')}
Médio Prazo: ${relatorio.recomendacoesEstrategicas.medioPrazo.join('; ')}
Mensagens-Chave: ${relatorio.recomendacoesEstrategicas.mensagensChave.join('; ')}
Temas a Evitar: ${relatorio.recomendacoesEstrategicas.temasEvitar.join('; ')}
Canais Recomendados: ${relatorio.recomendacoesEstrategicas.canaisRecomendados.join(', ')}

ALERTAS DE INTELIGÊNCIA:
${relatorio.alertasInteligencia.map(a => `
  [${a.tipo.toUpperCase()}] ${a.titulo} (Prioridade: ${a.prioridade}/10)
  ${a.descricao}
  Ação: ${a.acaoRecomendada}
`).join('')}

CONCLUSÃO ANALÍTICA:
${relatorio.conclusaoAnalitica}
` : '';

    return `
=== PESQUISA ELEITORAL: ${sessao.titulo || 'Sem título'} ===
Data: ${sessao.finalizadaEm || sessao.iniciadaEm}
Total de Eleitores Entrevistados: ${sessao.respostas.length}
Custo da Pesquisa: R$ ${sessao.custoAtual.toFixed(4)}
Tokens Utilizados: ${sessao.tokensInput + sessao.tokensOutput}

${estatisticasTexto}

${relatorioTexto}

=== TODAS AS RESPOSTAS DOS ELEITORES ===
${respostasTexto}
`;
  }, [sessao, estatisticas, relatorio]);

  // Enviar mensagem
  const enviarMensagem = async (texto?: string) => {
    const mensagemTexto = texto || inputValue.trim();
    if (!mensagemTexto || isLoading) return;

    const novaMensagemUsuario: Mensagem = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: mensagemTexto,
      timestamp: new Date(),
    };

    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setInputValue('');
    setMostrarSugestoes(false);
    setIsLoading(true);

    try {
      const contexto = prepararContextoPesquisa();

      const response = await fetch('/api/claude/chat-resultados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: mensagemTexto,
          contexto,
          historicoMensagens: mensagens.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao processar mensagem');
      }

      const novaMensagemAssistant: Mensagem = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.resposta,
        timestamp: new Date(),
        tokensUsados: data.tokensUsados,
        custo: data.custo,
      };

      setMensagens(prev => [...prev, novaMensagemAssistant]);
      setCustoTotal(prev => prev + (data.custo || 0));
      setTokensTotal(prev => prev + (data.tokensUsados || 0));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const mensagemErro: Mensagem = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao processar sua pergunta: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`,
        timestamp: new Date(),
      };
      setMensagens(prev => [...prev, mensagemErro]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copiar mensagem
  const copiarMensagem = async (mensagem: Mensagem) => {
    await navigator.clipboard.writeText(mensagem.content);
    setCopiadoId(mensagem.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // Limpar histórico
  const limparHistorico = () => {
    setMensagens([]);
    setCustoTotal(0);
    setTokensTotal(0);
    setMostrarSugestoes(true);
    localStorage.removeItem(`chat-resultados-${sessao.id}`);
  };

  // Exportar conversa
  const exportarConversa = () => {
    const texto = mensagens.map(m =>
      `[${m.role === 'user' ? 'Você' : 'IA'}] ${m.content}`
    ).join('\n\n---\n\n');

    const blob = new Blob([texto], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-pesquisa-${sessao.id}.md`;
    a.click();
  };

  // Handler para Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-400px)] min-h-[500px] glass-card rounded-xl overflow-hidden">
      {/* Header do Chat */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Conversar com os Resultados</h3>
            <p className="text-xs text-muted-foreground">
              Pergunte qualquer coisa sobre a pesquisa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Métricas */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mr-4">
            <span>Tokens: {tokensTotal.toLocaleString()}</span>
            <span className="text-yellow-400">Custo: {formatarMoeda(custoTotal)}</span>
          </div>

          {/* Botões de ação */}
          <button
            onClick={exportarConversa}
            disabled={mensagens.length === 0}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            title="Exportar conversa"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={limparHistorico}
            disabled={mensagens.length === 0}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            title="Limpar histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Mensagem de boas-vindas */}
        {mensagens.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Olá! Sou seu assistente de análise
            </h4>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Tenho acesso a todos os dados desta pesquisa: respostas dos eleitores,
              estatísticas, gráficos, insights e relatório de inteligência.
              Pergunte qualquer coisa!
            </p>
          </div>
        )}

        {/* Sugestões de perguntas */}
        {mostrarSugestoes && mensagens.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              <span>Sugestões de perguntas:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGESTOES_PERGUNTAS.map((sugestao, i) => (
                <button
                  key={i}
                  onClick={() => enviarMensagem(sugestao)}
                  className="text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground/80 hover:text-foreground transition-colors border border-border/50 hover:border-primary/30"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensagens */}
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={cn(
              'flex gap-3',
              mensagem.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {/* Avatar do assistente */}
            {mensagem.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}

            {/* Conteúdo da mensagem */}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                mensagem.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/70 text-foreground'
              )}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {mensagem.content}
              </p>

              {/* Footer da mensagem */}
              <div className={cn(
                'flex items-center justify-between mt-2 pt-2 border-t text-xs',
                mensagem.role === 'user'
                  ? 'border-primary-foreground/20 text-primary-foreground/70'
                  : 'border-border text-muted-foreground'
              )}>
                <span>
                  {new Date(mensagem.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                {mensagem.role === 'assistant' && (
                  <div className="flex items-center gap-2">
                    {mensagem.tokensUsados && (
                      <span>{mensagem.tokensUsados} tokens</span>
                    )}
                    <button
                      onClick={() => copiarMensagem(mensagem)}
                      className="p-1 rounded hover:bg-secondary transition-colors"
                      title="Copiar"
                    >
                      {copiadoId === mensagem.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar do usuário */}
            {mensagem.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-secondary/70 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando dados da pesquisa...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input de mensagem */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Faça uma pergunta sobre a pesquisa..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 max-h-32"
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={() => enviarMensagem()}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by Claude Opus 4.5 • Contexto completo da pesquisa carregado
        </p>
      </div>
    </div>
  );
}
