'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Building2,
  Briefcase,
  MapPin,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Clock
} from 'lucide-react';
import type { Gestor } from '@/types';

interface GestorCardProps {
  gestor: Gestor;
  selecionado?: boolean;
  onSelecionar?: (id: string) => void;
  onToggleSelecao?: (id: string) => void;
  onClick?: (gestor: Gestor) => void;
  compacto?: boolean;
}

// Cores por setor
const coresSetor = {
  publico: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  privado: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
};

// Cores por nivel
const coresNivel = {
  estrategico: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  tatico: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  operacional: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

// Labels
const labelSetor = {
  publico: 'Setor Publico',
  privado: 'Setor Privado',
};

const labelNivel = {
  estrategico: 'Estrategico',
  tatico: 'Tatico',
  operacional: 'Operacional',
};

export function GestorCard({
  gestor,
  selecionado = false,
  onSelecionar,
  onToggleSelecao,
  onClick,
  compacto = false,
}: GestorCardProps) {
  // onToggleSelecao é alias para onSelecionar
  const handleSelecao = onToggleSelecao || onSelecionar;
  const [expandido, setExpandido] = useState(false);
  const cores = coresSetor[gestor.setor];

  // Calcular IAD (Indice de Autonomia Decisoria)
  const calcularIAD = () => {
    const { planejar, organizar, dirigir, controlar } = gestor.distribuicao_podc;
    return ((planejar + organizar) / (dirigir + controlar)).toFixed(2);
  };

  if (compacto) {
    return (
      <Card
        className={`${cores.bg} ${cores.border} border cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onClick?.(gestor)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {handleSelecao && (
              <Checkbox
                checked={selecionado}
                onCheckedChange={() => handleSelecao(gestor.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{gestor.nome}</span>
                <Badge variant="outline" className={`${coresNivel[gestor.nivel_hierarquico]} text-xs`}>
                  {labelNivel[gestor.nivel_hierarquico]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {gestor.cargo} - {gestor.instituicao}
              </p>
            </div>
            <div className="text-right text-xs">
              <div className={cores.accent}>P:{gestor.distribuicao_podc.planejar}%</div>
              <div className="text-muted-foreground">C:{gestor.distribuicao_podc.controlar}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cores.bg} ${cores.border} border overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {handleSelecao && (
              <Checkbox
                checked={selecionado}
                onCheckedChange={() => handleSelecao(gestor.id)}
                className="mt-1"
              />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className="font-semibold text-lg cursor-pointer hover:underline"
                  onClick={() => onClick?.(gestor)}
                >
                  {gestor.nome}
                </h3>
                <Badge className={cores.badge}>
                  {labelSetor[gestor.setor]}
                </Badge>
                <Badge variant="outline" className={coresNivel[gestor.nivel_hierarquico]}>
                  {labelNivel[gestor.nivel_hierarquico]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {gestor.cargo}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">{gestor.idade} anos</span>
            <p className="text-xs text-muted-foreground capitalize">{gestor.genero}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info basica */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{gestor.instituicao}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{gestor.localizacao}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="truncate capitalize">{gestor.area_atuacao.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{gestor.tempo_no_cargo}</span>
          </div>
        </div>

        {/* Distribuicao PODC */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Distribuicao PODC</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className={`text-xs ${cores.accent} font-medium`}>
                    IAD: {calcularIAD()}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Indice de Autonomia Decisoria</p>
                  <p className="text-xs">(Planejar + Organizar) / (Dirigir + Controlar)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-1 h-6 rounded overflow-hidden">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${gestor.distribuicao_podc.planejar}%` }}
                  >
                    {gestor.distribuicao_podc.planejar > 10 && 'P'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Planejar: {gestor.distribuicao_podc.planejar}%</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${gestor.distribuicao_podc.organizar}%` }}
                  >
                    {gestor.distribuicao_podc.organizar > 10 && 'O'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Organizar: {gestor.distribuicao_podc.organizar}%</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${gestor.distribuicao_podc.dirigir}%` }}
                  >
                    {gestor.distribuicao_podc.dirigir > 10 && 'D'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dirigir: {gestor.distribuicao_podc.dirigir}%</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${gestor.distribuicao_podc.controlar}%` }}
                  >
                    {gestor.distribuicao_podc.controlar > 10 && 'C'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Controlar: {gestor.distribuicao_podc.controlar}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>P: {gestor.distribuicao_podc.planejar}%</span>
            <span>O: {gestor.distribuicao_podc.organizar}%</span>
            <span>D: {gestor.distribuicao_podc.dirigir}%</span>
            <span>C: {gestor.distribuicao_podc.controlar}%</span>
          </div>
        </div>

        {/* Estilo de lideranca */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Lideranca: </span>
          <Badge variant="secondary" className="capitalize">
            {gestor.estilo_lideranca.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Expandir/Colapsar detalhes */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setExpandido(!expandido)}
        >
          {expandido ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Menos detalhes
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Mais detalhes
            </>
          )}
        </Button>

        {/* Detalhes expandidos */}
        {expandido && (
          <div className="space-y-4 pt-2 border-t">
            {/* Formacao */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Formacao</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {gestor.formacao_academica.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Trajetoria */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Trajetoria</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {gestor.trajetoria_carreira}
              </p>
            </div>

            {/* Desafios */}
            {gestor.desafios_cotidianos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Desafios Cotidianos</span>
                </div>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {gestor.desafios_cotidianos.slice(0, 4).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Competencias */}
            {gestor.competencias_distintivas.length > 0 && (
              <div>
                <span className="text-sm font-medium">Competencias</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {gestor.competencias_distintivas.slice(0, 6).map((c, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Historia resumida */}
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-sm italic text-muted-foreground">
                &ldquo;{gestor.historia_resumida}&rdquo;
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dialog para ver detalhes completos
export function GestorDetailDialog({ gestor, children }: { gestor: Gestor; children: React.ReactNode }) {
  const cores = coresSetor[gestor.setor];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            {gestor.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cores.badge}>{labelSetor[gestor.setor]}</Badge>
            <Badge variant="outline" className={coresNivel[gestor.nivel_hierarquico]}>
              {labelNivel[gestor.nivel_hierarquico]}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {gestor.estilo_lideranca.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cargo:</span>
              <p className="font-medium">{gestor.cargo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Instituicao:</span>
              <p className="font-medium">{gestor.instituicao}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Area:</span>
              <p className="font-medium capitalize">{gestor.area_atuacao.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Localizacao:</span>
              <p className="font-medium">{gestor.localizacao}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tempo no cargo:</span>
              <p className="font-medium">{gestor.tempo_no_cargo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Idade:</span>
              <p className="font-medium">{gestor.idade} anos ({gestor.genero})</p>
            </div>
          </div>

          {/* PODC detalhado */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Distribuicao de Tempo (PODC)</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">{gestor.distribuicao_podc.planejar}%</div>
                <div className="text-xs text-muted-foreground">Planejar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{gestor.distribuicao_podc.organizar}%</div>
                <div className="text-xs text-muted-foreground">Organizar</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{gestor.distribuicao_podc.dirigir}%</div>
                <div className="text-xs text-muted-foreground">Dirigir</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{gestor.distribuicao_podc.controlar}%</div>
                <div className="text-xs text-muted-foreground">Controlar</div>
              </div>
            </div>
          </div>

          {/* Formacao */}
          <div>
            <h4 className="font-medium mb-2">Formacao Academica</h4>
            <div className="flex flex-wrap gap-2">
              {gestor.formacao_academica.map((f, i) => (
                <Badge key={i} variant="outline">{f}</Badge>
              ))}
            </div>
          </div>

          {/* Trajetoria */}
          <div>
            <h4 className="font-medium mb-2">Trajetoria de Carreira</h4>
            <p className="text-sm text-muted-foreground">{gestor.trajetoria_carreira}</p>
          </div>

          {/* Desafios */}
          <div>
            <h4 className="font-medium mb-2">Desafios Cotidianos</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              {gestor.desafios_cotidianos.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Competencias */}
          <div>
            <h4 className="font-medium mb-2">Competencias Distintivas</h4>
            <div className="flex flex-wrap gap-2">
              {gestor.competencias_distintivas.map((c, i) => (
                <Badge key={i} variant="secondary">{c}</Badge>
              ))}
            </div>
          </div>

          {/* Historia */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm italic">&ldquo;{gestor.historia_resumida}&rdquo;</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
