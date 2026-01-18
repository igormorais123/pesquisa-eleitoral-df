'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Target,
  Building2,
  Briefcase,
  Database,
  PieChart,
} from 'lucide-react';
import { useGestoresStore } from '@/stores/gestores-store';
import { usePesquisaPODCStore, type RespostaGestor, type RespostaPODCEstruturada } from '@/stores/pesquisa-podc-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';
import type { Gestor } from '@/types';

export default function PaginaExecucaoPODC() {
  const router = useRouter();

  const { gestores: todosGestores } = useGestoresStore();
  const { token } = useAuthStore();
  const {
    sessaoAtual,
    executando,
    pausado,
    progresso,
    respostasRecebidas,
    respostasEstruturadas,
    custoAtual,
    tokensInput,
    tokensOutput,
    limiteCusto,
    perguntas,
    gestoresSelecionados,
    titulo,
    pausarExecucao,
    retomarExecucao,
    cancelarExecucao,
    atualizarProgresso,
    adicionarResposta,
    adicionarRespostaEstruturada,
    atualizarCusto,
    finalizarExecucao,
    iniciarExecucao,
    criarPesquisaBackend,
    setPesquisaIdBackend,
    carregandoBackend,
  } = usePesquisaPODCStore();

  const [gestoresPendentes, setGestoresPendentes] = useState<Gestor[]>([]);
  const [gestorAtual, setGestorAtual] = useState<Gestor | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now());
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [iniciado, setIniciado] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  // Inicializar AbortController
  useEffect(() => {
    abortController.current = new AbortController();
    return () => {
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

  // Carregar gestores selecionados
  useEffect(() => {
    if (todosGestores.length === 0 || gestoresSelecionados.length === 0) {
      setCarregando(false);
      return;
    }

    const selecionados = todosGestores.filter((g) =>
      gestoresSelecionados.includes(g.id)
    );

    // Filtrar ja processados
    const idsJaProcessados = new Set(respostasRecebidas.map((r) => r.gestor_id));
    const pendentes = selecionados.filter((g) => !idsJaProcessados.has(g.id));

    setGestoresPendentes(pendentes);
    setCarregando(false);
  }, [todosGestores, gestoresSelecionados, respostasRecebidas]);

  // Criar pesquisa no backend antes de iniciar
  useEffect(() => {
    const criarPesquisa = async () => {
      if (!carregando && !iniciado && gestoresPendentes.length > 0 && token) {
        setIniciado(true);
        iniciarExecucao();
        setTempoInicio(Date.now());

        // Criar pesquisa no backend para salvar resultados
        if (!sessaoAtual?.pesquisaIdBackend) {
          const pesquisaId = await criarPesquisaBackend(token);
          if (pesquisaId) {
            console.log('Pesquisa criada no backend:', pesquisaId);
          }
        }
      }
    };

    criarPesquisa();
  }, [carregando, iniciado, gestoresPendentes.length, token, iniciarExecucao, criarPesquisaBackend, sessaoAtual?.pesquisaIdBackend]);

  // Processar proximo gestor
  const processarProximo = useCallback(async () => {
    if (pausado || gestoresPendentes.length === 0) return;

    // Verificar limite de custo
    if (custoAtual >= limiteCusto) {
      setErro('Limite de custo atingido');
      pausarExecucao();
      return;
    }

    const gestor = gestoresPendentes[0];
    setGestorAtual(gestor);

    try {
      // Chamar API com questionário completo (uma chamada por gestor)
      const response = await fetch('/api/claude/pesquisa-podc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          gestor,
          perguntas,
          pesquisaId: sessaoAtual?.pesquisaIdBackend, // Passar ID para salvar no backend
          custoAcumulado: custoAtual,
          usarQuestionarioCompleto: true, // Usar questionário completo da metodologia
        }),
        signal: abortController.current?.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro na API');
      }

      const data = await response.json();

      // Verificar se houve erro ao salvar no backend
      if (data.erroBackend) {
        console.warn('[PODC] Aviso: Erro ao salvar no backend:', data.erroBackend);
        // Não interrompe a execução, mas registra o aviso
      }

      // Atualizar custos no store
      atualizarCusto(data.custoReais, data.tokensInput, data.tokensOutput);

      // Criar resposta estruturada para análise estatística
      const respostaEstruturada: RespostaPODCEstruturada = {
        gestor_id: gestor.id,
        gestor_nome: gestor.nome,
        setor: gestor.setor,
        nivel_hierarquico: gestor.nivel_hierarquico,
        cargo: gestor.cargo,
        instituicao: gestor.instituicao,
        distribuicao_podc: data.resposta.distribuicao_podc,
        distribuicao_ideal: data.resposta.distribuicao_ideal,
        horas_semanais: data.resposta.horas_semanais,
        iad: data.resposta.iad,
        iad_classificacao: data.resposta.iad_classificacao,
        ranking_importancia: data.resposta.ranking_importancia,
        fatores_limitantes: data.resposta.fatores_limitantes,
        justificativa: data.resposta.justificativa,
        frequencia_atividades: data.resposta.frequencia_atividades,
        respostas_perguntas: data.resposta.respostas_perguntas,
        tokens_input: data.tokensInput,
        tokens_output: data.tokensOutput,
        custo_reais: data.custoReais,
        resposta_bruta: data.resposta.resposta_bruta,
      };

      // Adicionar resposta estruturada
      adicionarRespostaEstruturada(respostaEstruturada);

      // Criar resposta legada para compatibilidade com UI
      const respostaCompleta: RespostaGestor = {
        gestor_id: gestor.id,
        gestor_nome: gestor.nome,
        setor: gestor.setor,
        nivel_hierarquico: gestor.nivel_hierarquico,
        respostas: [],
        tokens_usados: data.tokensInput + data.tokensOutput,
        custo: data.custoReais,
        tempo_resposta_ms: Date.now() - tempoInicio,
        distribuicao_podc: data.resposta.distribuicao_podc,
        iad: data.resposta.iad,
        iad_classificacao: data.resposta.iad_classificacao,
      };

      adicionarResposta(respostaCompleta);

      // Remover gestor da lista de pendentes
      setGestoresPendentes((prev) => prev.slice(1));

      // Atualizar progresso
      const total = gestoresSelecionados.length;
      const gestoresProcessadosSet = new Set(respostasRecebidas.map((r) => r.gestor_id));
      gestoresProcessadosSet.add(gestor.id);
      const novoProgresso = Math.min((gestoresProcessadosSet.size / total) * 100, 100);
      atualizarProgresso(novoProgresso);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erro ao processar gestor:', error);
        setErro(error.message);
      }
    }

    setGestorAtual(null);
  }, [
    pausado,
    gestoresPendentes,
    custoAtual,
    limiteCusto,
    perguntas,
    respostasRecebidas,
    gestoresSelecionados.length,
    tempoInicio,
    token,
    sessaoAtual?.pesquisaIdBackend,
    pausarExecucao,
    atualizarCusto,
    adicionarResposta,
    adicionarRespostaEstruturada,
    atualizarProgresso,
  ]);

  // Loop de processamento
  useEffect(() => {
    if (carregando) return;

    if (executando && !pausado && gestoresPendentes.length > 0 && !gestorAtual) {
      const timeout = setTimeout(processarProximo, 500);
      return () => clearTimeout(timeout);
    }

    // Finalizar quando todos processados
    if (
      executando &&
      !carregando &&
      gestoresSelecionados.length > 0 &&
      gestoresPendentes.length === 0 &&
      !gestorAtual
    ) {
      finalizarExecucao();
    }
  }, [
    executando,
    pausado,
    carregando,
    gestoresSelecionados.length,
    gestoresPendentes.length,
    gestorAtual,
    processarProximo,
    finalizarExecucao,
  ]);

  // Handlers
  const handlePausar = () => {
    abortController.current?.abort();
    abortController.current = new AbortController();
    pausarExecucao();
  };

  const handleRetomar = () => {
    abortController.current = new AbortController();
    retomarExecucao();
  };

  const handleCancelar = () => {
    abortController.current?.abort();
    cancelarExecucao();
    router.push('/gestores/entrevistas');
  };

  // Formatar tempo
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  // Status
  const status = sessaoAtual?.status || 'em_andamento';
  const totalGestores = gestoresSelecionados.length;
  const gestoresUnicos = new Set(respostasRecebidas.map((r) => r.gestor_id)).size;
  const processados = gestoresUnicos;
  const percentual = totalGestores > 0 ? Math.min((processados / totalGestores) * 100, 100) : 0;

  // Contagem por setor e nivel
  const contagemSetor = {
    publico: respostasRecebidas.filter((r) => r.setor === 'publico').length,
    privado: respostasRecebidas.filter((r) => r.setor === 'privado').length,
  };
  const contagemNivel = {
    estrategico: respostasRecebidas.filter((r) => r.nivel_hierarquico === 'estrategico').length,
    tatico: respostasRecebidas.filter((r) => r.nivel_hierarquico === 'tatico').length,
    operacional: respostasRecebidas.filter((r) => r.nivel_hierarquico === 'operacional').length,
  };

  // Tela de carregamento
  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-foreground font-medium">Carregando gestores...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Preparando {gestoresSelecionados.length} gestores para pesquisa PODC
          </p>
        </div>
      </div>
    );
  }

  // Verificar se ha perguntas
  if (!carregando && perguntas.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-4 text-foreground font-medium">Nenhuma pergunta configurada</p>
          <p className="text-sm text-muted-foreground mt-2">
            Configure as perguntas da pesquisa antes de executar.
          </p>
          <button
            onClick={() => router.push('/gestores/entrevistas')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Configurar Pesquisa
          </button>
        </div>
      </div>
    );
  }

  // Verificar se ha gestores
  if (!carregando && gestoresSelecionados.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="mt-4 text-foreground font-medium">Nenhum gestor selecionado</p>
          <p className="text-sm text-muted-foreground mt-2">
            Selecione gestores antes de iniciar a pesquisa.
          </p>
          <button
            onClick={() => router.push('/gestores/entrevistas')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Selecionar Gestores
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
            <Target className="w-7 h-7 text-primary animate-pulse" />
            Pesquisa PODC em Execucao
          </h1>
          <p className="text-muted-foreground mt-1">
            {titulo || 'Pesquisa sobre distribuicao de funcoes administrativas'}
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
                {processados}/{totalGestores}
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
              <span className="text-green-400">Concluido!</span>
            </>
          )}
          {erro && (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{erro}</span>
            </>
          )}
        </div>

        {/* Gestor atual */}
        {gestorAtual && (
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center mb-6">
            <p className="text-sm text-muted-foreground">Processando agora:</p>
            <p className="font-medium text-foreground">{gestorAtual.nome}</p>
            <p className="text-xs text-muted-foreground">
              {gestorAtual.cargo} - {gestorAtual.instituicao}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={cn(
                'px-2 py-0.5 rounded text-xs',
                gestorAtual.setor === 'publico' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
              )}>
                {gestorAtual.setor === 'publico' ? 'Publico' : 'Privado'}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs',
                gestorAtual.nivel_hierarquico === 'estrategico' ? 'bg-purple-500/20 text-purple-400' :
                gestorAtual.nivel_hierarquico === 'tatico' ? 'bg-orange-500/20 text-orange-400' :
                'bg-cyan-500/20 text-cyan-400'
              )}>
                {gestorAtual.nivel_hierarquico.charAt(0).toUpperCase() + gestorAtual.nivel_hierarquico.slice(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metricas */}
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
                {processados}/{totalGestores}
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

      {/* Distribuicao por setor e nivel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Por Setor
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Publico
              </span>
              <span className="font-medium text-foreground">{contagemSetor.publico}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-400" />
                Privado
              </span>
              <span className="font-medium text-foreground">{contagemSetor.privado}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Por Nivel
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estrategico</span>
              <span className="font-medium text-purple-400">{contagemNivel.estrategico}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tatico</span>
              <span className="font-medium text-orange-400">{contagemNivel.tatico}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Operacional</span>
              <span className="font-medium text-cyan-400">{contagemNivel.operacional}</span>
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
            <span className="text-muted-foreground">Limite da sessao</span>
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

      {/* Últimas respostas com distribuição PODC */}
      {respostasRecebidas.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Últimas Respostas - Distribuição PODC
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {respostasRecebidas.slice(-5).reverse().map((resp, i) => (
              <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground text-sm">
                    {resp.gestor_nome}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      resp.setor === 'publico' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    )}>
                      {resp.setor}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      resp.nivel_hierarquico === 'estrategico' ? 'bg-purple-500/20 text-purple-400' :
                      resp.nivel_hierarquico === 'tatico' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    )}>
                      {resp.nivel_hierarquico}
                    </span>
                  </div>
                </div>

                {/* Distribuição PODC */}
                {resp.distribuicao_podc && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="text-center p-2 bg-blue-500/10 rounded">
                      <p className="text-xs text-muted-foreground">P</p>
                      <p className="text-sm font-bold text-blue-400">{resp.distribuicao_podc.planejar}%</p>
                    </div>
                    <div className="text-center p-2 bg-green-500/10 rounded">
                      <p className="text-xs text-muted-foreground">O</p>
                      <p className="text-sm font-bold text-green-400">{resp.distribuicao_podc.organizar}%</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded">
                      <p className="text-xs text-muted-foreground">D</p>
                      <p className="text-sm font-bold text-yellow-400">{resp.distribuicao_podc.dirigir}%</p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded">
                      <p className="text-xs text-muted-foreground">C</p>
                      <p className="text-sm font-bold text-red-400">{resp.distribuicao_podc.controlar}%</p>
                    </div>
                  </div>
                )}

                {/* IAD */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    IAD: <span className="font-medium text-foreground">{resp.iad?.toFixed(2) || 'N/A'}</span>
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded',
                    resp.iad && resp.iad >= 1.5 ? 'bg-green-500/20 text-green-400' :
                    resp.iad && resp.iad >= 1.0 ? 'bg-blue-500/20 text-blue-400' :
                    resp.iad && resp.iad >= 0.7 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  )}>
                    {resp.iad_classificacao || 'Não classificado'}
                  </span>
                  <span className="text-muted-foreground">
                    {formatarNumero(resp.tokens_usados)} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de salvamento no backend */}
      {sessaoAtual?.pesquisaIdBackend && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 text-green-400">
            <Database className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Resultados salvos no backend</p>
              <p className="text-xs text-muted-foreground">
                ID da pesquisa: {sessaoAtual.pesquisaIdBackend}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botao Ver Resultados */}
      {status === 'concluida' && (
        <div className="text-center">
          <Link
            href={`/gestores/resultados/${sessaoAtual?.id}`}
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
