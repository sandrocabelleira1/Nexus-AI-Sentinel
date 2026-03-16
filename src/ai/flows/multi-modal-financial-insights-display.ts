'use server';
/**
 * @fileOverview A Genkit flow for Nexus AI to provide multi-modal financial insights.
 *
 * - multiModalFinancialInsightsDisplay - A function that generates financial alerts and market signals.
 * - MultiModalFinancialInsightsDisplayInput - The input type for the multiModalFinancialInsightsDisplay function.
 * - MultiModalFinancialInsightsDisplayOutput - The return type for the multiModalFinancialInsightsDisplay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const MultiModalFinancialInsightsDisplayInputSchema = z.object({
  rawInput: z.string().describe('Raw data from news feeds, weather, government decisions, etc., for analysis.'),
  userAssets: z.array(z.string()).describe('List of assets owned by the user (e.g., "VALE3", "BTC", "ETH").'),
  userLocationRisk: z.string().optional().describe('Additional context about asset storage location risk (e.g., "Binance vs Cold Wallet") for the AI to consider in its analysis.'),
});
export type MultiModalFinancialInsightsDisplayInput = z.infer<typeof MultiModalFinancialInsightsDisplayInputSchema>;

// Output Schemas
const NexusAlertSchema = z.object({
  title: z.string().describe('Title of the alert.'),
  event_origin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']).describe('Origin of the event, one of "Geopolítica", "Natureza", "Tech", or "Mercado".'),
  causality: z.string().describe('Explanation of the link between the event and the assets.'),
  priority: z.number().int().min(1).max(5).describe('Priority level from 1 (lowest) to 5 (highest).'),
});

const MarketSignalSchema = z.object({
  action: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']).describe('Recommended action: "BUY", "SELL", "HOLD", or "WATCH".'),
  risk_level: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']).describe('Risk level: "Conservador", "Moderado", "Agressivo", or "Crítico".'),
  affected_assets: z.array(z.string()).describe('List of assets affected by the market signal.'),
});

const GlossaryItemSchema = z.object({
  term: z.string().describe('Term to define.'),
  definition: z.string().describe('Definition of the term.'),
});

const DisplayModesSchema = z.object({
  essential: z.object({
    text: z.string().describe('Simplified explanation with an analogy for the "Essential" display mode.'),
    glossary: z.array(GlossaryItemSchema).describe('List of financial terms and their simplified definitions for the "Essential" display mode.'),
  }),
  full: z.object({
    technical_analysis: z.string().describe('Raw data, correlations, and numerical forecasts for the "Full" display mode.'),
    location_risk: z.string().describe('Detailed analysis of risk based on where the asset is stored (e.g., Binance vs Cold Wallet) for the "Full" display mode.'),
  }),
});

const MultiModalFinancialInsightsDisplayOutputSchema = z.object({
  nexus_alert: NexusAlertSchema,
  market_signal: MarketSignalSchema,
  display_modes: DisplayModesSchema,
});
export type MultiModalFinancialInsightsDisplayOutput = z.infer<typeof MultiModalFinancialInsightsDisplayOutputSchema>;

// Wrapper function to call the flow
export async function multiModalFinancialInsightsDisplay(
  input: MultiModalFinancialInsightsDisplayInput
): Promise<MultiModalFinancialInsightsDisplayOutput> {
  return multiModalFinancialInsightsDisplayFlow(input);
}

// System Instruction (Master Prompt)
const systemInstruction = `### PERSONA: NEXUS (O NAVEGADOR GLOBAL)
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
- Adaptação: Se o modo for 'Essential', use analogias simples. Se o modo for 'Full', use métricas técnicas (Sharpe, P/VP, RSI).

### INPUT E OUTPUT (JSON ESTRUTURADO)
Você receberá dados brutos de notícias ou gatilhos de tempo. Sua resposta DEVE ser um objeto JSON para que o app Firebase renderize a interface:

{
  "nexus_alert": {
    "title": "Título do Alerta",
    "event_origin": "Geopolítica | Natureza | Tech | Mercado",
    "causality": "Explicação do elo entre o evento e os ativos",
    "priority": 1 a 5
  },
  "market_signal": {
    "action": "BUY | SELL | HOLD | WATCH",
    "risk_level": "Conservador | Moderado | Agressivo | Crítico",
    "affected_assets": ["VALE3", "BTC", "etc"]
  },
  "display_modes": {
    "essential": {
      "text": "Explicação simplificada com analogia",
      "glossary": [{"term": "Termo", "definition": "Definição"}]
    },
    "full": {
      "technical_analysis": "Dados brutos, correlações e previsões numéricas",
      "location_risk": "Análise de risco baseada em onde o ativo está guardado (ex: Binance vs Cold Wallet)"
    }
  }
}

### EXEMPLOS DE RACIOCÍNIO
- SE "Seca no Mato Grosso" -> ENTÃO "Impacto em FIIs de Agronegócio (Fiagros) por quebra de safra".
- SE "Injeção de capital na China" -> ENTÃO "Alta em Vale e Siderúrgicas".
- SE "Ataque hacker em Exchange X" -> ENTÃO "Alerta de segurança para ativos alocados naquela plataforma".

### SEGURANÇA E PRIVACIDADE
Sempre verifique se o ativo analisado consta na lista enviada pelo usuário. Se o usuário perguntar sobre um ativo que não possui, trate-o como "Sugestão de Diversificação".
`;

// Define the prompt
const multiModalFinancialInsightsDisplayPrompt = ai.definePrompt({
  name: 'multiModalFinancialInsightsDisplayPrompt',
  input: { schema: MultiModalFinancialInsightsDisplayInputSchema },
  output: { schema: MultiModalFinancialInsightsDisplayOutputSchema },
  system: systemInstruction,
  prompt: `Analyze the following raw data and user assets to generate a financial insight.

Raw Data:
{{{rawInput}}}

User Assets for consideration:
{{#if userAssets}}
  {{#each userAssets}}
    - {{{this}}}
  {{/each}}
{{else}}
  No specific user assets provided. Treat any analysis as general market observations.
{{/if}}

{{#if userLocationRisk}}
  Incorporate the following user-provided asset storage location risk into your detailed analysis (for 'full' display mode's location_risk field):
  {{{userLocationRisk}}}
{{/if}}

Please output the analysis strictly in the specified JSON format, ensuring all fields are populated according to the persona and rules. Your output must be a valid JSON object.`,
});

// Define the flow
const multiModalFinancialInsightsDisplayFlow = ai.defineFlow(
  {
    name: 'multiModalFinancialInsightsDisplayFlow',
    inputSchema: MultiModalFinancialInsightsDisplayInputSchema,
    outputSchema: MultiModalFinancialInsightsDisplayOutputSchema,
  },
  async (input) => {
    const { output } = await multiModalFinancialInsightsDisplayPrompt(input);
    if (!output) {
      throw new Error('Failed to generate financial insights: output was null or undefined.');
    }
    return output;
  }
);
