import type { Gestor, Pergunta } from '@/types';

// ============================================
// PROMPTS PARA PESQUISA PODC COM GESTORES
// Baseado na metodologia do artigo "Distribuição de Tempo entre Funções Administrativas"
// ============================================

/**
 * Estrutura de resposta esperada do gestor
 * Formato estruturado para análise estatística
 */
export interface RespostaPODCEstruturada {
  // Distribuição percentual (deve somar 100%)
  distribuicao_podc: {
    planejar: number;
    organizar: number;
    dirigir: number;
    controlar: number;
  };

  // Horas semanais por função
  horas_semanais: {
    total: number;
    planejar: number;
    organizar: number;
    dirigir: number;
    controlar: number;
  };

  // Frequência de atividades (1-5 escala)
  frequencia_atividades: {
    planejar: Record<string, number>;
    organizar: Record<string, number>;
    dirigir: Record<string, number>;
    controlar: Record<string, number>;
  };

  // Índice de Autonomia Decisória
  iad: number;

  // Ranking das funções
  ranking_importancia: string[];

  // Fatores limitantes
  fatores_limitantes: string[];

  // Justificativa
  justificativa: string;

  // Distribuição ideal
  distribuicao_ideal: {
    planejar: number;
    organizar: number;
    dirigir: number;
    controlar: number;
  };

  // Respostas às perguntas específicas
  respostas_perguntas: Array<{
    pergunta_id: string;
    resposta: string | number;
  }>;
}

/**
 * Gera prompt completo para pesquisa PODC com questionário completo
 * Este é o prompt principal baseado na metodologia do artigo
 */
export function gerarPromptGestorPODCCompleto(
  gestor: Gestor,
  perguntas: Pergunta[]
): string {
  const nivelHierarquico = gestor.nivel_hierarquico || 'tatico';
  const setor = gestor.setor || 'publico';
  const podc = gestor.distribuicao_podc || { planejar: 25, organizar: 25, dirigir: 25, controlar: 25 };

  return `
=====================================================================
          SIMULAÇÃO AGÊNTICA - PESQUISA PODC COM GESTORES
          Metodologia: Distribuição de Tempo nas Funções Administrativas
=====================================================================

VOCÊ É: ${gestor.nome}

ASSUMA COMPLETAMENTE esta identidade. Responda como se FOSSE este gestor,
com suas características, experiências e perspectivas específicas.

=====================================================================
                      PERFIL COMPLETO DO GESTOR
=====================================================================

IDENTIDADE:
   Nome: ${gestor.nome}
   Idade: ${gestor.idade} anos | Gênero: ${gestor.genero}
   Formação: ${Array.isArray(gestor.formacao_academica) ? gestor.formacao_academica.join(', ') : gestor.formacao_academica || 'Não informada'}
   Pós-graduação: ${gestor.mestrado || gestor.doutorado || gestor.especializacoes?.join(', ') || 'Não informado'}

POSIÇÃO ORGANIZACIONAL:
   Cargo: ${gestor.cargo}
   Nível Hierárquico: ${nivelHierarquico.toUpperCase()}
   Setor: ${setor === 'publico' ? 'PÚBLICO FEDERAL' : 'PRIVADO'}
   Órgão/Empresa: ${gestor.instituicao || 'Não especificado'}
   Área de Atuação: ${gestor.area_atuacao || 'Não especificada'}
   Tempo no cargo: ${gestor.tempo_no_cargo || 'Não informado'}

CONTEXTO ORGANIZACIONAL:
   ${'Contexto organizacional típico do setor ' + setor + ' em nível ' + nivelHierarquico + '.'}

TRAJETÓRIA DE CARREIRA:
   ${gestor.trajetoria_carreira || 'Trajetória não informada. Considere uma trajetória típica para o cargo.'}

DESAFIOS COTIDIANOS:
${gestor.desafios_cotidianos?.map((d) => `   - ${d}`).join('\n') || '   - Desafios típicos do nível ' + nivelHierarquico}

COMPETÊNCIAS DISTINTIVAS:
${gestor.competencias_distintivas?.map((c) => `   - ${c}`).join('\n') || '   - Competências típicas do cargo'}

ESTILO DE LIDERANÇA:
   ${gestor.estilo_lideranca || 'Estilo adaptativo conforme situação'}

FERRAMENTAS DE GESTÃO:
${gestor.ferramentas_gestao?.map((f) => `   - ${f}`).join('\n') || '   - Ferramentas padrão do setor'}

PRESSÕES ESPECÍFICAS DO CARGO:
${gestor.pressoes_especificas?.map((p) => `   - ${p}`).join('\n') || '   - Pressões típicas do nível ' + nivelHierarquico}

DISTRIBUIÇÃO PODC ATUAL (referência):
   Planejar: ${podc.planejar}%
   Organizar: ${podc.organizar}%
   Dirigir: ${podc.dirigir}%
   Controlar: ${podc.controlar}%

=====================================================================
                    DEFINIÇÕES OPERACIONAIS PODC
=====================================================================

Para responder ao questionário, considere estas definições claras:

**PLANEJAR (P)** - Atividades de definição de objetivos, estratégias e planos
   • Definir metas e objetivos de curto, médio e longo prazo
   • Elaborar planos de ação e estratégias
   • Participar de reuniões de planejamento estratégico
   • Analisar cenários e tendências
   • Priorizar demandas e alocar recursos futuros
   • Elaborar cronogramas e projetos

**ORGANIZAR (O)** - Estruturação de recursos, processos e sistemas
   • Estruturar equipes e distribuir tarefas
   • Desenhar ou redesenhar processos de trabalho
   • Organizar documentos, informações e sistemas
   • Padronizar procedimentos operacionais
   • Gerenciar recursos materiais e orçamentários
   • Elaborar normas e manuais

**DIRIGIR (D)** - Liderança, coordenação, comunicação e execução
   • Liderar reuniões e conduzir equipes
   • Tomar decisões operacionais no dia a dia
   • Comunicar-se com stakeholders internos e externos
   • Negociar e articular com outras áreas/órgãos
   • Resolver conflitos e problemas emergentes
   • Motivar e desenvolver a equipe
   • Representar a área em fóruns e eventos

**CONTROLAR (C)** - Monitoramento, avaliação e correção de desvios
   • Acompanhar indicadores e metas
   • Revisar relatórios e prestações de contas
   • Verificar conformidade com normas e regulamentos
   • Auditar processos e identificar não-conformidades
   ${setor === 'publico' ? '• Responder a órgãos de controle (TCU, CGU, MPF)' : '• Responder a auditorias e compliance'}
   • Corrigir desvios e implementar melhorias

=====================================================================
                      MODO DE RESPOSTA AGÊNTICA
=====================================================================

1. ASSUMA completamente a identidade deste gestor
2. CONSIDERE seu contexto organizacional específico
3. RESPONDA com base nas características do seu perfil
4. SEJA CONSISTENTE com seu nível hierárquico (${nivelHierarquico})
5. REFLITA as pressões e desafios típicos do seu cargo
6. USE números REALISTAS baseados na sua rotina

PADRÕES TÍPICOS POR NÍVEL HIERÁRQUICO:
${nivelHierarquico === 'estrategico' ? `
- ESTRATÉGICO: Mais tempo em P+O (formulação), menos em D+C
- IAD esperado: > 1.0 (perfil proativo/formulador)
- Horizonte: longo prazo, visão institucional` : ''}
${nivelHierarquico === 'tatico' ? `
- TÁTICO: Equilíbrio entre as 4 funções
- IAD esperado: próximo de 1.0 (equilibrado)
- Horizonte: médio prazo, tradução de estratégias` : ''}
${nivelHierarquico === 'operacional' ? `
- OPERACIONAL: Mais tempo em D+C (execução), menos em P+O
- IAD esperado: < 1.0 (perfil reativo/executor)
- Horizonte: curto prazo, execução diária` : ''}

DIFERENÇAS SETORIAIS:
${setor === 'publico' ? `
- SETOR PÚBLICO: Maior ênfase em CONTROLAR (accountability, órgãos de controle)
- Burocracia, legalidade, interesse público
- Pressões de TCU, CGU, MPF` : `
- SETOR PRIVADO: Maior ênfase em ORGANIZAR (eficiência, competitividade)
- Resultados, lucro, market share
- Pressões de acionistas, mercado`}

=====================================================================
                         QUESTIONÁRIO PODC
=====================================================================

Responda o questionário abaixo considerando uma SEMANA TÍPICA de trabalho.

${perguntas.map((p, i) => `
--- PERGUNTA ${i + 1} (ID: ${p.id}) ---
${p.texto}
${p.tipo === 'escala' ? `(Escala: ${p.escala_min || 0} a ${p.escala_max || 10})` : ''}
${p.opcoes?.length ? `Opções: ${p.opcoes.join(' | ')}` : ''}
`).join('\n')}

=====================================================================
                    FORMATO DE RESPOSTA OBRIGATÓRIO
=====================================================================

Você DEVE responder em formato JSON estruturado. Este formato permite
análise estatística dos dados coletados.

{
  "gestor_info": {
    "nome": "${gestor.nome}",
    "setor": "${setor}",
    "nivel": "${nivelHierarquico}"
  },
  "distribuicao_podc": {
    "planejar": <número 0-100>,
    "organizar": <número 0-100>,
    "dirigir": <número 0-100>,
    "controlar": <número 0-100>
  },
  "horas_semanais": {
    "total": <número total de horas trabalhadas por semana>,
    "planejar": <horas em planejamento>,
    "organizar": <horas em organização>,
    "dirigir": <horas em direção>,
    "controlar": <horas em controle>
  },
  "frequencia_atividades": {
    "planejar": {
      "definir_metas": <1-5>,
      "elaborar_planos": <1-5>,
      "reunioes_planejamento": <1-5>,
      "analisar_cenarios": <1-5>
    },
    "organizar": {
      "estruturar_equipes": <1-5>,
      "redesenhar_processos": <1-5>,
      "organizar_informacoes": <1-5>,
      "padronizar_procedimentos": <1-5>
    },
    "dirigir": {
      "liderar_reunioes": <1-5>,
      "tomar_decisoes": <1-5>,
      "comunicar_stakeholders": <1-5>,
      "resolver_conflitos": <1-5>
    },
    "controlar": {
      "acompanhar_indicadores": <1-5>,
      "revisar_relatorios": <1-5>,
      "verificar_conformidade": <1-5>,
      "responder_orgaos_controle": <1-5>
    }
  },
  "ranking_importancia": ["<1ª função mais importante>", "<2ª>", "<3ª>", "<4ª>"],
  "fatores_limitantes": ["<fator 1>", "<fator 2>", "..."],
  "justificativa": "<explicação de 2-3 parágrafos sobre sua distribuição de tempo, considerando seu contexto organizacional, desafios e nível hierárquico>",
  "distribuicao_ideal": {
    "planejar": <% ideal>,
    "organizar": <% ideal>,
    "dirigir": <% ideal>,
    "controlar": <% ideal>
  },
  "respostas_perguntas": [
    ${perguntas.map((p) => `{
      "pergunta_id": "${p.id}",
      "resposta": "<sua resposta para esta pergunta>"
    }`).join(',\n    ')}
  ]
}

REGRAS IMPORTANTES:
- A soma de distribuicao_podc DEVE ser exatamente 100
- A soma de distribuicao_ideal DEVE ser exatamente 100
- Frequência: 1=Nunca, 2=Raramente, 3=Mensalmente, 4=Semanalmente, 5=Diariamente
- Seja REALISTA com base no seu perfil de gestor ${nivelHierarquico}
- Considere as especificidades do setor ${setor}
- Suas respostas devem ser CONSISTENTES entre si

Responda APENAS com o JSON válido, sem texto adicional antes ou depois.
`;
}

/**
 * Prompt simplificado para uma única pergunta (compatibilidade com sistema existente)
 */
export function gerarPromptGestorPODC(gestor: Gestor, pergunta: Pergunta): string {
  const setorDescricao = gestor.setor === 'publico'
    ? `Setor Publico - ${gestor.tipo_orgao || 'Orgao governamental'}`
    : `Setor Privado - ${gestor.setor_privado || 'Empresa'} (${gestor.porte_empresa || 'medio porte'})`;

  const nivelDescricao = {
    estrategico: 'Nivel Estrategico - foco em decisoes de longo prazo e visao organizacional',
    tatico: 'Nivel Tatico - foco em traduzir estrategias em acoes departamentais',
    operacional: 'Nivel Operacional - foco em execucao diaria e supervisao de equipes',
  }[gestor.nivel_hierarquico || 'tatico'];

  const podc = gestor.distribuicao_podc || { planejar: 25, organizar: 25, dirigir: 25, controlar: 25 };
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
Opcoes: ${pergunta.opcoes?.join(' | ') || 'Nenhuma opcao definida'}

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

/**
 * Gera o questionário completo PODC baseado na metodologia do artigo
 */
export function gerarQuestionarioPODCCompleto(): Pergunta[] {
  return [
    // BLOCO 1: PERFIL DA JORNADA
    {
      id: 'jornada_1',
      texto: 'Quantas horas você trabalha em uma semana típica?',
      tipo: 'escala',
      escala_min: 30,
      escala_max: 70,
      obrigatoria: true,
    },
    {
      id: 'jornada_2',
      texto: 'Em uma escala de 1 a 5, quão previsível é sua rotina de trabalho semanal? (1=Muito imprevisível, 5=Muito previsível)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },

    // BLOCO 2: PLANEJAR
    {
      id: 'planejar_1',
      texto: 'Com que frequência você define ou revisa metas e objetivos para sua área? (1=Nunca, 5=Diariamente)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },
    {
      id: 'planejar_2',
      texto: 'Quantas horas por semana você dedica a atividades de planejamento estratégico?',
      tipo: 'escala',
      escala_min: 0,
      escala_max: 30,
      obrigatoria: true,
    },
    {
      id: 'planejar_3',
      texto: 'Qual o horizonte temporal predominante do seu planejamento?',
      tipo: 'multipla_escolha',
      opcoes: ['Diário/Semanal', 'Mensal', 'Trimestral', 'Anual', 'Plurianual (2+ anos)'],
      obrigatoria: true,
    },

    // BLOCO 3: ORGANIZAR
    {
      id: 'organizar_1',
      texto: 'Com que frequência você estrutura ou reestrutura processos de trabalho? (1=Nunca, 5=Diariamente)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },
    {
      id: 'organizar_2',
      texto: 'Quantas horas por semana você dedica a atividades de organização e estruturação?',
      tipo: 'escala',
      escala_min: 0,
      escala_max: 30,
      obrigatoria: true,
    },
    {
      id: 'organizar_3',
      texto: 'Quanto tempo você gasta organizando informações e documentos versus organizando pessoas e equipes?',
      tipo: 'multipla_escolha',
      opcoes: ['Mais informações/documentos', 'Igual', 'Mais pessoas/equipes'],
      obrigatoria: true,
    },

    // BLOCO 4: DIRIGIR
    {
      id: 'dirigir_1',
      texto: 'Com que frequência você lidera reuniões ou conduz sua equipe? (1=Nunca, 5=Diariamente)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },
    {
      id: 'dirigir_2',
      texto: 'Quantas horas por semana você dedica a atividades de liderança e direção?',
      tipo: 'escala',
      escala_min: 0,
      escala_max: 40,
      obrigatoria: true,
    },
    {
      id: 'dirigir_3',
      texto: 'Qual seu nível de autonomia para tomar decisões no dia a dia? (1=Muito baixo, 5=Muito alto)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },
    {
      id: 'dirigir_4',
      texto: 'Aproximadamente quantas interações (reuniões, conversas, emails importantes) você tem por dia?',
      tipo: 'escala',
      escala_min: 0,
      escala_max: 50,
      obrigatoria: true,
    },

    // BLOCO 5: CONTROLAR
    {
      id: 'controlar_1',
      texto: 'Com que frequência você acompanha indicadores e metas? (1=Nunca, 5=Diariamente)',
      tipo: 'escala',
      escala_min: 1,
      escala_max: 5,
      obrigatoria: true,
    },
    {
      id: 'controlar_2',
      texto: 'Quantas horas por semana você dedica a atividades de controle e monitoramento?',
      tipo: 'escala',
      escala_min: 0,
      escala_max: 30,
      obrigatoria: true,
    },
    {
      id: 'controlar_3',
      texto: 'Com que frequência você responde a demandas de órgãos de controle (TCU, CGU, auditorias, compliance)?',
      tipo: 'multipla_escolha',
      opcoes: ['Nunca', 'Raramente', 'Mensalmente', 'Semanalmente', 'Diariamente'],
      obrigatoria: true,
    },

    // BLOCO 6: VALIDAÇÃO CRUZADA
    {
      id: 'validacao_1',
      texto: 'Ordene as 4 funções administrativas da que você mais dedica tempo para a que menos dedica: Planejar (P), Organizar (O), Dirigir (D), Controlar (C). Responda no formato: 1º=X, 2º=Y, 3º=Z, 4º=W',
      tipo: 'aberta',
      obrigatoria: true,
    },
    {
      id: 'validacao_2',
      texto: 'Informe a distribuição percentual aproximada do seu tempo entre as 4 funções (deve somar 100%): Formato: P=X%, O=Y%, D=Z%, C=W%',
      tipo: 'aberta',
      obrigatoria: true,
    },
    {
      id: 'validacao_3',
      texto: 'Se você pudesse redistribuir seu tempo de forma ideal, como seria? Formato: P=X%, O=Y%, D=Z%, C=W%',
      tipo: 'aberta',
      obrigatoria: true,
    },
    {
      id: 'validacao_4',
      texto: 'Quais são os principais fatores que impedem você de ter a distribuição ideal de tempo? (Liste até 5 fatores)',
      tipo: 'aberta',
      obrigatoria: true,
    },
  ];
}

/**
 * Calcula o Índice de Autonomia Decisória (IAD)
 * IAD = (Planejar + Organizar) / (Dirigir + Controlar)
 * IAD > 1 = Proativo (formulador) | IAD < 1 = Reativo (executor)
 */
export function calcularIAD(distribuicao: {
  planejar: number;
  organizar: number;
  dirigir: number;
  controlar: number;
}): number {
  const numerador = distribuicao.planejar + distribuicao.organizar;
  const denominador = distribuicao.dirigir + distribuicao.controlar;

  if (denominador === 0) return 0;
  return Number((numerador / denominador).toFixed(2));
}

/**
 * Classifica o perfil do gestor com base no IAD
 */
export function classificarPerfilIAD(iad: number): string {
  if (iad >= 1.5) return 'Altamente Proativo (Formulador)';
  if (iad >= 1.0) return 'Proativo';
  if (iad >= 0.7) return 'Equilibrado';
  if (iad >= 0.5) return 'Reativo';
  return 'Altamente Reativo (Executor)';
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
