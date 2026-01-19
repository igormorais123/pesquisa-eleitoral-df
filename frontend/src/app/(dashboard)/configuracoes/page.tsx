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
  ModeloIA,
  ProvedorIA,
  usdParaBrl,
} from '@/stores/modelos-ia-store';

// Ícones por provedor
const ICONES_PROVEDOR: Record<ProvedorIA, React.ReactNode> = {
  anthropic: <Brain className="w-5 h-5" />,
  openai: <Sparkles className="w-5 h-5" />,
  google: <Globe className="w-5 h-5" />,
  deepseek: <Zap className="w-5 h-5" />,
  ollama: <Server className="w-5 h-5" />,
};

// Componente de card de modelo
function CardModelo({
  modelo,
  selecionado,
  onSelecionar,
  temChave,
}: {
  modelo: ModeloIA;
  selecionado: boolean;
  onSelecionar: () => void;
  temChave: boolean;
}) {
  const podeUsar = temChave || modelo.gratuito;

  return (
    <button
      onClick={onSelecionar}
      disabled={!podeUsar}
      className={cn(
        'w-full p-4 rounded-xl text-left transition-all border-2',
        selecionado
          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
          : podeUsar
          ? 'border-border hover:border-primary/50 bg-card'
          : 'border-border/50 bg-card/50 opacity-60 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{modelo.nome}</span>
            {modelo.gratuito && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                GRÁTIS
              </span>
            )}
            {selecionado && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {modelo.descricao}
          </p>
        </div>
      </div>

      {/* Preços */}
      <div className="mt-3 pt-3 border-t border-border/50">
        {modelo.gratuito ? (
          <div className="text-green-400 font-semibold">
            100% Gratuito (Local)
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Input:</span>
              <span className="ml-1 text-foreground font-medium">
                ${modelo.precoInput.toFixed(2)}/MTok
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Output:</span>
              <span className="ml-1 text-foreground font-medium">
                ${modelo.precoOutput.toFixed(2)}/MTok
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Características */}
      <div className="mt-2 flex flex-wrap gap-1">
        {modelo.caracteristicas.slice(0, 3).map((car) => (
          <span
            key={car}
            className="px-2 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground"
          >
            {car}
          </span>
        ))}
      </div>

      {!podeUsar && (
        <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
          <Key className="w-3 h-3" />
          Configure a API key para usar
        </div>
      )}
    </button>
  );
}

// Componente de seção de provedor
function SecaoProvedor({
  provedor,
  expandido,
  onToggle,
}: {
  provedor: ProvedorIA;
  expandido: boolean;
  onToggle: () => void;
}) {
  const { modeloSelecionado, setModeloSelecionado, chavesAPI, setChaveAPI, removerChaveAPI, temChaveConfigurada } =
    useModelosIAStore();
  const [mostrarChave, setMostrarChave] = useState(false);
  const [chaveTemp, setChaveTemp] = useState('');
  const [salvando, setSalvando] = useState(false);

  const info = INFO_PROVEDORES[provedor];
  const modelos = CATALOGO_MODELOS.filter((m) => m.provedor === provedor);
  const temChave = temChaveConfigurada(provedor);
  const chaveAtual = chavesAPI[provedor as keyof typeof chavesAPI] || '';

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
          'w-full p-4 flex items-center gap-4 transition-colors',
          `bg-gradient-to-r ${info.cor} bg-opacity-10`
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
          {ICONES_PROVEDOR[provedor]}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-white">{info.nome}</h3>
          <p className="text-xs text-white/70">{info.descricao}</p>
        </div>
        <div className="flex items-center gap-2">
          {temChave && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Configurado
            </span>
          )}
          {expandido ? (
            <ChevronUp className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/70" />
          )}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expandido && (
        <div className="p-4 space-y-4">
          {/* Config de API Key (exceto Ollama) */}
          {provedor !== 'ollama' ? (
            <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  API Key
                </span>
                <a
                  href={info.urlCadastro}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Obter chave <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {chaveAtual ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 rounded bg-secondary font-mono text-xs">
                      {mostrarChave ? chaveAtual : '••••••••••••••••••••' + chaveAtual.slice(-4)}
                    </div>
                    <button
                      onClick={() => setMostrarChave(!mostrarChave)}
                      className="p-2 rounded hover:bg-secondary"
                    >
                      {mostrarChave ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => removerChaveAPI(provedor)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remover chave
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={chaveTemp}
                    onChange={(e) => setChaveTemp(e.target.value)}
                    placeholder={`Cole sua API key da ${info.nome}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm border border-border focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={salvarChave}
                    disabled={!chaveTemp.trim() || salvando}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Salvar
                  </button>
                </div>
              )}

              <div className="flex gap-4 text-xs text-muted-foreground">
                <a
                  href={info.urlPricing}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" /> Ver preços
                </a>
                <a
                  href={modelos[0]?.urlDocs || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  <Info className="w-3 h-3" /> Documentação
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-400 font-medium">Modelos Locais Gratuitos</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instale o Ollama em seu computador para rodar modelos de IA localmente,
                    sem custos e com total privacidade.
                  </p>
                  <a
                    href="https://ollama.ai/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                  >
                    Baixar Ollama <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Lista de modelos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modelos.map((modelo) => (
              <CardModelo
                key={modelo.id}
                modelo={modelo}
                selecionado={modeloSelecionado === modelo.id}
                onSelecionar={() => setModeloSelecionado(modelo.id)}
                temChave={temChave}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de comparação de preços
function TabelaComparacao() {
  const modelosOrdenados = [...CATALOGO_MODELOS]
    .filter((m) => !m.gratuito)
    .sort((a, b) => a.precoInput - b.precoInput);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Modelo</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Input/MTok</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">Output/MTok</th>
            <th className="text-right py-2 px-3 text-muted-foreground font-medium">~100 perguntas*</th>
          </tr>
        </thead>
        <tbody>
          {modelosOrdenados.map((modelo) => {
            // Estimativa: 100 perguntas ≈ 50k input + 100k output tokens
            const custo100 = (50000 / 1_000_000) * modelo.precoInput + (100000 / 1_000_000) * modelo.precoOutput;
            return (
              <tr key={modelo.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{modelo.nome}</span>
                    <span className="text-xs text-muted-foreground">({modelo.versao})</span>
                  </div>
                </td>
                <td className="text-right py-2 px-3 text-green-400 font-mono">
                  ${modelo.precoInput.toFixed(2)}
                </td>
                <td className="text-right py-2 px-3 text-amber-400 font-mono">
                  ${modelo.precoOutput.toFixed(2)}
                </td>
                <td className="text-right py-2 px-3">
                  <div className="text-foreground font-medium">${custo100.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    ~R$ {usdParaBrl(custo100).toFixed(2)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground mt-2">
        * Estimativa baseada em ~500 tokens input + 1000 tokens output por pergunta
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

  const { modeloSelecionado, getModeloAtual } = useModelosIAStore();

  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);
  const [provedorExpandido, setProvedorExpandido] = useState<ProvedorIA | null>('anthropic');
  const [mostrarComparacao, setMostrarComparacao] = useState(false);

  const modeloAtual = getModeloAtual();

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie modelos de IA, chaves de API e configurações do sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Modelo Selecionado Atual */}
        {modeloAtual && (
          <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Modelo de IA Selecionado</p>
                <h2 className="text-xl font-bold text-foreground">{modeloAtual.nome}</h2>
                <p className="text-sm text-muted-foreground mt-1">{modeloAtual.descricao}</p>
              </div>
              <div className="text-right">
                {modeloAtual.gratuito ? (
                  <span className="text-lg font-bold text-green-400">Gratuito</span>
                ) : (
                  <>
                    <p className="text-lg font-bold text-foreground">
                      ${modeloAtual.precoInput.toFixed(2)} / ${modeloAtual.precoOutput.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">input / output por MTok</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seção de Modelos de IA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Modelos de IA Disponíveis
            </h2>
            <button
              onClick={() => setMostrarComparacao(!mostrarComparacao)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <DollarSign className="w-4 h-4" />
              {mostrarComparacao ? 'Ocultar comparação' : 'Comparar preços'}
            </button>
          </div>

          {/* Tabela de comparação */}
          {mostrarComparacao && (
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-medium text-foreground mb-3">Comparação de Preços (USD)</h3>
              <TabelaComparacao />
            </div>
          )}

          {/* Provedores */}
          {(['anthropic', 'openai', 'google', 'deepseek', 'ollama'] as ProvedorIA[]).map((provedor) => (
            <SecaoProvedor
              key={provedor}
              provedor={provedor}
              expandido={provedorExpandido === provedor}
              onToggle={() => setProvedorExpandido(provedorExpandido === provedor ? null : provedor)}
            />
          ))}
        </div>

        {/* Limite de Custo */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Limite de Custo por Sessão</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Define o valor máximo em reais para uma sessão de entrevistas
              </p>
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={limiteCustoPorSessao}
                    onChange={(e) => setLimiteCusto(Number(e.target.value))}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-400">R$ {limiteCustoPorSessao}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Configuração salva automaticamente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {notificacoesAtivas ? (
                <Bell className="w-5 h-5 text-amber-400" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receba alertas sobre eventos do sistema
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNotificacoesAtivas(!notificacoesAtivas);
                    if (!notificacoesAtivas) {
                      notify.success('Notificações ativadas', 'Você receberá alertas do sistema.');
                    }
                  }}
                  className={cn(
                    'relative w-14 h-7 rounded-full transition-colors',
                    notificacoesAtivas ? 'bg-amber-500' : 'bg-secondary'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-5 h-5 rounded-full bg-white transition-all',
                      notificacoesAtivas ? 'left-8' : 'left-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Banco de Dados */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Banco de Dados Local</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie o banco IndexedDB local do navegador
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Exportar */}
            <button
              onClick={handleExportar}
              disabled={exportando}
              className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
            >
              {exportando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-blue-400" />
              )}
              <div className="text-left flex-1">
                <p className="font-medium">Exportar Backup</p>
                <p className="text-xs text-muted-foreground">
                  Baixe todos os dados em formato JSON
                </p>
              </div>
            </button>

            {/* Importar */}
            <label className="w-full flex items-center gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer">
              {importando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-green-400" />
              )}
              <div className="text-left flex-1">
                <p className="font-medium">Importar Backup</p>
                <p className="text-xs text-muted-foreground">
                  Restaure dados de um arquivo JSON
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportar}
                disabled={importando}
                className="hidden"
              />
            </label>

            {/* Limpar */}
            <button
              onClick={handleLimpar}
              disabled={limpando}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-lg transition-colors',
                confirmarLimpeza
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : 'bg-secondary hover:bg-secondary/80',
                'disabled:opacity-50'
              )}
            >
              {limpando ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className={cn('w-5 h-5', confirmarLimpeza ? 'text-red-400' : 'text-muted-foreground')} />
              )}
              <div className="text-left flex-1">
                <p className={cn('font-medium', confirmarLimpeza && 'text-red-400')}>
                  {confirmarLimpeza ? 'Clique novamente para confirmar' : 'Limpar Banco de Dados'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {confirmarLimpeza
                    ? 'Esta ação não pode ser desfeita!'
                    : 'Remove todos os dados locais'}
                </p>
              </div>
            </button>

            {confirmarLimpeza && (
              <button
                onClick={() => setConfirmarLimpeza(false)}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Aviso */}
        <div className="glass-card rounded-xl p-6 bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-400">Importante</h3>
              <p className="text-sm text-muted-foreground mt-1">
                As chaves de API são armazenadas localmente no navegador usando LocalStorage.
                Nunca compartilhe suas chaves. Limpar os dados do navegador ou usar o modo anônimo
                removerá todas as configurações. Recomendamos fazer backups regulares.
              </p>
            </div>
          </div>
        </div>

        {/* Sobre */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Sobre o Sistema</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Pesquisa Eleitoral DF 2026</strong>
            </p>
            <p>Sistema de simulação de pesquisa eleitoral com agentes sintéticos.</p>
            <p>Desenvolvido para análise de cenários eleitorais do Distrito Federal.</p>
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-xs">
                Powered by Claude AI | Next.js 14 | FastAPI | IndexedDB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
