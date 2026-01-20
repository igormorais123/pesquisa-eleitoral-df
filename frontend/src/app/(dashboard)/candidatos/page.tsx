'use client';

/**
 * Página de Candidatos
 *
 * Gerenciamento de candidatos para as eleições do DF 2026.
 */

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { CandidatosList } from '@/components/candidatos/CandidatosList';
import { Toaster } from 'sonner';

function CandidatosContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full flex flex-col"
    >
      {/* Hero Header - Estilo Apple */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Candidatos
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Gerenciamento de candidatos para as eleições do DF 2026
        </p>
      </header>

      <CandidatosList />
      <Toaster position="top-right" richColors />
    </motion.div>
  );
}

export default function PaginaCandidatos() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            <p className="mt-6 text-muted-foreground text-lg">Carregando candidatos...</p>
          </div>
        </div>
      }
    >
      <CandidatosContent />
    </Suspense>
  );
}
