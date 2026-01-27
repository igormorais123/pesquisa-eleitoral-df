'use client';

import { Building2 } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export default function ParticipaPage() {
  return (
    <ComingSoonPage
      titulo="Participa DF"
      descricao="Plataforma de participação cidadã para conectar governo e população"
      icone={Building2}
      corGradiente="from-blue-500 to-indigo-500"
      corSombra="shadow-blue-500/25"
      previsao="Previsão: Março 2026"
      features={[
        'Consultas públicas',
        'Votações online',
        'Propostas cidadãs',
        'Transparência total',
        'Feedback em tempo real',
      ]}
    />
  );
}
