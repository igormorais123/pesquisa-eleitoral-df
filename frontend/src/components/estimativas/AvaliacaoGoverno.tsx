'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ThumbsUp, ThumbsDown, Minus, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PESQUISAS_2026,
  AVALIACAO_GOVERNO_HISTORICO,
  AVALIACAO_REGIONAL,
  obterUltimaAvaliacaoGoverno,
} from '@/data/pesquisas-eleitorais-2026';
import { cn } from '@/lib/utils';

const CORES_AVALIACAO = {
  otimoBom: '#22C55E',
  regular: '#F59E0B',
  ruimPessimo: '#EF4444',
  aprovacao: '#22C55E',
  desaprovacao: '#EF4444',
};

const REGIOES = [
  { id: 'nordeste', nome: 'Nordeste', cor: '#3B82F6' },
  { id: 'norte', nome: 'Norte', cor: '#10B981' },
  { id: 'centroOeste', nome: 'Centro-Oeste', cor: '#F59E0B' },
  { id: 'sudeste', nome: 'Sudeste', cor: '#8B5CF6' },
  { id: 'sul', nome: 'Sul', cor: '#EC4899' },
];

export function AvaliacaoGoverno() {
  const avaliacao = obterUltimaAvaliacaoGoverno();
  const ultimaPesquisa = PESQUISAS_2026.find((p) => p.avaliacaoGoverno);

  const dadosPizza = useMemo(() => {
    if (!avaliacao) return [];
    return [
      { name: 'Ótimo/Bom', value: avaliacao.otimoBom, cor: CORES_AVALIACAO.otimoBom },
      { name: 'Regular', value: avaliacao.regular, cor: CORES_AVALIACAO.regular },
      { name: 'Ruim/Péssimo', value: avaliacao.ruimPessimo, cor: CORES_AVALIACAO.ruimPessimo },
    ];
  }, [avaliacao]);

  const dadosHistorico = useMemo(() => {
    return AVALIACAO_GOVERNO_HISTORICO.map((d) => ({
      ...d,
      dataFormatada: format(parseISO(d.data), "MMM/yy", { locale: ptBR }),
    }));
  }, []);

  if (!avaliacao) return null;

  const diferencaAprovacao = avaliacao.aprovacao - avaliacao.desaprovacao;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avaliação do Governo Lula</h2>
          <p className="text-muted-foreground mt-1">
            {ultimaPesquisa?.instituto}
            {ultimaPesquisa?.publicacao && (
              <> • {format(parseISO(ultimaPesquisa.publicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</>
            )}
          </p>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Aprovação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Aprovação</div>
              <div className="text-3xl font-bold text-emerald-500 number">{avaliacao.aprovacao}%</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Aprovam a forma como Lula está governando
          </div>
        </motion.div>

        {/* Desaprovação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Desaprovação</div>
              <div className="text-3xl font-bold text-red-500 number">{avaliacao.desaprovacao}%</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Desaprovam a forma como Lula está governando
          </div>
        </motion.div>

        {/* Saldo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'p-6 rounded-2xl border',
            diferencaAprovacao > 0
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : diferencaAprovacao < 0
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-muted/50 border-border'
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                diferencaAprovacao > 0
                  ? 'bg-emerald-500/20'
                  : diferencaAprovacao < 0
                  ? 'bg-red-500/20'
                  : 'bg-muted'
              )}
            >
              {diferencaAprovacao > 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              ) : diferencaAprovacao < 0 ? (
                <TrendingDown className="w-6 h-6 text-red-500" />
              ) : (
                <Minus className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Saldo</div>
              <div
                className={cn(
                  'text-3xl font-bold number',
                  diferencaAprovacao > 0
                    ? 'text-emerald-500'
                    : diferencaAprovacao < 0
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                )}
              >
                {diferencaAprovacao > 0 ? '+' : ''}
                {diferencaAprovacao}pp
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Diferença entre aprovação e desaprovação
          </div>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pizza de Avaliação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-card border border-border/50"
        >
          <h3 className="font-semibold text-foreground mb-4">Avaliação do Governo</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg p-3 shadow-xl">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: data.cor }}
                          />
                          <span className="text-sm text-foreground">{data.name}</span>
                        </div>
                        <div className="text-lg font-bold text-foreground mt-1">{data.value}%</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {dadosPizza.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Histórico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-card border border-border/50"
        >
          <h3 className="font-semibold text-foreground mb-4">Evolução da Aprovação</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosHistorico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  dataKey="dataFormatada"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  domain={[20, 60]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg p-3 shadow-xl">
                        <div className="text-sm text-muted-foreground mb-2">
                          {payload[0]?.payload?.dataFormatada}
                        </div>
                        {payload.map((p: any) => (
                          <div key={p.dataKey} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="text-sm capitalize">
                                {p.dataKey === 'aprovacao' ? 'Aprovação' : 'Desaprovação'}
                              </span>
                            </div>
                            <span className="font-semibold">{p.value}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="aprovacao"
                  stroke={CORES_AVALIACAO.aprovacao}
                  strokeWidth={3}
                  dot={{ fill: CORES_AVALIACAO.aprovacao, strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="desaprovacao"
                  stroke={CORES_AVALIACAO.desaprovacao}
                  strokeWidth={3}
                  dot={{ fill: CORES_AVALIACAO.desaprovacao, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CORES_AVALIACAO.aprovacao }}
              />
              <span className="text-sm text-muted-foreground">Aprovação</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CORES_AVALIACAO.desaprovacao }}
              />
              <span className="text-sm text-muted-foreground">Desaprovação</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Avaliação Regional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Aprovação por Região</h3>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {REGIOES.map((regiao) => {
            const dados = AVALIACAO_REGIONAL[regiao.id as keyof typeof AVALIACAO_REGIONAL];
            const saldo = dados.aprovacao - dados.desaprovacao;

            return (
              <div
                key={regiao.id}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:shadow-md',
                  saldo > 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                )}
              >
                <div className="text-sm font-medium text-foreground mb-3">{regiao.nome}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Aprova</span>
                    <span className="text-sm font-semibold text-emerald-500">{dados.aprovacao}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Desaprova</span>
                    <span className="text-sm font-semibold text-red-500">{dados.desaprovacao}%</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div
                      className={cn(
                        'text-center text-sm font-bold',
                        saldo > 0 ? 'text-emerald-500' : 'text-red-500'
                      )}
                    >
                      {saldo > 0 ? '+' : ''}
                      {saldo}pp
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
