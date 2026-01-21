'use client';

/**
 * Estimativas Eleitorais 2026
 *
 * Agregação de pesquisas eleitorais com análise preditiva.
 * Design inspirado em Apple - minimalista, elegante, funcional.
 *
 * Fontes: TSE, Quaest, Datafolha, AtlasIntel, Paraná Pesquisas, Ipsos-Ipec, Meio/Ideia
 */

import { Suspense, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CardCandidato,
  GraficoAgregado,
  TabelaPesquisas,
  SimuladorSegundoTurno,
  PrevisaoModelo,
  MetricasResumo,
  AvaliacaoGoverno,
  GraficoRejeicao,
  ComparadorInstitutos,
} from '@/components/estimativas';
import {
  PESQUISAS_2026,
  CORES_CANDIDATOS,
  calcularMediaPonderada,
  calcularIntervaloConfianca,
  calcularTendencia,
  calcularProbabilidadeVitoria,
} from '@/data/pesquisas-eleitorais-2026';
import {
  Activity,
  LineChart,
  Users2,
  GitCompare,
  Brain,
  Newspaper,
  ThumbsDown,
  Building2,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function EstimativasContent() {
  const [abaAtiva, setAbaAtiva] = useState('panorama');

  const rankingCandidatos = useMemo(() => {
    const candidatos = [
      'Lula',
      'Flávio Bolsonaro',
      'Tarcísio de Freitas',
      'Ratinho Junior',
      'Ronaldo Caiado',
      'Romeu Zema',
      'Michelle Bolsonaro',
      'Eduardo Leite',
    ];

    const pesquisasRecentes = [...PESQUISAS_2026]
      .sort((a, b) => new Date(b.publicacao).getTime() - new Date(a.publicacao).getTime())
      .slice(0, 3);

    const ranking = candidatos
      .map((candidato) => {
        const media = calcularMediaPonderada(pesquisasRecentes, candidato);
        if (media === 0) return null;

        const intervalo = calcularIntervaloConfianca(media, pesquisasRecentes);
        const tendencia = calcularTendencia(PESQUISAS_2026, candidato);

        return {
          candidato,
          media: Math.round(media * 10) / 10,
          intervalo,
          tendencia,
          cor: CORES_CANDIDATOS[candidato],
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.media || 0) - (a?.media || 0)) as NonNullable<{
      candidato: string;
      media: number;
      intervalo: { inferior: number; superior: number };
      tendencia: { inclinacao: number; direcao: 'subindo' | 'estavel' | 'caindo' };
      cor: string;
    }>[];

    return ranking.map((c, i) => {
      const distancia = i === 0 ? c.media - (ranking[1]?.media || 0) : c.media - ranking[0].media;
      const probVitoria = i === 0 ? calcularProbabilidadeVitoria(c.media, 2, distancia) : 0;
      return { ...c, posicao: i + 1, probVitoria };
    });
  }, []);

  const ultimaAtualizacao = useMemo(() => {
    const maisRecente = PESQUISAS_2026.reduce((mais, p) =>
      new Date(p.publicacao) > new Date(mais.publicacao) ? p : mais
    );
    return format(new Date(maisRecente.publicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, []);

  return (
    <div className="min-h-full bg-gradient-subtle">
      {/* Hero Section - Estilo Apple */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />

        <div className="relative px-6 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Atualizado em {ultimaAtualizacao}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Estimativas
              <span className="block text-gradient">Eleitorais 2026</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Agregação inteligente de pesquisas eleitorais registradas no TSE.
              Análise preditiva, cenários de 1º e 2º turno, rejeição e avaliação de governo.
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground number">
                  {PESQUISAS_2026.length}
                </div>
                <div className="text-sm text-muted-foreground">Pesquisas</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground number">
                  {(
                    PESQUISAS_2026.reduce((acc, p) => acc + p.entrevistados, 0) / 1000
                  ).toFixed(1)}
                  k
                </div>
                <div className="text-sm text-muted-foreground">Entrevistados</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-500 number">
                  {rankingCandidatos[0]?.media.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Líder atual</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground number">6</div>
                <div className="text-sm text-muted-foreground">Institutos</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Métricas Resumo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <MetricasResumo />
          </motion.div>

          {/* Tabs */}
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-muted/50 p-1 mb-8 min-w-max">
                <TabsTrigger
                  value="panorama"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <LineChart className="w-4 h-4" />
                  Panorama
                </TabsTrigger>
                <TabsTrigger
                  value="ranking"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Users2 className="w-4 h-4" />
                  Ranking
                </TabsTrigger>
                <TabsTrigger
                  value="segundo-turno"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <GitCompare className="w-4 h-4" />
                  2º Turno
                </TabsTrigger>
                <TabsTrigger
                  value="modelo"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Brain className="w-4 h-4" />
                  Previsão
                </TabsTrigger>
                <TabsTrigger
                  value="rejeicao"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Rejeição
                </TabsTrigger>
                <TabsTrigger
                  value="governo"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <BarChart3 className="w-4 h-4" />
                  Governo
                </TabsTrigger>
                <TabsTrigger
                  value="institutos"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Building2 className="w-4 h-4" />
                  Institutos
                </TabsTrigger>
                <TabsTrigger
                  value="pesquisas"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Newspaper className="w-4 h-4" />
                  Pesquisas
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              {/* Panorama */}
              <TabsContent value="panorama" className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Gráfico Principal */}
                  <div className="rounded-3xl bg-card border border-border/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Evolução das Intenções de Voto
                        </h2>
                        <p className="text-muted-foreground mt-1">
                          1º Turno - Agregação de todas as pesquisas
                        </p>
                      </div>
                    </div>

                    <GraficoAgregado
                      candidatosSelecionados={['Lula', 'Flávio Bolsonaro', 'Tarcísio de Freitas']}
                      mostrarIntervalos
                    />
                  </div>

                  {/* Cards dos Líderes */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rankingCandidatos.slice(0, 3).map((c) => (
                      <CardCandidato
                        key={c.candidato}
                        posicao={c.posicao}
                        nome={c.candidato}
                        partido={
                          PESQUISAS_2026[0].primeiroTurno.find((r) => r.candidato === c.candidato)
                            ?.partido || ''
                        }
                        percentual={c.media}
                        intervaloInferior={c.intervalo.inferior}
                        intervaloSuperior={c.intervalo.superior}
                        tendencia={c.tendencia.direcao}
                        variacao={Math.abs(c.tendencia.inclinacao)}
                        cor={c.cor}
                        probabilidadeVitoria={c.posicao === 1 ? c.probVitoria : undefined}
                        isLider={c.posicao === 1}
                      />
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Ranking */}
              <TabsContent value="ranking">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Ranking de Candidatos</h2>
                    <p className="text-muted-foreground mt-1">
                      Média ponderada das pesquisas mais recentes
                    </p>
                  </div>

                  {rankingCandidatos.map((c) => (
                    <CardCandidato
                      key={c.candidato}
                      posicao={c.posicao}
                      nome={c.candidato}
                      partido={
                        PESQUISAS_2026[0].primeiroTurno.find((r) => r.candidato === c.candidato)
                          ?.partido || ''
                      }
                      percentual={c.media}
                      intervaloInferior={c.intervalo.inferior}
                      intervaloSuperior={c.intervalo.superior}
                      tendencia={c.tendencia.direcao}
                      variacao={Math.abs(c.tendencia.inclinacao)}
                      cor={c.cor}
                      probabilidadeVitoria={c.posicao === 1 ? c.probVitoria : undefined}
                      isLider={c.posicao === 1}
                    />
                  ))}
                </motion.div>
              </TabsContent>

              {/* 2º Turno */}
              <TabsContent value="segundo-turno">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-card border border-border/50 p-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground">
                      Simulador de 2º Turno
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Compare os cenários de confronto direto
                    </p>
                  </div>

                  <SimuladorSegundoTurno />
                </motion.div>
              </TabsContent>

              {/* Modelo de Previsão */}
              <TabsContent value="modelo">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-card border border-border/50 p-8"
                >
                  <PrevisaoModelo turno="1turno" />
                </motion.div>
              </TabsContent>

              {/* Rejeição */}
              <TabsContent value="rejeicao">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-card border border-border/50 p-8"
                >
                  <GraficoRejeicao />
                </motion.div>
              </TabsContent>

              {/* Avaliação do Governo */}
              <TabsContent value="governo">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-card border border-border/50 p-8"
                >
                  <AvaliacaoGoverno />
                </motion.div>
              </TabsContent>

              {/* Comparação entre Institutos */}
              <TabsContent value="institutos">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl bg-card border border-border/50 p-8"
                >
                  <ComparadorInstitutos />
                </motion.div>
              </TabsContent>

              {/* Pesquisas */}
              <TabsContent value="pesquisas">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Pesquisas Registradas
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Todas as pesquisas com registro no TSE
                      </p>
                    </div>

                    <a
                      href="https://www.tse.jus.br/eleicoes/pesquisa-eleitorais/consulta-as-pesquisas-registradas"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Portal TSE
                    </a>
                  </div>

                  <TabelaPesquisas pesquisas={PESQUISAS_2026} />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Dados de pesquisas eleitorais registradas no TSE. Agregação e análise preditiva.
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.tse.jus.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                TSE
              </a>
              <a
                href="https://www.quaest.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Quaest
              </a>
              <a
                href="https://datafolha.folha.uol.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Datafolha
              </a>
              <a
                href="https://atlasintel.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                AtlasIntel
              </a>
              <a
                href="https://www.paranaPesquisas.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Paraná Pesquisas
              </a>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function PaginaEstimativas() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Carregando estimativas...</p>
          </div>
        </div>
      }
    >
      <EstimativasContent />
    </Suspense>
  );
}
