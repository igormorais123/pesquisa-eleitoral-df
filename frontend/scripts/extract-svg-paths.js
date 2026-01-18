const fs = require('fs');

const svg = fs.readFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/public/mapa-df-ras.svg', 'utf8');

// Extrair paths completos
const pathRegex = /<path fill="rgb\(([^)]+)\)" d="([^"]+)"/g;
let match;
const paths = [];

while ((match = pathRegex.exec(svg)) !== null) {
    paths.push({
        fill: 'rgb(' + match[1].replace(/, /g, ',') + ')',
        d: match[2]
    });
}

console.log(`Total de paths encontrados: ${paths.length}`);

// Mapeamento das RAs baseado na análise visual do mapa original
// A ordem segue a sequência dos paths no SVG
const raNames = [
    'Gama',
    'Santa Maria',
    'Recanto das Emas',
    'Samambaia',
    'Riacho Fundo II',
    'Candangolândia',
    'Núcleo Bandeirante',
    'Park Way',
    'Riacho Fundo',
    'Taguatinga',
    'Guará',
    'Águas Claras',
    'Vicente Pires',
    'Arniqueira',
    'SCIA/Estrutural',
    'SIA',
    'Ceilândia',
    'Sol Nascente/Pôr do Sol',
    'Brazlândia',
    'Cruzeiro',
    'Sudoeste/Octogonal',
    'Lago Sul',
    'Jardim Botânico',
    'Sobradinho',
    'Plano Piloto',
    'Sobradinho II',
    'Lago Norte',
    'São Sebastião',
    'Paranoá',
    'Varjão',
    'Planaltina',
    'Itapoã',
    'Fercal',
    'Santa Maria Sul',
    'Sobradinho Norte'
];

// Gerar o array final
const result = paths.map((p, i) => {
    const nome = raNames[i] || 'RA ' + (i + 1);
    const id = nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return {
        id,
        nome,
        path: p.d
    };
});

// Salvar como módulo TypeScript
const output = `// Auto-generated from mapa-df-ras.svg
// Regiões Administrativas do Distrito Federal

export interface PathRA {
  id: string;
  nome: string;
  path: string;
}

export const PATHS_RAS_DF: PathRA[] = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('C:/Users/igorm/pesquisa-eleitoral-df/frontend/src/components/charts/paths-ras-df.ts', output);
console.log('Arquivo paths-ras-df.ts gerado com sucesso!');
