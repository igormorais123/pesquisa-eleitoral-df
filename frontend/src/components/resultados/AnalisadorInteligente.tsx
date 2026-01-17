'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, BarChart3, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardConsolidado } from './DashboardConsolidado';
import { useAnaliseInteligente } from '@/hooks/useAnaliseInteligente';

interface RespostaEntrevista {
  texto: string;
  pergunta: string;
  eleitorId?: string;
  eleitorNome?: string;
  regiao?: string;
  orientacao?: string;
  cluster?: string;
}

interface AnalisadorInteligenteProps {
  respostas?: RespostaEntrevista[];
  relatorioTexto?: string;
  titulo?: string;
  onAnaliseCompleta?: (dados: { extracao: unknown; sintese: unknown }) => void;
}

export function AnalisadorInteligente({
  respostas = [],
  relatorioTexto = '',
  titulo = 'Pesquisa Eleitoral',
  onAnaliseCompleta,
}: AnalisadorInteligenteProps) {
  const [textoManual, setTextoManual] = useState(relatorioTexto);
  const [modoAnalise, setModoAnalise] = useState<'respostas' | 'relatorio'>('respostas');

  const {
    extracao,
    sintese,
    carregando,
    erro,
    extrairDados,
    sintetizarRelatorio,
    analisarCompleto,
    limpar,
  } = useAnaliseInteligente();

  // Executar análise das respostas
  const handleAnalisarRespostas = async () => {
    if (respostas.length === 0) return;

    const respostasFormatadas = respostas.map(r => ({
      texto: r.texto,
      pergunta: r.pergunta,
      eleitor: {
        regiao: r.regiao,
        orientacao: r.orientacao,
        cluster: r.cluster,
      },
    }));

    await extrairDados(respostasFormatadas, {
      tipoPesquisa: 'Eleitoral',
      objetivo: 'Analisar intenção de voto e sentimentos do eleitorado',
    });

    if (onAnaliseCompleta && extracao) {
      onAnaliseCompleta({ extracao, sintese });
    }
  };

  // Executar síntese do relatório
  const handleSintetizarRelatorio = async () => {
    const texto = textoManual || relatorioTexto;
    if (!texto || texto.trim().length < 100) return;

    await sintetizarRelatorio(texto, {
      titulo,
      dataGeracao: new Date().toISOString(),
      totalEntrevistas: respostas.length || 100,
    });

    if (onAnaliseCompleta && sintese) {
      onAnaliseCompleta({ extracao, sintese });
    }
  };

  // Análise completa (respostas + relatório)
  const handleAnaliseCompleta = async () => {
    const texto = textoManual || relatorioTexto;

    if (respostas.length > 0 && texto) {
      const respostasFormatadas = respostas.map(r => ({
        texto: r.texto,
        pergunta: r.pergunta,
        eleitor: {
          regiao: r.regiao,
          orientacao: r.orientacao,
          cluster: r.cluster,
        },
      }));

      await analisarCompleto(respostasFormatadas, texto, {
        tipoPesquisa: 'Eleitoral',
        objetivo: 'Análise completa de pesquisa eleitoral',
        titulo,
        dataGeracao: new Date().toISOString(),
      });
    } else if (respostas.length > 0) {
      await handleAnalisarRespostas();
    } else if (texto) {
      await handleSintetizarRelatorio();
    }

    if (onAnaliseCompleta) {
      onAnaliseCompleta({ extracao, sintese });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Analisador Inteligente
              </CardTitle>
              <CardDescription>
                Transforma respostas textuais em indicadores visuais e insights acionáveis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(extracao || sintese) && (
                <Button variant="outline" onClick={limpar} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
              <Button onClick={handleAnaliseCompleta} disabled={carregando}>
                {carregando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={modoAnalise} onValueChange={(v) => setModoAnalise(v as 'respostas' | 'relatorio')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="respostas" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Respostas ({respostas.length})
              </TabsTrigger>
              <TabsTrigger value="relatorio" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatório
              </TabsTrigger>
            </TabsList>

            <TabsContent value="respostas" className="mt-4">
              {respostas.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {respostas.length} respostas disponíveis
                      </Badge>
                      {respostas.some(r => r.regiao) && (
                        <Badge variant="outline">
                          Dados regionais
                        </Badge>
                      )}
                      {respostas.some(r => r.orientacao) && (
                        <Badge variant="outline">
                          Orientação política
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalisarRespostas}
                      disabled={carregando}
                    >
                      Analisar Respostas
                    </Button>
                  </div>

                  {/* Preview das respostas */}
                  <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-muted/50 rounded-lg">
                    {respostas.slice(0, 5).map((r, i) => (
                      <div key={i} className="text-sm p-2 bg-background rounded border">
                        <p className="text-xs text-muted-foreground mb-1">{r.pergunta}</p>
                        <p className="truncate">{r.texto}</p>
                      </div>
                    ))}
                    {respostas.length > 5 && (
                      <p className="text-xs text-center text-muted-foreground">
                        + {respostas.length - 5} respostas adicionais
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma resposta disponível para análise</p>
                  <p className="text-sm mt-2">
                    Execute uma pesquisa ou cole respostas no campo de relatório
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="relatorio" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Cole aqui o relatório completo, insights ou texto para análise..."
                  value={textoManual}
                  onChange={(e) => setTextoManual(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {textoManual.length} caracteres
                    {textoManual.length < 100 && textoManual.length > 0 && (
                      <span className="text-yellow-500 ml-2">
                        (mínimo: 100 caracteres)
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSintetizarRelatorio}
                    disabled={carregando || textoManual.length < 100}
                  >
                    Sintetizar Relatório
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Erro */}
      {erro && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erro na análise:</span>
              <span>{erro}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard de Resultados */}
      {(extracao || sintese || carregando) && (
        <DashboardConsolidado
          extracao={extracao || undefined}
          sintese={sintese || undefined}
          carregando={carregando}
          onRefresh={handleAnaliseCompleta}
        />
      )}
    </div>
  );
}

export default AnalisadorInteligente;
