'use client';

import React from 'react';

export interface DadoRegiao {
  regiao: string;
  nome?: string; // Alias para compatibilidade
  valor: number;
  label?: string;
  variacao?: number;
}

export interface RegiaoPath {
  id: string;
  nome: string;
  path: string;
}

export const REGIOES_DF: Record<string, number> = {
  'Plano Piloto': 8,
  'Ceilandia': 15,
  'Taguatinga': 10,
  'Samambaia': 8,
};

interface MapaCalorDFProps {
  dados: DadoRegiao[];
  titulo?: string;
  escala?: 'verde_vermelho' | 'azul_vermelho' | 'gradiente';
  formatarValor?: (valor: number) => string;
}

export function MapaCalorDF({ dados, titulo, formatarValor }: MapaCalorDFProps) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p className="text-lg font-medium mb-4">{titulo || 'Mapa de Calor do DF'}</p>
      <div className="grid grid-cols-2 gap-2">
        {dados.map((d) => (
          <div key={d.regiao} className="flex justify-between text-sm p-2 bg-secondary/50 rounded">
            <span>{d.regiao}</span>
            <span className="font-medium">
              {formatarValor ? formatarValor(d.valor) : d.valor.toFixed(1) + '%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MapaComparacaoProps {
  dadosAntes: DadoRegiao[];
  dadosDepois: DadoRegiao[];
  titulo?: string;
}

export function MapaComparacao({ titulo }: MapaComparacaoProps) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>{titulo || 'Comparacao Regional'}</p>
    </div>
  );
}

interface MapaMultiplasMetricasProps {
  metricas: { nome: string; dados: DadoRegiao[] }[];
}

export function MapaMultiplasMetricas({ metricas }: MapaMultiplasMetricasProps) {
  return (
    <div className="p-8 text-center text-muted-foreground">
      <p>Multiplas Metricas</p>
    </div>
  );
}
