'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { Pesquisa, CORES_CANDIDATOS } from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';

interface TabelaPesquisasProps {
  pesquisas: Pesquisa[];
}

export function TabelaPesquisas({ pesquisas }: TabelaPesquisasProps) {
  const [expandido, setExpandido] = useState<string | null>(null);

  const metodologiaLabel: Record<string, string> = {
    presencial: 'Presencial',
    telefonica: 'Telefônica',
    online: 'Online',
    mista: 'Mista',
  };

  return (
    <div className="space-y-3">
      {pesquisas.map((pesquisa, index) => (
        <motion.div
          key={pesquisa.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'rounded-2xl border border-border/50 overflow-hidden transition-all duration-300',
            'hover:border-border hover:shadow-lg hover:shadow-black/5',
            expandido === pesquisa.id && 'ring-2 ring-primary/20'
          )}
        >
          {/* Header */}
          <button
            onClick={() => setExpandido(expandido === pesquisa.id ? null : pesquisa.id)}
            className="w-full p-5 bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo Instituto */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {pesquisa.instituto.charAt(0)}
                  </span>
                </div>

                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{pesquisa.instituto}</h3>
                  <p className="text-sm text-muted-foreground">{pesquisa.contratante}</p>
                </div>
              </div>

              {/* Metadados */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(parseISO(pesquisa.publicacao), "dd MMM yyyy", { locale: ptBR })}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {pesquisa.entrevistados.toLocaleString('pt-BR')}
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                  ±{pesquisa.margemErro}pp
                </div>
              </div>

              {/* Expandir */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex -space-x-1">
                  {pesquisa.primeiroTurno.slice(0, 4).map((r) => (
                    <div
                      key={r.candidato}
                      className="w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: r.cor }}
                      title={`${r.candidato}: ${r.percentual}%`}
                    >
                      {r.percentual}
                    </div>
                  ))}
                </div>

                <motion.div
                  animate={{ rotate: expandido === pesquisa.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
          </button>

          {/* Conteúdo Expandido */}
          <AnimatePresence>
            {expandido === pesquisa.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6">
                  {/* Divider */}
                  <div className="border-t border-border/50" />

                  {/* 1º Turno */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-4">
                      1º Turno - Estimulada
                    </h4>
                    <div className="space-y-3">
                      {pesquisa.primeiroTurno.map((resultado) => (
                        <div key={resultado.candidato} className="flex items-center gap-4">
                          <div className="w-32 flex-shrink-0">
                            <span className="text-sm font-medium text-foreground">
                              {resultado.candidato}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {resultado.partido}
                            </span>
                          </div>
                          <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${resultado.percentual}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                              className="h-full rounded-lg"
                              style={{ backgroundColor: resultado.cor }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-foreground number">
                              {resultado.percentual}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2º Turno */}
                  {pesquisa.segundoTurno.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-4">
                        2º Turno - Cenários
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        {pesquisa.segundoTurno.map((cenario) => (
                          <div
                            key={cenario.cenario}
                            className="p-4 rounded-xl bg-muted/20 border border-border/30"
                          >
                            <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                              {cenario.cenario}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground number">
                                  {cenario.candidato1.percentual}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {cenario.candidato1.nome}
                                </div>
                              </div>
                              <div className="text-muted-foreground text-lg font-light">×</div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-foreground number">
                                  {cenario.candidato2.percentual}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {cenario.candidato2.nome}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadados Técnicos */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border/30">
                    <div className="px-3 py-1.5 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">Metodologia:</span>{' '}
                      <span className="font-medium text-foreground">
                        {metodologiaLabel[pesquisa.metodologia]}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">Confiança:</span>{' '}
                      <span className="font-medium text-foreground">{pesquisa.confianca}%</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/30 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">TSE:</span>{' '}
                      <span className="font-medium text-foreground">{pesquisa.registroTSE}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-muted/30 text-xs">
                      <span className="text-muted-foreground">Período:</span>{' '}
                      <span className="font-medium text-foreground">
                        {format(parseISO(pesquisa.dataInicio), "dd/MM", { locale: ptBR })} a{' '}
                        {format(parseISO(pesquisa.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
