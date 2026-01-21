'use client';

/**
 * Página de Cenários Eleitorais
 * Design Apple-style
 * Simulação de cenários de 1º e 2º turno com análise de rejeição.
 */

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimuladorCenario } from '@/components/cenarios/SimuladorCenario';
import { AnaliseRejeicao } from '@/components/cenarios/AnaliseRejeicao';
import {
  Target,
  ThumbsDown,
  TrendingUp,
  Users,
  UserCircle,
  BarChart3,
  Map,
} from 'lucide-react';
import { Toaster } from 'sonner';

// Animações Apple-style
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
};

function CenariosContent() {
  const [abaAtiva, setAbaAtiva] = useState('simulador');

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-8"
    >
      {/* Hero Header - Apple Style */}
      <motion.header variants={fadeIn} className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Cenários Eleitorais
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Simule cenários de 1º e 2º turno e analise a rejeição dos candidatos
        </p>
      </motion.header>

      {/* Quick Links */}
      <motion.div variants={fadeIn} className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/candidatos"
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors text-sm font-medium"
        >
          <UserCircle className="w-4 h-4" />
          Candidatos
        </Link>
        <Link
          href="/eleitores"
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          Eleitores
        </Link>
        <Link
          href="/mapa"
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors text-sm font-medium"
        >
          <Map className="w-4 h-4" />
          Mapa
        </Link>
        <Link
          href="/resultados"
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors text-sm font-medium"
        >
          <BarChart3 className="w-4 h-4" />
          Resultados
        </Link>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeIn}>
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-muted p-1 rounded-full">
            <TabsTrigger
              value="simulador"
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-foreground data-[state=active]:text-background transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              Simulador
            </TabsTrigger>
            <TabsTrigger
              value="rejeicao"
              className="flex items-center gap-2 rounded-full data-[state=active]:bg-foreground data-[state=active]:text-background transition-all"
            >
              <ThumbsDown className="h-4 w-4" />
              Rejeição
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulador" className="mt-0">
            <SimuladorCenario />
          </TabsContent>

          <TabsContent value="rejeicao" className="mt-0">
            <AnaliseRejeicao />
          </TabsContent>
        </Tabs>
      </motion.div>

      <Toaster position="top-right" richColors />
    </motion.div>
  );
}

export default function PaginaCenarios() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-6 text-muted-foreground text-lg">Carregando simulador...</p>
          </div>
        </div>
      }
    >
      <CenariosContent />
    </Suspense>
  );
}
