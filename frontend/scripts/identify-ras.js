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

    // Extrair coordenadas do path para calcular centroide aproximado
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
        centroidX,
        centroidY,
        minX, maxX, minY, maxY,
        width, height,
        area
    });
}

console.log('Total de paths:', paths.length);
console.log('\nAnálise de posição de cada path:\n');

// Ordenar por posição Y (norte a sul) e depois X (oeste a leste)
const sortedByPosition = [...paths].sort((a, b) => a.centroidY - b.centroidY);

// Mapeamento geográfico conhecido do DF:
// Norte: Planaltina, Sobradinho, Sobradinho II, Fercal
// Centro-Norte: Lago Norte, Varjão, Paranoá
// Centro: Plano Piloto, Cruzeiro, Sudoeste/Octogonal, SIA, SCIA/Estrutural
// Centro-Oeste: Taguatinga, Ceilândia, Águas Claras, Vicente Pires, Sol Nascente
// Centro-Sul: Guará, Núcleo Bandeirante, Candangolândia, Riacho Fundo
// Sul: Gama, Santa Maria, Recanto das Emas, Samambaia
// Leste: Lago Sul, Jardim Botânico, São Sebastião, Itapoã

// Informações conhecidas sobre posição das RAs:
// - Plano Piloto: centro, formato de avião
// - Lago Sul: grande área ao sul do lago
// - Lago Norte: ao norte do lago, área menor
// - Ceilândia: grande área no oeste
// - Planaltina: grande área no nordeste
// - Gama: sul
// - Brazlândia: noroeste isolado

console.log('INDEX | CX  | CY  | AREA    | MIN-MAX X  | MIN-MAX Y  | COLOR');
console.log('------|-----|-----|---------|------------|------------|------');

paths.forEach(p => {
    console.log(
        `${String(p.index).padStart(5)} | ${String(p.centroidX).padStart(3)} | ${String(p.centroidY).padStart(3)} | ${String(p.area).padStart(7)} | ${p.minX}-${p.maxX} | ${p.minY}-${p.maxY} | ${p.fill}`
    );
});

// Identificar regiões por características geográficas conhecidas
console.log('\n\n=== IDENTIFICAÇÃO POR CARACTERÍSTICAS ===\n');

// A maior área geralmente é Planaltina ou Ceilândia
const byArea = [...paths].sort((a, b) => b.area - a.area);
console.log('Maiores áreas (provavelmente Planaltina, Ceilândia, Gama):');
byArea.slice(0, 5).forEach(p => console.log(`  Index ${p.index}: área ${p.area}, centro (${p.centroidX}, ${p.centroidY})`));

// Mais ao norte (menor Y)
const byNorth = [...paths].sort((a, b) => a.minY - b.minY);
console.log('\nMais ao norte (provavelmente Planaltina, Sobradinho, Fercal, Brazlândia):');
byNorth.slice(0, 5).forEach(p => console.log(`  Index ${p.index}: minY ${p.minY}, centro (${p.centroidX}, ${p.centroidY})`));

// Mais ao sul (maior Y)
const bySouth = [...paths].sort((a, b) => b.maxY - a.maxY);
console.log('\nMais ao sul (provavelmente Gama, Santa Maria):');
bySouth.slice(0, 5).forEach(p => console.log(`  Index ${p.index}: maxY ${p.maxY}, centro (${p.centroidX}, ${p.centroidY})`));

// Mais a oeste (menor X)
const byWest = [...paths].sort((a, b) => a.minX - b.minX);
console.log('\nMais a oeste (provavelmente Brazlândia, Ceilândia, Sol Nascente):');
byWest.slice(0, 5).forEach(p => console.log(`  Index ${p.index}: minX ${p.minX}, centro (${p.centroidX}, ${p.centroidY})`));

// Mais a leste (maior X)
const byEast = [...paths].sort((a, b) => b.maxX - a.maxX);
console.log('\nMais a leste (provavelmente Planaltina, Paranoá, São Sebastião):');
byEast.slice(0, 5).forEach(p => console.log(`  Index ${p.index}: maxX ${p.maxX}, centro (${p.centroidX}, ${p.centroidY})`));

// Centro do mapa (onde está o Plano Piloto)
// O centro do viewport é aproximadamente (978, 412) baseado em viewBox "482 119 993 587"
// Centro real: 482 + 993/2 = 978, 119 + 587/2 = 412
const centerX = 978;
const centerY = 412;

const byCenter = [...paths].sort((a, b) => {
    const distA = Math.sqrt((a.centroidX - centerX)**2 + (a.centroidY - centerY)**2);
    const distB = Math.sqrt((b.centroidX - centerX)**2 + (b.centroidY - centerY)**2);
    return distA - distB;
});

console.log(`\nMais próximo do centro (${centerX}, ${centerY}) - provavelmente Plano Piloto, Guará, SIA:`);
byCenter.slice(0, 8).forEach(p => {
    const dist = Math.sqrt((p.centroidX - centerX)**2 + (p.centroidY - centerY)**2);
    console.log(`  Index ${p.index}: distância ${Math.round(dist)}, centro (${p.centroidX}, ${p.centroidY}), área ${p.area}`);
});
