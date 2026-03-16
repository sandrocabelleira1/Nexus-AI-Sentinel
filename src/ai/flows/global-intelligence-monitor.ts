'use server';
/**
 * @fileOverview Fluxo de monitoramento global do Nexus AI.
 * Analisa eventos mundiais e deposita alertas no "Hub de Eventos" do Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Dados brutos de notícias, clima ou eventos geopolíticos.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string(),
  eventOrigin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string(),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  essentialText: z.string(),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string(),
  fullLocationRiskAnalysis: z.string(),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Você é o Nexus, o Sentinela Global.
Analise os seguintes dados de notícias e gere um alerta de inteligência financeira estruturado.

Notícias Brutas:
{{{rawNewsData}}}

Gere um alerta que conecte esses fatos a possíveis impactos no mercado financeiro.
Sua resposta deve ser um JSON válido.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
