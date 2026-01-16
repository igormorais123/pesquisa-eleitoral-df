'use client';

import { useMemo, useState } from 'react';
import {
  Calculator,
  Target,
  Percent,
  Users,
  TrendingUp,
  BarChart3,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Scale,
  Activity,
  PieChart,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import {
  calcularMetricasAmostra,
  realizarTesteQuiQuadrado,
  formatarPValor,
  interpretarTamanhoEfeito,
  corPorQualidade,
  type MetricasAmostra,
  type AnaliseDistribuicao,
} from '@/services/metricas-estatisticas';
import { mapaDadosReferencia, labelsVariaveis } from '@/data/dados-referencia-oficiais';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface TooltipInfoProps {
  titulo: string;
  explicacao: string;
}

function TooltipInfo({ titulo, explicacao }: TooltipInfoProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setAberto(!aberto)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Ajuda: ${titulo}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {aberto && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setAberto(false)}
          />
          {/* Tooltip centralizado como modal flutuante */}
          <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] p-4 bg-card border border-border rounded-xl shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">{titulo}</h4>
              </div>
              <button
                onClick={() => setAberto(false)}
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{explicacao}</p>
          </div>
        </>
      )}
    </div>
  );
}

interface CardMetricaProps {
  icone: React.ReactNode;
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  cor?: string;
  tooltip: { titulo: string; explicacao: string };
}

function CardMetrica({ icone, titulo, valor, subtitulo, cor = 'text-primary', tooltip }: CardMetricaProps) {
  return (
    <div className="glass-card rounded-xl p-4 border border-border/50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icone}
          <span className="text-sm">{titulo}</span>
        </div>
        <TooltipInfo {...tooltip} />
      </div>
      <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
      {subtitulo && <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface MetricasEstatisticasProps {
  eleitores: Eleitor[];
}

export function MetricasEstatisticas({ eleitores }: MetricasEstatisticasProps) {
  const [expandido, setExpandido] = useState(false);

  // Calcular métricas da amostra
  const metricas = useMemo(() => calcularMetricasAmostra(eleitores.length), [eleitores.length]);

  // Calcular testes qui-quadrado para variáveis principais
  const testesQuiQuadrado = useMemo(() => {
    const testes: AnaliseDistribuicao[] = [];
    const variaveisPrincipais = ['genero', 'cor_raca', 'faixa_etaria', 'cluster_socioeconomico', 'religiao', 'orientacao_politica'];

    variaveisPrincipais.forEach((variavel) => {
      const dadoRef = mapaDadosReferencia[variavel];
      if (!dadoRef) return;

      // Calcular distribuição observada
      const contagem: Record<string, number> = {};
      eleitores.forEach((e) => {
        let valor: string;
        if (variavel === 'faixa_etaria') {
          valor = (e as unknown as Record<string, unknown>).faixa_etaria as string || calcularFaixaEtaria(e.idade);
        } else {
          valor = String((e as unknown as Record<string, unknown>)[variavel] || 'nao_informado');
        }
        contagem[valor] = (contagem[valor] || 0) + 1;
      });

      const teste = realizarTesteQuiQuadrado(variavel, contagem, dadoRef.valores, eleitores.length);
      testes.push(teste);
    });

    return testes;
  }, [eleitores]);

  // Calcular resumo dos testes
  const resumoTestes = useMemo(() => {
    const significativos = testesQuiQuadrado.filter((t) => t.testeQui2.significativo).length;
    const ajusteMedio = testesQuiQuadrado.length > 0
      ? testesQuiQuadrado.reduce((acc, t) => acc + t.indiceAjuste, 0) / testesQuiQuadrado.length
      : 100;

    let qualidade: 'excelente' | 'boa' | 'regular' | 'insuficiente';
    if (ajusteMedio >= 90) qualidade = 'excelente';
    else if (ajusteMedio >= 75) qualidade = 'boa';
    else if (ajusteMedio >= 60) qualidade = 'regular';
    else qualidade = 'insuficiente';

    return { significativos, naoSignificativos: testesQuiQuadrado.length - significativos, ajusteMedio, qualidade };
  }, [testesQuiQuadrado]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Métricas Estatísticas Acadêmicas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Indicadores científicos para validação da amostra
          </p>
        </div>
        <button
          onClick={() => setExpandido(!expandido)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors text-sm"
        >
          {expandido ? 'Resumido' : 'Detalhado'}
          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetrica
          icone={<Users className="w-5 h-5" />}
          titulo="Tamanho da Amostra (n)"
          valor={metricas.n.toLocaleString('pt-BR')}
          subtitulo={`${(metricas.fracaoAmostral * 100).toFixed(3)}% do eleitorado do DF`}
          cor="text-blue-400"
          tooltip={{
            titulo: 'Tamanho da Amostra (n)',
            explicacao:
              'Número total de eleitores sintéticos na base. Quanto maior o n, menor a margem de erro e mais confiáveis são as estimativas. Para pesquisas eleitorais, 1000 é considerado um bom tamanho amostral.',
          }}
        />

        <CardMetrica
          icone={<Target className="w-5 h-5" />}
          titulo="Margem de Erro"
          valor={`±${metricas.margemErroPontos.toFixed(1)}%`}
          subtitulo="Nível de confiança de 95%"
          cor="text-green-400"
          tooltip={{
            titulo: 'Margem de Erro',
            explicacao:
              'Indica a variação máxima esperada entre a amostra e a população real. Com margem de ±3.1%, se a pesquisa indicar 50%, o valor real estaria entre 46.9% e 53.1%. Calculado pela fórmula: ME = 1.96 × √(p×(1-p)/n).',
          }}
        />

        <CardMetrica
          icone={<Zap className="w-5 h-5" />}
          titulo="Poder Estatístico"
          valor={`${(metricas.poderEstatistico * 100).toFixed(0)}%`}
          subtitulo="Para detectar diferença de 5%"
          cor={metricas.poderEstatistico >= 0.8 ? 'text-green-400' : 'text-yellow-400'}
          tooltip={{
            titulo: 'Poder Estatístico',
            explicacao:
              'Probabilidade de detectar uma diferença real quando ela existe. Um poder de 80% ou mais é considerado adequado. Com este tamanho amostral, há alta capacidade de identificar diferenças significativas entre grupos.',
          }}
        />

        <CardMetrica
          icone={<Scale className="w-5 h-5" />}
          titulo="Índice de Ajuste"
          valor={`${resumoTestes.ajusteMedio.toFixed(0)}%`}
          subtitulo={`Qualidade: ${resumoTestes.qualidade}`}
          cor={corPorQualidade(resumoTestes.qualidade)}
          tooltip={{
            titulo: 'Índice de Ajuste',
            explicacao:
              'Mede quão bem a distribuição da amostra se aproxima dos dados oficiais de referência. Baseado no V de Cramér invertido. Valores acima de 90% indicam excelente representatividade.',
          }}
        />
      </div>

      {/* Intervalo de Confiança */}
      <div className="glass-card rounded-xl p-4 border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Intervalo de Confiança (IC 95%)
          </h3>
          <TooltipInfo
            titulo="Intervalo de Confiança"
            explicacao="Intervalo onde esperamos encontrar o verdadeiro valor da população com 95% de certeza. Para uma proporção de 50%, este é o pior caso (maior variância)."
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-8 bg-muted/20 rounded-full relative overflow-hidden">
              {/* Barra do intervalo */}
              <div
                className="absolute h-full bg-gradient-to-r from-green-500/50 via-green-400 to-green-500/50 rounded-full"
                style={{
                  left: `${metricas.intervaloConfianca.inferior}%`,
                  width: `${metricas.intervaloConfianca.superior - metricas.intervaloConfianca.inferior}%`,
                }}
              />
              {/* Marcador central */}
              <div className="absolute h-full w-1 bg-white left-1/2 transform -translate-x-1/2" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-green-400 font-medium">
                {metricas.intervaloConfianca.inferior.toFixed(1)}% — 50% — {metricas.intervaloConfianca.superior.toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Para qualquer proporção estimada de 50%, o valor real na população estaria entre{' '}
          <strong className="text-foreground">{metricas.intervaloConfianca.inferior.toFixed(1)}%</strong> e{' '}
          <strong className="text-foreground">{metricas.intervaloConfianca.superior.toFixed(1)}%</strong> com 95% de confiança.
        </p>
      </div>

      {/* Seção expandida - Testes Qui-Quadrado */}
      {expandido && (
        <>
          {/* Parâmetros técnicos */}
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <h3 className="font-medium text-foreground flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              Parâmetros Técnicos da Amostragem
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor Z (95%)</p>
                <p className="font-mono text-foreground">{metricas.valorZ}</p>
                <p className="text-xs text-muted-foreground mt-1">Desvios padrão da média</p>
              </div>
              <div>
                <p className="text-muted-foreground">População Eleitoral DF</p>
                <p className="font-mono text-foreground">{metricas.populacaoEleitoresDF.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">TSE 2024</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fração Amostral</p>
                <p className="font-mono text-foreground">{(metricas.fracaoAmostral * 100).toFixed(4)}%</p>
                <p className="text-xs text-muted-foreground mt-1">n / N (amostra / população)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Efeito Mínimo Detectável</p>
                <p className="font-mono text-foreground">{metricas.tamanhoEfeitoMinimo.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Com poder de 80%</p>
              </div>
            </div>
          </div>

          {/* Testes Qui-Quadrado por variável */}
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Teste Qui-Quadrado de Aderência (χ²)
              </h3>
              <TooltipInfo
                titulo="Teste Qui-Quadrado"
                explicacao="Compara se a distribuição observada na amostra difere significativamente da distribuição esperada (dados oficiais). Se p < 0.05, há diferença estatisticamente significativa."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Variável</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">χ²</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">gl</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">p-valor</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Sig.</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">V Cramér</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Ajuste</th>
                  </tr>
                </thead>
                <tbody>
                  {testesQuiQuadrado.map((teste) => (
                    <tr key={teste.variavel} className="border-b border-border/50 hover:bg-muted/5">
                      <td className="py-2 px-3 text-foreground">
                        {labelsVariaveis[teste.variavel] || teste.variavel}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-foreground">
                        {teste.testeQui2.estatisticaQui2.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                        {teste.testeQui2.grausLiberdade}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-foreground">
                        {formatarPValor(teste.testeQui2.pValor)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {teste.testeQui2.significativo ? (
                          <span className="text-yellow-400" title="Diferença significativa">*</span>
                        ) : (
                          <span title="Sem diferença significativa">
                            <CheckCircle2 className="w-4 h-4 text-green-400 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-mono ${
                          teste.testeQui2.vCramer < 0.1 ? 'text-green-400' :
                          teste.testeQui2.vCramer < 0.3 ? 'text-blue-400' :
                          teste.testeQui2.vCramer < 0.5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {teste.testeQui2.vCramer.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={`font-mono ${
                          teste.indiceAjuste >= 90 ? 'text-green-400' :
                          teste.indiceAjuste >= 75 ? 'text-blue-400' :
                          teste.indiceAjuste >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {teste.indiceAjuste.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legenda */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Legenda:</p>
                <ul className="space-y-1">
                  <li><strong>χ²:</strong> Estatística qui-quadrado calculada</li>
                  <li><strong>gl:</strong> Graus de liberdade (categorias - 1)</li>
                  <li><strong>p-valor:</strong> Probabilidade de obter esta diferença ao acaso</li>
                  <li><strong>Sig.:</strong> * = significativo (p &lt; 0.05)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">V de Cramér (tamanho do efeito):</p>
                <ul className="space-y-1">
                  <li><span className="text-green-400">■</span> &lt; 0.1: Desprezível</li>
                  <li><span className="text-blue-400">■</span> 0.1 - 0.3: Pequeno</li>
                  <li><span className="text-yellow-400">■</span> 0.3 - 0.5: Médio</li>
                  <li><span className="text-red-400">■</span> &gt; 0.5: Grande</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resumo interpretativo */}
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              Interpretação dos Resultados
            </h3>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Resumo:</strong> Das {testesQuiQuadrado.length} variáveis analisadas,{' '}
                <span className={resumoTestes.naoSignificativos === testesQuiQuadrado.length ? 'text-green-400' : 'text-yellow-400'}>
                  {resumoTestes.naoSignificativos} não apresentam diferença significativa
                </span>{' '}
                em relação aos dados oficiais (p &gt; 0.05).
              </p>

              <p>
                <strong className="text-foreground">Margem de erro de ±{metricas.margemErroPontos.toFixed(1)}%</strong> significa que,
                em uma proporção estimada de 50%, podemos afirmar com 95% de confiança que o valor real está entre{' '}
                {metricas.intervaloConfianca.inferior.toFixed(1)}% e {metricas.intervaloConfianca.superior.toFixed(1)}%.
              </p>

              <p>
                <strong className="text-foreground">Poder estatístico de {(metricas.poderEstatistico * 100).toFixed(0)}%</strong> indica
                {metricas.poderEstatistico >= 0.8
                  ? ' alta capacidade de detectar diferenças reais de 5% ou mais entre grupos.'
                  : ' que diferenças pequenas podem não ser detectadas. Considere aumentar o tamanho amostral.'}
              </p>

              <p>
                <strong className="text-foreground">Índice de ajuste médio de {resumoTestes.ajusteMedio.toFixed(0)}%</strong> classifica
                a qualidade da amostra como <span className={corPorQualidade(resumoTestes.qualidade)}>{resumoTestes.qualidade}</span>,
                indicando que a distribuição dos eleitores sintéticos{' '}
                {resumoTestes.qualidade === 'excelente' || resumoTestes.qualidade === 'boa'
                  ? 'representa bem a população do DF.'
                  : 'pode ter alguns vieses em relação à população real do DF.'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Nota metodológica compacta */}
      <div className="text-xs text-muted-foreground bg-muted/10 rounded-lg p-3">
        <p>
          <strong>Metodologia:</strong> Margem de erro calculada para proporções (p=0.5, pior caso) com nível de confiança de 95%.
          Teste qui-quadrado de aderência compara distribuições observadas com dados oficiais do IBGE, CODEPLAN e TSE.
          V de Cramér mede o tamanho do efeito das diferenças encontradas.
        </p>
      </div>
    </div>
  );
}

// Função auxiliar para calcular faixa etária
function calcularFaixaEtaria(idade: number): string {
  if (idade <= 17) return '16-17';
  if (idade <= 24) return '18-24';
  if (idade <= 34) return '25-34';
  if (idade <= 44) return '35-44';
  if (idade <= 59) return '45-59';
  if (idade <= 64) return '60-64';
  return '65+';
}

export default MetricasEstatisticas;
