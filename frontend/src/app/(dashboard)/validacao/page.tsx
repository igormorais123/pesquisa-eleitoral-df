'use client';

import { useState } from 'react';
import { BarChart3, Table, FileDown } from 'lucide-react';
import { ValidacaoEstatistica } from '@/components/validacao/ValidacaoEstatistica';
import { GraficosComparativos } from '@/components/validacao/GraficosComparativos';
import { ExportarRelatorio } from '@/components/validacao/ExportarRelatorio';
import eleitoresData from '@/data/eleitores-df-1000.json';
import type { Eleitor } from '@/types';

type Visualizacao = 'tabela' | 'graficos';

export default function PaginaValidacao() {
  const eleitores = eleitoresData as unknown as Eleitor[];
  const [visualizacao, setVisualizacao] = useState<Visualizacao>('tabela');

  return (
    <div className="animate-fade-in space-y-6">
      {/* Abas de visualização e exportação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisualizacao('tabela')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visualizacao === 'tabela'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Table className="w-4 h-4" />
            Análise Detalhada
          </button>
          <button
            onClick={() => setVisualizacao('graficos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              visualizacao === 'graficos'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Gráficos Comparativos
          </button>
        </div>

        {/* Botões de exportação */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
            <FileDown className="w-4 h-4 inline mr-1" />
            Exportar:
          </span>
          <ExportarRelatorio eleitores={eleitores} />
        </div>
      </div>

      {/* Conteúdo */}
      {visualizacao === 'tabela' ? (
        <ValidacaoEstatistica eleitores={eleitores} />
      ) : (
        <GraficosComparativos eleitores={eleitores} />
      )}
    </div>
  );
}
