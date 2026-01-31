'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import {
  StatusOraculo,
  ContatoWhatsApp,
  ContatoWhatsAppCreate,
  FiltrosContato,
  buscarStatusOraculo,
  listarContatos,
  criarContato,
} from '@/services/whatsapp-api';
import { MetricasWhatsApp } from '@/components/whatsapp/MetricasWhatsApp';
import { ContatosTable } from '@/components/whatsapp/ContatosTable';
import { ConversasView } from '@/components/whatsapp/ConversasView';

export default function WhatsAppPage() {
  // Estado
  const [status, setStatus] = useState<StatusOraculo | null>(null);
  const [contatos, setContatos] = useState<ContatoWhatsApp[]>([]);
  const [carregandoStatus, setCarregandoStatus] = useState(true);
  const [carregandoContatos, setCarregandoContatos] = useState(true);
  const [contatoSelecionado, setContatoSelecionado] = useState<number | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosContato>({});

  // Formulario novo contato
  const [novoContato, setNovoContato] = useState<ContatoWhatsAppCreate>({
    telefone: '',
    nome: '',
    tipo: 'cliente',
    plano: 'consultor',
  });
  const [salvando, setSalvando] = useState(false);

  // Carregar status
  const carregarStatus = useCallback(async () => {
    setCarregandoStatus(true);
    try {
      const dados = await buscarStatusOraculo();
      setStatus(dados);
    } catch {
      console.error('Erro ao carregar status do Oraculo');
    } finally {
      setCarregandoStatus(false);
    }
  }, []);

  // Carregar contatos
  const carregarContatos = useCallback(async () => {
    setCarregandoContatos(true);
    try {
      const dados = await listarContatos(filtros);
      setContatos(dados);
    } catch {
      toast.error('Erro ao carregar contatos');
    } finally {
      setCarregandoContatos(false);
    }
  }, [filtros]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarStatus();
    carregarContatos();
  }, [carregarStatus, carregarContatos]);

  // Criar contato
  const handleCriarContato = useCallback(async () => {
    if (!novoContato.nome.trim() || !novoContato.telefone.trim()) {
      toast.error('Preencha nome e telefone');
      return;
    }

    setSalvando(true);
    try {
      await criarContato(novoContato);
      toast.success('Contato criado com sucesso');
      setMostrarFormulario(false);
      setNovoContato({ telefone: '', nome: '', tipo: 'cliente', plano: 'consultor' });
      carregarContatos();
      carregarStatus();
    } catch {
      toast.error('Erro ao criar contato');
    } finally {
      setSalvando(false);
    }
  }, [novoContato, carregarContatos, carregarStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-500">W</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Oraculo Eleitoral{' '}
                <span className="text-amber-500">WhatsApp</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestao de contatos e conversas do Oraculo via WhatsApp
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo Contato
        </button>
      </div>

      {/* Metricas */}
      <MetricasWhatsApp status={status} carregando={carregandoStatus} />

      {/* Filtros */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={filtros.busca || ''}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, busca: e.target.value || undefined }))
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
            />
          </div>

          <select
            value={filtros.tipo || ''}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                tipo: (e.target.value as FiltrosContato['tipo']) || undefined,
              }))
            }
            className="px-4 py-2 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="cliente">Cliente</option>
            <option value="cabo_eleitoral">Cabo Eleitoral</option>
            <option value="candidato">Candidato</option>
          </select>

          <select
            value={filtros.plano || ''}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                plano: (e.target.value as FiltrosContato['plano']) || undefined,
              }))
            }
            className="px-4 py-2 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
          >
            <option value="">Todos os planos</option>
            <option value="consultor">Consultor</option>
            <option value="estrategista">Estrategista</option>
            <option value="war_room">War Room</option>
          </select>

          <select
            value={filtros.ativo === undefined ? '' : filtros.ativo.toString()}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                ativo: e.target.value === '' ? undefined : e.target.value === 'true',
              }))
            }
            className="px-4 py-2 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Contatos */}
      <ContatosTable
        contatos={contatos}
        carregando={carregandoContatos}
        onContatoSelecionado={(id) => setContatoSelecionado(id)}
        onAtualizar={() => {
          carregarContatos();
          carregarStatus();
        }}
      />

      {/* Visualizador de Conversas */}
      {contatoSelecionado !== null && (
        <ConversasView
          contatoId={contatoSelecionado}
          onFechar={() => setContatoSelecionado(null)}
        />
      )}

      {/* Modal / Dialog de Novo Contato */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMostrarFormulario(false)}
          />

          {/* Dialog */}
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Dialog Header */}
            <div className="px-6 py-4 bg-[#0f172a]/80 dark:bg-[#0f172a] border-b border-border">
              <h2 className="text-lg font-semibold text-slate-200">
                Novo Contato WhatsApp
              </h2>
              <p className="text-sm text-slate-400">
                Adicione um contato ao Oraculo Eleitoral
              </p>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={novoContato.nome}
                  onChange={(e) =>
                    setNovoContato((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  placeholder="Nome completo"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={novoContato.telefone}
                  onChange={(e) =>
                    setNovoContato((prev) => ({ ...prev, telefone: e.target.value }))
                  }
                  placeholder="+55 61 99999-9999"
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tipo
                </label>
                <select
                  value={novoContato.tipo}
                  onChange={(e) =>
                    setNovoContato((prev) => ({
                      ...prev,
                      tipo: e.target.value as ContatoWhatsAppCreate['tipo'],
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
                >
                  <option value="cliente">Cliente</option>
                  <option value="cabo_eleitoral">Cabo Eleitoral</option>
                  <option value="candidato">Candidato</option>
                </select>
              </div>

              {/* Plano */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Plano
                </label>
                <select
                  value={novoContato.plano}
                  onChange={(e) =>
                    setNovoContato((prev) => ({
                      ...prev,
                      plano: e.target.value as ContatoWhatsAppCreate['plano'],
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-amber-500 outline-none text-sm"
                >
                  <option value="consultor">Consultor</option>
                  <option value="estrategista">Estrategista</option>
                  <option value="war_room">War Room</option>
                </select>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriarContato}
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? 'Salvando...' : 'Criar Contato'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" richColors />
    </div>
  );
}
