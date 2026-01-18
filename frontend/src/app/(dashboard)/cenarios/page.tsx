'use client';

/**
 * Página de Cenários Eleitorais
 *
 * Simulação de cenários de 1º e 2º turno com análise de rejeição.
 */

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimuladorCenario } from '@/components/cenarios/SimuladorCenario';
import { AnaliseRejeicao } from '@/components/cenarios/AnaliseRejeicao';
import {
  Target,
  ThumbsDown,
  History,
  TrendingUp,
  Users,
  UserCircle,
  BarChart3,
  Map,
} from 'lucide-react';
import { Toaster } from 'sonner';

function CenariosContent() {
  const [abaAtiva, setAbaAtiva] = useState('simulador');

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-7 h-7 text-primary" />
              Cenários Eleitorais
            </h1>
            <p className="text-muted-foreground mt-1">
              Simule cenários de 1º e 2º turno e analise a rejeição dos candidatos
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/candidatos"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
            >
              <UserCircle className="w-4 h-4" />
              Ver Candidatos
            </Link>
            <Link
              href="/eleitores"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
            >
              <Users className="w-4 h-4" />
              Ver Eleitores
            </Link>
            <Link
              href="/mapa"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
            >
              <Map className="w-4 h-4" />
              Ver Mapa
            </Link>
            <Link
              href="/resultados"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Resultados
            </Link>
          </div>
        </div>
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
