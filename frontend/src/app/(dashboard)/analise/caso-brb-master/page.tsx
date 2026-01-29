'use client';

import { useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CasoBrbMasterPage() {
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const appUrl = 'https://inteia-analise-politica-2026.vercel.app/';

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-950 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-amber-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Hub INTEIA
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IA</span>
            </div>
            <span className="text-white font-semibold text-sm">Caso BRB-Master 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-medium border border-red-500/30">
              Monte Carlo + HELENA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            title="Abrir em nova aba"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            title={fullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Loading */}
      {!loaded && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center animate-pulse">
              <span className="text-white font-bold">IA</span>
            </div>
            <p className="text-white/50 text-sm">Carregando análise estratégica...</p>
          </div>
        </div>
      )}

      {/* App embarcado */}
      <iframe
        src={appUrl}
        className={`flex-1 w-full border-0 ${loaded ? 'block' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
        allow="clipboard-read; clipboard-write"
        title="INTEIA - Caso BRB-Master 2026"
      />
    </div>
  );
}
