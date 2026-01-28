'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, ArrowLeft, Play, CheckCircle, Lock, Clock,
  BookOpen, Terminal, Sparkles, Award, ChevronRight,
  FileCode, Zap, Brain, Users, Star, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Modulo {
  id: number;
  titulo: string;
  descricao: string;
  duracao: string;
  aulas: number;
  concluido: boolean;
  liberado: boolean;
  icone: React.ElementType;
}

const modulos: Modulo[] = [
  {
    id: 1,
    titulo: 'Introdução ao Claude Code',
    descricao: 'Aprenda o que é o Claude Code e como ele pode transformar sua produtividade',
    duracao: '30 min',
    aulas: 4,
    concluido: true,
    liberado: true,
    icone: BookOpen,
  },
  {
    id: 2,
    titulo: 'Primeiros Comandos',
    descricao: 'Domine os comandos básicos e comece a criar com IA',
    duracao: '45 min',
    aulas: 6,
    concluido: true,
    liberado: true,
    icone: Terminal,
  },
  {
    id: 3,
    titulo: 'Trabalhando com Arquivos',
    descricao: 'Leia, edite e crie arquivos usando linguagem natural',
    duracao: '1h',
    aulas: 8,
    concluido: false,
    liberado: true,
    icone: FileCode,
  },
  {
    id: 4,
    titulo: 'Automatizando Tarefas',
    descricao: 'Crie scripts e automatize processos repetitivos',
    duracao: '1h 15min',
    aulas: 7,
    concluido: false,
    liberado: true,
    icone: Zap,
  },
  {
    id: 5,
    titulo: 'Criando Agentes IA',
    descricao: 'Construa agentes personalizados para suas necessidades',
    duracao: '2h',
    aulas: 10,
    concluido: false,
    liberado: false,
    icone: Brain,
  },
  {
    id: 6,
    titulo: 'Projeto Final',
    descricao: 'Aplique tudo que aprendeu em um projeto completo',
    duracao: '3h',
    aulas: 5,
    concluido: false,
    liberado: false,
    icone: Award,
  },
];

export default function AulaClaudeCodePage() {
  const [moduloExpandido, setModuloExpandido] = useState<number | null>(3);

  const progresso = modulos.filter(m => m.concluido).length;
  const total = modulos.length;
  const percentual = Math.round((progresso / total) * 100);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aula de Claude Code</h1>
              <p className="text-sm text-muted-foreground">Aprenda a programar com IA</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Beta
          </span>
        </div>
      </div>

      {/* Hero do Curso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20 rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Curso Interativo</span>
            </div>

            <h2 className="text-3xl font-bold text-foreground mb-4">
              Domine o Claude Code em 6 módulos
            </h2>

            <p className="text-white/60 mb-6">
              Aprenda do zero a criar projetos incríveis usando apenas linguagem natural.
              Sem necessidade de conhecimento prévio em programação.
            </p>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-white/70">8h de conteúdo</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="text-white/70">40 aulas</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="text-white/70">Certificado</span>
              </div>
            </div>

            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-purple-400 hover:to-indigo-400 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/25">
              <Play className="w-5 h-5" />
              Continuar de onde parou
            </button>
          </div>

          {/* Progresso */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Seu Progresso</h3>

            <div className="relative mb-6">
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentual}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-white/50">{progresso} de {total} módulos</span>
                <span className="text-purple-400 font-medium">{percentual}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-foreground">2h 30m</p>
                <p className="text-xs text-white/50">Tempo estudado</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-2xl font-bold text-foreground">10</p>
                <p className="text-xs text-white/50">Aulas concluídas</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de Módulos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Conteúdo do Curso</h3>

        {modulos.map((modulo, i) => {
          const isExpanded = moduloExpandido === modulo.id;
          const Icon = modulo.icone;

          return (
            <motion.div
              key={modulo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                bg-card/50 backdrop-blur-xl border rounded-xl overflow-hidden transition-all
                ${modulo.liberado ? 'border-border hover:border-purple-500/30 cursor-pointer' : 'border-white/5 opacity-60'}
              `}
              onClick={() => modulo.liberado && setModuloExpandido(isExpanded ? null : modulo.id)}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Status */}
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${modulo.concluido
                    ? 'bg-green-500/20'
                    : modulo.liberado
                      ? 'bg-purple-500/20'
                      : 'bg-white/5'
                  }
                `}>
                  {modulo.concluido ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : modulo.liberado ? (
                    <Icon className="w-6 h-6 text-purple-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-white/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      Módulo {modulo.id}: {modulo.titulo}
                    </h4>
                    {modulo.concluido && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                        Concluído
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mt-1">{modulo.descricao}</p>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex items-center gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {modulo.aulas} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {modulo.duracao}
                  </span>
                </div>

                {modulo.liberado && (
                  <ChevronRight className={`w-5 h-5 text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                )}
              </div>

              {/* Conteúdo expandido */}
              {isExpanded && modulo.liberado && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4 space-y-2">
                    {Array.from({ length: modulo.aulas }).map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${j < 2 ? 'bg-green-500/20' : 'bg-white/5'}`}>
                          {j < 2 ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Play className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Aula {j + 1}: {['Introdução', 'Conceitos básicos', 'Prática guiada', 'Exercícios', 'Projeto', 'Revisão', 'Desafio', 'Quiz'][j % 8]}</p>
                          <p className="text-xs text-white/40">{5 + j * 2} min</p>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-colors">
                          {j < 2 ? 'Rever' : 'Assistir'}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CTA Final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-6 text-center"
      >
        <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Complete o curso e ganhe seu certificado!</h3>
        <p className="text-white/50 mb-4">Certificado oficial da INTEIA reconhecido no mercado</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                {['IM', 'JS', 'MA', 'PL'][i - 1]}
              </div>
            ))}
          </div>
          <span className="text-sm text-white/50">+234 alunos certificados</span>
        </div>
      </motion.div>
    </div>
  );
}
