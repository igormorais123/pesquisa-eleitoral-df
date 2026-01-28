'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Sparkles, Calendar, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ComingSoonPageProps {
  titulo: string;
  descricao: string;
  icone: React.ElementType;
  corGradiente: string;
  corSombra: string;
  features?: string[];
  previsao?: string;
}

export function ComingSoonPage({
  titulo,
  descricao,
  icone: Icon,
  corGradiente,
  corSombra,
  features = [],
  previsao = 'Em breve',
}: ComingSoonPageProps) {
  const [email, setEmail] = useState('');
  const [inscrito, setInscrito] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setInscrito(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      {/* Voltar */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Hub</span>
        </Link>
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r ${corGradiente} opacity-10 rounded-full blur-[150px]`} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${corGradiente} flex items-center justify-center mb-8 shadow-2xl ${corSombra}`}
        >
          <Icon className="w-12 h-12 text-white" />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-white/70 text-sm">{previsao}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
        >
          {titulo}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-white/50 mb-8"
        >
          {descricao}
        </motion.p>

        {/* Features */}
        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {features.map((feature, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm"
              >
                {feature}
              </span>
            ))}
          </motion.div>
        )}

        {/* Notify Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md mx-auto"
        >
          {inscrito ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-foreground font-medium">Inscrição confirmada!</p>
              <p className="text-white/50 text-sm mt-1">Você será notificado quando lançarmos.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-amber-400" />
                <p className="text-foreground font-medium">Seja notificado no lançamento</p>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/50 outline-none text-foreground placeholder:text-white/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-xl bg-gradient-to-r ${corGradiente} text-white font-semibold hover:opacity-90 transition-opacity shadow-lg ${corSombra}`}
                >
                  Notificar
                </button>
              </form>

              <p className="text-xs text-white/30 mt-3">
                Sem spam. Apenas uma notificação quando estiver pronto.
              </p>
            </>
          )}
        </motion.div>

        {/* Sparkles decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex items-center justify-center gap-2 text-white/30"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Estamos trabalhando para trazer algo incrível</span>
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </div>
  );
}
