'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Users,
  BarChart2,
  FileText,
  Home,
  X,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useEleitoresStore } from '@/stores/eleitores-store';
import type { Eleitor } from '@/types';

interface SearchResult {
  id: string;
  type: 'eleitor' | 'pagina' | 'acao';
  titulo: string;
  subtitulo?: string;
  href?: string;
  action?: () => void;
  icon: React.ElementType;
}

// Páginas disponíveis para navegação
const PAGINAS: SearchResult[] = [
  { id: 'home', type: 'pagina', titulo: 'Dashboard', subtitulo: 'Página inicial com resumo', href: '/', icon: Home },
  { id: 'eleitores', type: 'pagina', titulo: 'Eleitores', subtitulo: 'Gerenciar perfis de eleitores', href: '/eleitores', icon: Users },
  { id: 'entrevistas', type: 'pagina', titulo: 'Entrevistas', subtitulo: 'Criar e gerenciar entrevistas', href: '/entrevistas', icon: FileText },
  { id: 'resultados', type: 'pagina', titulo: 'Resultados', subtitulo: 'Análise de resultados', href: '/resultados', icon: BarChart2 },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { eleitores } = useEleitoresStore();

  // Buscar quando o texto mudar
  useEffect(() => {
    if (!busca.trim()) {
      setResultados(PAGINAS);
      setIndiceAtivo(0);
      return;
    }

    const termoBusca = busca.toLowerCase().trim();
    const resultadosBusca: SearchResult[] = [];

    // Buscar páginas
    PAGINAS.forEach((pagina) => {
      if (
        pagina.titulo.toLowerCase().includes(termoBusca) ||
        pagina.subtitulo?.toLowerCase().includes(termoBusca)
      ) {
        resultadosBusca.push(pagina);
      }
    });

    // Buscar eleitores (limitar a 10 resultados)
    const eleitoresEncontrados = eleitores
      .filter((e) => {
        const campos = [
          e.nome,
          e.regiao_administrativa,
          e.ocupacao_vinculo,
          e.orientacao_politica,
        ].join(' ').toLowerCase();
        return campos.includes(termoBusca);
      })
      .slice(0, 10)
      .map((e): SearchResult => ({
        id: e.id,
        type: 'eleitor',
        titulo: e.nome,
        subtitulo: `${e.regiao_administrativa} • ${e.idade} anos • ${e.ocupacao_vinculo}`,
        href: `/eleitores?selecionado=${e.id}`,
        icon: User,
      }));

    resultadosBusca.push(...eleitoresEncontrados);
    setResultados(resultadosBusca);
    setIndiceAtivo(0);
  }, [busca, eleitores]);

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setBusca('');
    }
  }, [isOpen]);

  // Navegar com teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceAtivo((prev) => Math.min(prev + 1, resultados.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceAtivo((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && resultados[indiceAtivo]) {
        e.preventDefault();
        const resultado = resultados[indiceAtivo];
        if (resultado.href) {
          router.push(resultado.href);
          onClose();
        } else if (resultado.action) {
          resultado.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [resultados, indiceAtivo, router, onClose]
  );

  // Clicar em resultado
  const handleResultadoClick = (resultado: SearchResult) => {
    if (resultado.href) {
      router.push(resultado.href);
      onClose();
    } else if (resultado.action) {
      resultado.action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal de busca */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Input de busca */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar eleitores, páginas..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Resultados */}
          <div className="max-h-[400px] overflow-y-auto">
            {resultados.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado para &quot;{busca}&quot;
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Agrupar por tipo */}
                {resultados.some((r) => r.type === 'pagina') && (
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Páginas
                    </span>
                  </div>
                )}
                {resultados
                  .filter((r) => r.type === 'pagina')
                  .map((resultado, index) => {
                    const Icon = resultado.icon;
                    const globalIndex = resultados.findIndex((r) => r.id === resultado.id);
                    return (
                      <button
                        key={resultado.id}
                        onClick={() => handleResultadoClick(resultado)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          globalIndex === indiceAtivo
                            ? 'bg-primary/10 text-foreground'
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          globalIndex === indiceAtivo ? 'bg-primary/20' : 'bg-secondary'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            globalIndex === indiceAtivo ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{resultado.titulo}</p>
                          {resultado.subtitulo && (
                            <p className="text-xs text-muted-foreground truncate">
                              {resultado.subtitulo}
                            </p>
                          )}
                        </div>
                        {globalIndex === indiceAtivo && (
                          <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}

                {/* Eleitores */}
                {resultados.some((r) => r.type === 'eleitor') && (
                  <div className="px-3 py-1.5 mt-2 border-t border-border">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Eleitores
                    </span>
                  </div>
                )}
                {resultados
                  .filter((r) => r.type === 'eleitor')
                  .map((resultado) => {
                    const Icon = resultado.icon;
                    const globalIndex = resultados.findIndex((r) => r.id === resultado.id);
                    return (
                      <button
                        key={resultado.id}
                        onClick={() => handleResultadoClick(resultado)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          globalIndex === indiceAtivo
                            ? 'bg-primary/10 text-foreground'
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          globalIndex === indiceAtivo ? 'bg-primary/20' : 'bg-secondary'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            globalIndex === indiceAtivo ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{resultado.titulo}</p>
                          {resultado.subtitulo && (
                            <p className="text-xs text-muted-foreground truncate">
                              {resultado.subtitulo}
                            </p>
                          )}
                        </div>
                        {globalIndex === indiceAtivo && (
                          <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Footer com dicas */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-secondary/30">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">Enter</kbd>
                selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">Esc</kbd>
                fechar
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Command className="w-3 h-3" />
              <span>K para abrir</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
