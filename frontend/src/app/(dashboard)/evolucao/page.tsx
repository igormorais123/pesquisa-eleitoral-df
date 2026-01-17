'use client';

/**
 * Página de Evolução / Comparativo Histórico
 *
 * Visualiza a evolução temporal da intenção de voto e outros indicadores.
 */

import { ComparativoHistorico } from '@/components/historico';
import { ExportRelatorio } from '@/components/export';
import { TrendingUp } from 'lucide-react';

export default function EvolucaoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Evolução Temporal
          </h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução da intenção de voto ao longo do tempo
          </p>
        </div>
        <ExportRelatorio tipoPesquisa="Comparativo Histórico" />
      </div>

      {/* Componente de Comparativo */}
      <ComparativoHistorico />
    </div>
  );
}
