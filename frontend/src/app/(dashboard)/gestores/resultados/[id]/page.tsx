'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  PieChart,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Coins,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  usePesquisaPODCStore,
  type RespostaPODCEstruturada,
  type DistribuicaoPODC,
} from '@/stores/pesquisa-podc-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';

// Cores para os gráficos PODC
const CORES_PODC = {
  planejar: { bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3b82f6' },
  organizar: { bg: 'bg-green-500', text: 'text-green-400', hex: '#22c55e' },
  dirigir: { bg: 'bg-yellow-500', text: 'text-yellow-400', hex: '#eab308' },
  controlar: { bg: 'bg-red-500', text: 'text-red-400', hex: '#ef4444' },
};

// Classificações de IAD
const CLASSIFICACOES_IAD = [
  { min: 2.0, label: 'Formulador Puro', cor: 'text-purple-400', bg: 'bg-purple-500/20' },
  { min: 1.5, label: 'Formulador', cor: 'text-blue-400', bg: 'bg-blue-500/20' },
  { min: 1.0, label: 'Equilibrado', cor: 'text-green-400', bg: 'bg-green-500/20' },
  { min: 0.7, label: 'Executor', cor: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { min: 0, label: 'Executor Puro', cor: 'text-red-400', bg: 'bg-red-500/20' },
];

function classificarIAD(iad: number): { label: string; cor: string; bg: string } {
  for (const c of CLASSIFICACOES_IAD) {
    if (iad >= c.min) return c;
  }
  return CLASSIFICACOES_IAD[CLASSIFICACOES_IAD.length - 1];
}

// Componente de barra de proporção
function BarraProporcao({
  valor,
  maximo = 100,
  cor,
  label,
}: {
  valor: number;
  maximo?: number;
  cor: string;
  label: string;
}) {
  const percentual = Math.min((valor / maximo) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{valor.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', cor)}
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}

// Componente de card de estatística
function CardEstatistica({
  titulo,
  valor,
  icone: Icone,
  cor,
  subtitulo,
}: {
  titulo: string;
  valor: string | number;
  icone: React.ElementType;
  cor: string;
  subtitulo?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', cor)}>
          <Icone className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-xl font-bold text-foreground">{valor}</p>
          {subtitulo && <p className="text-xs text-muted-foreground">{subtitulo}</p>}
        </div>
      </div>
    </div>
  );
}

export default function PaginaResultadosGestores() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = params.id as string;

  const { token } = useAuthStore();
  const {
    sessaoAtual,
    respostasEstruturadas,
    carregandoBackend,
    erro,
    carregarRespostasPesquisa,
  } = usePesquisaPODCStore();

  const [carregando, setCarregando] = useState(true);

  // Carregar dados
  useEffect(() => {
    const carregar = async () => {
      // Se temos a sessão atual com os dados, usar esses
      if (sessaoAtual && sessaoAtual.id === sessaoId && sessaoAtual.respostasEstruturadas?.length > 0) {
        setCarregando(false);
        return;
      }

      // Se temos pesquisaIdBackend, carregar do backend
      if (sessaoAtual?.pesquisaIdBackend && token) {
        await carregarRespostasPesquisa(sessaoAtual.pesquisaIdBackend, token);
      }

      setCarregando(false);
    };

    carregar();
  }, [sessaoId, sessaoAtual, token, carregarRespostasPesquisa]);

  // Usar respostas do store (podem vir da sessão atual ou do backend)
  const respostas = useMemo(() => {
    if (sessaoAtual?.respostasEstruturadas && sessaoAtual.respostasEstruturadas.length > 0) {
      return sessaoAtual.respostasEstruturadas;
    }
    return respostasEstruturadas;
  }, [sessaoAtual, respostasEstruturadas]);

  // Estatísticas calculadas
  const estatisticas = useMemo(() => {
    if (respostas.length === 0) return null;

    // Média PODC geral
    const mediaPODC: DistribuicaoPODC = {
      planejar: respostas.reduce((acc, r) => acc + r.distribuicao_podc.planejar, 0) / respostas.length,
      organizar: respostas.reduce((acc, r) => acc + r.distribuicao_podc.organizar, 0) / respostas.length,
      dirigir: respostas.reduce((acc, r) => acc + r.distribuicao_podc.dirigir, 0) / respostas.length,
      controlar: respostas.reduce((acc, r) => acc + r.distribuicao_podc.controlar, 0) / respostas.length,
    };

    // Média IAD geral
    const mediaIAD = respostas.reduce((acc, r) => acc + (r.iad || 1), 0) / respostas.length;

    // Por setor
    const publico = respostas.filter((r) => r.setor === 'publico');
    const privado = respostas.filter((r) => r.setor === 'privado');

    const mediaPODCPublico: DistribuicaoPODC | null =
      publico.length > 0
        ? {
            planejar: publico.reduce((acc, r) => acc + r.distribuicao_podc.planejar, 0) / publico.length,
            organizar: publico.reduce((acc, r) => acc + r.distribuicao_podc.organizar, 0) / publico.length,
            dirigir: publico.reduce((acc, r) => acc + r.distribuicao_podc.dirigir, 0) / publico.length,
            controlar: publico.reduce((acc, r) => acc + r.distribuicao_podc.controlar, 0) / publico.length,
          }
        : null;

    const mediaPODCPrivado: DistribuicaoPODC | null =
      privado.length > 0
        ? {
            planejar: privado.reduce((acc, r) => acc + r.distribuicao_podc.planejar, 0) / privado.length,
            organizar: privado.reduce((acc, r) => acc + r.distribuicao_podc.organizar, 0) / privado.length,
            dirigir: privado.reduce((acc, r) => acc + r.distribuicao_podc.dirigir, 0) / privado.length,
            controlar: privado.reduce((acc, r) => acc + r.distribuicao_podc.controlar, 0) / privado.length,
          }
        : null;

    const mediaIADPublico = publico.length > 0 ? publico.reduce((acc, r) => acc + (r.iad || 1), 0) / publico.length : 0;
    const mediaIADPrivado = privado.length > 0 ? privado.reduce((acc, r) => acc + (r.iad || 1), 0) / privado.length : 0;

    // Por nível hierárquico
    const estrategico = respostas.filter((r) => r.nivel_hierarquico === 'estrategico');
    const tatico = respostas.filter((r) => r.nivel_hierarquico === 'tatico');
    const operacional = respostas.filter((r) => r.nivel_hierarquico === 'operacional');

    const calcularMediaPODC = (lista: RespostaPODCEstruturada[]): DistribuicaoPODC | null => {
      if (lista.length === 0) return null;
      return {
        planejar: lista.reduce((acc, r) => acc + r.distribuicao_podc.planejar, 0) / lista.length,
        organizar: lista.reduce((acc, r) => acc + r.distribuicao_podc.organizar, 0) / lista.length,
        dirigir: lista.reduce((acc, r) => acc + r.distribuicao_podc.dirigir, 0) / lista.length,
        controlar: lista.reduce((acc, r) => acc + r.distribuicao_podc.controlar, 0) / lista.length,
      };
    };

    const calcularMediaIAD = (lista: RespostaPODCEstruturada[]): number => {
      if (lista.length === 0) return 0;
      return lista.reduce((acc, r) => acc + (r.iad || 1), 0) / lista.length;
    };

    // Custo e tokens totais
    const custoTotal = respostas.reduce((acc, r) => acc + (r.custo_reais || 0), 0);
    const tokensTotal = respostas.reduce((acc, r) => acc + (r.tokens_input || 0) + (r.tokens_output || 0), 0);

    // Distribuição por classificação IAD
    const distribuicaoIAD = CLASSIFICACOES_IAD.map((c) => ({
      ...c,
      count: respostas.filter((r) => {
        const iad = r.iad || 1;
        const idx = CLASSIFICACOES_IAD.indexOf(c);
        const nextMin = idx < CLASSIFICACOES_IAD.length - 1 ? CLASSIFICACOES_IAD[idx + 1].min : -Infinity;
        return iad >= c.min && (idx === 0 || iad < CLASSIFICACOES_IAD[idx - 1].min);
      }).length,
    }));

    return {
      total: respostas.length,
      mediaPODC,
      mediaIAD,
      publico: {
        total: publico.length,
        mediaPODC: mediaPODCPublico,
        mediaIAD: mediaIADPublico,
      },
      privado: {
        total: privado.length,
        mediaPODC: mediaPODCPrivado,
        mediaIAD: mediaIADPrivado,
      },
      porNivel: {
        estrategico: {
          total: estrategico.length,
          mediaPODC: calcularMediaPODC(estrategico),
          mediaIAD: calcularMediaIAD(estrategico),
        },
        tatico: {
          total: tatico.length,
          mediaPODC: calcularMediaPODC(tatico),
          mediaIAD: calcularMediaIAD(tatico),
        },
        operacional: {
          total: operacional.length,
          mediaPODC: calcularMediaPODC(operacional),
          mediaIAD: calcularMediaIAD(operacional),
        },
      },
      custoTotal,
      tokensTotal,
      distribuicaoIAD,
    };
  }, [respostas]);

  // Exportar CSV
  const exportarCSV = () => {
    if (respostas.length === 0) return;

    const headers = [
      'Gestor',
      'Setor',
      'Nivel',
      'Cargo',
      'Instituicao',
      'Planejar%',
      'Organizar%',
      'Dirigir%',
      'Controlar%',
      'IAD',
      'Classificacao IAD',
      'Tokens',
      'Custo R$',
    ];

    const rows = respostas.map((r) => [
      r.gestor_nome,
      r.setor,
      r.nivel_hierarquico,
      r.cargo || '',
      r.instituicao || '',
      r.distribuicao_podc.planejar.toFixed(1),
      r.distribuicao_podc.organizar.toFixed(1),
      r.distribuicao_podc.dirigir.toFixed(1),
      r.distribuicao_podc.controlar.toFixed(1),
      (r.iad || 1).toFixed(2),
      r.iad_classificacao || classificarIAD(r.iad || 1).label,
      (r.tokens_input || 0) + (r.tokens_output || 0),
      (r.custo_reais || 0).toFixed(4),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados-podc-${sessaoId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tela de carregamento
  if (carregando || carregandoBackend) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-foreground font-medium">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  // Sem dados
  if (!estatisticas || respostas.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto" />
          <p className="mt-4 text-foreground font-medium">Nenhum resultado encontrado</p>
          <p className="text-sm text-muted-foreground mt-2">
            A pesquisa pode ainda estar em andamento ou nao possui respostas.
          </p>
          <Link
            href="/gestores"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Gestores
          </Link>
        </div>
      </div>
    );
  }

  const classificacaoGeral = classificarIAD(estatisticas.mediaIAD);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/gestores"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Resultados da Pesquisa PODC
            </h1>
            <p className="text-muted-foreground">
              {sessaoAtual?.titulo || 'Analise de distribuicao de funcoes administrativas'}
            </p>
          </div>
        </div>

        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica
          titulo="Total de Gestores"
          valor={estatisticas.total}
          icone={Users}
          cor="bg-blue-500"
        />
        <CardEstatistica
          titulo="IAD Medio"
          valor={estatisticas.mediaIAD.toFixed(2)}
          icone={Target}
          cor="bg-purple-500"
          subtitulo={classificacaoGeral.label}
        />
        <CardEstatistica
          titulo="Custo Total"
          valor={formatarMoeda(estatisticas.custoTotal)}
          icone={Coins}
          cor="bg-yellow-500"
        />
        <CardEstatistica
          titulo="Tokens Usados"
          valor={formatarNumero(estatisticas.tokensTotal)}
          icone={FileText}
          cor="bg-green-500"
        />
      </div>

      {/* Distribuição PODC Geral */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Distribuicao PODC Media Geral
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Barras */}
          <div className="space-y-4">
            <BarraProporcao
              valor={estatisticas.mediaPODC.planejar}
              cor={CORES_PODC.planejar.bg}
              label="Planejar (P)"
            />
            <BarraProporcao
              valor={estatisticas.mediaPODC.organizar}
              cor={CORES_PODC.organizar.bg}
              label="Organizar (O)"
            />
            <BarraProporcao
              valor={estatisticas.mediaPODC.dirigir}
              cor={CORES_PODC.dirigir.bg}
              label="Dirigir (D)"
            />
            <BarraProporcao
              valor={estatisticas.mediaPODC.controlar}
              cor={CORES_PODC.controlar.bg}
              label="Controlar (C)"
            />
          </div>

          {/* Visual circular simplificado */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(estatisticas.mediaPODC).map(([key, valor]) => {
                const cores = CORES_PODC[key as keyof typeof CORES_PODC];
                return (
                  <div
                    key={key}
                    className={cn('p-4 rounded-lg text-center', cores.bg + '/20')}
                  >
                    <p className={cn('text-3xl font-bold', cores.text)}>
                      {valor.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{key}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* IAD explicação */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">IAD (Indice de Autonomia Decisoria):</span>{' '}
            Calculado como (P+O)/(D+C). Valores acima de 1.0 indicam perfil formulador, abaixo de 1.0 indicam perfil executor.
          </p>
          <p className="text-sm mt-2">
            <span className="font-medium text-foreground">IAD Medio da Pesquisa:</span>{' '}
            <span className={classificacaoGeral.cor}>{estatisticas.mediaIAD.toFixed(2)} - {classificacaoGeral.label}</span>
          </p>
        </div>
      </div>

      {/* Comparação por Setor */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Comparacao por Setor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Setor Público */}
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-foreground">Setor Publico</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full ml-auto">
                {estatisticas.publico.total} gestores
              </span>
            </div>

            {estatisticas.publico.mediaPODC ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">P</p>
                    <p className="text-lg font-bold text-blue-400">
                      {estatisticas.publico.mediaPODC.planejar.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">O</p>
                    <p className="text-lg font-bold text-green-400">
                      {estatisticas.publico.mediaPODC.organizar.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">D</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {estatisticas.publico.mediaPODC.dirigir.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">C</p>
                    <p className="text-lg font-bold text-red-400">
                      {estatisticas.publico.mediaPODC.controlar.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-center p-2 bg-secondary/50 rounded">
                  <span className="text-sm text-muted-foreground">IAD Medio: </span>
                  <span className={cn('font-medium', classificarIAD(estatisticas.publico.mediaIAD).cor)}>
                    {estatisticas.publico.mediaIAD.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
            )}
          </div>

          {/* Setor Privado */}
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-green-400" />
              <span className="font-medium text-foreground">Setor Privado</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full ml-auto">
                {estatisticas.privado.total} gestores
              </span>
            </div>

            {estatisticas.privado.mediaPODC ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">P</p>
                    <p className="text-lg font-bold text-blue-400">
                      {estatisticas.privado.mediaPODC.planejar.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">O</p>
                    <p className="text-lg font-bold text-green-400">
                      {estatisticas.privado.mediaPODC.organizar.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">D</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {estatisticas.privado.mediaPODC.dirigir.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">C</p>
                    <p className="text-lg font-bold text-red-400">
                      {estatisticas.privado.mediaPODC.controlar.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="text-center p-2 bg-secondary/50 rounded">
                  <span className="text-sm text-muted-foreground">IAD Medio: </span>
                  <span className={cn('font-medium', classificarIAD(estatisticas.privado.mediaIAD).cor)}>
                    {estatisticas.privado.mediaIAD.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
            )}
          </div>
        </div>

        {/* Diferença entre setores */}
        {estatisticas.publico.mediaPODC && estatisticas.privado.mediaPODC && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Diferenca Publico vs Privado</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              {(['planejar', 'organizar', 'dirigir', 'controlar'] as const).map((func) => {
                const diff = estatisticas.publico.mediaPODC![func] - estatisticas.privado.mediaPODC![func];
                const cores = CORES_PODC[func];
                return (
                  <div key={func}>
                    <p className="text-xs text-muted-foreground capitalize">{func}</p>
                    <div className={cn('flex items-center justify-center gap-1', cores.text)}>
                      {diff > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : diff < 0 ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Comparação por Nível Hierárquico */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Comparacao por Nivel Hierarquico
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Estratégico */}
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Estrategico</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {estatisticas.porNivel.estrategico.total}
              </span>
            </div>
            {estatisticas.porNivel.estrategico.mediaPODC ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>P: <span className="text-blue-400 font-medium">{estatisticas.porNivel.estrategico.mediaPODC.planejar.toFixed(1)}%</span></div>
                  <div>O: <span className="text-green-400 font-medium">{estatisticas.porNivel.estrategico.mediaPODC.organizar.toFixed(1)}%</span></div>
                  <div>D: <span className="text-yellow-400 font-medium">{estatisticas.porNivel.estrategico.mediaPODC.dirigir.toFixed(1)}%</span></div>
                  <div>C: <span className="text-red-400 font-medium">{estatisticas.porNivel.estrategico.mediaPODC.controlar.toFixed(1)}%</span></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  IAD: <span className={classificarIAD(estatisticas.porNivel.estrategico.mediaIAD).cor}>
                    {estatisticas.porNivel.estrategico.mediaIAD.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </div>

          {/* Tático */}
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Tatico</span>
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                {estatisticas.porNivel.tatico.total}
              </span>
            </div>
            {estatisticas.porNivel.tatico.mediaPODC ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>P: <span className="text-blue-400 font-medium">{estatisticas.porNivel.tatico.mediaPODC.planejar.toFixed(1)}%</span></div>
                  <div>O: <span className="text-green-400 font-medium">{estatisticas.porNivel.tatico.mediaPODC.organizar.toFixed(1)}%</span></div>
                  <div>D: <span className="text-yellow-400 font-medium">{estatisticas.porNivel.tatico.mediaPODC.dirigir.toFixed(1)}%</span></div>
                  <div>C: <span className="text-red-400 font-medium">{estatisticas.porNivel.tatico.mediaPODC.controlar.toFixed(1)}%</span></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  IAD: <span className={classificarIAD(estatisticas.porNivel.tatico.mediaIAD).cor}>
                    {estatisticas.porNivel.tatico.mediaIAD.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </div>

          {/* Operacional */}
          <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">Operacional</span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                {estatisticas.porNivel.operacional.total}
              </span>
            </div>
            {estatisticas.porNivel.operacional.mediaPODC ? (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>P: <span className="text-blue-400 font-medium">{estatisticas.porNivel.operacional.mediaPODC.planejar.toFixed(1)}%</span></div>
                  <div>O: <span className="text-green-400 font-medium">{estatisticas.porNivel.operacional.mediaPODC.organizar.toFixed(1)}%</span></div>
                  <div>D: <span className="text-yellow-400 font-medium">{estatisticas.porNivel.operacional.mediaPODC.dirigir.toFixed(1)}%</span></div>
                  <div>C: <span className="text-red-400 font-medium">{estatisticas.porNivel.operacional.mediaPODC.controlar.toFixed(1)}%</span></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  IAD: <span className={classificarIAD(estatisticas.porNivel.operacional.mediaIAD).cor}>
                    {estatisticas.porNivel.operacional.mediaIAD.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Respostas Individuais */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Respostas Individuais ({respostas.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Gestor</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Setor</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Nivel</th>
                <th className="text-center py-3 px-2 text-blue-400 font-medium">P</th>
                <th className="text-center py-3 px-2 text-green-400 font-medium">O</th>
                <th className="text-center py-3 px-2 text-yellow-400 font-medium">D</th>
                <th className="text-center py-3 px-2 text-red-400 font-medium">C</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">IAD</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Classificacao</th>
              </tr>
            </thead>
            <tbody>
              {respostas.map((r, i) => {
                const classIAD = classificarIAD(r.iad || 1);
                return (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-foreground">{r.gestor_nome}</p>
                        <p className="text-xs text-muted-foreground">{r.cargo}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        r.setor === 'publico' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      )}>
                        {r.setor}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs',
                        r.nivel_hierarquico === 'estrategico' ? 'bg-purple-500/20 text-purple-400' :
                        r.nivel_hierarquico === 'tatico' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      )}>
                        {r.nivel_hierarquico}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 text-blue-400 font-medium">
                      {r.distribuicao_podc.planejar.toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-2 text-green-400 font-medium">
                      {r.distribuicao_podc.organizar.toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-2 text-yellow-400 font-medium">
                      {r.distribuicao_podc.dirigir.toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-2 text-red-400 font-medium">
                      {r.distribuicao_podc.controlar.toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-2 font-medium text-foreground">
                      {(r.iad || 1).toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={cn('px-2 py-0.5 rounded text-xs', classIAD.bg, classIAD.cor)}>
                        {r.iad_classificacao || classIAD.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ações finais */}
      <div className="flex justify-between items-center">
        <Link
          href="/gestores"
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Gestores
        </Link>

        <div className="flex gap-3">
          <Link
            href="/gestores/entrevistas"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Nova Pesquisa
          </Link>
        </div>
      </div>
    </div>
  );
}
