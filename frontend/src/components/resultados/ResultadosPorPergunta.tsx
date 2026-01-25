'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, List, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  classificarPergunta,
  parsearResposta,
  agregarRespostas,
  calcularEstatisticasEscala,
  type ClassificacaoPergunta,
} from '@/lib/classificador-perguntas';
import { GraficoDinamico } from '@/components/charts/GraficoDinamico';
import type { Pergunta, Candidato, Eleitor } from '@/types';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

interface RespostaRaw {
  pergunta_id: string;
  resposta: string | number | string[];
}

interface RespostaEleitor {
  eleitor_id: string;
  eleitor_nome: string;
  respostas: RespostaRaw[];
  tokens_usados: number;
  custo: number;
  tempo_resposta_ms: number;
}

interface ResultadosPorPerguntaProps {
  perguntas: Pergunta[];
  respostas: RespostaEleitor[];
  candidatos?: Candidato[];
  eleitores?: Map<string, Eleitor>;
  className?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ResultadosPorPergunta({
  perguntas,
  respostas,
  candidatos,
  eleitores,
  className,
}: ResultadosPorPerguntaProps) {
  const [perguntaExpandida, setPerguntaExpandida] = useState<string | null>(
    perguntas[0]?.id || null
  );

  // Agrupa respostas por pergunta
  const respostasPorPergunta = useMemo(() => {
    const mapa = new Map<string, Array<{
      eleitor_id: string;
      eleitor_nome: string;
      resposta_texto: string;
      eleitor?: Eleitor;
    }>>();

    for (const eleitorResp of respostas) {
      for (const resp of eleitorResp.respostas) {
        const lista = mapa.get(resp.pergunta_id) || [];
        lista.push({
          eleitor_id: eleitorResp.eleitor_id,
          eleitor_nome: eleitorResp.eleitor_nome,
          resposta_texto: String(resp.resposta),
          eleitor: eleitores?.get(eleitorResp.eleitor_id),
        });
        mapa.set(resp.pergunta_id, lista);
      }
    }

    return mapa;
  }, [respostas, eleitores]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Resultados por Pergunta
        </h3>
        <Badge variant="outline">{perguntas.length} perguntas</Badge>
      </div>

      {perguntas.map((pergunta, index) => (
        <CardPerguntaResultado
          key={pergunta.id}
          pergunta={pergunta}
          numero={index + 1}
          respostas={respostasPorPergunta.get(pergunta.id) || []}
          candidatos={candidatos}
          eleitores={eleitores}
          expandida={perguntaExpandida === pergunta.id}
          onToggle={() =>
            setPerguntaExpandida(
              perguntaExpandida === pergunta.id ? null : pergunta.id
            )
          }
        />
      ))}
    </div>
  );
}

// ============================================
// CARD DE PERGUNTA COM RESULTADO
// ============================================

interface CardPerguntaResultadoProps {
  pergunta: Pergunta;
  numero: number;
  respostas: Array<{
    eleitor_id: string;
    eleitor_nome: string;
    resposta_texto: string;
    eleitor?: Eleitor;
  }>;
  candidatos?: Candidato[];
  eleitores?: Map<string, Eleitor>;
  expandida: boolean;
  onToggle: () => void;
}

function CardPerguntaResultado({
  pergunta,
  numero,
  respostas,
  candidatos,
  eleitores,
  expandida,
  onToggle,
}: CardPerguntaResultadoProps) {
  // Classifica a pergunta
  const classificacao = useMemo(
    () => classificarPergunta(pergunta, candidatos),
    [pergunta, candidatos]
  );

  // Parseia as respostas
  const respostasParseadas = useMemo(() => {
    return respostas.map((r) => ({
      ...r,
      parseada: parsearResposta(r.resposta_texto, classificacao),
    }));
  }, [respostas, classificacao]);

  // Agrega para gráficos
  const dadosAgregados = useMemo(() => {
    const parseadas = respostasParseadas.map((r) => r.parseada);
    return agregarRespostas(parseadas, classificacao, pergunta.texto);
  }, [respostasParseadas, classificacao, pergunta.texto]);

  // Principal resultado
  const resultadoPrincipal = dadosAgregados.dados[0];

  return (
    <Card className="overflow-hidden">
      {/* Header clicável */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Número da pergunta */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{numero}</span>
          </div>

          {/* Texto e badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-foreground">{pergunta.texto}</p>
              {expandida ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {/* Resumo quando fechado */}
            {!expandida && resultadoPrincipal && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="capitalize">
                  {formatarTipoResposta(classificacao.tipoResposta)}
                </Badge>
                <span className="text-muted-foreground">
                  {respostas.length} respostas
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium" style={{ color: resultadoPrincipal.cor }}>
                  {resultadoPrincipal.label}: {resultadoPrincipal.percentual.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expandida && (
        <CardContent className="border-t">
          <Tabs defaultValue="grafico" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="grafico" className="flex items-center gap-1">
                <PieChart className="w-4 h-4" />
                Gráfico
              </TabsTrigger>
              <TabsTrigger value="dados" className="flex items-center gap-1">
                <List className="w-4 h-4" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="segmentos" className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Segmentos
              </TabsTrigger>
            </TabsList>

            {/* Aba Gráfico */}
            <TabsContent value="grafico">
              <GraficoDinamico
                dados={dadosAgregados}
                altura={300}
                mostrarLegenda={true}
                mostrarValores={true}
              />

              {/* Estatísticas para escala */}
              {classificacao.tipoResposta === 'escala_numerica' && (
                <EstatisticasEscalaResumo respostasParseadas={respostasParseadas} />
              )}
            </TabsContent>

            {/* Aba Dados */}
            <TabsContent value="dados">
              <TabelaDados dados={dadosAgregados.dados} total={dadosAgregados.total} />
            </TabsContent>

            {/* Aba Segmentos */}
            <TabsContent value="segmentos">
              <AnaliseSegmentos
                respostasParseadas={respostasParseadas}
                classificacao={classificacao}
                perguntaTexto={pergunta.texto}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function EstatisticasEscalaResumo({
  respostasParseadas,
}: {
  respostasParseadas: Array<{ parseada: { valorPrincipal: string | number | string[] } }>;
}) {
  const stats = useMemo(() => {
    const valores = respostasParseadas
      .map((r) =>
        typeof r.parseada.valorPrincipal === 'number' ? r.parseada.valorPrincipal : 0
      )
      .filter((v) => !isNaN(v));

    if (valores.length === 0) return null;

    const soma = valores.reduce((a, b) => a + b, 0);
    const media = soma / valores.length;

    const ordenados = [...valores].sort((a, b) => a - b);
    const meio = Math.floor(ordenados.length / 2);
    const mediana =
      ordenados.length % 2 === 0
        ? (ordenados[meio - 1] + ordenados[meio]) / 2
        : ordenados[meio];

    return { media, mediana };
  }, [respostasParseadas]);

  if (!stats) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-2xl font-bold text-primary">{stats.media.toFixed(1)}</div>
        <div className="text-sm text-muted-foreground">Média</div>
      </div>
      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-2xl font-bold text-primary">{stats.mediana}</div>
        <div className="text-sm text-muted-foreground">Mediana</div>
      </div>
    </div>
  );
}

function TabelaDados({
  dados,
  total,
}: {
  dados: Array<{ label: string; valor: number; percentual: number; cor?: string }>;
  total: number;
}) {
  return (
    <div className="space-y-2">
      {dados.map((d, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: d.cor || '#6b7280' }}
            />
            <span className="font-medium">{d.label}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{d.valor} votos</span>
            <span className="font-bold" style={{ color: d.cor || '#6b7280' }}>
              {d.percentual.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}

      <div className="pt-2 border-t text-sm text-muted-foreground text-right">
        Total: {total} respostas
      </div>
    </div>
  );
}

interface AnaliseSegmentosProps {
  respostasParseadas: Array<{
    eleitor?: Eleitor;
    parseada: { valorPrincipal: string | number | string[] };
  }>;
  classificacao: ClassificacaoPergunta;
  perguntaTexto: string;
}

function AnaliseSegmentos({
  respostasParseadas,
  classificacao,
  perguntaTexto,
}: AnaliseSegmentosProps) {
  const [segmentoAtivo, setSegmentoAtivo] = useState<'orientacao' | 'cluster'>('orientacao');

  // Agrupa por segmento
  const porOrientacao: Record<string, typeof respostasParseadas> = {};
  const porCluster: Record<string, typeof respostasParseadas> = {};

  for (const r of respostasParseadas) {
    if (r.eleitor) {
      const orient = r.eleitor.orientacao_politica;
      if (!porOrientacao[orient]) porOrientacao[orient] = [];
      porOrientacao[orient].push(r);

      const cluster = r.eleitor.cluster_socioeconomico;
      if (!porCluster[cluster]) porCluster[cluster] = [];
      porCluster[cluster].push(r);
    }
  }

  const segmentoData = segmentoAtivo === 'orientacao' ? porOrientacao : porCluster;

  if (Object.keys(segmentoData).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Dados de eleitores não disponíveis para análise de segmentos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor */}
      <div className="flex gap-2">
        <button
          onClick={() => setSegmentoAtivo('orientacao')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm transition-colors',
            segmentoAtivo === 'orientacao'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Por Orientação
        </button>
        <button
          onClick={() => setSegmentoAtivo('cluster')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm transition-colors',
            segmentoAtivo === 'cluster'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Por Cluster
        </button>
      </div>

      {/* Grid de segmentos */}
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(segmentoData).map(([segmento, resps]) => {
          const parseadas = resps.map((r) => r.parseada);
          const agregado = agregarRespostas(
            parseadas as any,
            classificacao,
            perguntaTexto
          );
          const principal = agregado.dados[0];

          return (
            <div key={segmento} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize text-sm">
                  {segmento.replace(/_/g, ' ')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {resps.length}
                </Badge>
              </div>

              {principal && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className="w-2 h-2 rounded"
                      style={{ backgroundColor: principal.cor }}
                    />
                    <span>{principal.label}</span>
                    <span className="font-bold ml-auto">
                      {principal.percentual.toFixed(0)}%
                    </span>
                  </div>

                  {/* Mini barra */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${principal.percentual}%`,
                        backgroundColor: principal.cor,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function formatarTipoResposta(tipo: string): string {
  const mapa: Record<string, string> = {
    sim_nao: 'Sim/Não',
    escolha_unica: 'Escolha',
    multipla_escolha: 'Múltipla',
    escala_numerica: 'Escala',
    ranking: 'Ranking',
    nome_candidato: 'Candidato',
    texto_curto: 'Curta',
    texto_longo: 'Aberta',
    lista: 'Lista',
  };
  return mapa[tipo] || tipo;
}

// ============================================
// EXPORTAÇÕES
// ============================================

export default ResultadosPorPergunta;
