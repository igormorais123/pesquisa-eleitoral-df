'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Link from 'next/link';
import {
  Users,
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
  Landmark,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useParlamentares } from '@/hooks/useParlamentares';
import { ParlamentarCard } from '@/components/parlamentares/ParlamentarCard';
import { ParlamentaresFilters } from '@/components/parlamentares/ParlamentaresFilters';
import { cn, formatarNumero } from '@/lib/utils';
import type { CasaLegislativa } from '@/types';

type VisualizacaoTipo = 'cards' | 'lista' | 'graficos' | 'insights';

function ParlamentaresContent() {
  const {
    parlamentares,
    parlamentaresFiltrados,
    parlamentaresSelecionados,
    estatisticas,
    contagemPorCasa,
    carregando,
    erro,
    filtros,
    casaAtiva,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    setFiltros,
    limparFiltros,
    setCasaAtiva,
  } = useParlamentares();

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('cards');
  const [painelFiltros, setPainelFiltros] = useState(true);
  const [mostrarMiniDashboard, setMostrarMiniDashboard] = useState(true);

  // Referência para virtualização
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualização para cards
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(parlamentaresFiltrados.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 480,
    overscan: 5,
  });

  // Virtualização para lista
  const listVirtualizer = useVirtualizer({
    count: parlamentaresFiltrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90,
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
          <p className="mt-4 text-muted-foreground">Carregando parlamentares...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (erro) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Erro ao carregar parlamentares</p>
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
              <Landmark className="w-7 h-7 text-primary" />
              Parlamentares do Congresso Nacional
            </h1>
            <p className="text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{formatarNumero(estatisticas.filtrados)}</span>
              {' '}de {formatarNumero(estatisticas.total)} parlamentares
              {parlamentaresSelecionados.length > 0 && (
                <span className="ml-2 text-primary">
                  • {formatarNumero(parlamentaresSelecionados.length)} selecionados
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Links externos para dados abertos */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4" />
                Dados Abertos
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-secondary/95 backdrop-blur border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <a
                  href="https://dadosabertos.camara.leg.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 rounded-t-lg transition-colors"
                >
                  <Building2 className="w-4 h-4 text-green-400" />
                  Câmara dos Deputados
                </a>
                <a
                  href="https://legis.senado.leg.br/dadosabertos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 transition-colors"
                >
                  <Landmark className="w-4 h-4 text-blue-400" />
                  Senado Federal
                </a>
                <a
                  href="https://www.cl.df.gov.br/transparencia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 rounded-b-lg transition-colors"
                >
                  <Building2 className="w-4 h-4 text-yellow-400" />
                  CLDF
                </a>
              </div>
            </div>

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
                  Excel ({parlamentaresFiltrados.length})
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary/20 rounded-b-lg transition-colors"
                >
                  <FileDown className="w-4 h-4 text-red-400" />
                  PDF ({parlamentaresFiltrados.length})
                </button>
              </div>
            </div>

            <Link
              href="/pesquisas/nova?tipo=parlamentar"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                parlamentaresSelecionados.length > 0
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              )}
            >
              <Sparkles className="w-4 h-4" />
              {parlamentaresSelecionados.length > 0
                ? `Pesquisar ${parlamentaresSelecionados.length}`
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
                Selecionar todos ({parlamentaresFiltrados.length})
              </button>
              {parlamentaresSelecionados.length > 0 && (
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

      {/* Conteúdo principal */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Painel de Filtros */}
        {painelFiltros && (
          <div className="w-80 flex-shrink-0 glass-card rounded-xl p-4 overflow-y-auto">
            <ParlamentaresFilters
              filtros={filtros}
              onFiltrosChange={setFiltros}
              onLimpar={limparFiltros}
              casaAtiva={casaAtiva}
              onCasaChange={setCasaAtiva}
              totalParlamentares={estatisticas.total}
              totalFiltrados={estatisticas.filtrados}
              contagemPorCasa={contagemPorCasa}
            />
          </div>
        )}

        {/* Lista/Grid/Gráficos/Insights */}
        <div className="flex-1 min-w-0 flex gap-4">
          <div className="flex-1 min-w-0">
            {visualizacao === 'graficos' ? (
              <ParlamentaresGraficos estatisticas={estatisticas} parlamentares={parlamentaresFiltrados} />
            ) : visualizacao === 'insights' ? (
              <ParlamentaresInsights parlamentares={parlamentares} parlamentaresFiltrados={parlamentaresFiltrados} />
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
                      const rowParlamentares = parlamentaresFiltrados.slice(startIndex, startIndex + 3);

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
                            {rowParlamentares.map((parlamentar) => (
                              <ParlamentarCard
                                key={parlamentar.id}
                                parlamentar={parlamentar}
                                selecionado={parlamentaresSelecionados.includes(parlamentar.id)}
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
                      const parlamentar = parlamentaresFiltrados[virtualItem.index];

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
                          <ParlamentarCard
                            parlamentar={parlamentar}
                            selecionado={parlamentaresSelecionados.includes(parlamentar.id)}
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
              <ParlamentaresMiniDashboard
                parlamentares={parlamentaresFiltrados}
                estatisticas={estatisticas}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Gráficos simplificado
function ParlamentaresGraficos({
  estatisticas,
  parlamentares,
}: {
  estatisticas: any;
  parlamentares: any[];
}) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por Casa Legislativa */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Por Casa Legislativa</h3>
          <div className="space-y-3">
            {Object.entries(estatisticas.porCasa)
              .filter(([key]) => key !== 'todas')
              .map(([casa, count]) => (
                <div key={casa} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {casa.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-foreground">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Por Partido */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Por Partido</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(estatisticas.porPartido)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([partido, count]) => (
                <div key={partido} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{partido}</span>
                  <span className="text-sm font-medium text-foreground">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Por Orientação Política */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Orientação Política</h3>
          <div className="space-y-3">
            {Object.entries(estatisticas.porOrientacao).map(([orientacao, count]) => (
              <div key={orientacao} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">{orientacao}</span>
                <span className="text-sm font-medium text-foreground">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por Relação com Governo */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Relação com Governo Lula</h3>
          <div className="space-y-3">
            {Object.entries(estatisticas.porRelacaoGoverno).map(([relacao, count]) => (
              <div key={relacao} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">
                  {relacao.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-medium text-foreground">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por Estado (UF) */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4">Por Estado (UF)</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(estatisticas.porUf || {})
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([uf, count]) => (
              <div key={uf} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{uf}</span>
                <span className="text-sm font-medium text-foreground">{count as number}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Temas de Atuação */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4">Temas de Atuação Principais</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(estatisticas.porTemasAtuacao)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 15)
            .map(([tema, count]) => (
              <span
                key={tema}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
              >
                {tema} ({count as number})
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

// Componente de Insights simplificado
function ParlamentaresInsights({
  parlamentares,
  parlamentaresFiltrados,
}: {
  parlamentares: any[];
  parlamentaresFiltrados: any[];
}) {
  const insights = [
    {
      titulo: 'Composição por Gênero',
      descricao: `${parlamentaresFiltrados.filter((p) => p.genero === 'feminino').length} mulheres (${Math.round((parlamentaresFiltrados.filter((p) => p.genero === 'feminino').length / parlamentaresFiltrados.length) * 100)}%) entre os parlamentares selecionados.`,
    },
    {
      titulo: 'Polarização Política',
      descricao: `${parlamentaresFiltrados.filter((p) => p.orientacao_politica === 'direita' || p.orientacao_politica === 'esquerda').length} parlamentares com posições polarizadas (extrema esquerda ou direita).`,
    },
    {
      titulo: 'Base do Governo',
      descricao: `${parlamentaresFiltrados.filter((p) => p.relacao_governo_atual === 'base_aliada').length} parlamentares na base aliada do governo atual.`,
    },
    {
      titulo: 'Oposição',
      descricao: `${parlamentaresFiltrados.filter((p) => p.relacao_governo_atual === 'oposicao_forte' || p.relacao_governo_atual === 'oposicao_moderada').length} parlamentares na oposição.`,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        Insights dos Parlamentares
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">{insight.titulo}</h3>
            <p className="text-sm text-muted-foreground">{insight.descricao}</p>
          </div>
        ))}
      </div>

      {/* Sugestões de Perguntas */}
      <div className="glass-card rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4">💡 Sugestões de Perguntas para Pesquisa</h3>
        <div className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Qual sua posição sobre a reforma tributária proposta pelo governo?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Como você avalia a política de segurança pública no Brasil?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Você apoiaria um projeto de lei para regulamentar o uso de IA no setor público?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Qual sua posição sobre a privatização de estatais?&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Dashboard
function ParlamentaresMiniDashboard({
  parlamentares,
  estatisticas,
}: {
  parlamentares: any[];
  estatisticas: any;
}) {
  const total = parlamentares.length;

  return (
    <div className="glass-card rounded-xl p-4 h-full overflow-y-auto space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        Resumo do Grupo
      </h3>

      {/* Estatísticas básicas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{estatisticas.mediaIdade}</p>
          <p className="text-xs text-muted-foreground">Média Idade</p>
        </div>
      </div>

      {/* Por Casa */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Por Casa Legislativa</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Câmara</span>
            <span>{parlamentares.filter((p) => p.casa_legislativa === 'camara_federal').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Senado</span>
            <span>{parlamentares.filter((p) => p.casa_legislativa === 'senado').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-yellow-400">CLDF</span>
            <span>{parlamentares.filter((p) => p.casa_legislativa === 'cldf').length}</span>
          </div>
        </div>
      </div>

      {/* Orientação Política */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Orientação Política</p>
        <div className="space-y-1">
          {Object.entries(estatisticas.porOrientacao)
            .slice(0, 5)
            .map(([orientacao, count]) => (
              <div key={orientacao} className="flex justify-between text-sm">
                <span className="text-muted-foreground capitalize">{orientacao}</span>
                <span>{count as number}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Top Partidos */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Top Partidos</p>
        <div className="space-y-1">
          {Object.entries(estatisticas.porPartido)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([partido, count]) => (
              <div key={partido} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{partido}</span>
                <span>{count as number}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper com Suspense
export default function PaginaParlamentares() {
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
      <ParlamentaresContent />
    </Suspense>
  );
}
