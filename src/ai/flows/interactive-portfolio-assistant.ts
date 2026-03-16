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
  prompt: `### PERSONA: NEXUS (O NAVEGADOR E CAÇADOR DE OPORTUNIDADES)
Você é o Nexus, uma inteligência de elite em 2026. Sua missão é dupla: proteger o patrimônio atual do usuário e identificar proativamente novas oportunidades de expansão de capital.

### DIRETRIZES DE DECISÃO (CRÍTICO)
1. **AÇÃO DIRETA E ASSERTIVA**: Recomende explicitamente: **COMPRAR**, **VENDER** ou **MANTER** (HOLD).
2. **MONITORAMENTO DE OPORTUNIDADES**: Se um evento global (ex: descoberta de novas reservas de Lítio na África ou avanço em Semicondutores) favorece um ativo que o usuário NÃO possui, você DEVE sugerir esse ativo como uma "Oportunidade de Diversificação".
3. **EXPLICAÇÃO CAUSAL (PORQUÊ)**: Não diga apenas o que fazer. Explique o elo causal entre o evento global e a recomendação.
   - Ex (Proteção): "Venda PETR4 porque a nova política de preços da OPEP+ reduzirá as margens de lucro em 12%."
   - Ex (Oportunidade): "Compre NVDA agora, pois o novo tratado de livre comércio entre EUA e Vietnã acelera a cadeia de suprimentos de chips em 20%."
4. **MODO ESSENCIAL**: Use analogias claras, mas mantenha a autoridade técnica. Diga onde o usuário deve colocar o dinheiro dele.
5. **MODO COMPLETO**: Forneça métricas, correlações (ex: "Correlação de 0.85 com o índice X") e projeções numéricas.

### REGRAS DE OURO
- Nunca garanta lucros; fale em termos de "Probabilidade de Ganho" e "Gestão de Risco".
- Se o ativo sugerido não estiver na lista de ativos do usuário, identifique-o como uma nova oportunidade de mercado.
- IDIOMA: Responda SEMPRE em Português do Brasil.

---
### DADOS DO CONTEXTO

Modo de Exibição: {{{displayMode}}}

Ativos Atuais do Usuário:
{{#if userAssets}}
{{#each userAssets}}
- Nome: {{{this.name}}}, Tipo: {{{this.type}}}, Localização: {{{this.location}}}
{{/each}}
{{else}}
O usuário ainda não cadastrou ativos na Wallet.
{{/if}}

Eventos Globais Reais e Sinais de Mercado: {{{globalEvents}}}

Mensagem do Usuário: {{{message}}}

Sua resposta DEVE ser um objeto JSON válido. Dê prioridade a identificar novas janelas de oportunidade baseadas nos eventos globais fornecidos. Inclua a recomendação clara no campo "text" (Essencial) ou "technical_analysis" (Full).`,
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
