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
function gerarPromptBase(quantidade: number, regiao?: string, cluster?: ClusterSocioeconomico): string {
  return `
Você é um gerador de perfis de eleitores sintéticos do Distrito Federal para pesquisa científica.

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

  return `
Você é Claude Opus 4.5, o modelo mais avançado da Anthropic. Sua tarefa é gerar eleitores sintéticos ESTRATÉGICOS para CORRIGIR vieses identificados em uma amostra de pesquisa eleitoral do Distrito Federal.

═══════════════════════════════════════════════════════════════════════════════
CONTEXTO DA CORREÇÃO
═══════════════════════════════════════════════════════════════════════════════

Uma análise de validação estatística identificou que a amostra atual está SUB-REPRESENTADA nas seguintes categorias. Você deve gerar eleitores que preencham essas lacunas:

${categoriasParaGerar.map((c) => `
▸ ${c.label}: "${c.labelCategoria}"
  → Necessários: ~${c.quantidade} eleitores para equilibrar a amostra
  → Campo no JSON: ${c.variavel} = "${c.categoria}"
`).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
INSTRUÇÕES DE GERAÇÃO CORRETIVA
═══════════════════════════════════════════════════════════════════════════════

GERE EXATAMENTE ${quantidade} ELEITORES que atendam às características sub-representadas acima.

REGRAS CRÍTICAS:
1. TODOS os eleitores devem ter pelo menos uma das características listadas acima
2. Distribua proporcionalmente conforme a quantidade sugerida para cada categoria
3. Mantenha a COERÊNCIA interna: um eleitor de 65+ anos provavelmente é aposentado
4. Varie os outros atributos para manter diversidade (não criar clones)
5. Histórias de vida devem explicar as características escolhidas

CATEGORIAS ESPECÍFICAS E COMO MAPEAR:

genero: "masculino" ou "feminino"
cor_raca: "branca", "parda", "preta", "amarela", "indigena"
faixa_etaria (use campo idade):
  - "16-24": idade entre 16-24
  - "25-34": idade entre 25-34
  - "35-44": idade entre 35-44
  - "45-54": idade entre 45-54
  - "55-64": idade entre 55-64
  - "65+": idade >= 65
escolaridade: "fundamental_incompleto", "fundamental_completo", "medio_completo_ou_sup_incompleto", "superior_completo_ou_pos"
renda_salarios_minimos: "ate_1", "mais_de_1_ate_2", "mais_de_2_ate_5", "mais_de_5_ate_10", "mais_de_10"
religiao: "catolica", "evangelica", "espirita", "sem_religiao", "umbanda_candomble", "outras"
estado_civil: "solteiro(a)", "casado(a)", "divorciado(a)", "viuvo(a)", "uniao_estavel"
orientacao_politica: "esquerda", "centro-esquerda", "centro", "centro-direita", "direita"
interesse_politico: "baixo", "medio", "alto"
posicao_bolsonaro: "apoiador_forte", "apoiador_moderado", "neutro", "critico_moderado", "critico_forte"
cluster_socioeconomico: "G1_alta", "G2_media_alta", "G3_media_baixa", "G4_baixa"
ocupacao_vinculo: "clt", "servidor_publico", "autonomo", "empresario", "informal", "desempregado", "aposentado", "estudante"
meio_transporte: "onibus", "carro", "moto", "bicicleta", "metro", "a_pe", "nao_se_aplica"
estilo_decisao: "identitario", "pragmatico", "moral", "economico", "emocional"
tolerancia_nuance: "baixa", "media", "alta"

═══════════════════════════════════════════════════════════════════════════════
EXEMPLO DE COERÊNCIA
═══════════════════════════════════════════════════════════════════════════════

Se precisamos de mais eleitores de faixa etária "65+" e religião "católica":
→ Criar um aposentado de 68 anos, católico praticante, que mora em Taguatinga
→ Sua história pode mencionar décadas de trabalho no serviço público
→ Seus valores incluem "família", "tradição", "estabilidade"
→ Provavelmente tem posição mais conservadora em costumes

═══════════════════════════════════════════════════════════════════════════════
REGIÕES ADMINISTRATIVAS DO DF (usar com coerência)
═══════════════════════════════════════════════════════════════════════════════

Alta renda (G1): Lago Sul, Lago Norte, Park Way, Sudoeste
Média-alta (G2): Plano Piloto, Águas Claras, Guará
Média-baixa (G3): Taguatinga, Gama, Sobradinho, Vicente Pires
Baixa (G4): Ceilândia, Samambaia, Recanto das Emas, Santa Maria, Planaltina

═══════════════════════════════════════════════════════════════════════════════
VIESES COGNITIVOS (incluir 2-3 por eleitor)
═══════════════════════════════════════════════════════════════════════════════
confirmacao, disponibilidade, ancoragem, tribalismo, aversao_perda, efeito_halo, efeito_manada`;
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
      prompt = gerarPromptBase(quantidade, regiao, cluster) + FORMATO_JSON;
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
