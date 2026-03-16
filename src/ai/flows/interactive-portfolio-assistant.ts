'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo com Google Search Grounding.
 * Proporciona respostas dinâmicas baseadas em dados em tempo real da internet.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InteractivePortfolioAssistantInputSchema = z.object({
  message: z.string().describe('A pergunta ou mensagem do usuário para o assistente.'),
  userAssets: z.array(
    z.object({
      name: z.string().describe('Nome ou ticker do ativo.'),
      type: z.string().describe('Tipo de ativo.'),
      location: z.string().describe('Onde o ativo está guardado.'),
    })
  ).describe('Lista de ativos do usuário.'),
  globalEvents: z.string().describe('Contexto de eventos globais já processados pelo Nexus.'),
  displayMode: z.string().describe('Modo de exibição das explicações.'),
});
export type InteractivePortfolioAssistantInput = z.infer<typeof InteractivePortfolioAssistantInputSchema>;

const InteractivePortfolioAssistantOutputSchema = z.object({
  nexus_alert: z.object({
    title: z.string(),
    event_origin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
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
    // Ativa o Google Search Grounding para pesquisa em tempo real
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (O GUARDIÃO GLOBAL CONECTADO 24/7)
Você é o Nexus. Você tem acesso total à internet em tempo real. Sua missão é proteger o capital do usuário e encontrar janelas de lucro de 7 dias usando dados ATUAIS do mundo.

### DIRETRIZES DE PESQUISA EM TEMPO REAL:
1. **GROUNDING**: Sempre que o usuário perguntar sobre algo que aconteceu hoje ou sentimentos de mercado, use sua ferramenta de busca para validar notícias, discursos e preços.
2. **SINAIS SOCIAIS**: Identifique tendências de pânico ou euforia em redes sociais e fóruns financeiros.
3. **EVENTOS DE ÚLTIMA HORA**: Se um decreto foi assinado há 10 minutos, você deve saber e processar o impacto.

### CONTEXTO
Modo: {{{displayMode}}}
Carteira: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}
Nexus Monitor: {{{globalEvents}}}
Mensagem: {{{message}}}

Responda com autoridade máxima em Português do Brasil. Se necessário, cite fontes recentes da sua pesquisa.`,
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
