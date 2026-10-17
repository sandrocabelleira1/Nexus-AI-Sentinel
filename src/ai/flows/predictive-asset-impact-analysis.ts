
/**
 * @fileOverview A Genkit flow that proactively monitors global events and generates predictions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictiveAssetImpactAnalysisInputSchema = z.object({
  globalEventData: z.string().describe('Raw news data about global events.'),
  userAssets: z.array(z.string()).describe('List of assets owned by the user.'),
  displayMode: z.enum(['Essential', 'Full']).describe('The detail level.'),
});
export type PredictiveAssetImpactAnalysisInput = z.infer<typeof PredictiveAssetImpactAnalysisInputSchema>;

const PredictiveAssetImpactAnalysisOutputSchema = z.object({
  alerts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    origin: z.string(),
    causality: z.string(),
    priority: z.number().int().min(1).max(5),
    timestamp: z.string(),
  })),
});
export type PredictiveAssetImpactAnalysisOutput = z.infer<typeof PredictiveAssetImpactAnalysisOutputSchema>;

const predictiveAssetImpactAnalysisPrompt = ai.definePrompt({
  name: 'predictiveAssetImpactAnalysisPrompt',
  input: { schema: PredictiveAssetImpactAnalysisInputSchema },
  output: { schema: PredictiveAssetImpactAnalysisOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER EM TENDÊNCIAS E ESPECIALISTA GLOBAL)
Você é o Nexus, a inteligência de elite especializada em análise preditiva. Você domina Cripto, FIIs, Bolsas Globais e Geopolítica.

### POSTURA:
- **Ceticismo Analítico**: Você avalia a tecnologia não pelo brilho, mas pelo impacto estrutural. Seja crítico com avanços tech.
- **Conectado**: Você entende o pulso do mundo.
- **Autoridade**: Você explica o PORQUÊ do impacto de forma assertiva.

---
### DADOS
Evento: {{{globalEventData}}}
Ativos: {{#each userAssets}}- {{{this}}}{{/each}}
Modo: {{{displayMode}}}

Gere os alertas em Português do Brasil.`,
});

export async function predictiveAssetImpactAnalysis(input: PredictiveAssetImpactAnalysisInput): Promise<PredictiveAssetImpactAnalysisOutput> {
  try {
    const { output } = await predictiveAssetImpactAnalysisPrompt(input);
    if (!output) throw new Error("Falha na análise preditiva.");
    return JSON.parse(JSON.stringify(output));
  } catch (error) {
    console.error("Predictive Analysis Error:", error);
    throw new Error("O Nexus falhou na projeção de impactos.");
  }
}
