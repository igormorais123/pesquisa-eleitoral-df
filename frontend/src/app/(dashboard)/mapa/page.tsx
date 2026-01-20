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
import { cn } from '@/lib/utils';

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

type TipoDados =
  | 'intencao_voto'
  | 'rejeicao'
  | 'avaliacao_governo'
  | 'quantidade_eleitores'
  | 'participacao'
  | 'renda_media'
  | 'idade_media'
  | 'escolaridade'
  | 'densidade_demografica'
  | 'cluster_socioeconomico';
type EscalaCor = 'azul' | 'verde_vermelho' | 'azul_vermelho' | 'quantidade';

// População por RA para dados de quantidade de eleitores
const POPULACAO_RA: Record<string, number> = {
  'Ceilândia': 430000,
  'Samambaia': 270000,
  'Taguatinga': 225000,
  'Plano Piloto': 220000,
  'Planaltina': 195000,
  'Águas Claras': 160000,
  'Recanto das Emas': 150000,
  'Gama': 145000,
  'Guará': 135000,
  'Santa Maria': 135000,
  'São Sebastião': 115000,
  'Sobradinho II': 105000,
  'Sol Nascente/Pôr do Sol': 90000,
  'Sobradinho': 85000,
  'Vicente Pires': 75000,
  'Arniqueira': 70000,
  'Itapoã': 68000,
  'Paranoá': 65000,
  'Riacho Fundo II': 55000,
  'Brazlândia': 55000,
  'Sudoeste/Octogonal': 55000,
  'Riacho Fundo': 45000,
  'SCIA/Estrutural': 40000,
  'Lago Norte': 38000,
  'Cruzeiro': 35000,
  'Lago Sul': 30000,
  'Jardim Botânico': 28000,
  'Núcleo Bandeirante': 25000,
  'Park Way': 22000,
  'Candangolândia': 18000,
  'Fercal': 10000,
  'Varjão': 10000,
  'SIA': 2000,
};

// Gerar dados de quantidade de eleitores
const gerarDadosQuantidadeEleitores = (): DadoRegiao[] => {
  return REGIOES_DF.map((regiao) => {
    const populacao = POPULACAO_RA[regiao] || 50000;
    // Aproximadamente 70% são eleitores
    const eleitores = Math.round(populacao * (0.65 + Math.random() * 0.1));
    return {
      regiao,
      valor: eleitores,
      label: `${(eleitores / 1000).toFixed(0)}k eleitores`,
    };
  });
};

// Gerar dados de participação
const gerarDadosParticipacao = (): DadoRegiao[] => {
  return REGIOES_DF.map((regiao) => {
    const isAreaNobre = ['Plano Piloto', 'Lago Sul', 'Lago Norte', 'Sudoeste/Octogonal', 'Park Way'].includes(regiao);
    let baseValor = 70 + Math.random() * 15;
    if (isAreaNobre) baseValor += 8;
    return {
      regiao,
      valor: Math.min(95, baseValor),
      label: baseValor > 85 ? 'Alta participação' : baseValor > 75 ? 'Participação média' : 'Baixa participação',
    };
  });
};

// Gerar dados de renda média
const gerarDadosRendaMedia = (): DadoRegiao[] => {
  const rendaPorRegiao: Record<string, number> = {
    'Lago Sul': 25000, 'Lago Norte': 18000, 'Park Way': 16000, 'Jardim Botânico': 14000,
    'Sudoeste/Octogonal': 12000, 'Plano Piloto': 10000, 'Águas Claras': 8000, 'Guará': 6500,
    'Cruzeiro': 6000, 'Núcleo Bandeirante': 5000, 'Taguatinga': 4500, 'Vicente Pires': 4500,
    'Sobradinho': 4000, 'Sobradinho II': 3800, 'Gama': 3500, 'Samambaia': 3000,
    'Ceilândia': 2800, 'Planaltina': 2500, 'Santa Maria': 2400, 'Recanto das Emas': 2300,
    'Riacho Fundo': 2800, 'Riacho Fundo II': 2500, 'Candangolândia': 3000, 'Brazlândia': 2200,
    'São Sebastião': 2600, 'Paranoá': 2400, 'Itapoã': 2200, 'Varjão': 1800,
    'SCIA/Estrutural': 1500, 'Fercal': 1800, 'Sol Nascente/Pôr do Sol': 1600,
    'Arniqueira': 3500, 'SIA': 5000,
  };
  return REGIOES_DF.map((regiao) => {
    const renda = rendaPorRegiao[regiao] || 3000;
    return {
      regiao,
      valor: renda,
      label: renda > 8000 ? 'Renda alta' : renda > 4000 ? 'Renda média' : 'Renda baixa',
    };
  });
};

// Gerar dados de idade média
const gerarDadosIdadeMedia = (): DadoRegiao[] => {
  const idadePorRegiao: Record<string, number> = {
    'Lago Sul': 48, 'Lago Norte': 45, 'Park Way': 46, 'Jardim Botânico': 42,
    'Sudoeste/Octogonal': 40, 'Plano Piloto': 42, 'Águas Claras': 34, 'Guará': 38,
    'Cruzeiro': 44, 'Núcleo Bandeirante': 40, 'Taguatinga': 36, 'Vicente Pires': 35,
    'Sobradinho': 38, 'Sobradinho II': 34, 'Gama': 37, 'Samambaia': 32,
    'Ceilândia': 33, 'Planaltina': 30, 'Santa Maria': 29, 'Recanto das Emas': 28,
    'Riacho Fundo': 35, 'Riacho Fundo II': 30, 'Candangolândia': 39, 'Brazlândia': 34,
    'São Sebastião': 31, 'Paranoá': 32, 'Itapoã': 27, 'Varjão': 28,
    'SCIA/Estrutural': 26, 'Fercal': 33, 'Sol Nascente/Pôr do Sol': 25,
    'Arniqueira': 36, 'SIA': 41,
  };
  return REGIOES_DF.map((regiao) => {
    const idade = idadePorRegiao[regiao] || 35;
    return {
      regiao,
      valor: idade,
      label: idade > 40 ? 'População mais velha' : idade > 32 ? 'Idade média' : 'População jovem',
    };
  });
};

// Gerar dados de escolaridade (% com ensino superior)
const gerarDadosEscolaridade = (): DadoRegiao[] => {
  const escolaridadePorRegiao: Record<string, number> = {
    'Lago Sul': 78, 'Lago Norte': 72, 'Park Way': 68, 'Jardim Botânico': 65,
    'Sudoeste/Octogonal': 75, 'Plano Piloto': 70, 'Águas Claras': 62, 'Guará': 52,
    'Cruzeiro': 58, 'Núcleo Bandeirante': 42, 'Taguatinga': 35, 'Vicente Pires': 45,
    'Sobradinho': 38, 'Sobradinho II': 28, 'Gama': 25, 'Samambaia': 18,
    'Ceilândia': 15, 'Planaltina': 12, 'Santa Maria': 10, 'Recanto das Emas': 11,
    'Riacho Fundo': 22, 'Riacho Fundo II': 16, 'Candangolândia': 32, 'Brazlândia': 14,
    'São Sebastião': 18, 'Paranoá': 15, 'Itapoã': 9, 'Varjão': 8,
    'SCIA/Estrutural': 5, 'Fercal': 10, 'Sol Nascente/Pôr do Sol': 6,
    'Arniqueira': 40, 'SIA': 48,
  };
  return REGIOES_DF.map((regiao) => {
    const escolaridade = escolaridadePorRegiao[regiao] || 25;
    return {
      regiao,
      valor: escolaridade,
      label: escolaridade > 50 ? 'Alta escolaridade' : escolaridade > 25 ? 'Escolaridade média' : 'Baixa escolaridade',
    };
  });
};

// Gerar dados de densidade demográfica (hab/km²)
const gerarDadosDensidadeDemografica = (): DadoRegiao[] => {
  const densidadePorRegiao: Record<string, number> = {
    'Águas Claras': 15000, 'Guará': 8500, 'Cruzeiro': 7800, 'Taguatinga': 6200,
    'Sudoeste/Octogonal': 5800, 'Ceilândia': 5500, 'Samambaia': 5200, 'Plano Piloto': 4500,
    'Candangolândia': 4200, 'Santa Maria': 4000, 'Recanto das Emas': 3800, 'Riacho Fundo': 3500,
    'Riacho Fundo II': 3400, 'Sobradinho II': 3200, 'Gama': 3000, 'Núcleo Bandeirante': 2800,
    'Vicente Pires': 2600, 'Itapoã': 2400, 'São Sebastião': 2200, 'Paranoá': 2000,
    'Sol Nascente/Pôr do Sol': 4500, 'SCIA/Estrutural': 3000, 'Sobradinho': 1800,
    'Varjão': 8000, 'Planaltina': 1500, 'Arniqueira': 1400, 'Lago Norte': 800,
    'Lago Sul': 600, 'Park Way': 400, 'Jardim Botânico': 500, 'Brazlândia': 700,
    'Fercal': 300, 'SIA': 100,
  };
  return REGIOES_DF.map((regiao) => {
    const densidade = densidadePorRegiao[regiao] || 2000;
    return {
      regiao,
      valor: densidade,
      label: densidade > 5000 ? 'Alta densidade' : densidade > 2000 ? 'Densidade média' : 'Baixa densidade',
    };
  });
};

// Gerar dados de cluster socioeconômico (1=baixa, 4=alta)
const gerarDadosClusterSocioeconomico = (): DadoRegiao[] => {
  const clusterPorRegiao: Record<string, number> = {
    'Lago Sul': 4, 'Lago Norte': 4, 'Park Way': 4, 'Jardim Botânico': 4,
    'Sudoeste/Octogonal': 4, 'Plano Piloto': 4, 'Cruzeiro': 4,
    'Águas Claras': 3, 'Guará': 3, 'Vicente Pires': 3, 'Taguatinga': 3,
    'Sobradinho': 3, 'Núcleo Bandeirante': 3, 'Candangolândia': 3, 'Arniqueira': 3,
    'Gama': 2, 'Samambaia': 2, 'Ceilândia': 2, 'Riacho Fundo': 2, 'Riacho Fundo II': 2,
    'Sobradinho II': 2, 'São Sebastião': 2, 'Paranoá': 2,
    'Planaltina': 1, 'Santa Maria': 1, 'Recanto das Emas': 1, 'Itapoã': 1,
    'SCIA/Estrutural': 1, 'Sol Nascente/Pôr do Sol': 1, 'Varjão': 1, 'Brazlândia': 1, 'Fercal': 1,
    'SIA': 3,
  };
  const labels = ['', 'G4 - Baixa Renda', 'G3 - Média-Baixa', 'G2 - Média-Alta', 'G1 - Alta Renda'];
  return REGIOES_DF.map((regiao) => {
    const cluster = clusterPorRegiao[regiao] || 2;
    return {
      regiao,
      valor: cluster,
      label: labels[cluster],
    };
  });
};

export default function MapaPage() {
  const router = useRouter();
  const [tipoDados, setTipoDados] = useState<TipoDados>('intencao_voto');
  const [escalaCor, setEscalaCor] = useState<EscalaCor>('azul');
  const [mostrarLago, setMostrarLago] = useState(true);
  const [mostrarNomes, setMostrarNomes] = useState(true);
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
        case 'quantidade_eleitores':
          dados = gerarDadosQuantidadeEleitores();
          break;
        case 'participacao':
          dados = gerarDadosParticipacao();
          break;
        case 'renda_media':
          dados = gerarDadosRendaMedia();
          break;
        case 'idade_media':
          dados = gerarDadosIdadeMedia();
          break;
        case 'escolaridade':
          dados = gerarDadosEscolaridade();
          break;
        case 'densidade_demografica':
          dados = gerarDadosDensidadeDemografica();
          break;
        case 'cluster_socioeconomico':
          dados = gerarDadosClusterSocioeconomico();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case 'quantidade_eleitores':
        return 'Quantidade de Eleitores por Região';
      case 'participacao':
        return 'Taxa de Participação por Região';
      case 'renda_media':
        return 'Renda Média por Região';
      case 'idade_media':
        return 'Idade Média da População por Região';
      case 'escolaridade':
        return 'Escolaridade (% com Ensino Superior) por Região';
      case 'densidade_demografica':
        return 'Densidade Demográfica por Região';
      case 'cluster_socioeconomico':
        return 'Cluster Socioeconômico por Região';
      default:
        return 'Intenção de Voto por Região';
    }
  };

  // Formatar valor baseado no tipo de dados
  const getFormatarValor = () => {
    switch (tipoDados) {
      case 'quantidade_eleitores':
        return (v: number) => `${(v / 1000).toFixed(0)}k`;
      case 'renda_media':
        return (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;
      case 'idade_media':
        return (v: number) => `${v.toFixed(0)} anos`;
      case 'densidade_demografica':
        return (v: number) => `${v.toLocaleString('pt-BR')} hab/km²`;
      case 'cluster_socioeconomico':
        return (v: number) => {
          const labels = ['', 'G4', 'G3', 'G2', 'G1'];
          return labels[Math.round(v)] || 'G3';
        };
      default:
        return (v: number) => `${v.toFixed(1)}%`;
    }
  };

  // Escolher escala de cor adequada para o tipo de dados
  const getEscalaRecomendada = (): EscalaCor => {
    switch (tipoDados) {
      case 'quantidade_eleitores':
      case 'densidade_demografica':
        return 'quantidade';
      case 'renda_media':
      case 'cluster_socioeconomico':
      case 'escolaridade':
        return 'verde_vermelho';
      case 'rejeicao':
        return 'azul_vermelho';
      default:
        return 'azul';
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
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intencao_voto">Intenção de Voto</SelectItem>
                  <SelectItem value="rejeicao">Taxa de Rejeição</SelectItem>
                  <SelectItem value="avaliacao_governo">Avaliação do Governo</SelectItem>
                  <SelectItem value="quantidade_eleitores">Qtd. de Eleitores</SelectItem>
                  <SelectItem value="participacao">Participação Eleitoral</SelectItem>
                  <SelectItem value="renda_media">Renda Média (R$)</SelectItem>
                  <SelectItem value="idade_media">Idade Média</SelectItem>
                  <SelectItem value="escolaridade">Escolaridade (% Sup.)</SelectItem>
                  <SelectItem value="densidade_demografica">Densidade (hab/km²)</SelectItem>
                  <SelectItem value="cluster_socioeconomico">Cluster Socioeconômico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Escala de Cores</Label>
              <Select value={escalaCor} onValueChange={(v) => setEscalaCor(v as EscalaCor)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul (Intensidade)</SelectItem>
                  <SelectItem value="verde_vermelho">Verde → Vermelho</SelectItem>
                  <SelectItem value="azul_vermelho">Azul → Vermelho</SelectItem>
                  <SelectItem value="quantidade">Roxo (Quantidade)</SelectItem>
                </SelectContent>
              </Select>
            </div>

                      </div>

          {/* Toggles de visualização */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
            <Label className="text-muted-foreground">Elementos do mapa:</Label>
            <button
              onClick={() => setMostrarLago(!mostrarLago)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                mostrarLago ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-muted text-muted-foreground"
              )}
            >
              🌊 Lago Paranoá
            </button>
            <button
              onClick={() => setMostrarNomes(!mostrarNomes)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                mostrarNomes ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-muted text-muted-foreground"
              )}
            >
              🏷️ Nomes das RAs
            </button>
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
        altura={600}
        onRegiaoClick={handleRegiaoClick}
        formatarValor={getFormatarValor()}
        mostrarLago={mostrarLago}
        mostrarNomesCidades={mostrarNomes}
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
