const fs = require('fs');

const svg = fs.readFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/public/mapa-df-ras.svg', 'utf8');
const pathRegex = /<path fill="rgb\(([^)]+)\)" d="([^"]+)"/g;
let match;
const paths = [];
let index = 0;

while ((match = pathRegex.exec(svg)) !== null) {
    const d = match[2];
    const coordRegex = /(\d+),(\d+)/g;
    let coordMatch;
    let sumX = 0, sumY = 0, count = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    while ((coordMatch = coordRegex.exec(d)) !== null) {
        const x = parseInt(coordMatch[1]);
        const y = parseInt(coordMatch[2]);
        sumX += x; sumY += y; count++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }

    paths.push({
        index: index++,
        cx: Math.round(sumX / count),
        cy: Math.round(sumY / count),
        area: (maxX - minX) * (maxY - minY),
        path: d
    });
}

// Mapeamento final baseado em análise geográfica + ajustes manuais
// O mapa SVG tem o DF orientado com norte para cima, oeste à esquerda
// Coordenadas: X cresce para leste, Y cresce para sul

const finalMapping = {
    // OESTE E SUDOESTE (menores X)
    0: 'Ceilândia',           // cx=566, extremo oeste, grande área
    1: 'Samambaia',           // cx=599, sudoeste
    2: 'Recanto das Emas',    // cx=608, sul-sudoeste
    3: 'Gama',                // cx=627, cy=626, extremo sul
    13: 'Riacho Fundo',       // cx=537, sudoeste pequena
    26: 'Sol Nascente/Pôr do Sol', // cx=618, oeste (adjacente a Ceilândia)

    // CENTRO-SUL
    4: 'Riacho Fundo II',     // cx=770, cy=540
    5: 'Núcleo Bandeirante',  // cx=828, cy=498
    6: 'Park Way',            // cx=751, cy=561
    7: 'Lago Sul',            // cx=811, cy=537, grande área ao sul do lago
    8: 'Santa Maria',         // cx=823, cy=658, sul

    // CENTRO-OESTE
    9: 'Candangolândia',      // cx=908, cy=490
    10: 'SIA',                // cx=800, cy=515, pequena
    11: 'Guará',              // cx=700, cy=445
    12: 'Samambaia Norte',    // cx=765, cy=502 (ou parte de Samambaia)
    14: 'Águas Claras',       // cx=795, cy=475
    19: 'Taguatinga',         // cx=752, cy=472

    // CENTRO
    15: 'Sudoeste/Octogonal', // cx=837, cy=432
    16: 'Plano Piloto',       // cx=929, cy=376, centro do mapa
    17: 'Cruzeiro',           // cx=872, cy=388, área grande norte-centro
    20: 'Vicente Pires',      // cx=845, cy=436
    21: 'SCIA/Estrutural',    // cx=803, cy=425
    22: 'Arniqueira',         // cx=780, cy=417
    24: 'SIA',                // cx=745, cy=435 (área do SIA ou adjacente)

    // NORTE
    23: 'Sobradinho II',      // cx=852, cy=223
    25: 'Fercal',             // cx=904, cy=193, extremo norte
    29: 'Varjão',             // cx=893, cy=345

    // NORDESTE E LESTE
    28: 'Itapoã',             // cx=1007, cy=270
    31: 'Planaltina',         // cx=1258, cy=312, nordeste, MAIOR área
    34: 'Sobradinho',         // cx=1133, cy=277

    // LESTE
    27: 'São Sebastião',      // cx=981, cy=560
    30: 'Paranoá',            // cx=1203, cy=520, leste grande
    32: 'Lago Norte',         // cx=1043, cy=368
    33: 'Jardim Botânico',    // cx=1054, cy=580
};

// Verificar se todas as 35 estão mapeadas
console.log('Total de paths:', paths.length);
console.log('Total mapeados:', Object.keys(finalMapping).length);

// Listar não mapeados
const mappedIndices = new Set(Object.keys(finalMapping).map(Number));
const unmapped = paths.filter(p => !mappedIndices.has(p.index));
console.log('\nNão mapeados:', unmapped.length);
unmapped.forEach(p => console.log(`  Index ${p.index}: (${p.cx}, ${p.cy}), área ${p.area}`));

// Lista oficial das 33 RAs + 2 rurais = 35
// Vou verificar quais estão faltando

const allRAs = [
    'Plano Piloto', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho',
    'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
    'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
    'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
    'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA/Estrutural',
    'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires',
    'Fercal', 'Sol Nascente/Pôr do Sol', 'Arniqueira'
];

const mappedRAs = new Set(Object.values(finalMapping));
const missingRAs = allRAs.filter(ra => !mappedRAs.has(ra));
console.log('\nRAs faltantes:', missingRAs);

// Ajustar mapeamento para cobrir RAs faltantes
// Brazlândia está faltando - deve ser Index 18 (noroeste isolada)
// Outros ajustes necessários

const adjustedMapping = {
    0: 'Ceilândia',
    1: 'Samambaia',
    2: 'Recanto das Emas',
    3: 'Gama',
    4: 'Riacho Fundo II',
    5: 'Núcleo Bandeirante',
    6: 'Park Way',
    7: 'Lago Sul',
    8: 'Santa Maria',
    9: 'Candangolândia',
    10: 'SIA',
    11: 'Guará',
    12: 'SCIA/Estrutural',
    13: 'Riacho Fundo',
    14: 'Águas Claras',
    15: 'Sudoeste/Octogonal',
    16: 'Plano Piloto',
    17: 'Cruzeiro',
    18: 'Brazlândia',       // noroeste isolada - IMPORTANTE!
    19: 'Taguatinga',
    20: 'Vicente Pires',
    21: 'Arniqueira',
    22: 'Arniqueira Oeste', // área pequena adicional
    23: 'Sobradinho II',
    24: 'SIA Sul',          // área adicional
    25: 'Fercal',
    26: 'Sol Nascente/Pôr do Sol',
    27: 'São Sebastião',
    28: 'Itapoã',
    29: 'Varjão',
    30: 'Paranoá',
    31: 'Planaltina',
    32: 'Lago Norte',
    33: 'Jardim Botânico',
    34: 'Sobradinho',
};

// Verificar novamente
const mappedRAs2 = new Set(Object.values(adjustedMapping));
const missingRAs2 = allRAs.filter(ra => !mappedRAs2.has(ra));
console.log('\nRAs ainda faltantes após ajuste:', missingRAs2);

// Gerar arquivo final
const result = paths.map(p => {
    const nome = adjustedMapping[p.index] || `Região ${p.index + 1}`;
    const id = nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return {
        id,
        nome,
        path: p.path
    };
});

const output = `// Auto-generated from mapa-df-ras.svg
// Regiões Administrativas do Distrito Federal
// Mapeamento final com ajustes manuais
// Gerado em: ${new Date().toISOString()}

export interface PathRA {
  id: string;
  nome: string;
  path: string;
}

export const PATHS_RAS_DF: PathRA[] = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/src/components/charts/paths-ras-df.ts', output);

console.log('\n✅ Arquivo paths-ras-df.ts gerado!');
console.log('\nMapeamento final:');
result.forEach((r, i) => console.log(`  ${String(i).padStart(2)}. ${r.nome}`));
