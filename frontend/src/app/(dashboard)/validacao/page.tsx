'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Table,
  FileDown,
  Users,
  Database,
  ExternalLink,
  Sparkles,
  Map,
  Shield,
} from 'lucide-react';
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
      {/* Header com título e links */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary" />
            Validação Estatística
          </h1>
          <p className="text-muted-foreground mt-1">
            Comparação da amostra sintética com dados oficiais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/eleitores"
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
          >
            <Users className="w-4 h-4" />
            Ver Eleitores
          </Link>
          <Link
            href="/eleitores/gerar"
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Gerar Eleitores
          </Link>
          <Link
            href="/mapa"
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors text-sm"
          >
            <Map className="w-4 h-4" />
            Mapa DF
          </Link>
        </div>
      </div>

      {/* Fontes de dados oficiais */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Fontes de Dados Oficiais
        </h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://censo2022.ibge.gov.br/sobre/resultados.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-colors"
          >
            <span>IBGE Censo 2022</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          <a
            href="https://www.codeplan.df.gov.br/pdad-2021/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-colors"
          >
            <span>CODEPLAN PDAD 2021</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          <a
            href="https://www12.senado.leg.br/institucional/datasenado"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-colors"
          >
            <span>DataSenado</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          <a
            href="https://datafolha.folha.uol.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-colors"
          >
            <span>Datafolha</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
          <a
            href="https://www.tse.jus.br/eleicoes/estatisticas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm rounded-lg transition-colors"
          >
            <span>TSE Estatísticas</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </div>

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
