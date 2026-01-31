'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ContatoWhatsApp, atualizarContato, deletarContato } from '@/services/whatsapp-api';

interface ContatosTableProps {
  contatos: ContatoWhatsApp[];
  carregando: boolean;
  onContatoSelecionado: (contatoId: number) => void;
  onAtualizar: () => void;
}

// Labels e cores para tipos
const tipoLabels: Record<string, string> = {
  cliente: 'Cliente',
  cabo_eleitoral: 'Cabo Eleitoral',
  candidato: 'Candidato',
};

const tipoCores: Record<string, string> = {
  cliente: 'bg-blue-500/15 text-blue-500',
  cabo_eleitoral: 'bg-green-500/15 text-green-500',
  candidato: 'bg-amber-500/15 text-amber-500',
};

// Labels e cores para planos
const planoLabels: Record<string, string> = {
  consultor: 'Consultor',
  estrategista: 'Estrategista',
  war_room: 'War Room',
};

const planoCores: Record<string, string> = {
  consultor: 'bg-gray-500/15 text-gray-400',
  estrategista: 'bg-blue-500/15 text-blue-400',
  war_room: 'bg-amber-500/15 text-amber-400',
};

export function ContatosTable({
  contatos,
  carregando,
  onContatoSelecionado,
  onAtualizar,
}: ContatosTableProps) {
  const [menuAberto, setMenuAberto] = useState<number | null>(null);

  const toggleAtivo = useCallback(
    async (contato: ContatoWhatsApp) => {
      try {
        await atualizarContato(contato.id, { ativo: !contato.ativo });
        toast.success(
          contato.ativo ? 'Contato desativado' : 'Contato ativado'
        );
        onAtualizar();
      } catch {
        toast.error('Erro ao atualizar contato');
      }
    },
    [onAtualizar]
  );

  const handleDeletar = useCallback(
    async (id: number) => {
      if (!confirm('Tem certeza que deseja excluir este contato?')) return;

      try {
        await deletarContato(id);
        toast.success('Contato excluido');
        onAtualizar();
      } catch {
        toast.error('Erro ao excluir contato');
      }
      setMenuAberto(null);
    },
    [onAtualizar]
  );

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return '--';
    try {
      return new Date(dataStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--';
    }
  };

  if (carregando) {
    return (
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          Carregando contatos...
        </div>
      </div>
    );
  }

  if (contatos.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          Nenhum contato encontrado
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]/80 dark:bg-[#0f172a]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Telefone
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Plano
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Ultimo Acesso
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contatos.map((contato) => (
                <tr
                  key={contato.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  {/* Nome */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onContatoSelecionado(contato.id)}
                      className="text-left hover:text-amber-500 transition-colors"
                    >
                      <p className="font-medium text-foreground">
                        {contato.nome}
                      </p>
                    </button>
                  </td>

                  {/* Telefone */}
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {contato.telefone}
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        tipoCores[contato.tipo] || 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {tipoLabels[contato.tipo] || contato.tipo}
                    </span>
                  </td>

                  {/* Plano */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        planoCores[contato.plano] || 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {planoLabels[contato.plano] || contato.plano}
                    </span>
                  </td>

                  {/* Status ativo/inativo */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAtivo(contato)}
                      className="flex items-center gap-2 group"
                      title={contato.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          contato.ativo ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            contato.ativo ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          contato.ativo ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {contato.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </button>
                  </td>

                  {/* Ultimo Acesso */}
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatarData(contato.ultimo_acesso)}
                  </td>

                  {/* Acoes */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 relative">
                      {/* Ver Conversas */}
                      <button
                        onClick={() => onContatoSelecionado(contato.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Ver conversas"
                      >
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>

                      {/* Menu de acoes */}
                      <button
                        onClick={() =>
                          setMenuAberto(menuAberto === contato.id ? null : contato.id)
                        }
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {menuAberto === contato.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              onContatoSelecionado(contato.id);
                              setMenuAberto(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                          >
                            Ver Conversas
                          </button>
                          <button
                            onClick={() => {
                              toggleAtivo(contato);
                              setMenuAberto(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                          >
                            {contato.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={() => handleDeletar(contato.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors text-red-400"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fechar menu ao clicar fora */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuAberto(null)}
        />
      )}
    </>
  );
}
