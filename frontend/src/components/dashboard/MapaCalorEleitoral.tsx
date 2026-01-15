'use client';

import { useState, useMemo, memo } from 'react';
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
  Info,
  Target,
  BarChart3,
} from 'lucide-react';
import type { Eleitor } from '@/types';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface Candidato {
  id: string;
  nome: string;
  partido: string;
  cor: string;
  corClara: string;
}

interface VotacaoRegiao {
  regiao: string;
  votos: Record<string, number>;
  lider: string;
  vantagem: number;
  totalVotantes: number;
  percentualLider: number;
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
// CANDIDATOS SIMULADOS
// ============================================

const CANDIDATOS: Candidato[] = [
  { id: 'ibaneis', nome: 'Ibaneis Rocha', partido: 'MDB', cor: '#22c55e', corClara: '#bbf7d0' },
  { id: 'celina', nome: 'Celina Leão', partido: 'PP', cor: '#3b82f6', corClara: '#bfdbfe' },
  { id: 'damares', nome: 'Damares Alves', partido: 'Republicanos', cor: '#8b5cf6', corClara: '#ddd6fe' },
  { id: 'rafaelfontes', nome: 'Rafael Fontes', partido: 'PT', cor: '#ef4444', corClara: '#fecaca' },
  { id: 'brancos', nome: 'Brancos/Nulos', partido: '-', cor: '#6b7280', corClara: '#e5e7eb' },
];

// ============================================
// LAYOUT DO MAPA (SIMPLIFICADO PARA SVG)
// ============================================

// Posições das RAs no mapa (x, y, largura, altura)
// Organizadas geograficamente de forma aproximada
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

// Simula votação baseada nas características dos eleitores
function simularVotacao(eleitor: Eleitor): string {
  const { orientacao_politica, posicao_bolsonaro, cluster_socioeconomico, religiao } = eleitor;

  // Peso base para cada candidato baseado no perfil
  const pesos: Record<string, number> = {
    ibaneis: 25,
    celina: 20,
    damares: 15,
    rafaelfontes: 15,
    brancos: 5,
  };

  // Ajustes baseados em orientação política
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

  // Ajustes baseados em posição Bolsonaro
  if (posicao_bolsonaro === 'apoiador_forte' || posicao_bolsonaro === 'apoiador_moderado') {
    pesos.damares += 20;
    pesos.rafaelfontes -= 15;
  } else if (posicao_bolsonaro === 'critico_forte' || posicao_bolsonaro === 'critico_moderado') {
    pesos.rafaelfontes += 15;
    pesos.damares -= 15;
  }

  // Ajustes baseados em classe social
  if (cluster_socioeconomico === 'G1_alta' || cluster_socioeconomico === 'G2_media_alta') {
    pesos.ibaneis += 10;
    pesos.celina += 10;
  } else {
    pesos.rafaelfontes += 10;
  }

  // Ajustes baseados em religião
  if (religiao?.toLowerCase().includes('evangélica') || religiao?.toLowerCase().includes('evangelica')) {
    pesos.damares += 15;
  }

  // Normalizar e sortear
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

  // Classe econômica
  const classes: Record<string, number> = {};
  eleitores.forEach((e) => {
    classes[e.cluster_socioeconomico] = (classes[e.cluster_socioeconomico] || 0) + 1;
  });
  const classeLabels: Record<string, string> = {
    G1_alta: 'Alta Renda',
    G2_media_alta: 'Média-Alta Renda',
    G3_media_baixa: 'Média-Baixa Renda',
    G4_baixa: 'Baixa Renda',
  };
  const classeTop = Object.entries(classes).sort((a, b) => b[1] - a[1])[0];

  // Escolaridade
  const escolaridades: Record<string, number> = {};
  eleitores.forEach((e) => {
    escolaridades[e.escolaridade] = (escolaridades[e.escolaridade] || 0) + 1;
  });
  const escolaridadeLabels: Record<string, string> = {
    fundamental_incompleto: 'Fundamental Incompleto',
    fundamental_completo: 'Fundamental Completo',
    medio_incompleto: 'Médio Incompleto',
    medio_completo_ou_sup_incompleto: 'Médio Completo',
    superior_completo_ou_pos: 'Superior/Pós',
  };
  const escolaridadeTop = Object.entries(escolaridades).sort((a, b) => b[1] - a[1])[0];

  // Religião
  const religioes: Record<string, number> = {};
  eleitores.forEach((e) => {
    religioes[e.religiao] = (religioes[e.religiao] || 0) + 1;
  });
  const religiaoTop = Object.entries(religioes).sort((a, b) => b[1] - a[1])[0];

  // Orientação política
  const orientacoes: Record<string, number> = {};
  eleitores.forEach((e) => {
    orientacoes[e.orientacao_politica] = (orientacoes[e.orientacao_politica] || 0) + 1;
  });
  const orientacaoLabels: Record<string, string> = {
    esquerda: 'Esquerda',
    'centro-esquerda': 'Centro-Esquerda',
    centro: 'Centro',
    'centro-direita': 'Centro-Direita',
    direita: 'Direita',
  };
  const orientacaoTop = Object.entries(orientacoes).sort((a, b) => b[1] - a[1])[0];

  // Faixa etária
  const mediaIdade = eleitores.reduce((acc, e) => acc + e.idade, 0) / eleitores.length;
  let faixaEtaria = '16-24 anos';
  if (mediaIdade >= 25 && mediaIdade < 35) faixaEtaria = '25-34 anos';
  else if (mediaIdade >= 35 && mediaIdade < 45) faixaEtaria = '35-44 anos';
  else if (mediaIdade >= 45 && mediaIdade < 55) faixaEtaria = '45-54 anos';
  else if (mediaIdade >= 55 && mediaIdade < 65) faixaEtaria = '55-64 anos';
  else if (mediaIdade >= 65) faixaEtaria = '65+ anos';

  return {
    classeEconomica: classeLabels[classeTop?.[0]] || classeTop?.[0] || 'N/A',
    escolaridade: escolaridadeLabels[escolaridadeTop?.[0]] || escolaridadeTop?.[0] || 'N/A',
    religiao: religiaoTop?.[0] ? religiaoTop[0].charAt(0).toUpperCase() + religiaoTop[0].slice(1) : 'N/A',
    orientacaoPolitica: orientacaoLabels[orientacaoTop?.[0]] || orientacaoTop?.[0] || 'N/A',
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

  // Insight sobre liderança
  const percentualLider = votacao[lider]?.percentual || 0;
  if (percentualLider >= 40) {
    insights.push(`${candidatoLider?.nome} tem domínio expressivo com ${percentualLider.toFixed(1)}% das intenções.`);
  } else if (percentualLider >= 30) {
    insights.push(`${candidatoLider?.nome} lidera, mas há disputa acirrada na região.`);
  } else {
    insights.push(`Cenário muito fragmentado - oportunidade para todos os candidatos.`);
  }

  // Insight sobre perfil
  if (perfil.classeEconomica.includes('Alta') || perfil.classeEconomica.includes('Média-Alta')) {
    insights.push('Região com alto poder aquisitivo - foco em propostas de eficiência e governança.');
  } else {
    insights.push('Região sensível a propostas sociais e de transferência de renda.');
  }

  // Insight sobre estratégia
  const segundo = Object.entries(votacao)
    .filter(([k]) => k !== lider && k !== 'brancos')
    .sort((a, b) => b[1].percentual - a[1].percentual)[0];

  if (segundo) {
    const diff = percentualLider - segundo[1].percentual;
    if (diff < 10) {
      const segundoCandidato = CANDIDATOS.find((c) => c.id === segundo[0]);
      insights.push(`Disputa acirrada com ${segundoCandidato?.nome} (${diff.toFixed(1)}pp de diferença).`);
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
  onClick: () => void;
  isSelected: boolean;
}

const RegiaoSVG = memo(function RegiaoSVG({
  regiao,
  layout,
  cor,
  corBorda,
  percentual,
  onClick,
  isSelected,
}: RegiaoSVGProps) {
  const fontSize = layout.w < 80 ? 8 : layout.w < 100 ? 9 : 10;
  const nomeExibido = regiao.length > 15 ? regiao.substring(0, 13) + '...' : regiao;

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="transition-all duration-200"
    >
      <rect
        x={layout.x}
        y={layout.y}
        width={layout.w}
        height={layout.h}
        rx={6}
        ry={6}
        fill={cor}
        stroke={isSelected ? '#ffffff' : corBorda}
        strokeWidth={isSelected ? 3 : 1.5}
        className="transition-all duration-200 hover:brightness-110"
        filter={isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : undefined}
      />
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + layout.h / 2 - 6}
        textAnchor="middle"
        fill="#1f2937"
        fontSize={fontSize}
        fontWeight="600"
        className="pointer-events-none select-none"
      >
        {nomeExibido}
      </text>
      <text
        x={layout.x + layout.w / 2}
        y={layout.y + layout.h / 2 + 8}
        textAnchor="middle"
        fill="#374151"
        fontSize={fontSize - 1}
        fontWeight="500"
        className="pointer-events-none select-none"
      >
        {percentual.toFixed(0)}%
      </text>
    </g>
  );
});

interface ModalDetalhesProps {
  detalhes: DetalhesRegiao;
  onClose: () => void;
}

function ModalDetalhes({ detalhes, onClose }: ModalDetalhesProps) {
  const candidatoLider = CANDIDATOS.find((c) => c.id === detalhes.lider);

  // Ordenar votação por percentual
  const votacaoOrdenada = Object.entries(detalhes.votacao)
    .sort((a, b) => b[1].percentual - a[1].percentual);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-bold text-foreground">{detalhes.regiao}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {detalhes.totalEleitores} eleitores • Líder:{' '}
              <span style={{ color: candidatoLider?.cor }} className="font-semibold">
                {candidatoLider?.nome}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Votação */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Vote className="w-4 h-4 text-blue-500" />
            Intenção de Voto
          </h3>
          <div className="space-y-3">
            {votacaoOrdenada.map(([candidatoId, dados], index) => {
              const candidato = CANDIDATOS.find((c) => c.id === candidatoId);
              if (!candidato) return null;

              return (
                <div key={candidatoId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: candidato.cor }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {candidato.nome}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({candidato.partido})
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: candidato.cor }}>
                      {dados.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dados.percentual}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: candidato.cor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perfil Dominante */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            Perfil Dominante da Região
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Classe Econômica</span>
              </div>
              <p className="text-sm font-medium text-foreground">{detalhes.perfilDominante.classeEconomica}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Escolaridade</span>
              </div>
              <p className="text-sm font-medium text-foreground">{detalhes.perfilDominante.escolaridade}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Church className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Religião</span>
              </div>
              <p className="text-sm font-medium text-foreground">{detalhes.perfilDominante.religiao}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Vote className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Orientação Política</span>
              </div>
              <p className="text-sm font-medium text-foreground">{detalhes.perfilDominante.orientacaoPolitica}</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            Insights Estratégicos
          </h3>
          <div className="space-y-2">
            {detalhes.insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg"
              >
                <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>
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

  // Calcular votação por região
  const votacaoPorRegiao = useMemo(() => {
    const resultado: Record<string, VotacaoRegiao> = {};

    // Agrupar eleitores por região
    const eleitoresPorRegiao: Record<string, Eleitor[]> = {};
    eleitores.forEach((e) => {
      if (!eleitoresPorRegiao[e.regiao_administrativa]) {
        eleitoresPorRegiao[e.regiao_administrativa] = [];
      }
      eleitoresPorRegiao[e.regiao_administrativa].push(e);
    });

    // Calcular votos para cada região
    Object.entries(eleitoresPorRegiao).forEach(([regiao, eleitoresRegiao]) => {
      const votos: Record<string, number> = {};
      CANDIDATOS.forEach((c) => {
        votos[c.id] = 0;
      });

      eleitoresRegiao.forEach((e) => {
        const voto = simularVotacao(e);
        votos[voto] = (votos[voto] || 0) + 1;
      });

      // Encontrar líder
      let lider = 'ibaneis';
      let maxVotos = 0;
      Object.entries(votos).forEach(([candidato, qtd]) => {
        if (candidato !== 'brancos' && qtd > maxVotos) {
          maxVotos = qtd;
          lider = candidato;
        }
      });

      // Calcular vantagem
      const votosOrdenados = Object.entries(votos)
        .filter(([k]) => k !== 'brancos')
        .sort((a, b) => b[1] - a[1]);
      const vantagem = votosOrdenados.length > 1
        ? ((votosOrdenados[0][1] - votosOrdenados[1][1]) / eleitoresRegiao.length) * 100
        : 100;

      resultado[regiao] = {
        regiao,
        votos,
        lider,
        vantagem,
        totalVotantes: eleitoresRegiao.length,
        percentualLider: (maxVotos / eleitoresRegiao.length) * 100,
      };
    });

    return resultado;
  }, [eleitores]);

  // Calcular detalhes da região selecionada
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

  // Estatísticas gerais
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

  // Regiões onde cada candidato lidera
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

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Mapa de Calor Eleitoral - DF 2026
            </h2>
            <p className="text-sm text-muted-foreground">
              Clique em uma região para ver detalhes • Cores indicam o candidato líder
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>{Object.keys(votacaoPorRegiao).length} regiões</span>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {CANDIDATOS.filter(c => c.id !== 'brancos').map((candidato) => {
          const stats = estatisticasGerais.find((s) => s.id === candidato.id);
          const regioes = regioesLideranca[candidato.id] || 0;
          const isFiltered = candidatoFiltro === candidato.id;

          return (
            <button
              key={candidato.id}
              onClick={() => setCandidatoFiltro(isFiltered ? null : candidato.id)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isFiltered
                  ? 'ring-2 ring-offset-2 ring-offset-background'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: isFiltered ? candidato.cor : candidato.corClara,
                borderColor: candidato.cor,
                color: isFiltered ? '#fff' : '#1f2937',
                ['--tw-ring-color' as any]: candidato.cor,
              }}
            >
              <p className="text-xs font-medium opacity-80">{candidato.partido}</p>
              <p className="text-sm font-bold truncate">{candidato.nome.split(' ')[0]}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold">{stats?.percentual.toFixed(1)}%</span>
                <span className="text-xs opacity-70">{regioes} RAs</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mapa SVG */}
      <div className="relative bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-4 overflow-hidden">
        <svg
          viewBox="0 0 750 450"
          className="w-full h-auto"
          style={{ minHeight: '400px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#374151"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Regiões */}
          {Object.entries(LAYOUT_RAS).map(([regiao, layout]) => {
            const votacao = votacaoPorRegiao[regiao];
            if (!votacao) return null;

            const candidatoLider = CANDIDATOS.find((c) => c.id === votacao.lider);
            const cor = candidatoLider?.corClara || '#e5e7eb';
            const corBorda = candidatoLider?.cor || '#6b7280';

            // Se há filtro de candidato, diminuir opacidade das regiões onde ele não lidera
            const opacity = candidatoFiltro && votacao.lider !== candidatoFiltro ? 0.3 : 1;

            return (
              <g key={regiao} style={{ opacity }}>
                <RegiaoSVG
                  regiao={regiao}
                  layout={layout}
                  cor={cor}
                  corBorda={corBorda}
                  percentual={votacao.percentualLider}
                  onClick={() => setRegiaoSelecionada(regiao)}
                  isSelected={regiaoSelecionada === regiao}
                />
              </g>
            );
          })}

          {/* Título do mapa */}
          <text x="375" y="440" textAnchor="middle" fill="#9ca3af" fontSize="11">
            Regiões Administrativas do Distrito Federal - Simulação Eleitoral 2026
          </text>
        </svg>

        {/* Indicador de zoom */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-lg">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Simulação baseada em {eleitores.length} eleitores</span>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {CANDIDATOS.filter(c => c.id !== 'brancos').map((candidato) => (
          <div key={candidato.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: candidato.corClara, border: `2px solid ${candidato.cor}` }}
            />
            <span className="text-sm text-muted-foreground">
              {candidato.nome.split(' ')[0]} ({candidato.partido})
            </span>
          </div>
        ))}
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
