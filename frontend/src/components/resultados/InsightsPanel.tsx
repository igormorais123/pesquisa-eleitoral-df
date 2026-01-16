'use client';

/**
 * Painel de Insights Automáticos
 * Gera insights estatísticos automaticamente a partir dos dados
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, Users, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  eleitores: Eleitor[];
  maxInsights?: number;
}

interface Insight {
  id: string;
  tipo: 'destaque' | 'alerta' | 'tendencia' | 'oportunidade' | 'correlacao';
  titulo: string;
  descricao: string;
  valor?: string;
  importancia: 'alta' | 'media' | 'baixa';
  dados?: Record<string, number | string>;
}

export function InsightsPanel({ eleitores, maxInsights = 10 }: InsightsPanelProps) {
  const [expandido, setExpandido] = useState(false);

  const insights = useMemo(() => {
    const resultado: Insight[] = [];
    const total = eleitores.length;

    if (total === 0) return resultado;

    // 1. Análise de gênero
    const masculino = eleitores.filter(e => e.genero === 'masculino').length;
    const feminino = eleitores.filter(e => e.genero === 'feminino').length;
    const razaoGenero = masculino / (feminino || 1);

    if (razaoGenero > 1.2 || razaoGenero < 0.8) {
      resultado.push({
        id: 'genero-desequilibrio',
        tipo: 'alerta',
        titulo: 'Desequilíbrio de Gênero',
        descricao: razaoGenero > 1.2
          ? `A amostra tem ${((masculino / total) * 100).toFixed(0)}% de homens, acima da média populacional.`
          : `A amostra tem ${((feminino / total) * 100).toFixed(0)}% de mulheres, acima da média populacional.`,
        valor: `${razaoGenero.toFixed(2)}:1`,
        importancia: 'media',
      });
    }

    // 2. Análise de polarização
    const apoiadoresFortes = eleitores.filter(e => e.posicao_bolsonaro?.includes('apoiador_forte')).length;
    const criticosFortes = eleitores.filter(e => e.posicao_bolsonaro?.includes('critico_forte')).length;
    const extremos = apoiadoresFortes + criticosFortes;
    const percentualExtremos = (extremos / total) * 100;

    if (percentualExtremos > 40) {
      resultado.push({
        id: 'alta-polarizacao',
        tipo: 'alerta',
        titulo: 'Alta Polarização Detectada',
        descricao: `${percentualExtremos.toFixed(0)}% dos eleitores têm posições extremas (apoiadores fortes ou críticos fortes).`,
        valor: `${percentualExtremos.toFixed(0)}%`,
        importancia: 'alta',
        dados: { apoiadores: apoiadoresFortes, criticos: criticosFortes },
      });
    }

    // 3. Susceptibilidade à desinformação
    const altaSusceptibilidade = eleitores.filter(e => (e.susceptibilidade_desinformacao ?? 5) >= 7).length;
    const percentualSusceptivel = (altaSusceptibilidade / total) * 100;

    if (percentualSusceptivel > 20) {
      resultado.push({
        id: 'susceptibilidade-alta',
        tipo: 'alerta',
        titulo: 'Risco de Desinformação',
        descricao: `${percentualSusceptivel.toFixed(0)}% dos eleitores têm alta susceptibilidade à desinformação (≥7/10).`,
        valor: `${percentualSusceptivel.toFixed(0)}%`,
        importancia: 'alta',
      });
    }

    // 4. Análise de interesse político
    const interesseAlto = eleitores.filter(e => e.interesse_politico === 'alto').length;
    const interesseBaixo = eleitores.filter(e => e.interesse_politico === 'baixo').length;

    if (interesseAlto > interesseBaixo * 2) {
      resultado.push({
        id: 'alto-engajamento',
        tipo: 'destaque',
        titulo: 'Amostra Altamente Engajada',
        descricao: `${((interesseAlto / total) * 100).toFixed(0)}% dos eleitores têm alto interesse político.`,
        valor: `${interesseAlto} eleitores`,
        importancia: 'media',
      });
    } else if (interesseBaixo > interesseAlto * 2) {
      resultado.push({
        id: 'baixo-engajamento',
        tipo: 'tendencia',
        titulo: 'Amostra com Baixo Engajamento',
        descricao: `${((interesseBaixo / total) * 100).toFixed(0)}% dos eleitores têm baixo interesse político. Considere estratégias de mobilização.`,
        valor: `${interesseBaixo} eleitores`,
        importancia: 'media',
      });
    }

    // 5. Concentração regional
    const porRegiao: Record<string, number> = {};
    eleitores.forEach(e => {
      porRegiao[e.regiao_administrativa] = (porRegiao[e.regiao_administrativa] || 0) + 1;
    });

    const regiaoTop = Object.entries(porRegiao).sort((a, b) => b[1] - a[1])[0];
    if (regiaoTop && regiaoTop[1] / total > 0.15) {
      resultado.push({
        id: 'concentracao-regional',
        tipo: 'destaque',
        titulo: `Concentração em ${regiaoTop[0]}`,
        descricao: `${((regiaoTop[1] / total) * 100).toFixed(0)}% da amostra está concentrada em ${regiaoTop[0]}.`,
        valor: `${regiaoTop[1]} eleitores`,
        importancia: 'baixa',
      });
    }

    // 6. Análise de classe social
    const classeAlta = eleitores.filter(e =>
      e.cluster_socioeconomico?.includes('alta') || e.cluster_socioeconomico?.includes('G1')
    ).length;
    const classeBaixa = eleitores.filter(e =>
      e.cluster_socioeconomico?.includes('baixa') || e.cluster_socioeconomico?.includes('G4')
    ).length;

    if (classeAlta / total > 0.3) {
      resultado.push({
        id: 'classe-alta-predominante',
        tipo: 'destaque',
        titulo: 'Predominância de Classe Alta',
        descricao: `${((classeAlta / total) * 100).toFixed(0)}% da amostra pertence às classes A/B.`,
        valor: `${classeAlta} eleitores`,
        importancia: 'baixa',
      });
    } else if (classeBaixa / total > 0.3) {
      resultado.push({
        id: 'classe-baixa-predominante',
        tipo: 'destaque',
        titulo: 'Predominância de Classes C/D/E',
        descricao: `${((classeBaixa / total) * 100).toFixed(0)}% da amostra pertence às classes mais baixas.`,
        valor: `${classeBaixa} eleitores`,
        importancia: 'baixa',
      });
    }

    // 7. Tolerância a nuances
    const toleranciaAlta = eleitores.filter(e => e.tolerancia_nuance === 'alta').length;
    const toleranciaBaixa = eleitores.filter(e => e.tolerancia_nuance === 'baixa').length;

    if (toleranciaBaixa > toleranciaAlta * 2) {
      resultado.push({
        id: 'baixa-tolerancia',
        tipo: 'alerta',
        titulo: 'Baixa Tolerância a Nuances',
        descricao: 'A maioria dos eleitores tem dificuldade em aceitar posições intermediárias. Mensagens devem ser diretas.',
        valor: `${((toleranciaBaixa / total) * 100).toFixed(0)}%`,
        importancia: 'media',
      });
    }

    // 8. Análise de idade
    const idadeMedia = eleitores.reduce((acc, e) => acc + e.idade, 0) / total;
    const jovens = eleitores.filter(e => e.idade < 30).length;
    const idosos = eleitores.filter(e => e.idade >= 60).length;

    if (jovens / total > 0.4) {
      resultado.push({
        id: 'amostra-jovem',
        tipo: 'oportunidade',
        titulo: 'Amostra Predominantemente Jovem',
        descricao: `${((jovens / total) * 100).toFixed(0)}% têm menos de 30 anos. Priorize redes sociais e linguagem moderna.`,
        valor: `Média: ${idadeMedia.toFixed(0)} anos`,
        importancia: 'media',
      });
    } else if (idosos / total > 0.3) {
      resultado.push({
        id: 'amostra-idosa',
        tipo: 'oportunidade',
        titulo: 'Público mais Maduro',
        descricao: `${((idosos / total) * 100).toFixed(0)}% têm 60+ anos. Considere mídia tradicional e mensagens sobre segurança/saúde.`,
        valor: `Média: ${idadeMedia.toFixed(0)} anos`,
        importancia: 'media',
      });
    }

    // 9. Religião predominante
    const porReligiao: Record<string, number> = {};
    eleitores.forEach(e => {
      const rel = e.religiao || 'Não informado';
      porReligiao[rel] = (porReligiao[rel] || 0) + 1;
    });

    const religiaoTop = Object.entries(porReligiao).sort((a, b) => b[1] - a[1])[0];
    if (religiaoTop && religiaoTop[0] !== 'Não informado' && religiaoTop[1] / total > 0.4) {
      resultado.push({
        id: 'religiao-predominante',
        tipo: 'destaque',
        titulo: `Maioria ${religiaoTop[0]}`,
        descricao: `${((religiaoTop[1] / total) * 100).toFixed(0)}% da amostra é ${religiaoTop[0]}. Considere valores e linguagem adequados.`,
        valor: `${religiaoTop[1]} eleitores`,
        importancia: 'media',
      });
    }

    // 10. Correlação orientação x classe
    const direitaAlta = eleitores.filter(e =>
      (e.orientacao_politica?.includes('direita')) &&
      (e.cluster_socioeconomico?.includes('alta') || e.cluster_socioeconomico?.includes('G1'))
    ).length;

    const esquerdaBaixa = eleitores.filter(e =>
      (e.orientacao_politica?.includes('esquerda')) &&
      (e.cluster_socioeconomico?.includes('baixa') || e.cluster_socioeconomico?.includes('G4'))
    ).length;

    if (direitaAlta > 10 || esquerdaBaixa > 10) {
      resultado.push({
        id: 'correlacao-classe-politica',
        tipo: 'correlacao',
        titulo: 'Correlação Classe x Orientação',
        descricao: direitaAlta > esquerdaBaixa
          ? 'Tendência de classes altas à direita nesta amostra.'
          : 'Tendência de classes baixas à esquerda nesta amostra.',
        importancia: 'baixa',
      });
    }

    // Ordenar por importância
    const ordemImportancia = { alta: 0, media: 1, baixa: 2 };
    resultado.sort((a, b) => ordemImportancia[a.importancia] - ordemImportancia[b.importancia]);

    return resultado.slice(0, maxInsights);
  }, [eleitores, maxInsights]);

  const insightsVisiveis = expandido ? insights : insights.slice(0, 4);

  const iconesPorTipo: Record<string, typeof Lightbulb> = {
    destaque: Sparkles,
    alerta: AlertTriangle,
    tendencia: TrendingUp,
    oportunidade: Target,
    correlacao: TrendingDown,
  };

  const coresPorTipo: Record<string, { bg: string; text: string; border: string }> = {
    destaque: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/50' },
    alerta: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50' },
    tendencia: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/50' },
    oportunidade: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/50' },
    correlacao: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/50' },
  };

  const coresPorImportancia: Record<string, string> = {
    alta: 'bg-red-500',
    media: 'bg-amber-500',
    baixa: 'bg-green-500',
  };

  if (insights.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Insights Automáticos</h3>
            <p className="text-sm text-muted-foreground">Nenhum insight gerado para esta amostra</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Insights Automáticos</h3>
            <p className="text-sm text-muted-foreground">
              {insights.length} insights gerados a partir dos dados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            <Users className="w-3 h-3 inline mr-1" />
            {eleitores.length} eleitores
          </span>
        </div>
      </div>

      {/* Lista de Insights */}
      <div className="space-y-3">
        {insightsVisiveis.map((insight) => {
          const Icone = iconesPorTipo[insight.tipo];
          const cores = coresPorTipo[insight.tipo];

          return (
            <div
              key={insight.id}
              className={cn(
                'p-4 rounded-lg border transition-all hover:shadow-md',
                cores.bg,
                cores.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cores.bg)}>
                  <Icone className={cn('w-4 h-4', cores.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{insight.titulo}</h4>
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      coresPorImportancia[insight.importancia]
                    )} title={`Importância ${insight.importancia}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                </div>

                {insight.valor && (
                  <div className={cn('text-right flex-shrink-0', cores.text)}>
                    <span className="text-lg font-bold">{insight.valor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão expandir */}
      {insights.length > 4 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expandido ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver todos os {insights.length} insights
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default InsightsPanel;
