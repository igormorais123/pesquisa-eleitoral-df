'use client';

/**
 * Seletor de Templates de Perguntas Eleitorais
 *
 * Permite visualizar e selecionar templates pré-definidos de perguntas
 * para utilização em entrevistas e pesquisas eleitorais.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  TemplatePerguntas,
  PerguntaTemplate,
  CategoriaTemplate,
  TemplatesData,
  Pergunta,
} from '@/types';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Vote,
  ThumbsDown,
  ClipboardCheck,
  ListOrdered,
  User,
  Search,
  FileText,
  Repeat,
  Eye,
  Plus,
  Check,
  HelpCircle,
  ToggleLeft,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

// Mapeamento de ícones
const ICONE_MAP: Record<string, React.ElementType> = {
  vote: Vote,
  'thumbs-down': ThumbsDown,
  'clipboard-check': ClipboardCheck,
  'list-ordered': ListOrdered,
  user: User,
  search: Search,
  'file-text': FileText,
  repeat: Repeat,
};

// Ícones para tipos de perguntas
const TIPO_PERGUNTA_ICONE: Record<string, React.ElementType> = {
  multipla_escolha: HelpCircle,
  sim_nao: ToggleLeft,
  escala: Sliders,
  aberta: MessageSquare,
};

interface TemplateSelectorProps {
  onSelectTemplate?: (template: TemplatePerguntas) => void;
  onSelectPerguntas?: (perguntas: Pergunta[]) => void;
  modoSelecao?: 'template' | 'perguntas';
  templatesSelecionados?: string[];
  categoriaFiltro?: CategoriaTemplate;
}

export function TemplateSelector({
  onSelectTemplate,
  onSelectPerguntas,
  modoSelecao = 'template',
  templatesSelecionados = [],
  categoriaFiltro,
}: TemplateSelectorProps) {
  const [templatesData, setTemplatesData] = useState<TemplatesData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [templatePreview, setTemplatePreview] = useState<TemplatePerguntas | null>(null);
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState<string[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);

  // Carregar dados dos templates
  useEffect(() => {
    const carregarTemplates = async () => {
      try {
        const response = await fetch('/data/templates-perguntas-eleitorais.json');
        if (!response.ok) throw new Error('Erro ao carregar templates');
        const data = await response.json();
        setTemplatesData(data);
      } catch (error) {
        console.error('Erro ao carregar templates:', error);
        toast.error('Erro ao carregar templates de perguntas');
      } finally {
        setCarregando(false);
      }
    };
    carregarTemplates();
  }, []);

  // Filtrar templates por categoria
  const templatesFiltrados = useMemo(() => {
    if (!templatesData) return [];
    let templates = templatesData.templates;

    if (categoriaFiltro) {
      templates = templates.filter((t) => t.categoria === categoriaFiltro);
    } else if (categoriaAtiva !== 'todos') {
      templates = templates.filter((t) => t.categoria === categoriaAtiva);
    }

    return templates;
  }, [templatesData, categoriaAtiva, categoriaFiltro]);

  // Obter ícone do template
  const getIcone = (icone: string) => {
    const IconComponent = ICONE_MAP[icone] || FileText;
    return IconComponent;
  };

  // Converter PerguntaTemplate para Pergunta
  const converterParaPergunta = (pt: PerguntaTemplate): Pergunta => ({
    id: `imported-${pt.id}-${Date.now()}`,
    texto: pt.texto,
    tipo: pt.tipo,
    obrigatoria: pt.obrigatoria,
    opcoes: pt.opcoes,
    escala_min: pt.escala_min,
    escala_max: pt.escala_max,
    escala_rotulos: pt.escala_rotulos,
  });

  // Selecionar template completo
  const handleSelectTemplate = (template: TemplatePerguntas) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      toast.success(`Template "${template.nome}" selecionado!`);
    }
    if (onSelectPerguntas) {
      const perguntas = template.perguntas.map(converterParaPergunta);
      onSelectPerguntas(perguntas);
      toast.success(`${perguntas.length} perguntas importadas!`);
    }
    setDialogAberto(false);
  };

  // Toggle pergunta selecionada
  const togglePergunta = (perguntaId: string) => {
    setPerguntasSelecionadas((prev) =>
      prev.includes(perguntaId)
        ? prev.filter((id) => id !== perguntaId)
        : [...prev, perguntaId]
    );
  };

  // Importar perguntas selecionadas
  const importarPerguntasSelecionadas = () => {
    if (!templatePreview || perguntasSelecionadas.length === 0) return;

    const perguntasParaImportar = templatePreview.perguntas
      .filter((p) => perguntasSelecionadas.includes(p.id))
      .map(converterParaPergunta);

    if (onSelectPerguntas) {
      onSelectPerguntas(perguntasParaImportar);
      toast.success(`${perguntasParaImportar.length} perguntas importadas!`);
    }

    setPerguntasSelecionadas([]);
    setTemplatePreview(null);
    setDialogAberto(false);
  };

  // Selecionar todas as perguntas do template
  const selecionarTodas = () => {
    if (!templatePreview) return;
    setPerguntasSelecionadas(templatePreview.perguntas.map((p) => p.id));
  };

  // Limpar seleção
  const limparSelecao = () => {
    setPerguntasSelecionadas([]);
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Carregando templates...</div>
        </CardContent>
      </Card>
    );
  }

  if (!templatesData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Não foi possível carregar os templates de perguntas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Templates de Perguntas</h3>
          <p className="text-sm text-muted-foreground">
            {templatesData.metadados.total_templates} templates com{' '}
            {templatesData.metadados.total_perguntas} perguntas disponíveis
          </p>
        </div>
      </div>

      {/* Filtro por categoria */}
      {!categoriaFiltro && (
        <Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="todos" className="text-xs">
              Todos
            </TabsTrigger>
            {templatesData.categorias.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.nome}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Grid de Templates */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesFiltrados.map((template) => {
          const Icone = getIcone(template.icone);
          const jaSelecionado = templatesSelecionados.includes(template.id);

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                jaSelecionado ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${template.cor}20` }}
                  >
                    <Icone className="h-5 w-5" style={{ color: template.cor }} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.perguntas.length} perguntas
                  </Badge>
                </div>
                <CardTitle className="text-base">{template.nome}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {template.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  {/* Botão Preview */}
                  <Dialog open={dialogAberto && templatePreview?.id === template.id} onOpenChange={(open) => {
                    setDialogAberto(open);
                    if (!open) {
                      setTemplatePreview(null);
                      setPerguntasSelecionadas([]);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setTemplatePreview(template);
                          setDialogAberto(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Icone className="h-5 w-5" style={{ color: template.cor }} />
                          {template.nome}
                        </DialogTitle>
                        <DialogDescription>{template.descricao}</DialogDescription>
                      </DialogHeader>

                      {/* Controles de seleção */}
                      {modoSelecao === 'perguntas' && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">
                            {perguntasSelecionadas.length} de {template.perguntas.length}{' '}
                            selecionadas
                          </span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={selecionarTodas}>
                              Selecionar todas
                            </Button>
                            <Button variant="ghost" size="sm" onClick={limparSelecao}>
                              Limpar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Lista de perguntas */}
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {template.perguntas.map((pergunta, index) => {
                            const TipoIcone =
                              TIPO_PERGUNTA_ICONE[pergunta.tipo] || HelpCircle;
                            const selecionada = perguntasSelecionadas.includes(
                              pergunta.id
                            );

                            return (
                              <div
                                key={pergunta.id}
                                className={`p-3 border rounded-lg transition-colors ${
                                  modoSelecao === 'perguntas'
                                    ? 'cursor-pointer hover:bg-muted/50'
                                    : ''
                                } ${selecionada ? 'bg-primary/5 border-primary' : ''}`}
                                onClick={() =>
                                  modoSelecao === 'perguntas' &&
                                  togglePergunta(pergunta.id)
                                }
                              >
                                <div className="flex items-start gap-3">
                                  {modoSelecao === 'perguntas' && (
                                    <Checkbox
                                      checked={selecionada}
                                      className="mt-1"
                                    />
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {index + 1}.
                                      </span>
                                      <p className="text-sm font-medium">
                                        {pergunta.texto}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs gap-1"
                                      >
                                        <TipoIcone className="h-3 w-3" />
                                        {pergunta.tipo.replace('_', ' ')}
                                      </Badge>
                                      {pergunta.obrigatoria && (
                                        <Badge variant="outline" className="text-xs">
                                          Obrigatória
                                        </Badge>
                                      )}
                                      {pergunta.opcoes_dinamicas && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-blue-600"
                                        >
                                          Dinâmica
                                        </Badge>
                                      )}
                                    </div>
                                    {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Opções: {pergunta.opcoes.join(', ')}
                                      </div>
                                    )}
                                    {pergunta.escala_rotulos &&
                                      pergunta.escala_rotulos.length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          Escala: {pergunta.escala_min} a{' '}
                                          {pergunta.escala_max} (
                                          {pergunta.escala_rotulos
                                            .filter(Boolean)
                                            .join(' → ')}
                                          )
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>

                      <DialogFooter>
                        {modoSelecao === 'perguntas' ? (
                          <Button
                            onClick={importarPerguntasSelecionadas}
                            disabled={perguntasSelecionadas.length === 0}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Importar {perguntasSelecionadas.length} perguntas
                          </Button>
                        ) : (
                          <Button onClick={() => handleSelectTemplate(template)}>
                            <Check className="h-4 w-4 mr-2" />
                            Usar este template
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Botão Usar diretamente */}
                  <Button
                    size="sm"
                    className="flex-1"
                    style={{
                      backgroundColor: template.cor,
                    }}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={jaSelecionado}
                  >
                    {jaSelecionado ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Usado
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Usar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templatesFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum template encontrado para esta categoria.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
