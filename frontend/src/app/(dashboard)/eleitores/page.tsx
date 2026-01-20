'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Grid3X3,
  List,
  Filter,
  Download,
  Upload,
  Sparkles,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  FileDown,
  FileText,
  ChevronDown,
  Activity,
  Search,
  X,
  Check,
} from 'lucide-react';
import { useEleitores } from '@/hooks/useEleitores';
import { exportarEleitoresCSV, exportarEleitoresExcel, exportarEleitoresPDF, exportarEleitoresMD } from '@/lib/export';
import { AgenteCard } from '@/components/agentes/AgenteCard';
import { AgentesFilters } from '@/components/agentes/AgentesFilters';
import { AgentesCharts } from '@/components/agentes/AgentesCharts';
import { AgentesInsights } from '@/components/agentes/AgentesInsights';
import { MiniDashboard } from '@/components/agentes/MiniDashboard';
import { FiltrosAtivos } from '@/components/agentes/FiltrosAtivos';
import { cn, formatarNumero } from '@/lib/utils';
import { useUrlFilters } from '@/hooks/useFilterNavigation';

type VisualizacaoTipo = 'cards' | 'lista' | 'graficos' | 'insights';

// Animações suaves estilo Apple
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

function EleitoresContent() {
  const {
    eleitores,
    eleitoresFiltrados,
    eleitoresSelecionados,
    estatisticas,
    carregando,
    erro,
    filtros,
    toggleSelecionarParaEntrevista,
    selecionarTodos,
    limparSelecao,
    setFiltros,
    limparFiltros,
  } = useEleitores();

  useUrlFilters();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('cards');
  const [painelFiltros, setPainelFiltros] = useState(true);
  const [mostrarMiniDashboard, setMostrarMiniDashboard] = useState(true);
  const [exportMenuAberto, setExportMenuAberto] = useState(false);

  const filtrosAtivos = Object.entries(filtros).filter(
    ([, value]) => value && (Array.isArray(value) ? value.length > 0 : value.length > 0)
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(eleitoresFiltrados.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420,
    overscan: 5,
  });

  const listVirtualizer = useVirtualizer({
    count: eleitoresFiltrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const handleToggleSelecao = useCallback(
    (id: string) => {
      toggleSelecionarParaEntrevista(id);
    },
    [toggleSelecionarParaEntrevista]
  );

  const handleRemoverFiltro = useCallback(
    (tipo: string, valor?: string) => {
      const filtroAtual = filtros[tipo as keyof typeof filtros];
      if (Array.isArray(filtroAtual) && valor) {
        const novosFiltros = filtroAtual.filter((v: string) => v !== valor);
        setFiltros({ [tipo]: novosFiltros } as any);
      } else {
        setFiltros({ [tipo]: [] } as any);
      }
    },
    [filtros, setFiltros]
  );

  // Loading elegante
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
          <p className="mt-6 text-muted-foreground text-lg">Carregando perfis...</p>
        </motion.div>
      </div>
    );
  }

  // Error elegante
  if (erro) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground">{erro}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="h-full flex flex-col"
    >
      {/* Hero Header - Estilo Apple */}
      <motion.header variants={fadeIn} className="mb-8">
        {/* Título principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Eleitores Sintéticos
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            {formatarNumero(estatisticas.total)} perfis únicos. 60+ atributos cada.
          </p>
        </div>

        {/* Números em destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              {formatarNumero(estatisticas.filtrados)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Exibindo</div>
          </motion.div>
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              {eleitoresSelecionados.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Selecionados</div>
          </motion.div>
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              {filtrosAtivos.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Filtros Ativos</div>
          </motion.div>
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              60+
            </div>
            <div className="text-sm text-muted-foreground mt-1">Atributos</div>
          </motion.div>
        </div>

        {/* Barra de ações - Design limpo */}
        <motion.div
          variants={fadeIn}
          className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border"
        >
          {/* Lado esquerdo - Controles */}
          <div className="flex items-center gap-2">
            {/* Toggle Filtros */}
            <button
              onClick={() => setPainelFiltros(!painelFiltros)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                painelFiltros
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              )}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            {/* Toggle Resumo */}
            <button
              onClick={() => setMostrarMiniDashboard(!mostrarMiniDashboard)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                mostrarMiniDashboard
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              )}
            >
              <Activity className="w-4 h-4" />
              Resumo
            </button>

            {/* Seleção */}
            <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <button
                onClick={selecionarTodos}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Selecionar todos
              </button>
              {eleitoresSelecionados.length > 0 && (
                <button
                  onClick={limparSelecao}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpar ({eleitoresSelecionados.length})
                </button>
              )}
            </div>
          </div>

          {/* Lado direito - Ações e Visualização */}
          <div className="flex items-center gap-3">
            {/* Dropdown Exportar */}
            <div className="relative">
              <button
                onClick={() => setExportMenuAberto(!exportMenuAberto)}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', exportMenuAberto && 'rotate-180')} />
              </button>

              {exportMenuAberto && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  <button
                    onClick={async () => {
                      await exportarEleitoresExcel(eleitoresFiltrados);
                      setExportMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Excel
                  </button>
                  <button
                    onClick={() => {
                      exportarEleitoresCSV(eleitoresFiltrados);
                      setExportMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    CSV
                  </button>
                  <button
                    onClick={async () => {
                      await exportarEleitoresPDF(eleitoresFiltrados);
                      setExportMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      exportarEleitoresMD(eleitoresFiltrados, `eleitores-${new Date().toISOString().split('T')[0]}`);
                      setExportMenuAberto(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="w-4 h-4 text-cyan-500" />
                    Markdown
                  </button>
                </motion.div>
              )}
            </div>

            {/* Upload */}
            <Link
              href="/eleitores/upload"
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Link>

            {/* Entrevistar - CTA Principal */}
            <Link
              href="/entrevistas/nova"
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all',
                eleitoresSelecionados.length > 0
                  ? 'bg-foreground text-background hover:opacity-90'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {eleitoresSelecionados.length > 0
                ? `Entrevistar ${eleitoresSelecionados.length}`
                : 'Nova Entrevista'}
            </Link>

            {/* Separador */}
            <div className="w-px h-8 bg-border hidden sm:block" />

            {/* Visualização */}
            <div className="flex items-center bg-muted rounded-full p-1">
              <button
                onClick={() => setVisualizacao('cards')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  visualizacao === 'cards'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Cards"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualizacao('lista')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  visualizacao === 'lista'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualizacao('graficos')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  visualizacao === 'graficos'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Gráficos"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualizacao('insights')}
                className={cn(
                  'p-2 rounded-full transition-all',
                  visualizacao === 'insights'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Insights"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filtros Ativos */}
        {filtrosAtivos.length > 0 && (
          <motion.div variants={fadeIn} className="mt-4">
            <FiltrosAtivos
              filtros={filtros}
              onRemoverFiltro={handleRemoverFiltro}
              onLimparTodos={limparFiltros}
              totalFiltrados={estatisticas.filtrados}
              totalGeral={estatisticas.total}
            />
          </motion.div>
        )}
      </motion.header>

      {/* Conteúdo principal */}
      <motion.div variants={fadeIn} className="flex-1 flex gap-6 min-h-0">
        {/* Painel de Filtros */}
        {painelFiltros && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-72 flex-shrink-0 bg-card border border-border rounded-2xl p-5 overflow-y-auto"
          >
            <AgentesFilters
              filtros={filtros}
              onFiltrosChange={setFiltros}
              onLimpar={limparFiltros}
              totalEleitores={estatisticas.total}
              totalFiltrados={estatisticas.filtrados}
            />
          </motion.aside>
        )}

        {/* Lista/Grid/Gráficos/Insights */}
        <div className="flex-1 min-w-0 flex gap-5">
          <div className="flex-1 min-w-0">
            {visualizacao === 'graficos' ? (
              <AgentesCharts estatisticas={estatisticas} eleitores={eleitoresFiltrados} />
            ) : visualizacao === 'insights' ? (
              <AgentesInsights eleitores={eleitores} eleitoresFiltrados={eleitoresFiltrados} />
            ) : (
              <div
                ref={parentRef}
                className="h-full overflow-y-auto pr-2 scrollbar-thin"
                style={{ contain: 'strict' }}
              >
                {visualizacao === 'cards' ? (
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const startIndex = virtualRow.index * 3;
                      const rowEleitores = eleitoresFiltrados.slice(startIndex, startIndex + 3);

                      return (
                        <div
                          key={virtualRow.key}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {rowEleitores.map((eleitor) => (
                              <AgenteCard
                                key={eleitor.id}
                                eleitor={eleitor}
                                selecionado={eleitoresSelecionados.includes(eleitor.id)}
                                onToggleSelecao={handleToggleSelecao}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      height: `${listVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {listVirtualizer.getVirtualItems().map((virtualItem) => {
                      const eleitor = eleitoresFiltrados[virtualItem.index];

                      return (
                        <div
                          key={virtualItem.key}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <AgenteCard
                            eleitor={eleitor}
                            selecionado={eleitoresSelecionados.includes(eleitor.id)}
                            onToggleSelecao={handleToggleSelecao}
                            compacto
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mini Dashboard */}
          {mostrarMiniDashboard && visualizacao !== 'graficos' && visualizacao !== 'insights' && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 xl:w-96 flex-shrink-0"
            >
              <MiniDashboard eleitores={eleitoresFiltrados} totalGeral={estatisticas.total} />
            </motion.aside>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Wrapper com Suspense
export default function PaginaEleitores() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-6 text-muted-foreground text-lg">Carregando...</p>
          </div>
        </div>
      }
    >
      <EleitoresContent />
    </Suspense>
  );
}
