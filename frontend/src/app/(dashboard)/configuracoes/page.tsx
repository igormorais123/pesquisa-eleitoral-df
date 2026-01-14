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
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { db, exportarBanco, importarBanco, limparBanco } from '@/lib/db/dexie';
import { cn } from '@/lib/utils';

export default function PaginaConfiguracoes() {
  const [limiteCusto, setLimiteCusto] = useState(100);
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Erro ao limpar banco de dados');
    } finally {
      setLimpando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Configuracoes
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configuracoes do sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Limite de Custo */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">Limite de Custo por Sessao</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Define o valor maximo em reais para uma sessao de entrevistas
              </p>
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={limiteCusto}
                    onChange={(e) => setLimiteCusto(Number(e.target.value))}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-400">R$ {limiteCusto}</span>
                  </div>
                </div>
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
                    ? 'Esta acao nao pode ser desfeita!'
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
                Os dados sao armazenados localmente no navegador usando IndexedDB.
                Limpar os dados do navegador ou usar o modo anonimo removera todos os eleitores e entrevistas.
                Recomendamos fazer backups regulares.
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
            <p>Sistema de simulacao de pesquisa eleitoral com agentes sinteticos.</p>
            <p>Desenvolvido para analise de cenarios eleitorais do Distrito Federal.</p>
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
