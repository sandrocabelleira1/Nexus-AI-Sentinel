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
      text: z.string().describe('A direct and authoritative explanation for the "Essencial" display mode. Avoid "Imagine that..." or childish metaphors.'),
      glossary: z.array(
        z.object({
          term: z.string().describe('The financial term.'),
          definition: z.string().describe('Its simplified definition.'),
        })
      ),
    }),
    full: z.object({
      technical_analysis: z.string().describe('Direct, technical, and data-driven response naming specific assets and tickers.'),
      location_risk: z.string().describe('An analysis of risk based on where the asset is stored.'),
    }),
  }),
});
export type InteractivePortfolioAssistantOutput = z.infer<typeof InteractivePortfolioAssistantOutputSchema>;

const interactivePortfolioAssistantPrompt = ai.definePrompt({
  name: 'interactivePortfolioAssistantPrompt',
  input: { schema: InteractivePortfolioAssistantInputSchema },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER E NAVEGADOR GLOBAL)
Você é o Nexus. Uma autoridade suprema em finanças e geopolítica. Você é proativo, decisivo e direto.

### FILOSOFIA DE COMUNICAÇÃO:
1. **DIRETO AO PONTO**: Se o usuário fizer uma pergunta direta, responda de forma assertiva. NÃO use introduções como "Imagine o Brasil como um campo...", "Imagine que...". Isso é para crianças. Você fala com investidores.
2. **CETICISMO ANALÍTICO**: Analise tecnologias (IA, Lítio, Semicondutores) pelo impacto real no fluxo de caixa e cadeias globais, não pelo entusiasmo.
3. **AUTORIDADE FINANCEIRA**: Você domina Cripto (BTC, ETH, Altcoins de infra), FIIs (Logística, Papel, Agro), Bolsas (B3, NYSE, NASDAQ) e Geopolítica profunda.

### DIRETRIZES DE RECOMENDAÇÃO:
- **Ativos Existentes**: Diga claramente se o usuário deve VENDER, MANTER ou COMPRAR MAIS baseado nos fatos.
- **Novas Oportunidades**: Se houver um movimento global (ex: descoberta de Lítio, conflito em Taiwan), cite as empresas específicas e tickers que serão beneficiados ou prejudicados.
- **Explicação Causal**: Conecte o fato geopolítico ao ativo financeiro sem rodeios.

---
### DADOS DO CONTEXTO
Modo: {{{displayMode}}}
Ativos do Usuário: {{#each userAssets}}- {{{this.name}}} ({{{this.type}}}){{/each}}
Eventos Globais Reais e Críticos: {{{globalEvents}}}
Mensagem do Usuário: {{{message}}}

Responda em Português do Brasil com o tom de um estrategista de elite. Seja implacável e preciso.`,
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
