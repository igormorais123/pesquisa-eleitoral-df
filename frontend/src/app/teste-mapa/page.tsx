'use client';

/**
 * Página de teste do mapa - SEM autenticação e SEM dependências
 * Para verificar visualmente se as regiões estão corretas
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import dinâmico do componente para evitar problemas de SSR
const MapaCalorDF = dynamic(
  () => import('@/components/charts/MapaCalorDF').then(mod => mod.MapaCalorDF),
  { ssr: false, loading: () => <div className="h-[700px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Carregando mapa...</div> }
);

// Lista completa das RAs do DF
const REGIOES_DF = [
  'Plano Piloto', 'Gama', 'Taguatinga', 'Brazlândia', 'Sobradinho',
  'Planaltina', 'Paranoá', 'Núcleo Bandeirante', 'Ceilândia', 'Guará',
  'Cruzeiro', 'Samambaia', 'Santa Maria', 'São Sebastião', 'Recanto das Emas',
  'Lago Sul', 'Riacho Fundo', 'Lago Norte', 'Candangolândia', 'Águas Claras',
  'Riacho Fundo II', 'Sudoeste/Octogonal', 'Varjão', 'Park Way', 'SCIA/Estrutural',
  'Sobradinho II', 'Jardim Botânico', 'Itapoã', 'SIA', 'Vicente Pires',
  'Fercal', 'Sol Nascente/Pôr do Sol', 'Arniqueira'
];

// Gerar dados de exemplo com cada região tendo valor diferente
const dadosMapa = REGIOES_DF.map((regiao, index) => ({
  regiao,
  valor: Math.min(100, 20 + (index * 2.5)),
  label: regiao,
}));

export default function TesteMapaPage() {
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string | null>(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Teste do Mapa Eleitoral do DF
        </h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          Página de teste para verificar se as regiões administrativas estão corretas no mapa.
          Clique em uma região para ver o nome.
        </p>

        {regiaoSelecionada && (
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <strong>Região selecionada:</strong> {regiaoSelecionada}
          </div>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '1rem' }}>
          <MapaCalorDF
            dados={dadosMapa}
            titulo="Mapa de Teste - Regiões Administrativas do DF"
            subtitulo="Clique em uma região para verificar se está correta"
            escala="azul"
            altura={700}
            onRegiaoClick={(regiao: string) => setRegiaoSelecionada(regiao)}
            mostrarLago={true}
            mostrarContornoPlano={true}
            mostrarNomesCidades={true}
            mostrarPontosReferencia={true}
            nivelDetalhe="completo"
          />
        </div>

        <div style={{ marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            Lista de Regiões ({REGIOES_DF.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
            {REGIOES_DF.map((regiao, i) => (
              <div
                key={regiao}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  backgroundColor: regiaoSelecionada === regiao ? '#3b82f6' : '#f3f4f6',
                  color: regiaoSelecionada === regiao ? 'white' : 'inherit'
                }}
                onClick={() => setRegiaoSelecionada(regiao)}
              >
                {i + 1}. {regiao}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
