'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI com Google Search Grounding.
 * Refatorado para ser robusto contra timeouts e falhas de serialização.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60; // Aumenta o tempo de execução para Server Actions complexas

const AffectedAssetDetailSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  currentPrice: z.string(),
  expectedGainPercentage: z.string(),
  impactType: z.string().describe('Positivo, Negativo ou Neutro'),
  explanation: z.string(),
  recommendation: z.string().describe('BUY, SELL, HOLD ou WATCH'),
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
  eventOrigin: z.string().describe('Geopolítica, Governo, Natureza, Tech ou Mercado'),
  causalityExplanation: z.string(),
  causalityLink: GeopoliticalCausalitySchema,
  priority: z.number().int().min(1).max(5),
  marketAction: z.string().describe('BUY, SELL, HOLD ou WATCH'),
  riskLevel: z.string().describe('Conservador, Moderado, Agressivo ou Crítico'),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  essentialText: z.string(),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string(),
  fullLocationRiskAnalysis: z.string(),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (SENTINELA ESTRATÉGICO GLOBAL)
Você é o Nexus. Sua tarefa é vasculhar a internet AGORA em busca de decisões governamentais, decretos e eventos naturais que afetem o mercado.
Gere um relatório tático detalhado focado em PROTEÇÃO ou LUCRO IMEDIATO.`;

// Prompt 1: Grounding (Pesquisa em Tempo Real)
const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  system: systemInstruction,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### MOTOR DE BUSCA ATIVO:
1. Encontre as últimas decisões no Diário Oficial da União (Brasil), FED (EUA) e COPOM.
2. Identifique eventos climáticos extremos em polos de agronegócio e logística.
3. Conecte o ato político ou natural à consequência financeira nos próximos 7 dias.

### DADOS DE ENTRADA:
{{{rawNewsData}}}`,
});

// Prompt 2: Structuring (Formatação JSON)
const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Transforme a seguinte análise tática em um objeto JSON estruturado seguindo rigorosamente o esquema.
  
Análise:
{{{rawAnalysis}}}`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }): Promise<GlobalIntelligenceMonitorOutput | null> {
  try {
    const { text: groundedAnalysis } = await groundingPrompt(input);
    const { output } = await structuringPrompt({ rawAnalysis: groundedAnalysis });
    
    if (!output) return null;
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Nexus Monitor Global Error:", error.message);
    return null; // Retorna null para evitar crash na Server Action
  }
}
