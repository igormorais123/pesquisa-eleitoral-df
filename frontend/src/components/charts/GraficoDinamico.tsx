'use client';

import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar,
  LineChart, Line, AreaChart, Area, Treemap
} from 'recharts';
import {
  type DadosAgregados,
  type TipoGrafico,
  type TipoRespostaEsperada,
  calcularEstatisticasEscala
} from '@/lib/classificador-perguntas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS
// ============================================

interface GraficoDinamicoProps {
  dados: DadosAgregados;
  titulo?: string;
  descricao?: string;
  altura?: number;
  mostrarLegenda?: boolean;
  mostrarValores?: boolean;
  className?: string;
  corPrimaria?: string;
}

// ============================================
// CORES PADRÃO
// ============================================

const CORES_PADRAO = [
  '#3b82f6', // azul
  '#ef4444', // vermelho
  '#22c55e', // verde
  '#f59e0b', // amarelo
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#06b6d4', // ciano
  '#f97316', // laranja
  '#84cc16', // lime
  '#6366f1', // indigo
];

const CORES_SIM_NAO = {
  'sim': '#22c55e',
  'nao': '#ef4444',
  'não': '#ef4444',
  'indeciso': '#94a3b8',
};

const CORES_SENTIMENTO = {
  'positivo': '#22c55e',
  'negativo': '#ef4444',
  'neutro': '#94a3b8',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GraficoDinamico({
  dados,
  titulo,
  descricao,
  altura = 350,
  mostrarLegenda = true,
  mostrarValores = true,
  className,
  corPrimaria,
}: GraficoDinamicoProps) {
  // Seleciona o melhor gráfico baseado no tipo de resposta
  const grafico = useMemo(() => {
    return renderizarGrafico(dados, altura, mostrarLegenda, mostrarValores, corPrimaria);
  }, [dados, altura, mostrarLegenda, mostrarValores, corPrimaria]);

  return (
    <Card className={cn('w-full', className)}>
      {(titulo || descricao) && (
        <CardHeader className="pb-2">
          {titulo && <CardTitle className="text-lg">{titulo}</CardTitle>}
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-4">
        {/* Estatísticas resumidas */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <span className="font-medium">Total: {dados.total} respostas</span>
          {dados.dados[0] && (
            <span className="text-muted-foreground">
              Principal: {dados.dados[0].label} ({dados.dados[0].percentual.toFixed(1)}%)
            </span>
          )}
        </div>

        {/* Gráfico */}
        <div style={{ height: altura }}>
          {grafico}
        </div>

        {/* Legenda detalhada para alguns tipos */}
        {dados.tipo === 'nome_candidato' && dados.dados.length > 0 && (
          <LegendaCandidatos dados={dados.dados} />
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// FUNÇÃO DE RENDERIZAÇÃO
// ============================================

function renderizarGrafico(
  dados: DadosAgregados,
  altura: number,
  mostrarLegenda: boolean,
  mostrarValores: boolean,
  corPrimaria?: string
): JSX.Element {
  const { tipo, graficoRecomendado, dados: dadosGrafico } = dados;

  // Dados vazios
  if (!dadosGrafico || dadosGrafico.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Sem dados para exibir
      </div>
    );
  }

  // Prepara dados com cores
  const dadosComCores = dadosGrafico.map((d, i) => ({
    ...d,
    cor: d.cor || obterCor(d.label, tipo, i),
    name: d.label,
    value: d.valor,
  }));

  switch (graficoRecomendado) {
    case 'pizza':
      return <GraficoPizza dados={dadosComCores} mostrarLegenda={mostrarLegenda} />;

    case 'donut':
      return <GraficoDonut dados={dadosComCores} mostrarLegenda={mostrarLegenda} />;

    case 'barras_horizontal':
      return <GraficoBarrasHorizontal dados={dadosComCores} mostrarValores={mostrarValores} />;

    case 'barras_vertical':
      return <GraficoBarrasVertical dados={dadosComCores} mostrarValores={mostrarValores} />;

    case 'escala_likert':
      return <GraficoEscalaLikert dados={dados} />;

    case 'gauge':
      return <GraficoGauge dados={dadosComCores} />;

    case 'ranking_barras':
      return <GraficoRanking dados={dadosComCores} />;

    case 'treemap':
      return <GraficoTreemap dados={dadosComCores} />;

    case 'funil':
      return <GraficoFunil dados={dadosComCores} />;

    case 'wordcloud':
    default:
      // Para texto longo, usa barras horizontais como fallback
      return <GraficoBarrasHorizontal dados={dadosComCores.slice(0, 10)} mostrarValores={mostrarValores} />;
  }
}

// ============================================
// COMPONENTES DE GRÁFICOS ESPECÍFICOS
// ============================================

interface DadoGrafico {
  label: string;
  valor: number;
  percentual: number;
  cor: string;
  name: string;
  value: number;
}

// Gráfico de Pizza
function GraficoPizza({ dados, mostrarLegenda }: { dados: DadoGrafico[]; mostrarLegenda: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dados}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
        >
          {dados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} votos`, name]}
        />
        {mostrarLegenda && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// Gráfico Donut
function GraficoDonut({ dados, mostrarLegenda }: { dados: DadoGrafico[]; mostrarLegenda: boolean }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={dados}
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="80%"
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
        >
          {dados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value} votos (${((value / total) * 100).toFixed(1)}%)`,
            name
          ]}
        />
        {mostrarLegenda && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// Gráfico de Barras Horizontal
function GraficoBarrasHorizontal({ dados, mostrarValores }: { dados: DadoGrafico[]; mostrarValores: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={dados}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => [`${value} votos`, 'Total']}
        />
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
          label={mostrarValores ? {
            position: 'right',
            formatter: (value: number) => `${value}`,
            fontSize: 11,
          } : undefined}
        >
          {dados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico de Barras Vertical
function GraficoBarrasVertical({ dados, mostrarValores }: { dados: DadoGrafico[]; mostrarValores: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dados}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 11 }}
        />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value} votos`, 'Total']}
        />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          label={mostrarValores ? {
            position: 'top',
            formatter: (value: number) => `${value}`,
            fontSize: 11,
          } : undefined}
        >
          {dados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Gráfico para Escala Likert
function GraficoEscalaLikert({ dados }: { dados: DadosAgregados }) {
  const escalaMin = dados.metadados.escalaMin || 0;
  const escalaMax = dados.metadados.escalaMax || 10;

  // Cria array com todas as notas possíveis
  const todasNotas = Array.from(
    { length: escalaMax - escalaMin + 1 },
    (_, i) => escalaMin + i
  );

  // Mapeia dados existentes
  const mapaValores = new Map(
    dados.dados.map(d => [Number(d.label), d.valor])
  );

  // Dados completos com zeros
  const dadosCompletos = todasNotas.map(nota => ({
    nota: nota.toString(),
    valor: mapaValores.get(nota) || 0,
    percentual: ((mapaValores.get(nota) || 0) / dados.total) * 100,
    cor: obterCorEscala(nota, escalaMin, escalaMax),
  }));

  // Calcula estatísticas
  const valores = dados.dados.flatMap(d =>
    Array(d.valor).fill(Number(d.label))
  );
  const media = valores.length > 0
    ? valores.reduce((a, b) => a + b, 0) / valores.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Indicador de média */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Média: {media.toFixed(1)}</span>
        <span className="text-muted-foreground">
          Escala de {escalaMin} a {escalaMax}
        </span>
      </div>

      {/* Barra de distribuição */}
      <div className="flex h-20 gap-1">
        {dadosCompletos.map((d, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center justify-end"
          >
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${Math.max(d.percentual * 2, 4)}%`,
                backgroundColor: d.cor,
                minHeight: d.valor > 0 ? 8 : 0,
              }}
            />
            <span className="mt-1 text-xs">{d.nota}</span>
          </div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dadosCompletos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nota" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`${value} respostas`, 'Quantidade']}
          />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {dadosCompletos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Gráfico Gauge (para médias/percentuais únicos)
function GraficoGauge({ dados }: { dados: DadoGrafico[] }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);
  const principal = dados[0];

  if (!principal) {
    return <div>Sem dados</div>;
  }

  const percentual = (principal.valor / total) * 100;

  const data = [
    { name: principal.label, value: percentual, fill: principal.cor },
    { name: 'Resto', value: 100 - percentual, fill: '#e2e8f0' },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="mt-[-80px] text-center">
        <div className="text-3xl font-bold" style={{ color: principal.cor }}>
          {percentual.toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">{principal.label}</div>
      </div>
    </div>
  );
}

// Gráfico de Ranking
function GraficoRanking({ dados }: { dados: DadoGrafico[] }) {
  // Adiciona posição
  const dadosComPosicao = dados.map((d, i) => ({
    ...d,
    posicao: i + 1,
  }));

  return (
    <div className="space-y-2">
      {dadosComPosicao.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold"
            style={{ backgroundColor: d.cor }}
          >
            {d.posicao}
          </div>
          <div className="flex-1">
            <div className="font-medium">{d.label}</div>
            <div className="text-sm text-muted-foreground">
              {d.valor} menções ({d.percentual.toFixed(1)}%)
            </div>
          </div>
          <div className="w-24">
            <div
              className="h-2 rounded-full"
              style={{
                backgroundColor: d.cor,
                width: `${d.percentual}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Gráfico Treemap
function GraficoTreemap({ dados }: { dados: DadoGrafico[] }) {
  const dadosTreemap = dados.map(d => ({
    name: d.label,
    size: d.valor,
    fill: d.cor,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={dadosTreemap}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        content={<CustomTreemapContent />}
      />
    </ResponsiveContainer>
  );
}

// Conteúdo customizado do Treemap
function CustomTreemapContent({ x, y, width, height, name, fill }: any) {
  if (width < 30 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
      >
        {width > 60 ? name : ''}
      </text>
    </g>
  );
}

// Gráfico de Funil
function GraficoFunil({ dados }: { dados: DadoGrafico[] }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="flex flex-col items-center space-y-1">
      {dados.map((d, i) => {
        const largura = 100 - (i * (80 / dados.length));
        return (
          <div
            key={i}
            className="flex items-center justify-center rounded-sm py-2 text-white"
            style={{
              width: `${largura}%`,
              backgroundColor: d.cor,
            }}
          >
            <span className="text-sm font-medium">
              {d.label}: {d.valor} ({((d.valor / total) * 100).toFixed(1)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Legenda detalhada para candidatos
function LegendaCandidatos({ dados }: { dados: Array<{ label: string; valor: number; percentual: number; cor?: string }> }) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
      {dados.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg border p-2"
        >
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: d.cor }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">{d.label}</div>
            <div className="text-xs text-muted-foreground">
              {d.valor} votos ({((d.valor / total) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function obterCor(label: string, tipo: TipoRespostaEsperada, index: number): string {
  const labelLower = label.toLowerCase();

  // Cores especiais para sim/não
  if (tipo === 'sim_nao') {
    return CORES_SIM_NAO[labelLower as keyof typeof CORES_SIM_NAO] || CORES_PADRAO[index % CORES_PADRAO.length];
  }

  // Cores especiais
  if (labelLower.includes('indeciso')) return '#94a3b8';
  if (labelLower.includes('branco') || labelLower.includes('nulo')) return '#e2e8f0';

  return CORES_PADRAO[index % CORES_PADRAO.length];
}

function obterCorEscala(valor: number, min: number, max: number): string {
  const normalizado = (valor - min) / (max - min);

  // Gradiente de vermelho para verde
  if (normalizado <= 0.33) {
    return '#ef4444'; // vermelho
  } else if (normalizado <= 0.66) {
    return '#f59e0b'; // amarelo
  } else {
    return '#22c55e'; // verde
  }
}

// ============================================
// EXPORTAÇÕES
// ============================================

export default GraficoDinamico;

export {
  GraficoPizza,
  GraficoDonut,
  GraficoBarrasHorizontal,
  GraficoBarrasVertical,
  GraficoEscalaLikert,
  GraficoGauge,
  GraficoRanking,
  GraficoTreemap,
  GraficoFunil,
};
