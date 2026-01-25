'use client';

/**
 * Componente de Pirâmide Etária
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { Eleitor } from '@/types';

interface PiramideEtariaProps {
  eleitores: Eleitor[];
  altura?: number;
}

interface FaixaEtaria {
  faixa: string;
  masculino: number;
  feminino: number;
  masculinoNeg: number;
}

// Definir faixas etárias
const FAIXAS = [
  { min: 16, max: 24, label: '16-24' },
  { min: 25, max: 34, label: '25-34' },
  { min: 35, max: 44, label: '35-44' },
  { min: 45, max: 54, label: '45-54' },
  { min: 55, max: 64, label: '55-64' },
  { min: 65, max: 120, label: '65+' },
];

export function PiramideEtaria({ eleitores, altura = 350 }: PiramideEtariaProps) {
  // Processar dados
  const dados = useMemo(() => {
    const resultado: FaixaEtaria[] = FAIXAS.map((faixa) => {
      const masculino = eleitores.filter(
        (e) =>
          e.genero === 'masculino' && e.idade >= faixa.min && e.idade <= faixa.max
      ).length;

      const feminino = eleitores.filter(
        (e) =>
          e.genero === 'feminino' && e.idade >= faixa.min && e.idade <= faixa.max
      ).length;

      return {
        faixa: faixa.label,
        masculino,
        feminino,
        masculinoNeg: -masculino, // Negativo para o lado esquerdo
      };
    });

    return resultado;
  }, [eleitores]);

  // Calcular máximo para escala simétrica
  const maxValor = useMemo(() => {
    return Math.max(
      ...dados.map((d) => Math.max(d.masculino, d.feminino))
    );
  }, [dados]);

  // Totais
  const totais = useMemo(() => {
    const masc = eleitores.filter((e) => e.genero === 'masculino').length;
    const fem = eleitores.filter((e) => e.genero === 'feminino').length;
    return { masculino: masc, feminino: fem };
  }, [eleitores]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const masculino = Math.abs(payload.find((p) => p.dataKey === 'masculinoNeg')?.value || 0);
      const feminino = payload.find((p) => p.dataKey === 'feminino')?.value || 0;

      return (
        <div className="bg-secondary/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label} anos</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-400">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2" />
              Masculino: {masculino}
            </p>
            <p className="text-pink-400">
              <span className="inline-block w-3 h-3 rounded-full bg-pink-400 mr-2" />
              Feminino: {feminino}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-sm text-muted-foreground">
            Masculino ({totais.masculino})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-400" />
          <span className="text-sm text-muted-foreground">
            Feminino ({totais.feminino})
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={altura}>
        <BarChart
          data={dados}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            domain={[-maxValor - 5, maxValor + 5]}
            tickFormatter={(value) => Math.abs(value).toString()}
            stroke="#9ca3af"
            fontSize={12}
          />
          <YAxis
            type="category"
            dataKey="faixa"
            stroke="#9ca3af"
            fontSize={12}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#6b7280" />

          {/* Barras masculinas (lado esquerdo, valores negativos) */}
          <Bar
            dataKey="masculinoNeg"
            name="Masculino"
            radius={[4, 0, 0, 4]}
          >
            {dados.map((entry, index) => (
              <Cell key={index} fill="#60a5fa" />
            ))}
          </Bar>

          {/* Barras femininas (lado direito, valores positivos) */}
          <Bar
            dataKey="feminino"
            name="Feminino"
            radius={[0, 4, 4, 0]}
          >
            {dados.map((entry, index) => (
              <Cell key={index} fill="#f472b6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PiramideEtaria;
