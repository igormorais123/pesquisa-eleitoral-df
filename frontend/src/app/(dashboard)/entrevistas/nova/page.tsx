'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  Users,
  MessageSquare,
  CheckSquare,
  Square,
  Filter,
  Play,
  Coins,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Briefcase,
  FileText,
  Sparkles,
  Bot,
  Zap,
  DollarSign,
  Info,
  ExternalLink,
} from 'lucide-react';
import { TemplateSelectorAPI } from '@/components/templates';
import { TemplateCompleto, PerguntaTemplate as PerguntaTemplateType } from '@/types';
import { useEleitores } from '@/hooks/useEleitores';
import { useEntrevistasStore } from '@/stores/entrevistas-store';
import {
  useModelosIAStore,
  CATALOGO_MODELOS,
  estimarCustoEntrevistas,
  usdParaBrl,
  type ModeloIA,
} from '@/stores/modelos-ia-store';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';
import type { Pergunta, TipoPergunta } from '@/types';

type Etapa = 'perguntas' | 'selecao' | 'revisao';

const TIPOS_PERGUNTA: { tipo: TipoPergunta; rotulo: string; descricao: string }[] = [
  { tipo: 'aberta', rotulo: 'Aberta', descricao: 'Resposta livre em texto' },
  { tipo: 'escala', rotulo: 'Escala', descricao: 'Nota de 1 a 10' },
  { tipo: 'multipla_escolha', rotulo: 'Múltipla Escolha', descricao: 'Escolher entre opções' },
  { tipo: 'sim_nao', rotulo: 'Sim/Não', descricao: 'Resposta binária' },
];

// Opções de ocupação/vínculo
const OCUPACOES_VINCULOS = [
  { valor: 'servidor_publico', rotulo: 'Funcionário Público', icone: '🏛️' },
  { valor: 'clt', rotulo: 'CLT (Privado)', icone: '💼' },
  { valor: 'autonomo', rotulo: 'Autônomo', icone: '🔧' },
  { valor: 'empresario', rotulo: 'Empresário', icone: '🏢' },
  { valor: 'informal', rotulo: 'Informal', icone: '🛒' },
  { valor: 'desempregado', rotulo: 'Desempregado', icone: '📋' },
  { valor: 'aposentado', rotulo: 'Aposentado', icone: '🏖️' },
  { valor: 'estudante', rotulo: 'Estudante', icone: '📚' },
] as const;

// Opções de orientação política
const ORIENTACOES_POLITICAS = [
  { valor: 'esquerda', rotulo: 'Esquerda', cor: 'bg-red-500' },
  { valor: 'centro-esquerda', rotulo: 'Centro-Esquerda', cor: 'bg-orange-500' },
  { valor: 'centro', rotulo: 'Centro', cor: 'bg-gray-500' },
  { valor: 'centro-direita', rotulo: 'Centro-Direita', cor: 'bg-blue-400' },
  { valor: 'direita', rotulo: 'Direita', cor: 'bg-blue-600' },
] as const;

// Opções de gênero
const GENEROS = [
  { valor: 'masculino', rotulo: 'Masculino' },
  { valor: 'feminino', rotulo: 'Feminino' },
] as const;

// Opções de cluster socioeconômico
const CLUSTERS = [
  { valor: 'G1_alta', rotulo: 'Alta Renda' },
  { valor: 'G2_media_alta', rotulo: 'Média-Alta' },
  { valor: 'G3_media_baixa', rotulo: 'Média-Baixa' },
  { valor: 'G4_baixa', rotulo: 'Baixa Renda' },
] as const;

export default function PaginaNovaEntrevista() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>('perguntas');
  const [titulo, setTitulo] = useState('');
  const [perguntas, setPerguntas] = useState<Partial<Pergunta>[]>([
    { texto: '', tipo: 'aberta', obrigatoria: true },
  ]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarTemplates, setMostrarTemplates] = useState(false);
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string>('');
  const [mostrarSeletorIA, setMostrarSeletorIA] = useState(false);

  // Store de modelos de IA
  const { configuracaoTarefas, getModeloParaTarefa, chavesAPI } = useModelosIAStore();

  // Modelo padrão da configuração de entrevistas ou o primeiro disponível
  const modeloPadrao = getModeloParaTarefa('entrevistas');
  const modeloSelecionado: ModeloIA | undefined = modeloSelecionadoId
    ? CATALOGO_MODELOS.find(m => m.id === modeloSelecionadoId)
    : modeloPadrao;

  // Inicializar o modelo selecionado com o padrão
  useState(() => {
    if (!modeloSelecionadoId && modeloPadrao) {
      setModeloSelecionadoId(modeloPadrao.id);
    }
  });

  // Modelos recomendados para entrevistas (rápidos e econômicos)
  const modelosRecomendados = CATALOGO_MODELOS.filter(m =>
    m.recomendadoPara.includes('entrevistas')
  ).sort((a, b) => (a.precoInput + a.precoOutput) - (b.precoInput + b.precoOutput));

  const {
    eleitoresFiltrados,
    eleitoresSelecionados,
    estatisticas,
    filtros,
    toggleSelecionarParaEntrevista,
    selecionarTodos,
    limparSelecao,
    setFiltros,
    limparFiltros,
  } = useEleitores();

  const { iniciarExecucao, setPerguntas: setStorePerguntas, setTitulo: setStoreTitulo } = useEntrevistasStore();

  // Performance: useCallback para handlers que são passados como props
  const adicionarPergunta = useCallback(() => {
    setPerguntas((prev) => [...prev, { texto: '', tipo: 'aberta', obrigatoria: true }]);
  }, []);

  const removerPergunta = useCallback((index: number) => {
    setPerguntas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const atualizarPergunta = useCallback((index: number, dados: Partial<Pergunta>) => {
    setPerguntas((prev) => prev.map((p, i) => (i === index ? { ...p, ...dados } : p)));
  }, []);

  // Importar perguntas de um template
  const importarDoTemplate = useCallback((template: TemplateCompleto) => {
    const novasPerguntas: Partial<Pergunta>[] = template.perguntas.map((p) => {
      // Mapear tipo do template para tipo do sistema
      let tipo: TipoPergunta = 'aberta';
      if (p.tipo === 'unica' || p.tipo === 'multipla') tipo = 'multipla_escolha';
      else if (p.tipo === 'escala' || p.tipo === 'numerica') tipo = 'escala';
      else if (p.tipo === 'aberta') tipo = 'aberta';

      return {
        texto: p.texto,
        tipo,
        obrigatoria: p.obrigatoria,
        opcoes: p.opcoes.length > 0 ? p.opcoes.map(o => o.texto) : undefined,
        escala_min: p.tipo === 'escala' ? 1 : undefined,
        escala_max: p.tipo === 'escala' ? 10 : undefined,
      };
    });

    setPerguntas(novasPerguntas);
    setMostrarTemplates(false);
    // Se o título estiver vazio, usar o nome do template
    if (!titulo.trim()) {
      setTitulo(template.nome);
    }
  }, [titulo]);

  // Adicionar perguntas selecionadas do template
  const adicionarPerguntasDoTemplate = useCallback((perguntasTemplate: PerguntaTemplateType[]) => {
    const novasPerguntas: Partial<Pergunta>[] = perguntasTemplate.map((p) => {
      let tipo: TipoPergunta = 'aberta';
      if (p.tipo === 'unica' || p.tipo === 'multipla') tipo = 'multipla_escolha';
      else if (p.tipo === 'escala' || p.tipo === 'numerica') tipo = 'escala';
      else if (p.tipo === 'aberta') tipo = 'aberta';

      return {
        texto: p.texto,
        tipo,
        obrigatoria: p.obrigatoria,
        opcoes: p.opcoes.length > 0 ? p.opcoes.map(o => o.texto) : undefined,
        escala_min: p.tipo === 'escala' ? 1 : undefined,
        escala_max: p.tipo === 'escala' ? 10 : undefined,
      };
    });

    // Adicionar às perguntas existentes (exceto se só tiver uma vazia)
    setPerguntas((prev) => {
      if (prev.length === 1 && !prev[0].texto?.trim()) {
        return novasPerguntas;
      }
      return [...prev, ...novasPerguntas];
    });
    setMostrarTemplates(false);
  }, []);

  // Calcular custo estimado com base no modelo selecionado
  const custoEstimadoInfo = modeloSelecionado
    ? estimarCustoEntrevistas(
        modeloSelecionado,
        eleitoresSelecionados.length || 1,
        perguntas.length || 1,
        800,  // tokens input por pergunta (contexto + persona + pergunta)
        500   // tokens output por pergunta (resposta)
      )
    : { custoBase: 0, custoComMargem: 0, custoPorEntrevista: 0 };

  // Converter para BRL e aplicar margem extra de segurança (25% total)
  const custoEstimadoBRL = usdParaBrl(custoEstimadoInfo.custoComMargem);
  const custoPorRespostaBRL = usdParaBrl(custoEstimadoInfo.custoPorEntrevista);
  const custoEstimado = custoEstimadoBRL; // Para manter compatibilidade

  // Validar etapa
  const validarEtapaPerguntas = () => {
    return titulo.trim() && perguntas.every((p) => p.texto?.trim());
  };

  const validarEtapaSelecao = () => {
    return eleitoresSelecionados.length > 0;
  };

  // Iniciar entrevista
  const iniciar = () => {
    const entrevistaId = `e-${Date.now()}`;

    // Preparar perguntas com IDs
    const perguntasComId: Pergunta[] = perguntas.map((p, index) => ({
      id: `p-${Date.now()}-${index}`,
      texto: p.texto || '',
      tipo: p.tipo || 'aberta',
      obrigatoria: p.obrigatoria ?? true,
      opcoes: p.opcoes,
      escala_min: p.escala_min,
      escala_max: p.escala_max,
      escala_rotulos: p.escala_rotulos,
    }));

    // Setar título e perguntas na store ANTES de iniciar
    setStoreTitulo(titulo);
    setStorePerguntas(perguntasComId);

    // Iniciar execução
    iniciarExecucao(entrevistaId, eleitoresSelecionados);
    router.push(`/entrevistas/execucao?entrevista=${entrevistaId}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/entrevistas"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Entrevista</h1>
          <p className="text-muted-foreground">Configure as perguntas e selecione os respondentes</p>
        </div>
      </div>

      {/* Progresso */}
      <div className="flex items-center gap-4 mb-8">
        {(['perguntas', 'selecao', 'revisao'] as Etapa[]).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                etapa === e
                  ? 'bg-primary text-primary-foreground'
                  : i < ['perguntas', 'selecao', 'revisao'].indexOf(etapa)
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                etapa === e ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {e === 'perguntas' ? 'Perguntas' : e === 'selecao' ? 'Seleção' : 'Revisão'}
            </span>
            {i < 2 && <div className="w-12 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {/* Etapa 1: Perguntas */}
      {etapa === 'perguntas' && (
        <div className="space-y-6">
          {/* Título */}
          <div className="glass-card rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Título da Entrevista <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Pesquisa de intenção de voto - Janeiro 2026"
              className={cn(
                'w-full px-4 py-3 bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors',
                !titulo.trim() ? 'border-red-500/50' : 'border-border'
              )}
              required
            />
            {!titulo.trim() && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                Campo obrigatório - preencha para avançar
              </p>
            )}
          </div>

          {/* Botão para usar templates */}
          <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Usar Templates de Perguntas</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece rapidamente com perguntas prontas para pesquisas eleitorais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarTemplates(!mostrarTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                {mostrarTemplates ? 'Ocultar Templates' : 'Ver Templates'}
              </button>
            </div>

            {/* Seletor de templates */}
            {mostrarTemplates && (
              <div className="mt-6 pt-6 border-t border-border">
                <TemplateSelectorAPI
                  modoSelecao="perguntas"
                  onSelectTemplate={importarDoTemplate}
                  onSelectPerguntas={adicionarPerguntasDoTemplate}
                />
              </div>
            )}
          </div>

          {/* Perguntas */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Perguntas {perguntas.length > 0 && `(${perguntas.length})`}
              </h2>
              <button
                onClick={adicionarPergunta}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Pergunta
              </button>
            </div>

            <div className="space-y-4">
              {perguntas.map((pergunta, index) => (
                <div
                  key={index}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 pt-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <textarea
                        value={pergunta.texto}
                        onChange={(e) =>
                          atualizarPergunta(index, { texto: e.target.value })
                        }
                        placeholder="Digite a pergunta..."
                        rows={2}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">Tipo:</label>
                          <select
                            value={pergunta.tipo}
                            onChange={(e) =>
                              atualizarPergunta(index, {
                                tipo: e.target.value as TipoPergunta,
                              })
                            }
                            className="px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {TIPOS_PERGUNTA.map((t) => (
                              <option key={t.tipo} value={t.tipo}>
                                {t.rotulo}
                              </option>
                            ))}
                          </select>
                        </div>

                        {pergunta.tipo === 'multipla_escolha' && (
                          <input
                            type="text"
                            placeholder="Opções separadas por vírgula"
                            onChange={(e) =>
                              atualizarPergunta(index, {
                                opcoes: e.target.value.split(',').map((o) => o.trim()),
                              })
                            }
                            className="flex-1 px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        )}

                        {pergunta.tipo === 'escala' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              min={1}
                              max={10}
                              defaultValue={1}
                              onChange={(e) =>
                                atualizarPergunta(index, {
                                  escala_min: parseInt(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <span className="text-muted-foreground">a</span>
                            <input
                              type="number"
                              placeholder="Max"
                              min={1}
                              max={10}
                              defaultValue={10}
                              onChange={(e) =>
                                atualizarPergunta(index, {
                                  escala_max: parseInt(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {perguntas.length > 1 && (
                      <button
                        onClick={() => removerPergunta(index)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ação */}
          <div className="flex justify-end">
            <button
              onClick={() => setEtapa('selecao')}
              disabled={!validarEtapaPerguntas()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo: Selecionar Respondentes
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Seleção */}
      {etapa === 'selecao' && (
        <div className="space-y-6">
          {/* Painel de Filtros */}
          <div className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Filtros de Seleção</span>
                {(filtros.ocupacoes_vinculos?.length || filtros.orientacoes_politicas?.length || filtros.generos?.length || filtros.clusters?.length) && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                    Filtros ativos
                  </span>
                )}
              </div>
              {mostrarFiltros ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {mostrarFiltros && (
              <div className="p-4 border-t border-border space-y-6">
                {/* Filtro por Ocupação/Vínculo - DESTAQUE */}
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">Ocupação / Vínculo Empregatício</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {OCUPACOES_VINCULOS.map((ocupacao) => (
                      <button
                        key={ocupacao.valor}
                        onClick={() => {
                          const atual = filtros.ocupacoes_vinculos || [];
                          const novo = atual.includes(ocupacao.valor as any)
                            ? atual.filter((o) => o !== ocupacao.valor)
                            : [...atual, ocupacao.valor as any];
                          setFiltros({ ocupacoes_vinculos: novo });
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          filtros.ocupacoes_vinculos?.includes(ocupacao.valor as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        )}
                      >
                        <span className="mr-1">{ocupacao.icone}</span>
                        {ocupacao.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Orientação Política */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Orientação Política</h3>
                  <div className="flex flex-wrap gap-2">
                    {ORIENTACOES_POLITICAS.map((orientacao) => (
                      <button
                        key={orientacao.valor}
                        onClick={() => {
                          const atual = filtros.orientacoes_politicas || [];
                          const novo = atual.includes(orientacao.valor as any)
                            ? atual.filter((o) => o !== orientacao.valor)
                            : [...atual, orientacao.valor as any];
                          setFiltros({ orientacoes_politicas: novo });
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          filtros.orientacoes_politicas?.includes(orientacao.valor as any)
                            ? `${orientacao.cor} text-white`
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        )}
                      >
                        {orientacao.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Gênero */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Gênero</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENEROS.map((genero) => (
                      <button
                        key={genero.valor}
                        onClick={() => {
                          const atual = filtros.generos || [];
                          const novo = atual.includes(genero.valor as any)
                            ? atual.filter((g) => g !== genero.valor)
                            : [...atual, genero.valor as any];
                          setFiltros({ generos: novo });
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          filtros.generos?.includes(genero.valor as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        )}
                      >
                        {genero.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Cluster Socioeconômico */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Classe Socioeconômica</h3>
                  <div className="flex flex-wrap gap-2">
                    {CLUSTERS.map((cluster) => (
                      <button
                        key={cluster.valor}
                        onClick={() => {
                          const atual = filtros.clusters || [];
                          const novo = atual.includes(cluster.valor as any)
                            ? atual.filter((c) => c !== cluster.valor)
                            : [...atual, cluster.valor as any];
                          setFiltros({ clusters: novo });
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          filtros.clusters?.includes(cluster.valor as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        )}
                      >
                        {cluster.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex justify-end">
                  <button
                    onClick={limparFiltros}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpar todos os filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Eleitores */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Selecionar Respondentes
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={selecionarTodos}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Selecionar todos ({eleitoresFiltrados.length})
                </button>
                {eleitoresSelecionados.length > 0 && (
                  <button
                    onClick={limparSelecao}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-primary mr-2">
                  {eleitoresSelecionados.length}
                </span>
                eleitores selecionados de {eleitoresFiltrados.length} disponíveis
              </p>
              {/* Tags de filtros ativos */}
              {(filtros.ocupacoes_vinculos?.length || filtros.orientacoes_politicas?.length) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filtros.ocupacoes_vinculos?.map((o) => {
                    const ocupacao = OCUPACOES_VINCULOS.find((oc) => oc.valor === o);
                    return ocupacao ? (
                      <span key={o} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {ocupacao.icone} {ocupacao.rotulo}
                      </span>
                    ) : null;
                  })}
                  {filtros.orientacoes_politicas?.map((o) => {
                    const orientacao = ORIENTACOES_POLITICAS.find((or) => or.valor === o);
                    return orientacao ? (
                      <span key={o} className={cn('px-2 py-1 text-white text-xs rounded-full', orientacao.cor)}>
                        {orientacao.rotulo}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Lista simplificada de eleitores */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {eleitoresFiltrados.slice(0, 50).map((eleitor) => (
                <div
                  key={eleitor.id}
                  onClick={() => toggleSelecionarParaEntrevista(eleitor.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    eleitoresSelecionados.includes(eleitor.id)
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  {eleitoresSelecionados.includes(eleitor.id) ? (
                    <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{eleitor.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {eleitor.idade} anos • {eleitor.regiao_administrativa} • {eleitor.profissao} •{' '}
                      <span className={cn(
                        eleitor.ocupacao_vinculo === 'servidor_publico' ? 'text-primary font-medium' : ''
                      )}>
                        {OCUPACOES_VINCULOS.find((o) => o.valor === eleitor.ocupacao_vinculo)?.rotulo || eleitor.ocupacao_vinculo}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              {eleitoresFiltrados.length > 50 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  ... e mais {eleitoresFiltrados.length - 50} eleitores
                </p>
              )}
              {eleitoresFiltrados.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhum eleitor encontrado com os filtros selecionados.
                </p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between">
            <button
              onClick={() => setEtapa('perguntas')}
              className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={() => setEtapa('revisao')}
              disabled={!validarEtapaSelecao()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo: Revisar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Revisão */}
      {etapa === 'revisao' && (
        <div className="space-y-6">
          {/* Seleção de Modelo de IA */}
          <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Modelo de IA para Entrevistas</h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha qual IA vai responder como os eleitores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarSeletorIA(!mostrarSeletorIA)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm"
              >
                {mostrarSeletorIA ? 'Fechar' : 'Alterar Modelo'}
              </button>
            </div>

            {/* Modelo atual selecionado */}
            {modeloSelecionado && (
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm',
                      modeloSelecionado.categoria === 'gratuito' || modeloSelecionado.categoria === 'local'
                        ? 'bg-green-500'
                        : modeloSelecionado.categoria === 'economico'
                        ? 'bg-blue-500'
                        : modeloSelecionado.categoria === 'balanceado'
                        ? 'bg-purple-500'
                        : 'bg-amber-500'
                    )}>
                      {modeloSelecionado.provedor.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{modeloSelecionado.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {modeloSelecionado.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {modeloSelecionado.gratuito ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                        🎉 GRÁTIS
                      </span>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          ${modeloSelecionado.precoInput.toFixed(2)} / ${modeloSelecionado.precoOutput.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">input / output por 1M tokens</p>
                      </div>
                    )}
                  </div>
                </div>
                {modeloSelecionado.tierGratuito && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                    💡 {modeloSelecionado.tierGratuito}
                  </div>
                )}
              </div>
            )}

            {/* Seletor expandido de modelos */}
            {mostrarSeletorIA && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Modelos recomendados para entrevistas (ordenados por preço):
                </p>
                {modelosRecomendados.map((modelo) => (
                  <button
                    key={modelo.id}
                    onClick={() => {
                      setModeloSelecionadoId(modelo.id);
                      setMostrarSeletorIA(false);
                    }}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-all text-left',
                      modeloSelecionadoId === modelo.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/30 hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold',
                          modelo.categoria === 'gratuito' || modelo.categoria === 'local'
                            ? 'bg-green-500'
                            : modelo.categoria === 'economico'
                            ? 'bg-blue-500'
                            : modelo.categoria === 'balanceado'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        )}>
                          {modelo.provedor.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{modelo.nome}</p>
                          <p className="text-xs text-muted-foreground">{modelo.versao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {modelo.gratuito ? (
                          <span className="text-green-400 text-sm font-medium">GRÁTIS</span>
                        ) : (
                          <p className="text-sm font-medium text-foreground">
                            ~R${usdParaBrl(modelo.precoInput + modelo.precoOutput).toFixed(2)}/M
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className={cn(
                            'w-3 h-3',
                            modelo.velocidade === 'ultra-rapido' ? 'text-yellow-400' :
                            modelo.velocidade === 'rapido' ? 'text-green-400' :
                            modelo.velocidade === 'medio' ? 'text-blue-400' : 'text-gray-400'
                          )} />
                          {modelo.velocidade}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                <a
                  href="/configuracoes"
                  className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Configurar mais modelos e chaves de API
                </a>
              </div>
            )}
          </div>

          {/* Resumo da Entrevista */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Resumo da Entrevista</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Título</span>
                </div>
                <span className="font-medium text-foreground">{titulo}</span>
              </div>

              {/* Perguntas com títulos */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">
                    {perguntas.length} Perguntas
                  </span>
                </div>
                <div className="space-y-2 pl-8">
                  {perguntas.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground font-mono">{i + 1}.</span>
                      <span className="text-foreground line-clamp-1">
                        {p.texto || '(pergunta vazia)'}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs ml-auto flex-shrink-0',
                        p.tipo === 'aberta' ? 'bg-blue-500/20 text-blue-400' :
                        p.tipo === 'escala' ? 'bg-purple-500/20 text-purple-400' :
                        p.tipo === 'multipla_escolha' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      )}>
                        {p.tipo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Respondentes</span>
                </div>
                <span className="font-medium text-foreground">
                  {eleitoresSelecionados.length} eleitores
                </span>
              </div>
            </div>
          </div>

          {/* Custo Estimado Detalhado */}
          <div className="glass-card rounded-xl p-6 bg-gradient-to-r from-yellow-500/5 to-amber-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Custo Estimado</h3>
                <p className="text-sm text-muted-foreground">
                  Baseado no modelo {modeloSelecionado?.nome || 'selecionado'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Custo Total (c/ margem 20%)</p>
                <p className={cn(
                  'text-3xl font-bold',
                  modeloSelecionado?.gratuito ? 'text-green-400' : 'text-yellow-400'
                )}>
                  {modeloSelecionado?.gratuito ? 'GRÁTIS' : formatarMoeda(custoEstimadoBRL)}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Custo por Eleitor</p>
                <p className={cn(
                  'text-3xl font-bold',
                  modeloSelecionado?.gratuito ? 'text-green-400' : 'text-foreground'
                )}>
                  {modeloSelecionado?.gratuito ? 'R$0,00' : formatarMoeda(custoPorRespostaBRL)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens input estimados:</span>
                <span className="text-foreground">
                  ~{formatarNumero((eleitoresSelecionados.length || 1) * (perguntas.length || 1) * 800)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens output estimados:</span>
                <span className="text-foreground">
                  ~{formatarNumero((eleitoresSelecionados.length || 1) * (perguntas.length || 1) * 500)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de chamadas à API:</span>
                <span className="text-foreground">
                  {formatarNumero((eleitoresSelecionados.length || 0) * (perguntas.length || 0))}
                </span>
              </div>
            </div>

            {/* Dica de modelo mais barato */}
            {!modeloSelecionado?.gratuito && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>
                    Dica: Use modelos locais (Ollama) ou gratuitos (OpenRouter) para custo zero!
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Aviso de custo */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Atenção ao custo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta entrevista consumirá aproximadamente{' '}
                <strong className="text-foreground">{formatarMoeda(custoEstimadoBRL)}</strong> usando{' '}
                <strong className="text-foreground">{modeloSelecionado?.nome}</strong>.
                O limite por sessão é de R$ 100,00. A margem de segurança de 20% já está incluída.
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between">
            <button
              onClick={() => setEtapa('selecao')}
              className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={iniciar}
              className="flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-5 h-5" />
              Iniciar Entrevista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
