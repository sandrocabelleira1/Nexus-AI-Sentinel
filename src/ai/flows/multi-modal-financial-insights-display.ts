
'use server';
/**
 * @fileOverview A Genkit flow for Nexus AI to provide multi-modal financial insights.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const MultiModalFinancialInsightsDisplayInputSchema = z.object({
  rawInput: z.string().describe('Raw data from news feeds, weather, government decisions, etc., for analysis.'),
  userAssets: z.array(z.string()).describe('List of assets owned by the user (e.g., "VALE3", "BTC", "ETH").'),
  userLocationRisk: z.string().optional().describe('Additional context about asset storage location risk (e.g., "Binance vs Cold Wallet") for the AI to consider in its analysis.'),
});
export type MultiModalFinancialInsightsDisplayInput = z.infer<typeof MultiModalFinancialInsightsDisplayInputSchema>;

// Output Schemas
const MultiModalFinancialInsightsDisplayOutputSchema = z.object({
  nexus_alert: z.object({
    title: z.string(),
    event_origin: z.string(),
    causality: z.string(),
    priority: z.number().int(),
  }),
  market_signal: z.object({
    action: z.string(),
    risk_level: z.string(),
    affected_assets: z.array(z.string()),
  }),
  display_modes: z.object({
    essential: z.object({
      text: z.string(),
      glossary: z.array(z.object({ term: z.string(), definition: z.string() })),
    }),
    full: z.object({
      technical_analysis: z.string(),
      location_risk: z.string(),
    }),
  }),
});
export type MultiModalFinancialInsightsDisplayOutput = z.infer<typeof MultiModalFinancialInsightsDisplayOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (O LÍDER E NAVEGADOR GLOBAL)
Você é o Nexus, uma inteligência de elite em 2026. Você é o líder indiscutível em análise de tendências, especialista em Criptomoedas, FIIs, Bolsas Globais e Geopolítica.

### FILOSOFIA DE ANÁLISE:
1. **Ceticismo Analítico Profundo**: Você desconfia de "promessas milagrosas" de tecnologia. Analise IA, Web3 e Semicondutores com foco em viabilidade econômica e impacto real no PIB global.
2. **Mestre da Causalidade**: Seu diferencial é conectar o "fato isolado" (ex: uma eleição no Sudeste Asiático) ao "impacto no bolso" (ex: alta no preço de chips e ações da NVIDIA).
3. **Visão 360°**: Você está conectado 24h a todas as fontes de notícias, clima e decisões governamentais.
`;

const insightsPrompt = ai.definePrompt({
  name: 'multiModalFinancialInsightsDisplayPrompt',
  input: { schema: MultiModalFinancialInsightsDisplayInputSchema },
  output: { schema: MultiModalFinancialInsightsDisplayOutputSchema },
  system: systemInstruction,
  prompt: `Analyze world events with your leadership perspective.
Raw Data: {{{rawInput}}}
User Assets: {{#each userAssets}}- {{{this}}}{{/each}}
Location Risk: {{{userLocationRisk}}}`,
});

export async function multiModalFinancialInsightsDisplay(
  input: MultiModalFinancialInsightsDisplayInput
): Promise<MultiModalFinancialInsightsDisplayOutput> {
  try {
    const { output } = await insightsPrompt(input);
    if (!output) throw new Error("Falha na geração de insights.");
    return JSON.parse(JSON.stringify(output));
  } catch (error) {
    console.error("Insights Display Error:", error);
    throw new Error("O Nexus falhou ao processar insights multimodais.");
  }
}
