'use client';

/**
 * Citações Representativas
 * Exibe citações que melhor representam cada grupo de eleitores
 * Pesquisa Eleitoral DF 2026
 */

import { useMemo, useState } from 'react';
import { Quote, Filter, User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Eleitor } from '@/types';
import { cn } from '@/lib/utils';

interface CitacoesRepresentativasProps {
  eleitores: Eleitor[];
  respostas?: Array<{
    eleitor_id: string;
    resposta: string;
    pergunta?: string;
  }>;
}

interface Citacao {
  id: string;
  texto: string;
  eleitor: {
    nome: string;
    idade: number;
    profissao: string;
    regiao: string;
    orientacao: string;
  };
  categoria: string;
  sentimento?: 'positivo' | 'negativo' | 'neutro';
}

type CategoriaFiltro = 'todas' | 'apoiadores' | 'oposicao' | 'indecisos' | 'jovens' | 'idosos';

// Citações modelo geradas a partir do perfil
const TEMPLATES_CITACOES: Record<string, string[]> = {
  apoiador_forte: [
    'Não tenho dúvidas. É ele e ponto final. O resto é tudo a mesma coisa.',
    'Quem critica não sabe o que fala. Vai lá e faz melhor então!',
    'Economia melhorou, segurança melhorou. O que mais querem?',
  ],
  apoiador_moderado: [
    'Não é perfeito, mas é melhor que o que tinha antes.',
    'Concordo em várias coisas, mas algumas declarações são desnecessárias.',
    'No final das contas, o que importa é resultado.',
  ],
  neutro: [
    'Sinceramente? Nenhum dos dois me convence.',
    'Estou esperando pra ver o que cada um vai propor de verdade.',
    'Político é tudo igual, só muda a cor da roupa.',
  ],
  critico_moderado: [
    'Tem coisas que são inaceitáveis, mas entendo quem apoia.',
    'Prefiro mil vezes outra opção, mas não vou brigar por isso.',
    'A gente precisa de mais opções, não só esses dois.',
  ],
  critico_forte: [
    'É inadmissível o que está acontecendo. Não dá pra aceitar.',
    'Quem ainda apoia não está prestando atenção.',
    'Precisamos urgentemente de mudança. Assim não dá mais.',
  ],
  jovem_engajado: [
    'Nossa geração precisa se mobilizar. O futuro é agora.',
    'Não vou aceitar herdar um país destruído.',
    'A política afeta tudo. Quem ignora, sofre as consequências.',
  ],
  idoso_pragmatico: [
    'Já vi muita coisa nessa vida. Político promete e não cumpre.',
    'O importante é ter paz e segurança pra família.',
    'Quero ver quem vai cuidar da minha aposentadoria.',
  ],
};

export function CitacoesRepresentativas({ eleitores, respostas }: CitacoesRepresentativasProps) {
  const [filtro, setFiltro] = useState<CategoriaFiltro>('todas');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const citacoesPorPagina = 3;

  const citacoes = useMemo(() => {
    const resultado: Citacao[] = [];

    // Se temos respostas reais, usar elas
    if (respostas && respostas.length > 0) {
      for (const resposta of respostas) {
        const eleitor = eleitores.find(e => e.id === resposta.eleitor_id);
        if (!eleitor || !resposta.resposta || resposta.resposta.length < 20) continue;

        const posicao = eleitor.posicao_bolsonaro?.toLowerCase() ?? 'neutro';
        let categoria = 'indecisos';
        if (posicao.includes('apoiador')) categoria = 'apoiadores';
        else if (posicao.includes('critico')) categoria = 'oposicao';

        resultado.push({
          id: `${eleitor.id}-${Math.random()}`,
          texto: resposta.resposta.length > 200
            ? resposta.resposta.substring(0, 200) + '...'
            : resposta.resposta,
          eleitor: {
            nome: eleitor.nome,
            idade: eleitor.idade,
            profissao: eleitor.profissao,
            regiao: eleitor.regiao_administrativa,
            orientacao: eleitor.orientacao_politica ?? 'centro',
          },
          categoria,
        });
      }
    } else {
      // Gerar citações representativas baseadas no perfil
      for (const eleitor of eleitores.slice(0, 50)) {
        const posicao = eleitor.posicao_bolsonaro?.toLowerCase() ?? 'neutro';
        let templates: string[] = TEMPLATES_CITACOES.neutro;
        let categoria = 'indecisos';

        if (posicao.includes('apoiador_forte')) {
          templates = TEMPLATES_CITACOES.apoiador_forte;
          categoria = 'apoiadores';
        } else if (posicao.includes('apoiador')) {
          templates = TEMPLATES_CITACOES.apoiador_moderado;
          categoria = 'apoiadores';
        } else if (posicao.includes('critico_forte')) {
          templates = TEMPLATES_CITACOES.critico_forte;
          categoria = 'oposicao';
        } else if (posicao.includes('critico')) {
          templates = TEMPLATES_CITACOES.critico_moderado;
          categoria = 'oposicao';
        }

        // Ajustar por idade
        if (eleitor.idade < 30 && eleitor.interesse_politico === 'alto') {
          templates = TEMPLATES_CITACOES.jovem_engajado;
          categoria = 'jovens';
        } else if (eleitor.idade >= 60 && eleitor.estilo_decisao?.includes('pragmat')) {
          templates = TEMPLATES_CITACOES.idoso_pragmatico;
          categoria = 'idosos';
        }

        const textoIndex = Math.abs(eleitor.id.charCodeAt(0)) % templates.length;

        resultado.push({
          id: eleitor.id,
          texto: templates[textoIndex],
          eleitor: {
            nome: eleitor.nome,
            idade: eleitor.idade,
            profissao: eleitor.profissao,
            regiao: eleitor.regiao_administrativa,
            orientacao: eleitor.orientacao_politica ?? 'centro',
          },
          categoria,
        });
      }
    }

    return resultado;
  }, [eleitores, respostas]);

  const citacoesFiltradas = useMemo(() => {
    if (filtro === 'todas') return citacoes;
    return citacoes.filter(c => c.categoria === filtro);
  }, [citacoes, filtro]);

  const totalPaginas = Math.ceil(citacoesFiltradas.length / citacoesPorPagina);
  const citacoesVisiveis = citacoesFiltradas.slice(
    paginaAtual * citacoesPorPagina,
    (paginaAtual + 1) * citacoesPorPagina
  );

  const filtros: { valor: CategoriaFiltro; label: string; cor: string }[] = [
    { valor: 'todas', label: 'Todas', cor: 'bg-gray-500' },
    { valor: 'apoiadores', label: 'Apoiadores', cor: 'bg-blue-500' },
    { valor: 'oposicao', label: 'Oposição', cor: 'bg-red-500' },
    { valor: 'indecisos', label: 'Indecisos', cor: 'bg-gray-400' },
    { valor: 'jovens', label: 'Jovens', cor: 'bg-green-500' },
    { valor: 'idosos', label: 'Idosos', cor: 'bg-amber-500' },
  ];

  const coresPorCategoria: Record<string, string> = {
    apoiadores: 'border-blue-500/50 bg-blue-500/5',
    oposicao: 'border-red-500/50 bg-red-500/5',
    indecisos: 'border-gray-500/50 bg-gray-500/5',
    jovens: 'border-green-500/50 bg-green-500/5',
    idosos: 'border-amber-500/50 bg-amber-500/5',
  };

  return (
    <div className="glass-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Quote className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Citações Representativas</h3>
            <p className="text-sm text-muted-foreground">
              {citacoesFiltradas.length} citações {filtro !== 'todas' && `(${filtro})`}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {filtros.map((f) => (
          <button
            key={f.valor}
            onClick={() => {
              setFiltro(f.valor);
              setPaginaAtual(0);
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              filtro === f.valor
                ? `${f.cor} text-white`
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Citações */}
      <div className="space-y-4">
        {citacoesVisiveis.map((citacao) => (
          <div
            key={citacao.id}
            className={cn(
              'p-5 rounded-xl border transition-all hover:shadow-lg',
              coresPorCategoria[citacao.categoria] || 'border-border bg-secondary/20'
            )}
          >
            <div className="flex items-start gap-4">
              <Quote className="w-8 h-8 text-violet-400 flex-shrink-0 mt-1" />

              <div className="flex-1">
                <p className="text-foreground text-lg italic mb-4 leading-relaxed">
                  &ldquo;{citacao.texto}&rdquo;
                </p>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-foreground">
                    {citacao.eleitor.nome.split(' ')[0]}
                  </span>
                  <span>•</span>
                  <span>{citacao.eleitor.idade} anos</span>
                  <span>•</span>
                  <span>{citacao.eleitor.profissao}</span>
                  <span>•</span>
                  <span>{citacao.eleitor.regiao}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPaginaAtual(p => Math.max(0, p - 1))}
            disabled={paginaAtual === 0}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm text-muted-foreground">
            {paginaAtual + 1} / {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaAtual(p => Math.min(totalPaginas - 1, p + 1))}
            disabled={paginaAtual === totalPaginas - 1}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default CitacoesRepresentativas;
