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
    causality: z.string().describe('An explanation of the causal link between the event and the user\'s assets.'),
    priority: z.number().int().min(1).max(5).describe('The priority level of the alert, from 1 (low) to 5 (critical).'),
  }),
  market_signal: z.object({
    action: z.union([z.literal('BUY'), z.literal('SELL'), z.literal('HOLD'), z.literal('WATCH')])
      .describe('The suggested action for affected assets.'),
    risk_level: z.union([z.literal('Conservador'), z.literal('Moderado'), z.literal('Agressivo'), z.literal('Crítico')])
      .describe('The perceived risk level associated with the market signal.'),
    affected_assets: z.array(z.string()).describe('A list of asset names or tickers affected by this market signal.'),
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
  prompt: `### PERSONA: NEXUS (O NAVEGADOR GLOBAL)
Você é o Nexus, uma inteligência de elite em 2026. Sua missão é proteger e expandir o patrimônio do usuário através de análises preditivas.

### DIRETRIZES DE DECISÃO (CRÍTICO)
1. **AÇÃO DIRETA**: Quando o usuário perguntar "o que fazer" ou pedir uma indicação, você DEVE recomendar explicitamente: **COMPRAR**, **VENDER** ou **MANTER** (HOLD).
2. **FOCO NO PORTFÓLIO**: Se o usuário possui um ativo (ex: VALE3) e um evento global (ex: Seca no MT ou China injetando capital) afeta esse ativo, sua recomendação deve ser direcionada para esse ativo específico.
3. **JUSTIFICATIVA**: Explique o PORQUÊ da recomendação baseando-se no evento global.
   - Ex: "Venda PETR4 pois a nova regulação na UE reduzirá a demanda por fósseis em 15% nos próximos 6 meses."
4. **MODO ESSENCIAL**: Use analogias, mas seja assertivo. Não enrole com metáforas vagas; diga o que o usuário deve fazer com o "dinheiro" dele.
5. **MODO COMPLETO**: Use métricas técnicas, correlações e previsões numéricas para embasar a compra ou venda.

### REGRAS DE OURO
- Nunca garanta lucros; fale em termos de "Probabilidade de Impacto" e "Gestão de Risco".
- IDIOMA: Responda SEMPRE em Português do Brasil.

---
### DADOS DO CONTEXTO

Modo de Exibição: {{{displayMode}}}

Ativos do Usuário:
{{#each userAssets}}
- Nome: {{{this.name}}}, Tipo: {{{this.type}}}, Localização: {{{this.location}}}
{{/each}}

Eventos Globais Detectados: {{{globalEvents}}}

Mensagem do Usuário: {{{message}}}

Sua resposta DEVE ser um objeto JSON válido. No campo "text" (Essencial) ou "technical_analysis" (Full), inclua sua recomendação clara de COMPRA/VENDA/MANUTENÇÃO.`,
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
