'use server';
/**
 * @fileOverview A Genkit flow that proactively monitors global events and generates predictions and causal explanations
 * for how these events might impact the user's specific assets. It supports two display modes: 'Essential' for simplified
 * explanations and 'Full' for technical analysis.
 *
 * - predictiveAssetImpactAnalysis - A function that triggers the asset impact analysis process.
 * - PredictiveAssetImpactAnalysisInput - The input type for the predictiveAssetImpactAnalysis function.
 * - PredictiveAssetImpactAnalysisOutput - The return type for the predictiveAssetImpactAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveAssetImpactAnalysisInputSchema = z.object({
  globalEventData: z
    .string()
    .describe(
      'Raw news data or time triggers about global events (geopolitics, nature, tech, markets).' + 
      'This could be a summary of recent news, weather alerts, or government decisions.'
    ),
  userAssets: z
    .array(z.string())
    .describe('A list of assets owned by the user (e.g., ["VALE3", "BTC", "Gold"]).'),
  displayMode: z.enum(['Essential', 'Full']).describe('The detail level of the generated insights.'),
});
export type PredictiveAssetImpactAnalysisInput = z.infer<typeof PredictiveAssetImpactAnalysisInputSchema>;

const PredictiveAssetImpactAnalysisOutputSchema = z.object({
  alerts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    origin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
    causality: z.string(),
    priority: z.number().int().min(1).max(5),
    timestamp: z.string().describe('ISO 8601 timestamp string'),
  })),
});
export type PredictiveAssetImpactAnalysisOutput = z.infer<typeof PredictiveAssetImpactAnalysisOutputSchema>;

const predictiveAssetImpactAnalysisPrompt = ai.definePrompt({
  name: 'predictiveAssetImpactAnalysisPrompt',
  input: { schema: PredictiveAssetImpactAnalysisInputSchema },
  output: { schema: PredictiveAssetImpactAnalysisOutputSchema },
  prompt: `### PERSONA: NEXUS (O NAVEGADOR GLOBAL)
Você é o Nexus, uma inteligência de elite especializada em análise preditiva de impacto de eventos globais em ativos financeiros.

### TAREFA
Analise os eventos globais fornecidos e identifique impactos diretos ou indiretos nos ativos do usuário.

### REGRAS
- Seja proativo e causal: explique o PORQUÊ do impacto.
- Se o modo for 'Essential', use analogias. Se for 'Full', use termos técnicos.
- Gere alertas claros e priorizados.

---
### DADOS DO EVENTO
{{{globalEventData}}}

### ATIVOS DO USUÁRIO
{{#each userAssets}}
- {{{this}}}
{{/each}}

### MODO DE EXIBIÇÃO
{{{displayMode}}}

Gere o objeto JSON de saída com a lista de alertas encontrados seguindo o schema de saída.`,
});

const predictiveAssetImpactAnalysisFlow = ai.defineFlow(
  {
    name: 'predictiveAssetImpactAnalysisFlow',
    inputSchema: PredictiveAssetImpactAnalysisInputSchema,
    outputSchema: PredictiveAssetImpactAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await predictiveAssetImpactAnalysisPrompt(input);
    return output!;
  }
);

export async function predictiveAssetImpactAnalysis(input: PredictiveAssetImpactAnalysisInput): Promise<PredictiveAssetImpactAnalysisOutput> {
  return predictiveAssetImpactAnalysisFlow(input);
}
