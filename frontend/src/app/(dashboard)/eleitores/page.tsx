'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
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
  Lightbulb,
  X,
  Home,
  ArrowLeft,
} from 'lucide-react';
import { useEleitores } from '@/hooks/useEleitores';
import { useUrlFilters, FILTER_LABELS, FilterType } from '@/hooks/useFilterNavigation';
import { AgenteCard } from '@/components/agentes/AgenteCard';
import { AgentesFilters } from '@/components/agentes/AgentesFilters';
import { AgentesCharts } from '@/components/agentes/AgentesCharts';
import { AgentesInsights } from '@/components/agentes/AgentesInsights';
import { MiniDashboard } from '@/components/eleitores/MiniDashboard';
import { cn, formatarNumero } from '@/lib/utils';

type VisualizacaoTipo = 'cards' | 'lista' | 'graficos' | 'insights';

// Componente separado que usa useSearchParams
function EleitoresContent() {
  const {
    eleitores,
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

  // Aplicar filtros da URL
  useUrlFilters();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('cards');
  const [painelFiltros, setPainelFiltros] = useState(true);
  const [mostrarMiniDashboard, setMostrarMiniDashboard] = useState(true);

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

  // Calcular filtros ativos para mostrar badges
  const filtrosAtivos = useMemo(() => {
    const ativos: Array<{ tipo: FilterType; valor: string; label: string }> = [];

    const checkFilter = (tipo: FilterType, valores: string[] | undefined) => {
      if (valores && valores.length > 0) {
        valores.forEach((valor) => {
          const label = FILTER_LABELS[tipo]?.[valor] || valor;
          ativos.push({ tipo, valor, label });
        });
      }
    };

    checkFilter('generos', filtros.generos);
    checkFilter('clusters', filtros.clusters);
    checkFilter('regioes', filtros.regioes);
    checkFilter('religioes', filtros.religioes);
    checkFilter('orientacoes_politicas', filtros.orientacoes_politicas);
    checkFilter('posicoes_bolsonaro', filtros.posicoes_bolsonaro);
    checkFilter('faixas_etarias', filtros.faixas_etarias);
    checkFilter('escolaridades', filtros.escolaridades);
    checkFilter('ocupacoes_vinculos', filtros.ocupacoes_vinculos);
    checkFilter('cores_racas', filtros.cores_racas);
    checkFilter('faixas_renda', filtros.faixas_renda);
    checkFilter('estados_civis', filtros.estados_civis);
    checkFilter('interesses_politicos', filtros.interesses_politicos);
    checkFilter('estilos_decisao', filtros.estilos_decisao);
    checkFilter('tolerancias_nuance', filtros.tolerancias_nuance);
    checkFilter('meios_transporte', filtros.meios_transporte);

    return ativos;
  }, [filtros]);

  // Remover um filtro específico
  const removerFiltro = useCallback(
    (tipo: FilterType, valor: string) => {
      const filtroAtual = filtros[tipo] as string[] | undefined;
      if (filtroAtual) {
        setFiltros({
          [tipo]: filtroAtual.filter((v) => v !== valor),
        });
      }
    },
    [filtros, setFiltros]
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

  const temFiltrosAtivos = filtrosAtivos.length > 0 || filtros.busca;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Link de volta ao dashboard */}
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Users className="w-7 h-7 text-primary" />
                Eleitores Sintéticos
              </h1>
              <p className="text-muted-foreground mt-1">
                {temFiltrosAtivos ? (
                  <>
                    <span className="text-primary font-medium">{formatarNumero(eleitoresFiltrados.length)}</span>
                    {' de '}
                    {formatarNumero(estatisticas.total)} eleitores •{' '}
                  </>
                ) : (
                  <>{formatarNumero(estatisticas.total)} agentes cadastrados • </>
                )}
                {formatarNumero(eleitoresSelecionados.length)} selecionados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Mini Dashboard */}
            <button
              onClick={() => setMostrarMiniDashboard(!mostrarMiniDashboard)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                mostrarMiniDashboard
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
              title="Mostrar/Ocultar resumo do grupo"
            >
              <BarChart3 className="w-4 h-4" />
              Resumo
            </button>
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

        {/* Badges de filtros ativos */}
        {filtrosAtivos.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Filtros ativos:</span>
            {filtrosAtivos.slice(0, 8).map((filtro, index) => (
              <button
                key={`${filtro.tipo}-${filtro.valor}-${index}`}
                onClick={() => removerFiltro(filtro.tipo, filtro.valor)}
                className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full hover:bg-primary/30 transition-colors group"
              >
                <span>{filtro.label}</span>
                <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              </button>
            ))}
            {filtrosAtivos.length > 8 && (
              <span className="text-xs text-muted-foreground">
                +{filtrosAtivos.length - 8} mais
              </span>
            )}
            <button
              onClick={limparFiltros}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              Limpar todos
            </button>
          </div>
        )}

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

      {/* Mini Dashboard - Resumo do grupo filtrado */}
      {mostrarMiniDashboard && temFiltrosAtivos && (
        <div className="flex-shrink-0 mb-4">
          <MiniDashboard
            eleitoresFiltrados={eleitoresFiltrados}
            totalEleitores={estatisticas.total}
          />
        </div>
      )}

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

        {/* Lista/Grid/Gráficos/Insights */}
        <div className="flex-1 min-w-0">
          {visualizacao === 'graficos' ? (
            <AgentesCharts estatisticas={estatisticas} eleitores={eleitoresFiltrados} />
          ) : visualizacao === 'insights' ? (
            <AgentesInsights eleitores={eleitores} eleitoresFiltrados={eleitoresFiltrados} />
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

// Página principal com Suspense para useSearchParams
export default function PaginaEleitores() {
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
      <EleitoresContent />
    </Suspense>
  );
}
