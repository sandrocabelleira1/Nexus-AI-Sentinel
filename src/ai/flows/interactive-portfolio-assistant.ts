
'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo com Google Search Grounding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InteractivePortfolioAssistantInputSchema = z.object({
  message: z.string().describe('A pergunta ou mensagem do usuário.'),
  userAssets: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      location: z.string(),
    })
  ).describe('Ativos do usuário.'),
  globalEvents: z.string().describe('Contexto de eventos globais.'),
  displayMode: z.string().describe('Modo de exibição.'),
});
export type InteractivePortfolioAssistantInput = z.infer<typeof InteractivePortfolioAssistantInputSchema>;

const InteractivePortfolioAssistantOutputSchema = z.object({
  nexus_alert: z.object({
    title: z.string(),
    event_origin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
    causality: z.string(),
    priority: z.number().int().min(1).max(5),
  }),
  market_signal: z.object({
    action: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
    risk_level: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
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

const interactivePortfolioAssistantPrompt = ai.definePrompt({
  name: 'interactivePortfolioAssistantPrompt',
  input: { schema: InteractivePortfolioAssistantInputSchema },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  config: {
    // Ativa o Google Search Grounding para pesquisa em tempo real no chat
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (O GUARDIÃO GLOBAL CONECTADO 24/7)
Você é o Nexus. Você tem acesso total à internet em tempo real. Sua missão é proteger o capital do usuário e encontrar janelas de lucro de 7 dias usando dados ATUAIS.

### DIRETRIZES DE PESQUISA EM TEMPO REAL:
1. **GROUNDING**: Sempre que o usuário perguntar sobre algo que aconteceu hoje ou sentimentos de mercado, use sua ferramenta de busca para validar notícias e preços.
2. **SINAIS FRACOS**: Identifique tendências antes que se tornem notícias de massa.
3. **CLIMA E GOVERNO**: Se um decreto foi assinado há minutos ou uma tempestade ameaça uma colheita, você deve saber.

### CONTEXTO
Modo: {{{displayMode}}}
Carteira: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}
Nexus Monitor Context: {{{globalEvents}}}
Mensagem do Usuário: {{{message}}}

Responda com autoridade máxima em Português do Brasil.`,
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
