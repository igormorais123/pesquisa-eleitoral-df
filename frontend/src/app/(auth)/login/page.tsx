'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Eye, EyeOff, ArrowRight, ArrowDown,
  Users, Brain, MessageSquare, BarChart3,
  MapPin, Target, Sparkles, FileText,
  CheckCircle, TrendingUp, Globe, Shield,
  Zap, Database, LineChart, Vote,
  Building2, UserCircle, Map, History,
  Award, GraduationCap, Lightbulb
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/services/api';

const loginSchema = z.object({
  usuario: z.string().min(1, 'Digite o email ou usuário'),
  senha: z.string().min(1, 'Digite a senha'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Funcionalidades completas do sistema
const funcionalidades = [
  {
    categoria: 'Base de Dados',
    items: [
      { icone: Users, titulo: '1.000 Eleitores Sintéticos', desc: 'Perfis completos com 60+ atributos demográficos, políticos e psicológicos' },
      { icone: Building2, titulo: 'Parlamentares do DF', desc: 'Base completa de deputados e senadores com histórico de votações' },
      { icone: UserCircle, titulo: 'Candidatos 2026', desc: 'Perfis dos candidatos às eleições do Distrito Federal' },
      { icone: MapPin, titulo: '35 Regiões Administrativas', desc: 'Cobertura total do Distrito Federal com dados georreferenciados' },
    ]
  },
  {
    categoria: 'Inteligência Artificial',
    items: [
      { icone: Brain, titulo: 'Claude AI (Anthropic)', desc: 'Modelo de linguagem avançado para respostas ultra-realistas' },
      { icone: MessageSquare, titulo: 'Entrevistas Simuladas', desc: 'Cada eleitor responde mantendo coerência com seu perfil completo' },
      { icone: Sparkles, titulo: 'Gerador de Mensagens', desc: 'Criação automática de comunicação política segmentada' },
      { icone: Database, titulo: 'Geração de Agentes', desc: 'Crie novos perfis sintéticos com IA generativa' },
    ]
  },
  {
    categoria: 'Análise e Visualização',
    items: [
      { icone: BarChart3, titulo: 'Dashboards Interativos', desc: 'Visualizações em tempo real com filtros avançados' },
      { icone: Map, titulo: 'Mapa de Calor', desc: 'Distribuição geográfica de intenção de voto por região' },
      { icone: TrendingUp, titulo: 'Analytics Preditivo', desc: 'Projeções e tendências baseadas em simulações' },
      { icone: Target, titulo: 'Cenários Eleitorais', desc: 'Simule diferentes cenários e estratégias de campanha' },
    ]
  },
  {
    categoria: 'Recursos Avançados',
    items: [
      { icone: FileText, titulo: 'Templates de Pesquisa', desc: 'Modelos prontos de questionários validados' },
      { icone: History, titulo: 'Histórico Completo', desc: 'Todas as pesquisas anteriores com comparativos' },
      { icone: Shield, titulo: 'Validação Estatística', desc: 'Metodologia científica com intervalos de confiança' },
      { icone: LineChart, titulo: 'Exportação Profissional', desc: 'Relatórios em Excel, PDF e Markdown para IA' },
    ]
  },
];

// Dados para números impactantes
const numeros = [
  { valor: '1.000', label: 'Eleitores IA', sublabel: 'Perfis sintéticos únicos' },
  { valor: '60+', label: 'Atributos', sublabel: 'Por eleitor' },
  { valor: '35', label: 'Regiões', sublabel: 'Do Distrito Federal' },
  { valor: '∞', label: 'Simulações', sublabel: 'Possíveis' },
];

export default function LoginPage() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const login = useAuthStore((state) => state.login);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setCarregando(true);
    try {
      await login(data.usuario, data.senha);
      toast.success('Bem-vindo!');
      router.push('/');
    } catch (error) {
      toast.error('Credenciais incorretas');
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = async () => {
    setCarregandoGoogle(true);
    try {
      const response = await api.get('/auth/google/url');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Login com Google não está disponível no momento');
      setCarregandoGoogle(false);
    }
  };

  return (
    <div className="bg-black text-white">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">Pesquisa Eleitoral DF</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#problema" className="hover:text-white transition-colors">O Problema</a>
            <a href="#solucao" className="hover:text-white transition-colors">A Solução</a>
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#igor" className="hover:text-white transition-colors">Sobre</a>
          </nav>
          <button
            onClick={() => setMostrarLogin(true)}
            className="px-5 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
        {/* Background Visual */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-full blur-[120px]" />

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue-400 text-lg mb-6"
          >
            Tecnologia de Stanford. Agora no Brasil.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-semibold tracking-tight leading-tight"
          >
            O futuro da<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              pesquisa eleitoral.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-xl sm:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed"
          >
            Mil eleitores sintéticos com inteligência artificial.<br />
            Respostas que refletem a realidade do Distrito Federal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => setMostrarLogin(true)}
              className="px-8 py-4 bg-white text-black rounded-full text-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Acessar Sistema
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#problema"
              className="px-8 py-4 bg-white/10 text-white rounded-full text-lg font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              Saiba Mais
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#problema" className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
            <span className="text-sm">Rolar para descobrir</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </a>
        </motion.div>
      </section>

      {/* O Problema Individual */}
      <section id="problema" className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-blue-400 text-lg mb-4">O Problema</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Você conhece<br />
              <span className="text-white/50">seu eleitor?</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-red-900/50 to-orange-900/30 border border-red-500/20 flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <Users className="w-16 h-16 text-red-400/50" />
                  </div>
                  <p className="text-3xl font-semibold text-white/30">?</p>
                  <p className="text-white/40 mt-4">Eleitor desconhecido</p>
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-2xl text-white/80 leading-relaxed">
                Pesquisas tradicionais entregam números frios. Você sabe que 45% aprovam sua proposta,
                mas não sabe <span className="text-white font-semibold">por quê</span>.
              </p>
              <p className="text-xl text-white/60 leading-relaxed">
                Não sabe quais medos motivam o eleitor de Ceilândia. Não entende os valores
                do empresário do Lago Sul. Não consegue prever como o jovem de Taguatinga
                reagirá à sua mensagem.
              </p>
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Vote className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">O risco é imenso.</p>
                  <p className="text-white/60 mt-1">
                    Campanhas milionárias baseadas em achismos. Mensagens que não conectam.
                    Votos que escapam por falta de entendimento profundo.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* O Problema Expandido */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-slate-900/50 to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-orange-400 text-lg mb-4">Um problema universal</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Todos os candidatos<br />
              <span className="text-white/50">enfrentam isso.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Governador', desc: 'Precisa entender 2.5 milhões de eleitores em 35 regiões distintas' },
              { icon: Building2, title: 'Deputado', desc: 'Busca votos em segmentos específicos sem dados confiáveis' },
              { icon: UserCircle, title: 'Vereador', desc: 'Compete pela atenção local sem saber o que realmente importa' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10"
              >
                <item.icon className="w-12 h-12 text-orange-400 mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* A Solução - Poder dos Dados */}
      <section id="solucao" className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-cyan-900/20" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-cyan-400 text-lg mb-4">A Solução</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              O poder da<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                análise preditiva.
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-2xl text-white/80 leading-relaxed">
                Imagine poder <span className="text-cyan-400 font-semibold">conversar</span> com
                cada um dos seus eleitores. Entender suas dores. Testar mensagens. Prever reações.
              </p>
              <p className="text-xl text-white/60 leading-relaxed">
                Com simulação agêntica, cada eleitor sintético é um perfil completo: dados demográficos,
                posição política, vieses cognitivos, valores pessoais, medos e esperanças. A IA responde
                como aquele cidadão responderia.
              </p>
              <div className="space-y-4">
                {[
                  'Teste campanhas antes de gastar',
                  'Identifique segmentos persuadíveis',
                  'Ajuste mensagens em tempo real',
                  'Preveja resultados com precisão',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-500/20 p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  {/* Simulação de conversa */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-sm text-cyan-400 mb-2">Eleitor: Maria, 45 anos, Ceilândia</p>
                    <p className="text-white/80">&ldquo;O que você acha da proposta de transporte gratuito?&rdquo;</p>
                  </div>
                  <div className="bg-cyan-500/10 rounded-2xl p-4 border border-cyan-500/20 ml-8">
                    <p className="text-sm text-cyan-400 mb-2">Resposta IA</p>
                    <p className="text-white/80">&ldquo;Olha, seria ótimo porque gasto quase R$400 por mês só de ônibus pra ir trabalhar no Plano...&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2 justify-center mt-4">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-white/50">Claude AI processando perfil completo</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Números em Destaque */}
      <section className="py-24 px-6 bg-black border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {numeros.map((num, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl sm:text-6xl lg:text-7xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {num.valor}
                </div>
                <div className="text-lg text-white mt-2">{num.label}</div>
                <div className="text-sm text-white/50">{num.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marcos Históricos */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-purple-400 text-lg mb-4">Marco Histórico</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              A revolução começou<br />
              <span className="text-white/50">em Stanford.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500" />

            <div className="space-y-24">
              {[
                {
                  ano: '2023',
                  titulo: 'Stanford Simulation',
                  desc: 'Pesquisadores de Stanford demonstram que agentes de IA podem simular comportamento humano com alta fidelidade em pesquisas sociais.',
                  lado: 'left'
                },
                {
                  ano: '2024',
                  titulo: 'Igor Morais descobre',
                  desc: 'Durante seu doutorado em Gestão, Igor identifica o potencial revolucionário da técnica para pesquisas eleitorais no Brasil.',
                  lado: 'right'
                },
                {
                  ano: '2025',
                  titulo: 'Adaptação brasileira',
                  desc: 'Desenvolvimento de 1.000 perfis sintéticos calibrados para a realidade do Distrito Federal, com 60+ atributos cada.',
                  lado: 'left'
                },
                {
                  ano: '2026',
                  titulo: 'Sistema disponível',
                  desc: 'Primeira plataforma de simulação agêntica eleitoral do Brasil está pronta para transformar campanhas políticas.',
                  lado: 'right'
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative grid lg:grid-cols-2 gap-8 ${item.lado === 'right' ? 'lg:text-right' : ''}`}
                >
                  <div className={item.lado === 'right' ? 'lg:order-2' : ''}>
                    <div className={`p-8 rounded-3xl bg-white/5 border border-white/10 ${item.lado === 'right' ? 'lg:ml-12' : 'lg:mr-12'}`}>
                      <span className="text-4xl font-bold text-purple-400">{item.ano}</span>
                      <h3 className="text-2xl font-semibold mt-4 mb-3">{item.titulo}</h3>
                      <p className="text-white/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block" />
                  {/* Dot on timeline */}
                  <div className="absolute left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-black" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Igor */}
      <section id="igor" className="py-32 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Foto/Visual */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6">
                    <GraduationCap className="w-20 h-20 text-white" />
                  </div>
                  <p className="text-2xl font-semibold">Igor Morais Vasconcelos</p>
                  <p className="text-white/50 mt-2">Doutorando em Gestão</p>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <p className="text-blue-400 text-lg mb-4">O Criador</p>
                <h2 className="text-4xl sm:text-5xl font-semibold leading-tight">
                  Precursor no Brasil em<br />
                  <span className="text-white/50">simulações agênticas.</span>
                </h2>
              </div>

              <p className="text-xl text-white/70 leading-relaxed">
                Igor Morais Vasconcelos trouxe para o Brasil as descobertas revolucionárias de Stanford
                sobre simulação agêntica sintética. Com doutorado em Gestão, adaptou a metodologia
                para a realidade eleitoral brasileira.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award, label: 'Doutorado em Gestão' },
                  { icon: Globe, label: 'Metodologia Stanford' },
                  { icon: Lightbulb, label: 'Pioneiro no Brasil' },
                  { icon: Zap, label: 'IA Generativa' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <item.icon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-white/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Completas */}
      <section id="funcionalidades" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-cyan-400 text-lg mb-4">Funcionalidades</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
              Tudo que você precisa.<br />
              <span className="text-white/50">Em um só lugar.</span>
            </h2>
          </motion.div>

          <div className="space-y-16">
            {funcionalidades.map((cat, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-semibold mb-8 text-white/80">{cat.categoria}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cat.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors group"
                    >
                      <item.icone className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="text-lg font-semibold mb-2">{item.titulo}</h4>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-blue-900/20 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight mb-8">
              Pronto para conhecer<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                seu eleitor?
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Cadastre-se agora e tenha acesso ao sistema mais avançado de simulação
              eleitoral do Brasil. Transforme dados em vitória.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setMostrarLogin(true)}
                className="px-10 py-5 bg-white text-black rounded-full text-xl font-medium hover:bg-white/90 transition-all flex items-center gap-3"
              >
                Acessar Sistema
                <ArrowRight className="w-6 h-6" />
              </button>
              <Link
                href="/cadastro"
                className="px-10 py-5 bg-white/10 text-white rounded-full text-xl font-medium hover:bg-white/20 transition-all border border-white/20"
              >
                Criar Conta
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">Pesquisa Eleitoral DF 2026</span>
          </div>
          <p className="text-white/50 text-sm">
            © 2024-2026 Igor Morais Vasconcelos. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modal de Login */}
      {mostrarLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={() => setMostrarLogin(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Entrar no Sistema</h2>
              <p className="text-white/50 mt-2">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email ou usuário</label>
                <input
                  type="text"
                  {...register('usuario')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
                  placeholder="seu@email.com"
                />
                {errors.usuario && (
                  <p className="text-sm text-red-400">{errors.usuario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    {...register('senha')}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-400">{errors.senha.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {carregando ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divisor */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/40">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Login com Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={carregandoGoogle}
                className="w-full py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {carregandoGoogle ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar com Google
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/50 mb-2">Acesso de demonstração</p>
              <div className="flex items-center gap-4 text-sm">
                <code className="px-3 py-1.5 rounded-lg bg-white/10 text-cyan-400 font-mono">admin</code>
                <code className="px-3 py-1.5 rounded-lg bg-white/10 text-cyan-400 font-mono">admin123</code>
              </div>
            </div>

            <p className="text-center text-sm text-white/50 mt-6">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-cyan-400 hover:underline">
                Criar conta
              </Link>
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
