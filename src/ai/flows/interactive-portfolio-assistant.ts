'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo com Google Search Grounding.
 * Corrigido para evitar conflito entre ferramentas e modo JSON.
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

// Prompt 1: Grounded Chat Analysis
const groundedChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioGroundedPrompt',
  input: { schema: InteractivePortfolioAssistantInputSchema },
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (O GUARDIÃO GLOBAL CONECTADO 24/7)
Você é o Nexus. Você tem acesso total à internet em tempo real. Sua missão é proteger o capital do usuário e encontrar janelas de lucro de 7 dias usando dados ATUAIS.

### DIRETRIZES DE PESQUISA EM TEMPO REAL:
1. **GROUNDING**: Sempre que o usuário perguntar sobre algo que aconteceu hoje ou sentimentos de mercado, use sua ferramenta de busca para validar notícias e preços.
2. **SINAIS FRACOS**: Identifique tendências antes que se tornem notícias de massa.

### CONTEXTO
Modo: {{{displayMode}}}
Carteira: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}
Nexus Monitor Context: {{{globalEvents}}}
Mensagem do Usuário: {{{message}}}

Responda com autoridade máxima em Português do Brasil.`,
});

// Prompt 2: Structured Chat Output
const structuredChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioStructuredPrompt',
  input: { schema: z.object({ rawResponse: z.string(), displayMode: z.string() }) },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `Formate a seguinte resposta do Nexus AI em um objeto JSON estruturado.
Resposta:
{{{rawResponse}}}
Modo: {{{displayMode}}}`,
});

export async function interactivePortfolioAssistant(input: InteractivePortfolioAssistantInput): Promise<InteractivePortfolioAssistantOutput> {
  // Passo 1: Pesquisa e análise fundamentada
  const { text: rawResponse } = await groundedChatPrompt(input);
  
  // Passo 2: Estruturação JSON
  const { output } = await structuredChatPrompt({ rawResponse, displayMode: input.displayMode });
  
  if (!output) {
    throw new Error('Erro ao estruturar resposta do Nexus.');
  }
  
  return output;
}
