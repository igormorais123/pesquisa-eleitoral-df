'use client';

/**
 * Página de Análise de Swing Voters
 *
 * Identifica e analisa eleitores indecisos e susceptíveis a mudança de voto.
 */

import { SwingVotersAnalise } from '@/components/swing-voters';
import { Shuffle } from 'lucide-react';

export default function SwingVotersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shuffle className="h-8 w-8" />
          Swing Voters
        </h1>
        <p className="text-muted-foreground">
          Análise de eleitores indecisos e oportunidades de conversão para a campanha
        </p>
      </div>

      {/* Componente de Análise */}
      <SwingVotersAnalise />
    </div>
  );
}
