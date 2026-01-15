'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useEleitores } from '@/hooks/useEleitores';
import { useEntrevistasStore } from '@/stores/entrevistas-store';
import { cn, formatarMoeda, formatarNumero } from '@/lib/utils';
import type { Pergunta, TipoPergunta } from '@/types';

type Etapa = 'perguntas' | 'selecao' | 'revisao';

const TIPOS_PERGUNTA: { tipo: TipoPergunta; rotulo: string; descricao: string }[] = [
  { tipo: 'aberta', rotulo: 'Aberta', descricao: 'Resposta livre em texto' },
  { tipo: 'escala', rotulo: 'Escala', descricao: 'Nota de 1 a 10' },
  { tipo: 'multipla_escolha', rotulo: 'Múltipla Escolha', descricao: 'Escolher entre opções' },
  { tipo: 'sim_nao', rotulo: 'Sim/Não', descricao: 'Resposta binária' },
];

export default function PaginaNovaEntrevista() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>('perguntas');
  const [titulo, setTitulo] = useState('');
  const [perguntas, setPerguntas] = useState<Partial<Pergunta>[]>([
    { texto: '', tipo: 'aberta', obrigatoria: true },
  ]);

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

  // Adicionar pergunta
  const adicionarPergunta = () => {
    setPerguntas([...perguntas, { texto: '', tipo: 'aberta', obrigatoria: true }]);
  };

  // Remover pergunta
  const removerPergunta = (index: number) => {
    if (perguntas.length > 1) {
      setPerguntas(perguntas.filter((_, i) => i !== index));
    }
  };

  // Atualizar pergunta
  const atualizarPergunta = (index: number, dados: Partial<Pergunta>) => {
    setPerguntas(perguntas.map((p, i) => (i === index ? { ...p, ...dados } : p)));
  };

  // Calcular custo estimado
  const custoEstimado = eleitoresSelecionados.length * perguntas.length * 0.15; // R$ 0.15 por resposta (média)

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
              Título da Entrevista
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Pesquisa de intenção de voto - Janeiro 2026"
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Perguntas */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Perguntas</h2>
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
                      {eleitor.idade} anos • {eleitor.regiao_administrativa} •{' '}
                      {eleitor.orientacao_politica}
                    </p>
                  </div>
                </div>
              ))}
              {eleitoresFiltrados.length > 50 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  ... e mais {eleitoresFiltrados.length - 50} eleitores
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
          {/* Resumo */}
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
                  <span className="text-foreground">Respondentes</span>
                </div>
                <span className="font-medium text-foreground">
                  {eleitoresSelecionados.length}
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

          {/* Aviso de custo */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Atenção ao custo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta entrevista consumirá aproximadamente{' '}
                {formatarMoeda(custoEstimado)} em tokens da API Claude.
                O limite por sessão é de R$ 100,00.
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
