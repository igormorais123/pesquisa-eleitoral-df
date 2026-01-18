'use client';

/**
 * Página de Mapa de Calor por Região Administrativa
 *
 * Visualiza dados eleitorais distribuídos geograficamente pelas RAs do DF
 * usando o mapa SVG real das 35 Regiões Administrativas.
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapaCalorDF, MapaComparacao, type DadoRegiao } from '@/components/charts/MapaCalorDF';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  RefreshCw,
  Download,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  UserSearch,
  Vote,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

// Lista completa das RAs do DF
const REGIOES_DF = [
  'Plano Piloto', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho',
  'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
  'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
  'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
  'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA/Estrutural',
  'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires',
  'Fercal', 'Sol Nascente/Pôr do Sol', 'Arniqueira'
];

const CANDIDATOS = ['Celina Leão', 'Izalci Lucas', 'Flávia Arruda', 'José Roberto Arruda'];

// Gerar dados de exemplo realistas
const gerarDadosIntencaoVoto = (): DadoRegiao[] => {
  return REGIOES_DF.map((regiao) => {
    // Simular variação por tipo de região
    const isAreaNobre = ['Plano Piloto', 'Lago Sul', 'Lago Norte', 'Sudoeste/Octogonal', 'Park Way', 'Jardim Botânico'].includes(regiao);
    const isAreaPopular = ['Ceilândia', 'Samambaia', 'Recanto das Emas', 'Santa Maria', 'Sol Nascente/Pôr do Sol', 'SCIA/Estrutural'].includes(regiao);

    let baseValor = 35 + Math.random() * 20;
    if (isAreaNobre) baseValor += 10;
    if (isAreaPopular) baseValor -= 5;

    const candidatoLider = CANDIDATOS[Math.floor(Math.random() * CANDIDATOS.length)];
    const variacao = (Math.random() - 0.5) * 8;

    return {
      regiao,
      valor: Math.min(60, Math.max(25, baseValor)),
      variacao: variacao,
      label: `${candidatoLider} lidera`,
    };
  });
};

const gerarDadosRejeicao = (): DadoRegiao[] => {
  return REGIOES_DF.map((regiao) => {
    const isAreaNobre = ['Plano Piloto', 'Lago Sul', 'Lago Norte', 'Sudoeste/Octogonal'].includes(regiao);
    const isAreaPopular = ['Ceilândia', 'Samambaia', 'Recanto das Emas', 'Santa Maria'].includes(regiao);

    let baseValor = 30 + Math.random() * 15;
    if (isAreaNobre) baseValor -= 8;
    if (isAreaPopular) baseValor += 10;

    return {
      regiao,
      valor: Math.min(55, Math.max(15, baseValor)),
      label: baseValor > 40 ? 'Rejeição alta' : baseValor > 30 ? 'Rejeição moderada' : 'Rejeição baixa',
    };
  });
};

const gerarDadosAvaliacaoGoverno = (): DadoRegiao[] => {
  return REGIOES_DF.map((regiao) => {
    const isAreaNobre = ['Plano Piloto', 'Lago Sul', 'Lago Norte', 'Águas Claras', 'Guará'].includes(regiao);

    let baseValor = 40 + Math.random() * 25;
    if (isAreaNobre) baseValor += 5;

    return {
      regiao,
      valor: Math.min(75, Math.max(30, baseValor)),
      label: baseValor > 55 ? 'Aprova' : baseValor > 45 ? 'Regular' : 'Desaprova',
    };
  });
};

type TipoDados = 'intencao_voto' | 'rejeicao' | 'avaliacao_governo';
type EscalaCor = 'azul' | 'verde_vermelho' | 'azul_vermelho';

export default function MapaPage() {
  const router = useRouter();
  const [tipoDados, setTipoDados] = useState<TipoDados>('intencao_voto');
  const [escalaCor, setEscalaCor] = useState<EscalaCor>('azul');
  const [dadosMapa, setDadosMapa] = useState<DadoRegiao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string | null>(null);

  // Navegar para eleitores filtrados por região
  const verEleitoresRegiao = (regiao: string) => {
    router.push(`/eleitores?filtro=regiao&valor=${encodeURIComponent(regiao)}`);
  };

  // Criar entrevista na região
  const criarEntrevistaRegiao = (regiao: string) => {
    router.push(`/entrevistas/nova?regiao=${encodeURIComponent(regiao)}`);
  };

  // Carregar dados baseado no tipo selecionado
  const carregarDados = () => {
    setCarregando(true);
    setTimeout(() => {
      let dados: DadoRegiao[];
      switch (tipoDados) {
        case 'rejeicao':
          dados = gerarDadosRejeicao();
          break;
        case 'avaliacao_governo':
          dados = gerarDadosAvaliacaoGoverno();
          break;
        default:
          dados = gerarDadosIntencaoVoto();
      }
      setDadosMapa(dados);
      setCarregando(false);
      toast.success('Dados atualizados!');
    }, 300);
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [tipoDados]);

  // Handler para clique na região
  const handleRegiaoClick = (regiao: string) => {
    setRegiaoSelecionada(regiao);
  };

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    if (dadosMapa.length === 0) return null;

    const valores = dadosMapa.map(d => d.valor);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const maior = dadosMapa.reduce((max, d) => d.valor > max.valor ? d : max, dadosMapa[0]);
    const menor = dadosMapa.reduce((min, d) => d.valor < min.valor ? d : min, dadosMapa[0]);

    return {
      totalRegioes: dadosMapa.length,
      mediaPercentual: media,
      regiaoMaior: maior,
      regiaoMenor: menor,
    };
  }, [dadosMapa]);

  // Dados da região selecionada
  const dadosRegiaoSelecionada = useMemo(() => {
    if (!regiaoSelecionada) return null;
    return dadosMapa.find(d => d.regiao === regiaoSelecionada);
  }, [regiaoSelecionada, dadosMapa]);

  // Título do mapa baseado no tipo de dados
  const getTituloMapa = () => {
    switch (tipoDados) {
      case 'rejeicao':
        return 'Taxa de Rejeição por Região';
      case 'avaliacao_governo':
        return 'Avaliação do Governo por Região';
      default:
        return 'Intenção de Voto por Região';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-8 w-8" />
            Mapa Eleitoral do DF
          </h1>
          <p className="text-muted-foreground">
            Visualização geográfica das 35 Regiões Administrativas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/eleitores">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Eleitores
            </Button>
          </Link>
          <Link href="/cenarios">
            <Button variant="outline">
              <Vote className="h-4 w-4 mr-2" />
              Cenários
            </Button>
          </Link>
          <Button variant="outline" onClick={carregarDados} disabled={carregando}>
            <RefreshCw className={`h-4 w-4 mr-2 ${carregando ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>Tipo de Dados</Label>
              <Select value={tipoDados} onValueChange={(v) => setTipoDados(v as TipoDados)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intencao_voto">Intenção de Voto</SelectItem>
                  <SelectItem value="rejeicao">Taxa de Rejeição</SelectItem>
                  <SelectItem value="avaliacao_governo">Avaliação do Governo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Escala de Cores</Label>
              <Select value={escalaCor} onValueChange={(v) => setEscalaCor(v as EscalaCor)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul (Intensidade)</SelectItem>
                  <SelectItem value="verde_vermelho">Verde → Vermelho</SelectItem>
                  <SelectItem value="azul_vermelho">Azul → Vermelho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      {estatisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Layers className="h-4 w-4" />
                <span className="text-sm">Regiões</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.totalRegioes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Média</span>
              </div>
              <p className="text-2xl font-bold">{estatisticas.mediaPercentual.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Maior</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {estatisticas.regiaoMaior?.valor.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">{estatisticas.regiaoMaior?.regiao}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">Menor</span>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {estatisticas.regiaoMenor?.valor.toFixed(1)}%
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">{estatisticas.regiaoMenor?.regiao}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mapa de Calor Principal */}
      <MapaCalorDF
        dados={dadosMapa}
        titulo={getTituloMapa()}
        subtitulo={`Governador do DF 2026 • Dados simulados para demonstração`}
        escala={escalaCor}
        altura={550}
        onRegiaoClick={handleRegiaoClick}
      />

      {/* Detalhes da Região Selecionada */}
      {dadosRegiaoSelecionada && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {regiaoSelecionada}
                </CardTitle>
                <CardDescription>
                  Detalhes da região selecionada
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => verEleitoresRegiao(regiaoSelecionada!)}
                >
                  <UserSearch className="h-4 w-4 mr-1" />
                  Ver Eleitores
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => criarEntrevistaRegiao(regiaoSelecionada!)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Nova Pesquisa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Valor Principal */}
              <div className="p-6 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {tipoDados === 'intencao_voto' ? 'Intenção de Voto' :
                   tipoDados === 'rejeicao' ? 'Taxa de Rejeição' : 'Aprovação'}
                </p>
                <p className="text-4xl font-bold text-primary">
                  {dadosRegiaoSelecionada.valor.toFixed(1)}%
                </p>
                {dadosRegiaoSelecionada.variacao !== undefined && (
                  <p className={`text-sm mt-2 flex items-center justify-center gap-1 ${
                    dadosRegiaoSelecionada.variacao > 0 ? 'text-green-600' :
                    dadosRegiaoSelecionada.variacao < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {dadosRegiaoSelecionada.variacao > 0 ? <TrendingUp className="h-4 w-4" /> :
                     dadosRegiaoSelecionada.variacao < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                    {dadosRegiaoSelecionada.variacao > 0 ? '+' : ''}
                    {dadosRegiaoSelecionada.variacao.toFixed(1)}% vs pesquisa anterior
                  </p>
                )}
              </div>

              {/* Info */}
              <div className="p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <Badge variant="outline" className="text-base">
                  {dadosRegiaoSelecionada.label}
                </Badge>
              </div>

              {/* Ações */}
              <div className="p-6 bg-muted/50 rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">Ações Rápidas</p>
                <div className="space-y-2">
                  <Link
                    href={`/eleitores?filtro=regiao&valor=${encodeURIComponent(regiaoSelecionada!)}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Users className="h-4 w-4" />
                    Ver eleitores desta região
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/resultados?regiao=${encodeURIComponent(regiaoSelecionada!)}`}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Ver resultados detalhados
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking das Regiões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ranking por Região</CardTitle>
          <CardDescription>
            Ordenado do maior para o menor valor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[...dadosMapa]
              .sort((a, b) => b.valor - a.valor)
              .slice(0, 15)
              .map((dado, index) => (
                <div
                  key={dado.regiao}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    regiaoSelecionada === dado.regiao
                      ? 'bg-primary/20 ring-1 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setRegiaoSelecionada(dado.regiao)}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm truncate">{dado.regiao}</span>
                  <span className="font-semibold">{dado.valor.toFixed(1)}%</span>
                  {dado.variacao !== undefined && (
                    <span className={`text-xs ${
                      dado.variacao > 0 ? 'text-green-600' :
                      dado.variacao < 0 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {dado.variacao > 0 ? '↑' : dado.variacao < 0 ? '↓' : '→'}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Fonte:</strong> Mapa SVG oficial das Regiões Administrativas do DF (Wikimedia Commons, 2022).
            Os dados apresentados são simulados para fins de demonstração do sistema.
            Em produção, os dados serão obtidos das pesquisas reais realizadas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
