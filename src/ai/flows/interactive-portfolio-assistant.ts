'use server';
/**
 * @fileOverview A Genkit flow for the interactive portfolio assistant.
 *
 * - interactivePortfolioAssistant - A function that handles user queries for personalized financial guidance.
 * - InteractivePortfolioAssistantInput - The input type for the interactivePortfolioAssistant function.
 * - InteractivePortfolioAssistantOutput - The return type for the interactivePortfolioAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InteractivePortfolioAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s query or message to the AI assistant.'),
  userAssets: z.array(
    z.object({
      name: z.string().describe('The name or ticker of the asset (e.g., VALE3, BTC).'),
      type: z.string().describe('The type of asset (e.g., Stock, Cryptocurrency, Real Estate Fund).'),
      location: z.string().describe('Where the asset is stored (e.g., Binance, Ledger, XP).'),
    })
  ).describe('A list of the user\'s registered financial assets and their storage locations.'),
  globalEvents: z.string().describe('A summarized string of current global events relevant to financial markets.'),
  displayMode: z.string().describe('The display mode for explanations.'),
});
export type InteractivePortfolioAssistantInput = z.infer<typeof InteractivePortfolioAssistantInputSchema>;

const InteractivePortfolioAssistantOutputSchema = z.object({
  nexus_alert: z.object({
    title: z.string().describe('A concise title for the alert.'),
    event_origin: z.union([z.literal('Geopolítica'), z.literal('Natureza'), z.literal('Tech'), z.literal('Mercado')])
      .describe('The primary origin category of the event.'),
    causality: z.string().describe('An explanation of the causal link between the event and the assets or opportunities.'),
    priority: z.number().int().min(1).max(5).describe('The priority level of the alert, from 1 (low) to 5 (critical).'),
  }),
  market_signal: z.object({
    action: z.union([z.literal('BUY'), z.literal('SELL'), z.literal('HOLD'), z.literal('WATCH')])
      .describe('The suggested action for affected assets.'),
    risk_level: z.union([z.literal('Conservador'), z.literal('Moderado'), z.literal('Agressivo'), z.literal('Crítico')])
      .describe('The perceived risk level associated with the market signal.'),
    affected_assets: z.array(z.string()).describe('A list of asset names or tickers affected by this market signal.'),
    is_new_opportunity: z.boolean().describe('Whether this signal refers to a new asset the user does not yet own.').optional(),
  }),
  display_modes: z.object({
    essential: z.object({
      text: z.string().describe('A simplified explanation with analogies for the "Essencial" display mode.'),
      glossary: z.array(
        z.object({
          term: z.string().describe('The financial term.'),
          definition: z.string().describe('Its simplified definition.'),
        })
      ),
    }),
    full: z.object({
      technical_analysis: z.string().describe('Raw data, correlations, and numerical forecasts for the "Completo" display mode.'),
      location_risk: z.string().describe('An analysis of risk based on where the asset is stored.'),
    }),
  }),
});
export type InteractivePortfolioAssistantOutput = z.infer<typeof InteractivePortfolioAssistantOutputSchema>;

const interactivePortfolioAssistantPrompt = ai.definePrompt({
  name: 'interactivePortfolioAssistantPrompt',
  input: { schema: InteractivePortfolioAssistantInputSchema },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER E ESTRATEGISTA FINANCEIRO)
Você é o Nexus, um líder de tendências e autoridade máxima em finanças globais. Você domina Criptomoedas, FIIs, Ações e Geopolítica.

### POSTURA ANALÍTICA:
- **Ceticismo Tecnológico**: Você analisa avanços tech (IA, Web3, Green Energy) com olho clínico. Não se empolgue com modas; foque no valor intrínseco e no impacto real nas cadeias de suprimento e fluxos de capital.
- **Visão Macro**: Conecte conflitos geopolíticos ou mudanças de taxas de juros (FED, Copom) diretamente ao portfólio do usuário.
- **Decisivo**: Como um líder, você não hesita. Recomende **COMPRAR**, **VENDER** ou **MANTER** com justificativas implacáveis.

### DIRETRIZES DE DECISÃO:
1. **Ativos do Usuário**: Proteja o que ele já possui.
2. **Caçador de Oportunidades**: Se houver uma tendência global real que favoreça um ativo que o usuário NÃO possui, você DEVE sugerir como uma oportunidade de expansão.
3. **Explicação Causal**: Use seu vasto conhecimento em geopolítica para explicar o "PORQUÊ" por trás de cada movimento de mercado.

---
### DADOS DO CONTEXTO
Modo: {{{displayMode}}}
Ativos: {{#each userAssets}}- {{{this.name}}} ({{{this.type}}}){{/each}}
Eventos Globais Reais: {{{globalEvents}}}
Mensagem: {{{message}}}

Responda SEMPRE em Português do Brasil como um especialista financeiro de elite.`,
});

const interactivePortfolioAssistantFlow = ai.defineFlow(
  {
    name: 'interactivePortfolioAssistantFlow',
    inputSchema: InteractivePortfolioAssistantInputSchema,
    outputSchema: InteractivePortfolioAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await interactivePortfolioAssistantPrompt(input);
    return output!;
  }
);

export async function interactivePortfolioAssistant(input: InteractivePortfolioAssistantInput): Promise<InteractivePortfolioAssistantOutput> {
  return interactivePortfolioAssistantFlow(input);
}
