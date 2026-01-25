'use client';

/**
 * Insights de Candidatos
 *
 * Componente para exibir análise e insights do grupo de candidatos.
 */

import { useMemo, useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  Building2,
  Compass,
  Shield,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { Candidato } from '@/types';
import { cn } from '@/lib/utils';

interface CandidatosInsightsProps {
  candidatos: Candidato[];
  onGerarAnaliseIA?: (candidatos: Candidato[]) => Promise<void>;
  carregandoIA?: boolean;
}

interface InsightItem {
  tipo: 'positivo' | 'negativo' | 'neutro' | 'alerta';
  titulo: string;
  descricao: string;
  valor?: string;
}

export function CandidatosInsights({
  candidatos,
  onGerarAnaliseIA,
  carregandoIA = false,
}: CandidatosInsightsProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  // Calcular insights automaticamente
  const insights = useMemo(() => {
    if (candidatos.length === 0) return [];

    const resultado: InsightItem[] = [];

    // Análise de gênero
    const mulheres = candidatos.filter((c) => c.genero === 'feminino').length;
    const homens = candidatos.filter((c) => c.genero === 'masculino').length;
    const percentualMulheres = (mulheres / candidatos.length) * 100;

    if (percentualMulheres >= 30) {
      resultado.push({
        tipo: 'positivo',
        titulo: 'Boa representatividade feminina',
        descricao: `${percentualMulheres.toFixed(1)}% dos candidatos são mulheres`,
        valor: `${mulheres} de ${candidatos.length}`,
      });
    } else {
      resultado.push({
        tipo: 'alerta',
        titulo: 'Baixa representatividade feminina',
        descricao: `Apenas ${percentualMulheres.toFixed(1)}% dos candidatos são mulheres`,
        valor: `${mulheres} de ${candidatos.length}`,
      });
    }

    // Análise de partidos
    const partidos = new Set(candidatos.map((c) => c.partido));
    resultado.push({
      tipo: 'neutro',
      titulo: 'Diversidade partidária',
      descricao: `${partidos.size} partidos representados no grupo`,
      valor: Array.from(partidos).slice(0, 5).join(', '),
    });

    // Análise de orientação política
    const orientacoes: Record<string, number> = {};
    candidatos.forEach((c) => {
      const o = c.orientacao_politica || 'não definida';
      orientacoes[o] = (orientacoes[o] || 0) + 1;
    });

    const orientacaoDominante = Object.entries(orientacoes)
      .sort((a, b) => b[1] - a[1])[0];

    if (orientacaoDominante) {
      const percentual = (orientacaoDominante[1] / candidatos.length) * 100;
      resultado.push({
        tipo: percentual > 60 ? 'alerta' : 'neutro',
        titulo: percentual > 60 ? 'Concentração ideológica' : 'Distribuição ideológica',
        descricao: `${orientacaoDominante[0]} é a orientação mais comum (${percentual.toFixed(1)}%)`,
        valor: `${orientacaoDominante[1]} candidatos`,
      });
    }

    // Análise de experiência (eleições anteriores)
    const comExperiencia = candidatos.filter(
      (c) => c.eleicoes_anteriores && c.eleicoes_anteriores.length > 0
    ).length;
    const percentualExperiencia = (comExperiencia / candidatos.length) * 100;

    resultado.push({
      tipo: percentualExperiencia > 50 ? 'positivo' : 'neutro',
      titulo: percentualExperiencia > 50 ? 'Grupo experiente' : 'Renovação significativa',
      descricao: `${percentualExperiencia.toFixed(1)}% já disputaram eleições anteriores`,
      valor: `${comExperiencia} de ${candidatos.length}`,
    });

    // Análise de conhecimento
    const candidatosComConhecimento = candidatos.filter(
      (c) => c.conhecimento_estimado !== undefined
    );
    if (candidatosComConhecimento.length > 0) {
      const mediaConhecimento =
        candidatosComConhecimento.reduce(
          (acc, c) => acc + (c.conhecimento_estimado || 0),
          0
        ) / candidatosComConhecimento.length;

      resultado.push({
        tipo: mediaConhecimento > 50 ? 'positivo' : 'alerta',
        titulo: mediaConhecimento > 50 ? 'Candidatos conhecidos' : 'Baixo conhecimento médio',
        descricao: `Conhecimento médio estimado: ${mediaConhecimento.toFixed(1)}%`,
        valor: `Base: ${candidatosComConhecimento.length} candidatos`,
      });
    }

    // Análise de rejeição
    const candidatosComRejeicao = candidatos.filter(
      (c) => c.rejeicao_estimada !== undefined
    );
    if (candidatosComRejeicao.length > 0) {
      const mediaRejeicao =
        candidatosComRejeicao.reduce((acc, c) => acc + (c.rejeicao_estimada || 0), 0) /
        candidatosComRejeicao.length;

      resultado.push({
        tipo: mediaRejeicao < 30 ? 'positivo' : mediaRejeicao > 40 ? 'negativo' : 'neutro',
        titulo:
          mediaRejeicao < 30
            ? 'Baixa rejeição média'
            : mediaRejeicao > 40
            ? 'Alta rejeição média'
            : 'Rejeição moderada',
        descricao: `Rejeição média estimada: ${mediaRejeicao.toFixed(1)}%`,
        valor: `Base: ${candidatosComRejeicao.length} candidatos`,
      });
    }

    // Controvérsias
    const comControversias = candidatos.filter(
      (c) => c.controversias && c.controversias.length > 0
    );
    if (comControversias.length > 0) {
      resultado.push({
        tipo: 'alerta',
        titulo: 'Candidatos com controvérsias',
        descricao: `${comControversias.length} candidatos possuem controvérsias registradas`,
        valor: comControversias.map((c) => c.nome_urna).slice(0, 3).join(', '),
      });
    }

    // Por cargo
    const porCargo: Record<string, number> = {};
    candidatos.forEach((c) => {
      const cargo = c.cargo_pretendido || 'não definido';
      porCargo[cargo] = (porCargo[cargo] || 0) + 1;
    });

    Object.entries(porCargo).forEach(([cargo, qtd]) => {
      resultado.push({
        tipo: 'neutro',
        titulo: `Disputa para ${cargo}`,
        descricao: `${qtd} candidatos disputando o cargo de ${cargo}`,
        valor: `${((qtd / candidatos.length) * 100).toFixed(1)}%`,
      });
    });

    return resultado;
  }, [candidatos]);

  // Resumo do grupo
  const resumo = useMemo(() => {
    if (candidatos.length === 0) return null;

    const partidos = new Set(candidatos.map((c) => c.partido)).size;
    const mulheres = candidatos.filter((c) => c.genero === 'feminino').length;
    const governador = candidatos.filter((c) => c.cargo_pretendido === 'governador').length;
    const senador = candidatos.filter((c) => c.cargo_pretendido === 'senador').length;

    return {
      total: candidatos.length,
      partidos,
      mulheres,
      homens: candidatos.length - mulheres,
      governador,
      senador,
      outros: candidatos.length - governador - senador,
    };
  }, [candidatos]);

  if (candidatos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum candidato selecionado para análise.
      </div>
    );
  }

  const getIconePorTipo = (tipo: InsightItem['tipo']) => {
    switch (tipo) {
      case 'positivo':
        return TrendingUp;
      case 'negativo':
        return TrendingDown;
      case 'alerta':
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getCorPorTipo = (tipo: InsightItem['tipo']) => {
    switch (tipo) {
      case 'positivo':
        return 'text-green-500 bg-green-500/10';
      case 'negativo':
        return 'text-red-500 bg-red-500/10';
      case 'alerta':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Grupo */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Resumo do Grupo</h3>
              <p className="text-sm text-muted-foreground">
                Visão geral dos {resumo?.total} candidatos selecionados
              </p>
            </div>
          </div>
          {onGerarAnaliseIA && (
            <button
              onClick={() => onGerarAnaliseIA(candidatos)}
              disabled={carregandoIA}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                carregandoIA
                  ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {carregandoIA ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Análise com IA
                </>
              )}
            </button>
          )}
        </div>

        {resumo && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-primary mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.total}</div>
              <div className="text-xs text-muted-foreground">Candidatos</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Building2 className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.partidos}</div>
              <div className="text-xs text-muted-foreground">Partidos</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-pink-500 mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.mulheres}</div>
              <div className="text-xs text-muted-foreground">Mulheres</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-blue-400 mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.homens}</div>
              <div className="text-xs text-muted-foreground">Homens</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Target className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.governador}</div>
              <div className="text-xs text-muted-foreground">P/ Governador</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <div className="text-xl font-bold text-foreground">{resumo.senador}</div>
              <div className="text-xs text-muted-foreground">P/ Senador</div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Automáticos */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-foreground">Insights Automáticos</h3>
          </div>
          <button
            onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
            className="text-sm text-primary hover:underline"
          >
            {mostrarDetalhes ? 'Ocultar detalhes' : 'Ver todos'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(mostrarDetalhes ? insights : insights.slice(0, 6)).map((insight, index) => {
            const Icone = getIconePorTipo(insight.tipo);
            const cores = getCorPorTipo(insight.tipo);

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg"
              >
                <div className={cn('p-2 rounded-lg', cores)}>
                  <Icone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{insight.titulo}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.descricao}
                  </p>
                  {insight.valor && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-secondary rounded">
                      {insight.valor}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {insights.length > 6 && !mostrarDetalhes && (
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">
              +{insights.length - 6} insights adicionais
            </span>
          </div>
        )}
      </div>

      {/* Comparativo de Candidatos (top por conhecimento) */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top Candidatos por Conhecimento</h3>
        </div>
        <div className="space-y-3">
          {candidatos
            .filter((c) => c.conhecimento_estimado !== undefined)
            .sort((a, b) => (b.conhecimento_estimado || 0) - (a.conhecimento_estimado || 0))
            .slice(0, 5)
            .map((candidato, index) => (
              <div key={candidato.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : index === 1
                      ? 'bg-gray-300/20 text-gray-300'
                      : index === 2
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {candidato.nome_urna}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {candidato.partido} • {candidato.cargo_pretendido}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {candidato.conhecimento_estimado}%
                  </div>
                  <div className="text-xs text-muted-foreground">conhecimento</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default CandidatosInsights;
