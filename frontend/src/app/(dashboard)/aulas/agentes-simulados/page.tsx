'use client';

import { Microscope } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export default function AgentesSimuladosPage() {
  return (
    <ComingSoonPage
      titulo="Aula de Agentes Simulados"
      descricao="Aprenda a criar e gerenciar populações de agentes sintéticos para pesquisas sociais"
      icone={Microscope}
      corGradiente="from-pink-500 to-rose-500"
      corSombra="shadow-pink-500/25"
      previsao="Previsão: Abril 2026"
      features={[
        'Metodologia Stanford',
        'Casos práticos',
        'Laboratório virtual',
        'Pesquisas sociais',
        'Análise comportamental',
      ]}
    />
  );
}
