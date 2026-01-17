'use client';

/**
 * Página de Cenários Eleitorais
 *
 * Simulação de cenários de 1º e 2º turno com análise de rejeição.
 */

import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimuladorCenario } from '@/components/cenarios/SimuladorCenario';
import { AnaliseRejeicao } from '@/components/cenarios/AnaliseRejeicao';
import {
  Target,
  ThumbsDown,
  History,
  TrendingUp,
} from 'lucide-react';
import { Toaster } from 'sonner';

function CenariosContent() {
  const [abaAtiva, setAbaAtiva] = useState('simulador');

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" />
          Cenários Eleitorais
        </h1>
        <p className="text-muted-foreground mt-1">
          Simule cenários de 1º e 2º turno e analise a rejeição dos candidatos
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="simulador" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Simulador de Cenários
          </TabsTrigger>
          <TabsTrigger value="rejeicao" className="flex items-center gap-2">
            <ThumbsDown className="h-4 w-4" />
            Análise de Rejeição
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulador" className="flex-1 overflow-auto">
          <SimuladorCenario />
        </TabsContent>

        <TabsContent value="rejeicao" className="flex-1 overflow-auto">
          <AnaliseRejeicao />
        </TabsContent>
      </Tabs>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function PaginaCenarios() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando simulador...</p>
          </div>
        </div>
      }
    >
      <CenariosContent />
    </Suspense>
  );
}
