'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Building2, Scale, Info } from 'lucide-react';
import { PESQUISAS_2026, CORES_CANDIDATOS } from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const INSTITUTOS = ['Quaest', 'Ideia', 'Datafolha', 'AtlasIntel', 'Paraná Pesquisas', 'Ipsos/Ipec'];

export function ComparadorInstitutos() {
  const [candidatoSelecionado, setCandidatoSelecionado] = useState('Lula');

  const candidatosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    PESQUISAS_2026.forEach((p) => {
      p.primeiroTurno.forEach((r) => set.add(r.candidato));
    });
    return Array.from(set);
  }, []);

  const dadosComparacao = useMemo(() => {
    return INSTITUTOS.map((instituto) => {
      const pesquisa = PESQUISAS_2026.find((p) => p.instituto === instituto);
      if (!pesquisa) return { instituto, percentual: 0 };

      const resultado = pesquisa.primeiroTurno.find((r) => r.candidato === candidatoSelecionado);
      return {
        instituto,
        percentual: resultado?.percentual || 0,
        margemErro: pesquisa.margemErro,
        metodologia: pesquisa.metodologia,
        entrevistados: pesquisa.entrevistados,
      };
    }).filter((d) => d.percentual > 0);
  }, [candidatoSelecionado]);

  const media = useMemo(() => {
    if (dadosComparacao.length === 0) return 0;
    return dadosComparacao.reduce((a, b) => a + b.percentual, 0) / dadosComparacao.length;
  }, [dadosComparacao]);

  const desvio = useMemo(() => {
    if (dadosComparacao.length < 2) return 0;
    const variance =
      dadosComparacao.reduce((acc, d) => acc + Math.pow(d.percentual - media, 2), 0) /
      dadosComparacao.length;
    return Math.sqrt(variance);
  }, [dadosComparacao, media]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Comparação entre Institutos</h3>
            <p className="text-sm text-muted-foreground">
              Veja como cada instituto avalia o mesmo candidato
            </p>
          </div>
        </div>

        <Select value={candidatoSelecionado} onValueChange={setCandidatoSelecionado}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {candidatosDisponiveis.map((c) => (
              <SelectItem key={c} value={c}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CORES_CANDIDATOS[c] }}
                  />
                  {c}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-muted/50 text-center">
          <div className="text-sm text-muted-foreground">Média</div>
          <div className="text-2xl font-bold text-foreground number">{media.toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 text-center">
          <div className="text-sm text-muted-foreground">Desvio Padrão</div>
          <div className="text-2xl font-bold text-foreground number">±{desvio.toFixed(1)}pp</div>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 text-center">
          <div className="text-sm text-muted-foreground">Institutos</div>
          <div className="text-2xl font-bold text-foreground number">{dadosComparacao.length}</div>
        </div>
      </div>

      {/* Tabela de comparação */}
      <div className="space-y-3">
        {dadosComparacao
          .sort((a, b) => b.percentual - a.percentual)
          .map((dados, index) => {
            const diff = dados.percentual - media;
            return (
              <motion.div
                key={dados.instituto}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{dados.instituto}</div>
                      <div className="text-xs text-muted-foreground">
                        {dados.metodologia} • {dados.entrevistados?.toLocaleString('pt-BR')} entrevistados
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Barra visual */}
                    <div className="hidden md:block w-32">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(dados.percentual / 60) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: CORES_CANDIDATOS[candidatoSelecionado] }}
                        />
                      </div>
                    </div>

                    {/* Percentual */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-xl font-bold text-foreground number">
                        {dados.percentual}%
                      </div>
                      <div
                        className={cn(
                          'text-xs font-medium',
                          diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'
                        )}
                      >
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}pp vs média
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Nota */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">Diferenças entre institutos</strong> são normais e
          esperadas devido a metodologias distintas (presencial, telefônica, online), períodos de
          coleta diferentes e formulação de perguntas. O desvio padrão indica o grau de
          concordância entre os institutos.
        </div>
      </div>
    </div>
  );
}
