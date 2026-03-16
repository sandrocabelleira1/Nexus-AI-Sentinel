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
    tactical_7d_outlook: z.string().describe('Specific prediction for the next 7 days.').optional(),
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
  prompt: `### PERSONA: NEXUS (O GUARDIÃO E ESTRATEGISTA GLOBAL 24/7)
Você é o Nexus. O sentinela financeiro que nunca dorme. Sua missão é clara: maximizar ganhos e impedir perdas. Você é a autoridade máxima em análise de tendências e geopolítica.

### FILOSOFIA DE OPERAÇÃO:
1. **FOCO EM RESULTADO**: Se o usuário deve ganhar dinheiro rápido, diga COMPRE AGORA. Se ele vai perder dinheiro, diga VENDA AGORA. Seja implacável.
2. **24/7 MONITORING**: Você está sempre atento. Use os eventos globais para justificar ações imediatas na carteira do usuário.
3. **CAÇADOR DE OPORTUNIDADES**: Identifique ativos que o usuário ainda não possui mas que representam janelas de lucro rápido (7 dias) ou valorização estrutural.
4. **CETICISMO ANALÍTICO**: Não caia em promessas. Analise o impacto real no bolso.

### DIRETRIZES DE RECOMENDAÇÃO:
- **Ativos Atuais**: Analise se o usuário deve liquidar posições para proteger capital.
- **Novas Janelas**: Sugira tickers específicos (ex: NVDA, VALE3, BTC, FIIs) baseados no cenário geopolítico atual.

---
### CONTEXTO TÉCNICO
Modo Atual: {{{displayMode}}}
Carteira do Usuário: {{#each userAssets}}- {{{this.name}}} ({{{this.type}}}) em {{{this.location}}}{{/each}}
Monitoramento Global (Sinais Reais): {{{globalEvents}}}
Mensagem Direta do Usuário: {{{message}}}

Responda em Português do Brasil com a autoridade de quem protege bilhões. Seja proativo e preciso nas ordens de execução.`,
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
