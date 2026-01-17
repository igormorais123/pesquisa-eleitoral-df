'use client';

/**
 * Formulário de Candidato
 *
 * Formulário completo para criar ou editar candidatos.
 */

import { useState } from 'react';
import { Candidato, CriarCandidatoDTO, CargoPretendido, StatusCandidatura, Genero, OrientacaoPolitica } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface CandidatoFormProps {
  candidato?: Candidato | null;
  open: boolean;
  onClose: () => void;
  onSave: (dados: CriarCandidatoDTO) => Promise<void>;
}

const CARGOS: { value: CargoPretendido; label: string }[] = [
  { value: 'governador', label: 'Governador' },
  { value: 'vice_governador', label: 'Vice-Governador' },
  { value: 'senador', label: 'Senador' },
  { value: 'deputado_federal', label: 'Deputado Federal' },
  { value: 'deputado_distrital', label: 'Deputado Distrital' },
];

const STATUS: { value: StatusCandidatura; label: string }[] = [
  { value: 'pre_candidato', label: 'Pré-candidato' },
  { value: 'candidato_oficial', label: 'Candidato Oficial' },
  { value: 'indeferido', label: 'Indeferido' },
  { value: 'desistente', label: 'Desistente' },
];

const GENEROS: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
];

const ORIENTACOES: { value: OrientacaoPolitica; label: string }[] = [
  { value: 'esquerda', label: 'Esquerda' },
  { value: 'centro-esquerda', label: 'Centro-esquerda' },
  { value: 'centro', label: 'Centro' },
  { value: 'centro-direita', label: 'Centro-direita' },
  { value: 'direita', label: 'Direita' },
];

export function CandidatoForm({
  candidato,
  open,
  onClose,
  onSave,
}: CandidatoFormProps) {
  const isEditing = !!candidato;

  const [formData, setFormData] = useState<CriarCandidatoDTO>({
    nome: candidato?.nome || '',
    nome_urna: candidato?.nome_urna || '',
    partido: candidato?.partido || '',
    cargo_pretendido: candidato?.cargo_pretendido || 'governador',
    numero_partido: candidato?.numero_partido,
    status_candidatura: candidato?.status_candidatura || 'pre_candidato',
    coligacao: candidato?.coligacao || '',
    vice_ou_suplentes: candidato?.vice_ou_suplentes || '',
    foto_url: candidato?.foto_url || '',
    cor_campanha: candidato?.cor_campanha || '#3B82F6',
    slogan: candidato?.slogan || '',
    idade: candidato?.idade,
    data_nascimento: candidato?.data_nascimento || '',
    genero: candidato?.genero,
    naturalidade: candidato?.naturalidade || '',
    profissao: candidato?.profissao || '',
    cargo_atual: candidato?.cargo_atual || '',
    historico_politico: candidato?.historico_politico || [],
    biografia: candidato?.biografia || '',
    propostas_principais: candidato?.propostas_principais || [],
    areas_foco: candidato?.areas_foco || [],
    redes_sociais: candidato?.redes_sociais || {},
    site_campanha: candidato?.site_campanha || '',
    orientacao_politica: candidato?.orientacao_politica,
    pontos_fortes: candidato?.pontos_fortes || [],
    pontos_fracos: candidato?.pontos_fracos || [],
  });

  const [novaProposta, setNovaProposta] = useState('');
  const [novaAreaFoco, setNovaAreaFoco] = useState('');
  const [novoHistorico, setNovoHistorico] = useState('');
  const [novoPontoForte, setNovoPontoForte] = useState('');
  const [novoPontoFraco, setNovoPontoFraco] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleChange = (field: keyof CriarCandidatoDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddToList = (
    field: 'propostas_principais' | 'areas_foco' | 'historico_politico' | 'pontos_fortes' | 'pontos_fracos',
    value: string,
    setter: (v: string) => void
  ) => {
    if (value.trim()) {
      const currentList = formData[field] || [];
      handleChange(field, [...currentList, value.trim()]);
      setter('');
    }
  };

  const handleRemoveFromList = (
    field: 'propostas_principais' | 'areas_foco' | 'historico_politico' | 'pontos_fortes' | 'pontos_fracos',
    index: number
  ) => {
    const currentList = formData[field] || [];
    handleChange(
      field,
      currentList.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    setSalvando(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Candidato' : 'Novo Candidato'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informações do candidato'
              : 'Preencha os dados do novo candidato'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
            <TabsTrigger value="propostas">Propostas</TabsTrigger>
            <TabsTrigger value="redes">Redes</TabsTrigger>
          </TabsList>

          {/* Tab Básico */}
          <TabsContent value="basico" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Nome completo do candidato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_urna">Nome de Urna *</Label>
                <Input
                  id="nome_urna"
                  value={formData.nome_urna}
                  onChange={(e) => handleChange('nome_urna', e.target.value)}
                  placeholder="Nome que aparecerá na urna"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partido">Partido *</Label>
                <Input
                  id="partido"
                  value={formData.partido}
                  onChange={(e) => handleChange('partido', e.target.value)}
                  placeholder="Ex: PP, PT, MDB"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_partido">Número do Partido</Label>
                <Input
                  id="numero_partido"
                  type="number"
                  value={formData.numero_partido || ''}
                  onChange={(e) =>
                    handleChange(
                      'numero_partido',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_pretendido">Cargo Pretendido *</Label>
                <Select
                  value={formData.cargo_pretendido}
                  onValueChange={(v) =>
                    handleChange('cargo_pretendido', v as CargoPretendido)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map((cargo) => (
                      <SelectItem key={cargo.value} value={cargo.value}>
                        {cargo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_candidatura">Status</Label>
                <Select
                  value={formData.status_candidatura}
                  onValueChange={(v) =>
                    handleChange('status_candidatura', v as StatusCandidatura)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coligacao">Coligação/Federação</Label>
                <Input
                  id="coligacao"
                  value={formData.coligacao || ''}
                  onChange={(e) => handleChange('coligacao', e.target.value)}
                  placeholder="Nome da coligação"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vice_ou_suplentes">Vice/Suplentes</Label>
                <Input
                  id="vice_ou_suplentes"
                  value={formData.vice_ou_suplentes || ''}
                  onChange={(e) =>
                    handleChange('vice_ou_suplentes', e.target.value)
                  }
                  placeholder="Nome do vice ou suplentes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foto_url">URL da Foto</Label>
                <Input
                  id="foto_url"
                  value={formData.foto_url || ''}
                  onChange={(e) => handleChange('foto_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_campanha">Cor da Campanha</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_campanha"
                    type="color"
                    value={formData.cor_campanha || '#3B82F6'}
                    onChange={(e) =>
                      handleChange('cor_campanha', e.target.value)
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.cor_campanha || '#3B82F6'}
                    onChange={(e) =>
                      handleChange('cor_campanha', e.target.value)
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan da Campanha</Label>
              <Input
                id="slogan"
                value={formData.slogan || ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="Ex: Juntos por um DF melhor"
              />
            </div>
          </TabsContent>

          {/* Tab Pessoal */}
          <TabsContent value="pessoal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idade">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  value={formData.idade || ''}
                  onChange={(e) =>
                    handleChange(
                      'idade',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Ex: 45"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento || ''}
                  onChange={(e) =>
                    handleChange('data_nascimento', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  value={formData.genero || ''}
                  onValueChange={(v) => handleChange('genero', v as Genero)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENEROS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="naturalidade">Naturalidade</Label>
                <Input
                  id="naturalidade"
                  value={formData.naturalidade || ''}
                  onChange={(e) => handleChange('naturalidade', e.target.value)}
                  placeholder="Ex: Brasília-DF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  value={formData.profissao || ''}
                  onChange={(e) => handleChange('profissao', e.target.value)}
                  placeholder="Ex: Advogada"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo_atual">Cargo Atual</Label>
                <Input
                  id="cargo_atual"
                  value={formData.cargo_atual || ''}
                  onChange={(e) => handleChange('cargo_atual', e.target.value)}
                  placeholder="Ex: Vice-Governadora do DF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientacao_politica">Orientação Política</Label>
                <Select
                  value={formData.orientacao_politica || ''}
                  onValueChange={(v) =>
                    handleChange('orientacao_politica', v as OrientacaoPolitica)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIENTACOES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biografia">Biografia</Label>
              <Textarea
                id="biografia"
                value={formData.biografia || ''}
                onChange={(e) => handleChange('biografia', e.target.value)}
                placeholder="Trajetória política e profissional do candidato..."
                rows={5}
              />
            </div>

            {/* Histórico Político */}
            <div className="space-y-2">
              <Label>Histórico Político</Label>
              <div className="flex gap-2">
                <Input
                  value={novoHistorico}
                  onChange={(e) => setNovoHistorico(e.target.value)}
                  placeholder="Ex: Deputada Federal (2019-2022)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList(
                        'historico_politico',
                        novoHistorico,
                        setNovoHistorico
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleAddToList(
                      'historico_politico',
                      novoHistorico,
                      setNovoHistorico
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.historico_politico?.map((item, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleRemoveFromList('historico_politico', index)
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Propostas */}
          <TabsContent value="propostas" className="space-y-4">
            {/* Propostas Principais */}
            <div className="space-y-2">
              <Label>Propostas Principais</Label>
              <div className="flex gap-2">
                <Input
                  value={novaProposta}
                  onChange={(e) => setNovaProposta(e.target.value)}
                  placeholder="Digite uma proposta e pressione Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList(
                        'propostas_principais',
                        novaProposta,
                        setNovaProposta
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleAddToList(
                      'propostas_principais',
                      novaProposta,
                      setNovaProposta
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.propostas_principais?.map((proposta, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{proposta}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveFromList('propostas_principais', index)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Áreas de Foco */}
            <div className="space-y-2">
              <Label>Áreas de Foco</Label>
              <div className="flex gap-2">
                <Input
                  value={novaAreaFoco}
                  onChange={(e) => setNovaAreaFoco(e.target.value)}
                  placeholder="Ex: Saúde, Educação, Segurança"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList(
                        'areas_foco',
                        novaAreaFoco,
                        setNovaAreaFoco
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleAddToList('areas_foco', novaAreaFoco, setNovaAreaFoco)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.areas_foco?.map((area, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {area}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveFromList('areas_foco', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pontos Fortes */}
            <div className="space-y-2">
              <Label>Pontos Fortes</Label>
              <div className="flex gap-2">
                <Input
                  value={novoPontoForte}
                  onChange={(e) => setNovoPontoForte(e.target.value)}
                  placeholder="Ex: Experiência administrativa"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList(
                        'pontos_fortes',
                        novoPontoForte,
                        setNovoPontoForte
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleAddToList(
                      'pontos_fortes',
                      novoPontoForte,
                      setNovoPontoForte
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pontos_fortes?.map((ponto, index) => (
                  <Badge key={index} className="gap-1 bg-green-100 text-green-800">
                    {ponto}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleRemoveFromList('pontos_fortes', index)
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pontos Fracos */}
            <div className="space-y-2">
              <Label>Pontos Fracos</Label>
              <div className="flex gap-2">
                <Input
                  value={novoPontoFraco}
                  onChange={(e) => setNovoPontoFraco(e.target.value)}
                  placeholder="Ex: Pouca visibilidade"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddToList(
                        'pontos_fracos',
                        novoPontoFraco,
                        setNovoPontoFraco
                      );
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleAddToList(
                      'pontos_fracos',
                      novoPontoFraco,
                      setNovoPontoFraco
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pontos_fracos?.map((ponto, index) => (
                  <Badge key={index} className="gap-1 bg-red-100 text-red-800">
                    {ponto}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        handleRemoveFromList('pontos_fracos', index)
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab Redes */}
          <TabsContent value="redes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.redes_sociais?.instagram || ''}
                  onChange={(e) =>
                    handleChange('redes_sociais', {
                      ...formData.redes_sociais,
                      instagram: e.target.value,
                    })
                  }
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={formData.redes_sociais?.twitter || ''}
                  onChange={(e) =>
                    handleChange('redes_sociais', {
                      ...formData.redes_sociais,
                      twitter: e.target.value,
                    })
                  }
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={formData.redes_sociais?.facebook || ''}
                  onChange={(e) =>
                    handleChange('redes_sociais', {
                      ...formData.redes_sociais,
                      facebook: e.target.value,
                    })
                  }
                  placeholder="URL ou @pagina"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.redes_sociais?.youtube || ''}
                  onChange={(e) =>
                    handleChange('redes_sociais', {
                      ...formData.redes_sociais,
                      youtube: e.target.value,
                    })
                  }
                  placeholder="URL do canal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.redes_sociais?.tiktok || ''}
                  onChange={(e) =>
                    handleChange('redes_sociais', {
                      ...formData.redes_sociais,
                      tiktok: e.target.value,
                    })
                  }
                  placeholder="@usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_campanha">Site da Campanha</Label>
                <Input
                  id="site_campanha"
                  value={formData.site_campanha || ''}
                  onChange={(e) =>
                    handleChange('site_campanha', e.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={salvando}>
            {salvando ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Candidato'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
