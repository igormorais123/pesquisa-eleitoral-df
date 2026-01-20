'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import Link from 'next/link';
import {
  Grid3X3,
  List,
  Filter,
  Download,
  Sparkles,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  Activity,
  Building2,
  X,
} from 'lucide-react';
import { useGestores } from '@/hooks/useGestores';
import { GestorCard } from '@/components/gestores/GestorCard';
import { GestoresFilters } from '@/components/gestores/GestoresFilters';
import { GestoresCharts } from '@/components/gestores/GestoresCharts';
import { GestoresInsights } from '@/components/gestores/GestoresInsights';
import { GestoresMiniDashboard } from '@/components/gestores/GestoresMiniDashboard';
import { cn, formatarNumero } from '@/lib/utils';

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

function GestoresContent() {
  const {
    gestores,
    gestoresFiltrados,
    gestoresSelecionados,
    estatisticas,
    contagemPorSetor,
    contagemPorNivel,
    carregando,
    erro,
    filtros,
    setorAtivo,
    nivelAtivo,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    setFiltros,
    limparFiltros,
    setSetorAtivo,
    setNivelAtivo,
  } = useGestores();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('cards');
  const [painelFiltros, setPainelFiltros] = useState(true);
  const [mostrarMiniDashboard, setMostrarMiniDashboard] = useState(true);
  const [exportMenuAberto, setExportMenuAberto] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(gestoresFiltrados.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 520,
    overscan: 5,
  });

  const listVirtualizer = useVirtualizer({
    count: gestoresFiltrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 10,
  });

  const handleToggleSelecao = useCallback(
    (id: string) => {
      toggleSelecionarParaPesquisa(id);
    },
    [toggleSelecionarParaPesquisa]
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
          <p className="mt-6 text-muted-foreground text-lg">Carregando gestores...</p>
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
            Gestores
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Lideranças do setor público e privado do DF
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
              {contagemPorSetor.publico || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Setor Público</div>
          </motion.div>
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              {contagemPorSetor.privado || 0}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Setor Privado</div>
          </motion.div>
          <motion.div variants={fadeIn} className="text-center">
            <div className="text-3xl sm:text-4xl font-semibold text-foreground">
              {gestoresSelecionados.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Selecionados</div>
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
              {gestoresSelecionados.length > 0 && (
                <button
                  onClick={limparSelecao}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpar ({gestoresSelecionados.length})
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
                    onClick={() => setExportMenuAberto(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Excel
                  </button>
                  <button
                    onClick={() => setExportMenuAberto(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    PDF
                  </button>
                </motion.div>
              )}
            </div>

            {/* Nova Pesquisa - CTA Principal */}
            <Link
              href="/gestores/entrevistas"
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all',
                gestoresSelecionados.length > 0
                  ? 'bg-foreground text-background hover:opacity-90'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {gestoresSelecionados.length > 0
                ? `Pesquisar ${gestoresSelecionados.length}`
                : 'Nova Pesquisa'}
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
      </motion.header>

      {/* Conteúdo principal */}
      <motion.div variants={fadeIn} className="flex-1 flex gap-6 min-h-0">
        {/* Painel de Filtros */}
        {painelFiltros && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-80 flex-shrink-0 bg-card border border-border rounded-2xl p-5 overflow-y-auto"
          >
            <GestoresFilters
              filtros={filtros}
              onFiltrosChange={setFiltros}
              onLimpar={limparFiltros}
              setorAtivo={setorAtivo}
              onSetorChange={setSetorAtivo}
              nivelAtivo={nivelAtivo}
              onNivelChange={setNivelAtivo}
              totalGestores={estatisticas.total}
              totalFiltrados={estatisticas.filtrados}
              contagemPorSetor={contagemPorSetor}
              contagemPorNivel={contagemPorNivel}
            />
          </motion.aside>
        )}

        {/* Lista/Grid/Gráficos/Insights */}
        <div className="flex-1 min-w-0 flex gap-5">
          <div className="flex-1 min-w-0">
            {visualizacao === 'graficos' ? (
              <GestoresCharts gestores={gestoresFiltrados} />
            ) : visualizacao === 'insights' ? (
              <GestoresInsights gestores={gestoresFiltrados} />
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
                      const rowGestores = gestoresFiltrados.slice(startIndex, startIndex + 3);

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
                            {rowGestores.map((gestor) => (
                              <GestorCard
                                key={gestor.id}
                                gestor={gestor}
                                selecionado={gestoresSelecionados.includes(gestor.id)}
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
                      const gestor = gestoresFiltrados[virtualItem.index];

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
                          <GestorCard
                            gestor={gestor}
                            selecionado={gestoresSelecionados.includes(gestor.id)}
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
              className="w-72 flex-shrink-0"
            >
              <GestoresMiniDashboard
                gestores={gestoresFiltrados}
                totalGeral={estatisticas.total}
              />
            </motion.aside>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Wrapper com Suspense
export default function PaginaGestores() {
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
      <GestoresContent />
    </Suspense>
  );
}
