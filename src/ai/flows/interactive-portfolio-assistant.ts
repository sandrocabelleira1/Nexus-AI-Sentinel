/**
 * @fileOverview Assistente de Portfólio Interativo Nexus v3.9.
 * Análise assistida de portfólio, sujeita à disponibilidade das fontes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InteractivePortfolioAssistantInputSchema = z.object({
  message: z.string(),
  userAssets: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      location: z.string(),
    })
  ),
  globalEvents: z.string(),
  displayMode: z.string(),
});

const InteractivePortfolioAssistantOutputSchema = z.object({
  nexus_alert: z.object({
    title: z.string(),
    event_origin: z.string(),
    causality: z.string(),
    priority: z.number().int(),
  }),
  market_signal: z.object({
    action: z.string().describe('BUY, SELL, HOLD ou WATCH'),
    risk_level: z.string(),
    affected_assets: z.array(z.string()),
    is_new_opportunity: z.boolean().optional(),
    opportunity_rationale: z.string().optional(),
    tactical_7d_outlook: z.string().optional(),
  }),
  display_modes: z.object({
    essential: z.object({
      text: z.string().describe('Resumo claro e cauteloso. Cite a fonte somente quando ela tiver sido consultada.'),
      glossary: z.array(z.object({ term: z.string(), definition: z.string() })),
    }),
    full: z.object({
      technical_analysis: z.string(),
      location_risk: z.string(),
    }),
  }),
});

export type InteractivePortfolioAssistantOutput = z.infer<typeof InteractivePortfolioAssistantOutputSchema>;

const groundedChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioGroundedPrompt',
  input: { schema: InteractivePortfolioAssistantInputSchema },
  system: `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE GLOBAL)
Você é o Nexus. Deixe claro quando uma informação não puder ser confirmada. Não invente cotações nem prometa resultados.

### DIRETRIZES DE RESPOSTA:
1. **FIIs**: Visite clubefii.com.br e Status Invest para cada FII. Verifique P/VP e Vacância física/financeira.
2. **Cripto**: Verifique notícias de última hora na Binance e CoinDesk.
3. **Bolsa**: Consulte tendências na B3 e Valor Econômico.
4. **Moeda**: Criptos são em USD. B3 é em BRL.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### CONTEXTO TÁTICO
Modo: {{{displayMode}}}
Carteira: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}

### INTELIGÊNCIA GLOBAL
{{{globalEvents}}}

### SOLICITAÇÃO
"{{{message}}}"

Consulte fontes disponíveis para os ativos mencionados. Informe incerteza e data dos dados quando conhecidas. Não apresente previsão como fato.`,
});

const structuredChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioStructuredPrompt',
  input: { schema: z.object({ rawResponse: z.string() }) },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `Formate a análise do Nexus AI em JSON. 
O campo 'essential.text' deve ser um resumo curto, com limites e incertezas claros.

Análise: {{{rawResponse}}}`,
});

export async function interactivePortfolioAssistant(input: z.infer<typeof InteractivePortfolioAssistantInputSchema>): Promise<InteractivePortfolioAssistantOutput | null> {
  try {
    const { text: rawResponse } = await groundedChatPrompt(input);
    const { output } = await structuredChatPrompt({ rawResponse });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Assistant Error:", error.message);
    return null;
  }
}
