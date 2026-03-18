'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI.
 * Detecta eventos globais e identifica os atores (entidades) envolvidos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const DetectedEntitySchema = z.object({
  name: z.string(),
  type: z.enum(['Government', 'Institution', 'Exchange', 'Whale']),
  influenceScore: z.number().int().min(1).max(100),
  lastAction: z.string(),
  currentBalanceUsd: z.number(),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string(),
  eventOrigin: z.string().describe('Geopolítica, Governo, Natureza, Tech ou Mercado'),
  causalityExplanation: z.string(),
  priority: z.number().int().min(1).max(5),
  marketAction: z.string().describe('BUY, SELL, HOLD ou WATCH'),
  riskLevel: z.string().describe('Conservador, Moderado, Agressivo ou Crítico'),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  detectedEntities: z.array(DetectedEntitySchema).describe('Instituições ou governos agindo neste evento.'),
  essentialText: z.string(),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (SENTINELA ESTRATÉGICO GLOBAL)
Você é o Nexus. Sua tarefa é monitorar decisões governamentais, fluxos institucionais e eventos naturais em tempo real.
Seja específico. Identifique QUEM está agindo (BlackRock, FED, B3, Governo Brasileiro, etc).`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ rawNewsData: z.string() }) },
  system: systemInstruction,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA:
Varra as notícias e documentos oficiais da ÚLTIMA HORA sobre:
1. Decisões do COPOM, FED e Diário Oficial.
2. Movimentações de grandes gestoras de ativos.
3. Eventos climáticos que afetam commodities.

Contexto: {{{rawNewsData}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Transforme a análise em JSON. Identifique pelo menos 3 entidades de mercado influentes.
Análise: {{{rawAnalysis}}}`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }): Promise<GlobalIntelligenceMonitorOutput | null> {
  try {
    const { text: groundedAnalysis } = await groundingPrompt(input);
    const { output } = await structuringPrompt({ rawAnalysis: groundedAnalysis });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Nexus Monitor Error:", error.message);
    return null;
  }
}
