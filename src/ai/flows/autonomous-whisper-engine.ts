'use server';
/**
 * @fileOverview Nexus Autonomous Whisper & Speculation Engine v3.8.
 * Detecta rumores e vazamentos geopolíticos via Google Search Grounding.
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
  system: `### PERSONA: NEXUS (WHISPER RADAR)
Sua função é agir como um radar autônomo de rumores e especulações globais navegando na web em tempo real.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### TAREFA (DATA: {{{currentDate}}}):
1. Pesquise no Google por rumores financeiros, sussurros geopolíticos e vazamentos governamentais que ainda não são manchetes oficiais.
2. Identifique sinais fracos em fóruns especializados, discursos ambíguos e movimentações on-chain.

Query de Varredura: {{{query}}}`,
});

const whisperStructuringPrompt = ai.definePrompt({
  name: 'whisperStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: AutonomousWhisperOutputSchema },
  prompt: `Transforme a análise de rumores encontrada na web em um JSON estruturado.
Para cada rumor, projete 3 cenários (Otimista, Base, Risco).

Análise:
{{{rawAnalysis}}}`,
});

export async function runAutonomousWhisperScan(): Promise<AutonomousWhisperOutput | null> {
  try {
    const currentDate = new Date().toISOString();
    const searchQueries = [
      "financial market rumors today Bloomberg Reuters",
      "geopolitical leaks Middle East energy sector",
      "vazamentos governo brasileiro hoje economia",
      "market whispers Bitcoin SEC decisions"
    ].join(", ");

    const { text: groundedAnalysis } = await whisperGroundingPrompt({ query: searchQueries, currentDate });
    const { output } = await whisperStructuringPrompt({ rawAnalysis: groundedAnalysis });

    if (!output) return null;
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Whisper Engine Error:", error.message);
    return null;
  }
}
