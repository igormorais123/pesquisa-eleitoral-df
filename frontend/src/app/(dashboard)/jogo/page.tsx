'use client';

import { Gamepad2 } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export default function JogoPage() {
  return (
    <ComingSoonPage
      titulo="Jogo Agentes Generativos"
      descricao="Experimento interativo inspirado no paper 'Generative Agents' de Stanford"
      icone={Gamepad2}
      corGradiente="from-violet-500 to-purple-500"
      corSombra="shadow-violet-500/25"
      previsao="Previsão: Junho 2026"
      features={[
        'Mundo simulado',
        'IA generativa',
        'Observação de agentes',
        'Interação em tempo real',
        'Comportamentos emergentes',
      ]}
    />
  );
}
