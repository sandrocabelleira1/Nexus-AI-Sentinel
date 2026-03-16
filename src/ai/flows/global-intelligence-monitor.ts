'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI com Google Search Grounding.
 * Corrigido para evitar conflito entre ferramentas e modo JSON.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  currentPrice: z.string(),
  expectedGainPercentage: z.string(),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string(),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  longTermOutlook: z.string(),
});

const GeopoliticalCausalitySchema = z.object({
  event: z.string(),
  identification: z.string(),
  mapping: z.array(z.string()),
  simulation: z.string(),
  prediction: z.string(),
});

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string(),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string(),
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string(),
  causalityLink: GeopoliticalCausalitySchema,
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  essentialText: z.string(),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string(),
  fullLocationRiskAnalysis: z.string(),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

// Prompt 1: Grounding (Pesquisa em Tempo Real)
const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (SENTINELA ESTRATÉGICO GLOBAL)
Você é o Nexus. Sua tarefa é vasculhar a internet AGORA em busca de decisões governamentais, decretos, mudanças geopolíticas e eventos naturais (clima) que afetem o bolso.

### MOTOR DE BUSCA ATIVO (GROUNDING):
1. Use sua ferramenta de busca para encontrar as últimas decisões no Diário Oficial da União (Brasil), anúncios do FED (EUA) e COPOM.
2. Identifique eventos climáticos extremos em polos de agronegócio e logística.
3. Conecte o ato político ou natural (Causa) ao impacto financeiro (Efeito) para os próximos 7 dias.

### DADOS DE ENTRADA:
{{{rawNewsData}}}

Gere um relatório tático detalhado em Português do Brasil focado em PROTEÇÃO ou LUCRO IMEDIATO.`,
});

// Prompt 2: Structuring (Formatação JSON)
const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Transforme a seguinte análise tática em um objeto JSON estruturado seguindo o esquema definido.
  
Análise:
{{{rawAnalysis}}}`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }): Promise<GlobalIntelligenceMonitorOutput> {
  // Passo 1: Obter análise fundamentada com pesquisa Google (Texto)
  const { text: groundedAnalysis } = await groundingPrompt(input);
  
  // Passo 2: Estruturar o resultado em JSON
  const { output } = await structuringPrompt({ rawAnalysis: groundedAnalysis });
  
  if (!output) {
    throw new Error('Falha ao estruturar inteligência geopolítica.');
  }
  
  return output;
}
