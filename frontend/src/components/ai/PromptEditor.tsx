'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Edit3,
  Save,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  FileText,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PromptTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'entrevista' | 'insights' | 'relatorio' | 'geracao' | 'extracao' | 'custom';
  prompt: string;
  variaveis: string[]; // Variáveis que podem ser substituídas no prompt
  modelo_recomendado: 'opus' | 'sonnet' | 'haiku';
}

interface PromptEditorProps {
  promptInicial: string;
  titulo?: string;
  descricao?: string;
  onExecutar: (prompt: string) => Promise<void>;
  onSalvarTemplate?: (template: Omit<PromptTemplate, 'id'>) => void;
  templates?: PromptTemplate[];
  onSelecionarTemplate?: (template: PromptTemplate) => void;
  executando?: boolean;
  modeloSelecionado?: 'opus' | 'sonnet' | 'haiku';
  onMudarModelo?: (modelo: 'opus' | 'sonnet' | 'haiku') => void;
  mostrarCusto?: boolean;
  className?: string;
}

// Estima tokens baseado em caracteres (aproximação)
function estimarTokens(texto: string): number {
  return Math.ceil(texto.length / 4);
}

// Estima custo em reais
function estimarCusto(tokens: number, modelo: 'opus' | 'sonnet' | 'haiku'): number {
  const custoPor1MInput: Record<string, number> = {
    opus: 75.0, // $15 * 5 (taxa câmbio aproximada)
    sonnet: 15.0, // $3 * 5
    haiku: 1.25, // $0.25 * 5
  };
  return (tokens / 1_000_000) * custoPor1MInput[modelo];
}

export function PromptEditor({
  promptInicial,
  titulo = 'Prompt de IA',
  descricao,
  onExecutar,
  onSalvarTemplate,
  templates = [],
  onSelecionarTemplate,
  executando = false,
  modeloSelecionado = 'sonnet',
  onMudarModelo,
  mostrarCusto = true,
  className,
}: PromptEditorProps) {
  const [prompt, setPrompt] = useState(promptInicial);
  const [promptOriginal] = useState(promptInicial);
  const [editando, setEditando] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mostrarTemplates, setMostrarTemplates] = useState(false);

  // Verifica se o prompt foi modificado
  const foiModificado = prompt !== promptOriginal;

  // Estimativas
  const tokens = useMemo(() => estimarTokens(prompt), [prompt]);
  const custo = useMemo(() => estimarCusto(tokens, modeloSelecionado), [tokens, modeloSelecionado]);

  // Copiar prompt
  const copiarPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }, [prompt]);

  // Resetar para original
  const resetarPrompt = useCallback(() => {
    setPrompt(promptInicial);
    setEditando(false);
  }, [promptInicial]);

  // Executar com o prompt atual
  const handleExecutar = useCallback(async () => {
    await onExecutar(prompt);
  }, [onExecutar, prompt]);

  // Selecionar template
  const handleSelecionarTemplate = useCallback((template: PromptTemplate) => {
    setPrompt(template.prompt);
    setMostrarTemplates(false);
    onSelecionarTemplate?.(template);
  }, [onSelecionarTemplate]);

  // Linhas do prompt para preview
  const linhasPrompt = prompt.split('\n');
  const previewLinhas = expandido ? linhasPrompt : linhasPrompt.slice(0, 10);
  const temMaisLinhas = linhasPrompt.length > 10;

  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{titulo}</h3>
              {descricao && (
                <p className="text-xs text-muted-foreground">{descricao}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Modelo */}
            {onMudarModelo && (
              <select
                value={modeloSelecionado}
                onChange={(e) => onMudarModelo(e.target.value as 'opus' | 'sonnet' | 'haiku')}
                className="text-xs bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground"
              >
                <option value="opus">Opus 4.5 (complexo)</option>
                <option value="sonnet">Sonnet 4.5 (padrão)</option>
                <option value="haiku">Haiku (rápido)</option>
              </select>
            )}

            {/* Indicador de modificação */}
            {foiModificado && (
              <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" />
                Modificado
              </span>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>{tokens.toLocaleString()} tokens estimados</span>
          <span>{linhasPrompt.length} linhas</span>
          {mostrarCusto && (
            <span className="text-primary">
              ~R$ {custo.toFixed(4)} por execução
            </span>
          )}
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-secondary/30">
          <button
            onClick={() => setMostrarTemplates(!mostrarTemplates)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-4 h-4" />
            Templates disponíveis ({templates.length})
            {mostrarTemplates ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {mostrarTemplates && (
            <div className="mt-2 space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelecionarTemplate(template)}
                  className="w-full text-left p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">
                      {template.nome}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      template.modelo_recomendado === 'opus' && 'bg-purple-500/20 text-purple-400',
                      template.modelo_recomendado === 'sonnet' && 'bg-blue-500/20 text-blue-400',
                      template.modelo_recomendado === 'haiku' && 'bg-green-500/20 text-green-400',
                    )}>
                      {template.modelo_recomendado}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.descricao}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo do Prompt */}
      <div className="relative">
        {editando ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full min-h-[300px] max-h-[600px] p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-y focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="p-4 bg-gray-900/50">
            <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
              {previewLinhas.map((linha, i) => (
                <div key={i} className="flex">
                  <span className="w-10 text-right pr-3 text-gray-600 select-none">
                    {i + 1}
                  </span>
                  <span className="flex-1">{linha}</span>
                </div>
              ))}
            </pre>

            {temMaisLinhas && !expandido && (
              <div className="text-center py-2">
                <button
                  onClick={() => setExpandido(true)}
                  className="text-xs text-primary hover:underline"
                >
                  + {linhasPrompt.length - 10} linhas ocultas - clique para expandir
                </button>
              </div>
            )}
          </div>
        )}

        {/* Botão de expandir/colapsar quando não editando */}
        {!editando && expandido && temMaisLinhas && (
          <button
            onClick={() => setExpandido(false)}
            className="absolute bottom-2 right-2 text-xs text-muted-foreground hover:text-foreground bg-gray-800 px-2 py-1 rounded"
          >
            Colapsar
          </button>
        )}
      </div>

      {/* Ações */}
      <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Toggle Edição */}
          <button
            onClick={() => setEditando(!editando)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              editando
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            )}
          >
            {editando ? (
              <>
                <Eye className="w-4 h-4" />
                Visualizar
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                Editar
              </>
            )}
          </button>

          {/* Copiar */}
          <button
            onClick={copiarPrompt}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            {copiado ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>

          {/* Resetar */}
          {foiModificado && (
            <button
              onClick={resetarPrompt}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
          )}

          {/* Salvar como Template */}
          {onSalvarTemplate && foiModificado && (
            <button
              onClick={() => {
                const nome = window.prompt('Nome do template:');
                if (nome) {
                  onSalvarTemplate({
                    nome,
                    descricao: 'Template personalizado',
                    categoria: 'custom',
                    prompt,
                    variaveis: [],
                    modelo_recomendado: modeloSelecionado,
                  });
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Template
            </button>
          )}
        </div>

        {/* Executar */}
        <button
          onClick={handleExecutar}
          disabled={executando}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            executando
              ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {executando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Executar Análise
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PromptEditor;
