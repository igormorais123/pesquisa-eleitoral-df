'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
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
  Home,
  Building2,
} from 'lucide-react';
import { useGestores } from '@/hooks/useGestores';
import { GestorCard } from '@/components/gestores/GestorCard';
import { GestoresFilters } from '@/components/gestores/GestoresFilters';
import { GestoresCharts } from '@/components/gestores/GestoresCharts';
import { GestoresInsights } from '@/components/gestores/GestoresInsights';
import { GestoresMiniDashboard } from '@/components/gestores/GestoresMiniDashboard';
import { cn, formatarNumero } from '@/lib/utils';

type VisualizacaoTipo = 'cards' | 'lista' | 'graficos' | 'insights';

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

  // Referência para virtualização
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualização para cards
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(gestoresFiltrados.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 520,
    overscan: 5,
  });

  // Virtualização para lista
  const listVirtualizer = useVirtualizer({
    count: gestoresFiltrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 10,
  });

  // Handlers
  const handleToggleSelecao = useCallback(
    (id: string) => {
      toggleSelecionarParaPesquisa(id);
    },
    [toggleSelecionarParaPesquisa]
  );

  // Loading state
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando gestores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar gestores</p>
          <p className="text-sm mt-2">{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-7 h-7 text-primary" />
              Gestores Publicos e Privados
            </h1>
            <p className="text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{formatarNumero(estatisticas.filtrados)}</span>
              {' '}de {formatarNumero(estatisticas.total)} gestores
              {gestoresSelecionados.length > 0 && (
                <span className="ml-2 text-primary">
                  • {formatarNumero(gestoresSelecionados.length)} selecionados
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown de Exportação */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Exportar
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-secondary/95 backdrop-blur border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 rounded-t-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-400" />
                  Excel ({gestoresFiltrados.length})
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 rounded-b-lg transition-colors"
                >
                  <FileDown className="w-4 h-4 text-red-400" />
                  PDF ({gestoresFiltrados.length})
                </button>
              </div>
            </div>

            <Link
              href="/gestores/entrevistas"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                gestoresSelecionados.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {gestoresSelecionados.length > 0
                ? `Pesquisar ${gestoresSelecionados.length}`
                : 'Nova Pesquisa'}
            </Link>
          </div>
        </div>

        {/* Barra de ações */}
        <div className="flex items-center justify-between mt-4 py-3 px-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-4">
            {/* Link para Dashboard */}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Toggle Filtros */}
            <button
              onClick={() => setPainelFiltros(!painelFiltros)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                painelFiltros
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            {/* Toggle Mini Dashboard */}
            <button
              onClick={() => setMostrarMiniDashboard(!mostrarMiniDashboard)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                mostrarMiniDashboard
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Activity className="w-4 h-4" />
              Resumo
            </button>

            {/* Seleção */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={selecionarTodos}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Selecionar todos ({gestoresFiltrados.length})
              </button>
              {gestoresSelecionados.length > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={limparSelecao}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar selecao
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Visualização */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <button
              onClick={() => setVisualizacao('cards')}
              className={cn(
                'p-2 rounded-md transition-colors',
                visualizacao === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Visualizacao em cards"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisualizacao('lista')}
              className={cn(
                'p-2 rounded-md transition-colors',
                visualizacao === 'lista'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Visualizacao em lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisualizacao('graficos')}
              className={cn(
                'p-2 rounded-md transition-colors',
                visualizacao === 'graficos'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Visualizacao em graficos"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVisualizacao('insights')}
              className={cn(
                'p-2 rounded-md transition-colors',
                visualizacao === 'insights'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Insights Inteligentes"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Painel de Filtros */}
        {painelFiltros && (
          <div className="w-80 flex-shrink-0 glass-card rounded-xl p-4 overflow-y-auto">
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
          </div>
        )}

        {/* Lista/Grid/Gráficos/Insights */}
        <div className="flex-1 min-w-0 flex gap-4">
          <div className="flex-1 min-w-0">
            {visualizacao === 'graficos' ? (
              <GestoresCharts gestores={gestoresFiltrados} />
            ) : visualizacao === 'insights' ? (
              <GestoresInsights gestores={gestoresFiltrados} />
            ) : (
              <div
                ref={parentRef}
                className="h-full overflow-y-auto pr-2"
                style={{ contain: 'strict' }}
              >
                {visualizacao === 'cards' ? (
                  // Grid de Cards Virtualizado
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
                  // Lista Virtualizada
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

          {/* Mini Dashboard - Resumo do grupo filtrado */}
          {mostrarMiniDashboard && visualizacao !== 'graficos' && visualizacao !== 'insights' && (
            <div className="w-72 flex-shrink-0">
              <GestoresMiniDashboard
                gestores={gestoresFiltrados}
                totalGeral={estatisticas.total}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper com Suspense
export default function PaginaGestores() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      }
    >
      <GestoresContent />
    </Suspense>
  );
}
