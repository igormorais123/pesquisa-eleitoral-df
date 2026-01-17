'use client';

/**
 * Componente de Exportação de Relatório
 *
 * Permite exportar relatórios em formato PDF, XLSX e DOCX.
 */

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  Loader2,
  Check,
  Settings,
  Eye,
  Calendar,
  User,
  Building,
  BarChart3,
  PieChart,
  Map,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

type FormatoExport = 'pdf' | 'xlsx' | 'docx';

interface SecaoRelatorio {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ElementType;
  incluida: boolean;
}

interface ConfiguracaoRelatorio {
  titulo: string;
  subtitulo: string;
  autor: string;
  organizacao: string;
  dataReferencia: string;
  incluirCapa: boolean;
  incluirIndice: boolean;
  incluirGraficos: boolean;
  incluirTabelas: boolean;
  incluirConclusoes: boolean;
  margemErro: boolean;
  confidencial: boolean;
  observacoes: string;
}

interface ExportRelatorioProps {
  dadosResultado?: any;
  tipoPesquisa?: string;
  trigger?: React.ReactNode;
  onExportComplete?: (formato: FormatoExport) => void;
}

const SECOES_DISPONIVEIS: SecaoRelatorio[] = [
  {
    id: 'resumo_executivo',
    nome: 'Resumo Executivo',
    descricao: 'Visão geral dos principais resultados',
    icone: FileText,
    incluida: true,
  },
  {
    id: 'metodologia',
    nome: 'Metodologia',
    descricao: 'Descrição da metodologia utilizada',
    icone: Settings,
    incluida: true,
  },
  {
    id: 'intencao_voto',
    nome: 'Intenção de Voto',
    descricao: 'Resultados da intenção de voto',
    icone: BarChart3,
    incluida: true,
  },
  {
    id: 'rejeicao',
    nome: 'Análise de Rejeição',
    descricao: 'Taxas de rejeição dos candidatos',
    icone: Target,
    incluida: true,
  },
  {
    id: 'perfil_eleitor',
    nome: 'Perfil do Eleitor',
    descricao: 'Análise demográfica dos respondentes',
    icone: Users,
    incluida: true,
  },
  {
    id: 'analise_regional',
    nome: 'Análise Regional',
    descricao: 'Resultados por região administrativa',
    icone: Map,
    incluida: false,
  },
  {
    id: 'swing_voters',
    nome: 'Swing Voters',
    descricao: 'Análise de eleitores indecisos',
    icone: TrendingUp,
    incluida: false,
  },
  {
    id: 'comparativo',
    nome: 'Comparativo Histórico',
    descricao: 'Evolução temporal dos resultados',
    icone: PieChart,
    incluida: false,
  },
];

export function ExportRelatorio({
  dadosResultado,
  tipoPesquisa = 'Pesquisa Eleitoral',
  trigger,
  onExportComplete,
}: ExportRelatorioProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [etapa, setEtapa] = useState<'configuracao' | 'secoes' | 'gerando' | 'concluido'>('configuracao');
  const [formato, setFormato] = useState<FormatoExport>('pdf');
  const [progresso, setProgresso] = useState(0);
  const [secoes, setSecoes] = useState<SecaoRelatorio[]>(SECOES_DISPONIVEIS);

  const [config, setConfig] = useState<ConfiguracaoRelatorio>({
    titulo: `Relatório de ${tipoPesquisa}`,
    subtitulo: 'Distrito Federal - Eleições 2026',
    autor: '',
    organizacao: '',
    dataReferencia: new Date().toISOString().split('T')[0],
    incluirCapa: true,
    incluirIndice: true,
    incluirGraficos: true,
    incluirTabelas: true,
    incluirConclusoes: true,
    margemErro: true,
    confidencial: false,
    observacoes: '',
  });

  // Toggle seção
  const toggleSecao = (secaoId: string) => {
    setSecoes((prev) =>
      prev.map((s) =>
        s.id === secaoId ? { ...s, incluida: !s.incluida } : s
      )
    );
  };

  // Gerar relatório
  const gerarRelatorio = async () => {
    setEtapa('gerando');
    setProgresso(0);

    // Simular geração
    const etapas = [
      'Preparando dados...',
      'Gerando cabeçalho...',
      'Processando gráficos...',
      'Montando tabelas...',
      'Formatando documento...',
      'Finalizando...',
    ];

    for (let i = 0; i < etapas.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgresso(((i + 1) / etapas.length) * 100);
    }

    setEtapa('concluido');

    // Simular download
    const blob = new Blob(['Relatório gerado'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.titulo.replace(/\s+/g, '_')}_${config.dataReferencia}.${formato}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Relatório exportado em ${formato.toUpperCase()}!`);
    onExportComplete?.(formato);
  };

  // Reset
  const resetDialog = () => {
    setEtapa('configuracao');
    setProgresso(0);
    setDialogAberto(false);
  };

  // Contar seções selecionadas
  const secoesIncluidas = secoes.filter((s) => s.incluida).length;

  return (
    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Configure e exporte o relatório da pesquisa eleitoral
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {/* Etapa: Configuração */}
          {etapa === 'configuracao' && (
            <div className="space-y-6 py-4">
              {/* Formato */}
              <div className="space-y-2">
                <Label>Formato de Exportação</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { valor: 'pdf' as FormatoExport, nome: 'PDF', icone: FileText, cor: 'text-red-500' },
                    { valor: 'xlsx' as FormatoExport, nome: 'Excel', icone: FileSpreadsheet, cor: 'text-green-500' },
                    { valor: 'docx' as FormatoExport, nome: 'Word', icone: File, cor: 'text-blue-500' },
                  ].map((f) => (
                    <Card
                      key={f.valor}
                      className={`cursor-pointer transition-all ${
                        formato === f.valor ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setFormato(f.valor)}
                    >
                      <CardContent className="flex flex-col items-center justify-center py-4">
                        <f.icone className={`h-8 w-8 mb-2 ${f.cor}`} />
                        <span className="font-medium">{f.nome}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Título e Subtítulo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Relatório</Label>
                  <Input
                    value={config.titulo}
                    onChange={(e) => setConfig({ ...config, titulo: e.target.value })}
                    placeholder="Título do relatório"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={config.subtitulo}
                    onChange={(e) => setConfig({ ...config, subtitulo: e.target.value })}
                    placeholder="Subtítulo ou descrição"
                  />
                </div>
              </div>

              {/* Autor e Organização */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Autor
                  </Label>
                  <Input
                    value={config.autor}
                    onChange={(e) => setConfig({ ...config, autor: e.target.value })}
                    placeholder="Nome do autor"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Organização
                  </Label>
                  <Input
                    value={config.organizacao}
                    onChange={(e) => setConfig({ ...config, organizacao: e.target.value })}
                    placeholder="Nome da organização"
                  />
                </div>
              </div>

              {/* Data de Referência */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data de Referência
                </Label>
                <Input
                  type="date"
                  value={config.dataReferencia}
                  onChange={(e) => setConfig({ ...config, dataReferencia: e.target.value })}
                />
              </div>

              {/* Opções */}
              <div className="space-y-3">
                <Label>Opções do Relatório</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'incluirCapa', label: 'Incluir Capa' },
                    { key: 'incluirIndice', label: 'Incluir Índice' },
                    { key: 'incluirGraficos', label: 'Incluir Gráficos' },
                    { key: 'incluirTabelas', label: 'Incluir Tabelas' },
                    { key: 'incluirConclusoes', label: 'Incluir Conclusões' },
                    { key: 'margemErro', label: 'Mostrar Margem de Erro' },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <Switch
                        id={opt.key}
                        checked={config[opt.key as keyof ConfiguracaoRelatorio] as boolean}
                        onCheckedChange={(checked) =>
                          setConfig({ ...config, [opt.key]: checked })
                        }
                      />
                      <Label htmlFor={opt.key} className="text-sm">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidencial */}
              <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                <Switch
                  id="confidencial"
                  checked={config.confidencial}
                  onCheckedChange={(checked) => setConfig({ ...config, confidencial: checked })}
                />
                <Label htmlFor="confidencial" className="text-sm">
                  Marcar como CONFIDENCIAL
                </Label>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações Adicionais</Label>
                <Textarea
                  value={config.observacoes}
                  onChange={(e) => setConfig({ ...config, observacoes: e.target.value })}
                  placeholder="Notas ou observações para incluir no relatório..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Etapa: Seções */}
          {etapa === 'secoes' && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Selecione as seções para incluir no relatório
                </p>
                <Badge>{secoesIncluidas} seções selecionadas</Badge>
              </div>

              <div className="space-y-2">
                {secoes.map((secao) => {
                  const Icone = secao.icone;
                  return (
                    <div
                      key={secao.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        secao.incluida ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleSecao(secao.id)}
                    >
                      <Checkbox checked={secao.incluida} />
                      <Icone className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{secao.nome}</p>
                        <p className="text-xs text-muted-foreground">{secao.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Etapa: Gerando */}
          {etapa === 'gerando' && (
            <div className="py-12 text-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p className="font-medium">Gerando relatório...</p>
                <p className="text-sm text-muted-foreground">
                  Isso pode levar alguns segundos
                </p>
              </div>
              <Progress value={progresso} className="w-2/3 mx-auto" />
              <p className="text-sm text-muted-foreground">{progresso.toFixed(0)}%</p>
            </div>
          )}

          {/* Etapa: Concluído */}
          {etapa === 'concluido' && (
            <div className="py-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-lg">Relatório Exportado!</p>
                <p className="text-sm text-muted-foreground">
                  O download deve iniciar automaticamente
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg max-w-sm mx-auto">
                <p className="text-sm font-medium">{config.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  Formato: {formato.toUpperCase()} • {secoesIncluidas} seções
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          {etapa === 'configuracao' && (
            <>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setEtapa('secoes')}>
                Próximo
              </Button>
            </>
          )}

          {etapa === 'secoes' && (
            <>
              <Button variant="outline" onClick={() => setEtapa('configuracao')}>
                Voltar
              </Button>
              <Button onClick={gerarRelatorio} disabled={secoesIncluidas === 0}>
                <Download className="h-4 w-4 mr-2" />
                Gerar {formato.toUpperCase()}
              </Button>
            </>
          )}

          {etapa === 'concluido' && (
            <Button onClick={resetDialog}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
