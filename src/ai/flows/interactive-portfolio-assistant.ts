'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo com Google Search Grounding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

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
    action: z.string(),
    risk_level: z.string(),
    affected_assets: z.array(z.string()),
    is_new_opportunity: z.boolean().optional(),
    opportunity_rationale: z.string().optional(),
    tactical_7d_outlook: z.string().optional(),
  }),
  display_modes: z.object({
    essential: z.object({
      text: z.string(),
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
  system: `### PERSONA: NEXUS (O GUARDIÃO GLOBAL)
Você é o Nexus, com acesso à internet em tempo real. Sua missão é proteger o capital do usuário. Responda com autoridade máxima em Português do Brasil.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### CONTEXTO
Modo: {{{displayMode}}}
Carteira: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}
Monitor Context: {{{globalEvents}}}
Mensagem do Usuário: {{{message}}}`,
});

const structuredChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioStructuredPrompt',
  input: { schema: z.object({ rawResponse: z.string() }) },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `Formate a seguinte resposta do Nexus AI em um objeto JSON estruturado.
Resposta:
{{{rawResponse}}}`,
});

export async function interactivePortfolioAssistant(input: z.infer<typeof InteractivePortfolioAssistantInputSchema>): Promise<InteractivePortfolioAssistantOutput | null> {
  try {
    const { text: rawResponse } = await groundedChatPrompt(input);
    const { output } = await structuredChatPrompt({ rawResponse });
    
    if (!output) return null;
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Assistant Error:", error.message);
    return null;
  }
}
