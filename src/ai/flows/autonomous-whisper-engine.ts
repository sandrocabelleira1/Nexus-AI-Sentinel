
'use server';
/**
 * @fileOverview Nexus Autonomous Whisper & Speculation Engine.
 * Detects rumors, evaluates foundation, and projects scenarios.
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
  input: { schema: z.object({ query: z.string() }) },
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### PERSONA: NEXUS (WHISPER RADAR)
Sua função é agir como um radar autônomo de rumores e especulações globais.

### TAREFA:
1. Pesquise por rumores financeiros, sussurros geopolíticos e vazamentos governamentais que ainda não são manchetes oficiais.
2. Identifique sinais fracos em fóruns especializados, discursos ambíguos e movimentações on-chain.

Query de Varredura:
{{{query}}}`,
});

const whisperStructuringPrompt = ai.definePrompt({
  name: 'whisperStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: AutonomousWhisperOutputSchema },
  prompt: `Transforme a análise de rumores em um JSON estruturado.
Para cada rumor, projete 3 cenários (Otimista, Base, Risco).

Análise:
{{{rawAnalysis}}}`,
});

export async function runAutonomousWhisperScan(): Promise<AutonomousWhisperOutput> {
  try {
    const searchQueries = [
      "latest financial rumors Bloomberg Reuters",
      "geopolitical whispers Middle East China Taiwan",
      "market speculation Bitcoin SEC ETFs",
      "vazamentos decisões governo brasileiro economia"
    ].join(", ");

    const { text: groundedAnalysis } = await whisperGroundingPrompt({ query: searchQueries });
    const { output } = await whisperStructuringPrompt({ rawAnalysis: groundedAnalysis });

    if (!output) throw new Error('Nexus: Falha no processamento autônomo de rumores.');
    
    // Garantir serialização limpa para Next.js Server Actions
    return JSON.parse(JSON.stringify(output));
  } catch (error) {
    console.error("Whisper Engine Error:", error);
    throw new Error("O Nexus encontrou uma instabilidade ao caçar rumores.");
  }
}
