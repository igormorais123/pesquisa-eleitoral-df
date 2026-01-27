'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Users, Brain, BarChart3, MessageSquare, Sparkles,
  GraduationCap, FileSearch, Building2, Gamepad2,
  ArrowRight, Search, Settings, LogOut, ChevronRight,
  Zap, Target, TrendingUp, Shield, Globe, Bot,
  BookOpen, Code2, Microscope, Play, ExternalLink,
  Star, Clock, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// Tipos
interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  descricaoLonga?: string;
  icone: React.ElementType;
  cor: string;
  corGradiente: string;
  href: string;
  externo?: boolean;
  status: 'ativo' | 'beta' | 'em-breve' | 'novo';
  categoria: 'pesquisa' | 'educacao' | 'governo' | 'inovacao';
  destaque?: boolean;
  features?: string[];
}

// Dados dos Projetos
const projetos: Projeto[] = [
  {
    id: 'pesquisa-eleitoral',
    nome: 'Pesquisa Eleitoral',
    descricao: '1.000 agentes IA simulando eleitores do DF',
    descricaoLonga: 'Sistema completo de simulação eleitoral com agentes sintéticos. Entreviste eleitores virtuais, teste mensagens de campanha e preveja resultados com IA.',
    icone: Users,
    cor: 'amber',
    corGradiente: 'from-amber-500 to-amber-600',
    href: '/dashboard',
    status: 'ativo',
    categoria: 'pesquisa',
    destaque: true,
    features: ['60+ atributos por eleitor', '35 regiões do DF', 'Claude AI Anthropic'],
  },
  {
    id: 'stress-test',
    nome: 'Stress Test Eleitoral',
    descricao: 'Relatórios de análise de resiliência do voto',
    descricaoLonga: 'Teste a força do seu eleitorado. Descubra quais segmentos são mais voláteis e onde concentrar esforços de campanha.',
    icone: Target,
    cor: 'red',
    corGradiente: 'from-red-500 to-orange-500',
    href: '/resultados-stress-test/index.html',
    externo: true,
    status: 'ativo',
    categoria: 'pesquisa',
    features: ['Análise de volatilidade', 'Segmentação por perfil', 'Recomendações IA'],
  },
  {
    id: 'aula-claude-code',
    nome: 'Aula de Claude Code',
    descricao: 'Aprenda a programar com IA de forma interativa',
    descricaoLonga: 'Curso completo de Claude Code para iniciantes. Aprenda a criar agentes, automatizar tarefas e desenvolver projetos com IA.',
    icone: Code2,
    cor: 'purple',
    corGradiente: 'from-purple-500 to-indigo-500',
    href: '/aulas/claude-code',
    status: 'beta',
    categoria: 'educacao',
    features: ['Exercícios práticos', 'Projetos reais', 'Certificado'],
  },
  {
    id: 'chatbot-inteia',
    nome: 'Chatbot INTEIA',
    descricao: 'Assistente conversacional inteligente',
    descricaoLonga: 'Chatbot personalizado com conhecimento específico da sua organização. Atendimento 24/7 com IA avançada.',
    icone: Bot,
    cor: 'cyan',
    corGradiente: 'from-cyan-500 to-blue-500',
    href: '/chatbot',
    status: 'beta',
    categoria: 'inovacao',
    features: ['Respostas contextuais', 'Integração APIs', 'Analytics'],
  },
  {
    id: 'ouvidoria',
    nome: 'Análise de Ouvidoria',
    descricao: 'Dashboard de demandas e sentimentos',
    descricaoLonga: 'Análise inteligente de demandas de ouvidoria. Identifique padrões, priorize atendimentos e melhore a satisfação.',
    icone: FileSearch,
    cor: 'emerald',
    corGradiente: 'from-emerald-500 to-teal-500',
    href: '/ouvidoria',
    status: 'beta',
    categoria: 'governo',
    features: ['Análise de sentimento', 'Categorização automática', 'Relatórios'],
  },
  {
    id: 'participa-df',
    nome: 'Participa DF',
    descricao: 'Plataforma de participação cidadã',
    descricaoLonga: 'Conecte governo e cidadãos. Colete opiniões, realize consultas públicas e tome decisões baseadas em dados.',
    icone: Building2,
    cor: 'blue',
    corGradiente: 'from-blue-500 to-indigo-500',
    href: '/participa',
    status: 'em-breve',
    categoria: 'governo',
    features: ['Consultas públicas', 'Votações', 'Transparência'],
  },
  {
    id: 'agentes-simulados',
    nome: 'Agentes Simulados',
    descricao: 'Aula de simulação com agentes IA',
    descricaoLonga: 'Aprenda a criar e gerenciar populações de agentes sintéticos para pesquisas sociais e comportamentais.',
    icone: Microscope,
    cor: 'pink',
    corGradiente: 'from-pink-500 to-rose-500',
    href: '/aulas/agentes-simulados',
    status: 'em-breve',
    categoria: 'educacao',
    features: ['Metodologia Stanford', 'Casos práticos', 'Laboratório'],
  },
  {
    id: 'jogo-generativo',
    nome: 'Jogo Agentes Generativos',
    descricao: 'Experimento interativo com IA',
    descricaoLonga: 'Jogo experimental inspirado no paper "Generative Agents" de Stanford. Observe agentes IA vivendo em um mundo simulado.',
    icone: Gamepad2,
    cor: 'violet',
    corGradiente: 'from-violet-500 to-purple-500',
    href: '/jogo',
    status: 'em-breve',
    categoria: 'inovacao',
    destaque: false,
    features: ['Mundo simulado', 'IA generativa', 'Observação'],
  },
];

// Categorias
const categorias = [
  { id: 'todos', nome: 'Todos', icone: Sparkles },
  { id: 'pesquisa', nome: 'Pesquisa', icone: BarChart3 },
  { id: 'educacao', nome: 'Educação', icone: GraduationCap },
  { id: 'governo', nome: 'Governo', icone: Building2 },
  { id: 'inovacao', nome: 'Inovação', icone: Zap },
];

// Status badges
const statusConfig = {
  'ativo': { label: 'Disponível', cor: 'green', icone: CheckCircle2 },
  'beta': { label: 'Beta', cor: 'amber', icone: Zap },
  'em-breve': { label: 'Em breve', cor: 'blue', icone: Clock },
  'novo': { label: 'Novo', cor: 'purple', icone: Star },
};

// Componente Logo INTEIA
const LogoINTEIA = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
      <span className="text-white font-bold text-sm">IA</span>
    </div>
    <div className="flex flex-col">
      <span className="font-bold text-white text-xl tracking-tight">
        INTE<span className="text-amber-400">IA</span>
      </span>
      <span className="text-white/50 text-xs -mt-0.5">Inteligência Estratégica</span>
    </div>
  </div>
);

// Card de Projeto em Destaque
const CardProjetoDestaque = ({ projeto, index }: { projeto: Projeto; index: number }) => {
  const status = statusConfig[projeto.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="col-span-2 row-span-2"
    >
      <Link href={projeto.href} target={projeto.externo ? '_blank' : undefined}>
        <div className={`
          relative h-full min-h-[400px] rounded-3xl overflow-hidden group cursor-pointer
          bg-gradient-to-br ${projeto.corGradiente} p-[1px]
        `}>
          {/* Inner card */}
          <div className="h-full bg-slate-900/95 rounded-[23px] p-8 flex flex-col relative overflow-hidden">
            {/* Background effect */}
            <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${projeto.corGradiente} opacity-10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-20 transition-opacity duration-500`} />

            {/* Status */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-${status.cor}-500/20 text-${status.cor}-400 border border-${status.cor}-500/30`}>
                <status.icone className="w-3 h-3" />
                {status.label}
              </span>
              {projeto.externo && (
                <ExternalLink className="w-4 h-4 text-white/40" />
              )}
            </div>

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${projeto.corGradiente} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
              <projeto.icone className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 relative z-10">
              <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                {projeto.nome}
              </h3>
              <p className="text-white/60 text-lg leading-relaxed mb-6">
                {projeto.descricaoLonga || projeto.descricao}
              </p>

              {/* Features */}
              {projeto.features && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {projeto.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-sm border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
              <span className="font-medium">Acessar</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Card de Projeto Normal
const CardProjeto = ({ projeto, index }: { projeto: Projeto; index: number }) => {
  const status = statusConfig[projeto.status];
  const isDisabled = projeto.status === 'em-breve';

  const Wrapper = isDisabled ? 'div' : Link;
  const wrapperProps = isDisabled ? {} : { href: projeto.href, target: projeto.externo ? '_blank' : undefined };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      <Wrapper {...wrapperProps as any}>
        <div className={`
          relative h-full min-h-[280px] rounded-2xl overflow-hidden group
          bg-white/[0.02] border border-white/5 p-6 flex flex-col
          ${!isDisabled ? 'cursor-pointer hover:border-amber-500/30 hover:bg-white/[0.04]' : 'opacity-60 cursor-not-allowed'}
          transition-all duration-300
        `}>
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-${status.cor}-500/20 text-${status.cor}-400`}>
              <status.icone className="w-2.5 h-2.5" />
              {status.label}
            </span>
            {projeto.externo && !isDisabled && (
              <ExternalLink className="w-3.5 h-3.5 text-white/30" />
            )}
          </div>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${projeto.corGradiente} flex items-center justify-center mb-4 ${!isDisabled ? 'group-hover:scale-105' : ''} transition-transform duration-300`}>
            <projeto.icone className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className={`text-lg font-bold text-white mb-2 ${!isDisabled ? 'group-hover:text-amber-400' : ''} transition-colors`}>
              {projeto.nome}
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              {projeto.descricao}
            </p>
          </div>

          {/* CTA */}
          {!isDisabled && (
            <div className="flex items-center gap-1.5 text-white/50 group-hover:text-white/70 transition-colors mt-4">
              <span className="text-sm font-medium">Acessar</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
};

// Página Principal
export default function HubPage() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Filtrar projetos
  const projetosFiltrados = projetos.filter(p => {
    const matchCategoria = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
    const matchBusca = busca === '' ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const projetosDestaque = projetosFiltrados.filter(p => p.destaque);
  const projetosNormais = projetosFiltrados.filter(p => !p.destaque);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-amber-600/10 to-amber-500/5 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y: backgroundY }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-600/10 to-blue-500/5 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoINTEIA />

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar projeto..."
                className="w-64 pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 focus:border-amber-500/50 focus:bg-white/10 outline-none text-sm text-white placeholder:text-white/40 transition-all"
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{usuario?.nome || 'Usuário'}</p>
                <p className="text-xs text-white/50">{usuario?.email || ''}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={containerRef} className="relative pt-24 pb-16 px-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Bem-vindo ao ecossistema INTEIA</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Escolha seu{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                projeto
              </span>
            </h1>

            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Ferramentas de inteligência artificial para pesquisa, educação e inovação
            </p>
          </motion.div>

          {/* Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${categoriaAtiva === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                  }
                `}
              >
                <cat.icone className="w-4 h-4" />
                {cat.nome}
              </button>
            ))}
          </motion.div>

          {/* Search Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:hidden mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar projeto..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/50 outline-none text-white placeholder:text-white/40"
              />
            </div>
          </motion.div>

          {/* Grid de Projetos */}
          <AnimatePresence mode="wait">
            <motion.div
              key={categoriaAtiva + busca}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Projetos em destaque (ocupam 2 colunas) */}
              {projetosDestaque.map((projeto, index) => (
                <CardProjetoDestaque key={projeto.id} projeto={projeto} index={index} />
              ))}

              {/* Projetos normais */}
              {projetosNormais.map((projeto, index) => (
                <CardProjeto key={projeto.id} projeto={projeto} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {projetosFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">Nenhum projeto encontrado</p>
              <button
                onClick={() => { setCategoriaAtiva('todos'); setBusca(''); }}
                className="mt-4 text-amber-400 hover:underline"
              >
                Limpar filtros
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IA</span>
            </div>
            <span className="text-white/50 text-sm">INTEIA - Inteligência Estratégica</span>
          </div>
          <p className="text-white/30 text-sm text-center sm:text-right">
            CNPJ: 63.918.490/0001-20 | Brasília/DF
          </p>
        </div>
      </footer>
    </div>
  );
}
