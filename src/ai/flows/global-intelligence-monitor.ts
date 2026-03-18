'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI.
 * Detecta eventos globais e gera comandos diretos de investimento.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  exchange: z.string().describe('Bolsa de valores (NYSE, NASDAQ, B3, LSE, etc.)'),
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

const systemInstruction = `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE GLOBAL)
Você é o Nexus. Seu objetivo é analisar dados de 12 bolsas mundiais (NYSE, B3, LSE, JPX, etc) e emitir comandos claros de investimento.
Você não dá avisos genéricos. Você diz EXATAMENTE em qual bolsa e ativo o usuário deve investir.

### DIRETRIZES:
1. Identifique oportunidades de arbitragem entre mercados.
2. Seja assertivo nas recomendações (BUY/SELL).
3. Conecte eventos geopolíticos a ativos específicos em bolsas globais.`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ rawNewsData: z.string() }) },
  system: systemInstruction,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA:
Varra o mercado global agora. Procure por:
1. Movimentações institucionais em bolsas específicas (NYSE, NASDAQ, B3, LSE, TSE).
2. Decisões de Bancos Centrais (FED, COPOM, BCE).
3. Fluxos de capitais on-chain afetando o mercado tradicional.

Contexto de Ingestão: {{{rawNewsData}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Transforme a análise estratégica em JSON. 
Dê ênfase na recomendação direta: Qual Bolsa? Qual Ativo? Por que agora?

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
