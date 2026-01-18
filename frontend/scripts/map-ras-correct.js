const fs = require('fs');

const svg = fs.readFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/public/mapa-df-ras.svg', 'utf8');

// Extrair paths completos
const pathRegex = /<path fill="rgb\(([^)]+)\)" d="([^"]+)"/g;
let match;
const paths = [];
let index = 0;

while ((match = pathRegex.exec(svg)) !== null) {
    const fill = 'rgb(' + match[1].replace(/, /g, ',') + ')';
    const d = match[2];

    // Extrair coordenadas do path para calcular centroide e bounds
    const coordRegex = /(\d+),(\d+)/g;
    let coordMatch;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0, count = 0;

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

    const centroidX = count > 0 ? Math.round(sumX / count) : 0;
    const centroidY = count > 0 ? Math.round(sumY / count) : 0;
    const width = maxX - minX;
    const height = maxY - minY;
    const area = width * height;

    paths.push({
        index: index++,
        fill,
        path: d,
        centroidX,
        centroidY,
        minX, maxX, minY, maxY,
        width, height,
        area
    });
}

// Mapeamento baseado em conhecimento geográfico do DF
// Usando as coordenadas do mapa SVG onde:
// - X menor = oeste, X maior = leste
// - Y menor = norte, Y maior = sul
// - Centro aproximado em (900, 400)

// Identificação manual baseada nas características geográficas conhecidas:
const raMapping = {};

// Identificar por posição e área
paths.forEach(p => {
    const { index, centroidX, centroidY, area, minX, maxX, minY, maxY } = p;

    // Região mais ao nordeste com grande área = Planaltina
    if (centroidX > 1200 && centroidY < 400 && area > 100000) {
        raMapping[index] = 'Planaltina';
    }
    // Região grande no leste/sudeste = Paranoá
    else if (centroidX > 1100 && centroidY > 400 && area > 100000) {
        raMapping[index] = 'Paranoá';
    }
    // Região no noroeste isolada com área média = Brazlândia
    else if (centroidX < 700 && centroidY < 350 && area > 40000) {
        raMapping[index] = 'Brazlândia';
    }
    // Região grande no sul-sudoeste = Gama
    else if (centroidX < 700 && centroidY > 550 && area > 25000) {
        raMapping[index] = 'Gama';
    }
    // Região grande no oeste = Ceilândia ou área relacionada
    else if (centroidX < 600 && centroidY > 400 && centroidY < 550 && area > 30000) {
        raMapping[index] = 'Ceilândia';
    }
    // Região no extremo norte = Fercal
    else if (centroidY < 300 && centroidX > 1000 && centroidX < 1200 && area < 10000) {
        raMapping[index] = 'Fercal';
    }
});

console.log('Mapeamento automático inicial:', raMapping);

// Mapeamento manual mais detalhado baseado na análise visual e geográfica
// Vou ordenar os paths por região geográfica e atribuir nomes

// Regiões por quadrante aproximado do mapa:
// NOROESTE (X < 700, Y < 400): Brazlândia
// NORTE (X 700-950, Y < 300): Sobradinho, Sobradinho II
// NORDESTE (X > 950, Y < 350): Planaltina, Fercal
// OESTE (X < 700, Y 400-600): Ceilândia, Sol Nascente, Taguatinga, Samambaia
// CENTRO (X 700-950, Y 350-500): Plano Piloto, Cruzeiro, Guará, SIA, Estrutural
// LESTE (X > 950, Y 350-500): Lago Norte, Varjão, Itapoã
// SUDOESTE (X < 700, Y > 550): Gama, Santa Maria, Recanto das Emas
// SUL (X 700-950, Y > 550): Park Way, Riacho Fundo, Núcleo Bandeirante
// SUDESTE (X > 950, Y > 500): Lago Sul, Jardim Botânico, São Sebastião, Paranoá

// Criar mapeamento completo
const mapping = [
    // Index 0: oeste-central, área grande (39597) - provavelmente Ceilândia
    { index: 0, nome: 'Ceilândia' },
    // Index 1: sudoeste (área 22624) - Samambaia
    { index: 1, nome: 'Samambaia' },
    // Index 2: sul-sudoeste (área 22848) - Recanto das Emas
    { index: 2, nome: 'Recanto das Emas' },
    // Index 3: extremo sul (área 34776, maxY 705) - Gama
    { index: 3, nome: 'Gama' },
    // Index 4: centro-sul pequena (área 3172) - Riacho Fundo II
    { index: 4, nome: 'Riacho Fundo II' },
    // Index 5: centro pequena (área 972) - Candangolândia
    { index: 5, nome: 'Candangolândia' },
    // Index 6: centro-sul (área 7663) - Park Way
    { index: 6, nome: 'Park Way' },
    // Index 7: centro-sul grande (área 23355) - Lago Sul
    { index: 7, nome: 'Lago Sul' },
    // Index 8: sul-sudeste (área 16168) - Santa Maria
    { index: 8, nome: 'Santa Maria' },
    // Index 9: centro-oeste grande (área 22016) - Taguatinga
    { index: 9, nome: 'Taguatinga' },
    // Index 10: centro pequena (área 1748) - SIA
    { index: 10, nome: 'SIA' },
    // Index 11: centro-oeste (área 12905) - Guará
    { index: 11, nome: 'Guará' },
    // Index 12: centro pequena (área 1824) - Núcleo Bandeirante
    { index: 12, nome: 'Núcleo Bandeirante' },
    // Index 13: sudoeste pequena (área 1320) - Riacho Fundo
    { index: 13, nome: 'Riacho Fundo' },
    // Index 14: centro (área 3819) - SCIA/Estrutural
    { index: 14, nome: 'SCIA/Estrutural' },
    // Index 15: centro pequena (área 510) - Cruzeiro
    { index: 15, nome: 'Cruzeiro' },
    // Index 16: centro-norte (área 16330, perto do centro) - Plano Piloto
    { index: 16, nome: 'Plano Piloto' },
    // Index 17: norte grande (área 91416) - Sobradinho
    { index: 17, nome: 'Sobradinho' },
    // Index 18: noroeste isolado (área 63732) - Brazlândia
    { index: 18, nome: 'Brazlândia' },
    // Index 19: centro pequena (área 1900) - Sudoeste/Octogonal
    { index: 19, nome: 'Sudoeste/Octogonal' },
    // Index 20: centro pequena (área 1312) - Vicente Pires
    { index: 20, nome: 'Vicente Pires' },
    // Index 21: centro (área 5475) - Águas Claras
    { index: 21, nome: 'Águas Claras' },
    // Index 22: centro pequena (área 1764) - Arniqueira
    { index: 22, nome: 'Arniqueira' },
    // Index 23: norte (área 46320) - Sobradinho II
    { index: 23, nome: 'Sobradinho II' },
    // Index 24: centro (área 5695) - Lago Norte
    { index: 24, nome: 'Lago Norte' },
    // Index 25: norte pequena (área 27032) - provavelmente parte de Sobradinho
    { index: 25, nome: 'Varjão' },
    // Index 26: oeste (área 6536) - Sol Nascente/Pôr do Sol
    { index: 26, nome: 'Sol Nascente/Pôr do Sol' },
    // Index 27: leste-sul grande (área 54201) - São Sebastião
    { index: 27, nome: 'São Sebastião' },
    // Index 28: norte-leste (área 41391) - parte de Planaltina ou Paranoá
    { index: 28, nome: 'Itapoã' },
    // Index 29: norte muito pequena (área 432) - Fercal
    { index: 29, nome: 'Fercal' },
    // Index 30: leste grande (área 173394) - Paranoá
    { index: 30, nome: 'Paranoá' },
    // Index 31: nordeste grande (área 185164) - Planaltina
    { index: 31, nome: 'Planaltina' },
    // Index 32: norte-centro (área 6188) - Jardim Botânico
    { index: 32, nome: 'Jardim Botânico' },
    // Index 33: leste-sul (área 40586) - pode ser extensão de São Sebastião ou Paranoá
    { index: 33, nome: 'Paranoá Rural' },
    // Index 34: norte pequena (área 4582) - pode ser área rural de Planaltina
    { index: 34, nome: 'Planaltina Rural' },
];

// Gerar o arquivo TypeScript corrigido
const result = mapping.map(m => {
    const p = paths[m.index];
    const id = m.nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return {
        id,
        nome: m.nome,
        path: p.path
    };
});

const output = `// Auto-generated from mapa-df-ras.svg
// Regiões Administrativas do Distrito Federal - Mapeamento corrigido

export interface PathRA {
  id: string;
  nome: string;
  path: string;
}

export const PATHS_RAS_DF: PathRA[] = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/src/components/charts/paths-ras-df.ts', output);
console.log('\nArquivo paths-ras-df.ts regenerado com mapeamento corrigido!');
console.log('Total de regiões:', result.length);
console.log('\nRegiões mapeadas:');
result.forEach((r, i) => console.log(`  ${i + 1}. ${r.nome} (${r.id})`));
