'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Building2,
  Landmark,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Vote,
  GraduationCap,
  Briefcase,
  Users,
  Heart,
  AlertTriangle,
  Brain,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { useParlamentares } from '@/hooks/useParlamentares';
import { cn } from '@/lib/utils';
import type { Parlamentar, CasaLegislativa } from '@/types';

// Cores por orientação política
const coresOrientacao: Record<string, string> = {
  esquerda: 'bg-red-500/20 text-red-400 border-red-500/30',
  'centro-esquerda': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  centro: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'centro-direita': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  direita: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
};

// Cores por casa legislativa
const coresCasa: Record<CasaLegislativa, string> = {
  camara_federal: 'bg-green-500/20 text-green-400',
  senado: 'bg-blue-500/20 text-blue-400',
  cldf: 'bg-yellow-500/20 text-yellow-400',
};

// Ícones por casa legislativa
const iconesCasa: Record<CasaLegislativa, React.ReactNode> = {
  camara_federal: <Building2 className="w-4 h-4" />,
  senado: <Landmark className="w-4 h-4" />,
  cldf: <Building2 className="w-4 h-4" />,
};

// Nomes por casa legislativa
const nomesCasa: Record<CasaLegislativa, string> = {
  camara_federal: 'Câmara dos Deputados',
  senado: 'Senado Federal',
  cldf: 'CLDF',
};

function SecaoCard({
  titulo,
  icone,
  children,
  className,
}: {
  titulo: string;
  icone: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('glass-card rounded-xl p-6', className)}>
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        {icone}
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function TagList({ items, className }: { items: string[]; className?: string }) {
  if (!items?.length) return <span className="text-muted-foreground text-sm">Não informado</span>;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item, i) => (
        <span
          key={i}
          className="px-3 py-1 bg-secondary/50 rounded-full text-sm text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function PaginaPerfilParlamentar() {
  const params = useParams();
  const router = useRouter();
  const { buscarParlamentarPorId, carregando: carregandoLista } = useParlamentares();
  const [parlamentar, setParlamentar] = useState<Parlamentar | null>(null);
  const [carregando, setCarregando] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    if (!carregandoLista && id) {
      const p = buscarParlamentarPorId(id);
      setParlamentar(p || null);
      setCarregando(false);
    }
  }, [id, carregandoLista, buscarParlamentarPorId]);

  if (carregando || carregandoLista) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Parlamentar não encontrado</p>
          <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
          <Link
            href="/parlamentares"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{parlamentar.nome_parlamentar}</h1>
          <p className="text-muted-foreground">{parlamentar.nome}</p>
        </div>
      </div>

      {/* Card principal com foto e dados básicos */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Foto */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-secondary">
              {parlamentar.foto_url ? (
                <Image
                  src={parlamentar.foto_url}
                  alt={parlamentar.nome_parlamentar}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Botão de pesquisa */}
            <Link
              href={`/pesquisas/nova?tipo=parlamentar&ids=${parlamentar.id}`}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Pesquisar
            </Link>
          </div>

          {/* Informações básicas */}
          <div className="flex-1 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={cn('px-3 py-1 rounded-full text-sm flex items-center gap-1', coresCasa[parlamentar.casa_legislativa])}>
                {iconesCasa[parlamentar.casa_legislativa]}
                {nomesCasa[parlamentar.casa_legislativa]}
              </span>
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                {parlamentar.partido}
              </span>
              <span className={cn('px-3 py-1 rounded-full text-sm border', coresOrientacao[parlamentar.orientacao_politica] || 'bg-secondary')}>
                {parlamentar.orientacao_politica}
              </span>
            </div>

            {/* Grid de dados */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Cargo</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {parlamentar.cargo.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="text-sm font-medium text-foreground">{parlamentar.idade} anos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gênero</p>
                <p className="text-sm font-medium text-foreground capitalize">{parlamentar.genero}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Naturalidade</p>
                <p className="text-sm font-medium text-foreground">
                  {parlamentar.naturalidade}/{parlamentar.uf_nascimento}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Votos (última eleição)</p>
                <p className="text-sm font-medium text-foreground">
                  {parlamentar.votos_eleicao.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mandato</p>
                <p className="text-sm font-medium text-foreground">
                  {parlamentar.legislatura}ª Legislatura
                </p>
              </div>
            </div>

            {/* Contatos */}
            <div className="flex flex-wrap gap-4 pt-2">
              {parlamentar.email_contato && (
                <a
                  href={`mailto:${parlamentar.email_contato}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {parlamentar.email_contato}
                </a>
              )}
              {parlamentar.telefone_gabinete && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {parlamentar.telefone_gabinete}
                </span>
              )}
              {parlamentar.gabinete_localizacao && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {parlamentar.gabinete_localizacao}
                </span>
              )}
            </div>

            {/* Redes sociais */}
            {parlamentar.redes_sociais && Object.keys(parlamentar.redes_sociais).length > 0 && (
              <div className="flex gap-3 pt-2">
                {parlamentar.redes_sociais.twitter && (
                  <a
                    href={parlamentar.redes_sociais.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {parlamentar.redes_sociais.instagram && (
                  <a
                    href={parlamentar.redes_sociais.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {parlamentar.redes_sociais.facebook && (
                  <a
                    href={parlamentar.redes_sociais.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {parlamentar.redes_sociais.youtube && (
                  <a
                    href={parlamentar.redes_sociais.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biografia */}
        <SecaoCard titulo="Biografia" icone={<User className="w-5 h-5 text-primary" />} className="md:col-span-2">
          <p className="text-foreground leading-relaxed">
            {parlamentar.historia_resumida || 'Biografia não disponível.'}
          </p>
        </SecaoCard>

        {/* Formação e Carreira */}
        <SecaoCard titulo="Formação Acadêmica" icone={<GraduationCap className="w-5 h-5 text-blue-400" />}>
          <TagList items={parlamentar.formacao_academica} />
        </SecaoCard>

        <SecaoCard titulo="Carreira Profissional" icone={<Briefcase className="w-5 h-5 text-green-400" />}>
          <p className="text-foreground text-sm">
            {parlamentar.carreira_profissional || parlamentar.profissao_anterior || 'Não informado'}
          </p>
        </SecaoCard>

        {/* Atuação Parlamentar */}
        <SecaoCard titulo="Comissões Atuais" icone={<Users className="w-5 h-5 text-purple-400" />}>
          <TagList items={parlamentar.comissoes_atuais} />
        </SecaoCard>

        <SecaoCard titulo="Temas de Atuação" icone={<MessageSquare className="w-5 h-5 text-orange-400" />}>
          <TagList items={parlamentar.temas_atuacao} />
        </SecaoCard>

        {/* Lideranças e Frentes */}
        {parlamentar.liderancas && parlamentar.liderancas.length > 0 && (
          <SecaoCard titulo="Lideranças" icone={<Vote className="w-5 h-5 text-yellow-400" />}>
            <TagList items={parlamentar.liderancas} />
          </SecaoCard>
        )}

        {parlamentar.frentes_parlamentares && parlamentar.frentes_parlamentares.length > 0 && (
          <SecaoCard titulo="Frentes Parlamentares" icone={<Users className="w-5 h-5 text-cyan-400" />}>
            <TagList items={parlamentar.frentes_parlamentares} />
          </SecaoCard>
        )}

        {/* Histórico Político */}
        {parlamentar.historico_politico && parlamentar.historico_politico.length > 0 && (
          <SecaoCard titulo="Histórico Político" icone={<Calendar className="w-5 h-5 text-indigo-400" />}>
            <ul className="space-y-2">
              {parlamentar.historico_politico.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SecaoCard>
        )}

        {/* Base Eleitoral */}
        <SecaoCard titulo="Base Eleitoral" icone={<MapPin className="w-5 h-5 text-red-400" />}>
          <p className="text-foreground">{parlamentar.base_eleitoral || 'Não informado'}</p>
        </SecaoCard>

        {/* Perfil Político */}
        <SecaoCard titulo="Perfil Político" icone={<Vote className="w-5 h-5 text-blue-400" />} className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Orientação</p>
              <p className="text-sm font-medium text-foreground capitalize">{parlamentar.orientacao_politica}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Posição Bolsonaro</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.posicao_bolsonaro?.replace(/_/g, ' ') || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Posição Lula</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.posicao_lula?.replace(/_/g, ' ') || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Relação com Governo</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.relacao_governo_atual?.replace(/_/g, ' ') || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Alianças */}
          {parlamentar.aliancas_politicas && parlamentar.aliancas_politicas.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Alianças Políticas</p>
              <TagList items={parlamentar.aliancas_politicas} />
            </div>
          )}
        </SecaoCard>

        {/* Valores e Preocupações */}
        <SecaoCard titulo="Valores" icone={<Heart className="w-5 h-5 text-pink-400" />}>
          <TagList items={parlamentar.valores} />
        </SecaoCard>

        <SecaoCard titulo="Preocupações" icone={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
          <TagList items={parlamentar.preocupacoes} />
        </SecaoCard>

        {/* Perfil Comportamental */}
        <SecaoCard titulo="Perfil Comportamental" icone={<Brain className="w-5 h-5 text-violet-400" />} className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estilo de Comunicação</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.estilo_comunicacao || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estilo de Decisão</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.estilo_decisao || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interesse Político</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.interesse_politico || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Religião</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {parlamentar.religiao?.replace(/_/g, ' ') || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Vieses Cognitivos */}
          {parlamentar.vieses_cognitivos && parlamentar.vieses_cognitivos.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Vieses Cognitivos</p>
              <TagList items={parlamentar.vieses_cognitivos} />
            </div>
          )}

          {/* Medos */}
          {parlamentar.medos && parlamentar.medos.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Medos</p>
              <TagList items={parlamentar.medos} />
            </div>
          )}
        </SecaoCard>

        {/* Instrução Comportamental (para IA) */}
        {parlamentar.instrucao_comportamental && (
          <SecaoCard titulo="Instrução Comportamental" icone={<Sparkles className="w-5 h-5 text-primary" />} className="md:col-span-2">
            <p className="text-sm text-muted-foreground italic">
              {parlamentar.instrucao_comportamental}
            </p>
          </SecaoCard>
        )}
      </div>

      {/* Links externos */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fontes de dados oficiais</span>
          <div className="flex gap-2">
            {parlamentar.casa_legislativa === 'camara_federal' && (
              <a
                href={`https://www.camara.leg.br/deputados/${parlamentar.id.replace('dep-fed-', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Câmara dos Deputados
              </a>
            )}
            {parlamentar.casa_legislativa === 'senado' && (
              <a
                href="https://www25.senado.leg.br/web/senadores/em-exercicio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Senado Federal
              </a>
            )}
            {parlamentar.casa_legislativa === 'cldf' && (
              <a
                href="https://www.cl.df.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                CLDF
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
