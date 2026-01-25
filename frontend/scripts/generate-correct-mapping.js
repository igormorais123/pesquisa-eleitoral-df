const fs = require('fs');

const svg = fs.readFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/public/mapa-df-ras.svg', 'utf8');

// Extrair paths
const pathRegex = /<path fill="rgb\(([^)]+)\)" d="([^"]+)"/g;
let match;
const paths = [];
let index = 0;

while ((match = pathRegex.exec(svg)) !== null) {
    const d = match[2];
    const coordRegex = /(\d+),(\d+)/g;
    let coordMatch;
    let sumX = 0, sumY = 0, count = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    while ((coordMatch = coordRegex.exec(d)) !== null) {
        const x = parseInt(coordMatch[1]);
        const y = parseInt(coordMatch[2]);
        sumX += x;
        sumY += y;
        count++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    const cx = Math.round(sumX / count);
    const cy = Math.round(sumY / count);
    const area = (maxX - minX) * (maxY - minY);

    paths.push({
        index: index++,
        path: d,
        cx, cy, area, minX, maxX, minY, maxY
    });
}

// Mapeamento baseado em análise geográfica detalhada do DF
// Coordenadas do mapa: X menor = oeste, X maior = leste; Y menor = norte, Y maior = sul
// Centro aproximado: X ~900, Y ~400

// MAPEAMENTO CORRIGIDO baseado em:
// 1. Posição geográfica conhecida de cada RA
// 2. Tamanho relativo das áreas
// 3. Forma e fronteiras conhecidas

const mapping = {
    // SUDOESTE e SUL
    0: 'Ceilândia',           // cx=566, cy=489, área grande oeste
    1: 'Samambaia',           // cx=599, cy=537, sudoeste
    2: 'Recanto das Emas',    // cx=608, cy=593, sul-sudoeste
    3: 'Gama',                // cx=627, cy=626, extremo sul

    // CENTRO-SUL
    4: 'Riacho Fundo II',     // cx=770, cy=540, centro-sul pequena
    5: 'Candangolândia',      // cx=828, cy=498, centro pequena
    6: 'Park Way',            // cx=751, cy=561, centro-sul
    7: 'Lago Sul',            // cx=811, cy=537, centro-sul grande (ao sul do lago)
    8: 'Santa Maria',         // cx=823, cy=658, sul-sudeste

    // CENTRO-OESTE
    9: 'Taguatinga',          // cx=908, cy=490, centro-oeste grande
    10: 'SIA',                // cx=800, cy=515, centro pequena
    11: 'Guará',              // cx=700, cy=445, centro-oeste
    12: 'Núcleo Bandeirante', // cx=765, cy=502, centro pequena
    13: 'Riacho Fundo',       // cx=537, cy=593, sudoeste pequena
    14: 'SCIA/Estrutural',    // cx=795, cy=475, centro
    15: 'Cruzeiro',           // cx=837, cy=432, centro pequena

    // CENTRO (PLANO PILOTO E ADJACÊNCIAS)
    16: 'Plano Piloto',       // cx=929, cy=376, centro do mapa
    17: 'Sobradinho',         // cx=872, cy=388, norte grande
    18: 'Brazlândia',         // cx=646, cy=305, noroeste isolada
    19: 'Sudoeste/Octogonal', // cx=752, cy=472, centro pequena
    20: 'Vicente Pires',      // cx=845, cy=436, centro pequena
    21: 'Águas Claras',       // cx=803, cy=425, centro
    22: 'Arniqueira',         // cx=780, cy=417, centro pequena

    // NORTE
    23: 'Sobradinho II',      // cx=852, cy=223, norte
    24: 'Lago Norte',         // cx=745, cy=435, centro (norte do lago)
    25: 'Fercal',             // cx=904, cy=193, extremo norte pequena
    26: 'Sol Nascente/Pôr do Sol', // cx=618, cy=482, oeste

    // LESTE e SUDESTE
    27: 'São Sebastião',      // cx=981, cy=560, leste-sul grande
    28: 'Itapoã',             // cx=1007, cy=270, norte-leste
    29: 'Varjão',             // cx=893, cy=345, norte pequena
    30: 'Paranoá',            // cx=1203, cy=520, leste grande
    31: 'Planaltina',         // cx=1258, cy=312, nordeste (maior área)
    32: 'Jardim Botânico',    // cx=1043, cy=368, leste
    33: 'Paranoá Rural',      // cx=1054, cy=580, leste-sul (extensão do Paranoá)
    34: 'Fercal Norte',       // cx=1133, cy=277, norte-leste pequena
};

// Porém, o mapa oficial pode ter uma ordem diferente das cores
// Vou fazer uma verificação adicional baseada nas características visuais

// Conhecimento geográfico do DF:
// - Planaltina: nordeste, MAIOR área do DF
// - Paranoá: leste, segunda maior
// - Sobradinho: norte-centro
// - Brazlândia: noroeste, isolada
// - Ceilândia: oeste, muito populosa
// - Gama: sul
// - Plano Piloto: centro, formato de avião

// Verificação dos maiores:
console.log('Verificação das maiores áreas:');
paths.sort((a, b) => b.area - a.area).slice(0, 10).forEach(p => {
    console.log(`  Index ${p.index}: área ${p.area}, centro (${p.cx}, ${p.cy}) => ${mapping[p.index]}`);
});

// Gerar arquivo TypeScript
const result = paths.map(p => {
    const nome = mapping[p.index] || `RA ${p.index + 1}`;
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

// Ordenar por ordem original
result.sort((a, b) => paths.findIndex(p => p.path === a.path) - paths.findIndex(p => p.path === b.path));

const output = `// Auto-generated from mapa-df-ras.svg
// Regiões Administrativas do Distrito Federal - Mapeamento baseado em análise geográfica
// Gerado em: ${new Date().toISOString()}

export interface PathRA {
  id: string;
  nome: string;
  path: string;
}

export const PATHS_RAS_DF: PathRA[] = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/src/components/charts/paths-ras-df.ts', output);
console.log('\n✅ Arquivo paths-ras-df.ts regenerado!');
console.log(`Total de regiões: ${result.length}`);
console.log('\nRegiões mapeadas:');
result.forEach((r, i) => console.log(`  ${String(i).padStart(2)}. ${r.nome}`));
