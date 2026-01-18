'use client';

/**
 * Página de Mapa de Calor por Região Administrativa
 *
 * Visualiza dados eleitorais distribuídos geograficamente pelas RAs do DF.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapaCalorRA } from '@/components/mapa';
import { DadosMapaCalor, DadosRegiaoAdministrativa } from '@/types';
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
  ExternalLink,
  UserSearch,
  Vote,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

// Dados de exemplo para demonstração
const gerarDadosExemplo = (): DadosMapaCalor[] => {
  const regioes = [
    'Brasília', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho',
    'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
    'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
    'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
    'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA/Estrutural',
    'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires',
    'Fercal', 'Sol Nascente/Pôr do Sol', 'Arniqueira'
  ];

  const candidatos = ['Celina Leão', 'Izalci Lucas', 'Flávia Arruda', 'José Roberto'];

  return regioes.map((regiao) => {
    const candidatoLider = candidatos[Math.floor(Math.random() * candidatos.length)];
    const percentualLider = 25 + Math.random() * 35;

    return {
      regiao,
      valor: percentualLider,
      percentual: percentualLider,
      candidato_lider: candidatoLider,
      candidato_lider_percentual: percentualLider,
      total_eleitores: Math.floor(1000 + Math.random() * 50000),
      detalhes: {
        'Celina Leão': Math.random() * 30 + 15,
        'Izalci Lucas': Math.random() * 25 + 10,
        'Flávia Arruda': Math.random() * 20 + 10,
        'José Roberto': Math.random() * 15 + 5,
      },
    };
  });
};

type TipoDados = 'intencao_voto' | 'rejeicao' | 'avaliacao_governo' | 'comparativo';

export default function MapaPage() {
  const router = useRouter();
  const [tipoDados, setTipoDados] = useState<TipoDados>('intencao_voto');
  const [dadosMapa, setDadosMapa] = useState<DadosMapaCalor[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<any>(null);

  // Navegar para eleitores filtrados por região
  const verEleitoresRegiao = (regiao: string) => {
    router.push(`/eleitores?filtro=regiao&valor=${encodeURIComponent(regiao)}`);
  };

  // Navegar para cenários com candidato
  const verCenariosCandidato = (candidato: string) => {
    router.push(`/cenarios?candidato=${encodeURIComponent(candidato)}`);
  };

  // Criar entrevista na região
  const criarEntrevistaRegiao = (regiao: string) => {
    router.push(`/entrevistas/nova?regiao=${encodeURIComponent(regiao)}`);
  };

  // Carregar dados baseado no tipo selecionado
  const carregarDados = () => {
    setCarregando(true);
    // Simular carregamento de dados
    setTimeout(() => {
      const dados = gerarDadosExemplo();
      setDadosMapa(dados);
      setCarregando(false);
      toast.success('Dados carregados com sucesso!');
    }, 500);
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, [tipoDados]);

  // Handler para clique na região
  const handleRegiaoClick = (regiao: any, dados?: DadosMapaCalor) => {
    setRegiaoSelecionada({ regiao, dados });
  };

  // Estatísticas gerais
  const estatisticas = {
    totalRegioes: dadosMapa.length,
    mediaPercentual: dadosMapa.reduce((acc, d) => acc + d.percentual, 0) / (dadosMapa.length || 1),
    regiaoMaior: dadosMapa.reduce((max, d) => d.percentual > max.percentual ? d : max, dadosMapa[0]),
    regiaoMenor: dadosMapa.reduce((min, d) => d.percentual < min.percentual ? d : min, dadosMapa[0]),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Map className="h-8 w-8" />
            Mapa Eleitoral
          </h1>
          <p className="text-muted-foreground">
            Visualização geográfica dos dados eleitorais por Região Administrativa
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/eleitores">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Ver Eleitores
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
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
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intencao_voto">Intenção de Voto</SelectItem>
                  <SelectItem value="rejeicao">Taxa de Rejeição</SelectItem>
                  <SelectItem value="avaliacao_governo">Avaliação do Governo</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Map className="h-4 w-4" />
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
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Maior</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {estatisticas.regiaoMaior?.percentual.toFixed(1)}%
            </p>
            <p className="text-xs text-green-600">{estatisticas.regiaoMaior?.regiao}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Menor</span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {estatisticas.regiaoMenor?.percentual.toFixed(1)}%
            </p>
            <p className="text-xs text-red-600">{estatisticas.regiaoMenor?.regiao}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Calor */}
      <MapaCalorRA
        dados={dadosMapa}
        titulo={`Mapa de ${tipoDados === 'intencao_voto' ? 'Intenção de Voto' : tipoDados === 'rejeicao' ? 'Rejeição' : tipoDados === 'avaliacao_governo' ? 'Avaliação do Governo' : 'Comparativo'}`}
        subtitulo={`Dados simulados para demonstração • ${dadosMapa.length} regiões`}
        tipoInicial="dados_custom"
        onRegiaoClick={handleRegiaoClick}
      />

      {/* Detalhes da Região (quando clicada) */}
      {regiaoSelecionada?.dados && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Detalhes: {regiaoSelecionada.regiao.nome || regiaoSelecionada.dados.regiao}
                </CardTitle>
                <CardDescription>
                  Distribuição de votos por candidato nesta região
                </CardDescription>
              </div>
              {/* Ações rápidas para a região */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => verEleitoresRegiao(regiaoSelecionada.regiao.nome || regiaoSelecionada.dados.regiao)}
                >
                  <UserSearch className="h-4 w-4 mr-1" />
                  Ver Eleitores
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => criarEntrevistaRegiao(regiaoSelecionada.regiao.nome || regiaoSelecionada.dados.regiao)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Nova Pesquisa
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Líder */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidato Líder</p>
                    <p className="text-xl font-bold">{regiaoSelecionada.dados.candidato_lider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {regiaoSelecionada.dados.percentual.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {regiaoSelecionada.dados.total_eleitores?.toLocaleString('pt-BR')} eleitores
                    </p>
                  </div>
                </div>
                {/* Link para ver cenários do candidato */}
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto"
                  onClick={() => verCenariosCandidato(regiaoSelecionada.dados.candidato_lider)}
                >
                  <Vote className="h-3 w-3 mr-1" />
                  Ver simulações com este candidato
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* Distribuição por candidato */}
              {regiaoSelecionada.dados.detalhes && (
                <div className="space-y-2">
                  <Label>Distribuição por Candidato</Label>
                  {Object.entries(regiaoSelecionada.dados.detalhes).map(([candidato, valor]: [string, any]) => (
                    <div
                      key={candidato}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => verCenariosCandidato(candidato)}
                    >
                      <span className="w-32 text-sm truncate">{candidato}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${valor}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm text-right">{valor.toFixed(1)}%</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {/* Links adicionais */}
              <div className="pt-4 border-t flex gap-2 flex-wrap">
                <Link
                  href={`/eleitores?filtro=regiao&valor=${encodeURIComponent(regiaoSelecionada.regiao.nome || regiaoSelecionada.dados.regiao)}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  Ver todos os {regiaoSelecionada.dados.total_eleitores?.toLocaleString('pt-BR')} eleitores desta região
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
