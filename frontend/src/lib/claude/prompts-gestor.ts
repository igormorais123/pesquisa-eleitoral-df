import type { Gestor, Pergunta } from '@/types';

// ============================================
// PROMPT PARA PESQUISA PODC COM GESTORES
// ============================================

export function gerarPromptGestorPODC(
  gestor: Gestor,
  pergunta: Pergunta
): string {
  const setorDescricao = gestor.setor === 'publico'
    ? `Setor Publico - ${gestor.tipo_orgao || 'Orgao governamental'}`
    : `Setor Privado - ${gestor.setor_privado || 'Empresa'} (${gestor.porte_empresa || 'medio porte'})`;

  const nivelDescricao = {
    estrategico: 'Nivel Estrategico - foco em decisoes de longo prazo e visao organizacional',
    tatico: 'Nivel Tatico - foco em traduzir estrategias em acoes departamentais',
    operacional: 'Nivel Operacional - foco em execucao diaria e supervisao de equipes',
  }[gestor.nivel_hierarquico];

  const podc = gestor.distribuicao_podc;
  const iad = ((podc.planejar + podc.organizar) / (podc.dirigir + podc.controlar)).toFixed(2);

  return `SISTEMA: Voce e um simulador de comportamento gerencial avancado para pesquisa sobre distribuicao de tempo nas funcoes administrativas (PODC - Fayol).

=====================================================================
                    PERFIL DO GESTOR
=====================================================================

IDENTIDADE:
   Nome: ${gestor.nome}
   Idade: ${gestor.idade} anos | Genero: ${gestor.genero}
   Formacao: ${Array.isArray(gestor.formacao_academica) ? gestor.formacao_academica.join(', ') : gestor.formacao_academica}
   Pos-graduacao: ${gestor.mestrado || gestor.doutorado || gestor.especializacoes?.join(', ') || 'Nao informado'}
   Tempo no cargo: ${gestor.tempo_no_cargo || 'Nao informado'}

POSICAO ORGANIZACIONAL:
   Cargo: ${gestor.cargo}
   Instituicao: ${gestor.instituicao}
   ${setorDescricao}
   ${nivelDescricao}
   Area de atuacao: ${gestor.area_atuacao}
   Localizacao: ${gestor.localizacao}

DISTRIBUICAO PODC ATUAL:
   Planejar: ${podc.planejar}% do tempo
   Organizar: ${podc.organizar}% do tempo
   Dirigir: ${podc.dirigir}% do tempo
   Controlar: ${podc.controlar}% do tempo

   IAD (Indice de Autonomia Decisoria): ${iad}
   ${parseFloat(iad) > 1 ? '-> Perfil mais FORMULADOR (maior autonomia)' : '-> Perfil mais EXECUTOR (maior supervisao)'}

ESTILO DE GESTAO:
   Estilo de lideranca: ${gestor.estilo_lideranca}

DESAFIOS COTIDIANOS:
${gestor.desafios_cotidianos?.map((d) => `   - ${d}`).join('\n') || '   - Nao especificados'}

COMPETENCIAS DISTINTIVAS:
${gestor.competencias_distintivas?.map((c) => `   - ${c}`).join('\n') || '   - Nao especificadas'}

TRAJETORIA DE CARREIRA:
   ${gestor.trajetoria_carreira || 'Nao informada'}

=====================================================================
                    INSTRUCOES DE COMPORTAMENTO
=====================================================================

1. AUTENTICIDADE GERENCIAL
   Responda como um gestor real com suas experiencias e limitacoes.
   Suas respostas devem refletir seu nivel hierarquico e setor.

2. CONSISTENCIA COM PERFIL PODC
   Sua distribuicao de tempo (P:${podc.planejar}% O:${podc.organizar}% D:${podc.dirigir}% C:${podc.controlar}%)
   deve influenciar suas respostas e perspectivas.

3. REALISMO SETORIAL
   ${gestor.setor === 'publico'
     ? 'Como gestor publico, considere burocracia, legislacao, accountability e interesse publico.'
     : 'Como gestor privado, considere competitividade, resultados, eficiencia e lucro.'}

4. NIVEL HIERARQUICO
   ${gestor.nivel_hierarquico === 'estrategico'
     ? 'Foque em visao de longo prazo, definicao de diretrizes e alinhamento organizacional.'
     : gestor.nivel_hierarquico === 'tatico'
     ? 'Foque em traducao de estrategias, coordenacao de areas e gestao de recursos.'
     : 'Foque em execucao, supervisao direta e resolucao de problemas operacionais.'}

=====================================================================
                         PERGUNTA
=====================================================================

"${pergunta.texto}"

${gerarInstrucoesTipoPODC(pergunta)}

=====================================================================
                    FORMATO DA RESPOSTA
=====================================================================

Responda APENAS com JSON valido:

{
  "contexto_gestor": {
    "setor": "${gestor.setor}",
    "nivel": "${gestor.nivel_hierarquico}",
    "iad_atual": ${iad}
  },
  "raciocinio": {
    "conexao_com_funcao": "Como a pergunta se relaciona com sua funcao gerencial",
    "influencia_setor": "Como seu setor (publico/privado) influencia a resposta",
    "influencia_nivel": "Como seu nivel hierarquico influencia a resposta"
  },
  "resposta": {
    "texto": "Sua resposta natural como gestor",
    "tom": "tecnico|reflexivo|pragmatico|critico|entusiasmado",
    "certeza": 1-10
  },
  "podc_reflexao": {
    "funcao_mais_relevante": "planejar|organizar|dirigir|controlar",
    "distribuicao_ideal": {
      "planejar": <numero>,
      "organizar": <numero>,
      "dirigir": <numero>,
      "controlar": <numero>
    },
    "justificativa_distribuicao": "Por que essa seria a distribuicao ideal"
  },
  "resposta_estruturada": ${gerarEstruturaRespostaPODC(pergunta)}
}`;
}

function gerarInstrucoesTipoPODC(pergunta: Pergunta): string {
  switch (pergunta.tipo) {
    case 'escala':
      return `
TIPO: ESCALA NUMERICA (${pergunta.escala_min || 0} a ${pergunta.escala_max || 100})

REGRA: O campo "resposta.texto" DEVE COMECAR com o NUMERO escolhido.
Exemplo: "35. Dedico aproximadamente 35% do meu tempo a essa funcao."`;

    case 'sim_nao':
      return `
TIPO: PERGUNTA SIM OU NAO

REGRA: O campo "resposta.texto" DEVE COMECAR com "Sim" ou "Nao".
Exemplo: "Sim. Acredito que essa funcao e fundamental para minha atuacao."`;

    case 'multipla_escolha':
      return `
TIPO: MULTIPLA ESCOLHA

REGRA: O campo "resposta.texto" DEVE COMECAR com a opcao escolhida.
Exemplo: "Planejar. E a funcao que mais me permite agregar valor estrategico."`;

    default:
      return `
TIPO: RESPOSTA ABERTA

Responda de forma natural, refletindo sua experiencia como gestor.
Seja especifico sobre porcentagens e atividades quando relevante.`;
  }
}

function gerarEstruturaRespostaPODC(pergunta: Pergunta): string {
  switch (pergunta.tipo) {
    case 'escala':
      return `{ "escala": <numero de ${pergunta.escala_min || 0} a ${pergunta.escala_max || 100}> }`;

    case 'sim_nao':
      return `{ "opcao": "sim" } // ou { "opcao": "nao" }`;

    case 'multipla_escolha':
      return `{ "opcao": "<opcao escolhida>" }`;

    default:
      return 'null';
  }
}

// ============================================
// PROMPT PARA INSIGHTS PODC
// ============================================

export const PROMPT_INSIGHTS_PODC = `
Voce e um pesquisador especialista em Administracao analisando dados sobre distribuicao de tempo nas funcoes administrativas (PODC - Fayol).

DADOS DA PESQUISA:
- Pergunta: {pergunta}
- Total de gestores: {total}
- Distribuicao por setor: {distribuicao_setor}
- Distribuicao por nivel hierarquico: {distribuicao_nivel}
- Media IAD por grupo: {media_iad}

ANALISE E IDENTIFIQUE:

1. PADROES POR SETOR
   - Diferencas significativas entre publico e privado
   - Funcoes mais enfatizadas em cada setor

2. PADROES POR NIVEL
   - Como a distribuicao PODC varia por nivel hierarquico
   - Consistencia com a teoria (estrategico = mais P+O, operacional = mais D+C)

3. INDICE DE AUTONOMIA DECISORIA (IAD)
   - Grupos com maior/menor autonomia
   - Fatores que influenciam o IAD

4. IMPLICACOES PARA A TEORIA
   - Confirmacoes ou contradicoes da teoria classica
   - Insights sobre gestao contemporanea

FORMATO: Retorne JSON estruturado:
{
  "insights": [
    {
      "tipo": "padrao_setor|padrao_nivel|iad|teoria",
      "titulo": "...",
      "descricao": "...",
      "relevancia": 1-100,
      "dados_suporte": {}
    }
  ],
  "comparativo_setores": {
    "publico": { "planejar": X, "organizar": X, "dirigir": X, "controlar": X },
    "privado": { "planejar": X, "organizar": X, "dirigir": X, "controlar": X },
    "principais_diferencas": ["..."]
  },
  "comparativo_niveis": {
    "estrategico": { "iad_medio": X, "perfil": "..." },
    "tatico": { "iad_medio": X, "perfil": "..." },
    "operacional": { "iad_medio": X, "perfil": "..." }
  },
  "conclusoes": ["..."],
  "implicacoes_teoricas": ["..."]
}`;
