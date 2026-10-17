
/**
 * @fileOverview Nexus Autonomous Whisper & Speculation Engine v5.0.
 * Detecta rumores, vazamentos e sinais fracos via varredura web profunda.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScenarioSchema = z.object({
  desc: z.string(),
  prob: z.string(),
});

const AutonomousWhisperOutputSchema = z.object({
  detected_whispers: z.array(z.object({
    topic: z.string(),
    foundation_score: z.number().int().min(0).max(100),
    source_credibility: z.string().describe('Baixa, Média ou Alta'),
    scenarios: z.object({
      optimistic: ScenarioSchema,
      baseline: ScenarioSchema,
      risk: ScenarioSchema,
    }),
    market_impact: z.string(),
    nexus_priority: z.number().int().min(1).max(5),
  })),
});

export type AutonomousWhisperOutput = z.infer<typeof AutonomousWhisperOutputSchema>;

const whisperGroundingPrompt = ai.definePrompt({
  name: 'whisperGroundingPrompt',
  input: { schema: z.object({ query: z.string(), currentDate: z.string() }) },
  system: `### PERSONA: NEXUS (RADAR DE SINAIS FRACOS)
Você é um especialista em capturar rumores, vazamentos governamentais e especulações de mercado antes que virem notícia oficial.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### VARREDURA DE RUMORES (DATA: {{{currentDate}}}):
Pesquise por rumores e sinais de:
1. Mudanças em políticas monetárias (FED/COPOM).
2. Vazamentos de fusões e aquisições corporativas.
3. Rumores de instabilidade política ou greves eminentes no Brasil.
4. Movimentações incomuns de governos em ativos digitais ou commodities.

Query: {{{query}}}`,
});

const whisperStructuringPrompt = ai.definePrompt({
  name: 'whisperStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: AutonomousWhisperOutputSchema },
  prompt: `Transforme os rumores encontrados em um JSON estruturado. Projete cenários táticos para cada um.

Análise:
{{{rawAnalysis}}}`,
});

export async function runAutonomousWhisperScan(): Promise<AutonomousWhisperOutput | null> {
  try {
    const currentDate = new Date().toISOString();
    const searchQueries = [
      "unconfirmed reports financial market today",
      "rumores greve caminhoneiros Brasil hoje",
      "vazamentos governo economia Brasil hoje",
      "market whispers geopolitical tensions Middle East",
      "speculations FED interest rates next meeting"
    ].join(", ");

    const { text: groundedAnalysis } = await whisperGroundingPrompt({ query: searchQueries, currentDate });
    const { output } = await whisperStructuringPrompt({ rawAnalysis: groundedAnalysis });

    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Whisper Engine Error:", error.message);
    return null;
  }
}
