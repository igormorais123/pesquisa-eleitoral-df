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
  Briefcase,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useGestores } from '@/hooks/useGestores';
import { GestorCard } from '@/components/gestores/GestorCard';
import { GestoresFilters } from '@/components/gestores/GestoresFilters';
import { cn, formatarNumero } from '@/lib/utils';
import type { SetorGestor, NivelHierarquico, Gestor } from '@/types';

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
              <GestoresGraficos estatisticas={estatisticas} gestores={gestoresFiltrados} />
            ) : visualizacao === 'insights' ? (
              <GestoresInsights gestores={gestores} gestoresFiltrados={gestoresFiltrados} />
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
                estatisticas={estatisticas}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Cores para gráficos
const CORES_SETOR = ['#3b82f6', '#22c55e'];
const CORES_NIVEL = ['#a855f7', '#f97316', '#06b6d4'];
const CORES_PODC = ['#3b82f6', '#22c55e', '#f97316', '#ef4444'];
const CORES_GENERO = ['#3b82f6', '#ec4899'];

// Componente de Gráficos com visualizações
function GestoresGraficos({
  estatisticas,
  gestores,
}: {
  estatisticas: any;
  gestores: Gestor[];
}) {
  // Dados para gráfico de pizza - Setor
  const dadosSetor = [
    { name: 'Publico', value: estatisticas.porSetor.publico, fill: CORES_SETOR[0] },
    { name: 'Privado', value: estatisticas.porSetor.privado, fill: CORES_SETOR[1] },
  ];

  // Dados para gráfico de barras - Nível Hierárquico
  const dadosNivel = [
    { name: 'Estrategico', value: estatisticas.porNivel.estrategico, fill: CORES_NIVEL[0] },
    { name: 'Tatico', value: estatisticas.porNivel.tatico, fill: CORES_NIVEL[1] },
    { name: 'Operacional', value: estatisticas.porNivel.operacional, fill: CORES_NIVEL[2] },
  ];

  // Dados para radar PODC
  const dadosPODC = [
    { subject: 'Planejar', A: estatisticas.mediaPODC?.planejar || 0, fullMark: 50 },
    { subject: 'Organizar', A: estatisticas.mediaPODC?.organizar || 0, fullMark: 50 },
    { subject: 'Dirigir', A: estatisticas.mediaPODC?.dirigir || 0, fullMark: 50 },
    { subject: 'Controlar', A: estatisticas.mediaPODC?.controlar || 0, fullMark: 50 },
  ];

  // Dados para gráfico de barras - Top 10 Áreas
  const dadosAreas = Object.entries(estatisticas.porArea || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([area, count]) => ({
      name: area.replace(/_/g, ' ').substring(0, 15),
      value: count as number,
    }));

  // Dados para gráfico de pizza - Gênero
  const dadosGenero = Object.entries(estatisticas.porGenero || {}).map(([genero, count], index) => ({
    name: genero.charAt(0).toUpperCase() + genero.slice(1),
    value: count as number,
    fill: CORES_GENERO[index % CORES_GENERO.length],
  }));

  // Dados para gráfico de barras - Localização
  const dadosLocalizacao = Object.entries(estatisticas.porLocalizacao || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([loc, count]) => ({
      name: loc,
      value: count as number,
    }));

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Setor */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Por Setor
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosSetor}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dadosSetor.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} gestores`, 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Nível Hierárquico */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Nivel Hierarquico
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dadosNivel}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} gestores`, 'Total']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dadosNivel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico Radar - PODC */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Distribuicao Media PODC
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dadosPODC}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 50]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar
                name="Media"
                dataKey="A"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Media']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Gênero */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Por Genero
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosGenero}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dadosGenero.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} gestores`, 'Total']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras - Top Áreas */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Top 10 Areas de Atuacao
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosAreas} layout="vertical">
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
              formatter={(value: number) => [`${value} gestores`, 'Total']}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Localização */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Top Localizacoes
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dadosLocalizacao}>
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
              formatter={(value: number) => [`${value} gestores`, 'Total']}
            />
            <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Componente de Insights
function GestoresInsights({
  gestores,
  gestoresFiltrados,
}: {
  gestores: Gestor[];
  gestoresFiltrados: Gestor[];
}) {
  // Calcular IAD médio
  const calcularIAD = (g: Gestor) => {
    const { planejar, organizar, dirigir, controlar } = g.distribuicao_podc;
    return (planejar + organizar) / (dirigir + controlar);
  };

  const mediaIAD = gestoresFiltrados.length > 0
    ? gestoresFiltrados.reduce((acc, g) => acc + calcularIAD(g), 0) / gestoresFiltrados.length
    : 0;

  const gestoresPublicos = gestoresFiltrados.filter((g) => g.setor === 'publico');
  const gestoresPrivados = gestoresFiltrados.filter((g) => g.setor === 'privado');

  const mediaIADPublico = gestoresPublicos.length > 0
    ? gestoresPublicos.reduce((acc, g) => acc + calcularIAD(g), 0) / gestoresPublicos.length
    : 0;

  const mediaIADPrivado = gestoresPrivados.length > 0
    ? gestoresPrivados.reduce((acc, g) => acc + calcularIAD(g), 0) / gestoresPrivados.length
    : 0;

  const insights = [
    {
      titulo: 'Indice de Autonomia Decisoria (IAD)',
      descricao: `Media geral: ${mediaIAD.toFixed(2)}. Setor publico: ${mediaIADPublico.toFixed(2)}. Setor privado: ${mediaIADPrivado.toFixed(2)}. IAD = (P+O)/(D+C).`,
      icone: Target,
    },
    {
      titulo: 'Distribuicao por Genero',
      descricao: `${gestoresFiltrados.filter((g) => g.genero === 'feminino').length} mulheres (${Math.round((gestoresFiltrados.filter((g) => g.genero === 'feminino').length / gestoresFiltrados.length) * 100)}%) entre os gestores selecionados.`,
      icone: Users,
    },
    {
      titulo: 'Perfil por Nivel Hierarquico',
      descricao: `${gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'estrategico').length} estrategicos, ${gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'tatico').length} taticos, ${gestoresFiltrados.filter((g) => g.nivel_hierarquico === 'operacional').length} operacionais.`,
      icone: TrendingUp,
    },
    {
      titulo: 'Areas de Atuacao',
      descricao: `Gestores atuando em ${Array.from(new Set(gestoresFiltrados.map((g) => g.area_atuacao))).length} areas diferentes.`,
      icone: Lightbulb,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        Insights dos Gestores
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <div key={i} className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <insight.icone className="w-5 h-5 text-primary" />
              {insight.titulo}
            </h3>
            <p className="text-sm text-muted-foreground">{insight.descricao}</p>
          </div>
        ))}
      </div>

      {/* Sugestões de Perguntas */}
      <div className="glass-card rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4">Sugestoes de Perguntas para Pesquisa PODC</h3>
        <div className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Como voce distribui seu tempo entre as funcoes de planejar, organizar, dirigir e controlar?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Quais fatores mais influenciam a forma como voce aloca seu tempo entre as funcoes administrativas?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Como a hierarquia e o setor de atuacao afetam sua autonomia decisoria?&quot;
            </p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-foreground">
              &quot;Qual funcao administrativa voce considera mais critica para o sucesso da sua organizacao?&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Comparativo Público vs Privado */}
      <div className="glass-card rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-foreground mb-4">Comparativo: Publico vs Privado</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/20 rounded-lg p-4 text-center">
            <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">{gestoresPublicos.length}</p>
            <p className="text-sm text-muted-foreground">Gestores Publicos</p>
            <p className="text-xs text-blue-400 mt-1">IAD medio: {mediaIADPublico.toFixed(2)}</p>
          </div>
          <div className="bg-green-500/20 rounded-lg p-4 text-center">
            <Briefcase className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{gestoresPrivados.length}</p>
            <p className="text-sm text-muted-foreground">Gestores Privados</p>
            <p className="text-xs text-green-400 mt-1">IAD medio: {mediaIADPrivado.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Dashboard
function GestoresMiniDashboard({
  gestores,
  estatisticas,
}: {
  gestores: Gestor[];
  estatisticas: any;
}) {
  const total = gestores.length;

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
          <p className="text-xs text-muted-foreground">Media Idade</p>
        </div>
      </div>

      {/* Por Setor */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Por Setor</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Publico</span>
            <span>{gestores.filter((g) => g.setor === 'publico').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Privado</span>
            <span>{gestores.filter((g) => g.setor === 'privado').length}</span>
          </div>
        </div>
      </div>

      {/* Por Nível */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Por Nivel Hierarquico</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-purple-400">Estrategico</span>
            <span>{gestores.filter((g) => g.nivel_hierarquico === 'estrategico').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-orange-400">Tatico</span>
            <span>{gestores.filter((g) => g.nivel_hierarquico === 'tatico').length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">Operacional</span>
            <span>{gestores.filter((g) => g.nivel_hierarquico === 'operacional').length}</span>
          </div>
        </div>
      </div>

      {/* PODC Médio */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">PODC Medio (%)</p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Planejar</span>
            <span>{estatisticas.mediaPODC?.planejar || 0}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Organizar</span>
            <span>{estatisticas.mediaPODC?.organizar || 0}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-orange-400">Dirigir</span>
            <span>{estatisticas.mediaPODC?.dirigir || 0}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-400">Controlar</span>
            <span>{estatisticas.mediaPODC?.controlar || 0}%</span>
          </div>
        </div>
      </div>

      {/* IAD Médio */}
      <div className="bg-primary/20 rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-1">IAD Medio</p>
        <p className="text-xl font-bold text-primary">{estatisticas.mediaIAD?.toFixed(2) || '0.00'}</p>
        <p className="text-xs text-muted-foreground">(P+O)/(D+C)</p>
      </div>

      {/* Top Áreas */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Top Areas</p>
        <div className="space-y-1">
          {Object.entries(estatisticas.porArea || {})
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([area, count]) => (
              <div key={area} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate">{area.replace(/_/g, ' ')}</span>
                <span>{count as number}</span>
              </div>
            ))}
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
