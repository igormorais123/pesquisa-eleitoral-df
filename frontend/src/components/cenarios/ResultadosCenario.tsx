'use client';

/**
 * Resultados do Cenário Eleitoral
 *
 * Exibe os resultados da simulação com gráficos e estatísticas.
 */

import { useMemo } from 'react';
import { ResultadoCenario, Candidato, ResultadoCandidatoCenario } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  HelpCircle,
  Ban,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface ResultadosCenarioProps {
  resultado: ResultadoCenario;
  candidatos?: Candidato[];
}

const CARGO_LABELS: Record<string, string> = {
  governador: 'Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_distrital: 'Deputado Distrital',
};

export function ResultadosCenario({ resultado, candidatos }: ResultadosCenarioProps) {
  // Preparar dados para gráficos
  const dadosBarras = useMemo(() => {
    return resultado.resultados.map((r) => ({
      nome: r.candidato_nome_urna || r.candidato_nome,
      votos: r.votos,
      percentual: r.percentual,
      percentualValidos: r.percentual_validos,
      cor: r.cor_campanha || '#6B7280',
      partido: r.partido,
    }));
  }, [resultado.resultados]);

  const dadosPizza = useMemo(() => {
    const dados = resultado.resultados.map((r) => ({
      name: `${r.candidato_nome_urna || r.candidato_nome} (${r.partido})`,
      value: r.votos,
      cor: r.cor_campanha || '#6B7280',
    }));

    if (resultado.indecisos > 0) {
      dados.push({
        name: 'Indecisos',
        value: resultado.indecisos,
        cor: '#9CA3AF',
      });
    }

    if (resultado.brancos_nulos > 0) {
      dados.push({
        name: 'Brancos/Nulos',
        value: resultado.brancos_nulos,
        cor: '#D1D5DB',
      });
    }

    return dados;
  }, [resultado]);

  // Identificar vencedor
  const vencedor = resultado.resultados[0];
  const segundo = resultado.resultados[1];

  return (
    <div className="space-y-6">
      {/* Header com Resultado Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Resultado da Simulação - {resultado.turno}º Turno
              </CardTitle>
              <CardDescription>
                {CARGO_LABELS[resultado.cargo] || resultado.cargo} • {resultado.total_eleitores} eleitores
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Margem de erro: ±{resultado.margem_erro}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Vencedor */}
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: vencedor.cor_campanha || '#6B7280' }}
            >
              {vencedor.candidato_nome_urna?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold">
                {vencedor.candidato_nome_urna || vencedor.candidato_nome}
              </p>
              <p className="text-muted-foreground">{vencedor.partido}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {vencedor.percentual_validos.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {vencedor.votos.toLocaleString('pt-BR')} votos
              </p>
            </div>
          </div>

          {/* Indicação de 2º turno */}
          {resultado.turno === 1 && resultado.haveria_segundo_turno && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Haveria 2º turno!</p>
                <p className="text-sm">
                  {vencedor.candidato_nome_urna} x {segundo?.candidato_nome_urna}
                </p>
              </div>
            </div>
          )}

          {resultado.turno === 1 && !resultado.haveria_segundo_turno && vencedor.percentual_validos > 50 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg mb-4">
              <Trophy className="h-5 w-5" />
              <p className="font-medium">
                Eleito no 1º turno com {vencedor.percentual_validos.toFixed(1)}% dos votos válidos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Eleitores</span>
            </div>
            <p className="text-2xl font-bold">{resultado.total_eleitores.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Votos Válidos</span>
            </div>
            <p className="text-2xl font-bold">{resultado.total_votos_validos.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">Indecisos</span>
            </div>
            <p className="text-2xl font-bold">{resultado.indecisos_percentual.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Ban className="h-4 w-4" />
              <span className="text-sm">Brancos/Nulos</span>
            </div>
            <p className="text-2xl font-bold">{resultado.brancos_nulos_percentual.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Candidatos */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Votos</CardTitle>
          <CardDescription>Percentual de votos válidos por candidato</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resultado.resultados.map((r, index) => (
              <div key={r.candidato_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}º
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: r.cor_campanha || '#6B7280' }}
                    />
                    <span className="font-medium">
                      {r.candidato_nome_urna || r.candidato_nome}
                    </span>
                    <span className="text-muted-foreground text-sm">({r.partido})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{r.percentual_validos.toFixed(1)}%</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      ({r.votos.toLocaleString('pt-BR')} votos)
                    </span>
                  </div>
                </div>
                <Progress
                  value={r.percentual_validos}
                  className="h-3"
                  style={
                    {
                      '--progress-background': r.cor_campanha || '#6B7280',
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Votos por Candidato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarras} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="nome" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Votos válidos']}
                  />
                  <Bar dataKey="percentualValidos" radius={[0, 4, 4, 0]}>
                    {dadosBarras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Votos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      value.toLocaleString('pt-BR'),
                      'Votos',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadados */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Tempo: {resultado.tempo_execucao_segundos.toFixed(2)}s
              </span>
              <span>Modelo: {resultado.modelo_usado}</span>
            </div>
            <span>
              Executado em: {new Date(resultado.executado_em).toLocaleString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
