'use client';

/**
 * Detalhes do Candidato
 *
 * Modal com informações completas do candidato.
 */

import Image from 'next/image';
import { Candidato } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Edit,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface CandidatoDetailsProps {
  candidato: Candidato | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (candidato: Candidato) => void;
}

const CARGO_LABELS: Record<string, string> = {
  governador: 'Governador',
  vice_governador: 'Vice-Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_distrital: 'Deputado Distrital',
};

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pre_candidato: {
    label: 'Pré-candidato',
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-yellow-600',
  },
  candidato_oficial: {
    label: 'Candidato Oficial',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-600',
  },
  indeferido: {
    label: 'Indeferido',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
  },
  desistente: {
    label: 'Desistente',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-gray-600',
  },
};

const ORIENTACAO_LABELS: Record<string, string> = {
  esquerda: 'Esquerda',
  'centro-esquerda': 'Centro-esquerda',
  centro: 'Centro',
  'centro-direita': 'Centro-direita',
  direita: 'Direita',
};

export function CandidatoDetails({
  candidato,
  open,
  onClose,
  onEdit,
}: CandidatoDetailsProps) {
  if (!candidato) return null;

  const statusInfo = STATUS_LABELS[candidato.status_candidatura] || {
    label: candidato.status_candidatura,
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-gray-600',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Candidato</span>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(candidato)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          {/* Cabeçalho com foto e info básica */}
          <div className="flex items-start gap-6 mb-6 pb-6 border-b">
            {/* Foto */}
            <div className="flex-shrink-0">
              {candidato.foto_url ? (
                <Image
                  src={candidato.foto_url}
                  alt={candidato.nome_urna}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-lg object-cover border-4"
                  style={{ borderColor: candidato.cor_campanha || '#E5E7EB' }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-32 h-32 rounded-lg flex items-center justify-center text-white text-3xl font-bold"
                  style={{
                    backgroundColor: candidato.cor_campanha || '#6B7280',
                  }}
                >
                  {candidato.nome_urna
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
            </div>

            {/* Informações principais */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{candidato.nome_urna}</h2>
                <span className={`flex items-center gap-1 ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>

              <p className="text-gray-600 mb-3">{candidato.nome}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <Building2 className="h-4 w-4" />
                  {candidato.partido}
                  {candidato.numero_partido && ` (${candidato.numero_partido})`}
                </span>

                <span className="flex items-center gap-1 text-gray-600">
                  <User className="h-4 w-4" />
                  {CARGO_LABELS[candidato.cargo_pretendido]}
                </span>

                {candidato.idade && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {candidato.idade} anos
                  </span>
                )}

                {candidato.naturalidade && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {candidato.naturalidade}
                  </span>
                )}
              </div>

              {candidato.slogan && (
                <p className="mt-3 text-lg italic text-gray-500">
                  &quot;{candidato.slogan}&quot;
                </p>
              )}

              {candidato.coligacao && (
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Coligação:</strong> {candidato.coligacao}
                </p>
              )}

              {candidato.vice_ou_suplentes && (
                <p className="text-sm text-gray-500">
                  <strong>Vice/Suplentes:</strong> {candidato.vice_ou_suplentes}
                </p>
              )}
            </div>
          </div>

          {/* Tabs com conteúdo detalhado */}
          <Tabs defaultValue="sobre" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
              <TabsTrigger value="propostas">Propostas</TabsTrigger>
              <TabsTrigger value="carreira">Carreira</TabsTrigger>
              <TabsTrigger value="redes">Redes</TabsTrigger>
            </TabsList>

            {/* Tab Sobre */}
            <TabsContent value="sobre" className="space-y-4 mt-4">
              {candidato.biografia && (
                <div>
                  <h3 className="font-semibold mb-2">Biografia</h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {candidato.biografia}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {candidato.profissao && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Profissão
                    </h4>
                    <p className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      {candidato.profissao}
                    </p>
                  </div>
                )}

                {candidato.cargo_atual && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Cargo Atual
                    </h4>
                    <p>{candidato.cargo_atual}</p>
                  </div>
                )}

                {candidato.orientacao_politica && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Orientação Política
                    </h4>
                    <p>
                      {ORIENTACAO_LABELS[candidato.orientacao_politica] ||
                        candidato.orientacao_politica}
                    </p>
                  </div>
                )}

                {candidato.genero && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Gênero</h4>
                    <p className="capitalize">{candidato.genero}</p>
                  </div>
                )}
              </div>

              {/* Pontos fortes e fracos */}
              <div className="grid grid-cols-2 gap-4">
                {candidato.pontos_fortes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Pontos Fortes
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {candidato.pontos_fortes.map((ponto, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {ponto}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {candidato.pontos_fracos?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Pontos Fracos
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {candidato.pontos_fracos.map((ponto, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          {ponto}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Métricas */}
              {(candidato.rejeicao_estimada !== undefined ||
                candidato.conhecimento_estimado !== undefined) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {candidato.conhecimento_estimado !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Conhecimento Estimado
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {candidato.conhecimento_estimado}%
                      </p>
                    </div>
                  )}

                  {candidato.rejeicao_estimada !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Rejeição Estimada
                      </h4>
                      <p className="text-2xl font-bold text-red-600">
                        {candidato.rejeicao_estimada}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab Propostas */}
            <TabsContent value="propostas" className="space-y-4 mt-4">
              {candidato.propostas_principais?.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">Propostas Principais</h3>
                  <ul className="space-y-2">
                    {candidato.propostas_principais.map((proposta, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{proposta}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma proposta cadastrada
                </p>
              )}

              {candidato.areas_foco?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Áreas de Foco</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidato.areas_foco.map((area, i) => (
                      <Badge key={i} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Carreira */}
            <TabsContent value="carreira" className="space-y-4 mt-4">
              {candidato.historico_politico?.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3">Histórico Político</h3>
                  <ul className="space-y-2">
                    {candidato.historico_politico.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 p-2 border-l-2 border-blue-400 pl-4"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Histórico político não cadastrado
                </p>
              )}

              {candidato.eleicoes_anteriores?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Eleições Anteriores</h3>
                  <div className="space-y-2">
                    {candidato.eleicoes_anteriores.map((eleicao, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {eleicao.cargo} ({eleicao.ano})
                          </p>
                          {eleicao.votos && (
                            <p className="text-sm text-gray-500">
                              {eleicao.votos.toLocaleString('pt-BR')} votos
                              {eleicao.percentual &&
                                ` (${eleicao.percentual}%)`}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={
                            eleicao.resultado === 'eleito'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {eleicao.resultado === 'eleito'
                            ? 'Eleito'
                            : eleicao.resultado === 'segundo_turno'
                            ? '2º Turno'
                            : 'Não eleito'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Redes */}
            <TabsContent value="redes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {candidato.redes_sociais?.instagram && (
                  <a
                    href={`https://instagram.com/${candidato.redes_sociais.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Instagram className="h-5 w-5" />
                    <span>{candidato.redes_sociais.instagram}</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                )}

                {candidato.redes_sociais?.twitter && (
                  <a
                    href={`https://twitter.com/${candidato.redes_sociais.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-black text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Twitter className="h-5 w-5" />
                    <span>{candidato.redes_sociais.twitter}</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                )}

                {candidato.redes_sociais?.facebook && (
                  <a
                    href={
                      candidato.redes_sociais.facebook.startsWith('http')
                        ? candidato.redes_sociais.facebook
                        : `https://facebook.com/${candidato.redes_sociais.facebook}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Facebook className="h-5 w-5" />
                    <span>Facebook</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                )}

                {candidato.redes_sociais?.youtube && (
                  <a
                    href={candidato.redes_sociais.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-red-600 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Youtube className="h-5 w-5" />
                    <span>YouTube</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                )}

                {candidato.site_campanha && (
                  <a
                    href={candidato.site_campanha}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:opacity-90 transition col-span-2"
                  >
                    <Globe className="h-5 w-5" />
                    <span>Site da Campanha</span>
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                )}
              </div>

              {!candidato.redes_sociais?.instagram &&
                !candidato.redes_sociais?.twitter &&
                !candidato.redes_sociais?.facebook &&
                !candidato.redes_sociais?.youtube &&
                !candidato.site_campanha && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma rede social cadastrada
                  </p>
                )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
