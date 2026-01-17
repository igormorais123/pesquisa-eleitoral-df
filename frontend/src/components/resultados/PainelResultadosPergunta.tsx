'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  PieChart,
  List,
  FileText,
  Users,
  TrendingUp,
  Filter,
  Download,
} from 'lucide-react';
import {
  classificarPergunta,
  parsearResposta,
  agregarRespostas,
  calcularEstatisticasEscala,
  type DadosAgregados,
  type ClassificacaoPergunta,
  type RespostaParseada,
} from '@/lib/classificador-perguntas';
import { GraficoDinamico } from '@/components/charts/GraficoDinamico';
import type { Pergunta, RespostaEleitor, Candidato, Eleitor } from '@/types';

// ============================================
// TIPOS
// ============================================

interface RespostaCompleta {
  eleitor_id: string;
  eleitor_nome: string;
  eleitor?: Eleitor;
  pergunta_id: string;
  resposta_texto: string;
  resposta_estruturada?: {
    escala?: number;
    opcao?: string;
    ranking?: string[];
  };
}

interface PainelResultadosPerguntaProps {
  pergunta: Pergunta;
  respostas: RespostaCompleta[];
  candidatos?: Candidato[];
  eleitores?: Map<string, Eleitor>;
  mostrarDetalhes?: boolean;
  className?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PainelResultadosPergunta({
  pergunta,
  respostas,
  candidatos,
  eleitores,
  mostrarDetalhes = true,
  className,
}: PainelResultadosPerguntaProps) {
  const [abaAtiva, setAbaAtiva] = useState('grafico');
  const [filtroSegmento, setFiltroSegmento] = useState<string | null>(null);

  // Classifica a pergunta
  const classificacao = useMemo(
    () => classificarPergunta(pergunta, candidatos),
    [pergunta, candidatos]
  );

  // Parseia todas as respostas
  const respostasParseadas = useMemo(() => {
    return respostas.map(r => ({
      ...r,
      parseada: parsearResposta(
        r.resposta_texto,
        classificacao,
        r.resposta_estruturada
      ),
    }));
  }, [respostas, classificacao]);

  // Agrega para gráficos
  const dadosAgregados = useMemo(() => {
    const parseadas = respostasParseadas.map(r => r.parseada);
    return agregarRespostas(parseadas, classificacao, pergunta.texto);
  }, [respostasParseadas, classificacao, pergunta.texto]);

  // Estatísticas para escala
  const estatisticasEscala = useMemo(() => {
    if (classificacao.tipoResposta === 'escala_numerica') {
      return calcularEstatisticasEscala(respostasParseadas.map(r => r.parseada));
    }
    return null;
  }, [respostasParseadas, classificacao.tipoResposta]);

  // Análise por segmento
  const analiseSegmentos = useMemo(() => {
    if (!eleitores) return null;

    const porOrientacao: Record<string, RespostaParseada[]> = {};
    const porCluster: Record<string, RespostaParseada[]> = {};
    const porRegiao: Record<string, RespostaParseada[]> = {};

    for (const r of respostasParseadas) {
      const eleitor = eleitores.get(r.eleitor_id);
      if (eleitor) {
        // Por orientação política
        const orient = eleitor.orientacao_politica;
        if (!porOrientacao[orient]) porOrientacao[orient] = [];
        porOrientacao[orient].push(r.parseada);

        // Por cluster
        const cluster = eleitor.cluster_socioeconomico;
        if (!porCluster[cluster]) porCluster[cluster] = [];
        porCluster[cluster].push(r.parseada);

        // Por região
        const regiao = eleitor.regiao_administrativa;
        if (!porRegiao[regiao]) porRegiao[regiao] = [];
        porRegiao[regiao].push(r.parseada);
      }
    }

    return { porOrientacao, porCluster, porRegiao };
  }, [respostasParseadas, eleitores]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{pergunta.texto}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {formatarTipoPergunta(classificacao.tipoResposta)}
              </Badge>
              <span className="text-muted-foreground">
                {respostas.length} respostas
              </span>
            </CardDescription>
          </div>
          {classificacao.graficoRecomendado && (
            <Badge variant="secondary">
              {formatarTipoGrafico(classificacao.graficoRecomendado)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grafico" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Gráfico</span>
            </TabsTrigger>
            <TabsTrigger value="dados" className="flex items-center gap-1">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="respostas" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Respostas</span>
            </TabsTrigger>
            {analiseSegmentos && (
              <TabsTrigger value="segmentos" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Segmentos</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Aba Gráfico */}
          <TabsContent value="grafico" className="mt-4">
            <GraficoDinamico
              dados={dadosAgregados}
              altura={350}
              mostrarLegenda={true}
              mostrarValores={true}
            />

            {/* Estatísticas para escala */}
            {estatisticasEscala && (
              <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
                <EstatisticaItem
                  label="Média"
                  valor={estatisticasEscala.media.toFixed(1)}
                />
                <EstatisticaItem
                  label="Mediana"
                  valor={estatisticasEscala.mediana.toString()}
                />
                <EstatisticaItem
                  label="Moda"
                  valor={estatisticasEscala.moda.toString()}
                />
                <EstatisticaItem
                  label="Desvio Padrão"
                  valor={estatisticasEscala.desvioPadrao.toFixed(2)}
                />
              </div>
            )}
          </TabsContent>

          {/* Aba Dados Tabulares */}
          <TabsContent value="dados" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resposta</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosAgregados.dados.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: d.cor }}
                        />
                        {d.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{d.valor}</TableCell>
                    <TableCell className="text-right">
                      {d.percentual.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Aba Respostas Individuais */}
          <TabsContent value="respostas" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {respostasParseadas.map((r, i) => (
                  <RespostaIndividual
                    key={i}
                    resposta={r}
                    eleitor={eleitores?.get(r.eleitor_id)}
                    classificacao={classificacao}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Aba Segmentos */}
          {analiseSegmentos && (
            <TabsContent value="segmentos" className="mt-4">
              <AnaliseSegmentos
                analise={analiseSegmentos}
                classificacao={classificacao}
                perguntaTexto={pergunta.texto}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface RespostaIndividualProps {
  resposta: {
    eleitor_id: string;
    eleitor_nome: string;
    resposta_texto: string;
    parseada: RespostaParseada;
  };
  eleitor?: Eleitor;
  classificacao: ClassificacaoPergunta;
}

function RespostaIndividual({
  resposta,
  eleitor,
  classificacao,
}: RespostaIndividualProps) {
  const valorExibicao = formatarValorResposta(resposta.parseada, classificacao);

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{resposta.eleitor_nome}</span>
            {eleitor && (
              <Badge variant="outline" className="text-xs">
                {eleitor.orientacao_politica}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {resposta.resposta_texto}
          </p>
        </div>
        <Badge
          variant={resposta.parseada.confianca >= 80 ? 'default' : 'secondary'}
          className="shrink-0"
        >
          {valorExibicao}
        </Badge>
      </div>
      {eleitor && (
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {eleitor.regiao_administrativa}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {eleitor.cluster_socioeconomico}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface EstatisticaItemProps {
  label: string;
  valor: string;
}

function EstatisticaItem({ label, valor }: EstatisticaItemProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{valor}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

interface AnaliseSegmentosProps {
  analise: {
    porOrientacao: Record<string, RespostaParseada[]>;
    porCluster: Record<string, RespostaParseada[]>;
    porRegiao: Record<string, RespostaParseada[]>;
  };
  classificacao: ClassificacaoPergunta;
  perguntaTexto: string;
}

function AnaliseSegmentos({
  analise,
  classificacao,
  perguntaTexto,
}: AnaliseSegmentosProps) {
  const [segmentoAtivo, setSegmentoAtivo] = useState<'orientacao' | 'cluster' | 'regiao'>('orientacao');

  const segmentoData = segmentoAtivo === 'orientacao'
    ? analise.porOrientacao
    : segmentoAtivo === 'cluster'
    ? analise.porCluster
    : analise.porRegiao;

  return (
    <div className="space-y-4">
      {/* Seletor de segmento */}
      <div className="flex gap-2">
        <Button
          variant={segmentoAtivo === 'orientacao' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSegmentoAtivo('orientacao')}
        >
          Por Orientação
        </Button>
        <Button
          variant={segmentoAtivo === 'cluster' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSegmentoAtivo('cluster')}
        >
          Por Cluster
        </Button>
        <Button
          variant={segmentoAtivo === 'regiao' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSegmentoAtivo('regiao')}
        >
          Por Região
        </Button>
      </div>

      {/* Tabela de segmentos */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(segmentoData).map(([segmento, respostas]) => {
          const agregado = agregarRespostas(respostas, classificacao, perguntaTexto);
          const principal = agregado.dados[0];

          return (
            <Card key={segmento} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium capitalize">{segmento.replace(/_/g, ' ')}</span>
                <Badge variant="outline">{respostas.length} resp.</Badge>
              </div>

              {principal && (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: principal.cor }}
                  />
                  <span className="text-sm">
                    {principal.label}: {principal.percentual.toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Mini gráfico de barras */}
              <div className="mt-2 space-y-1">
                {agregado.dados.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: `${d.percentual}%`,
                          backgroundColor: d.cor,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {d.percentual.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarTipoPergunta(tipo: string): string {
  const mapa: Record<string, string> = {
    'sim_nao': 'Sim/Não',
    'escolha_unica': 'Escolha Única',
    'multipla_escolha': 'Múltipla Escolha',
    'escala_numerica': 'Escala',
    'ranking': 'Ranking',
    'nome_candidato': 'Escolha de Candidato',
    'texto_curto': 'Resposta Curta',
    'texto_longo': 'Resposta Aberta',
    'percentual': 'Percentual',
    'lista': 'Lista',
  };
  return mapa[tipo] || tipo;
}

function formatarTipoGrafico(tipo: string): string {
  const mapa: Record<string, string> = {
    'pizza': 'Pizza',
    'donut': 'Donut',
    'barras_horizontal': 'Barras',
    'barras_vertical': 'Colunas',
    'escala_likert': 'Escala',
    'gauge': 'Medidor',
    'ranking_barras': 'Ranking',
    'treemap': 'Mapa',
    'wordcloud': 'Nuvem',
    'funil': 'Funil',
    'stacked_bar': 'Empilhado',
    'radar': 'Radar',
  };
  return mapa[tipo] || tipo;
}

function formatarValorResposta(
  parseada: RespostaParseada,
  classificacao: ClassificacaoPergunta
): string {
  if (Array.isArray(parseada.valorPrincipal)) {
    return parseada.valorPrincipal.slice(0, 2).join(', ') +
      (parseada.valorPrincipal.length > 2 ? '...' : '');
  }

  if (typeof parseada.valorPrincipal === 'number') {
    return parseada.valorPrincipal.toString();
  }

  const valor = String(parseada.valorPrincipal);
  return valor.length > 20 ? valor.slice(0, 20) + '...' : valor;
}

// ============================================
// EXPORTAÇÕES
// ============================================

export default PainelResultadosPergunta;

export { formatarTipoPergunta, formatarTipoGrafico };
