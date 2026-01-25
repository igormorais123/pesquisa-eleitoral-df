'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Landmark,
  Building2,
  Users,
  BarChart3,
  PieChart,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { cn, formatarNumero } from '@/lib/utils';

interface RespostaParlamentar {
  id: string;
  parlamentar_id: string;
  parlamentar_nome: string;
  partido: string;
  casa_legislativa: string;
  pergunta_id: string;
  resposta_texto: string;
  fluxo_cognitivo?: any;
  custo_reais: number;
  criado_em: string;
}

interface Pesquisa {
  id: string;
  titulo: string;
  descricao?: string;
  perguntas: { id: string; texto: string; tipo: string }[];
  total_parlamentares: number;
  status: string;
  custo_real: number;
}

interface AnaliseResultado {
  total_respostas: number;
  por_casa: Record<string, number>;
  por_partido: Record<string, number>;
  por_orientacao: Record<string, number>;
  posicoes?: {
    sim: number;
    nao: number;
    abstencao: number;
    obstrucao: number;
  };
  parlamentares_pivo?: string[];
  insights?: { tipo: string; titulo: string; descricao: string }[];
}

const coresCasa: Record<string, string> = {
  camara_federal: 'bg-green-500/20 text-green-400',
  senado: 'bg-blue-500/20 text-blue-400',
  cldf: 'bg-yellow-500/20 text-yellow-400',
};

const nomesCasa: Record<string, string> = {
  camara_federal: 'Câmara',
  senado: 'Senado',
  cldf: 'CLDF',
};

export default function PaginaResultadosParlamentares() {
  const params = useParams();
  const router = useRouter();
  const pesquisaId = params.id as string;

  const [pesquisa, setPesquisa] = useState<Pesquisa | null>(null);
  const [respostas, setRespostas] = useState<RespostaParlamentar[]>([]);
  const [analise, setAnalise] = useState<AnaliseResultado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [filtroCasa, setFiltroCasa] = useState<string>('');
  const [filtroPartido, setFiltroPartido] = useState<string>('');
  const [perguntaSelecionada, setPerguntaSelecionada] = useState<string>('');

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pesquisaId]);

  async function carregarDados() {
    try {
      setCarregando(true);

      // Carregar pesquisa
      const resPesquisa = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}`);
      if (!resPesquisa.ok) throw new Error('Pesquisa não encontrada');
      const dadosPesquisa = await resPesquisa.json();
      setPesquisa(dadosPesquisa);

      if (dadosPesquisa.perguntas?.length > 0) {
        setPerguntaSelecionada(dadosPesquisa.perguntas[0].id);
      }

      // Carregar respostas
      const resRespostas = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}/respostas`);
      if (resRespostas.ok) {
        const dadosRespostas = await resRespostas.json();
        setRespostas(dadosRespostas);
      }

      // Tentar carregar análise
      try {
        const resAnalise = await fetch(`/api/v1/pesquisas-parlamentares/${pesquisaId}/analisar`, {
          method: 'POST',
        });
        if (resAnalise.ok) {
          const dadosAnalise = await resAnalise.json();
          setAnalise(dadosAnalise);
        }
      } catch (e) {
        console.warn('Análise não disponível:', e);
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }

  function exportarCSV() {
    const headers = ['Parlamentar', 'Partido', 'Casa', 'Pergunta', 'Resposta'];
    const rows = respostas.map(r => {
      const pergunta = pesquisa?.perguntas.find(p => p.id === r.pergunta_id);
      return [
        r.parlamentar_nome,
        r.partido,
        nomesCasa[r.casa_legislativa] || r.casa_legislativa,
        pergunta?.texto || '',
        r.resposta_texto.replace(/"/g, '""'),
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pesquisa-parlamentar-${pesquisaId}.csv`;
    link.click();
  }

  function exportarJSON() {
    const dados = {
      pesquisa,
      respostas,
      analise,
      exportado_em: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pesquisa-parlamentar-${pesquisaId}.json`;
    link.click();
  }

  // Filtragem de respostas
  const respostasFiltradas = respostas.filter(r => {
    if (filtroCasa && r.casa_legislativa !== filtroCasa) return false;
    if (filtroPartido && r.partido !== filtroPartido) return false;
    if (perguntaSelecionada && r.pergunta_id !== perguntaSelecionada) return false;
    return true;
  });

  // Partidos únicos para o filtro
  const partidosUnicos = Array.from(new Set(respostas.map(r => r.partido))).sort();

  // Estatísticas locais
  const estatisticasPorCasa = respostasFiltradas.reduce((acc, r) => {
    acc[r.casa_legislativa] = (acc[r.casa_legislativa] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const estatisticasPorPartido = respostasFiltradas.reduce((acc, r) => {
    acc[r.partido] = (acc[r.partido] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (erro || !pesquisa) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Erro ao carregar resultados</p>
          <p className="text-sm text-muted-foreground mt-2">{erro}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Resultados: {pesquisa.titulo}
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatarNumero(respostas.length)} respostas de {formatarNumero(pesquisa.total_parlamentares)} parlamentares
          </p>
        </div>

        {/* Exportação */}
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportarJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatarNumero(pesquisa.total_parlamentares)}</p>
              <p className="text-sm text-muted-foreground">Parlamentares</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatarNumero(respostas.length)}</p>
              <p className="text-sm text-muted-foreground">Respostas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Landmark className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pesquisa.perguntas?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Perguntas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {pesquisa.custo_real?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Custo Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Filtros</h3>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Pergunta</label>
            <select
              value={perguntaSelecionada}
              onChange={e => setPerguntaSelecionada(e.target.value)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas as perguntas</option>
              {pesquisa.perguntas?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.texto.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Casa Legislativa</label>
            <select
              value={filtroCasa}
              onChange={e => setFiltroCasa(e.target.value)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas</option>
              <option value="camara_federal">Câmara</option>
              <option value="senado">Senado</option>
              <option value="cldf">CLDF</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Partido</label>
            <select
              value={filtroPartido}
              onChange={e => setFiltroPartido(e.target.value)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              {partidosUnicos.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Por Casa */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-primary" />
            Distribuição por Casa
          </h3>

          <div className="space-y-3">
            {Object.entries(estatisticasPorCasa)
              .sort(([, a], [, b]) => b - a)
              .map(([casa, count]) => (
                <div key={casa} className="flex items-center gap-3">
                  <span className={cn('px-2 py-1 rounded text-xs', coresCasa[casa] || 'bg-secondary')}>
                    {nomesCasa[casa] || casa}
                  </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(count / respostasFiltradas.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Por Partido */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            Distribuição por Partido
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(estatisticasPorPartido)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([partido, count]) => (
                <div key={partido} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-16">{partido}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(count / respostasFiltradas.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-12 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      {analise?.insights && analise.insights.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analise.insights.map((insight, i) => (
              <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium text-foreground">{insight.titulo}</h4>
                <p className="text-sm text-muted-foreground mt-1">{insight.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de respostas */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          Respostas ({formatarNumero(respostasFiltradas.length)})
        </h3>

        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {respostasFiltradas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma resposta encontrada com os filtros selecionados
            </p>
          ) : (
            respostasFiltradas.map(resposta => {
              const pergunta = pesquisa.perguntas?.find(p => p.id === resposta.pergunta_id);

              return (
                <div key={resposta.id} className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/parlamentares/${resposta.parlamentar_id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {resposta.parlamentar_nome}
                      </Link>
                      <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                        {resposta.partido}
                      </span>
                      <span className={cn('px-2 py-0.5 rounded text-xs', coresCasa[resposta.casa_legislativa])}>
                        {nomesCasa[resposta.casa_legislativa]}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resposta.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {pergunta && (
                    <p className="text-xs text-muted-foreground mb-2 italic">
                      Pergunta: {pergunta.texto}
                    </p>
                  )}

                  <p className="text-sm text-foreground">{resposta.resposta_texto}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
