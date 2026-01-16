'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Landmark,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Trash2,
  BarChart3,
  Users,
} from 'lucide-react';
import { cn, formatarNumero } from '@/lib/utils';

interface PesquisaParlamentar {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  status: 'rascunho' | 'executando' | 'pausada' | 'concluida' | 'erro';
  progresso: number;
  total_parlamentares: number;
  custo_estimado: number;
  custo_real: number;
  criado_em: string;
  concluido_em?: string;
}

const statusConfig = {
  rascunho: { label: 'Rascunho', icon: FileText, color: 'text-muted-foreground' },
  executando: { label: 'Executando', icon: Play, color: 'text-blue-400' },
  pausada: { label: 'Pausada', icon: Pause, color: 'text-yellow-400' },
  concluida: { label: 'Concluída', icon: CheckCircle2, color: 'text-green-400' },
  erro: { label: 'Erro', icon: AlertCircle, color: 'text-red-400' },
};

export default function PaginaPesquisasParlamentares() {
  const [pesquisas, setPesquisas] = useState<PesquisaParlamentar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  useEffect(() => {
    carregarPesquisas();
  }, []);

  async function carregarPesquisas() {
    try {
      const response = await fetch('/api/v1/pesquisas-parlamentares');
      if (response.ok) {
        const dados = await response.json();
        setPesquisas(dados.pesquisas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pesquisas:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function deletarPesquisa(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta pesquisa?')) return;

    try {
      const response = await fetch(`/api/v1/pesquisas-parlamentares/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPesquisas(pesquisas.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar pesquisa:', error);
    }
  }

  const pesquisasFiltradas = pesquisas.filter(p => {
    if (busca && !p.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    if (filtroStatus && p.status !== filtroStatus) return false;
    return true;
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando pesquisas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Landmark className="w-7 h-7 text-primary" />
            Pesquisas Parlamentares
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatarNumero(pesquisas.length)} pesquisas criadas
          </p>
        </div>

        <Link
          href="/pesquisas-parlamentares/nova"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Pesquisa
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar pesquisas..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="executando">Executando</option>
          <option value="pausada">Pausada</option>
          <option value="concluida">Concluída</option>
          <option value="erro">Erro</option>
        </select>
      </div>

      {/* Lista de pesquisas */}
      {pesquisasFiltradas.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Landmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhuma pesquisa encontrada</h3>
          <p className="text-muted-foreground mt-2">
            {busca || filtroStatus
              ? 'Tente ajustar os filtros de busca'
              : 'Crie sua primeira pesquisa com parlamentares'}
          </p>
          {!busca && !filtroStatus && (
            <Link
              href="/pesquisas-parlamentares/nova"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Pesquisa
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {pesquisasFiltradas.map(pesquisa => {
            const StatusIcon = statusConfig[pesquisa.status]?.icon || FileText;
            const statusColor = statusConfig[pesquisa.status]?.color || 'text-muted-foreground';

            return (
              <div
                key={pesquisa.id}
                className="glass-card rounded-xl p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/pesquisas-parlamentares/${pesquisa.id}`}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {pesquisa.titulo}
                      </Link>
                      <span className={cn('flex items-center gap-1 text-sm', statusColor)}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig[pesquisa.status]?.label || pesquisa.status}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {pesquisa.descricao || 'Sem descrição'}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {pesquisa.total_parlamentares} parlamentares
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(pesquisa.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      {pesquisa.status === 'executando' && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          {pesquisa.progresso}%
                        </span>
                      )}
                    </div>

                    {/* Barra de progresso */}
                    {pesquisa.status === 'executando' && (
                      <div className="mt-3 w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${pesquisa.progresso}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {pesquisa.status === 'concluida' && (
                      <Link
                        href={`/pesquisas-parlamentares/${pesquisa.id}/resultados`}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="Ver resultados"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </Link>
                    )}
                    <button
                      onClick={() => deletarPesquisa(pesquisa.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Excluir pesquisa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
