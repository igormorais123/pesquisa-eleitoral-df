'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
  Trash2,
  Edit,
  Mail,
  Chrome,
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore, useIsAdmin, useAuthHidratado } from '@/stores/auth-store';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: string;
  ativo: boolean;
  aprovado: boolean;
  avatar_url?: string;
  provedor_auth: string;
  criado_em: string;
}

interface Estatisticas {
  total: number;
  pendentes: number;
  ativos: number;
  por_papel: Record<string, number>;
}

const papelLabels: Record<string, string> = {
  admin: 'Administrador',
  pesquisador: 'Pesquisador',
  visualizador: 'Visualizador',
  leitor: 'Leitor',
};

const papelColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400',
  pesquisador: 'bg-blue-500/20 text-blue-400',
  visualizador: 'bg-green-500/20 text-green-400',
  leitor: 'bg-gray-500/20 text-gray-400',
};

export default function AdminUsuariosPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const hidratado = useAuthHidratado();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAprovado, setFiltroAprovado] = useState<boolean | null>(null);
  const [filtroPapel, setFiltroPapel] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  // Verificar se é admin (somente após hidratação do estado)
  useEffect(() => {
    if (hidratado && !isAdmin) {
      toast.error('Acesso restrito a administradores');
      router.push('/');
    }
  }, [isAdmin, hidratado, router]);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, [pagina, busca, filtroAprovado, filtroPapel]);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.append('pagina', pagina.toString());
      params.append('por_pagina', '10');
      if (busca) params.append('busca', busca);
      if (filtroAprovado !== null) params.append('aprovado', filtroAprovado.toString());
      if (filtroPapel) params.append('papel', filtroPapel);

      const response = await api.get(`/usuarios?${params.toString()}`);
      setUsuarios(response.data.usuarios);
      setTotalPaginas(response.data.total_paginas);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get('/usuarios/estatisticas');
      setEstatisticas(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas');
    }
  };

  const aprovarUsuario = async (usuarioId: string, papel?: string) => {
    try {
      await api.post(`/usuarios/${usuarioId}/aprovar`, { papel });
      toast.success('Usuário aprovado com sucesso');
      carregarDados();
      carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao aprovar usuário');
    }
  };

  const revogarUsuario = async (usuarioId: string) => {
    try {
      await api.post(`/usuarios/${usuarioId}/revogar`);
      toast.success('Aprovação revogada');
      carregarDados();
      carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao revogar aprovação');
    }
  };

  const alterarPapel = async (usuarioId: string, papel: string) => {
    try {
      await api.put(`/usuarios/${usuarioId}/papel`, { papel });
      toast.success('Papel alterado com sucesso');
      carregarDados();
      carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao alterar papel');
    }
  };

  const desativarUsuario = async (usuarioId: string) => {
    try {
      await api.post(`/usuarios/${usuarioId}/desativar`);
      toast.success('Usuário desativado');
      carregarDados();
      carregarEstatisticas();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao desativar usuário');
    }
  };

  const ativarUsuario = async (usuarioId: string) => {
    try {
      await api.post(`/usuarios/${usuarioId}/ativar`);
      toast.success('Usuário ativado');
      carregarDados();
      carregarEstatisticas();
    } catch (error) {
      toast.error('Erro ao ativar usuário');
    }
  };

  const deletarUsuario = async (usuarioId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      await api.delete(`/usuarios/${usuarioId}`);
      toast.success('Usuário excluído');
      carregarDados();
      carregarEstatisticas();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao excluir usuário');
    }
  };

  // Mostrar loading enquanto não hidratou
  if (!hidratado) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Aprove, gerencie permissões e controle acesso ao sistema</p>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.ativos}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.por_papel.admin || 0}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
            />
          </div>

          <select
            value={filtroAprovado === null ? '' : filtroAprovado.toString()}
            onChange={(e) => {
              setFiltroAprovado(e.target.value === '' ? null : e.target.value === 'true');
              setPagina(1);
            }}
            className="px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
          >
            <option value="">Todos os status</option>
            <option value="true">Aprovados</option>
            <option value="false">Pendentes</option>
          </select>

          <select
            value={filtroPapel || ''}
            onChange={(e) => {
              setFiltroPapel(e.target.value || null);
              setPagina(1);
            }}
            className="px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
          >
            <option value="">Todos os papéis</option>
            <option value="admin">Administrador</option>
            <option value="pesquisador">Pesquisador</option>
            <option value="visualizador">Visualizador</option>
            <option value="leitor">Leitor</option>
          </select>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="glass-card rounded-xl overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-muted-foreground">
            Carregando...
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum usuário encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Usuário</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Papel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Provedor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Criado em</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {usuario.avatar_url ? (
                          <img
                            src={usuario.avatar_url}
                            alt={usuario.nome}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {usuario.nome.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${papelColors[usuario.papel]}`}>
                        {papelLabels[usuario.papel]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {usuario.aprovado ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <Check className="w-4 h-4" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 text-sm">
                            <Clock className="w-4 h-4" />
                            Pendente
                          </span>
                        )}
                        {!usuario.ativo && (
                          <span className="text-red-400 text-sm">(Inativo)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {usuario.provedor_auth === 'google' ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Chrome className="w-4 h-4" />
                          Google
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          Email
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => setMenuAberto(menuAberto === usuario.id ? null : usuario.id)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {menuAberto === usuario.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                            {!usuario.aprovado && (
                              <>
                                <button
                                  onClick={() => {
                                    aprovarUsuario(usuario.id, 'visualizador');
                                    setMenuAberto(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4 text-green-400" />
                                  Aprovar (Visualizador)
                                </button>
                                <button
                                  onClick={() => {
                                    aprovarUsuario(usuario.id, 'pesquisador');
                                    setMenuAberto(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4 text-blue-400" />
                                  Aprovar (Pesquisador)
                                </button>
                              </>
                            )}

                            {usuario.aprovado && usuario.papel !== 'admin' && (
                              <button
                                onClick={() => {
                                  revogarUsuario(usuario.id);
                                  setMenuAberto(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                              >
                                <UserX className="w-4 h-4 text-amber-400" />
                                Revogar Aprovação
                              </button>
                            )}

                            {usuario.papel !== 'admin' && (
                              <>
                                <div className="border-t border-border my-1" />
                                <button
                                  onClick={() => {
                                    alterarPapel(usuario.id, 'pesquisador');
                                    setMenuAberto(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                                >
                                  Definir como Pesquisador
                                </button>
                                <button
                                  onClick={() => {
                                    alterarPapel(usuario.id, 'visualizador');
                                    setMenuAberto(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors"
                                >
                                  Definir como Visualizador
                                </button>
                              </>
                            )}

                            <div className="border-t border-border my-1" />

                            {usuario.ativo ? (
                              <button
                                onClick={() => {
                                  desativarUsuario(usuario.id);
                                  setMenuAberto(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-amber-400"
                              >
                                <X className="w-4 h-4" />
                                Desativar
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  ativarUsuario(usuario.id);
                                  setMenuAberto(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-green-400"
                              >
                                <Check className="w-4 h-4" />
                                Ativar
                              </button>
                            )}

                            {usuario.papel !== 'admin' && (
                              <button
                                onClick={() => {
                                  deletarUsuario(usuario.id);
                                  setMenuAberto(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Página {pagina} de {totalPaginas}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fechar menu ao clicar fora */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuAberto(null)}
        />
      )}
    </div>
  );
}
