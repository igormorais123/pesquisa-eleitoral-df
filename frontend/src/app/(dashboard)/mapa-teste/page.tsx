'use client';

import { useState } from 'react';
import { MapaCalorDF, MapaComparacao, MapaMultiplasMetricas, type DadoRegiao } from '@/components/charts/MapaCalorDF';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Map } from 'lucide-react';

// Dados de exemplo - Intenção de Voto por RA
const gerarDadosIntencaoVoto = (): DadoRegiao[] => [
  { regiao: 'Plano Piloto', valor: 45.2, variacao: 2.3, label: 'Celina Leão lidera' },
  { regiao: 'Gama', valor: 38.5, variacao: -1.2, label: 'Izalci Lucas lidera' },
  { regiao: 'Taguatinga', valor: 42.1, variacao: 3.5, label: 'Celina Leão lidera' },
  { regiao: 'Brazlândia', valor: 35.8, variacao: 0.8, label: 'Flávia Arruda lidera' },
  { regiao: 'Sobradinho', valor: 41.3, variacao: 1.9, label: 'Celina Leão lidera' },
  { regiao: 'Sobradinho II', valor: 39.7, variacao: -0.5, label: 'Izalci Lucas lidera' },
  { regiao: 'Planaltina', valor: 36.2, variacao: 2.1, label: 'Flávia Arruda lidera' },
  { regiao: 'Paranoá', valor: 37.8, variacao: 1.5, label: 'Izalci Lucas lidera' },
  { regiao: 'Núcleo Bandeirante', valor: 44.6, variacao: 3.2, label: 'Celina Leão lidera' },
  { regiao: 'Ceilândia', valor: 33.4, variacao: -2.1, label: 'Flávia Arruda lidera' },
  { regiao: 'Guará', valor: 46.8, variacao: 4.1, label: 'Celina Leão lidera' },
  { regiao: 'Cruzeiro', valor: 48.2, variacao: 2.8, label: 'Celina Leão lidera' },
  { regiao: 'Samambaia', valor: 34.9, variacao: -0.9, label: 'Flávia Arruda lidera' },
  { regiao: 'Santa Maria', valor: 32.5, variacao: 1.3, label: 'Izalci Lucas lidera' },
  { regiao: 'São Sebastião', valor: 35.1, variacao: 0.6, label: 'Flávia Arruda lidera' },
  { regiao: 'Recanto das Emas', valor: 31.8, variacao: -1.8, label: 'Izalci Lucas lidera' },
  { regiao: 'Lago Sul', valor: 52.3, variacao: 5.2, label: 'Celina Leão lidera' },
  { regiao: 'Lago Norte', valor: 51.1, variacao: 4.8, label: 'Celina Leão lidera' },
  { regiao: 'Riacho Fundo', valor: 38.2, variacao: 1.1, label: 'Izalci Lucas lidera' },
  { regiao: 'Riacho Fundo II', valor: 36.4, variacao: 0.3, label: 'Flávia Arruda lidera' },
  { regiao: 'Candangolândia', valor: 43.7, variacao: 2.5, label: 'Celina Leão lidera' },
  { regiao: 'Águas Claras', valor: 47.5, variacao: 3.9, label: 'Celina Leão lidera' },
  { regiao: 'Vicente Pires', valor: 44.8, variacao: 2.7, label: 'Celina Leão lidera' },
  { regiao: 'Fercal', valor: 29.5, variacao: -2.3, label: 'Izalci Lucas lidera' },
  { regiao: 'Sol Nascente/Pôr do Sol', valor: 30.2, variacao: -1.5, label: 'Flávia Arruda lidera' },
  { regiao: 'Arniqueira', valor: 45.1, variacao: 3.1, label: 'Celina Leão lidera' },
  { regiao: 'Jardim Botânico', valor: 49.8, variacao: 4.5, label: 'Celina Leão lidera' },
  { regiao: 'Itapoã', valor: 33.6, variacao: 0.9, label: 'Flávia Arruda lidera' },
  { regiao: 'SIA', valor: 42.3, variacao: 1.8, label: 'Celina Leão lidera' },
  { regiao: 'SCIA/Estrutural', valor: 28.7, variacao: -3.2, label: 'Flávia Arruda lidera' },
  { regiao: 'Sudoeste/Octogonal', valor: 50.6, variacao: 4.2, label: 'Celina Leão lidera' },
  { regiao: 'Park Way', valor: 48.9, variacao: 3.6, label: 'Celina Leão lidera' },
  { regiao: 'Varjão', valor: 31.2, variacao: -0.7, label: 'Izalci Lucas lidera' },
];

// Dados de rejeição
const gerarDadosRejeicao = (): DadoRegiao[] => [
  { regiao: 'Plano Piloto', valor: 22.5, label: 'Rejeição moderada' },
  { regiao: 'Gama', valor: 35.2, label: 'Rejeição alta' },
  { regiao: 'Taguatinga', valor: 28.4, label: 'Rejeição moderada' },
  { regiao: 'Brazlândia', valor: 38.1, label: 'Rejeição alta' },
  { regiao: 'Sobradinho', valor: 25.8, label: 'Rejeição moderada' },
  { regiao: 'Ceilândia', valor: 42.3, label: 'Rejeição muito alta' },
  { regiao: 'Guará', valor: 21.2, label: 'Rejeição baixa' },
  { regiao: 'Samambaia', valor: 39.7, label: 'Rejeição alta' },
  { regiao: 'Santa Maria', valor: 41.5, label: 'Rejeição muito alta' },
  { regiao: 'Lago Sul', valor: 18.3, label: 'Rejeição baixa' },
  { regiao: 'Lago Norte', valor: 19.1, label: 'Rejeição baixa' },
  { regiao: 'Águas Claras', valor: 20.5, label: 'Rejeição baixa' },
  { regiao: 'Planaltina', valor: 40.2, label: 'Rejeição muito alta' },
  { regiao: 'Recanto das Emas', valor: 43.8, label: 'Rejeição muito alta' },
  { regiao: 'SCIA/Estrutural', valor: 45.2, label: 'Rejeição crítica' },
];

// Dados de participação eleitoral
const gerarDadosParticipacao = (): DadoRegiao[] => [
  { regiao: 'Plano Piloto', valor: 82.5 },
  { regiao: 'Lago Sul', valor: 85.3 },
  { regiao: 'Lago Norte', valor: 84.1 },
  { regiao: 'Águas Claras', valor: 79.8 },
  { regiao: 'Guará', valor: 78.2 },
  { regiao: 'Taguatinga', valor: 72.5 },
  { regiao: 'Ceilândia', valor: 65.8 },
  { regiao: 'Samambaia', valor: 67.3 },
  { regiao: 'Gama', valor: 70.1 },
  { regiao: 'Santa Maria', valor: 64.2 },
  { regiao: 'Planaltina', valor: 62.8 },
  { regiao: 'Recanto das Emas', valor: 63.5 },
  { regiao: 'SCIA/Estrutural', valor: 58.7 },
  { regiao: 'Sol Nascente/Pôr do Sol', valor: 59.2 },
  { regiao: 'Fercal', valor: 61.3 },
];

export default function MapaTestePage() {
  const [dados, setDados] = useState(gerarDadosIntencaoVoto);
  const [escala, setEscala] = useState<'azul' | 'verde_vermelho' | 'azul_vermelho'>('azul');

  const recarregarDados = () => {
    // Gerar pequenas variações nos dados
    setDados(gerarDadosIntencaoVoto().map(d => ({
      ...d,
      valor: d.valor + (Math.random() - 0.5) * 5,
      variacao: (Math.random() - 0.5) * 6
    })));
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-primary" />
            Mapa de Calor do DF
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualização das 35 Regiões Administrativas com dados de exemplo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={recarregarDados}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </div>

      {/* Seletor de escala */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground mr-2 self-center">Escala de cores:</span>
            <Button
              variant={escala === 'azul' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEscala('azul')}
            >
              Azul
            </Button>
            <Button
              variant={escala === 'verde_vermelho' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEscala('verde_vermelho')}
            >
              Verde → Vermelho
            </Button>
            <Button
              variant={escala === 'azul_vermelho' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEscala('azul_vermelho')}
            >
              Azul → Vermelho
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mapa Principal - Intenção de Voto */}
      <MapaCalorDF
        dados={dados}
        titulo="Intenção de Voto - Governador DF 2026"
        subtitulo="Percentual do candidato líder em cada Região Administrativa"
        escala={escala}
        altura={550}
        onRegiaoClick={(regiao) => alert(`Você clicou em: ${regiao}`)}
      />

      {/* Grid de mapas menores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapa de Rejeição */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Rejeição</CardTitle>
          </CardHeader>
          <CardContent>
            <MapaCalorDF
              dados={gerarDadosRejeicao()}
              escala="azul_vermelho"
              altura={350}
              mostrarLegenda={true}
            />
          </CardContent>
        </Card>

        {/* Mapa de Participação */}
        <Card>
          <CardHeader>
            <CardTitle>Participação Eleitoral Estimada</CardTitle>
          </CardHeader>
          <CardContent>
            <MapaCalorDF
              dados={gerarDadosParticipacao()}
              escala="verde_vermelho"
              altura={350}
              mostrarLegenda={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Comparação Antes/Depois */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação: Janeiro vs Junho 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <MapaComparacao
            dadosAntes={gerarDadosIntencaoVoto().map(d => ({ ...d, valor: d.valor - 5 + Math.random() * 3 }))}
            dadosDepois={dados}
            tituloAntes="Janeiro 2026"
            tituloDepois="Junho 2026"
            escala="azul"
          />
        </CardContent>
      </Card>

      {/* Múltiplas Métricas */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Multi-dimensional</CardTitle>
        </CardHeader>
        <CardContent>
          <MapaMultiplasMetricas
            metricas={[
              { nome: 'Intenção de Voto', dados: gerarDadosIntencaoVoto(), escala: 'azul' },
              { nome: 'Rejeição', dados: gerarDadosRejeicao(), escala: 'azul_vermelho' },
              { nome: 'Participação', dados: gerarDadosParticipacao(), escala: 'verde_vermelho' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Fonte dos dados geográficos:</strong> Mapa SVG oficial das Regiões Administrativas do DF
            extraído da Wikimedia Commons (2022). O mapa inclui as 35 RAs oficiais do Distrito Federal
            com contornos precisos baseados em dados do IPEDF/Codeplan.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
