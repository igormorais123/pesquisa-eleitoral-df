'use client';

/**
 * Componente de Nuvem de Palavras
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import dinâmico para evitar SSR issues
const ReactWordcloud = dynamic(() => import('react-wordcloud'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface PalavraFrequente {
  text: string;
  value: number;
}

interface WordCloudProps {
  texto?: string;
  palavras?: PalavraFrequente[];
  altura?: number;
  cores?: string[];
  maxPalavras?: number;
}

// Stopwords em português brasileiro
const STOPWORDS_PT = new Set([
  'a', 'o', 'e', 'é', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'não', 'que',
  'os', 'as', 'dos', 'das', 'no', 'na', 'por', 'mais', 'se', 'como', 'mas', 'foi',
  'ao', 'ele', 'ela', 'entre', 'quando', 'muito', 'sem', 'mesmo', 'aos', 'ter', 'seus',
  'sua', 'suas', 'seu', 'ou', 'já', 'também', 'só', 'pelo', 'pela', 'até', 'isso',
  'isto', 'esse', 'essa', 'esses', 'essas', 'este', 'esta', 'estes', 'estas', 'aquele',
  'aquela', 'aqueles', 'aquelas', 'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes',
  'meu', 'minha', 'teu', 'tua', 'nosso', 'nossa', 'vosso', 'vossa', 'dele', 'dela',
  'deles', 'delas', 'nele', 'nela', 'neles', 'nelas', 'ser', 'estar', 'ter', 'haver',
  'fazer', 'ir', 'vir', 'ver', 'dar', 'poder', 'dever', 'querer', 'saber', 'falar',
  'porque', 'então', 'ainda', 'agora', 'sempre', 'nunca', 'às', 'bem', 'sim',
  'assim', 'onde', 'quem', 'qual', 'quais', 'todo', 'toda', 'todos', 'todas',
  'cada', 'outro', 'outra', 'outros', 'outras', 'algum', 'alguma', 'alguns', 'algumas',
  'nenhum', 'nenhuma', 'nenhuns', 'nenhumas', 'tanto', 'tanta', 'tantos', 'tantas',
  'quanto', 'quanta', 'quantos', 'quantas', 'tal', 'tais', 'coisa', 'coisas',
  'sobre', 'contra', 'após', 'ante', 'sob', 'perante', 'desde', 'durante',
  'mediante', 'segundo', 'conforme', 'consoante', 'através', 'acima', 'abaixo',
  'fora', 'dentro', 'perto', 'longe', 'aí', 'ali', 'aqui', 'lá', 'cá',
  'etc', 'né', 'acho', 'gente', 'coisa', 'tipo', 'tá', 'vai', 'vou', 'tem',
]);

// Extrair palavras de um texto
function extrairPalavras(texto: string, maxPalavras: number = 50): PalavraFrequente[] {
  // Normalizar texto
  const textoNormalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos para comparação
    .replace(/[^\w\s]/g, ' ')        // Remove pontuação
    .replace(/\s+/g, ' ')            // Normaliza espaços
    .trim();

  // Contar frequência
  const frequencia: Record<string, number> = {};
  const palavrasOriginais: Record<string, string> = {};

  texto
    .toLowerCase()
    .replace(/[^\w\sáàãâéêíóôõúç]/g, ' ')
    .split(/\s+/)
    .filter((palavra) => {
      const palavraNorm = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return palavra.length > 2 && !STOPWORDS_PT.has(palavraNorm) && !STOPWORDS_PT.has(palavra);
    })
    .forEach((palavra) => {
      const palavraNorm = palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      frequencia[palavraNorm] = (frequencia[palavraNorm] || 0) + 1;
      // Guardar versão com acento
      if (!palavrasOriginais[palavraNorm]) {
        palavrasOriginais[palavraNorm] = palavra;
      }
    });

  // Ordenar por frequência e pegar top N
  return Object.entries(frequencia)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPalavras)
    .map(([palavraNorm, value]) => ({
      text: palavrasOriginais[palavraNorm] || palavraNorm,
      value,
    }));
}

// Cores padrão do tema escuro
const CORES_PADRAO = [
  '#818cf8', // Indigo-400
  '#34d399', // Emerald-400
  '#f472b6', // Pink-400
  '#60a5fa', // Blue-400
  '#fbbf24', // Amber-400
  '#a78bfa', // Violet-400
  '#2dd4bf', // Teal-400
  '#fb923c', // Orange-400
];

export function WordCloud({
  texto,
  palavras,
  altura = 300,
  cores = CORES_PADRAO,
  maxPalavras = 50,
}: WordCloudProps) {
  // Processar palavras
  const palavrasProcessadas = useMemo(() => {
    if (palavras && palavras.length > 0) {
      return palavras;
    }
    if (texto) {
      return extrairPalavras(texto, maxPalavras);
    }
    return [];
  }, [texto, palavras, maxPalavras]);

  // Configurações da nuvem
  const options = useMemo(
    () => ({
      colors: cores,
      enableTooltip: true,
      deterministic: true,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: [14, 60] as [number, number],
      fontStyle: 'normal',
      fontWeight: 'bold',
      padding: 2,
      rotations: 2,
      rotationAngles: [0, 0] as [number, number],
      scale: 'sqrt' as const,
      spiral: 'archimedean' as const,
      transitionDuration: 500,
    }),
    [cores]
  );

  // Callbacks
  const callbacks = useMemo(
    () => ({
      getWordTooltip: (word: { text: string; value: number }) =>
        `${word.text}: ${word.value} ocorrências`,
    }),
    []
  );

  if (palavrasProcessadas.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-secondary/30 rounded-lg"
        style={{ height: altura }}
      >
        <p className="text-muted-foreground text-sm">Nenhuma palavra para exibir</p>
      </div>
    );
  }

  return (
    <div style={{ height: altura, width: '100%' }}>
      <ReactWordcloud words={palavrasProcessadas} options={options} callbacks={callbacks} />
    </div>
  );
}

// Componente para extrair palavras de respostas de entrevista
export function WordCloudRespostas({
  respostas,
  altura = 300,
}: {
  respostas: Array<{
    respostas: Array<{
      pergunta_id: string;
      resposta: string | number | string[];
    }>;
  }>;
  altura?: number;
}) {
  const texto = useMemo(() => {
    return respostas
      .flatMap((r) =>
        r.respostas.map((resp) => {
          if (Array.isArray(resp.resposta)) {
            return resp.resposta.join(' ');
          }
          return String(resp.resposta);
        })
      )
      .join(' ');
  }, [respostas]);

  return <WordCloud texto={texto} altura={altura} />;
}

export default WordCloud;
