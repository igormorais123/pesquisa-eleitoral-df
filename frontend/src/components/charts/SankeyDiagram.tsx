'use client';

/**
 * Componente de Diagrama Sankey
 * Visualiza fluxos entre categorias de eleitores
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

// Importar Plotly dinamicamente para evitar SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SankeyDiagramProps {
  eleitores: Eleitor[];
  altura?: number;
  tipo?: 'regiao-orientacao' | 'escolaridade-interesse' | 'idade-orientacao' | 'renda-orientacao';
}

// Cores para os nós
const CORES_NOS: Record<string, string> = {
  // Regiões (tons de azul)
  'Plano Piloto': '#3b82f6',
  'Taguatinga': '#60a5fa',
  'Ceilândia': '#93c5fd',
  'Samambaia': '#2563eb',
  'Águas Claras': '#1d4ed8',
  'Gama': '#1e40af',
  'Santa Maria': '#1e3a8a',
  'Outras Regiões': '#6b7280',

  // Orientações políticas (espectro)
  'Extrema-esquerda': '#dc2626',
  'Esquerda': '#f87171',
  'Centro-esquerda': '#fbbf24',
  'Centro': '#a3a3a3',
  'Centro-direita': '#22d3ee',
  'Direita': '#3b82f6',
  'Extrema-direita': '#1e3a8a',

  // Escolaridade (tons de verde)
  'Fundamental incompleto': '#166534',
  'Fundamental completo': '#15803d',
  'Médio incompleto': '#16a34a',
  'Médio completo': '#22c55e',
  'Superior incompleto': '#4ade80',
  'Superior completo': '#86efac',
  'Pós-graduação': '#bbf7d0',

  // Interesse político (tons de roxo)
  'alto': '#7c3aed',
  'médio': '#a78bfa',
  'baixo': '#c4b5fd',

  // Faixas etárias (tons de laranja)
  '16-24': '#ea580c',
  '25-34': '#f97316',
  '35-44': '#fb923c',
  '45-54': '#fdba74',
  '55-64': '#fed7aa',
  '65+': '#ffedd5',

  // Renda
  'Até 2 SM': '#0891b2',
  '2-5 SM': '#06b6d4',
  '5-10 SM': '#22d3ee',
  '10-20 SM': '#67e8f9',
  'Acima de 20 SM': '#a5f3fc',
};

function getFaixaEtaria(idade: number): string {
  if (idade < 25) return '16-24';
  if (idade < 35) return '25-34';
  if (idade < 45) return '35-44';
  if (idade < 55) return '45-54';
  if (idade < 65) return '55-64';
  return '65+';
}

function getFaixaRenda(renda: string | undefined): string {
  if (!renda) return 'Até 2 SM';
  const valor = renda.toLowerCase();
  if (valor.includes('até 2') || valor.includes('1 salário')) return 'Até 2 SM';
  if (valor.includes('2 a 5') || valor.includes('2-5')) return '2-5 SM';
  if (valor.includes('5 a 10') || valor.includes('5-10')) return '5-10 SM';
  if (valor.includes('10 a 20') || valor.includes('10-20')) return '10-20 SM';
  if (valor.includes('acima') || valor.includes('20')) return 'Acima de 20 SM';
  return 'Até 2 SM';
}

function agruparRegioes(regiao: string, topRegioes: Set<string>): string {
  return topRegioes.has(regiao) ? regiao : 'Outras Regiões';
}

export function SankeyDiagram({
  eleitores,
  altura = 500,
  tipo = 'regiao-orientacao',
}: SankeyDiagramProps) {
  const [loading, setLoading] = useState(true);

  const { nodes, links, nodeColors } = useMemo(() => {
    if (eleitores.length === 0) {
      return { nodes: [], links: [], nodeColors: [] };
    }

    const nodeSet = new Map<string, number>();
    const linkMap = new Map<string, number>();

    // Determinar top regiões
    const contagemRegioes: Record<string, number> = {};
    eleitores.forEach(e => {
      contagemRegioes[e.regiao_administrativa] = (contagemRegioes[e.regiao_administrativa] || 0) + 1;
    });
    const topRegioes = new Set(
      Object.entries(contagemRegioes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([regiao]) => regiao)
    );

    // Processar cada eleitor
    eleitores.forEach((eleitor) => {
      let origem: string;
      let destino: string;

      switch (tipo) {
        case 'regiao-orientacao':
          origem = agruparRegioes(eleitor.regiao_administrativa, topRegioes);
          destino = eleitor.orientacao_politica || 'Centro';
          break;
        case 'escolaridade-interesse':
          origem = eleitor.escolaridade || 'Médio completo';
          destino = eleitor.interesse_politico || 'médio';
          break;
        case 'idade-orientacao':
          origem = getFaixaEtaria(eleitor.idade);
          destino = eleitor.orientacao_politica || 'Centro';
          break;
        case 'renda-orientacao':
          origem = getFaixaRenda(eleitor.renda_salarios_minimos);
          destino = eleitor.orientacao_politica || 'Centro';
          break;
        default:
          origem = eleitor.regiao_administrativa;
          destino = eleitor.orientacao_politica || 'Centro';
      }

      // Adicionar nós
      if (!nodeSet.has(origem)) {
        nodeSet.set(origem, nodeSet.size);
      }
      if (!nodeSet.has(destino)) {
        nodeSet.set(destino, nodeSet.size);
      }

      // Adicionar link
      const linkKey = `${origem}->${destino}`;
      linkMap.set(linkKey, (linkMap.get(linkKey) || 0) + 1);
    });

    // Converter para arrays
    const nodeNames = Array.from(nodeSet.keys());
    const nodeIndices = new Map(nodeNames.map((name, i) => [name, i]));

    const colors = nodeNames.map(name => CORES_NOS[name] || '#6b7280');

    const linkArray = Array.from(linkMap.entries()).map(([key, value]) => {
      const [origem, destino] = key.split('->');
      return {
        source: nodeIndices.get(origem) ?? 0,
        target: nodeIndices.get(destino) ?? 0,
        value,
      };
    });

    return {
      nodes: nodeNames,
      links: linkArray,
      nodeColors: colors,
    };
  }, [eleitores, tipo]);

  const titulos: Record<string, string> = {
    'regiao-orientacao': 'Fluxo: Região → Orientação Política',
    'escolaridade-interesse': 'Fluxo: Escolaridade → Interesse Político',
    'idade-orientacao': 'Fluxo: Faixa Etária → Orientação Política',
    'renda-orientacao': 'Fluxo: Faixa de Renda → Orientação Política',
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível para visualização
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: altura }}>
      <Plot
        data={[
          {
            type: 'sankey',
            orientation: 'h',
            node: {
              pad: 15,
              thickness: 20,
              line: {
                color: 'rgba(0,0,0,0.3)',
                width: 0.5,
              },
              label: nodes,
              color: nodeColors,
            },
            link: {
              source: links.map(l => l.source),
              target: links.map(l => l.target),
              value: links.map(l => l.value),
              color: links.map(() => 'rgba(156, 163, 175, 0.3)'),
            },
          },
        ]}
        layout={{
          title: {
            text: titulos[tipo],
            font: { color: '#e5e7eb', size: 14 },
          },
          font: { color: '#9ca3af', size: 11 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          margin: { l: 10, r: 10, t: 40, b: 10 },
          height: altura - 20,
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '100%' }}
        onInitialized={() => setLoading(false)}
        onUpdate={() => setLoading(false)}
      />
    </div>
  );
}

// Componente wrapper com seletor de tipo
interface SankeyComSeletorProps {
  eleitores: Eleitor[];
  altura?: number;
}

export function SankeyComSeletor({ eleitores, altura = 500 }: SankeyComSeletorProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<SankeyDiagramProps['tipo']>('regiao-orientacao');

  const opcoes: Array<{ value: SankeyDiagramProps['tipo']; label: string }> = [
    { value: 'regiao-orientacao', label: 'Região → Orientação' },
    { value: 'escolaridade-interesse', label: 'Escolaridade → Interesse' },
    { value: 'idade-orientacao', label: 'Idade → Orientação' },
    { value: 'renda-orientacao', label: 'Renda → Orientação' },
  ];

  return (
    <div className="space-y-4">
      {/* Seletor de tipo */}
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <button
            key={opcao.value}
            onClick={() => setTipoSelecionado(opcao.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              tipoSelecionado === opcao.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {/* Diagrama */}
      <SankeyDiagram
        eleitores={eleitores}
        altura={altura - 50}
        tipo={tipoSelecionado}
      />
    </div>
  );
}

export default SankeyDiagram;
