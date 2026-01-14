'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  Church,
  Vote,
  Brain,
  Heart,
  AlertTriangle,
  Radio,
  Car,
  Clock,
  BookOpen,
  CheckSquare,
  Square,
  Edit,
} from 'lucide-react';
import { db } from '@/lib/db/dexie';
import { useEleitoresStore } from '@/stores/eleitores-store';
import { cn, gerarIniciais, gerarCorDoNome, formatarPercentual } from '@/lib/utils';
import type { Eleitor } from '@/types';

const CORES_CLUSTER = {
  G1_alta: 'bg-green-500/20 text-green-400 border-green-500/30',
  G2_media_alta: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  G3_media_baixa: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  G4_baixa: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const LABELS_CLUSTER = {
  G1_alta: 'Classe Alta',
  G2_media_alta: 'Classe Média-Alta',
  G3_media_baixa: 'Classe Média-Baixa',
  G4_baixa: 'Classe Baixa',
};

export default function PaginaPerfilEleitor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [eleitor, setEleitor] = useState<Eleitor | null>(null);
  const [carregando, setCarregando] = useState(true);

  const { eleitoresSelecionados, toggleSelecionarParaEntrevista } = useEleitoresStore();
  const selecionado = eleitoresSelecionados.includes(id);

  useEffect(() => {
    async function carregarEleitor() {
      try {
        const dados = await db.eleitores.get(id);
        setEleitor(dados || null);
      } catch (error) {
        console.error('Erro ao carregar eleitor:', error);
      } finally {
        setCarregando(false);
      }
    }
    carregarEleitor();
  }, [id]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!eleitor) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">Eleitor não encontrado</p>
        <Link href="/eleitores" className="text-primary hover:underline mt-4 inline-block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const iniciais = gerarIniciais(eleitor.nome);
  const corAvatar = gerarCorDoNome(eleitor.nome);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSelecionarParaEntrevista(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              selecionado
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
            )}
          >
            {selecionado ? (
              <>
                <CheckSquare className="w-4 h-4" />
                Selecionado para Entrevista
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Selecionar para Entrevista
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card principal */}
      <div className="glass-card rounded-2xl p-8">
        {/* Header do perfil */}
        <div className="flex items-start gap-6 pb-6 border-b border-border">
          <div
            className={cn(
              'w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0',
              corAvatar
            )}
          >
            {iniciais}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{eleitor.nome}</h1>
                <p className="text-muted-foreground mt-1">
                  {eleitor.idade} anos • {eleitor.genero === 'masculino' ? 'Masculino' : 'Feminino'} •{' '}
                  {eleitor.cor_raca}
                </p>
              </div>
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                ID: {eleitor.id}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{eleitor.regiao_administrativa}</span>
                {eleitor.local_referencia && (
                  <span className="text-xs">({eleitor.local_referencia})</span>
                )}
              </div>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm border',
                  CORES_CLUSTER[eleitor.cluster_socioeconomico]
                )}
              >
                {LABELS_CLUSTER[eleitor.cluster_socioeconomico]}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Dados Pessoais */}
          <InfoSection titulo="Dados Pessoais" icone={User}>
            <InfoItem rotulo="Profissão" valor={eleitor.profissao} />
            <InfoItem rotulo="Vínculo" valor={eleitor.ocupacao_vinculo.replace(/_/g, ' ')} />
            <InfoItem rotulo="Renda" valor={`${eleitor.renda_salarios_minimos.replace(/_/g, ' ')} SM`} />
            <InfoItem rotulo="Escolaridade" valor={eleitor.escolaridade.replace(/_/g, ' ')} />
            <InfoItem rotulo="Estado Civil" valor={eleitor.estado_civil} />
            <InfoItem rotulo="Filhos" valor={String(eleitor.filhos)} />
          </InfoSection>

          {/* Perfil Político */}
          <InfoSection titulo="Perfil Político" icone={Vote}>
            <InfoItem rotulo="Orientação" valor={eleitor.orientacao_politica} destaque />
            <InfoItem rotulo="Sobre Bolsonaro" valor={eleitor.posicao_bolsonaro.replace(/_/g, ' ')} />
            <InfoItem rotulo="Interesse Político" valor={eleitor.interesse_politico} />
            <InfoItem rotulo="Tolerância a Nuance" valor={eleitor.tolerancia_nuance || 'média'} />
            <InfoItem rotulo="Estilo de Decisão" valor={eleitor.estilo_decisao || 'pragmático'} />
            {eleitor.conflito_identitario && (
              <div className="mt-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                Possui conflito identitário
              </div>
            )}
          </InfoSection>

          {/* Religião e Mobilidade */}
          <InfoSection titulo="Estilo de Vida" icone={Church}>
            <InfoItem rotulo="Religião" valor={eleitor.religiao} />
            {eleitor.meio_transporte && (
              <InfoItem rotulo="Transporte" valor={eleitor.meio_transporte.replace(/_/g, ' ')} />
            )}
            {eleitor.tempo_deslocamento_trabalho && (
              <InfoItem rotulo="Deslocamento" valor={eleitor.tempo_deslocamento_trabalho.replace(/_/g, ' ')} />
            )}
            {eleitor.voto_facultativo !== undefined && (
              <InfoItem rotulo="Voto Facultativo" valor={eleitor.voto_facultativo ? 'Sim' : 'Não'} />
            )}
          </InfoSection>
        </div>

        {/* Valores, Preocupações, Medos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <TagsSection
            titulo="Valores"
            icone={Heart}
            tags={eleitor.valores}
            corTag="bg-green-500/20 text-green-400"
          />
          <TagsSection
            titulo="Preocupações"
            icone={AlertTriangle}
            tags={eleitor.preocupacoes}
            corTag="bg-yellow-500/20 text-yellow-400"
          />
          <TagsSection
            titulo="Medos"
            icone={AlertTriangle}
            tags={eleitor.medos || []}
            corTag="bg-red-500/20 text-red-400"
          />
        </div>

        {/* Vieses e Fontes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <TagsSection
            titulo="Vieses Cognitivos"
            icone={Brain}
            tags={eleitor.vieses_cognitivos || ['confirmação']}
            corTag="bg-purple-500/20 text-purple-400"
          />
          <TagsSection
            titulo="Fontes de Informação"
            icone={Radio}
            tags={eleitor.fontes_informacao || ['TV', 'rádio']}
            corTag="bg-blue-500/20 text-blue-400"
          />
        </div>

        {/* Susceptibilidade à Desinformação */}
        {eleitor.susceptibilidade_desinformacao !== undefined && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Susceptibilidade à Desinformação
              </span>
              <span className="text-lg font-bold text-foreground">
                {eleitor.susceptibilidade_desinformacao}/10
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  eleitor.susceptibilidade_desinformacao <= 3
                    ? 'bg-green-500'
                    : eleitor.susceptibilidade_desinformacao <= 6
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${eleitor.susceptibilidade_desinformacao * 10}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {eleitor.susceptibilidade_desinformacao <= 3
                ? 'Baixa susceptibilidade - tende a verificar informações'
                : eleitor.susceptibilidade_desinformacao <= 6
                ? 'Susceptibilidade moderada - pode ser influenciado por informações falsas'
                : 'Alta susceptibilidade - muito vulnerável a desinformação'}
            </p>
          </div>
        )}

        {/* História de Vida */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
          <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            História de Vida
          </h3>
          <p className="text-muted-foreground leading-relaxed">{eleitor.historia_resumida}</p>
        </div>

        {/* Instrução Comportamental */}
        {eleitor.instrucao_comportamental && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <h3 className="font-medium text-primary flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4" />
              Como este eleitor se comporta
            </h3>
            <p className="text-muted-foreground text-sm">{eleitor.instrucao_comportamental}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componentes auxiliares
function InfoSection({
  titulo,
  icone: Icone,
  children,
}: {
  titulo: string;
  icone: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        <Icone className="w-4 h-4 text-primary" />
        {titulo}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoItem({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={cn('font-medium', destaque ? 'text-primary' : 'text-foreground')}>
        {valor}
      </span>
    </div>
  );
}

function TagsSection({
  titulo,
  icone: Icone,
  tags,
  corTag,
}: {
  titulo: string;
  icone: React.ElementType;
  tags: string[];
  corTag: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        <Icone className="w-4 h-4 text-primary" />
        {titulo}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={cn('px-2 py-1 rounded-md text-xs', corTag)}>
            {tag}
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground">Não especificado</span>
        )}
      </div>
    </div>
  );
}
