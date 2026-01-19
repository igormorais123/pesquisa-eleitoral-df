'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Building2,
  Briefcase,
  Target,
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useGestores } from '@/hooks/useGestores';
import { usePesquisaPODCStore } from '@/stores/pesquisa-podc-store';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';
import { api } from '@/services/api';
import type { TipoPergunta, Pergunta, SetorGestor, NivelHierarquico } from '@/types';

type Etapa = 'template' | 'perguntas' | 'selecao' | 'revisao';

// Interface para templates da API
interface TemplateAPI {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  tags: string[];
  total_perguntas: number;
}

interface TemplateCompletoAPI {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  tags: string[];
  perguntas: {
    codigo: string;
    texto: string;
    tipo: TipoPergunta;
    categoria: string;
    obrigatoria: boolean;
    ordem: number;
    escala_min?: number;
    escala_max?: number;
    opcoes?: string[];
    instrucoes?: string;
    insight_esperado?: string;
    bloco?: string;
  }[];
}

const TIPOS_PERGUNTA: { tipo: TipoPergunta; rotulo: string; descricao: string }[] = [
  { tipo: 'aberta', rotulo: 'Aberta', descricao: 'Resposta livre em texto' },
  { tipo: 'escala', rotulo: 'Escala', descricao: 'Nota de 1 a 10' },
  { tipo: 'multipla_escolha', rotulo: 'Multipla Escolha', descricao: 'Escolher entre opcoes' },
  { tipo: 'sim_nao', rotulo: 'Sim/Nao', descricao: 'Resposta binaria' },
];

// Cores das categorias PODC
const CORES_CATEGORIA: Record<string, string> = {
  podc_planejar: 'bg-blue-600',
  podc_organizar: 'bg-green-600',
  podc_dirigir: 'bg-orange-500',
  podc_controlar: 'bg-red-600',
  podc_consolidado: 'bg-purple-600',
};

// Opções de setor
const SETORES = [
  { valor: 'publico', rotulo: 'Setor Publico', icone: Building2, cor: 'bg-blue-500' },
  { valor: 'privado', rotulo: 'Setor Privado', icone: Briefcase, cor: 'bg-green-500' },
];

// Opções de nível hierárquico
const NIVEIS = [
  { valor: 'estrategico', rotulo: 'Estrategico', cor: 'bg-purple-500' },
  { valor: 'tatico', rotulo: 'Tatico', cor: 'bg-orange-500' },
  { valor: 'operacional', rotulo: 'Operacional', cor: 'bg-cyan-500' },
];

export default function PaginaEntrevistasGestores() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>('template');
  const [titulo, setTitulo] = useState('');
  const [templateSelecionado, setTemplateSelecionado] = useState<string | null>(null);
  const [perguntas, setPerguntas] = useState<Partial<Pergunta>[]>([
    { texto: '', tipo: 'aberta', obrigatoria: true },
  ]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Templates da API
  const [templatesAPI, setTemplatesAPI] = useState<TemplateAPI[]>([]);
  const [carregandoTemplates, setCarregandoTemplates] = useState(true);
  const [erroTemplates, setErroTemplates] = useState<string | null>(null);

  // Filtros locais
  const [filtroSetores, setFiltroSetores] = useState<SetorGestor[]>([]);
  const [filtroNiveis, setFiltroNiveis] = useState<NivelHierarquico[]>([]);

  const {
    gestoresFiltrados,
    gestoresSelecionados,
    estatisticas,
    filtros,
    toggleSelecionarParaPesquisa,
    selecionarTodos,
    limparSelecao,
    selecionarPorFiltro,
    setFiltros,
    limparFiltros,
  } = useGestores();

  const {
    setTitulo: setTituloPODC,
    setPerguntas: setPerguntasPODC,
    setGestoresSelecionados,
  } = usePesquisaPODCStore();

  // Carregar templates da API ao montar
  useEffect(() => {
    const carregarTemplates = async () => {
      setCarregandoTemplates(true);
      setErroTemplates(null);
      try {
        const response = await api.get('/templates/', {
          params: { secao: 'gestores' }
        });
        setTemplatesAPI(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar templates:', error);
        setErroTemplates(error.response?.data?.detail || 'Erro ao carregar templates');
      } finally {
        setCarregandoTemplates(false);
      }
    };
    carregarTemplates();
  }, []);

  // Selecionar template - busca template completo da API
  const selecionarTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await api.get(`/templates/${templateId}`);
      const templateCompleto: TemplateCompletoAPI = response.data;

      setTemplateSelecionado(templateId);
      setTitulo(templateCompleto.nome);

      // Converter perguntas do formato da API para formato do componente
      const perguntasConvertidas: Partial<Pergunta>[] = templateCompleto.perguntas.map((p) => ({
        texto: p.texto,
        tipo: p.tipo,
        obrigatoria: p.obrigatoria,
        escala_min: p.escala_min,
        escala_max: p.escala_max,
      }));

      setPerguntas(perguntasConvertidas);
    } catch (error: any) {
      console.error('Erro ao carregar template:', error);
      setErroTemplates(error.response?.data?.detail || 'Erro ao carregar template');
    }
  }, []);

  // Handlers de perguntas
  const adicionarPergunta = useCallback(() => {
    setPerguntas((prev) => [...prev, { texto: '', tipo: 'aberta', obrigatoria: true }]);
  }, []);

  const removerPergunta = useCallback((index: number) => {
    setPerguntas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const atualizarPergunta = useCallback((index: number, dados: Partial<Pergunta>) => {
    setPerguntas((prev) => prev.map((p, i) => (i === index ? { ...p, ...dados } : p)));
  }, []);

  // Calcular custo estimado
  const custoEstimado = gestoresSelecionados.length * perguntas.length * 0.18; // R$ 0.18 por resposta

  // Validações
  const validarEtapaTemplate = () => templateSelecionado !== null || perguntas.some((p) => p.texto?.trim());
  const validarEtapaPerguntas = () => titulo.trim() && perguntas.every((p) => p.texto?.trim());
  const validarEtapaSelecao = () => gestoresSelecionados.length > 0;

  // Aplicar filtros locais
  const gestoresFiltradosLocal = gestoresFiltrados.filter((g) => {
    if (filtroSetores.length > 0 && !filtroSetores.includes(g.setor)) return false;
    if (filtroNiveis.length > 0 && !filtroNiveis.includes(g.nivel_hierarquico)) return false;
    return true;
  });

  // Iniciar entrevista
  const iniciar = () => {
    // Salvar dados no store PODC
    setTituloPODC(titulo);

    // Converter perguntas para formato completo com IDs
    const perguntasCompletas: Pergunta[] = perguntas.map((p, index) => ({
      id: `p-${Date.now()}-${index}`,
      texto: p.texto || '',
      tipo: p.tipo || 'aberta',
      obrigatoria: p.obrigatoria ?? true,
      escala_min: p.escala_min,
      escala_max: p.escala_max,
    }));

    setPerguntasPODC(perguntasCompletas);
    setGestoresSelecionados(gestoresSelecionados);

    // Redirecionar para a página de execução
    router.push('/gestores/entrevistas/execucao');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/gestores"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Target className="w-7 h-7 text-primary" />
            Pesquisa PODC com Gestores
          </h1>
          <p className="text-muted-foreground">Configure a pesquisa sobre distribuicao de funcoes administrativas</p>
        </div>
      </div>

      {/* Progresso */}
      <div className="flex items-center gap-4 mb-8">
        {(['template', 'perguntas', 'selecao', 'revisao'] as Etapa[]).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                etapa === e
                  ? 'bg-primary text-primary-foreground'
                  : i < ['template', 'perguntas', 'selecao', 'revisao'].indexOf(etapa)
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:inline',
                etapa === e ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {e === 'template' ? 'Template' : e === 'perguntas' ? 'Perguntas' : e === 'selecao' ? 'Selecao' : 'Revisao'}
            </span>
            {i < 3 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {/* Etapa 1: Selecionar Template */}
      {etapa === 'template' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Selecione um Template de Pesquisa PODC
              </h2>
              {!carregandoTemplates && (
                <button
                  onClick={() => {
                    setCarregandoTemplates(true);
                    api.get('/templates/', { params: { secao: 'gestores' } })
                      .then((res) => setTemplatesAPI(res.data))
                      .catch((err) => setErroTemplates(err.response?.data?.detail || 'Erro'))
                      .finally(() => setCarregandoTemplates(false));
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Escolha um modelo pre-configurado baseado na metodologia da pesquisa sobre distribuicao
              de tempo entre as funcoes administrativas de Fayol. Templates carregados do banco de dados.
            </p>

            {/* Estado de carregamento */}
            {carregandoTemplates && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Carregando templates...</span>
              </div>
            )}

            {/* Erro */}
            {erroTemplates && !carregandoTemplates && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <p className="text-red-400 text-sm">{erroTemplates}</p>
              </div>
            )}

            {/* Lista de templates */}
            {!carregandoTemplates && templatesAPI.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templatesAPI.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => selecionarTemplate(template.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 cursor-pointer transition-all',
                      templateSelecionado === template.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-secondary/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        templateSelecionado === template.id
                          ? 'bg-primary'
                          : CORES_CATEGORIA[template.categoria] || 'bg-secondary'
                      )}>
                        <FileText className={cn(
                          'w-5 h-5',
                          templateSelecionado === template.id || CORES_CATEGORIA[template.categoria]
                            ? 'text-white'
                            : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{template.nome}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.descricao}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-primary font-medium">
                            {template.total_perguntas} perguntas
                          </span>
                          {template.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-secondary text-[10px] text-muted-foreground rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nenhum template */}
            {!carregandoTemplates && templatesAPI.length === 0 && !erroTemplates && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum template de gestores encontrado.
              </div>
            )}
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">Ou crie suas proprias perguntas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voce pode personalizar as perguntas na proxima etapa ou comecar do zero.
            </p>
            <button
              onClick={() => {
                setTemplateSelecionado(null);
                setPerguntas([{ texto: '', tipo: 'aberta', obrigatoria: true }]);
                setEtapa('perguntas');
              }}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Criar perguntas personalizadas
            </button>
          </div>

          {/* Ação */}
          <div className="flex justify-end">
            <button
              onClick={() => setEtapa('perguntas')}
              disabled={!validarEtapaTemplate()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proximo: Configurar Perguntas
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Perguntas */}
      {etapa === 'perguntas' && (
        <div className="space-y-6">
          {/* Título */}
          <div className="glass-card rounded-xl p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Titulo da Pesquisa <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Pesquisa PODC - Gestores Publicos Estrategicos"
              className={cn(
                'w-full px-4 py-3 bg-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors',
                !titulo.trim() ? 'border-red-500/50' : 'border-border'
              )}
              required
            />
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

                        {pergunta.tipo === 'escala' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              min={0}
                              max={100}
                              value={pergunta.escala_min || 0}
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
                              min={0}
                              max={100}
                              value={pergunta.escala_max || 100}
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

          {/* Ações */}
          <div className="flex justify-between">
            <button
              onClick={() => setEtapa('template')}
              className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <button
              onClick={() => setEtapa('selecao')}
              disabled={!validarEtapaPerguntas()}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proximo: Selecionar Gestores
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 3: Seleção */}
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
                <span className="font-semibold text-foreground">Filtros de Selecao</span>
                {(filtroSetores.length > 0 || filtroNiveis.length > 0) && (
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
                {/* Filtro por Setor */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Setor</h3>
                  <div className="flex flex-wrap gap-2">
                    {SETORES.map((setor) => {
                      const Icone = setor.icone;
                      return (
                        <button
                          key={setor.valor}
                          onClick={() => {
                            setFiltroSetores((prev) =>
                              prev.includes(setor.valor as SetorGestor)
                                ? prev.filter((s) => s !== setor.valor)
                                : [...prev, setor.valor as SetorGestor]
                            );
                          }}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            filtroSetores.includes(setor.valor as SetorGestor)
                              ? `${setor.cor} text-white`
                              : 'bg-secondary hover:bg-secondary/80 text-foreground'
                          )}
                        >
                          <Icone className="w-4 h-4" />
                          {setor.rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filtro por Nível Hierárquico */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Nivel Hierarquico</h3>
                  <div className="flex flex-wrap gap-2">
                    {NIVEIS.map((nivel) => (
                      <button
                        key={nivel.valor}
                        onClick={() => {
                          setFiltroNiveis((prev) =>
                            prev.includes(nivel.valor as NivelHierarquico)
                              ? prev.filter((n) => n !== nivel.valor)
                              : [...prev, nivel.valor as NivelHierarquico]
                          );
                        }}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          filtroNiveis.includes(nivel.valor as NivelHierarquico)
                            ? `${nivel.cor} text-white`
                            : 'bg-secondary hover:bg-secondary/80 text-foreground'
                        )}
                      >
                        {nivel.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setFiltroSetores([]);
                      setFiltroNiveis([]);
                    }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Limpar todos os filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Gestores */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Selecionar Gestores
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={selecionarTodos}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Selecionar todos ({gestoresFiltradosLocal.length})
                </button>
                {gestoresSelecionados.length > 0 && (
                  <button
                    onClick={limparSelecao}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar selecao
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="text-2xl font-bold text-primary mr-2">
                  {gestoresSelecionados.length}
                </span>
                gestores selecionados de {gestoresFiltradosLocal.length} disponiveis
              </p>
              {/* Tags de filtros ativos */}
              {(filtroSetores.length > 0 || filtroNiveis.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filtroSetores.map((s) => {
                    const setor = SETORES.find((se) => se.valor === s);
                    return setor ? (
                      <span key={s} className={cn('px-2 py-1 text-white text-xs rounded-full', setor.cor)}>
                        {setor.rotulo}
                      </span>
                    ) : null;
                  })}
                  {filtroNiveis.map((n) => {
                    const nivel = NIVEIS.find((ni) => ni.valor === n);
                    return nivel ? (
                      <span key={n} className={cn('px-2 py-1 text-white text-xs rounded-full', nivel.cor)}>
                        {nivel.rotulo}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Lista de gestores */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {gestoresFiltradosLocal.slice(0, 50).map((gestor) => (
                <div
                  key={gestor.id}
                  onClick={() => toggleSelecionarParaPesquisa(gestor.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    gestoresSelecionados.includes(gestor.id)
                      ? 'bg-primary/20 border border-primary/50'
                      : 'bg-secondary/50 hover:bg-secondary'
                  )}
                >
                  {gestoresSelecionados.includes(gestor.id) ? (
                    <CheckSquare className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{gestor.nome}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {gestor.cargo} • {gestor.instituicao} •{' '}
                      <span className={cn(
                        gestor.setor === 'publico' ? 'text-blue-400' : 'text-green-400'
                      )}>
                        {gestor.setor === 'publico' ? 'Publico' : 'Privado'}
                      </span> •{' '}
                      <span className={cn(
                        gestor.nivel_hierarquico === 'estrategico' ? 'text-purple-400' :
                        gestor.nivel_hierarquico === 'tatico' ? 'text-orange-400' : 'text-cyan-400'
                      )}>
                        {gestor.nivel_hierarquico.charAt(0).toUpperCase() + gestor.nivel_hierarquico.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>P:{gestor.distribuicao_podc.planejar}%</div>
                    <div>O:{gestor.distribuicao_podc.organizar}%</div>
                  </div>
                </div>
              ))}
              {gestoresFiltradosLocal.length > 50 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  ... e mais {gestoresFiltradosLocal.length - 50} gestores
                </p>
              )}
              {gestoresFiltradosLocal.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhum gestor encontrado com os filtros selecionados.
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
              Proximo: Revisar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Etapa 4: Revisão */}
      {etapa === 'revisao' && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Resumo da Pesquisa</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Titulo</span>
                </div>
                <span className="font-medium text-foreground">{titulo}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Perguntas</span>
                </div>
                <span className="font-medium text-foreground">{perguntas.length}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Gestores</span>
                </div>
                <span className="font-medium text-foreground">
                  {gestoresSelecionados.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-foreground">Custo Estimado</span>
                </div>
                <span className="font-medium text-yellow-400">
                  {formatarMoeda(custoEstimado)}
                </span>
              </div>
            </div>
          </div>

          {/* Preview das perguntas */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Perguntas da Pesquisa</h3>
            <div className="space-y-2">
              {perguntas.map((p, i) => (
                <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                  <span className="text-primary font-medium mr-2">{i + 1}.</span>
                  <span className="text-foreground">{p.texto}</span>
                  <span className="text-xs text-muted-foreground ml-2">({p.tipo})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso de custo */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Atencao ao custo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta pesquisa consumira aproximadamente{' '}
                {formatarMoeda(custoEstimado)} em tokens da API Claude.
                Cada gestor respondera {perguntas.length} perguntas.
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
              Iniciar Pesquisa PODC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
