'use server';
/**
 * @fileOverview Motor de Inteligência Geopolítica Nexus AI v2 com Pesquisa em Tempo Real.
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
    // Ativa o Google Search Grounding para monitoramento em tempo real
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (SENTINELA ESTRATÉGICO GLOBAL)
Você é o Nexus. Sua tarefa é vasculhar a internet AGORA em busca de decisões governamentais, decretos e mudanças geopolíticas que afetem o bolso.

### MOTOR DE BUSCA ATIVO:
1. Procure no Diário Oficial da União (DOU), sites do FED, COPOM e notícias de última hora (Bloomberg, Reuters).
2. Identifique "Sinais Fracos": movimentações de ouro, mudanças táticas de BCs, novos impostos.
3. Conecte o ato político (Causa) ao impacto financeiro (Efeito) para os próximos 7 dias.

### DADOS DE ENTRADA:
{{{rawNewsData}}}

Gere um alerta tático detalhado em Português do Brasil. Foque em COMPRA ou VENDA IMEDIATA.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
