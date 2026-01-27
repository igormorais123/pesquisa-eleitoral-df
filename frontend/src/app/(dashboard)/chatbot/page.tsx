'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, User, Sparkles, Loader2, ArrowLeft,
  MessageSquare, Brain, Zap, Settings, RefreshCw,
  Copy, Check, ThumbsUp, ThumbsDown, Volume2
} from 'lucide-react';
import Link from 'next/link';

interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const sugestoesIniciais = [
  'O que é a INTEIA?',
  'Como funciona a pesquisa eleitoral com IA?',
  'Quais são os projetos disponíveis?',
  'Como posso usar agentes sintéticos?',
];

export default function ChatbotPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente virtual da INTEIA. Posso ajudar você a entender nossos projetos de inteligência artificial, pesquisa eleitoral e muito mais. Como posso ajudar?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const enviarMensagem = async (texto?: string) => {
    const mensagemTexto = texto || input.trim();
    if (!mensagemTexto || carregando) return;

    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      role: 'user',
      content: mensagemTexto,
      timestamp: new Date(),
    };

    setMensagens(prev => [...prev, novaMensagem]);
    setInput('');
    setCarregando(true);

    // Simular resposta da IA (em produção, chamar API real)
    setTimeout(() => {
      const respostas: Record<string, string> = {
        'o que é a inteia': 'A INTEIA (Instituto de Inteligência Artificial) é uma empresa brasileira focada em soluções de IA para pesquisa eleitoral, educação e governo. Nosso principal produto é um sistema de simulação eleitoral com 1.000 agentes sintéticos que representam eleitores do Distrito Federal.',
        'como funciona a pesquisa eleitoral': 'Nossa pesquisa eleitoral usa agentes de IA sintéticos - perfis completos de eleitores com 60+ atributos (demografia, posição política, valores, medos, etc.). Quando você faz uma pergunta, cada agente responde de forma coerente com seu perfil, permitindo simular pesquisas eleitorais realistas sem entrevistar pessoas reais.',
        'quais são os projetos disponíveis': 'Temos vários projetos:\n\n1. **Pesquisa Eleitoral** - Sistema principal com 1.000 agentes\n2. **Stress Test** - Análise de resiliência do voto\n3. **Academy INTEIA** - Cursos de programação para iniciantes\n4. **Chatbot** - Este assistente que você está usando!\n5. **Ouvidoria** - Análise de demandas com IA\n\nE em breve: Participa DF, Agentes Simulados e Jogo Generativo.',
        'como posso usar agentes sintéticos': 'Para usar os agentes sintéticos:\n\n1. Acesse o **Dashboard** no Hub de Projetos\n2. Vá em **Eleitores** para ver os 1.000 perfis\n3. Use **Entrevistas** para fazer perguntas aos agentes\n4. Veja os **Resultados** com análises estatísticas\n\nCada agente responde de forma consistente com seu perfil demográfico e psicológico.',
      };

      const perguntaLower = mensagemTexto.toLowerCase();
      let resposta = 'Desculpe, ainda estou aprendendo sobre esse assunto. Posso ajudar com informações sobre a INTEIA, pesquisa eleitoral com IA, ou nossos projetos disponíveis. O que gostaria de saber?';

      for (const [key, value] of Object.entries(respostas)) {
        if (perguntaLower.includes(key) || key.split(' ').some(word => perguntaLower.includes(word))) {
          resposta = value;
          break;
        }
      }

      const respostaIA: Mensagem = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: resposta,
        timestamp: new Date(),
      };

      setMensagens(prev => [...prev, respostaIA]);
      setCarregando(false);
    }, 1500);
  };

  const copiarMensagem = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const limparChat = () => {
    setMensagens([{
      id: '1',
      role: 'assistant',
      content: 'Chat reiniciado! Como posso ajudar?',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chatbot INTEIA</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online - Pronto para ajudar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Beta
          </span>
          <button
            onClick={limparChat}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            title="Limpar chat"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-card/50 backdrop-blur-xl border border-border rounded-2xl overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {mensagens.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-br from-amber-500 to-amber-600'
                  }
                `}>
                  {msg.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className={`
                  flex-1 max-w-[80%]
                  ${msg.role === 'user' ? 'text-right' : ''}
                `}>
                  <div className={`
                    inline-block p-4 rounded-2xl
                    ${msg.role === 'assistant'
                      ? 'bg-white/5 border border-white/10 text-left'
                      : 'bg-amber-500/20 border border-amber-500/30 text-left'
                    }
                  `}>
                    <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Actions */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copiarMensagem(msg.id, msg.content)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
                        title="Copiar"
                      >
                        {copiado === msg.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors" title="Útil">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors" title="Não útil">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {carregando && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-white/50 text-sm">Pensando...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {mensagens.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-white/40 mb-3">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {sugestoesIniciais.map((sugestao, i) => (
                <button
                  key={i}
                  onClick={() => enviarMensagem(sugestao)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => { e.preventDefault(); enviarMensagem(); }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={carregando}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 outline-none text-foreground placeholder:text-white/30 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || carregando}
              className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { icon: Brain, title: 'IA Avançada', desc: 'Powered by Claude AI' },
          { icon: MessageSquare, title: 'Respostas Contextuais', desc: 'Entende o contexto' },
          { icon: Zap, title: 'Respostas Rápidas', desc: 'Tempo real' },
        ].map((feature, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
