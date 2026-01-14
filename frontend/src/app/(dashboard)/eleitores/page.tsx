'use client';

import { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import Link from 'next/link';
import {
  Users,
  Grid3X3,
  List,
  Filter,
  Download,
  Upload,
  Sparkles,
  CheckSquare,
  Square,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEleitores } from '@/hooks/useEleitores';
import { AgenteCard } from '@/components/agentes/AgenteCard';
import { AgentesFilters } from '@/components/agentes/AgentesFilters';
import { AgentesCharts } from '@/components/agentes/AgentesCharts';
import { cn, formatarNumero } from '@/lib/utils';

type VisualizacaoTipo = 'cards' | 'lista' | 'graficos';

export default function PaginaEleitores() {
  const {
    eleitoresFiltrados,
    eleitoresSelecionados,
    estatisticas,
    carregando,
    erro,
    filtros,
    filtrosAbertos,
    toggleSelecionarParaEntrevista,
    selecionarTodos,
    limparSelecao,
    setFiltros,
    limparFiltros,
    toggleFiltros,
  } = useEleitores();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('cards');
  const [painelFiltros, setPainelFiltros] = useState(true);

  // Referência para virtualização
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualização para cards
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(eleitoresFiltrados.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 420,
    overscan: 5,
  });

  // Virtualização para lista
  const listVirtualizer = useVirtualizer({
    count: eleitoresFiltrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  // Handlers
  const handleToggleSelecao = useCallback(
    (id: string) => {
      toggleSelecionarParaEntrevista(id);
    },
    [toggleSelecionarParaEntrevista]
  );

  // Loading state
  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando eleitores...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar eleitores</p>
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
              <Users className="w-7 h-7 text-primary" />
              Eleitores Sintéticos
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatarNumero(estatisticas.total)} agentes cadastrados •{' '}
              {formatarNumero(eleitoresSelecionados.length)} selecionados
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Ações rápidas */}
            <Link
              href="/eleitores/upload"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Link>
            <Link
              href="/entrevistas/nova"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                eleitoresSelecionados.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {eleitoresSelecionados.length > 0
                ? `Entrevistar ${eleitoresSelecionados.length}`
                : 'Nova Entrevista'}
            </Link>
          </div>
        </div>

        {/* Barra de ações */}
        <div className="flex items-center justify-between mt-4 py-3 px-4 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-4">
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

            {/* Seleção */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={selecionarTodos}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Selecionar todos ({eleitoresFiltrados.length})
              </button>
              {eleitoresSelecionados.length > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <button
                    onClick={limparSelecao}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar seleção
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
              title="Visualização em cards"
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
              title="Visualização em lista"
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
              title="Visualização em gráficos"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Painel de Filtros */}
        {painelFiltros && (
          <div className="w-72 flex-shrink-0 glass-card rounded-xl p-4 overflow-y-auto">
            <AgentesFilters
              filtros={filtros}
              onFiltrosChange={setFiltros}
              onLimpar={limparFiltros}
              totalEleitores={estatisticas.total}
              totalFiltrados={estatisticas.filtrados}
            />
          </div>
        )}

        {/* Lista/Grid/Gráficos */}
        <div className="flex-1 min-w-0">
          {visualizacao === 'graficos' ? (
            <AgentesCharts estatisticas={estatisticas} eleitores={eleitoresFiltrados} />
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
                // Lista Virtualizada
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
      </div>
    </div>
  );
}
