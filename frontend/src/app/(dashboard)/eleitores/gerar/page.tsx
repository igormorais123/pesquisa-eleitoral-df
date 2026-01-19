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
  Building2,
  Vote,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { useEleitoresStore } from '@/stores/eleitores-store';
import type { Eleitor, ClusterSocioeconomico } from '@/types';
import { cn } from '@/lib/utils';
import { calcularValidacaoEstatistica } from '@/services/validacao-estatistica';
import { labelsVariaveis, labelsValores } from '@/data/dados-referencia-oficiais';

type TipoAgente = 'eleitor' | 'gestor';

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

const TIPOS_AGENTE = [
  {
    value: 'eleitor' as TipoAgente,
    label: 'Eleitores',
    description: 'Cidadãos do DF com perfil político e demográfico',
    icon: Vote,
    cor: 'primary',
  },
  {
    value: 'gestor' as TipoAgente,
    label: 'Gestores',
    description: 'Gestores públicos e privados do DF',
    icon: Building2,
    cor: 'blue',
  },
];

const SETORES_GESTOR = [
  { value: 'governo_federal', label: 'Governo Federal' },
  { value: 'governo_distrital', label: 'Governo Distrital' },
  { value: 'legislativo', label: 'Legislativo' },
  { value: 'judiciario', label: 'Judiciário' },
  { value: 'autarquia', label: 'Autarquia' },
  { value: 'empresa_publica', label: 'Empresa Pública' },
  { value: 'iniciativa_privada', label: 'Iniciativa Privada' },
  { value: 'terceiro_setor', label: 'Terceiro Setor' },
];

const NIVEIS_CARGO = [
  { value: 'diretor', label: 'Diretor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'coordenador', label: 'Coordenador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'assessor', label: 'Assessor' },
  { value: 'secretario', label: 'Secretário' },
];

interface DivergenciaCorretiva {
  variavel: string;
  labelVariavel: string;
  categoria: string;
  labelCategoria: string;
  quantidade: number;
  diferenca: number;
}

export default function PaginaGerarAgentes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adicionarEleitores, eleitores: eleitoresAtuais } = useEleitoresStore();

  // Parâmetros de correção da URL
  const modoCorretivo = searchParams.get('modo') === 'corretivo';
  const corrigirVariavel = searchParams.get('corrigir');
  const corrigirCategoria = searchParams.get('categoria');
  const quantidadeSugerida = searchParams.get('quantidade');

  // Estados principais
  const [tipoAgente, setTipoAgente] = useState<TipoAgente>('eleitor');
  const [quantidade, setQuantidade] = useState(quantidadeSugerida ? parseInt(quantidadeSugerida) : 10);
  const [regiao, setRegiao] = useState<string>('');
  const [cluster, setCluster] = useState<ClusterSocioeconomico | ''>('');
  const [manterProporcoes, setManterProporcoes] = useState(!modoCorretivo && !corrigirVariavel);
  const [usarModoCorretivo, setUsarModoCorretivo] = useState(modoCorretivo || !!corrigirVariavel);
  const [divergenciasSelecionadas, setDivergenciasSelecionadas] = useState<DivergenciaCorretiva[]>([]);

  // Estados específicos para gestores
  const [setorGestor, setSetorGestor] = useState<string>('');
  const [nivelCargo, setNivelCargo] = useState<string>('');

  const [resultado, setResultado] = useState<{
    eleitores: Eleitor[];
    custoReais: number;
  } | null>(null);

  // Labels dinâmicos baseados no tipo
  const labelAgente = tipoAgente === 'eleitor' ? 'eleitores' : 'gestores';
  const labelAgenteSingular = tipoAgente === 'eleitor' ? 'eleitor' : 'gestor';

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

  // Mutation para gerar agentes
  const mutationGerar = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/claude/gerar-agentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoAgente,
          quantidade,
          cluster: cluster || undefined,
          regiao: regiao || undefined,
          manterProporcoes: !usarModoCorretivo && manterProporcoes,
          modoCorretivo: usarModoCorretivo,
          divergenciasParaCorrigir: usarModoCorretivo ? divergenciasSelecionadas : undefined,
          // Parâmetros específicos de gestores
          setorGestor: tipoAgente === 'gestor' ? setorGestor || undefined : undefined,
          nivelCargo: tipoAgente === 'gestor' ? nivelCargo || undefined : undefined,
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || `Erro ao gerar ${labelAgente}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResultado({
        eleitores: data.eleitores || data.gestores,
        custoReais: data.custoReais,
      });
      toast.success(`${(data.eleitores || data.gestores).length} ${labelAgente} gerados com sucesso!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : `Erro ao gerar ${labelAgente}`);
    },
  });

  // Mutation para salvar agentes
  const mutationSalvar = useMutation({
    mutationFn: async (agentes: Eleitor[]) => {
      if (tipoAgente === 'eleitor') {
        await db.eleitores.bulkAdd(agentes);
      } else {
        // Salvar gestores em tabela separada ou adicionar flag
        await db.eleitores.bulkAdd(agentes.map(g => ({ ...g, tipoAgente: 'gestor' })));
      }
      return agentes;
    },
    onSuccess: (agentes) => {
      adicionarEleitores(agentes);
      toast.success(`${agentes.length} ${labelAgente} salvos no banco!`);
      router.push(tipoAgente === 'eleitor' ? '/eleitores' : '/gestores');
    },
    onError: () => {
      toast.error(`Erro ao salvar ${labelAgente}`);
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
          href={tipoAgente === 'eleitor' ? '/eleitores' : '/gestores'}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {usarModoCorretivo ? `Gerar ${labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)} Corretivos` : 'Gerar Agentes com IA'}
          </h1>
          <p className="text-muted-foreground">
            {usarModoCorretivo
              ? `Gerar ${labelAgente} para corrigir vieses na amostra`
              : 'Use Claude Opus 4.5 para criar novos perfis sintéticos'}
          </p>
        </div>
        {!resultado && tipoAgente === 'eleitor' && (
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

      {/* Seletor de Tipo de Agente */}
      {!resultado && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h3 className="font-medium text-foreground mb-4">Tipo de Agente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPOS_AGENTE.map((tipo) => {
              const Icone = tipo.icon;
              const selecionado = tipoAgente === tipo.value;
              return (
                <button
                  key={tipo.value}
                  onClick={() => {
                    setTipoAgente(tipo.value);
                    if (tipo.value === 'gestor') {
                      setUsarModoCorretivo(false);
                    }
                  }}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all flex items-center gap-4',
                    selecionado
                      ? tipo.cor === 'primary'
                        ? 'bg-primary/20 border-primary'
                        : 'bg-blue-500/20 border-blue-500'
                      : 'bg-secondary border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      selecionado
                        ? tipo.cor === 'primary'
                          ? 'bg-primary/30'
                          : 'bg-blue-500/30'
                        : 'bg-muted'
                    )}
                  >
                    <Icone
                      className={cn(
                        'w-6 h-6',
                        selecionado
                          ? tipo.cor === 'primary'
                            ? 'text-primary'
                            : 'text-blue-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tipo.label}</p>
                    <p className="text-xs text-muted-foreground">{tipo.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione as categorias sub-representadas que deseja corrigir:
                  </p>
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
              <h3 className="font-medium text-foreground mb-4">
                Filtros Opcionais {tipoAgente === 'gestor' && '- Gestores'}
              </h3>

              {/* Filtros específicos para Gestores */}
              {tipoAgente === 'gestor' && (
                <>
                  {/* Setor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Setor (opcional)
                    </label>
                    <select
                      value={setorGestor}
                      onChange={(e) => setSetorGestor(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-foreground"
                    >
                      <option value="">Todos os setores</option>
                      {SETORES_GESTOR.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nível de Cargo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Nível de Cargo (opcional)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {NIVEIS_CARGO.map((n) => (
                        <button
                          key={n.value}
                          onClick={() => setNivelCargo(nivelCargo === n.value ? '' : n.value)}
                          className={cn(
                            'p-2 rounded-lg border text-center transition-all text-sm',
                            nivelCargo === n.value
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                              : 'bg-secondary border-border hover:border-blue-500/50 text-muted-foreground'
                          )}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Filtros para Eleitores */}
              {tipoAgente === 'eleitor' && (
                <>
                  {/* Regiao */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Região Administrativa (opcional)
                    </label>
                    <select
                      value={regiao}
                      onChange={(e) => setRegiao(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-foreground"
                    >
                      <option value="">Todas as regiões</option>
                      {REGIOES_DF.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cluster */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Wallet className="w-4 h-4 inline mr-1" />
                      Cluster Socioeconômico (opcional)
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
                      Manter proporções demográficas do DF
                    </span>
                  </label>
                </>
              )}
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
                : tipoAgente === 'gestor'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            )}
          >
            {mutationGerar.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando {quantidade} {labelAgente}...
              </>
            ) : usarModoCorretivo ? (
              <>
                <RefreshCw className="w-5 h-5" />
                Gerar {quantidade} {labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)} Corretivos
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar {quantidade} {labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resultado */}
          <div className="glass-card rounded-xl p-6 text-center">
            <CheckCircle className={cn(
              'w-16 h-16 mx-auto mb-4',
              tipoAgente === 'gestor' ? 'text-blue-400' : 'text-green-400'
            )} />
            <h2 className="text-xl font-bold text-foreground mb-2">
              {resultado.eleitores.length} {labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)} Gerados!
            </h2>
            <p className="text-muted-foreground">
              Custo total: R$ {resultado.custoReais.toFixed(2)}
            </p>
            {usarModoCorretivo && (
              <p className="text-sm text-orange-400 mt-2">
                {labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)} gerados para corrigir vieses na amostra
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              {tipoAgente === 'gestor' ? (
                <Building2 className="w-5 h-5 text-blue-400" />
              ) : (
                <Users className="w-5 h-5 text-primary" />
              )}
              {labelAgente.charAt(0).toUpperCase() + labelAgente.slice(1)} Gerados
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {resultado.eleitores.slice(0, 10).map((agente) => (
                <div
                  key={agente.id}
                  className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{agente.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {tipoAgente === 'gestor' ? (
                        <>{(agente as any).cargo || 'Gestor'} | {(agente as any).setor || 'Setor'}</>
                      ) : (
                        <>{agente.idade} anos | {agente.regiao_administrativa} | {agente.orientacao_politica}</>
                      )}
                    </p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded',
                    tipoAgente === 'gestor' ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary text-muted-foreground'
                  )}>
                    {tipoAgente === 'gestor' ? (agente as any).nivel_cargo || 'Gestor' : agente.cluster_socioeconomico}
                  </span>
                </div>
              ))}
              {resultado.eleitores.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  ... e mais {resultado.eleitores.length - 10} {labelAgente}
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
