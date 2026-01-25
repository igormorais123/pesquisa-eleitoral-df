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
  Scale,
  Brain,
  Users,
  Sparkles,
  ThumbsUp,
  Building2,
  Award,
  Briefcase,
  Clock,
  Compass,
  Heart,
  Layers,
  MapPin,
  Settings,
  GraduationCap,
} from 'lucide-react';
import type { Gestor } from '@/types';

interface GestoresInsightsProps {
  gestores: Gestor[];
}

// Funcao para encontrar o valor mais frequente
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

// Labels amigaveis
const LABELS: Record<string, Record<string, string>> = {
  setor: {
    publico: 'setor publico',
    privado: 'setor privado',
  },
  nivel_hierarquico: {
    estrategico: 'nivel estrategico',
    tatico: 'nivel tatico',
    operacional: 'nivel operacional',
  },
  estilo_lideranca: {
    transformacional: 'transformacional',
    transacional: 'transacional',
    democratico: 'democratico',
    autoritario: 'autoritario',
    laissez_faire: 'laissez-faire',
    servical: 'servical',
    tecnico: 'tecnico',
    coaching: 'coaching',
    visionario: 'visionario',
    coordenativo: 'coordenativo',
  },
  area_atuacao: {
    gestao_pessoas: 'gestao de pessoas',
    financeiro_orcamento: 'area financeira',
    juridico: 'area juridica',
    tecnologia_informacao: 'tecnologia',
    infraestrutura_obras: 'infraestrutura',
    saude: 'saude',
    educacao: 'educacao',
    avaliacao_monitoramento: 'avaliacao',
    licitacoes_contratos: 'licitacoes',
    comunicacao: 'comunicacao',
    operacoes: 'operacoes',
    comercial_vendas: 'comercial',
    marketing: 'marketing',
    estrategia: 'estrategia',
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
                    width: `${total > 0 ? (item.valor / total) * 100 : 0}%`,
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

export function GestoresInsights({ gestores }: GestoresInsightsProps) {
  // Calcular insights
  const insights = useMemo(() => {
    if (gestores.length === 0) return null;

    const total = gestores.length;

    // Caracteristicas predominantes
    const generoModa = moda(gestores.map((g) => g.genero));
    const setorModa = moda(gestores.map((g) => g.setor));
    const nivelModa = moda(gestores.map((g) => g.nivel_hierarquico));
    const areaModa = moda(gestores.map((g) => g.area_atuacao));
    const estiloModa = moda(gestores.map((g) => g.estilo_lideranca));
    const localizacaoModa = moda(gestores.map((g) => g.localizacao));
    const regiaoModa = moda(gestores.map((g) => g.regiao || '').filter(Boolean));

    // Medias
    const mediaIdade = gestores.reduce((acc, g) => acc + g.idade, 0) / total;

    let somaPODC_P = 0, somaPODC_O = 0, somaPODC_D = 0, somaPODC_C = 0, contPODC = 0;
    let somaEquipe = 0, contEquipe = 0;

    gestores.forEach((g) => {
      if (g.distribuicao_podc) {
        somaPODC_P += g.distribuicao_podc.planejar;
        somaPODC_O += g.distribuicao_podc.organizar;
        somaPODC_D += g.distribuicao_podc.dirigir;
        somaPODC_C += g.distribuicao_podc.controlar;
        contPODC++;
      }
      if (g.tamanho_equipe !== undefined) { somaEquipe += g.tamanho_equipe; contEquipe++; }
    });

    const mediaPODC = contPODC > 0 ? {
      planejar: somaPODC_P / contPODC,
      organizar: somaPODC_O / contPODC,
      dirigir: somaPODC_D / contPODC,
      controlar: somaPODC_C / contPODC,
    } : null;

    const mediaEquipe = contEquipe > 0 ? somaEquipe / contEquipe : 0;

    // Contagens
    const porSetor: Record<string, number> = {};
    const porNivel: Record<string, number> = {};

    gestores.forEach((g) => {
      porSetor[g.setor] = (porSetor[g.setor] || 0) + 1;
      porNivel[g.nivel_hierarquico] = (porNivel[g.nivel_hierarquico] || 0) + 1;
    });

    // Listas mais comuns
    const desafiosCount: Record<string, number> = {};
    const competenciasCount: Record<string, number> = {};
    const motivacoesCount: Record<string, number> = {};
    const frustracoesCount: Record<string, number> = {};
    const formacoesCount: Record<string, number> = {};

    gestores.forEach((g) => {
      g.desafios_cotidianos?.forEach((d) => { desafiosCount[d] = (desafiosCount[d] || 0) + 1; });
      g.competencias_distintivas?.forEach((c) => { competenciasCount[c] = (competenciasCount[c] || 0) + 1; });
      g.motivacoes?.forEach((m) => { motivacoesCount[m] = (motivacoesCount[m] || 0) + 1; });
      g.frustracoes?.forEach((f) => { frustracoesCount[f] = (frustracoesCount[f] || 0) + 1; });
      g.formacao_academica?.forEach((fo) => { formacoesCount[fo] = (formacoesCount[fo] || 0) + 1; });
    });

    const topDesafios = Object.entries(desafiosCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);
    const topCompetencias = Object.entries(competenciasCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    const topMotivacoes = Object.entries(motivacoesCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);
    const topFrustracoes = Object.entries(frustracoesCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f);
    const topFormacoes = Object.entries(formacoesCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f]) => f);

    // Gerar persona
    const genero = generoModa === 'masculino' ? 'Homem' : 'Mulher';
    const idadeArredondada = Math.round(mediaIdade);
    const setorLabel = LABELS.setor[setorModa] || setorModa;
    const nivelLabel = LABELS.nivel_hierarquico[nivelModa] || nivelModa;
    const areaLabel = LABELS.area_atuacao[areaModa] || areaModa;
    const estiloLabel = LABELS.estilo_lideranca[estiloModa] || estiloModa;

    const persona = {
      titulo: `${genero}, ${idadeArredondada} anos, ${localizacaoModa}`,
      descricao: `Gestor do ${setorLabel}, em ${nivelLabel}, atuando na area de ${areaLabel}. Estilo de lideranca ${estiloLabel}. ${mediaEquipe > 0 ? `Gerencia em media ${Math.round(mediaEquipe)} pessoas.` : ''}`,
      formacoes: topFormacoes.join(', ') || 'Nao informado',
      competencias: topCompetencias.join(', ') || 'Nao informado',
      desafios: topDesafios.join(', ') || 'Nao informado',
      motivacoes: topMotivacoes.join(', ') || 'Nao informado',
    };

    return {
      total,
      mediaIdade,
      mediaPODC,
      mediaEquipe,
      generoModa,
      setorModa,
      nivelModa,
      areaModa,
      estiloModa,
      localizacaoModa,
      regiaoModa,
      porSetor,
      porNivel,
      topDesafios,
      topCompetencias,
      topMotivacoes,
      topFrustracoes,
      topFormacoes,
      persona,
    };
  }, [gestores]);

  if (!insights || insights.total === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Selecione alguns filtros para ver insights sobre os gestores.
        </p>
      </div>
    );
  }

  // Dados para cruzamentos
  const dadosSetor = [
    { label: 'Setor Publico', valor: insights.porSetor['publico'] || 0, percentual: (((insights.porSetor['publico'] || 0) / insights.total) * 100).toFixed(1), cor: '#3b82f6' },
    { label: 'Setor Privado', valor: insights.porSetor['privado'] || 0, percentual: (((insights.porSetor['privado'] || 0) / insights.total) * 100).toFixed(1), cor: '#10b981' },
  ];

  const dadosNivel = [
    { label: 'Estrategico', valor: insights.porNivel['estrategico'] || 0, percentual: (((insights.porNivel['estrategico'] || 0) / insights.total) * 100).toFixed(1), cor: '#8b5cf6' },
    { label: 'Tatico', valor: insights.porNivel['tatico'] || 0, percentual: (((insights.porNivel['tatico'] || 0) / insights.total) * 100).toFixed(1), cor: '#f59e0b' },
    { label: 'Operacional', valor: insights.porNivel['operacional'] || 0, percentual: (((insights.porNivel['operacional'] || 0) / insights.total) * 100).toFixed(1), cor: '#06b6d4' },
  ];

  const dadosPODC = insights.mediaPODC ? [
    { label: 'Planejar', valor: insights.mediaPODC.planejar, percentual: insights.mediaPODC.planejar.toFixed(1), cor: '#3b82f6' },
    { label: 'Organizar', valor: insights.mediaPODC.organizar, percentual: insights.mediaPODC.organizar.toFixed(1), cor: '#10b981' },
    { label: 'Dirigir', valor: insights.mediaPODC.dirigir, percentual: insights.mediaPODC.dirigir.toFixed(1), cor: '#f59e0b' },
    { label: 'Controlar', valor: insights.mediaPODC.controlar, percentual: insights.mediaPODC.controlar.toFixed(1), cor: '#ec4899' },
  ] : [];

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
            Análise de {insights.total} gestores selecionados
          </p>
        </div>
      </div>

      {/* Persona do Gestor Tipico */}
      <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Perfil do Gestor Tipico</h3>
        </div>
        <div className="space-y-3">
          <p className="text-lg font-medium text-foreground">{insights.persona.titulo}</p>
          <p className="text-sm text-muted-foreground">{insights.persona.descricao}</p>
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Formacao:</span> {insights.persona.formacoes}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Competencias:</span> {insights.persona.competencias}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Desafios:</span> {insights.persona.desafios}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Motivacoes:</span> {insights.persona.motivacoes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metricas Chave */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{Math.round(insights.mediaEquipe)}</p>
          <p className="text-xs text-muted-foreground">Equipe media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{insights.mediaIdade.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Idade media</p>
        </div>
        {insights.mediaPODC && (
          <>
            <div className="glass-card rounded-xl p-4 text-center">
              <Compass className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{insights.mediaPODC.planejar.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Tempo Planejar</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Settings className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{insights.mediaPODC.dirigir.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Tempo Dirigir</p>
            </div>
          </>
        )}
      </div>

      {/* Insights Automaticos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Descobertas Automaticas
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Insight de Setor */}
          <InsightCard
            titulo={insights.setorModa === 'publico' ? 'Predominancia Setor Publico' : 'Predominancia Setor Privado'}
            conteudo={
              insights.setorModa === 'publico'
                ? `${(((insights.porSetor['publico'] || 0) / insights.total) * 100).toFixed(0)}% sao gestores publicos. Considere aspectos de burocracia, licitacoes e legislacao especifica.`
                : `${(((insights.porSetor['privado'] || 0) / insights.total) * 100).toFixed(0)}% sao gestores do setor privado. Foco em resultados, competitividade e inovacao.`
            }
            icone={Building2}
            corIcone={insights.setorModa === 'publico' ? 'bg-blue-500' : 'bg-green-500'}
            tipo="info"
          />

          {/* Insight de Nivel */}
          <InsightCard
            titulo={`Nivel Predominante: ${LABELS.nivel_hierarquico[insights.nivelModa] || insights.nivelModa}`}
            conteudo={
              insights.nivelModa === 'estrategico'
                ? 'Gestores estrategicos focam em visao de longo prazo, planejamento e decisoes de alto impacto.'
                : insights.nivelModa === 'tatico'
                ? 'Gestores taticos fazem a ponte entre estrategia e operacao, coordenando equipes e projetos.'
                : 'Gestores operacionais focam na execucao diaria, supervisao direta e resolucao de problemas imediatos.'
            }
            icone={Layers}
            corIcone="bg-purple-500"
            tipo="info"
          />

          {/* Insight de Estilo de Lideranca */}
          <InsightCard
            titulo={`Estilo de Lideranca: ${LABELS.estilo_lideranca[insights.estiloModa] || insights.estiloModa}`}
            conteudo={
              insights.estiloModa === 'transformacional'
                ? 'Lideranca transformacional inspira mudancas e motiva equipes a superar expectativas.'
                : insights.estiloModa === 'democratico'
                ? 'Lideranca democratica valoriza participacao da equipe nas decisoes.'
                : insights.estiloModa === 'tecnico'
                ? 'Lideranca tecnica baseia-se em conhecimento especializado e competencia.'
                : `Estilo ${LABELS.estilo_lideranca[insights.estiloModa] || insights.estiloModa} predominante no grupo.`
            }
            icone={Award}
            corIcone="bg-violet-500"
            tipo="info"
          />

          {/* Insight de PODC */}
          {insights.mediaPODC && (
            <InsightCard
              titulo="Distribuicao de Tempo (PODC)"
              conteudo={`Em media: ${insights.mediaPODC.planejar.toFixed(0)}% planejando, ${insights.mediaPODC.organizar.toFixed(0)}% organizando, ${insights.mediaPODC.dirigir.toFixed(0)}% dirigindo, ${insights.mediaPODC.controlar.toFixed(0)}% controlando. ${
                insights.mediaPODC.dirigir > 40
                  ? 'Alto foco em direcao de equipes.'
                  : insights.mediaPODC.planejar > 30
                  ? 'Perfil mais estrategico com foco em planejamento.'
                  : 'Distribuicao equilibrada de atividades gerenciais.'
              }`}
              icone={Compass}
              corIcone="bg-cyan-500"
              tipo="highlight"
            />
          )}

          {/* Insight de Desafios */}
          {insights.topDesafios.length > 0 && (
            <InsightCard
              titulo="Principais Desafios"
              conteudo={`Os desafios mais comuns sao: ${insights.topDesafios.join(', ')}. Desenvolver solucoes para esses pontos pode gerar alto impacto.`}
              icone={Target}
              corIcone="bg-red-500"
              tipo="warning"
            />
          )}

          {/* Insight de Frustracoes */}
          {insights.topFrustracoes.length > 0 && (
            <InsightCard
              titulo="Pontos de Atencao"
              conteudo={`Frustracoes recorrentes: ${insights.topFrustracoes.join(', ')}. Enderecá-las pode melhorar engajamento e produtividade.`}
              icone={AlertTriangle}
              corIcone="bg-orange-500"
              tipo="warning"
            />
          )}
        </div>
      </div>

      {/* Cruzamentos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          Analise de Cruzamentos
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CruzamentoCard titulo="Distribuicao por Setor" dados={dadosSetor} />
          <CruzamentoCard titulo="Nivel Hierarquico" dados={dadosNivel} />
          {dadosPODC.length > 0 && (
            <div className="lg:col-span-2">
              <CruzamentoCard titulo="Distribuicao PODC (Media %)" dados={dadosPODC} />
            </div>
          )}
        </div>
      </div>

      {/* Recomendacoes Estrategicas */}
      <div className="glass-card rounded-xl p-5 border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-foreground">Recomendacoes Estrategicas</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Area de atuacao:</strong> {LABELS.area_atuacao[insights.areaModa] || insights.areaModa} e a area predominante. Adapte comunicacao a esse contexto.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Competencias valorizadas:</strong> {insights.topCompetencias.join(', ') || 'Variadas'}. Destaque essas habilidades em propostas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Abordagem:</strong> {
                insights.nivelModa === 'estrategico' ? 'Foque em visao de longo prazo e impacto estrategico.' :
                insights.nivelModa === 'tatico' ? 'Apresente solucoes praticas com metricas claras.' :
                'Enfatize eficiencia operacional e resultados imediatos.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Localizacao:</strong> {insights.localizacaoModa} concentra a maior parte do grupo. Considere aspectos regionais.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
