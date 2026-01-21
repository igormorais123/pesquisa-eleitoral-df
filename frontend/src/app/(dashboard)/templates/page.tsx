'use client';

/**
 * Página de Templates de Perguntas Eleitorais
 * Design Apple-style
 * Permite visualizar, gerenciar e criar pesquisas a partir de templates pré-definidos.
 * Inclui geração de perguntas com IA.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { TemplateSelector } from '@/components/templates';
import { TemplatePerguntas, Pergunta } from '@/types';
import { useEntrevistasStore } from '@/stores/entrevistas-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Trash2,
  ArrowRight,
  HelpCircle,
  ToggleLeft,
  Sliders,
  MessageSquare,
  Sparkles,
  Loader2,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Ícones para tipos de perguntas
const TIPO_PERGUNTA_ICONE: Record<string, React.ElementType> = {
  multipla_escolha: HelpCircle,
  sim_nao: ToggleLeft,
  escala: Sliders,
  aberta: MessageSquare,
};

// Temas sugeridos para geração de perguntas com IA
const TEMAS_SUGERIDOS = [
  { id: 'avaliacao_governo', label: 'Avaliação do Governo', desc: 'Perguntas sobre aprovação e desempenho' },
  { id: 'intencao_voto', label: 'Intenção de Voto', desc: 'Cenários eleitorais e preferências' },
  { id: 'economia', label: 'Economia', desc: 'Emprego, inflação, custo de vida' },
  { id: 'saude', label: 'Saúde Pública', desc: 'SUS, hospitais, vacinas' },
  { id: 'seguranca', label: 'Segurança Pública', desc: 'Criminalidade, polícia, violência' },
  { id: 'educacao', label: 'Educação', desc: 'Escolas, universidades, qualidade' },
  { id: 'transporte', label: 'Transporte', desc: 'Mobilidade urbana, metrô, ônibus' },
  { id: 'meio_ambiente', label: 'Meio Ambiente', desc: 'Sustentabilidade, clima, poluição' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { setPerguntas, novaEntrevista, setTitulo } = useEntrevistasStore();
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState<Pergunta[]>([]);
  const [templatesSelecionados, setTemplatesSelecionados] = useState<string[]>([]);

  // Estados para geração com IA
  const [modalIAAberto, setModalIAAberto] = useState(false);
  const [temaPersonalizado, setTemaPersonalizado] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [quantidadePerguntas, setQuantidadePerguntas] = useState(5);
  const [tiposPerguntas, setTiposPerguntas] = useState<string[]>(['multipla_escolha', 'escala']);

  // Mutation para gerar perguntas com IA
  const mutationGerarIA = useMutation({
    mutationFn: async () => {
      const tema = temaPersonalizado || TEMAS_SUGERIDOS.find(t => t.id === temaSelecionado)?.label || 'Pesquisa eleitoral';

      const response = await fetch('/api/claude/gerar-perguntas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          quantidade: quantidadePerguntas,
          tiposPerguntas,
          contexto: 'Pesquisa eleitoral no Distrito Federal para eleições 2026',
        }),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.erro || 'Erro ao gerar perguntas');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const novasPerguntas: Pergunta[] = data.perguntas.map((p: any, index: number) => ({
        id: `ia-${Date.now()}-${index}`,
        texto: p.texto,
        tipo: p.tipo || 'multipla_escolha',
        obrigatoria: true,
        opcoes: p.opcoes || [],
        escala_min: p.escala_min || 1,
        escala_max: p.escala_max || 10,
      }));

      setPerguntasSelecionadas((prev) => [...prev, ...novasPerguntas]);
      setModalIAAberto(false);
      setTemaPersonalizado('');
      setTemaSelecionado('');
      toast.success(`${novasPerguntas.length} perguntas geradas com IA!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar perguntas');
    },
  });

  // Handler para quando um template é selecionado
  const handleSelectTemplate = (template: TemplatePerguntas) => {
    // Evitar duplicatas
    if (templatesSelecionados.includes(template.id)) {
      toast.warning('Este template já foi adicionado');
      return;
    }

    // Mapear tipo de pergunta do template para tipo de pergunta do sistema
    const mapearTipo = (tipoTemplate: string): 'aberta' | 'escala' | 'multipla_escolha' | 'sim_nao' => {
      const mapa: Record<string, 'aberta' | 'escala' | 'multipla_escolha' | 'sim_nao'> = {
        'unica': 'multipla_escolha',
        'multipla': 'multipla_escolha',
        'aberta': 'aberta',
        'escala': 'escala',
        'numerica': 'escala',
        'ranking': 'multipla_escolha',
      };
      return mapa[tipoTemplate] || 'aberta';
    };

    // Converter perguntas do template
    const novasPerguntas: Pergunta[] = template.perguntas.map((pt) => ({
      id: `${template.id}-${pt.codigo}-${Date.now()}`,
      texto: pt.texto,
      tipo: mapearTipo(pt.tipo),
      obrigatoria: pt.obrigatoria,
      opcoes: pt.opcoes?.map((op) => op.texto || op.valor) || [],
      escala_min: pt.validacao?.min ?? 1,
      escala_max: pt.validacao?.max ?? 10,
      escala_rotulos: undefined,
    }));

    setPerguntasSelecionadas((prev) => [...prev, ...novasPerguntas]);
    setTemplatesSelecionados((prev) => [...prev, template.id]);
    toast.success(`${novasPerguntas.length} perguntas adicionadas do template "${template.nome}"`);
  };

  // Handler para quando perguntas individuais são selecionadas
  const handleSelectPerguntas = (perguntas: Pergunta[]) => {
    setPerguntasSelecionadas((prev) => [...prev, ...perguntas]);
  };

  // Remover pergunta
  const removerPergunta = (perguntaId: string) => {
    setPerguntasSelecionadas((prev) => prev.filter((p) => p.id !== perguntaId));
  };

  // Limpar todas as perguntas
  const limparPerguntas = () => {
    setPerguntasSelecionadas([]);
    setTemplatesSelecionados([]);
    toast.info('Todas as perguntas foram removidas');
  };

  // Criar pesquisa com perguntas selecionadas
  const criarPesquisa = () => {
    if (perguntasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma pergunta');
      return;
    }

    // Inicializar nova entrevista e carregar as perguntas
    novaEntrevista();
    setTitulo(`Pesquisa com ${perguntasSelecionadas.length} perguntas`);
    setPerguntas(perguntasSelecionadas);

    toast.success(`${perguntasSelecionadas.length} perguntas carregadas! Redirecionando...`);

    // Redirecionar para página de criação de entrevista
    router.push('/entrevistas/nova');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header - Apple Style */}
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Templates de Perguntas
        </h1>
        <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
          Selecione templates pré-definidos ou gere perguntas com IA
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setModalIAAberto(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Gerar com IA
          </button>
          <Link
            href="/entrevistas"
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors text-sm font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Ver Entrevistas
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seletor de Templates */}
        <div className="lg:col-span-2">
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            templatesSelecionados={templatesSelecionados}
            modoSelecao="template"
          />
        </div>

        {/* Painel de Perguntas Selecionadas */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Perguntas Selecionadas
                {perguntasSelecionadas.length > 0 && (
                  <Badge>{perguntasSelecionadas.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Perguntas que serão incluídas na pesquisa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {perguntasSelecionadas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma pergunta selecionada</p>
                  <p className="text-sm">Clique em &quot;Usar&quot; em um template para adicionar perguntas</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-4">
                      {perguntasSelecionadas.map((pergunta, index) => {
                        const TipoIcone =
                          TIPO_PERGUNTA_ICONE[pergunta.tipo] || HelpCircle;

                        return (
                          <div
                            key={pergunta.id}
                            className="flex items-start gap-2 p-2 border rounded-lg group hover:bg-muted/50"
                          >
                            <span className="text-xs text-muted-foreground font-medium mt-0.5">
                              {index + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{pergunta.texto}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  <TipoIcone className="h-3 w-3 mr-1" />
                                  {pergunta.tipo.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removerPergunta(pergunta.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Ações */}
                  <div className="pt-4 border-t space-y-2">
                    <Button className="w-full" onClick={criarPesquisa}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Criar Pesquisa com {perguntasSelecionadas.length} perguntas
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={limparPerguntas}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Seleção
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Geração com IA */}
      {modalIAAberto && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalIAAberto(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-violet-500/10 to-purple-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">Gerar Perguntas com IA</h2>
                    <p className="text-xs text-muted-foreground">Usando Claude Opus 4.5</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalIAAberto(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Tema */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tema da Pesquisa
                  </label>
                  <input
                    type="text"
                    value={temaPersonalizado}
                    onChange={(e) => {
                      setTemaPersonalizado(e.target.value);
                      setTemaSelecionado('');
                    }}
                    placeholder="Digite um tema personalizado ou selecione abaixo..."
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-foreground text-sm"
                  />

                  {/* Sugestões de Tema */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TEMAS_SUGERIDOS.map((tema) => (
                      <button
                        key={tema.id}
                        onClick={() => {
                          setTemaSelecionado(tema.id);
                          setTemaPersonalizado('');
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          temaSelecionado === tema.id
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                        )}
                      >
                        {tema.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantidade de Perguntas: <span className="text-primary font-bold">{quantidadePerguntas}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={quantidadePerguntas}
                    onChange={(e) => setQuantidadePerguntas(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span>
                    <span>15</span>
                  </div>
                </div>

                {/* Tipos de Pergunta */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipos de Perguntas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'multipla_escolha', label: 'Múltipla Escolha', icon: HelpCircle },
                      { value: 'escala', label: 'Escala (1-10)', icon: Sliders },
                      { value: 'sim_nao', label: 'Sim/Não', icon: ToggleLeft },
                      { value: 'aberta', label: 'Aberta', icon: MessageSquare },
                    ].map((tipo) => {
                      const Icone = tipo.icon;
                      const selecionado = tiposPerguntas.includes(tipo.value);
                      return (
                        <button
                          key={tipo.value}
                          onClick={() => {
                            if (selecionado) {
                              setTiposPerguntas(tiposPerguntas.filter(t => t !== tipo.value));
                            } else {
                              setTiposPerguntas([...tiposPerguntas, tipo.value]);
                            }
                          }}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-lg border text-sm transition-all',
                            selecionado
                              ? 'bg-primary/20 border-primary text-foreground'
                              : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                          )}
                        >
                          <Icone className="w-4 h-4" />
                          {tipo.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custo Estimado */}
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Custo estimado:</span>
                    <span className="text-sm font-bold text-yellow-400">
                      ~R$ {(quantidadePerguntas * 0.05).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-secondary/30">
                <Button
                  onClick={() => mutationGerarIA.mutate()}
                  disabled={mutationGerarIA.isPending || (!temaPersonalizado && !temaSelecionado) || tiposPerguntas.length === 0}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white disabled:opacity-50"
                >
                  {mutationGerarIA.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando {quantidadePerguntas} perguntas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar {quantidadePerguntas} Perguntas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
