'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db/dexie';
import { useEleitoresStore } from '@/stores/eleitores-store';
import type { Eleitor, ClusterSocioeconomico } from '@/types';
import { cn } from '@/lib/utils';

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

export default function PaginaGerarEleitores() {
  const router = useRouter();
  const { adicionarEleitores } = useEleitoresStore();

  const [quantidade, setQuantidade] = useState(10);
  const [regiao, setRegiao] = useState<string>('');
  const [cluster, setCluster] = useState<ClusterSocioeconomico | ''>('');
  const [manterProporcoes, setManterProporcoes] = useState(true);
  const [resultado, setResultado] = useState<{
    eleitores: Eleitor[];
    custoReais: number;
  } | null>(null);

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
          manterProporcoes,
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

  // Mutation para salvar eleitores
  const mutationSalvar = useMutation({
    mutationFn: async (eleitores: Eleitor[]) => {
      await db.eleitores.bulkAdd(eleitores);
      return eleitores;
    },
    onSuccess: (eleitores) => {
      adicionarEleitores(eleitores);
      toast.success(`${eleitores.length} eleitores salvos no banco!`);
      router.push('/eleitores');
    },
    onError: () => {
      toast.error('Erro ao salvar eleitores');
    },
  });

  const custoEstimado = quantidade * 0.15; // Estimativa aproximada

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/eleitores"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerar Eleitores com IA</h1>
          <p className="text-muted-foreground">Use Claude para criar novos perfis sinteticos</p>
        </div>
      </div>

      {!resultado ? (
        <div className="space-y-6">
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

          {/* Filtros opcionais */}
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
              <div className="grid grid-cols-2 gap-2">
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

          {/* Custo estimado */}
          <div className="glass-card rounded-xl p-6 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Custo Estimado
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Usando Claude Opus para geracao de alta qualidade
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
            disabled={mutationGerar.isPending}
            className="w-full py-4 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutationGerar.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando {quantidade} eleitores...
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
