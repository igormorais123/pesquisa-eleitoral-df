'use client';

/**
 * Card de Candidato
 *
 * Exibe informações resumidas de um candidato em formato de card.
 */

import { Candidato } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface CandidatoCardProps {
  candidato: Candidato;
  onView?: (candidato: Candidato) => void;
  onEdit?: (candidato: Candidato) => void;
  onDelete?: (candidato: Candidato) => void;
  onToggleAtivo?: (candidato: Candidato) => void;
  showActions?: boolean;
}

const CARGO_LABELS: Record<string, string> = {
  governador: 'Governador',
  vice_governador: 'Vice-Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_distrital: 'Deputado Distrital',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pre_candidato: { label: 'Pré-candidato', variant: 'secondary' },
  candidato_oficial: { label: 'Candidato Oficial', variant: 'default' },
  indeferido: { label: 'Indeferido', variant: 'destructive' },
  desistente: { label: 'Desistente', variant: 'outline' },
};

export function CandidatoCard({
  candidato,
  onView,
  onEdit,
  onDelete,
  onToggleAtivo,
  showActions = true,
}: CandidatoCardProps) {
  const statusInfo = STATUS_LABELS[candidato.status_candidatura] || {
    label: candidato.status_candidatura,
    variant: 'secondary' as const,
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md ${
        !candidato.ativo ? 'opacity-60' : ''
      }`}
    >
      {/* Barra de cor da campanha */}
      {candidato.cor_campanha && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: candidato.cor_campanha }}
        />
      )}

      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Foto ou Avatar */}
          <div className="flex-shrink-0">
            {candidato.foto_url ? (
              <img
                src={candidato.foto_url}
                alt={candidato.nome_urna}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
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

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">
                {candidato.nome_urna}
              </h3>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              {!candidato.ativo && (
                <Badge variant="outline" className="text-gray-500">
                  Inativo
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 truncate">{candidato.nome}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {candidato.partido}
                {candidato.numero_partido && ` (${candidato.numero_partido})`}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {CARGO_LABELS[candidato.cargo_pretendido] ||
                  candidato.cargo_pretendido}
              </span>
            </div>

            {/* Propostas principais (preview) */}
            {candidato.propostas_principais?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400">Propostas:</p>
                <p className="text-sm text-gray-600 truncate">
                  {candidato.propostas_principais.slice(0, 2).join(', ')}
                  {candidato.propostas_principais.length > 2 && '...'}
                </p>
              </div>
            )}

            {/* Slogan */}
            {candidato.slogan && (
              <p className="mt-2 text-sm italic text-gray-500">
                "{candidato.slogan}"
              </p>
            )}
          </div>
        </div>

        {/* Ações */}
        {showActions && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(candidato)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(candidato)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            {onToggleAtivo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleAtivo(candidato)}
              >
                {candidato.ativo ? (
                  <>
                    <ToggleRight className="h-4 w-4 mr-1" />
                    Desativar
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-1" />
                    Ativar
                  </>
                )}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(candidato)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
