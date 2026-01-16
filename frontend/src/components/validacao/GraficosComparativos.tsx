'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import type { Eleitor } from '@/types';
import { calcularValidacaoEstatistica, type ResumoValidacao } from '@/services/validacao-estatistica';

interface GraficosComparativosProps {
  eleitores: Eleitor[];
}

// Cores
const CORES = {
  amostra: '#3b82f6',      // Azul
  referencia: '#94a3b8',   // Cinza
  positivo: '#22c55e',     // Verde
  negativo: '#ef4444',     // Vermelho
  neutro: '#6b7280',       // Cinza escuro
};

// Tooltip customizado
const TooltipCustomizado = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const amostra = payload.find((p: any) => p.dataKey === 'valorAmostra');
    const referencia = payload.find((p: any) => p.dataKey === 'valorReferencia');
    const diferenca = amostra && referencia ? (amostra.value - referencia.value) : 0;

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {amostra && (
          <p className="text-xs text-blue-400">
            Amostra: <span className="font-bold">{amostra.value.toFixed(1)}%</span>
          </p>
        )}
        {referencia && (
          <p className="text-xs text-gray-400">
            Referência: <span className="font-bold">{referencia.value.toFixed(1)}%</span>
          </p>
        )}
        {amostra && referencia && (
          <p className={`text-xs mt-1 ${diferenca > 0 ? 'text-green-400' : diferenca < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            Diferença: <span className="font-bold">{diferenca > 0 ? '+' : ''}{diferenca.toFixed(1)}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Componente de gráfico de barras comparativo
function GraficoBarrasComparativo({ resumo }: { resumo: ResumoValidacao }) {
  const dados = resumo.divergencias.map((d) => ({
    nome: d.labelCategoria,
    valorAmostra: d.valorAmostra,
    valorReferencia: d.valorReferencia,
    diferenca: d.diferenca,
  }));

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-foreground">{resumo.labelVariavel}</h3>
          <p className="text-xs text-muted-foreground">{resumo.fonte} ({resumo.ano})</p>
        </div>
        <a
          href={resumo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Fonte <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dados} layout="vertical" margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
          <YAxis
            dataKey="nome"
            type="category"
            width={80}
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<TooltipCustomizado />} />
          <Legend
            formatter={(value) => (value === 'valorAmostra' ? 'Amostra' : 'Referência')}
          />
          <Bar
            dataKey="valorReferencia"
            name="Referência"
            fill={CORES.referencia}
            radius={[0, 4, 4, 0]}
          />
          <Bar dataKey="valorAmostra" name="Amostra" radius={[0, 4, 4, 0]}>
            {dados.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  Math.abs(entry.diferenca) <= 3
                    ? CORES.amostra
                    : entry.diferenca > 0
                    ? CORES.positivo
                    : CORES.negativo
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {resumo.observacoes && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          {resumo.observacoes}
        </p>
      )}
    </div>
  );
}

// Componente de radar comparativo
function GraficoRadarComparativo({ resumos }: { resumos: ResumoValidacao[] }) {
  const dados = resumos.map((r) => ({
    variavel: r.labelVariavel,
    desvioMedio: r.mediaDesvio,
    fullMark: 20,
  }));

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="font-medium text-foreground mb-4">Desvio Médio por Variável</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={dados}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="variavel" stroke="#9ca3af" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis stroke="#9ca3af" domain={[0, 20]} />
          <Radar
            name="Desvio Médio"
            dataKey="desvioMedio"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Desvio']}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> ≤3% Ótimo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span> 3-7% Bom
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span> 7-12% Atenção
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span> &gt;12% Crítico
        </span>
      </div>
    </div>
  );
}

// Componente de barras horizontais de desvio
function GraficoDesvios({ resumos }: { resumos: ResumoValidacao[] }) {
  const dados = resumos
    .sort((a, b) => b.mediaDesvio - a.mediaDesvio)
    .map((r) => ({
      nome: r.labelVariavel,
      desvio: r.mediaDesvio,
      status: r.statusGeral,
    }));

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="font-medium text-foreground mb-4">Ranking de Desvio por Variável</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dados} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            stroke="#9ca3af"
            domain={[0, 'auto']}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            dataKey="nome"
            type="category"
            width={120}
            stroke="#9ca3af"
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Desvio médio']}
          />
          <Bar dataKey="desvio" name="Desvio médio" radius={[0, 4, 4, 0]}>
            {dados.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.status === 'otimo'
                    ? '#22c55e'
                    : entry.status === 'bom'
                    ? '#3b82f6'
                    : entry.status === 'atencao'
                    ? '#eab308'
                    : '#ef4444'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente principal
export function GraficosComparativos({ eleitores }: GraficosComparativosProps) {
  const validacao = useMemo(
    () => calcularValidacaoEstatistica(eleitores),
    [eleitores]
  );

  // Selecionar algumas variáveis principais para exibir
  const variaveisPrincipais = validacao.resumos.filter((r) =>
    ['genero', 'cor_raca', 'cluster_socioeconomico', 'orientacao_politica', 'religiao', 'escolaridade'].includes(r.variavel)
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Gráficos Comparativos</h3>

      {/* Gráfico de desvios (visão geral) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoDesvios resumos={validacao.resumos} />
        <GraficoRadarComparativo resumos={validacao.resumos.slice(0, 8)} />
      </div>

      {/* Gráficos individuais por variável */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {variaveisPrincipais.map((resumo) => (
          <GraficoBarrasComparativo key={resumo.variavel} resumo={resumo} />
        ))}
      </div>
    </div>
  );
}

export default GraficosComparativos;
