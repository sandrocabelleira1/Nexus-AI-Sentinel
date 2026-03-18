
'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Utiliza Google Search Grounding para buscar preços de ativos em tempo real em diversos mercados.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketDataOutputSchema = z.object({
  assets: z.array(z.object({
    ticker: z.string(),
    name: z.string(),
    price: z.number(),
    change24h: z.number(),
    category: z.enum(['crypto', 'stocks', 'fiis', 'index']),
    region: z.enum(['Brazil', 'USA', 'Global']),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  input: { schema: z.object({ markets: z.array(z.string()) }) },
  system: `### PERSONA: NEXUS (ANALISTA DE MERCADO GLOBAL)
Sua função é fornecer cotações atualizadas e precisas. Utilize o Google Search para encontrar os preços atuais.
Foque nos principais ativos de cada mercado solicitado.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### TAREFA:
Busque as cotações atuais (últimas 24h) para os seguintes mercados: {{#each markets}}{{{this}}}, {{/each}}.
Retorne uma lista diversificada incluindo Ações (Brasil e EUA), FIIs (Brasil) e Criptomoedas.

Importante: Retorne os preços em formato numérico puro.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise de mercado em um JSON estruturado.
Dados:
{{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const markets = ["B3 Brasil", "NYSE USA", "NASDAQ USA", "Crypto Global"];
    const { text: rawData } = await marketDataPrompt({ markets });
    const { output } = await structurePrompt({ rawData });

    if (!output) return null;
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Market Data Engine Error:", error.message);
    return null;
  }
}
