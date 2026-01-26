'use client';

import Link from 'next/link';
import {
  Zap,
  BarChart3,
  Calendar,
  Users,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
  Building2,
} from 'lucide-react';
import { InteiaBadge, InteiaLogo } from '@/components/branding';

// Dados dos relatórios disponíveis
const relatorios = [
  {
    id: 'intencao-voto-celina-2026',
    tipo: 'pesquisa',
    titulo: 'Intencao de Voto - Governador DF 2026',
    data: 'Janeiro de 2026',
    autor: 'Dra. Helena Montenegro',
    empresa: 'INTEIA',
    totalEntrevistados: 25000,
    status: 'concluido',
    url: '/resultados-intencao-voto/index.html',
    resumo: {
      destaque: 'Crescimento de 22% para 50% em 18 meses',
      forcaPrincipal: 'Lideranca solida com ate 54% em cenarios favoraveis',
      alertaVermelho: 'Arruda pode empatar tecnicamente se candidatar',
    },
    indicadores: [
      { label: 'Pico de intencao', valor: '54%', status: 'success' },
      { label: 'Crescimento total', valor: '+28pp', status: 'success' },
      { label: 'Com Arruda', valor: '32%', status: 'warning' },
      { label: 'Pesquisas analisadas', valor: '19', status: 'info' },
    ],
  },
  {
    id: 'stress-test-celina-2026',
    tipo: 'stress',
    titulo: 'Stress Test Eleitoral - Celina Leao 2026',
    data: '25 de Janeiro de 2026',
    autor: 'Dra. Helena Montenegro',
    empresa: 'INTEIA',
    totalEntrevistados: 1000,
    status: 'concluido',
    url: '/resultados-stress-test/index.html',
    resumo: {
      maiorAmeaca: 'Candidato de centro (57% migrariam)',
      forcaPrincipal: 'Independência de Arruda (83% resistem)',
      alertaVermelho: 'Voto defensivo - 70% anti-adversário',
    },
    indicadores: [
      { label: 'Resistem sem Arruda', valor: '82,6%', status: 'success' },
      { label: 'Abandonam se corrupção', valor: '67,2%', status: 'critical' },
      { label: 'Preferem linha dura', valor: '41%', status: 'warning' },
      { label: 'Consideram centro', valor: '56,9%', status: 'critical' },
    ],
  },
];

export default function PaginaStressTests() {
  return (
    <div className="space-y-6">
      {/* Header com Identidade INTEIA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Zap className="w-7 h-7 text-yellow-400" />
              Stress Tests Eleitorais
            </h1>
            <InteiaBadge variant="gradient" size="sm" />
          </div>
          <p className="text-muted-foreground mt-1">
            Testes de resiliencia do voto sob cenarios de pressao
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end text-right">
          <p className="text-xs text-muted-foreground">Pesquisador Responsavel</p>
          <p className="text-sm font-semibold text-foreground">Igor Morais Vasconcelos, PhD</p>
          <p className="text-[10px] text-amber-500">Presidente INTEIA</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">O que são Stress Tests?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Simulações de cenários adversos para testar a resiliência do eleitorado.
              Cada módulo aplica pressão psicológica específica para identificar vulnerabilidades
              e pontos de ruptura no voto do candidato.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Relatorios */}
      <div className="space-y-4">
        {relatorios.map((relatorio) => (
          <div key={relatorio.id} className="glass-card rounded-xl overflow-hidden">
            {/* Header do Card */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    relatorio.tipo === 'pesquisa' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                  }`}>
                    {relatorio.tipo === 'pesquisa' ? (
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Zap className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{relatorio.titulo}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {relatorio.data}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {relatorio.totalEntrevistados.toLocaleString()} entrevistas
                      </span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Concluido
                </span>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
              {relatorio.indicadores.map((ind, i) => (
                <div key={i} className="bg-card p-4 text-center">
                  <p className={`text-2xl font-bold ${
                    ind.status === 'success' ? 'text-green-400' :
                    ind.status === 'critical' ? 'text-red-400' :
                    ind.status === 'info' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {ind.valor}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{ind.label}</p>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="p-4 space-y-3">
              {relatorio.resumo.destaque && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-400">Destaque</p>
                    <p className="text-sm text-foreground">{relatorio.resumo.destaque}</p>
                  </div>
                </div>
              )}

              {relatorio.resumo.maiorAmeaca && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Maior Ameaca</p>
                    <p className="text-sm text-foreground">{relatorio.resumo.maiorAmeaca}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Forca Principal</p>
                  <p className="text-sm text-foreground">{relatorio.resumo.forcaPrincipal}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Target className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Alerta</p>
                  <p className="text-sm text-foreground">{relatorio.resumo.alertaVermelho}</p>
                </div>
              </div>
            </div>

            {/* Acoes */}
            <div className="p-4 border-t border-border flex gap-3">
              <a
                href={relatorio.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
              >
                <BarChart3 className="w-5 h-5" />
                Ver Relatorio Completo
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Metodologia */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          Metodologia dos Stress Tests
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium text-foreground mb-2">Módulo 1: Fidelidade Política</h3>
            <p className="text-sm text-muted-foreground">
              Testa a dependência do eleitor em relação a padrinhos políticos e líderes de opinião.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium text-foreground mb-2">Módulo 2: Elasticidade Moral</h3>
            <p className="text-sm text-muted-foreground">
              Avalia limites éticos do eleitor - trade-off entre benefício pessoal e corrupção.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium text-foreground mb-2">Módulo 3: Outsider Populista</h3>
            <p className="text-sm text-muted-foreground">
              Mede vulnerabilidade a candidatos com discurso radical e emocional.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium text-foreground mb-2">Módulo 4: Voto Silencioso</h3>
            <p className="text-sm text-muted-foreground">
              Identifica a motivação real do voto - adesão genuína vs. rejeição ao adversário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
