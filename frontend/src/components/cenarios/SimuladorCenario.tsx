'use client';

/**
 * Simulador de Cenários Eleitorais
 *
 * Componente principal para criar e executar simulações de cenários.
 */

import { useState, useEffect } from 'react';
import {
  CargoPretendido,
  Candidato,
  CriarCenarioDTO,
  ResultadoCenario,
} from '@/types';
import { useCenariosStore } from '@/stores/cenarios-store';
import { useCandidatosStore } from '@/stores/candidatos-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { ResultadosCenario } from './ResultadosCenario';
import { toast } from 'sonner';

const CARGOS: { value: CargoPretendido; label: string }[] = [
  { value: 'governador', label: 'Governador' },
  { value: 'senador', label: 'Senador' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'deputado_distrital', label: 'Deputado Distrital' },
];

interface SimuladorCenarioProps {
  onResultado?: (resultado: ResultadoCenario) => void;
}

export function SimuladorCenario({ onResultado }: SimuladorCenarioProps) {
  // Stores
  const {
    simularRapido,
    simulando,
    resultadoAtual,
    erro,
    limparErro,
    limparResultado,
  } = useCenariosStore();

  const {
    candidatos,
    carregarCandidatosPorCargo,
    carregando: carregandoCandidatos,
  } = useCandidatosStore();

  // Estado local
  const [cargo, setCargo] = useState<CargoPretendido>('governador');
  const [turno, setTurno] = useState<1 | 2>(1);
  const [candidatosDisponiveis, setCandidatosDisponiveis] = useState<Candidato[]>([]);
  const [candidatosSelecionados, setCandidatosSelecionados] = useState<string[]>([]);
  const [amostraTamanho, setAmostraTamanho] = useState(100);
  const [incluirIndecisos, setIncluirIndecisos] = useState(true);
  const [incluirBrancosNulos, setIncluirBrancosNulos] = useState(true);

  // Carregar candidatos quando cargo mudar
  useEffect(() => {
    const carregarCandidatos = async () => {
      const candidatosCargo = await carregarCandidatosPorCargo(cargo);
      setCandidatosDisponiveis(candidatosCargo);
      setCandidatosSelecionados([]);
    };
    carregarCandidatos();
  }, [cargo, carregarCandidatosPorCargo]);

  // Limpar resultados quando mudar configuração
  useEffect(() => {
    limparResultado();
  }, [cargo, turno, candidatosSelecionados, limparResultado]);

  // Toggle candidato selecionado
  const toggleCandidato = (candidatoId: string) => {
    setCandidatosSelecionados((prev) => {
      if (prev.includes(candidatoId)) {
        return prev.filter((id) => id !== candidatoId);
      }
      // Limitar a 2 candidatos no 2º turno
      if (turno === 2 && prev.length >= 2) {
        toast.warning('No 2º turno, selecione apenas 2 candidatos');
        return prev;
      }
      return [...prev, candidatoId];
    });
  };

  // Executar simulação
  const executarSimulacao = async () => {
    if (candidatosSelecionados.length < 2) {
      toast.error('Selecione pelo menos 2 candidatos');
      return;
    }

    try {
      const resultado = await simularRapido({
        cargo,
        turno,
        candidatos_ids: candidatosSelecionados,
        amostra_tamanho: amostraTamanho,
      });

      toast.success('Simulação concluída!');
      onResultado?.(resultado);
    } catch (error) {
      toast.error('Erro ao executar simulação');
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração do Cenário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configurar Cenário
          </CardTitle>
          <CardDescription>
            Defina os parâmetros da simulação eleitoral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cargo e Turno */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select
                value={cargo}
                onValueChange={(v) => setCargo(v as CargoPretendido)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Turno</Label>
              <Select
                value={String(turno)}
                onValueChange={(v) => setTurno(Number(v) as 1 | 2)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Turno</SelectItem>
                  <SelectItem value="2">2º Turno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tamanho da Amostra */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tamanho da Amostra</Label>
              <span className="text-sm font-medium">{amostraTamanho} eleitores</span>
            </div>
            <Slider
              value={[amostraTamanho]}
              onValueChange={(v) => setAmostraTamanho(v[0])}
              min={10}
              max={500}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Quanto maior a amostra, mais preciso o resultado (margem de erro menor)
            </p>
          </div>

          {/* Opções */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="indecisos"
                checked={incluirIndecisos}
                onCheckedChange={setIncluirIndecisos}
              />
              <Label htmlFor="indecisos">Incluir Indecisos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="brancos"
                checked={incluirBrancosNulos}
                onCheckedChange={setIncluirBrancosNulos}
              />
              <Label htmlFor="brancos">Incluir Brancos/Nulos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Candidatos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Candidatos
            {candidatosSelecionados.length > 0 && (
              <Badge variant="secondary">{candidatosSelecionados.length} selecionados</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {turno === 1
              ? 'Selecione pelo menos 2 candidatos para o 1º turno'
              : 'Selecione exatamente 2 candidatos para o 2º turno'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carregandoCandidatos ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Carregando candidatos...</span>
            </div>
          ) : candidatosDisponiveis.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum candidato encontrado para este cargo.</p>
              <p className="text-sm">Cadastre candidatos primeiro.</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {candidatosDisponiveis.map((candidato) => {
                  const selecionado = candidatosSelecionados.includes(candidato.id);
                  return (
                    <div
                      key={candidato.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selecionado
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleCandidato(candidato.id)}
                    >
                      <Checkbox
                        checked={selecionado}
                        onCheckedChange={() => toggleCandidato(candidato.id)}
                      />

                      {/* Foto ou Avatar */}
                      {candidato.foto_url ? (
                        <img
                          src={candidato.foto_url}
                          alt={candidato.nome_urna}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: candidato.cor_campanha || '#6B7280' }}
                        >
                          {candidato.nome_urna?.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-medium">{candidato.nome_urna}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidato.partido}
                          {candidato.numero_partido && ` (${candidato.numero_partido})`}
                        </p>
                      </div>

                      {candidato.rejeicao_estimada !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Rejeição: {candidato.rejeicao_estimada}%
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Candidatos Selecionados */}
          {candidatosSelecionados.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Candidatos selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {candidatosSelecionados.map((id) => {
                  const candidato = candidatosDisponiveis.find((c) => c.id === id);
                  if (!candidato) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1"
                      style={{
                        borderLeft: `3px solid ${candidato.cor_campanha || '#6B7280'}`,
                      }}
                    >
                      {candidato.nome_urna} ({candidato.partido})
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCandidato(id);
                        }}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Executar */}
      <Button
        size="lg"
        className="w-full"
        onClick={executarSimulacao}
        disabled={simulando || candidatosSelecionados.length < 2}
      >
        {simulando ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Simulando...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Executar Simulação
          </>
        )}
      </Button>

      {/* Erro */}
      {erro && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{erro}</span>
          <Button variant="ghost" size="sm" onClick={limparErro}>
            Fechar
          </Button>
        </div>
      )}

      {/* Resultados */}
      {resultadoAtual && (
        <ResultadosCenario
          resultado={resultadoAtual}
          candidatos={candidatosDisponiveis.filter((c) =>
            candidatosSelecionados.includes(c.id)
          )}
        />
      )}
    </div>
  );
}
