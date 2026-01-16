'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  MapPin,
  Wallet,
  AlertTriangle,
  TrendingDown,
  Shield,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { useEleitoresStore } from '@/stores/eleitores-store';
import type { Eleitor, ClusterSocioeconomico } from '@/types';
import { cn } from '@/lib/utils';
import { calcularValidacaoEstatistica } from '@/services/validacao-estatistica';
import { labelsVariaveis, labelsValores } from '@/data/dados-referencia-oficiais';

const REGIOES_DF = [
  'Ceilandia',
  'Taguatinga',
  'Samambaia',
  'Plano Piloto',
  'Aguas Claras',
  'Recanto das Emas',
  'Gama',
  'Santa Maria',
  'Sobradinho',
  'Sao Sebastiao',
  'Planaltina',
  'Vicente Pires',
  'Guara',
  'Paranoa',
  'Riacho Fundo',
  'Nucleo Bandeirante',
  'Brazlandia',
  'Lago Sul',
  'Lago Norte',
];

const CLUSTERS = [
  { value: 'G1_alta', label: 'Alta (G1)', description: 'Renda 10+ SM' },
  { value: 'G2_media_alta', label: 'Media-Alta (G2)', description: 'Renda 5-10 SM' },
  { value: 'G3_media_baixa', label: 'Media-Baixa (G3)', description: 'Renda 2-5 SM' },
  { value: 'G4_baixa', label: 'Baixa (G4)', description: 'Renda ate 2 SM' },
];

interface DivergenciaCorretiva {
  variavel: string;
  labelVariavel: string;
  categoria: string;
  labelCategoria: string;
  quantidade: number;
  diferenca: number;
}

export default function PaginaGerarEleitores() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adicionarEleitores, eleitores: eleitoresAtuais } = useEleitoresStore();

  // Parâmetros de correção da URL
  const modoCorretivo = searchParams.get('modo') === 'corretivo';
  const corrigirVariavel = searchParams.get('corrigir');
  const corrigirCategoria = searchParams.get('categoria');
  const quantidadeSugerida = searchParams.get('quantidade');

  const [quantidade, setQuantidade] = useState(quantidadeSugerida ? parseInt(quantidadeSugerida) : 10);
  const [regiao, setRegiao] = useState<string>('');
  const [cluster, setCluster] = useState<ClusterSocioeconomico | ''>('');
  const [manterProporcoes, setManterProporcoes] = useState(!modoCorretivo && !corrigirVariavel);
  const [usarModoCorretivo, setUsarModoCorretivo] = useState(modoCorretivo || !!corrigirVariavel);
  const [divergenciasSelecionadas, setDivergenciasSelecionadas] = useState<DivergenciaCorretiva[]>([]);
  const [resultado, setResultado] = useState<{
    eleitores: Eleitor[];
    custoReais: number;
  } | null>(null);

  // Calcular validação atual
  const validacao = useMemo(
    () => calcularValidacaoEstatistica(eleitoresAtuais),
    [eleitoresAtuais]
  );

  // Divergências que precisam de correção (apenas sub-representadas)
  const divergenciasParaCorrecao = useMemo(() => {
    const divergencias: DivergenciaCorretiva[] = [];
    validacao.resumos.forEach((resumo) => {
      resumo.divergencias
        .filter((d) => d.direcao === 'abaixo' && d.eleitoresParaCorrecao > 0)
        .forEach((d) => {
          divergencias.push({
            variavel: d.variavel,
            labelVariavel: d.labelVariavel,
            categoria: d.categoria,
            labelCategoria: d.labelCategoria,
            quantidade: d.eleitoresParaCorrecao,
            diferenca: d.diferenca,
          });
        });
    });
    return divergencias.sort((a, b) => b.quantidade - a.quantidade);
  }, [validacao]);

  // Inicializar divergência selecionada se veio da URL
  useEffect(() => {
    if (corrigirVariavel && corrigirCategoria && quantidadeSugerida) {
      const labelVar = labelsVariaveis[corrigirVariavel] || corrigirVariavel;
      const labelCat = labelsValores[corrigirVariavel]?.[corrigirCategoria] || corrigirCategoria;
      setDivergenciasSelecionadas([{
        variavel: corrigirVariavel,
        labelVariavel: labelVar,
        categoria: corrigirCategoria,
        labelCategoria: labelCat,
        quantidade: parseInt(quantidadeSugerida),
        diferenca: 0,
      }]);
    }
  }, [corrigirVariavel, corrigirCategoria, quantidadeSugerida]);

  // Mutation para gerar eleitores
  const mutationGerar = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/claude/gerar-agentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantidade,
          cluster: cluster || undefined,
          regiao: regiao || undefined,
          manterProporcoes: !usarModoCorretivo && manterProporcoes,
          modoCorretivo: usarModoCorretivo,
          divergenciasParaCorrigir: usarModoCorretivo ? divergenciasSelecionadas : undefined,
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro ao gerar eleitores');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResultado({
        eleitores: data.eleitores,
        custoReais: data.custoReais,
      });
      toast.success(`${data.eleitores.length} eleitores gerados com sucesso!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar eleitores');
    },
  });

  // Mutation para salvar eleitores (backend + local)
  const mutationSalvar = useMutation({
    mutationFn: async (eleitores: Eleitor[]) => {
      // 1. Tentar salvar no backend primeiro
      let backendSalvo = false;
      try {
        const token = localStorage.getItem('pesquisa-eleitoral-auth');
        const authData = token ? JSON.parse(token) : null;
        const accessToken = authData?.state?.token;

        const response = await fetch('/api/v1/geracao/salvar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({
            eleitores,
            modo_corretivo: usarModoCorretivo,
            divergencias_corrigidas: divergenciasSelecionadas.map(
              (d) => `${d.variavel}:${d.categoria}`
            ),
          }),
        });

        if (response.ok) {
          const resultado = await response.json();
          backendSalvo = resultado.sucesso;
          if (resultado.erros?.length > 0) {
            console.warn('Avisos do backend:', resultado.erros);
          }
        } else {
          const erro = await response.json();
          console.warn('Backend nao disponivel:', erro);
        }
      } catch (err) {
        console.warn('Erro ao salvar no backend, continuando com salvamento local:', err);
      }

      // 2. Salvar localmente no Dexie (IndexedDB)
      await db.eleitores.bulkAdd(eleitores);

      return { eleitores, backendSalvo };
    },
    onSuccess: ({ eleitores, backendSalvo }) => {
      adicionarEleitores(eleitores);
      if (backendSalvo) {
        toast.success(`${eleitores.length} eleitores salvos no banco (backend + local)!`);
      } else {
        toast.success(`${eleitores.length} eleitores salvos localmente!`, {
          description: 'O backend nao estava disponivel, mas os dados foram salvos no navegador.',
        });
      }
      router.push('/eleitores');
    },
    onError: () => {
      toast.error('Erro ao salvar eleitores');
    },
  });

  const custoEstimado = quantidade * 0.15;

  // Total de eleitores corretivos selecionados
  const totalCorretivo = divergenciasSelecionadas.reduce((acc, d) => acc + d.quantidade, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/eleitores"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {usarModoCorretivo ? 'Gerar Eleitores Corretivos' : 'Gerar Eleitores com IA'}
          </h1>
          <p className="text-muted-foreground">
            {usarModoCorretivo
              ? 'Gerar eleitores para corrigir vieses na amostra'
              : 'Use Claude Opus 4.5 para criar novos perfis sinteticos'}
          </p>
        </div>
        {!resultado && (
          <button
            onClick={() => setUsarModoCorretivo(!usarModoCorretivo)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              usarModoCorretivo
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Shield className="w-4 h-4" />
            {usarModoCorretivo ? 'Modo Corretivo Ativo' : 'Ativar Modo Corretivo'}
          </button>
        )}
      </div>

      {!resultado ? (
        <div className="space-y-6">
          {/* Status da validação atual */}
          {usarModoCorretivo && (
            <div className="glass-card rounded-xl p-6 border border-orange-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                  Status Atual da Amostra
                </h3>
                <Link
                  href="/validacao"
                  className="text-xs text-primary hover:underline"
                >
                  Ver validação completa
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-2xl font-bold text-foreground">{eleitoresAtuais.length}</p>
                  <p className="text-xs text-muted-foreground">Eleitores Atuais</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className={cn(
                    'text-2xl font-bold',
                    validacao.indiceConformidade >= 70 ? 'text-green-400' :
                    validacao.indiceConformidade >= 50 ? 'text-yellow-400' : 'text-red-400'
                  )}>
                    {validacao.indiceConformidade.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Índice de Conformidade</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/10">
                  <p className="text-2xl font-bold text-orange-400">{divergenciasParaCorrecao.length}</p>
                  <p className="text-xs text-muted-foreground">Categorias Sub-representadas</p>
                </div>
              </div>

              {/* Lista de divergências para selecionar */}
              {divergenciasParaCorrecao.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      Selecione as categorias sub-representadas que deseja corrigir:
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDivergenciasSelecionadas(divergenciasParaCorrecao.slice(0, 15))}
                        className="text-xs text-primary hover:underline"
                      >
                        Selecionar todas
                      </button>
                      <span className="text-muted-foreground">|</span>
                      <button
                        onClick={() => setDivergenciasSelecionadas([])}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {divergenciasParaCorrecao.slice(0, 15).map((d) => {
                      const selecionada = divergenciasSelecionadas.some(
                        (s) => s.variavel === d.variavel && s.categoria === d.categoria
                      );
                      return (
                        <button
                          key={`${d.variavel}-${d.categoria}`}
                          onClick={() => {
                            if (selecionada) {
                              setDivergenciasSelecionadas(
                                divergenciasSelecionadas.filter(
                                  (s) => !(s.variavel === d.variavel && s.categoria === d.categoria)
                                )
                              );
                            } else {
                              setDivergenciasSelecionadas([...divergenciasSelecionadas, d]);
                            }
                          }}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors',
                            selecionada
                              ? 'bg-orange-500/20 border border-orange-500/30'
                              : 'bg-muted/5 hover:bg-muted/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-foreground">
                              {d.labelVariavel}: <span className="text-muted-foreground">{d.labelCategoria}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400">{d.diferenca.toFixed(1)}%</span>
                            <span className="text-xs text-orange-400 font-medium">
                              +{d.quantidade} eleitores
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {divergenciasSelecionadas.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Selecionadas: </span>
                        {divergenciasSelecionadas.length} categorias |
                        <span className="text-primary font-bold ml-1">
                          Total: {totalCorretivo} eleitores
                        </span>
                      </p>
                      <button
                        onClick={() => setQuantidade(totalCorretivo)}
                        className="mt-2 text-xs text-primary hover:underline"
                      >
                        Ajustar quantidade para {totalCorretivo}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma categoria significativamente sub-representada!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantidade */}
          <div className="glass-card rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Quantidade de Eleitores
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl font-bold text-primary w-16 text-right">{quantidade}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Maximo de 50 eleitores por vez para garantir qualidade
            </p>
          </div>

          {/* Filtros opcionais (apenas em modo normal) */}
          {!usarModoCorretivo && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-medium text-foreground mb-4">Filtros Opcionais</h3>

              {/* Regiao */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Regiao Administrativa (opcional)
                </label>
                <select
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-foreground"
                >
                  <option value="">Todas as regioes</option>
                  {REGIOES_DF.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Cluster */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Wallet className="w-4 h-4 inline mr-1" />
                  Cluster Socioeconomico (opcional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CLUSTERS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCluster(cluster === c.value ? '' : c.value as ClusterSocioeconomico)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        cluster === c.value
                          ? 'bg-primary/20 border-primary text-foreground'
                          : 'bg-secondary border-border hover:border-primary/50 text-muted-foreground'
                      )}
                    >
                      <p className="font-medium text-sm">{c.label}</p>
                      <p className="text-xs opacity-70">{c.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manter proporcoes */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manterProporcoes}
                  onChange={(e) => setManterProporcoes(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-secondary"
                />
                <span className="text-sm text-muted-foreground">
                  Manter proporcoes demograficas do DF
                </span>
              </label>
            </div>
          )}

          {/* Custo estimado */}
          <div className="glass-card rounded-xl p-6 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Custo Estimado
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Usando Claude Opus 4.5 para geracao de alta qualidade
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {custoEstimado.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">aproximado</p>
              </div>
            </div>
          </div>

          {/* Botao gerar */}
          <button
            onClick={() => mutationGerar.mutate()}
            disabled={mutationGerar.isPending || (usarModoCorretivo && divergenciasSelecionadas.length === 0)}
            className={cn(
              'w-full py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
              usarModoCorretivo
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {mutationGerar.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando {quantidade} eleitores...
              </>
            ) : usarModoCorretivo ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Gerar {quantidade} Eleitores Corretivos
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar {quantidade} Eleitores
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resultado */}
          <div className="glass-card rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              {resultado.eleitores.length} Eleitores Gerados!
            </h2>
            <p className="text-muted-foreground">
              Custo total: R$ {resultado.custoReais.toFixed(2)}
            </p>
            {usarModoCorretivo && (
              <p className="text-sm text-orange-400 mt-2">
                Eleitores gerados para corrigir vieses na amostra
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Eleitores Gerados
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {resultado.eleitores.slice(0, 10).map((eleitor) => (
                <div
                  key={eleitor.id}
                  className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{eleitor.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {eleitor.idade} anos | {eleitor.regiao_administrativa} | {eleitor.orientacao_politica}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {eleitor.cluster_socioeconomico}
                  </span>
                </div>
              ))}
              {resultado.eleitores.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  ... e mais {resultado.eleitores.length - 10} eleitores
                </p>
              )}
            </div>
          </div>

          {/* Acoes */}
          <div className="flex gap-4">
            <button
              onClick={() => setResultado(null)}
              className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              Gerar Mais
            </button>
            <button
              onClick={() => mutationSalvar.mutate(resultado.eleitores as Eleitor[])}
              disabled={mutationSalvar.isPending}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {mutationSalvar.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Salvar no Banco
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
