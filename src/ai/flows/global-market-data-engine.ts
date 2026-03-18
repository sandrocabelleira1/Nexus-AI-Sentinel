'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Otimizado para Brapi Pro com Logotipos e Fundamentos.
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
    logo: z.string().optional(),
    dividendYield: z.number().optional(),
    peRatio: z.number().optional(),
    pvpRatio: z.number().optional(),
    healthStatus: z.string().optional(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const PRIORITY_TICKERS = ["PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "WEGE3", "AAPL", "MSFT", "GOOGL", "AMZN", "BTC", "ETH"];

const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações, logos e fundamentos na API Brapi Pro.',
    inputSchema: z.object({ tickers: z.array(z.string()) }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiKey = "2rb5157StMMfsE1ft1ErSq";
    try {
      const response = await fetch(`https://brapi.dev/api/quote/${input.tickers.join(',')}?token=${apiKey}&fundamentals=true`);
      return await response.json();
    } catch (error) {
      return { error: "Erro Brapi" };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool],
  input: { schema: z.object({ tickers: z.array(z.string()) }) },
  system: `Você é o Sentinela de Mercados. Use a Brapi para obter dados reais.
Avalie a saúde: Empresa Saudável se P/L < 15 e Margens altas. Risco se endividamento alto.`,
  prompt: `Busque dados completos para: {{#each tickers}}{{{this}}}, {{/each}}`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta para JSON. Inclua URLs de logo e dividendos.
Dados: {{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const { text: rawData } = await marketDataPrompt({ tickers: PRIORITY_TICKERS });
    const { output } = await structurePrompt({ rawData });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
