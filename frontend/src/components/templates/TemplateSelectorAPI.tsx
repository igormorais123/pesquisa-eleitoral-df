'use client';

/**
 * Seletor de Templates de Perguntas Eleitorais (via API)
 *
 * Componente que carrega templates do backend e permite
 * seleção de templates e perguntas para pesquisas eleitorais.
 */

import { useState, useEffect } from 'react';
import {
  TemplateResumo,
  TemplateCompleto,
  PerguntaTemplate,
  CategoriaTemplateInfo,
} from '@/types';
import { useTemplatesStore } from '@/stores/templates-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Vote,
  ThumbsDown,
  ClipboardCheck,
  ListOrdered,
  User,
  Search,
  FileText,
  Eye,
  Plus,
  Check,
  Filter,
  Tag,
  X,
  ChevronRight,
  Loader2,
  BarChart3,
  Users,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mapeamento de ícones por categoria
const CATEGORIA_ICONES: Record<string, React.ElementType> = {
  intencao_voto: Vote,
  rejeicao: ThumbsDown,
  avaliacao_governo: ClipboardCheck,
  imagem_candidato: Users,
  opiniao_publica: MessageSquare,
  comportamento_eleitoral: BarChart3,
  dados_demograficos: User,
  controle_qualidade: ListOrdered,
};

// Cores por categoria
const CATEGORIA_CORES: Record<string, string> = {
  intencao_voto: 'bg-blue-500',
  rejeicao: 'bg-red-500',
  avaliacao_governo: 'bg-green-500',
  imagem_candidato: 'bg-purple-500',
  opiniao_publica: 'bg-orange-500',
  comportamento_eleitoral: 'bg-cyan-500',
  dados_demograficos: 'bg-gray-500',
  controle_qualidade: 'bg-amber-700',
};

interface TemplateSelectorAPIProps {
  onSelectTemplate?: (template: TemplateCompleto) => void;
  onSelectPerguntas?: (perguntas: PerguntaTemplate[]) => void;
  modoSelecao?: 'template' | 'perguntas';
  tipoEleicaoFiltro?: string;
}

export function TemplateSelectorAPI({
  onSelectTemplate,
  onSelectPerguntas,
  modoSelecao = 'template',
  tipoEleicaoFiltro,
}: TemplateSelectorAPIProps) {
  // Store
  const {
    templates,
    templateSelecionado,
    categorias,
    tiposEleicao,
    tags,
    estatisticas,
    filtros,
    carregando,
    carregandoTemplate,
    perguntasSelecionadas,
    carregarDadosIniciais,
    carregarTemplate,
    setFiltros,
    limparFiltros,
    selecionarPergunta,
    removerPergunta,
    selecionarTodasPerguntas,
    limparSelecao,
  } = useTemplatesStore();

  // State local
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);

  // Aplicar filtro de tipo de eleição se fornecido
  useEffect(() => {
    if (tipoEleicaoFiltro) {
      setFiltros({ tipo_eleicao: tipoEleicaoFiltro });
    }
  }, [tipoEleicaoFiltro, setFiltros]);

  // Filtrar templates por categoria local
  const templatesFiltrados = categoriaAtiva === 'todos'
    ? templates
    : templates.filter(t => t.categoria === categoriaAtiva);

  // Buscar templates
  const handleBusca = (texto: string) => {
    setBuscaTexto(texto);
    setFiltros({ busca: texto || undefined });
  };

  // Abrir preview do template
  const handlePreview = async (template: TemplateResumo) => {
    await carregarTemplate(template.id);
    setDialogAberto(true);
  };

  // Selecionar template completo
  const handleSelecionarTemplate = () => {
    if (templateSelecionado && onSelectTemplate) {
      onSelectTemplate(templateSelecionado);
      setDialogAberto(false);
      toast.success(`Template "${templateSelecionado.nome}" selecionado`);
    }
  };

  // Selecionar perguntas
  const handleSelecionarPerguntas = () => {
    if (perguntasSelecionadas.length > 0 && onSelectPerguntas) {
      onSelectPerguntas(perguntasSelecionadas);
      limparSelecao();
      setDialogAberto(false);
      toast.success(`${perguntasSelecionadas.length} pergunta(s) adicionada(s)`);
    }
  };

  // Toggle seleção de pergunta
  const togglePergunta = (pergunta: PerguntaTemplate) => {
    const selecionada = perguntasSelecionadas.some(p => p.codigo === pergunta.codigo);
    if (selecionada) {
      removerPergunta(pergunta.codigo);
    } else {
      selecionarPergunta(pergunta);
    }
  };

  // Selecionar todas as perguntas do template
  const handleSelecionarTodas = () => {
    if (templateSelecionado) {
      selecionarTodasPerguntas(templateSelecionado.perguntas);
      toast.success('Todas as perguntas foram selecionadas');
    }
  };

  // Obter ícone da categoria
  const getIconeCategoria = (categoria: string) => {
    const IconComponent = CATEGORIA_ICONES[categoria] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  // Obter cor da categoria
  const getCorCategoria = (categoria: string) => {
    return CATEGORIA_CORES[categoria] || 'bg-gray-500';
  };

  // Renderizar skeleton de carregamento
  if (carregando && templates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {estatisticas.total_templates} templates
          </span>
          <span className="flex items-center gap-1">
            <ListOrdered className="h-4 w-4" />
            {estatisticas.total_perguntas} perguntas
          </span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={buscaTexto}
            onChange={(e) => handleBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filtros.tipo_eleicao || 'todos'}
          onValueChange={(value) => setFiltros({ tipo_eleicao: value === 'todos' ? undefined : value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de eleição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposEleicao.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filtros.categoria || filtros.tipo_eleicao || filtros.busca) && (
          <Button variant="outline" size="sm" onClick={limparFiltros}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Tabs de categorias */}
      <Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="todos" className="text-xs">
            Todos
          </TabsTrigger>
          {categorias.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-xs flex items-center gap-1"
            >
              {getIconeCategoria(cat.id)}
              <span className="hidden sm:inline">{cat.nome}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={categoriaAtiva} className="mt-4">
          {/* Grid de templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesFiltrados.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handlePreview(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2 rounded-lg text-white', getCorCategoria(template.categoria))}>
                      {getIconeCategoria(template.categoria)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.total_perguntas} perguntas
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-2 group-hover:text-primary transition-colors">
                    {template.nome}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {template.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver perguntas
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templatesFiltrados.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum template encontrado</p>
              <Button variant="link" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de preview */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {carregandoTemplate ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templateSelecionado ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg text-white', getCorCategoria(templateSelecionado.categoria))}>
                    {getIconeCategoria(templateSelecionado.categoria)}
                  </div>
                  <div>
                    <DialogTitle>{templateSelecionado.nome}</DialogTitle>
                    <DialogDescription>{templateSelecionado.descricao}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex flex-wrap gap-1 my-2">
                {templateSelecionado.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {templateSelecionado.perguntas.map((pergunta, index) => {
                    const selecionada = perguntasSelecionadas.some(p => p.codigo === pergunta.codigo);
                    return (
                      <div
                        key={pergunta.codigo}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          modoSelecao === 'perguntas' && 'cursor-pointer hover:border-primary',
                          selecionada && 'border-primary bg-primary/5'
                        )}
                        onClick={() => modoSelecao === 'perguntas' && togglePergunta(pergunta)}
                      >
                        <div className="flex items-start gap-3">
                          {modoSelecao === 'perguntas' && (
                            <Checkbox
                              checked={selecionada}
                              onCheckedChange={() => togglePergunta(pergunta)}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <Badge
                                variant={pergunta.obrigatoria ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {pergunta.obrigatoria ? 'Obrigatória' : 'Opcional'}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {pergunta.tipo}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{pergunta.texto}</p>
                            {pergunta.instrucoes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {pergunta.instrucoes}
                              </p>
                            )}
                            {pergunta.opcoes.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {pergunta.opcoes.slice(0, 5).map((opcao) => (
                                  <Badge key={opcao.valor} variant="outline" className="text-xs">
                                    {opcao.texto}
                                  </Badge>
                                ))}
                                {pergunta.opcoes.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{pergunta.opcoes.length - 5} opções
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <DialogFooter className="flex items-center justify-between">
                {modoSelecao === 'perguntas' && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelecionarTodas}>
                      Selecionar todas
                    </Button>
                    {perguntasSelecionadas.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {perguntasSelecionadas.length} selecionada(s)
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>

                  {modoSelecao === 'template' ? (
                    <Button onClick={handleSelecionarTemplate}>
                      <Plus className="h-4 w-4 mr-1" />
                      Usar template
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSelecionarPerguntas}
                      disabled={perguntasSelecionadas.length === 0}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Adicionar perguntas ({perguntasSelecionadas.length})
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TemplateSelectorAPI;
