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
  ThumbsDown,
  Building2,
  Shield,
  Award,
  Vote,
  DollarSign,
  FileText,
  Globe,
  MessageSquare,
  Landmark,
  ShieldCheck,
  Star,
  Gavel,
} from 'lucide-react';
import type { Parlamentar } from '@/types';

interface ParlamentaresInsightsProps {
  parlamentares: Parlamentar[];
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
  orientacao: {
    esquerda: 'esquerda',
    'centro-esquerda': 'centro-esquerda',
    centro: 'centro',
    'centro-direita': 'centro-direita',
    direita: 'direita',
  },
  bolsonaro: {
    apoiador_forte: 'apoiador forte de Bolsonaro',
    apoiador_moderado: 'apoiador moderado de Bolsonaro',
    neutro: 'neutro em relacao a Bolsonaro',
    critico_moderado: 'critico moderado de Bolsonaro',
    critico_forte: 'critico forte de Bolsonaro',
    opositor_forte: 'opositor forte de Bolsonaro',
    opositor_moderado: 'opositor moderado de Bolsonaro',
  },
  lula: {
    apoiador_forte: 'apoiador forte de Lula',
    apoiador_moderado: 'apoiador moderado de Lula',
    neutro: 'neutro em relacao a Lula',
    critico_moderado: 'critico moderado de Lula',
    critico_forte: 'critico forte de Lula',
    opositor_forte: 'opositor forte de Lula',
    opositor_moderado: 'opositor moderado de Lula',
  },
  relacao_governo: {
    base_aliada: 'da base aliada',
    independente: 'independente',
    oposicao_moderada: 'da oposicao moderada',
    oposicao_forte: 'da oposicao forte',
  },
  casa: {
    camara_federal: 'Camara Federal',
    senado: 'Senado',
    cldf: 'CLDF',
  },
  estilo_comunicacao: {
    combativo: 'combativo',
    articulado: 'articulado',
    popular: 'popular',
    tecnico: 'tecnico',
    religioso: 'religioso',
    emotivo: 'emotivo',
    institucional: 'institucional',
    conservador: 'conservador',
    pragmatico: 'pragmatico',
    didatico: 'didatico',
    militante: 'militante',
    sindicalista: 'sindicalista',
    assertivo: 'assertivo',
    autoritario: 'autoritario',
    conciliador: 'conciliador',
    digital: 'digital',
    firme: 'firme',
  },
  estilo_decisao: {
    identitario: 'identitario',
    pragmatico: 'pragmatico',
    moral: 'moral',
    economico: 'economico',
    emocional: 'emocional',
  },
  capital_politico: {
    baixo: 'baixo',
    medio: 'medio',
    alto: 'alto',
    muito_alto: 'muito alto',
  },
  motivacao: {
    ideologia: 'ideologia',
    poder: 'busca por poder',
    servico: 'servico publico',
    fama: 'fama',
    dinheiro: 'interesse financeiro',
    corporativismo: 'corporativismo',
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

export function ParlamentaresInsights({ parlamentares }: ParlamentaresInsightsProps) {
  // Calcular insights
  const insights = useMemo(() => {
    if (parlamentares.length === 0) return null;

    const total = parlamentares.length;

    // Caracteristicas predominantes
    const generoModa = moda(parlamentares.map((p) => p.genero));
    const casaModa = moda(parlamentares.map((p) => p.casa_legislativa));
    const partidoModa = moda(parlamentares.map((p) => p.partido));
    const ufModa = moda(parlamentares.map((p) => p.uf));
    const orientacaoModa = moda(parlamentares.map((p) => p.orientacao_politica));
    const religiaoModa = moda(parlamentares.map((p) => p.religiao));
    const bolsonaroModa = moda(parlamentares.map((p) => p.posicao_bolsonaro));
    const lulaModa = moda(parlamentares.map((p) => p.posicao_lula || '').filter(Boolean));
    const relacaoGovernoModa = moda(parlamentares.map((p) => p.relacao_governo_atual || '').filter(Boolean));
    const estiloComunicacaoModa = moda(parlamentares.map((p) => p.estilo_comunicacao));
    const estiloDecisaoModa = moda(parlamentares.map((p) => p.estilo_decisao || '').filter(Boolean));
    const capitalPoliticoModa = moda(parlamentares.map((p) => p.capital_politico || '').filter(Boolean));
    const motivacaoModa = moda(parlamentares.map((p) => p.motivacao_primaria || '').filter(Boolean));

    // Medias
    const mediaIdade = parlamentares.reduce((acc, p) => acc + p.idade, 0) / total;
    const mediaVotos = parlamentares.reduce((acc, p) => acc + (p.votos_eleicao || 0), 0) / total;

    let somaPresenca = 0, contPresenca = 0;
    let somaPatrimonio = 0, contPatrimonio = 0;
    let somaProjetos = 0, contProjetos = 0;
    let somaSeguidores = 0, contSeguidores = 0;

    parlamentares.forEach((p) => {
      if (p.taxa_presenca_plenario !== undefined) { somaPresenca += p.taxa_presenca_plenario; contPresenca++; }
      if (p.patrimonio_declarado !== undefined) { somaPatrimonio += p.patrimonio_declarado; contPatrimonio++; }
      if (p.total_projetos_autoria !== undefined) { somaProjetos += p.total_projetos_autoria; contProjetos++; }
      if (p.seguidores_total !== undefined) { somaSeguidores += p.seguidores_total; contSeguidores++; }
    });

    const mediaPresenca = contPresenca > 0 ? somaPresenca / contPresenca : 0;
    const mediaPatrimonio = contPatrimonio > 0 ? somaPatrimonio / contPatrimonio : 0;
    const mediaProjetos = contProjetos > 0 ? somaProjetos / contProjetos : 0;
    const mediaSeguidores = contSeguidores > 0 ? somaSeguidores / contSeguidores : 0;

    // Percentuais
    const percFilhos = (parlamentares.filter((p) => p.filhos > 0).length / total) * 100;
    const percFichaLimpa = (parlamentares.filter((p) => p.ficha_limpa === true).length / total) * 100;
    const percBBB = (parlamentares.filter((p) => p.bancada_bbb === true).length / total) * 100;

    // Contagens para cruzamentos
    const porOrientacao: Record<string, number> = {};
    const porRelacaoGoverno: Record<string, number> = {};
    const porBolsonaro: Record<string, number> = {};
    const porLula: Record<string, number> = {};

    parlamentares.forEach((p) => {
      porOrientacao[p.orientacao_politica] = (porOrientacao[p.orientacao_politica] || 0) + 1;
      if (p.relacao_governo_atual) porRelacaoGoverno[p.relacao_governo_atual] = (porRelacaoGoverno[p.relacao_governo_atual] || 0) + 1;
      porBolsonaro[p.posicao_bolsonaro] = (porBolsonaro[p.posicao_bolsonaro] || 0) + 1;
      if (p.posicao_lula) porLula[p.posicao_lula] = (porLula[p.posicao_lula] || 0) + 1;
    });

    // Valores e preocupacoes mais comuns
    const valoresCount: Record<string, number> = {};
    const preocupacoesCount: Record<string, number> = {};
    const temasCount: Record<string, number> = {};
    const bancadasCount: Record<string, number> = {};

    parlamentares.forEach((p) => {
      p.valores?.forEach((v) => { valoresCount[v] = (valoresCount[v] || 0) + 1; });
      p.preocupacoes?.forEach((pr) => { preocupacoesCount[pr] = (preocupacoesCount[pr] || 0) + 1; });
      p.temas_atuacao?.forEach((t) => { temasCount[t] = (temasCount[t] || 0) + 1; });
      p.bancadas_tematicas?.forEach((b) => { bancadasCount[b] = (bancadasCount[b] || 0) + 1; });
    });

    const topValores = Object.entries(valoresCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v]) => v);
    const topPreocupacoes = Object.entries(preocupacoesCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([p]) => p);
    const topTemas = Object.entries(temasCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
    const topBancadas = Object.entries(bancadasCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([b]) => b);

    // Analise de polarizacao
    const esquerda = (porOrientacao['esquerda'] || 0) + (porOrientacao['centro-esquerda'] || 0);
    const direita = (porOrientacao['direita'] || 0) + (porOrientacao['centro-direita'] || 0);
    const centro = porOrientacao['centro'] || 0;
    const polarizacao = Math.abs(esquerda - direita) / total;
    const isPolarizado = polarizacao > 0.3;

    // Analise de Bolsonaro
    const apoiadoresBolsonaro = (porBolsonaro['apoiador_forte'] || 0) + (porBolsonaro['apoiador_moderado'] || 0);
    const criticosBolsonaro = (porBolsonaro['critico_forte'] || 0) + (porBolsonaro['critico_moderado'] || 0) + (porBolsonaro['opositor_forte'] || 0) + (porBolsonaro['opositor_moderado'] || 0);
    const neutrosBolsonaro = porBolsonaro['neutro'] || 0;

    // Analise de Lula
    const apoiadoresLula = (porLula['apoiador_forte'] || 0) + (porLula['apoiador_moderado'] || 0);
    const criticosLula = (porLula['critico_forte'] || 0) + (porLula['critico_moderado'] || 0) + (porLula['opositor_forte'] || 0) + (porLula['opositor_moderado'] || 0);
    const neutrosLula = porLula['neutro'] || 0;

    // Analise Relacao Governo
    const baseAliada = porRelacaoGoverno['base_aliada'] || 0;
    const oposicao = (porRelacaoGoverno['oposicao_moderada'] || 0) + (porRelacaoGoverno['oposicao_forte'] || 0);
    const independentes = porRelacaoGoverno['independente'] || 0;

    // Gerar persona
    const genero = generoModa === 'masculino' ? 'Homem' : 'Mulher';
    const idadeArredondada = Math.round(mediaIdade);
    const casaLabel = LABELS.casa[casaModa] || casaModa;
    const orientacaoLabel = LABELS.orientacao[orientacaoModa] || orientacaoModa;
    const bolsonaroLabel = LABELS.bolsonaro[bolsonaroModa] || bolsonaroModa;
    const relacaoLabel = LABELS.relacao_governo[relacaoGovernoModa] || relacaoGovernoModa;
    const comunicacaoLabel = LABELS.estilo_comunicacao[estiloComunicacaoModa] || estiloComunicacaoModa;
    const capitalLabel = LABELS.capital_politico[capitalPoliticoModa] || capitalPoliticoModa;

    const persona = {
      titulo: `${genero}, ${idadeArredondada} anos, ${partidoModa}/${ufModa}`,
      descricao: `Parlamentar da ${casaLabel}, politicamente de ${orientacaoLabel}. ${bolsonaroLabel ? bolsonaroLabel.charAt(0).toUpperCase() + bolsonaroLabel.slice(1) : ''}. ${relacaoLabel ? 'E ' + relacaoLabel + ' do governo atual.' : ''} Comunicacao ${comunicacaoLabel}${capitalLabel ? ', com capital politico ' + capitalLabel : ''}.`,
      valores: topValores.join(', ') || 'Nao informado',
      preocupacoes: topPreocupacoes.join(', ') || 'Nao informado',
      temas: topTemas.join(', ') || 'Nao informado',
      bancadas: topBancadas.join(', ') || 'Nenhuma',
    };

    return {
      total,
      mediaIdade,
      mediaVotos,
      mediaPresenca,
      mediaPatrimonio,
      mediaProjetos,
      mediaSeguidores,
      percFilhos,
      percFichaLimpa,
      percBBB,
      generoModa,
      casaModa,
      partidoModa,
      ufModa,
      orientacaoModa,
      religiaoModa,
      bolsonaroModa,
      lulaModa,
      relacaoGovernoModa,
      estiloComunicacaoModa,
      estiloDecisaoModa,
      capitalPoliticoModa,
      motivacaoModa,
      topValores,
      topPreocupacoes,
      topTemas,
      topBancadas,
      porOrientacao,
      porRelacaoGoverno,
      porBolsonaro,
      porLula,
      esquerda,
      direita,
      centro,
      isPolarizado,
      apoiadoresBolsonaro,
      criticosBolsonaro,
      neutrosBolsonaro,
      apoiadoresLula,
      criticosLula,
      neutrosLula,
      baseAliada,
      oposicao,
      independentes,
      persona,
    };
  }, [parlamentares]);

  if (!insights || insights.total === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Selecione alguns filtros para ver insights sobre os parlamentares.
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
    { label: 'Apoiadores', valor: insights.apoiadoresBolsonaro, percentual: ((insights.apoiadoresBolsonaro / insights.total) * 100).toFixed(1), cor: '#22c55e' },
    { label: 'Neutros', valor: insights.neutrosBolsonaro, percentual: ((insights.neutrosBolsonaro / insights.total) * 100).toFixed(1), cor: '#94a3b8' },
    { label: 'Criticos/Opositores', valor: insights.criticosBolsonaro, percentual: ((insights.criticosBolsonaro / insights.total) * 100).toFixed(1), cor: '#ef4444' },
  ];

  const dadosLula = [
    { label: 'Apoiadores', valor: insights.apoiadoresLula, percentual: ((insights.apoiadoresLula / insights.total) * 100).toFixed(1), cor: '#ef4444' },
    { label: 'Neutros', valor: insights.neutrosLula, percentual: ((insights.neutrosLula / insights.total) * 100).toFixed(1), cor: '#94a3b8' },
    { label: 'Criticos/Opositores', valor: insights.criticosLula, percentual: ((insights.criticosLula / insights.total) * 100).toFixed(1), cor: '#22c55e' },
  ];

  const dadosRelacaoGoverno = [
    { label: 'Base Aliada', valor: insights.baseAliada, percentual: ((insights.baseAliada / insights.total) * 100).toFixed(1), cor: '#22c55e' },
    { label: 'Independentes', valor: insights.independentes, percentual: ((insights.independentes / insights.total) * 100).toFixed(1), cor: '#f59e0b' },
    { label: 'Oposicao', valor: insights.oposicao, percentual: ((insights.oposicao / insights.total) * 100).toFixed(1), cor: '#ef4444' },
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
            Análise de {insights.total} parlamentares selecionados
          </p>
        </div>
      </div>

      {/* Persona do Parlamentar Tipico */}
      <div className="glass-card rounded-xl p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Perfil do Parlamentar Tipico</h3>
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
                <span className="text-foreground font-medium">Preocupacoes:</span> {insights.persona.preocupacoes}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Temas de atuacao:</span> {insights.persona.temas}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Bancadas:</span> {insights.persona.bancadas}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metricas de Desempenho */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 text-center">
          <Vote className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{(insights.mediaVotos / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">Votos medio</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{insights.mediaPresenca.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Presenca media</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <FileText className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{insights.mediaProjetos.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Projetos medio</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Globe className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{(insights.mediaSeguidores / 1000).toFixed(0)}k</p>
          <p className="text-xs text-muted-foreground">Seguidores medio</p>
        </div>
      </div>

      {/* Insights Automaticos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Descobertas Automaticas
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Insight de Polarizacao */}
          <InsightCard
            titulo={insights.isPolarizado ? 'Grupo Polarizado' : 'Grupo Equilibrado'}
            conteudo={
              insights.isPolarizado
                ? `Este grupo esta politicamente polarizado, com ${((insights.esquerda / insights.total) * 100).toFixed(0)}% a esquerda e ${((insights.direita / insights.total) * 100).toFixed(0)}% a direita.`
                : `Este grupo tem distribuicao politica equilibrada, com representatividade em todo o espectro ideologico.`
            }
            icone={Scale}
            corIcone={insights.isPolarizado ? 'bg-red-500' : 'bg-green-500'}
            tipo={insights.isPolarizado ? 'warning' : 'success'}
          />

          {/* Insight Relacao Governo */}
          <InsightCard
            titulo="Relacao com o Governo"
            conteudo={
              insights.baseAliada > insights.oposicao
                ? `Maioria e da base aliada (${((insights.baseAliada / insights.total) * 100).toFixed(0)}%). Votacoes tendem a favorecer o governo.`
                : insights.oposicao > insights.baseAliada
                ? `Maioria e da oposicao (${((insights.oposicao / insights.total) * 100).toFixed(0)}%). Pode haver dificuldade em aprovar pautas governistas.`
                : `Equilibrio entre base e oposicao. Independentes (${((insights.independentes / insights.total) * 100).toFixed(0)}%) podem ser decisivos.`
            }
            icone={Landmark}
            corIcone={insights.baseAliada > insights.oposicao ? 'bg-green-500' : 'bg-orange-500'}
            tipo={insights.baseAliada > insights.oposicao ? 'success' : 'warning'}
          />

          {/* Insight de Ficha Limpa */}
          <InsightCard
            titulo="Integridade"
            conteudo={
              insights.percFichaLimpa >= 80
                ? `${insights.percFichaLimpa.toFixed(0)}% dos parlamentares tem ficha limpa. Grupo com alta integridade declarada.`
                : insights.percFichaLimpa >= 60
                ? `${insights.percFichaLimpa.toFixed(0)}% tem ficha limpa. Ha parlamentares com pendencias juridicas.`
                : `Apenas ${insights.percFichaLimpa.toFixed(0)}% tem ficha limpa. Atencao para questoes de integridade.`
            }
            icone={ShieldCheck}
            corIcone={insights.percFichaLimpa >= 80 ? 'bg-green-500' : insights.percFichaLimpa >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
            tipo={insights.percFichaLimpa >= 80 ? 'success' : insights.percFichaLimpa >= 60 ? 'warning' : 'warning'}
          />

          {/* Insight BBB */}
          {insights.percBBB > 10 && (
            <InsightCard
              titulo="Bancada BBB"
              conteudo={`${insights.percBBB.toFixed(0)}% do grupo pertence a Bancada BBB (Biblia, Boi e Bala). Pauta conservadora e ruralista e influente.`}
              icone={Users}
              corIcone="bg-amber-500"
              tipo="highlight"
            />
          )}

          {/* Insight de Comunicacao */}
          <InsightCard
            titulo={`Estilo de Comunicacao: ${LABELS.estilo_comunicacao[insights.estiloComunicacaoModa] || insights.estiloComunicacaoModa}`}
            conteudo={
              insights.estiloComunicacaoModa === 'combativo'
                ? 'Grupo com comunicacao agressiva e polarizadora. Debates podem ser acalorados.'
                : insights.estiloComunicacaoModa === 'articulado'
                ? 'Grupo com boa capacidade de articulacao e negociacao.'
                : insights.estiloComunicacaoModa === 'tecnico'
                ? 'Comunicacao tecnica e focada em dados. Pode ter dificuldade de conexao popular.'
                : insights.estiloComunicacaoModa === 'popular'
                ? 'Comunicacao popular e acessivel. Boa conexao com as bases.'
                : `Predomina comunicacao ${LABELS.estilo_comunicacao[insights.estiloComunicacaoModa] || insights.estiloComunicacaoModa}.`
            }
            icone={MessageSquare}
            corIcone="bg-indigo-500"
            tipo="info"
          />

          {/* Insight de Motivacao */}
          {insights.motivacaoModa && (
            <InsightCard
              titulo={`Motivacao Principal: ${LABELS.motivacao[insights.motivacaoModa] || insights.motivacaoModa}`}
              conteudo={
                insights.motivacaoModa === 'ideologia'
                  ? 'Parlamentares motivados por ideologia. Tendem a ser mais rigidos em negociacoes.'
                  : insights.motivacaoModa === 'servico'
                  ? 'Foco em servico publico. Mais abertos a pautas de interesse coletivo.'
                  : insights.motivacaoModa === 'poder'
                  ? 'Busca por poder e influencia. Negociacoes podem envolver cargos e recursos.'
                  : `Motivacao predominante: ${LABELS.motivacao[insights.motivacaoModa] || insights.motivacaoModa}.`
              }
              icone={Star}
              corIcone="bg-amber-500"
              tipo="info"
            />
          )}

          {/* Insight de Patrimonio */}
          {insights.mediaPatrimonio > 0 && (
            <InsightCard
              titulo="Patrimonio Medio"
              conteudo={`Patrimonio medio declarado: R$ ${(insights.mediaPatrimonio / 1000000).toFixed(1)} milhoes. ${
                insights.mediaPatrimonio > 5000000
                  ? 'Grupo com alto poder aquisitivo.'
                  : insights.mediaPatrimonio > 1000000
                  ? 'Patrimonio medio-alto.'
                  : 'Patrimonio relativamente modesto.'
              }`}
              icone={DollarSign}
              corIcone="bg-emerald-500"
              tipo="info"
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
          <CruzamentoCard titulo="Espectro Politico" dados={dadosOrientacao} />
          <CruzamentoCard titulo="Relacao com Governo" dados={dadosRelacaoGoverno} />
          <CruzamentoCard titulo="Posicao Bolsonaro" dados={dadosBolsonaro} />
          <CruzamentoCard titulo="Posicao Lula" dados={dadosLula} />
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
              <strong className="text-foreground">Partido chave:</strong> {insights.partidoModa} e o partido mais representado. Articule com liderancas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Temas prioritarios:</strong> {insights.topTemas.join(', ') || 'Variados'}. Aborde nas proposicoes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Abordagem:</strong> {
                insights.estiloComunicacaoModa === 'tecnico' ? 'Use dados e argumentos tecnicos.' :
                insights.estiloComunicacaoModa === 'popular' ? 'Foque no impacto social e beneficios praticos.' :
                insights.estiloComunicacaoModa === 'combativo' ? 'Prepare-se para debates intensos.' :
                'Adapte comunicacao ao perfil predominante.'
              }
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>
              <strong className="text-foreground">Bancadas:</strong> {insights.topBancadas.length > 0 ? `Considere aliancas com bancadas ${insights.topBancadas.join(', ')}.` : 'Avalie bancadas tematicas para aliancas.'}
            </span>
          </li>
          {insights.independentes > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>
                <strong className="text-foreground">Independentes:</strong> {((insights.independentes / insights.total) * 100).toFixed(0)}% sao independentes. Podem ser decisivos em votacoes apertadas.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
