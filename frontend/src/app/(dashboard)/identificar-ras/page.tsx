'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Dados dos paths extraídos do SVG com informações de posição
const pathsData = [
  { index: 0, cx: 566, cy: 489, area: 39597, fill: 'rgb(252,179,215)' },
  { index: 1, cx: 599, cy: 537, area: 22624, fill: 'rgb(252,203,189)' },
  { index: 2, cx: 608, cy: 593, area: 22848, fill: 'rgb(252,192,193)' },
  { index: 3, cx: 627, cy: 626, area: 34776, fill: 'rgb(215,252,217)' },
  { index: 4, cx: 770, cy: 540, area: 3172, fill: 'rgb(248,199,252)' },
  { index: 5, cx: 828, cy: 498, area: 972, fill: 'rgb(215,184,252)' },
  { index: 6, cx: 751, cy: 561, area: 7663, fill: 'rgb(252,230,212)' },
  { index: 7, cx: 811, cy: 537, area: 23355, fill: 'rgb(215,232,252)' },
  { index: 8, cx: 823, cy: 658, area: 16168, fill: 'rgb(252,235,187)' },
  { index: 9, cx: 908, cy: 490, area: 22016, fill: 'rgb(252,210,179)' },
  { index: 10, cx: 800, cy: 515, area: 1748, fill: 'rgb(215,217,252)' },
  { index: 11, cx: 700, cy: 445, area: 12905, fill: 'rgb(179,191,252)' },
  { index: 12, cx: 765, cy: 502, area: 1824, fill: 'rgb(189,252,206)' },
  { index: 13, cx: 537, cy: 593, area: 1320, fill: 'rgb(252,190,179)' },
  { index: 14, cx: 795, cy: 475, area: 3819, fill: 'rgb(252,215,234)' },
  { index: 15, cx: 837, cy: 432, area: 510, fill: 'rgb(252,182,202)' },
  { index: 16, cx: 929, cy: 376, area: 16330, fill: 'rgb(210,252,245)' },
  { index: 17, cx: 872, cy: 388, area: 91416, fill: 'rgb(247,184,252)' },
  { index: 18, cx: 646, cy: 305, area: 63732, fill: 'rgb(212,252,199)' },
  { index: 19, cx: 752, cy: 472, area: 1900, fill: 'rgb(187,252,226)' },
  { index: 20, cx: 845, cy: 436, area: 1312, fill: 'rgb(252,241,210)' },
  { index: 21, cx: 803, cy: 425, area: 5475, fill: 'rgb(244,215,252)' },
  { index: 22, cx: 780, cy: 417, area: 1764, fill: 'rgb(236,252,202)' },
  { index: 23, cx: 852, cy: 223, area: 46320, fill: 'rgb(230,202,252)' },
  { index: 24, cx: 745, cy: 435, area: 5695, fill: 'rgb(252,197,226)' },
  { index: 25, cx: 904, cy: 193, area: 27032, fill: 'rgb(194,207,252)' },
  { index: 26, cx: 618, cy: 482, area: 6536, fill: 'rgb(194,182,252)' },
  { index: 27, cx: 981, cy: 560, area: 54201, fill: 'rgb(252,252,179)' },
  { index: 28, cx: 1007, cy: 270, area: 41391, fill: 'rgb(179,215,252)' },
  { index: 29, cx: 893, cy: 345, area: 432, fill: 'rgb(182,252,184)' },
  { index: 30, cx: 1203, cy: 520, area: 173394, fill: 'rgb(217,252,179)' },
  { index: 31, cx: 1258, cy: 312, area: 185164, fill: 'rgb(179,248,252)' },
  { index: 32, cx: 1043, cy: 368, area: 6188, fill: 'rgb(197,187,252)' },
  { index: 33, cx: 1054, cy: 580, area: 40586, fill: 'rgb(194,234,252)' },
  { index: 34, cx: 1133, cy: 277, area: 4582, fill: 'rgb(184,252,179)' },
];

// Lista oficial das 35 RAs do DF
const listaRAs = [
  'Plano Piloto', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho',
  'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
  'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
  'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
  'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA/Estrutural',
  'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires',
  'Fercal', 'Sol Nascente/Pôr do Sol', 'Arniqueira'
];

export default function IdentificarRAsPage() {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [hoveredPath, setHoveredPath] = useState<number | null>(null);

  const handleSelectRA = (index: number, ra: string) => {
    setMapping(prev => ({ ...prev, [index]: ra }));
  };

  const exportMapping = () => {
    const result = pathsData.map(p => ({
      index: p.index,
      nome: mapping[p.index] || 'Não identificado',
      cx: p.cx,
      cy: p.cy
    }));
    console.log('Mapeamento:', JSON.stringify(result, null, 2));
    alert('Mapeamento exportado no console (F12)');
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Identificação Visual das Regiões Administrativas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Clique em cada região no mapa e selecione o nome correto da RA.
            As regiões são identificadas por números (0-34).
          </p>

          <div className="flex gap-4 mb-4">
            <button
              onClick={exportMapping}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Exportar Mapeamento
            </button>
          </div>

          {/* SVG do mapa com números */}
          <div className="relative border rounded-lg overflow-hidden bg-slate-100">
            <svg
              viewBox="482 119 993 587"
              className="w-full h-auto"
              style={{ maxHeight: '600px' }}
            >
              {/* Renderizar paths do SVG original */}
              <image
                href="/mapa-df-ras.svg"
                x="482"
                y="119"
                width="993"
                height="587"
                opacity="0.3"
              />

              {/* Números sobre cada região */}
              {pathsData.map(p => (
                <g key={p.index}>
                  {/* Círculo de fundo */}
                  <circle
                    cx={p.cx}
                    cy={p.cy}
                    r={hoveredPath === p.index ? 18 : 14}
                    fill={mapping[p.index] ? '#22c55e' : selectedPath === p.index ? '#3b82f6' : '#fff'}
                    stroke="#000"
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setSelectedPath(p.index)}
                    onMouseEnter={() => setHoveredPath(p.index)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                  {/* Número */}
                  <text
                    x={p.cx}
                    y={p.cy + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={mapping[p.index] ? '#fff' : '#000'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {p.index}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Painel de seleção */}
      {selectedPath !== null && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Região #{selectedPath} - Selecione o nome correto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="col-span-4 p-2 bg-muted rounded">
                <strong>Info:</strong> Centro ({pathsData[selectedPath].cx}, {pathsData[selectedPath].cy}) |
                Área: {pathsData[selectedPath].area} |
                Cor: <span style={{
                  backgroundColor: pathsData[selectedPath].fill,
                  padding: '2px 8px',
                  border: '1px solid #000'
                }}>&nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {listaRAs.map(ra => (
                <button
                  key={ra}
                  onClick={() => handleSelectRA(selectedPath, ra)}
                  className={`p-2 text-sm rounded border ${
                    mapping[selectedPath] === ra
                      ? 'bg-green-500 text-white border-green-600'
                      : Object.values(mapping).includes(ra)
                        ? 'bg-gray-200 text-gray-500 border-gray-300'
                        : 'bg-white hover:bg-blue-50 border-gray-300'
                  }`}
                  disabled={Object.values(mapping).includes(ra) && mapping[selectedPath] !== ra}
                >
                  {ra}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de mapeamento atual */}
      <Card>
        <CardHeader>
          <CardTitle>Mapeamento Atual ({Object.keys(mapping).length}/35)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {pathsData.map(p => (
              <div
                key={p.index}
                className={`p-2 rounded ${mapping[p.index] ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <strong>#{p.index}</strong>: {mapping[p.index] || '???'}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
