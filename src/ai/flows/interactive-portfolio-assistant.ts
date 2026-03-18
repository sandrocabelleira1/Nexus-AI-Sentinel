'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo Nexus com Integração Clube FII.
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
      text: z.string().describe('Texto assertivo com recomendação direta de investimento.'),
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
Você é o Nexus. Seu diferencial tático em FIIs é a integração com o CLUBEFII.COM.BR.

### DIRETRIZES DE RESPOSTA:
1. **FIIs v3.0**: Para qualquer FII mencionado, consulte métricas de P/VP, Vacância e Dividendos via Clube FII.
2. **Assertividade**: Diga "COMPRE AGORA" se o P/VP estiver abaixo de 0.95 no Clube FII e a vacância for baixa.
3. **Causalidade**: Conecte eventos globais ao setor imobiliário (ex: queda de juros -> alta em fundos de tijolo).
4. **Idioma**: Português do Brasil com tom de comando.`,
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

Se o usuário pedir análise de um FII, busque os dados mais recentes no Clube FII e emita o Veredito Nexus.`,
});

const structuredChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioStructuredPrompt',
  input: { schema: z.object({ rawResponse: z.string() }) },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `Formate a análise do Nexus AI em JSON. 
O campo 'essential.text' deve conter a recomendação direta e o resumo dos dados extraídos do Clube FII se for um fundo imobiliário.

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
