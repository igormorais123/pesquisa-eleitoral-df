'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PESQUISAS_2026, CORES_CANDIDATOS, gerarSerieTemporalCandidato } from '@/data/pesquisas-eleitorais-2026';

interface GraficoAgregadoProps {
  candidatosSelecionados?: string[];
  mostrarIntervalos?: boolean;
}

export function GraficoAgregado({
  candidatosSelecionados = ['Lula', 'Flávio Bolsonaro', 'Tarcísio de Freitas'],
  mostrarIntervalos = true,
}: GraficoAgregadoProps) {
  const dadosGrafico = useMemo(() => {
    // Coletar todas as datas únicas
    const datasSet = new Set<string>();
    PESQUISAS_2026.forEach((p) => datasSet.add(p.publicacao));
    const datas = Array.from(datasSet).sort();

    // Criar série de dados
    return datas.map((data) => {
      const ponto: Record<string, number | string> = {
        data,
        dataFormatada: format(parseISO(data), "dd MMM", { locale: ptBR }),
      };

      candidatosSelecionados.forEach((candidato) => {
        const pesquisasData = PESQUISAS_2026.filter((p) => p.publicacao === data);
        const valores: number[] = [];
        let margemMedia = 0;
        let count = 0;

        pesquisasData.forEach((p) => {
          const resultado = p.primeiroTurno.find((r) => r.candidato === candidato);
          if (resultado) {
            valores.push(resultado.percentual);
            margemMedia += p.margemErro;
            count++;
          }
        });

        if (valores.length > 0) {
          const media = valores.reduce((a, b) => a + b, 0) / valores.length;
          const margem = margemMedia / count;
          ponto[candidato] = media;
          ponto[`${candidato}_superior`] = media + margem;
          ponto[`${candidato}_inferior`] = media - margem;
        }
      });

      return ponto;
    });
  }, [candidatosSelecionados]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    // Buscar a data original do payload
    const dataOriginal = payload[0]?.payload?.data;
    const dataFormatada = dataOriginal
      ? format(parseISO(dataOriginal), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : '';

    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-4 shadow-xl">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {dataFormatada}
        </p>
        <div className="space-y-2">
          {payload
            .filter((p: any) => !p.dataKey.includes('_'))
            .map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-foreground">{entry.dataKey}</span>
                </div>
                <span className="text-sm font-semibold text-foreground number">
                  {entry.value?.toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={dadosGrafico}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <defs>
              {candidatosSelecionados.map((candidato) => (
                <linearGradient
                  key={candidato}
                  id={`gradient-${candidato.replace(/\s/g, '')}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CORES_CANDIDATOS[candidato]}
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    stopColor={CORES_CANDIDATOS[candidato]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="dataFormatada"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              dy={10}
            />

            <YAxis
              domain={[0, 60]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Linha de 50% para referência */}
            <ReferenceLine
              y={50}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeOpacity={0.3}
            />

            {/* Áreas de intervalo de confiança */}
            {mostrarIntervalos &&
              candidatosSelecionados.map((candidato) => (
                <Area
                  key={`area-${candidato}`}
                  type="monotone"
                  dataKey={`${candidato}_superior`}
                  stroke="transparent"
                  fill={`url(#gradient-${candidato.replace(/\s/g, '')})`}
                  connectNulls
                />
              ))}

            {/* Linhas principais */}
            {candidatosSelecionados.map((candidato) => (
              <Line
                key={candidato}
                type="monotone"
                dataKey={candidato}
                stroke={CORES_CANDIDATOS[candidato]}
                strokeWidth={3}
                dot={{
                  fill: CORES_CANDIDATOS[candidato],
                  strokeWidth: 2,
                  stroke: 'hsl(var(--card))',
                  r: 5,
                }}
                activeDot={{
                  fill: CORES_CANDIDATOS[candidato],
                  strokeWidth: 3,
                  stroke: 'hsl(var(--card))',
                  r: 7,
                }}
                connectNulls
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {candidatosSelecionados.map((candidato) => (
          <div key={candidato} className="flex items-center gap-2">
            <div
              className="w-4 h-1 rounded-full"
              style={{ backgroundColor: CORES_CANDIDATOS[candidato] }}
            />
            <span className="text-sm text-muted-foreground">{candidato}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
