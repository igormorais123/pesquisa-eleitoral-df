'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  BarChart3,
  MapPin,
  ArrowRight,
  Brain,
  Vote,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { formatarNumero } from '@/lib/utils';
import eleitoresData from '@/data/eleitores-df-1000.json';
import type { Eleitor } from '@/types';
import { useEleitoresStore } from '@/stores/eleitores-store';

// Cores suaves e elegantes
const CORES = {
  azul: '#0071e3',
  verde: '#34c759',
  laranja: '#ff9500',
  rosa: '#ff2d55',
  roxo: '#af52de',
  cinza: '#8e8e93',
};

// Animações suaves
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// Funções auxiliares
function calcularDistribuicao(eleitores: Eleitor[], campo: keyof Eleitor): Record<string, number> {
  const distribuicao: Record<string, number> = {};
  eleitores.forEach((e) => {
    const valor = String(e[campo] || 'Não informado');
    distribuicao[valor] = (distribuicao[valor] || 0) + 1;
  });
  return distribuicao;
}

// Componente de Número Destacado
function NumeroDestaque({
  valor,
  label,
  delay = 0
}: {
  valor: string | number;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center"
    >
      <div className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground">
        {valor}
      </div>
      <div className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
        {label}
      </div>
    </motion.div>
  );
}

// Card de Ação Elegante
function CardAcao({
  titulo,
  descricao,
  href,
  icone: Icone,
}: {
  titulo: string;
  descricao: string;
  href: string;
  icone: React.ElementType;
}) {
  return (
    <Link href={href} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        className="h-full p-8 rounded-3xl bg-card border border-border hover:border-foreground/20 transition-all duration-300"
      >
        <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors">
          <Icone className="w-7 h-7 text-foreground/70" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          {titulo}
          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {descricao}
        </p>
      </motion.div>
    </Link>
  );
}

// Card de Insight Elegante
function CardInsight({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">{titulo}</h3>
      {children}
    </div>
  );
}

// Labels formatados
const LABELS: Record<string, Record<string, string>> = {
  orientacao: {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    centro: 'Centro',
    'centro-direita': 'Centro-Direita',
    direita: 'Direita',
  },
  cluster: {
    G1_alta: 'Alta',
    G2_media_alta: 'Média-Alta',
    G3_media_baixa: 'Média-Baixa',
    G4_baixa: 'Baixa',
  },
};

export default function PaginaInicial() {
  const setEleitores = useEleitoresStore((state) => state.setEleitores);
  const todosEleitores = useEleitoresStore((state) => state.eleitores);

  useEffect(() => {
    if (todosEleitores.length === 0) {
      setEleitores(eleitoresData as unknown as Eleitor[]);
    }
  }, [setEleitores, todosEleitores.length]);

  const eleitores = todosEleitores.length > 0 ? todosEleitores : (eleitoresData as unknown as Eleitor[]);

  // Estatísticas memoizadas
  const stats = useMemo(() => {
    const total = eleitores.length;
    const mediaIdade = eleitores.reduce((acc, e) => acc + e.idade, 0) / total;
    const genero = calcularDistribuicao(eleitores, 'genero');
    const orientacao = calcularDistribuicao(eleitores, 'orientacao_politica');
    const cluster = calcularDistribuicao(eleitores, 'cluster_socioeconomico');
    const regiao = calcularDistribuicao(eleitores, 'regiao_administrativa');

    // Dados para gráficos
    const dadosOrientacao = ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita']
      .filter(o => orientacao[o])
      .map(o => ({
        nome: LABELS.orientacao[o],
        valor: orientacao[o] || 0,
        percentual: ((orientacao[o] || 0) / total * 100).toFixed(0),
      }));

    const dadosCluster = Object.entries(cluster)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor]) => ({
        nome: LABELS.cluster[nome] || nome,
        valor,
        percentual: ((valor / total) * 100).toFixed(0),
      }));

    const topRegioes = Object.entries(regiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([nome, valor]) => ({
        nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome,
        valor,
        percentual: ((valor / total) * 100).toFixed(0),
      }));

    return {
      total,
      mediaIdade,
      totalRegioes: Object.keys(regiao).length,
      masculino: genero['masculino'] || 0,
      feminino: genero['feminino'] || 0,
      dadosOrientacao,
      dadosCluster,
      topRegioes,
    };
  }, [eleitores]);

  const dadosGenero = [
    { nome: 'Masculino', valor: stats.masculino },
    { nome: 'Feminino', valor: stats.feminino },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Estilo Apple */}
      <motion.section
        className="py-16 sm:py-24 lg:py-32 text-center"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.p
          className="text-muted-foreground text-lg mb-4"
          variants={fadeIn}
        >
          Pesquisa Eleitoral DF 2026
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-foreground max-w-4xl mx-auto leading-tight"
          variants={fadeIn}
        >
          Simulação eleitoral com inteligência artificial.
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed"
          variants={fadeIn}
        >
          Mil eleitores sintéticos. Sessenta atributos únicos.
          Respostas que refletem a realidade do Distrito Federal.
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-10"
          variants={fadeIn}
        >
          <Link
            href="/eleitores"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Explorar Eleitores
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/entrevistas/nova"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border border-foreground/20 text-foreground rounded-full font-medium hover:bg-foreground/5 transition-colors"
          >
            Nova Pesquisa
          </Link>
        </motion.div>
      </motion.section>

      {/* Números em Destaque */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <NumeroDestaque
            valor={formatarNumero(stats.total)}
            label="Eleitores Sintéticos"
            delay={0}
          />
          <NumeroDestaque
            valor={stats.totalRegioes}
            label="Regiões do DF"
            delay={0.1}
          />
          <NumeroDestaque
            valor={`${stats.mediaIdade.toFixed(0)}`}
            label="Idade Média"
            delay={0.2}
          />
          <NumeroDestaque
            valor="60+"
            label="Atributos por Perfil"
            delay={0.3}
          />
        </div>
      </section>

      {/* O que é o projeto */}
      <section className="py-16 sm:py-24 border-t border-border">
        <div className="max-w-3xl">
          <motion.h2
            className="text-3xl sm:text-4xl font-semibold text-foreground mb-6"
            {...fadeIn}
          >
            Entenda o eleitor antes da eleição.
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground leading-relaxed mb-8"
            {...fadeIn}
          >
            Cada agente sintético é um perfil completo: dados demográficos,
            posição política, vieses cognitivos, valores pessoais e padrões de consumo de informação.
            Quando você faz uma pergunta, a IA responde como aquele cidadão responderia —
            com suas convicções, medos e esperanças.
          </motion.p>
          <motion.div {...fadeIn}>
            <Link
              href="/eleitores"
              className="inline-flex items-center gap-2 text-foreground font-medium hover:gap-3 transition-all"
            >
              Conheça os perfis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Ações Principais */}
      <section className="py-16 sm:py-24 border-t border-border">
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-foreground mb-12"
          {...fadeIn}
        >
          Comece por aqui.
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardAcao
            titulo="Eleitores"
            descricao="Explore os mil perfis sintéticos. Filtre por região, idade, orientação política e dezenas de outros atributos."
            href="/eleitores"
            icone={Users}
          />
          <CardAcao
            titulo="Entrevistas"
            descricao="Crie pesquisas e questionários. A IA responde como cada eleitor responderia, mantendo coerência com seu perfil."
            href="/entrevistas/nova"
            icone={MessageSquare}
          />
          <CardAcao
            titulo="Resultados"
            descricao="Analise as respostas agregadas. Visualize tendências, compare segmentos e exporte relatórios."
            href="/resultados"
            icone={BarChart3}
          />
        </div>
      </section>

      {/* Insights Visuais */}
      <section className="py-16 sm:py-24 border-t border-border">
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-foreground mb-4"
          {...fadeIn}
        >
          Visão geral da amostra.
        </motion.h2>
        <motion.p
          className="text-muted-foreground mb-12 max-w-2xl"
          {...fadeIn}
        >
          Distribuição demográfica e política dos eleitores sintéticos.
        </motion.p>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Espectro Político */}
          <CardInsight titulo="Espectro Político">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dadosOrientacao} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="nome"
                  type="category"
                  width={110}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} eleitores (${props.payload.percentual}%)`,
                    ''
                  ]}
                />
                <Bar
                  dataKey="valor"
                  fill="var(--foreground)"
                  radius={[0, 6, 6, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardInsight>

          {/* Gênero */}
          <CardInsight titulo="Gênero">
            <div className="flex items-center justify-center gap-12">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={dadosGenero}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="valor"
                  >
                    <Cell fill="var(--foreground)" />
                    <Cell fill="var(--muted-foreground)" opacity={0.4} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-foreground" />
                  <span className="text-foreground font-medium">
                    {((stats.masculino / stats.total) * 100).toFixed(0)}% Masculino
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <span className="text-muted-foreground">
                    {((stats.feminino / stats.total) * 100).toFixed(0)}% Feminino
                  </span>
                </div>
              </div>
            </div>
          </CardInsight>

          {/* Classe Social */}
          <CardInsight titulo="Classe Social">
            <div className="space-y-4">
              {stats.dadosCluster.map((item, index) => (
                <div key={item.nome} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-24">{item.nome}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentual}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-foreground rounded-full"
                      style={{ opacity: 1 - (index * 0.2) }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">
                    {item.percentual}%
                  </span>
                </div>
              ))}
            </div>
          </CardInsight>

          {/* Top Regiões */}
          <CardInsight titulo="Principais Regiões">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.topRegioes}>
                <XAxis
                  dataKey="nome"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} eleitores (${props.payload.percentual}%)`,
                    ''
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="var(--foreground)"
                  fill="var(--foreground)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardInsight>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/eleitores"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Ver análise completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 sm:py-24 border-t border-border">
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-foreground mb-12"
          {...fadeIn}
        >
          Como funciona.
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-12">
          <div>
            <div className="text-5xl font-semibold text-foreground/20 mb-4">01</div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Escolha os eleitores</h3>
            <p className="text-muted-foreground leading-relaxed">
              Selecione perfis específicos ou grupos inteiros baseados em critérios demográficos e políticos.
            </p>
          </div>
          <div>
            <div className="text-5xl font-semibold text-foreground/20 mb-4">02</div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Faça suas perguntas</h3>
            <p className="text-muted-foreground leading-relaxed">
              Crie questionários com perguntas abertas ou fechadas. A IA processa cada resposta individualmente.
            </p>
          </div>
          <div>
            <div className="text-5xl font-semibold text-foreground/20 mb-4">03</div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Analise os resultados</h3>
            <p className="text-muted-foreground leading-relaxed">
              Visualize padrões, compare segmentos e extraia insights sobre o comportamento eleitoral.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24 border-t border-border text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-semibold text-foreground mb-6"
          {...fadeIn}
        >
          Pronto para começar?
        </motion.h2>
        <motion.p
          className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto"
          {...fadeIn}
        >
          Explore a amostra completa e descubra o que os eleitores do DF pensam.
        </motion.p>
        <motion.div {...fadeIn}>
          <Link
            href="/eleitores"
            className="inline-flex items-center gap-2 px-10 py-5 bg-foreground text-background rounded-full text-lg font-medium hover:opacity-90 transition-opacity"
          >
            Explorar Eleitores
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer Info */}
      <section className="py-8 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Desenvolvido por Igor Morais Vasconcelos • Powered by Claude AI (Anthropic)
        </p>
      </section>
    </div>
  );
}
