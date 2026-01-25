'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

export type NivelAlerta = 'critico' | 'alto' | 'medio' | 'baixo' | 'info';
export type CategoriaAlerta = 'tendencia' | 'anomalia' | 'oportunidade' | 'risco' | 'acao_requerida';

export interface Alerta {
  id: string;
  titulo: string;
  descricao: string;
  nivel: NivelAlerta;
  categoria: CategoriaAlerta;
  timestamp: Date;
  lido: boolean;
  acaoUrl?: string;
  acaoTexto?: string;
  metrica?: {
    nome: string;
    valorAtual: number;
    valorAnterior?: number;
    unidade?: string;
  };
  regiaoAfetada?: string;
  candidatoRelacionado?: string;
  detalhes?: string;
}

// ============================================
// CONFIGURAÇÕES DE ESTILO
// ============================================

const CONFIG_NIVEL: Record<NivelAlerta, {
  cor: string;
  bgCor: string;
  borderCor: string;
  icone: React.ElementType;
  label: string;
}> = {
  critico: {
    cor: 'text-red-600',
    bgCor: 'bg-red-50 dark:bg-red-950/30',
    borderCor: 'border-red-200 dark:border-red-800',
    icone: AlertTriangle,
    label: 'Crítico'
  },
  alto: {
    cor: 'text-orange-600',
    bgCor: 'bg-orange-50 dark:bg-orange-950/30',
    borderCor: 'border-orange-200 dark:border-orange-800',
    icone: AlertCircle,
    label: 'Alto'
  },
  medio: {
    cor: 'text-yellow-600',
    bgCor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderCor: 'border-yellow-200 dark:border-yellow-800',
    icone: Info,
    label: 'Médio'
  },
  baixo: {
    cor: 'text-blue-600',
    bgCor: 'bg-blue-50 dark:bg-blue-950/30',
    borderCor: 'border-blue-200 dark:border-blue-800',
    icone: Info,
    label: 'Baixo'
  },
  info: {
    cor: 'text-slate-600',
    bgCor: 'bg-slate-50 dark:bg-slate-950/30',
    borderCor: 'border-slate-200 dark:border-slate-800',
    icone: CheckCircle,
    label: 'Info'
  }
};

const CONFIG_CATEGORIA: Record<CategoriaAlerta, { label: string; cor: string }> = {
  tendencia: { label: 'Tendência', cor: 'bg-purple-100 text-purple-800' },
  anomalia: { label: 'Anomalia', cor: 'bg-red-100 text-red-800' },
  oportunidade: { label: 'Oportunidade', cor: 'bg-green-100 text-green-800' },
  risco: { label: 'Risco', cor: 'bg-orange-100 text-orange-800' },
  acao_requerida: { label: 'Ação Requerida', cor: 'bg-blue-100 text-blue-800' }
};

// ============================================
// COMPONENTE DE ALERTA INDIVIDUAL
// ============================================

interface AlertaItemProps {
  alerta: Alerta;
  onMarcarLido: (id: string) => void;
  onDismiss: (id: string) => void;
  expandido?: boolean;
  onToggleExpandir?: () => void;
}

function AlertaItem({ alerta, onMarcarLido, onDismiss, expandido, onToggleExpandir }: AlertaItemProps) {
  const config = CONFIG_NIVEL[alerta.nivel];
  const categoriaConfig = CONFIG_CATEGORIA[alerta.categoria];
  const Icone = config.icone;

  const variacao = alerta.metrica?.valorAnterior !== undefined
    ? ((alerta.metrica.valorAtual - alerta.metrica.valorAnterior) / alerta.metrica.valorAnterior) * 100
    : null;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all duration-200',
        config.bgCor,
        config.borderCor,
        !alerta.lido && 'ring-2 ring-offset-2',
        !alerta.lido && alerta.nivel === 'critico' && 'ring-red-500',
        !alerta.lido && alerta.nivel === 'alto' && 'ring-orange-500',
        !alerta.lido && alerta.nivel === 'medio' && 'ring-yellow-500'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.cor)}>
          <Icone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn('font-semibold', config.cor)}>
                  {alerta.titulo}
                </h4>
                <Badge variant="outline" className={cn('text-xs', categoriaConfig.cor)}>
                  {categoriaConfig.label}
                </Badge>
                {!alerta.lido && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Novo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {alerta.descricao}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {!alerta.lido && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onMarcarLido(alerta.id)}
                  title="Marcar como lido"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss(alerta.id)}
                title="Dispensar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {alerta.metrica && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{alerta.metrica.nome}:</span>
                <span className="font-bold text-foreground">
                  {alerta.metrica.valorAtual.toFixed(1)}{alerta.metrica.unidade || ''}
                </span>
              </div>
              {variacao !== null && (
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  variacao > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {variacao > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {alerta.regiaoAfetada && (
              <Badge variant="outline" className="text-xs">
                📍 {alerta.regiaoAfetada}
              </Badge>
            )}
            {alerta.candidatoRelacionado && (
              <Badge variant="outline" className="text-xs">
                👤 {alerta.candidatoRelacionado}
              </Badge>
            )}
          </div>

          {alerta.detalhes && (
            <div className="mt-2">
              <button
                onClick={onToggleExpandir}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {expandido ? 'Menos detalhes' : 'Mais detalhes'}
                {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandido && (
                <p className="mt-2 text-sm text-muted-foreground bg-background/50 p-3 rounded">
                  {alerta.detalhes}
                </p>
              )}
            </div>
          )}

          {alerta.acaoUrl && (
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href={alerta.acaoUrl} target="_blank" rel="noopener noreferrer">
                  {alerta.acaoTexto || 'Ver detalhes'}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {formatarTempoRelativo(alerta.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// FUNÇÃO DE FORMATAÇÃO DE TEMPO
// ============================================

function formatarTempoRelativo(data: Date): string {
  const agora = new Date();
  const diff = agora.getTime() - data.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (minutos < 1) return 'Agora mesmo';
  if (minutos < 60) return `Há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  if (horas < 24) return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
  if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
  return data.toLocaleDateString('pt-BR');
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface AlertasProativosProps {
  alertas: Alerta[];
  onMarcarLido?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onMarcarTodosLidos?: () => void;
  titulo?: string;
  mostrarFiltros?: boolean;
  maxAlertas?: number;
  className?: string;
}

export function AlertasProativos({
  alertas,
  onMarcarLido = () => {},
  onDismiss = () => {},
  onMarcarTodosLidos,
  titulo = 'Alertas e Notificações',
  mostrarFiltros = true,
  maxAlertas = 10,
  className
}: AlertasProativosProps) {
  const [filtroNivel, setFiltroNivel] = useState<NivelAlerta | 'todos'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaAlerta | 'todos'>('todos');
  const [mostrarLidos, setMostrarLidos] = useState(true);
  const [alertaExpandido, setAlertaExpandido] = useState<string | null>(null);

  const alertasFiltrados = useMemo(() => {
    return alertas
      .filter(a => {
        if (filtroNivel !== 'todos' && a.nivel !== filtroNivel) return false;
        if (filtroCategoria !== 'todos' && a.categoria !== filtroCategoria) return false;
        if (!mostrarLidos && a.lido) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.lido !== b.lido) return a.lido ? 1 : -1;
        const nivelOrdem: Record<NivelAlerta, number> = { critico: 0, alto: 1, medio: 2, baixo: 3, info: 4 };
        if (nivelOrdem[a.nivel] !== nivelOrdem[b.nivel]) {
          return nivelOrdem[a.nivel] - nivelOrdem[b.nivel];
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, maxAlertas);
  }, [alertas, filtroNivel, filtroCategoria, mostrarLidos, maxAlertas]);

  const contadores = useMemo(() => ({
    total: alertas.length,
    naoLidos: alertas.filter(a => !a.lido).length,
    criticos: alertas.filter(a => a.nivel === 'critico' && !a.lido).length
  }), [alertas]);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {titulo}
              {contadores.naoLidos > 0 && (
                <Badge className="ml-2 bg-primary">
                  {contadores.naoLidos}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {contadores.criticos > 0 && (
                <span className="text-red-600 font-medium">
                  {contadores.criticos} alerta{contadores.criticos > 1 ? 's' : ''} crítico{contadores.criticos > 1 ? 's' : ''}
                </span>
              )}
              {contadores.criticos > 0 && ' • '}
              {contadores.total} alerta{contadores.total > 1 ? 's' : ''} no total
            </CardDescription>
          </div>

          {contadores.naoLidos > 0 && onMarcarTodosLidos && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarcarTodosLidos}
              className="flex items-center gap-2"
            >
              <BellOff className="w-4 h-4" />
              Marcar todos como lidos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {mostrarFiltros && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar:</span>
            </div>

            <select
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value as NivelAlerta | 'todos')}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="todos">Todos os níveis</option>
              <option value="critico">Crítico</option>
              <option value="alto">Alto</option>
              <option value="medio">Médio</option>
              <option value="baixo">Baixo</option>
              <option value="info">Info</option>
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as CategoriaAlerta | 'todos')}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="todos">Todas as categorias</option>
              <option value="tendencia">Tendência</option>
              <option value="anomalia">Anomalia</option>
              <option value="oportunidade">Oportunidade</option>
              <option value="risco">Risco</option>
              <option value="acao_requerida">Ação Requerida</option>
            </select>

            <Button
              variant={mostrarLidos ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => setMostrarLidos(!mostrarLidos)}
            >
              {mostrarLidos ? 'Ocultar lidos' : 'Mostrar lidos'}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {alertasFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum alerta pendente</p>
            </div>
          ) : (
            alertasFiltrados.map(alerta => (
              <AlertaItem
                key={alerta.id}
                alerta={alerta}
                onMarcarLido={onMarcarLido}
                onDismiss={onDismiss}
                expandido={alertaExpandido === alerta.id}
                onToggleExpandir={() => setAlertaExpandido(
                  alertaExpandido === alerta.id ? null : alerta.id
                )}
              />
            ))
          )}
        </div>

        {alertas.length > maxAlertas && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              Ver todos os {alertas.length} alertas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// FUNÇÃO PARA GERAR ALERTAS AUTOMÁTICOS
// ============================================

export function gerarAlertasAutomaticos(
  dados: {
    predicoes?: { candidato: string; percentual: number; tendencia: string; volatilidade: number }[];
    anomalias?: { tipo: string; descricao: string; severidade: string; recomendacao: string }[];
    clusters?: { nome: string; percentual: number }[];
    temaPrincipal?: string;
    sentimentoGeral?: string;
    nivelPolarizacao?: number;
  }
): Alerta[] {
  const alertas: Alerta[] = [];
  const agora = new Date();

  dados.predicoes?.forEach((pred, i) => {
    if (pred.volatilidade > 10) {
      alertas.push({
        id: `pred-vol-${i}`,
        titulo: `Alta volatilidade em ${pred.candidato}`,
        descricao: `Volatilidade de ${pred.volatilidade.toFixed(1)}% indica instabilidade no eleitorado`,
        nivel: pred.volatilidade > 15 ? 'alto' : 'medio',
        categoria: 'risco',
        timestamp: agora,
        lido: false,
        metrica: {
          nome: 'Volatilidade',
          valorAtual: pred.volatilidade,
          unidade: '%'
        },
        candidatoRelacionado: pred.candidato
      });
    }

    if (pred.tendencia === 'caindo' && pred.percentual > 20) {
      alertas.push({
        id: `pred-queda-${i}`,
        titulo: `${pred.candidato} em queda`,
        descricao: `Tendência de queda detectada para candidato com ${pred.percentual.toFixed(1)}%`,
        nivel: 'medio',
        categoria: 'tendencia',
        timestamp: agora,
        lido: false,
        candidatoRelacionado: pred.candidato
      });
    }
  });

  dados.anomalias?.forEach((anomalia, i) => {
    const nivel: NivelAlerta = anomalia.severidade === 'critica' ? 'critico'
      : anomalia.severidade === 'alta' ? 'alto'
      : anomalia.severidade === 'media' ? 'medio' : 'baixo';

    alertas.push({
      id: `anomalia-${i}`,
      titulo: anomalia.descricao.substring(0, 50),
      descricao: anomalia.descricao,
      nivel,
      categoria: 'anomalia',
      timestamp: agora,
      lido: false,
      detalhes: anomalia.recomendacao
    });
  });

  if (dados.nivelPolarizacao && dados.nivelPolarizacao > 70) {
    alertas.push({
      id: 'polarizacao',
      titulo: 'Nível alto de polarização',
      descricao: `Polarização de ${dados.nivelPolarizacao}% pode dificultar conquista de indecisos`,
      nivel: dados.nivelPolarizacao > 85 ? 'alto' : 'medio',
      categoria: 'risco',
      timestamp: agora,
      lido: false,
      metrica: {
        nome: 'Polarização',
        valorAtual: dados.nivelPolarizacao,
        unidade: '%'
      }
    });
  }

  dados.clusters?.forEach((cluster, i) => {
    if (cluster.percentual > 25) {
      alertas.push({
        id: `oportunidade-${i}`,
        titulo: `Segmento relevante: ${cluster.nome}`,
        descricao: `${cluster.percentual.toFixed(1)}% do eleitorado - avaliar estratégia específica`,
        nivel: 'info',
        categoria: 'oportunidade',
        timestamp: agora,
        lido: false
      });
    }
  });

  return alertas;
}

export default AlertasProativos;
