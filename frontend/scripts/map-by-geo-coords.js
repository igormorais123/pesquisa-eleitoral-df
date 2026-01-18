const fs = require('fs');

// Limites geográficos do DF (aproximados)
// Baseado em: "bbox": "-48.2560305,-16.0477456,-47.4930653,-15.5085218"
const geoMinLon = -48.2560305;
const geoMaxLon = -47.4930653;
const geoMinLat = -16.0477456;  // Sul (maior Y no SVG)
const geoMaxLat = -15.5085218;  // Norte (menor Y no SVG)

// Limites do SVG (viewBox="482 119 993 587")
const svgMinX = 482;
const svgWidth = 993;
const svgMinY = 119;
const svgHeight = 587;

// Função para converter coordenadas geográficas para SVG
function geoToSvg(lat, lon) {
    // Longitude -> X (esquerda para direita = oeste para leste)
    const x = svgMinX + ((lon - geoMinLon) / (geoMaxLon - geoMinLon)) * svgWidth;
    // Latitude -> Y (de cima para baixo = norte para sul, invertido)
    const y = svgMinY + ((geoMaxLat - lat) / (geoMaxLat - geoMinLat)) * svgHeight;
    return { x: Math.round(x), y: Math.round(y) };
}

// Coordenadas aproximadas dos centróides das principais RAs
// Fonte: Conhecimento geográfico e estimativas baseadas em mapas
const raCoords = {
    'Plano Piloto':        { lat: -15.7942, lon: -47.8825 },
    'Gama':                { lat: -16.0158, lon: -48.0644 },
    'Taguatinga':          { lat: -15.8357, lon: -48.0544 },
    'Brazlândia':          { lat: -15.6753, lon: -48.1847 },
    'Sobradinho':          { lat: -15.6517, lon: -47.7883 },
    'Planaltina':          { lat: -15.6200, lon: -47.6500 },
    'Paranoá':             { lat: -15.7750, lon: -47.5333 },
    'Núcleo Bandeirante':  { lat: -15.8700, lon: -47.9639 },
    'Ceilândia':           { lat: -15.8150, lon: -48.1083 },
    'Guará':               { lat: -15.8333, lon: -47.9833 },
    'Cruzeiro':            { lat: -15.7917, lon: -47.9333 },
    'Samambaia':           { lat: -15.8783, lon: -48.0528 },
    'Santa Maria':         { lat: -16.0194, lon: -48.0069 },
    'São Sebastião':       { lat: -15.9017, lon: -47.7700 },
    'Recanto das Emas':    { lat: -15.9117, lon: -48.0583 },
    'Lago Sul':            { lat: -15.8500, lon: -47.8333 },
    'Riacho Fundo':        { lat: -15.8917, lon: -48.0167 },
    'Lago Norte':          { lat: -15.7333, lon: -47.8500 },
    'Candangolândia':      { lat: -15.8567, lon: -47.9511 },
    'Águas Claras':        { lat: -15.8372, lon: -48.0253 },
    'Riacho Fundo II':     { lat: -15.9083, lon: -48.0500 },
    'Sudoeste/Octogonal':  { lat: -15.7950, lon: -47.9300 },
    'Varjão':              { lat: -15.7117, lon: -47.8700 },
    'Park Way':            { lat: -15.9000, lon: -47.9333 },
    'SCIA/Estrutural':     { lat: -15.7833, lon: -47.9833 },
    'Sobradinho II':       { lat: -15.6333, lon: -47.8167 },
    'Jardim Botânico':     { lat: -15.8667, lon: -47.8000 },
    'Itapoã':              { lat: -15.7417, lon: -47.7667 },
    'SIA':                 { lat: -15.8050, lon: -47.9650 },
    'Vicente Pires':       { lat: -15.8033, lon: -48.0167 },
    'Fercal':              { lat: -15.5917, lon: -47.8667 },
    'Sol Nascente/Pôr do Sol': { lat: -15.8400, lon: -48.1100 },
    'Arniqueira':          { lat: -15.8233, lon: -48.0350 },
};

// Converter coordenadas e mostrar
console.log('Coordenadas das RAs convertidas para SVG:\n');
console.log('RA                        | Lat      | Lon      | SVG X | SVG Y');
console.log('--------------------------|----------|----------|-------|------');

const raSvgCoords = {};
for (const [nome, coords] of Object.entries(raCoords)) {
    const svg = geoToSvg(coords.lat, coords.lon);
    raSvgCoords[nome] = svg;
    console.log(`${nome.padEnd(25)} | ${coords.lat.toFixed(4)} | ${coords.lon.toFixed(4)} | ${String(svg.x).padStart(5)} | ${String(svg.y).padStart(5)}`);
}

// Agora extrair paths do SVG e fazer matching
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

    while ((coordMatch = coordRegex.exec(d)) !== null) {
        sumX += parseInt(coordMatch[1]);
        sumY += parseInt(coordMatch[2]);
        count++;
    }

    paths.push({
        index: index++,
        cx: Math.round(sumX / count),
        cy: Math.round(sumY / count),
        path: d
    });
}

// Encontrar o path mais próximo para cada RA
console.log('\n\nMatching de RAs com paths do SVG:\n');
console.log('RA                        | Esperado X,Y | Path Index | Centro Path | Distância');
console.log('--------------------------|--------------|------------|-------------|----------');

const matching = {};

for (const [nome, svgCoord] of Object.entries(raSvgCoords)) {
    let minDist = Infinity;
    let bestPath = null;

    for (const p of paths) {
        // Verificar se este path já foi atribuído a outra RA
        if (Object.values(matching).includes(p.index)) continue;

        const dist = Math.sqrt((p.cx - svgCoord.x) ** 2 + (p.cy - svgCoord.y) ** 2);
        if (dist < minDist) {
            minDist = dist;
            bestPath = p;
        }
    }

    if (bestPath && minDist < 150) {  // Limite de distância razoável
        matching[nome] = bestPath.index;
        console.log(`${nome.padEnd(25)} | ${String(svgCoord.x).padStart(4)},${String(svgCoord.y).padStart(4)} | ${String(bestPath.index).padStart(10)} | ${String(bestPath.cx).padStart(4)},${String(bestPath.cy).padStart(4)} | ${minDist.toFixed(1)}`);
    } else {
        console.log(`${nome.padEnd(25)} | ${String(svgCoord.x).padStart(4)},${String(svgCoord.y).padStart(4)} | NÃO ENCONTRADO`);
    }
}

// Paths não mapeados
const mappedIndices = new Set(Object.values(matching));
const unmapped = paths.filter(p => !mappedIndices.has(p.index));

console.log(`\n\nPaths não mapeados (${unmapped.length}):`);
unmapped.forEach(p => {
    console.log(`  Index ${p.index}: centro (${p.cx}, ${p.cy})`);
});

// Gerar arquivo TypeScript final
console.log('\n\n=== GERANDO ARQUIVO paths-ras-df.ts ===\n');

// Criar mapeamento index -> nome
const indexToName = {};
for (const [nome, idx] of Object.entries(matching)) {
    indexToName[idx] = nome;
}

// Para paths não mapeados, usar nomes genéricos
unmapped.forEach((p, i) => {
    indexToName[p.index] = `Região ${p.index + 1}`;
});

const result = paths.map(p => {
    const nome = indexToName[p.index] || `Região ${p.index + 1}`;
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
// Mapeamento baseado em coordenadas geográficas
// Gerado em: ${new Date().toISOString()}

export interface PathRA {
  id: string;
  nome: string;
  path: string;
}

export const PATHS_RAS_DF: PathRA[] = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/src/components/charts/paths-ras-df.ts', output);
console.log('✅ Arquivo paths-ras-df.ts regenerado com sucesso!');
console.log(`\nRegiões mapeadas: ${Object.keys(matching).length}/33`);
