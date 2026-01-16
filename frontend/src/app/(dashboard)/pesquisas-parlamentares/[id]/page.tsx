'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Landmark,
  Play,
  Pause,
  Square,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Settings,
} from 'lucide-react';
import { cn, formatarNumero } from '@/lib/utils';

interface Pergunta {
  id: string;
  texto: string;
  tipo: string;
  opcoes?: string[];
}

interface PesquisaParlamentar {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  instrucao_geral?: string;
  perguntas: Pergunta[];
  parlamentares_ids: string[];
  total_parlamentares: number;
  status: 'rascunho' | 'executando' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  custo_estimado: number;
  custo_real: number;
  tokens_entrada_total: number;
  tokens_saida_total: number;
  criado_em: string;
  iniciado_em?: string;
  concluido_em?: string;
  erro_mensagem?: string;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', icon: FileText, color: 'text-muted-foreground', bg: 'bg-secondary' },
  executando: { label: 'Executando', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  pausada: { label: 'Pausada', icon: Pause, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  concluida: { label: 'Concluída', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
  erro: { label: 'Erro', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function PaginaDetalhesPesquisaParlamentar() {
  const params = useParams();
  const router = useRouter();
  const pesquisaId = params.id as string;

  const [pesquisa, setPesquisa] = useState<PesquisaParlamentar | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [executando, setExecutando] = useState(false);

  // Configurações de execução
  const [limiteCusto, setLimiteCusto] = useState(100);
  const [batchSize, setBatchSize] = useState(5);

  useEffect(() => {
    carregarPesquisa();
  }, [pesquisaId]);

  useEffect(() => {
    // Polling para atualizar progresso durante execução
    if (pesquisa?.status === 'executando') {
      const interval = setInterval(carregarPesquisa, 3000);
      return () => clearInterval(interval);
    }
  }, [pesquisa?.status]);

  async function carregarPesquisa() {
    try {
      const response = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}`);
      if (!response.ok) throw new Error('Pesquisa não encontrada');
      const dados = await response.json();
      setPesquisa(dados);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar pesquisa');
    } finally {
      setCarregando(false);
    }
  }

  async function iniciarExecucao() {
    if (!pesquisa) return;

    try {
      setExecutando(true);

      const response = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}/executar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limite_custo_reais: limiteCusto,
          batch_size: batchSize,
          delay_entre_batches_ms: 500,
        }),
      });

      if (response.ok) {
        await carregarPesquisa();
      } else {
        const erro = await response.json();
        throw new Error(erro.detail || 'Erro ao iniciar execução');
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao iniciar execução');
    } finally {
      setExecutando(false);
    }
  }

  async function pausarExecucao() {
    try {
      const response = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}/pausar`, {
        method: 'POST',
      });

      if (response.ok) {
        await carregarPesquisa();
      }
    } catch (error) {
      console.error('Erro ao pausar:', error);
    }
  }

  async function cancelarExecucao() {
    if (!confirm('Tem certeza que deseja cancelar a execução?')) return;

    try {
      const response = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}/cancelar`, {
        method: 'POST',
      });

      if (response.ok) {
        await carregarPesquisa();
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (erro || !pesquisa) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Erro ao carregar pesquisa</p>
          <p className="text-sm text-muted-foreground mt-2">{erro}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[pesquisa.status]?.icon || FileText;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Landmark className="w-7 h-7 text-primary" />
            {pesquisa.titulo}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-sm',
                statusConfig[pesquisa.status]?.bg,
                statusConfig[pesquisa.status]?.color
              )}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig[pesquisa.status]?.label}
            </span>
            <span className="text-muted-foreground text-sm">
              Criada em {new Date(pesquisa.criado_em).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {pesquisa.status === 'concluida' && (
            <Link
              href={`/pesquisas-parlamentares/${pesquisaId}/resultados`}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Resultados
            </Link>
          )}

          {pesquisa.status === 'rascunho' && (
            <button
              onClick={iniciarExecucao}
              disabled={executando}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Iniciar Execução
            </button>
          )}

          {pesquisa.status === 'executando' && (
            <>
              <button
                onClick={pausarExecucao}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </button>
              <button
                onClick={cancelarExecucao}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Square className="w-4 h-4" />
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progresso (se executando) */}
      {pesquisa.status === 'executando' && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Progresso da Execução</h3>
            <span className="text-2xl font-bold text-primary">{pesquisa.progresso}%</span>
          </div>

          <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${pesquisa.progresso}%` }}
            />
          </div>

          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>Custo atual: R$ {pesquisa.custo_real?.toFixed(2) || '0.00'}</span>
            <span>Tokens: {formatarNumero(pesquisa.tokens_entrada_total + pesquisa.tokens_saida_total)}</span>
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatarNumero(pesquisa.total_parlamentares)}</p>
              <p className="text-sm text-muted-foreground">Parlamentares</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pesquisa.perguntas?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Perguntas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {pesquisa.custo_estimado?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Custo Estimado</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {pesquisa.custo_real?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Custo Real</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações de execução (se rascunho) */}
      {pesquisa.status === 'rascunho' && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-medium text-foreground flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            Configurações de Execução
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Limite de Custo (R$)</label>
              <input
                type="number"
                value={limiteCusto}
                onChange={e => setLimiteCusto(Number(e.target.value))}
                min={1}
                max={500}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-1">Tamanho do Batch</label>
              <input
                type="number"
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
                min={1}
                max={20}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Descrição */}
      {pesquisa.descricao && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">Descrição</h3>
          <p className="text-muted-foreground">{pesquisa.descricao}</p>
        </div>
      )}

      {/* Perguntas */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-medium text-foreground mb-4">Perguntas ({pesquisa.perguntas?.length || 0})</h3>

        <div className="space-y-4">
          {pesquisa.perguntas?.map((pergunta, index) => (
            <div key={pergunta.id} className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/20 text-primary rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="text-foreground">{pergunta.texto}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">Tipo: {pergunta.tipo}</p>
                  {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pergunta.opcoes.map((opcao, i) => (
                        <span key={i} className="px-2 py-1 bg-secondary rounded text-xs text-foreground">
                          {opcao}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Erro (se houver) */}
      {pesquisa.erro_mensagem && (
        <div className="glass-card rounded-xl p-6 border border-red-500/30">
          <h3 className="font-medium text-red-400 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            Erro na Execução
          </h3>
          <p className="text-muted-foreground">{pesquisa.erro_mensagem}</p>
        </div>
      )}
    </div>
  );
}
