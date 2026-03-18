'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Otimizado para Brapi Pro com Logotipos e Fundamentos, incluindo FIIs.
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

const PRIORITY_TICKERS = [
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "WEGE3", "MGLU3", "RENT3", "B3SA3", // Ações B3
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "BTLG11", "XPML11", "HCTR11", // FIIs B3
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", // Stocks US
  "BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOT" // Crypto
];

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
Identifique corretamente a categoria: 
- Termina com 11 e é da B3? categoria: 'fiis'.
- É uma cripto (BTC, ETH, etc)? categoria: 'crypto'.
- É uma empresa listada (VALE3, AAPL)? categoria: 'stocks'.
Avalie a saúde: Empresa Saudável se P/L < 15 e Margens altas. FIIs são saudáveis se P/VP próximo de 1 e Yield estável.`,
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
