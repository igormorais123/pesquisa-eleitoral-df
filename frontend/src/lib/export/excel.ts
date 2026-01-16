/**
 * Funções de Exportação para Excel
 * Pesquisa Eleitoral DF 2026
 */

import * as XLSX from 'xlsx';
import type { Eleitor, RespostaEleitor } from '@/types';
import type { SessaoEntrevista } from '@/lib/db/dexie';

// Tipos para exportação
interface DadosExportacao {
  eleitores?: Eleitor[];
  sessao?: SessaoEntrevista;
  estatisticas?: Record<string, unknown>;
}

/**
 * Exporta lista de eleitores para Excel
 */
export function exportarEleitoresExcel(eleitores: Eleitor[], nomeArquivo?: string): void {
  // Mapear campos para formato legível
  const dados = eleitores.map((e) => ({
    ID: e.id,
    Nome: e.nome,
    Idade: e.idade,
    Gênero: e.genero,
    'Cor/Raça': e.cor_raca,
    'Região Administrativa': e.regiao_administrativa,
    'Cluster Socioeconômico': formatarCluster(e.cluster_socioeconomico),
    Escolaridade: formatarEscolaridade(e.escolaridade),
    Profissão: e.profissao,
    'Vínculo Ocupacional': e.ocupacao_vinculo,
    Renda: e.renda_salarios_minimos,
    Religião: e.religiao,
    'Estado Civil': e.estado_civil,
    Filhos: e.filhos,
    'Orientação Política': e.orientacao_politica,
    'Posição Bolsonaro': e.posicao_bolsonaro,
    'Interesse Político': e.interesse_politico,
    'Tolerância Nuance': e.tolerancia_nuance,
    'Estilo Decisão': e.estilo_decisao,
    Valores: Array.isArray(e.valores) ? e.valores.join('; ') : e.valores,
    Preocupações: Array.isArray(e.preocupacoes) ? e.preocupacoes.join('; ') : e.preocupacoes,
    Medos: Array.isArray(e.medos) ? e.medos.join('; ') : e.medos,
    'Vieses Cognitivos': Array.isArray(e.vieses_cognitivos) ? e.vieses_cognitivos.join('; ') : e.vieses_cognitivos,
    'Susceptibilidade Desinformação': e.susceptibilidade_desinformacao,
    'Fontes Informação': Array.isArray(e.fontes_informacao) ? e.fontes_informacao.join('; ') : e.fontes_informacao,
    'Meio Transporte': e.meio_transporte,
    'Tempo Deslocamento': e.tempo_deslocamento_trabalho,
    'Voto Facultativo': e.voto_facultativo ? 'Sim' : 'Não',
    'Conflito Identitário': e.conflito_identitario ? 'Sim' : 'Não',
    'História Resumida': e.historia_resumida,
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dados);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // ID
    { wch: 30 }, // Nome
    { wch: 8 },  // Idade
    { wch: 12 }, // Gênero
    { wch: 12 }, // Cor/Raça
    { wch: 25 }, // RA
    { wch: 20 }, // Cluster
    { wch: 30 }, // Escolaridade
    { wch: 25 }, // Profissão
    { wch: 20 }, // Vínculo
    { wch: 15 }, // Renda
    { wch: 15 }, // Religião
    { wch: 15 }, // Estado Civil
    { wch: 8 },  // Filhos
    { wch: 18 }, // Orientação
    { wch: 18 }, // Bolsonaro
    { wch: 15 }, // Interesse
    { wch: 15 }, // Tolerância
    { wch: 15 }, // Estilo
    { wch: 50 }, // Valores
    { wch: 50 }, // Preocupações
    { wch: 50 }, // Medos
    { wch: 50 }, // Vieses
    { wch: 12 }, // Susceptibilidade
    { wch: 40 }, // Fontes
    { wch: 15 }, // Transporte
    { wch: 15 }, // Tempo
    { wch: 12 }, // Voto Facultativo
    { wch: 15 }, // Conflito
    { wch: 80 }, // História
  ];
  ws['!cols'] = colWidths;

  // Adicionar planilha ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Eleitores');

  // Gerar nome do arquivo
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `eleitores-df-${dataAtual}.xlsx`;

  // Fazer download
  XLSX.writeFile(wb, arquivo);
}

/**
 * Exporta resultado de entrevista para Excel
 */
export function exportarResultadoExcel(sessao: SessaoEntrevista, nomeArquivo?: string): void {
  const wb = XLSX.utils.book_new();

  // Planilha 1: Resumo
  const resumo = [
    { Campo: 'ID da Sessão', Valor: sessao.id },
    { Campo: 'Título', Valor: sessao.titulo },
    { Campo: 'Status', Valor: sessao.status },
    { Campo: 'Total de Respondentes', Valor: sessao.respostas.length },
    { Campo: 'Total Planejado', Valor: sessao.totalAgentes },
    { Campo: 'Taxa de Conclusão', Valor: `${Math.round((sessao.respostas.length / sessao.totalAgentes) * 100)}%` },
    { Campo: 'Custo Total (R$)', Valor: sessao.custoAtual.toFixed(2) },
    { Campo: 'Tokens Input', Valor: sessao.tokensInput },
    { Campo: 'Tokens Output', Valor: sessao.tokensOutput },
    { Campo: 'Data Início', Valor: sessao.iniciadaEm },
    { Campo: 'Data Fim', Valor: sessao.finalizadaEm || 'Em andamento' },
  ];
  const wsResumo = XLSX.utils.json_to_sheet(resumo);
  wsResumo['!cols'] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  // Planilha 2: Respostas Detalhadas
  const respostasDetalhadas: Record<string, unknown>[] = [];
  sessao.respostas.forEach((resposta) => {
    resposta.respostas.forEach((r) => {
      respostasDetalhadas.push({
        'ID Eleitor': resposta.eleitor_id,
        'Nome Eleitor': resposta.eleitor_nome,
        'ID Pergunta': r.pergunta_id,
        Resposta: String(r.resposta),
        'Tokens Usados': resposta.tokens_usados,
        'Custo (R$)': resposta.custo.toFixed(4),
        'Tempo (ms)': resposta.tempo_resposta_ms,
      });
    });
  });
  const wsRespostas = XLSX.utils.json_to_sheet(respostasDetalhadas);
  wsRespostas['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 80 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsRespostas, 'Respostas');

  // Planilha 3: Estatísticas por Eleitor
  const estatsPorEleitor = sessao.respostas.map((r) => ({
    'ID Eleitor': r.eleitor_id,
    'Nome': r.eleitor_nome,
    'Total Respostas': r.respostas.length,
    'Tokens Usados': r.tokens_usados,
    'Custo (R$)': r.custo.toFixed(4),
    'Tempo Médio (ms)': Math.round(r.tempo_resposta_ms / r.respostas.length),
  }));
  const wsStats = XLSX.utils.json_to_sheet(estatsPorEleitor);
  wsStats['!cols'] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas');

  // Gerar nome do arquivo
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `resultado-pesquisa-${sessao.id}-${dataAtual}.xlsx`;

  // Fazer download
  XLSX.writeFile(wb, arquivo);
}

/**
 * Exporta dados completos para Excel (múltiplas planilhas)
 */
export function exportarDadosCompletos(dados: DadosExportacao, nomeArquivo?: string): void {
  const wb = XLSX.utils.book_new();

  // Adicionar eleitores se existirem
  if (dados.eleitores && dados.eleitores.length > 0) {
    const eleitoresFormatados = dados.eleitores.map((e) => ({
      ID: e.id,
      Nome: e.nome,
      Idade: e.idade,
      Gênero: e.genero,
      'Região Administrativa': e.regiao_administrativa,
      'Orientação Política': e.orientacao_politica,
      Religião: e.religiao,
      'Interesse Político': e.interesse_politico,
    }));
    const wsEleitores = XLSX.utils.json_to_sheet(eleitoresFormatados);
    XLSX.utils.book_append_sheet(wb, wsEleitores, 'Eleitores');
  }

  // Adicionar estatísticas se existirem
  if (dados.estatisticas) {
    const statsArray = Object.entries(dados.estatisticas).map(([chave, valor]) => ({
      Métrica: chave,
      Valor: String(valor),
    }));
    const wsStats = XLSX.utils.json_to_sheet(statsArray);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estatísticas');
  }

  // Gerar nome do arquivo
  const dataAtual = new Date().toISOString().split('T')[0];
  const arquivo = nomeArquivo || `dados-completos-${dataAtual}.xlsx`;

  // Fazer download
  XLSX.writeFile(wb, arquivo);
}

// Funções auxiliares de formatação
function formatarCluster(cluster: string): string {
  const map: Record<string, string> = {
    G1_alta: 'G1 - Alta Renda',
    G2_media_alta: 'G2 - Média-Alta',
    G3_media_baixa: 'G3 - Média-Baixa',
    G4_baixa: 'G4 - Baixa Renda',
  };
  return map[cluster] || cluster;
}

function formatarEscolaridade(escolaridade: string): string {
  const map: Record<string, string> = {
    fundamental_ou_sem_instrucao: 'Fundamental ou Sem Instrução',
    medio_completo_ou_sup_incompleto: 'Médio Completo ou Superior Incompleto',
    superior_completo_ou_pos: 'Superior Completo ou Pós-Graduação',
  };
  return map[escolaridade] || escolaridade;
}
