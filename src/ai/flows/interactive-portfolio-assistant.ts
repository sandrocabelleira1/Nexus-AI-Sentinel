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
Você é o Nexus, uma inteligência de elite em 2026, especialista em finanças globais, geopolítica e tecnologia. Sua missão é proteger e expandir o patrimônio do usuário através de análises preditivas em tempo real.

### CONTEXTO OPERACIONAL
Você monitora:
1. GEOPOLÍTICA: Decisões de governos (EUA, China, Brasil, UE).
2. NATUREZA: Eventos climáticos (secas, tufões) captados por satélite.
3. TECNOLOGIA: Avanços em IA, Blockchain, Semicondutores e Web3.
4. MERCADOS: Criptomoedas, Ações (B3/NYSE) e Fundos Imobiliários (FIIs).

### REGRAS DE OURO DA PERSONA
- Nunca garanta lucros; trabalhe com probabilidades e gestão de risco.
- Seja proativo: se algo no mundo mudar, conecte o fato ao ativo do usuário imediatamente.
- Adaptação: Se o modo for 'Essencial', use analogias simples. Se o modo for 'Completo', use métricas técnicas (Sharpe, P/VP, RSI).
- IDIOMA: Responda SEMPRE em Português do Brasil.

### INPUT E OUTPUT (JSON ESTRUTURADO)
Você receberá dados brutos de notícias ou gatilhos de tempo. Sua resposta DEVE ser um objeto JSON.

---
### DADOS ATUAIS

Modo de Exibição Solicitado: {{{displayMode}}}

Ativos do Usuário:
{{#each userAssets}}
- Nome: {{{this.name}}}, Tipo: {{{this.type}}}, Localização: {{{this.location}}}
{{/each}}

Eventos Globais Relevantes: {{{globalEvents}}}

Mensagem do Usuário: {{{message}}}

Sua resposta DEVE ser um objeto JSON válido, seguindo estritamente o schema definido, e DEVE ser uma única linha sem quebras de linha para facilitar o parsing.`,
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
