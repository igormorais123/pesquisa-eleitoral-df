'use client';

/**
 * Mapa de Calor por Região Administrativa
 *
 * Visualiza dados eleitorais por região administrativa do DF
 * usando um mapa de calor interativo.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  DadosRegiaoAdministrativa,
  DadosMapaCalor,
  ClusterSocioeconomico,
} from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Map,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// Cores para clusters socioeconômicos
const CORES_CLUSTER: Record<ClusterSocioeconomico, string> = {
  G1_alta: '#10B981',
  G2_media_alta: '#3B82F6',
  G3_media_baixa: '#F59E0B',
  G4_baixa: '#EF4444',
};

// Nomes dos clusters
const NOMES_CLUSTER: Record<ClusterSocioeconomico, string> = {
  G1_alta: 'Alta Renda',
  G2_media_alta: 'Média-Alta',
  G3_media_baixa: 'Média-Baixa',
  G4_baixa: 'Baixa Renda',
};

// Cores do mapa de calor (verde para vermelho)
const CORES_MAPA_CALOR = [
  '#22C55E', // Verde - baixo
  '#84CC16', // Lima
  '#EAB308', // Amarelo
  '#F97316', // Laranja
  '#EF4444', // Vermelho - alto
];

interface RegiaoData {
  codigo: string;
  nome: string;
  sigla: string;
  populacao_estimada: number;
  cluster_predominante: ClusterSocioeconomico;
  renda_media_sm: number;
  coordenadas: { latitude: number; longitude: number };
  caracteristicas: string[];
}

interface DadosRegioes {
  metadados: {
    versao: string;
    total_regioes: number;
    populacao_total_estimada: number;
  };
  regioes: RegiaoData[];
}

type TipoVisualizacao = 'cluster' | 'populacao' | 'renda' | 'dados_custom';

interface MapaCalorRAProps {
  dados?: DadosMapaCalor[];
  titulo?: string;
  subtitulo?: string;
  tipoInicial?: TipoVisualizacao;
  onRegiaoClick?: (regiao: RegiaoData, dados?: DadosMapaCalor) => void;
}

export function MapaCalorRA({
  dados,
  titulo = 'Mapa de Calor - Regiões Administrativas',
  subtitulo,
  tipoInicial = 'cluster',
  onRegiaoClick,
}: MapaCalorRAProps) {
  const [regioesData, setRegioesData] = useState<DadosRegioes | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>(tipoInicial);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string | null>(null);
  const [mostrarLabels, setMostrarLabels] = useState(true);
  const [filtroCluster, setFiltroCluster] = useState<ClusterSocioeconomico | 'todos'>('todos');

  // Carregar dados das regiões
  useEffect(() => {
    const carregarRegioes = async () => {
      try {
        const response = await fetch('/data/regioes-administrativas-df.json');
        if (!response.ok) throw new Error('Erro ao carregar regiões');
        const data = await response.json();
        setRegioesData(data);
      } catch (error) {
        console.error('Erro ao carregar regiões:', error);
        toast.error('Erro ao carregar dados das regiões');
      } finally {
        setCarregando(false);
      }
    };
    carregarRegioes();
  }, []);

  // Calcular valor máximo e mínimo para normalização
  const { maxValor, minValor } = useMemo(() => {
    if (!regioesData) return { maxValor: 1, minValor: 0 };

    if (tipoVisualizacao === 'populacao') {
      const pops = regioesData.regioes.map((r) => r.populacao_estimada);
      return { maxValor: Math.max(...pops), minValor: Math.min(...pops) };
    }
    if (tipoVisualizacao === 'renda') {
      const rendas = regioesData.regioes.map((r) => r.renda_media_sm);
      return { maxValor: Math.max(...rendas), minValor: Math.min(...rendas) };
    }
    if (tipoVisualizacao === 'dados_custom' && dados) {
      const valores = dados.map((d) => d.valor);
      return { maxValor: Math.max(...valores), minValor: Math.min(...valores) };
    }
    return { maxValor: 1, minValor: 0 };
  }, [regioesData, tipoVisualizacao, dados]);

  // Obter cor para um valor normalizado
  const getCorMapa = (valor: number, min: number, max: number): string => {
    if (max === min) return CORES_MAPA_CALOR[2];
    const normalizado = (valor - min) / (max - min);
    const index = Math.min(
      Math.floor(normalizado * CORES_MAPA_CALOR.length),
      CORES_MAPA_CALOR.length - 1
    );
    return CORES_MAPA_CALOR[index];
  };

  // Obter cor da região baseado no tipo de visualização
  const getCorRegiao = (regiao: RegiaoData): string => {
    if (tipoVisualizacao === 'cluster') {
      return CORES_CLUSTER[regiao.cluster_predominante];
    }
    if (tipoVisualizacao === 'populacao') {
      return getCorMapa(regiao.populacao_estimada, minValor, maxValor);
    }
    if (tipoVisualizacao === 'renda') {
      return getCorMapa(regiao.renda_media_sm, minValor, maxValor);
    }
    if (tipoVisualizacao === 'dados_custom' && dados) {
      const dadoRegiao = dados.find((d) => d.regiao === regiao.nome || d.regiao === regiao.sigla);
      if (dadoRegiao) {
        return getCorMapa(dadoRegiao.valor, minValor, maxValor);
      }
    }
    return '#6B7280';
  };

  // Obter dados customizados da região
  const getDadosCustom = (regiao: RegiaoData): DadosMapaCalor | undefined => {
    if (!dados) return undefined;
    return dados.find((d) => d.regiao === regiao.nome || d.regiao === regiao.sigla);
  };

  // Filtrar regiões
  const regioesFiltradas = useMemo(() => {
    if (!regioesData) return [];
    if (filtroCluster === 'todos') return regioesData.regioes;
    return regioesData.regioes.filter((r) => r.cluster_predominante === filtroCluster);
  }, [regioesData, filtroCluster]);

  // Ordenar regiões por tamanho (para layout visual)
  const regioesOrdenadas = useMemo(() => {
    return [...regioesFiltradas].sort((a, b) => b.populacao_estimada - a.populacao_estimada);
  }, [regioesFiltradas]);

  // Handler de clique na região
  const handleRegiaoClick = (regiao: RegiaoData) => {
    setRegiaoSelecionada(regiao.codigo);
    if (onRegiaoClick) {
      onRegiaoClick(regiao, getDadosCustom(regiao));
    }
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando mapa das regiões...</p>
        </CardContent>
      </Card>
    );
  }

  if (!regioesData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Não foi possível carregar os dados das regiões.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Controles */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                {titulo}
              </CardTitle>
              <CardDescription>
                {subtitulo || `${regioesData.metadados.total_regioes} Regiões Administrativas • ${regioesData.metadados.populacao_total_estimada.toLocaleString('pt-BR')} habitantes`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tipo de visualização */}
            <div className="space-y-1">
              <Label className="text-xs">Visualização</Label>
              <Select
                value={tipoVisualizacao}
                onValueChange={(v) => setTipoVisualizacao(v as TipoVisualizacao)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cluster">Cluster Socioeconômico</SelectItem>
                  <SelectItem value="populacao">População</SelectItem>
                  <SelectItem value="renda">Renda Média</SelectItem>
                  {dados && <SelectItem value="dados_custom">Dados da Pesquisa</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por cluster */}
            <div className="space-y-1">
              <Label className="text-xs">Filtrar por Cluster</Label>
              <Select
                value={filtroCluster}
                onValueChange={(v) => setFiltroCluster(v as ClusterSocioeconomico | 'todos')}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="G1_alta">Alta Renda</SelectItem>
                  <SelectItem value="G2_media_alta">Média-Alta</SelectItem>
                  <SelectItem value="G3_media_baixa">Média-Baixa</SelectItem>
                  <SelectItem value="G4_baixa">Baixa Renda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle labels */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarLabels(!mostrarLabels)}
            >
              {mostrarLabels ? (
                <EyeOff className="h-4 w-4 mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              {mostrarLabels ? 'Ocultar Labels' : 'Mostrar Labels'}
            </Button>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Legenda:</span>
            {tipoVisualizacao === 'cluster' ? (
              <>
                {Object.entries(CORES_CLUSTER).map(([cluster, cor]) => (
                  <div key={cluster} className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: cor }}
                    />
                    <span className="text-xs">
                      {NOMES_CLUSTER[cluster as ClusterSocioeconomico]}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs">Baixo</span>
                <div className="flex">
                  {CORES_MAPA_CALOR.map((cor, i) => (
                    <div
                      key={i}
                      className="w-6 h-4"
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
                <span className="text-xs">Alto</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mapa de Calor (Grid de Regiões) */}
      <Card>
        <CardContent className="p-4">
          <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {regioesOrdenadas.map((regiao) => {
                const cor = getCorRegiao(regiao);
                const dadosCustom = getDadosCustom(regiao);
                const selecionada = regiaoSelecionada === regiao.codigo;

                // Calcular tamanho baseado na população (opcional)
                const populacaoNormalizada =
                  (regiao.populacao_estimada - minValor) /
                  (maxValor - minValor || 1);
                const tamanhoBase = 80 + populacaoNormalizada * 40;

                return (
                  <Tooltip key={regiao.codigo}>
                    <TooltipTrigger asChild>
                      <div
                        className={`relative cursor-pointer rounded-lg transition-all hover:scale-105 hover:shadow-lg ${
                          selecionada ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{
                          backgroundColor: cor,
                          minHeight: `${tamanhoBase}px`,
                        }}
                        onClick={() => handleRegiaoClick(regiao)}
                      >
                        {mostrarLabels && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-white text-center">
                            <span className="font-bold text-xs drop-shadow-md">
                              {regiao.sigla}
                            </span>
                            {tipoVisualizacao === 'dados_custom' && dadosCustom && (
                              <span className="text-[10px] font-semibold drop-shadow-md">
                                {dadosCustom.percentual.toFixed(1)}%
                              </span>
                            )}
                            {tipoVisualizacao === 'populacao' && (
                              <span className="text-[10px] drop-shadow-md">
                                {(regiao.populacao_estimada / 1000).toFixed(0)}k
                              </span>
                            )}
                            {tipoVisualizacao === 'renda' && (
                              <span className="text-[10px] drop-shadow-md">
                                {regiao.renda_media_sm.toFixed(1)} SM
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs p-3"
                    >
                      <div className="space-y-2">
                        <div className="font-semibold">{regiao.nome}</div>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">População:</span>
                            <span>{regiao.populacao_estimada.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Renda Média:</span>
                            <span>{regiao.renda_media_sm.toFixed(1)} SM</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Cluster:</span>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: CORES_CLUSTER[regiao.cluster_predominante],
                                color: CORES_CLUSTER[regiao.cluster_predominante],
                              }}
                            >
                              {NOMES_CLUSTER[regiao.cluster_predominante]}
                            </Badge>
                          </div>
                          {dadosCustom && (
                            <>
                              <div className="border-t pt-1 mt-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Valor:</span>
                                  <span className="font-semibold">
                                    {dadosCustom.percentual.toFixed(1)}%
                                  </span>
                                </div>
                                {dadosCustom.candidato_lider && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Líder:</span>
                                    <span>{dadosCustom.candidato_lider}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1 border-t">
                          {regiao.caracteristicas.slice(0, 3).map((car, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {car}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Estatísticas por Cluster */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribuição por Cluster Socioeconômico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(CORES_CLUSTER).map(([cluster, cor]) => {
              const regioesCluster = regioesData.regioes.filter(
                (r) => r.cluster_predominante === cluster
              );
              const populacaoTotal = regioesCluster.reduce(
                (acc, r) => acc + r.populacao_estimada,
                0
              );
              const percentual =
                (populacaoTotal / regioesData.metadados.populacao_total_estimada) * 100;

              return (
                <div
                  key={cluster}
                  className="p-3 rounded-lg border"
                  style={{ borderLeftColor: cor, borderLeftWidth: '4px' }}
                >
                  <div className="text-sm font-medium">
                    {NOMES_CLUSTER[cluster as ClusterSocioeconomico]}
                  </div>
                  <div className="text-2xl font-bold">{regioesCluster.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {populacaoTotal.toLocaleString('pt-BR')} hab ({percentual.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Região Selecionada */}
      {regiaoSelecionada && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Região Selecionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const regiao = regioesData.regioes.find(
                (r) => r.codigo === regiaoSelecionada
              );
              if (!regiao) return null;
              const dadosCustom = getDadosCustom(regiao);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: CORES_CLUSTER[regiao.cluster_predominante] }}
                    >
                      {regiao.sigla}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{regiao.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {regiao.codigo} • {NOMES_CLUSTER[regiao.cluster_predominante]}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-xs">População</span>
                      </div>
                      <p className="text-lg font-bold">
                        {regiao.populacao_estimada.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">Renda Média</span>
                      </div>
                      <p className="text-lg font-bold">{regiao.renda_media_sm.toFixed(1)} SM</p>
                    </div>
                    {dadosCustom && (
                      <>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Target className="h-4 w-4" />
                            <span className="text-xs">Valor</span>
                          </div>
                          <p className="text-lg font-bold">
                            {dadosCustom.percentual.toFixed(1)}%
                          </p>
                        </div>
                        {dadosCustom.candidato_lider && (
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Info className="h-4 w-4" />
                              <span className="text-xs">Líder</span>
                            </div>
                            <p className="text-lg font-bold">{dadosCustom.candidato_lider}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Características</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {regiao.caracteristicas.map((car, i) => (
                        <Badge key={i} variant="secondary">
                          {car}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
