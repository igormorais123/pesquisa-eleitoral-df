'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PESQUISAS_2026, CORES_CANDIDATOS, calcularProbabilidadeVitoria } from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';

const CANDIDATOS_DISPONIVEIS = [
  { nome: 'Lula', partido: 'PT' },
  { nome: 'Flávio Bolsonaro', partido: 'PL' },
  { nome: 'Tarcísio de Freitas', partido: 'Republicanos' },
  { nome: 'Michelle Bolsonaro', partido: 'PL' },
  { nome: 'Ratinho Junior', partido: 'PSD' },
  { nome: 'Ronaldo Caiado', partido: 'União Brasil' },
  { nome: 'Romeu Zema', partido: 'Novo' },
];

export function SimuladorSegundoTurno() {
  const [candidato1, setCandidato1] = useState('Lula');
  const [candidato2, setCandidato2] = useState('Flávio Bolsonaro');

  const resultado = useMemo(() => {
    // Buscar o cenário mais recente disponível
    for (const pesquisa of PESQUISAS_2026) {
      const cenario = pesquisa.segundoTurno.find(
        (s) =>
          (s.candidato1.nome === candidato1 && s.candidato2.nome === candidato2) ||
          (s.candidato1.nome === candidato2 && s.candidato2.nome === candidato1)
      );

      if (cenario) {
        const c1 =
          cenario.candidato1.nome === candidato1 ? cenario.candidato1 : cenario.candidato2;
        const c2 =
          cenario.candidato2.nome === candidato2 ? cenario.candidato2 : cenario.candidato1;

        return {
          candidato1: { ...c1, cor: CORES_CANDIDATOS[c1.nome] },
          candidato2: { ...c2, cor: CORES_CANDIDATOS[c2.nome] },
          brancoNulo: cenario.brancoNulo,
          naoSabe: cenario.naoSabe,
          instituto: pesquisa.instituto,
          data: pesquisa.publicacao,
          margemErro: pesquisa.margemErro,
        };
      }
    }

    return null;
  }, [candidato1, candidato2]);

  const probabilidades = useMemo(() => {
    if (!resultado) return null;

    const p1 = resultado.candidato1.percentual;
    const p2 = resultado.candidato2.percentual;
    const margem = resultado.margemErro;

    return {
      candidato1: calcularProbabilidadeVitoria(p1, margem, p1 - p2),
      candidato2: calcularProbabilidadeVitoria(p2, margem, p2 - p1),
    };
  }, [resultado]);

  return (
    <div className="space-y-8">
      {/* Seletores */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Select value={candidato1} onValueChange={setCandidato1}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CANDIDATOS_DISPONIVEIS.filter((c) => c.nome !== candidato2).map((c) => (
              <SelectItem key={c.nome} value={c.nome}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CORES_CANDIDATOS[c.nome] }}
                  />
                  {c.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-2xl font-light text-muted-foreground">vs</span>

        <Select value={candidato2} onValueChange={setCandidato2}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CANDIDATOS_DISPONIVEIS.filter((c) => c.nome !== candidato1).map((c) => (
              <SelectItem key={c.nome} value={c.nome}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CORES_CANDIDATOS[c.nome] }}
                  />
                  {c.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultado */}
      {resultado ? (
        <motion.div
          key={`${candidato1}-${candidato2}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Barra de Confronto */}
          <div className="relative">
            <div className="flex h-20 rounded-2xl overflow-hidden shadow-lg">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${resultado.candidato1.percentual}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex items-center justify-center relative"
                style={{ backgroundColor: resultado.candidato1.cor }}
              >
                <span className="text-white text-3xl font-bold number">
                  {resultado.candidato1.percentual}%
                </span>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${resultado.brancoNulo + resultado.naoSabe}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                className="flex items-center justify-center bg-muted"
              >
                <span className="text-muted-foreground text-sm font-medium">
                  {resultado.brancoNulo + resultado.naoSabe}%
                </span>
              </motion.div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${resultado.candidato2.percentual}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="flex items-center justify-center"
                style={{ backgroundColor: resultado.candidato2.cor }}
              >
                <span className="text-white text-3xl font-bold number">
                  {resultado.candidato2.percentual}%
                </span>
              </motion.div>
            </div>
          </div>

          {/* Cards dos Candidatos */}
          <div className="grid grid-cols-2 gap-6">
            {/* Candidato 1 */}
            <div
              className={cn(
                'p-6 rounded-2xl border-2 text-center',
                resultado.candidato1.percentual > resultado.candidato2.percentual
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border/50 bg-card'
              )}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: resultado.candidato1.cor }}
              >
                {resultado.candidato1.nome.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {resultado.candidato1.nome}
              </h3>
              <p className="text-sm text-muted-foreground">{resultado.candidato1.partido}</p>

              {probabilidades && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">Prob. de vitória</div>
                  <div
                    className={cn(
                      'text-3xl font-bold number mt-1',
                      probabilidades.candidato1 >= 70
                        ? 'text-emerald-500'
                        : probabilidades.candidato1 >= 50
                        ? 'text-amber-500'
                        : 'text-red-500'
                    )}
                  >
                    {probabilidades.candidato1}%
                  </div>
                </div>
              )}
            </div>

            {/* Candidato 2 */}
            <div
              className={cn(
                'p-6 rounded-2xl border-2 text-center',
                resultado.candidato2.percentual > resultado.candidato1.percentual
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-border/50 bg-card'
              )}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                style={{ backgroundColor: resultado.candidato2.cor }}
              >
                {resultado.candidato2.nome.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                {resultado.candidato2.nome}
              </h3>
              <p className="text-sm text-muted-foreground">{resultado.candidato2.partido}</p>

              {probabilidades && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">Prob. de vitória</div>
                  <div
                    className={cn(
                      'text-3xl font-bold number mt-1',
                      probabilidades.candidato2 >= 70
                        ? 'text-emerald-500'
                        : probabilidades.candidato2 >= 50
                        ? 'text-amber-500'
                        : 'text-red-500'
                    )}
                  >
                    {probabilidades.candidato2}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fonte */}
          <div className="text-center text-sm text-muted-foreground">
            Fonte: {resultado.instituto} • Margem de erro: ±{resultado.margemErro}pp
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>Cenário não disponível nas pesquisas registradas.</p>
          <p className="text-sm mt-2">Selecione outro par de candidatos.</p>
        </div>
      )}
    </div>
  );
}
