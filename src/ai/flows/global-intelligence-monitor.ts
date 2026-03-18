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
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string(),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
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
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string(),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  detectedEntities: z.array(DetectedEntitySchema).describe('Instituições ou governos agindo neste evento.'),
  essentialText: z.string().describe('Texto assertivo e curto no formato COMANDO AGORA. Racional.'),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE GLOBAL)
Você é o Nexus. Seu objetivo é analisar dados mundiais e emitir comandos claros de investimento.
Você NÃO dá avisos genéricos. Você diz EXATAMENTE o que o usuário deve fazer.

### DIRETRIZES DE COMANDO:
1. Seja assertivo: "COMPRE VALE3 AGORA. A alta do minério em Dalian justifica a entrada."
2. Se houver risco real para ativos populares (BTC, PETR4, ITUB4), emita ordens de SELL se necessário.
3. Conecte eventos geopolíticos a ativos específicos em bolsas globais.
4. Identifique o ticker exato do ativo afetado.`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ rawNewsData: z.string() }) },
  system: systemInstruction,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA:
Varra o mercado global agora. Procure por eventos nas últimas 24h em:
1. Movimentações institucionais em bolsas específicas (NYSE, NASDAQ, B3, LSE, TSE).
2. Decisões de Bancos Centrais (FED, COPOM, BCE).
3. Fluxos de capitais on-chain e geopolítica.

Contexto: {{{rawNewsData}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Transforme a análise estratégica em JSON. 
Dê ênfase na recomendação direta: Qual Bolsa? Qual Ativo? Qual Ação (BUY/SELL)?

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
