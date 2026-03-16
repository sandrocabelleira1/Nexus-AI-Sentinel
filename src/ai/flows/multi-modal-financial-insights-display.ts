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
const NexusAlertSchema = z.object({
  title: z.string().describe('Title of the alert.'),
  event_origin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']).describe('Origin of the event.'),
  causality: z.string().describe('Explanation of the link between the event and the assets.'),
  priority: z.number().int().min(1).max(5).describe('Priority level.'),
});

const MarketSignalSchema = z.object({
  action: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']).describe('Recommended action.'),
  risk_level: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']).describe('Risk level.'),
  affected_assets: z.array(z.string()).describe('List of assets affected.'),
});

const GlossaryItemSchema = z.object({
  term: z.string().describe('Term to define.'),
  definition: z.string().describe('Definition of the term.'),
});

const DisplayModesSchema = z.object({
  essential: z.object({
    text: z.string().describe('Simplified explanation with an analogy.'),
    glossary: z.array(GlossaryItemSchema).describe('List of financial terms.'),
  }),
  full: z.object({
    technical_analysis: z.string().describe('Raw data and forecasts.'),
    location_risk: z.string().describe('Analysis of storage risk.'),
  }),
});

const MultiModalFinancialInsightsDisplayOutputSchema = z.object({
  nexus_alert: NexusAlertSchema,
  market_signal: MarketSignalSchema,
  display_modes: DisplayModesSchema,
});
export type MultiModalFinancialInsightsDisplayOutput = z.infer<typeof MultiModalFinancialInsightsDisplayOutputSchema>;

// System Instruction (Master Prompt)
const systemInstruction = `### PERSONA: NEXUS (O LÍDER E NAVEGADOR GLOBAL)
Você é o Nexus, uma inteligência de elite em 2026. Você é o líder indiscutível em análise de tendências, especialista em Criptomoedas, FIIs, Bolsas Globais e Geopolítica.

### FILOSOFIA DE ANÁLISE:
1. **Ceticismo Analítico Profundo**: Você desconfia de "promessas milagrosas" de tecnologia. Analise IA, Web3 e Semicondutores com foco em viabilidade econômica e impacto real no PIB global.
2. **Mestre da Causalidade**: Seu diferencial é conectar o "fato isolado" (ex: uma eleição no Sudeste Asiático) ao "impacto no bolso" (ex: alta no preço de chips e ações da NVIDIA).
3. **Visão 360°**: Você está conectado 24h a todas as fontes de notícias, clima e decisões governamentais.

### REGRAS DE OURO:
- Nunca garanta lucros; trabalhe com probabilidades baseadas em ceticismo técnico.
- Seja proativo: conecte mudanças mundiais aos ativos do usuário ou a novas janelas de oportunidade.
- Linguagem: Responda em Português do Brasil com autoridade e clareza.
`;

export async function multiModalFinancialInsightsDisplay(
  input: MultiModalFinancialInsightsDisplayInput
): Promise<MultiModalFinancialInsightsDisplayOutput> {
  const { output } = await ai.definePrompt({
    name: 'multiModalFinancialInsightsDisplayPrompt',
    input: { schema: MultiModalFinancialInsightsDisplayInputSchema },
    output: { schema: MultiModalFinancialInsightsDisplayOutputSchema },
    system: systemInstruction,
    prompt: `Analyze world events with your leadership perspective.
Raw Data: {{{rawInput}}}
User Assets: {{#each userAssets}}- {{{this}}}{{/each}}
Location Risk: {{{userLocationRisk}}}`,
  })(input);
  return output!;
}
