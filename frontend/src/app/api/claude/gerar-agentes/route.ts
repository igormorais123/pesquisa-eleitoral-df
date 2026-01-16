import { NextRequest, NextResponse } from 'next/server';
import { chamarClaudeComRetry } from '@/lib/claude/client';
import type { Eleitor, ClusterSocioeconomico } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface DivergenciaCorretiva {
  variavel: string;
  labelVariavel: string;
  categoria: string;
  labelCategoria: string;
  quantidade: number;
}

interface RequestBody {
  quantidade: number;
  cluster?: ClusterSocioeconomico;
  regiao?: string;
  manterProporcoes?: boolean;
  modoCorretivo?: boolean;
  divergenciasParaCorrigir?: DivergenciaCorretiva[];
}

// Regiões administrativas do DF com proporções aproximadas
const REGIOES_DF = {
  'Ceilândia': 15,
  'Taguatinga': 10,
  'Samambaia': 9,
  'Plano Piloto': 8,
  'Águas Claras': 6,
  'Recanto das Emas': 5,
  'Gama': 5,
  'Santa Maria': 5,
  'Sobradinho': 4,
  'São Sebastião': 4,
  'Planaltina': 4,
  'Vicente Pires': 3,
  'Guará': 3,
  'Paranoá': 2,
  'Riacho Fundo': 2,
  'Núcleo Bandeirante': 2,
  'Brazlândia': 2,
  'Lago Sul': 1,
  'Lago Norte': 1,
  'Sudoeste/Octogonal': 1,
  'Cruzeiro': 1,
  'Jardim Botânico': 1,
  'SIA': 1,
  'SCIA/Estrutural': 1,
  'Park Way': 1,
  'Varjão': 0.5,
  'Fercal': 0.5,
  'Itapoã': 1,
  'Sol Nascente/Pôr do Sol': 3,
  'Arniqueira': 1,
};

/**
 * Gera o prompt base para criação de eleitores
 */
function gerarPromptBase(
  quantidade: number,
  regiao?: string,
  cluster?: ClusterSocioeconomico,
  manterProporcoes = true
): string {
  const instrucaoProporcoes = manterProporcoes
    ? `IMPORTANTE: Mantenha as proporções demográficas oficiais do DF conforme os dados abaixo.`
    : `Você pode variar as proporções livremente, sem seguir rigidamente os dados oficiais.`;

  return `
Você é um gerador de perfis de eleitores sintéticos do Distrito Federal para pesquisa científica.

${instrucaoProporcoes}

GERE ${quantidade} ELEITORES ÚNICOS seguindo estas regras:

1. DEMOGRÁFICAS DO DF:
${regiao ? `- FOCO NA REGIÃO: ${regiao}` : `- Distribuir pelas RAs: ${Object.entries(REGIOES_DF).slice(0, 10).map(([r, p]) => `${r} (${p}%)`).join(', ')}`}
${cluster ? `- FOCO NO CLUSTER: ${cluster}` : '- Variar entre G1_alta, G2_media_alta, G3_media_baixa, G4_baixa'}

2. CLUSTERS SOCIOECONÔMICOS:
- G1_alta (15%): Lago Sul, Lago Norte, Park Way, Sudoeste - Renda 10+ SM
- G2_media_alta (25%): Plano Piloto, Águas Claras, Guará - Renda 5-10 SM
- G3_media_baixa (35%): Taguatinga, Gama, Sobradinho - Renda 2-5 SM
- G4_baixa (25%): Ceilândia, Samambaia, Recanto das Emas - Renda até 2 SM

3. RELIGIÕES:
- 45% católica
- 30% evangelica
- 12% sem_religiao
- 8% espirita
- 5% outras (umbanda_candomble, judaica, outras)

4. ORIENTAÇÕES POLÍTICAS (variar bastante):
- esquerda, centro-esquerda, centro, centro-direita, direita

5. PROFISSÕES: Usar profissões REAIS e ESPECÍFICAS do DF:
- Servidores públicos (federais, distritais)
- Comerciantes, autônomos
- Profissionais liberais
- Trabalhadores informais
- Aposentados

6. VIESES COGNITIVOS (incluir pelo menos 2 por eleitor):
- confirmacao, disponibilidade, ancoragem, tribalismo, aversao_perda, efeito_halo, efeito_manada

7. CADA ELEITOR DEVE TER:
- Nome brasileiro realista (com sobrenome)
- História de vida coerente com background (2-3 frases)
- Instrução comportamental (como ele fala/age)
- Medos específicos relacionados à sua realidade
- Susceptibilidade a desinformação (1-10) coerente com perfil`;
}

/**
 * Gera o prompt específico para modo corretivo
 * Este prompt cria eleitores estratégicos para corrigir vieses estatísticos
 * mantendo absoluta coerência interna entre todos os atributos
 */
function gerarPromptCorretivo(
  quantidade: number,
  divergencias: DivergenciaCorretiva[]
): string {
  const categoriasParaGerar = divergencias.map((d) => ({
    variavel: d.variavel,
    label: d.labelVariavel,
    categoria: d.categoria,
    labelCategoria: d.labelCategoria,
    quantidade: d.quantidade,
  }));

  // Calcula distribuição proporcional
  const totalNecessario = categoriasParaGerar.reduce((acc, c) => acc + c.quantidade, 0);
  const proporcoes = categoriasParaGerar.map((c) => ({
    ...c,
    proporcao: Math.max(1, Math.round((c.quantidade / totalNecessario) * quantidade)),
  }));

  return `
Você é Claude Opus 4.5, o modelo mais avançado da Anthropic. Sua missão é gerar eleitores sintéticos ESTRATÉGICOS e COERENTES para corrigir vieses identificados em uma pesquisa eleitoral do Distrito Federal.

╔═══════════════════════════════════════════════════════════════════════════════╗
║                          CORREÇÃO DE VIESES AMOSTRAIS                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

A validação estatística identificou as seguintes categorias SUB-REPRESENTADAS:

${proporcoes.map((c) => `
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 ${c.label}: "${c.labelCategoria}"
│    → Gerar aproximadamente ${c.proporcao} eleitor(es) com ${c.variavel} = "${c.categoria}"
│    → Importância: ${c.quantidade} eleitores faltantes no total
└─────────────────────────────────────────────────────────────────────────────┘
`).join('')}

╔═══════════════════════════════════════════════════════════════════════════════╗
║                    QUANTIDADE TOTAL: ${quantidade} ELEITORES                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
REGRAS DE COERÊNCIA INTERNA - CRÍTICO!
═══════════════════════════════════════════════════════════════════════════════

Cada eleitor deve ser um PERSONAGEM SÓLIDO sem contradições. NUNCA crie eleitores com combinações impossíveis ou improváveis:

🔴 PROIBIÇÕES ABSOLUTAS (combinações impossíveis):
• Estudante de 65 anos com ocupacao_vinculo = "estudante" (improvável)
• Aposentado de 25 anos (impossível a menos que seja militar/especial - explicar)
• Renda "mais_de_10" com escolaridade "fundamental_incompleto" e ocupacao "informal"
• Cluster G1_alta morando em Ceilândia/Samambaia (contradição geográfica)
• Servidor público com renda "ate_1" (salários são maiores)
• Desempregado com renda "mais_de_10"

🟢 COERÊNCIAS OBRIGATÓRIAS:

1. IDADE ↔ OCUPAÇÃO:
   • 16-24: estudante, informal, desempregado, CLT início carreira
   • 25-44: qualquer ocupação ativa
   • 45-64: carreiras consolidadas, empresários, servidores sênior
   • 65+: aposentado (80% dos casos), alguns autônomos ou empresários

2. RENDA ↔ ESCOLARIDADE ↔ OCUPAÇÃO:
   • ate_1 / mais_de_1_ate_2: fundamental/médio, informal/desempregado/autônomo
   • mais_de_2_ate_5: médio/superior incompleto, CLT/autônomo
   • mais_de_5_ate_10: superior completo, servidor/empresário/profissional liberal
   • mais_de_10: superior/pós, empresário/servidor alto escalão/profissional sênior

3. CLUSTER ↔ REGIÃO:
   • G1_alta: APENAS Lago Sul, Lago Norte, Park Way, Sudoeste/Octogonal, Jardim Botânico
   • G2_media_alta: Plano Piloto, Águas Claras, Guará, Cruzeiro, Noroeste
   • G3_media_baixa: Taguatinga, Gama, Sobradinho, Vicente Pires, Núcleo Bandeirante
   • G4_baixa: Ceilândia, Samambaia, Recanto das Emas, Santa Maria, Planaltina, São Sebastião, Paranoá, Itapoã, Sol Nascente, SCIA/Estrutural

4. IDADE ↔ FILHOS:
   • 16-24: 0-1 filhos (mais comum 0)
   • 25-34: 0-2 filhos
   • 35-54: 1-3 filhos
   • 55+: 2-4 filhos (já adultos)

5. MEIO_TRANSPORTE ↔ CLUSTER:
   • G1/G2: carro (predominante), metro
   • G3: carro, moto, metro, onibus
   • G4: onibus (predominante), moto, a_pe, bicicleta

6. POSIÇÃO POLÍTICA ↔ PERFIL:
   • Evangélicos: tendência centro-direita/direita
   • Universitários jovens: tendência centro-esquerda/esquerda
   • Servidores públicos: distribuição variada
   • Empresários: tendência centro-direita/direita
   • Trabalhadores informais baixa renda: variado, muitos neutros

7. SUSCEPTIBILIDADE_DESINFORMACAO ↔ PERFIL:
   • Alta escolaridade: 1-4 (baixa susceptibilidade)
   • Média escolaridade: 3-6
   • Baixa escolaridade: 5-9
   • Idosos: tendência maior (6-9)
   • Jovens: variado, depende das fontes de informação

═══════════════════════════════════════════════════════════════════════════════
MAPEAMENTO EXATO DOS CAMPOS
═══════════════════════════════════════════════════════════════════════════════

genero: "masculino" | "feminino"
cor_raca: "branca" | "parda" | "preta" | "amarela" | "indigena"

faixa_etaria → campo "idade":
  • "16-24": gerar idade entre 16-24
  • "25-34": gerar idade entre 25-34
  • "35-44": gerar idade entre 35-44
  • "45-54": gerar idade entre 45-54
  • "55-64": gerar idade entre 55-64
  • "65+": gerar idade entre 65-85

escolaridade: "fundamental_incompleto" | "fundamental_completo" | "medio_completo_ou_sup_incompleto" | "superior_completo_ou_pos"

renda_salarios_minimos: "ate_1" | "mais_de_1_ate_2" | "mais_de_2_ate_5" | "mais_de_5_ate_10" | "mais_de_10"

religiao: "catolica" | "evangelica" | "espirita" | "sem_religiao" | "umbanda_candomble" | "outras"

estado_civil: "solteiro(a)" | "casado(a)" | "divorciado(a)" | "viuvo(a)" | "uniao_estavel"

orientacao_politica: "esquerda" | "centro-esquerda" | "centro" | "centro-direita" | "direita"

interesse_politico: "baixo" | "medio" | "alto"

posicao_bolsonaro: "apoiador_forte" | "apoiador_moderado" | "neutro" | "critico_moderado" | "critico_forte"

cluster_socioeconomico: "G1_alta" | "G2_media_alta" | "G3_media_baixa" | "G4_baixa"

ocupacao_vinculo: "clt" | "servidor_publico" | "autonomo" | "empresario" | "informal" | "desempregado" | "aposentado" | "estudante"

meio_transporte: "onibus" | "carro" | "moto" | "bicicleta" | "metro" | "a_pe" | "nao_se_aplica"

estilo_decisao: "identitario" | "pragmatico" | "moral" | "economico" | "emocional"

tolerancia_nuance: "baixa" | "media" | "alta"

═══════════════════════════════════════════════════════════════════════════════
ESTRUTURA DA HISTÓRIA DE VIDA
═══════════════════════════════════════════════════════════════════════════════

A historia_resumida deve:
1. Explicar como chegou à situação atual (trabalho, moradia)
2. Mencionar família/relações se relevante
3. Justificar posição política/valores
4. Ser específica do DF (nomes de lugares, referências locais)

Exemplos de locais de referência por região:
• Ceilândia: "perto do Centro Cultural", "próximo ao Sol Nascente"
• Taguatinga: "perto do Taguatinga Shopping", "na QNA"
• Plano Piloto: "na Asa Norte", "perto do Parque da Cidade"
• Águas Claras: "próximo ao Parque Ecológico"
• Samambaia: "perto da Feira do Produtor"

═══════════════════════════════════════════════════════════════════════════════
VIESES COGNITIVOS (2-3 por eleitor, coerentes com perfil)
═══════════════════════════════════════════════════════════════════════════════

• confirmacao: todos têm, mas forte em politizados
• disponibilidade: mais forte em quem consome muita mídia
• ancoragem: forte em pragmáticos/econômicos
• tribalismo: forte em identitários e extremos políticos
• aversao_perda: forte em idosos e conservadores
• efeito_halo: forte em menos escolarizados
• efeito_manada: forte em jovens e redes sociais

═══════════════════════════════════════════════════════════════════════════════
FONTES DE INFORMAÇÃO (coerentes com perfil)
═══════════════════════════════════════════════════════════════════════════════

• G1/G2 + alta escolaridade: jornais tradicionais, portais de notícias
• G3/G4: TV aberta, WhatsApp, redes sociais
• Jovens: Instagram, TikTok, YouTube
• Idosos: TV aberta, rádio, WhatsApp família
• Evangélicos: grupos de igreja, líderes religiosos`;
}

/**
 * Gera o formato JSON esperado
 */
const FORMATO_JSON = `

FORMATO DE SAÍDA: Retorne APENAS um array JSON de objetos com esta estrutura:
[
  {
    "id": "df-XXXX",
    "nome": "Nome Completo",
    "idade": 35,
    "genero": "masculino" ou "feminino",
    "cor_raca": "branca/parda/preta/indigena/amarela",
    "regiao_administrativa": "Nome da RA",
    "local_referencia": "perto de...",
    "cluster_socioeconomico": "G1_alta/G2_media_alta/G3_media_baixa/G4_baixa",
    "escolaridade": "fundamental_incompleto/fundamental_completo/medio_completo_ou_sup_incompleto/superior_completo_ou_pos",
    "profissao": "Profissão específica",
    "ocupacao_vinculo": "clt/servidor_publico/autonomo/empresario/informal/desempregado/aposentado/estudante",
    "renda_salarios_minimos": "ate_1/mais_de_1_ate_2/mais_de_2_ate_5/mais_de_5_ate_10/mais_de_10",
    "religiao": "catolica/evangelica/espirita/sem_religiao/umbanda_candomble/outras",
    "estado_civil": "solteiro(a)/casado(a)/divorciado(a)/viuvo(a)/uniao_estavel",
    "filhos": 2,
    "orientacao_politica": "esquerda/centro-esquerda/centro/centro-direita/direita",
    "posicao_bolsonaro": "apoiador_forte/apoiador_moderado/neutro/critico_moderado/critico_forte",
    "interesse_politico": "baixo/medio/alto",
    "tolerancia_nuance": "baixa/media/alta",
    "estilo_decisao": "identitario/pragmatico/moral/economico/emocional",
    "valores": ["valor1", "valor2", "valor3"],
    "preocupacoes": ["preocupacao1", "preocupacao2", "preocupacao3"],
    "medos": ["medo1", "medo2", "medo3"],
    "vieses_cognitivos": ["confirmacao", "disponibilidade"],
    "fontes_informacao": ["fonte1", "fonte2"],
    "susceptibilidade_desinformacao": 5,
    "meio_transporte": "onibus/carro/moto/bicicleta/metro/a_pe/nao_se_aplica",
    "tempo_deslocamento_trabalho": "ate_30min/30min_a_1h/1h_a_2h/mais_de_2h/nao_se_aplica",
    "voto_facultativo": false,
    "conflito_identitario": false,
    "historia_resumida": "História de 2-3 frases...",
    "instrucao_comportamental": "Como o eleitor fala e se comporta..."
  }
]`;

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      quantidade,
      cluster,
      regiao,
      manterProporcoes = true,
      modoCorretivo = false,
      divergenciasParaCorrigir = [],
    } = body;

    if (quantidade < 1 || quantidade > 50) {
      return NextResponse.json(
        { erro: 'Quantidade deve ser entre 1 e 50' },
        { status: 400 }
      );
    }

    // Gerar prompt apropriado baseado no modo
    let prompt: string;
    if (modoCorretivo && divergenciasParaCorrigir.length > 0) {
      prompt = gerarPromptCorretivo(quantidade, divergenciasParaCorrigir) + FORMATO_JSON;
    } else {
      prompt = gerarPromptBase(quantidade, regiao, cluster, manterProporcoes) + FORMATO_JSON;
    }

    const { conteudo, tokensInput, tokensOutput, custoReais } = await chamarClaudeComRetry(
      [{ role: 'user', content: prompt }],
      'opus',
      8000,
      3
    );

    // Parsear eleitores gerados
    let eleitoresGerados: Partial<Eleitor>[];
    try {
      const jsonMatch = conteudo.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        eleitoresGerados = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Array JSON não encontrado');
      }
    } catch (parseError) {
      console.error('Erro ao parsear eleitores:', parseError);
      return NextResponse.json(
        { erro: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    // Adicionar timestamps e validar
    const agora = new Date().toISOString();
    const eleitoresCompletos = eleitoresGerados.map((e, i) => ({
      ...e,
      id: e.id || `df-gen-${Date.now()}-${i}`,
      criado_em: agora,
      atualizado_em: agora,
    }));

    return NextResponse.json({
      sucesso: true,
      eleitores: eleitoresCompletos,
      total: eleitoresCompletos.length,
      custoReais,
      tokensUsados: { input: tokensInput, output: tokensOutput },
      modoCorretivo,
    });
  } catch (error) {
    console.error('Erro ao gerar agentes:', error);
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao gerar agentes' },
      { status: 500 }
    );
  }
}
