'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Users,
  TrendingUp,
  GraduationCap,
  Wallet,
  Church,
  Vote,
  ChevronRight,
  Target,
  BarChart3,
  Trophy,
  Flame,
  Crown,
  Calendar,
  ExternalLink,
  UserSearch,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import { useFilterNavigation } from '@/hooks/useFilterNavigation';

// ============================================
// TIPOS
// ============================================

interface Candidato {
  id: string;
  nome: string;
  partido: string;
  cor: string;
  corClara: string;
  corGradiente: string;
}

interface VotacaoRegiao {
  regiao: string;
  votos: Record<string, number>;
  lider: string;
  vantagem: number;
  totalVotantes: number;
  percentualLider: number;
  disputaAcirrada: boolean;
}

interface DetalhesRegiao {
  regiao: string;
  totalEleitores: number;
  votacao: Record<string, { votos: number; percentual: number }>;
  lider: string;
  perfilDominante: {
    classeEconomica: string;
    escolaridade: string;
    religiao: string;
    orientacaoPolitica: string;
    faixaEtaria: string;
  };
  insights: string[];
}

interface MapaCalorEleitoralProps {
  eleitores: Eleitor[];
}

// ============================================
// CANDIDATOS
// ============================================

const CANDIDATOS: Candidato[] = [
  {
    id: 'ibaneis',
    nome: 'Ibaneis Rocha',
    partido: 'MDB',
    cor: '#10b981',
    corClara: '#d1fae5',
    corGradiente: 'from-emerald-500 to-green-600'
  },
  {
    id: 'celina',
    nome: 'Celina Leão',
    partido: 'PP',
    cor: '#3b82f6',
    corClara: '#dbeafe',
    corGradiente: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'damares',
    nome: 'Damares Alves',
    partido: 'Republicanos',
    cor: '#8b5cf6',
    corClara: '#ede9fe',
    corGradiente: 'from-violet-500 to-purple-600'
  },
  {
    id: 'rafaelfontes',
    nome: 'Rafael Fontes',
    partido: 'PT',
    cor: '#ef4444',
    corClara: '#fee2e2',
    corGradiente: 'from-red-500 to-rose-600'
  },
  {
    id: 'brancos',
    nome: 'Brancos/Nulos',
    partido: '-',
    cor: '#6b7280',
    corClara: '#f3f4f6',
    corGradiente: 'from-gray-400 to-gray-500'
  },
];

// ============================================
// LAYOUT DO MAPA DAS RAs
// ============================================

const LAYOUT_RAS: Record<string, { x: number; y: number; w: number; h: number }> = {
  // Norte
  'Fercal': { x: 340, y: 20, w: 70, h: 45 },
  'Sobradinho II': { x: 420, y: 20, w: 80, h: 45 },
  'Sobradinho': { x: 510, y: 20, w: 80, h: 45 },
  'Planaltina': { x: 600, y: 20, w: 100, h: 60 },
  // Norte-Centro
  'Brazlândia': { x: 20, y: 80, w: 100, h: 70 },
  'Lago Norte': { x: 420, y: 75, w: 80, h: 50 },
  'Varjão': { x: 510, y: 75, w: 60, h: 40 },
  'Itapoã': { x: 580, y: 90, w: 70, h: 50 },
  'Paranoá': { x: 660, y: 90, w: 90, h: 70 },
  // Centro
  'SCIA/Estrutural': { x: 230, y: 130, w: 90, h: 45 },
  'Cruzeiro': { x: 330, y: 130, w: 70, h: 45 },
  'Plano Piloto': { x: 410, y: 130, w: 110, h: 60 },
  'Sudoeste/Octogonal': { x: 530, y: 145, w: 90, h: 45 },
  // Oeste-Centro
  'Ceilândia': { x: 20, y: 160, w: 110, h: 80 },
  'Taguatinga': { x: 140, y: 170, w: 80, h: 70 },
  'Vicente Pires': { x: 140, y: 250, w: 70, h: 50 },
  'Águas Claras': { x: 220, y: 185, w: 80, h: 55 },
  'Guará': { x: 310, y: 185, w: 70, h: 50 },
  'SIA': { x: 310, y: 245, w: 60, h: 40 },
  'Núcleo Bandeirante': { x: 380, y: 200, w: 85, h: 45 },
  'Park Way': { x: 380, y: 255, w: 75, h: 40 },
  'Candangolândia': { x: 465, y: 200, w: 75, h: 40 },
  'Lago Sul': { x: 530, y: 200, w: 100, h: 55 },
  'Jardim Botânico': { x: 640, y: 170, w: 85, h: 50 },
  'São Sebastião': { x: 640, y: 230, w: 85, h: 65 },
  // Sul-Oeste
  'Sol Nascente/Pôr do Sol': { x: 20, y: 250, w: 110, h: 55 },
  'Samambaia': { x: 20, y: 315, w: 90, h: 60 },
  'Recanto das Emas': { x: 120, y: 310, w: 90, h: 55 },
  'Riacho Fundo': { x: 220, y: 310, w: 75, h: 45 },
  'Riacho Fundo II': { x: 305, y: 310, w: 75, h: 45 },
  'Arniqueira': { x: 220, y: 365, w: 80, h: 40 },
  // Sul
  'Gama': { x: 120, y: 375, w: 90, h: 65 },
  'Santa Maria': { x: 310, y: 365, w: 100, h: 60 },
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function simularVotacao(eleitor: Eleitor): string {
  const { orientacao_politica, posicao_bolsonaro, cluster_socioeconomico, religiao } = eleitor;

  const pesos: Record<string, number> = {
    ibaneis: 25,
    celina: 20,
    damares: 15,
    rafaelfontes: 15,
    brancos: 5,
  };

  if (orientacao_politica === 'direita' || orientacao_politica === 'centro-direita') {
    pesos.damares += 25;
    pesos.celina += 10;
    pesos.rafaelfontes -= 10;
  } else if (orientacao_politica === 'esquerda' || orientacao_politica === 'centro-esquerda') {
    pesos.rafaelfontes += 30;
    pesos.damares -= 10;
  } else {
    pesos.ibaneis += 15;
    pesos.celina += 10;
  }

  if (posicao_bolsonaro === 'apoiador_forte' || posicao_bolsonaro === 'apoiador_moderado') {
    pesos.damares += 20;
    pesos.rafaelfontes -= 15;
  } else if (posicao_bolsonaro === 'critico_forte' || posicao_bolsonaro === 'critico_moderado') {
    pesos.rafaelfontes += 15;
    pesos.damares -= 15;
  }

  if (cluster_socioeconomico === 'G1_alta' || cluster_socioeconomico === 'G2_media_alta') {
    pesos.ibaneis += 10;
    pesos.celina += 10;
  } else {
    pesos.rafaelfontes += 10;
  }

  if (religiao?.toLowerCase().includes('evangélica') || religiao?.toLowerCase().includes('evangelica')) {
    pesos.damares += 15;
  }

  const total = Object.values(pesos).reduce((a, b) => a + Math.max(0, b), 0);
  let random = Math.random() * total;

  for (const [candidato, peso] of Object.entries(pesos)) {
    random -= Math.max(0, peso);
    if (random <= 0) return candidato;
  }

  return 'ibaneis';
}

function calcularPerfilDominante(eleitores: Eleitor[]): DetalhesRegiao['perfilDominante'] {
  if (eleitores.length === 0) {
    return {
      classeEconomica: 'N/A',
      escolaridade: 'N/A',
      religiao: 'N/A',
      orientacaoPolitica: 'N/A',
      faixaEtaria: 'N/A',
    };
  }

  const contagem = <T extends string>(arr: T[]): Record<T, number> => {
    return arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<T, number>);
  };

  const getMaisFrequente = (obj: Record<string, number>): string => {
    return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  };

  const classeLabels: Record<string, string> = {
    G1_alta: 'Alta Renda',
    G2_media_alta: 'Média-Alta',
    G3_media_baixa: 'Média-Baixa',
    G4_baixa: 'Baixa Renda',
  };

  const escolaridadeLabels: Record<string, string> = {
    fundamental_incompleto: 'Fund. Incompleto',
    fundamental_completo: 'Fund. Completo',
    medio_incompleto: 'Médio Incompleto',
    medio_completo_ou_sup_incompleto: 'Médio Completo',
    superior_completo_ou_pos: 'Superior/Pós',
  };

  const orientacaoLabels: Record<string, string> = {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    centro: 'Centro',
    'centro-direita': 'Centro-Direita',
    direita: 'Direita',
  };

  const classes = contagem(eleitores.map(e => e.cluster_socioeconomico));
  const escolaridades = contagem(eleitores.map(e => e.escolaridade));
  const religioes = contagem(eleitores.map(e => e.religiao));
  const orientacoes = contagem(eleitores.map(e => e.orientacao_politica));

  const mediaIdade = eleitores.reduce((acc, e) => acc + e.idade, 0) / eleitores.length;
  let faixaEtaria = '16-24 anos';
  if (mediaIdade >= 25 && mediaIdade < 35) faixaEtaria = '25-34 anos';
  else if (mediaIdade >= 35 && mediaIdade < 45) faixaEtaria = '35-44 anos';
  else if (mediaIdade >= 45 && mediaIdade < 55) faixaEtaria = '45-54 anos';
  else if (mediaIdade >= 55 && mediaIdade < 65) faixaEtaria = '55-64 anos';
  else if (mediaIdade >= 65) faixaEtaria = '65+ anos';

  const classeKey = getMaisFrequente(classes);
  const escolaridadeKey = getMaisFrequente(escolaridades);
  const religiaoKey = getMaisFrequente(religioes);
  const orientacaoKey = getMaisFrequente(orientacoes);

  return {
    classeEconomica: classeLabels[classeKey] || classeKey,
    escolaridade: escolaridadeLabels[escolaridadeKey] || escolaridadeKey,
    religiao: religiaoKey.charAt(0).toUpperCase() + religiaoKey.slice(1),
    orientacaoPolitica: orientacaoLabels[orientacaoKey] || orientacaoKey,
    faixaEtaria,
  };
}

function gerarInsights(
  regiao: string,
  votacao: Record<string, { votos: number; percentual: number }>,
  perfil: DetalhesRegiao['perfilDominante'],
  lider: string
): string[] {
  const insights: string[] = [];
  const candidatoLider = CANDIDATOS.find((c) => c.id === lider);
  const percentualLider = votacao[lider]?.percentual || 0;

  if (percentualLider >= 40) {
    insights.push(`${candidatoLider?.nome} domina a região com ${percentualLider.toFixed(1)}% das intenções.`);
  } else if (percentualLider >= 30) {
    insights.push(`${candidatoLider?.nome} lidera, mas há espaço para virada.`);
  } else {
    insights.push(`Cenário fragmentado - todos os candidatos podem crescer.`);
  }

  if (perfil.classeEconomica.includes('Alta') || perfil.classeEconomica.includes('Média-Alta')) {
    insights.push('Eleitorado valoriza eficiência e governança.');
  } else {
    insights.push('Eleitorado sensível a propostas sociais.');
  }

  const segundo = Object.entries(votacao)
    .filter(([k]) => k !== lider && k !== 'brancos')
    .sort((a, b) => b[1].percentual - a[1].percentual)[0];

  if (segundo) {
    const diff = percentualLider - segundo[1].percentual;
    if (diff < 10) {
      const segundoCandidato = CANDIDATOS.find((c) => c.id === segundo[0]);
      insights.push(`Disputa acirrada com ${segundoCandidato?.nome.split(' ')[0]} (${diff.toFixed(1)}pp).`);
    }
  }

  return insights;
}

// ============================================
// COMPONENTES
// ============================================

interface RegiaoSVGProps {
  regiao: string;
  layout: { x: number; y: number; w: number; h: number };
  cor: string;
  corBorda: string;
  percentual: number;
  disputaAcirrada: boolean;
  onClick: () => void;
  isSelected: boolean;
  isFiltered: boolean;
}

const RegiaoSVG = memo(function RegiaoSVG({
  regiao,
  layout,
  cor,
  corBorda,
  percentual,
  disputaAcirrada,
  onClick,
  isSelected,
  isFiltered,
}: RegiaoSVGProps) {
  const fontSize = layout.w < 80 ? 7.5 : layout.w < 100 ? 8.5 : 9.5;
  const nomeExibido = regiao.length > 14 ? regiao.substring(0, 12) + '...' : regiao;

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer', opacity: isFiltered ? 0.25 : 1 }}
      className="transition-opacity duration-300"
    >
      {/* Sombra */}
      <rect
        x={layout.x + 2}
        y={layout.y + 2}
        width={layout.w}
        height={layout.h}
        rx={8}
        ry={8}
        fill="rgba(0,0,0,0.2)"
      />
      {/* Fundo principal */}
      <rect
        x={layout.x}
        y={layout.y}
        width={layout.w}
        height={layout.h}
        rx={8}
        ry={8}
        fill={cor}
        stroke={isSelected ? '#ffffff' : corBorda}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-200"
        style={{
          filter: isSelected
            ? 'drop-shadow(0 0 12px rgba(255,255,255,0.6))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        }}
      />
      {/* Brilho superior */}
      <rect
        x={layout.x + 3}
        y={layout.y + 3}
        width={layout.w - 6}
        height={layout.h / 3}
        rx={5}
        ry={5}
        fill="rgba(255,255,255,0.25)"
      />
      {/* Nome da região */}
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + layout.h / 2 - 5}
        textAnchor="middle"
        fill="#1e293b"
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
        className="pointer-events-none select-none"
      >
        {nomeExibido}
      </text>
      {/* Percentual */}
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + layout.h / 2 + 10}
        textAnchor="middle"
        fill="#334155"
        fontSize={fontSize + 1}
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        className="pointer-events-none select-none"
      >
        {percentual.toFixed(0)}%
      </text>
      {/* Indicador de disputa acirrada */}
      {disputaAcirrada && (
        <g>
          <circle
            cx={layout.x + layout.w - 8}
            cy={layout.y + 8}
            r={6}
            fill="#f59e0b"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <text
            x={layout.x + layout.w - 8}
            y={layout.y + 11}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={7}
            fontWeight="bold"
          >
            !
          </text>
        </g>
      )}
    </g>
  );
});

interface ModalDetalhesProps {
  detalhes: DetalhesRegiao;
  onClose: () => void;
}

function ModalDetalhes({ detalhes, onClose }: ModalDetalhesProps) {
  const { navigateWithFilter } = useFilterNavigation();
  const candidatoLider = CANDIDATOS.find((c) => c.id === detalhes.lider);

  const votacaoOrdenada = Object.entries(detalhes.votacao)
    .sort((a, b) => b[1].percentual - a[1].percentual);

  const handleVerEleitores = () => {
    navigateWithFilter('regioes', detalhes.regiao);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: candidatoLider?.cor }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{detalhes.regiao}</h2>
                <p className="text-sm text-slate-400">
                  {detalhes.totalEleitores} eleitores simulados
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerEleitores}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
            >
              <UserSearch className="w-4 h-4" />
              <span className="text-sm font-medium">Ver Eleitores</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Líder destacado */}
        <div
          className="mb-6 p-4 rounded-xl border-2"
          style={{
            backgroundColor: `${candidatoLider?.cor}15`,
            borderColor: candidatoLider?.cor
          }}
        >
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" style={{ color: candidatoLider?.cor }} />
            <div>
              <p className="text-sm text-slate-400">Candidato Líder</p>
              <p className="text-lg font-bold text-white">
                {candidatoLider?.nome}{' '}
                <span className="text-sm font-normal text-slate-400">({candidatoLider?.partido})</span>
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold" style={{ color: candidatoLider?.cor }}>
                {detalhes.votacao[detalhes.lider]?.percentual.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Votação */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Vote className="w-4 h-4 text-blue-400" />
            Intenção de Voto por Candidato
          </h3>
          <div className="space-y-3">
            {votacaoOrdenada.map(([candidatoId, dados], index) => {
              const candidato = CANDIDATOS.find((c) => c.id === candidatoId);
              if (!candidato) return null;

              return (
                <div key={candidatoId} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: candidato.cor }}
                      />
                      <span className="text-sm font-medium text-slate-200">
                        {candidato.nome}
                      </span>
                      <span className="text-xs text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded">
                        {candidato.partido}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: candidato.cor }}
                    >
                      {dados.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dados.percentual}%` }}
                      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: candidato.cor,
                        boxShadow: `0 0 10px ${candidato.cor}50`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perfil Dominante */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Perfil Dominante da Região
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wallet, label: 'Classe', value: detalhes.perfilDominante.classeEconomica, color: 'emerald' },
              { icon: GraduationCap, label: 'Escolaridade', value: detalhes.perfilDominante.escolaridade, color: 'blue' },
              { icon: Church, label: 'Religião', value: detalhes.perfilDominante.religiao, color: 'amber' },
              { icon: Vote, label: 'Orientação', value: detalhes.perfilDominante.orientacaoPolitica, color: 'rose' },
              { icon: Calendar, label: 'Faixa Etária', value: detalhes.perfilDominante.faixaEtaria, color: 'cyan' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 text-${color}-400`} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            Insights Estratégicos
          </h3>
          <div className="space-y-2">
            {detalhes.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-2 p-3 bg-gradient-to-r from-orange-500/10 to-transparent rounded-xl border-l-2 border-orange-500/50"
              >
                <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call-to-action */}
        <button
          onClick={handleVerEleitores}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 rounded-xl border border-primary/30 transition-all group"
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Explorar {detalhes.totalEleitores} eleitores de {detalhes.regiao}
          </span>
          <ExternalLink className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function MapaCalorEleitoral({ eleitores }: MapaCalorEleitoralProps) {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string | null>(null);
  const [candidatoFiltro, setCandidatoFiltro] = useState<string | null>(null);

  const votacaoPorRegiao = useMemo(() => {
    const resultado: Record<string, VotacaoRegiao> = {};

    const eleitoresPorRegiao: Record<string, Eleitor[]> = {};
    eleitores.forEach((e) => {
      if (!eleitoresPorRegiao[e.regiao_administrativa]) {
        eleitoresPorRegiao[e.regiao_administrativa] = [];
      }
      eleitoresPorRegiao[e.regiao_administrativa].push(e);
    });

    Object.entries(eleitoresPorRegiao).forEach(([regiao, eleitoresRegiao]) => {
      const votos: Record<string, number> = {};
      CANDIDATOS.forEach((c) => {
        votos[c.id] = 0;
      });

      eleitoresRegiao.forEach((e) => {
        const voto = simularVotacao(e);
        votos[voto] = (votos[voto] || 0) + 1;
      });

      let lider = 'ibaneis';
      let maxVotos = 0;
      Object.entries(votos).forEach(([candidato, qtd]) => {
        if (candidato !== 'brancos' && qtd > maxVotos) {
          maxVotos = qtd;
          lider = candidato;
        }
      });

      const votosOrdenados = Object.entries(votos)
        .filter(([k]) => k !== 'brancos')
        .sort((a, b) => b[1] - a[1]);

      const vantagem = votosOrdenados.length > 1
        ? ((votosOrdenados[0][1] - votosOrdenados[1][1]) / eleitoresRegiao.length) * 100
        : 100;

      const disputaAcirrada = vantagem < 10;

      resultado[regiao] = {
        regiao,
        votos,
        lider,
        vantagem,
        totalVotantes: eleitoresRegiao.length,
        percentualLider: (maxVotos / eleitoresRegiao.length) * 100,
        disputaAcirrada,
      };
    });

    return resultado;
  }, [eleitores]);

  const detalhesRegiaoSelecionada = useMemo((): DetalhesRegiao | null => {
    if (!regiaoSelecionada) return null;

    const votacao = votacaoPorRegiao[regiaoSelecionada];
    if (!votacao) return null;

    const eleitoresRegiao = eleitores.filter(
      (e) => e.regiao_administrativa === regiaoSelecionada
    );

    const votacaoDetalhada: Record<string, { votos: number; percentual: number }> = {};
    Object.entries(votacao.votos).forEach(([candidato, votos]) => {
      votacaoDetalhada[candidato] = {
        votos,
        percentual: (votos / votacao.totalVotantes) * 100,
      };
    });

    const perfil = calcularPerfilDominante(eleitoresRegiao);
    const insights = gerarInsights(regiaoSelecionada, votacaoDetalhada, perfil, votacao.lider);

    return {
      regiao: regiaoSelecionada,
      totalEleitores: votacao.totalVotantes,
      votacao: votacaoDetalhada,
      lider: votacao.lider,
      perfilDominante: perfil,
      insights,
    };
  }, [regiaoSelecionada, votacaoPorRegiao, eleitores]);

  const estatisticasGerais = useMemo(() => {
    const votosTotais: Record<string, number> = {};
    CANDIDATOS.forEach((c) => {
      votosTotais[c.id] = 0;
    });

    Object.values(votacaoPorRegiao).forEach((v) => {
      Object.entries(v.votos).forEach(([candidato, votos]) => {
        votosTotais[candidato] = (votosTotais[candidato] || 0) + votos;
      });
    });

    const total = eleitores.length;
    return Object.entries(votosTotais)
      .map(([id, votos]) => ({
        id,
        votos,
        percentual: (votos / total) * 100,
      }))
      .sort((a, b) => b.percentual - a.percentual);
  }, [votacaoPorRegiao, eleitores.length]);

  const regioesLideranca = useMemo(() => {
    const resultado: Record<string, number> = {};
    CANDIDATOS.forEach((c) => {
      resultado[c.id] = 0;
    });

    Object.values(votacaoPorRegiao).forEach((v) => {
      if (v.lider && resultado[v.lider] !== undefined) {
        resultado[v.lider]++;
      }
    });

    return resultado;
  }, [votacaoPorRegiao]);

  const handleCandidatoClick = useCallback((candidatoId: string) => {
    setCandidatoFiltro(prev => prev === candidatoId ? null : candidatoId);
  }, []);

  const handleRegiaoClick = useCallback((regiao: string) => {
    setRegiaoSelecionada(regiao);
  }, []);

  const disputasAcirradas = useMemo(() => {
    return Object.values(votacaoPorRegiao).filter(v => v.disputaAcirrada).length;
  }, [votacaoPorRegiao]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-700/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Mapa Eleitoral do DF
            </h2>
            <p className="text-sm text-muted-foreground">
              Simulação eleitoral para Governador 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {disputasAcirradas > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                {disputasAcirradas} disputas acirradas
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {Object.keys(votacaoPorRegiao).length} RAs
            </span>
          </div>
        </div>
      </div>

      {/* Cards dos Candidatos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {CANDIDATOS.filter(c => c.id !== 'brancos').map((candidato, index) => {
          const stats = estatisticasGerais.find((s) => s.id === candidato.id);
          const regioes = regioesLideranca[candidato.id] || 0;
          const isFiltered = candidatoFiltro === candidato.id;
          const posicao = estatisticasGerais.findIndex(s => s.id === candidato.id) + 1;

          return (
            <motion.button
              key={candidato.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCandidatoClick(candidato.id)}
              className={`relative p-4 rounded-xl transition-all duration-300 overflow-hidden ${
                isFiltered
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-background'
                  : ''
              }`}
              style={{
                background: isFiltered
                  ? `linear-gradient(135deg, ${candidato.cor}, ${candidato.cor}cc)`
                  : candidato.corClara,
              }}
            >
              {/* Posição */}
              <div
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: isFiltered ? 'rgba(255,255,255,0.3)' : candidato.cor,
                  color: isFiltered ? '#fff' : '#fff',
                }}
              >
                {posicao}º
              </div>

              <p
                className="text-xs font-semibold mb-0.5"
                style={{ color: isFiltered ? 'rgba(255,255,255,0.8)' : candidato.cor }}
              >
                {candidato.partido}
              </p>
              <p
                className="text-sm font-bold truncate mb-2"
                style={{ color: isFiltered ? '#fff' : '#1e293b' }}
              >
                {candidato.nome.split(' ')[0]}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="text-2xl font-black"
                    style={{ color: isFiltered ? '#fff' : candidato.cor }}
                  >
                    {stats?.percentual.toFixed(1)}%
                  </p>
                </div>
                <div
                  className="text-right"
                  style={{ color: isFiltered ? 'rgba(255,255,255,0.8)' : '#64748b' }}
                >
                  <div className="flex items-center gap-1 text-xs">
                    <Trophy className="w-3 h-3" />
                    <span className="font-semibold">{regioes} RAs</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mapa SVG */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 overflow-hidden border border-slate-700/30">
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <svg
          viewBox="0 0 770 450"
          className="w-full h-auto"
          style={{ minHeight: '380px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#334155"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </pattern>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgGradient)" />
          <rect width="100%" height="100%" fill="url(#mapGrid)" />

          {/* Regiões */}
          {Object.entries(LAYOUT_RAS).map(([regiao, layout]) => {
            const votacao = votacaoPorRegiao[regiao];
            if (!votacao) return null;

            const candidatoLider = CANDIDATOS.find((c) => c.id === votacao.lider);
            const cor = candidatoLider?.corClara || '#e5e7eb';
            const corBorda = candidatoLider?.cor || '#6b7280';
            const isFiltered = candidatoFiltro !== null && votacao.lider !== candidatoFiltro;

            return (
              <RegiaoSVG
                key={regiao}
                regiao={regiao}
                layout={layout}
                cor={cor}
                corBorda={corBorda}
                percentual={votacao.percentualLider}
                disputaAcirrada={votacao.disputaAcirrada}
                onClick={() => handleRegiaoClick(regiao)}
                isSelected={regiaoSelecionada === regiao}
                isFiltered={isFiltered}
              />
            );
          })}

          {/* Legenda no mapa */}
          <text x="385" y="438" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
            Clique em uma região para ver detalhes • Regiões Administrativas do DF
          </text>
        </svg>

        {/* Badge de simulação */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300">
            Simulação com {eleitores.length} eleitores
          </span>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {CANDIDATOS.filter(c => c.id !== 'brancos').map((candidato) => (
          <div key={candidato.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-md shadow-sm"
              style={{
                backgroundColor: candidato.corClara,
                border: `2px solid ${candidato.cor}`,
                boxShadow: `0 0 4px ${candidato.cor}30`
              }}
            />
            <span className="text-sm text-muted-foreground">
              {candidato.nome.split(' ')[0]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
          <div className="w-4 h-4 rounded-md bg-amber-500/30 border-2 border-amber-500 flex items-center justify-center">
            <span className="text-[8px] text-amber-500 font-bold">!</span>
          </div>
          <span className="text-sm text-muted-foreground">Disputa acirrada</span>
        </div>
      </div>

      {/* Modal de detalhes */}
      <AnimatePresence>
        {detalhesRegiaoSelecionada && (
          <ModalDetalhes
            detalhes={detalhesRegiaoSelecionada}
            onClose={() => setRegiaoSelecionada(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MapaCalorEleitoral;
