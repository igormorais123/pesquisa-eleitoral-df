'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
} from 'lucide-react';

import {
  PesquisaResumo,
  StatusPesquisa,
  TipoPesquisa,
  listarPesquisas,
  deletarPesquisa,
  formatarStatus,
  corStatus,
} from '@/services/pesquisas-api';
import { formatarReais } from '@/services/analytics-api';

// ============================================
// ÍCONES POR STATUS
// ============================================

const iconesStatus: Record<StatusPesquisa, React.ElementType> = {
  rascunho: FileText,
  executando: Play,
  pausada: Pause,
  concluida: CheckCircle,
  erro: XCircle,
};

// ============================================
// COMPONENTE DE FILTROS
// ============================================

function FiltrosBar({
  filtros,
  setFiltros,
  onBuscar,
}: {
  filtros: { status?: StatusPesquisa; tipo?: TipoPesquisa; busca?: string };
  setFiltros: (f: typeof filtros) => void;
  onBuscar: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Busca */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filtros.busca || ''}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && onBuscar()}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status */}
        <select
          value={filtros.status || ''}
          onChange={(e) =>
            setFiltros({
              ...filtros,
              status: e.target.value as StatusPesquisa || undefined,
            })
          }
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="executando">Em execução</option>
          <option value="pausada">Pausada</option>
          <option value="concluida">Concluída</option>
          <option value="erro">Erro</option>
        </select>

        {/* Tipo */}
        <select
          value={filtros.tipo || ''}
          onChange={(e) =>
            setFiltros({
              ...filtros,
              tipo: e.target.value as TipoPesquisa || undefined,
            })
          }
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os tipos</option>
          <option value="quantitativa">Quantitativa</option>
          <option value="qualitativa">Qualitativa</option>
          <option value="mista">Mista</option>
        </select>

        {/* Botão Buscar */}
        <button
          onClick={onBuscar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE LINHA DA TABELA
// ============================================

function PesquisaRow({
  pesquisa,
  onDelete,
}: {
  pesquisa: PesquisaResumo;
  onDelete: (id: string) => void;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const IconeStatus = iconesStatus[pesquisa.status];

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              pesquisa.status === 'concluida'
                ? 'bg-green-100 text-green-600'
                : pesquisa.status === 'executando'
                ? 'bg-blue-100 text-blue-600'
                : pesquisa.status === 'erro'
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <IconeStatus className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {pesquisa.titulo}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {pesquisa.tipo}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${corStatus(pesquisa.status)}`}>
          {formatarStatus(pesquisa.status)}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
        {pesquisa.total_eleitores}
      </td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
        {pesquisa.total_respostas}
      </td>
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
        {formatarReais(pesquisa.custo_real)}
      </td>
      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(pesquisa.criado_em).toLocaleDateString('pt-BR')}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {menuAberto && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuAberto(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <Link
                  href={`/pesquisas/${pesquisa.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver detalhes
                </Link>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    onDelete(pesquisa.id);
                    setMenuAberto(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================
// COMPONENTE DE PAGINAÇÃO
// ============================================

function Paginacao({
  pagina,
  totalPaginas,
  onPagina,
}: {
  pagina: number;
  totalPaginas: number;
  onPagina: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Página {pagina} de {totalPaginas}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPagina(pagina - 1)}
          disabled={pagina <= 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPagina(pagina + 1)}
          disabled={pagina >= totalPaginas}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function HistoricoPage() {
  const [pesquisas, setPesquisas] = useState<PesquisaResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState<{
    status?: StatusPesquisa;
    tipo?: TipoPesquisa;
    busca?: string;
  }>({});

  const carregarPesquisas = async (pag = pagina) => {
    setCarregando(true);
    try {
      const response = await listarPesquisas(filtros, pag, 15);
      setPesquisas(response.pesquisas);
      setTotalPaginas(response.total_paginas);
      setTotal(response.total);
      setPagina(response.pagina);
    } catch (error) {
      console.error('Erro ao carregar pesquisas:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta pesquisa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deletarPesquisa(id);
      carregarPesquisas();
    } catch (error) {
      console.error('Erro ao deletar pesquisa:', error);
    }
  };

  useEffect(() => {
    carregarPesquisas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Histórico de Pesquisas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {total} pesquisas encontradas
            </p>
          </div>
          <button
            onClick={() => carregarPesquisas(1)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Filtros */}
        <FiltrosBar
          filtros={filtros}
          setFiltros={setFiltros}
          onBuscar={() => carregarPesquisas(1)}
        />

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {carregando ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Carregando...</p>
            </div>
          ) : pesquisas.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma pesquisa encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {Object.keys(filtros).length > 0
                  ? 'Tente ajustar os filtros ou limpar a busca.'
                  : 'Crie sua primeira pesquisa para começar a coletar dados.'}
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pesquisa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Eleitores
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Respostas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Custo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pesquisas.map((pesquisa) => (
                    <PesquisaRow
                      key={pesquisa.id}
                      pesquisa={pesquisa}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>

              {totalPaginas > 1 && (
                <Paginacao
                  pagina={pagina}
                  totalPaginas={totalPaginas}
                  onPagina={carregarPesquisas}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
