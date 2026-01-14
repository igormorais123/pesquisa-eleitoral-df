'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Vote,
  MapPin,
  Church,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/services/api';
import { formatarNumero, formatarPercentual } from '@/lib/utils';

// Card de estatística
function CardEstatistica({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  corIcone,
  tendencia,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icone: React.ElementType;
  corIcone: string;
  tendencia?: { valor: number; positivo: boolean };
}) {
  return (
    <div className="glass-card rounded-xl p-6 hover:shadow-primary-glow transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
          )}
          {tendencia && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                tendencia.positivo ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {tendencia.positivo ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{formatarPercentual(tendencia.valor)}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${corIcone} flex items-center justify-center`}>
          <Icone className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Card de ação rápida
function CardAcaoRapida({
  titulo,
  descricao,
  href,
  icone: Icone,
  cor,
}: {
  titulo: string;
  descricao: string;
  href: string;
  icone: React.ElementType;
  cor: string;
}) {
  return (
    <Link
      href={href}
      className="glass-card rounded-xl p-5 hover:border-primary/50 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${cor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {titulo}
          </h3>
          <p className="text-sm text-muted-foreground">{descricao}</p>
        </div>
      </div>
    </Link>
  );
}

export default function PaginaInicial() {
  // Buscar estatísticas
  const { data: estatisticas, isLoading } = useQuery({
    queryKey: ['estatisticas-gerais'],
    queryFn: async () => {
      try {
        const response = await api.get('/eleitores/estatisticas');
        return response.data;
      } catch (error) {
        // Retornar dados mock enquanto API não está pronta
        return {
          total_eleitores: 400,
          total_entrevistas: 12,
          total_respostas: 4800,
          media_idade: 38.5,
          distribuicao_genero: { masculino: 48, feminino: 52 },
          distribuicao_cluster: { G1_alta: 15, G2_media_alta: 25, G3_media_baixa: 35, G4_baixa: 25 },
        };
      }
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo ao Sistema de Pesquisa Eleitoral
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie eleitores sintéticos, execute entrevistas e analise resultados para as eleições de Governador do DF 2026.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardEstatistica
          titulo="Total de Eleitores"
          valor={isLoading ? '...' : formatarNumero(estatisticas?.total_eleitores || 0)}
          subtitulo="Agentes sintéticos cadastrados"
          icone={Users}
          corIcone="bg-blue-500"
          tendencia={{ valor: 12.5, positivo: true }}
        />
        <CardEstatistica
          titulo="Entrevistas Realizadas"
          valor={isLoading ? '...' : formatarNumero(estatisticas?.total_entrevistas || 0)}
          subtitulo="Pesquisas executadas"
          icone={MessageSquare}
          corIcone="bg-purple-500"
        />
        <CardEstatistica
          titulo="Total de Respostas"
          valor={isLoading ? '...' : formatarNumero(estatisticas?.total_respostas || 0)}
          subtitulo="Respostas coletadas"
          icone={BarChart3}
          corIcone="bg-green-500"
        />
        <CardEstatistica
          titulo="Média de Idade"
          valor={isLoading ? '...' : `${estatisticas?.media_idade?.toFixed(1) || 0} anos`}
          subtitulo="Dos eleitores cadastrados"
          icone={Activity}
          corIcone="bg-orange-500"
        />
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardAcaoRapida
            titulo="Ver Eleitores"
            descricao="Visualize e filtre os agentes sintéticos"
            href="/eleitores"
            icone={Users}
            cor="bg-blue-500"
          />
          <CardAcaoRapida
            titulo="Nova Entrevista"
            descricao="Crie uma nova pesquisa ou questionário"
            href="/entrevistas/nova"
            icone={MessageSquare}
            cor="bg-purple-500"
          />
          <CardAcaoRapida
            titulo="Ver Resultados"
            descricao="Analise os resultados das pesquisas"
            href="/resultados"
            icone={BarChart3}
            cor="bg-green-500"
          />
        </div>
      </div>

      {/* Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Região */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Distribuição por Região</h3>
              <p className="text-sm text-muted-foreground">32 Regiões Administrativas do DF</p>
            </div>
          </div>
          <div className="space-y-3">
            {['Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto', 'Outras'].map((regiao, i) => (
              <div key={regiao} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{regiao}</span>
                    <span className="text-muted-foreground">{[15, 12, 10, 8, 55][i]}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${[15, 12, 10, 8, 55][i]}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição por Religião */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Church className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Distribuição por Religião</h3>
              <p className="text-sm text-muted-foreground">Perfil religioso dos eleitores</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { nome: 'Católica', pct: 45, cor: 'bg-yellow-500' },
              { nome: 'Evangélica', pct: 30, cor: 'bg-purple-500' },
              { nome: 'Sem religião', pct: 12, cor: 'bg-gray-500' },
              { nome: 'Espírita', pct: 8, cor: 'bg-cyan-500' },
              { nome: 'Outras', pct: 5, cor: 'bg-green-500' },
            ].map((rel) => (
              <div key={rel.nome} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{rel.nome}</span>
                    <span className="text-muted-foreground">{rel.pct}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${rel.cor} rounded-full transition-all duration-500`}
                      style={{ width: `${rel.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas Atividades (placeholder) */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-medium text-foreground mb-4">Atividade Recente</h3>
        <div className="space-y-4">
          {[
            { acao: 'Nova entrevista criada', tempo: 'Há 2 horas', icone: MessageSquare, cor: 'text-purple-400' },
            { acao: '50 eleitores gerados', tempo: 'Há 5 horas', icone: Users, cor: 'text-blue-400' },
            { acao: 'Análise concluída', tempo: 'Há 1 dia', icone: BarChart3, cor: 'text-green-400' },
            { acao: 'Upload de eleitores', tempo: 'Há 2 dias', icone: TrendingUp, cor: 'text-orange-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${item.cor}`}>
                <item.icone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.acao}</p>
                <p className="text-xs text-muted-foreground">{item.tempo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
