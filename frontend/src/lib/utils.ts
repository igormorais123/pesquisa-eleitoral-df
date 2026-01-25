import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatar número como moeda brasileira
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Formatar número como dólar
export function formatarDolar(valor: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

// Formatar número com separador de milhares
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor);
}

// Formatar percentual
export function formatarPercentual(valor: number, casasDecimais = 1): string {
  return `${valor.toFixed(casasDecimais)}%`;
}

// Formatar data
export function formatarData(data: string | Date): string {
  const d = new Date(data);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

// Formatar data e hora
export function formatarDataHora(data: string | Date): string {
  const d = new Date(data);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Formatar data relativa (há X minutos, etc)
export function formatarDataRelativa(data: string | Date): string {
  const d = new Date(data);
  const agora = new Date();
  const diffMs = agora.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
  if (diffHoras < 24) return `há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
  if (diffDias < 7) return `há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;

  return formatarData(d);
}

// Truncar texto
export function truncar(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.slice(0, maxLength - 3) + '...';
}

// Capitalizar primeira letra
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Capitalizar todas as palavras
export function capitalizarPalavras(texto: string): string {
  return texto
    .split(' ')
    .map((palavra) => capitalizar(palavra))
    .join(' ');
}

// Gerar iniciais do nome
export function gerarIniciais(nome: string): string {
  const partes = nome.split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

// Gerar cor baseada em string (para avatares)
export function gerarCorDoNome(nome: string): string {
  const cores = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }

  return cores[Math.abs(hash) % cores.length];
}

// Gerar URL do avatar DiceBear
export function gerarAvatarUrl(nome: string, seed?: string): string {
  const s = seed || nome;
  return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(s)}`;
}

// Calcular custo de tokens
export function calcularCustoTokens(
  tokensEntrada: number,
  tokensSaida: number,
  modelo: 'opus' | 'sonnet' | 'haiku'
): number {
  const precos = {
    opus: { entrada: 15, saida: 75 },
    sonnet: { entrada: 3, saida: 15 },
    haiku: { entrada: 0.25, saida: 1.25 },
  };

  const preco = precos[modelo];
  const custoEntrada = (tokensEntrada / 1_000_000) * preco.entrada;
  const custoSaida = (tokensSaida / 1_000_000) * preco.saida;

  return custoEntrada + custoSaida;
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Cores por categoria
export const CORES_CLUSTER = {
  G1_alta: '#22c55e',
  G2_media_alta: '#84cc16',
  G3_media_baixa: '#eab308',
  G4_baixa: '#f97316',
};

export const CORES_ORIENTACAO_POLITICA = {
  esquerda: '#ef4444',
  'centro-esquerda': '#f97316',
  centro: '#a855f7',
  'centro-direita': '#3b82f6',
  direita: '#1d4ed8',
};

export const CORES_GENERO = {
  masculino: '#3b82f6',
  feminino: '#ec4899',
};

export const CORES_RELIGIAO = {
  catolica: '#eab308',
  evangelica: '#8b5cf6',
  espirita: '#06b6d4',
  sem_religiao: '#6b7280',
  umbanda_candomble: '#10b981',
  outras: '#78716c',
};
