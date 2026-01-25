'use client';

import { useMemo } from 'react';
import {
  Lightbulb,
  User,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  BarChart2,
  PieChart,
  Shuffle,
  Award,
  ThumbsUp,
  ThumbsDown,
  Scale,
  Brain,
  Users,
  Sparkles,
} from 'lucide-react';
import type { Eleitor } from '@/types';

interface AgentesInsightsProps {
  eleitores: Eleitor[];
  eleitoresFiltrados: Eleitor[];
}

// Função para encontrar o valor mais frequente
function moda(arr: string[]): string {
  const frequencia: Record<string, number> = {};
  let maxFreq = 0;
  let resultado = '';

  arr.forEach((item) => {
    if (!item || item === 'undefined') return;
    frequencia[item] = (frequencia[item] || 0) + 1;
    if (frequencia[item] > maxFreq) {
      maxFreq = frequencia[item];
      resultado = item;
    }
  });

  return resultado;
}

// Labels amigáveis
const LABELS: Record<string, Record<string, string>> = {
  cluster: {
    G1_alta: 'classe alta',
    G2_media_alta: 'classe média-alta',
    G3_media_baixa: 'classe média-baixa',
    G4_baixa: 'classe baixa',
  },
  orientacao: {
    esquerda: 'esquerda',
    'centro-esquerda': 'centro-esquerda',
    centro: 'centro',
    'centro-direita': 'centro-direita',
    direita: 'direita',
  },
  ocupacao: {
    clt: 'trabalhador CLT',
    servidor_publico: 'servidor público',
    autonomo: 'autônomo',
    empresario: 'empresário',
    informal: 'trabalhador informal',
    desempregado: 'desempregado',
    aposentado: 'aposentado',
    estudante: 'estudante',
  },
  escolaridade: {
    fundamental_incompleto: 'fundamental incompleto',
    fundamental_completo: 'fundamental completo',
    medio_incompleto: 'médio incompleto',
    medio_completo_ou_sup_incompleto: 'médio completo',
    superior_completo_ou_pos: 'superior completo',
  },
  bolsonaro: {
    apoiador_forte: 'apoiador forte de Bolsonaro',
    apoiador_moderado: 'apoiador moderado de Bolsonaro',
    neutro: 'neutro em relação a Bolsonaro',
    critico_moderado: 'crítico moderado de Bolsonaro',
    critico_forte: 'crítico forte de Bolsonaro',
  },
  interesse: {
    baixo: 'baixo interesse político',
    medio: 'médio interesse político',
    alto: 'alto interesse político',
  },
  decisao: {
    identitario: 'identitário',
    pragmatico: 'pragmático',
    moral: 'moral',
    economico: 'econômico',
    emocional: 'emocional',
  },
};

// Card de insight
function InsightCard({
  titulo,
  conteudo,
  icone: Icone,
  corIcone,
  tipo = 'info',
}: {
  titulo: string;
  conteudo: React.ReactNode;
  icone: React.ElementType;
  corIcone: string;
  tipo?: 'info' | 'warning' | 'success' | 'highlight';
}) {
  const bordaCor = {
    info: 'border-blue-500/30',
    warning: 'border-amber-500/30',
    success: 'border-green-500/30',
    highlight: 'border-purple-500/30',
  };

  return (
    <div className={`glass-card rounded-xl p-5 border-l-4 ${bordaCor[tipo]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${corIcone} flex items-center justify-center flex-shrink-0`}>
          <Icone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">{titulo}</h4>
          <div className="text-sm text-muted-foreground mt-1">{conteudo}</div>
        </div>
      </div>
    </div>
  );
}

// Card de cruzamento
function CruzamentoCard({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { label: string; valor: number; percentual: string; cor: string }[];
}) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="glass-card rounded-xl p-4">
      <h4 className="font-semibold text-foreground text-sm mb-3">{titulo}</h4>
      <div className="space-y-2">
        {dados.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground font-medium">{item.percentual}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.valor / total) * 100}%`,
                    backgroundColor: item.cor,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentesInsights({ eleitores, eleitoresFiltrados }: AgentesInsightsProps) {
  // Calcular insights
  const insights = useMemo(() => {
    if (eleitoresFiltrados.length === 0) return null;

    const total = eleitoresFiltrados.length;
    const totalGeral = eleitores.length;

    // Características predominantes
    const generoModa = moda(eleitoresFiltrados.map((e) => e.genero));
    const clusterModa = moda(eleitoresFiltrados.map((e) => e.cluster_socioeconomico));
    const orientacaoModa = moda(eleitoresFiltrados.map((e) => e.orientacao_politica));
    const religiaoModa = moda(eleitoresFiltrados.map((e) => e.religiao));
    const ocupacaoModa = moda(eleitoresFiltrados.map((e) => e.ocupacao_vinculo));
    const escolaridadeModa = moda(eleitoresFiltrados.map((e) => e.escolaridade));
    const bolsonaroModa = moda(eleitoresFiltrados.map((e) => e.posicao_bolsonaro));
    const interesseModa = moda(eleitoresFiltrados.map((e) => e.interesse_politico));
    const decisaoModa = moda(eleitoresFiltrados.map((e) => e.estilo_decisao || '').filter(Boolean));
    const regiaoModa = moda(eleitoresFiltrados.map((e) => e.regiao_administrativa));

    // Médias
    const mediaIdade = eleitoresFiltrados.reduce((acc, e) => acc + e.idade, 0) / total;
    const mediaSuscept = eleitoresFiltrados.reduce((acc, e) => acc + (e.susceptibilidade_desinformacao || 0), 0) / total;

    // Percentuais
    const percFilhos = (eleitoresFiltrados.filter((e) => e.filhos > 0).length / total) * 100;
    const percVotoFacult = (eleitoresFiltrados.filter((e) => e.voto_facultativo).length / total) * 100;
    const percConflito = (eleitoresFiltrados.filter((e) => e.conflito_identitario).length / total) * 100;

    // Contagens para cruzamentos
    const porOrientacao: Record<string, number> = {};
    const porCluster: Record<string, number> = {};
    const porBolsonaro: Record<string, number> = {};

    eleitoresFiltrados.forEach((e) => {
      porOrientacao[e.orientacao_politica] = (porOrientacao[e.orientacao_politica] || 0) + 1;
      porCluster[e.cluster_socioeconomico] = (porCluster[e.cluster_socioeconomico] || 0) + 1;
      porBolsonaro[e.posicao_bolsonaro] = (porBolsonaro[e.posicao_bolsonaro] || 0) + 1;
    });

    // Cruzamento: Orientação x Cluster
    const cruzOrientacaoCluster: Record<string, Record<string, number>> = {};
    eleitoresFiltrados.forEach((e) => {
      if (!cruzOrientacaoCluster[e.orientacao_politica]) {
        cruzOrientacaoCluster[e.orientacao_politica] = {};
      }
      cruzOrientacaoCluster[e.orientacao_politica][e.cluster_socioeconomico] =
        (cruzOrientacaoCluster[e.orientacao_politica][e.cluster_socioeconomico] || 0) + 1;
    });

    // Valores e preocupações mais comuns
    const valoresCount: Record<string, number> = {};
    const preocupacoesCount: Record<string, number> = {};

    eleitoresFiltrados.forEach((e) => {
      e.valores?.forEach((v) => {
        valoresCount[v] = (valoresCount[v] || 0) + 1;
      });
      e.preocupacoes?.forEach((p) => {
        preocupacoesCount[p] = (preocupacoesCount[p] || 0) + 1;
      });
    });

    const topValores = Object.entries(valoresCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([v]) => v);

    const topPreocupacoes = Object.entries(preocupacoesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p);

    // Fontes de informação dominantes
    const fontesCount: Record<string, number> = {};
    eleitoresFiltrados.forEach((e) => {
      e.fontes_informacao?.forEach((f) => {
        fontesCount[f] = (fontesCount[f] || 0) + 1;
      });
    });
    const topFontes = Object.entries(fontesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([f]) => f);

    // Análise de polarização
    const esquerda = (porOrientacao['esquerda'] || 0) + (porOrientacao['centro-esquerda'] || 0);
    const direita = (porOrientacao['direita'] || 0) + (porOrientacao['centro-direita'] || 0);
    const centro = porOrientacao['centro'] || 0;
    const polarizacao = Math.abs(esquerda - direita) / total;
    const isPolarizado = polarizacao > 0.3;

    // Análise de Bolsonaro
    const apoiadores = (porBolsonaro['apoiador_forte'] || 0) + (porBolsonaro['apoiador_moderado'] || 0);
    const criticos = (porBolsonaro['critico_forte'] || 0) + (porBolsonaro['critico_moderado'] || 0);
    const neutros = porBolsonaro['neutro'] || 0;

    // Gerar persona
    const genero = generoModa === 'masculino' ? 'Homem' : 'Mulher';
    const idadeArredondada = Math.round(mediaIdade);
    const clusterLabel = LABELS.cluster[clusterModa] || clusterModa;
    const ocupacaoLabel = LABELS.ocupacao[ocupacaoModa] || ocupacaoModa;
    const escolaridadeLabel = LABELS.escolaridade[escolaridadeModa] || escolaridadeModa;
    const orientacaoLabel = LABELS.orientacao[orientacaoModa] || orientacaoModa;
    const bolsonaroLabel = LABELS.bolsonaro[bolsonaroModa] || bolsonaroModa;
    const interesseLabel = LABELS.interesse[interesseModa] || interesseModa;
    const decisaoLabel = LABELS.decisao[decisaoModa] || decisaoModa;

    const persona = {
      titulo: `${genero}, ${idadeArredondada} anos, ${regiaoModa}`,
      descricao: `${ocupacaoLabel} de ${clusterLabel}, com ${escolaridadeLabel}. Politicamente de ${orientacaoLabel}, ${bolsonaroLabel}. Tem ${interesseLabel} e toma decisões de forma ${decisaoLabel}.`,
      valores: topValores.join(', '),
      preocupacoes: topPreocupacoes.join(', '),
      fontes: topFontes.join(', '),
    };

    return {
      total,
      totalGeral,
      mediaIdade,
      mediaSuscept,
      percFilhos,
      percVotoFacult,
      percConflito,
      generoModa,
      clusterModa,
      orientacaoModa,
      religiaoModa,
      ocupacaoModa,
      escolaridadeModa,
      bolsonaroModa,
      interesseModa,
      decisaoModa,
      regiaoModa,
      topValores,
      topPreocupacoes,
      topFontes,
      porOrientacao,
      porCluster,
      porBolsonaro,
      esquerda,
      direita,
      centro,
      isPolarizado,
      apoiadores,
      criticos,
      neutros,
      persona,
    };
  }, [eleitores, eleitoresFiltrados]);

  if (!insights || insights.total === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Selecione alguns filtros para ver insights sobre os eleitores.
        </p>
      </div>
    );
  }

  // Dados para cruzamentos
  const dadosOrientacao = [
    { label: 'Esquerda/Centro-Esq', valor: insights.esquerda, percentual: ((insights.esquerda / insights.total) * 100).toFixed(1), cor: '#ef4444' },
    { label: 'Centro', valor: insights.centro, percentual: ((insights.centro / insights.total) * 100).toFixed(1), cor: '#a855f7' },
    { label: 'Direita/Centro-Dir', valor: insights.direita, percentual: ((insights.direita / insights.total) * 100).toFixed(1), cor: '#3b82f6' },
  ];

  const dadosBolsonaro = [
    { label: 'Apoiadores', valor: insights.apoiadores, percentual: ((insights.apoiadores / insights.total) * 100).toFixed(1), cor: '#22c55e' },
    { label: 'Neutros', valor: insights.neutros, percentual: ((insights.neutros / insights.total) * 100).toFixed(1), cor: '#94a3b8' },
    { label: 'Críticos', valor: insights.criticos, percentual: ((insights.criticos / insights.total) * 100).toFixed(1), cor: '#ef4444' },
  ];

  const dadosCluster = [
    { label: 'Alta', valor: insights.porCluster['G1_alta'] || 0, percentual: (((insights.porCluster['G1_alta'] || 0) / insights.total) * 100).toFixed(1), cor: '#22c55e' },
    { label: 'Média-Alta', valor: insights.porCluster['G2_media_alta'] || 0, percentual: (((insights.porCluster['G2_media_alta'] || 0) / insights.total) * 100).toFixed(1), cor: '#84cc16' },
    { label: 'Média-Baixa', valor: insights.porCluster['G3_media_baixa'] || 0, percentual: (((insights.porCluster['G3_media_baixa'] || 0) / insights.total) * 100).toFixed(1), cor: '#eab308' },
    { label: 'Baixa', valor: insights.porCluster['G4_baixa'] || 0, percentual: (((insights.porCluster['G4_baixa'] || 0) / insights.total) * 100).toFixed(1), cor: '#f97316' },
  ];

  return (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      {/* Header */}
      <div className="flex items-center gap-3 sticky top-0 bg-background pb-2 z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Insights Inteligentes</h2>
          <p className="text-xs text-muted-foreground">
            Análise de {insights.total} eleitores ({((insights.total / insights.totalGeral) * 100).toFixed(0)}% do total)
          </p>
        </div>
      </div>

      {/* Persona do Eleitor Típico */}
      <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Perfil do Eleitor Típico</h3>
        </div>
        <div className="space-y-3">
          <p className="text-lg font-medium text-foreground">{insights.persona.titulo}</p>
          <p className="text-sm text-muted-foreground">{insights.persona.descricao}</p>
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
            <div className="flex items-start gap-2">
              <ThumbsUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Valores:</span> {insights.persona.valores}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Preocupações:</span> {insights.persona.preocupacoes}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Se informa por:</span> {insights.persona.fontes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Automáticos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Descobertas Automáticas
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Insight de Polarização */}
          <InsightCard
            titulo={insights.isPolarizado ? 'Grupo Polarizado' : 'Grupo Equilibrado'}
            conteudo={
              insights.isPolarizado
                ? `Este grupo está politicamente polarizado, com ${((insights.esquerda / insights.total) * 100).toFixed(0)}% à esquerda e ${((insights.direita / insights.total) * 100).toFixed(0)}% à direita.`
                : `Este grupo tem distribuição política equilibrada, com representatividade em todo o espectro ideológico.`
            }
            icone={Scale}
            corIcone={insights.isPolarizado ? 'bg-red-500' : 'bg-green-500'}
            tipo={insights.isPolarizado ? 'warning' : 'success'}
          />

          {/* Insight de Susceptibilidade */}
          <InsightCard
            titulo="Vulnerabilidade à Desinformação"
            conteudo={
              insights.mediaSuscept > 5
                ? `Alta susceptibilidade (média ${insights.mediaSuscept.toFixed(1)}/10). Recomenda-se comunicação clara e fact-checking.`
                : `Susceptibilidade moderada a baixa (média ${insights.mediaSuscept.toFixed(1)}/10). Grupo mais resistente a fake news.`
            }
            icone={Brain}
            corIcone={insights.mediaSuscept > 5 ? 'bg-orange-500' : 'bg-blue-500'}
            tipo={insights.mediaSuscept > 5 ? 'warning' : 'info'}
          />

          {/* Insight de Voto Facultativo */}
          {insights.percVotoFacult > 10 && (
            <InsightCard
              titulo="Atenção: Voto Facultativo"
              conteudo={`${insights.percVotoFacult.toFixed(0)}% deste grupo tem voto facultativo (jovens 16-17 ou idosos 70+). Estratégias de mobilização podem ser necessárias.`}
              icone={Target}
              corIcone="bg-purple-500"
              tipo="highlight"
            />
          )}

          {/* Insight de Conflito Identitário */}
          {insights.percConflito > 20 && (
            <InsightCard
              titulo="Eleitores Indecisos"
              conteudo={`${insights.percConflito.toFixed(0)}% apresenta conflito identitário - podem mudar de opinião. São alvos estratégicos para campanhas.`}
              icone={Shuffle}
              corIcone="bg-fuchsia-500"
              tipo="highlight"
            />
          )}

          {/* Insight de Perfil Familiar */}
          <InsightCard
            titulo="Perfil Familiar"
            conteudo={
              insights.percFilhos > 60
                ? `Maioria tem filhos (${insights.percFilhos.toFixed(0)}%). Temas como educação, saúde infantil e segurança tendem a ressoar.`
                : `${(100 - insights.percFilhos).toFixed(0)}% não tem filhos. Temas como carreira, mobilidade e lazer podem ser mais relevantes.`
            }
            icone={Users}
            corIcone="bg-pink-500"
            tipo="info"
          />

          {/* Insight de Ocupação */}
          <InsightCard
            titulo={`Maioria: ${LABELS.ocupacao[insights.ocupacaoModa] || insights.ocupacaoModa}`}
            conteudo={
              insights.ocupacaoModa === 'servidor_publico'
                ? 'Servidores públicos são sensíveis a reformas administrativas e estabilidade do emprego.'
                : insights.ocupacaoModa === 'clt'
                ? 'Trabalhadores CLT se preocupam com direitos trabalhistas, salário mínimo e emprego.'
                : insights.ocupacaoModa === 'autonomo'
                ? 'Autônomos valorizam menos burocracia, menos impostos e facilidade para empreender.'
                : `O grupo é predominantemente de ${LABELS.ocupacao[insights.ocupacaoModa] || insights.ocupacaoModa}s.`
            }
            icone={Award}
            corIcone="bg-violet-500"
            tipo="info"
          />
        </div>
      </div>

      {/* Cruzamentos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          Análise de Cruzamentos
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CruzamentoCard titulo="Espectro Político" dados={dadosOrientacao} />
          <CruzamentoCard titulo="Posição Bolsonaro" dados={dadosBolsonaro} />
          <CruzamentoCard titulo="Classe Social" dados={dadosCluster} />
        </div>
      </div>

      {/* Recomendações */}
      <div className="glass-card rounded-xl p-5 border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-foreground">Recomendações Estratégicas</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Canal:</strong> Priorize {insights.topFontes[0]} e {insights.topFontes[1]} para alcançar este público.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Pauta:</strong> Aborde {insights.topPreocupacoes[0]} e {insights.topPreocupacoes[1]} como temas centrais.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Tom:</strong> {
                insights.decisaoModa === 'economico' ? 'Use argumentos práticos e dados sobre impacto financeiro.' :
                insights.decisaoModa === 'emocional' ? 'Apele para histórias pessoais e conexão emocional.' :
                insights.decisaoModa === 'moral' ? 'Enfatize valores éticos e justiça social.' :
                insights.decisaoModa === 'identitario' ? 'Reforce pertencimento e identidade de grupo.' :
                'Seja pragmático e apresente soluções concretas.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Região:</strong> Concentre esforços em {insights.regiaoModa}, onde está a maior parte do público-alvo.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
