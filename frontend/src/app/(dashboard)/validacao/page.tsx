'use client';

import { ValidacaoEstatistica } from '@/components/validacao/ValidacaoEstatistica';
import eleitoresData from '@/data/eleitores-df-400.json';
import type { Eleitor } from '@/types';

export default function PaginaValidacao() {
  const eleitores = eleitoresData as Eleitor[];

  return (
    <div className="animate-fade-in">
      <ValidacaoEstatistica eleitores={eleitores} />
    </div>
  );
}
