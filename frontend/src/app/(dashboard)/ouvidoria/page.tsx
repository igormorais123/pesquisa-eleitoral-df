'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch, ArrowLeft, BarChart3, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Users, MessageSquare, Filter, Download,
  PieChart, Activity, Inbox, Send, ThumbsUp, ThumbsDown, Meh,
  Calendar, MapPin, Tag, Search
} from 'lucide-react';
import Link from 'next/link';

// Dados simulados de demandas
const demandasSimuladas = [
  { id: 1, titulo: 'Buraco na via principal', categoria: 'Infraestrutura', sentimento: 'negativo', regiao: 'Ceilândia', status: 'em_analise', data: '2026-01-27' },
  { id: 2, titulo: 'Elogio ao atendimento do posto de saúde', categoria: 'Saúde', sentimento: 'positivo', regiao: 'Taguatinga', status: 'respondido', data: '2026-01-26' },
  { id: 3, titulo: 'Solicitação de poda de árvores', categoria: 'Meio Ambiente', sentimento: 'neutro', regiao: 'Águas Claras', status: 'pendente', data: '2026-01-26' },
  { id: 4, titulo: 'Reclamação sobre transporte público', categoria: 'Transporte', sentimento: 'negativo', regiao: 'Samambaia', status: 'em_analise', data: '2026-01-25' },
  { id: 5, titulo: 'Sugestão para parque infantil', categoria: 'Lazer', sentimento: 'positivo', regiao: 'Plano Piloto', status: 'pendente', data: '2026-01-25' },
];

const estatisticas = [
  { label: 'Total de Demandas', valor: '1.234', variacao: '+12%', icone: Inbox, bg: 'bg-amber-500/20', text: 'text-amber-400' },
  { label: 'Respondidas', valor: '892', variacao: '+8%', icone: CheckCircle, bg: 'bg-green-500/20', text: 'text-green-400' },
  { label: 'Em Análise', valor: '215', variacao: '-5%', icone: Clock, bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { label: 'Pendentes', valor: '127', variacao: '+3%', icone: AlertTriangle, bg: 'bg-red-500/20', text: 'text-red-400' },
];

const sentimentoConfig = {
  positivo: { icone: ThumbsUp, cor: 'green', bg: 'bg-green-500/20', text: 'text-green-400' },
  negativo: { icone: ThumbsDown, cor: 'red', bg: 'bg-red-500/20', text: 'text-red-400' },
  neutro: { icone: Meh, cor: 'gray', bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const statusConfig = {
  pendente: { label: 'Pendente', badge: 'bg-amber-500/20 text-amber-400' },
  em_analise: { label: 'Em Análise', badge: 'bg-blue-500/20 text-blue-400' },
  respondido: { label: 'Respondido', badge: 'bg-green-500/20 text-green-400' },
};

export default function OuvidoriaPage() {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroSentimento, setFiltroSentimento] = useState('todos');

  const categorias = ['todas', 'Infraestrutura', 'Saúde', 'Meio Ambiente', 'Transporte', 'Lazer'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <FileSearch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Análise de Ouvidoria</h1>
              <p className="text-sm text-muted-foreground">Dashboard de demandas e sentimentos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Beta
          </span>
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {estatisticas.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icone className={`w-5 h-5 ${stat.text}`} />
              </div>
              <span className={`text-xs font-medium ${stat.variacao.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.variacao}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.valor}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Análise de Sentimento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Sentimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            Análise de Sentimento
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Positivo', valor: 45, bg: 'bg-green-500' },
              { label: 'Neutro', valor: 30, bg: 'bg-gray-500' },
              { label: 'Negativo', valor: 25, bg: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{item.label}</span>
                  <span className="text-white font-medium">{item.valor}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.valor}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className={`h-full ${item.bg} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-sm text-white/50">
              Análise automática de sentimento usando IA para classificar demandas.
            </p>
          </div>
        </motion.div>

        {/* Categorias mais frequentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Categorias Frequentes
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Infraestrutura', valor: 320, total: 1234 },
              { label: 'Saúde', valor: 280, total: 1234 },
              { label: 'Transporte', valor: 210, total: 1234 },
              { label: 'Segurança', valor: 180, total: 1234 },
              { label: 'Educação', valor: 150, total: 1234 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{item.label}</span>
                    <span className="text-white/50">{item.valor}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.valor / item.total) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tendência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Tendência Semanal
          </h3>

          <div className="flex items-end justify-between h-32 gap-2">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, i) => {
              const altura = [60, 80, 45, 90, 70, 30, 25][i];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${altura}%` }}
                    transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg"
                  />
                  <span className="text-[10px] text-white/50">{dia}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-white/50">Média diária</span>
            <span className="text-lg font-bold text-foreground">176</span>
          </div>
        </motion.div>
      </div>

      {/* Filtros e Lista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card/50 backdrop-blur-xl border border-border rounded-xl overflow-hidden"
      >
        {/* Header da tabela */}
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Demandas Recentes
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:border-emerald-500/50 outline-none w-48"
              />
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 focus:border-emerald-500/50 outline-none"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat === 'todas' ? 'Todas categorias' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="divide-y divide-white/5">
          {demandasSimuladas.map((demanda, i) => {
            const sentimento = sentimentoConfig[demanda.sentimento as keyof typeof sentimentoConfig];
            const status = statusConfig[demanda.status as keyof typeof statusConfig];
            const SentimentoIcon = sentimento.icone;

            return (
              <motion.div
                key={demanda.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${sentimento.bg} flex items-center justify-center`}>
                      <SentimentoIcon className={`w-4 h-4 ${sentimento.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{demanda.titulo}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {demanda.categoria}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {demanda.regiao}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {demanda.data}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                    {status.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-white/50">Mostrando 5 de 1.234 demandas</p>
          <button className="text-sm text-emerald-400 hover:underline">Ver todas</button>
        </div>
      </motion.div>
    </div>
  );
}
