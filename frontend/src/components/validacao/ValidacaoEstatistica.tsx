'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  FileText,
  Link2,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Sparkles,
  Shield,
} from 'lucide-react';
import type { Eleitor } from '@/types';
import {
  calcularValidacaoEstatistica,
  formatarDiferenca,
  corPorSeveridade,
  corPorStatus,
  type ResumoValidacao,
  type DivergenciaEstatistica,
  type ValidacaoCompleta,
} from '@/services/validacao-estatistica';
import { MetricasEstatisticas } from './MetricasEstatisticas';

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function BadgeStatus({ status }: { status: string }) {
  const config = {
    otimo: { icone: CheckCircle2, cor: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Ótimo' },
    bom: { icone: CheckCircle2, cor: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Bom' },
    atencao: { icone: AlertCircle, cor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Atenção' },
    critico: { icone: XCircle, cor: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Crítico' },
  };

  const { icone: Icone, cor, label } = config[status as keyof typeof config] || config.atencao;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cor}`}>
      <Icone className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function BadgeConfiabilidade({ nivel }: { nivel: string }) {
  const cores = {
    alta: 'bg-green-500/10 text-green-400',
    media: 'bg-yellow-500/10 text-yellow-400',
    baixa: 'bg-red-500/10 text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${cores[nivel as keyof typeof cores] || cores.media}`}>
      {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
    </span>
  );
}

function IndicadorDiferenca({ diferenca }: { diferenca: number }) {
  const { texto, cor, icone } = formatarDiferenca(diferenca);

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${cor}`}>
      {icone === 'up' && <ArrowUpRight className="w-4 h-4" />}
      {icone === 'down' && <ArrowDownRight className="w-4 h-4" />}
      {icone === 'equal' && <Minus className="w-4 h-4" />}
      {texto}
    </span>
  );
}

function BarraComparacao({
  valorAmostra,
  valorReferencia,
  label,
}: {
  valorAmostra: number;
  valorReferencia: number;
  label: string;
}) {
  const maxValor = Math.max(valorAmostra, valorReferencia, 1);
  const larguraAmostra = (valorAmostra / maxValor) * 100;
  const larguraReferencia = (valorReferencia / maxValor) * 100;
  const diferenca = valorAmostra - valorReferencia;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <IndicadorDiferenca diferenca={diferenca} />
      </div>
      <div className="relative h-6 bg-muted/30 rounded overflow-hidden">
        {/* Barra de referência (mais clara) */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-500/30 rounded"
          style={{ width: `${larguraReferencia}%` }}
        />
        {/* Barra da amostra (mais escura) */}
        <div
          className={`absolute top-0 left-0 h-full rounded ${
            diferenca >= 0 ? 'bg-blue-500/70' : 'bg-orange-500/70'
          }`}
          style={{ width: `${larguraAmostra}%` }}
        />
        {/* Labels dentro da barra */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
          <span className="text-white font-medium drop-shadow">
            {valorAmostra.toFixed(1)}%
          </span>
          <span className="text-gray-300 text-[10px]">
            (ref: {valorReferencia.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CARD DE VARIÁVEL
// ============================================

function CardVariavel({ resumo }: { resumo: ResumoValidacao }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className={`glass-card rounded-xl overflow-hidden border ${corPorStatus(resumo.statusGeral).split(' ').slice(2).join(' ')}`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/5 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BadgeStatus status={resumo.statusGeral} />
            <div>
              <h3 className="font-medium text-foreground">{resumo.labelVariavel}</h3>
              <p className="text-xs text-muted-foreground">{resumo.fonte} ({resumo.ano})</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                Desvio médio: <span className={resumo.mediaDesvio > 7 ? 'text-red-400' : resumo.mediaDesvio > 3 ? 'text-yellow-400' : 'text-green-400'}>
                  {resumo.mediaDesvio.toFixed(1)}%
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Âmbito: {resumo.ambito}
              </p>
            </div>
            {expandido ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {expandido && (
        <div className="border-t border-border">
          {/* Informações da fonte */}
          <div className="p-4 bg-muted/5 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Metodologia</p>
                  <p className="text-foreground">{resumo.metodologia}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Fonte oficial</p>
                  <a
                    href={resumo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Acessar dados <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            {resumo.observacoes && (
              <div className="mt-3 flex items-start gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground italic">{resumo.observacoes}</p>
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" /> Ano: {resumo.ano}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" /> {resumo.ambito}
              </span>
              <span className="flex items-center gap-1">
                Confiabilidade: <BadgeConfiabilidade nivel={resumo.confiabilidade} />
              </span>
            </div>
          </div>

          {/* Tabela de divergências */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Comparação por categoria</h4>
            <div className="space-y-3">
              {resumo.divergencias.map((div) => (
                <BarraComparacao
                  key={div.categoria}
                  valorAmostra={div.valorAmostra}
                  valorReferencia={div.valorReferencia}
                  label={div.labelCategoria}
                />
              ))}
            </div>
          </div>

          {/* Tabela detalhada */}
          <div className="px-4 pb-4">
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Ver tabela detalhada
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground">Categoria</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Amostra</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Referência</th>
                      <th className="text-right py-2 px-2 text-muted-foreground">Diferença</th>
                      <th className="text-center py-2 px-2 text-muted-foreground">Status</th>
                      <th className="text-center py-2 px-2 text-muted-foreground">Correção</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.divergencias.map((div) => (
                      <tr key={div.categoria} className="border-b border-border/50">
                        <td className="py-2 px-2 text-foreground">{div.labelCategoria}</td>
                        <td className="py-2 px-2 text-right text-foreground">
                          {div.valorAmostra.toFixed(1)}%
                          <span className="text-muted-foreground ml-1">
                            (n={div.contagemAmostra})
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-muted-foreground">
                          {div.valorReferencia.toFixed(1)}%
                        </td>
                        <td className="py-2 px-2 text-right">
                          <IndicadorDiferenca diferenca={div.diferenca} />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${corPorSeveridade(div.severidade)}`}>
                            {div.severidade}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {div.eleitoresParaCorrecao > 0 ? (
                            <Link
                              href={`/eleitores/gerar?corrigir=${div.variavel}&categoria=${div.categoria}&quantidade=${div.eleitoresParaCorrecao}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                              title={`Gerar ${div.eleitoresParaCorrecao} eleitores para corrigir`}
                            >
                              <UserPlus className="w-3 h-3" />
                              +{div.eleitoresParaCorrecao}
                            </Link>
                          ) : (
                            <span className="text-green-400">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface ValidacaoEstatisticaProps {
  eleitores: Eleitor[];
}

export function ValidacaoEstatistica({ eleitores }: ValidacaoEstatisticaProps) {
  const validacao = useMemo(
    () => calcularValidacaoEstatistica(eleitores),
    [eleitores]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          Validade Estatística das Amostras
        </h2>
        <p className="text-muted-foreground mt-1">
          Comparação dos {validacao.totalEleitores} eleitores sintéticos com dados oficiais do DF e Brasil.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-muted/20 text-muted-foreground">
            IBGE Censo 2022
          </span>
          <span className="px-2 py-1 rounded bg-muted/20 text-muted-foreground">
            CODEPLAN PDAD 2021
          </span>
          <span className="px-2 py-1 rounded bg-muted/20 text-muted-foreground">
            DataSenado
          </span>
          <span className="px-2 py-1 rounded bg-muted/20 text-muted-foreground">
            Datafolha
          </span>
          <span className="px-2 py-1 rounded bg-muted/20 text-muted-foreground">
            Pesquisas Acadêmicas
          </span>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-xl p-4 border border-primary/30">
          <p className="text-sm text-muted-foreground">Índice de Conformidade</p>
          <p className={`text-3xl font-bold mt-1 ${
            validacao.indiceConformidade >= 70 ? 'text-green-400' :
            validacao.indiceConformidade >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {validacao.indiceConformidade.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Quanto maior, melhor a representatividade
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-green-500/30">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Ótimas
          </p>
          <p className="text-3xl font-bold mt-1 text-green-400">
            {validacao.variaveisOtimas}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Desvio ≤ 3%
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-blue-500/30">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-blue-400" /> Boas
          </p>
          <p className="text-3xl font-bold mt-1 text-blue-400">
            {validacao.variaveisBoas}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Desvio 3-7%
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-yellow-500/30">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-yellow-400" /> Atenção
          </p>
          <p className="text-3xl font-bold mt-1 text-yellow-400">
            {validacao.variaveisAtencao}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Desvio 7-12%
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-red-500/30">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-400" /> Críticas
          </p>
          <p className="text-3xl font-bold mt-1 text-red-400">
            {validacao.variaveisCriticas}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Desvio &gt; 12%
          </p>
        </div>
      </div>

      {/* Métricas Estatísticas Acadêmicas */}
      <MetricasEstatisticas eleitores={eleitores} />

      {/* Principais vieses */}
      {validacao.principaisVieses.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Principais Vieses Identificados
            </h3>
            <Link
              href="/eleitores/gerar?modo=corretivo"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Eleitores Corretivos
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {validacao.principaisVieses.slice(0, 6).map((vies) => (
              <Link
                key={`${vies.variavel}-${vies.categoria}`}
                href={`/eleitores/gerar?corrigir=${vies.variavel}&categoria=${vies.categoria}&quantidade=${vies.eleitoresParaCorrecao}`}
                className="flex items-center justify-between p-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer group"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {vies.labelVariavel}: {vies.labelCategoria}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Amostra: {vies.valorAmostra}% | Ref: {vies.valorReferencia}%
                  </p>
                  {vies.eleitoresParaCorrecao > 0 && (
                    <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      +{vies.eleitoresParaCorrecao} eleitores para corrigir
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {vies.direcao === 'acima' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-sm font-bold ${
                    vies.direcao === 'acima' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {vies.diferenca > 0 ? '+' : ''}{vies.diferenca.toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lista de variáveis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Análise Detalhada por Variável
        </h3>
        {validacao.resumos.map((resumo) => (
          <CardVariavel key={resumo.variavel} resumo={resumo} />
        ))}
      </div>

      {/* Nota metodológica */}
      <div className="glass-card rounded-xl p-4 border border-border">
        <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-400" />
          Nota Metodológica
        </h4>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Esta validação compara a distribuição das variáveis na amostra de eleitores sintéticos com
            dados oficiais de fontes como IBGE (Censo 2022), CODEPLAN (PDAD 2021), DataSenado, Datafolha
            e pesquisas acadêmicas em psicologia política.
          </p>
          <p>
            <strong>Critérios de classificação:</strong> Ótimo (desvio ≤3%), Bom (3-7%), Atenção (7-12%),
            Crítico (&gt;12%). O índice de conformidade considera o status de todas as variáveis
            com ponderação.
          </p>
          <p>
            <strong>Limitações:</strong> Algumas variáveis utilizam dados nacionais por falta de dados
            específicos do DF. Variáveis psicológicas baseiam-se em literatura acadêmica internacional
            com adaptação para o contexto brasileiro.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ValidacaoEstatistica;
