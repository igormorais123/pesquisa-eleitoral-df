"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Sparkles,
  Target,
  AlertTriangle,
  TrendingUp,
  Copy,
  Check,
  Loader2,
  Filter,
  History,
  Zap,
  Heart,
  DollarSign,
  Users,
  Shield,
  Eye,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

// Tipos
interface MensagemGerada {
  gatilho: string;
  texto_curto: string;
  texto_longo: string;
  headline: string;
  palavras_gatilho: string[];
  tom: string;
  canal_ideal: string;
  perfil_mais_receptivo: string;
  risco_backfire_estimado: number;
  eficacia_estimada: number;
  justificativa: string;
}

interface PerfilAgregado {
  total: number;
  medos: Array<{ item: string; frequencia: number; percentual: number }>;
  valores: Array<{ item: string; frequencia: number; percentual: number }>;
  preocupacoes: Array<{ item: string; frequencia: number; percentual: number }>;
  regioes: Array<{ item: string; frequencia: number; percentual: number }>;
  clusters: Array<{ item: string; frequencia: number; percentual: number }>;
  religioes: Array<{ item: string; frequencia: number; percentual: number }>;
  idade_media: number;
  susceptibilidade_media: number;
}

interface ResultadoGeracao {
  mensagens: MensagemGerada[];
  recomendacao_geral?: string;
  alerta_riscos?: string[];
  sequencia_sugerida?: string;
  metadados: {
    objetivo: string;
    total_eleitores_analisados: number;
    gatilhos_utilizados: string[];
    tempo_geracao_segundos: number;
    custo_estimado_usd: number;
    gerado_em: string;
  };
  perfil_agregado: PerfilAgregado;
}

interface PreviewStats {
  total: number;
  perfil_resumido?: {
    idade_media: number;
    susceptibilidade_media: number;
    top_regioes: Array<{ item: string; percentual: number }>;
    top_medos: Array<{ item: string; percentual: number }>;
    top_valores: Array<{ item: string; percentual: number }>;
  };
}

// Ícones para gatilhos
const ICONES_GATILHO: Record<string, React.ElementType> = {
  medo: Shield,
  esperanca: Heart,
  economico: DollarSign,
  tribal: Users,
  identitario: Zap,
};

const CORES_GATILHO: Record<string, string> = {
  medo: "bg-red-100 text-red-800 border-red-200",
  esperanca: "bg-green-100 text-green-800 border-green-200",
  economico: "bg-blue-100 text-blue-800 border-blue-200",
  tribal: "bg-purple-100 text-purple-800 border-purple-200",
  identitario: "bg-amber-100 text-amber-800 border-amber-200",
};

const NOMES_GATILHO: Record<string, string> = {
  medo: "Medo/Ameaça",
  esperanca: "Esperança",
  economico: "Econômico",
  tribal: "Tribal",
  identitario: "Identitário",
};

export default function MensagensPage() {
  // Estados do formulário
  const [objetivo, setObjetivo] = useState("");
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [novaRestricao, setNovaRestricao] = useState("");
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([
    "medo",
    "esperanca",
    "economico",
    "tribal",
    "identitario",
  ]);
  const [filtroRegiao, setFiltroRegiao] = useState<string>("todas");
  const [filtroCluster, setFiltroCluster] = useState<string>("todos");
  const [filtroOrientacao, setFiltroOrientacao] = useState<string>("todas");
  const [filtroReligiao, setFiltroReligiao] = useState<string>("todas");

  // Estados de resultado
  const [resultado, setResultado] = useState<ResultadoGeracao | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewStats | null>(null);

  // Gatilhos disponíveis
  const gatilhosDisponiveis = [
    {
      id: "medo",
      nome: "Medo/Ameaça",
      descricao: "Ativa ansiedades e medos",
    },
    {
      id: "esperanca",
      nome: "Esperança",
      descricao: "Ativa aspirações positivas",
    },
    { id: "economico", nome: "Econômico", descricao: "Foca no bolso/emprego" },
    { id: "tribal", nome: "Tribal", descricao: "Senso de pertencimento" },
    {
      id: "identitario",
      nome: "Identitário",
      descricao: "Valores e religião",
    },
  ];

  // Regiões do DF
  const regioesDF = [
    "Ceilândia",
    "Taguatinga",
    "Samambaia",
    "Plano Piloto",
    "Águas Claras",
    "Gama",
    "Santa Maria",
    "Recanto das Emas",
    "Sobradinho",
    "Planaltina",
    "Guará",
    "Vicente Pires",
    "Brazlândia",
    "São Sebastião",
    "Riacho Fundo",
    "Paranoá",
    "Núcleo Bandeirante",
    "Candangolândia",
    "Lago Sul",
    "Lago Norte",
  ];

  // Construir filtros para API
  const construirFiltros = () => {
    const filtros: Record<string, string[]> = {};

    if (filtroRegiao !== "todas") {
      filtros.regiao_administrativa = [filtroRegiao];
    }
    if (filtroCluster !== "todos") {
      filtros.cluster_socioeconomico = [filtroCluster];
    }
    if (filtroOrientacao !== "todas") {
      filtros.orientacao_politica = [filtroOrientacao];
    }
    if (filtroReligiao !== "todas") {
      filtros.religiao = [filtroReligiao];
    }

    return Object.keys(filtros).length > 0 ? filtros : undefined;
  };

  // Buscar preview
  const handleBuscarPreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await api.post("/api/v1/mensagens/preview", {
        filtros: construirFiltros(),
      });
      setPreview(response.data);
    } catch (error: unknown) {
      console.error("Erro ao buscar preview:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar preview";
      toast.error(errorMessage);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Gerar mensagens
  const handleGerarMensagens = async () => {
    if (!objetivo.trim()) {
      toast.error("Digite o objetivo da mensagem");
      return;
    }

    if (objetivo.trim().length < 10) {
      toast.error("O objetivo deve ter pelo menos 10 caracteres");
      return;
    }

    if (gatilhosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um gatilho");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/mensagens/gerar", {
        objetivo: objetivo.trim(),
        gatilhos: gatilhosSelecionados,
        restricoes: restricoes.length > 0 ? restricoes : undefined,
        num_variacoes: gatilhosSelecionados.length,
        filtros: construirFiltros(),
      });

      setResultado(response.data);
      toast.success(
        `${response.data.mensagens?.length || 0} mensagens geradas com sucesso!`
      );
    } catch (error: unknown) {
      console.error("Erro ao gerar mensagens:", error);
      const apiError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        apiError.response?.data?.detail || "Erro ao gerar mensagens"
      );
    } finally {
      setLoading(false);
    }
  };

  // Copiar texto
  const handleCopiar = async (texto: string, index: number) => {
    await navigator.clipboard.writeText(texto);
    setCopiedIndex(index);
    toast.success("Texto copiado!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Adicionar restrição
  const handleAddRestricao = () => {
    if (novaRestricao.trim() && !restricoes.includes(novaRestricao.trim())) {
      setRestricoes([...restricoes, novaRestricao.trim()]);
      setNovaRestricao("");
    }
  };

  // Remover restrição
  const handleRemoveRestricao = (r: string) => {
    setRestricoes(restricoes.filter((x) => x !== r));
  };

  // Toggle gatilho
  const toggleGatilho = (id: string) => {
    if (gatilhosSelecionados.includes(id)) {
      setGatilhosSelecionados(gatilhosSelecionados.filter((g) => g !== id));
    } else {
      setGatilhosSelecionados([...gatilhosSelecionados, id]);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          Gerador de Mensagens
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie mensagens de persuasão otimizadas com IA para diferentes perfis
          de eleitores
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Painel de Configuração */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Configuração
              </CardTitle>
              <CardDescription>
                Defina o objetivo e o público-alvo das mensagens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Objetivo */}
              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo da Mensagem *</Label>
                <Textarea
                  id="objetivo"
                  placeholder="Ex: Convencer eleitores indecisos de Ceilândia a votar no candidato João Silva destacando sua experiência em gestão pública"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Seja específico: inclua o candidato, o público e o diferencial
                </p>
              </div>

              {/* Gatilhos */}
              <div className="space-y-2">
                <Label>Gatilhos Psicológicos</Label>
                <div className="grid grid-cols-1 gap-2">
                  {gatilhosDisponiveis.map((g) => {
                    const Icon = ICONES_GATILHO[g.id] || Zap;
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center space-x-3 p-2 rounded border cursor-pointer transition-colors ${
                          gatilhosSelecionados.includes(g.id)
                            ? CORES_GATILHO[g.id]
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => toggleGatilho(g.id)}
                      >
                        <Checkbox
                          checked={gatilhosSelecionados.includes(g.id)}
                          onCheckedChange={() => toggleGatilho(g.id)}
                        />
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{g.nome}</span>
                          <p className="text-xs text-muted-foreground truncate">
                            {g.descricao}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-border" />

              {/* Filtros */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar Público-Alvo
                </Label>

                <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Região Administrativa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as regiões</SelectItem>
                    {regioesDF.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroCluster} onValueChange={setFiltroCluster}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cluster Socioeconômico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os clusters</SelectItem>
                    <SelectItem value="G1_alta">G1 - Alta renda</SelectItem>
                    <SelectItem value="G2_media_alta">
                      G2 - Média alta
                    </SelectItem>
                    <SelectItem value="G3_media_baixa">
                      G3 - Média baixa
                    </SelectItem>
                    <SelectItem value="G4_baixa">G4 - Baixa renda</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filtroOrientacao}
                  onValueChange={setFiltroOrientacao}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Orientação Política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as orientações</SelectItem>
                    <SelectItem value="esquerda">Esquerda</SelectItem>
                    <SelectItem value="centro-esquerda">
                      Centro-esquerda
                    </SelectItem>
                    <SelectItem value="centro">Centro</SelectItem>
                    <SelectItem value="centro-direita">
                      Centro-direita
                    </SelectItem>
                    <SelectItem value="direita">Direita</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroReligiao} onValueChange={setFiltroReligiao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Religião" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as religiões</SelectItem>
                    <SelectItem value="catolica">Católica</SelectItem>
                    <SelectItem value="evangelica">Evangélica</SelectItem>
                    <SelectItem value="espirita">Espírita</SelectItem>
                    <SelectItem value="sem_religiao">Sem religião</SelectItem>
                    <SelectItem value="outras">Outras</SelectItem>
                  </SelectContent>
                </Select>

                {/* Botão Preview */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleBuscarPreview}
                  disabled={loadingPreview}
                >
                  {loadingPreview ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  Ver público-alvo
                </Button>

                {/* Preview do público */}
                {preview && (
                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium text-blue-800">
                      {preview.total} eleitores selecionados
                    </p>
                    {preview.perfil_resumido && (
                      <div className="mt-2 space-y-1 text-xs text-blue-700">
                        <p>
                          Idade média:{" "}
                          {preview.perfil_resumido.idade_media?.toFixed(0) ||
                            "N/A"}{" "}
                          anos
                        </p>
                        <p>
                          Susceptibilidade:{" "}
                          {preview.perfil_resumido.susceptibilidade_media?.toFixed(
                            1
                          ) || "N/A"}
                          /10
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <hr className="border-border" />

              {/* Restrições */}
              <div className="space-y-2">
                <Label>Restrições (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: não usar tom agressivo"
                    value={novaRestricao}
                    onChange={(e) => setNovaRestricao(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddRestricao()
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddRestricao}
                  >
                    +
                  </Button>
                </div>
                {restricoes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {restricoes.map((r, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveRestricao(r)}
                      >
                        {r} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Gerar */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleGerarMensagens}
                disabled={loading || !objetivo.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando mensagens...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Mensagens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card de Metadados */}
          {resultado?.metadados && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Estatísticas da Geração
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Eleitores analisados:
                  </span>
                  <span className="font-medium">
                    {resultado.metadados.total_eleitores_analisados}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tempo de geração:
                  </span>
                  <span className="font-medium">
                    {resultado.metadados.tempo_geracao_segundos}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo estimado:</span>
                  <span className="font-medium">
                    ${resultado.metadados.custo_estimado_usd.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gatilhos usados:</span>
                  <span className="font-medium">
                    {resultado.metadados.gatilhos_utilizados.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-4">
          {!resultado && !loading && (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center text-muted-foreground max-w-md">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma mensagem gerada ainda
                </h3>
                <p className="text-sm">
                  Configure o objetivo, selecione os gatilhos psicológicos e
                  filtre o público-alvo. Depois clique em &quot;Gerar Mensagens&quot;
                  para criar mensagens otimizadas.
                </p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-blue-500" />
                  <Sparkles className="h-6 w-6 absolute top-0 right-1/3 text-amber-500 animate-pulse" />
                </div>
                <p className="font-medium text-lg">
                  Gerando mensagens otimizadas...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Claude está analisando o perfil dos {preview?.total || "1000+"}{" "}
                  eleitores
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  {gatilhosSelecionados.map((g) => {
                    const Icon = ICONES_GATILHO[g];
                    return (
                      <Badge key={g} variant="outline" className="animate-pulse">
                        <Icon className="h-3 w-3 mr-1" />
                        {NOMES_GATILHO[g]}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {resultado && !loading && (
            <Tabs defaultValue="mensagens" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mensagens">
                  Mensagens ({resultado.mensagens?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="estrategia">Estratégia</TabsTrigger>
                <TabsTrigger value="perfil">Perfil do Público</TabsTrigger>
              </TabsList>

              {/* Tab: Mensagens */}
              <TabsContent value="mensagens" className="space-y-4">
                {resultado.mensagens?.map((msg, index) => {
                  const Icon = ICONES_GATILHO[msg.gatilho] || Zap;
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={CORES_GATILHO[msg.gatilho]}>
                              <Icon className="h-3 w-3 mr-1" />
                              {NOMES_GATILHO[msg.gatilho] ||
                                msg.gatilho.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{msg.tom}</Badge>
                            <Badge variant="outline">{msg.canal_ideal}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Eficácia:{" "}
                              </span>
                              <span
                                className={`font-bold ${
                                  msg.eficacia_estimada >= 0.7
                                    ? "text-green-600"
                                    : msg.eficacia_estimada >= 0.5
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                {Math.round(msg.eficacia_estimada * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Risco:{" "}
                              </span>
                              <span
                                className={`font-bold ${
                                  msg.risco_backfire_estimado <= 0.2
                                    ? "text-green-600"
                                    : msg.risco_backfire_estimado <= 0.4
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                {Math.round(msg.risco_backfire_estimado * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-2">
                          {msg.headline}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* Texto Curto */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Texto Curto (WhatsApp/Twitter)
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopiar(msg.texto_curto, index)
                              }
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm">{msg.texto_curto}</p>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {msg.texto_curto?.length || 0}/280 caracteres
                          </div>
                        </div>

                        {/* Texto Longo */}
                        <details className="group">
                          <summary className="text-sm py-2 cursor-pointer list-none flex items-center gap-2 hover:underline">
                            <span className="group-open:rotate-90 transition-transform">▶</span>
                            Ver texto expandido (para panfletos, discursos)
                          </summary>
                          <div className="mt-2">
                            <div className="p-3 bg-muted rounded-lg">
                              <p className="text-sm whitespace-pre-line">
                                {msg.texto_longo}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                handleCopiar(msg.texto_longo, index + 100)
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar texto longo
                            </Button>
                          </div>
                        </details>

                        {/* Palavras-gatilho */}
                        {msg.palavras_gatilho &&
                          msg.palavras_gatilho.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">
                                Palavras-chave
                              </Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {msg.palavras_gatilho.map((p, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {p}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Perfil receptivo */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium text-blue-800 flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Perfil mais receptivo
                          </Label>
                          <p className="text-sm text-blue-700 mt-1">
                            {msg.perfil_mais_receptivo}
                          </p>
                        </div>

                        {/* Justificativa */}
                        <details className="group">
                          <summary className="text-sm py-2 cursor-pointer list-none flex items-center gap-2 hover:underline">
                            <span className="group-open:rotate-90 transition-transform">▶</span>
                            Por que esta mensagem funciona?
                          </summary>
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              {msg.justificativa}
                            </p>
                          </div>
                        </details>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* Tab: Estratégia */}
              <TabsContent value="estrategia" className="space-y-4">
                {resultado.recomendacao_geral && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Recomendação Estratégica
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">
                        {resultado.recomendacao_geral}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {resultado.sequencia_sugerida && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                        Sequência Sugerida
                      </CardTitle>
                      <CardDescription>
                        Ordem recomendada para usar as mensagens na campanha
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{resultado.sequencia_sugerida}</p>
                    </CardContent>
                  </Card>
                )}

                {resultado.alerta_riscos &&
                  resultado.alerta_riscos.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                          <AlertTriangle className="h-5 w-5" />
                          Alertas de Risco
                        </CardTitle>
                        <CardDescription>
                          Pontos de atenção ao usar estas mensagens
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {resultado.alerta_riscos.map((alerta, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{alerta}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              {/* Tab: Perfil */}
              <TabsContent value="perfil" className="space-y-4">
                {/* Estatísticas gerais */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Estatísticas do Público Analisado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {resultado.perfil_agregado?.total || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Eleitores
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {resultado.perfil_agregado?.idade_media?.toFixed(0) ||
                            0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Idade Média
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {resultado.perfil_agregado?.susceptibilidade_media?.toFixed(
                            1
                          ) || 0}
                          /10
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Susceptibilidade
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Medos */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        Medos Mais Comuns
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resultado.perfil_agregado?.medos
                        ?.slice(0, 5)
                        .map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm truncate flex-1">
                              {m.item}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <Progress
                                value={m.percentual}
                                className="w-16 h-2"
                              />
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {m.percentual}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Valores */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-500" />
                        Valores Mais Frequentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resultado.perfil_agregado?.valores
                        ?.slice(0, 5)
                        .map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm truncate flex-1">
                              {v.item}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <Progress
                                value={v.percentual}
                                className="w-16 h-2"
                              />
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {v.percentual}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Preocupações */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Preocupações Principais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resultado.perfil_agregado?.preocupacoes
                        ?.slice(0, 5)
                        .map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm truncate flex-1">
                              {p.item}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <Progress
                                value={p.percentual}
                                className="w-16 h-2"
                              />
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {p.percentual}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Regiões */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Regiões Administrativas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resultado.perfil_agregado?.regioes
                        ?.slice(0, 5)
                        .map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm truncate flex-1">
                              {r.item}
                            </span>
                            <div className="flex items-center gap-2 ml-2">
                              <Progress
                                value={r.percentual}
                                className="w-16 h-2"
                              />
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {r.percentual}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
