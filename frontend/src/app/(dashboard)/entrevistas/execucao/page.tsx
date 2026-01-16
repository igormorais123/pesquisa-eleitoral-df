'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  BarChart3,
  Coins,
  Clock,
  Users,
  MessageSquare,
  Brain,
} from 'lucide-react';
import { useEleitoresStore } from '@/stores/eleitores-store';
import { useEntrevistasStore } from '@/stores/entrevistas-store';
import { db, salvarSessao, carregarEleitoresIniciais } from '@/lib/db/dexie';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';
import type { Eleitor, RespostaEleitor } from '@/types';
import eleitoresIniciais from '@/data/eleitores-df-1000.json';

export default function PaginaExecucaoEntrevista() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const entrevistaId = searchParams.get('entrevista');

  const { eleitoresSelecionados, setEleitores } = useEleitoresStore();
  const {
    sessaoAtual,
    executando,
    pausado,
    progresso,
    respostasRecebidas,
    custoAtual,
    tokensInput,
    tokensOutput,
    limiteCusto,
    perguntas,
    pausarExecucao,
    retormarExecucao,
    cancelarExecucao,
    atualizarProgresso,
    adicionarResposta,
    atualizarCusto,
    finalizarExecucao,
  } = useEntrevistasStore();

  const [eleitoresPendentes, setEleitoresPendentes] = useState<Eleitor[]>([]);
  const [eleitorAtual, setEleitorAtual] = useState<Eleitor | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now());
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [carregandoEleitores, setCarregandoEleitores] = useState(true);
  const [totalEleitoresSelecionados, setTotalEleitoresSelecionados] = useState(0);
  const abortController = useRef<AbortController | null>(null);
  const eleitoresCarregadosRef = useRef(false);

  // Inicializar AbortController no mount e limpar no unmount
  useEffect(() => {
    abortController.current = new AbortController();

    return () => {
      // Cleanup: abortar requisições pendentes ao desmontar
      abortController.current?.abort();
      abortController.current = null;
    };
  }, []);

  // Timer para tempo decorrido
  useEffect(() => {
    const interval = setInterval(() => {
      setTempoDecorrido(Math.floor((Date.now() - tempoInicio) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [tempoInicio]);

  // Carregar eleitores do IndexedDB ao montar o componente
  useEffect(() => {
    if (eleitoresCarregadosRef.current) return;

    async function carregarEleitores() {
      try {
        setCarregandoEleitores(true);

        // Verificar se há eleitores no IndexedDB
        let eleitoresDB = await db.eleitores.toArray();

        // Se não houver, carregar do JSON inicial
        if (eleitoresDB.length === 0) {
          console.log('Carregando eleitores do JSON inicial...');
          const eleitoresComTimestamp = (eleitoresIniciais as Eleitor[]).map((e) => ({
            ...e,
            criado_em: e.criado_em || new Date().toISOString(),
            atualizado_em: e.atualizado_em || new Date().toISOString(),
          }));
          await carregarEleitoresIniciais(eleitoresComTimestamp);
          eleitoresDB = await db.eleitores.toArray();
        }

        console.log(`${eleitoresDB.length} eleitores carregados do banco`);
        console.log(`${eleitoresSelecionados.length} eleitores selecionados`);

        // Atualizar a store também
        setEleitores(eleitoresDB);

        // Filtrar os eleitores selecionados
        if (eleitoresSelecionados.length > 0) {
          const selecionados = eleitoresDB.filter((e) =>
            eleitoresSelecionados.includes(e.id)
          );

          // Filtrar eleitores já processados (para recuperação em caso de refresh)
          const idsJaProcessados = new Set(respostasRecebidas.map((r) => r.eleitor_id));
          const pendentes = selecionados.filter((e) => !idsJaProcessados.has(e.id));

          console.log(`${selecionados.length} eleitores selecionados, ${idsJaProcessados.size} já processados, ${pendentes.length} pendentes`);
          setEleitoresPendentes(pendentes);
          setTotalEleitoresSelecionados(selecionados.length);
        }

        eleitoresCarregadosRef.current = true;
      } catch (error) {
        console.error('Erro ao carregar eleitores:', error);
        setErro('Erro ao carregar eleitores do banco de dados');
      } finally {
        setCarregandoEleitores(false);
      }
    }

    carregarEleitores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eleitoresSelecionados, setEleitores]);

  // Processar próximo eleitor
  const processarProximo = useCallback(async () => {
    if (pausado || eleitoresPendentes.length === 0) return;

    // Verificar limite de custo
    if (custoAtual >= limiteCusto) {
      setErro('Limite de custo atingido');
      pausarExecucao();
      return;
    }

    const eleitor = eleitoresPendentes[0];
    setEleitorAtual(eleitor);

    try {
      // Chamar API para cada pergunta
      for (const pergunta of perguntas) {
        if (pausado) break;

        const response = await fetch('/api/claude/entrevista', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eleitor,
            pergunta,
            custoAcumulado: custoAtual,
          }),
          signal: abortController.current?.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.erro || 'Erro na API');
        }

        const data = await response.json();

        // Atualizar custos
        atualizarCusto(
          data.custoReais,
          data.tokensInput,
          data.tokensOutput
        );

        // Criar resposta - usar texto da pergunta como ID para exibição nos resultados
        const resposta: RespostaEleitor = {
          eleitor_id: eleitor.id,
          eleitor_nome: eleitor.nome,
          respostas: [
            {
              pergunta_id: pergunta.texto || pergunta.id || '',
              resposta: data.resposta.resposta_texto,
            },
          ],
          tokens_usados: data.tokensInput + data.tokensOutput,
          custo: data.custoReais,
          tempo_resposta_ms: Date.now() - tempoInicio,
        };

        adicionarResposta(resposta);
      }

      // Remover eleitor da lista de pendentes
      setEleitoresPendentes((prev) => prev.slice(1));

      // Atualizar progresso - baseado em eleitores únicos processados, não respostas
      const total = totalEleitoresSelecionados || eleitoresSelecionados.length;
      const eleitoresProcessadosSet = new Set(respostasRecebidas.map(r => r.eleitor_id));
      eleitoresProcessadosSet.add(eleitor.id);
      const novoProgresso = Math.min((eleitoresProcessadosSet.size / total) * 100, 100);
      atualizarProgresso(novoProgresso);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erro ao processar eleitor:', error);
        setErro(error.message);
      }
    }

    setEleitorAtual(null);
  }, [
    pausado,
    eleitoresPendentes,
    custoAtual,
    limiteCusto,
    perguntas,
    respostasRecebidas.length,
    eleitoresSelecionados.length,
    totalEleitoresSelecionados,
    pausarExecucao,
    atualizarCusto,
    adicionarResposta,
    atualizarProgresso,
  ]);

  // Loop de processamento
  useEffect(() => {
    // Não fazer nada enquanto estiver carregando
    if (carregandoEleitores) return;

    if (executando && !pausado && eleitoresPendentes.length > 0 && !eleitorAtual) {
      const timeout = setTimeout(processarProximo, 500);
      return () => clearTimeout(timeout);
    }

    // Só finalizar quando:
    // 1. Eleitores foram carregados (carregandoEleitores = false)
    // 2. Havia eleitores para processar (totalEleitoresSelecionados > 0)
    // 3. Todos foram processados (eleitoresPendentes.length === 0)
    if (
      executando &&
      !carregandoEleitores &&
      totalEleitoresSelecionados > 0 &&
      eleitoresPendentes.length === 0 &&
      !eleitorAtual
    ) {
      finalizarExecucao();
    }
  }, [
    executando,
    pausado,
    carregandoEleitores,
    totalEleitoresSelecionados,
    eleitoresPendentes.length,
    eleitorAtual,
    processarProximo,
    finalizarExecucao,
  ]);

  // Salvar sessão quando finalizada (usando useEffect separado para capturar estado atualizado)
  useEffect(() => {
    if (sessaoAtual && sessaoAtual.status === 'concluida') {
      console.log('Salvando sessão concluída com', sessaoAtual.respostas.length, 'respostas');
      salvarSessao(sessaoAtual);
    }
  }, [sessaoAtual?.status, sessaoAtual?.respostas.length]);

  // Salvar sessão periodicamente durante a execução (a cada resposta)
  useEffect(() => {
    if (sessaoAtual && executando && respostasRecebidas.length > 0) {
      // Salvar a cada 3 respostas ou quando houver pelo menos 1
      const saveInterval = respostasRecebidas.length % 3 === 0 || respostasRecebidas.length === 1;
      if (saveInterval) {
        console.log('Salvando progresso:', respostasRecebidas.length, 'respostas');
        salvarSessao(sessaoAtual);
      }
    }
  }, [sessaoAtual, executando, respostasRecebidas.length]);

  // Handlers
  const handlePausar = () => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    pausarExecucao();
  };

  const handleRetomar = () => {
    abortController.current = new AbortController();
    retormarExecucao();
  };

  const handleCancelar = () => {
    abortController.current?.abort();
    cancelarExecucao();
    router.push('/entrevistas');
  };

  // Formatar tempo
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  // Status - calcular eleitores únicos processados (não respostas)
  const status = sessaoAtual?.status || 'em_andamento';
  const totalAgentes = totalEleitoresSelecionados || eleitoresSelecionados.length;
  const eleitoresUnicos = new Set(respostasRecebidas.map(r => r.eleitor_id)).size;
  const processados = eleitoresUnicos;
  const percentual = totalAgentes > 0 ? Math.min((processados / totalAgentes) * 100, 100) : 0;

  // Tela de carregamento enquanto eleitores são carregados
  if (carregandoEleitores) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-foreground font-medium">Carregando eleitores...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Preparando {eleitoresSelecionados.length} agentes para entrevista
          </p>
        </div>
      </div>
    );
  }

  // Verificar se há perguntas configuradas
  if (!carregandoEleitores && perguntas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-4 text-foreground font-medium">Nenhuma pergunta configurada</p>
          <p className="text-sm text-muted-foreground mt-2">
            Crie uma nova entrevista com perguntas antes de executar.
          </p>
          <button
            onClick={() => router.push('/entrevistas/nova')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Criar Nova Entrevista
          </button>
        </div>
      </div>
    );
  }

  // Verificar se há eleitores selecionados
  if (!carregandoEleitores && totalEleitoresSelecionados === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-4 text-foreground font-medium">Nenhum eleitor selecionado</p>
          <p className="text-sm text-muted-foreground mt-2">
            Selecione eleitores antes de iniciar a entrevista.
          </p>
          <button
            onClick={() => router.push('/eleitores')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Selecionar Eleitores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-7 h-7 text-primary animate-pulse" />
            Executando Entrevista
          </h1>
          <p className="text-muted-foreground mt-1">
            {sessaoAtual?.titulo || 'Processando respostas dos agentes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === 'em_andamento' && !pausado && (
            <button
              onClick={handlePausar}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pausar
            </button>
          )}
          {pausado && (
            <button
              onClick={handleRetomar}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Retomar
            </button>
          )}
          <button
            onClick={handleCancelar}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Square className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>

      {/* Progresso principal */}
      <div className="glass-card rounded-2xl p-8">
        <div className="text-center mb-6">
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-secondary"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentual / 100)}`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-foreground">
                {Math.round(percentual)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {processados}/{totalAgentes}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {status === 'em_andamento' && !pausado && (
            <>
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-foreground">Processando...</span>
            </>
          )}
          {pausado && (
            <>
              <Pause className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400">Pausado</span>
            </>
          )}
          {status === 'concluida' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Concluído!</span>
            </>
          )}
          {erro && (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{erro}</span>
            </>
          )}
        </div>

        {/* Eleitor atual */}
        {eleitorAtual && (
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center mb-6">
            <p className="text-sm text-muted-foreground">Processando agora:</p>
            <p className="font-medium text-foreground">{eleitorAtual.nome}</p>
            <p className="text-xs text-muted-foreground">
              {eleitorAtual.regiao_administrativa} • {eleitorAtual.orientacao_politica}
            </p>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo</p>
              <p className="text-xl font-bold text-foreground">
                {formatarTempo(tempoDecorrido)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processados</p>
              <p className="text-xl font-bold text-foreground">
                {processados}/{totalAgentes}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custo</p>
              <p className="text-xl font-bold text-yellow-400">
                {formatarMoeda(custoAtual)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-xl font-bold text-foreground">
                {formatarNumero(tokensInput + tokensOutput)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monitor de custos */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          Monitor de Custos
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Custo atual</span>
            <span className="text-foreground">{formatarMoeda(custoAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Limite da sessão</span>
            <span className="text-foreground">{formatarMoeda(limiteCusto)}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                custoAtual / limiteCusto > 0.8
                  ? 'bg-red-500'
                  : custoAtual / limiteCusto > 0.5
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${(custoAtual / limiteCusto) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {Math.round((custoAtual / limiteCusto) * 100)}% do limite utilizado
          </p>
        </div>
      </div>

      {/* Últimas respostas */}
      {respostasRecebidas.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Últimas Respostas</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {respostasRecebidas.slice(-5).reverse().map((resp, i) => (
              <div
                key={i}
                className="p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">
                    {resp.eleitor_nome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {resp.tokens_usados} tokens
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {resp.respostas[0]?.resposta?.toString().substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão Ver Resultados */}
      {status === 'concluida' && (
        <div className="text-center">
          <Link
            href={`/resultados/${sessaoAtual?.id}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-lg font-medium"
          >
            <BarChart3 className="w-6 h-6" />
            Ver Resultados Detalhados
          </Link>
        </div>
      )}
    </div>
  );
}
