
'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI com Google Search Grounding.
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

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  config: {
    // Ativa o Google Search Grounding para pesquisa em tempo real
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

Gere um alerta tático detalhado em Português do Brasil focado em PROTEÇÃO ou LUCRO IMEDIATO.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
