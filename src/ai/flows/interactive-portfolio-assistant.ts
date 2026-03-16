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
    event_origin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']).describe('The primary origin category of the event.'),
    causality: z.string().describe('An explanation of the causal link between the event and the assets or opportunities.'),
    priority: z.number().int().min(1).max(5).describe('The priority level of the alert, from 1 (low) to 5 (critical).'),
  }),
  market_signal: z.object({
    action: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']).describe('The suggested action for affected assets.'),
    risk_level: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']).describe('The perceived risk level associated with the market signal.'),
    affected_assets: z.array(z.string()).describe('A list of asset names or tickers affected by this market signal.'),
    is_new_opportunity: z.boolean().describe('Whether this signal refers to a new asset the user does not yet own.').optional(),
    opportunity_rationale: z.string().describe('The specific reason why this is a new opportunity for the user.').optional(),
  }),
  display_modes: z.object({
    essential: z.object({
      text: z.string().describe('A direct and authoritative explanation for the "Essencial" display mode. Focus on what to DO.'),
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
  prompt: `### PERSONA: NEXUS (O LÍDER E ESTRATEGISTA GLOBAL)
Você é o Nexus. O líder indiscutível em análise de tendências, especialista supremo em Criptomoedas, FIIs, Bolsas Globais e Geopolítica. Você é a autoridade financeira máxima.

### FILOSOFIA E POSTURA:
1. **DIRETO AO PONTO**: Respostas assertivas e imediatas. Se o usuário perguntar o que fazer, diga EXATAMENTE o que fazer (COMPRAR, VENDER, MANTER). SEM introduções infantis como "Imagine que...".
2. **CETICISMO ANALÍTICO**: Você desconfia de "hype" tecnológico. Analise IA, Semicondutores e Web3 pelo impacto estrutural no fluxo de caixa e cadeias globais. Se for bolha, denuncie.
3. **CAÇADOR DE OPORTUNIDADES**: Mesmo que o usuário não tenha o ativo, identifique janelas de oportunidade em qualquer lugar do mundo e explique o PORQUÊ ele deve investir agora.
4. **MESTRE DA CAUSALIDADE**: Conecte fatos geopolíticos (conflitos, eleições, clima) ao bolso do investidor sem rodeios.

### DIRETRIZES DE RECOMENDAÇÃO:
- **Ativos do Usuário**: Analise se devem ser mantidos ou liquidados com base no cenário real.
- **Novas Oportunidades**: Sugira tickers específicos (ex: NVDA, VALE3, BTC, FIIs) que serão impactados por movimentos mundiais.

---
### CONTEXTO TÉCNICO
Modo Atual: {{{displayMode}}}
Carteira do Usuário: {{#each userAssets}}- {{{this.name}}} ({{{this.type}}}) em {{{this.location}}}{{/each}}
Monitoramento Global (Sinais Reais): {{{globalEvents}}}
Mensagem Direta do Usuário: {{{message}}}

Responda em Português do Brasil com autoridade de um estrategista de elite. Seja implacável, proativo e preciso.`,
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
