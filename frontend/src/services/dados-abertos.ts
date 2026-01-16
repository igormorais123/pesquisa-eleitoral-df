/**
 * Serviço de integração com APIs de Dados Abertos
 * - Câmara dos Deputados: https://dadosabertos.camara.leg.br/
 * - Senado Federal: https://legis.senado.leg.br/dadosabertos/
 */

// ============================================
// TIPOS
// ============================================

export interface DeputadoAPI {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string;
}

export interface VotacaoAPI {
  id: string;
  uri: string;
  data: string;
  dataHoraRegistro: string;
  siglaOrgao: string;
  uriOrgao: string;
  uriEvento: string;
  proposicaoObjeto: string;
  uriProposicaoObjeto: string;
  descricao: string;
  aprovacao: number;
}

export interface VotoDeputadoAPI {
  tipoVoto: string;
  dataRegistroVoto: string;
  deputado_: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
  };
}

export interface ProposicaoAPI {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
}

export interface DespesaDeputadoAPI {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: number;
  tipoDocumento: string;
  codTipoDocumento: number;
  dataDocumento: string;
  numDocumento: string;
  valorDocumento: number;
  urlDocumento: string;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string;
  valorLiquido: number;
  valorGlosa: number;
  numRessarcimento: string;
  codLote: number;
  parcela: number;
}

export interface SenadorAPI {
  IdentificacaoParlamentar: {
    CodigoParlamentar: number;
    NomeParlamentar: string;
    NomeCompletoParlamentar: string;
    SexoParlamentar: string;
    FormaTratamento: string;
    UrlFotoParlamentar: string;
    UrlPaginaParlamentar: string;
    EmailParlamentar: string;
    SiglaPartidoParlamentar: string;
    UfParlamentar: string;
  };
}

export interface VotacaoSenadorAPI {
  CodigoSessao: number;
  SiglaCasa: string;
  CodigoSessaoLegislativa: number;
  TipoSessao: string;
  NumeroSessao: number;
  DataSessao: string;
  HoraInicioSessao: string;
  Materia: {
    Codigo: number;
    Sigla: string;
    Numero: number;
    Ano: number;
    Ementa: string;
  };
  DescricaoVotacao: string;
  Resultado: string;
  DescricaoResultado: string;
}

// ============================================
// CÂMARA DOS DEPUTADOS API
// ============================================

const CAMARA_API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

export const camaraAPI = {
  /**
   * Busca lista de deputados
   */
  async listarDeputados(params?: {
    siglaUf?: string;
    siglaPartido?: string;
    idLegislatura?: number;
    ordem?: 'ASC' | 'DESC';
    ordenarPor?: string;
  }): Promise<DeputadoAPI[]> {
    const queryParams = new URLSearchParams();
    if (params?.siglaUf) queryParams.append('siglaUf', params.siglaUf);
    if (params?.siglaPartido) queryParams.append('siglaPartido', params.siglaPartido);
    if (params?.idLegislatura) queryParams.append('idLegislatura', params.idLegislatura.toString());
    if (params?.ordem) queryParams.append('ordem', params.ordem);
    if (params?.ordenarPor) queryParams.append('ordenarPor', params.ordenarPor);

    const response = await fetch(`${CAMARA_API_BASE}/deputados?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca detalhes de um deputado
   */
  async obterDeputado(id: number): Promise<any> {
    const response = await fetch(`${CAMARA_API_BASE}/deputados/${id}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca despesas de um deputado
   */
  async listarDespesasDeputado(
    id: number,
    params?: {
      ano?: number;
      mes?: number;
      cnpjCpfFornecedor?: string;
      itens?: number;
    }
  ): Promise<DespesaDeputadoAPI[]> {
    const queryParams = new URLSearchParams();
    if (params?.ano) queryParams.append('ano', params.ano.toString());
    if (params?.mes) queryParams.append('mes', params.mes.toString());
    if (params?.cnpjCpfFornecedor) queryParams.append('cnpjCpfFornecedor', params.cnpjCpfFornecedor);
    if (params?.itens) queryParams.append('itens', params.itens.toString());

    const response = await fetch(`${CAMARA_API_BASE}/deputados/${id}/despesas?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca votações na Câmara
   */
  async listarVotacoes(params?: {
    dataInicio?: string;
    dataFim?: string;
    ordem?: 'ASC' | 'DESC';
    ordenarPor?: string;
  }): Promise<VotacaoAPI[]> {
    const queryParams = new URLSearchParams();
    if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params?.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params?.ordem) queryParams.append('ordem', params.ordem);
    if (params?.ordenarPor) queryParams.append('ordenarPor', params.ordenarPor);

    const response = await fetch(`${CAMARA_API_BASE}/votacoes?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca votos de uma votação específica
   */
  async obterVotosVotacao(idVotacao: string): Promise<VotoDeputadoAPI[]> {
    const response = await fetch(`${CAMARA_API_BASE}/votacoes/${idVotacao}/votos`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca proposições (projetos de lei, etc.)
   */
  async listarProposicoes(params?: {
    siglaTipo?: string;
    numero?: number;
    ano?: number;
    autor?: string;
    tramitacaoSenado?: boolean;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<ProposicaoAPI[]> {
    const queryParams = new URLSearchParams();
    if (params?.siglaTipo) queryParams.append('siglaTipo', params.siglaTipo);
    if (params?.numero) queryParams.append('numero', params.numero.toString());
    if (params?.ano) queryParams.append('ano', params.ano.toString());
    if (params?.autor) queryParams.append('autor', params.autor);
    if (params?.tramitacaoSenado !== undefined)
      queryParams.append('tramitacaoSenado', params.tramitacaoSenado.toString());
    if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params?.dataFim) queryParams.append('dataFim', params.dataFim);

    const response = await fetch(`${CAMARA_API_BASE}/proposicoes?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca detalhes de uma proposição
   */
  async obterProposicao(id: number): Promise<any> {
    const response = await fetch(`${CAMARA_API_BASE}/proposicoes/${id}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca eventos (reuniões, sessões, etc.)
   */
  async listarEventos(params?: {
    dataInicio?: string;
    dataFim?: string;
    codSituacao?: number;
    codTipoEvento?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
    if (params?.dataFim) queryParams.append('dataFim', params.dataFim);
    if (params?.codSituacao) queryParams.append('codSituacao', params.codSituacao.toString());
    if (params?.codTipoEvento) queryParams.append('codTipoEvento', params.codTipoEvento.toString());

    const response = await fetch(`${CAMARA_API_BASE}/eventos?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },

  /**
   * Busca órgãos (comissões, etc.)
   */
  async listarOrgaos(params?: { sigla?: string; codTipoOrgao?: number }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.sigla) queryParams.append('sigla', params.sigla);
    if (params?.codTipoOrgao) queryParams.append('codTipoOrgao', params.codTipoOrgao.toString());

    const response = await fetch(`${CAMARA_API_BASE}/orgaos?${queryParams}`);
    const data = await response.json();
    return data.dados;
  },
};

// ============================================
// SENADO FEDERAL API
// ============================================

const SENADO_API_BASE = 'https://legis.senado.leg.br/dadosabertos';

export const senadoAPI = {
  /**
   * Busca lista de senadores em exercício
   */
  async listarSenadoresEmExercicio(): Promise<SenadorAPI[]> {
    const response = await fetch(`${SENADO_API_BASE}/senador/lista/atual`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || [];
  },

  /**
   * Busca detalhes de um senador
   */
  async obterSenador(codigo: number): Promise<any> {
    const response = await fetch(`${SENADO_API_BASE}/senador/${codigo}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.DetalheParlamentar?.Parlamentar;
  },

  /**
   * Busca votações de um senador
   */
  async listarVotacoesSenador(codigo: number, ano?: number): Promise<VotacaoSenadorAPI[]> {
    const url = ano
      ? `${SENADO_API_BASE}/senador/${codigo}/votacoes?ano=${ano}`
      : `${SENADO_API_BASE}/senador/${codigo}/votacoes`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.VotacaoParlamentar?.Parlamentar?.Votacoes?.Votacao || [];
  },

  /**
   * Busca matérias (projetos de lei no Senado)
   */
  async listarMaterias(params?: {
    sigla?: string;
    numero?: number;
    ano?: number;
    tramitando?: 'S' | 'N';
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.sigla) queryParams.append('sigla', params.sigla);
    if (params?.numero) queryParams.append('numero', params.numero.toString());
    if (params?.ano) queryParams.append('ano', params.ano.toString());
    if (params?.tramitando) queryParams.append('tramitando', params.tramitando);

    const response = await fetch(`${SENADO_API_BASE}/materia/pesquisa/lista?${queryParams}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.PesquisaBasicaMateria?.Materias?.Materia || [];
  },

  /**
   * Busca detalhes de uma matéria
   */
  async obterMateria(codigo: number): Promise<any> {
    const response = await fetch(`${SENADO_API_BASE}/materia/${codigo}`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.DetalheMateria?.Materia;
  },

  /**
   * Busca agenda do plenário
   */
  async obterAgendaPlenario(data?: string): Promise<any> {
    const url = data
      ? `${SENADO_API_BASE}/plenario/agenda/${data}`
      : `${SENADO_API_BASE}/plenario/agenda/mes`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    return response.json();
  },

  /**
   * Busca comissões
   */
  async listarComissoes(): Promise<any[]> {
    const response = await fetch(`${SENADO_API_BASE}/comissao/lista/legislatura/atual`, {
      headers: { Accept: 'application/json' },
    });
    const data = await response.json();
    return data.ListaComissoes?.Comissoes?.Comissao || [];
  },
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Busca histórico de votações de um deputado federal
 */
export async function buscarHistoricoVotacoesDeputado(
  idCamara: number,
  dataInicio?: string,
  dataFim?: string
): Promise<{
  votacoes: VotacaoAPI[];
  votos: Map<string, string>;
}> {
  // Buscar votações no período
  const votacoes = await camaraAPI.listarVotacoes({
    dataInicio,
    dataFim,
    ordem: 'DESC',
    ordenarPor: 'dataHoraRegistro',
  });

  // Para cada votação, buscar o voto do deputado
  const votos = new Map<string, string>();

  for (const votacao of votacoes.slice(0, 50)) {
    // Limitar a 50 votações recentes
    try {
      const votosVotacao = await camaraAPI.obterVotosVotacao(votacao.id);
      const votoDeputado = votosVotacao.find((v) => v.deputado_.id === idCamara);
      if (votoDeputado) {
        votos.set(votacao.id, votoDeputado.tipoVoto);
      }
    } catch (error) {
      console.error(`Erro ao buscar votos da votação ${votacao.id}:`, error);
    }
  }

  return { votacoes, votos };
}

/**
 * Busca resumo de despesas de um deputado
 */
export async function buscarResumoDespesasDeputado(
  idCamara: number,
  ano?: number
): Promise<{
  total: number;
  porTipo: Record<string, number>;
  maioresDespesas: DespesaDeputadoAPI[];
}> {
  const despesas = await camaraAPI.listarDespesasDeputado(idCamara, {
    ano: ano || new Date().getFullYear(),
    itens: 100,
  });

  const total = despesas.reduce((sum, d) => sum + d.valorLiquido, 0);

  const porTipo: Record<string, number> = {};
  despesas.forEach((d) => {
    porTipo[d.tipoDespesa] = (porTipo[d.tipoDespesa] || 0) + d.valorLiquido;
  });

  const maioresDespesas = [...despesas].sort((a, b) => b.valorLiquido - a.valorLiquido).slice(0, 10);

  return { total, porTipo, maioresDespesas };
}

/**
 * Busca projetos de lei de um autor
 */
export async function buscarProjetosAutor(nomeAutor: string): Promise<ProposicaoAPI[]> {
  return camaraAPI.listarProposicoes({
    autor: nomeAutor,
  });
}

/**
 * Busca pautas em votação na Câmara
 */
export async function buscarPautasEmVotacao(): Promise<VotacaoAPI[]> {
  const hoje = new Date().toISOString().split('T')[0];
  const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return camaraAPI.listarVotacoes({
    dataInicio: umMesAtras,
    dataFim: hoje,
    ordem: 'DESC',
  });
}

/**
 * Gera sugestões de perguntas baseadas em pautas recentes
 */
export async function gerarSugestoesPerguntasPautas(): Promise<string[]> {
  const votacoes = await buscarPautasEmVotacao();
  const sugestoes: string[] = [];

  votacoes.slice(0, 10).forEach((votacao) => {
    if (votacao.proposicaoObjeto) {
      sugestoes.push(
        `Qual sua posição sobre "${votacao.descricao || votacao.proposicaoObjeto}"?`
      );
    }
  });

  // Adicionar perguntas genéricas relevantes
  sugestoes.push(
    'Como você avalia o atual cenário político do Brasil?',
    'Quais são suas prioridades para o próximo ano legislativo?',
    'Como você se posiciona em relação à reforma administrativa?',
    'Qual sua opinião sobre a política econômica atual?'
  );

  return sugestoes;
}
