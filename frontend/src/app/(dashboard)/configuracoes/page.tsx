'use client';

import { useState } from 'react';
import {
  Settings,
  Database,
  Trash2,
  Download,
  Upload,
  DollarSign,
  AlertTriangle,
  Loader2,
  Bell,
  BellOff,
  Cpu,
  Key,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  Zap,
  Brain,
  Globe,
  Server,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Gift,
  Rocket,
  Target,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportarBanco, importarBanco, limparBanco } from '@/lib/db/dexie';
import { cn } from '@/lib/utils';
import { useConfiguracoesStore } from '@/stores/configuracoes-store';
import { notify } from '@/stores/notifications-store';
import {
  useModelosIAStore,
  CATALOGO_MODELOS,
  INFO_PROVEDORES,
  DESCRICAO_TAREFAS,
  ModeloIA,
  ProvedorIA,
  TipoTarefa,
  usdParaBrl,
  estimarCustoEntrevistas,
  getModelosOrdenadosPorPreco,
} from '@/stores/modelos-ia-store';

// Ícones por provedor
const ICONES_PROVEDOR: Record<ProvedorIA, React.ReactNode> = {
  anthropic: <Brain className="w-5 h-5" />,
  openai: <Sparkles className="w-5 h-5" />,
  google: <Globe className="w-5 h-5" />,
  deepseek: <Zap className="w-5 h-5" />,
  groq: <Rocket className="w-5 h-5" />,
  mistral: <Target className="w-5 h-5" />,
  cohere: <Search className="w-5 h-5" />,
  together: <Sparkles className="w-5 h-5" />,
  openrouter: <Globe className="w-5 h-5" />,
  ollama: <Server className="w-5 h-5" />,
  lmstudio: <Cpu className="w-5 h-5" />,
};

// Componente de seleção de modelo para tarefa
function SeletorModeloTarefa({
  tarefa,
  modeloId,
  onChange,
}: {
  tarefa: TipoTarefa;
  modeloId: string;
  onChange: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const { temChaveConfigurada } = useModelosIAStore();
  const info = DESCRICAO_TAREFAS[tarefa];
  const modeloAtual = CATALOGO_MODELOS.find((m) => m.id === modeloId);
  const modelosRecomendados = CATALOGO_MODELOS.filter((m) => m.recomendadoPara.includes(tarefa));

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.icone}</span>
          <div>
            <h4 className="font-medium text-foreground">{info.nome}</h4>
            <p className="text-xs text-muted-foreground">{info.descricao}</p>
          </div>
        </div>
        <button
          onClick={() => setAberto(!aberto)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {aberto ? 'Fechar' : 'Alterar'}
          {aberto ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Modelo atual */}
      {modeloAtual && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary">
              {ICONES_PROVEDOR[modeloAtual.provedor]}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{modeloAtual.nome}</span>
              <span className="text-xs text-muted-foreground ml-2">({modeloAtual.versao})</span>
            </div>
          </div>
          <div className="text-right">
            {modeloAtual.gratuito ? (
              <span className="text-xs text-green-400 font-medium">Grátis</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                ${(modeloAtual.precoInput + modeloAtual.precoOutput).toFixed(2)}/MTok
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lista de modelos */}
      {aberto && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-2">{info.recomendacao}</p>
          {modelosRecomendados.map((modelo) => {
            const podeUsar = modelo.gratuito || temChaveConfigurada(modelo.provedor);
            return (
              <button
                key={modelo.id}
                onClick={() => {
                  if (podeUsar) {
                    onChange(modelo.id);
                    setAberto(false);
                  }
                }}
                disabled={!podeUsar}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-lg text-left transition-all',
                  modeloId === modelo.id
                    ? 'bg-primary/10 border border-primary/30'
                    : podeUsar
                    ? 'bg-secondary/50 hover:bg-secondary border border-transparent'
                    : 'bg-secondary/20 opacity-50 cursor-not-allowed border border-transparent'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-muted-foreground">
                    {ICONES_PROVEDOR[modelo.provedor]}
                  </div>
                  <div>
                    <span className="text-sm text-foreground">{modelo.nome}</span>
                    {modelo.tierGratuito && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-400">
                        {modelo.tierGratuito}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {modelo.gratuito ? (
                    <span className="text-xs text-green-400">Grátis</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      ${modelo.precoInput.toFixed(2)}/${modelo.precoOutput.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Componente de seção de provedor compacta
function SecaoProvedorCompacta({
  provedor,
  expandido,
  onToggle,
}: {
  provedor: ProvedorIA;
  expandido: boolean;
  onToggle: () => void;
}) {
  const { chavesAPI, setChaveAPI, removerChaveAPI, temChaveConfigurada, setModeloPadrao, modeloPadrao } =
    useModelosIAStore();
  const [mostrarChave, setMostrarChave] = useState(false);
  const [chaveTemp, setChaveTemp] = useState('');
  const [salvando, setSalvando] = useState(false);

  const info = INFO_PROVEDORES[provedor];
  const modelos = CATALOGO_MODELOS.filter((m) => m.provedor === provedor);
  const temChave = temChaveConfigurada(provedor);
  const chaveAtual = chavesAPI[provedor as keyof typeof chavesAPI] || '';
  const isLocal = provedor === 'ollama' || provedor === 'lmstudio';

  const salvarChave = async () => {
    if (!chaveTemp.trim()) return;
    setSalvando(true);
    try {
      setChaveAPI(provedor, chaveTemp.trim());
      setChaveTemp('');
      toast.success(`Chave da ${info.nome} salva com sucesso!`);
    } catch {
      toast.error('Erro ao salvar chave');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full p-3 flex items-center gap-3 transition-colors',
          `bg-gradient-to-r ${info.cor}`
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
          {ICONES_PROVEDOR[provedor]}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">{info.nome}</h3>
            {info.temTierGratuito && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/20 text-white flex items-center gap-1">
                <Gift className="w-3 h-3" /> Grátis
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/70">{modelos.length} modelos disponíveis</p>
        </div>
        <div className="flex items-center gap-2">
          {temChave && !isLocal && (
            <Check className="w-4 h-4 text-white" />
          )}
          {expandido ? (
            <ChevronUp className="w-4 h-4 text-white/70" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/70" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expandido && (
        <div className="p-3 space-y-3">
          {/* Config de API Key (exceto locais) */}
          {!isLocal ? (
            <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Key className="w-3 h-3 text-primary" />
                  API Key
                </span>
                <a
                  href={info.urlCadastro}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary hover:underline flex items-center gap-1"
                >
                  Obter <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {info.tierGratuito && (
                <p className="text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  ✨ {info.tierGratuito}
                </p>
              )}

              {chaveAtual ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-1.5 rounded bg-secondary font-mono text-[10px] truncate">
                    {mostrarChave ? chaveAtual : '••••••••' + chaveAtual.slice(-4)}
                  </div>
                  <button
                    onClick={() => setMostrarChave(!mostrarChave)}
                    className="p-1.5 rounded hover:bg-secondary"
                  >
                    {mostrarChave ? (
                      <EyeOff className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Eye className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => removerChaveAPI(provedor)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={chaveTemp}
                    onChange={(e) => setChaveTemp(e.target.value)}
                    placeholder="Cole sua API key"
                    className="flex-1 px-2 py-1.5 rounded-lg bg-secondary text-foreground text-xs border border-border focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={salvarChave}
                    disabled={!chaveTemp.trim() || salvando}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
                  >
                    {salvando ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-xs text-green-400 font-medium flex items-center gap-2">
                <Server className="w-4 h-4" />
                Modelos Locais - 100% Gratuito
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {provedor === 'ollama'
                  ? 'Instale o Ollama para rodar modelos localmente'
                  : 'Instale o LM Studio para uma interface gráfica'}
              </p>
              <a
                href={info.urlCadastro}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
              >
                Baixar {info.nome} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Lista de modelos compacta */}
          <div className="space-y-1.5">
            {modelos.map((modelo) => (
              <button
                key={modelo.id}
                onClick={() => setModeloPadrao(modelo.id)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-xs',
                  modeloPadrao === modelo.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{modelo.nome}</span>
                    {modelo.gratuito && (
                      <span className="px-1 py-0.5 text-[9px] rounded bg-green-500/20 text-green-400">
                        GRÁTIS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{modelo.descricao}</p>
                </div>
                <div className="text-right ml-2">
                  {modelo.gratuito ? (
                    <span className="text-green-400 font-medium">$0</span>
                  ) : (
                    <div>
                      <p className="text-foreground">${modelo.precoInput.toFixed(2)}</p>
                      <p className="text-muted-foreground text-[10px]">${modelo.precoOutput.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de comparação de preços
function TabelaComparacaoCompacta() {
  const modelosOrdenados = getModelosOrdenadosPorPreco(true).slice(0, 15);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">Modelo</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">In/Out</th>
            <th className="text-right py-2 px-2 text-muted-foreground font-medium">100 entrev.*</th>
          </tr>
        </thead>
        <tbody>
          {modelosOrdenados.map((modelo) => {
            const custo = estimarCustoEntrevistas(modelo, 100, 10);
            return (
              <tr key={modelo.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-1.5 px-2">
                  <span className="text-foreground">{modelo.nome}</span>
                </td>
                <td className="text-right py-1.5 px-2 text-muted-foreground font-mono">
                  {modelo.gratuito
                    ? 'Grátis'
                    : `$${modelo.precoInput.toFixed(2)}/$${modelo.precoOutput.toFixed(2)}`}
                </td>
                <td className="text-right py-1.5 px-2">
                  {modelo.gratuito ? (
                    <span className="text-green-400">$0</span>
                  ) : (
                    <div>
                      <span className="text-foreground">${custo.custoComMargem.toFixed(2)}</span>
                      <span className="text-muted-foreground ml-1">
                        (~R${usdParaBrl(custo.custoComMargem).toFixed(0)})
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-2">
        * Estimativa: 10 perguntas/entrev., ~500 tokens input, ~1000 tokens output, +20% margem
      </p>
    </div>
  );
}

export default function PaginaConfiguracoes() {
  const {
    limiteCustoPorSessao,
    notificacoesAtivas,
    setLimiteCusto,
    setNotificacoesAtivas,
  } = useConfiguracoesStore();

  const {
    modeloPadrao,
    configuracaoTarefas,
    setModeloParaTarefa,
    getModeloPadrao,
  } = useModelosIAStore();

  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);
  const [provedorExpandido, setProvedorExpandido] = useState<ProvedorIA | null>(null);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'tarefas' | 'provedores' | 'comparacao'>('tarefas');

  const modeloAtual = getModeloPadrao();

  // Exportar banco
  const handleExportar = async () => {
    setExportando(true);
    try {
      const dados = await exportarBanco();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pesquisa-eleitoral-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados');
    } finally {
      setExportando(false);
    }
  };

  // Importar banco
  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    try {
      const texto = await file.text();
      const dados = JSON.parse(texto);
      await importarBanco(dados);
      toast.success('Backup importado com sucesso!');
      window.location.reload();
    } catch {
      toast.error('Erro ao importar dados');
    } finally {
      setImportando(false);
    }
  };

  // Limpar banco
  const handleLimpar = async () => {
    if (!confirmarLimpeza) {
      setConfirmarLimpeza(true);
      return;
    }

    setLimpando(true);
    try {
      await limparBanco();
      toast.success('Banco de dados limpo com sucesso!');
      setConfirmarLimpeza(false);
      window.location.reload();
    } catch {
      toast.error('Erro ao limpar banco de dados');
    } finally {
      setLimpando(false);
    }
  };

  const provedores: ProvedorIA[] = [
    'anthropic', 'openai', 'google', 'deepseek', 'groq',
    'mistral', 'cohere', 'together', 'openrouter', 'ollama', 'lmstudio'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure modelos de IA para cada tipo de tarefa
        </p>
      </div>

      <div className="space-y-6">
        {/* Modelo Padrão Atual */}
        {modeloAtual && (
          <div className="glass-card rounded-xl p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Modelo Padrão</p>
                <h2 className="text-lg font-bold text-foreground">{modeloAtual.nome}</h2>
              </div>
              <div className="text-right">
                {modeloAtual.gratuito ? (
                  <span className="text-lg font-bold text-green-400">Grátis</span>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      ${(modeloAtual.precoInput + modeloAtual.precoOutput).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">por MTok (in+out)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Abas de Navegação */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { id: 'tarefas', label: 'Por Tarefa', icon: Target },
            { id: 'provedores', label: 'Provedores (APIs)', icon: Key },
            { id: 'comparacao', label: 'Comparar Preços', icon: DollarSign },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setAbaAtiva(id as typeof abaAtiva)}
              className={cn(
                'px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-colors',
                abaAtiva === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'tarefas' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Configuração por Tipo de Tarefa</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha qual modelo de IA usar para cada tipo de operação do sistema.
              Isso permite otimizar custos usando modelos econômicos para tarefas simples
              e modelos premium para análises complexas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(DESCRICAO_TAREFAS) as TipoTarefa[]).map((tarefa) => (
                <SeletorModeloTarefa
                  key={tarefa}
                  tarefa={tarefa}
                  modeloId={configuracaoTarefas[tarefa]}
                  onChange={(id) => setModeloParaTarefa(tarefa, id)}
                />
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'provedores' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Provedores de IA (11 disponíveis)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure as chaves de API dos provedores que você deseja usar.
              Muitos oferecem tier gratuito generoso para começar!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {provedores.map((provedor) => (
                <SecaoProvedorCompacta
                  key={provedor}
                  provedor={provedor}
                  expandido={provedorExpandido === provedor}
                  onToggle={() => setProvedorExpandido(provedorExpandido === provedor ? null : provedor)}
                />
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'comparacao' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Comparação de Preços</h2>
            </div>
            <div className="glass-card rounded-xl p-4">
              <TabelaComparacaoCompacta />
            </div>

            {/* Resumo de custos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 bg-green-500/10 border border-green-500/30">
                <h3 className="text-sm font-medium text-green-400 mb-2">💰 Mais Baratos (Pagos)</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• DeepSeek R1 Distill: $0.17/MTok</li>
                  <li>• Gemini Flash-Lite: $0.19/MTok</li>
                  <li>• Groq Llama 8B: $0.13/MTok</li>
                </ul>
              </div>
              <div className="glass-card rounded-xl p-4 bg-blue-500/10 border border-blue-500/30">
                <h3 className="text-sm font-medium text-blue-400 mb-2">🎁 Melhores Tiers Grátis</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Mistral: 1B tokens/mês</li>
                  <li>• Groq: 14400 req/dia</li>
                  <li>• Google: 1000 req/dia</li>
                </ul>
              </div>
              <div className="glass-card rounded-xl p-4 bg-purple-500/10 border border-purple-500/30">
                <h3 className="text-sm font-medium text-purple-400 mb-2">🖥️ Locais (100% Grátis)</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Ollama: 10+ modelos</li>
                  <li>• LM Studio: GUI + qualquer GGUF</li>
                  <li>• Precisa: 8-32GB RAM</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Limite de Custo */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Limite de Custo por Sessão</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Valor máximo em reais para uma sessão de entrevistas
              </p>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={limiteCustoPorSessao}
                  onChange={(e) => setLimiteCusto(Number(e.target.value))}
                  className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <span className="text-xl font-bold text-green-400 w-24 text-right">
                  R$ {limiteCustoPorSessao}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                {notificacoesAtivas ? (
                  <Bell className="w-5 h-5 text-amber-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notificações</h2>
                <p className="text-xs text-muted-foreground">Alertas do sistema</p>
              </div>
            </div>
            <button
              onClick={() => {
                setNotificacoesAtivas(!notificacoesAtivas);
                if (!notificacoesAtivas) {
                  notify.success('Notificações ativadas', 'Você receberá alertas do sistema.');
                }
              }}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                notificacoesAtivas ? 'bg-amber-500' : 'bg-secondary'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                  notificacoesAtivas ? 'left-7' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>

        {/* Banco de Dados */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Banco de Dados Local</h2>
              <p className="text-xs text-muted-foreground">Backup e restauração</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleExportar}
              disabled={exportando}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              {exportando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-xs">Exportar</span>
            </button>

            <label className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer">
              {importando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-green-400" />
              )}
              <span className="text-xs">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportar}
                disabled={importando}
                className="hidden"
              />
            </label>

            <button
              onClick={handleLimpar}
              disabled={limpando}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-lg transition-colors',
                confirmarLimpeza
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
              {limpando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className={cn('w-5 h-5', confirmarLimpeza ? 'text-red-400' : 'text-muted-foreground')} />
              )}
              <span className={cn('text-xs', confirmarLimpeza && 'text-red-400')}>
                {confirmarLimpeza ? 'Confirmar?' : 'Limpar'}
              </span>
            </button>
          </div>

          {confirmarLimpeza && (
            <button
              onClick={() => setConfirmarLimpeza(false)}
              className="w-full mt-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Aviso */}
        <div className="glass-card rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-400 text-sm">Importante</h3>
              <p className="text-xs text-muted-foreground mt-1">
                As chaves de API são armazenadas localmente no navegador.
                Nunca compartilhe suas chaves. Para rodar entrevistas em background,
                considere usar IAs locais (Ollama/LM Studio) ou APIs com tier gratuito generoso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
