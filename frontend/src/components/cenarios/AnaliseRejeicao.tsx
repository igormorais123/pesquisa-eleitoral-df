'use client';

/**
 * Análise de Rejeição
 *
 * Componente para analisar e visualizar a rejeição dos candidatos.
 */

import { useState, useEffect } from 'react';
import { AnaliseRejeicaoCandidato, ResultadoAnaliseRejeicao, Candidato } from '@/types';
import { useCenariosStore } from '@/stores/cenarios-store';
import { useCandidatosStore } from '@/stores/candidatos-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ThumbsDown,
  AlertTriangle,
  Users,
  Target,
  TrendingDown,
  Lightbulb,
  Loader2,
  Play,
  BarChart3,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { toast } from 'sonner';

interface AnaliseRejeicaoProps {
  candidatosIniciais?: string[];
}

export function AnaliseRejeicao({ candidatosIniciais }: AnaliseRejeicaoProps) {
  // Stores
  const { analisarRejeicao, analiseRejeicao, carregando, erro } = useCenariosStore();
  const { candidatos, carregarCandidatos } = useCandidatosStore();

  // Estado local
  const [candidatosSelecionados, setCandidatosSelecionados] = useState<string[]>(
    candidatosIniciais || []
  );
  const [amostraTamanho, setAmostraTamanho] = useState(200);
  const [candidatosDisponiveis, setCandidatosDisponiveis] = useState<Candidato[]>([]);

  // Carregar candidatos
  useEffect(() => {
    const carregar = async () => {
      await carregarCandidatos();
    };
    carregar();
  }, [carregarCandidatos]);

  useEffect(() => {
    setCandidatosDisponiveis(candidatos);
  }, [candidatos]);

  // Toggle candidato
  const toggleCandidato = (candidatoId: string) => {
    setCandidatosSelecionados((prev) =>
      prev.includes(candidatoId)
        ? prev.filter((id) => id !== candidatoId)
        : [...prev, candidatoId]
    );
  };

  // Executar análise
  const executarAnalise = async () => {
    if (candidatosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um candidato');
      return;
    }

    try {
      await analisarRejeicao(candidatosSelecionados, amostraTamanho);
      toast.success('Análise concluída!');
    } catch (error) {
      toast.error('Erro ao analisar rejeição');
    }
  };

  // Preparar dados para gráfico de barras
  const dadosBarras = analiseRejeicao?.candidatos.map((c) => ({
    nome: c.candidato_nome_urna,
    rejeicao: c.taxa_rejeicao,
    rejeicaoForte: c.taxa_rejeicao_forte,
    cor: c.cor_campanha || '#6B7280',
  })) || [];

  return (
    <div className="space-y-6">
      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsDown className="h-5 w-5" />
            Análise de Rejeição
          </CardTitle>
          <CardDescription>
            Identifique a taxa de rejeição dos candidatos entre os eleitores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de candidatos */}
          <div className="space-y-2">
            <Label>Candidatos para análise</Label>
            <ScrollArea className="h-48 border rounded-lg p-2">
              <div className="space-y-2">
                {candidatosDisponiveis.map((candidato) => {
                  const selecionado = candidatosSelecionados.includes(candidato.id);
                  return (
                    <div
                      key={candidato.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selecionado ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleCandidato(candidato.id)}
                    >
                      <Checkbox checked={selecionado} />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: candidato.cor_campanha || '#6B7280' }}
                      />
                      <span className="font-medium">{candidato.nome_urna}</span>
                      <span className="text-muted-foreground text-sm">({candidato.partido})</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Tamanho da amostra */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Amostra de eleitores</Label>
              <span className="text-sm font-medium">{amostraTamanho}</span>
            </div>
            <Slider
              value={[amostraTamanho]}
              onValueChange={(v) => setAmostraTamanho(v[0])}
              min={50}
              max={500}
              step={50}
            />
          </div>

          {/* Botão executar */}
          <Button
            className="w-full"
            onClick={executarAnalise}
            disabled={carregando || candidatosSelecionados.length === 0}
          >
            {carregando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analisar Rejeição
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {analiseRejeicao && (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Eleitores</span>
                </div>
                <p className="text-2xl font-bold">
                  {analiseRejeicao.total_eleitores_analisados.toLocaleString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Candidatos</span>
                </div>
                <p className="text-2xl font-bold">{analiseRejeicao.candidatos.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm">Menor Rejeição</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {analiseRejeicao.candidatos[0]?.taxa_rejeicao.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600">
                  {analiseRejeicao.candidatos[0]?.candidato_nome_urna}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Maior Rejeição</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {analiseRejeicao.candidatos[analiseRejeicao.candidatos.length - 1]?.taxa_rejeicao.toFixed(1)}%
                </p>
                <p className="text-xs text-red-600">
                  {analiseRejeicao.candidatos[analiseRejeicao.candidatos.length - 1]?.candidato_nome_urna}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de barras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparativo de Rejeição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosBarras} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="nome" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)}%`,
                        name === 'rejeicao' ? 'Rejeição Total' : 'Rejeição Forte',
                      ]}
                    />
                    <Bar dataKey="rejeicao" name="Rejeição Total" fill="#F87171" radius={[0, 4, 4, 0]}>
                      {dadosBarras.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} opacity={0.7} />
                      ))}
                    </Bar>
                    <Bar dataKey="rejeicaoForte" name="Rejeição Forte" fill="#DC2626" radius={[0, 4, 4, 0]}>
                      {dadosBarras.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#DC2626" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ranking detalhado */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking por Rejeição (menor para maior)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analiseRejeicao.candidatos.map((candidato, index) => (
                  <div key={candidato.candidato_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-bold ${
                            index === 0
                              ? 'text-green-600'
                              : index === analiseRejeicao.candidatos.length - 1
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {index + 1}º
                        </span>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: candidato.cor_campanha || '#6B7280' }}
                        />
                        <div>
                          <p className="font-medium">{candidato.candidato_nome_urna}</p>
                          <p className="text-sm text-muted-foreground">{candidato.partido}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {candidato.taxa_rejeicao.toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {candidato.total_rejeitadores.toLocaleString('pt-BR')} rejeitadores
                        </p>
                      </div>
                    </div>

                    {/* Barra de rejeição */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Rejeição total</span>
                        <span>{candidato.taxa_rejeicao.toFixed(1)}%</span>
                      </div>
                      <Progress value={candidato.taxa_rejeicao} className="h-2 bg-red-100" />
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Rejeição forte (nunca votaria)</span>
                        <span>{candidato.taxa_rejeicao_forte.toFixed(1)}%</span>
                      </div>
                      <Progress value={candidato.taxa_rejeicao_forte} className="h-2 bg-red-200" />
                    </div>

                    {/* Principais motivos */}
                    {candidato.principais_motivos.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Principais motivos:</p>
                        <div className="flex flex-wrap gap-2">
                          {candidato.principais_motivos.map((motivo, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {motivo}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {analiseRejeicao.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analiseRejeicao.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
