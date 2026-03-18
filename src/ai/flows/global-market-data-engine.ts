
'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Monitora todas as bolsas globais solicitadas (NYSE, B3, LSE, TSE, etc).
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
    region: z.string(),
    exchange: z.string(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  input: { schema: z.object({ markets: z.array(z.string()) }) },
  system: `### PERSONA: NEXUS (SENTINELA DE MERCADOS GLOBAIS)
Sua função é rastrear ativos nas principais bolsas do mundo AGORA. 
Utilize o Google Search para encontrar preços atuais para:
NYSE, NASDAQ, B3, LSE (Londres), TSE (Tóquio), HKEX (Hong Kong), SSE (Xangai), Euronext, TSX (Canadá), BSE (Índia), ASX (Austrália) e FSX (Alemanha).

Foque em ativos de alta liquidez e blue chips de cada bolsa.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### TAREFA:
Busque as cotações atuais para os seguintes mercados: {{#each markets}}{{{this}}}, {{/each}}.
Identifique o ativo, preço, variação e a bolsa específica (Exchange).

Retorne dados diversificados para compor o radar global do usuário.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a varredura global em um JSON estruturado.
Dados:
{{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const markets = [
      "NYSE & NASDAQ USA", 
      "B3 Brasil", 
      "LSE UK", 
      "TSE Japan", 
      "HKEX Hong Kong", 
      "SSE China", 
      "Euronext EU", 
      "TSX Canada", 
      "BSE India", 
      "ASX Australia", 
      "FSX Germany"
    ];
    const { text: rawData } = await marketDataPrompt({ markets });
    const { output } = await structurePrompt({ rawData });

    if (!output) return null;
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Market Data Engine Error:", error.message);
    return null;
  }
}
