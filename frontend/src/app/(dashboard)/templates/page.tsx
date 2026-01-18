'use client';

/**
 * Página de Templates de Perguntas Eleitorais
 *
 * Permite visualizar, gerenciar e criar pesquisas a partir de templates pré-definidos.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Plus,
  Trash2,
  ArrowRight,
  HelpCircle,
  ToggleLeft,
  Sliders,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

// Ícones para tipos de perguntas
const TIPO_PERGUNTA_ICONE: Record<string, React.ElementType> = {
  multipla_escolha: HelpCircle,
  sim_nao: ToggleLeft,
  escala: Sliders,
  aberta: MessageSquare,
};

export default function TemplatesPage() {
  const router = useRouter();
  const { setPerguntas, novaEntrevista, setTitulo } = useEntrevistasStore();
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState<Pergunta[]>([]);
  const [templatesSelecionados, setTemplatesSelecionados] = useState<string[]>([]);

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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates de Perguntas</h1>
          <p className="text-muted-foreground">
            Selecione templates pré-definidos para criar pesquisas eleitorais rapidamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/entrevistas"
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Ver Entrevistas
          </Link>
          <Link
            href="/resultados"
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Ver Resultados
          </Link>
        </div>
      </div>

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
    </div>
  );
}
