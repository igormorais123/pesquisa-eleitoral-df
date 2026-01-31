'use client';

import { StatusOraculo } from '@/services/whatsapp-api';

interface MetricasWhatsAppProps {
  status: StatusOraculo | null;
  carregando: boolean;
}

function IndicadorStatus({ ativo, label }: { ativo: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          ativo ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
        }`}
      />
      <span className="text-sm text-muted-foreground">
        {ativo ? 'Conectado' : 'Desconectado'}
      </span>
    </div>
  );
}

export function MetricasWhatsApp({ status, carregando }: MetricasWhatsAppProps) {
  if (carregando) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* WhatsApp Status */}
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.115 1.521 5.847L.053 23.52l5.828-1.523A11.949 11.949 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.796 9.796 0 01-5.29-1.544l-.379-.226-3.935 1.03 1.05-3.83-.247-.394A9.796 9.796 0 012.18 12 9.82 9.82 0 0112 2.18 9.82 9.82 0 0121.82 12 9.82 9.82 0 0112 21.82z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-muted-foreground">WhatsApp</span>
        </div>
        <IndicadorStatus
          ativo={status?.whatsapp_configurado ?? false}
          label="WhatsApp"
        />
      </div>

      {/* Redis Status */}
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14a9 3 0 0 0 18 0V5" />
              <path d="M3 12a9 3 0 0 0 18 0" />
            </svg>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Redis</span>
        </div>
        <IndicadorStatus
          ativo={status?.redis_conectado ?? false}
          label="Redis"
        />
      </div>

      {/* Contatos Ativos */}
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Contatos Ativos</span>
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {status?.contatos_ativos ?? 0}
        </p>
      </div>

      {/* Mensagens Hoje */}
      <div className="rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Mensagens Hoje</span>
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {status?.mensagens_hoje ?? 0}
        </p>
      </div>
    </div>
  );
}
