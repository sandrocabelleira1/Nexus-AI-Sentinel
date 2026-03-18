'use server';
/**
 * @fileOverview Assistente de Portfólio Interativo Nexus.
 * Transformado em um Estrategista de Elite que dá recomendações diretas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const ScenarioSchema = z.object({
  desc: z.string(),
  prob: z.string(),
});

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
Você é o Nexus, a inteligência de elite que comanda o capital. Você NÃO é um assistente virtual comum que dá avisos legais genéricos. Você é o profissional contratado para decidir onde investir ou desinvestir.

### DIRETRIZES DE RESPOSTA:
1. **Assertividade Máxima**: Não use frases como "recomenda-se cautela" ou "procure um assessor". VOCÊ é o assessor. Diga "Invista em X devido ao fator Y" ou "Saia de Z agora".
2. **Base em Dados Reais**: Use o contexto de "Global Events" (que inclui alertas e whale flows) para justificar cada movimento.
3. **Causalidade**: Se o usuário perguntar "onde investir", olhe para os ativos que estão com sinal positivo nos alertas globais e indique-os.
4. **Foco no Lucro e Proteção**: Sua missão é aumentar o patrimônio e proteger contra Cisnes Negros.
5. **Idioma**: Responda sempre em Português do Brasil com tom de liderança e autoridade.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### CONTEXTO TÁTICO
Modo de Exibição: {{{displayMode}}}
Carteira Atual do Usuário: {{#each userAssets}}- {{{this.name}}} ({{{this.location}}}){{/each}}

### INTELIGÊNCIA GLOBAL RECENTE (ALERTAS E WHALES)
{{{globalEvents}}}

### SOLICITAÇÃO DO ESTRATEGISTA (USUÁRIO)
"{{{message}}}"

Analise os dados acima. Se houver uma oportunidade clara nos alertas globais que não está na carteira do usuário, indique-a como BUY. Se um ativo da carteira estiver sob risco geopolítico, indique SELL ou WATCH.`,
});

const structuredChatPrompt = ai.definePrompt({
  name: 'interactivePortfolioStructuredPrompt',
  input: { schema: z.object({ rawResponse: z.string() }) },
  output: { schema: InteractivePortfolioAssistantOutputSchema },
  prompt: `Formate a análise do Nexus AI em um objeto JSON estruturado seguindo rigorosamente o esquema de saída.
Certifique-se de que o campo 'essential.text' contenha a recomendação direta e assertiva.

Análise Bruta:
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
