'use client';

import { useRouter } from 'next/navigation';
import { useCallback, ReactNode } from 'react';
import { ExternalLink, MousePointerClick } from 'lucide-react';
import { useFilterNavigation, FilterType, getFilterLabel } from '@/hooks/useFilterNavigation';
import { cn } from '@/lib/utils';

interface GraficoClicavelProps {
  titulo: string;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  children: ReactNode;
  filterType?: FilterType;
  className?: string;
  // Se true, mostra indicador de que é clicável
  showClickIndicator?: boolean;
}

// Wrapper para gráficos que podem navegar para eleitores
export function GraficoClicavel({
  titulo,
  subtitulo,
  icone: Icone,
  corIcone,
  children,
  filterType,
  className = '',
  showClickIndicator = true,
}: GraficoClicavelProps) {
  const { navigateWithFilter } = useFilterNavigation();

  return (
    <div className={cn('glass-card rounded-xl p-6 group', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', corIcone)}>
            <Icone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{titulo}</h3>
            {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
          </div>
        </div>
        {showClickIndicator && filterType && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MousePointerClick className="w-3 h-3" />
            <span>Clique para filtrar</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

interface BarraClicavelProps {
  filterType: FilterType;
  filterValue: string;
  children: ReactNode;
  className?: string;
}

// Componente de barra clicável para usar dentro de gráficos
export function BarraClicavel({
  filterType,
  filterValue,
  children,
  className = '',
}: BarraClicavelProps) {
  const { navigateWithFilter } = useFilterNavigation();

  const handleClick = useCallback(() => {
    navigateWithFilter(filterType, filterValue);
  }, [navigateWithFilter, filterType, filterValue]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        'cursor-pointer transition-all hover:opacity-80 hover:scale-[1.02]',
        className
      )}
      title={`Clique para ver eleitores: ${getFilterLabel(filterType, filterValue)}`}
    >
      {children}
    </div>
  );
}

interface LegendaClicavelProps {
  filterType: FilterType;
  items: Array<{
    value: string;
    label: string;
    color: string;
    count?: number;
    percentage?: string;
  }>;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

// Legenda clicável para gráficos
export function LegendaClicavel({
  filterType,
  items,
  className = '',
  layout = 'horizontal',
}: LegendaClicavelProps) {
  const { navigateWithFilter } = useFilterNavigation();

  return (
    <div
      className={cn(
        'flex gap-2 flex-wrap mt-4',
        layout === 'vertical' && 'flex-col',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => navigateWithFilter(filterType, item.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
            'bg-secondary/50 hover:bg-secondary transition-colors',
            'border border-transparent hover:border-primary/30',
            'group'
          )}
          title={`Ver eleitores: ${item.label}`}
        >
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-foreground">{item.label}</span>
          {item.count !== undefined && (
            <span className="text-muted-foreground">({item.count})</span>
          )}
          {item.percentage && (
            <span className="text-muted-foreground">{item.percentage}%</span>
          )}
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

interface CardEstatisticaClicavelProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  filterType?: FilterType;
  filterValue?: string;
  href?: string;
}

// Card de estatística clicável
export function CardEstatisticaClicavel({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  corIcone,
  filterType,
  filterValue,
  href,
}: CardEstatisticaClicavelProps) {
  const router = useRouter();
  const { navigateWithFilter } = useFilterNavigation();

  const handleClick = useCallback(() => {
    if (href) {
      router.push(href);
    } else if (filterType && filterValue) {
      navigateWithFilter(filterType, filterValue);
    }
  }, [router, href, navigateWithFilter, filterType, filterValue]);

  const isClickable = href || (filterType && filterValue);

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        'glass-card rounded-xl p-6 transition-all duration-300',
        isClickable && 'cursor-pointer hover:shadow-primary-glow hover:scale-[1.02]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', corIcone)}>
          <Icone className="w-6 h-6 text-white" />
        </div>
      </div>
      {isClickable && (
        <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3" />
          <span>Ver detalhes</span>
        </div>
      )}
    </div>
  );
}

// Custom onClick handler para usar com Recharts
export function useChartClick(filterType: FilterType) {
  const { navigateWithFilter } = useFilterNavigation();

  return useCallback(
    (data: any) => {
      if (data?.activePayload?.[0]?.payload) {
        const payload = data.activePayload[0].payload;
        // Tentar encontrar o valor original no payload
        const value = payload.valorOriginal || payload.value || payload.nome || payload.name;
        if (value) {
          navigateWithFilter(filterType, value);
        }
      }
    },
    [navigateWithFilter, filterType]
  );
}

// Tooltip customizado que indica clicabilidade
export function TooltipClicavel({
  active,
  payload,
  label,
  filterType,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  filterType?: FilterType;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-gray-800 border-none rounded-lg p-3 shadow-lg">
      <p className="text-white font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-gray-300 text-sm">
          {entry.name}: {entry.value}
          {entry.payload?.percentual && ` (${entry.payload.percentual}%)`}
        </p>
      ))}
      {filterType && (
        <p className="text-primary text-xs mt-2 flex items-center gap-1">
          <MousePointerClick className="w-3 h-3" />
          Clique para filtrar
        </p>
      )}
    </div>
  );
}
