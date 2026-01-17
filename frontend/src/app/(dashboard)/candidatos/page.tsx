'use client';

/**
 * Página de Candidatos
 *
 * Gerenciamento de candidatos para as eleições do DF 2026.
 */

import { Suspense } from 'react';
import { CandidatosList } from '@/components/candidatos/CandidatosList';
import { Toaster } from 'sonner';

function CandidatosContent() {
  return (
    <div className="h-full flex flex-col p-6">
      <CandidatosList />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function PaginaCandidatos() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando candidatos...</p>
          </div>
        </div>
      }
    >
      <CandidatosContent />
    </Suspense>
  );
}
