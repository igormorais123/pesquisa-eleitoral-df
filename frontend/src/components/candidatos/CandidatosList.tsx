'use client';

/**
 * Lista de Candidatos
 *
 * Componente que exibe lista de candidatos com filtros e paginação.
 */

import { useEffect, useState } from 'react';
import { useCandidatosStore } from '@/stores/candidatos-store';
import { Candidato, CargoPretendido } from '@/types';
import { CandidatoCard } from './CandidatoCard';
import { CandidatoForm } from './CandidatoForm';
import { CandidatoDetails } from './CandidatoDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Plus,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const CARGOS: { value: CargoPretendido | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos os Cargos' },
  { value: 'governador', label: 'Governador' },
  { value: 'vice_governador', label: 'Vice-Governador' },
  { value: 'senador', label: 'Senador' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'deputado_distrital', label: 'Deputado Distrital' },
];

export function CandidatosList() {
  const {
    candidatos,
    carregando,
    erro,
    total,
    pagina,
    totalPaginas,
    filtros,
    carregarCandidatos,
    criarCandidato,
    atualizarCandidato,
    deletarCandidato,
    ativarCandidato,
    desativarCandidato,
    setFiltros,
    limparErro,
  } = useCandidatosStore();

  const [busca, setBusca] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState<
    CargoPretendido | 'todos'
  >('todos');
  const [mostrarInativos, setMostrarInativos] = useState(false);

  // Modal states
  const [formAberto, setFormAberto] = useState(false);
  const [candidatoEditando, setCandidatoEditando] = useState<Candidato | null>(
    null
  );
  const [detailsAberto, setDetailsAberto] = useState(false);
  const [candidatoVisualizando, setCandidatoVisualizando] =
    useState<Candidato | null>(null);
  const [deleteDialogAberto, setDeleteDialogAberto] = useState(false);
  const [candidatoDeletando, setCandidatoDeletando] = useState<Candidato | null>(
    null
  );

  // Carregar candidatos na montagem
  useEffect(() => {
    carregarCandidatos();
  }, []);

  // Buscar ao mudar filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      const novosFiltros = {
        ...filtros,
        busca_texto: busca || undefined,
        cargos:
          cargoSelecionado !== 'todos' ? [cargoSelecionado] : undefined,
        apenas_ativos: !mostrarInativos,
        pagina: 1,
      };
      carregarCandidatos(novosFiltros);
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, cargoSelecionado, mostrarInativos]);

  // Handlers
  const handleView = (candidato: Candidato) => {
    setCandidatoVisualizando(candidato);
    setDetailsAberto(true);
  };

  const handleEdit = (candidato: Candidato) => {
    setCandidatoEditando(candidato);
    setFormAberto(true);
  };

  const handleDelete = (candidato: Candidato) => {
    setCandidatoDeletando(candidato);
    setDeleteDialogAberto(true);
  };

  const handleToggleAtivo = async (candidato: Candidato) => {
    try {
      if (candidato.ativo) {
        await desativarCandidato(candidato.id);
        toast.success(`${candidato.nome_urna} desativado`);
      } else {
        await ativarCandidato(candidato.id);
        toast.success(`${candidato.nome_urna} ativado`);
      }
    } catch (error) {
      toast.error('Erro ao alterar status do candidato');
    }
  };

  const handleSave = async (dados: any) => {
    try {
      if (candidatoEditando) {
        await atualizarCandidato(candidatoEditando.id, dados);
        toast.success('Candidato atualizado com sucesso!');
      } else {
        await criarCandidato(dados);
        toast.success('Candidato criado com sucesso!');
      }
      setFormAberto(false);
      setCandidatoEditando(null);
    } catch (error) {
      toast.error('Erro ao salvar candidato');
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!candidatoDeletando) return;

    try {
      await deletarCandidato(candidatoDeletando.id);
      toast.success(`${candidatoDeletando.nome_urna} removido`);
      setDeleteDialogAberto(false);
      setCandidatoDeletando(null);
    } catch (error) {
      toast.error('Erro ao remover candidato');
    }
  };

  const handlePaginaAnterior = () => {
    if (pagina > 1) {
      carregarCandidatos({ ...filtros, pagina: pagina - 1 });
    }
  };

  const handleProximaPagina = () => {
    if (pagina < totalPaginas) {
      carregarCandidatos({ ...filtros, pagina: pagina + 1 });
    }
  };

  // Mostrar erro se houver
  useEffect(() => {
    if (erro) {
      toast.error(erro);
      limparErro();
    }
  }, [erro]);

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-500">
            Gerencie os candidatos para as eleições de 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => carregarCandidatos()}
            disabled={carregando}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${carregando ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>

          <Button
            onClick={() => {
              setCandidatoEditando(null);
              setFormAberto(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Candidato
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, partido..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={cargoSelecionado}
              onValueChange={(v) =>
                setCargoSelecionado(v as CargoPretendido | 'todos')
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por cargo" />
              </SelectTrigger>
              <SelectContent>
                {CARGOS.map((cargo) => (
                  <SelectItem key={cargo.value} value={cargo.value}>
                    {cargo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={mostrarInativos ? 'secondary' : 'outline'}
              onClick={() => setMostrarInativos(!mostrarInativos)}
            >
              {mostrarInativos ? 'Ocultando' : 'Mostrar'} Inativos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {total} candidato{total !== 1 ? 's' : ''} encontrado
          {total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de candidatos */}
      {carregando && candidatos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : candidatos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum candidato encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {busca || cargoSelecionado !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece cadastrando o primeiro candidato'}
            </p>
            <Button
              onClick={() => {
                setCandidatoEditando(null);
                setFormAberto(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Candidato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidatos.map((candidato) => (
              <CandidatoCard
                key={candidato.id}
                candidato={candidato}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAtivo={handleToggleAtivo}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePaginaAnterior}
                disabled={pagina === 1 || carregando}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleProximaPagina}
                disabled={pagina === totalPaginas || carregando}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Formulário */}
      <CandidatoForm
        candidato={candidatoEditando}
        open={formAberto}
        onClose={() => {
          setFormAberto(false);
          setCandidatoEditando(null);
        }}
        onSave={handleSave}
      />

      {/* Modal de Detalhes */}
      <CandidatoDetails
        candidato={candidatoVisualizando}
        open={detailsAberto}
        onClose={() => {
          setDetailsAberto(false);
          setCandidatoVisualizando(null);
        }}
        onEdit={(candidato) => {
          setDetailsAberto(false);
          setCandidatoVisualizando(null);
          handleEdit(candidato);
        }}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={deleteDialogAberto}
        onOpenChange={setDeleteDialogAberto}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o candidato{' '}
              <strong>{candidatoDeletando?.nome_urna}</strong>? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
